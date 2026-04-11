/**
 * AI Chat Endpoint — Qatar University Advisor
 * POST /api/chat
 * Body: { question: string, nationality?: string }
 * Response: { answer: string, suggestions: string[], source: string }
 *
 * Pipeline: identical to the WhatsApp webhook handler — both channels now
 * go through processMessage() which handles knowledge-cache lookup,
 * semantic search, keyword matching, DB context, and Gemini AI fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, getInjectionResponse } from "@lib/sanitizer";
import { logger } from "@lib/logger.js";
import { isRateLimited } from "@lib/rate-limiter-upstash";
import { processMessage } from "@lib/findResponse";

export async function POST(request: NextRequest) {
  // Rate limiting — distributed via Upstash Redis (falls back to open if unconfigured)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (await isRateLimited("chat", ip)) {
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
    // Validate nationality before passing to processMessage
    const validNationality =
      nationality === "qatari" || nationality === "non_qatari"
        ? nationality
        : undefined;

    // Unified pipeline: same as WhatsApp webhook — knowledge cache → semantic
    // search → keyword matching → DB context → Gemini AI fallback.
    // phone=null skips user-tracking (no Supabase user row for web sessions).
    const response = await processMessage(sanitized, null, validNationality);

    logger.info("[chat-api] Response delivered via unified pipeline");

    return NextResponse.json({
      answer: response.text,
      suggestions: response.suggestions || [],
      source: "advisor",
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
