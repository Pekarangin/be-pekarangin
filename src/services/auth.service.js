// ============================================================
// src/services/auth.service.js — Authentication business logic
// ============================================================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../config/database.js';
import env from '../config/env.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';

const googleClient = new OAuth2Client(env.googleClientId || undefined);

/**
 * Generate JWT token untuk user
 */
function generateToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Registrasi user baru via email & password
 */
export async function register({ nama, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Cek apakah email sudah terdaftar
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    throw new ConflictError('Email sudah terdaftar');
  }

  // 2. Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 3. Simpan user baru
  const result = await db.query(
    `INSERT INTO users (nama, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nama, email, created_at`,
    [nama.trim(), normalizedEmail, passwordHash]
  );

  const user = result.rows[0];

  // 4. Buat JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user_id: user.id,
    nama: user.nama,
    email: user.email,
    token,
  };
}

/**
 * Login user via email & password
 */
export async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Cari user berdasarkan email
  const result = await db.query(
    'SELECT id, nama, email, password_hash FROM users WHERE email = $1',
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Email atau password salah');
  }

  const user = result.rows[0];

  // Jika akun hanya didaftarkan via Google OAuth tanpa password
  if (!user.password_hash) {
    throw new UnauthorizedError('Akun ini terdaftar via Google. Silakan login dengan Google');
  }

  // 2. Cocokkan password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Email atau password salah');
  }

  // 3. Buat JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user_id: user.id,
    nama: user.nama,
    email: user.email,
    token,
  };
}

/**
 * Login / Registrasi via Google OAuth ID Token
 */
export async function loginWithGoogle(idToken) {
  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.googleClientId || undefined,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new UnauthorizedError(`Token Google tidak valid: ${err.message}`);
  }

  if (!payload || !payload.email) {
    throw new ValidationError('Payload Google tidak memuat informasi email');
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase().trim();
  const nama = payload.name || 'Pengguna Pekarang.in';
  const avatarUrl = payload.picture || null;

  // 1. Cek user berdasarkan google_id
  let userResult = await db.query(
    'SELECT id, nama, email, avatar_url FROM users WHERE google_id = $1',
    [googleId]
  );

  let isNewUser = false;
  let user;

  if (userResult.rows.length > 0) {
    // User lama yang login kembali via Google
    user = userResult.rows[0];
  } else {
    // 2. Cek apakah ada akun dengan email yang sama (misal pernah daftar via password)
    const emailResult = await db.query(
      'SELECT id, nama, email, avatar_url FROM users WHERE email = $1',
      [email]
    );

    if (emailResult.rows.length > 0) {
      // Tautkan google_id ke akun email yang sudah ada
      const updated = await db.query(
        `UPDATE users
         SET google_id = $1, avatar_url = COALESCE(avatar_url, $2)
         WHERE id = $3
         RETURNING id, nama, email, avatar_url`,
        [googleId, avatarUrl, emailResult.rows[0].id]
      );
      user = updated.rows[0];
    } else {
      // 3. Akun baru murni via Google
      const inserted = await db.query(
        `INSERT INTO users (nama, email, google_id, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nama, email, avatar_url`,
        [nama, email, googleId, avatarUrl]
      );
      user = inserted.rows[0];
      isNewUser = true;
    }
  }

  // 4. Generate JWT
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user_id: user.id,
    nama: user.nama,
    email: user.email,
    avatar_url: user.avatar_url,
    is_new_user: isNewUser,
    token,
  };
}

/**
 * Ambil data profil user saat ini berdasarkan ID
 */
export async function getMe(userId) {
  const result = await db.query(
    `SELECT id AS user_id, nama, email, avatar_url, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User tidak ditemukan');
  }

  return result.rows[0];
}
