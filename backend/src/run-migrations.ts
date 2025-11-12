// src/run-migrations.ts
import { AppDataSource } from './data-source'; // adjust if your export name/path differs

async function main() {
  const ds = await AppDataSource.initialize();
  try {
    const results = await ds.runMigrations();
    console.log('Migrations completed:', results.map(r => r.name));
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
