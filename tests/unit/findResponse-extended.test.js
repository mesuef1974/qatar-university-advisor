/* global process */
/**
 * Unit Tests — findResponse Extended
 * QA-A1: رفع تغطية الاختبارات من 35% إلى 70%
 * 18 حالة اختبار تغطي جميع فروع findResponse
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock all external dependencies ──
vi.mock('../../lib/supabase.js', () => ({
  supabase: null,
  isSupabaseAvailable: vi.fn().mockReturnValue(false),
  getOrCreateUser: vi.fn().mockResolvedValue({ id: 'test-id', phone: '97412345678' }),
  getUserProfileData: vi.fn().mockResolvedValue({}),
  saveUserProfileData: vi.fn().mockResolvedValue(true),
  getConversationHistory: vi.fn().mockResolvedValue([]),
  saveMessage: vi.fn().mockResolvedValue(true),
  logQuery: vi.fn().mockResolvedValue(true),
  updateUserProfile: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../lib/knowledge-base.js', () => ({
  getFromKnowledgeBase: vi.fn().mockResolvedValue(null),
  saveToKnowledgeCache: vi.fn().mockResolvedValue(null),
  semanticSearch: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../lib/ai-handler.js', () => ({
  getAIResponse: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../lib/sanitizer.js', () => ({
  sanitizeInput: vi.fn((text) => ({ safe: true, sanitized: text, reason: null })),
  getInjectionResponse: vi.fn(() => ({
    text: 'محتوى محظور',
    suggestions: [],
  })),
}));

vi.mock('../../lib/nationality-advisor.js', () => ({
  addNationalityContext: vi.fn((response) => response),
}));

vi.mock('../../lib/conversation-state.js', () => ({
  STAGES: {
    STAGE_0: 'stage_0', STAGE_1: 'stage_1', STAGE_2: 'stage_2',
    STAGE_3: 'stage_3', STAGE_4: 'stage_4', STAGE_5: 'stage_5', STAGE_6: 'stage_6',
  },
  getNextStage: vi.fn((current) => current),
  getStagePrompt: vi.fn(() => null),
  generateFinalReport: vi.fn(() => ({ text: 'تقرير نهائي', suggestions: [] })),
  isConversationComplete: vi.fn(() => false),
}));

vi.mock('../../lib/responses.js', () => ({
  ALL_RESPONSES: {
    qu: { text: 'جامعة قطر هي أكبر جامعة حكومية', suggestions: ['كليات QU', 'شروط القبول'] },
    hbku: { text: 'جامعة حمد بن خليفة', suggestions: ['برامج HBKU'] },
    scholarship_amiri: { text: 'الابتعاث الأميري', suggestions: ['شروط الابتعاث'] },
    scholarship_non_qatari: { text: 'منح لغير القطريين', suggestions: ['HBKU'] },
    plan_medicine: { text: 'خطة دراسة الطب', suggestions: ['وايل كورنيل'] },
    plan_law: { text: 'خطة دراسة القانون', suggestions: ['جورجتاون'] },
    salaries: { text: 'الرواتب والوظائف', suggestions: ['أفضل التخصصات'] },
    general_list: { text: 'قائمة الجامعات في قطر', suggestions: [] },
    deadlines: { text: 'مواعيد التقديم', suggestions: [] },
    grade_10_11_early: { text: 'ما زال مبكراً', suggestions: [] },
    rejection_advice: { text: 'نصائح بعد الرفض', suggestions: [] },
    gender_restrictions: { text: 'القيود الجندرية', suggestions: [] },
    compare_wcm_qu: { text: 'مقارنة كورنيل وقطر', suggestions: [] },
    udst: { text: 'جامعة الدوحة للعلوم', suggestions: [] },
    sponsors_list: { text: 'قائمة الجهات الراعية', suggestions: [] },
    plan_pharmacy: { text: 'خطة الصيدلة', suggestions: [] },
    plan_cs: { text: 'خطة علوم الحاسوب', suggestions: [] },
    cmu: { text: 'كارنيجي ميلون', suggestions: [] },
    tamu: { text: 'تكساس إي أند أم', suggestions: [] },
    tamu_closing: { text: 'إغلاق تكساس', suggestions: [] },
    qatar_vision_2030: { text: 'رؤية قطر 2030', suggestions: [] },
    plan_petroleum: { text: 'هندسة البترول', suggestions: [] },
    sat_guide: { text: 'دليل SAT', suggestions: [] },
    ielts_guide: { text: 'دليل IELTS', suggestions: [] },
    general_military: { text: 'الكليات العسكرية', suggestions: [] },
    plan_engineering_qu: { text: 'الهندسة في جامعة قطر', suggestions: [] },
    outside_qatar_student: { text: 'طالب من خارج قطر', suggestions: [] },
    dual_nationality: { text: 'جنسية مزدوجة', suggestions: [] },
    university_transfer: { text: 'تحويل بين الجامعات', suggestions: [] },
    plan_accounting: { text: 'المحاسبة', suggestions: [] },
    plan_nursing: { text: 'التمريض', suggestions: [] },
    scholarship_kahramaa: { text: 'منحة كهرماء', suggestions: [] },
    fitness_military: { text: 'اللياقة العسكرية', suggestions: [] },
    eye_vision: { text: 'شروط النظر', suggestions: [] },
    qaa: { text: 'أكاديمية الطيران', suggestions: [] },
    plan_sharia: { text: 'الشريعة الإسلامية', suggestions: [] },
  },
  CAREER_TEST: null,
}));

// Import after mocking
const { default: findResponseModule } = await import('../../lib/findResponse.js');
// findResponse is the named export, processMessage is the default — let's import the named ones
const findResponseFn = (await import('../../lib/findResponse.js'));

// ══════════════════════════════════════════════════════
describe('findResponse — استعلامات الجامعات', () => {
  it('يتعرف على جامعة قطر بكلمة "جامعة قطر"', () => {
    const result = findResponseFn.findResponse('أريد معلومات عن جامعة قطر');
    expect(result.type).toBe('response');
    expect(result.key).toBe('qu');
  });

  it('يتعرف على HBKU بكلمة "حمد بن خليفة"', () => {
    const result = findResponseFn.findResponse('ما هي جامعة حمد بن خليفة');
    expect(result.type).toBe('response');
    expect(result.key).toBe('hbku');
  });

  it('يتعرف على UDST بكلمة "جامعة الدوحة"', () => {
    const result = findResponseFn.findResponse('جامعة الدوحة للعلوم');
    expect(result.type).toBe('response');
    expect(result.key).toBe('udst');
  });

  it('يتعرف على CMU بكلمة "كارنيجي"', () => {
    const result = findResponseFn.findResponse('كارنيجي ميلون في قطر');
    expect(result.type).toBe('response');
    expect(result.key).toBe('cmu');
  });
});

// ══════════════════════════════════════════════════════
describe('findResponse — استعلامات المنح والابتعاث', () => {
  it('يتعرف على الابتعاث الأميري', () => {
    const result = findResponseFn.findResponse('أريد معلومات عن الابتعاث الأميري');
    expect(result.type).toBe('response');
    expect(result.key).toBe('scholarship_amiri');
  });

  it('يتعرف على منح غير القطريين عند ذكر "مقيم" و "منح"', () => {
    const result = findResponseFn.findResponse('هل يوجد منح للمقيمين في قطر');
    expect(result.type).toBe('response');
    expect(result.key).toBe('scholarship_non_qatari');
  });

  it('يتعرف على جهات الرعاية (سبونسر)', () => {
    const result = findResponseFn.findResponse('ما هي الجهات الراعية سبونسر');
    expect(result.type).toBe('response');
    expect(result.key).toBe('sponsors_list');
  });

  it('يتعرف على منحة كهرماء', () => {
    const result = findResponseFn.findResponse('منحة كهرماء');
    expect(result.type).toBe('response');
    expect(result.key).toBe('scholarship_kahramaa');
  });
});

// ══════════════════════════════════════════════════════
describe('findResponse — استعلامات التخصصات', () => {
  it('يتعرف على خطة الطب', () => {
    const result = findResponseFn.findResponse('خطة دراسة الطب');
    expect(result.type).toBe('response');
    expect(result.key).toBe('plan_medicine');
  });

  it('يتعرف على خطة القانون', () => {
    const result = findResponseFn.findResponse('تخصص القانون في قطر');
    expect(result.type).toBe('response');
    expect(result.key).toBe('plan_law');
  });

  it('يتعرف على خطة الصيدلة', () => {
    const result = findResponseFn.findResponse('تخصص صيدلة');
    expect(result.type).toBe('response');
    expect(result.key).toBe('plan_pharmacy');
  });

  it('يتعرف على الهندسة عند ذكر "مهندس"', () => {
    const result = findResponseFn.findResponse('أريد أن أكون مهندس');
    expect(result.type).toBe('response');
    expect(result.key).toBe('plan_engineering_qu');
  });

  it('يتعرف على الشريعة الإسلامية', () => {
    const result = findResponseFn.findResponse('تخصص شريعة إسلامية');
    expect(result.type).toBe('response');
    expect(result.key).toBe('plan_sharia');
  });
});

// ══════════════════════════════════════════════════════
describe('findResponse — استعلامات المعدل', () => {
  it('يتعرف على معدل 95% ويُرجع نوع grade', () => {
    const result = findResponseFn.findResponse('معدلي 95%');
    expect(result.type).toBe('grade');
    expect(result.grade).toBe(95);
  });

  it('يتعرف على معدل 75 بدون علامة النسبة', () => {
    const result = findResponseFn.findResponse('معدل 75');
    expect(result.type).toBe('grade');
    expect(result.grade).toBe(75);
  });

  it('يتعرف على المسار العلمي مع المعدل', () => {
    const result = findResponseFn.findResponse('معدلي 88% علمي');
    expect(result.type).toBe('grade');
    expect(result.grade).toBe(88);
    expect(result.track).toBe('علمي');
  });
});

// ══════════════════════════════════════════════════════
describe('findResponse — القبول والشروط', () => {
  it('يتعرف على مواعيد التقديم', () => {
    const result = findResponseFn.findResponse('متى يفتح التسجيل في الجامعات');
    expect(result.type).toBe('response');
    expect(result.key).toBe('deadlines');
  });

  it('يتعرف على رفض القبول', () => {
    const result = findResponseFn.findResponse('ما قبلوني في الجامعة');
    expect(result.type).toBe('response');
    expect(result.key).toBe('rejection_advice');
  });

  it('يتعرف على طالب صف 10/11', () => {
    const result = findResponseFn.findResponse('أنا في صف 10 هل أقدم الآن');
    expect(result.type).toBe('response');
    expect(result.key).toBe('grade_10_11_early');
  });
});

// ══════════════════════════════════════════════════════
describe('findResponse — التحيات والردود غير المعروفة', () => {
  it('يتعرف على التحية العربية "السلام عليكم"', () => {
    const result = findResponseFn.findResponse('السلام عليكم');
    expect(result.type).toBe('greeting');
  });

  it('يتعرف على التحية الإنجليزية "hello"', () => {
    const result = findResponseFn.findResponse('hello');
    expect(result.type).toBe('greeting');
  });

  it('يُرجع unknown لسؤال غير مفهوم', () => {
    const result = findResponseFn.findResponse('xyzاختبار عشوائي لا علاقة له');
    expect(result.type).toBe('unknown');
  });
});

// ══════════════════════════════════════════════════════
describe('findResponse — سيناريوهات خاصة', () => {
  it('يتعرف على تحويل بين الجامعات', () => {
    const result = findResponseFn.findResponse('أريد تحويل من جامعة لأخرى');
    expect(result.type).toBe('response');
    expect(result.key).toBe('university_transfer');
  });

  it('يتعرف على طالب من خارج قطر يريد القبول', () => {
    const result = findResponseFn.findResponse('أنا من خارج قطر هل أقدر أتقدم للقبول');
    expect(result.type).toBe('response');
    expect(result.key).toBe('outside_qatar_student');
  });

  it('يتعرف على القيود الجندرية', () => {
    const result = findResponseFn.findResponse('هل الجامعة للبنات فقط أو مختلط');
    expect(result.type).toBe('response');
    expect(result.key).toBe('gender_restrictions');
  });

  it('يتعرف على الرواتب والوظائف', () => {
    const result = findResponseFn.findResponse('كم راتب المهندس في قطر');
    expect(result.type).toBe('response');
    expect(result.key).toBe('salaries');
  });

  it('يتعرف على SAT', () => {
    const result = findResponseFn.findResponse('كيف أستعد لاختبار sat');
    expect(result.type).toBe('response');
    expect(result.key).toBe('sat_guide');
  });

  it('يتعرف على رؤية قطر 2030', () => {
    const result = findResponseFn.findResponse('تخصصات المستقبل ورؤية 2030');
    expect(result.type).toBe('response');
    expect(result.key).toBe('qatar_vision_2030');
  });

  it('يتعرف على الكليات العسكرية', () => {
    const result = findResponseFn.findResponse('أريد أن أكون ضابط عسكري');
    expect(result.type).toBe('response');
    expect(result.key).toBe('general_military');
  });

  it('يتعرف على قائمة جميع الجامعات', () => {
    const result = findResponseFn.findResponse('أريد قائمة كل الجامعات');
    expect(result.type).toBe('response');
    expect(result.key).toBe('general_list');
  });
});

// ══════════════════════════════════════════════════════
describe('gradeResponse — توصيات حسب المعدل', () => {
  it('يُرجع توصيات للمعدل الاستثنائي 96%', () => {
    const result = findResponseFn.gradeResponse(96);
    expect(result.text).toContain('96%');
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('يُرجع توصيات للمعدل المتوسط 75%', () => {
    const result = findResponseFn.gradeResponse(75);
    expect(result.text).toContain('75%');
  });

  it('يُرجع توصيات للمعدل المنخفض 60%', () => {
    const result = findResponseFn.gradeResponse(60);
    expect(result.text).toContain('60%');
    expect(result.text).toContain('كلية المجتمع');
  });

  it('يُرجع توصيات مختلفة لمعدل 90%', () => {
    const result = findResponseFn.gradeResponse(90);
    expect(result.text).toContain('90%');
  });

  it('يُرجع توصيات لمعدل 85%', () => {
    const result = findResponseFn.gradeResponse(85);
    expect(result.text).toContain('85%');
  });

  it('يُرجع توصيات لمعدل 80%', () => {
    const result = findResponseFn.gradeResponse(80);
    expect(result.text).toContain('80%');
  });

  it('يُرجع توصيات لمعدل 70%', () => {
    const result = findResponseFn.gradeResponse(70);
    expect(result.text).toContain('70%');
  });
});
