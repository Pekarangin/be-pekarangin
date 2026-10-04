// ============================================================
// src/services/lahan.service.js — Lahan Business Logic (Prisma ORM)
// ============================================================
import prisma from '../config/database.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors.js';
import { GRID } from '../utils/constants.js';

/**
 * Validasi array snapshot grid
 * Harus berupa array integer 0-indexed dengan rentang 0 s.d. 63 (grid 8x8)
 */
function validateGridSnapshot(gridSnapshot) {
  if (!Array.isArray(gridSnapshot) || gridSnapshot.length === 0) {
    throw new ValidationError('grid_snapshot harus berupa array dan minimal memilih 1 sel');
  }

  for (const cell of gridSnapshot) {
    if (!Number.isInteger(cell) || cell < 0 || cell >= GRID.MAX_CELLS) {
      throw new ValidationError(
        `Indeks sel grid tidak valid: ${cell}. Nilai harus berupa integer antara 0 dan ${GRID.MAX_CELLS - 1}`
      );
    }
  }

  // Cek duplikat sel
  const uniqueCells = new Set(gridSnapshot);
  if (uniqueCells.size !== gridSnapshot.length) {
    throw new ValidationError('grid_snapshot tidak boleh memuat indeks sel yang duplikat');
  }
}

/**
 * Buat profil lahan baru
 */
export async function createLahan(userId, data) {
  const {
    nama_lahan,
    grid_snapshot,
    luas_m2,
    paparan_sinar,
    sumber_paparan,
    foto_url,
  } = data;

  // 1. Validasi grid snapshot
  validateGridSnapshot(grid_snapshot);

  // 2. Validasi luas_m2 sesuai formula: length * 0.25
  const expectedLuas = grid_snapshot.length * GRID.CELL_SIZE_M2;
  const actualLuas = Number(luas_m2);

  if (Math.abs(actualLuas - expectedLuas) > 0.001) {
    throw new ValidationError(
      `luas_m2 (${actualLuas}) tidak sesuai dengan jumlah sel terpilih (${grid_snapshot.length} sel × ${GRID.CELL_SIZE_M2} = ${expectedLuas} m2)`
    );
  }

  // 3. Simpan lahan baru ke database
  const lahan = await prisma.lahan.create({
    data: {
      userId,
      namaLahan: nama_lahan.trim(),
      luasM2: actualLuas,
      gridSnapshot: grid_snapshot,
      paparanSinar: paparan_sinar,
      sumberPaparan: sumber_paparan,
      fotoUrl: foto_url || null,
    },
  });

  return {
    lahan_id: lahan.id,
    user_id: lahan.userId,
    nama_lahan: lahan.namaLahan,
    luas_m2: Number(lahan.luasM2),
    grid_snapshot: lahan.gridSnapshot,
    paparan_sinar: lahan.paparanSinar,
    sumber_paparan: lahan.sumberPaparan,
    foto_url: lahan.fotoUrl,
    created_at: lahan.createdAt,
  };
}

/**
 * Ambil seluruh lahan milik user yang sedang login
 */
export async function getLahanList(userId) {
  const lahans = await prisma.lahan.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          tanamanAktif: {
            where: { status: 'AKTIF' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return lahans.map((l) => ({
    lahan_id: l.id,
    nama_lahan: l.namaLahan,
    luas_m2: Number(l.luasM2),
    paparan_sinar: l.paparanSinar,
    jumlah_tanaman_aktif: l._count.tanamanAktif,
    created_at: l.createdAt,
  }));
}

/**
 * Ambil detail satu lahan spesifik
 */
export async function getLahanById(userId, lahanId) {
  const lahan = await prisma.lahan.findUnique({
    where: { id: lahanId },
  });

  if (!lahan) {
    throw new NotFoundError('Lahan tidak ditemukan');
  }

  if (lahan.userId !== userId) {
    throw new ForbiddenError('Akses ditolak: Lahan ini bukan milik Anda');
  }

  return {
    lahan_id: lahan.id,
    user_id: lahan.userId,
    nama_lahan: lahan.namaLahan,
    luas_m2: Number(lahan.luasM2),
    grid_snapshot: lahan.gridSnapshot,
    paparan_sinar: lahan.paparanSinar,
    sumber_paparan: lahan.sumberPaparan,
    foto_url: lahan.fotoUrl,
    created_at: lahan.createdAt,
  };
}

/**
 * Update profil lahan (partial update)
 */
export async function updateLahan(userId, lahanId, updateData) {
  // Cek kepemilikan lahan
  const existing = await prisma.lahan.findUnique({
    where: { id: lahanId },
  });

  if (!existing) {
    throw new NotFoundError('Lahan tidak ditemukan');
  }

  if (existing.userId !== userId) {
    throw new ForbiddenError('Akses ditolak: Lahan ini bukan milik Anda');
  }

  const dataToUpdate = {};

  if (updateData.nama_lahan !== undefined) {
    dataToUpdate.namaLahan = updateData.nama_lahan.trim();
  }

  if (updateData.paparan_sinar !== undefined) {
    dataToUpdate.paparanSinar = updateData.paparan_sinar;
  }

  if (updateData.sumber_paparan !== undefined) {
    dataToUpdate.sumberPaparan = updateData.sumber_paparan;
  }

  if (updateData.foto_url !== undefined) {
    dataToUpdate.fotoUrl = updateData.foto_url;
  }

  if (updateData.grid_snapshot !== undefined) {
    validateGridSnapshot(updateData.grid_snapshot);
    dataToUpdate.gridSnapshot = updateData.grid_snapshot;

    const expectedLuas = updateData.grid_snapshot.length * GRID.CELL_SIZE_M2;
    if (updateData.luas_m2 !== undefined) {
      const actualLuas = Number(updateData.luas_m2);
      if (Math.abs(actualLuas - expectedLuas) > 0.001) {
        throw new ValidationError(
          `luas_m2 (${actualLuas}) tidak sesuai dengan grid_snapshot (${expectedLuas} m2)`
        );
      }
      dataToUpdate.luasM2 = actualLuas;
    } else {
      dataToUpdate.luasM2 = expectedLuas;
    }
  }

  const updated = await prisma.lahan.update({
    where: { id: lahanId },
    data: dataToUpdate,
  });

  return {
    lahan_id: updated.id,
    user_id: updated.userId,
    nama_lahan: updated.namaLahan,
    luas_m2: Number(updated.luasM2),
    grid_snapshot: updated.gridSnapshot,
    paparan_sinar: updated.paparanSinar,
    sumber_paparan: updated.sumberPaparan,
    foto_url: updated.fotoUrl,
    created_at: updated.createdAt,
  };
}

/**
 * Hapus lahan (cascade delete semua relasi)
 */
export async function deleteLahan(userId, lahanId) {
  const existing = await prisma.lahan.findUnique({
    where: { id: lahanId },
  });

  if (!existing) {
    throw new NotFoundError('Lahan tidak ditemukan');
  }

  if (existing.userId !== userId) {
    throw new ForbiddenError('Akses ditolak: Lahan ini bukan milik Anda');
  }

  await prisma.lahan.delete({
    where: { id: lahanId },
  });

  return { message: 'Lahan berhasil dihapus' };
}
