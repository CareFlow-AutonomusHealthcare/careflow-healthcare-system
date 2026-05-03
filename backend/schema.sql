-- CareFlow Database Schema
-- Version: 2.0 (Auth + Roles)

CREATE DATABASE IF NOT EXISTS careflow_db;
USE careflow_db;

-- =========================================================================
-- 0. USERS & AUTH
-- =========================================================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('doctor', 'staff', 'admin') NOT NULL,
    linked_id INT DEFAULT NULL,  -- FK to doctors.doctor_id or nursing_staff.staff_id
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 1. INFRASTRUCTURE & RESOURCE TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    room_number VARCHAR(50) NOT NULL,
    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS nursing_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    full_name VARCHAR(255) NOT NULL,
    shift ENUM('Day', 'Night') NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inventory (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    item_name VARCHAR(255) NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staffing_capacity (
    capacity_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT,
    shift ENUM('Day', 'Night') NOT NULL,
    current_staff_count INT NOT NULL DEFAULT 0,
    required_staff_count INT NOT NULL DEFAULT 0,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

-- =========================================================================
-- 2. PATIENT & CLINICAL HISTORY TABLES
-- =========================================================================

CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    chronic_conditions JSON, -- Stores patient-specific context for scoring
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    status ENUM('Attended', 'Missed', 'Cancelled') NOT NULL, -- Used for Missed Ratio calculations
    scheduled_at DATETIME NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT
);
-- Composite index for high-performance trend analysis
CREATE INDEX idx_appointments_patient_time ON appointments(patient_id, scheduled_at);


CREATE TABLE IF NOT EXISTS labs (
    lab_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    test_type VARCHAR(100) NOT NULL, -- e.g., HbA1c, BP
    test_value DECIMAL(10, 4) NOT NULL, -- Precision to prevent rounding errors in velocity calculations
    recorded_at DATETIME NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT
);
-- Composite index for high-performance trend analysis
CREATE INDEX idx_labs_patient_time ON labs(patient_id, recorded_at);


-- =========================================================================
-- 3. RISK SCORING & HITL WORKFLOW
-- =========================================================================

CREATE TABLE IF NOT EXISTS risk_scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    composite_score DECIMAL(5, 2) NOT NULL, -- W1*Eng + W2*Clin + W3*Chron + W4*Instab
    reasoning_string TEXT NOT NULL, -- Automated explanation for doctors
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS action_proposals (
    proposal_id INT AUTO_INCREMENT PRIMARY KEY,
    score_id INT NOT NULL,
    suggested_action ENUM('Escalate', 'Follow-up', 'Assign Staff') NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (score_id) REFERENCES risk_scores(score_id) ON DELETE CASCADE,
    UNIQUE(score_id) -- Strict one-to-one mapping, prevents duplicate alerts
);

CREATE TABLE IF NOT EXISTS decisions (
    decision_id INT AUTO_INCREMENT PRIMARY KEY,
    proposal_id INT NOT NULL,
    approver_id INT NOT NULL,
    approver_type ENUM('Doctor', 'Nurse_Supervisor') NOT NULL,
    comment TEXT DEFAULT NULL,
    decision_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES action_proposals(proposal_id) ON DELETE CASCADE
);

-- =========================================================================
-- 4. INTEGRATED AUDIT LOGS & TRIGGERS
-- =========================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    entity_id INT NOT NULL,
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_payload JSON,
    new_payload JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for Action Proposals (Tracking HITL workflow changes)
DELIMITER //

CREATE TRIGGER after_action_proposals_insert
AFTER INSERT ON action_proposals
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, entity_id, action_type, new_payload)
    VALUES (
        'action_proposals', 
        NEW.proposal_id, 
        'INSERT', 
        JSON_OBJECT('score_id', NEW.score_id, 'suggested_action', NEW.suggested_action, 'status', NEW.status)
    );
END;//

CREATE TRIGGER after_action_proposals_update
AFTER UPDATE ON action_proposals
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, entity_id, action_type, old_payload, new_payload)
    VALUES (
        'action_proposals', 
        NEW.proposal_id, 
        'UPDATE', 
        JSON_OBJECT('score_id', OLD.score_id, 'suggested_action', OLD.suggested_action, 'status', OLD.status),
        JSON_OBJECT('score_id', NEW.score_id, 'suggested_action', NEW.suggested_action, 'status', NEW.status)
    );
END;//

CREATE TRIGGER after_action_proposals_delete
AFTER DELETE ON action_proposals
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, entity_id, action_type, old_payload)
    VALUES (
        'action_proposals', 
        OLD.proposal_id, 
        'DELETE', 
        JSON_OBJECT('score_id', OLD.score_id, 'suggested_action', OLD.suggested_action, 'status', OLD.status)
    );
END;//

-- Triggers for Decisions (Tracking the actual decision maker)
CREATE TRIGGER after_decisions_insert
AFTER INSERT ON decisions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, entity_id, action_type, new_payload)
    VALUES (
        'decisions', 
        NEW.decision_id, 
        'INSERT', 
        JSON_OBJECT('proposal_id', NEW.proposal_id, 'approver_id', NEW.approver_id, 'approver_type', NEW.approver_type)
    );
END;//

DELIMITER ;

-- =========================================================================
-- 5. DEFAULT SEED USERS
-- Passwords are hashed with bcrypt at runtime.
-- Run the seeder script to create default users:
--   Windows:     python backend\seed_users.py
--   Linux/macOS: python3 backend/seed_users.py
--
-- Default credentials after seeding:
--   admin       / admin123
--   dr_smith    / doctor123
--   dr_jones    / doctor123
--   staff_coord / staff123
-- =========================================================================
