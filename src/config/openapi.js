// ============================================================
// src/config/openapi.js — OpenAPI 3.1 Specification for Pekarang.in
// Sumber: API_Contract_Pekarangin.md v2.0
// ============================================================

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Pekarang.in API Documentation',
    version: '2.0.0',
    description: `
**Pekarang.in (MAGE 12 ITS)** adalah RESTful API untuk aplikasi smart urban farming yang berfokus pada optimasi ekonomi lahan pekarangan rumah tangga perkotaan.

### Fitur Utama:
- **Autentikasi**: JWT stateless dan Google OAuth 2.0.
- **Profil Lahan & Grid 8x8**: Kalkulasi luas otomatis (0.25 m2/sel) dan klasifikasi paparan sinar (Gemini Vision).
- **Rekomendasi & Scoring**: Pemeringkatan 15 komoditas pangan via *Crop Priority Scoring Engine*.
- **Tracking & Panen**: Siklus hidup tanaman (AKTIF -> PANEN / GAGAL), checklist perawatan harian, dan pencatatan panen riil.
- **AI Farming Assistant**: Tanya-jawab kontekstual via Gemini Chat API (P3).
    `,
    contact: {
      name: 'Tim Dit Tolongin Dit (AMIKOM Yogyakarta)',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current Environment (Relative / Auto)',
    },
    {
      url: 'https://be-pekarangin-production.up.railway.app/api/v1',
      description: 'Production Server (Railway)',
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development Server (Local/Docker)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan token JWT yang didapatkan dari register atau login.',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', nullable: true, example: 'Operasi berhasil' },
        },
      },
      StandardError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Input tidak valid' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          user_id: { type: 'string', format: 'uuid' },
          nama: { type: 'string', example: 'Andy' },
          email: { type: 'string', format: 'email', example: 'andy@pekarang.in' },
          avatar_url: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Lahan: {
        type: 'object',
        properties: {
          lahan_id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          nama_lahan: { type: 'string', example: 'Teras belakang' },
          luas_m2: { type: 'number', example: 2.0 },
          grid_snapshot: {
            type: 'array',
            items: { type: 'integer' },
            example: [9, 10, 11, 12, 17, 18, 19, 20],
          },
          paparan_sinar: {
            type: 'string',
            enum: ['FULL_SUN', 'PARTIAL_SUN', 'SHADE'],
            example: 'FULL_SUN',
          },
          sumber_paparan: {
            type: 'string',
            enum: ['MANUAL', 'AI_VISION'],
            example: 'MANUAL',
          },
          foto_url: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Komoditas: {
        type: 'object',
        properties: {
          komoditas_id: { type: 'string', format: 'uuid' },
          nama: { type: 'string', example: 'Cabai rawit' },
          kebutuhan_sinar: { type: 'string', enum: ['FULL_SUN', 'PARTIAL_SUN', 'SHADE'] },
          luas_min_m2: { type: 'number', example: 0.5 },
          luas_optimal_m2: { type: 'number', example: 1.5 },
          waktu_panen_hari: { type: 'integer', example: 75 },
          konsumsi_rt_kg_per_bulan: { type: 'number', example: 0.5 },
          tingkat_kesulitan: { type: 'string', enum: ['MUDAH', 'SEDANG', 'SULIT'] },
          jadwal_siram_hari: { type: 'integer', example: 1 },
          jadwal_pupuk_hari: { type: 'integer', example: 14 },
          panduan_singkat: { type: 'string' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Registrasi, Login, Google OAuth, & Profil User' },
    { name: 'Lahan', description: 'Profil Lahan, Grid 8x8, & Analisis Cahaya Gemini Vision' },
    { name: 'Rekomendasi', description: 'Scoring Engine & Katalog Master Komoditas' },
    { name: 'Tracking', description: 'Manajemen Siklus Tanam, Checklist Harian, & Realisasi Panen' },
    { name: 'AI Insight', description: 'Chatbot Agronomi Kontekstual (P3)' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        tags: ['Auth'],
        responses: {
          200: {
            description: 'Server status OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Registrasi Pengguna Baru',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama', 'email', 'password'],
                properties: {
                  nama: { type: 'string', example: 'Andy' },
                  email: { type: 'string', format: 'email', example: 'andy@pekarang.in' },
                  password: { type: 'string', minLength: 8, example: 'min8karakter' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registrasi berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user_id: { type: 'string', format: 'uuid' },
                        nama: { type: 'string' },
                        email: { type: 'string' },
                        token: { type: 'string' },
                      },
                    },
                    message: { type: 'string', example: 'Registrasi berhasil' },
                  },
                },
              },
            },
          },
          409: { description: 'Email sudah terdaftar (CONFLICT)' },
          400: { description: 'Validasi input gagal' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login Akun Email & Password',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'andy@pekarang.in' },
                  password: { type: 'string', example: 'min8karakter' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login berhasil, mengembalikan JWT token' },
          401: { description: 'Email atau password salah' },
        },
      },
    },
    '/auth/google': {
      post: {
        summary: 'Login / Registrasi via Google OAuth',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id_token'],
                properties: {
                  id_token: { type: 'string', description: 'Google ID Token dari Google Sign-In SDK' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login Google berhasil (pengguna lama)' },
          201: { description: 'Registrasi Google berhasil (pengguna baru, is_new_user: true)' },
          401: { description: 'ID Token tidak valid' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Ambil Profil Pengguna Saat Ini',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Data profil user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Token tidak ada atau tidak valid' },
        },
      },
    },
    '/lahan': {
      post: {
        summary: 'Buat Profil Lahan Baru',
        tags: ['Lahan'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama_lahan', 'grid_snapshot', 'luas_m2', 'paparan_sinar', 'sumber_paparan'],
                properties: {
                  nama_lahan: { type: 'string', example: 'Teras belakang' },
                  grid_snapshot: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [9, 10, 11, 12, 17, 18, 19, 20],
                    description: 'Array indeks sel grid 8x8 (0–63)',
                  },
                  luas_m2: { type: 'number', example: 2.0, description: 'Harus sama dengan grid_snapshot.length * 0.25' },
                  paparan_sinar: { type: 'string', enum: ['FULL_SUN', 'PARTIAL_SUN', 'SHADE'], example: 'FULL_SUN' },
                  sumber_paparan: { type: 'string', enum: ['MANUAL', 'AI_VISION'], example: 'MANUAL' },
                  foto_url: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Profil lahan berhasil dibuat' },
          400: { description: 'Validasi luas/grid snapshot gagal' },
        },
      },
      get: {
        summary: 'List Seluruh Lahan Milik Pengguna',
        tags: ['Lahan'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Daftar lahan beserta jumlah_tanaman_aktif',
          },
        },
      },
    },
    '/lahan/analisis-cahaya': {
      post: {
        summary: 'Upload Foto Lahan -> Klasifikasi Paparan Sinar (Gemini Vision)',
        tags: ['Lahan'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['foto'],
                properties: {
                  foto: { type: 'string', format: 'binary', description: 'File gambar pekarangan (max 10MB)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Hasil klasifikasi sinar Gemini Vision',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        paparan_sinar: { type: 'string', enum: ['FULL_SUN', 'PARTIAL_SUN', 'SHADE'], example: 'PARTIAL_SUN' },
                        confidence: { type: 'number', example: 0.85 },
                        catatan: { type: 'string', example: 'Terdeteksi bayangan tembok sekitar' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'File foto tidak valid atau format ditolak' },
        },
      },
    },
    '/lahan/{id}': {
      get: {
        summary: 'Detail Satu Lahan',
        tags: ['Lahan'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Data detail lahan beserta grid_snapshot' },
          403: { description: 'Akses ditolak: lahan milik user lain' },
          404: { description: 'Lahan tidak ditemukan' },
        },
      },
      put: {
        summary: 'Update Profil Lahan',
        tags: ['Lahan'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_lahan: { type: 'string' },
                  paparan_sinar: { type: 'string', enum: ['FULL_SUN', 'PARTIAL_SUN', 'SHADE'] },
                  sumber_paparan: { type: 'string', enum: ['MANUAL', 'AI_VISION'] },
                  grid_snapshot: { type: 'array', items: { type: 'integer' } },
                  luas_m2: { type: 'number' },
                  foto_url: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profil lahan berhasil diperbarui' },
          403: { description: 'Akses ditolak: lahan milik user lain' },
          404: { description: 'Lahan tidak ditemukan' },
        },
      },
      delete: {
        summary: 'Hapus Lahan',
        tags: ['Lahan'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Lahan berhasil dihapus' },
          403: { description: 'Akses ditolak: lahan milik user lain' },
          404: { description: 'Lahan tidak ditemukan' },
        },
      },
    },
    '/lahan/{id}/rekomendasi': {
      get: {
        summary: 'Hitung & Ambil Ranking Rekomendasi Tanaman (Scoring Engine)',
        tags: ['Rekomendasi'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Daftar 15 komoditas diurutkan berdasarkan skor prioritas tertinggi' },
        },
      },
    },
    '/komoditas': {
      get: {
        summary: 'List Seluruh 15 Master Komoditas',
        tags: ['Rekomendasi'],
        responses: {
          200: { description: 'Daftar master komoditas perkotaan' },
        },
      },
    },
    '/komoditas/{id}': {
      get: {
        summary: 'Detail Satu Komoditas beserta Harga Terkini',
        tags: ['Rekomendasi'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Detail komoditas + harga_terkini nested' },
        },
      },
    },
    '/tanaman-aktif': {
      post: {
        summary: 'Mulai Menanam Komoditas di Lahan',
        tags: ['Tracking'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lahan_id', 'komoditas_id', 'tanggal_tanam'],
                properties: {
                  lahan_id: { type: 'string', format: 'uuid' },
                  komoditas_id: { type: 'string', format: 'uuid' },
                  tanggal_tanam: { type: 'string', format: 'date', example: '2026-08-24' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Siklus tanam berhasil dimulai (status: AKTIF)' },
        },
      },
      get: {
        summary: 'List Tanaman Aktif Pengguna',
        tags: ['Tracking'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['AKTIF', 'PANEN', 'GAGAL'] } },
          { name: 'lahan_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Daftar tanaman aktif beserta metrik hari_ke dan checklist_hari_ini' },
        },
      },
    },
    '/tanaman-aktif/{id}': {
      get: {
        summary: 'Detail Satu Tanaman Aktif',
        tags: ['Tracking'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Detail tanaman aktif dan panduan komoditas' },
        },
      },
    },
    '/tanaman-aktif/{id}/checklist': {
      post: {
        summary: 'Submit Checklist Perawatan Harian (Siram & Pupuk)',
        tags: ['Tracking'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tanggal', 'siram_done', 'pupuk_done'],
                properties: {
                  tanggal: { type: 'string', format: 'date', example: '2026-08-25' },
                  siram_done: { type: 'boolean', example: true },
                  pupuk_done: { type: 'boolean', example: false },
                  catatan: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Checklist harian berhasil di-upsert' },
        },
      },
      get: {
        summary: 'Riwayat Checklist Perawatan Tanaman',
        tags: ['Tracking'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'dari', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'sampai', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'Log riwayat checklist' },
        },
      },
    },
    '/tanaman-aktif/{id}/panen': {
      post: {
        summary: 'Catat Realisasi Panen (Status -> PANEN)',
        tags: ['Tracking'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tanggal_panen', 'berat_panen_gram'],
                properties: {
                  tanggal_panen: { type: 'string', format: 'date', example: '2026-11-07' },
                  berat_panen_gram: { type: 'integer', example: 350 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Realisasi panen tercatat dan estimasi hemat terhitung' },
        },
      },
    },
    '/tanaman-aktif/{id}/status': {
      patch: {
        summary: 'Tutup Siklus Tanam sebagai GAGAL',
        tags: ['Tracking'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['GAGAL'], example: 'GAGAL' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Siklus tanam ditutup sebagai gagal' },
        },
      },
    },
    '/ai-insight/chat': {
      post: {
        summary: 'Tanya-Jawab Asisten Agronomi Kontekstual (P3)',
        tags: ['AI Insight'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'Kenapa daun cabai saya menguning?' },
                  tanaman_aktif_id: { type: 'string', format: 'uuid', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Jawaban kontekstual dari Gemini Chat API' },
        },
      },
    },
  },
};
