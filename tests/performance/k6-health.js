/* eslint-disable no-undef */
/**
 * Performance Test — QA-003: اختبار الأداء باستخدام k6
 * السيناريو: Health Endpoint تحت حمل متصاعد
 * شركة أذكياء للبرمجيات | 2026-04-04
 *
 * التشغيل:
 *   k6 run tests/performance/k6-health.js
 *   k6 run --env BASE_URL=https://qatar-advisor.vercel.app tests/performance/k6-health.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── مقاييس مخصصة ──────────────────────────────────────────────────────────
const errorRate = new Rate('errors');
const healthLatency = new Trend('health_latency', true);

// ── الإعداد ────────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  // سيناريو: حمل متصاعد 1 → 10 → 1 مستخدم خلال 3 دقائق
  stages: [
    { duration: '30s', target: 5 },   // تسخين
    { duration: '1m',  target: 10 },  // حمل ثابت
    { duration: '30s', target: 0 },   // تبريد
  ],

  // حدود القبول — يجب أن يتحقق الكل
  thresholds: {
    http_req_duration: ['p(95)<2000'],      // 95% أقل من 2 ثانية
    http_req_failed:   ['rate<0.05'],       // أقل من 5% فشل
    errors:            ['rate<0.05'],       // أقل من 5% أخطاء
    health_latency:    ['p(95)<1500'],      // health endpoint < 1.5s
  },
};

// ── السيناريو الرئيسي ─────────────────────────────────────────────────────
export default function () {
  // 1. اختبار Health Endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  healthLatency.add(healthRes.timings.duration);

  const healthOk = check(healthRes, {
    'health: status 200': (r) => r.status === 200,
    'health: returns JSON': (r) => {
      try { JSON.parse(r.body); return true; } catch { return false; }
    },
    'health: status field exists': (r) => {
      try { return JSON.parse(r.body).status !== undefined; } catch { return false; }
    },
    'health: response < 2s': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!healthOk);

  sleep(1);
}

// ── تقرير النتائج ──────────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenarios: data.root_group.name,
    metrics: {
      requests_total: data.metrics.http_reqs?.values?.count || 0,
      requests_failed: data.metrics.http_req_failed?.values?.rate || 0,
      duration_avg: data.metrics.http_req_duration?.values?.avg || 0,
      duration_p95: data.metrics.http_req_duration?.values['p(95)'] || 0,
      health_p95: data.metrics.health_latency?.values['p(95)'] || 0,
    },
    thresholds_passed: Object.values(data.metrics).every(
      m => !m.thresholds || Object.values(m.thresholds).every(t => t.ok)
    ),
  };

  return {
    stdout: JSON.stringify(summary, null, 2) + '\n',
  };
}
