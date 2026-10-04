// ============================================================
// tests/test_rekomendasi.js — Automated tests for Rekomendasi & Scoring Engine
// Usage: node tests/test_rekomendasi.js
// ============================================================
import {
  calculateScore,
  getSunlightFactor,
  mapKesesuaianLabel,
} from '../src/services/scoring.service.js';

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  console.log('🧪 Starting Rekomendasi & Scoring Engine Tests...\n');

  // ============================================================
  // BAGIAN 1: Unit Test Formula & Matriks Kesesuaian Cahaya
  // ============================================================
  console.log('--- Bagian 1: Unit Testing Scoring Engine ---');

  // Matriks Sinar
  assert(
    getSunlightFactor('FULL_SUN', 'FULL_SUN') === 1.0,
    'FULL_SUN pada lahan FULL_SUN = 1.0'
  );
  assert(
    getSunlightFactor('FULL_SUN', 'PARTIAL_SUN') === 0.6,
    'FULL_SUN pada lahan PARTIAL_SUN = 0.6'
  );
  assert(
    getSunlightFactor('FULL_SUN', 'SHADE') === 0.2,
    'FULL_SUN pada lahan SHADE = 0.2'
  );
  assert(
    getSunlightFactor('PARTIAL_SUN', 'PARTIAL_SUN') === 1.0,
    'PARTIAL_SUN pada lahan PARTIAL_SUN = 1.0'
  );
  assert(
    getSunlightFactor('SHADE', 'SHADE') === 1.0,
    'SHADE pada lahan SHADE = 1.0'
  );
  assert(
    getSunlightFactor('SHADE', 'FULL_SUN') === 0.2,
    'SHADE pada lahan FULL_SUN = 0.2'
  );

  // Label Badge
  assert(mapKesesuaianLabel(1.0) === 'COCOK', 'Faktor 1.0 mapped to COCOK');
  assert(
    mapKesesuaianLabel(0.6) === 'KURANG_COCOK',
    'Faktor 0.6 mapped to KURANG_COCOK'
  );
  assert(
    mapKesesuaianLabel(0.2) === 'TIDAK_COCOK',
    'Faktor 0.2 mapped to TIDAK_COCOK'
  );

  // Perhitungan Skor
  // (45000 / 0.5 / 75) * 1.0 = 1200
  const score1 = calculateScore({
    estimasiHematPerBulan: 45000,
    luasMinM2: 0.5,
    waktuPanenHari: 75,
    sunlightFactor: 1.0,
  });
  assert(score1 === 1200, `Hitung skor cocok (got ${score1}, expected 1200)`);

  // (45000 / 0.5 / 75) * 0.6 = 720
  const score2 = calculateScore({
    estimasiHematPerBulan: 45000,
    luasMinM2: 0.5,
    waktuPanenHari: 75,
    sunlightFactor: 0.6,
  });
  assert(
    score2 === 720,
    `Hitung skor kurang cocok (got ${score2}, expected 720)`
  );

  // (45000 / 0.5 / 75) * 0.2 = 240
  const score3 = calculateScore({
    estimasiHematPerBulan: 45000,
    luasMinM2: 0.5,
    waktuPanenHari: 75,
    sunlightFactor: 0.2,
  });
  assert(
    score3 === 240,
    `Hitung skor tidak cocok (got ${score3}, expected 240)`
  );

  // ============================================================
  // BAGIAN 2: Integration Test Katalog Komoditas (Public)
  // ============================================================
  console.log('\n--- Bagian 2: Integration Testing Master Komoditas ---');

  // 1. GET /komoditas — List seluruh komoditas
  const resKomoditas = await fetch(`${BASE_URL}/komoditas`);
  const dataKomoditas = await resKomoditas.json();
  assert(resKomoditas.status === 200, 'GET /komoditas status 200');
  assert(dataKomoditas.success === true, 'GET /komoditas success true');
  assert(
    Array.isArray(dataKomoditas.data) && dataKomoditas.data.length === 15,
    `Mengembalikan seluruh 15 komoditas (got ${dataKomoditas.data?.length})`
  );

  const sampleKomoditas = dataKomoditas.data[0];
  assert(sampleKomoditas.komoditas_id, 'komoditas_id present');
  assert(sampleKomoditas.nama, 'nama komoditas present');
  assert(sampleKomoditas.kebutuhan_sinar, 'kebutuhan_sinar present');
  assert(sampleKomoditas.luas_min_m2 > 0, 'luas_min_m2 > 0');
  assert(sampleKomoditas.waktu_panen_hari > 0, 'waktu_panen_hari > 0');

  // 2. GET /komoditas/:id — Detail komoditas + harga_terkini nested
  const resDetail = await fetch(
    `${BASE_URL}/komoditas/${sampleKomoditas.komoditas_id}`
  );
  const dataDetail = await resDetail.json();
  assert(resDetail.status === 200, 'GET /komoditas/:id status 200');
  assert(
    dataDetail.data?.komoditas_id === sampleKomoditas.komoditas_id,
    'komoditas_id matches'
  );
  assert(
    dataDetail.data?.harga_terkini !== null &&
      typeof dataDetail.data?.harga_terkini?.harga_rp_per_kg === 'number',
    'harga_terkini nested object present with harga_rp_per_kg'
  );

  // 3. GET /komoditas/:id (404 Not Found)
  const resNotFound = await fetch(
    `${BASE_URL}/komoditas/00000000-0000-0000-0000-000000000000`
  );
  assert(resNotFound.status === 404, 'Non-existent komoditas returns 404');

  // ============================================================
  // BAGIAN 3: Integration Test Scoring Rekomendasi Lahan
  // ============================================================
  console.log('\n--- Bagian 3: Integration Testing Rekomendasi Lahan ---');

  // Setup user & 2 lahan dengan paparan sinar berbeda
  const userEmail = `scoring_user_${Date.now()}@pekarang.in`;
  const otherEmail = `scoring_other_${Date.now()}@pekarang.in`;

  const regU1 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Petani Scoring',
      email: userEmail,
      password: 'password123',
    }),
  });
  const u1Token = (await regU1.json()).data.token;

  const regU2 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Petani Lain',
      email: otherEmail,
      password: 'password123',
    }),
  });
  const u2Token = (await regU2.json()).data.token;

  // Buat lahan FULL_SUN untuk User 1
  const createLahanSun = await fetch(`${BASE_URL}/lahan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${u1Token}`,
    },
    body: JSON.stringify({
      nama_lahan: 'Lahan Terik Depan',
      grid_snapshot: [0, 1, 2, 3],
      luas_m2: 1.0,
      paparan_sinar: 'FULL_SUN',
      sumber_paparan: 'MANUAL',
    }),
  });
  const lahanSunId = (await createLahanSun.json()).data.lahan_id;

  // 1. GET /lahan/:id/rekomendasi — Sukses
  const resRec = await fetch(`${BASE_URL}/lahan/${lahanSunId}/rekomendasi`, {
    headers: { Authorization: `Bearer ${u1Token}` },
  });
  const dataRec = await resRec.json();
  assert(resRec.status === 200, 'GET /lahan/:id/rekomendasi status 200');
  assert(dataRec.success === true, 'Response success true');
  assert(dataRec.data?.lahan_id === lahanSunId, 'lahan_id matches');
  assert(dataRec.data?.lahan_paparan_sinar === 'FULL_SUN', 'paparan_sinar is FULL_SUN');
  assert(dataRec.data?.harga_update_terakhir, 'harga_update_terakhir present');
  assert(
    Array.isArray(dataRec.data?.rekomendasi) &&
      dataRec.data?.rekomendasi.length === 15,
    `Mengembalikan rekomendasi seluruh 15 komoditas (got ${dataRec.data?.rekomendasi?.length})`
  );

  // 2. Verifikasi pengurutan (Descending by skor_prioritas)
  const recList = dataRec.data.rekomendasi;
  let isSorted = true;
  for (let i = 0; i < recList.length - 1; i++) {
    if (recList[i].skor_prioritas < recList[i + 1].skor_prioritas) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, 'Daftar rekomendasi terurut descending berdasarkan skor_prioritas');

  // 3. Verifikasi badge kesesuaian sinar pada lahan FULL_SUN
  const cabaiRawit = recList.find((r) => r.nama === 'Cabai rawit');
  assert(
    cabaiRawit && cabaiRawit.kesesuaian_sinar === 'COCOK',
    'Cabai rawit (FULL_SUN) berbadge COCOK di lahan FULL_SUN'
  );

  // 4. Verifikasi field lengkap tiap item rekomendasi
  const firstItem = recList[0];
  assert(typeof firstItem.skor_prioritas === 'number', 'skor_prioritas is number');
  assert(
    typeof firstItem.estimasi_hemat_rp_per_bulan === 'number',
    'estimasi_hemat_rp_per_bulan is number'
  );
  assert(typeof firstItem.waktu_panen_hari === 'number', 'waktu_panen_hari is number');
  assert(typeof firstItem.luas_dibutuhkan_m2 === 'number', 'luas_dibutuhkan_m2 is number');
  assert(firstItem.tingkat_kesulitan, 'tingkat_kesulitan is present');
  assert(firstItem.harga_pasar_per_kg > 0, 'harga_pasar_per_kg > 0');

  // 5. Ownership check: User 2 meminta rekomendasi untuk Lahan User 1 (403 FORBIDDEN)
  const resForbidden = await fetch(
    `${BASE_URL}/lahan/${lahanSunId}/rekomendasi`,
    {
      headers: { Authorization: `Bearer ${u2Token}` },
    }
  );
  assert(
    resForbidden.status === 403,
    'User lain mengakses rekomendasi lahan -> 403 FORBIDDEN'
  );

  // 6. Lahan tidak ditemukan (404 NOT_FOUND)
  const resNotFoundRec = await fetch(
    `${BASE_URL}/lahan/00000000-0000-0000-0000-000000000000/rekomendasi`,
    {
      headers: { Authorization: `Bearer ${u1Token}` },
    }
  );
  assert(resNotFoundRec.status === 404, 'Lahan tidak ada -> 404 NOT_FOUND');

  console.log('\n----------------------------------------');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
