/**
 * Suggestion Engine — Qatar University Advisor
 * ═════════════════════════════════════════════
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يُتحكم هذا الملف في منطق توليد اقتراحات المتابعة (الأزرار التفاعلية)
 * التي تظهر بعد كل رد.
 *
 * الوظائف الرئيسية:
 *   - generateSmartSuggestions(profile, context) — اقتراحات مخصصة حسب الملف
 *   - mergeSuggestions(base, smart)              — دمج الاقتراحات الثابتة مع الذكية
 *
 * generateSmartSuggestions مُصدَّرة بالفعل من user-profiler.js —
 * هذا الملف يُعيد تصديرها ويضيف mergeSuggestions كأداة مساعدة.
 */

export { generateSmartSuggestions } from '../user-profiler.js';

/**
 * دمج قائمتَي اقتراحات مع إزالة التكرار والمحافظة على الترتيب.
 * تُعطى الأولوية للقائمة base إذا كانت غير فارغة؛ وإلا تُستخدم smart.
 *
 * @param {string[]} base   — الاقتراحات الأساسية من قاعدة الردود
 * @param {string[]} smart  — الاقتراحات الذكية المولَّدة من الملف الشخصي
 * @param {number}   limit  — الحد الأقصى للنتائج (افتراضي: 3)
 * @returns {string[]}
 */
export function mergeSuggestions(base = [], smart = [], limit = 3) {
  if (base.length > 0) return base.slice(0, limit);
  if (smart.length > 0) return smart.slice(0, limit);
  return ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية'].slice(0, limit);
}
