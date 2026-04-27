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
import { logger } from './logger.js';

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
 * @param type       - 'chat' (30 req/min, fail-open on Upstash error)
 *                   - 'webhook' (60 req/min, fail-CLOSED on Upstash error)
 * @param identifier - unique key per caller, e.g., the client IP
 * @returns `true` if the caller is rate-limited and should receive a 429
 *
 * Closes F-2 from PLATFORM_AUDIT_PoC_2026-04-26 (hybrid behavior per security
 * advisor recommendation in GATE2_ADVISORY).
 *
 * Hybrid rationale:
 * - 'chat' (web UX-critical) → fail-open: Upstash outage should not visibly
 *   break the user-facing chat. Cost amplification window is small because
 *   Gemini calls themselves are cheap on the chat path.
 * - 'webhook' (cost-critical, no human in front of UX) → fail-CLOSED: a
 *   webhook flood during Upstash outage is exactly the abuse vector we want
 *   to stop. WhatsApp will retry on 429 transparently.
 */
export async function isRateLimited(
  type: LimiterType,
  identifier: string,
): Promise<boolean> {
  const limiter = type === 'chat' ? getChatLimiter() : getWebhookLimiter();

  // No Upstash configured → fall through (not limited).
  // This is a deliberate dev-experience decision: local dev without Upstash
  // is a documented baseline, not a hostile environment.
  if (!limiter) return false;

  try {
    const { success } = await limiter.limit(identifier);
    return !success;
  } catch (err) {
    if (type === 'chat') {
      // Chat path: fail-open. UX-critical for legitimate web users.
      logger.warn('[rate-limiter] chat: Upstash failed — failing OPEN', {
        type,
        identifier,
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
    // Webhook path: fail-CLOSED. WhatsApp retries 429 transparently;
    // we'd rather drop traffic than amplify cost during an Upstash outage.
    logger.error('[rate-limiter] webhook: Upstash failed — failing CLOSED (rate-limited)', {
      type,
      identifier,
      error: err instanceof Error ? err.message : String(err),
    });
    return true;
  }
}
