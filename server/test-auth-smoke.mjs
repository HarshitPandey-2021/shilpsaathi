/**
 * Smoke tests for authentication middleware and ownership enforcement.
 * Tests paths that don't require live Supabase credentials.
 */

import { config as appConfig } from './src/config/index.js';

// Build a trusted storage URL so validation passes and auth is the gate under test.
const SUPABASE_URL = (appConfig.supabase?.url || process.env.SUPABASE_URL || 'https://example.supabase.co').trim().replace(/\/+$/, '');
const TRUSTED_IMAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/product-images/test.jpg`;

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  PASS: ${name}`);
    passed++;
  } else {
    console.error(`  FAIL: ${name}`);
    failed++;
  }
}

function mockReq(headers = {}, body = {}, query = {}, params = {}) {
  return { headers, body, query, params };
}

function mockRes() {
  let captured = {};
  const res = {
    status(code) { captured.status = code; return res; },
    json(obj) { captured.body = obj; return res; },
    get captured() { return captured; },
  };
  return res;
}

async function runMiddleware(middleware, req, res) {
  let nextCalled = false;
  await middleware(req, res, () => { nextCalled = true; });
  return nextCalled;
}

async function load() {
  const auth = await import('./src/middleware/auth.js');
  const ctrl = await import('./src/controllers/productController.js');
  return { auth, ctrl };
}

const { auth, ctrl } = await load();

// Test 1: missing token
console.log('\nTest 1: authenticate — missing token');
{
  const req = mockReq({});
  const res = mockRes();
  const next = await runMiddleware(auth.authenticate, req, res);
  assert(next === false, 'next() NOT called');
  assert(res.captured.status === 401, 'returns 401');
  assert(res.captured.body?.success === false, 'success is false');
}

// Test 2: malformed header
console.log('\nTest 2: authenticate — malformed Authorization');
{
  const req = mockReq({ authorization: 'Basic abc' });
  const res = mockRes();
  const next = await runMiddleware(auth.authenticate, req, res);
  assert(next === false, 'next() NOT called');
  assert(res.captured.status === 401, 'returns 401');
}

// Test 3: empty Bearer
console.log('\nTest 3: authenticate — empty Bearer token');
{
  const req = mockReq({ authorization: 'Bearer   ' });
  const res = mockRes();
  const next = await runMiddleware(auth.authenticate, req, res);
  assert(next === false, 'next() NOT called');
  assert(res.captured.status === 401, 'returns 401');
}

// Test 4: createProduct no auth
console.log('\nTest 4: createProduct — no req.artisan');
{
     const req = mockReq({}, { name: 'Test', image_url: TRUSTED_IMAGE_URL, final_price: 100 });
  const res = mockRes();
  await ctrl.createProduct(req, res, (e) => { throw e; });
  assert(res.captured.status === 401, 'returns 401');
}

// Test 5: updateProduct no auth
console.log('\nTest 5: updateProduct — no req.artisan');
{
  const req = mockReq({}, { name: 'X' }, {}, { id: '12345678-1234-1234-1234-123456789abc' });
  const res = mockRes();
  await ctrl.updateProduct(req, res, () => {});
  assert(res.captured.status === 401, 'returns 401 (auth before DB)');
}

// Test 6: deleteProduct no auth
console.log('\nTest 6: deleteProduct — no req.artisan');
{
  const req = mockReq({}, {}, {}, { id: '12345678-1234-1234-1234-123456789abc' });
  const res = mockRes();
  await ctrl.deleteProduct(req, res, () => {});
  assert(res.captured.status === 401, 'returns 401');
}

// Test 7: updateProductStatus no auth
console.log('\nTest 7: updateProductStatus — no req.artisan');
{
  const req = mockReq({}, { status: 'draft' }, {}, { id: '12345678-1234-1234-1234-123456789abc' });
  const res = mockRes();
  await ctrl.updateProductStatus(req, res, () => {});
  assert(res.captured.status === 401, 'returns 401');
}

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================');
if (failed > 0) process.exit(1);
