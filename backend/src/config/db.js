const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/segueemr_db'
});

module.exports = {
  query: async (text, params) => {
    return pool.query(text, params);
  },
  pool,
};
