const db = require('../config/db');
const { generateId } = require('../utils/idGenerator');

class IntakeController {
  async createIntake(req, res) {
    try {
      const {
        patientId,
        name,
        dateOfBirth,
        gender,
        maritalStatus,
        contactPhone,
        contactEmail,
        emergencyContact,
        employerDetails,
        insuranceProvider,
        insurancePolicyNumber,
        preferredLanguage,
        ethnicity,
        hipaaConsent,
        doctorId,
        reasonForVisit,
        symptoms,
        medicalHistory,
        allergies,
        medications,
        vitals
      } = req.body;

      let finalPatientId = patientId;

      // 1. Prevent duplicate patients
      // Check if patient exists by ID
      let patientCheck = await db.query('SELECT * FROM patients WHERE id = $1', [finalPatientId]);

      // If ID not provided or doesn't exist, check by Name and Date of Birth
      if (patientCheck.rows.length === 0) {
        const duplicateCheck = await db.query(
          'SELECT * FROM patients WHERE name = $1 AND date_of_birth = $2',
          [name, dateOfBirth]
        );

        if (duplicateCheck.rows.length > 0) {
          finalPatientId = duplicateCheck.rows[0].id;
        } else {
          // Register a new patient
          if (!finalPatientId) {
            finalPatientId = generateId('PAT');
          }
          await db.query(
            'INSERT INTO patients (id, name, date_of_birth, gender, contact_info) VALUES ($1, $2, $3, $4, $5)',
            [finalPatientId, name, dateOfBirth, gender, contactPhone]
          );
        }
      }

      const intakeId = generateId('ITK');
      await db.query(
        `INSERT INTO patient_intakes (
          id, patient_id, doctor_id, marital_status, contact_phone, contact_email,
          emergency_contact, employer_details, insurance_provider, insurance_policy_number,
          preferred_language, ethnicity, hipaa_consent, reason_for_visit, symptoms,
          medical_history, allergies, medications, vitals, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          intakeId,
          finalPatientId,
          doctorId || null,
          maritalStatus || null,
          contactPhone || null,
          contactEmail || null,
          emergencyContact || null,
          employerDetails || null,
          insuranceProvider || null,
          insurancePolicyNumber || null,
          preferredLanguage || null,
          ethnicity || null,
          hipaaConsent || false,
          reasonForVisit,
          symptoms || null,
          medicalHistory || null,
          allergies || null,
          medications || null,
          JSON.stringify(vitals || {}),
          'checked_in'
        ]
      );

      return res.json({ success: true, message: 'Patient checked in and intake details logged.', data: { intakeId, patientId: finalPatientId } });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getIntakes(req, res) {
    try {
      const { doctorId } = req.query;
      let query = `
        SELECT itk.*, p.name as patient_name, p.date_of_birth, p.gender, d.name as doctor_name
        FROM patient_intakes itk
        JOIN patients p ON itk.patient_id = p.id
        LEFT JOIN doctors d ON itk.doctor_id = d.id
      `;
      const params = [];
      if (doctorId) {
        query += ' WHERE itk.doctor_id = $1';
        params.push(doctorId);
      }
      query += ' ORDER BY itk.created_at DESC';
      const result = await db.query(query, params);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async updateIntakeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE patient_intakes SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
      return res.json({ success: true, message: `Intake status updated to ${status}.` });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async updateIntake(req, res) {
    try {
      const { id } = req.params;
      const { changedBy, ...updatedFields } = req.body;

      const currentIntake = await db.query('SELECT * FROM patient_intakes WHERE id = $1', [id]);
      if (currentIntake.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Intake record not found' });
      }

      const oldValues = currentIntake.rows[0];
      const newValues = { ...oldValues, ...updatedFields, vitals: JSON.stringify(updatedFields.vitals || oldValues.vitals) };

      // Build dynamic SQL Update query
      const keys = Object.keys(updatedFields);
      if (keys.length === 0) {
        return res.json({ success: true, message: 'No changes detected.' });
      }

      const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
      const values = keys.map(key => key === 'vitals' ? JSON.stringify(updatedFields[key]) : updatedFields[key]);

      await db.query(
        `UPDATE patient_intakes SET ${setClause}, updated_at = NOW() WHERE id = $1`,
        [id, ...values]
      );

      // Audit log the changes
      await db.query(
        'INSERT INTO patient_intake_audit_logs (intake_id, changed_by, old_values, new_values) VALUES ($1, $2, $3, $4)',
        [id, changedBy, JSON.stringify(oldValues), JSON.stringify(newValues)]
      );

      return res.json({ success: true, message: 'Intake record updated and audited.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getAuditHistory(req, res) {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT * FROM patient_intake_audit_logs WHERE intake_id = $1 ORDER BY changed_at DESC',
        [id]
      );
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new IntakeController();
