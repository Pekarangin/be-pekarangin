// ============================================================
// tests/test_tracking.js — Automated tests for Tracking Module
// Usage: node tests/test_tracking.js
// ============================================================
import {
  formatDate,
  calculateHariKe,
  getChecklistHariIni,
} from '../src/services/tracking.service.js';

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

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const { headers, ...restOptions } = options;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...restOptions,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

async function run() {
  console.log('🧪 Starting Tracking Module Tests...\n');

  // ============================================================
  // BAGIAN 1: Unit Test Helper Tracking Service
  // ============================================================
  console.log('--- Bagian 1: Unit Testing Tracking Service ---');

  // 1. formatDate
  const dObj = new Date('2026-08-24T00:00:00.000Z');
  assert(formatDate(dObj) === '2026-08-24', 'formatDate(Date) returns YYYY-MM-DD');
  assert(formatDate('2026-11-07T14:20:00.000Z') === '2026-11-07', 'formatDate(String) returns YYYY-MM-DD');
  assert(formatDate(null) === null, 'formatDate(null) returns null');

  // 2. calculateHariKe
  const todayStr = new Date().toISOString().split('T')[0];
  assert(calculateHariKe(todayStr) === 1, 'calculateHariKe hari ini mengembalikan hari ke-1');
  const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  assert(calculateHariKe(pastDate) === 4, 'calculateHariKe 3 hari lalu mengembalikan hari ke-4');

  // 3. getChecklistHariIni
  assert(getChecklistHariIni(null) === null, 'getChecklistHariIni(null) returns null');
  assert(getChecklistHariIni([]) === null, 'getChecklistHariIni([]) returns null');
  const sampleChecklist = [
    { tanggal: new Date(), siramDone: true, pupukDone: false },
    { tanggal: new Date(Date.now() - 24 * 60 * 60 * 1000), siramDone: true, pupukDone: true },
  ];
  const todayCheck = getChecklistHariIni(sampleChecklist);
  assert(todayCheck !== null, 'getChecklistHariIni menemukan catatan hari ini');
  assert(todayCheck.siram_done === true, 'siram_done matches true');
  assert(todayCheck.pupuk_done === false, 'pupuk_done matches false');

  console.log('\n--- Bagian 2: Integration Testing Tracking Endpoints ---');

  // Setup User A & User B
  const rand = Math.floor(Math.random() * 100000);
  const regUserA = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nama: 'Petani Urban A',
      email: `petani.a.${rand}@pekarang.in`,
      password: 'Password123!',
    }),
  });
  const tokenA = regUserA.data.data.token;
  const authA = { Authorization: `Bearer ${tokenA}` };

  const regUserB = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nama: 'Petani Urban B',
      email: `petani.b.${rand}@pekarang.in`,
      password: 'Password123!',
    }),
  });
  const tokenB = regUserB.data.data.token;
  const authB = { Authorization: `Bearer ${tokenB}` };

  // Buat Lahan A untuk User A
  const resLahan = await request('/lahan', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      nama_lahan: 'Pekarangan Belakang',
      luas_m2: 2.0,
      grid_snapshot: [0, 1, 2, 3, 8, 9, 10, 11],
      paparan_sinar: 'FULL_SUN',
      sumber_paparan: 'MANUAL',
    }),
  });
  const lahanId = resLahan.data.data.lahan_id;

  // Dapatkan komoditas pertama (misal: Cabai rawit)
  const resKomoditas = await request('/komoditas');
  const komoditas = resKomoditas.data.data[0];
  const komoditasId = komoditas.komoditas_id;

  let tanamanId = null;
  let tanamanGagalId = null;

  // 1. POST /tanaman-aktif (Sukses mulai tanam)
  console.log('\n1. Testing POST /tanaman-aktif (Sukses Mulai Tanam)');
  const resTanam = await request('/tanaman-aktif', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      lahan_id: lahanId,
      komoditas_id: komoditasId,
      tanggal_tanam: '2026-08-24',
    }),
  });
  assert(resTanam.status === 201, `Status code is 201 (got ${resTanam.status})`);
  assert(resTanam.data.success === true, 'Response success is true');
  assert(typeof resTanam.data.data.tanaman_aktif_id === 'string', 'tanaman_aktif_id is UUID');
  assert(resTanam.data.data.status === 'AKTIF', 'Status is AKTIF');
  assert(resTanam.data.data.tanggal_tanam === '2026-08-24', 'tanggal_tanam matches');
  assert(typeof resTanam.data.data.perkiraan_panen === 'string', 'perkiraan_panen calculated');
  assert(resTanam.data.data.komoditas.komoditas_id === komoditasId, 'Komoditas nested matches');
  tanamanId = resTanam.data.data.tanaman_aktif_id;

  // Buat tanaman kedua untuk skenario GAGAL
  const resTanam2 = await request('/tanaman-aktif', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      lahan_id: lahanId,
      komoditas_id: komoditasId,
      tanggal_tanam: '2026-08-25',
    }),
  });
  tanamanGagalId = resTanam2.data.data.tanaman_aktif_id;

  // 2. POST /tanaman-aktif pada lahan milik user lain (403 Forbidden)
  console.log('\n2. Testing POST /tanaman-aktif (Lahan Milik User Lain -> 403)');
  const resTanamForbidden = await request('/tanaman-aktif', {
    method: 'POST',
    headers: authB,
    body: JSON.stringify({
      lahan_id: lahanId,
      komoditas_id: komoditasId,
      tanggal_tanam: '2026-08-24',
    }),
  });
  assert(resTanamForbidden.status === 403, `Status code is 403 (got ${resTanamForbidden.status})`);
  assert(resTanamForbidden.data.error.code === 'FORBIDDEN', 'Error code is FORBIDDEN');

  // 3. POST /tanaman-aktif dengan lahan tidak ditemukan (404 Not Found)
  console.log('\n3. Testing POST /tanaman-aktif (Lahan Not Found -> 404)');
  const resTanamNotFound = await request('/tanaman-aktif', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      lahan_id: '00000000-0000-4000-8000-000000000000',
      komoditas_id: komoditasId,
      tanggal_tanam: '2026-08-24',
    }),
  });
  assert(resTanamNotFound.status === 404, `Status code is 404 (got ${resTanamNotFound.status})`);
  assert(resTanamNotFound.data.error.code === 'NOT_FOUND', 'Error code is NOT_FOUND');

  // 4. GET /tanaman-aktif (List tanaman milik user)
  console.log('\n4. Testing GET /tanaman-aktif (List Tanaman User)');
  const resList = await request('/tanaman-aktif', {
    headers: authA,
  });
  assert(resList.status === 200, `Status code is 200 (got ${resList.status})`);
  assert(Array.isArray(resList.data.data), 'Returns array of tanaman');
  assert(resList.data.data.length >= 2, 'Array contains at least 2 items');
  const firstItem = resList.data.data.find(t => t.tanaman_aktif_id === tanamanId);
  assert(firstItem !== undefined, 'Created tanaman is in the list');
  assert(firstItem.lahan_nama === 'Pekarangan Belakang', 'lahan_nama is populated');
  assert(firstItem.komoditas_nama === komoditas.nama, 'komoditas_nama is populated');
  assert(typeof firstItem.hari_ke === 'number', 'hari_ke is a number');

  // 5. GET /tanaman-aktif dengan filter ?status=AKTIF
  console.log('\n5. Testing GET /tanaman-aktif?status=AKTIF');
  const resFilter = await request('/tanaman-aktif?status=AKTIF', {
    headers: authA,
  });
  assert(resFilter.status === 200, 'Status code is 200');
  assert(resFilter.data.data.every(t => t.status === 'AKTIF'), 'All items have status AKTIF');

  // 6. GET /tanaman-aktif/:id (Detail tanaman)
  console.log('\n6. Testing GET /tanaman-aktif/:id (Detail)');
  const resDetail = await request(`/tanaman-aktif/${tanamanId}`, {
    headers: authA,
  });
  assert(resDetail.status === 200, `Status code is 200 (got ${resDetail.status})`);
  assert(resDetail.data.data.tanaman_aktif_id === tanamanId, 'tanaman_aktif_id matches');
  assert(resDetail.data.data.lahan.lahan_id === lahanId, 'lahan_id matches');
  assert(resDetail.data.data.komoditas.komoditas_id === komoditasId, 'komoditas_id matches');
  assert(typeof resDetail.data.data.hari_ke === 'number', 'hari_ke is returned');

  // 7. GET /tanaman-aktif/:id (User lain -> 403)
  console.log('\n7. Testing GET /tanaman-aktif/:id (User Lain -> 403)');
  const resDetailForbidden = await request(`/tanaman-aktif/${tanamanId}`, {
    headers: authB,
  });
  assert(resDetailForbidden.status === 403, `Status code is 403 (got ${resDetailForbidden.status})`);
  assert(resDetailForbidden.data.error.code === 'FORBIDDEN', 'Error code is FORBIDDEN');

  // 8. POST /tanaman-aktif/:id/checklist (Submit checklist hari ini)
  console.log('\n8. Testing POST /tanaman-aktif/:id/checklist (Submit)');
  const resChecklist = await request(`/tanaman-aktif/${tanamanId}/checklist`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      tanggal: todayStr,
      siram_done: true,
      pupuk_done: false,
      catatan: 'Disiram pagi hari',
    }),
  });
  assert(resChecklist.status === 200, `Status code is 200 (got ${resChecklist.status})`);
  assert(resChecklist.data.success === true, 'Response success is true');
  assert(resChecklist.data.data.siram_done === true, 'siram_done is true');
  assert(resChecklist.data.data.pupuk_done === false, 'pupuk_done is false');
  assert(resChecklist.data.data.catatan === 'Disiram pagi hari', 'catatan matches');

  // 9. POST /tanaman-aktif/:id/checklist (Upsert checklist tanggal yang sama)
  console.log('\n9. Testing POST /tanaman-aktif/:id/checklist (Upsert pada tanggal sama)');
  const resChecklistUpdate = await request(`/tanaman-aktif/${tanamanId}/checklist`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      tanggal: todayStr,
      siram_done: true,
      pupuk_done: true,
      catatan: 'Sudah disiram dan dipupuk NPK',
    }),
  });
  assert(resChecklistUpdate.status === 200, 'Status code is 200');
  assert(resChecklistUpdate.data.data.pupuk_done === true, 'pupuk_done updated to true');
  assert(resChecklistUpdate.data.data.catatan === 'Sudah disiram dan dipupuk NPK', 'catatan updated');

  // 10. GET /tanaman-aktif/:id/checklist (Riwayat checklist)
  console.log('\n10. Testing GET /tanaman-aktif/:id/checklist (Riwayat)');
  const resHistory = await request(`/tanaman-aktif/${tanamanId}/checklist`, {
    headers: authA,
  });
  assert(resHistory.status === 200, `Status code is 200 (got ${resHistory.status})`);
  assert(Array.isArray(resHistory.data.data), 'Returns array of checklist');
  assert(resHistory.data.data.length >= 1, 'Array contains at least 1 checklist');

  // 11. POST /tanaman-aktif/:id/panen (Realisasi Panen)
  console.log('\n11. Testing POST /tanaman-aktif/:id/panen (Realisasi Panen)');
  const resPanen = await request(`/tanaman-aktif/${tanamanId}/panen`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      tanggal_panen: todayStr,
      berat_panen_gram: 500,
    }),
  });
  assert(resPanen.status === 200, `Status code is 200 (got ${resPanen.status})`);
  assert(resPanen.data.success === true, 'Response success is true');
  assert(resPanen.data.data.status === 'PANEN', 'Status updated to PANEN');
  assert(resPanen.data.data.berat_panen_gram === 500, 'berat_panen_gram is 500');
  assert(resPanen.data.data.estimasi_hemat_rp > 0, 'estimasi_hemat_rp is calculated (> 0)');

  // 12. POST /tanaman-aktif/:id/panen (Panen ulang -> 400 Bad Request)
  console.log('\n12. Testing POST /tanaman-aktif/:id/panen (Panen Ulang -> 400)');
  const resPanenAgain = await request(`/tanaman-aktif/${tanamanId}/panen`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      tanggal_panen: todayStr,
      berat_panen_gram: 100,
    }),
  });
  assert(resPanenAgain.status === 400, `Status code is 400 (got ${resPanenAgain.status})`);

  // 13. POST /tanaman-aktif/:id/checklist pada tanaman berstatus PANEN -> 400
  console.log('\n13. Testing POST /tanaman-aktif/:id/checklist pada tanaman PANEN -> 400');
  const resChecklistAfterPanen = await request(`/tanaman-aktif/${tanamanId}/checklist`, {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      tanggal: todayStr,
      siram_done: true,
      pupuk_done: false,
    }),
  });
  assert(resChecklistAfterPanen.status === 400, `Status code is 400 (got ${resChecklistAfterPanen.status})`);

  // 14. PATCH /tanaman-aktif/:id/status (Tutup siklus sebagai GAGAL)
  console.log('\n14. Testing PATCH /tanaman-aktif/:id/status (Tutup sebagai GAGAL)');
  const resGagal = await request(`/tanaman-aktif/${tanamanGagalId}/status`, {
    method: 'PATCH',
    headers: authA,
    body: JSON.stringify({
      status: 'GAGAL',
    }),
  });
  assert(resGagal.status === 200, `Status code is 200 (got ${resGagal.status})`);
  assert(resGagal.data.data.status === 'GAGAL', 'Status is GAGAL');
  assert(resGagal.data.data.message === 'Siklus tanam ditutup sebagai gagal', 'Message confirmed');

  // 15. PATCH /tanaman-aktif/:id/status dengan status selain GAGAL -> 400
  console.log('\n15. Testing PATCH /tanaman-aktif/:id/status (Bukan GAGAL -> 400)');
  const resInvalidStatus = await request(`/tanaman-aktif/${tanamanGagalId}/status`, {
    method: 'PATCH',
    headers: authA,
    body: JSON.stringify({
      status: 'BERHASIL',
    }),
  });
  assert(resInvalidStatus.status === 400, `Status code is 400 (got ${resInvalidStatus.status})`);

  console.log('\n----------------------------------------');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Unhandled error in tests:', err);
  process.exit(1);
});
