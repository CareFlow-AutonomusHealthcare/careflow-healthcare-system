# 🏥 CareFlow — Autonomous Healthcare Coordination System

## Group Information

| | |
|---|---|
| **Group Number** | 4 |
| **Course** | Database Systems |

### Group Members

| Name | Roll Number |
|---|---|
| Muqeet Mahmood | 24P-0606 |
| Muhammad Haris | 24P-0638 |
| Ali Irtaza | 24P-0607 |

---

## Project Description

CareFlow is an autonomous healthcare coordination system that proactively detects high-risk patients by analyzing behavioral and clinical trends over 30–90 day windows. It calculates composite risk scores based on missed appointments, abnormal lab results, chronic conditions, and patient inactivity, then routes proposed actions through a Human-in-the-Loop (HITL) workflow for clinical approval.

The system features three role-based portals:
- **Doctor Portal** — Review patient histories, approve/reject AI-generated risk proposals
- **Staff Coordinator Portal** — Monitor patients, track doctor and nurse shift presence
- **Admin Portal** — Manage users, inventory, view audit logs, and trigger the risk engine

**GitHub Repository:** [https://github.com/CareFlow-AutonomusHealthcare/careflow-healthcare-system](https://github.com/CareFlow-AutonomusHealthcare/careflow-healthcare-system)

---

## Technologies Used

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI |
| Database | MySQL 8.0 |
| ORM | SQLAlchemy 2.0 |
| Authentication | JWT (python-jose), Bcrypt (passlib) |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Charts | Recharts |
| HTTP Client | Axios |
| Routing | React Router v7 |

---

## Installation & Setup Guide

### Prerequisites

- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **MySQL** 8.0 ([Download](https://dev.mysql.com/downloads/installer/)) or XAMPP

---

### 🐧 Linux (Ubuntu)

<details>
<summary><strong>Click to expand Linux setup instructions</strong></summary>

#### Step 1 — Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-full python-is-python3 curl mysql-server software-properties-common
```

Install Python 3.12 (if your Ubuntu ships with 3.14+ only):
```bash
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev
```

Install Node.js 20:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 2 — Setup MySQL Database

```bash
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql
```

Inside the MySQL prompt:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
DROP DATABASE IF EXISTS careflow_db;
CREATE DATABASE careflow_db;
exit;
```

Import the schema:
```bash
mysql -u root -p careflow_db < backend/schema.sql
```

#### Step 3 — Create Environment File

Create a `.env` file in the project root:
```env
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_DATABASE=careflow_db
```

#### Step 4 — Start Backend (Terminal 1)

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
pip install pymysql
python backend/seed_data.py
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

#### Step 5 — Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

</details>

---

### 🪟 Windows

<details>
<summary><strong>Click to expand Windows setup instructions</strong></summary>

#### Step 1 — Install Prerequisites

1. **Python 3.11+** — Download from [python.org](https://www.python.org/downloads/). During installation, ✅ check **"Add Python to PATH"**.
2. **Node.js 20+** — Download the LTS installer from [nodejs.org](https://nodejs.org/).
3. **MySQL** — Either:
   - Install [XAMPP](https://www.apachefriends.org/) (easiest — includes MySQL), OR
   - Install [MySQL Community Server](https://dev.mysql.com/downloads/installer/)

#### Step 2 — Setup MySQL Database

**If using XAMPP:** Open XAMPP Control Panel → Start **MySQL**.

Open Command Prompt or PowerShell:
```powershell
# If using XAMPP (adjust path if needed):
C:\xampp\mysql\bin\mysql.exe -u root

# If using standalone MySQL:
mysql -u root -p
```

Inside the MySQL prompt:
```sql
DROP DATABASE IF EXISTS careflow_db;
CREATE DATABASE careflow_db;
exit;
```

Import the schema:
```powershell
# XAMPP:
Get-Content backend\schema.sql | C:\xampp\mysql\bin\mysql.exe -u root careflow_db

# Standalone MySQL:
mysql -u root -p careflow_db < backend\schema.sql
```

#### Step 3 — Create Environment File

Create a `.env` file in the project root:
```env
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_DATABASE=careflow_db
```

> **Note:** XAMPP's default MySQL has no password, so leave `MYSQL_PASSWORD=` blank. If you set a password, enter it here.

#### Step 4 — Start Backend (PowerShell — Terminal 1)

```powershell
python -m venv backend\venv
backend\venv\Scripts\activate
pip install -r backend\requirements.txt
pip install pymysql
$env:PYTHONIOENCODING="utf-8"; python backend\seed_data.py
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

#### Step 5 — Start Frontend (PowerShell — Terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

</details>

---

### 🍎 macOS

<details>
<summary><strong>Click to expand macOS setup instructions</strong></summary>

#### Step 1 — Install Prerequisites

Install [Homebrew](https://brew.sh/) if you don't have it:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install dependencies:
```bash
brew install python@3.12 node mysql
```

#### Step 2 — Setup MySQL Database

```bash
brew services start mysql
mysql -u root
```

Inside the MySQL prompt:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;
DROP DATABASE IF EXISTS careflow_db;
CREATE DATABASE careflow_db;
exit;
```

Import the schema:
```bash
mysql -u root -p careflow_db < backend/schema.sql
```

#### Step 3 — Create Environment File

Create a `.env` file in the project root:
```env
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_DATABASE=careflow_db
```

#### Step 4 — Start Backend (Terminal 1)

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
pip install pymysql
python backend/seed_data.py
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

#### Step 5 — Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

</details>

---

### 🌐 Open in Browser (All Platforms)

```
http://localhost:5173
```

---

## Default Login Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Administrator |
| `dr_smith` | `doctor123` | Doctor |
| `dr_jones` | `doctor123` | Doctor |
| `staff_coord` | `staff123` | Staff Coordinator |

---



## Database Schema

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

## Risk Scoring Formula

```
RiskScore = (W1 × Engagement) + (W2 × Clinical) + (W3 × Chronic) + (W4 × Instability)

Weights: W1=1.5, W2=3.0, W3=1.0, W4=0.5
Thresholds: Score ≥ 9.0 → Escalate | Score ≥ 5.0 → Follow-up
```

---

## Project Structure

```
careflow-healthcare-system/
├── backend/
│   ├── main.py          # FastAPI routes (all CRUD endpoints)
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic validation schemas
│   ├── auth.py          # JWT authentication + role guards
│   ├── database.py      # Database connection configuration
│   ├── schema.sql       # MySQL schema + triggers + seed users
│   ├── seed_data.py     # Full dummy data seeder
│   └── requirements.txt # Python dependencies
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
├── .env                 # Database credentials (not committed)
├── docker-compose.yml   # MySQL via Docker (optional)
└── start.sh             # One-command backend starter
```
