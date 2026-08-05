const db = require('./src/config/db');
async function run() {
  try {
    console.log('Testing db.query...');
    await db.query(
      'INSERT INTO patients (id, name, date_of_birth, gender, contact_info, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
      ['test-id-999', 'Test Name', '1990-01-01', 'Male', '123']
    );
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}
run();
