/* src/scripts/init-db.ts
   Ensures DATABASE_URL database exists, then exits 0.
*/
import { Client } from "pg";

function parseDbUrl(url: string) {
  const u = new URL(url);
  const database = u.pathname.replace(/^\//, "");
  const base = new URL(url);
  base.pathname = "/postgres";          // connect to admin DB
  return { adminUrl: base.toString(), database };
}

async function ensureDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const { adminUrl, database } = parseDbUrl(url);

  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    const { rows } = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database]
    );
    if (rows.length === 0) {
      console.log(`[init-db] Creating database ${database} ...`);
      // Avoid SQL injection: database comes from URL path, but still quote identifier
      await admin.query(`CREATE DATABASE "${database}"`);
    } else {
      console.log(`[init-db] Database ${database} already exists`);
    }
  } finally {
    await admin.end();
  }
  console.log("[init-db] Done");
}

ensureDb().catch((e) => {
  console.error("[init-db] Error:", e);
  process.exit(1);
});
