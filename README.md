# 🌱 Pekarang.in — Backend REST API & Decision Engine
> **Platform Smart Urban Farming & Ketahanan Pangan Mandiri**  
> *Kompetisi Multimedia and Game Event (MAGE) 12 — Institut Teknologi Sepuluh Nopember (ITS)*

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%2B%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v6.4-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20Alpine-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 1. Ringkasan Proyek

**Pekarang.in Backend** adalah layanan REST API terpusat yang menjadi otak komputasi platform Pekarang.in. Backend ini dirancang untuk menyelesaikan tantangan ketahanan pangan masyarakat perkotaan dengan mengubah lahan pekarangan rumah tangga yang terbatas menjadi sumber pangan produktif melalui integrasi kecerdasan buatan (*AI Computer Vision* & *LLM Chatbot*) dan sistem pendukung keputusan (*Decision Support Engine*).

### 🎯 Fitur & Tanggung Jawab Utama:
1. **Autentikasi & Manajemen Pengguna:** Registrasi/Login via JWT dan Google OAuth, enkripsi password Bcrypt, serta pembaruan profil user (wilayah Kemendagri hingga tingkat kelurahan).
2. **Manajemen & Pemetaan Lahan:** Pencatatan profil lahan fleksibel (interaktif grid 8×8 maupun input luas manual m²).
3. **Analisis Paparan Cahaya AI (Gemini 2.5 Flash Vision):** Menganalisis kondisi pencahayaan pekarangan langsung dari foto kamera pengguna (`FULL_SUN`, `PARTIAL_SUN`, `SHADE`) dengan sistem *fail-safe* dan *heuristic fallback*.
4. **Crop Priority Scoring Engine:** Algoritma pemeringkatan komoditas pangan multi-kriteria berbasis nilai ekonomi pasar, durasi panen, kebutuhan luas, dan kecocokan agronomis.
5. **Monitoring Siklus Tanam (Cultivation Tracking):** Manajemen siklus tanaman aktif (`AKTIF` $\rightarrow$ `PANEN` / `GAGAL`), jadwal penyiraman dan pemupukan harian persisten, riwayat perawatan, dan pencatatan panen aktual.
6. **Kalkulasi Penghematan Ekonomi Riil:** Integrasi harga komoditas pasar harian (SIHARPA Sleman / BAPANAS) untuk menghitung kilogram panen serta nominal rupiah yang dihemat rumah tangga secara riil.
7. **AI Farming Assistant Proxy:** Layanan konsultasi interaktif agrikultur kontekstual dengan injeksi data tanaman aktif pengguna.

---

## 🏗️ 2. Arsitektur Sistem & Direktori

Backend menggunakan pola **Layered Clean Architecture** dengan pemisahan tanggung jawab yang ketat:
* **Routes:** Routing URL, middleware chaining, validasi schema HTTP.
* **Controllers:** Parsing request, delegasi ke business logic, standarisasi format response.
* **Services:** Business logic murni, algoritma scoring, integrasi AI External & Prisma ORM.
* **Database / Models:** Relational schema PostgreSQL yang dikelola via Prisma ORM.

```text
be-pekarangin/
├── src/
│   ├── app.js                   # Inisialisasi Express, middleware global, mount route, Scalar docs
│   ├── server.js                # Server entry point, koneksi DB pool, listener port
│   ├── config/
│   │   ├── database.js          # Prisma Client singleton instance
│   │   └── env.js               # Validasi & parsing environment variables
│   ├── controllers/             # HTTP Handlers
│   │   ├── auth.controller.js
│   │   ├── lahan.controller.js
│   │   ├── rekomendasi.controller.js
│   │   ├── tracking.controller.js
│   │   └── aiInsight.controller.js
│   ├── services/                # Core Business Logic
│   │   ├── auth.service.js
│   │   ├── lahan.service.js
│   │   ├── scoring.service.js   # ⭐ Crop Priority Scoring Algorithm
│   │   ├── tracking.service.js  # Siklus tanam, checklist harian, panen
│   │   ├── geminiVision.service.js # Integrasi Gemini 2.5 Flash Vision
│   │   └── aiInsight.service.js    # AI Agronomy Chatbot & Context Injection
│   ├── middlewares/
│   │   ├── authenticate.js      # Verifikasi token JWT Bearer
│   │   ├── validate.js          # Request validator result checker
│   │   └── errorHandler.js      # Global error handler terpusat
│   ├── routes/
│   │   ├── index.js             # Route aggregator (/api/v1)
│   │   ├── auth.routes.js
│   │   ├── lahan.routes.js
│   │   ├── rekomendasi.routes.js
│   │   ├── tracking.routes.js
│   │   └── aiInsight.routes.js
│   └── utils/
│       ├── response.js          # Helper sendSuccess & sendError
│       ├── errors.js            # Custom Error Hierarchy (AppError, ValidationError, NotFoundError, dll)
│       └── constants.js         # Matriks kesesuaian cahaya, enum, default fallback
├── prisma/
│   ├── schema.prisma            # Skema Database PostgreSQL
│   └── seed.js                  # Seeding otomatis 15 komoditas & harga pasar harian
├── tests/                       # Automated Test Suites (100% Passing)
│   ├── test_auth.js             # 33 test cases
│   ├── test_lahan.js            # 44 test cases
│   ├── test_rekomendasi.js      # 49 test cases
│   ├── test_tracking.js         # 65 test cases
│   └── test_ai_insight.js       # 21 test cases
├── Dockerfile                   # Multi-stage Docker build (development & production)
└── package.json
```

---

## 🗄️ 3. Skema Database (Entity-Relationship Diagram)

```mermaid
erDiagram
    users ||--o{ lahan : owns
    users ||--o{ tanaman_aktif : manages
    lahan ||--o{ tanaman_aktif : hosts
    komoditas ||--o{ harga_komoditas : tracks_price
    komoditas ||--o{ tanaman_aktif : categorizes
    tanaman_aktif ||--o{ catatan_harian : records_care
    tanaman_aktif ||--o| realisasi_panen : yields

    users {
        uuid id PK
        varchar nama
        varchar email UK
        varchar password_hash
        varchar google_id UK
        varchar avatar_url
        varchar wilayah
        timestamp created_at
    }

    lahan {
        uuid id PK
        uuid user_id FK
        varchar nama_lahan
        decimal luas_m2
        json grid_snapshot
        enum paparan_sinar
        enum sumber_paparan
        text foto_url
        timestamp created_at
    }

    komoditas {
        uuid id PK
        varchar nama UK
        enum kebutuhan_sinar
        decimal luas_min_m2
        decimal luas_optimal_m2
        int waktu_panen_hari
        decimal konsumsi_rt_kg_per_bulan
        enum tingkat_kesulitan
        int jadwal_siram_hari
        int jadwal_pupuk_hari
        text panduan_singkat
        text image_url
    }

    harga_komoditas {
        uuid id PK
        uuid komoditas_id FK
        int harga_rp_per_kg
        varchar sumber
        date tanggal_update
        varchar wilayah
    }

    tanaman_aktif {
        uuid id PK
        uuid user_id FK
        uuid lahan_id FK
        uuid komoditas_id FK
        date tanggal_tanam
        date perkiraan_panen
        enum status
    }

    catatan_harian {
        uuid id PK
        uuid tanaman_id FK
        date tanggal
        boolean siram_done
        boolean pupuk_done
        text catatan_bebas
    }

    realisasi_panen {
        uuid id PK
        uuid tanaman_id FK
        date tanggal_panen
        int berat_panen_gram
        int estimasi_hemat_rp
    }
```

---

## 🧮 4. Crop Priority Scoring Engine (Algoritma Penilaian)

Sistem rekomendasi menggunakan formula matematis deterministik yang menghitung skor prioritas setiap varietas tanaman berdasarkan kondisi lahan pengguna:

$$\text{Skor Prioritas} = \left( \frac{\text{Estimasi Hemat Bulanan}}{\text{Luas Minimal } (\text{m}^2)} \div \text{Waktu Panen (hari)} \right) \times \text{Faktor Sinar} \times \text{Faktor Luas}$$

Dimana:
1. **$\text{Estimasi Hemat Bulanan}$** $= \text{Harga Pasar per kg} \times \text{Konsumsi RT (kg/bulan)}$
2. **$\text{Faktor Sinar}$** ditentukan oleh matriks kebutuhan vs ketersediaan cahaya:
   - Sesuai (`COCOK`) = $1.0$
   - Cukup (`KURANG_COCOK`) = $0.6$
   - Kurang Sesuai (`TIDAK_COCOK`) = $0.2$
3. **$\text{Faktor Luas}$ (Penalti Lahan Sempit):**
   - Jika $\text{Luas Lahan} \ge \text{Luas Minimal}$, $\text{Faktor Luas} = 1.0$ (`luas_cukup: true`).
   - Jika $\text{Luas Lahan} < \text{Luas Minimal}$, $\text{Faktor Luas} = \max\left(0.2, \frac{\text{Luas Lahan}}{\text{Luas Minimal}}\right)$ dan status diturunkan menjadi `KURANG_COCOK` disertai catatan edukatif.

---

## 📡 5. Ringkasan Endpoint REST API

Dokumentasi interaktif OpenAPI / Scalar tersedia langsung di:  
👉 **`http://localhost:3000/docs`** (atau via domain production)

Base URL: `/api/v1`

| Modul | Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | Publik | Status server & koneksi database |
| **Auth** | `POST` | `/auth/register` | Publik | Registrasi akun baru |
| **Auth** | `POST` | `/auth/login` | Publik | Login via email & password |
| **Auth** | `POST` | `/auth/google` | Publik | Autentikasi via Google OAuth ID Token |
| **Auth** | `GET` | `/auth/me` | Bearer | Ambil profil user yang sedang login |
| **Auth** | `PUT` | `/auth/me` | Bearer | Update nama, wilayah domisili, atau avatar |
| **Lahan** | `POST` | `/lahan` | Bearer | Simpan profil lahan baru (grid atau manual) |
| **Lahan** | `POST` | `/lahan/analisis-cahaya` | Bearer | Upload foto lahan $\rightarrow$ analisis Gemini AI |
| **Lahan** | `GET` | `/lahan` | Bearer | Daftar seluruh lahan milik pengguna |
| **Lahan** | `GET` | `/lahan/:id` | Bearer | Detail informasi satu lahan |
| **Lahan** | `PUT` | `/lahan/:id` | Bearer | Update profil lahan |
| **Lahan** | `DELETE`| `/lahan/:id` | Bearer | Hapus lahan (cascade delete ke tanaman) |
| **Rekomendasi**| `GET` | `/lahan/:id/rekomendasi`| Bearer | Hasil pemeringkatan 15 komoditas untuk lahan |
| **Komoditas** | `GET` | `/komoditas` | Bearer | Master data 15 komoditas pangan |
| **Komoditas** | `GET` | `/komoditas/:id` | Bearer | Detail satu komoditas & harga pasar terkini |
| **Tracking** | `POST` | `/tanaman-aktif` | Bearer | Mulai siklus tanam baru |
| **Tracking** | `GET` | `/tanaman-aktif` | Bearer | Daftar tanaman aktif + data realisasi panen |
| **Tracking** | `GET` | `/tanaman-aktif/:id` | Bearer | Detail tanaman, hari ke-n, dan progres |
| **Tracking** | `POST` | `/tanaman-aktif/:id/checklist` | Bearer | Catat/upsert checklist siram & pupuk harian |
| **Tracking** | `GET` | `/tanaman-aktif/:id/checklist` | Bearer | Riwayat log perawatan tanaman |
| **Tracking** | `POST` | `/tanaman-aktif/:id/panen` | Bearer | Catat hasil panen aktual (gram & penghematan) |
| **Tracking** | `PATCH`| `/tanaman-aktif/:id/status`| Bearer | Tutup siklus tanam sebagai `GAGAL` |
| **AI Insight** | `POST` | `/ai-insight/chat` | Bearer | Konsultasi chatbot pertanian kontekstual |

---

## 🚀 6. Panduan Instalasi & Menjalankan (Local Development)

### Prasyarat:
* **Node.js** v20.x atau lebih baru (`node -v`)
* **npm** v10.x atau lebih baru (`npm -v`)
* **PostgreSQL 16** (atau menggunakan **Docker Desktop**)

### Langkah 1: Clone & Masuk Direktori
```bash
git clone https://github.com/Pekarangin/be-pekarangin.git
cd be-pekarangin
```

### Langkah 2: Install Dependencies
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan nilai konfigurasi di `.env`:
```env
PORT=3000
NODE_ENV=development

# PostgreSQL Connection String
DATABASE_URL=postgresql://pekarangin:pekarangin_secret@localhost:5432/pekarangin_dev

# JWT Authentication
JWT_SECRET=dev_jwt_secret_ganti_ini_di_production_minimal_32_char
JWT_EXPIRES_IN=7d

# Google Gemini API Key (Vision & Chat)
GEMINI_API_KEY=your_gemini_api_key_here

# Microservice AI URL (Opsional / fallback ke Gemini langsung)
AI_SERVICE_URL=https://ai-pekarangin-production.up.railway.app
```

### Langkah 4: Sinkronisasi Skema Database & Seeding
```bash
# Push skema prisma ke database PostgreSQL
npm run prisma:push

# Jalankan seeding otomatis 15 komoditas & harga pasar
npm run db:seed
```

### Langkah 5: Jalankan Server Backend
```bash
# Mode development dengan hot-reload (Nodemon)
npm run dev

# Mode production
npm start
```

Server akan aktif di: **`http://localhost:3000`**  
Dokumentasi API Scalar: **`http://localhost:3000/docs`**

---

## 🐳 7. Menjalankan via Docker Compose

Jika menggunakan Docker, seluruh backend dan PostgreSQL dapat dijalankan dengan satu perintah:

```bash
# Dari root workspace (folder infra-pekarangin)
cd ../infra-pekarangin
docker compose up --build -d
```

Untuk menghentikan kontainer:
```bash
docker compose down
```

---

## 🧪 8. Menjalankan Automated Test Suites

Backend Pekarang.in dilengkapi dengan rangkaian *end-to-end integration test* komprehensif yang menguji validasi, otorisasi token, logic scoring, dan persistensi database:

```bash
# Jalankan seluruh test suite sekaligus (212 assertions)
npm test

# Atau jalankan per modul secara spesifik:
npm run test:auth          # 33 tests — Register, Login, JWT, Google OAuth, PUT /auth/me
npm run test:lahan         # 44 tests — CRUD Lahan, Grid 8x8, Manual Input, Vision Upload
npm run test:rekomendasi   # 49 tests — Scoring Formula, Kesesuaian Cahaya, Luas Penalti
npm run test:tracking      # 65 tests — Siklus Tanam, Checklist Harian, Realisasi Panen
npm run test:ai            # 21 tests — Chatbot Pertanian, Konteks Tanaman, Sanitasi Error
```

**Status Pengujian Terakhir:**  
`✅ 212 passed, 0 failed (100% SUCCESS)`

---

## 👥 Tim Pengembang (MAGE 12 ITS)

* **Backend Engineer:** Faris Andi Muhammad
* **Frontend Mobile Engineer:** Aditya Pratama
* **AI & Data Engineer:** Muhammad Davin Al Hisyam

---

## 📄 Lisensi
© 2026 Tim Pekarang.in — Dikembangkan untuk kompetisi MAGE 12 ITS.
