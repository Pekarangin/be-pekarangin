// ============================================================
// src/utils/constants.js — Enum values & constants
// Ref: SSOT §5, §6
// ============================================================

/** Paparan sinar lahan */
export const PAPARAN_SINAR = {
  FULL_SUN: 'FULL_SUN',
  PARTIAL_SUN: 'PARTIAL_SUN',
  SHADE: 'SHADE',
};

/** Sumber penentuan paparan sinar */
export const SUMBER_PAPARAN = {
  MANUAL: 'MANUAL',
  AI_VISION: 'AI_VISION',
};

/** Tingkat kesulitan komoditas */
export const TINGKAT_KESULITAN = {
  MUDAH: 'MUDAH',
  SEDANG: 'SEDANG',
  SULIT: 'SULIT',
};

/** Status tanaman aktif */
export const STATUS_TANAMAN = {
  AKTIF: 'AKTIF',
  PANEN: 'PANEN',
  GAGAL: 'GAGAL',
};

/** Sumber data harga */
export const SUMBER_HARGA = {
  BAPANAS: 'BAPANAS',
  PIHPS_BI: 'PIHPS_BI',
};

/** Label kesesuaian cahaya (output rekomendasi) */
export const KESESUAIAN_SINAR = {
  COCOK: 'COCOK',
  KURANG_COCOK: 'KURANG_COCOK',
  TIDAK_COCOK: 'TIDAK_COCOK',
};

/**
 * Matriks kesesuaian cahaya.
 * Akses: SUNLIGHT_MATRIX[kebutuhanTanaman][paparanLahan] → faktor (number)
 *
 * ⚠️ Perlu review dari AI/Data Engineer.
 * Ref: SSOT §2 — Matriks Kesesuaian Cahaya
 */
export const SUNLIGHT_MATRIX = {
  FULL_SUN: {
    FULL_SUN: 1.0,
    PARTIAL_SUN: 0.6,
    SHADE: 0.2,
  },
  PARTIAL_SUN: {
    FULL_SUN: 0.6,
    PARTIAL_SUN: 1.0,
    SHADE: 0.6,
  },
  SHADE: {
    FULL_SUN: 0.2,
    PARTIAL_SUN: 0.6,
    SHADE: 1.0,
  },
};

/** Grid configuration */
export const GRID = {
  ROWS: 8,
  COLS: 8,
  CELL_SIZE_M2: 0.25,
  MAX_CELLS: 64,       // 8 × 8
  MAX_AREA_M2: 16.0,   // 64 × 0.25
};
