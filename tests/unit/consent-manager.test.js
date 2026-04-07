/**
 * Unit Tests — PDPPL Consent Manager
 * ====================================
 * Tests for lib/consent-manager.js
 * Covers: checkConsent, recordConsent, deleteUserData,
 *         handleConsentFlow, message helpers
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase — factory must not reference outer variables ────────
vi.mock('../../lib/supabase', () => {
  const _mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
  const _mockEq = vi.fn().mockReturnValue({ single: _mockSingle, eq: vi.fn().mockResolvedValue({ error: null }) });
  const _mockSelect = vi.fn().mockReturnValue({ eq: _mockEq });
  const _mockUpsert = vi.fn().mockResolvedValue({ error: null });
  const _mockDelete = vi.fn().mockReturnValue({ eq: _mockEq });

  const _mockFrom = vi.fn(() => ({
    select: _mockSelect,
    upsert: _mockUpsert,
    delete: _mockDelete,
    insert: vi.fn().mockResolvedValue({ error: null }),
  }));

  // Expose mocks on the supabase object so tests can access them
  const supabaseObj = {
    from: _mockFrom,
    _mocks: { from: _mockFrom, select: _mockSelect, eq: _mockEq, single: _mockSingle, upsert: _mockUpsert, delete: _mockDelete },
  };

  return {
    supabase: supabaseObj,
    isSupabaseAvailable: vi.fn().mockReturnValue(true),
  };
});

// Import after mock is set up
import { supabase } from '../../lib/supabase';
import {
  checkConsent,
  recordConsent,
  deleteUserData,
  getConsentMessage,
  getConsentDeclinedMessage,
  getDataDeletedMessage,
  isDeleteDataRequest,
  isConsentAccepted,
  handleConsentFlow,
  CONSENT_REPLY,
  DELETE_DATA_COMMAND,
  memoryConsents,
} from '../../lib/consent-manager.js';

// Shortcut to internal mocks
const mocks = supabase._mocks;

// ── Reset state between tests ────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  memoryConsents.clear();
  // Re-apply default mock behavior after clearAllMocks
  mocks.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
  mocks.upsert.mockResolvedValue({ error: null });
  mocks.eq.mockReturnValue({ single: mocks.single, eq: vi.fn().mockResolvedValue({ error: null }) });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.delete.mockReturnValue({ eq: mocks.eq });
  mocks.from.mockReturnValue({
    select: mocks.select,
    upsert: mocks.upsert,
    delete: mocks.delete,
    insert: vi.fn().mockResolvedValue({ error: null }),
  });
});

// =====================================================================
// Constants
// =====================================================================
describe('Constants', () => {
  it('CONSENT_REPLY should be "1"', () => {
    expect(CONSENT_REPLY).toBe('1');
  });

  it('DELETE_DATA_COMMAND should be the Arabic deletion phrase', () => {
    expect(DELETE_DATA_COMMAND).toBe('احذف بياناتي');
  });
});

// =====================================================================
// getConsentMessage
// =====================================================================
describe('getConsentMessage', () => {
  it('returns Arabic consent text with PDPPL reference', () => {
    const msg = getConsentMessage();
    expect(msg).toContain('المرشد الجامعي الذكي');
    expect(msg).toContain('PDPPL');
  });

  it('includes data usage notice', () => {
    const msg = getConsentMessage();
    expect(msg).toContain('سنستخدم بياناتك');
  });

  it('includes deletion instruction', () => {
    const msg = getConsentMessage();
    expect(msg).toContain('احذف بياناتي');
  });

  it('includes consent reply instruction', () => {
    const msg = getConsentMessage();
    expect(msg).toContain('أرسل: 1');
  });

  it('includes privacy policy link', () => {
    const msg = getConsentMessage();
    expect(msg).toContain('سياسة الخصوصية');
  });
});

// =====================================================================
// getConsentDeclinedMessage
// =====================================================================
describe('getConsentDeclinedMessage', () => {
  it('returns a polite refusal in Arabic', () => {
    const msg = getConsentDeclinedMessage();
    expect(msg).toContain('نحترم قرارك');
  });

  it('mentions they can return later', () => {
    const msg = getConsentDeclinedMessage();
    expect(msg).toContain('غيّرت رأيك');
  });
});

// =====================================================================
// getDataDeletedMessage
// =====================================================================
describe('getDataDeletedMessage', () => {
  it('confirms deletion in Arabic', () => {
    const msg = getDataDeletedMessage();
    expect(msg).toContain('تم حذف جميع بياناتك');
  });

  it('lists what was deleted', () => {
    const msg = getDataDeletedMessage();
    expect(msg).toContain('ملفك الشخصي');
    expect(msg).toContain('سجل المحادثات');
    expect(msg).toContain('المفضلة');
    expect(msg).toContain('سجل الموافقة');
  });

  it('mentions PDPPL compliance', () => {
    const msg = getDataDeletedMessage();
    expect(msg).toContain('PDPPL');
  });
});

// =====================================================================
// isDeleteDataRequest
// =====================================================================
describe('isDeleteDataRequest', () => {
  it('returns true for exact Arabic deletion command', () => {
    expect(isDeleteDataRequest('احذف بياناتي')).toBe(true);
  });

  it('returns true with surrounding whitespace', () => {
    expect(isDeleteDataRequest('  احذف بياناتي  ')).toBe(true);
  });

  it('returns false for partial match', () => {
    expect(isDeleteDataRequest('احذف')).toBe(false);
  });

  it('returns false for null/undefined/empty', () => {
    expect(isDeleteDataRequest(null)).toBe(false);
    expect(isDeleteDataRequest(undefined)).toBe(false);
    expect(isDeleteDataRequest('')).toBe(false);
  });
});

// =====================================================================
// isConsentAccepted
// =====================================================================
describe('isConsentAccepted', () => {
  it('returns true for "1"', () => {
    expect(isConsentAccepted('1')).toBe(true);
  });

  it('returns true for " 1 " (with whitespace)', () => {
    expect(isConsentAccepted(' 1 ')).toBe(true);
  });

  it('returns false for "2"', () => {
    expect(isConsentAccepted('2')).toBe(false);
  });

  it('returns false for Arabic text', () => {
    expect(isConsentAccepted('نعم')).toBe(false);
  });

  it('returns false for null/undefined/empty', () => {
    expect(isConsentAccepted(null)).toBe(false);
    expect(isConsentAccepted(undefined)).toBe(false);
    expect(isConsentAccepted('')).toBe(false);
  });
});

// =====================================================================
// checkConsent
// =====================================================================
describe('checkConsent', () => {
  it('returns false for null userId', async () => {
    expect(await checkConsent(null)).toBe(false);
  });

  it('returns true when consent is in memory', async () => {
    memoryConsents.set('97412345678', { consentedAt: '2025-01-01T00:00:00Z' });
    expect(await checkConsent('97412345678')).toBe(true);
  });

  it('returns true when Supabase has a consent record', async () => {
    mocks.single.mockResolvedValueOnce({
      data: { consented_at: '2025-01-01T00:00:00Z' },
      error: null,
    });
    expect(await checkConsent('97499999999')).toBe(true);
    // Should also cache in memory
    expect(memoryConsents.has('97499999999')).toBe(true);
  });

  it('returns false when Supabase has no record', async () => {
    mocks.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    expect(await checkConsent('97400000000')).toBe(false);
  });
});

// =====================================================================
// recordConsent
// =====================================================================
describe('recordConsent', () => {
  it('returns false for null userId', async () => {
    expect(await recordConsent(null)).toBe(false);
  });

  it('stores consent in memory', async () => {
    await recordConsent('97412345678');
    expect(memoryConsents.has('97412345678')).toBe(true);
    expect(memoryConsents.get('97412345678').consentedAt).toBeDefined();
  });

  it('calls Supabase upsert on user_consents', async () => {
    await recordConsent('97412345678');
    expect(mocks.from).toHaveBeenCalledWith('user_consents');
  });

  it('returns true even if Supabase upsert fails', async () => {
    mocks.upsert.mockResolvedValueOnce({ error: { message: 'DB down' } });
    const result = await recordConsent('97412345678');
    expect(result).toBe(true);
    // Memory fallback should still work
    expect(memoryConsents.has('97412345678')).toBe(true);
  });
});

// =====================================================================
// deleteUserData
// =====================================================================
describe('deleteUserData', () => {
  it('returns failure for null userId', async () => {
    const result = await deleteUserData(null);
    expect(result.success).toBe(false);
  });

  it('clears memory consent', async () => {
    memoryConsents.set('97412345678', { consentedAt: '2025-01-01' });
    await deleteUserData('97412345678');
    expect(memoryConsents.has('97412345678')).toBe(false);
  });

  it('returns success on deletion', async () => {
    const result = await deleteUserData('97412345678');
    expect(result.success).toBe(true);
    expect(result.message).toContain('حذف');
  });
});

// =====================================================================
// handleConsentFlow — integration of the full flow
// =====================================================================
describe('handleConsentFlow', () => {
  it('returns consent message for a brand new user', async () => {
    const result = await handleConsentFlow('97400000001', 'مرحبا');
    expect(result).not.toBeNull();
    expect(result.text).toContain('المرشد الجامعي الذكي');
    expect(result.suggestions).toEqual([]);
  });

  it('records consent and returns null when user sends "1"', async () => {
    const result = await handleConsentFlow('97400000002', '1');
    // checkConsent returns false (no prior consent) -> isConsentAccepted("1") -> record + return null
    expect(result).toBeNull();
    // Consent should be recorded in memory
    expect(memoryConsents.has('97400000002')).toBe(true);
  });

  it('returns null (pass-through) for already-consented user', async () => {
    memoryConsents.set('97400000003', { consentedAt: '2025-01-01' });

    const result = await handleConsentFlow('97400000003', 'ما هي أفضل جامعة؟');
    expect(result).toBeNull();
  });

  it('handles data deletion request even if user has consent', async () => {
    memoryConsents.set('97400000004', { consentedAt: '2025-01-01' });

    const result = await handleConsentFlow('97400000004', 'احذف بياناتي');
    expect(result).not.toBeNull();
    expect(result.text).toContain('تم حذف جميع بياناتك');
    // Consent should be removed from memory
    expect(memoryConsents.has('97400000004')).toBe(false);
  });

  it('handles data deletion request for user without consent', async () => {
    const result = await handleConsentFlow('97400000005', 'احذف بياناتي');
    expect(result).not.toBeNull();
    expect(result.text).toContain('تم حذف');
  });
});
