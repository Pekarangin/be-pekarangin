// ============================================================
// src/routes/auth.routes.js — Authentication routes & validation
// ============================================================
import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  [
    body('nama')
      .trim()
      .notEmpty()
      .withMessage('Nama wajib diisi')
      .isLength({ max: 100 })
      .withMessage('Nama maksimal 100 karakter'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email wajib diisi')
      .isEmail()
      .withMessage('Format email tidak valid'),
    body('password')
      .notEmpty()
      .withMessage('Password wajib diisi')
      .isLength({ min: 8 })
      .withMessage('Password minimal 8 karakter'),
    validate,
  ],
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email wajib diisi')
      .isEmail()
      .withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
    validate,
  ],
  authController.login
);

// POST /api/v1/auth/google
router.post(
  '/google',
  [
    body('id_token').trim().notEmpty().withMessage('id_token wajib diisi'),
    validate,
  ],
  authController.googleAuth
);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getMe);

export default router;
