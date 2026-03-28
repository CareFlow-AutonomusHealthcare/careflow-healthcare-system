# 🏥 CareFlow — Autonomous Healthcare Coordination System

CareFlow is an autonomous healthcare coordination system that proactively detects high-risk patients by analyzing behavioral and clinical trends over 30–90 day windows. It features a full role-based access control system with three distinct portals for Doctors, Staff Coordinators, and Administrators.

---

## 🚀 The Problem & Solution

**The Problem:** Healthcare systems are often reactive — patients fall through the cracks due to missed appointments and worsening lab results that aren't caught until a costly readmission occurs.

**The Solution:** An autonomous engine that monitors patient history, calculates risk scores based on longitudinal patterns, and routes proposed actions through a Human-in-the-Loop (HITL) workflow for clinical approval — with a full immutable audit trail.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI |
| Database | MySQL 8.0 |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose), plain-text passwords |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Charts | Recharts |
| HTTP Client | Axios |

---

## 👥 User Roles & Portals

### 🩺 Doctor Portal
- View full 90-day patient history (labs + appointments)
- Review AI-generated risk proposals
- Approve, reject, or approve/reject with clinical comments

### 🗂️ Staff Coordinator Portal
- View all present patients
- Monitor doctor and nursing staff shift presence
- View all resolved decisions made by doctors

### 🔐 Admin Portal
- Full system dashboard with risk overview
- User management — add, edit, disable, delete doctors/staff/admins
- Inventory management — view and update stock levels
- All proposals — filterable history of every risk proposal
- Audit logs — immutable JSON payload log of every DB change

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `users` | Auth credentials and role assignments |
| `departments` | Hospital departments |
| `doctors` | Doctor profiles linked to departments |
| `nursing_staff` | Staff profiles with shift assignments |
| `inventory` | Equipment stock per department |
| `staffing_capacity` | Current vs required staff per shift |
| `patients` | Patient identity and chronic conditions |
| `appointments` | Engagement tracking (Attended/Missed/Cancelled) |
| `labs` | Clinical lab results for trend analysis |
| `risk_scores` | Composite risk scores from the engine |
| `action_proposals` | HITL workflow state machine (Pending → Approved/Rejected) |
| `decisions` | Immutable doctor decisions with optional comments |
| `audit_logs` | Full JSON payload audit trail via MySQL triggers |

---

## 🧠 Risk Scoring Formula

```
RiskScore = (W1 × Engagement) + (W2 × Clinical) + (W3 × Chronic) + (W4 × Instability)

Weights: W1=1.5, W2=3.0, W3=1.0, W4=0.5
Thresholds: Score ≥ 9.0 → Escalate | Score ≥ 5.0 → Follow-up
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.11
- Node.js 18+
- MySQL 8.0 running locally

### 1. Database Setup
```bash
sudo mysql -e "
CREATE DATABASE IF NOT EXISTS careflow_db;
CREATE USER IF NOT EXISTS 'careflow_user'@'localhost' IDENTIFIED BY 'careflow_password';
GRANT ALL PRIVILEGES ON careflow_db.* TO 'careflow_user'@'localhost';
FLUSH PRIVILEGES;
"
sudo mysql careflow_db < backend/schema.sql
```

### 2. Start Backend (Terminal 1)
```bash
cd ~/Desktop/careflow
backend/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 3. Start Frontend (Terminal 2)
```bash
cd ~/Desktop/careflow/frontend
npm run dev
```

### 4. Open in Browser
```
http://localhost:5173
```

---

## 🔑 Default Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Administrator |
| `dr_smith` | `doctor123` | Doctor |
| `dr_jones` | `doctor123` | Doctor |
| `staff_coord` | `staff123` | Staff Coordinator |

---

## 🌱 Seed Dummy Data

To populate 100 patients, 20 doctors, 70 staff, and full inventory:
```bash
backend/venv/bin/python3 backend/seed_data.py
```

Then log in as admin and click **Run Risk Engine** to generate proposals.

---

## 📁 Project Structure

```
careflow/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # JWT auth + role guards
│   ├── database.py      # DB connection
│   ├── schema.sql       # MySQL schema + seed users
│   ├── seed_data.py     # Full dummy data seeder
│   └── seed_users.py    # User-only seeder
├── frontend/
│   └── src/
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── DoctorLayout.jsx
│       │   ├── StaffLayout.jsx
│       │   └── AdminLayout.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── doctor/
│           ├── staff/
│           └── admin/
├── start.sh             # One-command backend starter
└── docker-compose.yml   # MySQL via Docker (optional)
```
