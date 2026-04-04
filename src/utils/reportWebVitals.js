/**
 * PERF-A1: Web Vitals Monitoring
 * يقيس Core Web Vitals (LCP, FID, CLS, FCP, TTFB) ويُرسلها للتحليلات
 * شركة النخبوية للبرمجيات | 2026-04-05
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

/**
 * @param {Function} onReport - callback يستقبل كل metric
 * @example reportWebVitals(console.log)
 * @example reportWebVitals(metric => sendToAnalytics(metric))
 */
export default function reportWebVitals(onReport) {
  if (typeof onReport !== 'function') return;

  onCLS(onReport);   // Cumulative Layout Shift
  onFCP(onReport);   // First Contentful Paint
  onLCP(onReport);   // Largest Contentful Paint
  onTTFB(onReport);  // Time to First Byte
  onINP(onReport);   // Interaction to Next Paint (replaces FID)
}
