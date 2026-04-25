# 🏥 CareFlow Project Progress Report (v3.0)

**Date:** April 24, 2026  
**Status:** Alpha - Feature Complete for Core HITL Workflow  

---

## 📂 Project Structure Overview

CareFlow is split into a modern decoupled architecture:

### Backend (`/backend`)
- **`main.py`**: The central nervous system. Contains all API routes (Auth, Patients, Engine, Portals).
- **`models.py`**: SQLAlchemy database models (MySQL). Defines the structure of Users, Patients, Labs, etc.
- **`schemas.py`**: Pydantic models for data validation and API response shaping.
- **`auth.py`**: Security layer using JWT (JSON Web Tokens) and Role-Based Access Control (RBAC).
- **`database.py`**: Connection logic for MySQL.
- **`schema.sql`**: Initial database setup and immutable audit log triggers.

### Frontend (`/frontend`)
- **`src/pages/`**: Role-specific portals (Admin, Doctor, Staff).
- **`src/context/AuthContext.jsx`**: Manages global login state and permission checks.
- **`src/api/client.js`**: Axios configuration for communicating with the backend.
- **`src/index.css`**: Tailwind CSS v4 styling for a premium, medical-grade aesthetic.

---

## ✅ What is Fully Working

1.  **Authentication System**:
    *   Secure login with JWT.
    *   Role-based routing (Admins can't see Doctor internals, etc.).
    *   Persistent sessions across page reloads.

2.  **Administrator Portal**:
    *   **User Management**: Full CRUD (Create, Read, Update, Delete) for hospital staff.
    *   **Audit Logs**: Immutable log of every single change made to the database.
    *   **Inventory**: Tracking medical supplies per department.
    *   **Risk Trigger**: Ability to manually trigger the batch risk scoring engine.

3.  **Doctor Portal**:
    *   **Patient History**: Searchable sidebar and detailed clinical view.
    *   **90-Day Timeline**: Visual bar chart showing lab value trajectories over time.
    *   **Decision Buttons**: "Approve", "Reject", and "Approve with Comments" buttons that enable/disable based on live proposal state.

4.  **Staff Portal**:
    *   **Presence Tracking**: Monitoring which doctors and nurses are currently on shift.
    *   **Decision Feed**: Real-time view of clinical decisions made by doctors to coordinate care.

## 🧠 Risk Engine End-to-End Flow

The Risk Engine is the "brain" of CareFlow, executing a longitudinal analysis of patient trajectory. Here is the exact technical logic used:

### 1. The Scoring Formula
CareFlow uses a weighted composite scoring model to determine clinical priority:
**Score = (W1 × Eng) + (W2 × Clin) + (W3 × Chron) + (W4 × Instab)**

| Weight | Value | Category |
|---|---|---|
| **W1** | 1.5 | Engagement Factor |
| **W2** | 3.0 | Clinical Factor |
| **W3** | 1.0 | Chronic Factor |
| **W4** | 0.5 | Instability Factor |

### 2. Factor Calculations
*   **Engagement (Eng)**: Calculated over a **30-day window**. It measures appointment adherence.
    *   `Logic`: (Missed Appointments / Total Appointments) × 5.0. 
    *   `Note`: If no appointments exist in the window, it defaults to a neutral-high risk of **1.0**.
*   **Clinical (Clin)**: Calculated over a **90-day window**. It monitors biometric stability.
    *   `Tests Checked`: **Glucose** (Normal: 70–140 mg/dL) and **Hemoglobin** (Normal: 7–17 g/dL).
    *   `Logic`: (Abnormal Readings / Total Readings) × 5.0, capped at **5.0**.
*   **Chronic (Chron)**: Based on the count of active chronic conditions in the patient's profile.
    *   `Logic`: 1.0 point per condition, capped at **5.0**.
*   **Instability (Instab)**: Measures "Clinical Drift" or time since the last biometric interaction (lab record).
    *   `Logic`: (Days since last lab / 10), capped at **5.0**. (e.g., 50+ days = 5.0 points).

### 3. Scoring Range & Thresholds
*   **Theoretical Minimum**: **0.0** (Perfect adherence, normal labs, no conditions, recent interaction).
*   **Theoretical Maximum**: **30.0** (All missed appointments, all abnormal labs, 5+ conditions, 50+ days drift).
*   **Action Thresholds**:
    *   **Score ≥ 9.0**: Generates an **Escalate** proposal.
    *   **Score ≥ 5.0**: Generates a **Follow-up** proposal.
    *   **Score < 5.0**: Patient considered stable; no proposal generated.

---

## 🩺 HITL (Human-in-the-Loop) Workflow

CareFlow doesn't make decisions alone; it assists doctors.

1.  **Alerting**: When a proposal is generated, the patient is flagged in the Doctor's portal.
2.  **Review**: The doctor opens the patient profile and sees the AI's "Clinical Rationale" explaining why the score is high.
3.  **Action**: 
    *   Doctor clicks **Approve** → The system records the approval and notifies staff.
    *   Doctor clicks **Reject** → The proposal is cleared, and the doctor provides a reason.
4.  **Audit**: Every click is saved in an immutable table with a timestamp and the doctor's ID.

---

## ⚠️ Known Limitations

- **Heuristic Engine**: Currently uses a fixed mathematical formula rather than a trained Machine Learning model.
- **Manual Trigger**: The batch risk scoring must be clicked by an admin; it does not yet run automatically on a timer (Cron).
- **Single Lab View**: The timeline chart currently only displays a single metric at a time.

