// ============================================================
// database/reset.js — Drop all tables, re-migrate, re-seed
// Usage: npm run db:reset
// ⚠️ DESTRUCTIVE — hapus semua data!
// ============================================================
import pg from 'pg';
import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

async function reset() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('⚠️  Dropping all tables...');

    await pool.query(`
      DROP TABLE IF EXISTS realisasi_panen CASCADE;
      DROP TABLE IF EXISTS catatan_harian CASCADE;
      DROP TABLE IF EXISTS tanaman_aktif CASCADE;
      DROP TABLE IF EXISTS harga_komoditas CASCADE;
      DROP TABLE IF EXISTS komoditas CASCADE;
      DROP TABLE IF EXISTS lahan CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('✅ All tables dropped.\n');

    // Run migrations
    console.log('📦 Running migrations...');
    const { default: runMigrations } = await import('./run-migrations.js');

  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

reset();
