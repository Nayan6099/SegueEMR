const db = require('./src/config/db');

async function testQuery() {
  try {
    console.log("Creating table...");
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
    console.log("Table created.");
    
    const res = await db.query('SELECT * FROM patient_intakes');
    console.log("Select result:", res.rows);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit();
}

testQuery();
