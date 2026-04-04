/**
 * Scholarships Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق بالمنح الدراسية والتمويل:
 * - الابتعاث الأميري (هارفارد / MIT / أكسفورد / كامبريدج)
 * - الابتعاث الخارجي والداخلي
 * - منح الشركات: قطر للطاقة، خطوط قطرية، QNB، كهرماء، أشغال، ناقلات
 * - الجهات الراعية (قائمة كاملة)
 * - منح غير القطريين / المقيمين / الوافدين
 * - قطر وغير قطري (مقارنة)
 * - HBKU (منح كاملة لجميع الجنسيات)
 *
 * ملاحظة هندسية مهمة:
 *   isScholarshipContext يجب تحديده قبل فحص أسماء الجامعات
 *   لتفادي التعارضات (مثل: كورنيل في سياق المنح != كورنيل في سياق الجامعة)
 */

export const MODULE_NAME = 'scholarships';
export const MODULE_VERSION = '1.0.0';

// ══════════════════════════════════════════════════════
// Scholarship response key constants
// ══════════════════════════════════════════════════════
export const SCHOLARSHIP_KEYS = [
  'scholarship_amiri',
  'scholarship_external',
  'scholarship_internal',
  'scholarship_qatarenergy',
  'scholarship_qatarairways',
  'scholarship_qnb',
  'scholarship_kahramaa',
  'scholarship_ashghal',
  'scholarship_nakilat',
  'scholarship_non_qatari',
  'sponsors_list',
];

// ══════════════════════════════════════════════════════
// Scholarship keyword matching helpers
// ══════════════════════════════════════════════════════

/**
 * Detect scholarship context from query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isScholarshipContext(q) {
  return q.includes('منح') || q.includes('ابتعاث') || q.includes('بعثة') ||
    q.includes('سبونسر') || q.includes('راعي') || q.includes('رعاية');
}

/**
 * Match sponsors list query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isSponsorsListQuery(q) {
  return q.includes('سبونسر') || q.includes('جهات راعية') ||
    (q.includes('راعي') && !q.includes('عسكري')) ||
    (q.includes('رعاية') && (q.includes('دراس') || q.includes('جامع')));
}

/**
 * Match Amiri scholarship query
 * @param {string} q - lowercase query
 * @param {boolean} scholarshipCtx - whether scholarship context is detected
 * @returns {boolean}
 */
export function isAmiriScholarshipQuery(q, scholarshipCtx) {
  if (q.includes('أميري') || q.includes('البعثة الأميرية') || q.includes('ابتعاث أميري'))
    return true;
  if (scholarshipCtx && (q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد') || q.includes('كامبريدج')))
    return true;
  return false;
}

/**
 * Match external scholarship query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isExternalScholarshipQuery(q) {
  return q.includes('ابتعاث خارجي') ||
    (q.includes('دراسة') && q.includes('في الخارج')) ||
    (q.includes('ابتعاث') && q.includes('خارج'));
}

/**
 * Match internal scholarship query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isInternalScholarshipQuery(q) {
  return q.includes('ابتعاث داخلي');
}

/**
 * Match QatarEnergy scholarship query
 * @param {string} q - lowercase query
 * @param {boolean} scholarshipCtx - whether scholarship context is detected
 * @returns {boolean}
 */
export function isQatarEnergyScholarshipQuery(q, scholarshipCtx) {
  if (scholarshipCtx && (q.includes('قطر للطاقة') || q.includes('قطبك') || q.includes('qatarenergy')))
    return true;
  if (q.includes('قطبك') && !q.includes('هندسة'))
    return true;
  return false;
}

/**
 * Match Qatar Airways scholarship query
 * @param {string} q - lowercase query
 * @param {boolean} scholarshipCtx - whether scholarship context is detected
 * @returns {boolean}
 */
export function isQatarAirwaysScholarshipQuery(q, scholarshipCtx) {
  return scholarshipCtx && (q.includes('خطوط قطرية') || q.includes('qatar airways') || q.includes('الدرب'));
}

/**
 * Match QNB scholarship query
 * @param {string} q - lowercase query
 * @param {boolean} scholarshipCtx - whether scholarship context is detected
 * @returns {boolean}
 */
export function isQnbScholarshipQuery(q, scholarshipCtx) {
  return scholarshipCtx && (q.includes('qnb') || q.includes('بنك قطر الوطني'));
}

/**
 * Match Kahramaa scholarship query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isKahramaaScholarshipQuery(q) {
  return q.includes('كهرماء') || q.includes('kahramaa');
}

/**
 * Match Ashghal scholarship query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isAshghalScholarshipQuery(q) {
  return q.includes('أشغال') || q.includes('اشغال') || q.includes('ashghal');
}

/**
 * Match Nakilat scholarship query
 * @param {string} q - lowercase query
 * @param {boolean} scholarshipCtx - whether scholarship context is detected
 * @returns {boolean}
 */
export function isNakilatScholarshipQuery(q, scholarshipCtx) {
  return q.includes('ناقلات') || q.includes('nakilat') || (scholarshipCtx && q.includes('بحري'));
}

/**
 * Match non-Qatari scholarship query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isNonQatariScholarshipKeyword(q) {
  return q.includes('غير قطري') || q.includes('غير القطري') || q.includes('غير القطريين') ||
    q.includes('مقيم') || q.includes('للمقيمين') || q.includes('مقيمين') ||
    q.includes('وافد') || q.includes('وافدين') || q.includes('للوافدين') ||
    q.includes('أجنبي') || q.includes('أجانب') || q.includes('للأجانب') ||
    q.includes('منح دولية') || q.includes('منحة دولية') ||
    q.includes('منح للمقيم') || q.includes('منحة للمقيم') ||
    q.includes('منح للوافد') || q.includes('لغير القطريين');
}

/**
 * Match non-Qatari generic catch-all (outside scholarship context)
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isNonQatariGeneric(q) {
  return q.includes('غير قطري') || q.includes('غير القطري') || q.includes('غير القطريين') ||
    q.includes('مقيمين') || q.includes('للمقيمين') ||
    q.includes('وافد') || q.includes('وافدين') || q.includes('للوافدين') ||
    q.includes('أجنبي') || q.includes('أجانب') || q.includes('للأجانب') ||
    q.includes('لغير القطريين');
}

/**
 * Match generic scholarship query (for Qataris only, after non-Qatari check)
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isGenericScholarshipQuery(q) {
  return q.includes('منح') || q.includes('ابتعاث') || q.includes('مجان') || q.includes('تمويل');
}

/**
 * Legacy direct Amiri scholarship keywords (without scholarship context)
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isAmiriLegacyQuery(q) {
  return q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد');
}

/**
 * Match scholarship query and return the appropriate response key
 * This is the main entry point for scholarship matching logic
 * @param {string} q - lowercase query
 * @returns {string|null} response key or null if no scholarship match
 */
export function matchScholarship(q) {
  const scholarshipCtx = isScholarshipContext(q);

  // Sponsors list (highest priority)
  if (isSponsorsListQuery(q))
    return 'sponsors_list';

  // Amiri scholarship
  if (isAmiriScholarshipQuery(q, scholarshipCtx))
    return 'scholarship_amiri';

  // External scholarship
  if (isExternalScholarshipQuery(q))
    return 'scholarship_external';

  // Internal scholarship
  if (isInternalScholarshipQuery(q))
    return 'scholarship_internal';

  // QatarEnergy scholarship
  if (isQatarEnergyScholarshipQuery(q, scholarshipCtx))
    return 'scholarship_qatarenergy';

  // Qatar Airways scholarship
  if (isQatarAirwaysScholarshipQuery(q, scholarshipCtx))
    return 'scholarship_qatarairways';

  // QNB scholarship
  if (isQnbScholarshipQuery(q, scholarshipCtx))
    return 'scholarship_qnb';

  // Kahramaa scholarship
  if (isKahramaaScholarshipQuery(q))
    return 'scholarship_kahramaa';

  // Ashghal scholarship
  if (isAshghalScholarshipQuery(q))
    return 'scholarship_ashghal';

  // Nakilat scholarship
  if (isNakilatScholarshipQuery(q, scholarshipCtx))
    return 'scholarship_nakilat';

  // Non-Qatari scholarship (must be before generic catch-all)
  if (isNonQatariScholarshipKeyword(q) && scholarshipCtx)
    return 'scholarship_non_qatari';

  return null;
}
