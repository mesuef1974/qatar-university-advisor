/* global process, Buffer */
import crypto from 'crypto';
import { processMessage } from '../lib/findResponse.js';
import { sendResponseWithSuggestions, markAsRead } from '../lib/whatsapp.js';

// Simple in-memory dedup to avoid processing duplicate webhooks
const processed = new Set();
const MAX_PROCESSED = 1000;

// ── Rate limiting — in-memory sliding window ──────────────────────────
// Note: state persists only within a warm serverless instance.
// For multi-instance production hardening, replace with Redis/KV store.
const rateLimitMap = new Map();
const RL_WINDOW_MS  = 60_000; // 1 minute window
const RL_MAX_REQS   = 60;     // max 60 requests per IP per window

/**
 * Returns true if the given IP has exceeded the rate limit.
 * Resets the window automatically after RL_WINDOW_MS.
 */
function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RL_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    // Periodic cleanup to prevent unbounded memory growth
    if (rateLimitMap.size > 10_000) {
      for (const [k, v] of rateLimitMap) {
        if (now - v.windowStart > RL_WINDOW_MS) rateLimitMap.delete(k);
      }
    }
    return false;
  }

  record.count += 1;
  return record.count > RL_MAX_REQS;
}

/**
 * Mask phone number for safe logging — shows last 4 digits only
 * e.g. "97412345678" → "***5678"
 */
function maskPhone(phone) {
  if (!phone || phone.length < 4) return '***';
  return `***${phone.slice(-4)}`;
}

/**
 * Verify Meta X-Hub-Signature-256 signature on incoming POST requests.
 * Requires WEBHOOK_APP_SECRET env var (App Secret from Facebook Developer Console).
 */
function verifySignature(rawBody, signature) {
  const secret = process.env.WEBHOOK_APP_SECRET;

  if (!secret) {
    // In production: hard-fail — no secret means no trust
    if (process.env.NODE_ENV === 'production') {
      console.error('[webhook] WEBHOOK_APP_SECRET is not set in production — rejecting POST request. Set it in Vercel → Settings → Environment Variables.');
      return false;
    }
    // In development: warn and allow
    console.warn('[webhook] WEBHOOK_APP_SECRET not set — skipping signature check (dev mode only)');
    return true;
  }

  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // ── Rate limiting — check before any processing ───────────────────
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || 'unknown';

  if (isRateLimited(ip)) {
    console.warn(`[webhook] Rate limit exceeded for ${ip}`);
    return res.status(429).send('Too Many Requests');
  }

  // --- GET: Webhook verification ---
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // --- POST: Incoming messages ---
  if (req.method === 'POST') {
    // ── Signature verification (X-Hub-Signature-256) ──
    const signature = req.headers['x-hub-signature-256'];
    const rawBody = JSON.stringify(req.body);
    if (!verifySignature(rawBody, signature)) {
      console.warn('[webhook] Signature verification failed — request rejected');
      return res.status(403).send('Forbidden');
    }

    const body = req.body;

    // WhatsApp sends a verification ping
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages) {
      return res.status(200).send('OK');
    }

    const change = body.entry[0].changes[0].value;
    const message = change.messages[0];
    const from = message.from; // sender phone number

    // Dedup check
    if (processed.has(message.id)) {
      return res.status(200).send('OK');
    }
    processed.add(message.id);
    if (processed.size > MAX_PROCESSED) {
      const first = processed.values().next().value;
      processed.delete(first);
    }

    try {
      // Mark as read
      await markAsRead(message.id);

      // Extract user text
      let userText = '';

      if (message.type === 'text') {
        userText = message.text.body;
      } else if (message.type === 'interactive') {
        // Button or list reply
        if (message.interactive.type === 'button_reply') {
          userText = message.interactive.button_reply.title;
        } else if (message.interactive.type === 'list_reply') {
          userText = message.interactive.list_reply.title;
        }
      } else {
        // Unsupported message type (image, audio, etc.)
        await sendResponseWithSuggestions(
          from,
          '📝 أرسل لي رسالة نصية وسأساعدك!\n\nيمكنك سؤالي عن الجامعات، التخصصات، شروط القبول، أو أرسل معدلك.',
          ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية']
        );
        return res.status(200).send('OK');
      }

      if (!userText.trim()) {
        return res.status(200).send('OK');
      }

      console.log(`Message from ${maskPhone(from)}: ${userText}`);

      // Process and respond
      const response = await processMessage(userText);
      await sendResponseWithSuggestions(from, response.text, response.suggestions);

    } catch (error) {
      console.error('Error processing message:', error);
      // Still return 200 to avoid WhatsApp retries
    }

    return res.status(200).send('OK');
  }

  return res.status(405).send('Method Not Allowed');
};
