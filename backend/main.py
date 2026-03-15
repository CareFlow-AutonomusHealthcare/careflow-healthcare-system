from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime, timedelta
import random

from . import models, schemas
from .database import engine, get_db

# Create all tables (if they don't exist, though we are using Docker init script)
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareFlow Clinical API", version="1.0")

# --- Default Weights for Risk Formula ---
# W1: Engagement Trend (Missed appointments)
# W2: Clinical Trend (Lab velocities)
# W3: Chronic Severity (Number of conditions)
# W4: Instability (Age of latest records)
W1, W2, W3, W4 = 1.5, 3.0, 1.0, 0.5 

@app.get("/")
def read_root():
    return {"message": "Welcome to CareFlow API"}

# ==========================================
# PATIENT OBSERVATION WINDOW (30-90 DAYS)
# ==========================================
@app.get("/patients/{patient_id}/history", response_model=Dict)
def get_patient_history(patient_id: int, window_days: int = 90, db: Session = Depends(get_db)):
    """Fetch 30-90 day history for Deterioration Dashboard visualization"""
    cutoff_date = datetime.now() - timedelta(days=window_days)
    
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    labs = db.query(models.Lab).filter(
        models.Lab.patient_id == patient_id,
        models.Lab.recorded_at >= cutoff_date
    ).order_by(models.Lab.recorded_at.desc()).all()

    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient_id,
        models.Appointment.scheduled_at >= cutoff_date
    ).order_by(models.Appointment.scheduled_at.desc()).all()

    return {
        "patient": schemas.Patient.from_orm(patient),
        "labs": [schemas.Lab.from_orm(l) for l in labs],
        "appointments": [schemas.Appointment.from_orm(a) for a in appointments]
    }

# ==========================================
# RISK ENGINE & PROPOSALS
# ==========================================
@app.post("/engine/batch-score", status_code=status.HTTP_201_CREATED)
def trigger_batch_risk_scoring(db: Session = Depends(get_db)):
    """
    Batches risk calculation across all patients. 
    Performance goal: < 2 seconds.
    RiskScore = (W1 * Engagement) + (W2 * Clinical) + (W3 * Chronic) + (W4 * Instability)
    """
    cutoff = datetime.now() - timedelta(days=90)
    patients = db.query(models.Patient).all()
    results = []
    
    for p in patients:
        # 1. Engagement (Missed Appointments Ratio)
        apps = db.query(models.Appointment).filter(
            models.Appointment.patient_id == p.patient_id,
            models.Appointment.scheduled_at >= cutoff
        ).all()
        missed = sum(1 for a in apps if a.status == models.AppointmentStatus.Missed)
        total_apps = len(apps)
        eng_factor = (missed / total_apps) * 5 if total_apps > 0 else 1.0 # Scale 0-5
        
        # 2. Clinical (Simple volatility score based on max-min of recent labs)
        labs = db.query(models.Lab).filter(
            models.Lab.patient_id == p.patient_id, 
            models.Lab.recorded_at >= cutoff
        ).all()
        clin_factor = 0
        if len(labs) > 1:
            vals = [l.test_value for l in labs]
            # Velocity proxy: range size
            clin_factor = min((max(vals) - min(vals)) / max(vals) * 10, 5) if max(vals)>0 else 0
        
        # 3. Chronic (Count of JSON keys)
        chron_factor = len(p.chronic_conditions.keys()) if p.chronic_conditions else 0
        
        # 4. Instability (Days since last interaction proxy)
        last_interaction = max([l.recorded_at for l in labs] + [datetime.min])
        days_since = (datetime.now() - last_interaction).days
        instab_factor = min(days_since / 10, 5) # Scale 0-5
        
        # Aggregate
        score = (W1 * eng_factor) + (W2 * clin_factor) + (W3 * chron_factor) + (W4 * instab_factor)
        score = round(score, 2)
        
        reasoning = f"Eng:{round(eng_factor,1)}|Clin:{round(clin_factor,1)}|Chron:{chron_factor}|Inst:{round(instab_factor,1)}"

        # Save Score
        db_score = models.RiskScore(
            patient_id=p.patient_id,
            composite_score=score,
            reasoning_string=reasoning
        )
        db.add(db_score)
        db.flush() # get score_id
        
        # Generate Proposal if score is High (>= 9) or Moderate (>= 5 for follow-up)
        # Note: In a real system we'd check if open proposals exist to prevent spam
        has_pending = db.query(models.ActionProposal).join(models.RiskScore).filter(
            models.RiskScore.patient_id == p.patient_id,
            models.ActionProposal.status == models.ProposalStatus.Pending
        ).first()

        proposal = None
        if not has_pending:
            if score >= 9.0:
                proposal = models.ActionProposal(score_id=db_score.score_id, suggested_action=models.ActionType.Escalate)
            elif score >= 5.0:
                proposal = models.ActionProposal(score_id=db_score.score_id, suggested_action=models.ActionType.Follow_up)
            
            if proposal:
                db.add(proposal)
                results.append({"patient_id": p.patient_id, "score": score, "action": proposal.suggested_action})
        
    db.commit()
    return {"calculated": len(patients), "new_proposals": len(results), "details": results}


@app.get("/proposals", response_model=List[schemas.ActionProposal])
def get_pending_proposals(db: Session = Depends(get_db)):
    """Fetch 'Proposal Queue' for clinicians"""
    return db.query(models.ActionProposal).filter(
        models.ActionProposal.status == models.ProposalStatus.Pending
    ).all()

# ==========================================
# HITL WORKFLOW
# ==========================================
@app.post("/proposals/{proposal_id}/decide", response_model=schemas.Decision)
def create_decision(proposal_id: int, decision_req: schemas.DecisionCreate, db: Session = Depends(get_db)):
    """Clinician Decision Engine UI Endpoint (Optimized for < 1s)"""
    proposal = db.query(models.ActionProposal).filter(models.ActionProposal.proposal_id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if proposal.status != models.ProposalStatus.Pending:
        raise HTTPException(status_code=400, detail="Proposal already decided")

    # Update proposal status
    proposal.status = decision_req.action
    
    # Create Immutable Decision Log (which also fires MySQL Audit Log via triggers)
    new_decision = models.Decision(
        proposal_id=proposal_id,
        approver_id=decision_req.approver_id,
        approver_type=decision_req.approver_type
    )
    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)
    
    return new_decision

# ==========================================
# INVENTORY & STAFFING CONTEXT
# ==========================================
@app.get("/context/inventory", response_model=List[schemas.Inventory])
def get_inventory(db: Session = Depends(get_db)):
    """Live Equipment Stock"""
    return db.query(models.Inventory).all()

@app.get("/context/staffing", response_model=List[schemas.StaffingCapacity])
def get_staffing(db: Session = Depends(get_db)):
    """Live Staffing Capacity""" # Changed to use schema
    return db.query(models.StaffingCapacity).all()
