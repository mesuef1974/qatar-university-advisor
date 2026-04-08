/* eslint-disable */
/* global process */

import { normalizeDialect } from './dialect-support.js';
import { buildSystemPrompt } from './ai-system-prompt.js';

// ══════════════════════════════════════════
// Types & Interfaces
// ══════════════════════════════════════════

/** A single part in Gemini request/response content */
export interface GeminiPart {
  text: string;
}

/** A single content entry in the Gemini API */
export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/** Safety setting for Gemini API */
export interface GeminiSafetySetting {
  category: string;
  threshold: string;
}

/** Generation config for Gemini API */
export interface GeminiGenerationConfig {
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
}

/** Full Gemini API request body */
export interface GeminiRequestBody {
  system_instruction: { parts: GeminiPart[] };
  contents: GeminiContent[];
  generationConfig: GeminiGenerationConfig;
  safetySettings: GeminiSafetySetting[];
}

/** A candidate in the Gemini API response */
export interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

/** Gemini API response shape */
export interface GeminiAPIResponse {
  candidates?: GeminiCandidate[];
}

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

// ══════════════════════════════════════════
// Constants
// ══════════════════════════════════════════

const GEMINI_API_URL: string =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ────────────────────────────────────────────────────────────────────────────
// System Prompt — يُبنى ديناميكياً من universities.json عبر buildSystemPrompt()
// ────────────────────────────────────────────────────────────────────────────
// Cached system prompt — built once per cold start (includes full DB data)
let _cachedSystemPrompt: string | null = null;
function getSystemPrompt(): string {
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
// Single Gemini API call
// ────────────────────────────────────────────────────────────────────────────
async function callGemini(userMessage: string, conversationHistory: ConversationMessage[] = []): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Build contents: recent history (max 6 messages) + current message
  const recentHistory: GeminiContent[] = conversationHistory.slice(-6).map((msg) => ({
    role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
    parts: [{ text: msg.content }],
  }));

  // Strip PII before sending to external API (PDPPL Art. 8)
  const sanitizedMessage: string = sanitizePII(userMessage);

  // Normalize Qatari dialect to MSA for better comprehension
  const normalizedMessage: string = normalizeDialect(sanitizedMessage);

  const contents: GeminiContent[] = [
    ...recentHistory,
    { role: 'user', parts: [{ text: normalizedMessage }] },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: getSystemPrompt() }] },
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 900,
        topP: 0.85,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    } satisfies GeminiRequestBody),
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
// Main export — مع Retry تلقائي مرتين + Timeout
// ────────────────────────────────────────────────────────────────────────────
async function getAIResponse(userMessage: string, conversationHistory: ConversationMessage[] = []): Promise<AIResponse | null> {
  const MAX_RETRIES: number = 2;
  const TIMEOUT_MS: number  = 8000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const aiText = await withTimeout(
        callGemini(userMessage, conversationHistory),
        TIMEOUT_MS,
        `Gemini attempt ${attempt}`
      );

      if (aiText) return parseAIResponse(aiText);

      console.warn(`[AI] Attempt ${attempt}: empty response from Gemini`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] Attempt ${attempt} failed: ${message}`);
    }

    // تأخير تصاعدي بين المحاولات (500ms, 1000ms)
    if (attempt < MAX_RETRIES) {
      await new Promise<void>((r) => setTimeout(r, 500 * attempt));
    }
  }

  console.error('[AI] All Gemini attempts failed — returning null for local fallback');
  return null;
}

export { getAIResponse };
