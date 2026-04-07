-- Migration 002: user_consents table + missing indexes
-- Source: QA Full Audit 2026-04-07 (DB-01, DB-04)
-- PDPPL Article 7: Explicit consent tracking

-- ════════════════════════════════════════
-- 1. Create user_consents table (CRITICAL)
-- ════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  consent_type TEXT NOT NULL DEFAULT 'data_processing',
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  consent_text TEXT DEFAULT 'PDPPL Article 7 — explicit consent for data processing',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one active consent per phone per type
CREATE UNIQUE INDEX idx_consents_active
  ON user_consents(phone, consent_type)
  WHERE is_active = TRUE;

CREATE INDEX idx_consents_phone ON user_consents(phone);

-- RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON user_consents
  FOR ALL USING (TRUE);

-- ════════════════════════════════════════
-- 2. Missing indexes on academic tables
-- ════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_universities_active
  ON universities(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_universities_type
  ON universities(type);
CREATE INDEX IF NOT EXISTS idx_admission_university
  ON admission_requirements(university_id);
CREATE INDEX IF NOT EXISTS idx_admission_gpa
  ON admission_requirements(min_gpa);
CREATE INDEX IF NOT EXISTS idx_tuition_university
  ON tuition_fees(university_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_active
  ON scholarships(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_salary_field
  ON salary_data(field);
CREATE INDEX IF NOT EXISTS idx_analytics_source
  ON analytics(source);

-- ════════════════════════════════════════
-- 3. Enable RLS on embedding tables
-- ════════════════════════════════════════
ALTER TABLE IF EXISTS knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "service_role_all" ON knowledge_embeddings FOR ALL USING (TRUE);
CREATE POLICY IF NOT EXISTS "service_role_all" ON conversation_embeddings FOR ALL USING (TRUE);
