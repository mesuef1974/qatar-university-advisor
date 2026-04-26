-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 006: Knowledge Base Enrichment + Versioning
-- ═══════════════════════════════════════════════════════════════════════════
-- Ref:      Sprint 2 of platform-improvements roadmap (Initiative #1)
-- Project:  qatar-university-advisor (MoEHE Qatar)
-- Severity: Non-breaking — all changes are additive
--
-- WHAT
-- ────
-- 1. Enrich `universities` with deadline, apply_url, logo_url, qs_rank,
--    student_count, language_requirements (JSONB).
-- 2. Create `program_career_paths` to relate programs ↔ salary_data with
--    a fit_score (analyst-curated 0..1).
-- 3. Create `knowledge_versions` audit log so every KB row change is captured
--    (who, when, source, prior snapshot).
--
-- WHY
-- ───
-- - Today universities rows are flat — chat bot cannot answer "when does
--   admission open?" or link a student to the apply form.
-- - No relation between programs and post-grad outcomes (salary_data) — the
--   "what can I do with this major?" question requires JOINs we cannot do.
-- - No audit on KB edits — analysts and admins can rewrite rows without trace.
--
-- ROLLBACK
-- ────────
-- Bottom of file (commented). Drops added columns + new tables.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. ENRICH universities (additive — no data loss)
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS application_deadline DATE,
  ADD COLUMN IF NOT EXISTS application_open_date DATE,
  ADD COLUMN IF NOT EXISTS apply_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS qs_world_rank INT,
  ADD COLUMN IF NOT EXISTS qs_arab_rank INT,
  ADD COLUMN IF NOT EXISTS student_count INT,
  ADD COLUMN IF NOT EXISTS language_requirements JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

COMMENT ON COLUMN public.universities.application_deadline IS 'Final date for the next application cycle (null if rolling).';
COMMENT ON COLUMN public.universities.apply_url IS 'Canonical URL students should follow to apply.';
COMMENT ON COLUMN public.universities.language_requirements IS 'JSON: {"toefl_min":80,"ielts_min":6.5,"arabic_required":false,...}';
COMMENT ON COLUMN public.universities.last_verified_at IS 'When an analyst last confirmed this row matches the official source.';

-- Index for "deadline approaching" queries (e.g., proactive reminders)
CREATE INDEX IF NOT EXISTS idx_universities_deadline
  ON public.universities (application_deadline)
  WHERE application_deadline IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. NEW: program_career_paths (programs ↔ salary_data with fit score)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.program_career_paths (
  id            SERIAL PRIMARY KEY,
  program_id    INT NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  career_id     INT NOT NULL REFERENCES public.salary_data(id) ON DELETE CASCADE,
  fit_score     NUMERIC(3,2) NOT NULL CHECK (fit_score BETWEEN 0 AND 1),
  rationale_ar  TEXT,           -- short explanation shown to students
  curated_by    TEXT,
  curated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (program_id, career_id)
);

COMMENT ON TABLE public.program_career_paths IS 'Analyst-curated mapping of programs to salary_data rows with a 0..1 fit score. Powers "what can I do with this major?" answers.';
COMMENT ON COLUMN public.program_career_paths.fit_score IS '0.00 = unrelated, 0.50 = adjacent, 1.00 = direct path.';

CREATE INDEX IF NOT EXISTS idx_pcp_program  ON public.program_career_paths (program_id);
CREATE INDEX IF NOT EXISTS idx_pcp_career   ON public.program_career_paths (career_id);
CREATE INDEX IF NOT EXISTS idx_pcp_fit_desc ON public.program_career_paths (fit_score DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. NEW: knowledge_versions (audit log for KB row changes)
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.knowledge_versions (
  id            BIGSERIAL PRIMARY KEY,
  table_name    TEXT NOT NULL,
  row_pk        TEXT NOT NULL,           -- stringified PK (works for INT or UUID)
  snapshot      JSONB NOT NULL,          -- prior row state before the change
  change_type   TEXT NOT NULL CHECK (change_type IN ('insert','update','delete')),
  source        TEXT,                    -- 'admin_ui' | 'etl' | 'manual_sql' | ...
  changed_by    TEXT,                    -- email or user id of editor
  changed_at    TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT
);

COMMENT ON TABLE public.knowledge_versions IS 'Append-only audit log of every change to KB tables (universities, programs, scholarships, salary_data). Use for rollback investigations and compliance.';

CREATE INDEX IF NOT EXISTS idx_kv_table_row ON public.knowledge_versions (table_name, row_pk);
CREATE INDEX IF NOT EXISTS idx_kv_changed_at_desc ON public.knowledge_versions (changed_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. RLS — keep new tables consistent with the deny-by-default policy
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.program_career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_versions   ENABLE ROW LEVEL SECURITY;

-- program_career_paths is reference data (no PII) — allow public read of
-- curated rows, write goes through service_role only.
DROP POLICY IF EXISTS "public_read_program_career_paths" ON public.program_career_paths;
CREATE POLICY "public_read_program_career_paths" ON public.program_career_paths
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

GRANT SELECT ON public.program_career_paths TO anon, authenticated;

-- knowledge_versions is internal audit data — no anon access at all.
-- (no policy granted → deny by default)
REVOKE ALL ON public.knowledge_versions FROM anon, authenticated;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLLBACK (EMERGENCY ONLY)
-- ═══════════════════════════════════════════════════════════════════════════
-- BEGIN;
-- DROP TABLE IF EXISTS public.knowledge_versions;
-- DROP TABLE IF EXISTS public.program_career_paths;
-- ALTER TABLE public.universities
--   DROP COLUMN IF EXISTS application_deadline,
--   DROP COLUMN IF EXISTS application_open_date,
--   DROP COLUMN IF EXISTS apply_url,
--   DROP COLUMN IF EXISTS logo_url,
--   DROP COLUMN IF EXISTS qs_world_rank,
--   DROP COLUMN IF EXISTS qs_arab_rank,
--   DROP COLUMN IF EXISTS student_count,
--   DROP COLUMN IF EXISTS language_requirements,
--   DROP COLUMN IF EXISTS last_verified_at,
--   DROP COLUMN IF EXISTS verified_by;
-- COMMIT;
-- ═══════════════════════════════════════════════════════════════════════════
