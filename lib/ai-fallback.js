/**
 * AI Fallback System — Qatar University Advisor
 * ══════════════════════════════════════════════
 * سلسلة الاحتياط:
 *   1. Gemini API (مجاني) أو Claude API (مدفوع) — عبر Circuit Breaker
 *   2. الردود الثابتة (keyword-based findResponse)
 *   3. رسالة خطأ ودية بالعربية
 *
 * Azkia | FAANG Standards
 */

import { getAIResponse } from './ai-handler';
import { CircuitBreaker } from './circuit-breaker';
import { logger } from './logger.js';

// ────────────────────────────────────────────────────────────────────────────
// Circuit Breaker مخصص لـ AI API (Gemini أو Claude)
// ────────────────────────────────────────────────────────────────────────────
const aiCircuit = new CircuitBreaker('ai');

// ────────────────────────────────────────────────────────────────────────────
// رسالة الخطأ النهائية (المستوى الثالث)
// ────────────────────────────────────────────────────────────────────────────
const GRACEFUL_ERROR_MESSAGE = {
  text: 'عذراً، لم أتمكن من معالجة طلبك الآن. يمكنك سؤالي عن:\n\n• الجامعات وشروط القبول\n• المنح والابتعاث\n• التخصصات والرواتب\n• الكليات العسكرية\n\nأو تفضل بزيارة مواقع الجامعات مباشرة للحصول على أحدث المعلومات.',
  suggestions: ['جميع الجامعات', 'المنح والابتعاث', 'ابدأ اختبار التخصص'],
};

// ────────────────────────────────────────────────────────────────────────────
// مستويات الـ Fallback للمراقبة
// ────────────────────────────────────────────────────────────────────────────
const FALLBACK_LEVELS = {
  AI:             'ai',
  STATIC:         'static',
  GRACEFUL_ERROR: 'graceful_error',
};

/**
 * محاولة الحصول على رد من AI (Gemini أو Claude) عبر Circuit Breaker
 * @param {string} userMessage
 * @param {object} userProfile
 * @param {Array} conversationHistory
 * @returns {Promise<{text: string, suggestions: string[]}|null>}
 */
async function tryAI(userMessage, _userProfile = {}, conversationHistory = []) {
  // إذا كانت الدائرة مفتوحة، لا نحاول أصلاً
  if (!aiCircuit.canRequest()) {
    logger.warn('[AI-Fallback] AI circuit OPEN — skipping AI providers');
    return null;
  }

  try {
    const result = await getAIResponse(userMessage, conversationHistory);
    if (result && result.text) {
      aiCircuit.recordSuccess();
      return result;
    }
    // AI returned null/empty — count as failure
    aiCircuit.recordFailure('empty response from AI provider');
    return null;
  } catch (err) {
    aiCircuit.recordFailure(err?.message || String(err));
    return null;
  }
}

/**
 * محاولة البحث في الردود الثابتة (keyword-based)
 * يستخدم findResponse + ALL_RESPONSES بشكل كسول لتجنب الاستيراد الدائري
 * @param {string} userMessage
 * @returns {{text: string, suggestions: string[]}|null}
 */
async function tryStaticResponse(userMessage) {
  try {
    // Lazy import لتجنب circular dependencies
    let findResponse;
    let ALL_RESPONSES;

    try {
      const mod = await import('./findResponse');
      findResponse = mod.findResponse;
    } catch {
      return null;
    }

    try {
      const resMod = await import('./responses.js');
      ALL_RESPONSES = resMod.ALL_RESPONSES;
    } catch {
      return null;
    }

    if (!findResponse || !ALL_RESPONSES) return null;

    const match = findResponse(userMessage);

    if (!match) return null;

    if (match.type === 'response' && match.key && ALL_RESPONSES[match.key]) {
      const entry = ALL_RESPONSES[match.key];
      return {
        text: entry.text,
        suggestions: entry.suggestions || ['جميع الجامعات', 'المنح والابتعاث', 'الرواتب والوظائف'],
      };
    }

    if (match.type === 'greeting') {
      return {
        text: 'مرحباً! أنا المرشد الأكاديمي لجامعات قطر. كيف أقدر أساعدك اليوم؟',
        suggestions: ['جميع الجامعات', 'المنح والابتعاث', 'الرواتب والوظائف'],
      };
    }

    if (match.type === 'grade' && match.grade) {
      // استخدام gradeResponse لعرض الجامعات الفعلية حسب المعدل
      try {
        const mod = await import('./findResponse');
        if (mod.gradeResponse) {
          const gradeResp = mod.gradeResponse(match.grade, match.track || null);
          return {
            text: gradeResp.text,
            suggestions: gradeResp.suggestions || ['جامعة قطر', 'المنح والابتعاث', 'الكليات العسكرية'],
          };
        }
      } catch {
        // إذا فشل الاستيراد، نعرض gradeResponse مبسط
      }
      // Inline fallback بدون استيراد
      const g = match.grade;
      let fallbackText;
      if (g >= 90) fallbackText = `معدلك ${g}% ممتاز! متاح لك: كلية الطب بجامعة قطر، كارنيجي ميلون، تكساس إي أند أم، جورجتاون، وجميع الكليات العسكرية.`;
      else if (g >= 85) fallbackText = `معدلك ${g}% ممتاز! متاح لك: تكساس إي أند أم (هندسة بترول)، كارنيجي ميلون، جورجتاون، الصيدلة بجامعة قطر، والكليات العسكرية.`;
      else if (g >= 80) fallbackText = `معدلك ${g}% جيد جداً! متاح لك: الهندسة بجامعة قطر، نورثوسترن، فرجينيا كومنولث، التمريض والعلوم الصحية، والكليات العسكرية.`;
      else if (g >= 75) fallbackText = `معدلك ${g}% جيد! متاح لك: آداب وعلوم جامعة قطر، الإدارة والاقتصاد، التربية + برنامج طموح، فرجينيا كومنولث.`;
      else if (g >= 70) fallbackText = `معدلك ${g}% مقبول! متاح لك: جامعة قطر (الآداب والإدارة والشريعة)، أكاديمية الطيران، كلية أحمد بن محمد.`;
      else fallbackText = `معدلك ${g}% — الخيارات المتاحة: كلية المجتمع قطر (دبلوم مشارك)، إعادة الثانوية لتحسين المعدل، أو معاهد التدريب المهني.`;
      return {
        text: fallbackText,
        suggestions: ['جامعة قطر', 'المنح والابتعاث', 'الكليات العسكرية'],
      };
    }

    // Handle unknown type — instead of returning null, guide the user
    if (match.type === 'unknown' || !match.type) {
      return {
        text: 'لم أجد معلومات عن هذا الموضوع. يمكنك سؤالي عن: الجامعات، المنح، شروط القبول، التخصصات، الرواتب، أو الكليات العسكرية.',
        suggestions: ['جميع الجامعات', 'المنح والابتعاث', 'ابدأ اختبار التخصص'],
      };
    }

    return null;
  } catch (err) {
    logger.warn('[AI-Fallback] Static response lookup failed:', { errorMessage: err?.message });
    return null;
  }
}

/**
 * الدالة الرئيسية — سلسلة الاحتياط الكاملة
 * ═══════════════════════════════════════════
 * AI (Gemini/Claude) → Static Responses → Graceful Error
 *
 * @param {string} userMessage - رسالة المستخدم
 * @param {object} [userProfile={}] - ملف المستخدم
 * @param {Array} [conversationHistory=[]] - تاريخ المحادثة
 * @returns {Promise<{text: string, suggestions: string[], fallbackLevel: string}>}
 */
async function getAIResponseWithFallback(userMessage, userProfile = {}, conversationHistory = []) {
  // ── المستوى 1: AI API (Gemini مجاني أو Claude احتياطي) ────────────────────
  const aiResult = await tryAI(userMessage, userProfile, conversationHistory);
  if (aiResult) {
    logger.info('[AI-Fallback] Level 1: AI response OK');
    return { ...aiResult, fallbackLevel: FALLBACK_LEVELS.AI };
  }

  // ── المستوى 2: الردود الثابتة ──────────────────────────
  logger.warn('[AI-Fallback] AI failed — trying static responses');
  const staticResult = await tryStaticResponse(userMessage);
  if (staticResult) {
    logger.info('[AI-Fallback] Level 2: Static response matched');
    return { ...staticResult, fallbackLevel: FALLBACK_LEVELS.STATIC };
  }

  // ── المستوى 3: رسالة خطأ ودية ──────────────────────────
  logger.error('[AI-Fallback] All fallbacks exhausted — returning graceful error');
  return { ...GRACEFUL_ERROR_MESSAGE, fallbackLevel: FALLBACK_LEVELS.GRACEFUL_ERROR };
}

/**
 * حالة صحة AI Circuit Breaker للمراقبة
 */
function getAICircuitStatus() {
  return aiCircuit.getStatus();
}

export {
  getAIResponseWithFallback,
  tryAI,
  tryStaticResponse,
  getAICircuitStatus,
  aiCircuit,
  FALLBACK_LEVELS,
  GRACEFUL_ERROR_MESSAGE,
};
