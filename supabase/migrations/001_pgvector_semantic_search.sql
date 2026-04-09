-- ══════════════════════════════════════════════════════════════
-- Migration 001: pgvector Semantic Search
-- Qatar University Advisor — شركة أذكياء للبرمجيات
-- تفعيل البحث الدلالي بـ OpenAI/Gemini embeddings
-- ══════════════════════════════════════════════════════════════

-- 1. تفعيل امتداد pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. جدول embeddings للمعرفة الأكاديمية
CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content       TEXT NOT NULL,           -- النص الأصلي
  content_type  TEXT NOT NULL,           -- 'university' | 'major' | 'scholarship' | 'admission'
  embedding     vector(768),             -- Gemini embedding-001 = 768 dimensions
  metadata      JSONB DEFAULT '{}',      -- بيانات إضافية (اسم الجامعة، التخصص، إلخ)
  language      TEXT DEFAULT 'ar',       -- 'ar' | 'en'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index للبحث السريع (IVFFlat للأداء)
CREATE INDEX IF NOT EXISTS knowledge_embeddings_vector_idx
  ON knowledge_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Index على content_type للفلترة
CREATE INDEX IF NOT EXISTS knowledge_embeddings_type_idx
  ON knowledge_embeddings (content_type);

-- 5. دالة البحث الدلالي
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT   DEFAULT 5,
  filter_type     TEXT  DEFAULT NULL
)
RETURNS TABLE (
  id           UUID,
  content      TEXT,
  content_type TEXT,
  metadata     JSONB,
  similarity   FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.content,
    ke.content_type,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) AS similarity
  FROM knowledge_embeddings ke
  WHERE
    (filter_type IS NULL OR ke.content_type = filter_type)
    AND 1 - (ke.embedding <=> query_embedding) > match_threshold
  ORDER BY ke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. جدول conversation_embeddings لتتبع المحادثات
CREATE TABLE IF NOT EXISTS conversation_embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  message     TEXT NOT NULL,
  embedding   vector(768),
  role        TEXT DEFAULT 'user',  -- 'user' | 'assistant'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conv_embeddings_session_idx
  ON conversation_embeddings (session_id);

-- 7. Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_embeddings_updated_at
  BEFORE UPDATE ON knowledge_embeddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- للتشغيل على Supabase:
-- Dashboard → SQL Editor → New Query → الصق هذا الكود → Run
-- ══════════════════════════════════════════════════════════════
