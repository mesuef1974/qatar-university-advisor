/* global process */
/**
 * Admin Dashboard API — Qatar University Advisor
 * محمي بـ Basic Auth (password بسيط)
 */

import { getStats, getTopQueries } from '../lib/supabase.js';
import { getCircuitStatus } from '../lib/circuit-breaker.js';

export default async function handler(req, res) {
  // CORS — restricted to allowed origin only
  const allowedOrigin = process.env.ADMIN_ORIGIN
    || 'https://qatar-university-advisor.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Simple admin rate limiting (5 requests per minute per IP)
  const clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const rateLimitKey = `admin:${clientIP}`;
  const store = globalThis;
  if (!store._adminRateLimit) store._adminRateLimit = new Map();
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 5;
  const entry = store._adminRateLimit.get(rateLimitKey) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
  entry.count++;
  store._adminRateLimit.set(rateLimitKey, entry);
  if (entry.count > maxRequests) {
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }

  // Basic Auth — password من environment variable فقط، بدون قيمة افتراضية
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({
      error: 'Admin panel not configured. Set ADMIN_PASSWORD environment variable.'
    });
  }
  const authHeader = req.headers.authorization || '';
  const providedPassword = authHeader.replace('Bearer ', '').trim();

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [stats, topQueries, circuitStatus] = await Promise.all([
      getStats().catch(() => ({ totalUsers: 0, totalMessages: 0, totalQueries: 0 })),
      getTopQueries(15).catch(() => []),
      Promise.resolve(getCircuitStatus()),
    ]);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      stats,
      topQueries,
      circuitStatus,
      botStatus: {
        vercel: 'operational',
        whatsapp: 'operational',
        gemini: 'operational',
        supabase: circuitStatus.isHealthy ? 'operational' : 'degraded',
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
