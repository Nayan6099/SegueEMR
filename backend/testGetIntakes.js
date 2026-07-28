const db = require('./src/config/db');

async function testGetIntakes() {
  try {
      let query = `
        SELECT itk.*, p.name as patient_name, p.date_of_birth, p.gender
        FROM patient_intakes itk
        JOIN patients p ON itk.patient_id = p.id
      `;
      const result = await db.query(query, []);
      console.log("Success:", result.rows.length);
  } catch (err) {
      console.error("[DB Error in getIntakes]:", err.message);
  }
  process.exit();
}

testGetIntakes();
