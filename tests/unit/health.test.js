/* global process */
/**
 * Unit Tests — Health Check Endpoint
 * QA-A1: رفع تغطية الاختبارات من 35% إلى 70%
 * 7 حالات اختبار تغطي: GET/OPTIONS/POST, Supabase healthy/unhealthy, memory check
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock rate-limiter ──
vi.mock('../../lib/rate-limiter.js', () => ({
  rateLimitMiddleware: vi.fn().mockResolvedValue(false),
}));

// ── Mock @supabase/supabase-js — inline to avoid hoisting issues ──
vi.mock('@supabase/supabase-js', () => {
  const _mockSelect = vi.fn().mockResolvedValue({ error: null });
  const _mockFrom = vi.fn(() => ({ select: _mockSelect }));
  const _mockCreateClient = vi.fn(() => ({ from: _mockFrom }));
  return {
    createClient: _mockCreateClient,
    __mockSelect: _mockSelect,
    __mockFrom: _mockFrom,
  };
});

// ── Mock validateEnv ──
vi.mock('../../lib/validateEnv.js', () => ({
  requireEnv: vi.fn(() => ({ ok: true, missing: [] })),
  validateEnv: vi.fn(),
}));

// ── Mock fs for package.json ──
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => JSON.stringify({ version: '1.0.0-test' })),
}));

// Helper: create mock req/res
function createMockReqRes(method = 'GET') {
  const req = { method };
  const res = {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

// Import handler and get access to mock internals
import handler from '../../api/health.js';
import { createClient, __mockSelect } from '@supabase/supabase-js';

beforeEach(() => {
  vi.clearAllMocks();
  // Default Supabase select succeeds
  __mockSelect.mockResolvedValue({ error: null });
});

// ══════════════════════════════════════════════════════
describe('Health Endpoint — طرق HTTP', () => {
  it('يُرجع 200 لطلب OPTIONS (CORS preflight)', async () => {
    const { req, res } = createMockReqRes('OPTIONS');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('يُرجع 405 لطلب POST', async () => {
    const { req, res } = createMockReqRes('POST');
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Method not allowed' }));
  });

  it('يُرجع CORS headers في كل طلب', async () => {
    const { req, res } = createMockReqRes('GET');
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_ANON_KEY = '';
    await handler(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, OPTIONS');
  });
});

// ══════════════════════════════════════════════════════
describe('Health Endpoint — فحص Supabase', () => {
  it('يُرجع healthy عندما Supabase يعمل', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    __mockSelect.mockResolvedValue({ error: null });

    const { req, res } = createMockReqRes('GET');
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.status).toBe('healthy');
    expect(responseBody.services.supabase.status).toBe('healthy');
  });

  it('يُرجع degraded عندما Supabase يفشل', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    __mockSelect.mockResolvedValue({ error: { message: 'Connection timeout' } });

    const { req, res } = createMockReqRes('GET');
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.status).toBe('degraded');
    expect(responseBody.services.supabase.status).toBe('unhealthy');
  });

  it('يُرجع not_configured عندما لا يوجد SUPABASE_URL', async () => {
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_ANON_KEY = '';

    const { req, res } = createMockReqRes('GET');
    await handler(req, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.services.supabase.status).toBe('not_configured');
  });
});

// ══════════════════════════════════════════════════════
describe('Health Endpoint — البيانات المُرجعة', () => {
  it('يتضمن الحقول المطلوبة (version, uptime, timestamp, services)', async () => {
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_ANON_KEY = '';

    const { req, res } = createMockReqRes('GET');
    await handler(req, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).toHaveProperty('status');
    expect(responseBody).toHaveProperty('timestamp');
    expect(responseBody).toHaveProperty('version');
    expect(responseBody).toHaveProperty('uptime');
    expect(responseBody).toHaveProperty('services');
    expect(responseBody.version).toBe('1.0.0-test');
    expect(typeof responseBody.uptime).toBe('number');
    // memory info
    expect(responseBody.services.memory).toHaveProperty('status');
    expect(responseBody.services.memory).toHaveProperty('used');
    expect(responseBody.services.memory).toHaveProperty('total');
    expect(responseBody.services.memory).toHaveProperty('rss');
  });
});
