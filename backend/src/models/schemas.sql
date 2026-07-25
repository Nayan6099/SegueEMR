-- PostgreSQL Schema Definitions for SegueEMR
-- Line endings: CRLF (Windows standard)

-- Create custom types for status states if needed, or use constraints
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist', 'admin_staff', 'management')),
    full_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    emergency_contact VARCHAR(200),
    blood_group VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(100) REFERENCES doctors(id) ON DELETE RESTRICT,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'check-in', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emr_records (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(100) REFERENCES doctors(id) ON DELETE SET NULL,
    record_type VARCHAR(50) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL, -- Reference to Azure Blob Storage file
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    encryption_key VARCHAR(255), -- AES key reference (if client-side encrypted)
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(100) REFERENCES doctors(id) ON DELETE SET NULL,
    emr_record_id VARCHAR(100) REFERENCES emr_records(id) ON DELETE SET NULL,
    medication_details TEXT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed')),
    dispensed_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_orders (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(100) REFERENCES doctors(id) ON DELETE SET NULL,
    emr_record_id VARCHAR(100) REFERENCES emr_records(id) ON DELETE SET NULL,
    test_name VARCHAR(150) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ordered' CHECK (status IN ('ordered', 'processing', 'completed')),
    results_url TEXT, -- Reference to Azure Blob Storage lab reports
    processed_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
    generated_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    target_user_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance optimization
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_doctors_user ON doctors(user_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_time);
CREATE INDEX idx_emr_patient ON emr_records(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_action ON activity_logs(action);

CREATE TABLE IF NOT EXISTS allergies (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(150) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    reaction VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problems (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    code VARCHAR(30), -- ICD-10 Code
    description VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    onset_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medication_refills (
    id VARCHAR(100) PRIMARY KEY,
    prescription_id VARCHAR(100) REFERENCES prescriptions(id) ON DELETE CASCADE,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    processed_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_forms (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    form_type VARCHAR(100) NOT NULL,
    form_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(100) PRIMARY KEY,
    sender_id VARCHAR(100) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id VARCHAR(100) REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) DEFAULT 'email' CHECK (reminder_type IN ('email', 'sms')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_api_keys (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    api_key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_allergies_patient ON allergies(patient_id);
CREATE INDEX idx_problems_patient ON problems(patient_id);
CREATE INDEX idx_refills_presc ON medication_refills(prescription_id);
CREATE INDEX idx_forms_patient ON patient_forms(patient_id);
CREATE INDEX idx_messages_chat ON messages(sender_id, receiver_id);
CREATE INDEX idx_reminders_patient ON reminders(patient_id);
CREATE INDEX idx_apikeys_hash ON patient_api_keys(api_key_hash);

CREATE TABLE IF NOT EXISTS patient_intakes (
    id VARCHAR(100) PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(100) REFERENCES doctors(id) ON DELETE SET NULL,
    marital_status VARCHAR(50),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    emergency_contact VARCHAR(255),
    employer_details VARCHAR(255),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    preferred_language VARCHAR(50),
    ethnicity VARCHAR(50),
    hipaa_consent BOOLEAN DEFAULT FALSE,
    reason_for_visit TEXT NOT NULL,
    symptoms TEXT,
    medical_history TEXT,
    allergies TEXT,
    medications TEXT,
    vitals JSONB DEFAULT '{}'::jsonb, -- BP, pulse, temperature, height, weight, bmi, spo2
    status VARCHAR(50) DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'in_consultation', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_intake_audit_logs (
    id SERIAL PRIMARY KEY,
    intake_id VARCHAR(100) REFERENCES patient_intakes(id) ON DELETE CASCADE,
    changed_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    old_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intakes_patient ON patient_intakes(patient_id);
CREATE INDEX idx_intakes_doctor ON patient_intakes(doctor_id);
CREATE INDEX idx_intakes_status ON patient_intakes(status);
CREATE INDEX idx_intakes_audit ON patient_intake_audit_logs(intake_id);
