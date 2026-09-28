// ============================================================
// src/utils/errors.js — Custom error classes
// ============================================================

/**
 * Base application error. Semua custom error extend dari sini.
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Input tidak valid') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autentikasi diperlukan') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Akses ditolak') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource tidak ditemukan') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Data sudah ada') {
    super(message, 409, 'CONFLICT');
  }
}
