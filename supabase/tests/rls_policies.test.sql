-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policy Tests — PDPPL §5.3 Compliance
-- ═══════════════════════════════════════════════════════════════════════════
-- Ref: Migration 003_pdppl_rls_hotfix.sql, DEC-SEC-002
--
-- Run these manually in Supabase SQL Editor (or via psql) against a staging
-- database with at least one seeded user row, one conversation row, and at
-- least one active + one inactive university.
--
-- Each test prints PASS or FAIL via RAISE NOTICE. A real test harness
-- (pgTAP) is not available in Supabase free tier by default, so this is
-- an assertion-style smoke test.
-- ═══════════════════════════════════════════════════════════════════════════

\echo '══ PDPPL RLS smoke tests ══'

-- ─── Test 1: anon cannot read users ──────────────────────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt INT;
BEGIN
  BEGIN
    SELECT count(*) INTO cnt FROM public.users;
    IF cnt = 0 THEN
      RAISE NOTICE 'PASS: anon sees 0 rows in users';
    ELSE
      RAISE WARNING 'FAIL: anon saw % rows in users', cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: anon denied on users (insufficient_privilege)';
  END;
END $$;
RESET ROLE;

-- ─── Test 2: anon cannot read conversations ──────────────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt INT;
BEGIN
  BEGIN
    SELECT count(*) INTO cnt FROM public.conversations;
    IF cnt = 0 THEN
      RAISE NOTICE 'PASS: anon sees 0 rows in conversations';
    ELSE
      RAISE WARNING 'FAIL: anon saw % rows in conversations', cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: anon denied on conversations (insufficient_privilege)';
  END;
END $$;
RESET ROLE;

-- ─── Test 3: anon cannot read user_consents ──────────────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt INT;
BEGIN
  BEGIN
    SELECT count(*) INTO cnt FROM public.user_consents;
    IF cnt = 0 THEN
      RAISE NOTICE 'PASS: anon sees 0 rows in user_consents';
    ELSE
      RAISE WARNING 'FAIL: anon saw % rows in user_consents', cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: anon denied on user_consents (insufficient_privilege)';
  END;
END $$;
RESET ROLE;

-- ─── Test 4: anon cannot read favorites ──────────────────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt INT;
BEGIN
  BEGIN
    SELECT count(*) INTO cnt FROM public.favorites;
    IF cnt = 0 THEN
      RAISE NOTICE 'PASS: anon sees 0 rows in favorites';
    ELSE
      RAISE WARNING 'FAIL: anon saw % rows in favorites', cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: anon denied on favorites (insufficient_privilege)';
  END;
END $$;
RESET ROLE;

-- ─── Test 5: anon cannot read analytics ──────────────────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt INT;
BEGIN
  BEGIN
    SELECT count(*) INTO cnt FROM public.analytics;
    IF cnt = 0 THEN
      RAISE NOTICE 'PASS: anon sees 0 rows in analytics';
    ELSE
      RAISE WARNING 'FAIL: anon saw % rows in analytics', cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: anon denied on analytics (insufficient_privilege)';
  END;
END $$;
RESET ROLE;

-- ─── Test 6: anon cannot read knowledge_cache ────────────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt INT;
BEGIN
  BEGIN
    SELECT count(*) INTO cnt FROM public.knowledge_cache;
    IF cnt = 0 THEN
      RAISE NOTICE 'PASS: anon sees 0 rows in knowledge_cache';
    ELSE
      RAISE WARNING 'FAIL: anon saw % rows in knowledge_cache', cnt;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: anon denied on knowledge_cache (insufficient_privilege)';
  END;
END $$;
RESET ROLE;

-- ─── Test 7: anon CAN read active universities ───────────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt INT;
BEGIN
  SELECT count(*) INTO cnt FROM public.universities;
  IF cnt > 0 THEN
    RAISE NOTICE 'PASS: anon can read % active universities', cnt;
  ELSE
    RAISE WARNING 'CHECK: anon sees 0 universities (expected > 0 if seed data present)';
  END IF;
END $$;
RESET ROLE;

-- ─── Test 8: anon CANNOT see inactive universities ───────────────────────
SET ROLE anon;
DO $$
DECLARE
  cnt_inactive INT;
BEGIN
  SELECT count(*) INTO cnt_inactive FROM public.universities WHERE is_active = FALSE;
  IF cnt_inactive = 0 THEN
    RAISE NOTICE 'PASS: anon cannot see inactive universities';
  ELSE
    RAISE WARNING 'FAIL: anon saw % inactive universities (RLS leak)', cnt_inactive;
  END IF;
END $$;
RESET ROLE;

-- ─── Test 9: service_role still has full access to users ────────────────
SET ROLE service_role;
DO $$
DECLARE
  cnt INT;
BEGIN
  SELECT count(*) INTO cnt FROM public.users;
  RAISE NOTICE 'INFO: service_role sees % users (expected: real count)', cnt;
END $$;
RESET ROLE;

\echo '══ End of RLS smoke tests ══'
