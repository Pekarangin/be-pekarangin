// ============================================================
// src/config/database.js — PostgreSQL connection pool
// ============================================================
import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.databaseUrl,
  // Connection pool settings
  max: 10,                // Maks koneksi di pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log koneksi berhasil (hanya di development)
pool.on('connect', () => {
  if (env.isDev) {
    console.log('📦 New PostgreSQL client connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Wrapper untuk query database.
 * Selalu gunakan parameterized queries untuk mencegah SQL injection.
 *
 * @example
 * const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
 * const rows = result.rows;
 */
const db = {
  query: (text, params) => pool.query(text, params),
  pool,
};

export default db;
