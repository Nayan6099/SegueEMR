require('dotenv').config();
const { Client } = require('pg');

async function alterTables() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    try {
        await client.query('ALTER TABLE "LabOrder" ADD COLUMN "assignedLabId" text;');
        console.log('Added assignedLabId to LabOrder');
    } catch (e) {
        console.log('LabOrder column might already exist:', e.message);
    }
    
    try {
        await client.query('ALTER TABLE "Prescription" ADD COLUMN "assignedPharmacyId" text;');
        console.log('Added assignedPharmacyId to Prescription');
    } catch (e) {
        console.log('Prescription column might already exist:', e.message);
    }
    
    await client.end();
}

alterTables().catch(console.error);
