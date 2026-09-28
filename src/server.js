// ============================================================
// src/server.js — Entry point: connect DB & start server
// ============================================================
import app from './app.js';
import env from './config/env.js';
import prisma from './config/database.js';

async function start() {
  try {
    // Test database connection via Prisma
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma ORM');

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
