// ============================================================
// src/services/komoditas.service.js — Master Komoditas Service
// ============================================================
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Mengambil daftar seluruh master komoditas
 */
export async function getAllKomoditas() {
  const items = await prisma.komoditas.findMany({
    orderBy: { nama: 'asc' },
  });

  return items.map((k) => ({
    komoditas_id: k.id,
    nama: k.nama,
    kebutuhan_sinar: k.kebutuhanSinar,
    luas_min_m2: Number(k.luasMinM2),
    luas_optimal_m2: Number(k.luasOptimalM2),
    waktu_panen_hari: k.waktuPanenHari,
    konsumsi_rt_kg_per_bulan: Number(k.konsumsiRtKgPerBulan),
    tingkat_kesulitan: k.tingkatKesulitan,
    jadwal_siram_hari: k.jadwalSiramHari,
    jadwal_pupuk_hari: k.jadwalPupukHari,
    panduan_singkat: k.panduanSingkat,
  }));
}

/**
 * Mengambil detail satu komoditas beserta harga pasar terkini
 */
export async function getKomoditasById(id) {
  const k = await prisma.komoditas.findUnique({
    where: { id },
    include: {
      hargaKomoditas: {
        orderBy: { tanggalUpdate: 'desc' },
        take: 1,
      },
    },
  });

  if (!k) {
    throw new NotFoundError('Komoditas tidak ditemukan');
  }

  const latestHarga = k.hargaKomoditas[0];

  return {
    komoditas_id: k.id,
    nama: k.nama,
    kebutuhan_sinar: k.kebutuhanSinar,
    luas_min_m2: Number(k.luasMinM2),
    luas_optimal_m2: Number(k.luasOptimalM2),
    waktu_panen_hari: k.waktuPanenHari,
    konsumsi_rt_kg_per_bulan: Number(k.konsumsiRtKgPerBulan),
    tingkat_kesulitan: k.tingkatKesulitan,
    jadwal_siram_hari: k.jadwalSiramHari,
    jadwal_pupuk_hari: k.jadwalPupukHari,
    panduan_singkat: k.panduanSingkat,
    harga_terkini: latestHarga
      ? {
          harga_rp_per_kg: latestHarga.hargaRpPerKg,
          sumber: latestHarga.sumber,
          tanggal_update: latestHarga.tanggalUpdate.toISOString().split('T')[0],
          wilayah: latestHarga.wilayah,
        }
      : null,
  };
}
