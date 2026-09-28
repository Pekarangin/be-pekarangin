// ============================================================
// src/utils/response.js — Standar response formatter
// Format: { success, data, message } atau { success, error }
// Ref: API Contract — Format Response Standar
// ============================================================

/**
 * Response sukses.
 * @param {import('express').Response} res
 * @param {object} data - Data yang dikembalikan
 * @param {string} [message] - Pesan opsional
 * @param {number} [statusCode=200] - HTTP status code
 */
export function sendSuccess(res, data, message = null, statusCode = 200) {
  const body = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

/**
 * Response error.
 * @param {import('express').Response} res
 * @param {string} errorCode - Error code (VALIDATION_ERROR, dll)
 * @param {string} message - Pesan error human-readable
 * @param {number} [statusCode=500] - HTTP status code
 */
export function sendError(res, errorCode, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
  });
}
