// ============================================================
// database/run-migrations.js — Run SQL migration files with tracking
// Usage: npm run db:migrate
// ============================================================
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

export async function runMigrations() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 1. Buat tabel tracking migrasi jika belum ada
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Cek apakah tabel utama sudah ada dari run sebelumnya
    const checkUsers = await pool.query(`
      SELECT to_regclass('public.users') AS exists;
    `);
    if (checkUsers.rows[0].exists) {
      await pool.query(`
        INSERT INTO _migrations (name) VALUES ('001_initial_schema.sql')
        ON CONFLICT (name) DO NOTHING;
      `);
    }

    const { rows: executedRows } = await pool.query('SELECT name FROM _migrations');
    const executedSet = new Set(executedRows.map((r) => r.name));

    const migrationsDir = join(__dirname, 'migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const pending = files.filter((f) => !executedSet.has(f));

    if (pending.length === 0) {
      console.log('📦 Database migrations: already up to date.');
      return;
    }

    console.log(`📦 Running ${pending.length} pending migration(s)...\n`);

    for (const file of pending) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      console.log(`  ▶ ${file}`);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅ ${file} — done`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    console.log('\n✅ All migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Jalankan otomatis jika dipanggil langsung via node
const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('run-migrations.js');
if (isMain) {
  runMigrations();
}
