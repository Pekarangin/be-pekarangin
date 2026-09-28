-- ============================================================
-- Migration 001: Initial Schema — Pekarang.in
-- Sumber: SSOT.md §5 (v1.1, 2026-09-27)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABEL: users
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id     VARCHAR(255) UNIQUE,
    avatar_url    TEXT,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Constraint: minimal salah satu auth method harus terisi
ALTER TABLE users ADD CONSTRAINT chk_auth_method
    CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL);

-- ============================================================
-- TABEL: lahan
-- ============================================================
CREATE TABLE lahan (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_lahan      VARCHAR(100) NOT NULL,
    luas_m2         DECIMAL(5,2) NOT NULL CHECK (luas_m2 >= 0.25),
    grid_snapshot   JSONB NOT NULL,
    paparan_sinar   VARCHAR(20) NOT NULL CHECK (paparan_sinar IN ('FULL_SUN', 'PARTIAL_SUN', 'SHADE')),
    sumber_paparan  VARCHAR(20) NOT NULL CHECK (sumber_paparan IN ('MANUAL', 'AI_VISION')),
    foto_url        TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lahan_user_id ON lahan(user_id);

-- ============================================================
-- TABEL: komoditas
-- ============================================================
CREATE TABLE komoditas (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama                     VARCHAR(50) UNIQUE NOT NULL,
    kebutuhan_sinar          VARCHAR(20) NOT NULL CHECK (kebutuhan_sinar IN ('FULL_SUN', 'PARTIAL_SUN', 'SHADE')),
    luas_min_m2              DECIMAL(4,2) NOT NULL,
    luas_optimal_m2          DECIMAL(4,2) NOT NULL,
    waktu_panen_hari         INT NOT NULL,
    konsumsi_rt_kg_per_bulan DECIMAL(5,2) NOT NULL,
    tingkat_kesulitan        VARCHAR(20) NOT NULL CHECK (tingkat_kesulitan IN ('MUDAH', 'SEDANG', 'SULIT')),
    jadwal_siram_hari        INT NOT NULL,
    jadwal_pupuk_hari        INT NOT NULL,
    panduan_singkat          TEXT
);

-- ============================================================
-- TABEL: harga_komoditas
-- ============================================================
CREATE TABLE harga_komoditas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    komoditas_id    UUID NOT NULL REFERENCES komoditas(id),
    harga_rp_per_kg INT NOT NULL,
    sumber          VARCHAR(50) NOT NULL,
    tanggal_update  DATE NOT NULL,
    wilayah         VARCHAR(100) NOT NULL
);

CREATE INDEX idx_harga_komoditas_id ON harga_komoditas(komoditas_id);
CREATE INDEX idx_harga_tanggal ON harga_komoditas(tanggal_update DESC);

-- ============================================================
-- TABEL: tanaman_aktif
-- ============================================================
CREATE TABLE tanaman_aktif (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lahan_id         UUID NOT NULL REFERENCES lahan(id) ON DELETE CASCADE,
    komoditas_id     UUID NOT NULL REFERENCES komoditas(id),
    tanggal_tanam    DATE NOT NULL,
    perkiraan_panen  DATE NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'AKTIF'
                     CHECK (status IN ('AKTIF', 'PANEN', 'GAGAL'))
);

CREATE INDEX idx_tanaman_user_id ON tanaman_aktif(user_id);
CREATE INDEX idx_tanaman_lahan_id ON tanaman_aktif(lahan_id);
CREATE INDEX idx_tanaman_status ON tanaman_aktif(status);

-- ============================================================
-- TABEL: catatan_harian
-- ============================================================
CREATE TABLE catatan_harian (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanaman_id    UUID NOT NULL REFERENCES tanaman_aktif(id) ON DELETE CASCADE,
    tanggal       DATE NOT NULL,
    siram_done    BOOLEAN DEFAULT FALSE,
    pupuk_done    BOOLEAN DEFAULT FALSE,
    catatan_bebas TEXT,
    UNIQUE(tanaman_id, tanggal)
);

CREATE INDEX idx_catatan_tanaman_id ON catatan_harian(tanaman_id);

-- ============================================================
-- TABEL: realisasi_panen
-- ============================================================
CREATE TABLE realisasi_panen (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tanaman_id        UUID NOT NULL REFERENCES tanaman_aktif(id) ON DELETE CASCADE,
    tanggal_panen     DATE NOT NULL,
    berat_panen_gram  INT NOT NULL,
    estimasi_hemat_rp INT NOT NULL
);

CREATE INDEX idx_realisasi_tanaman_id ON realisasi_panen(tanaman_id);
