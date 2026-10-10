// ============================================================
// src/controllers/aiInsight.controller.js — AI Insight Controller
// Sumber: API_Contract_Pekarangin.md §5
// ============================================================
import * as aiInsightService from '../services/aiInsight.service.js';
import { sendSuccess } from '../utils/response.js';

export async function chat(req, res, next) {
  try {
    const { message, tanaman_aktif_id } = req.body;
    const data = await aiInsightService.chatAssistant({
      userId: req.user.userId || req.user.user_id,
      message,
      tanamanAktifId: tanaman_aktif_id,
    });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
