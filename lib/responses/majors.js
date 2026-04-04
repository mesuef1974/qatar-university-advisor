/**
 * Majors Module — Qatar University Advisor
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يشمل هذا الملف كل ما يتعلق بالتخصصات الأكاديمية ومساراتها:
 * - التخصصات الطبية والصحية
 * - التخصصات الهندسية
 * - تخصصات الأعمال والإدارة
 * - تخصصات العلوم الإنسانية والاجتماعية
 * - تخصصات العلوم البحتة
 * - خطط الدراسة لكل تخصص
 * - الرواتب والوظائف
 * - الرؤية 2030 وتخصصات المستقبل
 * - مهنة التعليم وبرامجها
 */

export const MODULE_NAME = 'majors';
export const MODULE_VERSION = '1.0.0';

// ══════════════════════════════════════════════════════
// Study plan response key constants
// ══════════════════════════════════════════════════════

/** Medical & Health plans */
export const MEDICAL_PLAN_KEYS = ['plan_medicine', 'plan_dentistry', 'plan_pharmacy', 'plan_nursing', 'plan_health_sciences'];

/** Engineering plans */
export const ENGINEERING_PLAN_KEYS = [
  'plan_petroleum', 'plan_civil_eng', 'plan_electrical_eng', 'plan_mechanical_eng',
  'plan_chemical_eng', 'plan_computer_eng', 'plan_industrial_eng', 'plan_mechatronics',
  'plan_engineering_qu',
];

/** Technology plans */
export const TECH_PLAN_KEYS = ['plan_cs', 'plan_mis', 'plan_ai_cmu', 'plan_bio_cmu'];

/** Business plans */
export const BUSINESS_PLAN_KEYS = ['plan_accounting', 'plan_finance', 'plan_marketing'];

/** Humanities plans */
export const HUMANITIES_PLAN_KEYS = ['plan_law', 'plan_sharia', 'plan_education', 'plan_psychology', 'plan_media', 'plan_arabic', 'plan_english'];

/** Science plans */
export const SCIENCE_PLAN_KEYS = ['plan_biology', 'plan_chemistry', 'plan_physics', 'plan_math', 'plan_env_science'];

/** Architecture */
export const ARCHITECTURE_PLAN_KEYS = ['plan_architecture'];

/** All study plan keys */
export const ALL_PLAN_KEYS = [
  ...MEDICAL_PLAN_KEYS,
  ...ENGINEERING_PLAN_KEYS,
  ...TECH_PLAN_KEYS,
  ...BUSINESS_PLAN_KEYS,
  ...HUMANITIES_PLAN_KEYS,
  ...SCIENCE_PLAN_KEYS,
  ...ARCHITECTURE_PLAN_KEYS,
];

/** Other major-related response keys */
export const OTHER_MAJOR_KEYS = [
  'salaries',
  'qatar_vision_2030',
  'reservoir_engineer',
  'thamoon',
  'teach_for_qatar',
  'teaching_career',
  'compare_fees_all',
  'general_military',
];

// ══════════════════════════════════════════════════════
// Study plan context detection
// ══════════════════════════════════════════════════════

/**
 * Detect if query is in study plan context (asking about plans, courses, majors)
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isStudyPlanContext(q) {
  return q.includes('خطة') || q.includes('مواد') || q.includes('كورسات') ||
    q.includes('مقررات') || q.includes('سنة') || q.includes('منهج') ||
    q.includes('تخصص') || q.includes('هندسة') || q.includes('رياضيات') ||
    q.includes('فيزياء') || q.includes('كيمياء') || q.includes('أحياء') || q.includes('بيولوجي');
}

/**
 * Match a study plan within the study plan context
 * Priority-ordered matching for when isStudyPlanContext returns true
 * @param {string} q - lowercase query
 * @returns {string|null} response key or null
 */
export function matchStudyPlan(q) {
  // Existing plans (highest priority within study plans)
  if ((q.includes('طب') && !q.includes('أسنان') && !q.includes('سن ')) || q.includes('medicine'))
    return 'plan_medicine';
  if (q.includes('بترول') || q.includes('petroleum') || q.includes('tamu') || q.includes('تكساس'))
    return 'plan_petroleum';
  if ((q.includes('cs') || q.includes('برمجة')) && (q.includes('cmu') || q.includes('كارنيجي')))
    return 'plan_cs';

  // New extended majors
  if (q.includes('قانون') || q.includes('محامي') || q.includes('محاماة'))
    return 'plan_law';
  if (q.includes('صيدلة') || q.includes('صيدلي') || q.includes('صيدلاني'))
    return 'plan_pharmacy';
  if (q.includes('أسنان') || q.includes('سن ') || q.includes('dental'))
    return 'plan_dentistry';
  if (q.includes('محاسبة') || q.includes('محاسب') || q.includes('cpa') || q.includes('acca'))
    return 'plan_accounting';
  if (q.includes('تمويل') || q.includes('مالي') || q.includes('مالية') || q.includes('cfa') || q.includes('بورصة'))
    return 'plan_finance';
  if (q.includes('تسويق') || q.includes('ماركتينغ') || q.includes('marketing'))
    return 'plan_marketing';
  if (q.includes('نظم معلومات') || q.includes('mis'))
    return 'plan_mis';
  if (q.includes('تمريض') || q.includes('ممرض') || q.includes('nurse'))
    return 'plan_nursing';
  if (q.includes('صحية') || q.includes('صحة عامة') || q.includes('تغذية'))
    return 'plan_health_sciences';
  if (q.includes('تربية') || q.includes('معلم') || q.includes('تعليم'))
    return 'plan_education';
  if (q.includes('شريعة') || q.includes('فقه') || q.includes('إسلامي') || q.includes('دراسات إسلامية'))
    return 'plan_sharia';
  if (q.includes('عربي') || q.includes('لغة عربية') || q.includes('أدب عربي'))
    return 'plan_arabic';
  if (q.includes('إنجليزي') || q.includes('لغة إنجليزية') || q.includes('أدب إنجليزي'))
    return 'plan_english';
  if (q.includes('نفس') || q.includes('سيكولوجي') || q.includes('psychology'))
    return 'plan_psychology';
  if ((q.includes('إعلام') || q.includes('صحافة') || q.includes('اتصال') || q.includes('ميديا')) && !q.includes('نورثوسترن') && !q.includes('northwestern'))
    return 'plan_media';
  if (q.includes('عمارة') || q.includes('معمار') || q.includes('architecture'))
    return 'plan_architecture';
  if (q.includes('مدنية') || q.includes('civil'))
    return 'plan_civil_eng';
  if (q.includes('كهربائية') || q.includes('electrical'))
    return 'plan_electrical_eng';
  if (q.includes('ميكانيكية') || q.includes('mechanical'))
    return 'plan_mechanical_eng';
  if ((q.includes('كيميائية') || q.includes('chemical')) && !q.includes('بترول') && !q.includes('petroleum'))
    return 'plan_chemical_eng';
  if (q.includes('حاسب') || q.includes('كمبيوتر') || q.includes('computer engineering'))
    return 'plan_computer_eng';
  if (q.includes('صناعية') || q.includes('industrial'))
    return 'plan_industrial_eng';
  if (q.includes('ميكاترونكس') || q.includes('mechatronics'))
    return 'plan_mechatronics';
  if (q.includes('أحياء') || q.includes('biology') || q.includes('بيولوجي'))
    return 'plan_biology';
  if (q.includes('كيمياء') || q.includes('chemistry'))
    return 'plan_chemistry';
  if (q.includes('فيزياء') || q.includes('physics'))
    return 'plan_physics';
  if (q.includes('رياضيات') || q.includes('إحصاء') || q.includes('math'))
    return 'plan_math';
  if (q.includes('بيئة') || q.includes('بيئية') || q.includes('environment'))
    return 'plan_env_science';
  if (q.includes('ذكاء اصطناعي') || q.includes('ai') || q.includes('artificial intelligence'))
    return 'plan_ai_cmu';
  if ((q.includes('بيولوجي') || q.includes('علوم بيولوجية')) && (q.includes('cmu') || q.includes('كارنيجي')))
    return 'plan_bio_cmu';

  // Generic fallbacks for study plans
  if (q.includes('هندسة') || q.includes('engineering'))
    return 'plan_engineering_qu';

  return null;
}

/**
 * Match generic topic queries (outside study plan context)
 * These are for when a user mentions a topic without asking about plans specifically
 * @param {string} q - lowercase query
 * @returns {string|null} response key or null
 */
export function matchGenericTopic(q) {
  if (q.includes('قانون') || q.includes('محامي') || q.includes('محاماة'))
    return 'plan_law';
  if (q.includes('صيدلة') || q.includes('صيدلي') || q.includes('صيدلاني'))
    return 'plan_pharmacy';
  if (q.includes('أسنان') || q.includes('dental'))
    return 'plan_dentistry';
  if (q.includes('محاسبة') || q.includes('محاسب') || q.includes('cpa') || q.includes('acca'))
    return 'plan_accounting';
  if (q.includes('تمويل') || q.includes('cfa') || q.includes('بورصة'))
    return 'plan_finance';
  if (q.includes('تسويق') || q.includes('ماركتينغ'))
    return 'plan_marketing';
  if (q.includes('نظم معلومات'))
    return 'plan_mis';
  if (q.includes('تمريض') || q.includes('ممرض'))
    return 'plan_nursing';
  if (q.includes('صحية') || q.includes('صحة عامة') || q.includes('تغذية'))
    return 'plan_health_sciences';
  if (q.includes('شريعة') || q.includes('فقه') || q.includes('دراسات إسلامية'))
    return 'plan_sharia';
  if (q.includes('عمارة') || q.includes('معمار') || q.includes('architecture'))
    return 'plan_architecture';
  if (q.includes('ذكاء اصطناعي') || q.includes('artificial intelligence'))
    return 'plan_ai_cmu';
  if (q.includes('ميكاترونكس') || q.includes('mechatronics'))
    return 'plan_mechatronics';
  if (q.includes('تربية') || (q.includes('معلم') && !q.includes('راتب')))
    return 'plan_education';
  if (q.includes('طب') || q.includes('دكتور') || q.includes('طبيب'))
    return 'plan_medicine';
  if (q.includes('هندسة') || q.includes('مهندس'))
    return 'plan_engineering_qu';
  if (q.includes('نفس') || q.includes('سيكولوجي') || q.includes('psychology'))
    return 'plan_psychology';

  return null;
}

// ══════════════════════════════════════════════════════
// Career and special program matchers
// ══════════════════════════════════════════════════════

/**
 * Match Qatar Vision 2030 query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isVision2030Query(q) {
  return q.includes('رؤية 2030') || q.includes('vision 2030') || q.includes('تخصصات المستقبل');
}

/**
 * Match reservoir engineer query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isReservoirEngineerQuery(q) {
  return q.includes('مكامن') || q.includes('reservoir');
}

/**
 * Match Thamoon program query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isThamoonQuery(q) {
  return q.includes('طموح') || q.includes('10,000 ريال') || (q.includes('معلم') && q.includes('راتب'));
}

/**
 * Match Teach for Qatar query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isTeachForQatarQuery(q) {
  return q.includes('علّم لأجل قطر') || q.includes('علم لأجل قطر') || q.includes('teach for qatar');
}

/**
 * Match teaching career query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isTeachingCareerQuery(q) {
  return q.includes('مهنة التعليم') || q.includes('واقع التعليم') || q.includes('رواتب المعلمين');
}

/**
 * Match salaries and career query
 * @param {string} q - lowercase query
 * @returns {boolean}
 */
export function isSalariesQuery(q) {
  return q.includes('راتب') || q.includes('وظيفة') || q.includes('فرص عمل') ||
    q.includes('توظيف') || (q.includes('مستقبل') && !q.includes('سنة'));
}
