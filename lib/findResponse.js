import { ALL_RESPONSES, CAREER_TEST } from './responses.js';
import { getAIResponse } from './ai-handler.js';
import { addNationalityContext } from './nationality-advisor.js';

/**
 * Find the best response for a user message
 * Ported from QatarUniversityAdvisor.jsx findResponse logic
 */
function findResponse(text) {
  const q = text.toLowerCase().trim();

  // --- Helper: scholarship context detection ---
  const isScholarshipContext = q.includes('منح') || q.includes('ابتعاث') || q.includes('بعثة') || q.includes('سبونسر') || q.includes('راعي') || q.includes('رعاية');

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

  // Non-Qatari scholarships
  if ((q.includes('غير قطري') || q.includes('مقيم') || q.includes('وافد') || q.includes('أجنبي') || q.includes('منح دولية')) && isScholarshipContext)
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

  // Scholarships generic
  if (q.includes('منح') || q.includes('ابتعاث') || q.includes('مجان') || q.includes('تمويل'))
    return { type: 'response', key: 'scholarship_amiri' };

  // Non-Qatari generic
  if (q.includes('غير قطري') || q.includes('وافد') || q.includes('أجنبي'))
    return { type: 'response', key: 'scholarship_non_qatari' };

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
 * @param {string} userText - the user's message
 * @param {string|null} nationality - 'qatari' | 'non_qatari' | null
 */
async function processMessage(userText, nationality = null) {
  const result = findResponse(userText);

  let response;
  let contextKey = null;

  switch (result.type) {
    case 'response': {
      const resp = ALL_RESPONSES[result.key];
      if (!resp) { response = getDefaultResponse(); break; }
      response = { text: resp.text, suggestions: resp.suggestions || [] };
      contextKey = result.key;
      break;
    }

    case 'grade': {
      response = gradeResponse(result.grade, result.track);
      contextKey = 'grade';
      break;
    }

    case 'greeting': {
      // Don't add nationality context to greetings - the welcome screen handles it
      return {
        text: nationality === 'non_qatari'
          ? '🎓 *أهلاً بك في المستشار الجامعي الذكي!*\n🌍 مرحباً بالطالب/ة المقيم/ة في قطر\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n📋 **خياراتك المتاحة:**\n• جامعة قطر (رسوم مدعومة + منح)\n• المدينة التعليمية (منح كاملة من مؤسسة قطر)\n• HBKU (منح ممولة بالكامل لجميع الجنسيات)\n• جامعة لوسيل وUDST والكليات الخاصة\n• منحة الفاخورة للمقيمين\n\n💡 أرسل معدلك أو اسأل عن أي تخصص!'
          : nationality === 'qatari'
            ? '🎓 *أهلاً بك في المستشار الجامعي الذكي!*\n🇶🇦 مرحباً بالطالب/ة القطري/ة\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك.\n\n✅ **مميزاتك:**\n• جامعة قطر مجانية بالكامل\n• الكليات العسكرية متاحة\n• الابتعاث الأميري والخارجي\n• منح قطر للطاقة والخطوط القطرية وQNB\n• برنامج طموح (حتى 25,000 ريال/شهر)\n\n💡 أرسل معدلك أو اسأل عن أي تخصص!'
            : '🎓 *أهلاً بك في المستشار الجامعي الذكي!*\n\nأنا هنا لمساعدتك في اختيار جامعتك وتخصصك في قطر.\n\n💡 يمكنك سؤالي عن:\n• أي جامعة في قطر\n• شروط القبول والمعدلات\n• خطط دراسية تفصيلية\n• الرواتب وفرص العمل\n• المنح والابتعاث\n• الكليات العسكرية\n\nأو أرسل لي معدلك (مثلاً: 85%) وسأخبرك بالجامعات المتاحة!',
        suggestions: nationality === 'non_qatari'
          ? ['منح لغير القطريين', 'جامعات المدينة التعليمية', 'HBKU منح كاملة', 'أرسل معدلك']
          : nationality === 'qatari'
            ? ['جميع الجامعات', 'الابتعاث الأميري', 'الكليات العسكرية', 'مواعيد التقديم']
            : ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية', 'مواعيد التقديم'],
      };
    }

    default: {
      // Try AI fallback for unknown messages
      const aiResponse = await getAIResponse(userText);
      if (aiResponse) return aiResponse;
      response = getDefaultResponse();
      contextKey = null;
      break;
    }
  }

  // Apply nationality-specific context
  if (contextKey && nationality) {
    response = addNationalityContext(response, nationality, contextKey);
  }

  return response;
}

function getDefaultResponse() {
  return {
    text: '🤔 لم أفهم سؤالك بالضبط.\n\nجرّب أحد هذه:\n• اكتب اسم جامعة (مثل: كارنيجي ميلون)\n• اكتب معدلك (مثل: 85%)\n• اسأل عن تخصص (مثل: هندسة البترول)\n• اكتب "جامعات" لعرض القائمة الكاملة',
    suggestions: ['جميع الجامعات', 'الرواتب والوظائف', 'الكليات العسكرية'],
  };
}

export { findResponse, gradeResponse, processMessage };
