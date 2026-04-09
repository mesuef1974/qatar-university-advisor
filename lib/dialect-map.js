/**
 * Qatari Dialect Map — مصدر واحد لترجمة العامية القطرية
 * ═══════════════════════════════════════════════════════
 * يُستخدم في findResponse.ts و message-router.js
 * لتوحيد خريطة الترجمة ومنع الازدواجية.
 *
 * Azkia | Single Source of Truth
 */

/** @type {Record<string, string>} */
export const qatariDialect = {
  'وين': 'أين',
  'شو': 'ما',
  'ليش': 'لماذا',
  'كيفك': 'كيف حالك',
  'يعني': 'أي',
  'زين': 'جيد',
  'عاد': 'بعد',
  'هاه': 'نعم',
  'ايش': 'ماذا',
  'شلون': 'كيف',
  'بس': 'فقط',
  'واجد': 'كثير',
  'مره': 'جداً',
  'حلو': 'جيد',
  'يبي': 'يريد',
  'أبي': 'أريد',
  'ابغى': 'أريد',
  'بغيت': 'أردت',
  'تبي': 'تريد',
  'ما عندي': 'ليس لدي',
  'أبغى أدرس': 'أريد أن أدرس',
  'وش': 'ماذا',
  'قداه': 'كم',
  'سواء': 'مساواة',
  'صح': 'صحيح',
  'خلاص': 'انتهى',
};

/**
 * Normalize Qatari dialect to MSA in a given text
 * @param {string} text
 * @returns {string}
 */
export function normalizeQatariDialect(text) {
  let normalized = text;
  Object.entries(qatariDialect).forEach(([dialect, formal]) => {
    normalized = normalized.replace(new RegExp(dialect, 'g'), formal);
  });
  return normalized;
}
