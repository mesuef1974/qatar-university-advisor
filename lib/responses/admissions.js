/**
 * Admissions Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق بشروط القبول والتقديم:
 * - شروط القبول العامة ومتطلبات المعدل
 * - التقديم لطلاب الصف 10/11 (مبكر)
 * - حالات الرفض وطرق التعامل معها
 * - طلاب من خارج قطر
 * - الجنسية المزدوجة
 * - تحويل بين الجامعات
 * - القيود الجندرية
 * - الاعتمادية الدولية
 * - مواعيد التقديم
 * - اختبارات SAT / IELTS / TOEFL
 * - متطلبات اللياقة البدنية العسكرية
 * - متطلبات النظر
 */

export const MODULE_NAME = 'admissions';
export const MODULE_VERSION = '1.0.0';

// ══════════════════════════════════════════════════════
// Admissions response key constants
// ══════════════════════════════════════════════════════
export const ADMISSIONS_KEYS = [
  'grade_10_11_early',
  'rejection_advice',
  'outside_qatar_student',
  'dual_nationality',
  'university_transfer',
  'gender_restrictions',
  'international_accreditation',
  'deadlines',
  'sat_guide',
  'ielts_guide',
  'eye_vision',
  'fitness_military',
  'compare_requirements_all',
];

// ══════════════════════════════════════════════════════
// Qatari dialect normalization map
// ══════════════════════════════════════════════════════
export const QATARI_DIALECT_MAP = {
  'وين': 'أين', 'شو': 'ما', 'ليش': 'لماذا', 'كيفك': 'كيف حالك',
  'يعني': 'أي', 'زين': 'جيد', 'عاد': 'بعد', 'هاه': 'نعم',
  'ايش': 'ماذا', 'شلون': 'كيف', 'بس': 'فقط', 'واجد': 'كثير',
  'مره': 'جداً', 'حلو': 'جيد', 'يبي': 'يريد', 'أبي': 'أريد',
  'ابغى': 'أريد', 'بغيت': 'أردت', 'تبي': 'تريد', 'ما عندي': 'ليس لدي',
  'أبغى أدرس': 'أريد أن أدرس', 'وش': 'ماذا', 'قداه': 'كم',
  'سواء': 'مساواة', 'صح': 'صحيح', 'خلاص': 'انتهى',
};

/**
 * Normalize Qatari dialect to formal Arabic
 * @param {string} q - lowercase query
 * @returns {string} normalized query
 */
export function normalizeQatariDialect(q) {
  let normalized = q;
  Object.entries(QATARI_DIALECT_MAP).forEach(([dialect, formal]) => {
    normalized = normalized.replace(new RegExp(dialect, 'g'), formal);
  });
  return normalized;
}

// ══════════════════════════════════════════════════════
// Admissions keyword matching helpers
// ══════════════════════════════════════════════════════

/**
 * Match grade 10/11 early inquiry
 * @param {string} normalizedQ - normalized lowercase query
 * @returns {boolean}
 */
export function isGrade10or11Query(normalizedQ) {
  return normalizedQ.includes('صف 10') || normalizedQ.includes('صف عاشر') || normalizedQ.includes('الصف العاشر') ||
    normalizedQ.includes('صف 11') || normalizedQ.includes('الحادي عشر') || normalizedQ.includes('صف حادي عشر') ||
    (normalizedQ.includes('ثاني') && normalizedQ.includes('عشر') && normalizedQ.includes('قبل')) ||
    normalizedQ.includes('سنة أولى ثانوي') || normalizedQ.includes('سنة ثانية ثانوي');
}

/**
 * Match rejection advice query
 * @param {string} normalizedQ - normalized lowercase query
 * @returns {boolean}
 */
export function isRejectionQuery(normalizedQ) {
  return normalizedQ.includes('رفض') || normalizedQ.includes('لم أقبل') || normalizedQ.includes('ما قبلوني') ||
    normalizedQ.includes('ما قبلت') || normalizedQ.includes('رُفض') || normalizedQ.includes('رفضت') ||
    normalizedQ.includes('لم يقبلوني') || normalizedQ.includes('ما وصلتني قبول');
}

/**
 * Match outside Qatar student query
 * @param {string} normalizedQ - normalized lowercase query
 * @returns {boolean}
 */
export function isOutsideQatarQuery(normalizedQ) {
  return (normalizedQ.includes('من خارج قطر') || normalizedQ.includes('أقيم خارج') || normalizedQ.includes('لست في قطر') ||
    normalizedQ.includes('أسكن خارج') || normalizedQ.includes('دولة أخرى') || normalizedQ.includes('هجرت') ||
    normalizedQ.includes('ما في قطر') || normalizedQ.includes('خارج البلد')) &&
    (normalizedQ.includes('أدرس') || normalizedQ.includes('أتقدم') || normalizedQ.includes('قبول') || normalizedQ.includes('جامعة'));
}

/**
 * Match dual nationality query
 * @param {string} normalizedQ - normalized lowercase query
 * @returns {boolean}
 */
export function isDualNationalityQuery(normalizedQ) {
  return normalizedQ.includes('جنسيتين') || normalizedQ.includes('جنسية مزدوجة') ||
    (normalizedQ.includes('قطري') && normalizedQ.includes('أجنبي') && normalizedQ.includes('أم')) ||
    (normalizedQ.includes('أب قطري') && (normalizedQ.includes('أم') || normalizedQ.includes('والدة'))) ||
    (normalizedQ.includes('أم قطرية') && normalizedQ.includes('أب')) ||
    normalizedQ.includes('نصفه قطري') || normalizedQ.includes('نصفها قطرية');
}

/**
 * Match university transfer query
 * @param {string} normalizedQ - normalized lowercase query
 * @returns {boolean}
 */
export function isTransferQuery(normalizedQ) {
  return normalizedQ.includes('تحويل') || normalizedQ.includes('أنتقل') || normalizedQ.includes('أغير الجامعة') ||
    normalizedQ.includes('انتقال') || normalizedQ.includes('نقل قيد') || normalizedQ.includes('تغيير جامعة') ||
    (normalizedQ.includes('أترك') && normalizedQ.includes('جامعة')) || normalizedQ.includes('أحول');
}

/**
 * Match gender restrictions query
 * @param {string} normalizedQ - normalized lowercase query
 * @returns {boolean}
 */
export function isGenderRestrictionsQuery(normalizedQ) {
  return normalizedQ.includes('بنات') || normalizedQ.includes('إناث') || normalizedQ.includes('فتيات') ||
    normalizedQ.includes('ذكور') || normalizedQ.includes('رجال') || normalizedQ.includes('مختلط') ||
    normalizedQ.includes('للبنات فقط') || normalizedQ.includes('للأولاد') || normalizedQ.includes('جنسين') ||
    (normalizedQ.includes('فتاة') && normalizedQ.includes('تقدم')) || (normalizedQ.includes('بنت') && normalizedQ.includes('تقدم'));
}

/**
 * Match international accreditation query (excluding scholarship context)
 * @param {string} normalizedQ - normalized lowercase query
 * @returns {boolean}
 */
export function isAccreditationQuery(normalizedQ) {
  return normalizedQ.includes('معترف') || normalizedQ.includes('اعتماد') || normalizedQ.includes('دولي') ||
    normalizedQ.includes('خارج قطر') || normalizedQ.includes('أكمل دراستي') || normalizedQ.includes('ماجستير في الخارج') ||
    (normalizedQ.includes('شهادة') && (normalizedQ.includes('صالح') || normalizedQ.includes('تُعترف') || normalizedQ.includes('مقبولة')));
}

/**
 * Match SAT guide query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isSatQuery(q) {
  return q.includes('sat') || q.includes('اس ايه تي') || q.includes('اختبار قبول دولي');
}

/**
 * Match IELTS/TOEFL guide query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isIeltsQuery(q) {
  return q.includes('ielts') || q.includes('toefl') || q.includes('توفل') ||
    q.includes('آيلتس') || q.includes('لغة إنجليزية');
}

/**
 * Match eye vision requirements query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isEyeVisionQuery(q) {
  return q.includes('نظر') || q.includes('عيون') || q.includes('نظارة') ||
    q.includes('عدسات') || q.includes('6/6') || q.includes('lasik') || q.includes('ليزك');
}

/**
 * Match military fitness requirements query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isFitnessMilitaryQuery(q) {
  return (q.includes('لياقة') || q.includes('اختبار بدني') || q.includes('جري') || q.includes('ضغط')) &&
    (q.includes('عسكري') || q.includes('كلية') || q.includes('شرطة'));
}

/**
 * Match deadlines/application dates query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isDeadlinesQuery(q) {
  return q.includes('موعد') || q.includes('تقديم') ||
    (q.includes('متى') && q.includes('يفتح')) || q.includes('تسجيل');
}

/**
 * Match multi-criteria comparison query
 * @param {string} q - lowercase query
 * @returns {string|null} response key or null
 */
export function matchMultiComparison(q) {
  if (!(q.includes('قارن') || (q.includes('مقارنة') && (q.includes('ثلاث') || q.includes('كل') || q.includes('أفضل')))))
    return null;

  if ((q.includes('رسوم') || q.includes('تكلفة') || q.includes('مصاريف')) && q.includes('كل الجامعات'))
    return 'compare_fees_all';
  if (q.includes('قبول') || q.includes('معدل') || q.includes('شروط'))
    return 'compare_requirements_all';

  return null;
}

/**
 * Extract grade from query and return grade info if valid
 * @param {string} q - lowercase query
 * @returns {{ grade: number, track: string|null }|null}
 */
export function extractGrade(q) {
  const gm = q.match(/(\d{2,3})\s*%?/);
  if (gm && (q.includes('%') || q.includes('معدل') || /^\d{2,3}$/.test(q.trim()))) {
    const g = parseInt(gm[1]);
    if (g >= 50 && g <= 100) {
      const track = q.includes('علمي') ? 'علمي' : q.includes('أدبي') || q.includes('ادبي') ? 'أدبي' : null;
      return { grade: g, track };
    }
  }
  return null;
}

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
 * Detect non-Qatari keyword in query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isNonQatariKeyword(q) {
  return q.includes('غير قطري') || q.includes('غير القطري') || q.includes('غير القطريين') ||
    q.includes('مقيم') || q.includes('للمقيمين') || q.includes('مقيمين') ||
    q.includes('وافد') || q.includes('وافدين') || q.includes('للوافدين') ||
    q.includes('أجنبي') || q.includes('أجانب') || q.includes('للأجانب') ||
    q.includes('منح دولية') || q.includes('منحة دولية') ||
    q.includes('منح للمقيم') || q.includes('منحة للمقيم') ||
    q.includes('منح للوافد') || q.includes('لغير القطريين');
}

/**
 * Detect greeting in query
 * @param {string} q - lowercase trimmed query
 * @returns {boolean}
 */
export function isGreeting(q) {
  return q.includes('مرحبا') || q.includes('هلا') || q.includes('السلام') ||
    q.includes('اهلا') || q.includes('هاي') || q === 'hi' || q === 'hello';
}
