/**
 * Mock-only tests for the Supabase Send SMS Hook → TextBee integration.
 * NEVER calls the live TextBee or Supabase endpoints. fetch is stubbed.
 */

import { config } from './src/config/index.js';
import {
  extractSmsHookPayload,
  buildTextBeeSmsRequest,
  handleSendSmsHook,
} from './src/services/textBeeSmsHook.js';

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
let lastCall = null;
function stubFetch(status) {
  lastCall = null;
  globalThis.fetch = async (url, init) => {
    lastCall = { url, headers: init?.headers || {}, body: init?.body };
    return { ok: status >= 200 && status < 300, status, json: async () => ({}) };
  };
}
function restoreFetch() { globalThis.fetch = realFetch; }

config.textbee.apiKey = 'test-key-from-env';
config.smsHook.secret = 'hook-secret';

// 1-3. valid payload extracts + normalizes phone and OTP
{
  const r = extractSmsHookPayload({ user: { phone: '8303872467' }, sms: { otp: '123456' } });
  assert(r.valid && r.phone === '+918303872467' && r.otp === '123456', 'valid payload extracts phone+otp');
}
// 3-5. TextBee endpoint/auth/body
{
  const req = buildTextBeeSmsRequest({ phone: '+918303872467', otp: '123456' });
  assert(req.url === 'https://api.textbee.dev/api/v1/gateway/send-sms', 'TextBee endpoint correct');
  assert(req.headers['x-api-key'] === 'test-key-from-env', 'x-api-key from config/env only');
  assert(req.headers['content-type'] === 'application/json', 'JSON content type');
  assert(Array.isArray(req.body.recipients) && req.body.recipients[0] === '+918303872467', 'recipients E.164 array');
  assert(typeof req.body.message === 'string' && req.body.message.includes('123456'), 'message contains OTP');
}
// 6. OTP never logged in source
{
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('./src/services/textBeeSmsHook.js', import.meta.url), 'utf8');
  assert(!/console\.(log|info|debug|warn|error)\(.*otp/iu.test(src), 'OTP never logged in source');
  assert(!/brevo/i.test(src), 'no Brevo reference in TextBee hook');
}
// 7-8. invalid payloads rejected
{
  assert(!extractSmsHookPayload({ user: {}, sms: { otp: '123456' } }).valid, 'missing phone rejected');
  assert(!extractSmsHookPayload({ user: { phone: 'bad' }, sms: { otp: '123456' } }).valid, 'invalid phone rejected');
  assert(!extractSmsHookPayload({ user: { phone: '+918303872467' }, sms: {} }).valid, 'missing OTP rejected');
  assert(!extractSmsHookPayload({ user: { phone: '+918303872467' }, sms: { otp: 'ab' } }).valid, 'malformed OTP rejected');
}
// 14. hook authentication preserved
{
  const res = mockRes();
  await handleSendSmsHook({ headers: { authorization: 'Bearer wrong' }, body: {} }, res);
  assert(res.out.status === 401, 'wrong hook secret → 401');
  const res2 = mockRes();
  await handleSendSmsHook({ headers: {}, body: {} }, res2);
  assert(res2.out.status === 401, 'missing hook secret → 401');
}
// 9. TextBee 200 → hook success
{
  stubFetch(200);
  const res = mockRes();
  await handleSendSmsHook(
    { headers: { authorization: 'Bearer hook-secret' }, body: { user: { phone: '8303872467' }, sms: { otp: '654321' } } },
    res,
  );
  assert(res.out.status === 200, 'TextBee 200 → hook 200');
  assert(lastCall.url === 'https://api.textbee.dev/api/v1/gateway/send-sms', 'called TextBee endpoint');
  const sent = JSON.parse(lastCall.body);
  assert(sent.recipients[0] === '+918303872467', 'sent E.164 recipient');
  restoreFetch();
}
// 10-12. TextBee 401/429/5xx → safe 502 without leaking OTP/secret
for (const code of [401, 429, 500]) {
  stubFetch(code);
  const res = mockRes();
  await handleSendSmsHook(
    { headers: { authorization: 'Bearer hook-secret' }, body: { user: { phone: '8303872467' }, sms: { otp: '654321' } } },
    res,
  );
  const text = JSON.stringify(res.out.body || {});
  assert(res.out.status === 502 && res.out.body?.success === false, `TextBee ${code} → safe 502`);
  assert(!text.includes('654321') && !text.includes('hook-secret') && !text.includes('test-key-from-env'), `TextBee ${code} leaks nothing`);
  restoreFetch();
}
// 13. missing API key → safe failure
{
  const keep = config.textbee.apiKey;
  config.textbee.apiKey = '';
  const res = mockRes();
  await handleSendSmsHook(
    { headers: { authorization: 'Bearer hook-secret' }, body: { user: { phone: '8303872467' }, sms: { otp: '654321' } } },
    res,
  );
  assert(res.out.status === 500 && !JSON.stringify(res.out.body).includes('654321'), 'missing key → safe 500');
  config.textbee.apiKey = keep;
}
// existing auth + otp protection untouched
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
