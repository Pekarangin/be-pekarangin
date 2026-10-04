// ============================================================
// src/controllers/lahan.controller.js — Lahan HTTP Handler
// ============================================================
import * as lahanService from '../services/lahan.service.js';
import * as geminiVisionService from '../services/geminiVision.service.js';
import * as scoringService from '../services/scoring.service.js';
import { sendSuccess } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

export async function createLahan(req, res, next) {
  try {
    const data = await lahanService.createLahan(req.user.userId, req.body);
    return sendSuccess(res, data, 'Profil lahan berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
}

export async function analisisCahaya(req, res, next) {
  try {
    if (!req.file) {
      throw new ValidationError('File foto wajib diunggah (field: foto)');
    }

    const data = await geminiVisionService.analyzeSunlightFromImage(
      req.file.buffer,
      req.file.mimetype
    );

    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function getLahanList(req, res, next) {
  try {
    const data = await lahanService.getLahanList(req.user.userId);
    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function getLahanById(req, res, next) {
  try {
    const data = await lahanService.getLahanById(req.user.userId, req.params.id);
    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function updateLahan(req, res, next) {
  try {
    const data = await lahanService.updateLahan(
      req.user.userId,
      req.params.id,
      req.body
    );
    return sendSuccess(res, data, 'Profil lahan berhasil diperbarui', 200);
  } catch (err) {
    next(err);
  }
}

export async function deleteLahan(req, res, next) {
  try {
    const result = await lahanService.deleteLahan(req.user.userId, req.params.id);
    return sendSuccess(res, null, result.message, 200);
  } catch (err) {
    next(err);
  }
}

export async function getRekomendasi(req, res, next) {
  try {
    const data = await scoringService.getRecommendationsForLahan(
      req.user.userId,
      req.params.id
    );
    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}
