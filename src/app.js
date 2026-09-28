// ============================================================
// src/app.js — Express application setup
// ============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import env from './config/env.js';

const app = express();

// ---- Global middleware ----
app.use(helmet());                          // Security headers
app.use(cors());                            // CORS — semua origin (development)
app.use(express.json({ limit: '10mb' }));   // Parse JSON body
app.use(express.urlencoded({ extended: true }));

// Request logging (hanya di development)
if (env.isDev) {
  app.use(morgan('dev'));
}

// ---- API routes ----
app.use('/api/v1', routes);

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan' },
  });
});

// ---- Global error handler (harus paling akhir) ----
app.use(errorHandler);

export default app;
