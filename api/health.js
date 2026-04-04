/* global process */
/**
 * ENG-003: Health Check Endpoint
 * يفحص حالة جميع الخدمات — Supabase + Memory + Redis
 * GET /api/health → 200 healthy | 503 degraded/unhealthy
 * شركة النخبوية للبرمجيات
 */

import { createClient } from '@supabase/supabase-js';
import { rateLimitMiddleware } from '../lib/rate-limiter.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const START_TIME = Date.now();

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit — 10 requests/minute
  const limited = await rateLimitMiddleware(req, res, {
    maxRequests: 10,
    windowMs: 60_000,
    prefix: 'health',
  });
  if (limited) return;

  const services = {};
  let overallStatus = 'healthy';

  // ── 1. فحص Supabase ──
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    const t0 = Date.now();
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      const latency = Date.now() - t0;
      if (error) {
        services.supabase = { status: 'unhealthy', error: error.message, latency };
        overallStatus = 'degraded';
      } else {
        services.supabase = { status: 'healthy', latency };
      }
    } catch { // eslint-disable-line no-empty
      services.supabase = { status: 'unhealthy', error: 'Connection failed', latency: Date.now() - t0 };
      overallStatus = 'degraded';
    }
  } else {
    services.supabase = { status: 'not_configured' };
  }

  // ── 2. فحص الذاكرة ──
  const mem = process.memoryUsage();
  const usedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const totalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const memStatus = usedMB > 450 ? 'warning' : 'healthy';
  if (memStatus === 'warning' && overallStatus === 'healthy') overallStatus = 'degraded';
  services.memory = {
    status: memStatus,
    used: `${usedMB}MB`,
    total: `${totalMB}MB`,
    rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
  };

  // ── 3. فحص Redis (اختياري) ──
  services.redis = { status: 'skipped' };

  // ── 4. الرد النهائي ──
  const httpStatus = overallStatus === 'healthy' ? 200 : 503;

  return res.status(httpStatus).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: pkg.version,
    uptime: Math.round((Date.now() - START_TIME) / 1000),
    services,
  });
}
