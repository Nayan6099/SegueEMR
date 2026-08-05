-- Adds the tables intakeController.js and patientPortalController.js
-- query via raw SQL (src/config/db.js) but that were only ever defined
-- in the unused src/models/schemas.sql, never in a real migration.
-- FK targets fixed to match actual table names/casing (patients,
-- doctors, users are lowercase per the FHIR remodel migration;
-- Appointment and Prescription remain capitalized/unmapped, so those
-- two references are kept as plain columns without a hard FK).

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
    code VARCHAR(30),
    description VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    onset_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medication_refills (
    id VARCHAR(100) PRIMARY KEY,
    prescription_id VARCHAR(100),
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
    appointment_id VARCHAR(100),
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
    vitals JSONB DEFAULT '{}'::jsonb,
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

CREATE INDEX IF NOT EXISTS idx_allergies_patient ON allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_problems_patient ON problems(patient_id);
CREATE INDEX IF NOT EXISTS idx_refills_presc ON medication_refills(prescription_id);
CREATE INDEX IF NOT EXISTS idx_forms_patient ON patient_forms(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_apikeys_hash ON patient_api_keys(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_intakes_patient ON patient_intakes(patient_id);
CREATE INDEX IF NOT EXISTS idx_intakes_doctor ON patient_intakes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_intakes_status ON patient_intakes(status);
CREATE INDEX IF NOT EXISTS idx_intakes_audit ON patient_intake_audit_logs(intake_id);
