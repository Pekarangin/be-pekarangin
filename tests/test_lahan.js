// ============================================================
// tests/test_lahan.js — Comprehensive automated tests for Lahan Module
// Usage: node tests/test_lahan.js
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

async function run() {
  console.log('🧪 Starting Lahan Module Tests...\n');

  // 0. Setup: Buat 2 user untuk menguji fitur & aturan otorisasi/ownership
  const user1Email = `lahan_user1_${Date.now()}@pekarang.in`;
  const user2Email = `lahan_user2_${Date.now()}@pekarang.in`;

  const reg1 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Petani Satu',
      email: user1Email,
      password: 'password123',
    }),
  });
  const u1Data = await reg1.json();
  const token1 = u1Data.data.token;

  const reg2 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Petani Dua',
      email: user2Email,
      password: 'password123',
    }),
  });
  const u2Data = await reg2.json();
  const token2 = u2Data.data.token;

  let lahanId = null;

  // 1. POST /lahan — Sukses (201)
  console.log('1. Testing POST /lahan (Sukses)');
  const res1 = await fetch(`${BASE_URL}/lahan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      nama_lahan: 'Teras Belakang',
      grid_snapshot: [9, 10, 11, 12, 17, 18, 19, 20], // 8 sel
      luas_m2: 2.0, // 8 * 0.25 = 2.0
      paparan_sinar: 'FULL_SUN',
      sumber_paparan: 'MANUAL',
    }),
  });
  const data1 = await res1.json();
  assert(res1.status === 201, `Status code is 201 (got ${res1.status})`);
  assert(data1.success === true, 'Response success is true');
  assert(data1.data?.lahan_id, 'Returns lahan_id UUID');
  assert(data1.data?.luas_m2 === 2, 'luas_m2 matches expected 2.0');
  assert(data1.data?.grid_snapshot?.length === 8, 'grid_snapshot has 8 cells');
  assert(data1.data?.paparan_sinar === 'FULL_SUN', 'paparan_sinar is FULL_SUN');
  lahanId = data1.data?.lahan_id;

  // 2. POST /lahan — Validation Error: Luas tidak cocok dengan jumlah grid
  console.log('\n2. Testing POST /lahan (Validasi luas_m2 mismatch → 400)');
  const res2 = await fetch(`${BASE_URL}/lahan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      nama_lahan: 'Lahan Mismatch',
      grid_snapshot: [1, 2, 3, 4], // 4 sel -> harusnya 1.0 m2
      luas_m2: 3.5, // Sengaja salah
      paparan_sinar: 'PARTIAL_SUN',
      sumber_paparan: 'MANUAL',
    }),
  });
  const data2 = await res2.json();
  assert(res2.status === 400, `Status code is 400 (got ${res2.status})`);
  assert(data2.error?.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  // 3. POST /lahan — Validation Error: Indeks sel di luar 0–63
  console.log('\n3. Testing POST /lahan (Indeks sel di luar batas 0–63 → 400)');
  const res3 = await fetch(`${BASE_URL}/lahan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      nama_lahan: 'Lahan Out of Bounds',
      grid_snapshot: [64, 65], // Out of range (> 63)
      luas_m2: 0.5,
      paparan_sinar: 'SHADE',
      sumber_paparan: 'MANUAL',
    }),
  });
  const data3 = await res3.json();
  assert(res3.status === 400, `Status code is 400 (got ${res3.status})`);
  assert(data3.error?.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  // 4. POST /lahan — Validation Error: Duplikat sel di snapshot
  console.log('\n4. Testing POST /lahan (Duplikat sel di grid_snapshot → 400)');
  const res4 = await fetch(`${BASE_URL}/lahan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      nama_lahan: 'Lahan Duplikat Sel',
      grid_snapshot: [5, 5],
      luas_m2: 0.5,
      paparan_sinar: 'SHADE',
      sumber_paparan: 'MANUAL',
    }),
  });
  const data4 = await res4.json();
  assert(res4.status === 400, `Status code is 400 (got ${res4.status})`);
  assert(data4.error?.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  // 5. GET /lahan — List seluruh lahan milik User 1 (200)
  console.log('\n5. Testing GET /lahan (List lahan user → 200)');
  const res5 = await fetch(`${BASE_URL}/lahan`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const data5 = await res5.json();
  assert(res5.status === 200, `Status code is 200 (got ${res5.status})`);
  assert(Array.isArray(data5.data), 'Returns array of lahan');
  assert(data5.data.length >= 1, 'Array contains at least 1 lahan');
  assert(
    data5.data[0].jumlah_tanaman_aktif !== undefined,
    'jumlah_tanaman_aktif is included'
  );

  // 6. GET /lahan/:id — Detail satu lahan (200)
  console.log('\n6. Testing GET /lahan/:id (Detail lahan → 200)');
  const res6 = await fetch(`${BASE_URL}/lahan/${lahanId}`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const data6 = await res6.json();
  assert(res6.status === 200, `Status code is 200 (got ${res6.status})`);
  assert(data6.data?.lahan_id === lahanId, 'lahan_id matches');
  assert(Array.isArray(data6.data?.grid_snapshot), 'grid_snapshot is present');

  // 7. GET /lahan/:id — Ownership check: User 2 akses Lahan User 1 (403 FORBIDDEN)
  console.log('\n7. Testing GET /lahan/:id (Akses lahan user lain → 403 FORBIDDEN)');
  const res7 = await fetch(`${BASE_URL}/lahan/${lahanId}`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  const data7 = await res7.json();
  assert(res7.status === 403, `Status code is 403 (got ${res7.status})`);
  assert(data7.error?.code === 'FORBIDDEN', 'Error code is FORBIDDEN');

  // 8. GET /lahan/:id — Lahan tidak ada (404 NOT_FOUND)
  console.log('\n8. Testing GET /lahan/:id (ID tidak ditemukan → 404 NOT_FOUND)');
  const res8 = await fetch(
    `${BASE_URL}/lahan/00000000-0000-0000-0000-000000000000`,
    {
      headers: { Authorization: `Bearer ${token1}` },
    }
  );
  const data8 = await res8.json();
  assert(res8.status === 404, `Status code is 404 (got ${res8.status})`);
  assert(data8.error?.code === 'NOT_FOUND', 'Error code is NOT_FOUND');

  // 9. PUT /lahan/:id — Update Profil Lahan (200)
  console.log('\n9. Testing PUT /lahan/:id (Update partial lahan → 200)');
  const res9 = await fetch(`${BASE_URL}/lahan/${lahanId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      nama_lahan: 'Teras Belakang Renovasi',
      paparan_sinar: 'PARTIAL_SUN',
      sumber_paparan: 'AI_VISION',
    }),
  });
  const data9 = await res9.json();
  assert(res9.status === 200, `Status code is 200 (got ${res9.status})`);
  assert(
    data9.data?.nama_lahan === 'Teras Belakang Renovasi',
    'nama_lahan updated'
  );
  assert(
    data9.data?.paparan_sinar === 'PARTIAL_SUN',
    'paparan_sinar updated'
  );
  assert(
    data9.data?.sumber_paparan === 'AI_VISION',
    'sumber_paparan updated'
  );

  // 10. PUT /lahan/:id — Ownership check: User 2 update Lahan User 1 (403 FORBIDDEN)
  console.log('\n10. Testing PUT /lahan/:id (User lain update lahan → 403 FORBIDDEN)');
  const res10 = await fetch(`${BASE_URL}/lahan/${lahanId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`,
    },
    body: JSON.stringify({
      nama_lahan: 'Hacking Lahan',
    }),
  });
  const data10 = await res10.json();
  assert(res10.status === 403, `Status code is 403 (got ${res10.status})`);
  assert(data10.error?.code === 'FORBIDDEN', 'Error code is FORBIDDEN');

  // 11. POST /lahan/analisis-cahaya — Upload Foto (Multipart/form-data)
  console.log('\n11. Testing POST /lahan/analisis-cahaya (Upload foto lahan)');
  // Buat mock image buffer PNG 1x1 pixel
  const mockPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const formData = new FormData();
  formData.append(
    'foto',
    new Blob([mockPngBuffer], { type: 'image/png' }),
    'lahan.png'
  );

  const res11 = await fetch(`${BASE_URL}/lahan/analisis-cahaya`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
    },
    body: formData,
  });
  const data11 = await res11.json();
  assert(res11.status === 200, `Status code is 200 (got ${res11.status})`);
  assert(data11.success === true, 'Response success is true');
  assert(
    ['FULL_SUN', 'PARTIAL_SUN', 'SHADE'].includes(data11.data?.paparan_sinar),
    `Returns valid paparan_sinar (${data11.data?.paparan_sinar})`
  );
  assert(typeof data11.data?.confidence === 'number', 'Returns confidence score');
  assert(typeof data11.data?.catatan === 'string', 'Returns catatan penjelasan');

  // 12. DELETE /lahan/:id — Ownership check: User 2 delete Lahan User 1 (403 FORBIDDEN)
  console.log('\n12. Testing DELETE /lahan/:id (User lain hapus lahan → 403 FORBIDDEN)');
  const res12 = await fetch(`${BASE_URL}/lahan/${lahanId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token2}` },
  });
  const data12 = await res12.json();
  assert(res12.status === 403, `Status code is 403 (got ${res12.status})`);
  assert(data12.error?.code === 'FORBIDDEN', 'Error code is FORBIDDEN');

  // 13. DELETE /lahan/:id — Sukses Hapus Lahan (200)
  console.log('\n13. Testing DELETE /lahan/:id (Hapus lahan → 200)');
  const res13 = await fetch(`${BASE_URL}/lahan/${lahanId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token1}` },
  });
  const data13 = await res13.json();
  assert(res13.status === 200, `Status code is 200 (got ${res13.status})`);
  assert(data13.message === 'Lahan berhasil dihapus', 'Delete success message');

  // Verifikasi lahan benar-benar terhapus
  const res14 = await fetch(`${BASE_URL}/lahan/${lahanId}`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(res14.status === 404, 'Deleted lahan now returns 404');

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
