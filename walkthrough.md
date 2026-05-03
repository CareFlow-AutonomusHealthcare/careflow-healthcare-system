# CareFlow — System Walkthrough

## Overview

CareFlow has three completely separate portals, each with a unique interface and navigation. All portals share a single login page at `http://localhost:5173`. The system routes you automatically based on your role after login.

---

## Starting the System

### 1. Database
Ensure your MySQL service (e.g., XAMPP or Docker) is running. If using XAMPP, ensure a `.env` file exists in the root with:
```env
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_DATABASE=careflow_db
```

### 2. Backend API
**Windows (PowerShell):**
```powershell
backend\venv\Scripts\activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
**Linux / macOS:**
```bash
source backend/venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend Portal
Navigate to the `frontend` folder and run:
```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Login Page

All three roles share the same login screen. Enter your username and password — the system redirects you to the correct portal automatically.

**Demo credentials shown on the login page:**
- `admin` / `admin123`
- `dr_smith` / `doctor123`
- `staff_coord` / `staff123`

---

## Doctor Portal

Login as `dr_smith` / `doctor123`

### Patient History
- Lists all patients in the system
- Click any patient to open their 90-day clinical history
- Shows lab results (test type, value, date) and appointment history (Attended/Missed/Cancelled)
- Chronic conditions displayed per patient

### Risk Proposals
- Lists all pending AI-generated risk proposals
- Each card shows: patient name, risk score, suggested action, engine reasoning string
- Three decision options:
  - **Approve** — one click approval
  - **Approve with Comment** — opens a modal to add a clinical note before approving
  - **Reject with Comment** — opens a modal to add reasoning before rejecting
- Resolved proposals disappear from the queue

---

## Staff Coordinator Portal

Login as `staff_coord` / `staff123`

### Present Patients
- Table of all patients currently in the system
- Shows patient ID, chronic condition count, and active status

### Manage Patients
- Full CRUD interface for patient records
- Searchable table with patient name, MRN, chronic conditions, and registration date
- **Add Patient** — opens a modal to register a new patient with:
  - Full name input
  - Chronic condition management (custom text input + quick-add presets for 10 common conditions)
  - Condition chips with inline removal
- **Edit** — modify any patient's name or chronic conditions
- **Delete** — permanently remove a patient (with confirmation dialog)
- Summary badges show total patient count and high-risk patient count

### Staff & Doctor Presence
- **Doctors section** — lists all doctors with specialty and on-shift/off-shift status
- **Nursing Staff section** — lists all staff with shift type and presence status
- Presence is determined by whether the user account linked to that doctor/staff record is active

### Approved Decisions
- Shows all resolved proposals (Approved or Rejected)
- Displays the decision status, suggested action, risk score, and timestamp
- Doctor comments are shown inline if provided

---

## Admin Portal

Login as `admin` / `admin123`

### Dashboard
- Summary stats: total patients, doctor count, staff count, high-risk patient count
- Patient risk overview table with mini trend charts
- **Run Risk Engine** button — triggers batch scoring across all 100 patients and generates new proposals

### All Proposals
- Complete history of every proposal ever created
- Filter by: All / Pending / Approved / Rejected
- Shows patient, risk score, action, status, decision timestamp, and doctor comments

### User Management
- Full table of all system users with role badges and active/disabled status
- **Add User** — create a new doctor, staff, or admin account
- **Edit** — update name, password, role, or linked ID
- **Toggle** — enable or disable an account without deleting it
- **Delete** — permanently remove a user

### Inventory
- Lists all 40 equipment items with current stock levels
- Color-coded status: Critical (≤10), Low (≤50), OK
- Click the edit icon on any row to update the quantity inline

### Audit Logs
- Immutable log of every INSERT, UPDATE, DELETE on key tables
- Click any row to expand and view the full old/new JSON payload
- Refresh button to pull latest entries

---

## Risk Engine

The engine scores every patient using:

```
Score = (1.5 × Engagement) + (3.0 × Clinical) + (1.0 × Chronic) + (0.5 × Instability)
```

- **Engagement** — ratio of missed appointments over 90 days
- **Clinical** — volatility of lab values (max-min range)
- **Chronic** — number of chronic conditions
- **Instability** — days since last lab interaction

Proposals are generated automatically:
- Score ≥ 9.0 → **Escalate**
- Score ≥ 5.0 → **Follow-up**

Only one pending proposal per patient is allowed at a time.

---

## Seeding Test Data

To reset and repopulate all dummy data:
- **Windows:** `python backend\seed_data.py`
- **Linux/macOS:** `python3 backend/seed_data.py`

This creates:
- 100 patients (20 high-risk, 35 moderate, 45 low)
- 20 doctors across 8 departments
- 70 nursing staff (day/night shifts)
- 40 inventory items
- 1,200 appointments + 2,400 lab records

After seeding, log in as admin and click **Run Risk Engine** to generate proposals.

---

## Database

The project uses a MySQL database. You can configure credentials in the `.env` file.

**To reset the entire database tables:**
1. Log into your MySQL terminal.
2. Run `CREATE DATABASE IF NOT EXISTS careflow_db;`.
3. Import the schema file:
   - **Windows:** `cmd /c 'mysql -u root -p careflow_db < backend\schema.sql'`
   - **Linux/macOS:** `mysql -u root -p careflow_db < backend/schema.sql`
