require('dotenv').config();
const { Client } = require('pg');

async function createRecallsTable() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS recalls (
                id text PRIMARY KEY,
                patient_id text NOT NULL,
                patient_name text NOT NULL,
                doctor_id text NOT NULL,
                reason text NOT NULL,
                due_date timestamp(3) without time zone NOT NULL,
                status text NOT NULL DEFAULT 'pending',
                notes text,
                created_at timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created recalls table successfully.');
    } catch (e) {
        console.error('Error creating recalls table:', e.message);
    }
    
    await client.end();
}

createRecallsTable().catch(console.error);
