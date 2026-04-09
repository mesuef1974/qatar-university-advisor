/**
 * Unit Tests — AI Fallback System
 * ════════════════════════════════
 * اختبار سلسلة الاحتياط: Claude -> Static -> Graceful Error
 *
 * Azkia | FAANG Standards
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ai-handler so we don't call real Claude
vi.mock('../../lib/ai-handler.js', () => ({
  getAIResponse: vi.fn(),
}));

// Mock findResponse and ALL_RESPONSES
vi.mock('../../lib/findResponse.js', () => ({
  findResponse: vi.fn(),
}));

vi.mock('../../lib/responses.js', () => ({
  ALL_RESPONSES: {
    qu: {
      text: 'جامعة قطر — الجامعة الوطنية الأولى',
      suggestions: ['خطة دراسة الطب', 'شروط القبول'],
    },
    salaries: {
      text: 'الرواتب في قطر معفاة ضريبياً 100%',
      suggestions: ['هندسة البترول', 'الذكاء الاصطناعي'],
    },
  },
}));

describe('AI Fallback System', () => {
  let getAIResponse;
  let findResponse;
  let getAIResponseWithFallback;
  let tryClaude;
  let tryStaticResponse;
  let claudeCircuit;
  let FALLBACK_LEVELS;
  let GRACEFUL_ERROR_MESSAGE;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-import mocks
    const aiHandler = await import('../../lib/ai-handler.js');
    getAIResponse = aiHandler.getAIResponse;

    const findResponseMod = await import('../../lib/findResponse.js');
    findResponse = findResponseMod.findResponse;

    // Import the module under test
    const fallback = await import('../../lib/ai-fallback.js');
    getAIResponseWithFallback = fallback.getAIResponseWithFallback;
    tryClaude = fallback.tryClaude;
    tryStaticResponse = fallback.tryStaticResponse;
    claudeCircuit = fallback.claudeCircuit;
    FALLBACK_LEVELS = fallback.FALLBACK_LEVELS;
    GRACEFUL_ERROR_MESSAGE = fallback.GRACEFUL_ERROR_MESSAGE;

    // Reset circuit breaker state between tests
    claudeCircuit.state = 'CLOSED';
    claudeCircuit.failureCount = 0;
    claudeCircuit.successCount = 0;
    claudeCircuit.openedAt = null;
  });

  // ══════════════════════════════════════════
  // Level 1: Claude succeeds
  // ══════════════════════════════════════════
  describe('Level 1 — Claude API', () => {
    it('returns Claude response when API succeeds', async () => {
      getAIResponse.mockResolvedValueOnce({
        text: 'رد ذكي من Claude',
        suggestions: ['اقتراح 1', 'اقتراح 2'],
      });

      const result = await getAIResponseWithFallback('ما هي جامعة قطر؟');

      expect(result.text).toBe('رد ذكي من Claude');
      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.CLAUDE);
    });

    it('sets fallbackLevel to "claude" on success', async () => {
      getAIResponse.mockResolvedValueOnce({
        text: 'أي رد',
        suggestions: [],
      });

      const result = await getAIResponseWithFallback('سؤال');
      expect(result.fallbackLevel).toBe('claude');
    });
  });

  // ══════════════════════════════════════════
  // Level 2: Claude fails, static matches
  // ══════════════════════════════════════════
  describe('Level 2 — Static Responses', () => {
    it('falls back to static response when Claude returns null', async () => {
      getAIResponse.mockResolvedValueOnce(null);
      findResponse.mockReturnValueOnce({ type: 'response', key: 'qu' });

      const result = await getAIResponseWithFallback('جامعة قطر');

      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.STATIC);
      expect(result.text).toContain('جامعة قطر');
    });

    it('falls back to static response when Claude throws', async () => {
      getAIResponse.mockRejectedValueOnce(new Error('Network error'));
      findResponse.mockReturnValueOnce({ type: 'response', key: 'salaries' });

      const result = await getAIResponseWithFallback('الرواتب');

      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.STATIC);
      expect(result.text).toContain('الرواتب');
    });

    it('handles greeting type from findResponse', async () => {
      getAIResponse.mockResolvedValueOnce(null);
      findResponse.mockReturnValueOnce({ type: 'greeting' });

      const result = await getAIResponseWithFallback('مرحبا');

      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.STATIC);
      expect(result.text).toContain('المرشد الأكاديمي');
    });
  });

  // ══════════════════════════════════════════
  // Level 3: Everything fails — graceful error
  // ══════════════════════════════════════════
  describe('Level 3 — Graceful Error', () => {
    it('returns Arabic error message when all fallbacks fail', async () => {
      getAIResponse.mockResolvedValueOnce(null);
      findResponse.mockReturnValueOnce({ type: 'unknown' });

      const result = await getAIResponseWithFallback('سؤال غريب جداً لا يتطابق');

      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.GRACEFUL_ERROR);
      expect(result.text).toContain('عذراً');
      expect(result.text).toContain('يرجى المحاولة');
    });

    it('graceful error has suggestions', async () => {
      getAIResponse.mockResolvedValueOnce(null);
      findResponse.mockReturnValueOnce(null);

      const result = await getAIResponseWithFallback('xyz');

      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('graceful error message matches expected Arabic text', () => {
      expect(GRACEFUL_ERROR_MESSAGE.text).toBe(
        'عذراً، النظام مشغول حالياً. يرجى المحاولة بعد دقائق. للمساعدة الفورية، تفضل بزيارة مواقع الجامعات مباشرة.'
      );
    });
  });

  // ══════════════════════════════════════════
  // Circuit Breaker Integration
  // ══════════════════════════════════════════
  describe('Circuit Breaker Integration', () => {
    it('skips Claude when circuit is OPEN', async () => {
      // Force circuit open
      claudeCircuit.state = 'OPEN';
      claudeCircuit.openedAt = Date.now();

      findResponse.mockReturnValueOnce({ type: 'response', key: 'qu' });

      const result = await getAIResponseWithFallback('جامعة قطر');

      // Claude should NOT have been called
      expect(getAIResponse).not.toHaveBeenCalled();
      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.STATIC);
    });

    it('records failure on Claude error', async () => {
      const failCountBefore = claudeCircuit.failureCount;
      getAIResponse.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      findResponse.mockReturnValueOnce({ type: 'unknown' });

      await getAIResponseWithFallback('test');

      expect(claudeCircuit.failureCount).toBeGreaterThan(failCountBefore);
    });

    it('records success on Claude success', async () => {
      claudeCircuit.failureCount = 2;
      getAIResponse.mockResolvedValueOnce({
        text: 'success',
        suggestions: [],
      });

      await getAIResponseWithFallback('test');

      expect(claudeCircuit.failureCount).toBe(0);
    });
  });

  // ══════════════════════════════════════════
  // FALLBACK_LEVELS constant
  // ══════════════════════════════════════════
  describe('FALLBACK_LEVELS constant', () => {
    it('has all three levels defined', () => {
      expect(FALLBACK_LEVELS.CLAUDE).toBe('claude');
      expect(FALLBACK_LEVELS.STATIC).toBe('static');
      expect(FALLBACK_LEVELS.GRACEFUL_ERROR).toBe('graceful_error');
    });
  });

  // ══════════════════════════════════════════
  // Response shape
  // ══════════════════════════════════════════
  describe('Response shape', () => {
    it('always returns text, suggestions, and fallbackLevel', async () => {
      getAIResponse.mockResolvedValueOnce(null);
      findResponse.mockReturnValueOnce(null);

      const result = await getAIResponseWithFallback('أي سؤال');

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('fallbackLevel');
      expect(typeof result.text).toBe('string');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });
});
