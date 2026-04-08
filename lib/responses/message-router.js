/**
 * Message Router — Qatar University Advisor
 * ══════════════════════════════════════════
 * مُستخرج من findResponse.js كجزء من تقسيم God File
 * T-Q7-T010: تحسين قابلية الصيانة
 *
 * يحتوي هذا الملف على منطق التوجيه الكامل (keyword dispatcher):
 *   findResponse(text) → { type, key } | { type: 'grade', grade, track } | { type: 'greeting' } | { type: 'unknown' }
 *
 * لا يعتمد على أي خدمة خارجية — منطق محلي بحت.
 */

/**
 * Find the best response key for a user message using keyword matching.
 * Returns a routing object — the caller resolves the actual text from ALL_RESPONSES.
 *
 * @param {string} text - رسالة المستخدم (خام)
 * @returns {{ type: string, key?: string, grade?: number, track?: string }}
 */
export function findResponse(text) {
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

  // Non-Qatari scholarships
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
  // ذكاء اصطناعي / AI — يُفحص قبل ماجستير (لأن "ماجستير ذكاء اصطناعي" يجب أن يذهب لبرامج AI)
  // ══════════════════════════════════════════
  if (q.includes('ذكاء اصطناعي') || q.includes('artificial intelligence') || q.includes('تعلم آلي') || q.includes('machine learning'))
    return { type: 'response', key: 'ai_programs' };

  // ══════════════════════════════════════════
  // ماجستير / دراسات عليا — يُفحص قبل الموضوعات العامة
  // ══════════════════════════════════════════
  if (q.includes('ماجستير') || q.includes('دراسات عليا') || q.includes('ماستر') || q.includes('master') || q.includes('graduate'))
    return { type: 'response', key: 'graduate_programs' };

  // ══════════════════════════════════════════
  // Generic topic matchers (extended — outside study plan context)
  // ══════════════════════════════════════════

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

  // ── دبلوم ──
  if (q.includes('دبلوم') || q.includes('كلية المجتمع') || q.includes('diploma'))
    return { type: 'response', key: 'diploma_programs' };

  // ── سكن / إقامة ──
  if (q.includes('سكن') || q.includes('إقامة') || q.includes('housing') || q.includes('accommodation'))
    return { type: 'response', key: 'housing_info' };

  // ── رسوم / تكاليف ──
  if (q.includes('رسوم') || q.includes('تكلفة') || q.includes('كم سعر') || q.includes('fees') || q.includes('cost'))
    return { type: 'response', key: 'fees_overview' };

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
