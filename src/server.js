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

    // Auto-sync Sleman commodity prices dated 2026-10-13 (SIHARPA Disperindag)
    const slemanPrices = {
      'Cabai rawit': 68857,
      'Cabai merah': 67571,
      'Bawang merah': 30714,
      'Bayam': 10000,
      'Wortel': 14286,
      'Selada': 22000,
      'Kangkung': 6500,
      'Mentimun': 10857,
      'Tomat': 8286,
      'Kemangi': 25000,
      'Terong': 12000,
      'Daun bawang': 18000,
      'Sawi': 7071,
      'Kacang panjang': 8500,
      'Pare': 11000,
    };
    const existingSlemanPrices = await prisma.hargaKomoditas.count({
      where: {
        sumber: 'SLEMAN_DISPERINDAG',
        tanggalUpdate: new Date('2026-10-13'),
      },
    });
    if (existingSlemanPrices < Object.keys(slemanPrices).length) {
      console.log('🔄 Syncing latest Sleman Disperindag commodity prices...');
      const allCrops = await prisma.komoditas.findMany({
        select: { id: true, nama: true },
      });
      for (const crop of allCrops) {
        const harga = slemanPrices[crop.nama];
        if (harga) {
          const alreadyInserted = await prisma.hargaKomoditas.findFirst({
            where: {
              komoditasId: crop.id,
              sumber: 'SLEMAN_DISPERINDAG',
              tanggalUpdate: new Date('2026-10-13'),
            },
          });
          if (!alreadyInserted) {
            await prisma.hargaKomoditas.create({
              data: {
                komoditasId: crop.id,
                hargaRpPerKg: harga,
                sumber: 'SLEMAN_DISPERINDAG',
                tanggalUpdate: new Date('2026-10-13'),
                wilayah: 'Sleman',
              },
            });
          }
        }
      }
      console.log('✅ Sleman Disperindag commodity prices synced.');
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
