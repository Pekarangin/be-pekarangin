// ============================================================
// src/controllers/komoditas.controller.js — Master Komoditas HTTP Handler
// ============================================================
import * as komoditasService from '../services/komoditas.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getAllKomoditas(req, res, next) {
  try {
    const data = await komoditasService.getAllKomoditas();
    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}

export async function getKomoditasById(req, res, next) {
  try {
    const data = await komoditasService.getKomoditasById(req.params.id);
    return sendSuccess(res, data, null, 200);
  } catch (err) {
    next(err);
  }
}
