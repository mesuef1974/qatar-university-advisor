/**
 * Unit Tests — Upstash Rate Limiter
 * اختبارات وحدة لـ rate-limiter-upstash.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── مركزي: mock واحد قابل للتهيئة لكل الاختبارات ──────────────────────────
// Vitest يرفع (hoist) جميع استدعاءات vi.mock() للأعلى بغض النظر عن موضعها.
// نستخدم متغيرًا مشتركًا يمكن تعديله في كل اختبار بدلاً من mock منفصل لكل test.
let _mockLimitResult = { success: true };
let _mockLimitShouldThrow = false;

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({}) },
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    constructor() {}
    static slidingWindow() { return {}; }
    async limit() {
      if (_mockLimitShouldThrow) throw new Error('Upstash connection refused');
      return _mockLimitResult;
    }
  },
}));

describe('isRateLimited — Upstash Rate Limiter', () => {
  beforeEach(() => {
    vi.resetModules();
    _mockLimitResult = { success: true };
    _mockLimitShouldThrow = false;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // 1. بيئة غير مُهيَّأة → دائماً غير محدود
  it('يُرجع false (غير محدود) إذا لم تكن متغيرات Upstash مُهيَّأة', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

    const { isRateLimited } = await import('../../lib/rate-limiter-upstash.ts');
    expect(await isRateLimited('chat', '1.2.3.4')).toBe(false);
    expect(await isRateLimited('webhook', '1.2.3.4')).toBe(false);
  });

  // 2. Upstash مُهيَّأ — المستخدم ضمن الحد → غير محدود
  it('يُرجع false عندما يكون success: true من Upstash', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-upstash.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');
    _mockLimitResult = { success: true };

    const { isRateLimited } = await import('../../lib/rate-limiter-upstash.ts');
    expect(await isRateLimited('chat', '1.2.3.4')).toBe(false);
  });

  // 3. Upstash مُهيَّأ — المستخدم تجاوز الحد → محدود
  it('يُرجع true عندما يكون success: false من Upstash', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-upstash.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');
    _mockLimitResult = { success: false };

    const { isRateLimited } = await import('../../lib/rate-limiter-upstash.ts');
    expect(await isRateLimited('webhook', '5.6.7.8')).toBe(true);
  });

  // 4. Upstash يرمي استثناءً → fail-open (غير محدود)
  it('يُرجع false (fail-open) عند حدوث استثناء من Upstash', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-upstash.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');
    _mockLimitShouldThrow = true;

    const { isRateLimited } = await import('../../lib/rate-limiter-upstash.ts');
    expect(await isRateLimited('chat', '9.9.9.9')).toBe(false);
  });
});
