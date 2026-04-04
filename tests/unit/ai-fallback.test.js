/**
 * Unit Tests — AI Fallback System
 * ════════════════════════════════
 * اختبار سلسلة الاحتياط: Gemini -> Static -> Graceful Error
 *
 * Elite Software Company | FAANG Standards
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ai-handler so we don't call real Gemini
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
  let tryGemini;  
  let tryStaticResponse;  
  let geminiCircuit;
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
    tryGemini = fallback.tryGemini;
    tryStaticResponse = fallback.tryStaticResponse;
    geminiCircuit = fallback.geminiCircuit;
    FALLBACK_LEVELS = fallback.FALLBACK_LEVELS;
    GRACEFUL_ERROR_MESSAGE = fallback.GRACEFUL_ERROR_MESSAGE;

    // Reset circuit breaker state between tests
    geminiCircuit.state = 'CLOSED';
    geminiCircuit.failureCount = 0;
    geminiCircuit.successCount = 0;
    geminiCircuit.openedAt = null;
  });

  // ══════════════════════════════════════════
  // Level 1: Gemini succeeds
  // ══════════════════════════════════════════
  describe('Level 1 — Gemini API', () => {
    it('returns Gemini response when API succeeds', async () => {
      getAIResponse.mockResolvedValueOnce({
        text: 'رد ذكي من Gemini',
        suggestions: ['اقتراح 1', 'اقتراح 2'],
      });

      const result = await getAIResponseWithFallback('ما هي جامعة قطر؟');

      expect(result.text).toBe('رد ذكي من Gemini');
      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.GEMINI);
    });

    it('sets fallbackLevel to "gemini" on success', async () => {
      getAIResponse.mockResolvedValueOnce({
        text: 'أي رد',
        suggestions: [],
      });

      const result = await getAIResponseWithFallback('سؤال');
      expect(result.fallbackLevel).toBe('gemini');
    });
  });

  // ══════════════════════════════════════════
  // Level 2: Gemini fails, static matches
  // ══════════════════════════════════════════
  describe('Level 2 — Static Responses', () => {
    it('falls back to static response when Gemini returns null', async () => {
      getAIResponse.mockResolvedValueOnce(null);
      findResponse.mockReturnValueOnce({ type: 'response', key: 'qu' });

      const result = await getAIResponseWithFallback('جامعة قطر');

      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.STATIC);
      expect(result.text).toContain('جامعة قطر');
    });

    it('falls back to static response when Gemini throws', async () => {
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
    it('skips Gemini when circuit is OPEN', async () => {
      // Force circuit open
      geminiCircuit.state = 'OPEN';
      geminiCircuit.openedAt = Date.now();

      findResponse.mockReturnValueOnce({ type: 'response', key: 'qu' });

      const result = await getAIResponseWithFallback('جامعة قطر');

      // Gemini should NOT have been called
      expect(getAIResponse).not.toHaveBeenCalled();
      expect(result.fallbackLevel).toBe(FALLBACK_LEVELS.STATIC);
    });

    it('records failure on Gemini error', async () => {
      const failCountBefore = geminiCircuit.failureCount;
      getAIResponse.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      findResponse.mockReturnValueOnce({ type: 'unknown' });

      await getAIResponseWithFallback('test');

      expect(geminiCircuit.failureCount).toBeGreaterThan(failCountBefore);
    });

    it('records success on Gemini success', async () => {
      geminiCircuit.failureCount = 2;
      getAIResponse.mockResolvedValueOnce({
        text: 'success',
        suggestions: [],
      });

      await getAIResponseWithFallback('test');

      expect(geminiCircuit.failureCount).toBe(0);
    });
  });

  // ══════════════════════════════════════════
  // FALLBACK_LEVELS constant
  // ══════════════════════════════════════════
  describe('FALLBACK_LEVELS constant', () => {
    it('has all three levels defined', () => {
      expect(FALLBACK_LEVELS.GEMINI).toBe('gemini');
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
