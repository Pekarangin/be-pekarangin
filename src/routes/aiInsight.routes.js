// ============================================================
// src/routes/aiInsight.routes.js — AI Insight Module Routes
// Sumber: API_Contract_Pekarangin.md §5
// ============================================================
import { Router } from 'express';
import { body } from 'express-validator';
import * as aiInsightController from '../controllers/aiInsight.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Semua endpoint AI Insight memerlukan Bearer JWT token
router.use(authenticate);

// POST /api/v1/ai-insight/chat — Tanya-Jawab Asisten Agronomi Kontekstual
router.post(
  '/chat',
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('message wajib diisi'),
    body('tanaman_aktif_id')
      .optional()
      .isUUID()
      .withMessage('tanaman_aktif_id harus berupa UUID yang valid'),
    validate,
  ],
  aiInsightController.chat
);

export default router;
