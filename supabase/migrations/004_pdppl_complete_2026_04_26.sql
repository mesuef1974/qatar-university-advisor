-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 004: PDPPL Complete Fix — DEC-SEC-003
-- ═══════════════════════════════════════════════════════════════════════════
-- Date:    2026-04-26
-- Ref:     DEC-SEC-003 + محضر-17 + شيك ليست-12
-- Purpose: Combined fix for what 002 + 003 should have achieved.
--
-- DISCOVERED STATE (2026-04-26):
-- - PII tables (users, conversations, etc): RLS enabled, NO policies (deny-by-default ✅)
-- - Reference tables: RLS enabled, policies named *_public_read with USING(TRUE) ⚠️
-- - user_consents: TABLE MISSING — Migration 002 never fully applied!
-- - Indexes from 002: status unknown
--
-- THIS MIGRATION:
-- 1. Creates user_consents (PDPPL Article 7 — CRITICAL)
-- 2. Adds missing indexes from 002
-- 3. Tightens reference table policies: USING(TRUE) → USING(is_active = TRUE) where applicable
-- 4. Defense-in-depth REVOKE on PII tables (idempotent)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. CREATE user_consents (CRITICAL — PDPPL Article 7)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_consents (
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_consents_active
  ON public.user_consents(phone, consent_type)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_consents_phone ON public.user_consents(phone);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
-- NO policy granted to anon/authenticated → deny-by-default
-- Backend uses SERVICE_ROLE_KEY which bypasses RLS

-- ─────────────────────────────────────────────────────────────────────────
-- 2. MISSING INDEXES (from migration 002)
-- ─────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_universities_active
  ON public.universities(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_universities_type
  ON public.universities(type);
CREATE INDEX IF NOT EXISTS idx_admission_university
  ON public.admission_requirements(university_id);
CREATE INDEX IF NOT EXISTS idx_admission_gpa
  ON public.admission_requirements(min_gpa);
CREATE INDEX IF NOT EXISTS idx_tuition_university
  ON public.tuition_fees(university_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_active
  ON public.scholarships(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_salary_field
  ON public.salary_data(field);
CREATE INDEX IF NOT EXISTS idx_analytics_source
  ON public.analytics(source);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. DEFENSE-IN-DEPTH: REVOKE on PII tables (idempotent)
-- ─────────────────────────────────────────────────────────────────────────

REVOKE ALL ON public.users               FROM anon, authenticated;
REVOKE ALL ON public.conversations       FROM anon, authenticated;
REVOKE ALL ON public.favorites           FROM anon, authenticated;
REVOKE ALL ON public.analytics           FROM anon, authenticated;
REVOKE ALL ON public.user_consents       FROM anon, authenticated;
REVOKE ALL ON public.knowledge_cache     FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'knowledge_embeddings') THEN
    EXECUTE 'REVOKE ALL ON public.knowledge_embeddings FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_embeddings') THEN
    EXECUTE 'REVOKE ALL ON public.conversation_embeddings FROM anon, authenticated';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. TIGHTEN REFERENCE TABLE POLICIES (USING TRUE → USING is_active = TRUE)
-- ─────────────────────────────────────────────────────────────────────────
-- IMPORTANT: drop the EXISTING policies (named *_public_read), not the
-- ones from 003 (named public_read). This is what migration 003 missed.

-- universities
DROP POLICY IF EXISTS "universities_public_read" ON public.universities;
DROP POLICY IF EXISTS "public_read_active_universities" ON public.universities;
CREATE POLICY "public_read_active_universities" ON public.universities
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

-- programs
DROP POLICY IF EXISTS "programs_public_read" ON public.programs;
DROP POLICY IF EXISTS "public_read_active_programs" ON public.programs;
CREATE POLICY "public_read_active_programs" ON public.programs
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

-- scholarships
DROP POLICY IF EXISTS "scholarships_public_read" ON public.scholarships;
DROP POLICY IF EXISTS "public_read_active_scholarships" ON public.scholarships;
CREATE POLICY "public_read_active_scholarships" ON public.scholarships
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

-- admission_requirements (no is_active column → keep TRUE but explicit)
DROP POLICY IF EXISTS "admission_requirements_public_read" ON public.admission_requirements;
DROP POLICY IF EXISTS "public_read_admission_requirements" ON public.admission_requirements;
CREATE POLICY "public_read_admission_requirements" ON public.admission_requirements
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- tuition_fees (no is_active column)
DROP POLICY IF EXISTS "tuition_fees_public_read" ON public.tuition_fees;
DROP POLICY IF EXISTS "public_read_tuition_fees" ON public.tuition_fees;
CREATE POLICY "public_read_tuition_fees" ON public.tuition_fees
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- salary_data (no is_active column)
DROP POLICY IF EXISTS "salary_data_public_read" ON public.salary_data;
DROP POLICY IF EXISTS "public_read_salary_data" ON public.salary_data;
CREATE POLICY "public_read_salary_data" ON public.salary_data
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Ensure GRANT SELECT (RLS still filters rows)
GRANT SELECT ON public.universities            TO anon, authenticated;
GRANT SELECT ON public.programs                TO anon, authenticated;
GRANT SELECT ON public.admission_requirements  TO anon, authenticated;
GRANT SELECT ON public.tuition_fees            TO anon, authenticated;
GRANT SELECT ON public.scholarships            TO anon, authenticated;
GRANT SELECT ON public.salary_data             TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. HARDEN FUNCTIONS (security advisor warnings 0011)
-- ─────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_cache_use' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.increment_cache_use SET search_path = public, pg_catalog';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at SET search_path = public, pg_catalog';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'search_knowledge' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.search_knowledge SET search_path = public, pg_catalog';
  END IF;
END $$;

COMMIT;
