/* global process */
/**
 * Unit Tests — User Profiler
 * QA-A1: رفع تغطية الاختبارات من 35% إلى 70%
 * 16 حالة اختبار تغطي: detectUserType, detectNationality, detectTrack, extractGPA,
 *   buildUserProfile, buildProfileContext, getWelcomeMessage, getNextProfilingQuestion,
 *   generateSmartSuggestions, InMemoryProfile cache
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
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
} from '../../lib/user-profiler.js';

beforeEach(() => {
  // Clear in-memory cache between tests
  invalidateInMemoryProfile('test-phone');
  invalidateInMemoryProfile('full-cache-phone');
});

// ══════════════════════════════════════════════════════
describe('detectNationality — كشف الجنسية', () => {
  it('يكشف الجنسية القطرية', () => {
    expect(detectNationality('أنا قطري')).toBe('qatari');
  });

  it('يكشف المقيم (غير قطري)', () => {
    expect(detectNationality('أنا مقيم في قطر')).toBe('non_qatari');
  });

  it('يُرجع null لسؤال بدون جنسية', () => {
    expect(detectNationality('أريد معلومات عن الجامعات')).toBeNull();
  });

  it('يحتفظ بالجنسية الموجودة في الملف', () => {
    expect(detectNationality('أي شيء', { nationality: 'qatari' })).toBe('qatari');
  });

  it('يكشف الوافد كغير قطري', () => {
    expect(detectNationality('أنا وافد هل يوجد منح')).toBe('non_qatari');
  });
});

// ══════════════════════════════════════════════════════
describe('extractGPA — استخراج المعدل', () => {
  it('يستخرج المعدل مع %', () => {
    expect(extractGPA('معدلي 95%')).toBe(95);
  });

  it('يستخرج المعدل مع ٪ العربية', () => {
    expect(extractGPA('حصلت على 88٪')).toBe(88);
  });

  it('يستخرج المعدل بصيغة "معدلي 85"', () => {
    expect(extractGPA('معدلي 85 في الثانوية')).toBe(85);
  });

  it('يُرجع null لمعدل أقل من 40', () => {
    expect(extractGPA('معدلي 20%')).toBeNull();
  });

  it('يُرجع null لنص بدون أرقام', () => {
    expect(extractGPA('أريد معلومات عامة')).toBeNull();
  });

  it('يستخرج معدل عشري', () => {
    expect(extractGPA('معدلي 92.5%')).toBe(92.5);
  });
});

// ══════════════════════════════════════════════════════
describe('detectTrack — كشف المسار الدراسي', () => {
  it('يكشف المسار العلمي', () => {
    expect(detectTrack('أنا في المسار العلمي')).toBe('scientific');
  });

  it('يكشف المسار الأدبي', () => {
    expect(detectTrack('مسار أدبي')).toBe('literary');
  });

  it('يكشف المسار التجاري', () => {
    expect(detectTrack('تخصص تجاري محاسبة')).toBe('commercial');
  });

  it('يُرجع null لسؤال بدون مسار', () => {
    expect(detectTrack('مرحبا كيف الحال')).toBeNull();
  });

  it('يحتفظ بالمسار الموجود', () => {
    expect(detectTrack('أي شيء', { track: 'scientific' })).toBe('scientific');
  });
});

// ══════════════════════════════════════════════════════
describe('detectUserType — كشف نوع المستخدم', () => {
  it('يكشف ولي الأمر', () => {
    expect(detectUserType('ابني معدله 90')).toBe(USER_TYPES.PARENT);
  });

  it('يكشف طالب الدراسات العليا', () => {
    expect(detectUserType('أريد ماجستير في الهندسة')).toBe(USER_TYPES.STUDENT_GRAD);
  });

  it('يكشف الطالب الجامعي', () => {
    expect(detectUserType('أنا طالب جامعي أريد التحويل')).toBe(USER_TYPES.STUDENT_UNI);
  });

  it('يكشف طالب الثانوية من المعدل', () => {
    expect(detectUserType('معدلي 85%')).toBe(USER_TYPES.STUDENT_HS);
  });

  it('يُرجع GENERAL لسؤال عام', () => {
    expect(detectUserType('مرحباً')).toBe(USER_TYPES.GENERAL);
  });

  it('يحتفظ بنوع المستخدم الموجود', () => {
    expect(detectUserType('أي شيء', { userType: USER_TYPES.PARENT })).toBe(USER_TYPES.PARENT);
  });
});

// ══════════════════════════════════════════════════════
describe('buildUserProfile — بناء ملف المستخدم', () => {
  it('يبني ملف جديد من رسالة أولى', () => {
    const profile = buildUserProfile('أنا قطري معدلي 90% علمي');
    expect(profile.nationality).toBe('qatari');
    expect(profile.gpa).toBe(90);
    expect(profile.track).toBe('scientific');
    expect(profile.messageCount).toBe(1);
  });

  it('يُحدّث ملف موجود بمعلومات جديدة', () => {
    const existing = { userType: USER_TYPES.STUDENT_HS, messageCount: 1 };
    const profile = buildUserProfile('أنا قطري', existing);
    expect(profile.nationality).toBe('qatari');
    expect(profile.userType).toBe(USER_TYPES.STUDENT_HS);
    expect(profile.messageCount).toBe(2);
  });
});

// ══════════════════════════════════════════════════════
describe('buildProfileContext — بناء سياق الملف للذكاء الاصطناعي', () => {
  it('يُنشئ سياقاً كاملاً', () => {
    const ctx = buildProfileContext({
      userType: USER_TYPES.STUDENT_HS,
      nationality: 'qatari',
      track: 'scientific',
      gpa: 92,
    });
    expect(ctx).toContain('طالب');
    expect(ctx).toContain('قطري');
    expect(ctx).toContain('العلمي');
    expect(ctx).toContain('92%');
  });

  it('يُرجع نصاً فارغاً لملف فارغ', () => {
    expect(buildProfileContext({})).toBe('');
    expect(buildProfileContext(null)).toBe('');
  });
});

// ══════════════════════════════════════════════════════
describe('getWelcomeMessage — رسالة الترحيب', () => {
  it('يُرجع رسالة ترحيب مع اقتراحات', () => {
    const welcome = getWelcomeMessage();
    expect(welcome.text).toContain('المرشد');
    expect(welcome.suggestions).toBeDefined();
    expect(welcome.suggestions.length).toBe(3);
  });
});

// ══════════════════════════════════════════════════════
describe('getNextProfilingQuestion — الأسئلة الاستكشافية', () => {
  it('يسأل عن الجنسية إذا لم تُحدد', () => {
    const q = getNextProfilingQuestion({ userType: USER_TYPES.STUDENT_HS });
    expect(q).toContain('قطري');
  });

  it('يسأل عن المعدل لطالب الثانوية', () => {
    const q = getNextProfilingQuestion({ userType: USER_TYPES.STUDENT_HS, nationality: 'qatari' });
    expect(q).toContain('معدل');
  });

  it('يُرجع null إذا اكتمل الملف', () => {
    const q = getNextProfilingQuestion({
      userType: USER_TYPES.STUDENT_HS,
      nationality: 'qatari',
      gpa: 90,
      track: 'scientific',
    });
    expect(q).toBeNull();
  });

  it('يُرجع null لنوع GENERAL', () => {
    const q = getNextProfilingQuestion({ userType: USER_TYPES.GENERAL });
    expect(q).toBeNull();
  });
});

// ══════════════════════════════════════════════════════
describe('generateSmartSuggestions — الاقتراحات الذكية', () => {
  it('يُولّد اقتراحات لولي الأمر القطري', () => {
    const suggs = generateSmartSuggestions({
      userType: USER_TYPES.PARENT,
      nationality: 'qatari',
    });
    expect(suggs).toHaveLength(3);
    expect(suggs[0]).toContain('قطري');
  });

  it('يُولّد اقتراحات لمعدل 95%', () => {
    const suggs = generateSmartSuggestions({ gpa: 95 });
    expect(suggs).toHaveLength(3);
    expect(suggs[0]).toContain('90%');
  });

  it('يُولّد اقتراحات للمسار العلمي', () => {
    const suggs = generateSmartSuggestions({ track: 'scientific' });
    expect(suggs).toHaveLength(3);
    expect(suggs[0]).toContain('هندسة');
  });

  it('يُولّد اقتراحات افتراضية بدون ملف', () => {
    const suggs = generateSmartSuggestions({});
    expect(suggs).toHaveLength(3);
  });

  it('يُولّد اقتراحات لمعدل 65% (منخفض)', () => {
    const suggs = generateSmartSuggestions({ gpa: 65 });
    expect(suggs).toHaveLength(3);
    expect(suggs[0]).toContain('UDST');
  });

  it('يُولّد اقتراحات لطالب دراسات عليا', () => {
    const suggs = generateSmartSuggestions({ userType: USER_TYPES.STUDENT_GRAD });
    expect(suggs).toHaveLength(3);
    expect(suggs[0]).toContain('ماجستير');
  });
});

// ══════════════════════════════════════════════════════
describe('InMemoryProfile — كاش الملفات المحلي', () => {
  it('يحفظ ويسترجع ملفاً بنجاح', () => {
    const profile = { userType: USER_TYPES.STUDENT_HS, gpa: 90 };
    saveInMemoryProfile('test-phone', profile);
    const cached = getInMemoryProfile('test-phone');
    expect(cached).toEqual(profile);
  });

  it('يُرجع null لملف غير موجود', () => {
    expect(getInMemoryProfile('unknown-phone')).toBeNull();
  });

  it('يُبطل كاش ملف محدد', () => {
    saveInMemoryProfile('test-phone', { gpa: 80 });
    invalidateInMemoryProfile('test-phone');
    expect(getInMemoryProfile('test-phone')).toBeNull();
  });
});
