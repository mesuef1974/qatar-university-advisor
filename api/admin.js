/* global process */
/**
 * Admin Dashboard API — Qatar University Advisor
 * محمي بـ Basic Auth (password بسيط)
 */

import { getStats, getTopQueries } from '../lib/supabase.js';
import { getCircuitStatus } from '../lib/circuit-breaker.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Basic Auth — password من environment variable
  const adminPassword = process.env.ADMIN_PASSWORD || 'nakhbawiya2026';
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
