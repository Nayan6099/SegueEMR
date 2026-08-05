const db = require('../config/db');
const prisma = require('../config/prisma');
const { generateId } = require('../utils/idGenerator');
const crypto = require('crypto');


class PatientPortalController {
  
  // --- Allergies ---
  async getAllergies(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.query.patientId;
      const result = await db.query('SELECT * FROM allergies WHERE patient_id = $1', [patientId]);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async addAllergy(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.body.patientId;
      const { allergen, severity, reaction } = req.body;
      const id = generateId('ALG');
      await db.query(
        'INSERT INTO allergies (id, patient_id, allergen, severity, reaction) VALUES ($1, $2, $3, $4, $5)',
        [id, patientId, allergen, severity, reaction]
      );
      return res.json({ success: true, message: 'Allergy added successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Medical Problems / Conditions ---
  async getProblems(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.query.patientId;
      const result = await db.query('SELECT * FROM problems WHERE patient_id = $1', [patientId]);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async addProblem(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.body.patientId;
      const { code, description, onsetDate } = req.body;
      const id = generateId('PRB');
      await db.query(
        'INSERT INTO problems (id, patient_id, code, description, onset_date) VALUES ($1, $2, $3, $4, $5)',
        [id, patientId, code, description, onsetDate]
      );
      return res.json({ success: true, message: 'Problem added successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Medication Refills ---
  async listRefillRequests(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.query.patientId;
      const query = `
        SELECT mr.*, 
          (SELECT string_agg(m.name, ', ') FROM "Medication" m WHERE m."prescriptionId" = p.id) as medication_details
        FROM medication_refills mr
        JOIN "Prescription" p ON mr.prescription_id = p.id
        WHERE p."patientId" = $1
      `;
      const result = await db.query(query, [patientId]);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async requestRefill(req, res) {
    try {
      const { prescriptionId, notes } = req.body;
      const id = generateId('RFL');
      await db.query(
        'INSERT INTO medication_refills (id, prescription_id, notes, status) VALUES ($1, $2, $3, $4)',
        [id, prescriptionId, notes, 'pending']
      );
      return res.json({ success: true, message: 'Refill request submitted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Intake Forms ---
  async getPatientForms(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.query.patientId;
      const result = await db.query('SELECT * FROM patient_forms WHERE patient_id = $1', [patientId]);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async submitPatientForm(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.body.patientId;
      const { formType, formData } = req.body;
      const id = generateId('FRM');
      await db.query(
        'INSERT INTO patient_forms (id, patient_id, form_type, form_data, status, submitted_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [id, patientId, formType, JSON.stringify(formData), 'submitted']
      );
      return res.json({ success: true, message: 'Form submitted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Secure Messaging (Chat) ---
  async getMessages(req, res) {
    try {
      const userId = req.user.patientId || req.user.userId;
      const { otherId } = req.query;
      const query = `
        SELECT * FROM messages 
        WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY sent_at ASC
      `;
      const result = await db.query(query, [userId, otherId]);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const senderId = req.user.patientId || req.user.userId;
      const { receiverId, content } = req.body;
      const id = generateId('MSG');
      await db.query(
        'INSERT INTO messages (id, sender_id, receiver_id, content) VALUES ($1, $2, $3, $4)',
        [id, senderId, receiverId, content]
      );

      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      if (io && connectedUsers && connectedUsers.has(receiverId)) {
        io.to(connectedUsers.get(receiverId)).emit('receive_message', {
          id, sender_id: senderId, receiver_id: receiverId, content, sentAt: new Date(), isRead: false
        });
      }

      return res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async readMessages(req, res) {
    try {
      const currentUserId = req.user.patientId || req.user.userId;
      const { otherId } = req.body;
      
      if (!otherId) {
        return res.status(400).json({ success: false, error: 'otherId is required' });
      }

      await db.query(
        'UPDATE messages SET is_read = true, read_at = NOW() WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false',
        [currentUserId, otherId]
      );

      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      if (io && connectedUsers && connectedUsers.has(otherId)) {
        io.to(connectedUsers.get(otherId)).emit('messages_read', {
          readerId: currentUserId
        });
      }

      return res.json({ success: true, message: 'Messages marked as read' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Third-Party Integration API Keys ---
  async getApiKeys(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.query.patientId;
      const result = await db.query('SELECT id, name, status, expires_at, created_at FROM patient_api_keys WHERE patient_id = $1', [patientId]);
      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async generateApiKey(req, res) {
    try {
      const { keyName, durationDays = 30 } = req.body;
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.body.patientId;
      const rawKey = `sdk_pat_${crypto.randomBytes(24).toString('hex')}`;
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      const id = generateId('KEY');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      await db.query(
        'INSERT INTO patient_api_keys (id, patient_id, api_key_hash, name, expires_at) VALUES ($1, $2, $3, $4, $5)',
        [id, patientId, keyHash, keyName, expiresAt]
      );

      return res.json({
        success: true,
        data: {
          apiKey: rawKey,
          expiresAt: expiresAt.toISOString(),
          message: 'Copy this API Key now. It will not be shown again.'
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- CCDA XML Import / Export ---
  async exportCCDA(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.params.patientId;

      // Fetch patient, EMRs, allergies, and problems
      const patient = await db.query('SELECT * FROM patients WHERE id = $1', [patientId]);
      if (patient.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }

      const [allergies, problems, meds] = await Promise.all([
        db.query('SELECT * FROM allergies WHERE patient_id = $1', [patientId]),
        db.query('SELECT * FROM problems WHERE patient_id = $1', [patientId]),
        db.query('SELECT * FROM prescriptions WHERE patient_id = $1', [patientId])
      ]);

      // Lightweight CCDA XML builder representation
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <realmCode code="US"/>
  <title>Continuity of Care Document (CCD)</title>
  <recordTarget>
    <patientRole>
      <id extension="${patientId}" root="2.16.840.1.113883.4.1"/>
      <patient>
        <name>
          <given>Patient</given>
          <family>${patientId}</family>
        </name>
        <administrativeGenderCode code="${patient.rows[0].gender === 'Male' ? 'M' : 'F'}"/>
        <birthTime value="${new Date(patient.rows[0].date_of_birth).toISOString().split('T')[0].replace(/-/g, '')}"/>
      </patient>
    </patientRole>
  </recordTarget>
  <component>
    <structuredBody>
      <!-- Allergies Section -->
      <section>
        <title>Allergies and Adverse Reactions</title>
        <text>
          ${allergies.rows.map(a => `<paragraph>${a.allergen} (Severity: ${a.severity}) - Reaction: ${a.reaction}</paragraph>`).join('\n          ')}
        </text>
      </section>
      <!-- Problems Section -->
      <section>
        <title>Active Problems</title>
        <text>
          ${problems.rows.map(p => `<paragraph>${p.description} (ICD-10: ${p.code || 'N/A'}) - Onset: ${p.onset_date}</paragraph>`).join('\n          ')}
        </text>
      </section>
    </structuredBody>
  </component>
</ClinicalDocument>`;

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="ccda_${patientId}.xml"`);
      return res.send(xml);
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async importCCDA(req, res) {
    try {
      const patientId = req.user.role === 'patient' ? req.user.patientId : req.body.patientId;
      const xmlContent = req.file?.buffer.toString('utf-8');

      if (!xmlContent) {
        return res.status(400).json({ success: false, error: 'No XML file provided' });
      }

      // Simple regex parser to extract structured paragraphs from CCDA Sections
      const allergyRegex = /<paragraph>([^<]+)<\/paragraph>/g;
      let match;
      const items = [];
      while ((match = allergyRegex.exec(xmlContent)) !== null) {
        items.push(match[1]);
      }

      // Parse and save parsed allergy details
      for (const item of items) {
        const id = generateId('ALG');
        await db.query(
          'INSERT INTO allergies (id, patient_id, allergen, severity, reaction) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
          [id, patientId, item.split(' ')[0], 'mild', 'CCDA Imported']
        );
      }

      return res.json({ success: true, message: `CCDA Document parsed successfully. Imported ${items.length} items.` });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
    // --- Lab Reports (Patient) ---
    async getLabReports(req, res) {
        try {
            const patientId = req.user.role === 'patient' ? req.user.patientId : req.user.patientId;
            const labOrders = await db.query(
                `SELECT lo.id, lo.testName, lo.resultSummary, d.name as doctorName, lo.createdAt
                 FROM "LabOrder" lo
                 LEFT JOIN "Doctor" d ON lo.doctorId = d.id
                 WHERE lo.patientId = $1 AND lo.status = 'completed'`,
                [patientId]
            );
            return res.json({ success: true, data: labOrders.rows });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    }

  // --- Portal Permissions / Settings ---

  /**
   * GET /api/portal/settings
   * Returns the patient's portal permission flags (currently: allowSelfEntry).
   * The value is read live from the patients table via Prisma.
   */
  async getPortalSettings(req, res) {
    try {
      const patientId = req.user.patientId || req.user.userId;
      if (!patientId) {
        return res.status(400).json({ success: false, error: 'patientId not found in token' });
      }

      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { allowSelfEntry: true },
      });

      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient record not found' });
      }

      return res.json({
        success: true,
        data: {
          allowSelfEntry: patient.allowSelfEntry,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/portal/settings
   * Staff-only: update the patient's portal permission flags.
   * Body: { patientId: string, allowSelfEntry: boolean }
   */
  async updatePortalSettings(req, res) {
    try {
      const { patientId, allowSelfEntry } = req.body;

      if (!patientId) {
        return res.status(400).json({ success: false, error: 'patientId is required' });
      }

      if (typeof allowSelfEntry !== 'boolean') {
        return res.status(400).json({ success: false, error: 'allowSelfEntry must be a boolean' });
      }

      const updated = await prisma.patient.update({
        where: { id: patientId },
        data: { allowSelfEntry },
        select: { id: true, allowSelfEntry: true },
      });

      return res.json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  /**
   * PATCH /api/patient/forms/:id/status
   * Staff-only: approve or deny a record request (or any patient form).
   * Body: { status: 'approved' | 'denied' | 'pending', notes? }
   */
  async updateFormStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const VALID = new Set(['pending', 'approved', 'denied', 'submitted']);
      if (!status || !VALID.has(status)) {
        return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${[...VALID].join(', ')}.` });
      }

      const existing = await db.query('SELECT id FROM patient_forms WHERE id = $1', [id]);
      if (!existing.rows.length) {
        return res.status(404).json({ success: false, error: 'Form not found.' });
      }

      await db.query(
        'UPDATE patient_forms SET status = $1 WHERE id = $2',
        [status, id]
      );

      return res.json({ success: true, message: `Form status updated to '${status}'.` });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}



    module.exports = new PatientPortalController();

