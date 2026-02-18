
Gemini said
CareFlow — Autonomous Healthcare Coordination System
CareFlow is a backend-heavy automation system designed to proactively detect high-risk patients by analyzing clinical and behavioral trends. Unlike traditional dashboards that only alert staff, CareFlow proposes specific care actions (like follow-ups or escalations) and manages the workflow through a Human-in-the-Loop (HITL) approval process.
+4

🚀 The Problem & Solution

The Problem: Healthcare systems are reactive; patients fall through the cracks due to missed appointments and worsening lab results that aren't caught until a costly readmission occurs.


The Solution: An autonomous engine that monitors patient history, calculates risk scores based on longitudinal patterns, and automates coordination after clinical approval.
+1

🛠️ Tech Stack
Language: Python 3.x


Framework: FastAPI (High-performance, asynchronous REST APIs) 
+1


Database: MySQL (Relational storage for clinical data and JSON-based audit logs) 


Architecture: Event-driven, stateless APIs with a dedicated Decision Engine 
+2

📊 Database Architecture (MySQL)
The system uses a single MySQL instance with optimized schemas for clinical history and a specialized audit trail using JSON payloads.
+1

Key Tables:

patients: Core identity and chronic condition context.


appointments: Tracks engagement patterns (Attended vs. Missed).


labs: Stores clinical observations (e.g., HbA1c, Blood Pressure).


risk_scores: Stores the output of the scoring engine with reasoning strings.


action_proposals: Managed through a state machine (Pending → Approved/Rejected).


audit_logs: Immutable records of every system change using old_payload and new_payload JSON columns.
+1

🧠 Risk Scoring Logic
The system evaluates patients over a 30–90 day window using a weighted composite model:
+1

RiskScore=(W 
1
​
 ×Engagement)+(W 
2
​
 ×Clinical)+(W 
3
​
 ×Severity)+(W 
4
​
 ×Instability)

Engagement: Based on missed appointment ratios and consecutive absences.


Clinical: Calculated as a percentage change (%Δ) between the current average and historical average of lab values.


Instability: Uses standard deviation (σ) to detect volatile physiological control.

Thresholds:

Low Risk (0–4)

Moderate Risk (5–8)


High Risk (≥ 9): Automatically triggers an Action Proposal for doctor review
