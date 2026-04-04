/**
 * Unit Tests — Rate Limiter
 * T-Q7-T015: اختبار Rate Limiter الجديد
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// لا نستورد Upstash في الاختبارات — يعمل بـ in-memory fallback
vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

describe('Rate Limiter — checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يسمح بالطلبات ضمن الحد المسموح', async () => {
    const { checkRateLimit } = await import('../../lib/rate-limiter.js');
    const result = await checkRateLimit('test-ip-1', { maxRequests: 5, windowMs: 60000, prefix: 'test1' });
    expect(result.success).toBe(true);
  });

  it('يُرجع success: true للطلب الأول', async () => {
    const { checkRateLimit } = await import('../../lib/rate-limiter.js');
    const result = await checkRateLimit(`test-ip-new-${Date.now()}`, { maxRequests: 3, windowMs: 60000, prefix: 'test2' });
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('يُرجع source field', async () => {
    const { checkRateLimit } = await import('../../lib/rate-limiter.js');
    const result = await checkRateLimit('test-source', { maxRequests: 10, windowMs: 60000, prefix: 'test3' });
    expect(['redis', 'memory']).toContain(result.source);
  });

  it('يُبلّغ بـ false بعد تجاوز الحد', async () => {
    const { checkRateLimit } = await import('../../lib/rate-limiter.js');
    const id = `exceed-test-${Date.now()}`;
    const opts = { maxRequests: 2, windowMs: 60000, prefix: 'exceed' };

    await checkRateLimit(id, opts); // 1
    await checkRateLimit(id, opts); // 2
    const result = await checkRateLimit(id, opts); // 3 — تجاوز
    expect(result.success).toBe(false);
  });
});
