// ============================================================
// src/config/database.js — Prisma Client instance
// ============================================================
import { PrismaClient } from '@prisma/client';
import env from './env.js';

const prisma = new PrismaClient({
  log: env.isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
