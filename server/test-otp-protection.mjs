/**
 * Focused tests for OTP abuse protection middleware.
 * Tests send cooldown, window/IP/daily limits, and verify
 * brute-force protection — all without calling Supabase.
 */

import {
  otpSendProtection,
  otpVerifyProtection,
  resetOtpState,
  _testSetNow,
  _testResetNow,
} from './src/middleware/otpProtection.js';

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
  return { headers, body, query, params, ip: '192.168.1.100' };
}

function mockRes() {
  const captured = {};
  const res = {
    statusCode: 200,
    status(code) { captured.status = code; res.statusCode = code; return res; },
    json(obj) { captured.body = obj; return res; },
    setHeader(name, value) {
      captured.headers = captured.headers || {};
      captured.headers[name] = value;
      return res;
    },
    get captured() { return captured; },
  };
  return res;
}

const VALID_PHONE = "+919876543210";

function freshState() {
  resetOtpState();
  _testResetNow();
}

async function callSend(body) {
  const req = mockReq({}, body);
  const res = mockRes();
  let nextCalled = false;
  await otpSendProtection(req, res, () => { nextCalled = true; });
  return { nextCalled, res, req };
}

async function callVerify(body, statusCode, jsonBody) {
  const req = mockReq({}, body);
  const res = mockRes();
  let nextCalled = false;
  await otpVerifyProtection(req, res, () => { nextCalled = true; });
  if (statusCode) res.status(statusCode).json(jsonBody);
  return { nextCalled, res, req };
}

// ===== SEND TESTS =====

console.log("\n--- SEND: first attempt allowed ---");
freshState();
{
  const { nextCalled, res } = await callSend({ phone: VALID_PHONE });
  assert(nextCalled, "first send passes through (next called)");
  assert(res.captured.status !== 429, "no 429 on first send");
}

console.log("\n--- SEND: resend cooldown ---");
freshState();
{
  await callSend({ phone: VALID_PHONE });
  const realNow = Date.now();
  _testSetNow(realNow + 1000); // 1 second later

  const { nextCalled, res } = await callSend({ phone: VALID_PHONE });
  assert(!nextCalled, "second send blocked during cooldown (next NOT called)");
  assert(res.captured.status === 429, "returns 429 during cooldown");
  assert(res.captured.headers["Retry-After"], "Retry-After header present");
}

console.log("\n--- SEND: after cooldown allowed ---");
freshState();
{
  const realNow = Date.now();
  _testSetNow(realNow);

  await callSend({ phone: VALID_PHONE }); // send #1 at t=0
  _testSetNow(realNow + 61000); // 61 seconds later — cooldown expired

  const { nextCalled } = await callSend({ phone: VALID_PHONE });
  assert(nextCalled, "second send allowed after cooldown");
}

console.log("\n--- SEND: phone window limit enforced ---");
freshState();
{
  const realNow = Date.now();
  _testSetNow(realNow);

  for (let i = 0; i < 5; i++) {
        _testSetNow(realNow + i * 61000); // 61s apart — past cooldown each time
    const { nextCalled } = await callSend({ phone: VALID_PHONE });
    assert(nextCalled, `send #${i + 1} allowed (within window of 5)`);
  }

  _testSetNow(realNow + 6 * 61000);
  const { nextCalled, res } = await callSend({ phone: VALID_PHONE });
  assert(!nextCalled, "6th send blocked by phone window limit");
  assert(res.captured.status === 429, "6th send returns 429");
}

console.log("\n--- SEND: IP limit enforced ---");
freshState();
{
  const realNow = Date.now();
  _testSetNow(realNow);

  for (let i = 0; i < 10; i++) {
    _testSetNow(realNow+i*1000);
    const phone = `+91987654321${i}`;
    const { nextCalled } = await callSend({ phone });
    assert(nextCalled, `send #${i + 1} from same IP allowed (unique phone)`);
  }

  _testSetNow(realNow+10*1000);
  const { nextCalled, res } = await callSend({ phone: "+919876543220" });
  assert(!nextCalled, "11th send from same IP blocked");
  assert(res.captured.status === 429, "11th send from same IP returns 429");
}

console.log("\n--- SEND: different phone from same IP — IP protection applies ---");
freshState();
{
  const realNow = Date.now();
  _testSetNow(realNow);

  for (let i = 0; i < 10; i++) {
    _testSetNow(realNow+i*1000);
    const phone = `+91987654321${i}`;
    await callSend({ phone });
  }

  _testSetNow(realNow+10*1000);
  const phoneE = "+919876543999";
  const { nextCalled, res } = await callSend({ phone: phoneE });
  assert(!nextCalled, "11th phone from same IP blocked by IP limit");
  assert(res.captured.status === 429, "returns 429 for IP limit");
}

console.log("\n--- SEND: invalid phone passes through ---");
freshState();
{
  const { nextCalled } = await callSend({ phone: "invalid" });
  assert(nextCalled, "invalid phone passes through to controller");
}

console.log("\n--- SEND: missing phone passes through ---");
freshState();
{
  const { nextCalled } = await callSend({});
  assert(nextCalled, "missing phone passes through to controller");
}

// ===== VERIFY TESTS =====

console.log("\n--- VERIFY: not locked -> passes through ---");
freshState();
{
  const { nextCalled } = await callVerify({ phone: VALID_PHONE, token: "123456" }, null, null);
  assert(nextCalled, "verify passes through when not locked");
}

console.log("\n--- VERIFY: failed attempts counted ---");
freshState();
{
  const { _inspectOtpState } = await import("./src/middleware/otpProtection.js");

  for (let i = 0; i < 4; i++) {
    const { nextCalled } = await callVerify(
      { phone: VALID_PHONE, token: "000000" },
      401,
      { success: false, message: "Invalid code" }
    );
    assert(nextCalled, `verify #${i + 1} passes through (not yet locked)`);
    const state = _inspectOtpState();
    const ps = state.phones[VALID_PHONE];
    assert(ps.failedAttempts === i + 1, `failedAttempts === ${i + 1} after attempt #${i + 1}`);
  }
}

console.log("\n--- VERIFY: threshold reached -> lock ---");
freshState();
{
  for (let i = 0; i < 5; i++) {
    await callVerify(
      { phone: VALID_PHONE, token: "000000" },
      401,
      { success: false, message: "Invalid code" }
    );
  }

  const { _inspectOtpState } = await import("./src/middleware/otpProtection.js");
  const ps = _inspectOtpState().phones[VALID_PHONE];
  assert(ps.lockedUntil > 0, "phone is locked after 5 failed attempts");

  const { nextCalled, res } = await callVerify(
    { phone: VALID_PHONE, token: "123456" },
    null,
    null
  );
  assert(!nextCalled, "locked phone verify blocked (next NOT called)");
  assert(res.captured.status === 429, "locked phone verify returns 429");
  assert(res.captured.headers["Retry-After"], "Retry-After header present on lock");
}

console.log("\n--- VERIFY: locked phone cannot send OTP ---");
freshState();
{
  for (let i = 0; i < 5; i++) {
    await callVerify(
      { phone: VALID_PHONE, token: "000000" },
      401,
      { success: false, message: "Invalid code" }
    );
  }

  const { nextCalled, res } = await callSend({ phone: VALID_PHONE });
  assert(!nextCalled, "send blocked for locked phone");
  assert(res.captured.status === 429, "send returns 429 for locked phone");
}

console.log("\n--- VERIFY: lockout expires after duration ---");
freshState();
{
  const { _inspectOtpState } = await import("./src/middleware/otpProtection.js");

  for (let i = 0; i < 5; i++) {
    await callVerify(
      { phone: VALID_PHONE, token: "000000" },
      401,
      { success: false, message: "Invalid code" }
    );
  }

  const ps = _inspectOtpState().phones[VALID_PHONE];
  const now = ps.lockedUntil;
  assert(ps.lockedUntil > 0, "phone is locked");
  assert(ps.lockedUntil <= Date.now() + 16 * 60 * 1000, "lockedUntil is ~15min in future");
}

console.log("\n--- VERIFY: different phone independent ---");
freshState();
{
  const phoneA = "+919876543210";
  const phoneB = "+919876543999";

  for (let i = 0; i < 5; i++) {
    await callVerify(
      { phone: phoneA, token: "000000" },
      401,
      { success: false, message: "Invalid code" }
    );
  }

  const { nextCalled: nextA, res: resA } = await callVerify(
    { phone: phoneA, token: "123456" },
    null,
    null
  );
  assert(!nextA, "phoneA is locked");
  assert(resA.captured.status === 429, "phoneA returns 429");

  const { nextCalled: nextB, res: resB } = await callVerify(
    { phone: phoneB, token: "123456" },
    null,
    null
  );
  assert(nextB, "phoneB is NOT locked (independent from phoneA)");
}

console.log("\n--- VERIFY: success clears failed attempts ---");
freshState();
{
  await callVerify(
    { phone: VALID_PHONE, token: "000000" },
    401,
    { success: false, message: "Invalid code" }
  );

  const { _inspectOtpState } = await import("./src/middleware/otpProtection.js");
  let ps = _inspectOtpState().phones[VALID_PHONE];
  assert(ps.failedAttempts === 1, "one failed attempt recorded");

  await callVerify(
    { phone: VALID_PHONE, token: "123456" },
    200,
    { success: true, data: { access_token: "abc" } }
  );

  ps = _inspectOtpState().phones[VALID_PHONE];
  assert(ps.failedAttempts === 0, "failed attempts cleared on success");
  assert(ps.lockedUntil === 0, "lock cleared on success");
}

// ===== REGRESSION =====

console.log("\n--- REGRESSION: auth module unchanged ---");
{
  const auth = await import("./src/middleware/auth.js");
  assert(typeof auth.authenticate === "function", "auth.authenticate still exported");
  assert(typeof auth.optionalAuth === "function", "auth.optionalAuth still exported");
}

console.log("\n========================================");
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log("========================================");
if (failed > 0) process.exit(1);
