/**
 * WhatsApp Webhook — Qatar University Advisor
 * GET /api/webhook — verification
 * POST /api/webhook — incoming messages
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processMessage } from "@lib/findResponse";
import { sendResponseWithSuggestions, markAsRead, sendTypingIndicator } from "@lib/whatsapp";
import {
  hasUserConsented,
  recordConsent,
  getConsentBanner,
} from "@lib/consent-handler";
import { isRateLimited } from "@lib/rate-limiter-upstash";
import { Redis } from "@upstash/redis";

// ── Persistent dedup via Upstash Redis (TTL = 5 minutes) ──────────────────
// Falls back to an in-memory Set when Upstash is not configured (local dev).
const DEDUP_TTL_SECONDS = 300;

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  if (!_redis) {
    _redis = Redis.fromEnv();
  }
  return _redis;
}

// Fallback in-memory dedup (used only when Upstash is not configured)
const _localProcessed = new Set<string>();
const LOCAL_MAX = 1000;

async function isDuplicate(messageId: string): Promise<boolean> {
  const redis = getRedis();
  if (redis) {
    // SET NX PX — atomic: returns 'OK' if key was newly set, null if already exists
    const result = await redis
      .set(`wh:dedup:${messageId}`, "1", { nx: true, ex: DEDUP_TTL_SECONDS })
      .catch(() => null);
    // null means key already existed → duplicate
    return result === null;
  }

  // In-memory fallback
  if (_localProcessed.has(messageId)) return true;
  _localProcessed.add(messageId);
  if (_localProcessed.size > LOCAL_MAX) {
    const first = _localProcessed.values().next().value;
    if (first) _localProcessed.delete(first);
  }
  return false;
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return "***";
  return `***${phone.slice(-4)}`;
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WEBHOOK_APP_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[webhook] WEBHOOK_APP_SECRET is not set in production");
      return false;
    }
    console.warn("[webhook] WEBHOOK_APP_SECRET not set — skipping (dev mode)");
    return true;
  }

  if (!signature) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (await isRateLimited("webhook", ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // Content-Type validation
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new NextResponse("Unsupported Media Type", { status: 415 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  // Signature verification
  const signature = request.headers.get("x-hub-signature-256");
  if (!verifySignature(rawBody, signature)) {
    console.warn("[webhook] Signature verification failed");
    return new NextResponse("Forbidden", { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entry = (body as any)?.entry?.[0]?.changes?.[0]?.value;
  if (!entry?.messages) {
    return new NextResponse("OK", { status: 200 });
  }

  const message = entry.messages[0];
  const from = message.from;

  // Persistent dedup check (Upstash Redis → in-memory fallback)
  if (await isDuplicate(message.id).catch(() => false)) {
    return new NextResponse("OK", { status: 200 });
  }

  try {
    let userText = "";

    if (message.type === "text") {
      userText = message.text.body;
    } else if (message.type === "interactive") {
      if (message.interactive.type === "button_reply") {
        userText = message.interactive.button_reply.title;
      } else if (message.interactive.type === "list_reply") {
        userText = message.interactive.list_reply.title;
      }
    } else {
      await Promise.all([
        markAsRead(message.id),
        sendResponseWithSuggestions(
          from,
          "ارسل لي رسالة نصية وسأساعدك!\n\nيمكنك سؤالي عن الجامعات، التخصصات، شروط القبول، او ارسل معدلك.",
          ["جميع الجامعات", "الرواتب والوظائف", "الكليات العسكرية"]
        ),
      ]);
      return new NextResponse("OK", { status: 200 });
    }

    if (!userText.trim()) {
      return new NextResponse("OK", { status: 200 });
    }

    if (userText.length > 4000) {
      userText = userText.slice(0, 4000);
    }

    console.log(
      `Message from ${maskPhone(from)}: ${userText.slice(0, 100)}`
    );

    // ── PDPPL Article 7 consent gate (closes F-3 from PLATFORM_AUDIT_PoC) ──
    // No data processing for users who have not given explicit informed consent.
    const consented = await hasUserConsented(from);
    if (!consented) {
      const normalized = userText.trim().toLowerCase();
      const accept = ["أوافق", "اوافق", "موافق", "نعم", "yes", "agree", "i agree"];
      const decline = ["لا أوافق", "لا اوافق", "ارفض", "أرفض", "no", "decline", "i decline"];

      if (accept.some((a) => normalized === a.toLowerCase() || normalized.startsWith(a.toLowerCase()))) {
        const result = await recordConsent(from);
        if (result.success) {
          await sendResponseWithSuggestions(
            from,
            "✅ شكراً، تم تسجيل موافقتك بنجاح وفق PDPPL.\n\nالآن يمكنك سؤالي عن الجامعات، التخصصات، أو شروط القبول.",
            ["جميع الجامعات", "الرواتب والوظائف", "الكليات العسكرية"]
          );
        } else {
          await sendResponseWithSuggestions(
            from,
            "تعذر تسجيل موافقتك حالياً. يرجى المحاولة لاحقاً أو التواصل على dpo@azkia.qa",
            ["أوافق", "لا أوافق"]
          );
        }
        return new NextResponse("OK", { status: 200 });
      }

      if (decline.some((d) => normalized === d.toLowerCase() || normalized.startsWith(d.toLowerCase()))) {
        await sendResponseWithSuggestions(
          from,
          "تم تسجيل رفضك. لن تتم معالجة بياناتك.\nإذا غيّرت رأيك لاحقاً، أرسل 'أوافق'.",
          []
        );
        return new NextResponse("OK", { status: 200 });
      }

      // First message (or unrecognized reply) → show consent banner.
      const banner = getConsentBanner();
      await sendResponseWithSuggestions(from, banner.text, banner.suggestions);
      return new NextResponse("OK", { status: 200 });
    }

    // Show typing indicator immediately (replaces markAsRead — typing
    // implicitly marks as read too) so the user sees instant feedback while
    // we run AI/DB work. Falls back to markAsRead silently on older API
    // versions that reject the typing_indicator field.
    const [, response] = await Promise.all([
      sendTypingIndicator(message.id),
      processMessage(userText, from),
    ]);

    await sendResponseWithSuggestions(from, response.text, response.suggestions);
  } catch (error: unknown) {
    const message_err = error instanceof Error ? error.message : "Unknown";
    console.error("Error processing message:", message_err);
  }

  return new NextResponse("OK", { status: 200 });
}
