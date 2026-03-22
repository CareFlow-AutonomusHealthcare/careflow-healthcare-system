# 🏥 CareFlow — Autonomous Healthcare Coordination System

CareFlow is an autonomous healthcare coordination system that proactively detects high-risk patients by analyzing behavioral and clinical trends over 30–90 day windows[cite: 1, 125]. [cite_start]The system monitors patient data—such as missed appointments and lab results—to calculate a weighted risk score and generate proposed care actions[cite: 7, 8]. [cite_start]By integrating a Human-in-the-Loop (HITL) workflow, it ensures that all escalations and scheduling tasks are reviewed by medical staff while maintaining a full, immutable audit trail for compliance[cite: 8, 125].

---

## 🚀 The Problem & Solution
* [cite_start]**The Problem:** Healthcare systems are often reactive; patients fall through the cracks due to missed appointments and worsening lab results that aren't caught until a costly readmission occurs[cite: 3, 4].
* [cite_start]**The Solution:** An autonomous engine that monitors patient history, calculates risk scores based on longitudinal patterns, and automates coordination after clinical approval[cite: 7, 8, 140].

---

## 🛠️ Tech Stack
* [cite_start]**Language:** Python 3.x [cite: 66]
* [cite_start]**Backend Framework:** **FastAPI** (High-performance, asynchronous REST APIs) [cite: 66]
* [cite_start]**Database:** **MySQL** (Relational storage for clinical data and JSON-based audit logs) [cite: 83]
* **Frontend Styling:** **Tailwind CSS** (Utility-first CSS for the coordination dashboard)
* [cite_start]**Architecture:** Event-driven, stateless APIs with a dedicated Risk Scoring Engine [cite: 15, 59]

---

## 📊 Database Architecture (MySQL)
[cite_start]The system uses a MySQL instance with optimized schemas for clinical history and a specialized audit trail using JSON payloads[cite: 83, 96].

### Key Tables:
* [cite_start]**`patients`**: Core identity and chronic condition context[cite: 85].
* [cite_start]**`appointments`**: Tracks engagement patterns (Attended, Missed, Cancelled)[cite: 86].
* [cite_start]**`labs`**: Stores clinical observations for trend detection (e.g., HbA1c, Blood Pressure)[cite: 88].
* [cite_start]**`risk_scores`**: Stores the output of the scoring engine with automated reasoning strings[cite: 91, 92].
* [cite_start]**`action_proposals`**: Managed through a state machine (Pending → Approved/Rejected)[cite: 92, 93].
* [cite_start]**`audit_logs`**: Immutable records of every system change using JSON payloads[cite: 96, 98].

---

## 🧠 Risk Scoring Logic
[cite_start]The engine evaluates patients over a **30–90 day window** using a weighted composite model[cite: 125, 136]:

**Risk Score = (W₁ × Engagement) + (W₂ × Clinical) + (W₃ × Chronic Severity) + (W₄ × Instability)**

* [cite_start]**Engagement Trend:** Based on missed appointment ratios and consecutive absences[cite: 132].
* [cite_start]**Clinical Trend:** Calculated as a percentage change ($\% \Delta$) between the current average and historical average of lab values[cite: 133, 134].
* [cite_start]**Instability:** Uses standard deviation ($\sigma$) to detect volatile physiological control[cite: 135].
* [cite_start]**Thresholds:** A score $\ge$ 9 automatically triggers an **Action Proposal** for doctor review[cite: 136].

---

## 📈 Scalability & Impact
* [cite_start]**Technical**: Stateless API design allows the system to scale from a single clinic to regional hospital networks[cite: 17, 59].
* [cite_start]**Operational**: Reduces manual coordination errors and staff workload while providing a clear audit trail for compliance[cite: 19, 141].
