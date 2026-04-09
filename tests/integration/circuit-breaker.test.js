/**
 * Integration Tests — Circuit Breaker
 * T-FIX-009: شركة أذكياء للبرمجيات
 *
 * ملاحظة: CircuitBreaker يستخدم CONFIG عالمي بـ FAILURE_THRESHOLD=3 و RESET_TIMEOUT_MS=30000
 * نستخدم instances منفصلة لكل اختبار مع التحكم في الـ state مباشرة عند الحاجة
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker, STATES } from '../../lib/circuit-breaker';

describe('CircuitBreaker — Integration Tests', () => {
  let cb;

  beforeEach(() => {
    // كل اختبار يحصل على instance جديدة نظيفة
    cb = new CircuitBreaker('test-instance');
  });

  it('CLOSED state: يُنفِّذ الدوال بنجاح', async () => {
    const result = await cb.execute(() => Promise.resolve('ok'), () => 'fallback');
    expect(result).toBe('ok');
    expect(cb.getStatus().state).toBe(STATES.CLOSED);
  });

  it('يتحول لـ OPEN بعد 3 فشل متتالية', async () => {
    const failFn = () => Promise.reject(new Error('DB Error'));

    // 3 فشل متتاليين — execute تُرجع fallback بدلاً من throw
    await cb.execute(failFn, () => null);
    await cb.execute(failFn, () => null);
    await cb.execute(failFn, () => null);

    expect(cb.getStatus().state).toBe(STATES.OPEN);
  });

  it('OPEN state: يُرجع fallback مباشرة بدون تنفيذ الدالة الأصلية', async () => {
    // أجبر على OPEN باستخدام recordFailure مباشرة
    cb.failureCount = 3;
    cb._transitionTo(STATES.OPEN);

    let executed = false;
    const result = await cb.execute(
      () => { executed = true; return Promise.resolve('real'); },
      () => 'fallback'
    );

    expect(result).toBe('fallback');
    expect(executed).toBe(false);
  });

  it('OPEN state: يُرجع null عند غياب fallback', async () => {
    cb.failureCount = 3;
    cb._transitionTo(STATES.OPEN);

    const result = await cb.execute(() => Promise.resolve('value'));
    expect(result).toBeNull();
  });

  it('يتحول لـ HALF_OPEN بعد انتهاء RESET_TIMEOUT_MS', async () => {
    // أجبر على OPEN ثم جعل openedAt في الماضي
    cb._transitionTo(STATES.OPEN);
    // نرجع openedAt للماضي بما يكفي لتجاوز الـ timeout
    cb.openedAt = Date.now() - 31_000; // 31 ثانية مضت

    // canRequest() سيكشف مرور الوقت ويحوّل لـ HALF_OPEN
    const canProceed = cb.canRequest();

    expect(canProceed).toBe(true);
    expect(cb.getStatus().state).toBe(STATES.HALF_OPEN);
  });

  it('يُغلق بعد نجاحَين متتاليَين في HALF_OPEN', async () => {
    // أجبر على HALF_OPEN مباشرة
    cb._transitionTo(STATES.OPEN);
    cb._transitionTo(STATES.HALF_OPEN);

    // نجاح أول
    await cb.execute(() => Promise.resolve('ok1'), () => null);
    expect(cb.getStatus().state).toBe(STATES.HALF_OPEN);

    // نجاح ثاني → يُغلق
    await cb.execute(() => Promise.resolve('ok2'), () => null);
    expect(cb.getStatus().state).toBe(STATES.CLOSED);
  });

  it('يعود لـ OPEN عند فشل في HALF_OPEN', async () => {
    cb._transitionTo(STATES.OPEN);
    cb._transitionTo(STATES.HALF_OPEN);

    const failFn = () => Promise.reject(new Error('still failing'));
    await cb.execute(failFn, () => null);

    expect(cb.getStatus().state).toBe(STATES.OPEN);
  });

  it('getStatus() يُرجع بيانات صحيحة في CLOSED', () => {
    const status = cb.getStatus();
    expect(status).toHaveProperty('state', STATES.CLOSED);
    expect(status).toHaveProperty('failureCount', 0);
    expect(status).toHaveProperty('isHealthy', true);
    expect(status).toHaveProperty('name', 'test-instance');
    expect(status).toHaveProperty('lastFailureAt', null);
    expect(status).toHaveProperty('openedAt', null);
  });

  it('getStatus().isHealthy يُصبح false عند OPEN', async () => {
    cb._transitionTo(STATES.OPEN);
    const status = cb.getStatus();
    expect(status.isHealthy).toBe(false);
    expect(status.state).toBe(STATES.OPEN);
  });

  it('يُعيد عدّ الفشل من الصفر بعد نجاح في CLOSED', async () => {
    const failFn = () => Promise.reject(new Error('fail'));

    // فشلان
    await cb.execute(failFn, () => null);
    await cb.execute(failFn, () => null);
    expect(cb.getStatus().failureCount).toBe(2);

    // نجاح → يصفّر العداد
    await cb.execute(() => Promise.resolve('ok'), () => null);
    expect(cb.getStatus().failureCount).toBe(0);
    expect(cb.getStatus().state).toBe(STATES.CLOSED);
  });
});
