// ============================================================
// tests/test_ai_insight.js — Automated tests for AI Insight Module (Fase 5)
// Usage: node tests/test_ai_insight.js
// ============================================================

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
  console.log('🧪 Starting AI Insight Module Tests...\n');

  // Setup User A & User B
  const rand = Math.floor(Math.random() * 100000);
  const regUserA = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nama: 'Petani AI A',
      email: `petani.ai.a.${rand}@pekarang.in`,
      password: 'Password123!',
    }),
  });
  const tokenA = regUserA.data.data.token;
  const authA = { Authorization: `Bearer ${tokenA}` };

  const regUserB = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nama: 'Petani AI B',
      email: `petani.ai.b.${rand}@pekarang.in`,
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
      nama_lahan: 'Pekarangan Depan',
      luas_m2: 2.0,
      grid_snapshot: [0, 1, 2, 3, 8, 9, 10, 11],
      paparan_sinar: 'FULL_SUN',
      sumber_paparan: 'MANUAL',
    }),
  });
  const lahanId = resLahan.data.data.lahan_id;

  // Dapatkan komoditas pertama
  const resKomoditas = await request('/komoditas');
  const komoditas = resKomoditas.data.data[0];

  // Buat Tanaman Aktif untuk User A
  const resTanam = await request('/tanaman-aktif', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      lahan_id: lahanId,
      komoditas_id: komoditas.komoditas_id,
      tanggal_tanam: '2026-09-01',
    }),
  });
  const tanamanAktifId = resTanam.data.data.tanaman_aktif_id;

  // 1. POST /ai-insight/chat tanpa autentikasi -> 401
  console.log('1. Testing POST /ai-insight/chat (Tanpa Token -> 401)');
  const resNoAuth = await request('/ai-insight/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'Halo' }),
  });
  assert(resNoAuth.status === 401, `Status code is 401 (got ${resNoAuth.status})`);
  assert(resNoAuth.data.error.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

  // 2. POST /ai-insight/chat tanpa pesan -> 400
  console.log('\n2. Testing POST /ai-insight/chat (Pesan Kosong -> 400)');
  const resEmptyMsg = await request('/ai-insight/chat', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({ message: '' }),
  });
  assert(resEmptyMsg.status === 400, `Status code is 400 (got ${resEmptyMsg.status})`);
  assert(resEmptyMsg.data.error.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  // 3. POST /ai-insight/chat pertanyaan umum tanpa konteks tanaman -> 200
  console.log('\n3. Testing POST /ai-insight/chat (Pertanyaan Umum -> 200)');
  const resGeneral = await request('/ai-insight/chat', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      message: 'Bagaimana cara mencegah hama pada tanaman pekarangan sempit?',
    }),
  });
  assert(resGeneral.status === 200, `Status code is 200 (got ${resGeneral.status})`);
  assert(resGeneral.data.success === true, 'Response success is true');
  assert(typeof resGeneral.data.data.reply === 'string' && resGeneral.data.data.reply.length > 10, 'Reply is non-empty string');
  assert(resGeneral.data.data.konteks_tanaman === null, 'konteks_tanaman is null for general query');

  // 4. POST /ai-insight/chat format UUID tidak valid -> 400
  console.log('\n4. Testing POST /ai-insight/chat (UUID Tanaman Invalid -> 400)');
  const resInvalidUuid = await request('/ai-insight/chat', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      message: 'Kenapa daun menguning?',
      tanaman_aktif_id: 'bukan-uuid',
    }),
  });
  assert(resInvalidUuid.status === 400, `Status code is 400 (got ${resInvalidUuid.status})`);
  assert(resInvalidUuid.data.error.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  // 5. POST /ai-insight/chat tanaman_aktif_id tidak ditemukan -> 404
  console.log('\n5. Testing POST /ai-insight/chat (Tanaman Not Found -> 404)');
  const resNotFound = await request('/ai-insight/chat', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      message: 'Kenapa daun menguning?',
      tanaman_aktif_id: '00000000-0000-4000-8000-000000000000',
    }),
  });
  assert(resNotFound.status === 404, `Status code is 404 (got ${resNotFound.status})`);
  assert(resNotFound.data.error.code === 'NOT_FOUND', 'Error code is NOT_FOUND');

  // 6. POST /ai-insight/chat tanaman_aktif_id milik user lain -> 403
  console.log('\n6. Testing POST /ai-insight/chat (Tanaman Milik User Lain -> 403)');
  const resForbidden = await request('/ai-insight/chat', {
    method: 'POST',
    headers: authB,
    body: JSON.stringify({
      message: 'Kenapa daun menguning?',
      tanaman_aktif_id: tanamanAktifId,
    }),
  });
  assert(resForbidden.status === 403, `Status code is 403 (got ${resForbidden.status})`);
  assert(resForbidden.data.error.code === 'FORBIDDEN', 'Error code is FORBIDDEN');

  // 7. POST /ai-insight/chat dengan konteks tanaman milik sendiri -> 200
  console.log('\n7. Testing POST /ai-insight/chat (Dengan Konteks Tanaman -> 200)');
  const resContextual = await request('/ai-insight/chat', {
    method: 'POST',
    headers: authA,
    body: JSON.stringify({
      message: 'Daun bagian bawah mulai rontok, apa solusinya?',
      tanaman_aktif_id: tanamanAktifId,
    }),
  });
  assert(resContextual.status === 200, `Status code is 200 (got ${resContextual.status})`);
  assert(resContextual.data.success === true, 'Response success is true');
  assert(typeof resContextual.data.data.reply === 'string' && resContextual.data.data.reply.length > 10, 'Reply is non-empty string');
  assert(resContextual.data.data.konteks_tanaman !== null, 'konteks_tanaman is present');
  assert(resContextual.data.data.konteks_tanaman.nama === komoditas.nama, 'konteks_tanaman.nama matches komoditas');
  assert(typeof resContextual.data.data.konteks_tanaman.hari_ke === 'number', 'konteks_tanaman.hari_ke is calculated');
  assert(resContextual.data.data.konteks_tanaman.status === 'AKTIF', 'konteks_tanaman.status is AKTIF');

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
