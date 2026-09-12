/**
 * Minimal HS256 application JWT (no dependency).
 * Fail-closed: missing APP_JWT_SECRET refuses to sign/verify.
 */

import crypto from 'node:crypto';
import { config } from '../config/index.js';

function now() { return Date.now(); }
function secret() { return (config.appAuth?.jwtSecret || '').trim(); }
function b64(s) {
  return Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function signAppToken({ artisanId, phone }, { expiresInSec } = {}) {
  const key = secret();
  if (!key || key.length < 32) {
    throw Object.assign(new Error('Authentication is not configured.'), { statusCode: 503 });
  }
  const ttl = Number(expiresInSec) || config.appAuth?.jwtExpiresInSec || 7 * 24 * 60 * 60;
  const iat = Math.floor(now() / 1000);
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64(JSON.stringify({ sub: artisanId, phone, iat, exp: iat + ttl, iss: 'shilpsaathi' }));
  const sig = crypto.createHmac('sha256', key).update(`${header}.${body}`).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.${sig}`;
}

export function verifyAppToken(token) {
  const key = secret();
  if (!key || key.length < 32 || !token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  let headerJson;
  try {
    headerJson = JSON.parse(Buffer.from(header.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch { return null; }
  if (headerJson?.alg !== 'HS256') return null;
  const expected = crypto.createHmac('sha256', key).update(`${header}.${body}`).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch { return null; }
  if (!payload?.sub || !payload?.phone || payload?.iss !== 'shilpsaathi') return null;
  if (!payload?.exp || payload.exp * 1000 <= now()) return null;
  return payload;
}
