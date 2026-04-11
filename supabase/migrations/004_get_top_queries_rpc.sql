-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 004: get_top_queries — Postgres-side aggregation
-- ═══════════════════════════════════════════════════════════════════════════
-- Ref:     Performance improvement — avoids loading 10,000 analytics rows
--          into JavaScript memory for in-process aggregation.
-- Ticket:  QA-PERF-001
-- Related: lib/supabase.ts getTopQueries()
--
-- Before this migration, getTopQueries() fetched up to 10,000 recent rows
-- from the `analytics` table and counted occurrences in JavaScript.
-- This RPC function moves the GROUP BY aggregation to Postgres, which:
--   - Reduces data transfer (N matched_key values → M distinct keys)
--   - Eliminates per-invocation memory pressure in Vercel Serverless
--   - Returns pre-sorted, pre-limited results in a single round-trip
--
-- The function is SECURITY DEFINER only if called by service_role; for
-- anon callers, `analytics` is revoked so the function will receive 0 rows.
-- After migration 003, only the service_role backend calls this via the
-- Supabase service-role client (lib/supabase.ts).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_top_queries(limit_count INT DEFAULT 20)
RETURNS TABLE (key TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    matched_key AS key,
    count(*)    AS count
  FROM analytics
  WHERE matched_key IS NOT NULL
  GROUP BY matched_key
  ORDER BY count DESC
  LIMIT limit_count;
$$;

-- Grant execute to service_role so the backend client can call it.
-- anon/authenticated are NOT granted execute; they have no SELECT on analytics
-- (revoked in migration 003), so even if called they would see 0 rows.
GRANT EXECUTE ON FUNCTION get_top_queries(INT) TO service_role;
