process.env.DATABASE_URL = "postgresql://neondb_owner:npg_VO6YXZejpU3k@ep-withered-fire-ao8ia92z-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb";
import { initializeDatabase } from './src/models/behavior.model.js';


import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_VO6YXZejpU3k@ep-withered-fire-ao8ia92z-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb",
  ssl: true
});
async function test() {
  try {
    const client = await pool.connect();
    console.log("Success with ssl: true");
    client.release();
  } catch(e) {
    console.log("Failed with ssl: true - " + e.message);
  }
}
test();

test();
