const db = require('../src/config/db');

async function check() {
  try {
    const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("Tables in database:", res.rows.map(r => r.table_name));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
check();
