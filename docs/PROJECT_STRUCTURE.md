# CareFlow Healthcare System

## 🏥 Project Overview

CareFlow is an **Autonomous Healthcare Coordination System** designed to transform reactive, dashboard-centric monitoring into **state-machine-driven patient care management**. It combines real-time clinical data, human-in-the-loop (HITL) decision workflows, and automated risk scoring to optimize healthcare operations and improve clinical outcomes.

---

## 📁 Project Structure Overview

This project has a clear modular organization to ensure maintainability, clarity, and compliance. A full explanation of each folder and file can be found in [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md).

- **`.github/workflows/`** – CI/CD, security scans, and compliance automation.
- **`backend/`** – Node.js backend
  - `config/` – Database connections, constants, environment variables.
  - `src/` – Core application code
    - `models/` – Database models (Patient, Appointment, Lab, etc.)
    - `controllers/` – API route handlers
    - `services/` – Business logic and reusable functions
    - `engines/` – Risk scoring & workflow automation
    - `middleware/` – Auth, logging, error handling
    - `utils/` – Helpers, validators, loggers, date utilities
  - `tests/` – Backend unit and integration tests
- **`database/`**
  - `schemas/` – SQL schema definitions for tables, indexes, constraints
  - `migrations/` – Database migration scripts
  - `seeds/` – Demo datasets for testing
  - `backups/` – Optional database backups
- **`docs/`**
  - `architecture/` – System overview, HITL workflow, state machine docs
  - `api/` – API specification & OpenAPI docs
  - `deployment/` – Deployment guides, rollback plans, testing protocols
- **`frontend/`**
  - `src/` – Frontend application code
  - `public/` – Static assets (HTML, images, CSS)
  - `tests/` – Frontend tests
- **`scripts/`**
  - `deployment/` – Deployment and rollback scripts
  - `testing/` – Load and NFR validation scripts
  - `data-import/` – Scripts to import clinical or demo data
- **`tests/`**
  - `unit/` – Unit tests for backend/frontend modules
  - `integration/` – End-to-end workflow tests
  - `load/` – Performance/load tests
- **Root Files**
  - `docker-compose.yml` – Docker orchestration for backend, database, and frontend
  - `Dockerfile` – Backend container instructions
  - `.gitignore` – Git ignore rules
  - `.eslintrc.json` – Linting rules
  - `.prettierrc` – Code formatting rules
  - `LICENSE` – Project license
  - `CONTRIBUTING.md` – Contribution guidelines
  - `CHANGELOG.md` – Project change log

---

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Haris-bin-shakeel/careflow-healthcare-system.git
cd careflow-healthcare-system
