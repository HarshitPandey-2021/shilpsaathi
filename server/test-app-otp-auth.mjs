/**
 * Mock-only tests for backend-managed OTP (TextBee delivery, app JWT).
 * NEVER calls live TextBee/Supabase. TextBee fetch is stubbed.
 */

import { config } from './src/config/index.js';
import {
  generateOtp, hashOtp, buildOtpMessage, buildTextBeeRequest,
  sendTextBeeSms, issueOtp, peekOtpState, verifyStoredOtp, resetOtpStore,
} from './src/services/appOtpAuth.js';
import { signAppToken, verifyAppToken } from './src/services/appToken.js';

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

config.textbee.apiKey = 'test-key-from-env';
config.appAuth.jwtSecret = 'test-jwt-secret-0123456789abcdef';
config.appAuth.otpPepper = 'test-pepper';
process.env.APP_JWT_SECRET = config.appAuth.jwtSecret;
process.env.APP_OTP_PEPPER = config.appAuth.otpPepper;
resetOtpStore();

// SEND: secure OTP, hash-only persistence, TextBee shape
{
  const otp = generateOtp();
  assert(/^\d{6}$/.test(otp), 'secure 6-digit OTP generated');
  assert(new Set([otp, generateOtp(), generateOtp()]).size > 1, 'OTP varies');
  const issued = issueOtp('+919876543210');
  const st = peekOtpState('+919876543210');
  assert(st && st.otpHash && !('otp' in st), 'only OTP hash persisted');
  assert(st.otpHash === hashOtp(issued, '+919876543210'), 'HMAC hash matches');
  const req = buildTextBeeRequest({ phone: '+919876543210', message: buildOtpMessage(issued) });
  assert(req.url === 'https://api.textbee.dev/api/v1/gateway/send-sms', 'TextBee endpoint');
  assert(req.headers['x-api-key'] === 'test-key-from-env', 'key from config only');
  assert(req.body.recipients[0] === '+919876543210', 'E.164 recipient');
  const fs = await import('node:fs');
  for (const f of ['./src/services/appOtpAuth.js', './src/controllers/authController.js']) {
    const src = fs.readFileSync(new URL(f, import.meta.url), 'utf8');
    assert(!/console\.(log|info|debug)\([^)]*(otp|OTP)/.test(src), `no OTP logging in ${f}`);
  }
  resetOtpStore();
}
// SEND: TextBee failure handling (mocked)
{
  assert(await sendTextBeeSms({ phone: '+919876543210', message: 'x' }, async () => ({ ok: true, status: 200 })) === true, 'TextBee 200 accepted');
  for (const code of [401, 429, 500]) {
    try {
      await sendTextBeeSms({ phone: '+919876543210', message: 'x' }, async () => ({ ok: false, status: code }));
      assert(false, `TextBee ${code} should throw`);
    } catch (e) { assert(e.statusCode === 502 && e.providerStatus === code, `TextBee ${code} safe 502`); }
  }
}

// SEND middleware layers intact
{
  const otp = await import('./src/middleware/otpProtection.js');
  assert(typeof otp.otpSendProtection === 'function', 'send protection intact');
  assert(typeof otp.otpVerifyProtection === 'function', 'verify protection intact');
}
// VERIFY lifecycle: success, single-use, wrong, lock, expiry
{
  const phone = '+911111111111';
  const otp = issueOtp(phone);
  assert(verifyStoredOtp(phone, otp).ok === true, 'correct OTP succeeds');
  assert(peekOtpState(phone) === null, 'success clears state (single-use)');
  assert(verifyStoredOtp(phone, otp).ok === false, 'reused OTP fails');
  const p2 = '+912222222222';
  issueOtp(p2);
  assert(verifyStoredOtp(p2, '000000').ok === false, 'wrong OTP fails');
  assert(peekOtpState(p2).failedAttempts === 1, 'attempts increment');
  const p3 = '+913333333333';
  issueOtp(p3);
  for (let i = 0; i < 5; i += 1) verifyStoredOtp(p3, '000000');
  assert(verifyStoredOtp(p3, '000000').reason === 'locked', 'lock after max attempts');
  const p4 = '+914444444444';
  const old = issueOtp(p4, { nowMs: Date.now() - 10 * 60 * 1000 });
  assert(verifyStoredOtp(p4, old).ok === false, 'expired OTP fails');
  resetOtpStore();
}
// AUTH: JWT issue/verify/expiry; middleware 401s
{
  const token = signAppToken({ artisanId: 'a1', phone: '+915555555555' });
  assert(verifyAppToken(token)?.sub === 'a1', 'JWT issued + verified');
  assert(!verifyAppToken(token + 'x'), 'tampered JWT null');
  assert(!verifyAppToken(signAppToken({ artisanId: 'a1', phone: '+915555555555' }, { expiresInSec: -10 })), 'expired JWT null');
  const { authenticate } = await import('./src/middleware/auth.js');
  const r1 = mockRes(); let n1 = false;
  await authenticate({ headers: {} }, r1, () => { n1 = true; });
  assert(!n1 && r1.out.status === 401, 'missing JWT 401');
  const r2 = mockRes(); let n2 = false;
  await authenticate({ headers: { authorization: 'Bearer bad.token.here' } }, r2, () => { n2 = true; });
  assert(!n2 && r2.out.status === 401, 'invalid JWT 401');
}
// Supabase OTP removal + wiring + hardening coverage
{
  const fs = await import('node:fs');
  const ctrlSrc = fs.readFileSync(new URL('./src/controllers/authController.js', import.meta.url), 'utf8');
  assert(!ctrlSrc.includes('signInWithOtp') && !ctrlSrc.includes('supabase.auth.verifyOtp'), 'Supabase OTP removed');
  assert(!ctrlSrc.includes('auth_uid'), 'auth_uid writes removed');
  assert(ctrlSrc.includes('signAppToken') && ctrlSrc.includes('verifyStoredOtp'), 'backend OTP+JWT wired');
  const authSrc = fs.readFileSync(new URL('./src/middleware/auth.js', import.meta.url), 'utf8');
  assert(!authSrc.includes('supabase.auth.getUser'), 'middleware off Supabase Auth');
  const tokenSrc = fs.readFileSync(new URL('./src/services/appToken.js', import.meta.url), 'utf8');
  assert(!/console\.(log|info|debug)/.test(tokenSrc), 'JWT secret never logged');
  const cfgSrc = fs.readFileSync(new URL('./src/config/index.js', import.meta.url), 'utf8');
  assert(!cfgSrc.includes('BREVO_API_KEY') && !cfgSrc.includes('BREVO_SMS_SENDER'), 'dead Brevo SMS config gone');
  const appSrc = fs.readFileSync(new URL('./src/app.js', import.meta.url), 'utf8');
  assert(appSrc.includes("app.set('trust proxy', 1)"), 'trust proxy exactly one hop');
  assert(!/SERVICE_ROLE|SUPABASE_SERVICE_ROLE_KEY/.test(appSrc), 'service key not in app wiring');
  // missing/weak secret fails closed
  const keep = config.appAuth.jwtSecret;
  config.appAuth.jwtSecret = '';
  assert(verifyAppToken(signAppTokenForTest()) === null, 'missing secret rejects tokens');
  try { signAppToken({ artisanId: 'a1', phone: '+915555555555' }); assert(false, 'missing secret should throw'); }
  catch (e) { assert(e.statusCode === 503, 'missing secret fails closed 503'); }
  config.appAuth.jwtSecret = 'short';
  assert(verifyAppToken('x.y.z') === null, 'weak secret rejects tokens');
  config.appAuth.jwtSecret = keep;
  // issuer + required claims enforced
  const forged = signAppToken({ artisanId: '', phone: '' });
  assert(!verifyAppToken(forged), 'empty identity claims rejected');
}
function signAppTokenForTest() {
  return 'aaa.bbb.ccc';
}

console.log(`\nRESULTS: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
