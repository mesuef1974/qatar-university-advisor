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

/**
 * Find the best response for a user message
 * Ported from QatarUniversityAdvisor.jsx findResponse logic
 */
function findResponse(text) {
  const q = text.toLowerCase().trim();

  // S-010: ترجمة العامية القطرية → الفصحى
  const qatariDialect = {
    'وين': 'أين', 'شو': 'ما', 'ليش': 'لماذا', 'كيفك': 'كيف حالك',
    'يعني': 'أي', 'زين': 'جيد', 'عاد': 'بعد', 'هاه': 'نعم',
    'ايش': 'ماذا', 'شلون': 'كيف', 'بس': 'فقط', 'واجد': 'كثير',
    'مره': 'جداً', 'حلو': 'جيد', 'يبي': 'يريد', 'أبي': 'أريد',
    'ابغى': 'أريد', 'بغيت': 'أردت', 'تبي': 'تريد', 'ما عندي': 'ليس لدي',
    'أبغى أدرس': 'أريد أن أدرس', 'وش': 'ماذا', 'قداه': 'كم',
    'سواء': 'مساواة', 'صح': 'صحيح', 'خلاص': 'انتهى',
  };
  let normalizedQ = q;
  Object.entries(qatariDialect).forEach(([dialect, formal]) => {
    normalizedQ = normalizedQ.replace(new RegExp(dialect, 'g'), formal);
  });

  // S-001: طالب صف 10/11 — ما زال مبكراً
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
  const isScholarshipContext = q.includes('منح') || q.includes('ابتعاث') || q.includes('بعثة') || q.includes('سبونسر') || q.includes('راعي') || q.includes('رعاية');

  // S-008: اعتمادية دولية (لا تتدخل في سياق المنح)
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

  // --- Qatari vs non-Qatari (but not if in scholarship context) ---
  if (((q.includes('قطري') && q.includes('غير قطري')) || (q.includes('مقيم') && q.includes('قطري')) || q.includes('مقيم vs قطري')) && !isScholarshipContext)
    return { type: 'response', key: 'qatari_vs_non_qatari' };

  // --- TAMU closing ---
  if ((q.includes('تكساس') || q.includes('tamu')) && (q.includes('إغلاق') || q.includes('اغلاق') || q.includes('2028') || q.includes('يقفل') || q.includes('يسكر')))
    return { type: 'response', key: 'tamu_closing' };

  // --- Qatar Vision 2030 ---
  if (q.includes('رؤية 2030') || q.includes('vision 2030') || q.includes('تخصصات المستقبل'))
    return { type: 'response', key: 'qatar_vision_2030' };

  // Reservoir engineer
  if (q.includes('مكامن') || q.includes('reservoir'))
    return { type: 'response', key: 'reservoir_engineer' };

  // ══════════════════════════════════════════
  // Scholarship patterns (before university names to avoid conflicts)
  // ══════════════════════════════════════════

  // Sponsors list
  if (q.includes('سبونسر') || q.includes('جهات راعية') || (q.includes('راعي') && !q.includes('عسكري')) || (q.includes('رعاية') && (q.includes('دراس') || q.includes('جامع'))))
    return { type: 'response', key: 'sponsors_list' };

  // Amiri scholarship
  if (q.includes('أميري') || q.includes('البعثة الأميرية') || q.includes('ابتعاث أميري'))
    return { type: 'response', key: 'scholarship_amiri' };
  if (isScholarshipContext && (q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد') || q.includes('كامبريدج')))
    return { type: 'response', key: 'scholarship_amiri' };

  // External scholarship
  if (q.includes('ابتعاث خارجي') || (q.includes('دراسة') && q.includes('في الخارج')) || (q.includes('ابتعاث') && q.includes('خارج')))
    return { type: 'response', key: 'scholarship_external' };

  // Internal scholarship
  if (q.includes('ابتعاث داخلي'))
    return { type: 'response', key: 'scholarship_internal' };

  // QatarEnergy scholarship (scholarship context required to avoid conflict with petroleum engineering)
  if (isScholarshipContext && (q.includes('قطر للطاقة') || q.includes('قطبك') || q.includes('qatarenergy')))
    return { type: 'response', key: 'scholarship_qatarenergy' };
  if (q.includes('قطبك') && !q.includes('هندسة'))
    return { type: 'response', key: 'scholarship_qatarenergy' };

  // Qatar Airways scholarship
  if (isScholarshipContext && (q.includes('خطوط قطرية') || q.includes('qatar airways') || q.includes('الدرب')))
    return { type: 'response', key: 'scholarship_qatarairways' };

  // QNB scholarship
  if (isScholarshipContext && (q.includes('qnb') || q.includes('بنك قطر الوطني')))
    return { type: 'response', key: 'scholarship_qnb' };

  // Kahramaa scholarship
  if (q.includes('كهرماء') || q.includes('kahramaa'))
    return { type: 'response', key: 'scholarship_kahramaa' };

  // Ashghal scholarship
  if (q.includes('أشغال') || q.includes('اشغال') || q.includes('ashghal'))
    return { type: 'response', key: 'scholarship_ashghal' };

  // Nakilat scholarship
  if (q.includes('ناقلات') || q.includes('nakilat') || (isScholarshipContext && q.includes('بحري')))
    return { type: 'response', key: 'scholarship_nakilat' };

  // Non-Qatari scholarships — يجب أن يكون قبل catch-all المنح
  // نتحقق من جميع صيغ غير القطري بما فيها صيغ الجمع والتعريف
  const isNonQatariKeyword =
    q.includes('غير قطري') || q.includes('غير القطري') || q.includes('غير القطريين') ||
    q.includes('مقيم') || q.includes('للمقيمين') || q.includes('مقيمين') ||
    q.includes('وافد') || q.includes('وافدين') || q.includes('للوافدين') ||
    q.includes('أجنبي') || q.includes('أجانب') || q.includes('للأجانب') ||
    q.includes('منح دولية') || q.includes('منحة دولية') ||
    q.includes('منح للمقيم') || q.includes('منحة للمقيم') ||
    q.includes('منح للوافد') || q.includes('لغير القطريين');
  if (isNonQatariKeyword && isScholarshipContext)
    return { type: 'response', key: 'scholarship_non_qatari' };

  // ══════════════════════════════════════════
  // Study plans — Extended majors (before generic handlers)
  // ══════════════════════════════════════════

  if (q.includes('خطة') || q.includes('مواد') || q.includes('كورسات') || q.includes('مقررات') || q.includes('سنة') || q.includes('منهج') || q.includes('تخصص') || q.includes('هندسة') || q.includes('رياضيات') || q.includes('فيزياء') || q.includes('كيمياء') || q.includes('أحياء') || q.includes('بيولوجي')) {
    // Existing plans (highest priority within study plans)
    if ((q.includes('طب') && !q.includes('أسنان') && !q.includes('سن ')) || q.includes('medicine')) return { type: 'response', key: 'plan_medicine' };
    if (q.includes('بترول') || q.includes('petroleum') || q.includes('tamu') || q.includes('تكساس'))
      return { type: 'response', key: 'plan_petroleum' };
    if ((q.includes('cs') || q.includes('برمجة')) && (q.includes('cmu') || q.includes('كارنيجي')))
      return { type: 'response', key: 'plan_cs' };

    // New extended majors
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

    // Generic fallbacks for study plans
    if (q.includes('هندسة') || q.includes('engineering'))
      return { type: 'response', key: 'plan_engineering_qu' };
  }

  // ══════════════════════════════════════════
  // Teaching career
  // ══════════════════════════════════════════
  if (q.includes('علّم لأجل قطر') || q.includes('علم لأجل قطر') || q.includes('teach for qatar'))
    return { type: 'response', key: 'teach_for_qatar' };
  if (q.includes('مهنة التعليم') || q.includes('واقع التعليم') || q.includes('رواتب المعلمين'))
    return { type: 'response', key: 'teaching_career' };

  // ══════════════════════════════════════════
  // New universities (before existing university patterns)
  // ══════════════════════════════════════════
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

  // ══════════════════════════════════════════
  // Existing universities by name
  // ══════════════════════════════════════════
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

  // Military colleges by name
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

  // Eye vision
  if (q.includes('نظر') || q.includes('عيون') || q.includes('نظارة') || q.includes('عدسات') || q.includes('6/6') || q.includes('lasik') || q.includes('ليزك'))
    return { type: 'response', key: 'eye_vision' };

  // Thamoon program
  if (q.includes('طموح') || q.includes('10,000 ريال') || (q.includes('معلم') && q.includes('راتب')))
    return { type: 'response', key: 'thamoon' };

  // Amiri scholarship (legacy — direct keywords without scholarship context)
  if (q.includes('هارفارد') || q.includes('mit') || q.includes('أكسفورد'))
    return { type: 'response', key: 'scholarship_amiri' };

  // Military fitness
  if ((q.includes('لياقة') || q.includes('اختبار بدني') || q.includes('جري') || q.includes('ضغط')) && (q.includes('عسكري') || q.includes('كلية') || q.includes('شرطة')))
    return { type: 'response', key: 'fitness_military' };

  // Military comparison
  if (q.includes('مقارنة') && q.includes('عسكري'))
    return { type: 'response', key: 'compare_military' };

  // Salaries
  if (q.includes('راتب') || q.includes('وظيفة') || q.includes('فرص عمل') || q.includes('توظيف') || (q.includes('مستقبل') && !q.includes('سنة')))
    return { type: 'response', key: 'salaries' };

  // Deadlines
  if (q.includes('موعد') || q.includes('تقديم') || (q.includes('متى') && q.includes('يفتح')) || q.includes('تسجيل'))
    return { type: 'response', key: 'deadlines' };

  // General military
  if (q.includes('عسكري') || q.includes('جيش') || q.includes('ضابط') || q.includes('ملازم') || q.includes('القوات'))
    return { type: 'response', key: 'general_military' };

  // ══════════════════════════════════════════
  // Generic topic matchers (extended — outside study plan context)
  // ══════════════════════════════════════════

  // Law
  if (q.includes('قانون') || q.includes('محامي') || q.includes('محاماة'))
    return { type: 'response', key: 'plan_law' };
  // Pharmacy
  if (q.includes('صيدلة') || q.includes('صيدلي') || q.includes('صيدلاني'))
    return { type: 'response', key: 'plan_pharmacy' };
  // Dentistry
  if (q.includes('أسنان') || q.includes('dental'))
    return { type: 'response', key: 'plan_dentistry' };
  // Accounting
  if (q.includes('محاسبة') || q.includes('محاسب') || q.includes('cpa') || q.includes('acca'))
    return { type: 'response', key: 'plan_accounting' };
  // Finance
  if (q.includes('تمويل') || q.includes('cfa') || q.includes('بورصة'))
    return { type: 'response', key: 'plan_finance' };
  // Marketing
  if (q.includes('تسويق') || q.includes('ماركتينغ'))
    return { type: 'response', key: 'plan_marketing' };
  // MIS
  if (q.includes('نظم معلومات'))
    return { type: 'response', key: 'plan_mis' };
  // Nursing
  if (q.includes('تمريض') || q.includes('ممرض'))
    return { type: 'response', key: 'plan_nursing' };
  // Health sciences
  if (q.includes('صحية') || q.includes('صحة عامة') || q.includes('تغذية'))
    return { type: 'response', key: 'plan_health_sciences' };
  // Sharia
  if (q.includes('شريعة') || q.includes('فقه') || q.includes('دراسات إسلامية'))
    return { type: 'response', key: 'plan_sharia' };
  // Architecture
  if (q.includes('عمارة') || q.includes('معمار') || q.includes('architecture'))
    return { type: 'response', key: 'plan_architecture' };
  // AI
  if (q.includes('ذكاء اصطناعي') || q.includes('artificial intelligence'))
    return { type: 'response', key: 'plan_ai_cmu' };
  // Mechatronics
  if (q.includes('ميكاترونكس') || q.includes('mechatronics'))
    return { type: 'response', key: 'plan_mechatronics' };

  // Non-Qatari generic (catch-all ثانٍ للمناطق خارج سياق isScholarshipContext)
  const isNonQatariGeneric =
    q.includes('غير قطري') || q.includes('غير القطري') || q.includes('غير القطريين') ||
    q.includes('مقيمين') || q.includes('للمقيمين') ||
    q.includes('وافد') || q.includes('وافدين') || q.includes('للوافدين') ||
    q.includes('أجنبي') || q.includes('أجانب') || q.includes('للأجانب') ||
    q.includes('لغير القطريين');
  if (isNonQatariGeneric)
    return { type: 'response', key: 'scholarship_non_qatari' };

  // Scholarships generic — للقطريين فقط (بعد فحص غير القطريين)
  if (!isNonQatariGeneric && (q.includes('منح') || q.includes('ابتعاث') || q.includes('مجان') || q.includes('تمويل')))
    return { type: 'response', key: 'scholarship_amiri' };

  // Aviation general
  if (q.includes('طيران') || q.includes('طيار') || q.includes('خطوط قطرية'))
    return { type: 'response', key: 'qaa' };

  // Media (generic, not Northwestern)
  if (q.includes('إعلام') || q.includes('صحافة') || q.includes('اتصال') || q.includes('ميديا'))
    return { type: 'response', key: 'nu' };

  // Education (generic)
  if (q.includes('تربية') || (q.includes('معلم') && !q.includes('راتب')))
    return { type: 'response', key: 'plan_education' };

  // Medicine general
  if (q.includes('طب') || q.includes('دكتور') || q.includes('طبيب'))
    return { type: 'response', key: 'plan_medicine' };

  // Engineering general
  if (q.includes('هندسة') || q.includes('مهندس'))
    return { type: 'response', key: 'plan_engineering_qu' };

  // Psychology
  if (q.includes('نفس') || q.includes('سيكولوجي') || q.includes('psychology'))
    return { type: 'response', key: 'plan_psychology' };

  // University list
  if (q.includes('جامعات') || q.includes('خيارات') || q.includes('متاح') || q.includes('كل الجامعات') || q.includes('قائمة'))
    return { type: 'response', key: 'general_list' };

  // Grade-based recommendation
  const gm = q.match(/(\d{2,3})\s*%?/);
  if (gm && (q.includes('%') || q.includes('معدل') || /^\d{2,3}$/.test(q.trim()))) {
    const g = parseInt(gm[1]);
    if (g >= 50 && g <= 100) {
      const track = q.includes('علمي') ? 'علمي' : q.includes('أدبي') || q.includes('ادبي') ? 'أدبي' : null;
      return { type: 'grade', grade: g, track };
    }
  }

  // Greetings
  if (q.includes('مرحبا') || q.includes('هلا') || q.includes('السلام') || q.includes('اهلا') || q.includes('هاي') || q === 'hi' || q === 'hello') {
    return { type: 'greeting' };
  }

  return { type: 'unknown' };
}

/**
 * Get grade-based university recommendations
 */
function gradeResponse(grade, _track) {
  if (grade >= 95) return { text: `🌟 *معدل استثنائي (${grade}%)!*\n\nأمامك أرقى الخيارات:\n\n🏥 *وايل كورنيل للطب* (أفضل 10 عالمياً)\n🏥 *طب جامعة قطر*\n🖥️ *كارنيجي ميلون* (CS، إدارة)\n👑 *الابتعاث الأميري* (هارفارد/MIT)\n⚔️ *جميع الكليات العسكرية* بامتياز\n\n💡 اسألني عن خطة دراسة أي تخصص!`, suggestions: ['وايل كورنيل', 'خطة دراسة الطب', 'الابتعاث الأميري', 'هندسة البترول'] };
  if (grade >= 90) return { text: `🌟 *معدل ممتاز (${grade}%)!*\n\nمتاح لك:\n🏥 كلية الطب — جامعة قطر\n🦷 طب الأسنان — جامعة قطر\n🖥️ كارنيجي ميلون\n⚙️ تكساس إي أند أم (هندسة بترول)\n🌐 جورجتاون\n⚔️ جميع الكليات العسكرية`, suggestions: ['خطة دراسة الطب', 'هندسة البترول', 'كارنيجي ميلون', 'مقارنة كورنيل وطب QU'] };
  if (grade >= 85) return { text: `⭐ *معدل ممتاز (${grade}%)!*\n\nمتاح لك:\n⚙️ تكساس إي أند أم (هندسة بترول)\n🖥️ كارنيجي ميلون\n🌐 جورجتاون\n💊 الصيدلة — جامعة قطر\n⚔️ جميع الكليات العسكرية`, suggestions: ['هندسة البترول', 'كارنيجي ميلون', 'الكليات العسكرية', 'الصيدلة'] };
  if (grade >= 80) return { text: `✅ *معدل جيد جداً (${grade}%)!*\n\nمتاح لك:\n⚙️ الهندسة — جامعة قطر (7 تخصصات)\n📺 نورثوسترن (إعلام)\n🎨 فرجينيا كومنولث\n👩‍⚕️ التمريض والعلوم الصحية\n⚔️ كلية أحمد بن محمد، الشرطة، الجوية`, suggestions: ['هندسة جامعة قطر', 'نورثوسترن', 'الكليات العسكرية', 'فرص عمل الهندسة'] };
  if (grade >= 75) return { text: `📚 *معدل جيد (${grade}%)!*\n\nمتاح لك:\n📚 آداب وعلوم — جامعة قطر\n💼 الإدارة والاقتصاد\n🎓 التربية + برنامج طموح (10,000 ريال/شهر)\n🎨 فرجينيا كومنولث\n⚔️ أحمد بن محمد، الشرطة`, suggestions: ['برنامج طموح', 'الإدارة في QU', 'فرجينيا كومنولث', 'الكليات العسكرية'] };
  if (grade >= 70) return { text: `📚 *معدل مقبول (${grade}%)!*\n\nمتاح لك:\n📚 جامعة قطر — الآداب والإدارة والشريعة والتربية\n✈️ أكاديمية الطيران (علمي + نظر 6/6)\n⚔️ كلية أحمد بن محمد\n👮 أكاديمية الشرطة`, suggestions: ['جامعة قطر', 'أكاديمية الطيران', 'أحمد بن محمد', 'برنامج طموح'] };
  return { text: `📝 *معدل ${grade}% — أقل من الحد الأدنى لمعظم الجامعات*\n\nلا تقلق! لديك خيارات:\n📘 كلية المجتمع قطر (دبلوم مشارك)\n🔄 إعادة الثانوية لتحسين المعدل\n🛠️ معاهد التدريب المهني\n\n💡 الدبلوم المشارك يمكنك لاحقاً من الانتقال للجامعة!`, suggestions: ['كلية المجتمع قطر', 'التدريب المهني', 'تحسين المعدل'] };
}

/**
 * Process a user message and return { text, suggestions }
 * ═══════════════════════════════════════════════════════
 * الترتيب الذكي:
 *   0. استرجاع ملف المستخدم وتاريخ المحادثة
 *   1. التحقق من طلب الترحيب / الرسالة الأولى
 *   2. البحث في قاعدة المعرفة (كاش)       → أسرع
 *   3. البحث في الردود المحلية (keywords)  → مضمون
 *   4. Gemini AI كـ Fallback              → أذكى
 *   5. حفظ رد Gemini في الكاش للمستقبل
 *
 * @param {string} userText - نص رسالة المستخدم
 * @param {string|null} phone - رقم هاتف المستخدم (للملف الشخصي)
 * @param {string|null} nationality - 'qatari' | 'non_qatari' | null (legacy)
 */
async function processMessage(userText, phone = null, nationality = null) {
  // ── T-FIX-004: Sanitize input — Prompt Injection Defense ──────────────────
  const { safe, sanitized, reason } = sanitizeInput(userText);
  if (!safe) {
    console.warn(`[Security] Blocked input — reason: ${reason} | phone: ***`);
    return getInjectionResponse();
  }
  const safeMessage = sanitized;

  // ══════════════════════════════════════════════════════
  // T-009: Supabase = مصدر الحقيقة الوحيد للملف الشخصي
  // In-Memory = Cache مؤقت (30 دقيقة TTL) فقط
  // ══════════════════════════════════════════════════════
  let profile = {};
  let conversationHistory = [];
  let supabaseUser = null;
  let profileChanged = false;

  if (phone) {
    // الخطوة 1: تحقق من الكاش المحلي أولاً (أسرع)
    const cachedProfile = getInMemoryProfile(phone);

    if (cachedProfile) {
      // كاش صالح — استخدمه مباشرة
      profile = cachedProfile;
    } else {
      // الكاش فارغ أو منتهي الصلاحية — اسحب من Supabase
      const [dbUser, dbProfile] = await Promise.all([
        getOrCreateUser(phone, nationality).catch(() => null),
        getUserProfileData(phone).catch(() => ({})),
      ]);

      supabaseUser = dbUser;

      if (dbProfile && Object.keys(dbProfile).length > 0) {
        profile = dbProfile;
        // احفظ في الكاش المحلي
        saveInMemoryProfile(phone, profile);
      }
    }

    // الخطوة 2: استرجاع المستخدم من Supabase إذا لم يُسترجع بعد
    if (!supabaseUser) {
      supabaseUser = await getOrCreateUser(phone, profile.nationality || nationality).catch(() => null);
    }

    // الخطوة 3: استرجاع تاريخ المحادثة (آخر 10 رسائل)
    if (supabaseUser) {
      const history = await getConversationHistory(supabaseUser.id).catch(() => []);
      conversationHistory = history.map(h => ({
        role: h.role,
        content: h.message,
      }));
    }
  }

  // تحديث الملف من رسالة المستخدم الحالية
  const profileBefore = JSON.stringify(profile);
  profile = buildUserProfile(userText, profile);
  profileChanged = JSON.stringify(profile) !== profileBefore;

  // ── T-011: تحديث مرحلة المحادثة ────────────────────────
  const currentStage = profile.conversationStage || STAGES.STAGE_0;
  const nextStage = getNextStage(currentStage, profile, userText);
  if (nextStage !== currentStage) {
    profile.conversationStage = nextStage;
    profileChanged = true;
  }

  // الخطوة 4: احفظ في Supabase إذا تغيّر الملف
  if (phone && profileChanged) {
    // حفظ في الكاش المحلي فوراً
    saveInMemoryProfile(phone, profile);
    // حفظ في Supabase بشكل غير متزامن (لا ينتظر)
    saveUserProfileData(phone, profile).catch(() => {});
  } else if (phone && !getInMemoryProfile(phone)) {
    // تأكد أن الكاش محدّث حتى لو لم يتغير الملف
    saveInMemoryProfile(phone, profile);
  }

  // دمج nationality القديمة مع الجديدة
  const effectiveNationality = profile.nationality || nationality;

  // حفظ رسالة المستخدم في التاريخ
  if (supabaseUser) {
    saveMessage(supabaseUser.id, 'user', userText).catch(() => {});
  }

  // بناء سياق الملف الشخصي لـ Gemini
  const profileContext = buildProfileContext(profile);

  // ── 0. أمر حذف البيانات (PDPPL) ──────────────────────
  const qRaw = userText.trim();
  const isDeleteRequest = qRaw.includes('احذف بياناتي') || qRaw.toLowerCase().includes('delete my data');
  if (isDeleteRequest) {
    // تمييز المستخدم للحذف في Supabase
    if (supabaseUser && phone) {
      updateUserProfile(phone, { deletion_requested: true, deletion_requested_at: new Date().toISOString() }).catch(() => {});
    }
    const deleteResponse = {
      text: '🔒 تم استلام طلبك.\n\nسيتم حذف جميع بياناتك الشخصية خلال 30 يوماً وفق قانون PDPPL القطري.\n\nإذا كنت بحاجة لأي مساعدة أكاديمية قبل ذلك، يسعدني خدمتك.',
      suggestions: ['جميع الجامعات', 'الرواتب والوظائف', 'إنهاء المحادثة'],
    };
    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', deleteResponse.text).catch(() => {});
    return deleteResponse;
  }

  // S-009: إعادة البداية
  const qRestart = userText.toLowerCase().trim();
  const isRestartRequest = qRestart.includes('ابدأ من جديد') || qRestart.includes('ابدأ من البداية') ||
      qRestart.includes('مسح المحادثة') || qRestart.includes('محادثة جديدة') || qRestart.includes('reset') ||
      qRestart.includes('نسيت كل شيء') || qRestart.includes('تناسى كل شيء');
  if (isRestartRequest) {
    if (phone) {
      saveInMemoryProfile(phone, {});
      saveUserProfileData(phone, {}).catch(() => {});
    }
    const restartResponse = {
      text: '🔄 تم! بدأنا من جديد.\n\nأنا المرشد الأكاديمي 🎓 — كيف أقدر أساعدك؟\n\nأخبرني: هل أنت طالب/ة تبحث عن جامعة، أم ولي أمر؟',
      suggestions: ['أنا طالب', 'أنا ولي أمر', 'عرض الجامعات'],
    };
    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', restartResponse.text).catch(() => {});
    return restartResponse;
  }

  // ── 1. التحقق من الرسالة الأولى / الترحيب ───────────
  const isFirstMessage = profile.messageCount <= 1;
  const q = userText.toLowerCase().trim();
  const isGreeting = q.includes('مرحبا') || q.includes('هلا') || q.includes('السلام')
    || q.includes('اهلا') || q.includes('هاي') || q === 'hi' || q === 'hello'
    || q.includes('ابدأ') || q.includes('مرحبا') || q.includes('أهلاً');

  if (isFirstMessage || isGreeting) {
    const result = findResponse(userText);
    if (result.type === 'greeting' || isFirstMessage) {
      const welcome = buildSmartWelcome(profile, effectiveNationality, conversationHistory.length > 0);
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', welcome.text).catch(() => {});
      return welcome;
    }
  }

  // ── 2. سؤال استكشافي (إذا الملف ناقص وأكثر من رسالة) ──
  if (profile.messageCount === 2 && !profile.nationality && !profile.gpa) {
    const profilingQ = getNextProfilingQuestion(profile);
    if (profilingQ) {
      const response = {
        text: profilingQ,
        suggestions: ['أنا قطري', 'أنا مقيم', 'تخطي'],
      };
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
      return response;
    }
  }

  // ── 3. البحث في قاعدة المعرفة (الكاش) ──────────────
  const cachedResponse = await getFromKnowledgeBase(userText).catch(() => null);
  if (cachedResponse) {
    // خصص الاقتراحات حسب الملف
    const smartSuggestions = generateSmartSuggestions(profile, 'knowledge_cache');
    const mergedSuggestions = cachedResponse.suggestions?.length > 0
      ? cachedResponse.suggestions
      : smartSuggestions;

    const response = {
      text: cachedResponse.answer,
      suggestions: mergedSuggestions.slice(0, 3),
    };

    if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
    return response;
  }

  // ── 3.5. Semantic Search (T-020) — إذا فشل Jaccard ────
  /* global process */
  if (!cachedResponse && process.env.GEMINI_API_KEY) {
    const semanticResult = await semanticSearch(userText).catch(() => null);
    if (semanticResult) {
      const response = {
        text: semanticResult.answer,
        suggestions: ['تفاصيل أكثر', 'سؤال آخر', 'جميع الجامعات'],
        source: 'semantic_cache',
        similarity: semanticResult.similarity,
      };
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
      return response;
    }
  }

  // ── 4. البحث في الردود المحلية ────────────────────────
  const result = findResponse(userText);

  // ── تصحيح المنح حسب جنسية الملف الشخصي ────────────
  // إذا كان findResponse() أرجع scholarship_amiri لكن المستخدم غير قطري → صحّح تلقائياً
  if (result.type === 'response' && result.key === 'scholarship_amiri') {
    const isNonQatariProfile = effectiveNationality === 'non_qatari'
      || profile.nationality === 'non_qatari'
      || profile.userType === 'non_qatari_student';
    if (isNonQatariProfile) {
      result.key = 'scholarship_non_qatari';
    }
  }

  let response;
  let contextKey = null;

  switch (result.type) {
    case 'response': {
      const resp = ALL_RESPONSES[result.key];
      if (!resp) { response = getDefaultResponse(profile); break; }
      response = { text: resp.text, suggestions: resp.suggestions || [] };
      contextKey = result.key;
      break;
    }

    case 'grade': {
      response = gradeResponse(result.grade, result.track || profile.track);
      // T-009: حدّث الملف بالمعدل في Supabase وInMemory معاً
      if (!profile.gpa || profile.gpa !== result.grade) {
        profile.gpa = result.grade;
        if (phone) {
          saveInMemoryProfile(phone, profile);
          saveUserProfileData(phone, profile).catch(() => {});
        }
      }
      contextKey = 'grade';
      break;
    }

    case 'greeting': {
      const welcome = buildSmartWelcome(profile, effectiveNationality, conversationHistory.length > 0);
      if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', welcome.text).catch(() => {});
      return welcome;
    }

    default: {
      // ── 5. Gemini AI Fallback ─────────────────────────
      // أضف سياق الملف الشخصي للسؤال
      const enrichedQuestion = profileContext
        ? `${profileContext}\n\nسؤال المستخدم: ${safeMessage}`
        : safeMessage;

      const aiResponse = await getAIResponse(enrichedQuestion, conversationHistory).catch(() => null);

      if (aiResponse) {
        // حفظ الرد في قاعدة المعرفة للاستخدام المستقبلي
        saveToKnowledgeCache(userText, aiResponse.text, aiResponse.suggestions).catch(() => {});

        // اقتراحات ذكية مخصصة
        const smartSuggestions = generateSmartSuggestions(profile, 'ai');
        const finalSuggestions = aiResponse.suggestions?.length > 0
          ? aiResponse.suggestions
          : smartSuggestions;

        const finalResponse = { text: aiResponse.text, suggestions: finalSuggestions.slice(0, 3) };
        if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', finalResponse.text).catch(() => {});
        return finalResponse;
      }

      response = getDefaultResponse(profile);
      contextKey = null;
      break;
    }
  }

  // تطبيق سياق الجنسية
  if (contextKey && effectiveNationality) {
    response = addNationalityContext(response, effectiveNationality, contextKey);
  }

  // استبدال الاقتراحات بأخرى ذكية بناءً على الملف
  if (profile.gpa || profile.nationality || profile.track) {
    const smartSuggs = generateSmartSuggestions(profile, contextKey || '');
    if (smartSuggs.length > 0 && (!response.suggestions || response.suggestions.length === 0)) {
      response.suggestions = smartSuggs;
    }
  }

  // ── T-011: سؤال المرحلة التالية ────────────────────────
  const stagePrompt = getStagePrompt(profile.conversationStage || STAGES.STAGE_0, profile);
  if (stagePrompt && response.text && !response.text.includes(stagePrompt)) {
    // أضف سؤال المرحلة في نهاية الرد إذا لم يكن موجوداً مسبقاً
    response.text = response.text + '\n\n━━━━━━━━\n' + stagePrompt;
  }

  // ── T-011: تقرير نهائي عند STAGE_6 ─────────────────────
  if (isConversationComplete(profile.conversationStage) && result.type === 'unknown') {
    response = generateFinalReport(profile);
  }

  if (supabaseUser) saveMessage(supabaseUser.id, 'assistant', response.text).catch(() => {});
  return response;
}

// ══════════════════════════════════════════════════════
// رسالة الترحيب الذكية المخصصة
// ══════════════════════════════════════════════════════
// إشعار خصوصية PDPPL — يُضاف فقط للمستخدمين الجدد
const PDPPL_NOTICE = '\n\n🔒 ملاحظة: بياناتك محفوظة بسرية تامة وفق قانون PDPPL القطري. لحذف بياناتك اكتب: \'احذف بياناتي\'';

function buildSmartWelcome(profile, nationality, hasHistory = false) {
  const { userType, gpa } = profile;

  // إذا كان هناك تاريخ → تحية عودة (بدون إشعار PDPPL — المستخدم رآه سابقاً)
  if (hasHistory) {
    const returnGreeting = {
      text: `أهلاً بعودتك! 👋\n\nأتذكرك — يسعدني مواصلة إرشادك.\n${gpa ? `معدلك ${gpa}%` : ''}\n\nما الذي تريد معرفته اليوم؟`,
      suggestions: generateSmartSuggestions(profile, 'return'),
    };
    return returnGreeting;
  }

  // ولي أمر
  if (userType === USER_TYPES.PARENT) {
    return {
      text: `أهلاً بك! 🎓\n\nيسعدني مساعدتك في إرشاد أبنائك نحو المستقبل الأكاديمي المناسب.\n\nلأقدم لك إرشاداً دقيقاً، أخبرني:\n• ما جنسية ابنك/ابنتك؟ (قطري / مقيم)\n• ما معدله/ها في الثانوية أو المتوقع؟\n• هل لديه تخصص أو مجال مفضّل؟` + PDPPL_NOTICE,
      suggestions: ['ابني قطري', 'ابنتي مقيمة', 'معدله 85%'],
    };
  }

  // طالب دراسات عليا / خريج
  if (userType === USER_TYPES.STUDENT_GRAD) {
    return {
      text: `أهلاً! 🎓\n\nأنت تبحث عن الدراسات العليا في قطر — خيار ممتاز!\n\nقطر فيها فرص ماجستير ودكتوراه رائعة، أبرزها:\n• **HBKU** — منح كاملة لجميع الجنسيات\n• **جامعة قطر** — 40+ برنامج عالي\n• **كليات المدينة التعليمية** — معايير دولية\n\nأخبرني: ما تخصصك وماذا تريد دراسة؟` + PDPPL_NOTICE,
      suggestions: ['برامج الماجستير في HBKU', 'دكتوراه في قطر', 'شروط الدراسات العليا'],
    };
  }

  // طالب بمعدل معروف
  if (gpa) {
    const gradeResp = gradeResponse(gpa, profile.track);
    return {
      text: `أهلاً! 🎓 رأيت معدلك **${gpa}%** — دعني أرشدك مباشرة:\n\n${gradeResp.text}` + PDPPL_NOTICE,
      suggestions: gradeResp.suggestions?.slice(0, 3) || generateSmartSuggestions(profile, 'grade'),
    };
  }

  // حسب الجنسية
  if (nationality === 'non_qatari') {
    return {
      text: '🎓 *أهلاً بك في المرشد الأكاديمي!*\n🌍 مرحباً بالطالب/ة المقيم/ة في قطر\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n📋 **خياراتك المتاحة:**\n• **HBKU** — منح كاملة لجميع الجنسيات\n• **جامعة قطر** — رسوم مدعومة\n• **المدينة التعليمية** — 8 جامعات عالمية\n• UDST وجامعة لوسيل\n\n💡 أرسل معدلك أو اسأل عن أي تخصص!' + PDPPL_NOTICE,
      suggestions: ['منح HBKU لجميع الجنسيات', 'المدينة التعليمية', 'رسوم الجامعات للمقيمين'],
    };
  }

  if (nationality === 'qatari') {
    return {
      text: '🎓 *أهلاً بك في المرشد الأكاديمي!*\n🇶🇦 مرحباً بالطالب/ة القطري/ة\n\nأنا هنا لمساعدتك في اختيار مستقبلك الأكاديمي.\n\n✅ **مميزاتك كقطري/ة:**\n• جامعة قطر مجانية + مكافأة شهرية\n• الكليات العسكرية متاحة\n• برنامج طموح (22,000-25,000 ريال/شهر)\n• منح الشركات: قطر للطاقة، خطوط قطرية، QNB\n\n💡 أرسل معدلك أو اسأل عن أي تخصص!' + PDPPL_NOTICE,
      suggestions: ['منح القطريين', 'الكليات العسكرية', 'برنامج طموح للخارج'],
    };
  }

  // افتراضي — الترحيب العام الذكي
  const defaultWelcome = getWelcomeMessage();
  return {
    ...defaultWelcome,
    text: defaultWelcome.text + PDPPL_NOTICE,
  };
}

function getDefaultResponse(profile = {}) {
  const smartSuggs = generateSmartSuggestions(profile, 'default');
  return {
    text: '🤔 لم أفهم سؤالك بالضبط.\n\nجرّب أحد هذه:\n• اكتب اسم جامعة (مثل: كارنيجي ميلون)\n• اكتب معدلك (مثل: 85%)\n• اسأل عن تخصص (مثل: هندسة البترول)\n• اكتب "جامعات" لعرض القائمة الكاملة',
    suggestions: smartSuggs.length > 0 ? smartSuggs : ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية'],
  };
}

export { findResponse, gradeResponse, processMessage };
