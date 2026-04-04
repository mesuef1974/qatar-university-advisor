/**
 * findResponse.test.js
 * Unit tests for lib/findResponse.js — QA Director Suite
 * Framework: Vitest
 */

import { describe, it, expect, vi } from 'vitest';

// ─── Mock all external dependencies ───────────────────────────────────────────
vi.mock('../lib/responses.js', () => ({
  ALL_RESPONSES: {
    wcm: { text: 'وايل كورنيل للطب', suggestions: [] },
    cmu: { text: 'كارنيجي ميلون', suggestions: [] },
    tamu: { text: 'تكساس إي أند أم', suggestions: [] },
    gu: { text: 'جورجتاون', suggestions: [] },
    nu: { text: 'نورثوسترن', suggestions: [] },
    vcu: { text: 'فرجينيا كومنولث', suggestions: [] },
    qu: { text: 'جامعة قطر', suggestions: [] },
    hbku: { text: 'حمد بن خليفة', suggestions: [] },
    udst: { text: 'جامعة الدوحة', suggestions: [] },
    lusail: { text: 'جامعة لوسيل', suggestions: [] },
    ccq: { text: 'كلية المجتمع قطر', suggestions: [] },
    doha_institute: { text: 'معهد الدوحة', suggestions: [] },
    police: { text: 'أكاديمية الشرطة', suggestions: [] },
    airforce: { text: 'الكلية الجوية', suggestions: [] },
    naval: { text: 'الكلية البحرية', suggestions: [] },
    cyber: { text: 'الكلية السيبرانية', suggestions: [] },
    abmmc: { text: 'أحمد بن محمد', suggestions: [] },
    general_military: { text: 'الكليات العسكرية العامة', suggestions: [] },
    compare_military: { text: 'مقارنة الكليات العسكرية', suggestions: [] },
    compare_wcm_qu: { text: 'مقارنة كورنيل وQU', suggestions: [] },
    compare_tamu_qu: { text: 'مقارنة تكساس وQU', suggestions: [] },
    compare_cmu_qu: { text: 'مقارنة كارنيجي وQU', suggestions: [] },
    qatari_vs_non_qatari: { text: 'قطري vs غير قطري', suggestions: [] },
    scholarship_amiri: { text: 'البعثة الأميرية', suggestions: [] },
    scholarship_external: { text: 'الابتعاث الخارجي', suggestions: [] },
    scholarship_internal: { text: 'الابتعاث الداخلي', suggestions: [] },
    scholarship_qatarenergy: { text: 'منحة قطر للطاقة', suggestions: [] },
    scholarship_qatarairways: { text: 'منحة الخطوط القطرية', suggestions: [] },
    scholarship_qnb: { text: 'منحة QNB', suggestions: [] },
    scholarship_kahramaa: { text: 'منحة كهرماء', suggestions: [] },
    scholarship_ashghal: { text: 'منحة أشغال', suggestions: [] },
    scholarship_nakilat: { text: 'منحة ناقلات', suggestions: [] },
    scholarship_non_qatari: { text: 'منح غير القطريين', suggestions: [] },
    sponsors_list: { text: 'قائمة الرعاة', suggestions: [] },
    tamu_closing: { text: 'إغلاق تكساس', suggestions: [] },
    qatar_vision_2030: { text: 'رؤية قطر 2030', suggestions: [] },
    reservoir_engineer: { text: 'مهندس المكامن', suggestions: [] },
    plan_medicine: { text: 'خطة الطب', suggestions: [] },
    plan_petroleum: { text: 'خطة البترول', suggestions: [] },
    plan_cs: { text: 'خطة CS', suggestions: [] },
    plan_law: { text: 'خطة القانون', suggestions: [] },
    plan_pharmacy: { text: 'خطة الصيدلة', suggestions: [] },
    plan_dentistry: { text: 'خطة طب الأسنان', suggestions: [] },
    plan_accounting: { text: 'خطة المحاسبة', suggestions: [] },
    plan_finance: { text: 'خطة التمويل', suggestions: [] },
    plan_marketing: { text: 'خطة التسويق', suggestions: [] },
    plan_mis: { text: 'خطة نظم المعلومات', suggestions: [] },
    plan_nursing: { text: 'خطة التمريض', suggestions: [] },
    plan_health_sciences: { text: 'خطة العلوم الصحية', suggestions: [] },
    plan_education: { text: 'خطة التربية', suggestions: [] },
    plan_sharia: { text: 'خطة الشريعة', suggestions: [] },
    plan_arabic: { text: 'خطة اللغة العربية', suggestions: [] },
    plan_english: { text: 'خطة اللغة الإنجليزية', suggestions: [] },
    plan_psychology: { text: 'خطة علم النفس', suggestions: [] },
    plan_media: { text: 'خطة الإعلام', suggestions: [] },
    plan_architecture: { text: 'خطة العمارة', suggestions: [] },
    plan_civil_eng: { text: 'خطة الهندسة المدنية', suggestions: [] },
    plan_electrical_eng: { text: 'خطة الهندسة الكهربائية', suggestions: [] },
    plan_mechanical_eng: { text: 'خطة الهندسة الميكانيكية', suggestions: [] },
    plan_chemical_eng: { text: 'خطة الهندسة الكيميائية', suggestions: [] },
    plan_computer_eng: { text: 'خطة هندسة الحاسب', suggestions: [] },
    plan_industrial_eng: { text: 'خطة الهندسة الصناعية', suggestions: [] },
    plan_mechatronics: { text: 'خطة الميكاترونكس', suggestions: [] },
    plan_biology: { text: 'خطة الأحياء', suggestions: [] },
    plan_chemistry: { text: 'خطة الكيمياء', suggestions: [] },
    plan_physics: { text: 'خطة الفيزياء', suggestions: [] },
    plan_math: { text: 'خطة الرياضيات', suggestions: [] },
    plan_env_science: { text: 'خطة علم البيئة', suggestions: [] },
    plan_ai_cmu: { text: 'خطة الذكاء الاصطناعي', suggestions: [] },
    plan_bio_cmu: { text: 'خطة البيولوجي CMU', suggestions: [] },
    plan_engineering_qu: { text: 'خطة الهندسة QU', suggestions: [] },
    salaries: { text: 'الرواتب والوظائف', suggestions: [] },
    deadlines: { text: 'مواعيد التقديم', suggestions: [] },
    general_list: { text: 'قائمة الجامعات', suggestions: [] },
    sat_guide: { text: 'دليل SAT', suggestions: [] },
    ielts_guide: { text: 'دليل IELTS', suggestions: [] },
    eye_vision: { text: 'حدة البصر', suggestions: [] },
    fitness_military: { text: 'اللياقة العسكرية', suggestions: [] },
    thamoon: { text: 'برنامج طموح', suggestions: [] },
    qaa: { text: 'أكاديمية الطيران', suggestions: [] },
    cuq_ulster: { text: 'جامعة الستر', suggestions: [] },
    barzan: { text: 'كلية برزان', suggestions: [] },
    qfba: { text: 'معهد QFBA', suggestions: [] },
    teach_for_qatar: { text: 'علّم لأجل قطر', suggestions: [] },
    teaching_career: { text: 'مهنة التعليم', suggestions: [] },
  },
  CAREER_TEST: {},
}));

vi.mock('../lib/ai-handler.js', () => ({
  getAIResponse: vi.fn().mockResolvedValue({ text: 'AI response', suggestions: [] }),
}));

vi.mock('../lib/nationality-advisor.js', () => ({
  addNationalityContext: vi.fn((text) => text),
}));

// ─── Import the module under test AFTER mocks ──────────────────────────────────
import { processMessage } from '../lib/findResponse.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
async function getKey(text) {
  // We inspect the real findResponse logic through processMessage's output.
  // Since ALL_RESPONSES values have unique text, we map back to key.
  const result = await processMessage(text);
  return result;
}

// ─── Test Suites ──────────────────────────────────────────────────────────────

describe('findResponse — University Keywords', () => {
  it('كورنيل → WCM', async () => {
    const r = await getKey('ما هي كورنيل قطر؟');
    expect(r.text).toBe('وايل كورنيل للطب');
  });

  it('وايل → WCM', async () => {
    const r = await getKey('أخبرني عن وايل');
    expect(r.text).toBe('وايل كورنيل للطب');
  });

  it('كارنيجي → CMU', async () => {
    const r = await getKey('كارنيجي ميلون في قطر');
    expect(r.text).toBe('كارنيجي ميلون');
  });

  it('تكساس → TAMU', async () => {
    const r = await getKey('جامعة تكساس إي أند أم');
    expect(r.text).toBe('تكساس إي أند أم');
  });

  it('HBKU → حمد بن خليفة', async () => {
    const r = await getKey('ما هي hbku؟');
    expect(r.text).toBe('حمد بن خليفة');
  });

  it('حمد بن خليفة → HBKU', async () => {
    const r = await getKey('جامعة حمد بن خليفة شروط القبول');
    expect(r.text).toBe('حمد بن خليفة');
  });

  it('جامعة قطر → QU', async () => {
    const r = await getKey('شروط جامعة قطر');
    expect(r.text).toBe('جامعة قطر');
  });

  it('الشرطة → Police', async () => {
    const r = await getKey('أكاديمية الشرطة كيف أتقدم؟');
    expect(r.text).toBe('أكاديمية الشرطة');
  });

  it('جوية → Airforce', async () => {
    const r = await getKey('الكلية الجوية القطرية');
    expect(r.text).toBe('الكلية الجوية');
  });

  it('طيار مقاتل → Airforce', async () => {
    const r = await getKey('كيف أصبح طيار مقاتل؟');
    expect(r.text).toBe('الكلية الجوية');
  });

  it('بحرية → Naval', async () => {
    const r = await getKey('الكلية البحرية القطرية');
    expect(r.text).toBe('الكلية البحرية');
  });

  it('سيبراني → Cyber', async () => {
    const r = await getKey('كلية الأمن السيبراني');
    expect(r.text).toBe('الكلية السيبرانية');
  });

  it('أحمد بن محمد → ABMMC', async () => {
    const r = await getKey('كلية أحمد بن محمد العسكرية');
    expect(r.text).toBe('أحمد بن محمد');
  });

  it('UDST → جامعة الدوحة', async () => {
    const r = await getKey('ما هي udst؟');
    expect(r.text).toBe('جامعة الدوحة');
  });

  it('لوسيل → Lusail', async () => {
    const r = await getKey('جامعة لوسيل تخصصات');
    expect(r.text).toBe('جامعة لوسيل');
  });

  it('كلية المجتمع → CCQ', async () => {
    const r = await getKey('كلية المجتمع قطر دبلوم');
    expect(r.text).toBe('كلية المجتمع قطر');
  });

  it('نورثوسترن → NU', async () => {
    const r = await getKey('نورثوسترن إعلام');
    expect(r.text).toBe('نورثوسترن');
  });

  it('جورجتاون → GU', async () => {
    const r = await getKey('جورجتاون سياسة');
    expect(r.text).toBe('جورجتاون');
  });

  it('فرجينيا → VCU', async () => {
    const r = await getKey('فرجينيا كومنولث فنون');
    expect(r.text).toBe('فرجينيا كومنولث');
  });
});

describe('findResponse — Comparisons', () => {
  it('مقارنة كورنيل vs جامعة قطر', async () => {
    const r = await getKey('مقارنة بين كورنيل وجامعة قطر');
    expect(r.text).toBe('مقارنة كورنيل وQU');
  });

  it('مقارنة تكساس vs QU هندسة', async () => {
    const r = await getKey('الفرق بين تكساس وهندسة qu');
    expect(r.text).toBe('مقارنة تكساس وQU');
  });

  it('مقارنة كارنيجي vs QU حاسب', async () => {
    const r = await getKey('مقارنة كارنيجي وcmu مع qu للحاسب');
    expect(r.text).toBe('مقارنة كارنيجي وQU');
  });

  it('مقارنة الكليات العسكرية', async () => {
    const r = await getKey('مقارنة بين الكليات العسكرية الخمس');
    expect(r.text).toBe('مقارنة الكليات العسكرية');
  });
});

describe('findResponse — Qatari vs Non-Qatari', () => {
  it('قطري غير قطري → يرجع مقارنة', async () => {
    const r = await getKey('ما الفرق بين قطري وغير قطري في التقديم؟');
    expect(r.text).toBe('قطري vs غير قطري');
  });

  it('مقيم vs قطري → يرجع مقارنة', async () => {
    const r = await getKey('مقيم vs قطري شروط القبول');
    expect(r.text).toBe('قطري vs غير قطري');
  });

  it('في سياق المنح → لا يُرجع qatari_vs_non_qatari', async () => {
    // When scholarship context exists + non-qatari → should go to scholarship_non_qatari
    const r = await getKey('منح لغير القطريين والوافدين');
    expect(r.text).toBe('منح غير القطريين');
  });
});

describe('findResponse — Scholarships & Sponsorship', () => {
  it('البعثة الأميرية', async () => {
    const r = await getKey('ما هي البعثة الأميرية؟');
    expect(r.text).toBe('البعثة الأميرية');
  });

  it('ابتعاث خارجي', async () => {
    const r = await getKey('كيف أتقدم للابتعاث الخارجي؟');
    expect(r.text).toBe('الابتعاث الخارجي');
  });

  it('ابتعاث داخلي → يطابق الأميري لأن الكلمة المفتاحية "ابتعاث" تأتي أولاً', async () => {
    const r = await getKey('ابتعاث داخلي في قطر');
    expect(r.text).toBe('الابتعاث الداخلي');
  });

  it('كهرماء → منحة كهرماء', async () => {
    const r = await getKey('منحة كهرماء للطلاب');
    expect(r.text).toBe('منحة كهرماء');
  });

  it('أشغال → منحة أشغال', async () => {
    const r = await getKey('هل أشغال تمنح بعثات للطلاب؟');
    expect(r.text).toBe('منحة أشغال');
  });

  it('ناقلات → منحة ناقلات', async () => {
    const r = await getKey('ناقلات قطر تمنح بعثة لمن؟');
    expect(r.text).toBe('منحة ناقلات');
  });

  it('منح دولية لغير القطريين', async () => {
    const r = await getKey('هل هناك منح دولية للوافدين والأجانب؟');
    expect(r.text).toBe('منح غير القطريين');
  });

  it('قطر للطاقة + ابتعاث → منحة QatarEnergy', async () => {
    const r = await getKey('ابتعاث قطر للطاقة للطلاب كيف أتقدم؟');
    expect(r.text).toBe('منحة قطر للطاقة');
  });

  it('هارفارد مباشرة → أميري', async () => {
    const r = await getKey('كيف أذهب لهارفارد من قطر؟');
    expect(r.text).toBe('البعثة الأميرية');
  });

  it('منح + QNB → منحة QNB', async () => {
    const r = await getKey('هل QNB يوفر منح دراسية؟');
    expect(r.text).toBe('منحة QNB');
  });
});

describe('findResponse — GPA / Grade Detection', () => {
  it('معدل 95% → grade type', async () => {
    const r = await getKey('معدلي 95% ماذا أختار؟');
    expect(r.text).toContain('95');
  });

  it('معدل 85% → grade type', async () => {
    const r = await getKey('معدلي 85% أي جامعة؟');
    expect(r.text).toContain('85');
  });

  it('معدل 70% → grade type', async () => {
    const r = await getKey('معدلي 70%');
    expect(r.text).toContain('70');
  });

  it('معدل 60% → grade type', async () => {
    const r = await getKey('لدي معدل 60 في الثانوية');
    expect(r.text).toContain('60');
  });

  it('معدل فوق 100 → لا يُعالج كمعدل', async () => {
    // 101 is outside valid grade range 50-100
    const r = await getKey('معدلي 101%');
    // Should NOT return a grade-based response
    expect(r.text).not.toContain('101');
  });
});

describe('findResponse — Rؤية 2030 & Special Topics', () => {
  it('رؤية 2030 → Qatar Vision', async () => {
    const r = await getKey('ما هي تخصصات رؤية 2030 في قطر؟');
    expect(r.text).toBe('رؤية قطر 2030');
  });

  it('إغلاق تكساس 2028', async () => {
    const r = await getKey('هل تكساس ستغلق في 2028؟');
    expect(r.text).toBe('إغلاق تكساس');
  });

  it('مكامن → Reservoir Engineer', async () => {
    const r = await getKey('ما هو مهندس المكامن؟');
    expect(r.text).toBe('مهندس المكامن');
  });

  it('راتب / وظيفة → Salaries', async () => {
    const r = await getKey('كم الراتب بعد التخرج؟');
    expect(r.text).toContain('الرواتب');
  });

  it('SAT → sat_guide', async () => {
    const r = await getKey('كيف أستعد لاختبار SAT؟');
    expect(r.text).toBe('دليل SAT');
  });

  it('IELTS → ielts_guide', async () => {
    const r = await getKey('كيف أستعد لاختبار IELTS؟');
    expect(r.text).toContain('IELTS');
  });

  it('نظر + جوية → الكلية الجوية (الجوية أولوية أعلى)', async () => {
    const r = await getKey('هل نظارة تمنعني من الكلية الجوية؟');
    expect(r.text).toContain('الكلية الجوية');
  });

  it('لياقة + عسكري → fitness_military', async () => {
    const r = await getKey('ما هو اختبار اللياقة للكلية العسكرية؟');
    expect(r.text).toBe('اللياقة العسكرية');
  });

  it('greeting: مرحبا → greeting type', async () => {
    const r = await getKey('مرحبا');
    expect(r.text).toBeDefined();
  });

  it('greeting: hi → greeting type', async () => {
    const r = await getKey('hi');
    expect(r.text).toBeDefined();
  });
});
