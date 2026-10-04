// ============================================================
// src/routes/komoditas.routes.js — Master Komoditas Routes
// ============================================================
import { Router } from 'express';
import * as komoditasController from '../controllers/komoditas.controller.js';

const router = Router();

// Endpoint komoditas bersifat public (sesuai API Contract)
router.get('/', komoditasController.getAllKomoditas);
router.get('/:id', komoditasController.getKomoditasById);

export default router;
