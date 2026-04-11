/**
 * Unit Tests — Semantic Search
 * T-Q7-T015: اختبار وحدة البحث الدلالي
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/supabase.js', () => ({
  supabase: null,
  isSupabaseAvailable: vi.fn().mockReturnValue(false),
}));

// Mock fetch للـ Gemini API
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('Semantic Search — generateEmbedding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GOOGLE_API_KEY', 'test-key');
  });

  it('يُرجع null عند غياب GOOGLE_API_KEY', async () => {
    vi.stubEnv('GOOGLE_API_KEY', '');
    const { generateEmbedding } = await import('../../lib/semantic-search.js');
    const result = await generateEmbedding('نص تجريبي');
    expect(result).toBeNull();
  });

  it('يُرجع null عند فشل الـ API', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { generateEmbedding } = await import('../../lib/semantic-search.js');
    const result = await generateEmbedding('نص تجريبي');
    expect(result).toBeNull();
  });

  it('يُرجع null عند رد API غير ناجح', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { generateEmbedding } = await import('../../lib/semantic-search.js');
    const result = await generateEmbedding('نص');
    expect(result).toBeNull();
  });
});

describe('Semantic Search — semanticSearch', () => {
  it('يُرجع مصفوفة فارغة عند غياب Supabase', async () => {
    const { semanticSearch } = await import('../../lib/semantic-search.js');
    const results = await semanticSearch('ما هي جامعة قطر؟');
    expect(results).toBeInstanceOf(Array);
    expect(results).toHaveLength(0);
  });
});

describe('Semantic Search — hybridSearch', () => {
  it('يُرجع نتائج keywords عند غياب Supabase', async () => {
    const { hybridSearch } = await import('../../lib/semantic-search.js');
    const keywordResults = ['نتيجة 1', 'نتيجة 2'];
    const results = await hybridSearch('سؤال', keywordResults);
    expect(results).toBeInstanceOf(Array);
  });

  it('يعمل بدون keyword results', async () => {
    const { hybridSearch } = await import('../../lib/semantic-search.js');
    const results = await hybridSearch('سؤال');
    expect(results).toBeInstanceOf(Array);
  });
});
