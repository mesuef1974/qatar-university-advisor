/* global process, Buffer */
import crypto from 'crypto';
import { processMessage } from '../lib/findResponse.js';
import { sendResponseWithSuggestions, markAsRead } from '../lib/whatsapp.js';
import { requireEnv } from '../lib/validateEnv.js';

// Disable Vercel's automatic body parser so we can read the raw bytes
// for HMAC-SHA256 signature verification (Meta signs the original raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Reads the raw request body as a Buffer.
 * Must be called before any body parsing so the stream is intact.
 */
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

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
  // SEC-A4: التحقق من متغيرات البيئة
  if (!requireEnv('webhook', res)) return;

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
    // ── Content-Type validation ──
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      console.warn('[webhook] Rejected POST with invalid Content-Type:', contentType);
      return res.status(415).send('Unsupported Media Type');
    }

    // ── Read raw body buffer (stream is unconsumed because bodyParser: false) ──
    const rawBodyBuffer = await getRawBody(req);
    const rawBodyStr = rawBodyBuffer.toString('utf8');

    // ── Signature verification (X-Hub-Signature-256) ──
    // Meta signs the original raw bytes — must NOT use JSON.stringify(parsedBody)
    const signature = req.headers['x-hub-signature-256'];
    if (!verifySignature(rawBodyStr, signature)) {
      console.warn('[webhook] Signature verification failed — request rejected');
      return res.status(403).send('Forbidden');
    }

    let body;
    try {
      body = JSON.parse(rawBodyStr);
    } catch {
      console.warn('[webhook] Failed to parse JSON body');
      return res.status(400).send('Bad Request');
    }

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
      // Extract user text — قبل markAsRead لتوازي العمليات لاحقاً
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
        // markAsRead + reply بالتوازي
        await Promise.all([
          markAsRead(message.id),
          sendResponseWithSuggestions(
            from,
            '📝 أرسل لي رسالة نصية وسأساعدك!\n\nيمكنك سؤالي عن الجامعات، التخصصات، شروط القبول، أو أرسل معدلك.',
            ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية']
          ),
        ]);
        return res.status(200).send('OK');
      }

      if (!userText.trim()) {
        return res.status(200).send('OK');
      }

      // Input length validation — prevent DoS via oversized messages
      if (userText.length > 4000) {
        userText = userText.slice(0, 4000);
      }

      console.log(`Message from ${maskPhone(from)}: ${userText.slice(0, 100)}`);

      // ⚡ تشغيل markAsRead + processMessage بالتوازي لتقليل زمن الاستجابة
      // نمرر رقم الهاتف لتفعيل الملف الشخصي وذاكرة المحادثة
      const [, response] = await Promise.all([
        markAsRead(message.id),
        processMessage(userText, from),
      ]);

      await sendResponseWithSuggestions(from, response.text, response.suggestions);

    } catch (error) {
      console.error('Error processing message:', error.message);
      // Still return 200 to avoid WhatsApp retries
    }

    return res.status(200).send('OK');
  }

  return res.status(405).send('Method Not Allowed');
};
