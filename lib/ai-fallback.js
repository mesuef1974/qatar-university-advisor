/**
 * AI Fallback System — Qatar University Advisor
 * ══════════════════════════════════════════════
 * سلسلة الاحتياط عند فشل Claude API:
 *   1. Claude API (عبر Circuit Breaker)
 *   2. الردود الثابتة (keyword-based findResponse)
 *   3. رسالة خطأ ودية بالعربية
 *
 * Azkia | FAANG Standards
 */

import { getAIResponse } from './ai-handler';
import { CircuitBreaker } from './circuit-breaker';
import { logger } from './logger.js';

// ────────────────────────────────────────────────────────────────────────────
// Circuit Breaker مخصص لـ Claude API
// ────────────────────────────────────────────────────────────────────────────
const claudeCircuit = new CircuitBreaker('claude');

// ────────────────────────────────────────────────────────────────────────────
// رسالة الخطأ النهائية (المستوى الثالث)
// ────────────────────────────────────────────────────────────────────────────
const GRACEFUL_ERROR_MESSAGE = {
  text: 'عذراً، النظام مشغول حالياً. يرجى المحاولة بعد دقائق. للمساعدة الفورية، تفضل بزيارة مواقع الجامعات مباشرة.',
  suggestions: ['جامعة قطر qu.edu.qa', 'المنح والابتعاث', 'جميع الجامعات'],
};

// ────────────────────────────────────────────────────────────────────────────
// مستويات الـ Fallback للمراقبة
// ────────────────────────────────────────────────────────────────────────────
const FALLBACK_LEVELS = {
  CLAUDE:         'claude',
  STATIC:         'static',
  GRACEFUL_ERROR: 'graceful_error',
};

/**
 * محاولة الحصول على رد من Claude عبر Circuit Breaker
 * @param {string} userMessage
 * @param {object} userProfile
 * @param {Array} conversationHistory
 * @returns {Promise<{text: string, suggestions: string[]}|null>}
 */
async function tryClaude(userMessage, _userProfile = {}, conversationHistory = []) {
  // إذا كانت الدائرة مفتوحة، لا نحاول أصلاً
  if (!claudeCircuit.canRequest()) {
    logger.warn('[AI-Fallback] Claude circuit OPEN — skipping Claude');
    return null;
  }

  try {
    const result = await getAIResponse(userMessage, conversationHistory);
    if (result && result.text) {
      claudeCircuit.recordSuccess();
      return result;
    }
    // Claude returned null/empty — count as failure
    claudeCircuit.recordFailure('empty response from Claude');
    return null;
  } catch (err) {
    claudeCircuit.recordFailure(err?.message || String(err));
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
      const mod = await import('./findResponse.js');
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
      // Grade-based responses are handled inline — return a basic message
      return {
        text: `بناءً على معدلك (${match.grade}%)، يوجد عدة خيارات متاحة لك. يرجى المحاولة مرة أخرى بعد قليل للحصول على تفاصيل أكثر.`,
        suggestions: ['جامعة قطر', 'المنح والابتعاث', 'الكليات العسكرية'],
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
 * Claude → Static Responses → Graceful Error
 *
 * @param {string} userMessage - رسالة المستخدم
 * @param {object} [userProfile={}] - ملف المستخدم
 * @param {Array} [conversationHistory=[]] - تاريخ المحادثة
 * @returns {Promise<{text: string, suggestions: string[], fallbackLevel: string}>}
 */
async function getAIResponseWithFallback(userMessage, userProfile = {}, conversationHistory = []) {
  // ── المستوى 1: Claude API ──────────────────────────────
  const claudeResult = await tryClaude(userMessage, userProfile, conversationHistory);
  if (claudeResult) {
    logger.info('[AI-Fallback] Level 1: Claude response OK');
    return { ...claudeResult, fallbackLevel: FALLBACK_LEVELS.CLAUDE };
  }

  // ── المستوى 2: الردود الثابتة ──────────────────────────
  logger.warn('[AI-Fallback] Claude failed — trying static responses');
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
 * حالة صحة Claude Circuit Breaker للمراقبة
 */
function getClaudeCircuitStatus() {
  return claudeCircuit.getStatus();
}

export {
  getAIResponseWithFallback,
  tryClaude,
  tryStaticResponse,
  getClaudeCircuitStatus,
  claudeCircuit,
  FALLBACK_LEVELS,
  GRACEFUL_ERROR_MESSAGE,
};
