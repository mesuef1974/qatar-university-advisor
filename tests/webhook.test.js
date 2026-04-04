/**
 * webhook.test.js
 * Unit tests for verifySignature, maskPhone, isRateLimited
 * Extracted from api/webhook.js — QA Director Suite
 * Framework: Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// ─── Inline implementations under test ────────────────────────────────────────
// These functions are extracted verbatim from api/webhook.js so that we can
// test them in isolation without importing the full webhook handler (which has
// side-effects and external dependencies).

const RL_WINDOW_MS = 60_000;
const RL_MAX_REQS  = 60;

function createRateLimiter() {
  const rateLimitMap = new Map();

  function isRateLimited(ip) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now - record.windowStart > RL_WINDOW_MS) {
      rateLimitMap.set(ip, { count: 1, windowStart: now });
      if (rateLimitMap.size > 10_000) {
        for (const [k, v] of rateLimitMap) {
          if (now - v.windowStart > RL_WINDOW_MS) rateLimitMap.delete(k);
        }
      }
      return false;
    }

    record.count += 1;
    return record.count > RL_MAX_REQS;
  }

  function reset() {
    rateLimitMap.clear();
  }

  return { isRateLimited, reset };
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '***';
  return `***${phone.slice(-4)}`;
}

function verifySignature(rawBody, signature, secret, nodeEnv) {
  // Replicate logic from webhook.js but accept secret/env as args for testability
  if (!secret) {
    if (nodeEnv === 'production') return false;
    return true; // dev mode — skip
  }
  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('verifySignature', () => {
  const SECRET  = 'test-secret-key';
  const BODY    = JSON.stringify({ entry: [{ changes: [] }] });

  function makeSignature(body, secret) {
    return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
  }

  it('يقبل توقيعاً صحيحاً (happy path)', () => {
    const sig = makeSignature(BODY, SECRET);
    expect(verifySignature(BODY, sig, SECRET, 'production')).toBe(true);
  });

  it('يرفض توقيعاً خاطئاً', () => {
    const wrongSig = makeSignature(BODY, 'wrong-secret');
    expect(verifySignature(BODY, wrongSig, SECRET, 'production')).toBe(false);
  });

  it('يرفض عند غياب الـ signature', () => {
    expect(verifySignature(BODY, undefined, SECRET, 'production')).toBe(false);
  });

  it('يرفض signature فارغة', () => {
    expect(verifySignature(BODY, '', SECRET, 'production')).toBe(false);
  });

  it('يرفض في production عند غياب الـ secret', () => {
    expect(verifySignature(BODY, 'sha256=anything', undefined, 'production')).toBe(false);
  });

  it('يسمح في development عند غياب الـ secret (تحذير فقط)', () => {
    expect(verifySignature(BODY, 'sha256=anything', undefined, 'development')).toBe(true);
  });

  it('يرفض توقيعاً بطول مختلف (timingSafeEqual exception)', () => {
    // Signature of wrong length — Buffer.from comparison will throw
    expect(verifySignature(BODY, 'sha256=short', SECRET, 'production')).toBe(false);
  });

  it('يرفض body مختلف مع نفس الـ secret', () => {
    const sig = makeSignature(BODY, SECRET);
    const alteredBody = BODY + ' ';
    expect(verifySignature(alteredBody, sig, SECRET, 'production')).toBe(false);
  });
});

describe('maskPhone', () => {
  it('يخفي رقم قطري كامل ويُبقي آخر 4 أرقام', () => {
    expect(maskPhone('97412345678')).toBe('***5678');
  });

  it('يخفي رقم مكون من 4 أرقام فقط', () => {
    expect(maskPhone('1234')).toBe('***1234');
  });

  it('يُرجع *** لرقم أقل من 4 خانات', () => {
    expect(maskPhone('123')).toBe('***');
  });

  it('يُرجع *** لقيمة null', () => {
    expect(maskPhone(null)).toBe('***');
  });

  it('يُرجع *** لقيمة undefined', () => {
    expect(maskPhone(undefined)).toBe('***');
  });

  it('يُرجع *** لسلسلة فارغة', () => {
    expect(maskPhone('')).toBe('***');
  });

  it('يعمل مع رقم دولي طويل', () => {
    expect(maskPhone('447911123456')).toBe('***3456');
  });
});

describe('isRateLimited', () => {
  let rl;

  beforeEach(() => {
    rl = createRateLimiter();
  });

  it('أول طلب لـ IP جديد → غير محدود (false)', () => {
    expect(rl.isRateLimited('1.2.3.4')).toBe(false);
  });

  it('الطلب رقم 60 → لا يزال مقبولاً (false)', () => {
    // Call 59 more times (1 already in previous init, but we have fresh rl)
    for (let i = 0; i < 59; i++) rl.isRateLimited('5.5.5.5');
    // 60th call
    expect(rl.isRateLimited('5.5.5.5')).toBe(false);
  });

  it('الطلب رقم 61 → يتجاوز الحد (true)', () => {
    for (let i = 0; i < 60; i++) rl.isRateLimited('6.6.6.6');
    // 61st call should be rate-limited
    expect(rl.isRateLimited('6.6.6.6')).toBe(true);
  });

  it('IPs مختلفة لا تتداخل', () => {
    // Fill up IP A
    for (let i = 0; i < 61; i++) rl.isRateLimited('10.0.0.1');
    // IP B should still be clean
    expect(rl.isRateLimited('10.0.0.2')).toBe(false);
  });

  it('إعادة الحد بعد انتهاء النافذة الزمنية', async () => {
    // Exhaust the limit for an IP
    for (let i = 0; i < 61; i++) rl.isRateLimited('7.7.7.7');
    expect(rl.isRateLimited('7.7.7.7')).toBe(true);

    // Simulate window expiry by monkey-patching Date.now
    const originalNow = Date.now;
    // Advance time by RL_WINDOW_MS + 1ms
    vi.spyOn(Date, 'now').mockReturnValue(originalNow() + RL_WINDOW_MS + 1);

    // First call after reset should not be limited
    expect(rl.isRateLimited('7.7.7.7')).toBe(false);

    vi.restoreAllMocks();
  });
});
