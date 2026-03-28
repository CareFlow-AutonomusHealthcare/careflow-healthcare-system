from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime, timedelta
import random

from . import models, schemas
from .database import engine, get_db
from .auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role
)

app = FastAPI(title="CareFlow Clinical API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

W1, W2, W3, W4 = 1.5, 3.0, 1.0, 0.5


# ==========================================
# AUTH ROUTES
# ==========================================

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    token = create_access_token({"sub": str(user.user_id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ==========================================
# ADMIN: USER MANAGEMENT
# ==========================================

@app.get("/admin/users", response_model=List[schemas.UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.admin))
):
    return db.query(models.User).all()


@app.post("/admin/users", response_model=schemas.UserOut, status_code=201)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.admin))
):
    existing = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = models.User(
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
        role=user_in.role,
        linked_id=user_in.linked_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.put("/admin/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.admin))
):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.full_name = user_in.full_name
    user.role = user_in.role
    user.linked_id = user_in.linked_id
    if user_in.password:
        user.hashed_password = hash_password(user_in.password)
    db.commit()
    db.refresh(user)
    return user


@app.delete("/admin/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role(models.UserRole.admin))
):
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@app.patch("/admin/users/{user_id}/toggle", response_model=schemas.UserOut)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.admin))
):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = 0 if user.is_active else 1
    db.commit()
    db.refresh(user)
    return user


# ==========================================
# ADMIN: AUDIT LOGS
# ==========================================

@app.get("/admin/audit-logs")
def get_audit_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.admin))
):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "audit_id": l.audit_id,
            "table_name": l.table_name,
            "entity_id": l.entity_id,
            "action_type": l.action_type,
            "old_payload": l.old_payload,
            "new_payload": l.new_payload,
            "created_at": l.created_at,
        }
        for l in logs
    ]


# ==========================================
# PATIENT OBSERVATION WINDOW (30-90 DAYS)
# ==========================================

@app.get("/patients", response_model=List[schemas.Patient])
def list_patients(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    return db.query(models.Patient).all()


@app.get("/patients/{patient_id}/history", response_model=Dict)
def get_patient_history(
    patient_id: int,
    window_days: int = 90,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
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
def trigger_batch_risk_scoring(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.doctor, models.UserRole.admin))
):
    cutoff = datetime.now() - timedelta(days=90)
    patients = db.query(models.Patient).all()
    results = []

    for p in patients:
        apps = db.query(models.Appointment).filter(
            models.Appointment.patient_id == p.patient_id,
            models.Appointment.scheduled_at >= cutoff
        ).all()
        missed = sum(1 for a in apps if a.status == models.AppointmentStatus.Missed)
        total_apps = len(apps)
        eng_factor = (missed / total_apps) * 5 if total_apps > 0 else 1.0

        labs = db.query(models.Lab).filter(
            models.Lab.patient_id == p.patient_id,
            models.Lab.recorded_at >= cutoff
        ).all()
        clin_factor = 0
        if len(labs) > 1:
            vals = [l.test_value for l in labs]
            clin_factor = min((max(vals) - min(vals)) / max(vals) * 10, 5) if max(vals) > 0 else 0

        chron_factor = len(p.chronic_conditions.keys()) if p.chronic_conditions else 0

        last_interaction = max([l.recorded_at for l in labs] + [datetime.min])
        days_since = (datetime.now() - last_interaction).days
        instab_factor = min(days_since / 10, 5)

        score = (W1 * eng_factor) + (W2 * clin_factor) + (W3 * chron_factor) + (W4 * instab_factor)
        score = round(score, 2)
        reasoning = f"Eng:{round(eng_factor,1)}|Clin:{round(clin_factor,1)}|Chron:{chron_factor}|Inst:{round(instab_factor,1)}"

        db_score = models.RiskScore(
            patient_id=p.patient_id,
            composite_score=score,
            reasoning_string=reasoning
        )
        db.add(db_score)
        db.flush()

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
def get_pending_proposals(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    return db.query(models.ActionProposal).filter(
        models.ActionProposal.status == models.ProposalStatus.Pending
    ).all()


@app.get("/proposals/all")
def get_all_proposals(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    proposals = db.query(models.ActionProposal).order_by(models.ActionProposal.created_at.desc()).all()
    result = []
    for p in proposals:
        score = db.query(models.RiskScore).filter(models.RiskScore.score_id == p.score_id).first()
        patient = db.query(models.Patient).filter(models.Patient.patient_id == score.patient_id).first() if score else None
        decision = db.query(models.Decision).filter(models.Decision.proposal_id == p.proposal_id).first()
        result.append({
            "proposal_id": p.proposal_id,
            "patient_name": patient.full_name if patient else "Unknown",
            "patient_id": score.patient_id if score else None,
            "score": score.composite_score if score else None,
            "suggested_action": p.suggested_action,
            "status": p.status,
            "created_at": p.created_at,
            "decision": {
                "approver_id": decision.approver_id,
                "approver_type": decision.approver_type,
                "comment": decision.comment,
                "decision_timestamp": decision.decision_timestamp,
            } if decision else None
        })
    return result


# ==========================================
# HITL WORKFLOW
# ==========================================

@app.post("/proposals/{proposal_id}/decide", response_model=schemas.Decision)
def create_decision(
    proposal_id: int,
    decision_req: schemas.DecisionCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.doctor, models.UserRole.admin))
):
    proposal = db.query(models.ActionProposal).filter(models.ActionProposal.proposal_id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    if proposal.status != models.ProposalStatus.Pending:
        raise HTTPException(status_code=400, detail="Proposal already decided")

    proposal.status = decision_req.action

    new_decision = models.Decision(
        proposal_id=proposal_id,
        approver_id=decision_req.approver_id,
        approver_type=decision_req.approver_type,
        comment=decision_req.comment,
    )
    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)
    return new_decision


# ==========================================
# INVENTORY & STAFFING
# ==========================================

@app.get("/context/inventory", response_model=List[schemas.Inventory])
def get_inventory(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    return db.query(models.Inventory).all()


@app.put("/context/inventory/{item_id}")
def update_inventory(
    item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_role(models.UserRole.admin))
):
    item = db.query(models.Inventory).filter(models.Inventory.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.quantity_in_stock = quantity
    db.commit()
    db.refresh(item)
    return item


@app.get("/context/staffing", response_model=List[schemas.StaffingCapacity])
def get_staffing(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    return db.query(models.StaffingCapacity).all()


@app.get("/context/doctors")
def get_doctors(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    doctors = db.query(models.Doctor).all()
    users = db.query(models.User).filter(models.User.role == models.UserRole.doctor).all()
    active_ids = {u.linked_id for u in users if u.is_active}
    return [
        {
            "doctor_id": d.doctor_id,
            "full_name": d.full_name,
            "specialty": d.specialty,
            "is_present": d.doctor_id in active_ids,
        }
        for d in doctors
    ]


@app.get("/context/nursing-staff")
def get_nursing_staff(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user)
):
    staff = db.query(models.NursingStaff).all()
    users = db.query(models.User).filter(models.User.role == models.UserRole.staff).all()
    active_ids = {u.linked_id for u in users if u.is_active}
    return [
        {
            "staff_id": s.staff_id,
            "full_name": s.full_name,
            "shift": s.shift,
            "is_present": s.staff_id in active_ids,
        }
        for s in staff
    ]


@app.get("/")
def read_root():
    return {"message": "Welcome to CareFlow API v2"}
