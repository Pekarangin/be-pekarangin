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
app.use(
  helmet({
    contentSecurityPolicy: false, // Diperlukan agar UI interactive Scalar dapat dimuat tanpa terblokir CSP
  })
);
app.use(cors());                            // CORS — semua origin (development)
app.use(express.json({ limit: '10mb' }));   // Parse JSON body
app.use(express.urlencoded({ extended: true }));

// Request logging (hanya di development)
if (env.isDev) {
  app.use(morgan('dev'));
}

// ---- OpenAPI & Scalar API Documentation ----
import { apiReference } from '@scalar/express-api-reference';
import { openApiSpec } from './config/openapi.js';

// Raw OpenAPI JSON spec
app.get('/openapi.json', (_req, res) => res.json(openApiSpec));
app.get('/api/v1/openapi.json', (_req, res) => res.json(openApiSpec));

// Scalar Interactive Documentation UI
app.use(
  '/docs',
  apiReference({
    spec: {
      content: openApiSpec,
    },
    theme: 'purple',
    metaData: {
      title: 'Pekarang.in API Documentation',
      description: 'Dokumentasi interaktif REST API Pekarang.in menggunakan Scalar',
    },
  })
);

// Redirect root ke /docs untuk kemudahan navigasi
app.get('/', (_req, res) => res.redirect('/docs'));

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
