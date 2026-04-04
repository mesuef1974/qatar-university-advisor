/**
 * User Profiler — نظام التعرف على المستخدم وقيادة المحادثة ذكياً
 * ════════════════════════════════════════════════════════════════
 * يُحدد:
 *   - نوع المستخدم (طالب / ولي أمر / أخرى)
 *   - جنسيته (قطري / غير قطري)
 *   - مرحلته الدراسية
 *   - مساره (علمي / أدبي / تجاري)
 *   - معدله التقريبي
 * ثم يُعدّل أسلوب الرد والاقتراحات بناءً على الملف الشخصي
 */

// ══════════════════════════════════════════════════════
// 1. كشف نوع المستخدم من النص
// ══════════════════════════════════════════════════════

/**
 * أنواع المستخدمين المدعومة
 */
const USER_TYPES = {
  STUDENT_HS:       'student_highschool',      // طالب ثانوية عامة
  STUDENT_PRIVATE:  'student_private_school',  // طالب مدارس أهلية/خاصة
  STUDENT_UNI:      'student_university',      // طالب جامعي (انتقال / دراسات عليا)
  STUDENT_GRAD:     'student_graduate',        // خريج يبحث عن ماجستير
  PARENT:           'parent',                  // ولي أمر
  GENERAL:          'general',                 // غير محدد
};

// كلمات دلالية لكل نوع
const TYPE_SIGNALS = {
  [USER_TYPES.PARENT]: [
    'ابني', 'ابنتي', 'ولدي', 'بنتي', 'ابني معدله', 'ابنتي معدلها',
    'ابن أخي', 'بنت أختي', 'أخوي', 'أختي', 'ولد أختي',
    'أخي معدله', 'حفيدي', 'حفيدتي', 'أنا أب', 'أنا أم', 'أنا أخ', 'أنا أخت',
    'أنا جد', 'أنا جدة', 'والده', 'والدها', 'عمره', 'عمرها',
    'تخرج من الثانوية', 'تخرجت من الثانوية',
  ],
  [USER_TYPES.STUDENT_GRAD]: [
    'خريج', 'خريجة', 'ماجستير', 'دكتوراه', 'تخصص عالي', 'دراسات عليا',
    'تخرجت', 'تخرجت من الجامعة', 'حاصل على بكالوريوس', 'لدي بكالوريوس',
    'أريد إكمال دراستي', 'بعد التخرج',
  ],
  [USER_TYPES.STUDENT_UNI]: [
    'طالب جامعي', 'طالبة جامعية', 'السنة الأولى', 'السنة الثانية',
    'أريد التحويل', 'تحويل من جامعة', 'في الجامعة حالياً',
    'مرحلة الجامعة', 'القبول للجامعة',
  ],
};

/**
 * يكشف نوع المستخدم من رسائله
 * @param {string} text - نص الرسالة
 * @param {object} existingProfile - الملف الحالي (قد يكون ناقصاً)
 * @returns {string} USER_TYPE
 */
function detectUserType(text, existingProfile = {}) {
  if (existingProfile.userType) return existingProfile.userType;
  const q = text.toLowerCase();

  for (const [type, signals] of Object.entries(TYPE_SIGNALS)) {
    if (signals.some(sig => q.includes(sig.toLowerCase()))) {
      return type;
    }
  }

  // إذا ذكر معدل الثانوية → طالب
  if (/معدل[\s:]*([\d.]+)%?/.test(q) || /(\d{2,3})[%٪]/.test(q)) {
    return USER_TYPES.STUDENT_HS;
  }

  return USER_TYPES.GENERAL;
}

// ══════════════════════════════════════════════════════
// 2. كشف الجنسية
// ══════════════════════════════════════════════════════

const QATARI_SIGNALS = [
  'قطري', 'قطرية', 'أنا من قطر', 'جنسيتي قطرية', 'مواطن قطري',
  'جواز قطري', 'الهوية القطرية', 'قطر وطني',
];

const NON_QATARI_SIGNALS = [
  'مقيم', 'مقيمة', 'إقامة', 'وافد', 'وافدة', 'أجنبي', 'أجنبية',
  'غير قطري', 'غير قطرية', 'أنا من', 'جنسيتي', 'حامل إقامة',
  'أسكن في قطر', 'أعيش في قطر',
];

/**
 * يكشف جنسية المستخدم
 * @param {string} text
 * @param {object} existingProfile
 * @returns {'qatari' | 'non_qatari' | null}
 */
function detectNationality(text, existingProfile = {}) {
  if (existingProfile.nationality) return existingProfile.nationality;
  const q = text.toLowerCase();

  if (QATARI_SIGNALS.some(s => q.includes(s.toLowerCase()))) return 'qatari';
  if (NON_QATARI_SIGNALS.some(s => q.includes(s.toLowerCase()))) return 'non_qatari';
  return null;
}

// ══════════════════════════════════════════════════════
// 3. كشف المسار الدراسي
// ══════════════════════════════════════════════════════

const TRACK_SIGNALS = {
  'scientific': ['علمي', 'العلمي', 'مسار علمي', 'علوم', 'فيزياء', 'كيمياء', 'أحياء', 'رياضيات'],
  'literary': ['أدبي', 'الأدبي', 'مسار أدبي', 'آداب', 'تاريخ', 'جغرافيا', 'اجتماعيات'],
  'commercial': ['تجاري', 'التجاري', 'محاسبة', 'اقتصاد', 'إدارة أعمال', 'مسار تجاري'],
  'technical': ['تقني', 'فني', 'مسار تقني', 'معهد', 'دبلوم فني'],
};

function detectTrack(text, existingProfile = {}) {
  if (existingProfile.track) return existingProfile.track;
  const q = text.toLowerCase();

  for (const [track, signals] of Object.entries(TRACK_SIGNALS)) {
    if (signals.some(s => q.includes(s.toLowerCase()))) return track;
  }
  return null;
}

// ══════════════════════════════════════════════════════
// 4. كشف المعدل
// ══════════════════════════════════════════════════════

/**
 * يستخرج المعدل من النص
 * يدعم: "معدلي 85%"، "85٪"، "85"، "معدل 85.5"
 * @param {string} text
 * @returns {number | null}
 */
function extractGPA(text) {
  // نمط: رقم متبوع بـ % أو ٪
  let match = text.match(/(\d{1,3}(?:\.\d{1,2})?)\s*[%٪]/);
  if (match) {
    const val = parseFloat(match[1]);
    if (val >= 40 && val <= 100) return val;
  }

  // نمط: "معدلي 85" أو "معدل 85"
  match = text.match(/معدل[يها\s]+(\d{1,3}(?:\.\d{1,2})?)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (val >= 40 && val <= 100) return val;
  }

  // نمط: رقم وحيد 2-3 أرقام (احتمالية)
  match = text.match(/\b(\d{2,3}(?:\.\d{1,2})?)\b/);
  if (match) {
    const val = parseFloat(match[1]);
    if (val >= 50 && val <= 100) return val;
  }

  return null;
}

// ══════════════════════════════════════════════════════
// 5. بناء ملف المستخدم
// ══════════════════════════════════════════════════════

/**
 * يبني/يحدث ملف المستخدم من رسالة جديدة
 * @param {string} message - الرسالة الجديدة
 * @param {object} existingProfile - الملف الحالي
 * @returns {object} profile محدّث
 */
function buildUserProfile(message, existingProfile = {}) {
  const profile = { ...existingProfile };

  // تحديث نوع المستخدم
  const detectedType = detectUserType(message, profile);
  if (detectedType !== USER_TYPES.GENERAL || !profile.userType) {
    profile.userType = detectedType;
  }

  // تحديث الجنسية
  const nationality = detectNationality(message, profile);
  if (nationality) profile.nationality = nationality;

  // تحديث المسار
  const track = detectTrack(message, profile);
  if (track) profile.track = track;

  // تحديث المعدل
  const gpa = extractGPA(message);
  if (gpa) profile.gpa = gpa;

  // عدد الرسائل
  profile.messageCount = (profile.messageCount || 0) + 1;

  return profile;
}

// ══════════════════════════════════════════════════════
// 6. توليد السياق للـ AI
// ══════════════════════════════════════════════════════

const USER_TYPE_LABELS = {
  [USER_TYPES.STUDENT_HS]:      'طالب/ة ثانوية عامة',
  [USER_TYPES.STUDENT_PRIVATE]: 'طالب/ة في مدرسة خاصة/أهلية',
  [USER_TYPES.STUDENT_UNI]:     'طالب/ة جامعي/ة',
  [USER_TYPES.STUDENT_GRAD]:    'خريج/ة يبحث/تبحث عن دراسات عليا',
  [USER_TYPES.PARENT]:          'ولي أمر',
  [USER_TYPES.GENERAL]:         'مستخدم',
};

const NATIONALITY_LABELS = {
  qatari:     'قطري/ة',
  non_qatari: 'مقيم/ة (غير قطري)',
};

const TRACK_LABELS = {
  scientific:  'المسار العلمي',
  literary:    'المسار الأدبي',
  commercial:  'المسار التجاري',
  technical:   'المسار التقني',
};

/**
 * يُنشئ سياقاً نصياً يُضاف لطلب Gemini ليُخصص الرد
 * @param {object} profile - ملف المستخدم
 * @returns {string} نص السياق
 */
function buildProfileContext(profile) {
  if (!profile || Object.keys(profile).length === 0) return '';

  const parts = [];

  if (profile.userType) {
    parts.push(`نوع المتحدث: ${USER_TYPE_LABELS[profile.userType] || profile.userType}`);
  }

  if (profile.nationality) {
    parts.push(`الجنسية: ${NATIONALITY_LABELS[profile.nationality] || profile.nationality}`);
  }

  if (profile.track) {
    parts.push(`المسار الدراسي: ${TRACK_LABELS[profile.track] || profile.track}`);
  }

  if (profile.gpa) {
    parts.push(`المعدل: ${profile.gpa}%`);
  }

  if (parts.length === 0) return '';

  return `[معلومات المتحدث: ${parts.join(' | ')}]`;
}

// ══════════════════════════════════════════════════════
// 7. توليد رسالة الترحيب الذكي
// ══════════════════════════════════════════════════════

/**
 * يُولّد رسالة ترحيب أولى ذكية تبدأ بجمع معلومات المستخدم
 * @returns {{ text, suggestions }}
 */
function getWelcomeMessage() {
  return {
    text: `مرحباً بك في *المرشد* 🎓 — مستشارك الأكاديمي الذكي لجامعات قطر!

أنا هنا لمساعدتك في:
• اختيار الجامعة والتخصص المناسب
• معرفة شروط القبول والمعدلات المطلوبة
• استكشاف المنح والابتعاث الداخلي والخارجي
• مقارنة الرواتب وفرص العمل

لأقدم لك إرشاداً دقيقاً، أخبرني:
هل أنت *طالب/ة* تبحث عن جامعة، أم *ولي أمر* تسأل عن مستقبل أبنائك؟`,
    suggestions: ['أنا طالب ثانوية', 'أنا ولي أمر', 'أبحث عن منح دراسية'],
  };
}

// ══════════════════════════════════════════════════════
// 8. توليد الأسئلة الاستكشافية حسب الملف
// ══════════════════════════════════════════════════════

/**
 * يُقترح السؤال التالي لاستكمال ملف المستخدم
 * @param {object} profile
 * @returns {string | null} سؤال استكشافي، أو null إذا اكتمل الملف
 */
function getNextProfilingQuestion(profile) {
  if (!profile.userType || profile.userType === USER_TYPES.GENERAL) {
    return null; // سيُعالج بالترحيب
  }

  if (!profile.nationality) {
    return 'هل أنت قطري/ة أم مقيم/ة في قطر؟ (يؤثر على شروط القبول والمنح)';
  }

  if (!profile.gpa && [USER_TYPES.STUDENT_HS, USER_TYPES.STUDENT_PRIVATE].includes(profile.userType)) {
    return 'ما معدلك في الثانوية؟ (أو التقديري إذا لم تتخرج بعد)';
  }

  if (!profile.track && [USER_TYPES.STUDENT_HS, USER_TYPES.STUDENT_PRIVATE].includes(profile.userType)) {
    return 'ما مسارك الدراسي؟ (علمي / أدبي / تجاري)';
  }

  return null;
}

// ══════════════════════════════════════════════════════
// 9. توليد الاقتراحات الذكية بناءً على الملف
// ══════════════════════════════════════════════════════

/**
 * يُولّد اقتراحات مخصصة بناءً على ملف المستخدم وسياق المحادثة
 * @param {object} profile
 * @param {string} lastTopic - آخر موضوع تم التحدث عنه
 * @returns {string[]} قائمة اقتراحات (3 كحد أقصى)
 */
function generateSmartSuggestions(profile, _lastTopic = '') {
  const { userType, nationality, gpa, track } = profile || {};

  // ولي أمر
  if (userType === USER_TYPES.PARENT) {
    return [
      nationality === 'qatari' ? 'شروط القبول للقطريين' : 'شروط القبول للمقيمين',
      'أفضل الجامعات حسب المعدل',
      'المنح والبعثات المتاحة',
    ];
  }

  // طالب دراسات عليا
  if (userType === USER_TYPES.STUDENT_GRAD) {
    return [
      'برامج الماجستير في HBKU',
      'شروط قبول الدراسات العليا',
      'منح البحث العلمي في قطر',
    ];
  }

  // طالب بمعدل محدد
  if (gpa) {
    if (gpa >= 90) {
      return [
        'الجامعات الأنسب لمعدل 90%+',
        nationality === 'qatari' ? 'برنامج طموح للخارج' : 'منح HBKU لجميع الجنسيات',
        'تخصصات المستقبل الأعلى راتباً',
      ];
    }
    if (gpa >= 80) {
      return [
        'الجامعات المناسبة لمعدل 80-89%',
        'المنح الداخلية في قطر',
        nationality === 'qatari' ? 'سبونسرز الشركات القطرية' : 'رسوم الجامعات للمقيمين',
      ];
    }
    if (gpa >= 70) {
      return [
        'جامعة قطر للمعدلات 70-79%',
        'UDST — تطبيقي ومهني',
        'تخصصات لا تحتاج معدلاً عالياً',
      ];
    }
    // أقل من 70
    return [
      'UDST وبرامج الدبلوم',
      'كلية المجتمع CCQ',
      'رفع المعدل وإعادة التقديم',
    ];
  }

  // اقتراحات حسب المسار
  if (track === 'scientific') {
    return [
      'تخصصات الهندسة في قطر',
      'معدلات قبول كلية الطب',
      'أفضل جامعات العلوم في قطر',
    ];
  }
  if (track === 'literary') {
    return [
      'تخصصات الأدبي في QU',
      'القانون والشؤون الدولية',
      'تخصصات الإعلام والصحافة',
    ];
  }
  if (track === 'commercial') {
    return [
      'تخصصات إدارة الأعمال',
      'المحاسبة والتمويل في قطر',
      'منح الشركات التجارية',
    ];
  }

  // اقتراحات حسب الجنسية
  if (nationality === 'qatari') {
    return [
      'المنح والبعثات للقطريين',
      'الجامعات المجانية للقطريين',
      'أفضل التخصصات مستقبلاً',
    ];
  }
  if (nationality === 'non_qatari') {
    return [
      'منح HBKU لجميع الجنسيات',
      'رسوم الجامعات للمقيمين',
      'شروط القبول للمقيمين',
    ];
  }

  // افتراضي
  return [
    'جميع الجامعات في قطر',
    'المنح والابتعاث',
    'أفضل التخصصات مستقبلاً',
  ];
}

// ══════════════════════════════════════════════════════
// 10. T-009: كاش In-Memory مع TTL 30 دقيقة
// ══════════════════════════════════════════════════════
// هذا الكاش مؤقت فقط — Supabase هو المصدر الحقيقي
// Vercel Serverless = instances متعددة → لا نعتمد على الذاكرة

const inMemoryProfiles = new Map(); // phone → { profile, cachedAt }
const MAX_PROFILES = 500;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 دقيقة

/**
 * يسترجع ملف المستخدم من الذاكرة إذا لم يتجاوز الـ TTL
 * @param {string} phone
 * @returns {object|null} profile أو null إذا انتهت المدة
 */
function getInMemoryProfile(phone) {
  const entry = inMemoryProfiles.get(phone);
  if (!entry) return null;

  const age = Date.now() - entry.cachedAt;
  if (age > CACHE_TTL_MS) {
    inMemoryProfiles.delete(phone); // حذف المنتهي الصلاحية
    return null;
  }

  return entry.profile;
}

/**
 * يحفظ ملف المستخدم في الذاكرة مع طابع زمني
 * @param {string} phone
 * @param {object} profile
 */
function saveInMemoryProfile(phone, profile) {
  if (inMemoryProfiles.size >= MAX_PROFILES) {
    // احذف الأقدم عند امتلاء الذاكرة
    const firstKey = inMemoryProfiles.keys().next().value;
    inMemoryProfiles.delete(firstKey);
  }
  inMemoryProfiles.set(phone, { profile, cachedAt: Date.now() });
}

/**
 * يُبطل كاش مستخدم محدد (عند تحديث البيانات في Supabase)
 * @param {string} phone
 */
function invalidateInMemoryProfile(phone) {
  inMemoryProfiles.delete(phone);
}

export {
  USER_TYPES,
  detectUserType,
  detectNationality,
  detectTrack,
  extractGPA,
  buildUserProfile,
  buildProfileContext,
  getWelcomeMessage,
  getNextProfilingQuestion,
  generateSmartSuggestions,
  getInMemoryProfile,
  saveInMemoryProfile,
  invalidateInMemoryProfile,
};
