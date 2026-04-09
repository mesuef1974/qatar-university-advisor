/**
 * findResponse — Qatar University Advisor (TypeScript)
 * ═══════════════════════════════════════════════════════
 * Main message processing pipeline: sanitize, profile, search, AI fallback
 */

import type { BotResponse } from '../types/index.js';
import type { UserProfile } from './user-profiler.js';

// ──────────────────────────────────────────────────────────
// External JS module imports — typed via companion .d.ts files
// ──────────────────────────────────────────────────────────

import { ALL_RESPONSES, CAREER_TEST } from './responses.js';
import { getAIResponse } from './ai-handler';
import { sanitizeInput, getInjectionResponse } from './sanitizer';
import { addNationalityContext } from './nationality-advisor.js';
import { getFromKnowledgeBase, saveToKnowledgeCache, semanticSearch } from './knowledge-base.js';
import { STAGES, getNextStage, getStagePrompt, generateFinalReport, isConversationComplete } from './conversation-state.js';
import {
  buildUserProfile,
  buildProfileContext,
  getWelcomeMessage,
  getNextProfilingQuestion,
  generateSmartSuggestions,
  getInMemoryProfile,
  saveInMemoryProfile,
  USER_TYPES,
} from './user-profiler.js';
import {
  getOrCreateUser,
  getConversationHistory,
  saveMessage,
  updateUserProfile,
  saveUserProfileData,
  getUserProfileData,
} from './supabase';

// ──────────────────────────────────────────────────────────
// Internal Types
// ──────────────────────────────────────────────────────────

/** Result from the findResponse keyword matcher */
interface FindResult {
  type: 'response' | 'grade' | 'greeting' | 'unknown';
  key?: string;
  grade?: number;
  track?: string | null;
}

/** Profile shape used throughout processing (extends UserProfile for compatibility) */
interface ProcessingProfile extends Partial<UserProfile> {
  gpa?: number | null;
  preferredMajor?: string | null;
  messageCount?: number;
  conversationStage?: string;
}

/** Conversation history entry for AI */
interface HistoryEntry {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

/** Response with text and optional suggestions */
interface ResponseWithSuggestions {
  text: string;
  suggestions: string[];
  source?: string;
  similarity?: number;
}

// ──────────────────────────────────────────────────────────
// Qatari dialect map — imported from shared source
// ──────────────────────────────────────────────────────────
import { qatariDialect } from './dialect-map.js';

// ──────────────────────────────────────────────────────────
// findResponse — keyword-based matching
// ──────────────────────────────────────────────────────────

/**
 * Find the best response for a user message via keyword matching.
 * This is a large pattern-matching function ported from JS.
 */
function findResponse(text: string): FindResult {
  const q: string = text.toLowerCase().trim();

  // S-010: ترجمة العامية القطرية → الفصحى
  let normalizedQ: string = q;
  Object.entries(qatariDialect).forEach(([dialect, formal]) => {
    normalizedQ = normalizedQ.replace(new RegExp(dialect, 'g'), formal);
  });

  // S-001: طالب صف 10/11
  if (normalizedQ.includes('صف 10') || normalizedQ.includes('صف عاشر') || normalizedQ.includes('الصف العاشر') ||
      normalizedQ.includes('صف 11') || normalizedQ.includes('الحادي عشر') || normalizedQ.includes('صف حادي عشر') ||
      (normalizedQ.includes('ثاني') && normalizedQ.includes('عشر') && normalizedQ.includes('قبل')) ||
      normalizedQ.includes('سنة أولى ثانوي') || normalizedQ.includes('سنة ثانية ثانوي')) {
    return { type: 'response', key: 'grade_10_11_early' };
  }

  // S-002: رفض القبول
  if (normalizedQ.includes('رفض') || normalizedQ.includes('لم أقبل') || normalizedQ.includes('ما قبلوني') ||
      normalizedQ.includes('ما قبلت') || normalizedQ.includes('رُفض') || normalizedQ.includes('رفضت') ||
      normalizedQ.includes('لم يقبلوني') || normalizedQ.includes('ما وصلتني قبول')) {
    return { type: 'response', key: 'rejection_advice' };
  }

  // S-003: طالب من خارج قطر
  if ((normalizedQ.includes('من خارج قطر') || normalizedQ.includes('أقيم خارج') || normalizedQ.includes('لست في قطر') ||
       normalizedQ.includes('أسكن خارج') || normalizedQ.includes('دولة أخرى') || normalizedQ.includes('هجرت') ||
       normalizedQ.includes('ما في قطر') || normalizedQ.includes('خارج البلد')) &&
      (normalizedQ.includes('أدرس') || normalizedQ.includes('أتقدم') || normalizedQ.includes('قبول') || normalizedQ.includes('جامعة'))) {
    return { type: 'response', key: 'outside_qatar_student' };
  }

  // S-004: جنسية مزدوجة
  if (normalizedQ.includes('جنسيتين') || normalizedQ.includes('جنسية مزدوجة') ||
      (normalizedQ.includes('قطري') && normalizedQ.includes('أجنبي') && normalizedQ.includes('أم')) ||
      (normalizedQ.includes('أب قطري') && (normalizedQ.includes('أم') || normalizedQ.includes('والدة'))) ||
      (normalizedQ.includes('أم قطرية') && normalizedQ.includes('أب')) ||
      normalizedQ.includes('نصفه قطري') || normalizedQ.includes('نصفها قطرية')) {
    return { type: 'response', key: 'dual_nationality' };
  }

  // S-005: تحويل بين الجامعات
  if (normalizedQ.includes('تحويل') || normalizedQ.includes('أنتقل') || normalizedQ.includes('أغير الجامعة') ||
      normalizedQ.includes('انتقال') || normalizedQ.includes('نقل قيد') || normalizedQ.includes('تغيير جامعة') ||
      (normalizedQ.includes('أترك') && normalizedQ.includes('جامعة')) || normalizedQ.includes('أحول')) {
    return { type: 'response', key: 'university_transfer' };
  }

  // S-007: قيود جندرية
  if (normalizedQ.includes('بنات') || normalizedQ.includes('إناث') || normalizedQ.includes('فتيات') ||
      normalizedQ.includes('ذكور') || normalizedQ.includes('رجال') || normalizedQ.includes('مختلط') ||
      normalizedQ.includes('للبنات فقط') || normalizedQ.includes('للأولاد') || normalizedQ.includes('جنسين') ||
      (normalizedQ.includes('فتاة') && normalizedQ.includes('تقدم')) || (normalizedQ.includes('بنت') && normalizedQ.includes('تقدم'))) {
    return { type: 'response', key: 'gender_restrictions' };
  }

  // --- Helper: scholarship context detection ---
  const isScholarshipContext: boolean = q.includes('منح') || q.includes('ابتعاث') || q.includes('بعثة') || q.includes('سبونسر') || q.includes('راعي') || q.includes('رعاية');

  // S-008: اعتمادية دولية
  if (!isScholarshipContext && (normalizedQ.includes('معترف') || normalizedQ.includes('اعتماد') || normalizedQ.includes('دولي') ||
      normalizedQ.includes('خارج قطر') || normalizedQ.includes('أكمل دراستي') || normalizedQ.includes('ماجستير في الخارج') ||
      (normalizedQ.includes('شهادة') && (normalizedQ.includes('صالح') || normalizedQ.includes('تُعترف') || normalizedQ.includes('مقبولة'))))) {
    return { type: 'response', key: 'international_accreditation' };
  }

  // --- Comparisons ---
  if (q.includes('مقارن') || q.includes('الفرق') || q.includes('vs') || q.includes('ولا') || q.includes('أيهما')) {
    if ((q.includes('كورنيل') || q.includes('وايل')) && (q.includes('قطر') || q.includes('qu') || q.includes('طب')))
      return { type: 'response', key: 'compare_wcm_qu' };
    if ((q.includes('تكساس') || q.includes('tamu')) && (q.includes('هندسة') || q.includes('qu') || q.includes('قطر')))
      return { type: 'response', key: 'compare_tamu_qu' };
    if ((q.includes('كارنيجي') || q.includes('cmu')) && (q.includes('حاسب') || q.includes('qu') || q.includes('قطر')))
      return { type: 'response', key: 'compare_cmu_qu' };
    if (q.includes('عسكري') || q.includes('كليات الخمس') || q.includes('خمس كليات'))
      return { type: 'response', key: 'compare_military' };
  }

  // S-006: مقارنة متعددة المعايير
  if (q.includes('قارن') || (q.includes('مقارنة') && (q.includes('ثلاث') || q.includes('كل') || q.includes('أفضل')))) {
    if ((q.includes('رسوم') || q.includes('تكلفة') || q.includes('مصاريف')) && q.includes('كل الجامعات'))
      return { type: 'response', key: 'compare_fees_all' };
    if (q.includes('قبول') || q.includes('معدل') || q.includes('شروط'))
      return { type: 'response', key: 'compare_requirements_all' };
  }

  // --- Qatari vs non-Qatari ---
  if (((q.includes('قطري') && q.includes('غير قطري')) || (q.includes('مقيم') && q.includes('قطري')) || q.includes('مقيم vs قطري')) && !isScholarshipContext)
    return { type: 'response', key: 'qatari_vs_non_qatari' };

  // --- TAMU closing ---
  if ((q.includes('تكساس') || q.includes('tamu')) && (q.includes('إغلاق') || q.includes('اغلاق') || q.includes('2028') || q.includes('يقفل') || q.includes('يسكر')))
    return { type: 'response', key: 'tamu_closing' };

  // --- Qatar Vision 2030 ---
  if (q.includes('رؤية 2030') || q.includes('vision 2030') || q.includes('تخصصات المستقبل'))
    return { type: 'response', key: 'qatar_vision_2030' };

  if (q.includes('مكامن') || q.includes('reservoir'))
    return { type: 'response', key: 'reservoir_engineer' };

  // ══ Scholarship patterns ══

  if (q.includes('سبونسر') || q.includes('جهات راعية') || (q.includes('راعي') && !q.includes('عسكري')) || (q.includes('رعاية') && (q.includes('دراس') || q.includes('جامع'))))
    return { type: 'response', key: 'sponsors_list' };
  if (q.includes('أميري') || q.includes('البعثة الأميرية') || q.includes('ابتعاث أميري'))
    return { type: 'response', key: 'scholarship_amiri' };
  if (isScholarshipContext && (q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد') || q.includes('كامبريدج')))
    return { type: 'response', key: 'scholarship_amiri' };
  if (q.includes('ابتعاث خارجي') || (q.includes('دراسة') && q.includes('في الخارج')) || (q.includes('ابتعاث') && q.includes('خارج')))
    return { type: 'response', key: 'scholarship_external' };
  if (q.includes('ابتعاث داخلي'))
    return { type: 'response', key: 'scholarship_internal' };
  if (isScholarshipContext && (q.includes('قطر للطاقة') || q.includes('قطبك') || q.includes('qatarenergy')))
    return { type: 'response', key: 'scholarship_qatarenergy' };
  if (q.includes('قطبك') && !q.includes('هندسة'))
    return { type: 'response', key: 'scholarship_qatarenergy' };
  if (isScholarshipContext && (q.includes('خطوط قطرية') || q.includes('qatar airways') || q.includes('الدرب')))
    return { type: 'response', key: 'scholarship_qatarairways' };
  if (isScholarshipContext && (q.includes('qnb') || q.includes('بنك قطر الوطني')))
    return { type: 'response', key: 'scholarship_qnb' };
  if (q.includes('كهرماء') || q.includes('kahramaa'))
    return { type: 'response', key: 'scholarship_kahramaa' };
  if (q.includes('أشغال') || q.includes('اشغال') || q.includes('ashghal'))
    return { type: 'response', key: 'scholarship_ashghal' };
  if (q.includes('ناقلات') || q.includes('nakilat') || (isScholarshipContext && q.includes('بحري')))
    return { type: 'response', key: 'scholarship_nakilat' };

  // Non-Qatari scholarships
  const isNonQatariKeyword: boolean =
    q.includes('غير قطري') || q.includes('غير القطري') || q.includes('غير القطريين') ||
    q.includes('مقيم') || q.includes('للمقيمين') || q.includes('مقيمين') ||
    q.includes('وافد') || q.includes('وافدين') || q.includes('للوافدين') ||
    q.includes('أجنبي') || q.includes('أجانب') || q.includes('للأجانب') ||
    q.includes('منح دولية') || q.includes('منحة دولية') ||
    q.includes('منح للمقيم') || q.includes('منحة للمقيم') ||
    q.includes('منح للوافد') || q.includes('لغير القطريين');
  if (isNonQatariKeyword && isScholarshipContext)
    return { type: 'response', key: 'scholarship_non_qatari' };

  // ══ Study plans ══
  if (q.includes('خطة') || q.includes('مواد') || q.includes('كورسات') || q.includes('مقررات') || q.includes('سنة') || q.includes('منهج') || q.includes('تخصص') || q.includes('هندسة') || q.includes('رياضيات') || q.includes('فيزياء') || q.includes('كيمياء') || q.includes('أحياء') || q.includes('بيولوجي')) {
    if ((q.includes('طب') && !q.includes('أسنان') && !q.includes('سن ')) || q.includes('medicine')) return { type: 'response', key: 'plan_medicine' };
    if (q.includes('بترول') || q.includes('petroleum') || q.includes('tamu') || q.includes('تكساس'))
      return { type: 'response', key: 'plan_petroleum' };
    if ((q.includes('cs') || q.includes('برمجة')) && (q.includes('cmu') || q.includes('كارنيجي')))
      return { type: 'response', key: 'plan_cs' };
    if (q.includes('قانون') || q.includes('محامي') || q.includes('محاماة'))
      return { type: 'response', key: 'plan_law' };
    if (q.includes('صيدلة') || q.includes('صيدلي') || q.includes('صيدلاني'))
      return { type: 'response', key: 'plan_pharmacy' };
    if (q.includes('أسنان') || q.includes('سن ') || q.includes('dental'))
      return { type: 'response', key: 'plan_dentistry' };
    if (q.includes('محاسبة') || q.includes('محاسب') || q.includes('cpa') || q.includes('acca'))
      return { type: 'response', key: 'plan_accounting' };
    if (q.includes('تمويل') || q.includes('مالي') || q.includes('مالية') || q.includes('cfa') || q.includes('بورصة'))
      return { type: 'response', key: 'plan_finance' };
    if (q.includes('تسويق') || q.includes('ماركتينغ') || q.includes('marketing'))
      return { type: 'response', key: 'plan_marketing' };
    if (q.includes('نظم معلومات') || q.includes('mis'))
      return { type: 'response', key: 'plan_mis' };
    if (q.includes('تمريض') || q.includes('ممرض') || q.includes('nurse'))
      return { type: 'response', key: 'plan_nursing' };
    if (q.includes('صحية') || q.includes('صحة عامة') || q.includes('تغذية'))
      return { type: 'response', key: 'plan_health_sciences' };
    if (q.includes('تربية') || q.includes('معلم') || q.includes('تعليم'))
      return { type: 'response', key: 'plan_education' };
    if (q.includes('شريعة') || q.includes('فقه') || q.includes('إسلامي') || q.includes('دراسات إسلامية'))
      return { type: 'response', key: 'plan_sharia' };
    if (q.includes('عربي') || q.includes('لغة عربية') || q.includes('أدب عربي'))
      return { type: 'response', key: 'plan_arabic' };
    if (q.includes('إنجليزي') || q.includes('لغة إنجليزية') || q.includes('أدب إنجليزي'))
      return { type: 'response', key: 'plan_english' };
    if (q.includes('نفس') || q.includes('سيكولوجي') || q.includes('psychology'))
      return { type: 'response', key: 'plan_psychology' };
    if ((q.includes('إعلام') || q.includes('صحافة') || q.includes('اتصال') || q.includes('ميديا')) && !q.includes('نورثوسترن') && !q.includes('northwestern'))
      return { type: 'response', key: 'plan_media' };
    if (q.includes('عمارة') || q.includes('معمار') || q.includes('architecture'))
      return { type: 'response', key: 'plan_architecture' };
    if (q.includes('مدنية') || q.includes('civil'))
      return { type: 'response', key: 'plan_civil_eng' };
    if (q.includes('كهربائية') || q.includes('electrical'))
      return { type: 'response', key: 'plan_electrical_eng' };
    if (q.includes('ميكانيكية') || q.includes('mechanical'))
      return { type: 'response', key: 'plan_mechanical_eng' };
    if ((q.includes('كيميائية') || q.includes('chemical')) && !q.includes('بترول') && !q.includes('petroleum'))
      return { type: 'response', key: 'plan_chemical_eng' };
    if (q.includes('حاسب') || q.includes('كمبيوتر') || q.includes('computer engineering'))
      return { type: 'response', key: 'plan_computer_eng' };
    if (q.includes('صناعية') || q.includes('industrial'))
      return { type: 'response', key: 'plan_industrial_eng' };
    if (q.includes('ميكاترونكس') || q.includes('mechatronics'))
      return { type: 'response', key: 'plan_mechatronics' };
    if (q.includes('أحياء') || q.includes('biology') || q.includes('بيولوجي'))
      return { type: 'response', key: 'plan_biology' };
    if (q.includes('كيمياء') || q.includes('chemistry'))
      return { type: 'response', key: 'plan_chemistry' };
    if (q.includes('فيزياء') || q.includes('physics'))
      return { type: 'response', key: 'plan_physics' };
    if (q.includes('رياضيات') || q.includes('إحصاء') || q.includes('math'))
      return { type: 'response', key: 'plan_math' };
    if (q.includes('بيئة') || q.includes('بيئية') || q.includes('environment'))
      return { type: 'response', key: 'plan_env_science' };
    if (q.includes('ذكاء اصطناعي') || q.includes('ai') || q.includes('artificial intelligence'))
      return { type: 'response', key: 'plan_ai_cmu' };
    if ((q.includes('بيولوجي') || q.includes('علوم بيولوجية')) && (q.includes('cmu') || q.includes('كارنيجي')))
      return { type: 'response', key: 'plan_bio_cmu' };
    if (q.includes('هندسة') || q.includes('engineering'))
      return { type: 'response', key: 'plan_engineering_qu' };
  }

  // ══ Teaching ══
  if (q.includes('علّم لأجل قطر') || q.includes('علم لأجل قطر') || q.includes('teach for qatar'))
    return { type: 'response', key: 'teach_for_qatar' };
  if (q.includes('مهنة التعليم') || q.includes('واقع التعليم') || q.includes('رواتب المعلمين'))
    return { type: 'response', key: 'teaching_career' };

  // ══ Universities by name ══
  if (q.includes('udst') || q.includes('دوحة للعلوم') || q.includes('جامعة الدوحة'))
    return { type: 'response', key: 'udst' };
  if (q.includes('لوسيل') || q.includes('lusail'))
    return { type: 'response', key: 'lusail' };
  if (q.includes('hbku') || q.includes('حمد بن خليفة'))
    return { type: 'response', key: 'hbku' };
  if (q.includes('كلية المجتمع') || q.includes('ccq') || q.includes('community college'))
    return { type: 'response', key: 'ccq' };
  if (q.includes('معهد الدوحة') || q.includes('doha institute'))
    return { type: 'response', key: 'doha_institute' };
  if (q.includes('الستر') || q.includes('ulster') || q.includes('cuq'))
    return { type: 'response', key: 'cuq_ulster' };
  if (q.includes('برزان') || q.includes('barzan') || q.includes('سوينبرن'))
    return { type: 'response', key: 'barzan' };
  if (q.includes('qfba') || q.includes('نورثمبريا') || (q.includes('مال') && q.includes('أعمال') && !q.includes('cmu') && !q.includes('كارنيجي')))
    return { type: 'response', key: 'qfba' };

  if (q.includes('وايل') || q.includes('كورنيل') || q.includes('wcm') || q.includes('cornell'))
    return { type: 'response', key: 'wcm' };
  if (q.includes('كارنيجي') || q.includes('كارنيغي') || q.includes('cmu') || q.includes('carnegie'))
    return { type: 'response', key: 'cmu' };
  if (q.includes('تكساس') || q.includes('tamu') || q.includes('texas') || q.includes('إي أند أم'))
    return { type: 'response', key: 'tamu' };
  if (q.includes('جورجتاون') || q.includes('georgetown'))
    return { type: 'response', key: 'gu' };
  if (q.includes('نورثوسترن') || q.includes('northwestern'))
    return { type: 'response', key: 'nu' };
  if (q.includes('فرجينيا') || q.includes('vcu') || (q.includes('تصميم') && !q.includes('داخلي')))
    return { type: 'response', key: 'vcu' };
  if (q.includes('أكاديمية الطيران') || q.includes('اكاديمية الطيران') || q.includes('qaa'))
    return { type: 'response', key: 'qaa' };
  if (q.includes('جامعة قطر') || q.includes('جامعه قطر') || (q.includes('qu') && !q.includes('عسكر')))
    return { type: 'response', key: 'qu' };

  // Military colleges
  if (q.includes('أحمد بن محمد') || q.includes('احمد بن محمد') || q.includes('abmmc'))
    return { type: 'response', key: 'abmmc' };
  if (q.includes('الشرطة') || q.includes('بوليس') || q.includes('police'))
    return { type: 'response', key: 'police' };
  if (q.includes('جوية') || q.includes('الجوي') || q.includes('طيار مقاتل') || q.includes('f-16') || q.includes('مقاتل'))
    return { type: 'response', key: 'airforce' };
  if (q.includes('بحرية') || q.includes('بحري') || q.includes('الغانم') || q.includes('سفينة') || q.includes('سواحل'))
    return { type: 'response', key: 'naval' };
  if (q.includes('سيبراني') || q.includes('سايبر') || q.includes('cyber') || q.includes('اختراق') || q.includes('هاكر'))
    return { type: 'response', key: 'cyber' };

  // SAT / IELTS
  if (q.includes('sat') || q.includes('اس ايه تي') || q.includes('اختبار قبول دولي'))
    return { type: 'response', key: 'sat_guide' };
  if (q.includes('ielts') || q.includes('toefl') || q.includes('توفل') || q.includes('آيلتس') || q.includes('لغة إنجليزية'))
    return { type: 'response', key: 'ielts_guide' };

  if (q.includes('نظر') || q.includes('عيون') || q.includes('نظارة') || q.includes('عدسات') || q.includes('6/6') || q.includes('lasik') || q.includes('ليزك'))
    return { type: 'response', key: 'eye_vision' };
  if (q.includes('طموح') || q.includes('10,000 ريال') || (q.includes('معلم') && q.includes('راتب')))
    return { type: 'response', key: 'thamoon' };
  if (q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد'))
    return { type: 'response', key: 'scholarship_amiri' };

  if ((q.includes('لياقة') || q.includes('اختبار بدني') || q.includes('جري') || q.includes('ضغط')) && (q.includes('عسكري') || q.includes('كلية') || q.includes('شرطة')))
    return { type: 'response', key: 'fitness_military' };
  if (q.includes('مقارنة') && q.includes('عسكري'))
    return { type: 'response', key: 'compare_military' };

  if (q.includes('راتب') || q.includes('وظيفة') || q.includes('فرص عمل') || q.includes('توظيف') || (q.includes('مستقبل') && !q.includes('سنة')))
    return { type: 'response', key: 'salaries' };
  if (q.includes('موعد') || q.includes('تقديم') || (q.includes('متى') && q.includes('يفتح')) || q.includes('تسجيل'))
    return { type: 'response', key: 'deadlines' };
  if (q.includes('عسكري') || q.includes('جيش') || q.includes('ضابط') || q.includes('ملازم') || q.includes('القوات'))
    return { type: 'response', key: 'general_military' };

  // ══ Generic topic matchers ══
  if (q.includes('قانون') || q.includes('محامي') || q.includes('محاماة'))
    return { type: 'response', key: 'plan_law' };
  if (q.includes('صيدلة') || q.includes('صيدلي') || q.includes('صيدلاني'))
    return { type: 'response', key: 'plan_pharmacy' };
  if (q.includes('أسنان') || q.includes('dental'))
    return { type: 'response', key: 'plan_dentistry' };
  if (q.includes('محاسبة') || q.includes('محاسب') || q.includes('cpa') || q.includes('acca'))
    return { type: 'response', key: 'plan_accounting' };
  if (q.includes('تمويل') || q.includes('cfa') || q.includes('بورصة'))
    return { type: 'response', key: 'plan_finance' };
  if (q.includes('تسويق') || q.includes('ماركتينغ'))
    return { type: 'response', key: 'plan_marketing' };
  if (q.includes('نظم معلومات'))
    return { type: 'response', key: 'plan_mis' };
  if (q.includes('تمريض') || q.includes('ممرض'))
    return { type: 'response', key: 'plan_nursing' };
  if (q.includes('صحية') || q.includes('صحة عامة') || q.includes('تغذية'))
    return { type: 'response', key: 'plan_health_sciences' };
  if (q.includes('شريعة') || q.includes('فقه') || q.includes('دراسات إسلامية'))
    return { type: 'response', key: 'plan_sharia' };
  if (q.includes('عمارة') || q.includes('معمار') || q.includes('architecture'))
    return { type: 'response', key: 'plan_architecture' };
  if (q.includes('ذكاء اصطناعي') || q.includes('artificial intelligence'))
    return { type: 'response', key: 'plan_ai_cmu' };
  if (q.includes('ميكاترونكس') || q.includes('mechatronics'))
    return { type: 'response', key: 'plan_mechatronics' };

  // Non-Qatari generic catch-all
  const isNonQatariGeneric: boolean =
    q.includes('غير قطري') || q.includes('غير القطري') || q.includes('غير القطريين') ||
    q.includes('مقيمين') || q.includes('للمقيمين') ||
    q.includes('وافد') || q.includes('وافدين') || q.includes('للوافدين') ||
    q.includes('أجنبي') || q.includes('أجانب') || q.includes('للأجانب') ||
    q.includes('لغير القطريين');
  if (isNonQatariGeneric)
    return { type: 'response', key: 'scholarship_non_qatari' };

  if (!isNonQatariGeneric && (q.includes('منح') || q.includes('ابتعاث') || q.includes('مجان') || q.includes('تمويل')))
    return { type: 'response', key: 'scholarship_amiri' };

  if (q.includes('طيران') || q.includes('طيار') || q.includes('خطوط قطرية'))
    return { type: 'response', key: 'qaa' };
  if (q.includes('إعلام') || q.includes('صحافة') || q.includes('اتصال') || q.includes('ميديا'))
    return { type: 'response', key: 'nu' };
  if (q.includes('تربية') || (q.includes('معلم') && !q.includes('راتب')))
    return { type: 'response', key: 'plan_education' };
  if (q.includes('طب') || q.includes('دكتور') || q.includes('طبيب'))
    return { type: 'response', key: 'plan_medicine' };
  if (q.includes('هندسة') || q.includes('مهندس'))
    return { type: 'response', key: 'plan_engineering_qu' };
  if (q.includes('نفس') || q.includes('سيكولوجي') || q.includes('psychology'))
    return { type: 'response', key: 'plan_psychology' };
  if (q.includes('جامعات') || q.includes('خيارات') || q.includes('متاح') || q.includes('كل الجامعات') || q.includes('قائمة'))
    return { type: 'response', key: 'general_list' };

  // Grade-based recommendation
  const gm: RegExpMatchArray | null = q.match(/(\d{2,3})\s*%?/);
  if (gm && (q.includes('%') || q.includes('معدل') || /^\d{2,3}$/.test(q.trim()))) {
    const g: number = parseInt(gm[1], 10);
    if (g >= 50 && g <= 100) {
      const track: string | null = q.includes('علمي') ? 'علمي' : q.includes('أدبي') || q.includes('ادبي') ? 'أدبي' : null;
      return { type: 'grade', grade: g, track };
    }
  }

  // Greetings
  if (q.includes('مرحبا') || q.includes('هلا') || q.includes('السلام') || q.includes('اهلا') || q.includes('هاي') || q === 'hi' || q === 'hello') {
    return { type: 'greeting' };
  }

  return { type: 'unknown' };
}

// ──────────────────────────────────────────────────────────
// gradeResponse
// ──────────────────────────────────────────────────────────

function gradeResponse(grade: number, _track: string | null): ResponseWithSuggestions {
  if (grade >= 95) return { text: `\u{1F31F} *معدل استثنائي (${grade}%)!*\n\nأمامك أرقى الخيارات:\n\n\u{1F3E5} *وايل كورنيل للطب* (أفضل 10 عالمياً)\n\u{1F3E5} *طب جامعة قطر*\n\u{1F5A5}\uFE0F *كارنيجي ميلون* (CS، إدارة)\n\u{1F451} *الابتعاث الأميري* (هارفارد/MIT)\n\u2694\uFE0F *جميع الكليات العسكرية* بامتياز\n\n\u{1F4A1} اسألني عن خطة دراسة أي تخصص!`, suggestions: ['وايل كورنيل', 'خطة دراسة الطب', 'الابتعاث الأميري', 'هندسة البترول'] };
  if (grade >= 90) return { text: `\u{1F31F} *معدل ممتاز (${grade}%)!*\n\nمتاح لك:\n\u{1F3E5} كلية الطب — جامعة قطر\n\u{1F9B7} طب الأسنان — جامعة قطر\n\u{1F5A5}\uFE0F كارنيجي ميلون\n\u2699\uFE0F تكساس إي أند أم (هندسة بترول)\n\u{1F310} جورجتاون\n\u2694\uFE0F جميع الكليات العسكرية`, suggestions: ['خطة دراسة الطب', 'هندسة البترول', 'كارنيجي ميلون', 'مقارنة كورنيل وطب QU'] };
  if (grade >= 85) return { text: `\u2B50 *معدل ممتاز (${grade}%)!*\n\nمتاح لك:\n\u2699\uFE0F تكساس إي أند أم (هندسة بترول)\n\u{1F5A5}\uFE0F كارنيجي ميلون\n\u{1F310} جورجتاون\n\u{1F48A} الصيدلة — جامعة قطر\n\u2694\uFE0F جميع الكليات العسكرية`, suggestions: ['هندسة البترول', 'كارنيجي ميلون', 'الكليات العسكرية', 'الصيدلة'] };
  if (grade >= 80) return { text: `\u2705 *معدل جيد جداً (${grade}%)!*\n\nمتاح لك:\n\u2699\uFE0F الهندسة — جامعة قطر (7 تخصصات)\n\u{1F4FA} نورثوسترن (إعلام)\n\u{1F3A8} فرجينيا كومنولث\n\u{1F469}\u200D\u2695\uFE0F التمريض والعلوم الصحية\n\u2694\uFE0F كلية أحمد بن محمد، الشرطة، الجوية`, suggestions: ['هندسة جامعة قطر', 'نورثوسترن', 'الكليات العسكرية', 'فرص عمل الهندسة'] };
  if (grade >= 75) return { text: `\u{1F4DA} *معدل جيد (${grade}%)!*\n\nمتاح لك:\n\u{1F4DA} آداب وعلوم — جامعة قطر\n\u{1F4BC} الإدارة والاقتصاد\n\u{1F393} التربية + برنامج طموح (10,000 ريال/شهر)\n\u{1F3A8} فرجينيا كومنولث\n\u2694\uFE0F أحمد بن محمد، الشرطة`, suggestions: ['برنامج طموح', 'الإدارة في QU', 'فرجينيا كومنولث', 'الكليات العسكرية'] };
  if (grade >= 70) return { text: `\u{1F4DA} *معدل مقبول (${grade}%)!*\n\nمتاح لك:\n\u{1F4DA} جامعة قطر — الآداب والإدارة والشريعة والتربية\n\u2708\uFE0F أكاديمية الطيران (علمي + نظر 6/6)\n\u2694\uFE0F كلية أحمد بن محمد\n\u{1F46E} أكاديمية الشرطة`, suggestions: ['جامعة قطر', 'أكاديمية الطيران', 'أحمد بن محمد', 'برنامج طموح'] };
  return { text: `\u{1F4DD} *معدل ${grade}% — أقل من الحد الأدنى لمعظم الجامعات*\n\nلا تقلق! لديك خيارات:\n\u{1F4D8} كلية المجتمع قطر (دبلوم مشارك)\n\u{1F504} إعادة الثانوية لتحسين المعدل\n\u{1F6E0}\uFE0F معاهد التدريب المهني\n\n\u{1F4A1} الدبلوم المشارك يمكنك لاحقاً من الانتقال للجامعة!`, suggestions: ['كلية المجتمع قطر', 'التدريب المهني', 'تحسين المعدل'] };
}

// ──────────────────────────────────────────────────────────
// processMessage — main pipeline
// ──────────────────────────────────────────────────────────

const PDPPL_NOTICE = '\n\n\u{1F512} ملاحظة: بياناتك محفوظة بسرية تامة وفق قانون PDPPL القطري. لحذف بياناتك اكتب: \'احذف بياناتي\'';

/**
 * Process a user message and return { text, suggestions }
 */
async function processMessage(
  userText: string,
  phone: string | null = null,
  nationality: string | null = null,
): Promise<ResponseWithSuggestions> {
  // T-FIX-004: Sanitize input
  const { safe, sanitized, reason } = sanitizeInput(userText);
  if (!safe) {
    console.warn(`[Security] Blocked input — reason: ${reason} | phone: ***`);
    return getInjectionResponse();
  }
  const safeMessage: string = sanitized;

  // T-009: Profile from Supabase + in-memory cache
  let profile: ProcessingProfile = {};
  let conversationHistory: HistoryEntry[] = [];
  let supabaseUser: { id: string } | null = null;
  let profileChanged = false;

  if (phone) {
    const cachedProfile = getInMemoryProfile(phone) as ProcessingProfile | null;

    if (cachedProfile) {
      profile = cachedProfile;
    } else {
      const [dbUser, dbProfile] = await Promise.all([
        getOrCreateUser(phone, nationality).catch(() => null),
        getUserProfileData(phone).catch(() => ({})),
      ]);

      supabaseUser = dbUser;

      if (dbProfile && Object.keys(dbProfile).length > 0) {
        profile = dbProfile as ProcessingProfile;
        saveInMemoryProfile(phone, profile);
      }
    }

    if (!supabaseUser) {
      supabaseUser = await getOrCreateUser(phone, profile.nationality || nationality).catch(() => null);
    }

    if (supabaseUser) {
      const history = await getConversationHistory(supabaseUser.id).catch(() => []);
      conversationHistory = history.map((h: { role: string; message: string }) => ({
        role: h.role as HistoryEntry['role'],
        content: h.message,
      }));
    }
  }

  const profileBefore: string = JSON.stringify(profile);
  profile = buildUserProfile(userText, profile) as ProcessingProfile;
  profileChanged = JSON.stringify(profile) !== profileBefore;

  // T-011: conversation stage
  const currentStage: string = (profile.conversationStage as string) || STAGES.STAGE_0;
  const nextStage: string = getNextStage(currentStage, profile, userText) as string;
  if (nextStage !== currentStage) {
    profile.conversationStage = nextStage;
    profileChanged = true;
  }

  if (phone && profileChanged) {
    saveInMemoryProfile(phone, profile);
    saveUserProfileData(phone, profile as Record<string, unknown>).catch(() => {});
  } else if (phone && !getInMemoryProfile(phone)) {
    saveInMemoryProfile(phone, profile);
  }

  const effectiveNationality: string | null = (profile.nationality as string) || nationality;

  if (supabaseUser) {
    saveMessage(supabaseUser.id, 'user', userText).catch(() => {});
  }

  const profileContext: string = buildProfileContext(profile) as string;

  // 0. Delete request (PDPPL)
  const qRaw: string = userText.trim();
  const isDeleteRequest: boolean = qRaw.includes('احذف بياناتي') || qRaw.toLowerCase().includes('delete my data');
  if (isDeleteRequest) {
    if (supabaseUser && phone) {
      updateUserProfile(phone, { deletion_requested: true, deletion_requested_at: new Date().toISOString() }).catch(() => {});
    }
    const deleteResponse: ResponseWithSuggestions = {
      text: '\u{1F512} تم استلام طلبك.\n\nسيتم حذف جميع بياناتك الشخصية خلال 30 يوماً وفق قانون PDPPL القطري.\n\nإذا كنت بحاجة لأي مساعدة أكاديمية قبل ذلك، يسعدني خدمتك.',
      suggestions: ['جميع الجامعات', 'الرواتب والوظائف', 'إنهاء المحادثة'],
    };
    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', deleteResponse.text).catch(() => {});
    return deleteResponse;
  }

  // S-009: Restart
  const qRestart: string = userText.toLowerCase().trim();
  const isRestartRequest: boolean = qRestart.includes('ابدأ من جديد') || qRestart.includes('ابدأ من البداية') ||
      qRestart.includes('مسح المحادثة') || qRestart.includes('محادثة جديدة') || qRestart.includes('reset') ||
      qRestart.includes('نسيت كل شيء') || qRestart.includes('تناسى كل شيء');
  if (isRestartRequest) {
    if (phone) {
      saveInMemoryProfile(phone, {});
      saveUserProfileData(phone, {} as Record<string, unknown>).catch(() => {});
    }
    const restartResponse: ResponseWithSuggestions = {
      text: '\u{1F504} تم! بدأنا من جديد.\n\nأنا المرشد الأكاديمي \u{1F393} — كيف أقدر أساعدك؟\n\nأخبرني: هل أنت طالب/ة تبحث عن جامعة، أم ولي أمر؟',
      suggestions: ['أنا طالب', 'أنا ولي أمر', 'عرض الجامعات'],
    };
    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', restartResponse.text).catch(() => {});
    return restartResponse;
  }

  // 1. First message / greeting
  const isFirstMessage: boolean = (profile.messageCount ?? 0) <= 1;
  const q: string = userText.toLowerCase().trim();
  const isGreeting: boolean = q.includes('مرحبا') || q.includes('هلا') || q.includes('السلام')
    || q.includes('اهلا') || q.includes('هاي') || q === 'hi' || q === 'hello'
    || q.includes('ابدأ') || q.includes('مرحبا') || q.includes('أهلاً');

  if (isFirstMessage || isGreeting) {
    const result: FindResult = findResponse(userText);
    if (result.type === 'greeting' || isFirstMessage) {
      const welcome: ResponseWithSuggestions = buildSmartWelcome(profile, effectiveNationality, conversationHistory.length > 0);
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', welcome.text).catch(() => {});
      return welcome;
    }
  }

  // 2. Profiling question
  if ((profile.messageCount ?? 0) === 2 && !profile.nationality && !profile.gpa) {
    const profilingQ: string | null = getNextProfilingQuestion(profile) as string | null;
    if (profilingQ) {
      const response: ResponseWithSuggestions = {
        text: profilingQ,
        suggestions: ['أنا قطري', 'أنا مقيم', 'تخطي'],
      };
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
      return response;
    }
  }

  // 3. Knowledge base cache
  let cachedResponse: { answer: string; suggestions?: string[] } | null = null;
  try {
    const kbResult = await getFromKnowledgeBase(userText);
    if (kbResult) cachedResponse = kbResult as { answer: string; suggestions?: string[] };
  } catch {
    cachedResponse = null;
  }
  if (cachedResponse) {
    const smartSuggestions: string[] = generateSmartSuggestions(profile, 'knowledge_cache') as string[];
    const mergedSuggestions: string[] = cachedResponse.suggestions?.length
      ? cachedResponse.suggestions
      : smartSuggestions;

    const response: ResponseWithSuggestions = {
      text: cachedResponse.answer,
      suggestions: mergedSuggestions.slice(0, 3),
    };

    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
    return response;
  }

  // 3.5. Semantic Search
  if (!cachedResponse && process.env.ANTHROPIC_API_KEY) {
    const semanticResult = await semanticSearch(userText).catch(() => null) as { answer: string; similarity: number } | null;
    if (semanticResult) {
      const response: ResponseWithSuggestions = {
        text: semanticResult.answer,
        suggestions: ['تفاصيل أكثر', 'سؤال آخر', 'جميع الجامعات'],
        source: 'semantic_cache',
        similarity: semanticResult.similarity,
      };
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
      return response;
    }
  }

  // 4. Local keyword responses
  const result: FindResult = findResponse(userText);

  // Fix scholarship for non-Qatari profiles
  if (result.type === 'response' && result.key === 'scholarship_amiri') {
    const isNonQatariProfile: boolean = effectiveNationality === 'non_qatari'
      || profile.nationality === 'non_qatari'
      || profile.userType === 'non_qatari_student';
    if (isNonQatariProfile) {
      result.key = 'scholarship_non_qatari';
    }
  }

  let response: ResponseWithSuggestions;
  let contextKey: string | null = null;

  switch (result.type) {
    case 'response': {
      const allResponses = ALL_RESPONSES as Record<string, { text: string; suggestions?: string[] }>;
      const resp = allResponses[result.key!];
      if (!resp) { response = getDefaultResponse(profile); break; }
      response = { text: resp.text, suggestions: resp.suggestions || [] };
      contextKey = result.key!;
      break;
    }

    case 'grade': {
      response = gradeResponse(result.grade!, result.track || (profile.track as string | null));
      if (!profile.gpa || profile.gpa !== result.grade) {
        profile.gpa = result.grade!;
        if (phone) {
          saveInMemoryProfile(phone, profile);
          saveUserProfileData(phone, profile as Record<string, unknown>).catch(() => {});
        }
      }
      contextKey = 'grade';
      break;
    }

    case 'greeting': {
      const welcome: ResponseWithSuggestions = buildSmartWelcome(profile, effectiveNationality, conversationHistory.length > 0);
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', welcome.text).catch(() => {});
      return welcome;
    }

    default: {
      // 5. Claude AI Fallback
      const enrichedQuestion: string = profileContext
        ? `${profileContext}\n\nسؤال المستخدم: ${safeMessage}`
        : safeMessage;

      const aiResponse = await getAIResponse(enrichedQuestion, conversationHistory).catch(() => null) as { text: string; suggestions?: string[] } | null;

      if (aiResponse) {
        saveToKnowledgeCache(userText, aiResponse.text, aiResponse.suggestions).catch(() => {});
        const smartSuggestions: string[] = generateSmartSuggestions(profile, 'ai') as string[];
        const finalSuggestions: string[] = aiResponse.suggestions?.length
          ? aiResponse.suggestions
          : smartSuggestions;

        const finalResponse: ResponseWithSuggestions = { text: aiResponse.text, suggestions: finalSuggestions.slice(0, 3) };
        if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', finalResponse.text).catch(() => {});
        return finalResponse;
      }

      response = getDefaultResponse(profile);
      contextKey = null;
      break;
    }
  }

  // Apply nationality context
  if (contextKey && effectiveNationality) {
    response = addNationalityContext(response, effectiveNationality, contextKey) as ResponseWithSuggestions;
  }

  // Smart suggestions
  if (profile.gpa || profile.nationality || profile.track) {
    const smartSuggs: string[] = generateSmartSuggestions(profile, contextKey || '') as string[];
    if (smartSuggs.length > 0 && (!response.suggestions || response.suggestions.length === 0)) {
      response.suggestions = smartSuggs;
    }
  }

  // T-011: Stage prompt
  const currentStageForPrompt: string = (profile.conversationStage as string) || STAGES.STAGE_0 as string;
  const stagePrompt: string | null = getStagePrompt(currentStageForPrompt, profile) as string | null;
  if (stagePrompt && response.text && !response.text.includes(stagePrompt)) {
    response.text = response.text + '\n\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' + stagePrompt;
  }

  // T-011: Final report at STAGE_6
  if (isConversationComplete(profile.conversationStage || '') && result.type === 'unknown') {
    response = generateFinalReport(profile) as ResponseWithSuggestions;
  }

  if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
  return response;
}

// ──────────────────────────────────────────────────────────
// buildSmartWelcome
// ──────────────────────────────────────────────────────────

function buildSmartWelcome(
  profile: ProcessingProfile,
  nationality: string | null,
  hasHistory: boolean = false,
): ResponseWithSuggestions {
  const { userType, gpa } = profile;

  if (hasHistory) {
    return {
      text: `\u{0623}\u{0647}\u{0644}\u{0627}\u{064B} بعودتك! \u{1F44B}\n\nأتذكرك — يسعدني مواصلة إرشادك.\n${gpa ? `معدلك ${gpa}%` : ''}\n\nما الذي تريد معرفته اليوم؟`,
      suggestions: generateSmartSuggestions(profile, 'return') as string[],
    };
  }

  if (userType === USER_TYPES.PARENT) {
    return {
      text: `أهلاً بك! \u{1F393}\n\nيسعدني مساعدتك في إرشاد أبنائك نحو المستقبل الأكاديمي المناسب.\n\nلأقدم لك إرشاداً دقيقاً، أخبرني:\n\u2022 ما جنسية ابنك/ابنتك؟ (قطري / مقيم)\n\u2022 ما معدله/ها في الثانوية أو المتوقع؟\n\u2022 هل لديه تخصص أو مجال مفضّل؟` + PDPPL_NOTICE,
      suggestions: ['ابني قطري', 'ابنتي مقيمة', 'معدله 85%'],
    };
  }

  if (userType === USER_TYPES.STUDENT_GRAD) {
    return {
      text: `أهلاً! \u{1F393}\n\nأنت تبحث عن الدراسات العليا في قطر — خيار ممتاز!\n\nقطر فيها فرص ماجستير ودكتوراه رائعة، أبرزها:\n\u2022 **HBKU** — منح كاملة لجميع الجنسيات\n\u2022 **جامعة قطر** — 40+ برنامج عالي\n\u2022 **كليات المدينة التعليمية** — معايير دولية\n\nأخبرني: ما تخصصك وماذا تريد دراسة؟` + PDPPL_NOTICE,
      suggestions: ['برامج الماجستير في HBKU', 'دكتوراه في قطر', 'شروط الدراسات العليا'],
    };
  }

  if (gpa) {
    const gradeResp: ResponseWithSuggestions = gradeResponse(gpa, (profile.track as string | null));
    return {
      text: `أهلاً! \u{1F393} رأيت معدلك **${gpa}%** — دعني أرشدك مباشرة:\n\n${gradeResp.text}` + PDPPL_NOTICE,
      suggestions: gradeResp.suggestions?.slice(0, 3) || (generateSmartSuggestions(profile, 'grade') as string[]),
    };
  }

  if (nationality === 'non_qatari') {
    return {
      text: '\u{1F393} *أهلاً بك في المرشد الأكاديمي!*\n\u{1F30D} مرحباً بالطالب/ة المقيم/ة في قطر\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n\u{1F4CB} **خياراتك المتاحة:**\n\u2022 **HBKU** — منح كاملة لجميع الجنسيات\n\u2022 **جامعة قطر** — رسوم مدعومة\n\u2022 **المدينة التعليمية** — 8 جامعات عالمية\n\u2022 UDST وجامعة لوسيل\n\n\u{1F4A1} أرسل معدلك أو اسأل عن أي تخصص!' + PDPPL_NOTICE,
      suggestions: ['منح HBKU لجميع الجنسيات', 'المدينة التعليمية', 'رسوم الجامعات للمقيمين'],
    };
  }

  if (nationality === 'qatari') {
    return {
      text: '\u{1F393} *أهلاً بك في المرشد الأكاديمي!*\n\u{1F1F6}\u{1F1E6} مرحباً بالطالب/ة القطري/ة\n\nأنا هنا لمساعدتك في اختيار مستقبلك الأكاديمي.\n\n\u2705 **مميزاتك كقطري/ة:**\n\u2022 جامعة قطر مجانية + مكافأة شهرية\n\u2022 الكليات العسكرية متاحة\n\u2022 برنامج طموح (22,000-25,000 ريال/شهر)\n\u2022 منح الشركات: قطر للطاقة، خطوط قطرية، QNB\n\n\u{1F4A1} أرسل معدلك أو اسأل عن أي تخصص!' + PDPPL_NOTICE,
      suggestions: ['منح القطريين', 'الكليات العسكرية', 'برنامج طموح للخارج'],
    };
  }

  const defaultWelcome: ResponseWithSuggestions = getWelcomeMessage() as ResponseWithSuggestions;
  return {
    ...defaultWelcome,
    text: defaultWelcome.text + PDPPL_NOTICE,
  };
}

function getDefaultResponse(profile: ProcessingProfile = {}): ResponseWithSuggestions {
  const smartSuggs: string[] = generateSmartSuggestions(profile, 'default') as string[];
  return {
    text: '\u{1F914} لم أفهم سؤالك بالضبط.\n\nجرّب أحد هذه:\n\u2022 اكتب اسم جامعة (مثل: كارنيجي ميلون)\n\u2022 اكتب معدلك (مثل: 85%)\n\u2022 اسأل عن تخصص (مثل: هندسة البترول)\n\u2022 اكتب "جامعات" لعرض القائمة الكاملة',
    suggestions: smartSuggs.length > 0 ? smartSuggs : ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية'],
  };
}

export { findResponse, gradeResponse, processMessage };
