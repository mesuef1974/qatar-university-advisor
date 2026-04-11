/**
 * Unit Tests — Upstash Rate Limiter
 * اختبارات وحدة لـ rate-limiter-upstash.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('isRateLimited — Upstash Rate Limiter', () => {
  beforeEach(() => {
    vi.resetModules();
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

    vi.mock('@upstash/redis', () => ({
      Redis: { fromEnv: () => ({}) },
    }));
    vi.mock('@upstash/ratelimit', () => ({
      Ratelimit: class {
        constructor() {}
        static slidingWindow() { return {}; }
        async limit() { return { success: true }; }
      },
    }));

    const { isRateLimited } = await import('../../lib/rate-limiter-upstash.ts');
    expect(await isRateLimited('chat', '1.2.3.4')).toBe(false);
  });

  // 3. Upstash مُهيَّأ — المستخدم تجاوز الحد → محدود
  it('يُرجع true عندما يكون success: false من Upstash', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-upstash.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');

    vi.mock('@upstash/redis', () => ({
      Redis: { fromEnv: () => ({}) },
    }));
    vi.mock('@upstash/ratelimit', () => ({
      Ratelimit: class {
        constructor() {}
        static slidingWindow() { return {}; }
        async limit() { return { success: false }; }
      },
    }));

    const { isRateLimited } = await import('../../lib/rate-limiter-upstash.ts');
    expect(await isRateLimited('webhook', '5.6.7.8')).toBe(true);
  });

  // 4. Upstash يرمي استثناءً → fail-open (غير محدود)
  it('يُرجع false (fail-open) عند حدوث استثناء من Upstash', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://fake-upstash.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake-token');

    vi.mock('@upstash/redis', () => ({
      Redis: { fromEnv: () => ({}) },
    }));
    vi.mock('@upstash/ratelimit', () => ({
      Ratelimit: class {
        constructor() {}
        static slidingWindow() { return {}; }
        async limit() { throw new Error('Upstash connection refused'); }
      },
    }));

    const { isRateLimited } = await import('../../lib/rate-limiter-upstash.ts');
    expect(await isRateLimited('chat', '9.9.9.9')).toBe(false);
  });
});
