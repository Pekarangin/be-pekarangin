// ============================================================
// src/services/scoring.service.js — Crop Priority Scoring Engine
// Formula Inti Pekarang.in (SSOT §2 & API Contract §3)
// ============================================================
import prisma from '../config/database.js';
import {
  SUNLIGHT_MATRIX,
  KESESUAIAN_SINAR,
} from '../utils/constants.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

/**
 * Mendapatkan faktor kesesuaian cahaya berdasarkan kebutuhan tanaman vs paparan lahan.
 * @param {string} kebutuhanTanaman - 'FULL_SUN' | 'PARTIAL_SUN' | 'SHADE'
 * @param {string} paparanLahan - 'FULL_SUN' | 'PARTIAL_SUN' | 'SHADE'
 * @returns {number} Koefisien faktor (1.0, 0.6, atau 0.2)
 */
export function getSunlightFactor(kebutuhanTanaman, paparanLahan) {
  if (
    SUNLIGHT_MATRIX[kebutuhanTanaman] &&
    SUNLIGHT_MATRIX[kebutuhanTanaman][paparanLahan] !== undefined
  ) {
    return SUNLIGHT_MATRIX[kebutuhanTanaman][paparanLahan];
  }
  return 0.6; // Fallback jika tidak terdefinisi
}

/**
 * Memetakan nilai faktor kesesuaian ke badge label
 * @param {number} factor - 1.0, 0.6, atau 0.2
 * @returns {string} 'COCOK' | 'KURANG_COCOK' | 'TIDAK_COCOK'
 */
export function mapKesesuaianLabel(factor) {
  if (factor >= 1.0) return KESESUAIAN_SINAR.COCOK;
  if (factor >= 0.6) return KESESUAIAN_SINAR.KURANG_COCOK;
  return KESESUAIAN_SINAR.TIDAK_COCOK;
}

/**
 * Menghitung skor prioritas komoditas sesuai formula SSOT §2
 * Skor = (Estimasi_Hemat_Rp_per_bulan ÷ Luas_Kebutuhan_m2) ÷ Waktu_Panen_hari × Faktor_Kesesuaian_Cahaya
 *
 * @param {object} params
 * @param {number} params.estimasiHematPerBulan - Hasil kali Harga Pasar x Konsumsi RT/bulan
 * @param {number} params.luasMinM2 - Luas minimal m2
 * @param {number} params.waktuPanenHari - Durasi panen hari
 * @param {number} params.sunlightFactor - Koefisien cahaya
 * @returns {number} Skor prioritas (dibulatkan 2 desimal)
 */
export function calculateScore({
  estimasiHematPerBulan,
  luasMinM2,
  waktuPanenHari,
  sunlightFactor,
}) {
  if (luasMinM2 <= 0 || waktuPanenHari <= 0) return 0;

  const rawScore =
    (estimasiHematPerBulan / luasMinM2 / waktuPanenHari) * sunlightFactor;

  // Bulatkan 2 angka di belakang koma
  return Math.round(rawScore * 100) / 100;
}

/**
 * Menjalankan kalkulasi rekomendasi untuk profil lahan tertentu
 * @param {string} userId - ID pengguna yang login
 * @param {string} lahanId - ID lahan yang akan dianalisis
 */
export async function getRecommendationsForLahan(userId, lahanId) {
  // 1. Ambil data lahan dan verifikasi kepemilikan
  const lahan = await prisma.lahan.findUnique({
    where: { id: lahanId },
  });

  if (!lahan) {
    throw new NotFoundError('Lahan tidak ditemukan');
  }

  if (lahan.userId !== userId) {
    throw new ForbiddenError('Akses ditolak: Lahan ini bukan milik Anda');
  }

  // 2. Ambil seluruh komoditas beserta riwayat harga terbarunya
  const allKomoditas = await prisma.komoditas.findMany({
    include: {
      hargaKomoditas: {
        orderBy: { tanggalUpdate: 'desc' },
        take: 1,
      },
    },
  });

  // Cari tanggal update harga paling mutakhir di antara seluruh komoditas
  let latestPriceDate = null;

  for (const k of allKomoditas) {
    const latestHarga = k.hargaKomoditas[0];
    if (latestHarga && latestHarga.tanggalUpdate) {
      if (!latestPriceDate || latestHarga.tanggalUpdate > latestPriceDate) {
        latestPriceDate = latestHarga.tanggalUpdate;
      }
    }
  }

  const formattedPriceDate = latestPriceDate
    ? latestPriceDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // 3. Hitung skor untuk tiap komoditas
  const recommendations = allKomoditas.map((k) => {
    const latestHarga = k.hargaKomoditas[0];
    const hargaPasarPerKg = latestHarga ? latestHarga.hargaRpPerKg : 15000;
    const konsumsiRt = Number(k.konsumsiRtKgPerBulan);
    const luasMin = Number(k.luasMinM2);
    const waktuPanen = k.waktuPanenHari;

    // Estimasi hemat per bulan = harga per kg x konsumsi bulanan
    const estimasiHematRpPerBulan = Math.round(hargaPasarPerKg * konsumsiRt);

    // Faktor kesesuaian cahaya
    const sunlightFactor = getSunlightFactor(k.kebutuhanSinar, lahan.paparanSinar);
    const kesesuaianSinar = mapKesesuaianLabel(sunlightFactor);

    // Hitung skor prioritas
    const skorPrioritas = calculateScore({
      estimasiHematPerBulan: estimasiHematRpPerBulan,
      luasMinM2: luasMin,
      waktuPanenHari: waktuPanen,
      sunlightFactor,
    });

    return {
      komoditas_id: k.id,
      nama: k.nama,
      skor_prioritas: skorPrioritas,
      estimasi_hemat_rp_per_bulan: estimasiHematRpPerBulan,
      waktu_panen_hari: waktuPanen,
      luas_dibutuhkan_m2: luasMin,
      tingkat_kesulitan: k.tingkatKesulitan,
      kesesuaian_sinar: kesesuaianSinar,
      harga_pasar_per_kg: hargaPasarPerKg,
      konsumsi_rt_kg_per_bulan: konsumsiRt,
    };
  });

  // 4. Urutkan dari skor prioritas tertinggi ke terendah (descending)
  recommendations.sort((a, b) => b.skor_prioritas - a.skor_prioritas);

  return {
    lahan_id: lahan.id,
    lahan_nama: lahan.namaLahan,
    lahan_luas_m2: Number(lahan.luasM2),
    lahan_paparan_sinar: lahan.paparanSinar,
    harga_update_terakhir: formattedPriceDate,
    rekomendasi: recommendations,
  };
}
