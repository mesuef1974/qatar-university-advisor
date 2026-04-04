/**
 * Universities Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق ببيانات الجامعات القطرية:
 * - جامعة قطر (QU)
 * - المدينة التعليمية (Education City): WCM, CMU, TAMU, GU, NU, VCU
 * - الجامعات الجديدة: UDST, Lusail, HBKU, CCQ, Doha Institute, CUQ, Barzan, QFBA
 * - الكليات العسكرية: ABMMC, Police, Airforce, Naval, Cyber
 * - أكاديمية الطيران (QAA)
 */

export const MODULE_NAME = 'universities';
export const MODULE_VERSION = '1.0.0';

// ══════════════════════════════════════════════════════
// University response key constants
// ══════════════════════════════════════════════════════

/** Education City universities */
export const EC_UNIVERSITIES = ['wcm', 'cmu', 'tamu', 'gu', 'nu', 'vcu'];

/** Qatar University */
export const QU_KEY = 'qu';

/** New universities */
export const NEW_UNIVERSITIES = ['udst', 'lusail', 'hbku', 'ccq', 'doha_institute', 'cuq_ulster', 'barzan', 'qfba'];

/** Military colleges */
export const MILITARY_COLLEGES = ['abmmc', 'police', 'airforce', 'naval', 'cyber'];

/** All university response keys */
export const ALL_UNIVERSITY_KEYS = [
  ...EC_UNIVERSITIES,
  QU_KEY,
  ...NEW_UNIVERSITIES,
  ...MILITARY_COLLEGES,
  'qaa',
  'general_list',
  'general_military',
];

// ══════════════════════════════════════════════════════
// Comparison keys
// ══════════════════════════════════════════════════════
export const COMPARISON_KEYS = [
  'compare_wcm_qu',
  'compare_tamu_qu',
  'compare_cmu_qu',
  'compare_military',
];

// ══════════════════════════════════════════════════════
// University keyword matching helpers
// ══════════════════════════════════════════════════════

/**
 * Match new universities by keyword (before existing university patterns)
 * @param {string} q - normalized lowercase query
 * @returns {string|null} response key or null
 */
export function matchNewUniversity(q) {
  if (q.includes('udst') || q.includes('دوحة للعلوم') || q.includes('جامعة الدوحة'))
    return 'udst';
  if (q.includes('لوسيل') || q.includes('lusail'))
    return 'lusail';
  if (q.includes('hbku') || q.includes('حمد بن خليفة'))
    return 'hbku';
  if (q.includes('كلية المجتمع') || q.includes('ccq') || q.includes('community college'))
    return 'ccq';
  if (q.includes('معهد الدوحة') || q.includes('doha institute'))
    return 'doha_institute';
  if (q.includes('الستر') || q.includes('ulster') || q.includes('cuq'))
    return 'cuq_ulster';
  if (q.includes('برزان') || q.includes('barzan') || q.includes('سوينبرن'))
    return 'barzan';
  if (q.includes('qfba') || q.includes('نورثمبريا') || (q.includes('مال') && q.includes('أعمال') && !q.includes('cmu') && !q.includes('كارنيجي')))
    return 'qfba';
  return null;
}

/**
 * Match Education City and existing universities by keyword
 * @param {string} q - normalized lowercase query
 * @returns {string|null} response key or null
 */
export function matchExistingUniversity(q) {
  if (q.includes('وايل') || q.includes('كورنيل') || q.includes('wcm') || q.includes('cornell'))
    return 'wcm';
  if (q.includes('كارنيجي') || q.includes('كارنيغي') || q.includes('cmu') || q.includes('carnegie'))
    return 'cmu';
  if (q.includes('تكساس') || q.includes('tamu') || q.includes('texas') || q.includes('إي أند أم'))
    return 'tamu';
  if (q.includes('جورجتاون') || q.includes('georgetown'))
    return 'gu';
  if (q.includes('نورثوسترن') || q.includes('northwestern'))
    return 'nu';
  if (q.includes('فرجينيا') || q.includes('vcu') || (q.includes('تصميم') && !q.includes('داخلي')))
    return 'vcu';
  if (q.includes('أكاديمية الطيران') || q.includes('اكاديمية الطيران') || q.includes('qaa'))
    return 'qaa';
  if (q.includes('جامعة قطر') || q.includes('جامعه قطر') || (q.includes('qu') && !q.includes('عسكر')))
    return 'qu';
  return null;
}

/**
 * Match military colleges by keyword
 * @param {string} q - normalized lowercase query
 * @returns {string|null} response key or null
 */
export function matchMilitaryCollege(q) {
  if (q.includes('أحمد بن محمد') || q.includes('احمد بن محمد') || q.includes('abmmc'))
    return 'abmmc';
  if (q.includes('الشرطة') || q.includes('بوليس') || q.includes('police'))
    return 'police';
  if (q.includes('جوية') || q.includes('الجوي') || q.includes('طيار مقاتل') || q.includes('f-16') || q.includes('مقاتل'))
    return 'airforce';
  if (q.includes('بحرية') || q.includes('بحري') || q.includes('الغانم') || q.includes('سفينة') || q.includes('سواحل'))
    return 'naval';
  if (q.includes('سيبراني') || q.includes('سايبر') || q.includes('cyber') || q.includes('اختراق') || q.includes('هاكر'))
    return 'cyber';
  return null;
}

/**
 * Match comparison queries between universities
 * @param {string} q - normalized lowercase query
 * @returns {string|null} response key or null
 */
export function matchComparison(q) {
  if (!(q.includes('مقارن') || q.includes('الفرق') || q.includes('vs') || q.includes('ولا') || q.includes('أيهما')))
    return null;

  if ((q.includes('كورنيل') || q.includes('وايل')) && (q.includes('قطر') || q.includes('qu') || q.includes('طب')))
    return 'compare_wcm_qu';
  if ((q.includes('تكساس') || q.includes('tamu')) && (q.includes('هندسة') || q.includes('qu') || q.includes('قطر')))
    return 'compare_tamu_qu';
  if ((q.includes('كارنيجي') || q.includes('cmu')) && (q.includes('حاسب') || q.includes('qu') || q.includes('قطر')))
    return 'compare_cmu_qu';
  if (q.includes('عسكري') || q.includes('كليات الخمس') || q.includes('خمس كليات'))
    return 'compare_military';

  return null;
}

/**
 * Match TAMU closing query
 * @param {string} q - normalized lowercase query
 * @returns {boolean}
 */
export function isTamuClosingQuery(q) {
  return (q.includes('تكساس') || q.includes('tamu')) &&
    (q.includes('إغلاق') || q.includes('اغلاق') || q.includes('2028') || q.includes('يقفل') || q.includes('يسكر'));
}

/**
 * Match Qatari vs non-Qatari query (outside scholarship context)
 * @param {string} q - normalized lowercase query
 * @returns {boolean}
 */
export function isQatariVsNonQatariQuery(q) {
  return (q.includes('قطري') && q.includes('غير قطري')) ||
    (q.includes('مقيم') && q.includes('قطري')) ||
    q.includes('مقيم vs قطري');
}

/**
 * Match general university list query
 * @param {string} q - normalized lowercase query
 * @returns {boolean}
 */
export function isUniversityListQuery(q) {
  return q.includes('جامعات') || q.includes('خيارات') || q.includes('متاح') ||
    q.includes('كل الجامعات') || q.includes('قائمة');
}

/**
 * Match general military query
 * @param {string} q - normalized lowercase query
 * @returns {boolean}
 */
export function isGeneralMilitaryQuery(q) {
  return q.includes('عسكري') || q.includes('جيش') || q.includes('ضابط') ||
    q.includes('ملازم') || q.includes('القوات');
}

/**
 * Match aviation general query
 * @param {string} q - normalized lowercase query
 * @returns {boolean}
 */
export function isAviationQuery(q) {
  return q.includes('طيران') || q.includes('طيار') || q.includes('خطوط قطرية');
}

/**
 * Match media/journalism general query (not Northwestern specific)
 * @param {string} q - normalized lowercase query
 * @returns {boolean}
 */
export function isMediaQuery(q) {
  return q.includes('إعلام') || q.includes('صحافة') || q.includes('اتصال') || q.includes('ميديا');
}
