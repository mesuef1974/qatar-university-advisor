/**
 * AI Chat Endpoint — Qatar University Advisor
 * POST /api/chat
 * Body: { question: string, nationality?: string }
 * Response: { answer: string, suggestions: string[], source: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { getAIResponseWithFallback } from "@lib/ai-fallback.js";
import { sanitizeInput, getInjectionResponse } from "@lib/sanitizer";
import { logger } from "@lib/logger.js";

// Rate limiting — in-memory sliding window
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RL_WINDOW_MS = 60_000;
const RL_MAX_REQS = 30;

function isRateLimited(ip: string): boolean {
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

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  // Parse body
  let body: { question?: string; nationality?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { question, nationality } = body;

  if (!question || typeof question !== "string" || !question.trim()) {
    return NextResponse.json(
      { error: 'Missing or empty "question" field' },
      { status: 400 }
    );
  }

  // Input length limit
  const userText = question.trim().slice(0, 2000);

  // Sanitize input (Prompt Injection Defense)
  const { safe, sanitized, reason } = sanitizeInput(userText);
  if (!safe) {
    logger.warn(`[chat-api] Blocked input — reason: ${reason}`);
    const injResponse = getInjectionResponse();
    return NextResponse.json({
      answer: injResponse.text,
      suggestions: injResponse.suggestions,
      source: "security",
    });
  }

  try {
    // Build user profile context for Claude
    const userProfile: Record<string, string> = {};
    if (nationality === "qatari" || nationality === "non_qatari") {
      userProfile.nationality = nationality;
    }

    const result = await getAIResponseWithFallback(
      sanitized,
      userProfile,
      []
    );

    logger.info(`[chat-api] Response source: ${result.fallbackLevel}`);

    return NextResponse.json({
      answer: result.text,
      suggestions: result.suggestions || [],
      source: result.fallbackLevel,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("[chat-api] Unexpected error:", { errorMessage: message });
    return NextResponse.json({
      answer: "عذرا، حدث خطا غير متوقع. يرجى المحاولة مرة اخرى.",
      suggestions: ["جميع الجامعات", "المنح والابتعاث", "الرواتب والوظائف"],
      source: "error",
    });
  }
}
