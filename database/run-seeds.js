// ============================================================
// database/run-seeds.js — Run SQL seed files
// Usage: npm run db:seed
// ============================================================
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

async function runSeeds() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const seedsDir = join(__dirname, 'seeds');
    const files = readdirSync(seedsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`🌱 Running ${files.length} seed(s)...\n`);

    for (const file of files) {
      const sql = readFileSync(join(seedsDir, file), 'utf-8');
      console.log(`  ▶ ${file}`);
      await pool.query(sql);
      console.log(`  ✅ ${file} — done`);
    }

    console.log('\n✅ All seeds completed successfully.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeeds();
