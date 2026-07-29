const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applySchemas() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to the database.');

    const sqlFilePath = path.join(__dirname, 'src', 'models', 'schemas.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing schema script...');
    await client.query(sqlScript);
    console.log('Successfully created all missing tables and constraints!');

  } catch (err) {
    console.error('Error applying schemas:', err.message);
  } finally {
    await client.end();
  }
}

applySchemas();
