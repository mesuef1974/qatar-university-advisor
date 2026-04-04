/**
 * Unit Tests — security-headers.js
 * Tests for addSecurityHeaders and apiSecurityMiddleware
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addSecurityHeaders, apiSecurityMiddleware } from '../../lib/security-headers.js';

function createMockRes() {
  return {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('security-headers', () => {
  const origEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = origEnv;
  });

  // ── addSecurityHeaders ────────────────────────────────────────────
  describe('addSecurityHeaders', () => {
    it('sets Content-Security-Policy header', () => {
      const res = createMockRes();
      addSecurityHeaders(res);
      const cspCall = res.setHeader.mock.calls.find(c => c[0] === 'Content-Security-Policy');
      expect(cspCall).toBeTruthy();
      expect(cspCall[1]).toContain("default-src 'self'");
      expect(cspCall[1]).toContain('supabase.co');
      expect(cspCall[1]).toContain('generativelanguage.googleapis.com');
    });

    it('sets X-Frame-Options to DENY', () => {
      const res = createMockRes();
      addSecurityHeaders(res);
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('sets X-Content-Type-Options to nosniff', () => {
      const res = createMockRes();
      addSecurityHeaders(res);
      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('sets X-XSS-Protection', () => {
      const res = createMockRes();
      addSecurityHeaders(res);
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('sets Referrer-Policy', () => {
      const res = createMockRes();
      addSecurityHeaders(res);
      expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    });

    it('sets Permissions-Policy', () => {
      const res = createMockRes();
      addSecurityHeaders(res);
      const ppCall = res.setHeader.mock.calls.find(c => c[0] === 'Permissions-Policy');
      expect(ppCall).toBeTruthy();
      expect(ppCall[1]).toContain('camera=()');
      expect(ppCall[1]).toContain('microphone=()');
    });

    it('sets HSTS in production', () => {
      process.env.NODE_ENV = 'production';
      const res = createMockRes();
      addSecurityHeaders(res);
      const hstsCall = res.setHeader.mock.calls.find(c => c[0] === 'Strict-Transport-Security');
      expect(hstsCall).toBeTruthy();
      expect(hstsCall[1]).toContain('max-age=31536000');
      expect(hstsCall[1]).toContain('includeSubDomains');
    });

    it('does NOT set HSTS in non-production', () => {
      process.env.NODE_ENV = 'development';
      const res = createMockRes();
      addSecurityHeaders(res);
      const hstsCall = res.setHeader.mock.calls.find(c => c[0] === 'Strict-Transport-Security');
      expect(hstsCall).toBeUndefined();
    });
  });

  // ── apiSecurityMiddleware ─────────────────────────────────────────
  describe('apiSecurityMiddleware', () => {
    it('returns true and sets headers for GET', () => {
      const res = createMockRes();
      const result = apiSecurityMiddleware({ method: 'GET' }, res);
      expect(result).toBe(true);
      expect(res.setHeader).toHaveBeenCalled();
    });

    it('returns true for POST', () => {
      const res = createMockRes();
      const result = apiSecurityMiddleware({ method: 'POST' }, res);
      expect(result).toBe(true);
    });

    it('returns true for OPTIONS', () => {
      const res = createMockRes();
      const result = apiSecurityMiddleware({ method: 'OPTIONS' }, res);
      expect(result).toBe(true);
    });

    it('returns false and sends 405 for PUT', () => {
      const res = createMockRes();
      const result = apiSecurityMiddleware({ method: 'PUT' }, res);
      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('returns false and sends 405 for DELETE', () => {
      const res = createMockRes();
      const result = apiSecurityMiddleware({ method: 'DELETE' }, res);
      expect(result).toBe(false);
    });

    it('returns false and sends 405 for PATCH', () => {
      const res = createMockRes();
      const result = apiSecurityMiddleware({ method: 'PATCH' }, res);
      expect(result).toBe(false);
    });
  });
});
