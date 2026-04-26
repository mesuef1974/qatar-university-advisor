/**
 * AI Chat Endpoint — Qatar University Advisor
 * POST /api/chat
 * Body: { question: string, nationality?: string, sessionId?: string }
 * Response: { answer: string, suggestions: string[], source: string }
 *
 * Conversation memory (opt-in via sessionId): when the client provides a
 * stable sessionId, we look up the user's profile_data + last 10 messages
 * and inject them into the AI context. Without sessionId, behavior is
 * unchanged (stateless).
 */

import { NextRequest, NextResponse } from "next/server";
import { getAIResponseWithFallback } from "@lib/ai-fallback.js";
import { sanitizeInput, getInjectionResponse } from "@lib/sanitizer";
import { logger } from "@lib/logger.js";
import { parseQuery, searchUniversities, formatSmartResponse } from "@lib/smart-search";
import { isRateLimited } from "@lib/rate-limiter-upstash";
import { tryDbListResponse } from "@lib/db-list-handler";
import { tryDbProgramsResponse } from "@lib/db-programs-handler";
import { tryDbScholarshipsResponse } from "@lib/db-scholarships-handler";
import { tryDbCareersResponse } from "@lib/db-careers-handler";
import { getUserProfileData, getConversationHistory, getOrCreateUser } from "@lib/supabase";
import { semanticSearch } from "@lib/semantic-search";
import universitiesData from "../../../../data/universities.json";

// Web sessions are mapped to a synthetic phone "web:<sessionId>" so the
// existing users.phone PK can store them without schema changes.
function sessionIdToPhone(sessionId: string): string {
  return `web:${sessionId.slice(0, 64)}`;
}

export async function POST(request: NextRequest) {
  // Rate limiting — distributed via Upstash Redis (falls back to open if unconfigured)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (await isRateLimited("chat", ip)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  // Parse body
  let body: { question?: string; nationality?: string; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { question, nationality, sessionId } = body;

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

    // ── Conversation Memory (opt-in via sessionId) ──
    // Loads stored profile_data + last 10 messages from Supabase. Fail-soft:
    // if Supabase is down or sessionId is missing, we proceed stateless.
    let conversationHistory: Array<{ role: string; message: string }> = [];
    let webPhone: string | null = null;
    if (sessionId && typeof sessionId === "string" && sessionId.length >= 8) {
      try {
        webPhone = sessionIdToPhone(sessionId);
        const user = await getOrCreateUser(webPhone, nationality ?? null);
        if (user) {
          const stored = await getUserProfileData(webPhone);
          // stored fields override only if userProfile didn't already have them
          for (const [k, v] of Object.entries(stored)) {
            if (v !== undefined && v !== null && userProfile[k] === undefined) {
              userProfile[k] = String(v);
            }
          }
          const history = await getConversationHistory(user.id);
          conversationHistory = history.map((m: { role: string; message: string }) => ({ role: m.role, message: m.message }));
          logger.info(`[chat-api] Memory loaded — profile keys=${Object.keys(stored).length}, history=${conversationHistory.length}`);
        }
      } catch (memErr: unknown) {
        const memMsg = memErr instanceof Error ? memErr.message : "Unknown";
        logger.warn(`[chat-api] Memory load failed (continuing stateless): ${memMsg}`);
      }
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
      logger.warn(`[chat-api] DB list handler exception: ${dbMsg}`);
    }

    // ── DB-First Programs Handler (DEC-AI-001 Phase 3 Expansion) ──
    // قراءة من Supabase مباشرة لأسئلة "قائمة التخصصات / البرامج المتاحة"
    try {
      const dbPrograms = await tryDbProgramsResponse(sanitized);
      if (dbPrograms) {
        logger.info(`[chat-api] DB programs hit — count: ${dbPrograms.count}`);
        return NextResponse.json({
          answer: dbPrograms.text,
          suggestions: dbPrograms.suggestions,
          source: "db",
          count: dbPrograms.count,
        });
      }
    } catch (dbErr: unknown) {
      const dbMsg = dbErr instanceof Error ? dbErr.message : "Unknown";
      logger.warn(`[chat-api] DB programs handler exception: ${dbMsg}`);
    }

    // ── DB-First Scholarships Handler (DEC-AI-001 Phase 3 Expansion) ──
    // قراءة من Supabase مباشرة لأسئلة "المنح / الابتعاث / الرعاة"
    try {
      const dbScholarships = await tryDbScholarshipsResponse(sanitized);
      if (dbScholarships) {
        logger.info(`[chat-api] DB scholarships hit — count: ${dbScholarships.count}`);
        return NextResponse.json({
          answer: dbScholarships.text,
          suggestions: dbScholarships.suggestions,
          source: "db",
          count: dbScholarships.count,
        });
      }
    } catch (dbErr: unknown) {
      const dbMsg = dbErr instanceof Error ? dbErr.message : "Unknown";
      logger.warn(`[chat-api] DB scholarships handler exception: ${dbMsg}`);
    }

    // ──────────────────────────────────────────────────────────────
    // ── DB-First Careers Handler (DEC-AI-001 Phase 3 Expansion) ──
    // قراءة من Supabase مباشرة لأسئلة "الرواتب / الوظائف / المسارات المهنية"
    // ──────────────────────────────────────────────────────────────
    try {
      const dbCareers = await tryDbCareersResponse(sanitized);
      if (dbCareers) {
        logger.info(`[chat-api] DB careers hit — count: ${dbCareers.count}`);
        return NextResponse.json({
          answer: dbCareers.text,
          suggestions: dbCareers.suggestions,
          source: "db",
          count: dbCareers.count,
        });
      }
    } catch (dbErr: unknown) {
      const dbMsg = dbErr instanceof Error ? dbErr.message : "Unknown";
      logger.warn(`[chat-api] DB careers handler exception: ${dbMsg}`);
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

    // ── RAG: Semantic Search context injection (best-effort) ──
    // Pulls top-k semantically similar chunks from knowledge_embeddings and
    // packs them into userProfile.ragContext so the AI prompt builder can
    // surface them as authoritative context. Fail-soft: zero rows = no change.
    try {
      const ragHits = await semanticSearch(sanitized, { maxResults: 4, threshold: 0.65 });
      if (Array.isArray(ragHits) && ragHits.length > 0) {
        const ragContext = ragHits
          .map((h: { content?: string }, i: number) => `[${i + 1}] ${h.content || ""}`)
          .filter((s) => s.length > 5)
          .join("\n");
        if (ragContext) {
          userProfile.ragContext = ragContext;
          logger.info(`[chat-api] RAG hits: ${ragHits.length}`);
        }
      }
    } catch (ragErr: unknown) {
      const ragMsg = ragErr instanceof Error ? ragErr.message : "Unknown";
      logger.warn(`[chat-api] RAG lookup failed (continuing without): ${ragMsg}`);
    }

    // ── AI Fallback: Gemini أو الردود الثابتة ──
    const result = await getAIResponseWithFallback(
      sanitized,
      userProfile,
      conversationHistory
    );

    logger.info(`[chat-api] Response source: ${result.fallbackLevel} (history=${conversationHistory.length}, rag=${userProfile.ragContext ? "yes" : "no"})`);

    // Persist this turn for future context (fire-and-forget — never block user)
    if (webPhone) {
      void (async () => {
        try {
          const { saveMessage } = await import("@lib/supabase");
          const user = await getOrCreateUser(webPhone, nationality ?? null);
          if (user) {
            await saveMessage(user.id, "user", sanitized);
            await saveMessage(user.id, "assistant", result.text);
          }
        } catch (persistErr: unknown) {
          const persistMsg = persistErr instanceof Error ? persistErr.message : "Unknown";
          logger.warn(`[chat-api] Failed to persist turn: ${persistMsg}`);
        }
      })();
    }

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
