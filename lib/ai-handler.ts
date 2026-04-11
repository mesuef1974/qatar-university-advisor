/* eslint-disable */
/* global process */

import { normalizeDialect } from './dialect-support.js';
import { buildSystemPrompt } from './ai-system-prompt.js';

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

/** Claude API message */
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Claude API response shape */
interface ClaudeAPIResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { message: string };
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

const CLAUDE_API_URL: string = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL: string = 'claude-sonnet-4-20250514';
const ANTHROPIC_VERSION: string = '2023-06-01';

const GEMINI_MODEL: string = 'gemini-1.5-flash';
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
// النموذج: gemini-1.5-flash — سريع ومدعوم للعربية
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
    console.error(`Gemini API error ${response.status}:`, err);
    return null;
  }

  const data: GeminiAPIResponse = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Single Claude API call (Anthropic) — احتياطي مدفوع
// ────────────────────────────────────────────────────────────────────────────
async function callClaude(userMessage: string, conversationHistory: ConversationMessage[] = [], dbContext?: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Build messages: recent history (max 6 messages) + current message
  // Sanitize PII from conversation history before sending to external API (PDPPL Art. 8)
  const recentHistory: ClaudeMessage[] = conversationHistory.slice(-6).map((msg) => ({
    role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: typeof msg.content === 'string' ? sanitizePII(msg.content) : msg.content,
  }));

  // Strip PII before sending to external API (PDPPL Art. 8)
  const sanitizedMessage: string = sanitizePII(userMessage);

  // Normalize Qatari dialect to MSA for better comprehension
  const normalizedMessage: string = normalizeDialect(sanitizedMessage);

  const messages: ClaudeMessage[] = [
    ...recentHistory,
    { role: 'user', content: normalizedMessage },
  ];

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: getSystemPrompt(dbContext),
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => String(response.status));
    console.error(`Claude API error ${response.status}:`, err);
    return null;
  }

  const data: ClaudeAPIResponse = await response.json();
  return data.content?.[0]?.text ?? null;
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
// Main export — أولوية: Gemini (مجاني) ← Claude (احتياطي مدفوع) ← null
// Timeout مضبوط على 4 ثوانٍ لكل محاولة بمحاولة واحدة فقط لكل مزود
// بما يضمن عدم تجاوز حد Vercel البالغ 10 ثوانٍ
// ────────────────────────────────────────────────────────────────────────────
async function getAIResponse(userMessage: string, conversationHistory: ConversationMessage[] = [], dbContext?: string): Promise<AIResponse | null> {
  const MAX_ATTEMPTS: number = 1;
  const TIMEOUT_MS: number   = 4000;

  // ── المزود الأول: Gemini (مجاني) ──────────────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const aiText = await withTimeout(
          callGemini(userMessage, conversationHistory, dbContext),
          TIMEOUT_MS,
          `Gemini attempt ${attempt}`
        );

        if (aiText) {
          console.log(`[AI] Gemini responded on attempt ${attempt}`);
          return parseAIResponse(aiText);
        }

        console.warn(`[AI] Gemini attempt ${attempt}: empty response`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[AI] Gemini attempt ${attempt} failed: ${message}`);
      }
    }
    console.warn('[AI] Gemini failed — falling back to Claude if available');
  }

  // ── المزود الثاني: Claude (احتياطي مدفوع) ─────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const aiText = await withTimeout(
          callClaude(userMessage, conversationHistory, dbContext),
          TIMEOUT_MS,
          `Claude attempt ${attempt}`
        );

        if (aiText) {
          console.log(`[AI] Claude responded on attempt ${attempt}`);
          return parseAIResponse(aiText);
        }

        console.warn(`[AI] Claude attempt ${attempt}: empty response`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[AI] Claude attempt ${attempt} failed: ${message}`);
      }
    }
    console.error('[AI] All Claude attempts failed');
  }

  console.error('[AI] No AI provider available or all failed — returning null for local fallback');
  return null;
}

export { getAIResponse };
