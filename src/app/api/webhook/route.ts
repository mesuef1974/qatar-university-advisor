/**
 * WhatsApp Webhook — Qatar University Advisor
 * GET /api/webhook — verification
 * POST /api/webhook — incoming messages
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processMessage } from "@lib/findResponse.js";
import { sendResponseWithSuggestions, markAsRead } from "@lib/whatsapp";

// Dedup to avoid processing duplicate webhooks
const processed = new Set<string>();
const MAX_PROCESSED = 1000;

// Rate limiting
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RL_WINDOW_MS = 60_000;
const RL_MAX_REQS = 60;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RL_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
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

  if (isRateLimited(ip)) {
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

  // Dedup check
  if (processed.has(message.id)) {
    return new NextResponse("OK", { status: 200 });
  }
  processed.add(message.id);
  if (processed.size > MAX_PROCESSED) {
    const first = processed.values().next().value;
    if (first) processed.delete(first);
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

    const [, response] = await Promise.all([
      markAsRead(message.id),
      processMessage(userText, from),
    ]);

    await sendResponseWithSuggestions(from, response.text, response.suggestions);
  } catch (error: unknown) {
    const message_err = error instanceof Error ? error.message : "Unknown";
    console.error("Error processing message:", message_err);
  }

  return new NextResponse("OK", { status: 200 });
}
