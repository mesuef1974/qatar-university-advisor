/**
 * Unit Tests — lib/validateEnv.js
 * Comprehensive tests for validateEnv and requireEnv
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnv, requireEnv } from '../../lib/validateEnv.js';

describe('validateEnv', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    // Clear relevant env vars
    delete process.env.WHATSAPP_TOKEN;
    delete process.env.WHATSAPP_PHONE_ID;
    delete process.env.WEBHOOK_VERIFY_TOKEN;
    delete process.env.WEBHOOK_APP_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.ADMIN_SECRET;
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  // ── Unknown context ───────────────────────────────────────────────
  it('returns valid=true with warning for unknown context', () => {
    const result = validateEnv('unknown_xyz');
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Unknown context');
  });

  // ── webhook context ───────────────────────────────────────────────
  describe('webhook context', () => {
    it('returns invalid when all required vars are missing', () => {
      const result = validateEnv('webhook');
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('WHATSAPP_TOKEN');
      expect(result.missing).toContain('WHATSAPP_PHONE_ID');
      expect(result.missing).toContain('WEBHOOK_VERIFY_TOKEN');
    });

    it('returns valid when all required vars are set', () => {
      process.env.WHATSAPP_TOKEN = 'tok';
      process.env.WHATSAPP_PHONE_ID = 'pid';
      process.env.WEBHOOK_VERIFY_TOKEN = 'vt';
      const result = validateEnv('webhook');
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('treats empty string as missing', () => {
      process.env.WHATSAPP_TOKEN = '   ';
      process.env.WHATSAPP_PHONE_ID = 'pid';
      process.env.WEBHOOK_VERIFY_TOKEN = 'vt';
      const result = validateEnv('webhook');
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('WHATSAPP_TOKEN');
    });

    it('returns warnings for missing optional vars', () => {
      process.env.WHATSAPP_TOKEN = 'tok';
      process.env.WHATSAPP_PHONE_ID = 'pid';
      process.env.WEBHOOK_VERIFY_TOKEN = 'vt';
      const result = validateEnv('webhook');
      expect(result.warnings.length).toBeGreaterThan(0);
      // WEBHOOK_APP_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY
      expect(result.warnings.some(w => w.includes('WEBHOOK_APP_SECRET'))).toBe(true);
    });

    it('no warnings when all optional vars are set too', () => {
      process.env.WHATSAPP_TOKEN = 'tok';
      process.env.WHATSAPP_PHONE_ID = 'pid';
      process.env.WEBHOOK_VERIFY_TOKEN = 'vt';
      process.env.WEBHOOK_APP_SECRET = 'sec';
      process.env.SUPABASE_URL = 'su';
      process.env.SUPABASE_ANON_KEY = 'sk';
      const result = validateEnv('webhook');
      expect(result.warnings).toEqual([]);
    });
  });

  // ── admin context ─────────────────────────────────────────────────
  describe('admin context', () => {
    it('returns invalid when ADMIN_SECRET is missing', () => {
      const result = validateEnv('admin');
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('ADMIN_SECRET');
    });

    it('returns valid when ADMIN_SECRET is set', () => {
      process.env.ADMIN_SECRET = 'secret';
      const result = validateEnv('admin');
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual([]);
    });
  });

  // ── health context ────────────────────────────────────────────────
  describe('health context', () => {
    it('returns valid even with no env vars (no required)', () => {
      const result = validateEnv('health');
      expect(result.valid).toBe(true);
    });

    it('returns warnings for missing optional SUPABASE vars', () => {
      const result = validateEnv('health');
      expect(result.warnings.some(w => w.includes('SUPABASE_URL'))).toBe(true);
    });
  });

  // ── cron context ──────────────────────────────────────────────────
  describe('cron context', () => {
    it('returns invalid when SUPABASE vars are missing', () => {
      const result = validateEnv('cron');
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('SUPABASE_URL');
      expect(result.missing).toContain('SUPABASE_ANON_KEY');
    });

    it('returns valid when SUPABASE vars are set', () => {
      process.env.SUPABASE_URL = 'https://x.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'key';
      const result = validateEnv('cron');
      expect(result.valid).toBe(true);
    });
  });
});

// ── requireEnv ──────────────────────────────────────────────────────
describe('requireEnv', () => {
  const origEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('returns true and does not call res.status when env is valid', () => {
    process.env.ADMIN_SECRET = 'secret';
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const result = requireEnv('admin', res);
    expect(result).toBe(true);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns false and sends 500 when required vars are missing', () => {
    delete process.env.ADMIN_SECRET;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const result = requireEnv('admin', res);
    expect(result).toBe(false);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Server configuration error' })
    );
  });

  it('logs warnings for missing optional vars', () => {
    process.env.WHATSAPP_TOKEN = 'tok';
    process.env.WHATSAPP_PHONE_ID = 'pid';
    process.env.WEBHOOK_VERIFY_TOKEN = 'vt';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    requireEnv('webhook', res);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('logs error for missing required vars', () => {
    delete process.env.ADMIN_SECRET;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    requireEnv('admin', res);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('returns true for unknown context (valid=true)', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const result = requireEnv('nonexistent', res);
    expect(result).toBe(true);
  });
});
