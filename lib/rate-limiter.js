/**
 * Rate Limiter — Distributed via Upstash Redis
 * T-Q7-T009: استبدال in-memory rate limiting بـ Redis الموزع
 *
 * يحل مشكلة Vercel Multi-Instance: كل instance لها ذاكرة منفصلة
 * الحل: Redis مشترك عبر جميع instances
 *
 * Fallback: إذا لم يكن Redis متاحاً → يرجع للـ in-memory (تطوير محلي)
 */

/* global process */

// ─── Upstash Redis (إنتاج) ──────────────────────────────────────────────────
let redisClient = null;
let Ratelimit = null;

async function initRedis() {
  if (redisClient) return true;

  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return false; // Fallback to in-memory
  }

  try {
    const { Redis }    = await import('@upstash/redis');
    const { Ratelimit: RL } = await import('@upstash/ratelimit');

    redisClient = new Redis({ url: redisUrl, token: redisToken });
    Ratelimit   = RL;
    return true;
  } catch {
    return false;
  }
}

// ─── In-Memory Fallback (تطوير محلي / عند غياب Redis) ──────────────────────
const store = globalThis;
if (!store._rateLimitStore) store._rateLimitStore = new Map();

function inMemoryRateLimit(key, maxRequests, windowMs) {
  const now   = Date.now();
  const entry = store._rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count   = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  store._rateLimitStore.set(key, entry);

  return {
    success:   entry.count <= maxRequests,
    limit:     maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt:   entry.resetAt,
  };
}

// ─── الدالة الرئيسية ─────────────────────────────────────────────────────────
/**
 * فحص Rate Limit
 * @param {string} identifier - معرف فريد (IP, phone, etc.)
 * @param {object} options
 * @param {number} options.maxRequests - الحد الأقصى للطلبات
 * @param {number} options.windowMs - نافذة الوقت بالميلي ثانية
 * @param {string} options.prefix - بادئة المفتاح في Redis
 * @returns {Promise<{success: boolean, remaining: number, resetAt: number}>}
 */
export async function checkRateLimit(identifier, {
  maxRequests = 10,
  windowMs    = 60_000,
  prefix      = 'rl',
} = {}) {
  const key = `${prefix}:${identifier}`;

  // حاول Redis أولاً
  const redisReady = await initRedis();

  if (redisReady && Ratelimit) {
    try {
      const limiter = new Ratelimit({
        redis:    redisClient,
        limiter:  Ratelimit.slidingWindow(maxRequests, `${windowMs / 1000} s`),
        prefix:   'qatar-advisor',
      });

      const result = await limiter.limit(key);
      return {
        success:   result.success,
        limit:     result.limit,
        remaining: result.remaining,
        resetAt:   result.reset,
        source:    'redis',
      };
    } catch {
      // Redis فشل → fallback
    }
  }

  // In-Memory Fallback
  const result = inMemoryRateLimit(key, maxRequests, windowMs);
  return { ...result, source: 'memory' };
}

/**
 * Middleware جاهز للـ Vercel API Routes
 */
export async function rateLimitMiddleware(req, res, options = {}) {
  const ip  = req.headers['x-forwarded-for']?.split(',')[0].trim()
            || req.socket?.remoteAddress
            || 'unknown';

  const result = await checkRateLimit(ip, options);

  if (!result.success) {
    res.setHeader('X-RateLimit-Limit',     options.maxRequests || 10);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset',     result.resetAt);
    res.setHeader('Retry-After',           Math.ceil((result.resetAt - Date.now()) / 1000));

    return res.status(429).json({
      error:    'Too many requests. Please try again later.',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
    });
  }

  res.setHeader('X-RateLimit-Limit',     options.maxRequests || 10);
  res.setHeader('X-RateLimit-Remaining', result.remaining);

  return null; // لم يُحجب
}
