// ============================================================
// src/middlewares/errorHandler.js — Global error handler
// ============================================================
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import env from '../config/env.js';

/**
 * Global error handler middleware.
 * Harus didaftarkan TERAKHIR di app.use().
 *
 * - AppError (operational) → kirim error code & message ke client
 * - Error lain (programming bug) → kirim generic 500
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Log error di server (selalu)
  if (env.isDev) {
    console.error('❌ Error:', err);
  } else {
    console.error('❌ Error:', err.message);
  }

  // Operational error (kita yang throw dengan sengaja)
  if (err instanceof AppError) {
    return sendError(res, err.errorCode, err.message, err.statusCode);
  }

  // Multer error (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'VALIDATION_ERROR', 'Ukuran file terlalu besar (maks 10MB)', 400);
  }

  // Programming error / unexpected → generic 500
  return sendError(
    res,
    'INTERNAL_ERROR',
    env.isDev ? err.message : 'Terjadi kesalahan server',
    500
  );
}
