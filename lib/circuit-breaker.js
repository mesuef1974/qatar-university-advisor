/**
 * T-010: Circuit Breaker لـ Supabase
 * ════════════════════════════════════
 * يحمي البوت من التوقف عند فشل قاعدة البيانات
 *
 * الحالات الثلاث:
 *   CLOSED  → وضع طبيعي، الطلبات تمر
 *   OPEN    → تم اكتشاف فشل، يرفض الطلبات لـ 30 ثانية
 *   HALF    → اختبار تجريبي بعد انتهاء فترة الانتظار
 *
 * شركة النخبوية للبرمجيات | FAANG Standards
 */

import { logger } from './logger.js';

const STATES = {
  CLOSED:    'CLOSED',    // يعمل بشكل طبيعي
  OPEN:      'OPEN',      // متوقف — يرفض الطلبات
  HALF_OPEN: 'HALF_OPEN', // يختبر إذا عاد للعمل
};

const CONFIG = {
  FAILURE_THRESHOLD:   3,           // عدد الفشل قبل الفتح
  RESET_TIMEOUT_MS:    30_000,      // 30 ثانية قبل المحاولة التجريبية
  SUCCESS_THRESHOLD:   2,           // نجاحات متتالية لإغلاق الدائرة
  LOG_PREFIX:          '[CircuitBreaker]',
};

class CircuitBreaker {
  constructor(name = 'supabase') {
    this.name          = name;
    this.state         = STATES.CLOSED;
    this.failureCount  = 0;
    this.successCount  = 0;
    this.lastFailureAt = null;
    this.openedAt      = null;
  }

  /**
   * هل يمكن إرسال طلب الآن؟
   */
  canRequest() {
    if (this.state === STATES.CLOSED) return true;

    if (this.state === STATES.OPEN) {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed >= CONFIG.RESET_TIMEOUT_MS) {
        // انتهت فترة الانتظار → جرب مرة واحدة (HALF_OPEN)
        this._transitionTo(STATES.HALF_OPEN);
        return true;
      }
      return false; // لا تزال الدائرة مفتوحة
    }

    if (this.state === STATES.HALF_OPEN) {
      return true; // اسمح بطلب تجريبي
    }

    return false;
  }

  /**
   * يُسجّل نجاح عملية
   */
  recordSuccess() {
    this.failureCount = 0;

    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= CONFIG.SUCCESS_THRESHOLD) {
        this._transitionTo(STATES.CLOSED);
        logger.info(`${CONFIG.LOG_PREFIX} [${this.name}] ✅ Circuit CLOSED — Supabase عاد للعمل`);
      }
    }
  }

  /**
   * يُسجّل فشل عملية
   */
  recordFailure(error = '') {
    this.lastFailureAt = Date.now();
    this.successCount  = 0;

    if (this.state === STATES.HALF_OPEN) {
      // فشل في الاختبار التجريبي → أعد الفتح
      this._transitionTo(STATES.OPEN);
      logger.warn(`${CONFIG.LOG_PREFIX} [${this.name}] 🔄 اختبار فاشل → Circuit OPEN من جديد`);
      return;
    }

    if (this.state === STATES.CLOSED) {
      this.failureCount++;
      logger.warn(`${CONFIG.LOG_PREFIX} [${this.name}] ⚠️  فشل ${this.failureCount}/${CONFIG.FAILURE_THRESHOLD}: ${error}`);

      if (this.failureCount >= CONFIG.FAILURE_THRESHOLD) {
        this._transitionTo(STATES.OPEN);
        logger.error(`${CONFIG.LOG_PREFIX} [${this.name}] 🔴 Circuit OPEN — يتحول للـ In-Memory`);
      }
    }
  }

  /**
   * تنفيذ دالة مع حماية Circuit Breaker
   * @param {Function} fn - الدالة الأصلية (ترجع Promise)
   * @param {Function} fallback - الدالة البديلة عند الفشل
   * @returns {Promise<any>}
   */
  async execute(fn, fallback = null) {
    if (!this.canRequest()) {
      // الدائرة مفتوحة → استخدم الـ Fallback مباشرة
      if (fallback) return fallback();
      return null;
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      this.recordFailure(err?.message || String(err));
      if (fallback) return fallback();
      return null;
    }
  }

  /**
   * حالة الـ Circuit للمراقبة
   */
  getStatus() {
    return {
      name:          this.name,
      state:         this.state,
      failureCount:  this.failureCount,
      lastFailureAt: this.lastFailureAt,
      openedAt:      this.openedAt,
      isHealthy:     this.state === STATES.CLOSED,
    };
  }

  _transitionTo(newState) {
    const prev    = this.state;
    this.state    = newState;
    if (newState === STATES.OPEN) this.openedAt = Date.now();
    if (newState === STATES.CLOSED) {
      this.failureCount  = 0;
      this.successCount  = 0;
      this.openedAt      = null;
    }
    if (newState === STATES.HALF_OPEN) {
      this.successCount = 0;
    }
    logger.info(`${CONFIG.LOG_PREFIX} [${this.name}] ${prev} → ${newState}`);
  }
}

// ══════════════════════════════════════════
// Singleton — مثيل واحد لكل الـ instances
// ملاحظة: Vercel Serverless لا يشارك الذاكرة
// لكن هذا يحمي كل instance على حدة
// ══════════════════════════════════════════
const supabaseCircuit = new CircuitBreaker('supabase');

/**
 * تنفيذ دالة Supabase مع حماية Circuit Breaker
 * @param {Function} fn
 * @param {any} fallbackValue - قيمة افتراضية عند الفشل
 */
async function withCircuitBreaker(fn, fallbackValue = null) {
  return supabaseCircuit.execute(fn, () => fallbackValue);
}

/**
 * حالة صحة Supabase للمراقبة
 */
function getCircuitStatus() {
  return supabaseCircuit.getStatus();
}

export {
  CircuitBreaker,
  supabaseCircuit,
  withCircuitBreaker,
  getCircuitStatus,
  STATES,
};
