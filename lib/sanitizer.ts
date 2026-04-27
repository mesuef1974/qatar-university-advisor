/**
 * T-FIX-004: Input Sanitizer — Prompt Injection Defense (TypeScript)
 * يحمي النظام من محاولات التلاعب بـ Claude AI
 * شركة أذكياء للبرمجيات | OWASP A03:2021
 */

import type { SanitizeResult } from '../types/index.js';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface InjectionResponse {
  text: string;
  suggestions: string[];
}

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

// أنماط Prompt Injection المعروفة (عربي + إنجليزي)
const INJECTION_PATTERNS: RegExp[] = [
  // English patterns
  /ignore\s+(previous|all|your|prior)\s+(instructions?|rules?|prompts?|context)/i,
  /forget\s+(everything|all|your|previous|prior)/i,
  /you\s+are\s+now\s+(a\s+)?(different|new|another|evil|unrestricted)/i,
  /act\s+as\s+(if\s+you\s+are|a\s+)?(different|another|evil|jailbreak)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /do\s+anything\s+now/i,
  /dan\s+mode/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /system\s*:\s*you/i,
  /\[system\]/i,
  /[<][|]im_start[|][>]/i,
  // Arabic patterns
  /تجاهل\s+(التعليمات|الأوامر|السابقة|كل)/,
  /انسَ\s+(كل|ما|التعليمات)/,
  /أنت\s+(الآن|الان)\s+(ذكاء|روبوت|نظام)\s+(مختلف|جديد|آخر)/,
  /تصرف\s+(كأنك|كأن)/,
  /دور\s+جديد/,
  /وضع\s+(المطور|المدير|الاختبار)/,
  /افترض\s+أنك/,
  // SEC-002: أنماط Encoding المتقدمة (Base64, Unicode, ROT13)
  /base64|btoa|atob/i,
  /\\u[0-9a-f]{4}/i,
  /&#x[0-9a-f]+;/i,
  /rot[\s-]?13/i,
  /hex[\s-]?decode/i,
  /fromchar[\s-]?code/i,
  /unescape\s*\(/i,
  /decodeuri(component)?\s*\(/i,
];

// كلمات تشير لمحاولة استخراج بيانات حساسة
const SENSITIVE_EXTRACTION: RegExp[] = [
  /api[\s_-]?key/i,
  /secret[\s_-]?key/i,
  /password/i,
  /كلمة\s*المرور/,
  /مفتاح\s*(سري|api)/,
  /environment\s+variable/i,
  /process\.env/i,
  /\.env/i,
  /supabase.*key/i,
  /gemini.*key/i,
  /claude.*key/i,
  /anthropic.*key/i,
  /webhook.*secret/i,
];

const MAX_LENGTH = 1000;
const MAX_REPEATED_CHARS = 50; // منع flooding

// ──────────────────────────────────────────────────────────
// Functions
// ──────────────────────────────────────────────────────────

/**
 * تنظيف وحماية مدخلات المستخدم
 */
export function sanitizeInput(input: string): SanitizeResult {
  if (!input || typeof input !== 'string') {
    return { safe: false, sanitized: '', reason: 'invalid_input' };
  }

  // 1. حد الطول
  let sanitized: string = input.slice(0, MAX_LENGTH);

  // 2. إزالة HTML/Script tags
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .trim();

  // 3. منع flooding (حروف متكررة)
  const repeatedMatch = sanitized.match(/(.)\1{50,}/);
  if (repeatedMatch) {
    return { safe: false, sanitized: '', reason: 'flooding_detected' };
  }

  // 4. فحص Prompt Injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return { safe: false, sanitized: '', reason: 'prompt_injection' };
    }
  }

  // 5. فحص استخراج بيانات حساسة
  for (const pattern of SENSITIVE_EXTRACTION) {
    if (pattern.test(sanitized)) {
      return { safe: false, sanitized: '', reason: 'sensitive_extraction' };
    }
  }

  return { safe: true, sanitized };
}

/**
 * رد موحّد عند اكتشاف محاولة injection
 */
export function getInjectionResponse(): InjectionResponse {
  return {
    text: 'عذراً، لم أتمكن من معالجة رسالتك. يُرجى إعادة صياغة سؤالك بشكل واضح عن الجامعات أو التخصصات في قطر. 🎓',
    suggestions: ['ما هي أفضل جامعة في قطر؟', 'ما هي شروط القبول؟', 'ما المنح المتاحة؟'],
  };
}

/**
 * Scrub Personally Identifiable Information (PII) from a text string before
 * persisting it to analytics or logs.
 *
 * Closes F-4 from PLATFORM_AUDIT_PoC_2026-04-26 (PDPPL Articles 5 + 15).
 *
 * Conservative pattern set tuned for the Qatar context:
 *  - Qatar national ID (QID): 11 digits beginning with 2 or 3
 *  - International phone: +974 followed by 8 digits (with optional separators)
 *  - Local 8-digit phone (Qatar mobile/landline)
 *  - Email addresses
 *  - GPA-like decimals adjacent to "GPA" / "معدل"
 *  - Standalone 9–15 digit runs (catches non-Qatar phones / passport numbers)
 *
 * Each match is replaced with a category token so analytics still gets the
 * shape of the question without the identity.
 */
export function scrubPII(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let out = input;

  // Email
  out = out.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[EMAIL]'
  );

  // GPA / معدل decimals (e.g., "GPA 3.85" or "معدل 92.5")
  out = out.replace(
    /(?:GPA|gpa|معدل|المعدل)\s*[:=]?\s*\d{1,3}(?:[.,]\d+)?/g,
    '[GPA]'
  );

  // Qatar national ID (QID) — 11 digits starting with 2 or 3
  out = out.replace(/\b[23]\d{10}\b/g, '[QID]');

  // International phone +974 followed by 8 digits, with optional separators
  out = out.replace(/\+?974[\s-]?\d{4}[\s-]?\d{4}/g, '[PHONE]');

  // Local 8-digit phone (Qatar mobile/landline)
  out = out.replace(/\b\d{8}\b/g, '[PHONE]');

  // Catch-all: 9–15 digit runs (passport, foreign phone, etc.)
  out = out.replace(/\b\d{9,15}\b/g, '[NUM]');

  return out;
}
