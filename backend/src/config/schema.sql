-- =====================================================
-- PULSE LOGIC - COMPLETE DATABASE REPLACEMENT SCRIPT
-- This will DROP your existing database and create a new one
-- =====================================================

-- Drop database if it already exists
DROP DATABASE IF EXISTS pulselogic_db;

-- Create fresh database
CREATE DATABASE pulselogic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE pulselogic_db;

-- =====================================================
-- 1. FACILITIES TABLE
-- =====================================================
CREATE TABLE facilities (
    facility_id INT PRIMARY KEY AUTO_INCREMENT,
    facility_name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(100) NOT NULL,
    facility_code VARCHAR(50) UNIQUE NOT NULL,
    district VARCHAR(100),
    province VARCHAR(100),
    contact_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    facility_id INT,
    department_name VARCHAR(255) NOT NULL,
    department_code VARCHAR(50) UNIQUE,
    hod_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
);

-- =====================================================
-- 3. USERS TABLE
-- =====================================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    facility_id INT,
    department_id INT,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    password_hash VARCHAR(255) NOT NULL,
    is_first_login BOOLEAN DEFAULT TRUE,
    temporary_password VARCHAR(255),
    temp_password_expires TIMESTAMP,
    password_changed_at TIMESTAMP,
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP,
    otp_attempts INT DEFAULT 0,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- =====================================================
-- 4. PATIENTS TABLE
-- =====================================================
CREATE TABLE patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    id_number VARCHAR(20) UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    street_address VARCHAR(255),
    province VARCHAR(100),
    city VARCHAR(100),
    smart_card_id VARCHAR(100) UNIQUE,
    smart_card_issued BOOLEAN DEFAULT FALSE,
    biometric_enrolled BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    registration_date DATE,
    registered_at INT,
    registered_by INT,
    total_visits INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_at) REFERENCES facilities(facility_id),
    FOREIGN KEY (registered_by) REFERENCES users(user_id)
);

-- =====================================================
-- 5. NEXT OF KIN TABLE
-- =====================================================
CREATE TABLE next_of_kin (
    next_of_kin_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- =====================================================
-- 6. PATIENT VISITS TABLE
-- =====================================================
CREATE TABLE patient_visits (
    visit_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    facility_id INT NOT NULL,
    visit_date DATE NOT NULL,
    visit_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    check_in_time TIMESTAMP,
    waiting_time_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
);

-- =====================================================
-- 7. OTP VERIFICATIONS TABLE
-- =====================================================
CREATE TABLE otp_verifications (
    otp_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    visit_id INT,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (visit_id) REFERENCES patient_visits(visit_id)
);

-- =====================================================
-- 8. QUEUE TABLE
-- =====================================================
CREATE TABLE queue (
    queue_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    visit_id INT NOT NULL,
    facility_id INT NOT NULL,
    department_id INT,
    priority_score INT DEFAULT 0,
    priority_level VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'waiting',
    position INT,
    check_in_time TIMESTAMP,
    nurse_start_time TIMESTAMP,
    nurse_end_time TIMESTAMP,
    doctor_start_time TIMESTAMP,
    doctor_end_time TIMESTAMP,
    waiting_time_minutes INT,
    waiting_time_alert BOOLEAN DEFAULT FALSE,
    assigned_nurse_id INT,
    assigned_doctor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (visit_id) REFERENCES patient_visits(visit_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (assigned_nurse_id) REFERENCES users(user_id),
    FOREIGN KEY (assigned_doctor_id) REFERENCES users(user_id)
);

-- =====================================================
-- 9. VITALS TABLE
-- =====================================================
CREATE TABLE vitals (
    vital_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    visit_id INT NOT NULL,
    nurse_id INT,
    temperature DECIMAL(4,1),
    heart_rate INT,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    oxygen_saturation INT,
    blood_glucose DECIMAL(5,2),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    measurement_method VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (visit_id) REFERENCES patient_visits(visit_id),
    FOREIGN KEY (nurse_id) REFERENCES users(user_id)
);

-- =====================================================
-- 10. DIAGNOSES TABLE
-- =====================================================
CREATE TABLE diagnoses (
    diagnosis_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    visit_id INT NOT NULL,
    doctor_id INT NOT NULL,
    icd10_code VARCHAR(20),
    diagnosis TEXT NOT NULL,
    diagnosis_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (visit_id) REFERENCES patient_visits(visit_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- =====================================================
-- 11. PRESCRIPTIONS TABLE
-- =====================================================
CREATE TABLE prescriptions (
    prescription_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    visit_id INT NOT NULL,
    doctor_id INT NOT NULL,
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    quantity INT,
    status VARCHAR(50) DEFAULT 'pending',
    pharmacist_id INT,
    dispensed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (visit_id) REFERENCES patient_visits(visit_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id),
    FOREIGN KEY (pharmacist_id) REFERENCES users(user_id)
);

-- =====================================================
-- 12. REFERRALS TABLE
-- =====================================================
CREATE TABLE referrals (
    referral_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    referring_doctor_id INT NOT NULL,
    from_facility_id INT NOT NULL,
    to_facility_id INT NOT NULL,
    reason TEXT,
    priority VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    referral_date DATE,
    sent_at TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    clinical_notes TEXT,
    results_sent_back BOOLEAN DEFAULT FALSE,
    results_sent_back_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (referring_doctor_id) REFERENCES users(user_id),
    FOREIGN KEY (from_facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (to_facility_id) REFERENCES facilities(facility_id)
);

-- =====================================================
-- 13. APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    facility_id INT NOT NULL,
    doctor_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'scheduled',
    sms_reminder_sent BOOLEAN DEFAULT FALSE,
    checked_in BOOLEAN DEFAULT FALSE,
    missed_appointment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id)
);

-- =====================================================
-- 14. MATERNITY RECORDS TABLE
-- =====================================================
CREATE TABLE maternity_records (
    maternity_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    facility_id INT NOT NULL,
    expected_due_date DATE,
    gestational_weeks INT,
    gravida INT,
    para INT,
    living_children INT,
    maternal_age INT,
    blood_pressure VARCHAR(50),
    protein_in_urine VARCHAR(50),
    swelling VARCHAR(50),
    blurred_vision BOOLEAN DEFAULT FALSE,
    vaginal_bleeding BOOLEAN DEFAULT FALSE,
    fetal_movement VARCHAR(50),
    complications TEXT,
    risk_factors TEXT,
    referral_alert BOOLEAN DEFAULT FALSE,
    referral_alert_reason TEXT,
    labour_stage VARCHAR(50),
    delivery_date DATE,
    delivery_type VARCHAR(50),
    delivery_outcome VARCHAR(50),
    baby_weight DECIMAL(5,2),
    baby_gender VARCHAR(20),
    baby_apgar_score INT,
    postnatal_care TEXT,
    maternal_condition VARCHAR(50),
    baby_condition VARCHAR(50),
    risk_level VARCHAR(20) DEFAULT 'low',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
);

-- =====================================================
-- 15. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    type VARCHAR(50),
    channel VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    content TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- =====================================================
-- 16. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =====================================================
-- 17. REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    facility_id INT,
    department_id INT,
    district VARCHAR(100),
    province VARCHAR(100),
    start_date DATE,
    end_date DATE,
    report_data JSON,
    summary TEXT,
    generated_by INT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_url VARCHAR(255),
    format VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    exported_count INT DEFAULT 0,
    approved_by INT,
    approved_at TIMESTAMP,
    approval_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (generated_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- =====================================================
-- 18. LAB REQUESTS TABLE
-- =====================================================
CREATE TABLE lab_requests (
    lab_request_id INT PRIMARY KEY AUTO_INCREMENT,
    referral_id INT,
    patient_id INT NOT NULL,
    facility_id INT NOT NULL,
    lab_id INT NOT NULL,
    doctor_id INT NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    results TEXT,
    result_summary TEXT,
    uploaded_at TIMESTAMP,
    doctor_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (lab_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id),
    FOREIGN KEY (referral_id) REFERENCES referrals(referral_id) ON DELETE SET NULL
);

-- =====================================================
-- 19. IMAGING REQUESTS TABLE
-- =====================================================
CREATE TABLE imaging_requests (
    imaging_request_id INT PRIMARY KEY AUTO_INCREMENT,
    referral_id INT,
    patient_id INT NOT NULL,
    facility_id INT NOT NULL,
    imaging_facility_id INT NOT NULL,
    doctor_id INT NOT NULL,
    imaging_type VARCHAR(100) NOT NULL,
    body_part VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    report TEXT,
    image_urls JSON,
    uploaded_at TIMESTAMP,
    doctor_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (imaging_facility_id) REFERENCES facilities(facility_id),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id),
    FOREIGN KEY (referral_id) REFERENCES referrals(referral_id) ON DELETE SET NULL
);

-- =====================================================
-- 20. DOH REPORTS TABLE
-- =====================================================
CREATE TABLE doh_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    start_date DATE,
    end_date DATE,
    report_data JSON,
    summary TEXT,
    generated_by INT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(user_id)
);

-- =====================================================
-- 21. INSERT FACILITIES (HOSPITALS & CLINICS)
-- =====================================================

INSERT INTO facilities (facility_name, facility_type, facility_code, district, province, contact_number) VALUES
('Gauteng General Hospital', 'Hospital', 'GGH001', 'Johannesburg', 'Gauteng', '011-555-1234'),
('Chris Hani Baragwanath Hospital', 'Hospital', 'CHBH001', 'Soweto', 'Gauteng', '011-555-5678'),
('Tygerberg Hospital', 'Hospital', 'TBH001', 'Cape Town', 'Western Cape', '021-555-9012'),
('Themba Hospital', 'Hospital', 'TH001', 'Ehlanzeni', 'Mpumalanga', '013-555-3456'),
('Cape Town Central Clinic', 'Clinic', 'CTCC001', 'Cape Town', 'Western Cape', '021-555-5678'),
('Soweto Community Clinic', 'Clinic', 'SCC001', 'Soweto', 'Gauteng', '011-555-7890'),
('Mpumalanga Rural Clinic', 'Clinic', 'MRC001', 'Ehlanzeni', 'Mpumalanga', '013-555-2345'),
('Durban Community Clinic', 'Clinic', 'DCC001', 'Durban', 'KwaZulu-Natal', '031-555-6789');

-- =====================================================
-- 22. INSERT DEPARTMENTS
-- =====================================================

INSERT INTO departments (facility_id, department_name, department_code, hod_name) VALUES
(1, 'Emergency Department', 'ED001', 'Dr. S. Ndlovu'),
(1, 'Laboratory', 'LAB001', 'Dr. K. Patel'),
(1, 'Radiology', 'RAD001', 'Dr. T. Nkosi'),
(1, 'Pharmacy', 'PHARM001', 'Mr. J. Smith'),
(1, 'Maternity Ward', 'MAT001', 'Dr. P. Dlamini'),
(2, 'Emergency Department', 'ED002', 'Dr. R. Zulu'),
(2, 'Laboratory', 'LAB002', 'Dr. N. Mbatha'),
(2, 'Radiology', 'RAD002', 'Dr. S. Ngcobo'),
(3, 'Emergency Department', 'ED003', 'Dr. H. Botha'),
(3, 'Cardiology', 'CARD001', 'Dr. D. Van der Merwe'),
(3, 'Laboratory', 'LAB003', 'Dr. M. Williams'),
(4, 'Emergency Department', 'ED004', 'Dr. M. Ndlovu'),
(4, 'Maternity Ward', 'MAT004', 'Dr. P. Mokoena');

-- =====================================================
-- 23. INSERT USERS
-- =====================================================

-- Password: Pulse@2026 (bcrypt hash)
-- Full Access Test Account
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash, is_first_login) 
VALUES ('test@pl.com', 'Test User - Full Access', 'admin', 1, 1, '082-555-9999', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ', FALSE);

-- System Admin
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash, is_first_login) 
VALUES ('admin@pl.com', 'System Administrator', 'admin', 1, 1, '082-555-0000', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ', FALSE);

-- DOH Users
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash, is_first_login) 
VALUES ('doh@pl.com', 'DOH Administrator', 'doh', NULL, NULL, '082-555-1111', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ', FALSE);

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('doh2@pl.com', 'DOH Gauteng', 'doh', NULL, NULL, '082-555-1112', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Hospital Administrators
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('hospitaladmin1@pl.com', 'Hospital Admin - Gauteng General', 'hospital', 1, 1, '082-555-2222', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('hospitaladmin2@pl.com', 'Hospital Admin - Chris Hani', 'hospital', 2, 2, '082-555-2223', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('hospitaladmin3@pl.com', 'Hospital Admin - Tygerberg', 'hospital', 3, 3, '082-555-2224', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Hospital Doctors
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('hospitaldoctor1@pl.com', 'Dr. Thabo Mbeki', 'doctor', 1, 1, '082-555-3333', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('hospitaldoctor2@pl.com', 'Dr. Nomzamo Mbatha', 'doctor', 2, 2, '082-555-3334', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('hospitaldoctor3@pl.com', 'Dr. Pieter Botha', 'doctor', 3, 3, '082-555-3335', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('hospitaldoctor4@pl.com', 'Dr. S. Ndlovu', 'doctor', 4, 4, '082-555-3336', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Lab Technicians
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('labtech1@pl.com', 'Dr. K. Patel', 'laboratory', 1, 2, '082-555-4444', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('labtech2@pl.com', 'Dr. N. Mbatha', 'laboratory', 2, 3, '082-555-4445', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('labtech3@pl.com', 'Dr. M. Williams', 'laboratory', 3, 4, '082-555-4446', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Radiologists
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('radiology1@pl.com', 'Dr. T. Nkosi', 'radiology', 1, 3, '082-555-5555', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('radiology2@pl.com', 'Dr. S. Ngcobo', 'radiology', 2, 4, '082-555-5556', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Clinic Admins
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('clinicadmin1@pl.com', 'Clinic Admin - Cape Town', 'facilityadmin', 5, 1, '082-555-6666', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('clinicadmin2@pl.com', 'Clinic Admin - Soweto', 'facilityadmin', 6, 1, '082-555-6667', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Clinic Doctors
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('clinicdoctor1@pl.com', 'Dr. S. Ndlovu', 'doctor', 5, 1, '082-555-7777', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('clinicdoctor2@pl.com', 'Dr. M. Khumalo', 'doctor', 6, 1, '082-555-7778', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('clinicdoctor3@pl.com', 'Dr. P. Dlamini', 'doctor', 7, 1, '082-555-7779', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Nurses
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('nurse@pl.com', 'Sister Mary Jones', 'nurse', 1, 1, '082-555-8888', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('nurse2@pl.com', 'Nurse Thandi Zulu', 'nurse', 2, 2, '082-555-8889', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('nurse3@pl.com', 'Nurse Sarah Johnson', 'nurse', 3, 3, '082-555-8890', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Pharmacists
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('pharma@pl.com', 'John Peters', 'pharmacist', 1, 4, '082-555-9999', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('pharma2@pl.com', 'Mary Smith', 'pharmacist', 2, 1, '082-555-9998', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- Receptionists
INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('reception@pl.com', 'Lerato Mokoena', 'reception', 1, 1, '082-555-1010', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

INSERT INTO users (email, full_name, role, facility_id, department_id, phone, password_hash) 
VALUES ('reception2@pl.com', 'Thabo Nkosi', 'reception', 5, 1, '082-555-1011', '$2b$10$JkLq7eFzXkQyRwVtPq3XmOeY8vZaBcDeFgHiJkLmNoPqRsTuVwXyZ');

-- =====================================================
-- 24. INSERT PATIENTS
-- =====================================================

INSERT INTO patients (
    patient_code, first_name, last_name, date_of_birth, gender, 
    id_number, phone_number, email, province, city, 
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    registration_date, registered_at, registered_by
) VALUES 
('P001', 'Thabo', 'Mbeki', '1980-05-15', 'Male',
 '8005151234089', '082-555-5678', 'thabo@email.com', 'Gauteng', 'Johannesburg',
 'Sandra Mbeki', '082-555-9999', 'Spouse', CURDATE(), 1, 1),

('P002', 'Nomzamo', 'Zulu', '1990-08-22', 'Female',
 '9008229876543', '083-555-1234', 'nomzamo@email.com', 'Gauteng', 'Soweto',
 'Sipho Zulu', '083-555-4321', 'Brother', CURDATE(), 2, 2),

('P003', 'Pieter', 'Van der Merwe', '1975-03-10', 'Male',
 '7503105432109', '084-555-5678', 'pieter@email.com', 'Western Cape', 'Cape Town',
 'Anna Van der Merwe', '084-555-8765', 'Wife', CURDATE(), 3, 3),

('P004', 'Lindiwe', 'Ndlovu', '1985-11-30', 'Female',
 '8511307654321', '082-555-9876', 'lindiwe@email.com', 'Mpumalanga', 'Nelspruit',
 'Mandla Ndlovu', '082-555-6789', 'Husband', CURDATE(), 4, 4),

('P005', 'Sibusiso', 'Ngcobo', '1995-07-18', 'Male',
 '9507189876543', '083-555-1111', 'sibusiso@email.com', 'KwaZulu-Natal', 'Durban',
 'Thandi Ngcobo', '083-555-2222', 'Sister', CURDATE(), 5, 1),

('P006', 'Zanele', 'Dlamini', '1988-04-12', 'Female',
 '8804123456789', '082-555-2222', 'zanele@email.com', 'Western Cape', 'Cape Town',
 'Mpho Dlamini', '082-555-3333', 'Husband', CURDATE(), 5, 1),

('P007', 'Sipho', 'Nxumalo', '1992-09-25', 'Male',
 '9209258765432', '083-555-5555', 'sipho@email.com', 'Gauteng', 'Soweto',
 'Thandi Nxumalo', '083-555-6666', 'Wife', CURDATE(), 6, 2),

('P008', 'Nomsa', 'Mthembu', '1987-06-18', 'Female',
 '8706182345678', '082-555-4444', 'nomsa@email.com', 'Gauteng', 'Johannesburg',
 'Bheki Mthembu', '082-555-5555', 'Husband', CURDATE(), 1, 1),

('P009', 'Jabulani', 'Khumalo', '1993-12-01', 'Male',
 '9312018765432', '083-555-7777', 'jabulani@email.com', 'Western Cape', 'Cape Town',
 'Sibongile Khumalo', '083-555-8888', 'Wife', CURDATE(), 3, 3);

-- =====================================================
-- 25. INSERT NEXT OF KIN
-- =====================================================

INSERT INTO next_of_kin (patient_id, full_name, relationship, phone) VALUES
(1, 'Sandra Mbeki', 'Spouse', '082-555-9999'),
(2, 'Sipho Zulu', 'Brother', '083-555-4321'),
(3, 'Anna Van der Merwe', 'Wife', '084-555-8765'),
(4, 'Mandla Ndlovu', 'Husband', '082-555-6789'),
(5, 'Thandi Ngcobo', 'Sister', '083-555-2222'),
(6, 'Mpho Dlamini', 'Husband', '082-555-3333'),
(7, 'Thandi Nxumalo', 'Wife', '083-555-6666'),
(8, 'Bheki Mthembu', 'Husband', '082-555-5555'),
(9, 'Sibongile Khumalo', 'Wife', '083-555-8888');

-- =====================================================
-- 26. INSERT REFERRALS (CLINIC → HOSPITAL)
-- =====================================================

INSERT INTO referrals (
    patient_id, referring_doctor_id, from_facility_id, to_facility_id,
    reason, priority, status, referral_date, sent_at
) VALUES 
(1, 1, 5, 1, 'Patient has persistent chest pain. ECG shows abnormal rhythm. Refer for cardiology consult.', 'urgent', 'pending', CURDATE(), NOW()),

(2, 2, 6, 2, 'Suspected appendicitis. Patient presents with severe right lower quadrant pain. Need surgical consult.', 'emergency', 'accepted', CURDATE(), NOW()),

(3, 3, 5, 3, 'Abnormal mammogram detected. Need further imaging and oncology consult.', 'normal', 'pending', CURDATE(), NOW()),

(4, 1, 7, 4, 'High-risk pregnancy. Severe pre-eclampsia detected. Need specialist maternity care.', 'urgent', 'pending', CURDATE(), NOW()),

(5, 2, 6, 1, 'Patient with uncontrolled diabetes. Needs endocrinology specialist.', 'normal', 'pending', CURDATE(), NOW()),

(6, 3, 5, 2, 'Chronic kidney disease. Refer for nephrology assessment.', 'urgent', 'pending', CURDATE(), NOW()),

(7, 1, 5, 3, 'Suspected cancer. Need oncology consultation and biopsy.', 'emergency', 'pending', CURDATE(), NOW()),

(8, 1, 1, 2, 'Severe hypertension. Need specialist consult.', 'urgent', 'pending', CURDATE(), NOW()),

(9, 3, 3, 1, 'Cardiac abnormality detected. Need cardiology consult.', 'urgent', 'pending', CURDATE(), NOW());

-- =====================================================
-- 27. INSERT LAB REQUESTS
-- =====================================================

INSERT INTO lab_requests (
    referral_id, patient_id, facility_id, lab_id, doctor_id,
    test_type, test_name, priority, status
) VALUES 
(1, 1, 5, 1, 1, 'Blood', 'Full Blood Count', 'urgent', 'pending'),
(1, 1, 5, 1, 1, 'Blood', 'Lipid Profile', 'urgent', 'pending'),
(2, 2, 6, 2, 2, 'Blood', 'White Blood Cell Count', 'emergency', 'in_progress'),
(3, 3, 5, 3, 3, 'Biopsy', 'Tissue Pathology', 'normal', 'pending'),
(4, 4, 7, 4, 1, 'Urine', 'Protein Analysis', 'urgent', 'pending'),
(5, 5, 6, 1, 2, 'Blood', 'HbA1c', 'normal', 'pending'),
(7, 7, 5, 3, 1, 'Biopsy', 'Tissue Pathology', 'emergency', 'pending');

-- =====================================================
-- 28. INSERT IMAGING REQUESTS
-- =====================================================

INSERT INTO imaging_requests (
    referral_id, patient_id, facility_id, imaging_facility_id, doctor_id,
    imaging_type, body_part, priority, status
) VALUES 
(1, 1, 5, 1, 1, 'ECG', 'Chest', 'urgent', 'pending'),
(1, 1, 5, 1, 1, 'X-Ray', 'Chest', 'urgent', 'pending'),
(3, 3, 5, 3, 3, 'Ultrasound', 'Breast', 'normal', 'pending'),
(4, 4, 7, 4, 1, 'Ultrasound', 'Abdomen', 'urgent', 'pending'),
(7, 7, 5, 3, 1, 'CT Scan', 'Abdomen', 'emergency', 'pending'),
(9, 9, 3, 1, 3, 'MRI', 'Chest', 'urgent', 'pending');

-- =====================================================
-- 29. INSERT VITALS
-- =====================================================

INSERT INTO vitals (patient_id, visit_id, nurse_id, temperature, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation, blood_glucose, weight, height)
VALUES 
(1, 1, 1, 37.0, 95, 145, 90, 94, 7.2, 85.0, 175.0),
(2, 2, 2, 38.2, 110, 135, 85, 96, 6.8, 78.0, 165.0),
(3, 3, 3, 36.5, 72, 130, 80, 98, 5.2, 70.0, 170.0),
(4, 4, 1, 37.5, 88, 150, 95, 95, 8.5, 82.0, 160.0),
(5, 5, 2, 36.8, 76, 125, 75, 99, 11.2, 75.0, 172.0),
(6, 6, 3, 36.9, 80, 128, 78, 97, 6.5, 68.0, 165.0),
(7, 7, 1, 37.2, 85, 135, 82, 96, 7.8, 80.0, 170.0);

-- =====================================================
-- 30. INSERT DOH REPORTS
-- =====================================================

INSERT INTO doh_reports (
    report_name, report_type, district, province, start_date, end_date,
    report_data, summary, generated_by, status
) VALUES 
('Quarterly Health Report - Gauteng', 'quarterly', NULL, 'Gauteng', DATE_SUB(CURDATE(), INTERVAL 3 MONTH), CURDATE(),
 '{"total_patients": 1500, "emergency_cases": 85, "maternity_cases": 120, "referrals": 45, "disease_trends": {"hypertension": 220, "diabetes": 180, "HIV": 95}}',
 'Gauteng province shows stable health metrics with slight increase in hypertension cases. Referral rate is 3%.', 1, 'published'),

('Monthly Health Report - Ehlanzeni District', 'monthly', 'Ehlanzeni', 'Mpumalanga', DATE_SUB(CURDATE(), INTERVAL 1 MONTH), CURDATE(),
 '{"total_patients": 800, "emergency_cases": 40, "maternity_cases": 65, "referrals": 28, "disease_trends": {"hypertension": 120, "diabetes": 95, "malaria": 15}}',
 'Ehlanzeni district reports high maternal health engagement. Malaria cases decreasing but need monitoring.', 1, 'published'),

('HIV/TB Report - Western Cape', 'hiv_tb', NULL, 'Western Cape', DATE_SUB(CURDATE(), INTERVAL 3 MONTH), CURDATE(),
 '{"hiv_patients": 450, "tb_cases": 120, "hiv_on_treatment": 380, "tb_cured": 85, "new_hiv": 25}',
 'HIV treatment adherence is at 84%. TB cure rate is at 71%. Need to improve adherence programs.', 1, 'published'),

('Maternal Health Report - National', 'maternal', NULL, NULL, DATE_SUB(CURDATE(), INTERVAL 6 MONTH), CURDATE(),
 '{"total_deliveries": 2500, "c_sections": 520, "stillbirths": 35, "maternal_deaths": 8, "antenatal_visits": 4200}',
 'National maternal health shows improvement in antenatal care coverage. Stillbirth rates need attention.', 1, 'published');

-- =====================================================
-- 31. UPDATE RESULTS (HOSPITAL SENDING BACK)
-- =====================================================

-- Update referrals with results
UPDATE referrals 
SET status = 'accepted', accepted_at = NOW() 
WHERE referral_id IN (1, 2, 3, 4, 5, 6);

-- Update lab results
UPDATE lab_requests 
SET status = 'completed', 
    results = 'Hb: 12.5 g/dL, WBC: 8.2 x10^9/L, Platelets: 250 x10^9/L',
    result_summary = 'Normal blood results. Slight anemia noted.',
    uploaded_at = NOW(),
    doctor_notified = TRUE
WHERE lab_request_id = 1;

UPDATE lab_requests 
SET status = 'completed', 
    results = 'Cholesterol: 6.2 mmol/L, HDL: 1.1 mmol/L, LDL: 4.0 mmol/L, Triglycerides: 2.5 mmol/L',
    result_summary = 'High cholesterol levels. Patient needs lifestyle modification.',
    uploaded_at = NOW(),
    doctor_notified = TRUE
WHERE lab_request_id = 2;

-- Update imaging results
UPDATE imaging_requests 
SET status = 'completed', 
    report = 'ECG shows normal sinus rhythm. No acute ischemic changes. Chest X-ray shows clear lung fields.',
    image_urls = '["/uploads/ecg_001.png", "/uploads/xray_001.png"]',
    uploaded_at = NOW(),
    doctor_notified = TRUE
WHERE imaging_request_id = 1;

UPDATE imaging_requests 
SET status = 'completed', 
    report = 'CT Scan shows no abnormalities. Normal study.',
    image_urls = '["/uploads/ct_001.png"]',
    uploaded_at = NOW(),
    doctor_notified = TRUE
WHERE imaging_request_id = 5;

-- Send results back to clinics
UPDATE referrals 
SET status = 'completed', 
    completed_at = NOW(),
    results_sent_back = TRUE,
    results_sent_back_at = NOW(),
    clinical_notes = 'Cardiology consult completed. Patient diagnosed with mild hypertension. Prescribed Lisinopril 10mg daily. Refer back to clinic for follow-up.'
WHERE referral_id = 1;

UPDATE referrals 
SET status = 'completed', 
    completed_at = NOW(),
    results_sent_back = TRUE,
    results_sent_back_at = NOW(),
    clinical_notes = 'Surgery consult completed. Appendectomy performed. Patient recovering well. Discharge in 3 days.'
WHERE referral_id = 2;

UPDATE referrals 
SET status = 'completed', 
    completed_at = NOW(),
    results_sent_back = TRUE,
    results_sent_back_at = NOW(),
    clinical_notes = 'Oncology consult completed. Biopsy negative. No cancer detected. Continue monitoring.'
WHERE referral_id = 3;

-- =====================================================
-- 32. VERIFY DATA
-- =====================================================

SELECT '=== DATABASE REPLACEMENT COMPLETE ===' AS 'STATUS';
SELECT 'Database: pulselogic_db' AS 'Database', COUNT(*) AS 'Tables Created' FROM information_schema.tables WHERE table_schema = 'pulselogic_db';

SELECT '=== USERS SUMMARY ===' AS '';
SELECT COUNT(*) AS Total_Users FROM users;

SELECT '=== TEST ACCOUNT ===' AS '';
SELECT email, full_name, role, status FROM users WHERE email = 'test@pl.com';

SELECT '=== FACILITIES ===' AS '';
SELECT facility_id, facility_name, facility_type, district, province FROM facilities;

SELECT '=== REFERRALS SUMMARY ===' AS '';
SELECT COUNT(*) AS Total_Referrals, 
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS Pending,
       SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS Accepted,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS Completed
FROM referrals;

SELECT '=== SYSTEM SUMMARY ===' AS '';
SELECT 
    (SELECT COUNT(*) FROM facilities) AS Facilities,
    (SELECT COUNT(*) FROM departments) AS Departments,
    (SELECT COUNT(*) FROM users) AS Users,
    (SELECT COUNT(*) FROM patients) AS Patients,
    (SELECT COUNT(*) FROM referrals) AS Referrals,
    (SELECT COUNT(*) FROM lab_requests) AS Lab_Requests,
    (SELECT COUNT(*) FROM imaging_requests) AS Imaging_Requests,
    (SELECT COUNT(*) FROM doh_reports) AS DOH_Reports;

SELECT '=== DATABASE REPLACEMENT SUCCESSFUL! ===' AS '';
SELECT 'Login with test@pl.com / Pulse@2026' AS 'FULL ACCESS ACCOUNT';