// ============================================================
// src/routes/index.js — Route aggregator
// Mount semua module routes di sini.
// ============================================================
import { Router } from 'express';

const router = Router();

// Health check (tidak perlu auth)
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ---- Module routes ----
import authRoutes from './auth.routes.js';
router.use('/auth', authRoutes);

import lahanRoutes from './lahan.routes.js';
router.use('/lahan', lahanRoutes);

import komoditasRoutes from './komoditas.routes.js';
router.use('/komoditas', komoditasRoutes);

import trackingRoutes from './tracking.routes.js';
router.use('/tanaman-aktif', trackingRoutes);

// import aiInsightRoutes from './aiInsight.routes.js';
// router.use('/ai-insight', aiInsightRoutes);

export default router;
