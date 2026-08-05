-- Migration: 20260803000000_add_patient_portal_permissions
-- Adds allow_self_entry flag to patients table (controls whether patient
-- can self-enter allergies and problems in the Health Snapshot tab).
-- Default FALSE = read-only (matching OpenEMR behaviour); staff must
-- explicitly grant self-entry rights per patient.

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS allow_self_entry BOOLEAN NOT NULL DEFAULT FALSE;
