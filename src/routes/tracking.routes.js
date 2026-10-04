// ============================================================
// src/routes/tracking.routes.js — Tracking Module Routes
// Sumber: API_Contract_Pekarangin.md §4
// ============================================================
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as trackingController from '../controllers/tracking.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Semua endpoint tracking membutuhkan autentikasi Bearer JWT
router.use(authenticate);

// 1. POST /api/v1/tanaman-aktif — Mulai menanam komoditas di lahan
router.post(
  '/',
  [
    body('lahan_id').isUUID().withMessage('lahan_id harus berupa UUID yang valid'),
    body('komoditas_id').isUUID().withMessage('komoditas_id harus berupa UUID yang valid'),
    body('tanggal_tanam').isISO8601().withMessage('tanggal_tanam harus berupa tanggal ISO valid (YYYY-MM-DD)'),
    validate,
  ],
  trackingController.createTanaman
);

// 2. GET /api/v1/tanaman-aktif — List semua tanaman milik user
router.get(
  '/',
  [
    query('status').optional().isIn(['AKTIF', 'PANEN', 'GAGAL']).withMessage('status harus bernilai AKTIF, PANEN, atau GAGAL'),
    query('lahan_id').optional().isUUID().withMessage('lahan_id harus berupa UUID yang valid'),
    validate,
  ],
  trackingController.getTanamanList
);

// 3. GET /api/v1/tanaman-aktif/:id — Detail satu tanaman aktif + komoditas
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('ID tanaman harus berupa UUID yang valid'),
    validate,
  ],
  trackingController.getTanamanDetail
);

// 4. POST /api/v1/tanaman-aktif/:id/checklist — Submit checklist perawatan harian (upsert)
router.post(
  '/:id/checklist',
  [
    param('id').isUUID().withMessage('ID tanaman harus berupa UUID yang valid'),
    body('tanggal').isISO8601().withMessage('tanggal harus berupa tanggal ISO valid (YYYY-MM-DD)'),
    body('siram_done').isBoolean().withMessage('siram_done harus bernilai boolean (true/false)'),
    body('pupuk_done').isBoolean().withMessage('pupuk_done harus bernilai boolean (true/false)'),
    body('catatan').optional({ nullable: true }).isString().withMessage('catatan harus berupa teks string'),
    validate,
  ],
  trackingController.upsertChecklist
);

// 5. GET /api/v1/tanaman-aktif/:id/checklist — Riwayat checklist perawatan tanaman
router.get(
  '/:id/checklist',
  [
    param('id').isUUID().withMessage('ID tanaman harus berupa UUID yang valid'),
    query('dari').optional().isISO8601().withMessage('filter dari harus berupa tanggal ISO valid (YYYY-MM-DD)'),
    query('sampai').optional().isISO8601().withMessage('filter sampai harus berupa tanggal ISO valid (YYYY-MM-DD)'),
    validate,
  ],
  trackingController.getChecklistHistory
);

// 6. POST /api/v1/tanaman-aktif/:id/panen — Catat realisasi panen (status -> PANEN)
router.post(
  '/:id/panen',
  [
    param('id').isUUID().withMessage('ID tanaman harus berupa UUID yang valid'),
    body('tanggal_panen').isISO8601().withMessage('tanggal_panen harus berupa tanggal ISO valid (YYYY-MM-DD)'),
    body('berat_panen_gram').isInt({ min: 1 }).withMessage('berat_panen_gram harus berupa integer lebih besar dari 0'),
    validate,
  ],
  trackingController.recordPanen
);

// 7. PATCH /api/v1/tanaman-aktif/:id/status — Tutup siklus tanam sebagai GAGAL
router.patch(
  '/:id/status',
  [
    param('id').isUUID().withMessage('ID tanaman harus berupa UUID yang valid'),
    body('status').equals('GAGAL').withMessage('status hanya boleh bernilai GAGAL'),
    validate,
  ],
  trackingController.updateStatus
);

export default router;
