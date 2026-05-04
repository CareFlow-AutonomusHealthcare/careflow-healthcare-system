# CareFlow: Autonomous Healthcare Coordination System

## 1. Project Essence
CareFlow is an advanced, autonomous healthcare coordination system designed to transition clinical workflows from reactive to proactive. By analyzing 90-day windows of longitudinal patient data, the system identifies high-risk trends before they escalate into critical medical emergencies.

---

## 2. The Core Problem & Solution
- **The Problem:** Modern healthcare suffers from "reactive lag." Worsening lab results or missed appointments often go unnoticed until a patient is readmitted, leading to poor clinical outcomes and increased costs.
- **The Solution:** An autonomous engine that monitors patient engagement and clinical stability. It generates "Action Proposals" that route through a Human-in-the-Loop (HITL) workflow, ensuring AI-driven insights are always validated by clinical expertise.

---

## 3. Key Technological Pillars
### 3.1. Proactive Risk Engine
The heart of CareFlow is its custom risk scoring algorithm. It evaluates patients across four weighted dimensions:
- **Engagement (1.5x):** Tracking adherence to appointments.
- **Clinical (3.0x):** Monitoring volatility in lab results (e.g., Blood Glucose, BP, SpO2).
- **Chronic (1.0x):** Accounting for the complexity of existing conditions.
- **Instability (0.5x):** Measuring time elapsed since last clinical interaction.

**Logic:**
- **Score >= 9.0:** Immediate Escalation (Emergency consult/Home visit).
- **Score >= 5.0:** Follow-up Required (Phone call/Wellness check).

### 3.2. Role-Based Specialized Portals
- **Doctor Portal:** Focused on clinical decision-making. Doctors review AI-generated proposals, view 90-day trend lines, and approve/reject actions with clinical reasoning.
- **Staff Coordinator Portal:** Focused on operational logistics. Manages patient records, monitors staff/doctor presence, and tracks the execution of clinical decisions.
- **Admin Portal:** Focused on system integrity. Features real-time dashboards, inventory management, user auditing, and the manual trigger for the Risk Engine.

### 3.3. Immutable Audit Trail
To ensure compliance and accountability, CareFlow implements database-level triggers that log every modification (INSERT, UPDATE, DELETE) into a JSON-based audit log. This provides an unalterable history of how clinical decisions were reached.

---

## 4. Technical Architecture
### 4.1. The Stack
- **Backend:** Python 3.11 with FastAPI (for high-performance, asynchronous I/O).
- **Database:** MySQL 8.0 with SQLAlchemy 2.0 ORM.
- **Frontend:** React 19 powered by Vite, utilizing Tailwind CSS v4 for a modern, fluid UI.
- **Authentication:** JWT-based stateless authentication with role-level guards.

### 4.2. Database Schema Highlights
- patients: Stores identity and chronic conditions.
- risk_scores: Historical record of every patient's calculated risk.
- action_proposals: State-machine tracking pending vs. resolved actions.
- audit_logs: JSON storage for all system mutations.
- inventory: Real-time tracking of 40+ hospital equipment categories.

---

## 5. Scalability & Data Simulation
CareFlow includes a robust data seeding engine capable of generating:
- 100+ Patients with diverse risk profiles.
- 3,600+ Clinical Records (Appointments and Lab results).
- 8 Departments with realistic staffing and inventory levels.
This allows for stress-testing the risk engine and demonstrating the system's ability to handle high-density longitudinal data.

---

## 6. Implementation Workflow (HITL)
1. Detection: Risk Engine scans database and calculates scores.
2. Proposal: High-risk patients trigger an ActionProposal.
3. Review: Doctor evaluates the proposal alongside the patient's 90-day history.
4. Decision: Doctor approves or rejects with a comment.
5. Execution: Staff Coordinator receives the approved decision for operational action.
6. Audit: The entire cycle is logged in the immutable audit trail.

---

## 7. Project Structure Overview
- careflow/
    - backend/
        - main.py: API Gateway & Routes
        - models.py: Schema Definitions
        - database.py: Connection Management
        - auth.py: Security & Permissions
        - seed_data.py: Simulation Engine
    - frontend/
        - src/
            - components/: Layouts (Doctor/Staff/Admin)
            - pages/: Specialized Dashboards
    - docs/: Technical Manuals
