# CareFlow: Walkthrough

## What Was Built
The CareFlow Autonomous Healthcare Coordination System — a full-stack clinical intelligence platform with:

### Backend (Python FastAPI + MySQL)
- **MySQL Schema** ([backend/schema.sql](file:///home/muqeet/Desktop/careflow/backend/schema.sql)): 10 tables including `patients`, `labs`, `appointments`, `risk_scores`, `action_proposals`, `decisions`, `audit_logs`, [inventory](file:///home/muqeet/Desktop/careflow/backend/main.py#173-177), `staffing_capacity`, plus infrastructure tables.
- **DECIMAL precision** for all clinical values, `ON DELETE RESTRICT` on patient references, composite indexes on [(patient_id, recorded_at)](file:///home/muqeet/Desktop/careflow/backend/schemas.py#40-45).
- **MySQL Triggers** for immutable audit logging on `action_proposals` and `decisions`.
- **FastAPI Endpoints** ([backend/main.py](file:///home/muqeet/Desktop/careflow/backend/main.py)): Batch risk scoring engine, 90-day patient history, HITL proposal workflow, inventory/staffing context.
- **Risk Formula**: `Score = (W1×Engagement) + (W2×Clinical) + (W3×Chronic) + (W4×Instability)`

### Frontend (React + Vite + Tailwind CSS v4)

#### Deterioration Dashboard
![Deterioration Dashboard](/home/muqeet/.gemini/antigravity/brain/c66bf075-7c72-43c4-b028-9964d475cb42/dashboard_working_1773528926329.png)

- Risk tier cards: **High (≥9)**, **Moderate (5-8.9)**, **Low (<5)**
- 90-day trend velocity sparklines per patient (Recharts)
- "Run Batch Risk Engine" button with loading animation

#### Decision Engine Queue
![Decision Engine](/home/muqeet/.gemini/antigravity/brain/c66bf075-7c72-43c4-b028-9964d475cb42/proposals_working_1773528942358.png)

- Pending proposals with Approve/Reject actions (optimistic UI < 1s)
- System Context sidebar showing **Staffing Capacity** and **Critical Inventory**

#### System Governance & Deployment
![Settings](/home/muqeet/.gemini/antigravity/brain/c66bf075-7c72-43c4-b028-9964d475cb42/settings_working_1773528946241.png)

- 3-week mandatory validation timeline (Shadow → Silent → Soft Launch)
- Phase sign-off workflow with production countdown

## How to Run

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Verification
- All three pages render correctly with the dark clinical theme
- Risk tiers display with proper color coding
- Decision Engine shows proposals with approve/reject buttons and resource context
- Settings page enforces the 3-week deployment validation window
