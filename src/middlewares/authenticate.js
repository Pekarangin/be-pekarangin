// ============================================================
// src/middlewares/authenticate.js — JWT verification middleware
// ============================================================
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * Middleware: verify JWT token dari header Authorization.
 * Jika valid, set req.user = { userId, email }.
 * Jika tidak valid / tidak ada, throw UnauthorizedError.
 */
export function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token tidak ditemukan');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token tidak valid atau sudah expired'));
    } else {
      next(err);
    }
  }
}
