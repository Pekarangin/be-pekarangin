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
  SLEMAN_DISPERINDAG: 'SLEMAN_DISPERINDAG',
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

/** Default CDN Image URLs untuk 15 Komoditas Pangan Pekarangan */
export const KOMODITAS_DEFAULT_IMAGES = {
  'cabai rawit': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600',
  'cabai merah': 'https://images.unsplash.com/photo-1526346698789-22fd84314424?auto=format&fit=crop&q=80&w=600',
  'bawang merah': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=600',
  'tomat': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
  'bayam': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600',
  'kangkung': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=600',
  'selada': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=600',
  'sawi': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
  'wortel': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=600',
  'terong': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
  'kacang panjang': 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&q=80&w=600',
  'mentimun': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&q=80&w=600',
  'pare': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600',
  'kemangi': 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=600',
  'daun bawang': 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=600',
};

export function getDefaultKomoditasImage(nama) {
  if (!nama) return KOMODITAS_DEFAULT_IMAGES['sawi'];
  const key = nama.toLowerCase().trim();
  if (KOMODITAS_DEFAULT_IMAGES[key]) return KOMODITAS_DEFAULT_IMAGES[key];
  for (const [k, url] of Object.entries(KOMODITAS_DEFAULT_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return url;
  }
  return KOMODITAS_DEFAULT_IMAGES['sawi'];
}

export function getDefaultMediaTanam(luasMinM2) {
  const luas = Number(luasMinM2) || 0.25;
  if (luas <= 0.25) return 'Polybag / Pot 25-30cm / Vertikultur';
  return 'Polybag Besar 35-40cm / Bedengan';
}

