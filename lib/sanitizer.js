/**
 * T-FIX-004: Input Sanitizer — Prompt Injection Defense
 * يحمي النظام من محاولات التلاعب بـ Gemini AI
 * شركة النخبوية للبرمجيات | OWASP A03:2021
 */

// أنماط Prompt Injection المعروفة (عربي + إنجليزي)
const INJECTION_PATTERNS = [
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
];

// كلمات تشير لمحاولة استخراج بيانات حساسة
const SENSITIVE_EXTRACTION = [
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
  /webhook.*secret/i,
];

const MAX_LENGTH = 1000;
const MAX_REPEATED_CHARS = 50; // منع flooding

/**
 * تنظيف وحماية مدخلات المستخدم
 * @param {string} input
 * @returns {{ safe: boolean, sanitized: string, reason?: string }}
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return { safe: false, sanitized: '', reason: 'invalid_input' };
  }

  // 1. حد الطول
  let sanitized = input.slice(0, MAX_LENGTH);

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
 * @returns {object}
 */
export function getInjectionResponse() {
  return {
    text: 'عذراً، لم أتمكن من معالجة رسالتك. يُرجى إعادة صياغة سؤالك بشكل واضح عن الجامعات أو التخصصات في قطر. 🎓',
    suggestions: ['ما هي أفضل جامعة في قطر؟', 'ما هي شروط القبول؟', 'ما المنح المتاحة؟'],
  };
}
