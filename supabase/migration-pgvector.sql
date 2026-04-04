-- T-020: pgvector RAG — Semantic Search Migration
-- تشغيل هذا الملف في Supabase SQL Editor

-- 1. تفعيل pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. إضافة عمود embedding لجدول knowledge_cache
ALTER TABLE knowledge_cache
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. إنشاء HNSW index للبحث السريع
CREATE INDEX IF NOT EXISTS knowledge_cache_embedding_idx
  ON knowledge_cache
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 4. دالة البحث الدلالي
CREATE OR REPLACE FUNCTION search_knowledge_semantic(
  query_embedding vector(768),
  similarity_threshold float DEFAULT 0.75,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  question text,
  answer text,
  category text,
  use_count int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.question,
    kc.answer,
    kc.category,
    kc.use_count,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_cache kc
  WHERE kc.embedding IS NOT NULL
    AND 1 - (kc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
