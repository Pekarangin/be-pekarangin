// ============================================================
// src/controllers/auth.controller.js — Authentication HTTP handler
// ============================================================
import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const { nama, email, password } = req.body;
    const data = await authService.register({ nama, email, password });
    return sendSuccess(res, data, 'Registrasi berhasil', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    return sendSuccess(res, data, 'Login berhasil', 200);
  } catch (err) {
    next(err);
  }
}

export async function googleAuth(req, res, next) {
  try {
    const { id_token } = req.body;
    const data = await authService.loginWithGoogle(id_token);
    const statusCode = data.is_new_user ? 201 : 200;
    return sendSuccess(res, data, 'Login Google berhasil', statusCode);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const data = await authService.getMe(req.user.userId);
    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}
