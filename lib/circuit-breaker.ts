/* eslint-disable */
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
 * شركة أذكياء للبرمجيات | FAANG Standards
 */

import { logger } from './logger.js';

// ══════════════════════════════════════════
// Types & Interfaces
// ══════════════════════════════════════════

export enum CircuitBreakerState {
  CLOSED    = 'CLOSED',
  OPEN      = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  successThreshold: number;
  logPrefix: string;
}

export interface CircuitBreakerStatus {
  name: string;
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureAt: number | null;
  openedAt: number | null;
  isHealthy: boolean;
}

// ══════════════════════════════════════════
// Constants (matches JS STATES / CONFIG)
// ══════════════════════════════════════════

const STATES = {
  CLOSED:    'CLOSED'    as const,
  OPEN:      'OPEN'      as const,
  HALF_OPEN: 'HALF_OPEN' as const,
};

const CONFIG: CircuitBreakerOptions = {
  failureThreshold:  3,
  resetTimeoutMs:    30_000,
  successThreshold:  2,
  logPrefix:         '[CircuitBreaker]',
};

// NOTE (QA-PERF-002 / Serverless limitation):
// This circuit breaker stores state in process memory. In a Vercel Serverless
// environment, each invocation may be a separate process instance, meaning the
// failure count is NOT shared across concurrent instances. As a result, the
// breaker opens independently per instance rather than at a cluster level.
//
// For true distributed circuit breaking, the state (failureCount, openedAt,
// state) should be persisted in Upstash Redis. This is a known limitation;
// the current implementation still provides per-instance protection and
// prevents cascading failures within a single warm instance.
// Track as: QA-PERF-002 "Move CircuitBreaker state to Upstash Redis"

// ══════════════════════════════════════════
// Q-15-03: Alerting — SWOT recommendation
// ══════════════════════════════════════════

interface AlertData {
  event: string;
  service: string;
  failureCount: number;
  threshold: number;
  timestamp: string;
}

async function sendAlert(alertData: AlertData): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'circuit_breaker_open',
        ...alertData,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Alert delivery is best-effort — don't crash the circuit breaker
  }
}

// ══════════════════════════════════════════
// CircuitBreaker class
// ══════════════════════════════════════════

class CircuitBreaker {
  name: string;
  state: string;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  openedAt: number | null;

  constructor(name: string = 'supabase') {
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
  canRequest(): boolean {
    if (this.state === STATES.CLOSED) return true;

    if (this.state === STATES.OPEN) {
      const elapsed = Date.now() - (this.openedAt as number);
      if (elapsed >= CONFIG.resetTimeoutMs) {
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
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= CONFIG.successThreshold) {
        this._transitionTo(STATES.CLOSED);
        logger.info(`${CONFIG.logPrefix} [${this.name}] ✅ Circuit CLOSED — Supabase عاد للعمل`);
      }
    }
  }

  /**
   * يُسجّل فشل عملية
   */
  recordFailure(error: string = ''): void {
    this.lastFailureAt = Date.now();
    this.successCount  = 0;

    if (this.state === STATES.HALF_OPEN) {
      // فشل في الاختبار التجريبي → أعد الفتح
      this._transitionTo(STATES.OPEN);
      logger.warn(`${CONFIG.logPrefix} [${this.name}] 🔄 اختبار فاشل → Circuit OPEN من جديد`);
      return;
    }

    if (this.state === STATES.CLOSED) {
      this.failureCount++;
      logger.warn(`${CONFIG.logPrefix} [${this.name}] ⚠️  فشل ${this.failureCount}/${CONFIG.failureThreshold}: ${error}`);

      if (this.failureCount >= CONFIG.failureThreshold) {
        this._transitionTo(STATES.OPEN);
        logger.error(`${CONFIG.logPrefix} [${this.name}] 🔴 Circuit OPEN — يتحول للـ In-Memory`);
      }
    }
  }

  /**
   * تنفيذ دالة مع حماية Circuit Breaker
   */
  async execute<T>(fn: () => Promise<T>, fallback: (() => T) | null = null): Promise<T | null> {
    if (!this.canRequest()) {
      // الدائرة مفتوحة → استخدم الـ Fallback مباشرة
      if (fallback) return fallback();
      return null;
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.recordFailure(message);
      if (fallback) return fallback();
      return null;
    }
  }

  /**
   * حالة الـ Circuit للمراقبة
   */
  getStatus(): CircuitBreakerStatus {
    return {
      name:          this.name,
      state:         this.state as CircuitBreakerState,
      failureCount:  this.failureCount,
      lastFailureAt: this.lastFailureAt,
      openedAt:      this.openedAt,
      isHealthy:     this.state === STATES.CLOSED,
    };
  }

  _transitionTo(newState: string): void {
    const prev    = this.state;
    this.state    = newState;
    if (newState === STATES.OPEN) {
      this.openedAt = Date.now();
      // Q-15-03: Alerting — SWOT recommendation
      const alertData: AlertData = {
        event:        'CIRCUIT_OPEN',
        service:      this.name,
        failureCount: this.failureCount,
        threshold:    CONFIG.failureThreshold,
        timestamp:    new Date().toISOString(),
      };
      logger.error('Circuit breaker opened', alertData);
      void sendAlert(alertData);
    }
    if (newState === STATES.CLOSED) {
      this.failureCount  = 0;
      this.successCount  = 0;
      this.openedAt      = null;
    }
    if (newState === STATES.HALF_OPEN) {
      this.successCount = 0;
    }
    logger.info(`${CONFIG.logPrefix} [${this.name}] ${prev} → ${newState}`);
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
 */
async function withCircuitBreaker<T>(fn: () => Promise<T>, fallbackValue: T | null = null): Promise<T | null> {
  return supabaseCircuit.execute(fn, () => fallbackValue as T);
}

/**
 * حالة صحة Supabase للمراقبة
 */
function getCircuitStatus(): CircuitBreakerStatus {
  return supabaseCircuit.getStatus();
}

export {
  CircuitBreaker,
  supabaseCircuit,
  withCircuitBreaker,
  getCircuitStatus,
  STATES,
};
