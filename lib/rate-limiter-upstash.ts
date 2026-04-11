/**
 * Upstash Rate Limiter — Qatar University Advisor
 * ═══════════════════════════════════════════════
 * Replaces in-memory sliding-window rate limiting with a distributed
 * Upstash Redis backend so limits survive server restarts and work
 * across multiple Vercel function instances.
 *
 * Graceful degradation: if UPSTASH_REDIS_REST_URL / _TOKEN are not set
 * (e.g., local dev without Upstash), the check always returns false
 * (not rate-limited) so traffic is never incorrectly blocked.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimiterType = 'chat' | 'webhook';

let chatLimiter: Ratelimit | null = null;
let webhookLimiter: Ratelimit | null = null;

function isUpstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function getChatLimiter(): Ratelimit | null {
  if (!isUpstashConfigured()) return null;
  if (!chatLimiter) {
    chatLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'rl:chat',
    });
  }
  return chatLimiter;
}

function getWebhookLimiter(): Ratelimit | null {
  if (!isUpstashConfigured()) return null;
  if (!webhookLimiter) {
    webhookLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'rl:webhook',
    });
  }
  return webhookLimiter;
}

/**
 * Check whether `identifier` (typically an IP address) exceeds the rate limit.
 *
 * @param type       - 'chat' (30 req/min) or 'webhook' (60 req/min)
 * @param identifier - unique key per caller, e.g., the client IP
 * @returns `true` if the caller is rate-limited and should receive a 429
 */
export async function isRateLimited(
  type: LimiterType,
  identifier: string,
): Promise<boolean> {
  const limiter = type === 'chat' ? getChatLimiter() : getWebhookLimiter();

  // No Upstash configured → fall through (not limited)
  if (!limiter) return false;

  try {
    const { success } = await limiter.limit(identifier);
    return !success;
  } catch {
    // If Upstash is temporarily unreachable, fail open to avoid blocking
    // legitimate traffic. Log to aid debugging.
    console.warn(`[rate-limiter] Upstash check failed for ${type}:${identifier} — failing open`);
    return false;
  }
}
