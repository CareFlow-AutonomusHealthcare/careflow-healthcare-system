# CareFlow Progress Report v2

This document provides a truthful, code-backed assessment of the current state of the CareFlow repository, specifically focusing on the `backend/` and `frontend/src/` directories.

## 🟢 1. Fully Implemented & Working

Based on a direct audit of the codebase, the following systems are completely implemented and wired up end-to-end:

*   **Authentication System**: Secure JWT-based login using `OAuth2PasswordRequestForm` (`backend/auth.py` and `backend/main.py:login`). The frontend `AuthContext.jsx` accurately manages session state and role-based routing.
*   **Admin User Management**: Full CRUD operations for users via `backend/main.py` (`create_user`, `update_user`, `delete_user`, `toggle_user_active`). UI is wired in `frontend/src/pages/admin/UserManagement.jsx`.
*   **Patient History Dashboard**: The `GET /patients/{patient_id}/history` endpoint effectively gathers patient data, lab results, appointments, the latest risk score, and any pending proposals. The frontend `PatientHistory.jsx` successfully consumes this complex payload.
*   **Contextual Data APIs**: Read endpoints for system constraints, such as `GET /context/inventory`, `GET /context/staffing`, and `GET /context/nursing-staff` (`backend/main.py`).

## 🔄 2. The Risk Engine Pipeline (End-to-End Flow)

The core logic of the CareFlow risk engine is executed in the following sequential pipeline:

1.  **Manual Trigger**: An Admin user clicks the "Run Risk Engine" button, hitting `POST /engine/batch-score` (`backend/main.py:trigger_batch_risk_scoring`).
2.  **Data Aggregation & Scoring**: The engine iterates through every patient in the database. For each patient, it calculates four key metrics based on the last 90 days of data:
    *   `eng_factor`: Ratio of missed appointments.
    *   `clin_factor`: Variance/fluctuation in lab test values.
    *   `chron_factor`: Total number of documented chronic conditions.
    *   `instab_factor`: Days elapsed since the last lab interaction.
3.  **Composite Score Calculation**: Applies weighted multipliers: `Score = (1.5 * eng) + (3.0 * clin) + (1.0 * chron) + (0.5 * instab)`. A new `RiskScore` record is instantiated and flushed to the database.
4.  **Action Proposal Generation**: If the patient does not already have a `Pending` proposal, the engine evaluates the score:
    *   `>= 9.0`: Creates an `ActionProposal` with `suggested_action` = `Escalate`.
    *   `>= 5.0`: Creates an `ActionProposal` with `suggested_action` = `Follow-up`.
5.  **Doctor Review (HITL)**: A Doctor opens the patient profile (`PatientHistory.jsx`), which displays the risk score and the generated reasoning string (e.g., `Eng:1.0|Clin:2.0...`). 
6.  **Decision Submission**: The Doctor approves, rejects, or adds comments to the proposal, invoking `POST /proposals/{proposal_id}/decide`. This updates the proposal status and creates a new `Decision` tracking record.
7.  **Audit Logging**: Changes are viewable via the `GET /admin/audit-logs` endpoint.

## 🛠️ 3. Recently Fixed Bugs

During the final integration phase, three critical bugs were resolved:

1.  **MySQL ENUM Bug (`Follow_up`)**: In `trigger_batch_risk_scoring`, the code was assigning `models.ActionType.Follow_up` to `suggested_action`. SQLAlchemy parsed this as the enum key `"Follow_up"` (with an underscore), which crashed against the strict MySQL ENUM definition `"Follow-up"` (with a hyphen), resulting in a `Data truncated` error. Fixed by passing the literal string `'Follow-up'`.
2.  **Pydantic v2 `from_orm` Deprecation Bug**: The `get_patient_history` endpoint was throwing 500 Internal Server Errors because it was invoking `.from_orm()` on the `RiskScore` and `ActionProposal` SQLAlchemy objects. Pydantic v2 removed this method. Fixed by migrating all `schemas.<Model>.from_orm()` calls to `schemas.<Model>.model_validate()`.
3.  **JSON String Parsing Bug (`chronic_conditions`)**: The MySQL JSON column was returning stringified JSON instead of a parsed Python dictionary to the ORM. This caused `len(p.chronic_conditions.keys())` to throw an `AttributeError` (strings don't have a `.keys()` method), crashing the entire batch score run. Fixed by introducing a `json.loads(conds)` fallback directly into the batch scoring loop.

## ⚠️ 4. Current Limitations & Rough Edges

While functional, several areas of the codebase are brittle and could be improved:

*   **Synchronous Batch Loop**: `trigger_batch_risk_scoring` calculates risk for all patients synchronously within a single HTTP request loop. This will block the thread and eventually timeout as the patient population scales.
*   **JSON Workaround**: The `json.loads` check in `main.py` is a band-aid. The underlying issue should be fixed at the SQLAlchemy level in `models.py` by properly configuring the MySQL dialect or using a custom TypeDecorator for the `JSON` column.
*   **Silent Frontend Error Swallowing**: In `PatientHistory.jsx`, the `viewHistory` function wraps the API call in a `try/catch` that silently sets `history` to `{ labs: [], appointments: [] }` on failure. This hides true backend crashes (500 errors) from the user, making them look like "stable patient data."
*   **Redundant Recalculations**: The risk engine blindly processes all patients, even if they have had no new labs or appointments in the last 24 hours.

## 🏗️ 5. What Is Genuinely Not Yet Built

Looking strictly at the code, these anticipated features do not currently exist:

*   **Automated Scheduling**: There are no background tasks (like Celery, RQ, or APScheduler) to run the risk engine automatically every night. It relies entirely on the manual `POST /engine/batch-score` endpoint.
*   **Real-time Notifications**: WebSockets or SSEs (Server-Sent Events) are not implemented. Doctors do not receive push notifications when a critical risk score is generated while they are logged in.
*   **Application-Layer Audit Logging**: While `models.AuditLog` and a `GET` endpoint exist, there is no explicit Python code executing `db.add(models.AuditLog(...))` inside the CRUD endpoints. The system appears to be relying entirely on MySQL database triggers for auditing.
*   **Capacity-Aware Proposals**: The system does not check `staffing_capacity` or `inventory` before suggesting an action (e.g., ensuring there is actually staff available before suggesting "Assign Staff").
