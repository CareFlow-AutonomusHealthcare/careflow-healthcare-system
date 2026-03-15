from pydantic import BaseModel, root_validator
from typing import Optional, List, Any, Dict
from datetime import datetime
from .models import RoomStatus, ShiftType, AppointmentStatus, ActionType, ProposalStatus, ApproverType

# --- Core Infrastructure Defaults ---
class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    department_id: int
    class Config:
        from_attributes = True

# --- Patients & Clinical ---
class PatientBase(BaseModel):
    full_name: str
    chronic_conditions: Optional[Dict[str, Any]] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    patient_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class LabBase(BaseModel):
    test_type: str
    test_value: float
    recorded_at: datetime

class LabCreate(LabBase):
    patient_id: int

class Lab(LabBase):
    lab_id: int
    patient_id: int
    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    status: AppointmentStatus
    scheduled_at: datetime

class AppointmentCreate(AppointmentBase):
    patient_id: int

class Appointment(AppointmentBase):
    appointment_id: int
    patient_id: int
    class Config:
        from_attributes = True

# --- Risk & Decision Engine ---
class RiskScoreBase(BaseModel):
    composite_score: float
    reasoning_string: str

class RiskScoreCreate(RiskScoreBase):
    patient_id: int

class RiskScore(RiskScoreBase):
    score_id: int
    patient_id: int
    calculated_at: datetime
    class Config:
        from_attributes = True

class ActionProposalBase(BaseModel):
    suggested_action: ActionType
    status: ProposalStatus = ProposalStatus.Pending

class ActionProposalCreate(ActionProposalBase):
    score_id: int

class ActionProposal(ActionProposalBase):
    proposal_id: int
    score_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class DecisionBase(BaseModel):
    approver_id: int
    approver_type: ApproverType
    action: ProposalStatus # Approve or Reject

class DecisionCreate(DecisionBase):
    proposal_id: int

class Decision(DecisionBase):
    decision_id: int
    proposal_id: int
    decision_timestamp: datetime
    # We map 'action' back to update the proposal in the endpoint
    class Config:
        from_attributes = True
