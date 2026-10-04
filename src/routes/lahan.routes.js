// ============================================================
// src/routes/lahan.routes.js — Lahan Routes & Validation
// ============================================================
import { Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import * as lahanController from '../controllers/lahan.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { ValidationError } from '../utils/errors.js';

const router = Router();

// Setup Multer untuk upload foto analisis cahaya (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Format file foto harus berupa JPEG, PNG, atau WebP'));
    }
  },
});

// Semua endpoint lahan membutuhkan autentikasi
router.use(authenticate);

// POST /api/v1/lahan — Buat profil lahan baru
router.post(
  '/',
  [
    body('nama_lahan')
      .trim()
      .notEmpty()
      .withMessage('nama_lahan wajib diisi')
      .isLength({ max: 100 })
      .withMessage('nama_lahan maksimal 100 karakter'),
    body('grid_snapshot')
      .isArray({ min: 1 })
      .withMessage('grid_snapshot wajib berupa array dan minimal memilih 1 sel'),
    body('luas_m2')
      .notEmpty()
      .withMessage('luas_m2 wajib diisi')
      .isFloat({ min: 0.25 })
      .withMessage('luas_m2 minimal 0.25 m2'),
    body('paparan_sinar')
      .notEmpty()
      .withMessage('paparan_sinar wajib diisi')
      .isIn(['FULL_SUN', 'PARTIAL_SUN', 'SHADE'])
      .withMessage('paparan_sinar harus salah satu dari: FULL_SUN, PARTIAL_SUN, SHADE'),
    body('sumber_paparan')
      .notEmpty()
      .withMessage('sumber_paparan wajib diisi')
      .isIn(['MANUAL', 'AI_VISION'])
      .withMessage('sumber_paparan harus salah satu dari: MANUAL, AI_VISION'),
    body('foto_url')
      .optional({ nullable: true })
      .isString()
      .withMessage('foto_url harus berupa string'),
    validate,
  ],
  lahanController.createLahan
);

// POST /api/v1/lahan/analisis-cahaya — Analisis paparan sinar via foto (Gemini Vision)
router.post(
  '/analisis-cahaya',
  upload.single('foto'),
  lahanController.analisisCahaya
);

// GET /api/v1/lahan — List seluruh lahan user
router.get('/', lahanController.getLahanList);

// GET /api/v1/lahan/:id — Detail satu lahan
router.get('/:id', lahanController.getLahanById);

// GET /api/v1/lahan/:id/rekomendasi — Hitung & ambil ranking rekomendasi komoditas
router.get('/:id/rekomendasi', lahanController.getRekomendasi);

// PUT /api/v1/lahan/:id — Update profil lahan (partial)
router.put(
  '/:id',
  [
    body('nama_lahan')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('nama_lahan tidak boleh kosong jika disertakan')
      .isLength({ max: 100 })
      .withMessage('nama_lahan maksimal 100 karakter'),
    body('grid_snapshot')
      .optional()
      .isArray({ min: 1 })
      .withMessage('grid_snapshot harus berupa array minimal 1 sel'),
    body('luas_m2')
      .optional()
      .isFloat({ min: 0.25 })
      .withMessage('luas_m2 minimal 0.25 m2'),
    body('paparan_sinar')
      .optional()
      .isIn(['FULL_SUN', 'PARTIAL_SUN', 'SHADE'])
      .withMessage('paparan_sinar harus salah satu dari: FULL_SUN, PARTIAL_SUN, SHADE'),
    body('sumber_paparan')
      .optional()
      .isIn(['MANUAL', 'AI_VISION'])
      .withMessage('sumber_paparan harus salah satu dari: MANUAL, AI_VISION'),
    body('foto_url')
      .optional({ nullable: true })
      .isString(),
    validate,
  ],
  lahanController.updateLahan
);

// DELETE /api/v1/lahan/:id — Hapus profil lahan
router.delete('/:id', lahanController.deleteLahan);

export default router;
