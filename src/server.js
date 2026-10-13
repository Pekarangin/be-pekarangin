// ============================================================
// src/server.js — Entry point: connect DB & start server
// ============================================================
import app from './app.js';
import env from './config/env.js';
import prisma from './config/database.js';
import { getDefaultKomoditasImage } from './utils/constants.js';

async function start() {
  try {
    // Test database connection via Prisma
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma ORM');

    // Auto-migrate additive columns safely (idempotent)
    await prisma.$executeRawUnsafe(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS wilayah VARCHAR(150);`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE komoditas ADD COLUMN IF NOT EXISTS image_url TEXT;`
    );

    // Populate default image_url for komoditas if not yet set
    const cropsWithoutImg = await prisma.komoditas.findMany({
      where: { imageUrl: null },
      select: { id: true, nama: true },
    });
    for (const crop of cropsWithoutImg) {
      await prisma.komoditas.update({
        where: { id: crop.id },
        data: { imageUrl: getDefaultKomoditasImage(crop.nama) },
      });
    }

    // Start HTTP server
    app.listen(env.port, () => {
      console.log(`🚀 Pekarang.in Backend running on port ${env.port}`);
      console.log(`📍 Health check: http://localhost:${env.port}/api/v1/health`);
      console.log(`🌱 Environment: ${env.nodeEnv}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
