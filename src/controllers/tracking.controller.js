// ============================================================
// src/controllers/tracking.controller.js — Tracking Module Controller
// Sumber: API_Contract_Pekarangin.md §4
// ============================================================
import * as trackingService from '../services/tracking.service.js';
import { sendSuccess } from '../utils/response.js';

export async function createTanaman(req, res, next) {
  try {
    const { lahan_id, komoditas_id, tanggal_tanam } = req.body;
    const data = await trackingService.startTracking({
      userId: (req.user.userId || req.user.user_id),
      lahanId: lahan_id,
      komoditasId: komoditas_id,
      tanggalTanam: tanggal_tanam,
    });
    return sendSuccess(res, data, 'Siklus tanam berhasil dimulai', 201);
  } catch (error) {
    next(error);
  }
}

export async function getTanamanList(req, res, next) {
  try {
    const { status, lahan_id } = req.query;
    const data = await trackingService.getTanamanList({
      userId: (req.user.userId || req.user.user_id),
      status,
      lahanId: lahan_id,
    });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getTanamanDetail(req, res, next) {
  try {
    const { id } = req.params;
    const data = await trackingService.getTanamanDetail({
      id,
      userId: (req.user.userId || req.user.user_id),
    });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function upsertChecklist(req, res, next) {
  try {
    const { id } = req.params;
    const { tanggal, siram_done, pupuk_done, catatan } = req.body;
    const data = await trackingService.upsertChecklist({
      tanamanId: id,
      userId: (req.user.userId || req.user.user_id),
      tanggal,
      siramDone: siram_done,
      pupukDone: pupuk_done,
      catatan,
    });
    return sendSuccess(res, data, 'Checklist berhasil disimpan');
  } catch (error) {
    next(error);
  }
}

export async function getChecklistHistory(req, res, next) {
  try {
    const { id } = req.params;
    const { dari, sampai } = req.query;
    const data = await trackingService.getChecklistHistory({
      tanamanId: id,
      userId: (req.user.userId || req.user.user_id),
      dari,
      sampai,
    });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function recordPanen(req, res, next) {
  try {
    const { id } = req.params;
    const { tanggal_panen, berat_panen_gram } = req.body;
    const data = await trackingService.recordPanen({
      tanamanId: id,
      userId: (req.user.userId || req.user.user_id),
      tanggalPanen: tanggal_panen,
      beratPanenGram: Number(berat_panen_gram),
    });
    return sendSuccess(res, data, 'Realisasi panen berhasil dicatat');
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const data = await trackingService.markGagal({
      tanamanId: id,
      userId: (req.user.userId || req.user.user_id),
    });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
