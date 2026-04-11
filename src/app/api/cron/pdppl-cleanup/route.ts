/**
 * PDPPL Data Retention Cron Job
 * Qatar Personal Data Protection Law (Law No. 13 of 2016)
 * Runs daily at 2:00 AM to delete/anonymize user data
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  // Auth — only Vercel Cron or CRON_SECRET
  const cronSecret = process.env.CRON_SECRET || "";
  const authHeader = request.headers.get("authorization") || "";

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // SECURITY (DEC-SEC-002 / RLS hotfix 2026-04-10): cron must use
  // SERVICE_ROLE_KEY to bypass RLS. Anon key would fail under migration 003.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const results = {
    deleted: 0,
    anonymized: 0,
    errors: [] as string[],
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Delete users who requested deletion (grace period: 7 days)
    const gracePeriodCutoff = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: requestedDeletion, error: err1 } = await supabase
      .from("users")
      .select("id, phone, deletion_requested_at")
      .eq("deletion_requested", true)
      .lt("deletion_requested_at", gracePeriodCutoff);

    if (err1) {
      results.errors.push(`Query deletion_requested: ${err1.message}`);
    } else if (requestedDeletion && requestedDeletion.length > 0) {
      const userIds = requestedDeletion.map((u) => u.id);

      // Batch delete conversations and favorites before deleting users
      const [convErr, favErr] = await Promise.all([
        supabase.from("conversations").delete().in("user_id", userIds).then(({ error }) => error),
        supabase.from("favorites").delete().in("user_id", userIds).then(({ error }) => error),
      ]);
      if (convErr) results.errors.push(`Batch delete conversations: ${convErr.message}`);
      if (favErr)  results.errors.push(`Batch delete favorites: ${favErr.message}`);

      // Batch delete users
      const { error: delErr } = await supabase
        .from("users")
        .delete()
        .in("id", userIds);

      if (delErr) {
        results.errors.push(`Batch delete users: ${delErr.message}`);
      } else {
        results.deleted += userIds.length;
      }
    }

    // 2. Anonymize users past retention period
    const { data: expiredUsers, error: err2 } = await supabase
      .from("users")
      .select("id, phone")
      .lt("data_retention_until", new Date().toISOString())
      .eq("deletion_requested", false);

    if (err2) {
      results.errors.push(`Query expired: ${err2.message}`);
    } else if (expiredUsers && expiredUsers.length > 0) {
      const anonTimestamp = new Date().toISOString();
      const successfullyAnonIds: string[] = [];

      // Each anonymized user needs a unique random phone — updates run individually
      for (const user of expiredUsers) {
        const { error: anonErr } = await supabase
          .from("users")
          .update({
            phone: `ANON_${crypto.randomBytes(16).toString("hex")}`,
            profile_data: {},
            user_type: "GENERAL",
            track: null,
            gpa: null,
            grade: null,
            nationality: "unknown",
            conversation_stage: "STAGE_0",
            consent_given: false,
            consent_date: null,
            deletion_requested: true,
            deletion_requested_at: anonTimestamp,
          })
          .eq("id", user.id);

        if (anonErr) {
          results.errors.push(`Anonymize user ${user.id}: ${anonErr.message}`);
        } else {
          successfullyAnonIds.push(user.id);
          results.anonymized++;
        }
      }

      // Batch delete conversations and favorites for all anonymized users
      if (successfullyAnonIds.length > 0) {
        await Promise.all([
          supabase.from("conversations").delete().in("user_id", successfullyAnonIds),
          supabase.from("favorites").delete().in("user_id", successfullyAnonIds),
        ]);
      }
    }

    // 3. Log to analytics
    try {
      await supabase.from("analytics").insert({
        query: "pdppl_cron_cleanup",
        matched_key: `deleted:${results.deleted},anonymized:${results.anonymized}`,
        source: "cron",
      });
    } catch {
      // silent fail
    }

    console.log(`[PDPPL Cron] Completed: ${JSON.stringify(results)}`);

    return NextResponse.json({
      success: true,
      ...results,
      message: `PDPPL cleanup complete: ${results.deleted} deleted, ${results.anonymized} anonymized`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[PDPPL Cron] Fatal error:", message);
    return NextResponse.json(
      { error: message, ...results },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export { GET as POST };
