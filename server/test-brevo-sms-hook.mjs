/**
 * Mock-only tests for the Supabase Send SMS Hook → Brevo integration.
 * NEVER calls the live Brevo or Supabase endpoints. fetch is stubbed.
 */

import { config } from './src/config/index.js';
import {
  extractSmsHookPayload,
  buildBrevoSmsRequest,
  handleSendSmsHook,
} from './src/services/brevoSmsHook.js';

let passed = 0;
let failed = 0;
function assert(cond, name) {
  if (cond) { console.log(`  PASS: ${name}`); passed++; }
  else { console.error(`  FAIL: ${name}`); failed++; }
}
function mockRes() {
  const c = {};
  const res = {
    status(x) { c.status = x; return res; },
    json(o) { c.body = o; return res; },
    get out() { return c; },
  };
  return res;
}
const realFetch = globalThis.fetch;
function stubFetch(ok) {
  globalThis.fetch = async () => ({ ok, status: ok ? 200 : 400, json: async () => ({}) });
}
function restoreFetch() { globalThis.fetch = realFetch; }

config.brevo.apiKey = 'test-key-from-env';
config.brevo.smsSender = 'TESTID';
config.smsHook.secret = 'hook-secret';

// 1. valid payload extracts phone + OTP
{
  const r = extractSmsHookPayload({ user: { phone: '+918303872467' }, sms: { otp: '123456' } });
  assert(r.valid && r.phone === '+918303872467' && r.otp === '123456', 'valid payload extracts phone+otp');
}
// 2. Brevo request shape
{
  const req = buildBrevoSmsRequest({ phone: '+918303872467', otp: '123456' });
  assert(req.url === 'https://api.brevo.com/v3/transactionalSMS/send', 'Brevo URL correct');
  assert(req.headers['api-key'] === 'test-key-from-env', 'api-key from config/env only');
  assert(req.body.recipient === '+918303872467', 'recipient is E.164 phone');
  assert(req.body.sender === 'TESTID', 'sender from config');
  assert(req.body.content.includes('123456') && !req.body.content.includes('STOP'), 'short OTP content, no STOP code');
}
// 3. no OTP in module source logs
{
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('./src/services/brevoSmsHook.js', import.meta.url), 'utf8');
  assert(!/console\.(log|info|debug|warn|error)\(.*otp/iu.test(src), 'OTP never logged in source');
  assert(!src.includes('xkeysib-'), 'no hardcoded Brevo key in source');
}
// 5/6. invalid payloads rejected
{
  assert(!extractSmsHookPayload({ user: {}, sms: { otp: '123456' } }).valid, 'missing phone rejected');
  assert(!extractSmsHookPayload({ user: { phone: 'bad' }, sms: { otp: '123456' } }).valid, 'invalid phone rejected');
  assert(!extractSmsHookPayload({ user: { phone: '+918303872467' }, sms: {} }).valid, 'missing OTP rejected');
  assert(!extractSmsHookPayload({ user: { phone: '+918303872467' }, sms: { otp: 'ab' } }).valid, 'malformed OTP rejected');
}
// auth: wrong secret → 401
{
  config.smsHook.secret = 'hook-secret';
  const res = mockRes();
  await handleSendSmsHook({ headers: { authorization: 'Bearer wrong' }, body: {} }, res);
  assert(res.out.status === 401, 'wrong hook secret → 401');
}
// 7. Brevo success → 200 (mocked)
{
  stubFetch(true);
  const res = mockRes();
  await handleSendSmsHook(
    { headers: { authorization: 'Bearer hook-secret' }, body: { user: { phone: '8303872467' }, sms: { otp: '654321' } } },
    res,
  );
  assert(res.out.status === 200, 'Brevo success → hook 200');
  restoreFetch();
}
// 8. Brevo failure → safe error, no OTP/secret leaked
{
  stubFetch(false);
  const res = mockRes();
  await handleSendSmsHook(
    { headers: { authorization: 'Bearer hook-secret' }, body: { user: { phone: '8303872467' }, sms: { otp: '654321' } } },
    res,
  );
  const text = JSON.stringify(res.out.body || {});
  assert(res.out.status === 502 && res.out.body?.success === false, 'Brevo failure → safe 502');
  assert(!text.includes('654321') && !text.includes('hook-secret') && !text.includes('test-key-from-env'), 'failure leaks no OTP/secret');
  restoreFetch();
}
// missing api key → 500 safe
{
  const keep = config.brevo.apiKey;
  config.brevo.apiKey = '';
  const res = mockRes();
  await handleSendSmsHook(
    { headers: { authorization: 'Bearer hook-secret' }, body: { user: { phone: '8303872467' }, sms: { otp: '654321' } } },
    res,
  );
  assert(res.out.status === 500 && !JSON.stringify(res.out.body).includes('654321'), 'missing key → safe 500');
  config.brevo.apiKey = keep;
}
// 9/10. existing auth + otp protection untouched
{
  const auth = await import('./src/middleware/auth.js');
  const otp = await import('./src/middleware/otpProtection.js');
  const ctrl = await import('./src/controllers/authController.js');
  assert(typeof auth.authenticate === 'function', 'auth intact');
  assert(typeof otp.otpSendProtection === 'function' && typeof otp.otpVerifyProtection === 'function', 'otp protection intact');
  assert(typeof ctrl.sendOtp === 'function' && typeof ctrl.verifyOtp === 'function', 'supabase OTP flow intact');
}

console.log(`\nRESULTS: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
