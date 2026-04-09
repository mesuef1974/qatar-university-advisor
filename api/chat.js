/**
 * AI Chat Endpoint — Qatar University Advisor
 * ══════════════════════════════════════════════
 * POST /api/chat
 * Body: { question: string, nationality?: string }
 * Response: { answer: string, suggestions: string[], source: string }
 *
 * يستخدم نفس سلسلة الاحتياط الموجودة في WhatsApp:
 *   1. Keyword matching (findResponse)
 *   2. Claude AI (مع Circuit Breaker)
 *   3. رسالة خطأ ودية
 *
 * شركة أذكياء للبرمجيات | Azkia
 */

import { getAIResponseWithFallback } from '../lib/ai-fallback.js';
import { sanitizeInput, getInjectionResponse } from '../lib/sanitizer';
import { logger } from '../lib/logger.js';

// ── Rate limiting — in-memory sliding window ──────────────────────────
const rateLimitMap = new Map();
const RL_WINDOW_MS = 60_000; // 1 minute
const RL_MAX_REQS = 30;      // max 30 chat requests per IP per minute

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RL_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    if (rateLimitMap.size > 5_000) {
      for (const [k, v] of rateLimitMap) {
        if (now - v.windowStart > RL_WINDOW_MS) rateLimitMap.delete(k);
      }
    }
    return false;
  }

  record.count += 1;
  return record.count > RL_MAX_REQS;
}

export default async function handler(req, res) {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ── Rate limiting ──
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too Many Requests' });
  }

  // ── Parse body ──
  const { question, nationality } = req.body || {};

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Missing or empty "question" field' });
  }

  // ── Input length limit ──
  const userText = question.trim().slice(0, 2000);

  // ── Sanitize input (Prompt Injection Defense) ──
  const { safe, sanitized, reason } = sanitizeInput(userText);
  if (!safe) {
    logger.warn(`[chat-api] Blocked input — reason: ${reason}`);
    const injResponse = getInjectionResponse();
    return res.status(200).json({
      answer: injResponse.text,
      suggestions: injResponse.suggestions,
      source: 'security',
    });
  }

  try {
    // ── Build user profile context for Claude ──
    const userProfile = {};
    if (nationality === 'qatari' || nationality === 'non_qatari') {
      userProfile.nationality = nationality;
    }

    const result = await getAIResponseWithFallback(sanitized, userProfile, []);

    logger.info(`[chat-api] Response source: ${result.fallbackLevel}`);

    return res.status(200).json({
      answer: result.text,
      suggestions: result.suggestions || [],
      source: result.fallbackLevel,
    });
  } catch (err) {
    logger.error('[chat-api] Unexpected error:', { errorMessage: err?.message });
    return res.status(200).json({
      answer: 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      suggestions: ['جميع الجامعات', 'المنح والابتعاث', 'الرواتب والوظائف'],
      source: 'error',
    });
  }
}
