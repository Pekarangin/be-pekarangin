// ============================================================
// src/services/auth.service.js — Authentication business logic (Prisma ORM)
// ============================================================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/database.js';
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
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError('Email sudah terdaftar');
  }

  // 2. Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 3. Simpan user baru
  const user = await prisma.user.create({
    data: {
      nama: nama.trim(),
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      nama: true,
      email: true,
      createdAt: true,
    },
  });

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
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new UnauthorizedError('Email atau password salah');
  }

  // Jika akun hanya didaftarkan via Google OAuth tanpa password
  if (!user.passwordHash) {
    throw new UnauthorizedError('Akun ini terdaftar via Google. Silakan login dengan Google');
  }

  // 2. Cocokkan password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
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

  // 1. Cek user berdasarkan googleId
  let user = await prisma.user.findUnique({
    where: { googleId },
  });

  let isNewUser = false;

  if (!user) {
    // 2. Cek apakah ada akun dengan email yang sama (misal pernah daftar via password)
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      // Tautkan googleId ke akun email yang sudah ada
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId,
          avatarUrl: existingByEmail.avatarUrl || avatarUrl,
        },
      });
    } else {
      // 3. Akun baru murni via Google
      user = await prisma.user.create({
        data: {
          nama,
          email,
          googleId,
          avatarUrl,
        },
      });
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
    avatar_url: user.avatarUrl,
    is_new_user: isNewUser,
    token,
  };
}

/**
 * Ambil data profil user saat ini berdasarkan ID
 */
export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nama: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
  }

  return {
    user_id: user.id,
    nama: user.nama,
    email: user.email,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt,
  };
}
