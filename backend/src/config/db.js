const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/segueemr_db'
});

let fallbackToMemory = false;

const memoryTables = {
  patients: [],
  patient_intakes: [],
  patient_intake_audit_logs: [],
  allergies: [],
  problems: [],
  refill_requests: [],
  patient_forms: [],
  patient_messages: [],
  patient_api_keys: [],
  doctors: [
    { id: 'dr.smith', name: 'Dr. Smith' },
    { id: 'dr.jones', name: 'Dr. Jones' }
  ]
};

const queryMemoryDb = (text, params = []) => {
  const queryText = text.trim().toLowerCase().replace(/\s+/g, ' ');
  
  if (queryText.includes('select now()')) {
    return { rows: [{ now: new Date() }] };
  }

  // Activity Logs insert
  if (queryText.includes('insert into activity_logs') || queryText.includes('activity_logs')) {
    return { rows: [] };
  }

  // Allergies
  if (queryText.includes('from allergies')) {
    const patientId = params[0];
    const match = memoryTables.allergies.filter(a => a.patient_id === patientId);
    return { rows: match };
  }
  if (queryText.includes('insert into allergies')) {
    const [patientId, allergen, severity, reaction] = params;
    const item = { id: Math.random().toString(), patient_id: patientId, allergen, severity, reaction, created_at: new Date() };
    memoryTables.allergies.push(item);
    return { rows: [item] };
  }

  // Problems
  if (queryText.includes('from problems')) {
    const patientId = params[0];
    const match = memoryTables.problems.filter(p => p.patient_id === patientId);
    return { rows: match };
  }
  if (queryText.includes('insert into problems')) {
    const [patientId, problemName, status, onsetDate] = params;
    const item = { id: Math.random().toString(), patient_id: patientId, problem_name: problemName, status, onset_date: onsetDate, created_at: new Date() };
    memoryTables.problems.push(item);
    return { rows: [item] };
  }

  // Refill requests
  if (queryText.includes('patient_refills') || queryText.includes('from refill') || queryText.includes('from patient_refills') || queryText.includes('refill_requests')) {
    const patientId = params[0];
    const match = memoryTables.refill_requests.filter(r => r.patient_id === patientId);
    return { rows: match };
  }
  if (queryText.includes('insert into patient_refills') || queryText.includes('insert into refill_requests')) {
    const [patientId, rxId, medicationName, status] = params;
    const item = { id: Math.random().toString(), patient_id: patientId, prescription_id: rxId, medication_name: medicationName, status, created_at: new Date() };
    memoryTables.refill_requests.push(item);
    return { rows: [item] };
  }

  // Patient Forms
  if (queryText.includes('from patient_forms')) {
    const patientId = params[0];
    const match = memoryTables.patient_forms.filter(f => f.patient_id === patientId);
    return { rows: match };
  }
  if (queryText.includes('insert into patient_forms')) {
    const [patientId, formType, formData] = params;
    const item = { id: Math.random().toString(), patient_id: patientId, form_type: formType, form_data: formData, created_at: new Date() };
    memoryTables.patient_forms.push(item);
    return { rows: [item] };
  }

  // Messages
  if (queryText.includes('from patient_messages') || queryText.includes('patient_messages')) {
    const [userId, otherId] = params;
    const match = memoryTables.patient_messages.filter(
      m => (m.sender_id === userId && m.receiver_id === otherId) || (m.sender_id === otherId && m.receiver_id === userId)
    );
    return { rows: match };
  }
  if (queryText.includes('insert into patient_messages')) {
    const [senderId, receiverId, messageText] = params;
    const item = { id: Math.random().toString(), sender_id: senderId, receiver_id: receiverId, message_text: messageText, created_at: new Date() };
    memoryTables.patient_messages.push(item);
    return { rows: [item] };
  }

  // API Keys
  if (queryText.includes('from patient_api_keys')) {
    const patientId = params[0];
    const match = memoryTables.patient_api_keys.filter(k => k.patient_id === patientId);
    return { rows: match };
  }
  if (queryText.includes('insert into patient_api_keys')) {
    const [patientId, keyName, apiKey, status, expiresAt] = params;
    const item = { id: Math.random().toString(), patient_id: patientId, name: keyName, api_key: apiKey, status, expires_at: expiresAt, created_at: new Date() };
    memoryTables.patient_api_keys.push(item);
    return { rows: [item] };
  }

  // Patients
  if (queryText.includes('from patients')) {
    const id = params[0];
    const match = memoryTables.patients.find(p => p.id === id);
    return { rows: match ? [match] : [] };
  }
  if (queryText.includes('insert into patients')) {
    const [id, name, dob, gender, contact] = params;
    const item = { id, name, date_of_birth: dob, gender, contact_info: contact };
    memoryTables.patients.push(item);
    return { rows: [item] };
  }

  // Intakes
  if (queryText.includes('from patient_intakes')) {
    if (queryText.includes('select itk.*')) {
      const doctorId = params[0];
      let list = memoryTables.patient_intakes.map(itk => {
        const p = memoryTables.patients.find(pat => pat.id === itk.patient_id) || {};
        return {
          ...itk,
          patient_name: p.name || itk.patient_id,
          date_of_birth: p.date_of_birth,
          gender: p.gender,
          doctor_name: 'Dr. Smith'
        };
      });
      if (doctorId) {
        list = list.filter(itk => itk.doctor_id === doctorId);
      }
      return { rows: list };
    }
    const id = params[0];
    const match = memoryTables.patient_intakes.find(i => i.id === id);
    return { rows: match ? [match] : [] };
  }
  if (queryText.includes('insert into patient_intakes')) {
    const [
      id, patient_id, doctor_id, marital_status, contact_phone, contact_email,
      emergency_contact, employer_details, insurance_provider, insurance_policy_number,
      preferred_language, ethnicity, hipaa_consent, reason_for_visit, symptoms,
      medical_history, allergies, medications, vitals, status
    ] = params;
    const item = {
      id, patient_id, doctor_id, marital_status, contact_phone, contact_email,
      emergency_contact, employer_details, insurance_provider, insurance_policy_number,
      preferred_language, ethnicity, hipaa_consent, reason_for_visit, symptoms,
      medical_history, allergies, medications, vitals: typeof vitals === 'string' ? JSON.parse(vitals) : vitals, status,
      created_at: new Date()
    };
    memoryTables.patient_intakes.push(item);
    return { rows: [item] };
  }

  if (queryText.includes('update patient_intakes')) {
    return { rows: [] };
  }

  // Audit Logs
  if (queryText.includes('patient_intake_audit_logs')) {
    const id = params[0];
    const match = memoryTables.patient_intake_audit_logs.filter(l => l.intake_id === id);
    return { rows: match };
  }
  if (queryText.includes('insert into patient_intake_audit_logs')) {
    const [intake_id, changed_by, old_values, new_values] = params;
    const item = {
      intake_id, changed_by,
      old_values: typeof old_values === 'string' ? JSON.parse(old_values) : old_values,
      new_values: typeof new_values === 'string' ? JSON.parse(new_values) : new_values,
      changed_at: new Date()
    };
    memoryTables.patient_intake_audit_logs.push(item);
    return { rows: [item] };
  }

  return { rows: [] };
};

module.exports = {
  query: async (text, params) => {
    if (fallbackToMemory) {
      return queryMemoryDb(text, params);
    }
    try {
      return await pool.query(text, params);
    } catch (err) {
      const msg = err.message || '';
      if (err.code === 'ECONNREFUSED' || msg.includes('connect') || msg.includes('authentication') || msg.includes('password') || msg.includes('auth')) {
        fallbackToMemory = true;
        console.log('⚠️ PostgreSQL unavailable or authentication failed. Falling back to in-memory database mock.');
        return queryMemoryDb(text, params);
      }
      throw err;
    }
  },
  useMemoryDb: () => {
    fallbackToMemory = true;
  },
  pool,
};
