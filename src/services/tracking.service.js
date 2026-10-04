// ============================================================
// src/services/tracking.service.js — Tracking Module Service
// Mengelola siklus tanam, checklist harian, dan realisasi panen
// Sumber: API_Contract_Pekarangin.md §4 & SSOT.md §5
// ============================================================
import prisma from '../config/database.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

/**
 * Format Date object to YYYY-MM-DD string
 * @param {Date|string} d 
 * @returns {string}
 */
export function formatDate(d) {
  if (!d) return null;
  if (d instanceof Date) {
    return d.toISOString().split('T')[0];
  }
  return String(d).split('T')[0];
}

/**
 * Menghitung metrik 'hari_ke' dari tanggal tanam (1-indexed)
 * @param {Date|string} tanggalTanam 
 * @returns {number}
 */
export function calculateHariKe(tanggalTanam) {
  const now = new Date();
  const tanam = new Date(tanggalTanam);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
     Date.UTC(tanam.getUTCFullYear(), tanam.getUTCMonth(), tanam.getUTCDate())) / msPerDay
  );
  return Math.max(1, diffDays + 1);
}

/**
 * Mengekstrak checklist hari ini dari list catatan harian
 * @param {Array} catatanHarianList 
 * @returns {{ siram_done: boolean, pupuk_done: boolean } | null}
 */
export function getChecklistHariIni(catatanHarianList) {
  if (!catatanHarianList || catatanHarianList.length === 0) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  const found = catatanHarianList.find(c => formatDate(c.tanggal) === todayStr);
  if (!found) return null;
  return {
    siram_done: found.siramDone,
    pupuk_done: found.pupukDone,
  };
}

/**
 * Mulai menanam komoditas di lahan (POST /tanaman-aktif)
 */
export async function startTracking({ userId, lahanId, komoditasId, tanggalTanam }) {
  // 1. Cek lahan & ownership
  const lahan = await prisma.lahan.findUnique({
    where: { id: lahanId },
  });
  if (!lahan) {
    throw new NotFoundError('Lahan tidak ditemukan');
  }
  if (lahan.userId !== userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke lahan ini');
  }

  // 2. Cek komoditas
  const komoditas = await prisma.komoditas.findUnique({
    where: { id: komoditasId },
  });
  if (!komoditas) {
    throw new NotFoundError('Komoditas tidak ditemukan');
  }

  // 3. Kalkulasi perkiraan panen = tanggal_tanam + waktu_panen_hari
  const tTanam = new Date(tanggalTanam + 'T00:00:00.000Z');
  const tPanen = new Date(tTanam.getTime() + komoditas.waktuPanenHari * 24 * 60 * 60 * 1000);

  // 4. Simpan ke database
  const tanaman = await prisma.tanamanAktif.create({
    data: {
      userId,
      lahanId,
      komoditasId,
      tanggalTanam: tTanam,
      perkiraanPanen: tPanen,
      status: 'AKTIF',
    },
    include: {
      komoditas: true,
    },
  });

  return {
    tanaman_aktif_id: tanaman.id,
    user_id: tanaman.userId,
    lahan_id: tanaman.lahanId,
    komoditas: {
      komoditas_id: tanaman.komoditas.id,
      nama: tanaman.komoditas.nama,
      waktu_panen_hari: tanaman.komoditas.waktuPanenHari,
      jadwal_siram_hari: tanaman.komoditas.jadwalSiramHari,
      jadwal_pupuk_hari: tanaman.komoditas.jadwalPupukHari,
    },
    tanggal_tanam: formatDate(tanaman.tanggalTanam),
    perkiraan_panen: formatDate(tanaman.perkiraanPanen),
    status: tanaman.status,
  };
}

/**
 * Mengambil daftar tanaman milik pengguna (GET /tanaman-aktif)
 */
export async function getTanamanList({ userId, status, lahanId }) {
  const where = {
    userId,
  };

  if (status) {
    where.status = status;
  }
  if (lahanId) {
    where.lahanId = lahanId;
  }

  const list = await prisma.tanamanAktif.findMany({
    where,
    include: {
      lahan: {
        select: { namaLahan: true },
      },
      komoditas: {
        select: { nama: true },
      },
      catatanHarian: {
        orderBy: { tanggal: 'desc' },
      },
    },
    orderBy: {
      tanggalTanam: 'desc',
    },
  });

  return list.map(item => ({
    tanaman_aktif_id: item.id,
    lahan_nama: item.lahan.namaLahan,
    komoditas_nama: item.komoditas.nama,
    tanggal_tanam: formatDate(item.tanggalTanam),
    perkiraan_panen: formatDate(item.perkiraanPanen),
    status: item.status,
    hari_ke: calculateHariKe(item.tanggalTanam),
    checklist_hari_ini: getChecklistHariIni(item.catatanHarian),
  }));
}

/**
 * Mengambil detail satu tanaman aktif (GET /tanaman-aktif/:id)
 */
export async function getTanamanDetail({ id, userId }) {
  const tanaman = await prisma.tanamanAktif.findUnique({
    where: { id },
    include: {
      lahan: {
        select: { id: true, namaLahan: true },
      },
      komoditas: true,
    },
  });

  if (!tanaman) {
    throw new NotFoundError('Tanaman aktif tidak ditemukan');
  }

  if (tanaman.userId !== userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke tanaman ini');
  }

  return {
    tanaman_aktif_id: tanaman.id,
    lahan: {
      lahan_id: tanaman.lahan.id,
      nama_lahan: tanaman.lahan.namaLahan,
    },
    komoditas: {
      komoditas_id: tanaman.komoditas.id,
      nama: tanaman.komoditas.nama,
      waktu_panen_hari: tanaman.komoditas.waktuPanenHari,
      jadwal_siram_hari: tanaman.komoditas.jadwalSiramHari,
      jadwal_pupuk_hari: tanaman.komoditas.jadwalPupukHari,
      panduan_singkat: tanaman.komoditas.panduanSingkat,
    },
    tanggal_tanam: formatDate(tanaman.tanggalTanam),
    perkiraan_panen: formatDate(tanaman.perkiraanPanen),
    status: tanaman.status,
    hari_ke: calculateHariKe(tanaman.tanggalTanam),
  };
}

/**
 * Submit / Upsert checklist perawatan harian (POST /tanaman-aktif/:id/checklist)
 */
export async function upsertChecklist({ tanamanId, userId, tanggal, siramDone, pupukDone, catatan }) {
  const tanaman = await prisma.tanamanAktif.findUnique({
    where: { id: tanamanId },
  });

  if (!tanaman) {
    throw new NotFoundError('Tanaman aktif tidak ditemukan');
  }

  if (tanaman.userId !== userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke tanaman ini');
  }

  if (tanaman.status !== 'AKTIF') {
    throw new BadRequestError('Checklist hanya dapat dicatat untuk tanaman yang berstatus AKTIF');
  }

  const tanggalDate = new Date(tanggal + 'T00:00:00.000Z');

  const checklist = await prisma.catatanHarian.upsert({
    where: {
      tanamanId_tanggal: {
        tanamanId,
        tanggal: tanggalDate,
      },
    },
    update: {
      siramDone,
      pupukDone,
      catatanBebas: catatan !== undefined ? catatan : null,
    },
    create: {
      tanamanId,
      tanggal: tanggalDate,
      siramDone,
      pupukDone,
      catatanBebas: catatan || null,
    },
  });

  return {
    catatan_id: checklist.id,
    tanaman_id: checklist.tanamanId,
    tanggal: formatDate(checklist.tanggal),
    siram_done: checklist.siramDone,
    pupuk_done: checklist.pupukDone,
    catatan: checklist.catatanBebas,
  };
}

/**
 * Riwayat checklist perawatan tanaman (GET /tanaman-aktif/:id/checklist)
 */
export async function getChecklistHistory({ tanamanId, userId, dari, sampai }) {
  const tanaman = await prisma.tanamanAktif.findUnique({
    where: { id: tanamanId },
  });

  if (!tanaman) {
    throw new NotFoundError('Tanaman aktif tidak ditemukan');
  }

  if (tanaman.userId !== userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke tanaman ini');
  }

  const where = {
    tanamanId,
  };

  if (dari || sampai) {
    where.tanggal = {};
    if (dari) {
      where.tanggal.gte = new Date(dari + 'T00:00:00.000Z');
    }
    if (sampai) {
      where.tanggal.lte = new Date(sampai + 'T23:59:59.999Z');
    }
  }

  const history = await prisma.catatanHarian.findMany({
    where,
    orderBy: {
      tanggal: 'asc',
    },
  });

  return history.map(item => ({
    catatan_id: item.id,
    tanggal: formatDate(item.tanggal),
    siram_done: item.siramDone,
    pupuk_done: item.pupukDone,
    catatan: item.catatanBebas,
  }));
}

/**
 * Catat realisasi panen (POST /tanaman-aktif/:id/panen)
 */
export async function recordPanen({ tanamanId, userId, tanggalPanen, beratPanenGram }) {
  const tanaman = await prisma.tanamanAktif.findUnique({
    where: { id: tanamanId },
    include: {
      komoditas: true,
    },
  });

  if (!tanaman) {
    throw new NotFoundError('Tanaman aktif tidak ditemukan');
  }

  if (tanaman.userId !== userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke tanaman ini');
  }

  if (tanaman.status !== 'AKTIF') {
    throw new BadRequestError('Hanya tanaman berstatus AKTIF yang dapat dipanen');
  }

  // Ambil harga komoditas terkini
  const latestPrice = await prisma.hargaKomoditas.findFirst({
    where: { komoditasId: tanaman.komoditasId },
    orderBy: { tanggalUpdate: 'desc' },
  });
  const hargaPerKg = latestPrice ? latestPrice.hargaRpPerKg : 0;
  const estimasiHematRp = Math.round((beratPanenGram / 1000) * hargaPerKg);

  const tPanen = new Date(tanggalPanen + 'T00:00:00.000Z');

  // Jalankan transaksi: create RealisasiPanen + update status TanamanAktif -> PANEN
  const [realisasi] = await prisma.$transaction([
    prisma.realisasiPanen.create({
      data: {
        tanamanId,
        tanggalPanen: tPanen,
        beratPanenGram,
        estimasiHematRp,
      },
    }),
    prisma.tanamanAktif.update({
      where: { id: tanamanId },
      data: { status: 'PANEN' },
    }),
  ]);

  return {
    realisasi_id: realisasi.id,
    tanaman_aktif_id: tanaman.id,
    tanggal_panen: formatDate(realisasi.tanggalPanen),
    berat_panen_gram: realisasi.beratPanenGram,
    estimasi_hemat_rp: realisasi.estimasiHematRp,
    status: 'PANEN',
  };
}

/**
 * Tutup siklus tanam sebagai GAGAL (PATCH /tanaman-aktif/:id/status)
 */
export async function markGagal({ tanamanId, userId }) {
  const tanaman = await prisma.tanamanAktif.findUnique({
    where: { id: tanamanId },
  });

  if (!tanaman) {
    throw new NotFoundError('Tanaman aktif tidak ditemukan');
  }

  if (tanaman.userId !== userId) {
    throw new ForbiddenError('Anda tidak memiliki akses ke tanaman ini');
  }

  if (tanaman.status !== 'AKTIF') {
    throw new BadRequestError('Hanya tanaman berstatus AKTIF yang dapat ditandai gagal');
  }

  const updated = await prisma.tanamanAktif.update({
    where: { id: tanamanId },
    data: { status: 'GAGAL' },
  });

  return {
    tanaman_aktif_id: updated.id,
    status: updated.status,
    message: 'Siklus tanam ditutup sebagai gagal',
  };
}
