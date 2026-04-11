/**
 * Unit tests for lib/db-context.ts
 * تغطي: اكتشاف الفئة + جلب السياق من Supabase
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

// ──────────────────────────────────────────────────────────
// Mock Supabase (supabase singleton = null by default → graceful no-op)
// ──────────────────────────────────────────────────────────
vi.mock('../../lib/supabase.js', () => ({
  supabase: null,
  isSupabaseAvailable: () => false,
}));

const { detectCategory, fetchDbContext } = await import('../../lib/db-context.js');

// ──────────────────────────────────────────────────────────
// detectCategory
// ──────────────────────────────────────────────────────────
describe('detectCategory', () => {
  it('يكتشف فئة الجامعات', () => {
    expect(detectCategory('ما هي جامعة قطر؟')).toBe('universities');
    expect(detectCategory('هل تقدمت في HBKU؟')).toBe('universities');
    expect(detectCategory('تسجيل في CMU')).toBe('universities');
  });

  it('يكتشف فئة المنح', () => {
    expect(detectCategory('ما هي المنح المتاحة للقطريين؟')).toBe('scholarships');
    expect(detectCategory('أريد الابتعاث للخارج')).toBe('scholarships');
    expect(detectCategory('البعثة الأميرية')).toBe('scholarships');
  });

  it('يكتشف فئة الرواتب', () => {
    expect(detectCategory('ما راتب هندسة البترول؟')).toBe('salary');
    expect(detectCategory('كم أجر الطبيب في قطر؟')).toBe('salary');
    expect(detectCategory('الرواتب في شركة قطر للطاقة')).toBe('salary');
  });

  it('يكتشف فئة القبول', () => {
    // "معدل القبول" = 2 كلمات من admission تغلب على "جامعة" واحدة من universities
    expect(detectCategory('ما هو معدل القبول في جامعة قطر؟')).toBe('admission');
    expect(detectCategory('ما شروط القبول؟')).toBe('admission');
  });

  it('يكتشف فئة البرامج', () => {
    expect(detectCategory('ما تخصصات الهندسة في قطر؟')).toBe('programs');
    expect(detectCategory('برنامج علوم الحاسوب')).toBe('programs');
  });

  it('يكتشف فئة الكليات العسكرية', () => {
    // "العسكرية" تحتوي "عسكري" → military يفوز
    expect(detectCategory('الكليات العسكرية في قطر')).toBe('military');
    expect(detectCategory('أركان الجيش القطري')).toBe('military');
  });

  it('يُعيد general للأسئلة العامة', () => {
    expect(detectCategory('مرحبا')).toBe('general');
    expect(detectCategory('شكراً')).toBe('general');
  });

  it('يُعيد أول فئة في حالة التعادل', () => {
    // "جامعة" (universities) + "راتب" (salary) = تعادل 1-1
    // universities تظهر أولاً في الكائن → تفوز
    expect(detectCategory('جامعة والراتب')).toBe('universities');
  });
});

// ──────────────────────────────────────────────────────────
// fetchDbContext — بدون Supabase
// ──────────────────────────────────────────────────────────
describe('fetchDbContext — Supabase غير متاح', () => {
  it('يُعيد null عند غياب Supabase', async () => {
    const result = await fetchDbContext('ما هي جامعة قطر؟');
    expect(result).toBeNull();
  });

  it('يُعيد null لأي فئة', async () => {
    expect(await fetchDbContext('المنح للقطريين')).toBeNull();
    expect(await fetchDbContext('الرواتب في قطر')).toBeNull();
    expect(await fetchDbContext('مرحبا')).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────
// fetchDbContext — مع Supabase مُحاكى
// ──────────────────────────────────────────────────────────
describe('fetchDbContext — مع Supabase مُحاكى', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('يُعيد سياق الجامعات عند توفر البيانات', async () => {
    const mockUniversity = {
      id: 1,
      slug: 'qu',
      name_ar: 'جامعة قطر',
      name_en: 'Qatar University',
      type: 'public',
      location: 'الدوحة',
      website: 'https://www.qu.edu.qa',
      description_ar: 'أكبر جامعة حكومية',
      is_active: true,
      closing_note: null,
      programs: [{ name_ar: 'هندسة الحاسوب', field: 'engineering', degree: 'bachelor' }],
      admission_requirements: [{ nationality: 'qatari', min_gpa: 60, english_requirement: 'IELTS 5.5', notes: null }],
      tuition_fees: [{ nationality: 'qatari', amount_per_year: null, is_free_for_qatari: true, notes: null }],
    };

    vi.doMock('../../lib/supabase.js', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({ data: [mockUniversity], error: null }),
          }),
        }),
      },
    }));

    const { fetchDbContext: fetchFresh } = await import('../../lib/db-context.js');
    const result = await fetchFresh('ما هي جامعة قطر؟');
    expect(result).not.toBeNull();
    expect(result).toContain('جامعة قطر');
    expect(result).toContain('Supabase');
    expect(result).toContain('مجانية للقطريين');
  });

  it('يُعيد null عند خطأ في الاستعلام', async () => {
    vi.doMock('../../lib/supabase.js', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({ data: null, error: { message: 'connection error' } }),
          }),
        }),
      },
    }));

    const { fetchDbContext: fetchFresh } = await import('../../lib/db-context.js');
    const result = await fetchFresh('ما هي جامعة قطر؟');
    expect(result).toBeNull();
  });
});
