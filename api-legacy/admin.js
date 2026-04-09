/* global process, Buffer */
/**
 * Admin Dashboard API — Qatar University Advisor
 * محمي بـ Basic Auth (password بسيط)
 * SEC-001: استخدام crypto.timingSafeEqual لمنع timing attacks
 * SEC-A4: validateEnv عند البدء
 */

import crypto from 'crypto';
import { getStats, getTopQueries } from '../lib/supabase';
import { getCircuitStatus } from '../lib/circuit-breaker';
import { rateLimitMiddleware } from '../lib/rate-limiter.js';
import { requireEnv } from '../lib/validateEnv.js';

export default async function handler(req, res) {
  // SEC-A4: التحقق من متغيرات البيئة
  if (!requireEnv('admin', res)) return;

  // CORS — restricted to allowed origin only
  const allowedOrigin = process.env.ADMIN_ORIGIN
    || 'https://qatar-university-advisor.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Distributed Rate Limiting (Redis → In-Memory fallback)
  const rateLimited = await rateLimitMiddleware(req, res, {
    maxRequests: 5,
    windowMs:    60_000,
    prefix:      'admin',
  });
  if (rateLimited) return; // تم الرد بـ 429

  // Basic Auth — password من environment variable فقط، بدون قيمة افتراضية
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({
      error: 'Admin panel not configured. Set ADMIN_PASSWORD environment variable.'
    });
  }
  const authHeader = req.headers.authorization || '';
  const providedPassword = authHeader.replace('Bearer ', '').trim();

  // SEC-001: timing-safe comparison لمنع timing attacks
  // نستخدم crypto.timingSafeEqual بدلاً من !== العادي
  let passwordMatch = false;
  try {
    const a = Buffer.from(providedPassword);
    const b = Buffer.from(adminPassword);
    passwordMatch = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    passwordMatch = false;
  }

  if (!passwordMatch) {
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
        claude: 'operational',
        supabase: circuitStatus.isHealthy ? 'operational' : 'degraded',
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
