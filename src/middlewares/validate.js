// ============================================================
// src/middlewares/validate.js — Request validation middleware
// Menggunakan express-validator
// ============================================================
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware untuk mengecek hasil validasi express-validator.
 * Jika terdapat error validasi, throw ValidationError dengan pesan error pertama.
 */
export function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const message = firstError.msg || 'Input tidak valid';
    return next(new ValidationError(message));
  }
  next();
}
