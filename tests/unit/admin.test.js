/**
 * Unit Tests — api/admin.js
 * Tests for the admin dashboard handler
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────
vi.mock('../../lib/validateEnv.js', () => ({
  requireEnv: vi.fn().mockReturnValue(true),
}));

vi.mock('../../lib/rate-limiter.js', () => ({
  rateLimitMiddleware: vi.fn().mockResolvedValue(false),
}));

vi.mock('../../lib/supabase.js', () => ({
  getStats: vi.fn().mockResolvedValue({ totalUsers: 10, totalMessages: 50, totalQueries: 30 }),
  getTopQueries: vi.fn().mockResolvedValue([{ query: 'test', count: 5 }]),
}));

vi.mock('../../lib/circuit-breaker.js', () => ({
  getCircuitStatus: vi.fn().mockReturnValue({ state: 'CLOSED', isHealthy: true }),
}));

// ── Helpers ──────────────────────────────────────────────────────────
function createMockReqRes(method = 'GET', headers = {}) {
  const req = {
    method,
    headers: { ...headers },
  };
  const res = {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

describe('api/admin handler', () => {
  let handler;
  let requireEnv;
  let rateLimitMiddleware;
  let getStats;
  let getTopQueries;

  beforeEach(async () => {
    vi.resetModules();

    process.env.ADMIN_PASSWORD = 'test-secret-123';
    process.env.ADMIN_ORIGIN = 'https://test.example.com';

    const adminModule = await import('../../api/admin.js');
    handler = adminModule.default;

    const validateEnvMod = await import('../../lib/validateEnv.js');
    requireEnv = validateEnvMod.requireEnv;
    requireEnv.mockReturnValue(true);

    const rateMod = await import('../../lib/rate-limiter.js');
    rateLimitMiddleware = rateMod.rateLimitMiddleware;
    rateLimitMiddleware.mockResolvedValue(false);

    const supaMod = await import('../../lib/supabase.js');
    getStats = supaMod.getStats;
    getTopQueries = supaMod.getTopQueries;
  });

  // ── requireEnv failure ────────────────────────────────────────────
  it('returns early when requireEnv fails', async () => {
    requireEnv.mockReturnValue(false);
    const { req, res } = createMockReqRes('GET');
    await handler(req, res);
    expect(res.status).not.toHaveBeenCalled();
  });

  // ── OPTIONS preflight ─────────────────────────────────────────────
  it('handles OPTIONS preflight', async () => {
    const { req, res } = createMockReqRes('OPTIONS');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  // ── Method not allowed ────────────────────────────────────────────
  it('rejects POST with 405', async () => {
    const { req, res } = createMockReqRes('POST');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  // ── Rate limited ──────────────────────────────────────────────────
  it('returns early when rate limited', async () => {
    rateLimitMiddleware.mockResolvedValue(true);
    const { req, res } = createMockReqRes('GET', {
      authorization: 'Bearer test-secret-123',
    });
    await handler(req, res);
    // Should return before auth check — no 401 or 200
    expect(res.status).not.toHaveBeenCalledWith(200);
    expect(res.status).not.toHaveBeenCalledWith(401);
  });

  // ── Missing ADMIN_PASSWORD env ────────────────────────────────────
  it('returns 503 when ADMIN_PASSWORD is not set', async () => {
    delete process.env.ADMIN_PASSWORD;
    const { req, res } = createMockReqRes('GET');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(503);
  });

  // ── Unauthorized — no auth header ─────────────────────────────────
  it('returns 401 when no authorization header', async () => {
    const { req, res } = createMockReqRes('GET');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // ── Unauthorized — wrong password ─────────────────────────────────
  it('returns 401 when password is wrong', async () => {
    const { req, res } = createMockReqRes('GET', {
      authorization: 'Bearer wrong-password',
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // ── Successful auth → 200 with stats ──────────────────────────────
  it('returns 200 with stats on successful auth', async () => {
    const { req, res } = createMockReqRes('GET', {
      authorization: 'Bearer test-secret-123',
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('stats');
    expect(body).toHaveProperty('topQueries');
    expect(body).toHaveProperty('circuitStatus');
    expect(body).toHaveProperty('botStatus');
    expect(body.botStatus.vercel).toBe('operational');
  });

  // ── Stats error fallback ──────────────────────────────────────────
  it('falls back gracefully when getStats throws', async () => {
    getStats.mockRejectedValue(new Error('db down'));
    getTopQueries.mockRejectedValue(new Error('db down'));
    const { req, res } = createMockReqRes('GET', {
      authorization: 'Bearer test-secret-123',
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.stats).toEqual({ totalUsers: 0, totalMessages: 0, totalQueries: 0 });
    expect(body.topQueries).toEqual([]);
  });

  // ── CORS headers ──────────────────────────────────────────────────
  it('sets CORS headers with ADMIN_ORIGIN', async () => {
    const { req, res } = createMockReqRes('GET', {
      authorization: 'Bearer test-secret-123',
    });
    await handler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://test.example.com');
    expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
  });

  // ── Handler error → 500 ───────────────────────────────────────────
  it('returns 500 when Promise.all throws unexpected error', async () => {
    // Mock getCircuitStatus to throw (this won't be caught by .catch)
    const cbMod = await import('../../lib/circuit-breaker.js');
    cbMod.getCircuitStatus.mockImplementation(() => { throw new Error('unexpected'); });

    const { req, res } = createMockReqRes('GET', {
      authorization: 'Bearer test-secret-123',
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
