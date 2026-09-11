/**
 * Focused tests for product image_url validation.
 * Tests the security hardening for image storage.
 */

import { validateImageUrl, validateProductInput } from './src/utils/validation.js';
import { config as appConfig } from './src/config/index.js';

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

// Use the configured Supabase URL if available; fall back to a test URL.
const SUPABASE_URL = (appConfig.supabase?.url || process.env.SUPABASE_URL || 'https://example.supabase.co').trim().replace(/\/+$/, '');
const VALID_BUCKET_URL = `${SUPABASE_URL}/storage/v1/object/public/product-images/products/123456-abcdef.jpg`;

// A. VALID INTERNAL IMAGE
console.log('\nA. VALID INTERNAL IMAGE');
{
  const r = validateImageUrl(VALID_BUCKET_URL);
  assert(r.valid === true, 'valid Supabase Storage URL accepted');
}

// B. DATA URI
console.log('\nB. DATA URI');
{
  const r = validateImageUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA');
  assert(r.valid === false, 'data URI rejected');
  assert(r.error.includes('Data URI'), 'error mentions data URI');
}

// C. RAW BASE64
console.log('\nC. RAW BASE64');
{
  const hugeBase64 = 'A'.repeat(5000);
  const r = validateImageUrl(hugeBase64);
  assert(r.valid === false, 'raw base64 rejected');
}

// D. EXTERNAL URL
console.log('\nD. EXTERNAL URL');
{
  const r = validateImageUrl('https://evil.com/malicious.jpg');
  assert(r.valid === false, 'external URL rejected');
  assert(r.error.includes('approved storage bucket'), 'error mentions storage bucket');
}

// E. OVERSIZED URL
console.log('\nE. OVERSIZED URL');
{
  const hugeUrl = 'https://example.supabase.co/storage/v1/object/public/product-images/' + 'A'.repeat(3000);
  const r = validateImageUrl(hugeUrl);
  assert(r.valid === false, 'oversized URL rejected');
  assert(r.error.includes('characters or less'), 'error mentions character limit');
}

// F. MISSING IMAGE
console.log('\nF. MISSING IMAGE');
{
  const r = validateProductInput({ name: 'Test', final_price: 100 });
  assert(r.isValid === false, 'product without image_url rejected');
  assert(r.errors.image_url !== undefined, 'image_url error present');
}

// G. UPDATE ARBITRARY IMAGE
console.log('\nG. UPDATE ARBITRARY IMAGE');
{
  const r = validateProductInput({ image_url: 'https://evil.com/steal.jpg' }, true);
  assert(r.isValid === false, 'update with external URL rejected');
  assert(r.errors.image_url !== undefined, 'image_url error present on update');
}

// G2. UPDATE DATA URI
console.log('\nG2. UPDATE DATA URI');
{
  const r = validateProductInput({ image_url: 'data:image/jpeg;base64,AAAA' }, true);
  assert(r.isValid === false, 'update with data URI rejected');
}

// H. NORMAL PRODUCT FLOW
console.log('\nH. NORMAL PRODUCT FLOW');
{
  const r = validateProductInput({
    name: 'Test Product',
    image_url: VALID_BUCKET_URL,
    final_price: 500,
  });
  assert(r.isValid === true, 'valid product with trusted URL accepted');
}

// I. OWNERSHIP
console.log('\nI. OWNERSHIP');
{
  const r = validateProductInput({
    name: 'Test',
    image_url: VALID_BUCKET_URL,
    final_price: 100,
    artisan_id: 'not-a-uuid',
  });
  assert(r.isValid === false, 'invalid artisan_id still rejected');
  assert(r.errors.artisan_id !== undefined, 'artisan_id error present');
}

// J. VALID UPDATE
console.log('\nJ. VALID UPDATE');
{
  const r = validateProductInput({
    image_url: VALID_BUCKET_URL,
  }, true);
  assert(r.isValid === true, 'update with valid image_url accepted');
}

// K. BLOB URL
console.log('\nK. BLOB URL');
{
  const r = validateImageUrl('blob:http://localhost:5173/abc-123');
  assert(r.valid === false, 'blob: URL rejected');
}

// L. EMPTY STRING
console.log('\nL. EMPTY STRING');
{
  const r = validateImageUrl('');
  assert(r.valid === false, 'empty string rejected');
}

// M. NON-STRING
console.log('\nM. NON-STRING');
{
  const r = validateImageUrl(12345);
  assert(r.valid === false, 'non-string rejected');
}

// N. WRONG BUCKET (correct domain, wrong bucket name)
console.log('\nN. WRONG BUCKET');
{
  const r = validateImageUrl(`${SUPABASE_URL}/storage/v1/object/public/other-bucket/image.jpg`);
  assert(r.valid === false, 'URL with wrong bucket rejected');
}

// N2. CROSS-DOMAIN BYPASS (wrong domain, matching bucket path)
console.log('\nN2. CROSS-DOMAIN BYPASS');
{
  const r = validateImageUrl('https://evil.com/storage/v1/object/public/product-images/image.jpg');
  assert(r.valid === false, 'cross-domain URL with matching bucket path rejected');
}

console.log('\n========================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('========================================');
if (failed > 0) process.exit(1);
