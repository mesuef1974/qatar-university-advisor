-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 003: PDPPL §5.3 Security Measures Hotfix — RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════
-- Ref:      Consultation #1 — advisor.pdppl_qatar.v1 (2026-04-10)
-- Ticket:   DEC-SEC-002
-- Severity: P0 — Critical (Tier 2-4 PDPPL penalty exposure)
-- Project:  qatar-university-advisor (MoEHE Qatar)
--
-- VULNERABILITY
-- ─────────────
-- All `service_role_all` and `public_read` policies in 001_pgvector_semantic_search.sql
-- and schema.sql used `USING (TRUE)`. Combined with backend usage of
-- SUPABASE_ANON_KEY (not service_role) in lib/supabase.ts, this exposes
-- personal data (names, phones, student records, AI conversations, consents)
-- to any client holding the anon key — which is published to the browser.
--
-- This constitutes:
--   - PDPPL §5.3 Security Measures failure
--   - Article 7 — Consent integrity broken (consents themselves exposed)
--   - Potential Tier 2-4 administrative penalty
--
-- FIX STRATEGY
-- ────────────
-- 1. Drop all USING(TRUE) policies.
-- 2. PII tables (users, conversations, favorites, user_consents, analytics,
--    knowledge_embeddings, conversation_embeddings):
--    - RLS remains ENABLED
--    - NO policy is granted to anon/authenticated roles → default deny
--    - The backend MUST switch to SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
--      See deployment checklist in SECURITY_FIX_RLS_2026-04-10.md
-- 3. Public reference tables (universities, programs, admission_requirements,
--    tuition_fees, scholarships, salary_data, knowledge_cache verified rows):
--    - Keep anon SELECT access but scope it tightly
--    - knowledge_cache: only `is_active = TRUE AND is_verified = TRUE` rows
--    - Other catalog tables: only `is_active = TRUE` where the column exists
--
-- ROLLBACK
-- ────────
-- See bottom of file (commented block). Rollback re-creates the original
-- insecure policies — for emergency use only, never in production.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. PII TABLES — drop open policies, leave deny-by-default
-- ─────────────────────────────────────────────────────────────────────────

-- users (phone, nationality, gpa, profile_data, consent dates)
DROP POLICY IF EXISTS "service_role_all" ON public.users;
-- intentionally NO replacement policy: anon/authenticated → denied
-- Access path: backend with SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)

-- conversations (AI chat history tied to users)
DROP POLICY IF EXISTS "service_role_all" ON public.conversations;

-- favorites (user preferences linking users to universities)
DROP POLICY IF EXISTS "service_role_all" ON public.favorites;

-- analytics (query text — may contain personal queries)
DROP POLICY IF EXISTS "service_role_all" ON public.analytics;

-- user_consents (PDPPL Article 7 consent records — highest sensitivity)
DROP POLICY IF EXISTS "service_role_all" ON public.user_consents;

-- knowledge_embeddings — cache of embeddings; treat as sensitive by default
DROP POLICY IF EXISTS "service_role_all" ON public.knowledge_embeddings;

-- conversation_embeddings — embeddings of chat messages; sensitive
DROP POLICY IF EXISTS "service_role_all" ON public.conversation_embeddings;

-- knowledge_cache (Q&A cache — may contain personal queries in `question`)
DROP POLICY IF EXISTS "service_role_all" ON public.knowledge_cache;

-- Ensure RLS stays ON for all PII tables (idempotent safety)
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_cache     ENABLE ROW LEVEL SECURITY;

-- Embedding tables may not exist on older deployments — guard with IF EXISTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'knowledge_embeddings') THEN
    EXECUTE 'ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_embeddings') THEN
    EXECUTE 'ALTER TABLE public.conversation_embeddings ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Explicit revoke of anon/authenticated privileges on PII tables as a
-- defense-in-depth belt-and-suspenders measure (RLS alone should be enough).
REVOKE ALL ON public.users           FROM anon, authenticated;
REVOKE ALL ON public.conversations   FROM anon, authenticated;
REVOKE ALL ON public.favorites       FROM anon, authenticated;
REVOKE ALL ON public.analytics       FROM anon, authenticated;
REVOKE ALL ON public.user_consents   FROM anon, authenticated;
REVOKE ALL ON public.knowledge_cache FROM anon, authenticated;

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
-- 2. PUBLIC REFERENCE TABLES — drop open policies, create scoped ones
-- ─────────────────────────────────────────────────────────────────────────

-- universities — public catalog, show only active rows
DROP POLICY IF EXISTS "public_read" ON public.universities;
CREATE POLICY "public_read_active_universities" ON public.universities
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- programs — public catalog, show only active rows
DROP POLICY IF EXISTS "public_read" ON public.programs;
CREATE POLICY "public_read_active_programs" ON public.programs
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- admission_requirements — no is_active column; allow SELECT to anon
DROP POLICY IF EXISTS "public_read" ON public.admission_requirements;
CREATE POLICY "public_read_admission_requirements" ON public.admission_requirements
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);  -- reference data, no sensitive fields

-- tuition_fees — public reference, no is_active column
DROP POLICY IF EXISTS "public_read" ON public.tuition_fees;
CREATE POLICY "public_read_tuition_fees" ON public.tuition_fees
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- scholarships — public catalog, show only active scholarships
DROP POLICY IF EXISTS "public_read" ON public.scholarships;
CREATE POLICY "public_read_active_scholarships" ON public.scholarships
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- salary_data — public reference
DROP POLICY IF EXISTS "public_read" ON public.salary_data;
CREATE POLICY "public_read_salary_data" ON public.salary_data
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Grant minimum SELECT for the reference tables (RLS still filters rows)
GRANT SELECT ON public.universities            TO anon, authenticated;
GRANT SELECT ON public.programs                TO anon, authenticated;
GRANT SELECT ON public.admission_requirements  TO anon, authenticated;
GRANT SELECT ON public.tuition_fees            TO anon, authenticated;
GRANT SELECT ON public.scholarships            TO anon, authenticated;
GRANT SELECT ON public.salary_data             TO anon, authenticated;

-- Ensure RLS is enabled on reference tables as well
ALTER TABLE public.universities           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tuition_fees           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_data            ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. VERIFICATION QUERIES (manual review — do not rely on pass/fail here)
-- ─────────────────────────────────────────────────────────────────────────
-- After applying, run these as anon to confirm deny:
--   SET ROLE anon;
--   SELECT count(*) FROM users;            -- expected: 0 rows or permission denied
--   SELECT count(*) FROM conversations;    -- expected: 0 rows or permission denied
--   SELECT count(*) FROM user_consents;    -- expected: 0 rows or permission denied
--   SELECT count(*) FROM universities;     -- expected: active universities count
--   RESET ROLE;
-- And as service_role (backend):
--   SET ROLE service_role;
--   SELECT count(*) FROM users;            -- expected: real count (bypasses RLS)
--   RESET ROLE;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLLBACK (EMERGENCY ONLY — restores the insecure state)
-- ═══════════════════════════════════════════════════════════════════════════
-- BEGIN;
-- DROP POLICY IF EXISTS "public_read_active_universities"    ON public.universities;
-- DROP POLICY IF EXISTS "public_read_active_programs"        ON public.programs;
-- DROP POLICY IF EXISTS "public_read_admission_requirements" ON public.admission_requirements;
-- DROP POLICY IF EXISTS "public_read_tuition_fees"           ON public.tuition_fees;
-- DROP POLICY IF EXISTS "public_read_active_scholarships"    ON public.scholarships;
-- DROP POLICY IF EXISTS "public_read_salary_data"            ON public.salary_data;
--
-- CREATE POLICY "service_role_all" ON users            FOR ALL USING (TRUE);
-- CREATE POLICY "service_role_all" ON conversations    FOR ALL USING (TRUE);
-- CREATE POLICY "service_role_all" ON knowledge_cache  FOR ALL USING (TRUE);
-- CREATE POLICY "service_role_all" ON analytics        FOR ALL USING (TRUE);
-- CREATE POLICY "service_role_all" ON favorites        FOR ALL USING (TRUE);
-- CREATE POLICY "service_role_all" ON user_consents    FOR ALL USING (TRUE);
-- CREATE POLICY "service_role_all" ON knowledge_embeddings   FOR ALL USING (TRUE);
-- CREATE POLICY "service_role_all" ON conversation_embeddings FOR ALL USING (TRUE);
-- CREATE POLICY "public_read" ON universities           FOR SELECT USING (TRUE);
-- CREATE POLICY "public_read" ON programs               FOR SELECT USING (TRUE);
-- CREATE POLICY "public_read" ON admission_requirements FOR SELECT USING (TRUE);
-- CREATE POLICY "public_read" ON tuition_fees           FOR SELECT USING (TRUE);
-- CREATE POLICY "public_read" ON scholarships           FOR SELECT USING (TRUE);
-- CREATE POLICY "public_read" ON salary_data            FOR SELECT USING (TRUE);
-- COMMIT;
-- ═══════════════════════════════════════════════════════════════════════════
