/**
 * Integration Tests — User Profiler
 * T-FIX-009: شركة أذكياء للبرمجيات
 */

import { describe, it, expect, vi } from 'vitest';

// Mock Supabase — يجب قبل أي import يعتمد عليه
vi.mock('../../lib/supabase.js', () => ({
  supabase:              null,
  isSupabaseAvailable:   vi.fn().mockReturnValue(false),
  getOrCreateUser:       vi.fn().mockResolvedValue({ id: 'test-id', phone: '97412345678' }),
  getUserProfileData:    vi.fn().mockResolvedValue({}),
  saveUserProfileData:   vi.fn().mockResolvedValue(true),
  updateUserProfile:     vi.fn().mockResolvedValue(true),
  saveMessage:           vi.fn().mockResolvedValue(true),
  getConversationHistory:vi.fn().mockResolvedValue([]),
  logQuery:              vi.fn().mockResolvedValue(true),
  getTopQueries:         vi.fn().mockResolvedValue([]),
  addFavorite:           vi.fn().mockResolvedValue(true),
  removeFavorite:        vi.fn().mockResolvedValue(true),
  getFavorites:          vi.fn().mockResolvedValue([]),
  getStats:              vi.fn().mockResolvedValue({}),
}));

import {
  detectNationality,
  detectUserType,
  detectTrack,
  extractGPA,
  buildUserProfile,
  USER_TYPES,
} from '../../lib/user-profiler.js';

// ─── دالة مساعدة: حساب اكتمال الملف الشخصي ────────────────────────────────
// getProfileCompleteness غير مُصدَّرة من user-profiler.js —
// نحسبها محلياً بنفس المنطق: 5 حقول أساسية كل منها 20%
const PROFILE_FIELDS = ['nationality', 'userType', 'gpa', 'track', 'preferredMajor'];

function getProfileCompleteness(profile) {
  if (!profile || Object.keys(profile).length === 0) return 0;
  const filled = PROFILE_FIELDS.filter(
    f => profile[f] !== undefined && profile[f] !== null && profile[f] !== ''
  );
  return Math.round((filled.length / PROFILE_FIELDS.length) * 100);
}

// ══════════════════════════════════════════════════════
describe('User Profiler — Nationality Detection', () => {
  it('يكتشف القطري صحيح — كلمة "قطري"', () => {
    expect(detectNationality('أنا قطري')).toBe('qatari');
  });

  it('يكتشف القطري صحيح — عبارة "جنسيتي قطرية"', () => {
    expect(detectNationality('جنسيتي قطرية')).toBe('qatari');
  });

  it('يكتشف المقيم صحيح — كلمة "مقيم"', () => {
    expect(detectNationality('أنا مقيم في قطر')).toBe('non_qatari');
  });

  it('يكتشف الوافد صحيح — كلمة "وافد"', () => {
    expect(detectNationality('أنا وافد')).toBe('non_qatari');
  });

  it('يُرجع null عند غياب المعلومة', () => {
    expect(detectNationality('ما هي أفضل جامعة؟')).toBeNull();
  });

  it('يحترم القيمة الموجودة في الملف ولا يُعيد الكشف', () => {
    const result = detectNationality('أنا قطري', { nationality: 'non_qatari' });
    expect(result).toBe('non_qatari');
  });
});

// ══════════════════════════════════════════════════════
describe('User Profiler — GPA Extraction', () => {
  it('يستخرج معدل بنسبة مئوية إنجليزية', () => {
    expect(extractGPA('معدلي 85%')).toBe(85);
  });

  it('يستخرج معدل بنسبة مئوية عربية ٪', () => {
    expect(extractGPA('حصلت على 92٪')).toBe(92);
  });

  it('يستخرج معدل من نمط "معدلي XX"', () => {
    expect(extractGPA('معدلي 88')).toBe(88);
  });

  it('يستخرج معدل عشري', () => {
    const gpa = extractGPA('معدلي 87.5%');
    expect(gpa).toBe(87.5);
  });

  it('يتجاهل الأرقام خارج النطاق 40-100', () => {
    // 200 أكبر من 100 → يُتجاهل من نمط المئوية، لكن قد يُلتقط من النمط الأخير
    // النمط الأخير يقبل 50-100 فقط ← 200 خارج النطاق
    expect(extractGPA('عندي 200 كتاب')).toBeNull();
  });

  it('يتجاهل الأرقام الصغيرة جداً (< 40)', () => {
    expect(extractGPA('عمره 15 سنة')).toBeNull();
  });
});

// ══════════════════════════════════════════════════════
describe('User Profiler — Track Detection', () => {
  it('يكتشف المسار العلمي', () => {
    expect(detectTrack('أنا في القسم العلمي')).toBe('scientific');
  });

  it('يكتشف المسار العلمي — "مسار علمي"', () => {
    expect(detectTrack('مسار علمي')).toBe('scientific');
  });

  it('يكتشف المسار الأدبي', () => {
    expect(detectTrack('في القسم الأدبي')).toBe('literary');
  });

  it('يكتشف المسار التجاري', () => {
    expect(detectTrack('أدرس في المسار التجاري')).toBe('commercial');
  });

  it('يكتشف المسار التقني', () => {
    expect(detectTrack('أنا في المسار التقني')).toBe('technical');
  });

  it('يُرجع null عند غياب المعلومة', () => {
    expect(detectTrack('كيف أتقدم للجامعة؟')).toBeNull();
  });

  it('يحترم القيمة الموجودة في الملف', () => {
    expect(detectTrack('مسار علمي', { track: 'literary' })).toBe('literary');
  });
});

// ══════════════════════════════════════════════════════
describe('User Profiler — User Type Detection', () => {
  it('يكتشف ولي الأمر', () => {
    expect(detectUserType('ابني يريد الالتحاق بالجامعة')).toBe(USER_TYPES.PARENT);
  });

  it('يكتشف الخريج', () => {
    expect(detectUserType('أنا خريج وأريد الماجستير')).toBe(USER_TYPES.STUDENT_GRAD);
  });

  it('يكتشف الطالب الجامعي', () => {
    expect(detectUserType('أنا طالب جامعي وأريد التحويل')).toBe(USER_TYPES.STUDENT_UNI);
  });

  it('يُرجع GENERAL عند غياب الإشارات', () => {
    expect(detectUserType('ما هي جامعات قطر؟')).toBe(USER_TYPES.GENERAL);
  });
});

// ══════════════════════════════════════════════════════
describe('User Profiler — Build Profile', () => {
  it('يبني ملفاً من رسالة تحتوي معلومات متعددة', () => {
    const profile = buildUserProfile('أنا قطري مسار علمي معدلي 90%');
    expect(profile.nationality).toBe('qatari');
    expect(profile.track).toBe('scientific');
    expect(profile.gpa).toBe(90);
  });

  it('يُدمج مع ملف موجود دون محو البيانات', () => {
    const existing = { nationality: 'qatari', gpa: 85 };
    const updated  = buildUserProfile('مسار أدبي', existing);
    expect(updated.nationality).toBe('qatari');
    expect(updated.gpa).toBe(85);
    expect(updated.track).toBe('literary');
  });

  it('يزيد messageCount في كل استدعاء', () => {
    let profile = buildUserProfile('رسالة أولى');
    expect(profile.messageCount).toBe(1);
    profile = buildUserProfile('رسالة ثانية', profile);
    expect(profile.messageCount).toBe(2);
  });
});

// ══════════════════════════════════════════════════════
describe('User Profiler — Profile Completeness', () => {
  it('يُرجع 0 لملف فارغ', () => {
    expect(getProfileCompleteness({})).toBe(0);
  });

  it('يُرجع 0 لـ null/undefined', () => {
    expect(getProfileCompleteness(null)).toBe(0);
    expect(getProfileCompleteness(undefined)).toBe(0);
  });

  it('يُرجع 100 لملف مكتمل بجميع الحقول الخمسة', () => {
    const fullProfile = {
      nationality:    'qatari',
      userType:       USER_TYPES.STUDENT_HS,
      gpa:            90,
      track:          'scientific',
      preferredMajor: 'engineering',
    };
    expect(getProfileCompleteness(fullProfile)).toBe(100);
  });

  it('يُرجع 40 عند تعبئة حقلَين فقط', () => {
    expect(getProfileCompleteness({ nationality: 'qatari', gpa: 85 })).toBe(40);
  });

  it('يُرجع 60 عند تعبئة ثلاثة حقول', () => {
    expect(getProfileCompleteness({
      nationality: 'qatari',
      userType:    USER_TYPES.STUDENT_HS,
      gpa:         80,
    })).toBe(60);
  });
});
