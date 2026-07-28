const db = require('../config/db');
const { generateId } = require('../utils/idGenerator');
const dataverseService = require('../services/dataverseService');

class IntakeController {
  async createIntake(req, res) {
    try {
      // 1. DEMO AUTO-HEALER: Ensure tables exist before inserting
      await db.query(`
        CREATE TABLE IF NOT EXISTS patient_intakes (
            id VARCHAR(50) PRIMARY KEY,
            patient_id VARCHAR(50),
            doctor_id VARCHAR(50),
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
            reason_for_visit TEXT,
            symptoms TEXT,
            medical_history TEXT,
            allergies TEXT,
            medications TEXT,
            vitals JSONB,
            status VARCHAR(50) DEFAULT 'checked_in',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS patient_intake_audit_logs (
            id SERIAL PRIMARY KEY,
            intake_id VARCHAR(50),
            changed_by VARCHAR(50),
            old_values JSONB,
            new_values JSONB,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Extract Body Data
      const {
        patientId, name, dateOfBirth, gender, maritalStatus, contactPhone,
        contactEmail, emergencyContact, employerDetails, insuranceProvider,
        insurancePolicyNumber, preferredLanguage, ethnicity, hipaaConsent,
        doctorId, reasonForVisit, symptoms, medicalHistory, allergies, medications, vitals
      } = req.body;

      let finalPatientId = patientId;
      if (req.user && req.user.role === 'patient') {
        finalPatientId = req.user.patientId;
      }

      // FIX: Use a default fallback date to satisfy PostgreSQL's NOT NULL constraint
      const validDob = (dateOfBirth && dateOfBirth.trim() !== '') ? dateOfBirth : '1970-01-01';

      // 4. Patient Registration Logic
      let patientCheck = { rows: [] };
      if (finalPatientId) {
        patientCheck = await db.query('SELECT * FROM patients WHERE id = $1', [finalPatientId]);
      }

      if (patientCheck.rows.length === 0 && name) {
        let duplicateCheck = { rows: [] };
        if (validDob) {
          duplicateCheck = await db.query(
            'SELECT * FROM patients WHERE name = $1 AND date_of_birth = $2',
            [name, validDob]
          );
        }

        if (duplicateCheck.rows.length > 0) {
          finalPatientId = duplicateCheck.rows[0].id;
        } else {
          if (!finalPatientId) finalPatientId = generateId('PAT');

          await db.query(
            'INSERT INTO patients (id, name, date_of_birth, gender, contact_info) VALUES ($1, $2, $3, $4, $5)',
            [finalPatientId, name, validDob, gender || null, contactPhone || contactEmail || null]
          );

          // 5. Keep Prisma Synced (Critical for Demo)
          const prisma = require('../config/prisma');
          try {
            await prisma.patient.create({
              data: {
                id: finalPatientId,
                name: name.trim(),
                dateOfBirth: validDob ? new Date(validDob) : new Date('1970-01-01'),
                gender: gender || 'Unknown',
                contactInfo: contactPhone || contactEmail || null
              }
            });
          } catch (err) {
            console.error("Prisma sync patient error in createIntake:", err.message);
          }

          if (dataverseService && dataverseService.syncPatientToDataverse) {
            dataverseService.syncPatientToDataverse({
              id: finalPatientId,
              name: name,
              dateOfBirth: validDob ? new Date(validDob) : null,
              gender: gender || 'Other',
              phone: contactPhone || contactEmail || null
            }).catch(e => console.error('Dataverse sync patient error:', e.message));
          }
        }
      }

      // 6. Insert Intake
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
          reasonForVisit || 'General Consultation',
          symptoms || null,
          medicalHistory || null,
          allergies || null,
          medications || null,
          JSON.stringify(vitals || {}),
          'checked_in'
        ]
      );

      return res.json({
        success: true,
        message: 'Patient checked in and intake details logged.',
        data: { intakeId, patientId: finalPatientId }
      });
    } catch (err) {
      console.error('[DB Error in createIntake]:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async getIntakes(req, res) {
    try {
      // 1. DEMO AUTO-HEALER: Ensure tables exist before querying
      await db.query(`
        CREATE TABLE IF NOT EXISTS patient_intakes (
            id VARCHAR(50) PRIMARY KEY,
            patient_id VARCHAR(50),
            doctor_id VARCHAR(50),
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
            reason_for_visit TEXT,
            symptoms TEXT,
            medical_history TEXT,
            allergies TEXT,
            medications TEXT,
            vitals JSONB,
            status VARCHAR(50) DEFAULT 'checked_in',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const { doctorId } = req.query;

      // FIX: Removed fragile JOINs to users/doctors to prevent demo database crashes
      let query = `
        SELECT itk.*, p.name as patient_name, p.date_of_birth, p.gender
        FROM patient_intakes itk
        JOIN patients p ON itk.patient_id = p.id
      `;

      const params = [];
      let finalDoctorId = doctorId;

      if (req.user && req.user.role === 'doctor') {
        finalDoctorId = req.user.doctorId || req.user.userId;
      }

      if (finalDoctorId) {
        query += ' WHERE itk.doctor_id = $1';
        params.push(finalDoctorId);
      }

      query += ' ORDER BY itk.created_at DESC';

      const result = await db.query(query, params);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      console.error('[DB Error in getIntakes]:', err.message);
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
      // FIX: Strip changedBy out of the body so it doesn't break the SQL columns
      const { changedBy: bodyChangedBy, ...updatedFields } = req.body;
      const changedBy = bodyChangedBy || req.user.userId;

      const currentIntake = await db.query('SELECT * FROM patient_intakes WHERE id = $1', [id]);
      if (currentIntake.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Intake record not found' });
      }

      const oldValues = currentIntake.rows[0];
      const newValues = { ...oldValues, ...updatedFields };
      if (updatedFields.vitals) {
        newValues.vitals = JSON.stringify(updatedFields.vitals);
      }

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

      await db.query(
        'INSERT INTO patient_intake_audit_logs (intake_id, changed_by, old_values, new_values) VALUES ($1, $2, $3, $4)',
        [id, changedBy, JSON.stringify(oldValues), JSON.stringify(newValues)]
      );

      return res.json({ success: true, message: 'Intake record updated and audited.' });
    } catch (err) {
      console.error('[DB Error in updateIntake]:', err.message);
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

  async registerPatient(req, res) {
    try {
      const { name, dateOfBirth, gender, contactPhone, contactEmail } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Patient name is required.' });
      }


      // FIX: Use a default fallback date to satisfy PostgreSQL's NOT NULL constraint
      if (!dateOfBirth || !dateOfBirth.trim()) {
        return res.status(400).json({ success: false, error: 'Date of Birth is strictly required for registration.' });
      }

      const validDob = dateOfBirth.trim();

      if (validDob) {
        const dupCheck = await db.query(
          'SELECT id FROM patients WHERE LOWER(name) = LOWER($1) AND date_of_birth = $2',
          [name.trim(), validDob]
        );
        if (dupCheck.rows.length > 0) {
          return res.json({
            success: true,
            existing: true,
            data: { id: dupCheck.rows[0].id, name: name.trim() }
          });
        }
      }

      let patientId;
      let collision = true;
      while (collision) {
        patientId = generateId('PAT');
        const collisionCheck = await db.query('SELECT id FROM patients WHERE id = $1', [patientId]);
        collision = collisionCheck.rows.length > 0;
      }

      await db.query(
        'INSERT INTO patients (id, name, date_of_birth, gender, contact_info) VALUES ($1, $2, $3, $4, $5)',
        [patientId, name.trim(), validDob, gender || null, contactPhone || contactEmail || null]
      );

      const prisma = require('../config/prisma');
      try {
        await prisma.patient.create({
          data: {
            id: patientId,
            name: name.trim(),
            dateOfBirth: validDob ? new Date(validDob) : new Date('1970-01-01'),
            gender: gender || 'Unknown',
            contactInfo: contactPhone || contactEmail || null
          }
        });
      } catch (err) {
        console.error("Prisma sync patient error:", err.message);
      }

      if (dataverseService && dataverseService.syncPatientToDataverse) {
        dataverseService.syncPatientToDataverse({
          id: patientId,
          name: name.trim(),
          dateOfBirth: validDob ? new Date(validDob) : null,
          gender: gender || 'Other',
          phone: contactPhone || contactEmail || null
        }).catch(e => console.error('Dataverse sync patient error:', e.message));
      }

      return res.status(201).json({
        success: true,
        existing: false,
        data: { id: patientId, name: name.trim() }
      });
    } catch (err) {
      console.error('[DB Error in registerPatient]:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async searchPatients(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 1) {
        return res.json({ success: true, data: [] });
      }

      const result = await db.query(
        `SELECT id, name FROM patients WHERE LOWER(name) ILIKE $1 ORDER BY name ASC LIMIT 20`,
        [`%${q.trim().toLowerCase()}%`]
      );

      return res.json({
        success: true,
        data: result.rows.map(r => ({ id: r.id, name: r.name }))
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new IntakeController();