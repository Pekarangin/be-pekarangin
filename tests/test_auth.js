// ============================================================
// tests/test_auth.js — Comprehensive automated tests for Auth Module
// Usage: node tests/test_auth.js
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
  console.log('🧪 Starting Auth Module Tests...\n');

  const testEmail = `test_${Date.now()}@pekarang.in`;
  const testPassword = 'validPassword123';
  let authToken = null;
  let userId = null;

  // 1. POST /auth/register — Sukses
  console.log('1. Testing POST /auth/register (Sukses)');
  const res1 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Budi Santoso',
      email: testEmail,
      password: testPassword,
    }),
  });
  const data1 = await res1.json();
  assert(res1.status === 201, `Status code is 201 (got ${res1.status})`);
  assert(data1.success === true, 'Response success is true');
  assert(data1.data?.user_id, 'Returns user_id UUID');
  assert(data1.data?.email === testEmail, 'Email matches registered email');
  assert(data1.data?.token, 'Returns JWT token');
  authToken = data1.data?.token;
  userId = data1.data?.user_id;

  // 2. POST /auth/register — Email Duplikat (Conflict 409)
  console.log('\n2. Testing POST /auth/register (Email Duplikat → 409 CONFLICT)');
  const res2 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Budi Palsu',
      email: testEmail,
      password: testPassword,
    }),
  });
  const data2 = await res2.json();
  assert(res2.status === 409, `Status code is 409 (got ${res2.status})`);
  assert(data2.success === false, 'Response success is false');
  assert(data2.error?.code === 'CONFLICT', `Error code is CONFLICT (got ${data2.error?.code})`);

  // 3. POST /auth/register — Validasi Gagal (Password pendek & email invalid → 400)
  console.log('\n3. Testing POST /auth/register (Validasi Input → 400 VALIDATION_ERROR)');
  const res3 = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama: 'Budi',
      email: 'bukan-email',
      password: '123',
    }),
  });
  const data3 = await res3.json();
  assert(res3.status === 400, `Status code is 400 (got ${res3.status})`);
  assert(data3.error?.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  // 4. POST /auth/login — Sukses (200)
  console.log('\n4. Testing POST /auth/login (Sukses → 200)');
  const res4 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const data4 = await res4.json();
  assert(res4.status === 200, `Status code is 200 (got ${res4.status})`);
  assert(data4.success === true, 'Response success is true');
  assert(data4.data?.token, 'Returns new JWT token');

  // 5. POST /auth/login — Password Salah (401 UNAUTHORIZED)
  console.log('\n5. Testing POST /auth/login (Password Salah → 401 UNAUTHORIZED)');
  const res5 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'wrongPassword!@#',
    }),
  });
  const data5 = await res5.json();
  assert(res5.status === 401, `Status code is 401 (got ${res5.status})`);
  assert(data5.error?.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

  // 6. GET /auth/me — Sukses dengan Bearer Token (200)
  console.log('\n6. Testing GET /auth/me (Sukses → 200)');
  const res6 = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const data6 = await res6.json();
  assert(res6.status === 200, `Status code is 200 (got ${res6.status})`);
  assert(data6.data?.user_id === userId, 'user_id matches authenticated user');
  assert(data6.data?.nama === 'Budi Santoso', 'User name matches');
  assert(data6.data?.email === testEmail, 'User email matches');

  // 7. GET /auth/me — Tanpa Token (401 UNAUTHORIZED)
  console.log('\n7. Testing GET /auth/me (Tanpa Token → 401 UNAUTHORIZED)');
  const res7 = await fetch(`${BASE_URL}/auth/me`);
  const data7 = await res7.json();
  assert(res7.status === 401, `Status code is 401 (got ${res7.status})`);
  assert(data7.error?.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

  // 8. GET /auth/me — Token Invalid (401 UNAUTHORIZED)
  console.log('\n8. Testing GET /auth/me (Token Invalid → 401 UNAUTHORIZED)');
  const res8 = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer this_is_a_completely_fake_token' },
  });
  const data8 = await res8.json();
  assert(res8.status === 401, `Status code is 401 (got ${res8.status})`);
  assert(data8.error?.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

  // 9. POST /auth/google — Missing id_token (400 VALIDATION_ERROR)
  console.log('\n9. Testing POST /auth/google (Missing id_token → 400 VALIDATION_ERROR)');
  const res9 = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data9 = await res9.json();
  assert(res9.status === 400, `Status code is 400 (got ${res9.status})`);
  assert(data9.error?.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  // 10. POST /auth/google — Fake id_token (401 UNAUTHORIZED)
  console.log('\n10. Testing POST /auth/google (Invalid id_token → 401 UNAUTHORIZED)');
  const res10 = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: 'fake_google_token_12345' }),
  });
  const data10 = await res10.json();
  assert(res10.status === 401, `Status code is 401 (got ${res10.status})`);
  assert(data10.error?.code === 'UNAUTHORIZED', 'Error code is UNAUTHORIZED');

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
