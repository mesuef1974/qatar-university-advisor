/**
 * بيانات الجامعات القطرية — 2025/2026
 * T-Q7-T016: تحديث المحتوى الأكاديمي
 * المصدر: المواقع الرسمية للجامعات + وزارة التعليم والتعليم العالي قطر
 * آخر تحديث: أبريل 2026
 */

export const UNIVERSITIES_2026 = {

  // ══════════════════════════════════════════════════════
  // جامعة قطر (QU)
  // ══════════════════════════════════════════════════════
  QU: {
    nameAr: 'جامعة قطر',
    nameEn: 'Qatar University',
    website: 'https://www.qu.edu.qa',
    admissionsUrl: 'https://www.qu.edu.qa/ar/admissions',
    location: 'الدوحة — حي الطريق الغربي',
    type: 'حكومية',
    founded: 1977,

    admissionRequirements: {
      qatari: {
        minGPA: 60,
        scientificTrack: { minGPA: 60, englishLevel: 'IELTS 5.0+' },
        literaryTrack:   { minGPA: 65, englishLevel: 'IELTS 4.5+' },
        commercialTrack: { minGPA: 60, englishLevel: 'IELTS 4.5+' },
      },
      nonQatari: {
        minGPA: 80,
        additionalRequirements: 'شهادة ثانوية معادلة معتمدة',
      },
    },

    applicationDeadlines: {
      fallSemester2026: {
        open:  '2025-02-01',
        close: '2025-05-31',
        results: '2025-06-30',
      },
      springSemester2026: {
        open:  '2025-09-01',
        close: '2025-11-30',
        results: '2025-12-31',
      },
    },

    colleges: [
      'كلية الهندسة',
      'كلية الطب',
      'كلية الأعمال والاقتصاد',
      'كلية الحاسوب والعلوم',
      'كلية الحقوق',
      'كلية الصيدلة',
      'كلية العلوم الصحية',
      'كلية الفنون والعلوم',
      'كلية التربية',
      'كلية الشريعة والدراسات الإسلامية',
    ],

    scholarships: {
      qatari: {
        name: 'المنحة الحكومية القطرية الكاملة',
        coverage: 'مصروفات دراسية + مكافأة شهرية 1200 ريال',
        conditions: 'قطري الجنسية + معدل 60% فأكثر',
      },
      nonQatari: {
        name: 'منحة العمداء للمتميزين',
        coverage: 'خصم 50% من الرسوم الدراسية',
        conditions: 'معدل 95%+ في الثانوية',
      },
    },

    tuitionFees: {
      qatari: 0,
      nonQatari: {
        perCredit: 'QAR 950',
        perYear: 'QAR 28,500 (تقريباً)',
      },
    },
  },

  // ══════════════════════════════════════════════════════
  // جامعة كارنيغي ميلون — قطر (CMU-Q)
  // ══════════════════════════════════════════════════════
  CMU_Q: {
    nameAr: 'جامعة كارنيغي ميلون — قطر',
    nameEn: 'Carnegie Mellon University Qatar',
    website: 'https://www.qatar.cmu.edu',
    location: 'المدينة التعليمية',
    type: 'أمريكية — فرع قطر',

    programs: [
      'علوم الحاسوب (Computer Science)',
      'نظم المعلومات (Information Systems)',
      'الأعمال والإدارة (Business Administration)',
      'علوم الأحياء الحسابية (Computational Biology)',
    ],

    admissionRequirements: {
      sat: 'SAT: 1350+ (Reading+Math)',
      gpa: 'معدل 90%+ في الثانوية',
      english: 'TOEFL 100+ أو IELTS 7.0+',
      essays: 'مقالات شخصية + توصيات',
      deadline: 'يناير 1 (Early Decision) | أبريل 15 (Regular)',
    },

    tuitionFees: {
      perYear: 'USD 55,000 (تقريباً)',
      qatariScholarship: 'منح كاملة للقطريين المتميزين',
    },

    scholarships: {
      merit: 'Merit Scholarships تصل إلى 100% للقطريين',
      financial: 'Need-based aid للغير قطريين',
    },
  },

  // ══════════════════════════════════════════════════════
  // جامعة تكساس إي&إم — قطر (TAMU-Q)
  // ══════════════════════════════════════════════════════
  TAMU_Q: {
    nameAr: 'جامعة تكساس إي آند إم — قطر',
    nameEn: 'Texas A&M University at Qatar',
    website: 'https://www.qatar.tamu.edu',
    location: 'المدينة التعليمية',
    type: 'أمريكية — فرع قطر',

    programs: [
      'الهندسة الكيميائية',
      'الهندسة الكهربائية',
      'الهندسة الميكانيكية',
      'هندسة البترول',
    ],

    admissionRequirements: {
      gpa: 'معدل 85%+ في الثانوية (المسار العلمي)',
      sat: 'SAT: 1200+ أو ACT: 26+',
      english: 'TOEFL 79+ أو IELTS 6.5+',
      math: 'مستوى رياضيات متقدم',
    },

    scholarships: {
      qatari: 'تمويل حكومي قطري للمواطنين',
      merit: 'منح الجدارة للمتميزين',
    },
  },

  // ══════════════════════════════════════════════════════
  // جامعة وايل كورنيل الطبية — قطر (WCM-Q)
  // ══════════════════════════════════════════════════════
  WCM_Q: {
    nameAr: 'جامعة وايل كورنيل الطبية — قطر',
    nameEn: 'Weill Cornell Medicine-Qatar',
    website: 'https://www.qatar-med.cornell.edu',
    location: 'المدينة التعليمية',
    type: 'أمريكية — فرع قطر',

    programs: ['طب بشري (MD) — 6 سنوات'],

    admissionRequirements: {
      gpa: 'معدل 95%+ في الثانوية العلمية',
      sat: 'SAT: 1500+ موصى به',
      english: 'TOEFL 100+ أو IELTS 7.5+',
      mcat: 'MCAT مطلوب للتحويل من جامعات أخرى',
      extras: 'مقابلة شخصية + تجربة طبية + أنشطة طوعية',
    },

    tuitionFees: {
      note: 'مدعومة بالكامل من مؤسسة قطر لجميع الطلاب المقبولين',
    },
  },

  // ══════════════════════════════════════════════════════
  // جامعة نورث ويسترن — قطر (NU-Q)
  // ══════════════════════════════════════════════════════
  NU_Q: {
    nameAr: 'جامعة نورث ويسترن — قطر',
    nameEn: 'Northwestern University in Qatar',
    website: 'https://www.qatar.northwestern.edu',
    location: 'المدينة التعليمية',
    type: 'أمريكية — فرع قطر',

    programs: [
      'الصحافة والإعلام',
      'الاتصال الاستراتيجي',
    ],

    admissionRequirements: {
      gpa: 'معدل 80%+',
      english: 'TOEFL 95+ أو IELTS 7.0+',
      portfolio: 'أعمال إبداعية (للإعلام)',
    },
  },

  // ══════════════════════════════════════════════════════
  // جامعة جورجتاون — قطر (GU-Q)
  // ══════════════════════════════════════════════════════
  GU_Q: {
    nameAr: 'جامعة جورجتاون — قطر',
    nameEn: 'Georgetown University in Qatar',
    website: 'https://www.qatar.georgetown.edu',
    location: 'المدينة التعليمية',
    type: 'أمريكية — فرع قطر',

    programs: [
      'الشؤون الدولية',
      'الاقتصاد السياسي',
    ],

    admissionRequirements: {
      gpa: 'معدل 85%+',
      sat: 'SAT موصى به',
      english: 'TOEFL 100+ أو IELTS 7.0+',
    },
  },

  // ══════════════════════════════════════════════════════
  // جامعة HEC Paris — قطر
  // ══════════════════════════════════════════════════════
  HEC_Q: {
    nameAr: 'جامعة HEC باريس — قطر',
    nameEn: 'HEC Paris in Qatar',
    website: 'https://www.hec.edu/en/qatar',
    location: 'المدينة التعليمية',
    type: 'فرنسية — فرع قطر',

    programs: [
      'ماجستير إدارة الأعمال (MBA)',
      'ماجستير الإدارة',
    ],

    admissionRequirements: {
      gmat: 'GMAT 600+ موصى به',
      experience: 'خبرة عمل 3 سنوات+',
      english: 'TOEFL 100+ أو IELTS 7.0+',
    },
  },

};

// ──────────────────────────────────────────────────────
// المنح الدراسية الحكومية القطرية 2025/2026
// ──────────────────────────────────────────────────────
export const GOVERNMENT_SCHOLARSHIPS_2026 = {

  qatarGovernmentFull: {
    nameAr: 'المنحة الحكومية القطرية الكاملة',
    provider: 'وزارة التعليم والتعليم العالي',
    eligibility: 'المواطنون القطريون فقط',
    coverage: ['رسوم دراسية كاملة', 'مكافأة شهرية', 'بدل سكن', 'تأمين طبي'],
    universities: ['جامعة قطر', 'جامعات المدينة التعليمية'],
    gpaRequired: 60,
    deadline: 'يوليو 31 سنوياً',
    applicationUrl: 'https://www.moehe.gov.qa',
  },

  qatarPetroleumScholarship: {
    nameAr: 'منحة قطر للطاقة (QatarEnergy)',
    provider: 'شركة QatarEnergy',
    eligibility: 'قطري + تخصصات هندسية وعلمية',
    coverage: ['رسوم كاملة', 'مكافأة شهرية 3000 ريال', 'توظيف مضمون'],
    gpaRequired: 75,
    tracks: ['هندسة بترول', 'هندسة كيميائية', 'علوم الحاسوب'],
  },

  qatarFoundationScholarship: {
    nameAr: 'منح مؤسسة قطر',
    provider: 'مؤسسة قطر للتربية والعلوم وتنمية المجتمع',
    eligibility: 'جميع الجنسيات (للدراسة في المدينة التعليمية)',
    coverage: 'تختلف حسب البرنامج والجامعة',
    website: 'https://www.qf.org.qa',
  },

};

// ──────────────────────────────────────────────────────
// مسار الإجابة السريعة للأسئلة الشائعة
// ──────────────────────────────────────────────────────
export const QUICK_ANSWERS_2026 = {
  'ما هي أفضل جامعة في قطر': 'تعتمد على تخصصك. للطب: WCM-Q، للهندسة: TAMU-Q، للأعمال: CMU-Q أو HEC، للإعلام: NU-Q، للجميع: جامعة قطر.',
  'شروط القبول في جامعة قطر': 'للقطريين: معدل 60%+. لغير القطريين: معدل 80%+. مع اجتياز مستوى اللغة الإنجليزية.',
  'هل القبول مفتوح الآن': 'قبول الفصل الدراسي الأول 2025/2026 مفتوح من فبراير حتى مايو. راجع موقع الجامعة للتأكيد.',
};
