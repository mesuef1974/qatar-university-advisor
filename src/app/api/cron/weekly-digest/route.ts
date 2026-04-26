/**
 * Weekly Digest Cron
 * ──────────────────
 * GET /api/cron/weekly-digest
 *
 * Pulls aggregated KPIs for the last 7 days and POSTs them to a webhook
 * (Slack, Discord, generic). Designed to be triggered by Vercel Cron once
 * per week (configured in vercel.json).
 *
 * Auth: Vercel Cron sends `x-vercel-cron: 1`. Reject anything else so an
 * unauthenticated GET cannot trigger external webhook spam.
 *
 * Required env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (for stats)
 *   DIGEST_WEBHOOK_URL                        (target — Slack/Discord/webhook.site)
 *
 * PDPPL: only aggregates leave the system. No phone numbers, no message text.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@lib/supabase";
import { logger } from "@lib/logger.js";

interface Aggregates {
  users_total: number;
  users_active_7d: number;
  messages_7d: number;
  unanswered_7d: number;
  top_queries: Array<{ key: string; count: number }>;
}

async function buildDigest(): Promise<Aggregates> {
  const supabase = getSupabaseServerClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [users, active, messages, unanswered, queries] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("last_seen_at", sevenDaysAgo),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("analytics")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo)
      .is("matched_key", null),
    supabase
      .from("analytics")
      .select("matched_key")
      .gte("created_at", sevenDaysAgo)
      .not("matched_key", "is", null)
      .limit(2000),
  ]);

  const counts: Record<string, number> = {};
  (queries.data as Array<{ matched_key: string }> | null)?.forEach((r) => {
    counts[r.matched_key] = (counts[r.matched_key] || 0) + 1;
  });
  const top_queries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));

  return {
    users_total: users.count || 0,
    users_active_7d: active.count || 0,
    messages_7d: messages.count || 0,
    unanswered_7d: unanswered.count || 0,
    top_queries,
  };
}

function formatSlackBlocks(agg: Aggregates) {
  const topList = agg.top_queries.length
    ? agg.top_queries.map((q) => `• ${q.key} — *${q.count}*`).join("\n")
    : "_no matched queries this week_";

  return {
    text: `📊 Qatar University Advisor — Weekly Digest`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "📊 Weekly Digest — Qatar University Advisor" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Users (total)*\n${agg.users_total}` },
          { type: "mrkdwn", text: `*Active (7d)*\n${agg.users_active_7d}` },
          { type: "mrkdwn", text: `*Messages (7d)*\n${agg.messages_7d}` },
          { type: "mrkdwn", text: `*Unanswered (7d)*\n${agg.unanswered_7d}` },
        ],
      },
      { type: "section", text: { type: "mrkdwn", text: `*Top queries:*\n${topList}` } },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `_generated ${new Date().toISOString()} • PDPPL-safe (no PII)_`,
          },
        ],
      },
    ],
  };
}

export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const cronToken = request.headers.get("x-cron-token");
  const expectedToken = process.env.CRON_TOKEN;

  if (!isVercelCron && (!expectedToken || cronToken !== expectedToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = process.env.DIGEST_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "DIGEST_WEBHOOK_URL not set" }, { status: 500 });
  }

  try {
    const agg = await buildDigest();
    const payload = formatSlackBlocks(agg);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Webhook ${res.status}: ${body.slice(0, 200)}`);
    }

    logger.info(`[weekly-digest] posted — users_total=${agg.users_total}, active=${agg.users_active_7d}`);
    return NextResponse.json({ ok: true, sent: agg });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    logger.error("[weekly-digest] failed", { error: msg });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export const runtime = "nodejs";
