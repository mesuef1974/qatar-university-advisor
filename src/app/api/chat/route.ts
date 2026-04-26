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
import { parseQuery, searchUniversities, formatSmartResponse } from "@lib/smart-search";
import { isRateLimited } from "@lib/rate-limiter-upstash";
import { tryDbListResponse } from "@lib/db-list-handler";
import universitiesData from "../../../../data/universities.json";

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
    // Build user profile context for AI
    const userProfile: Record<string, string> = {};
    if (nationality === "qatari" || nationality === "non_qatari") {
      userProfile.nationality = nationality;
    }

    // ── DB-First List Handler (DEC-AI-001 Phase 3) ──
    // قراءة من Supabase مباشرة لأسئلة "قائمة الجامعات / الكليات العسكرية"
    try {
      const dbList = await tryDbListResponse(sanitized);
      if (dbList) {
        logger.info(`[chat-api] DB list hit — count: ${dbList.count}`);
        return NextResponse.json({
          answer: dbList.text,
          suggestions: dbList.suggestions,
          source: "db",
          count: dbList.count,
        });
      }
    } catch (dbErr: unknown) {
      const dbMsg = dbErr instanceof Error ? dbErr.message : "Unknown";
      logger.warn(`[chat-api] DB list handler failed, falling back: ${dbMsg}`);
    }

    // ── Smart Search: محاولة الرد من البيانات المحلية أولاً ──
    try {
      const query = parseQuery(sanitized);
      if (nationality === "qatari" || nationality === "non_qatari") {
        query.nationality = nationality;
      }
      const universities = universitiesData.universities as Record<string, Record<string, unknown>>;
      const searchResults = searchUniversities(query, universities);

      // إذا وُجدت نتائج عالية الجودة (score > 70 للأولى أو > 40 مع نية واضحة)
      const topScore = searchResults.length > 0 ? searchResults[0].matchScore : 0;
      const hasStrongMatch =
        topScore > 70 ||
        (topScore > 40 && query.intent !== "find_university") ||
        (query.intent === 'check_admission' && query.gpa !== null && query.gpa !== undefined);

      if (hasStrongMatch && searchResults.length > 0) {
        const smartResponse = formatSmartResponse(query, searchResults);
        if (smartResponse) {
          logger.info(`[chat-api] Smart search hit — score: ${topScore}, intent: ${query.intent}`);
          return NextResponse.json({
            answer: smartResponse.text,
            suggestions: smartResponse.suggestions,
            source: "smart_search",
          });
        }
      }
    } catch (searchErr: unknown) {
      const searchMsg = searchErr instanceof Error ? searchErr.message : "Unknown";
      logger.warn(`[chat-api] Smart search failed, falling back to AI: ${searchMsg}`);
    }

    // ── AI Fallback: Gemini أو الردود الثابتة ──
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
