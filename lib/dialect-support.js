// ════════════════════════════════════════════════════════════════════
// dialect-support.js — Qatari/Gulf Dialect Normalization Module
// FS-T05: Maps colloquial Qatari Arabic to Modern Standard Arabic
// ════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────
// Dictionary: Qatari/Gulf dialect → Standard Arabic (MSA)
// ────────────────────────────────────────────────────────────────────
const DIALECT_MAP = [
  // Greetings & common phrases
  { pattern: /\bاشحالك\b/g,              standard: 'كيف حالك' },
  { pattern: /\bاشحالج\b/g,              standard: 'كيف حالك' },
  { pattern: /\bشخبارك\b/g,              standard: 'كيف حالك' },
  { pattern: /\bشلونك\b/g,               standard: 'كيف حالك' },
  { pattern: /\bشلونج\b/g,               standard: 'كيف حالك' },
  { pattern: /\bشلون\b/g,                standard: 'كيف' },

  // Question words
  { pattern: /\bشنو\b/g,                 standard: 'ماذا' },
  { pattern: /\bايش\b/g,                 standard: 'ماذا' },
  { pattern: /\bوش\b/g,                  standard: 'ماذا' },
  { pattern: /\bشفيك\b/g,                standard: 'ما بك' },
  { pattern: /\bشفيج\b/g,                standard: 'ما بك' },
  { pattern: /\bوين\b/g,                 standard: 'أين' },
  { pattern: /\bليش\b/g,                 standard: 'لماذا' },

  // Time expressions
  { pattern: /\bهالحين\b/g,              standard: 'الآن' },
  { pattern: /\bالحين\b/g,               standard: 'الآن' },
  { pattern: /\bذحين\b/g,                standard: 'الآن' },

  // Affirmatives & negatives
  { pattern: /\bاييه\b/g,                standard: 'نعم' },
  { pattern: /\bايه\b/g,                 standard: 'نعم' },
  { pattern: /\bأي\b/g,                  standard: 'نعم' },
  { pattern: /\bلا\s+والله\b/g,          standard: 'لا' },

  // Common expressions
  { pattern: /\bيالله\b/g,               standard: 'حسناً' },
  { pattern: /\bيللا\b/g,                standard: 'حسناً' },
  { pattern: /\bزين\b/g,                 standard: 'حسناً' },

  // Thank you variants
  { pattern: /\bمشكور\b/g,               standard: 'شكراً' },
  { pattern: /\bمشكوره\b/g,              standard: 'شكراً' },
  { pattern: /\bتسلم\b/g,                standard: 'شكراً' },
  { pattern: /\bتسلمين\b/g,              standard: 'شكراً' },

  // Family terms (colloquial)
  { pattern: /\bيبت\b/g,                 standard: 'يا أبي' },
  { pattern: /\bيبه\b/g,                 standard: 'يا أبي' },
  { pattern: /\bيمه\b/g,                 standard: 'يا أمي' },

  // Common verbs / adjectives
  { pattern: /\bابي\b/g,                 standard: 'أريد' },
  { pattern: /\bابا\b/g,                 standard: 'أريد' },
  { pattern: /\bابغى\b/g,                standard: 'أريد' },
  { pattern: /\bاحس\b/g,                 standard: 'أشعر' },
  { pattern: /\bواجد\b/g,                standard: 'كثير' },
  { pattern: /\bمب\b/g,                  standard: 'ليس' },
  { pattern: /\bمو\b/g,                  standard: 'ليس' },
];

// ────────────────────────────────────────────────────────────────────
// normalizeDialect(text)
// Preprocesses user input by replacing Qatari dialect phrases
// with their MSA equivalents so the AI understands them better.
// Returns the normalized text string.
// ────────────────────────────────────────────────────────────────────
function normalizeDialect(text) {
  if (!text || typeof text !== 'string') return text;

  let normalized = text;
  for (const entry of DIALECT_MAP) {
    normalized = normalized.replace(entry.pattern, entry.standard);
  }
  return normalized;
}

// ────────────────────────────────────────────────────────────────────
// getDialectSystemPromptAddition()
// Returns a prompt fragment that instructs Claude to understand
// Gulf/Qatari dialect while always replying in simplified MSA.
// ────────────────────────────────────────────────────────────────────
function getDialectSystemPromptAddition() {
  return `
أنت تتحدث مع طلاب في قطر. كثير منهم يستخدمون اللهجة القطرية/الخليجية.
افهم اللهجة القطرية (شلون = كيف، هالحين = الآن، وش/ايش = ماذا، زين = حسناً، شنو = ماذا، وين = أين، ليش = لماذا، اشحالك = كيف حالك).
رُدّ دائماً بالعربية الفصحى المبسّطة — لا تستخدم اللهجة في ردودك، لكن افهمها في أسئلتهم.`;
}

// ────────────────────────────────────────────────────────────────────
// Exports
// ────────────────────────────────────────────────────────────────────
export { normalizeDialect, getDialectSystemPromptAddition, DIALECT_MAP };
