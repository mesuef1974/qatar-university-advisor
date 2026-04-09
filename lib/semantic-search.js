/**
 * Semantic Search — البحث الدلالي بـ pgvector
 * T-Q7-T005: تفعيل البحث الدلالي على Supabase
 * يُكمل الـ Hybrid Search Chain: Jaccard → Semantic → Keywords → Claude
 */

import { supabase, isSupabaseAvailable } from './supabase';

const EMBEDDING_DIMENSION = 768;
const SIMILARITY_THRESHOLD = 0.70;
const MAX_RESULTS = 5;

/**
 * توليد Embedding لنص معين باستخدام Claude
 * @param {string} text
 * @returns {Promise<number[]|null>}
 */
export async function generateEmbedding(text) {
  /* global process */
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.embedding?.values || null;
  } catch {
    return null;
  }
}

/**
 * البحث الدلالي في قاعدة المعرفة
 * @param {string} query - النص للبحث
 * @param {object} options
 * @returns {Promise<Array>}
 */
export async function semanticSearch(query, {
  threshold  = SIMILARITY_THRESHOLD,
  maxResults = MAX_RESULTS,
  filterType = null,
} = {}) {
  if (!isSupabaseAvailable() || !supabase) return [];

  const embedding = await generateEmbedding(query);
  if (!embedding || embedding.length !== EMBEDDING_DIMENSION) return [];

  try {
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count:     maxResults,
      filter_type:     filterType,
    });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * حفظ embedding في قاعدة البيانات
 * @param {string} content
 * @param {string} contentType
 * @param {object} metadata
 * @returns {Promise<boolean>}
 */
export async function saveKnowledgeEmbedding(content, contentType, metadata = {}) {
  if (!isSupabaseAvailable() || !supabase) return false;

  const embedding = await generateEmbedding(content);
  if (!embedding) return false;

  try {
    const { error } = await supabase
      .from('knowledge_embeddings')
      .upsert({
        content,
        content_type: contentType,
        embedding,
        metadata,
        language: /[\u0600-\u06FF]/.test(content) ? 'ar' : 'en',
      });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Hybrid Search: يجمع النتائج من Semantic + Keyword
 * @param {string} query
 * @param {string[]} keywordResults - نتائج البحث بالكلمات المفتاحية
 * @returns {Promise<string[]>}
 */
export async function hybridSearch(query, keywordResults = []) {
  const semanticResults = await semanticSearch(query);

  // دمج النتائج مع إزالة التكرار
  const combined = new Map();

  semanticResults.forEach(r => {
    combined.set(r.id, { ...r, source: 'semantic' });
  });

  keywordResults.forEach((r, i) => {
    if (!combined.has(`kw_${i}`)) {
      combined.set(`kw_${i}`, { content: r, similarity: 0.5, source: 'keyword' });
    }
  });

  return Array.from(combined.values())
    .sort((a, b) => b.similarity - a.similarity)
    .map(r => r.content)
    .slice(0, MAX_RESULTS);
}
