/* global process */
/**
 * Unit Tests — Knowledge Base Manager
 * QA-A1: رفع تغطية الاختبارات من 35% إلى 70%
 * 12 حالة اختبار تغطي: normalizeText, detectCategory, getFromKnowledgeBase, generateEmbedding
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase — inline to avoid hoisting issues ──
vi.mock('../../lib/supabase.js', () => {
  const _mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
  const _mockOrder = vi.fn(() => ({ limit: _mockLimit }));
  const _mockOr2 = vi.fn(() => ({ order: _mockOrder }));
  const _mockOr1 = vi.fn(() => ({ or: _mockOr2 }));
  const _mockEq = vi.fn(() => ({ or: _mockOr1 }));
  const _mockSelect = vi.fn(() => ({ eq: _mockEq }));
  const _mockInsertSingle = vi.fn().mockResolvedValue({ data: { id: 'test-uuid' }, error: null });
  const _mockInsertSelect = vi.fn(() => ({ single: _mockInsertSingle }));
  const _mockInsert = vi.fn(() => ({ select: _mockInsertSelect }));
  const _mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const _mockUpdate = vi.fn(() => ({ eq: _mockUpdateEq }));
  const _mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

  return {
    supabase: {
      from: vi.fn(() => ({
        select: _mockSelect,
        insert: _mockInsert,
        update: _mockUpdate,
      })),
      rpc: _mockRpc,
    },
  };
});

// Mock global fetch for generateEmbedding
const mockFetch = vi.fn();
global.fetch = mockFetch;

import {
  normalizeText,
  detectCategory,
  getFromKnowledgeBase,
  generateEmbedding,
} from '../../lib/knowledge-base.js';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GOOGLE_API_KEY = 'test-key';
});

// ══════════════════════════════════════════════════════
describe('normalizeText — تطبيع النص العربي', () => {
  it('يزيل التشكيل من النص العربي', () => {
    const result = normalizeText('جَامِعَة');
    expect(result).not.toContain('\u064E'); // فتحة
    expect(result).not.toContain('\u0650'); // كسرة
  });

  it('يوحّد همزات الألف', () => {
    const result = normalizeText('أحمد إبراهيم آل');
    expect(result).toContain('احمد');
    expect(result).toContain('ابراهيم');
    expect(result).toContain('ال');
  });

  it('يوحّد التاء المربوطة والهاء', () => {
    const result = normalizeText('جامعة');
    expect(result).toBe('جامعه');
  });

  it('يحول الأحرف الإنجليزية للصغيرة', () => {
    const result = normalizeText('HBKU University');
    expect(result).toBe('hbku university');
  });

  it('يزيل المسافات الزائدة', () => {
    const result = normalizeText('جامعة    قطر');
    expect(result).toBe('جامعه قطر');
  });
});

// ══════════════════════════════════════════════════════
describe('detectCategory — تصنيف السؤال تلقائياً', () => {
  it('يصنّف سؤال عن الجامعات بشكل صحيح', () => {
    const result = detectCategory('ما هي شروط القبول في جامعة قطر');
    expect(result).toBe('universities');
  });

  it('يصنّف سؤال عن المنح بشكل صحيح', () => {
    const result = detectCategory('أريد منحة دراسية ابتعاث');
    expect(result).toBe('scholarships');
  });

  it('يصنّف سؤال عن الرواتب بشكل صحيح', () => {
    const result = detectCategory('كم راتب المهندس والوظائف المتاحة');
    expect(result).toBe('salary');
  });

  it('يُرجع general لسؤال عام', () => {
    const result = detectCategory('كيف حالك اليوم');
    expect(result).toBe('general');
  });

  it('يصنّف سؤال عن التخصصات', () => {
    const result = detectCategory('تخصص هندسة حاسوب');
    expect(result).toBe('programs');
  });

  it('يصنّف سؤال عن العسكري', () => {
    const result = detectCategory('الكلية العسكرية ضابط');
    expect(result).toBe('military');
  });
});

// ══════════════════════════════════════════════════════
describe('getFromKnowledgeBase — البحث الرئيسي', () => {
  it('يُرجع null لسؤال فارغ', async () => {
    const result = await getFromKnowledgeBase('');
    expect(result).toBeNull();
  });

  it('يُرجع null لسؤال يحتوي مسافات فقط', async () => {
    const result = await getFromKnowledgeBase('   ');
    expect(result).toBeNull();
  });
});

// ══════════════════════════════════════════════════════
describe('generateEmbedding — توليد Embedding', () => {
  it('يُرجع null عند عدم وجود GOOGLE_API_KEY', async () => {
    delete process.env.GOOGLE_API_KEY;
    const result = await generateEmbedding('اختبار');
    expect(result).toBeNull();
  });

  it('يُرجع null عند فشل الـ API', async () => {
    process.env.GOOGLE_API_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await generateEmbedding('اختبار');
    expect(result).toBeNull();
  });

  it('يُرجع المتجه عند نجاح الـ API', async () => {
    process.env.GOOGLE_API_KEY = 'test-key';
    const fakeVector = [0.1, 0.2, 0.3];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ embedding: { values: fakeVector } }),
    });
    const result = await generateEmbedding('اختبار');
    expect(result).toEqual(fakeVector);
  });
});
