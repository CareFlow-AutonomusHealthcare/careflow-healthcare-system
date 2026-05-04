from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime, JSON, Text, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class UserRole(str, enum.Enum):
    doctor = 'doctor'
    staff = 'staff'
    admin = 'admin'


class RoomStatus(str, enum.Enum):
    Available = 'Available'
    Occupied = 'Occupied'
    Maintenance = 'Maintenance'

class ShiftType(str, enum.Enum):
    Day = 'Day'
    Night = 'Night'

class AppointmentStatus(str, enum.Enum):
    Attended = 'Attended'
    Missed = 'Missed'
    Cancelled = 'Cancelled'

class ActionType(str, enum.Enum):
    Escalate = 'Escalate'
    Follow_up = 'Follow-up'
    Assign_Staff = 'Assign Staff'

class ProposalStatus(str, enum.Enum):
    Pending = 'Pending'
    Approved = 'Approved'
    Rejected = 'Rejected'

class ApproverType(str, enum.Enum):
    Doctor = 'Doctor'
    Nurse_Supervisor = 'Nurse_Supervisor'

class LogActionType(str, enum.Enum):
    INSERT = 'INSERT'
    UPDATE = 'UPDATE'
    DELETE = 'DELETE'

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    # For doctors: link to doctors table; for staff: link to nursing_staff
    linked_id = Column(Integer, nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())


class Department(Base):
    __tablename__ = "departments"
    department_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    rooms = relationship("Room", back_populates="department")
    doctors = relationship("Doctor", back_populates="department")
    nursing_staff = relationship("NursingStaff", back_populates="department")
    inventory_items = relationship("Inventory", back_populates="department")
    staffing_capacities = relationship("StaffingCapacity", back_populates="department")

class Room(Base):
    __tablename__ = "rooms"
    room_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="SET NULL"))
    room_number = Column(String(50), nullable=False)
    status = Column(Enum(RoomStatus), default=RoomStatus.Available)

    department = relationship("Department", back_populates="rooms")

class Doctor(Base):
    __tablename__ = "doctors"
    doctor_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="SET NULL"))
    full_name = Column(String(255), nullable=False)
    specialty = Column(String(255))

    department = relationship("Department", back_populates="doctors")

class NursingStaff(Base):
    __tablename__ = "nursing_staff"
    staff_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="SET NULL"))
    full_name = Column(String(255), nullable=False)
    shift = Column(Enum(ShiftType), nullable=False)

    department = relationship("Department", back_populates="nursing_staff")

class Inventory(Base):
    __tablename__ = "inventory"
    item_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="CASCADE"))
    item_name = Column(String(255), nullable=False)
    quantity_in_stock = Column(Integer, default=0, nullable=False)
    unit = Column(String(50))

    department = relationship("Department", back_populates="inventory_items")

class StaffingCapacity(Base):
    __tablename__ = "staffing_capacity"
    capacity_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.department_id", ondelete="CASCADE"))
    shift = Column(Enum(ShiftType), nullable=False)
    current_staff_count = Column(Integer, default=0, nullable=False)
    required_staff_count = Column(Integer, default=0, nullable=False)
    recorded_at = Column(DateTime, default=func.now())

    department = relationship("Department", back_populates="staffing_capacities")

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    chronic_conditions = Column(JSON)
    created_at = Column(DateTime, default=func.now())

    appointments = relationship("Appointment", back_populates="patient")
    labs = relationship("Lab", back_populates="patient")
    risk_scores = relationship("RiskScore", back_populates="patient")

class Appointment(Base):
    __tablename__ = "appointments"
    appointment_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="RESTRICT"), nullable=False)
    status = Column(Enum(AppointmentStatus), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)

    patient = relationship("Patient", back_populates="appointments")

class Lab(Base):
    __tablename__ = "labs"
    lab_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="RESTRICT"), nullable=False)
    test_type = Column(String(100), nullable=False)
    test_value = Column(Float, nullable=False) # Float for mapping MySQL Decimal
    recorded_at = Column(DateTime, nullable=False)

    patient = relationship("Patient", back_populates="labs")

class RiskScore(Base):
    __tablename__ = "risk_scores"
    score_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    composite_score = Column(Float, nullable=False) # Precision handled by MySQL
    reasoning_string = Column(Text, nullable=False)
    calculated_at = Column(DateTime, default=func.now())

    patient = relationship("Patient", back_populates="risk_scores")
    proposal = relationship("ActionProposal", back_populates="score", uselist=False)

class ActionProposal(Base):
    __tablename__ = "action_proposals"
    proposal_id = Column(Integer, primary_key=True, index=True)
    score_id = Column(Integer, ForeignKey("risk_scores.score_id", ondelete="CASCADE"), nullable=False, unique=True)
    suggested_action = Column(Enum(ActionType, values_callable=lambda obj: [e.value for e in obj]), nullable=False)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.Pending)
    created_at = Column(DateTime, default=func.now())

    score = relationship("RiskScore", back_populates="proposal")

class Decision(Base):
    __tablename__ = "decisions"
    decision_id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("action_proposals.proposal_id", ondelete="CASCADE"), nullable=False)
    approver_id = Column(Integer, nullable=False)
    approver_type = Column(Enum(ApproverType), nullable=False)
    comment = Column(Text, nullable=True)
    decision_timestamp = Column(DateTime, default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    audit_id = Column(BigInteger, primary_key=True, index=True)
    table_name = Column(String(255), nullable=False)
    entity_id = Column(Integer, nullable=False)
    action_type = Column(Enum(LogActionType), nullable=False)
    old_payload = Column(JSON)
    new_payload = Column(JSON)
    created_at = Column(DateTime, default=func.now())
