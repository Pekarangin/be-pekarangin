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

// Trust reverse proxy (Railway, Render, Cloudflare) untuk deteksi HTTPS dan host riil
app.set('trust proxy', 1);

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

// Helper untuk menghasilkan OpenAPI spec dinamis sesuai request origin
function getDynamicSpec(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || 'localhost:3000';
  const currentOriginUrl = `${protocol}://${host}/api/v1`;

  const existingServers = (openApiSpec.servers || []).filter(
    (s) => s.url !== currentOriginUrl
  );

  return {
    ...openApiSpec,
    servers: [
      {
        url: currentOriginUrl,
        description: `Current Server (${protocol}://${host})`,
      },
      ...existingServers,
    ],
  };
}

// Raw OpenAPI JSON spec
app.get('/openapi.json', (req, res) => res.json(getDynamicSpec(req)));
app.get('/api/v1/openapi.json', (_req, res) => res.redirect('/openapi.json'));

// Scalar Interactive Documentation UI
app.use('/docs', (req, res, next) => {
  return apiReference({
    spec: {
      content: getDynamicSpec(req),
    },
    theme: 'purple',
    metaData: {
      title: 'Pekarang.in API Documentation',
      description: 'Dokumentasi interaktif REST API Pekarang.in menggunakan Scalar',
    },
  })(req, res, next);
});

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
