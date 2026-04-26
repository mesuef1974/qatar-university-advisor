/**
 * Admin Insights API
 * ──────────────────
 * GET /api/admin/insights?token=...
 *
 * Returns aggregated analytics safe for non-PII display:
 *   - top queries (last 7 days)
 *   - response source distribution (db / smart_search / ai)
 *   - daily message volume (last 14 days)
 *   - users count + active-in-last-24h
 *   - unanswered queries (matched_key IS NULL)
 *
 * PDPPL: never returns raw user phones, names, or message content. Only
 * aggregates and counts. Auth via simple bearer token to keep public scrapers
 * out — replace with proper admin session auth before exposing in UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@lib/supabase";
import { logger } from "@lib/logger.js";

interface CountRow { matched_key: string | null }
interface SourceRow { source: string }
interface DailyRow { day: string; count: number }

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || request.headers.get("x-admin-token");
  const expected = process.env.ADMIN_INSIGHTS_TOKEN;

  if (!expected) {
    return NextResponse.json({ error: "ADMIN_INSIGHTS_TOKEN not configured" }, { status: 500 });
  }
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: `Supabase init failed: ${msg}` }, { status: 503 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const [topQueriesRes, sourcesRes, usersRes, activeRes, unansweredRes, dailyRes] =
      await Promise.all([
        // Top matched queries (last 7 days, top 20)
        supabase
          .from("analytics")
          .select("matched_key")
          .gte("created_at", sevenDaysAgo)
          .not("matched_key", "is", null)
          .limit(5000),

        // Response source distribution (last 7 days)
        supabase
          .from("analytics")
          .select("source")
          .gte("created_at", sevenDaysAgo)
          .limit(5000),

        // Total users
        supabase.from("users").select("id", { count: "exact", head: true }),

        // Active users (last 24h)
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .gte("last_seen_at", oneDayAgo),

        // Unanswered (matched_key IS NULL — last 7 days, top 20)
        supabase
          .from("analytics")
          .select("query")
          .gte("created_at", sevenDaysAgo)
          .is("matched_key", null)
          .limit(200),

        // Daily volume (last 14 days)
        supabase.rpc("analytics_daily_counts", { days_back: 14 }).maybeSingle(),
      ]);

    // Aggregate top queries
    const topQueries: Record<string, number> = {};
    (topQueriesRes.data as CountRow[] | null)?.forEach((r) => {
      if (r.matched_key) topQueries[r.matched_key] = (topQueries[r.matched_key] || 0) + 1;
    });
    const topQueriesList = Object.entries(topQueries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([key, count]) => ({ key, count }));

    // Aggregate sources
    const sources: Record<string, number> = {};
    (sourcesRes.data as SourceRow[] | null)?.forEach((r) => {
      sources[r.source || "unknown"] = (sources[r.source || "unknown"] || 0) + 1;
    });

    // Unanswered — strip to first 80 chars and hash for grouping
    const unansweredCounts: Record<string, number> = {};
    (unansweredRes.data as { query: string }[] | null)?.forEach((r) => {
      const key = (r.query || "").trim().slice(0, 80);
      if (key) unansweredCounts[key] = (unansweredCounts[key] || 0) + 1;
    });
    const unansweredList = Object.entries(unansweredCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));

    // Daily volume — RPC may not exist yet on older deployments; tolerate that.
    const daily: DailyRow[] = Array.isArray(dailyRes.data)
      ? (dailyRes.data as DailyRow[])
      : [];

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      window: { from: sevenDaysAgo, to: new Date().toISOString() },
      users: {
        total: usersRes.count || 0,
        active24h: activeRes.count || 0,
      },
      topQueries: topQueriesList,
      sourceDistribution: sources,
      unanswered: unansweredList,
      daily: daily.length > 0 ? daily : null,
      dailyDataAvailable: daily.length > 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    logger.error("[admin-insights] failed", { error: msg });
    return NextResponse.json({ error: `Insights failed: ${msg}` }, { status: 500 });
  }
}

// Edge-incompatible (uses node Crypto via supabase-js); pin to nodejs.
export const runtime = "nodejs";
