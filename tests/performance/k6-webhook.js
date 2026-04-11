/* eslint-disable no-undef */
/**
 * Performance Test — QA-003: اختبار حمل WhatsApp Webhook
 * السيناريو: محاكاة رسائل واردة من WhatsApp
 * شركة أذكياء للبرمجيات | 2026-04-04
 *
 * التشغيل:
 *   k6 run tests/performance/k6-webhook.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '20s', target: 3 },
    { duration: '40s', target: 5 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // webhook قد يكون أبطأ (Gemini API)
    http_req_failed:   ['rate<0.10'],
  },
};

export default function () {
  // اختبار GET /api/webhook (Verification)
  const verifyRes = http.get(
    `${BASE_URL}/api/webhook?hub.mode=subscribe&hub.verify_token=test-token&hub.challenge=test123`
  );

  check(verifyRes, {
    'webhook verify: responds': (r) => r.status < 500,
  });

  errorRate.add(verifyRes.status >= 500);

  sleep(2);
}
