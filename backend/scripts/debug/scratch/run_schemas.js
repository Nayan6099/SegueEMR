const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

async function run() {
  try {
    const sqlPath = path.join(__dirname, '../src/models/schemas.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing schemas.sql...');
    // We can execute the whole SQL block
    await db.query(sql);
    console.log('✓ schemas.sql executed successfully.');
  } catch (err) {
    console.error('Error executing schemas.sql:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
