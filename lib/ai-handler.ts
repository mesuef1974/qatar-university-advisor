/* eslint-disable */
/* global process */

import { normalizeDialect } from './dialect-support.js';
import { buildSystemPrompt } from './ai-system-prompt.js';
import { logger } from './logger.js';

// ══════════════════════════════════════════
// Types & Interfaces
// ══════════════════════════════════════════

/** Conversation history message (from the bot's storage layer) */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

/** Parsed AI response returned to callers */
export interface AIResponse {
  text: string;
  suggestions: string[];
}

/** Gemini API content part */
interface GeminiPart {
  text: string;
}

/** Gemini API content object */
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/** Gemini API response shape */
interface GeminiAPIResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: { message: string; code?: number };
}

// ══════════════════════════════════════════
// Constants
// ══════════════════════════════════════════

const GEMINI_MODEL: string = 'gemini-2.5-flash';
const GEMINI_API_BASE: string = 'https://generativelanguage.googleapis.com/v1beta/models';

// ────────────────────────────────────────────────────────────────────────────
// System Prompt — يُبنى ديناميكياً.
// عند توفّر dbContext (بيانات حية من Supabase)، يُستخدم بدلاً من universities.json
// وإلا يُعاد الاحتياط المُخزَّن مؤقتاً من universities.json.
// ────────────────────────────────────────────────────────────────────────────
// Cached static system prompt — built once per cold start from universities.json
let _cachedSystemPrompt: string | null = null;
function getSystemPrompt(dbContext?: string): string {
  if (dbContext) {
    // بيانات حية من Supabase — لا تُخزَّن مؤقتاً (تتغير بتغيّر السؤال)
    return buildSystemPrompt(undefined, dbContext);
  }
  // احتياط ثابت: universities.json (مُخزَّن مؤقتاً لتجنّب تكرار القراءة)
  if (!_cachedSystemPrompt) {
    _cachedSystemPrompt = buildSystemPrompt();
  }
  return _cachedSystemPrompt;
}

// ────────────────────────────────────────────────────────────────────────────
// PII Anonymization — PDPPL Article 8 (Qatar Personal Data Protection Law)
// Strips sensitive identifiers before any text leaves this server.
// ────────────────────────────────────────────────────────────────────────────
function sanitizePII(text: string): string {
  return text
    // Qatar phone numbers: +974XXXXXXXX | 974XXXXXXXX | 0XXXXXXXX | 8-digit local
    .replace(/(?:\+974|974|0)\d{8}/g, '[PHONE]')
    .replace(/\b\d{8}\b/g, '[PHONE]')
    // Email addresses
    .replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    // Qatar National ID (QID): exactly 11 digits
    .replace(/\b\d{11}\b/g, '[QID]')
    // Credit card numbers: 16 digits (optionally separated by spaces/dashes)
    .replace(/\b(?:\d[\s\-]?){15}\d\b/g, '[CARD]')
    // Arabic name patterns: "اسمي X" | "أنا X" | "انا X" followed by a word
    .replace(/(اسمي|أنا|انا)\s+\S+/g, '$1 [STUDENT]');
}

// ────────────────────────────────────────────────────────────────────────────
// Timeout wrapper — يمنع تجاوز Vercel 10s limit
// ────────────────────────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number = 8000, label: string = 'operation'): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// ────────────────────────────────────────────────────────────────────────────
// Google Gemini API call (مجاني — 15 طلب/دقيقة، 1M token/يوم)
// النموذج: gemini-2.5-flash — سريع ومدعوم للعربية
// للحصول على مفتاح مجاني: https://aistudio.google.com/app/apikey
// ────────────────────────────────────────────────────────────────────────────
async function callGemini(userMessage: string, conversationHistory: ConversationMessage[] = [], dbContext?: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Strip PII before sending to external API (PDPPL Art. 8)
  const sanitizedMessage: string = sanitizePII(userMessage);

  // Normalize Qatari dialect to MSA for better comprehension
  const normalizedMessage: string = normalizeDialect(sanitizedMessage);

  // Build conversation history for Gemini (uses 'model' role instead of 'assistant')
  const recentHistory: GeminiContent[] = conversationHistory.slice(-6).map((msg) => ({
    role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
    parts: [{ text: typeof msg.content === 'string' ? sanitizePII(msg.content) : msg.content }],
  }));

  const contents: GeminiContent[] = [
    ...recentHistory,
    { role: 'user', parts: [{ text: normalizedMessage }] },
  ];

  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: getSystemPrompt(dbContext) }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => String(response.status));
    logger.error(`Gemini API error ${response.status}:`, { error: err });
    return null;
  }

  const data: GeminiAPIResponse = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Parse AI text → { text, suggestions }
// ────────────────────────────────────────────────────────────────────────────
function parseAIResponse(aiText: string): AIResponse {
  const lines: string[] = aiText.split('\n');
  const suggestions: string[] = [];
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•')) {
      const cleaned = trimmed.replace(/^•\s*/, '').trim();
      if (cleaned.length > 0 && cleaned.length <= 30 && suggestions.length < 4) {
        suggestions.push(cleaned);
        continue;
      }
    }
    textLines.push(line);
  }

  return {
    text: textLines.join('\n').trim(),
    suggestions: suggestions.length > 0
      ? suggestions
      : ['جميع الجامعات', 'المنح والابتعاث', 'الرواتب والوظائف'],
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Main export — Gemini (مجاني) ← ردود ثابتة ← null
// Timeout مضبوط على 4 ثوانٍ بما يضمن عدم تجاوز حد Vercel البالغ 10 ثوانٍ
// ────────────────────────────────────────────────────────────────────────────
async function getAIResponse(userMessage: string, conversationHistory: ConversationMessage[] = [], dbContext?: string): Promise<AIResponse | null> {
  const TIMEOUT_MS: number = 4000;

  // ── Gemini (مجاني) ──────────────────────────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const aiText = await withTimeout(
        callGemini(userMessage, conversationHistory, dbContext),
        TIMEOUT_MS,
        'Gemini'
      );

      if (aiText) {
        logger.info('[AI] Gemini responded successfully');
        return parseAIResponse(aiText);
      }

      logger.warn('[AI] Gemini returned empty response');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn('[AI] Gemini failed', { error: message });
    }
    logger.error('[AI] Gemini failed — returning null for local fallback');
  } else {
    logger.error('[AI] No AI provider configured (GEMINI_API_KEY missing)');
  }

  return null;
}

export { getAIResponse };
