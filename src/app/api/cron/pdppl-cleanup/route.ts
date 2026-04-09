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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

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
      for (const user of requestedDeletion) {
        await supabase.from("conversations").delete().eq("user_id", user.id);
        await supabase.from("favorites").delete().eq("user_id", user.id);

        const { error: delErr } = await supabase
          .from("users")
          .delete()
          .eq("id", user.id);

        if (delErr) {
          results.errors.push(`Delete user ${user.id}: ${delErr.message}`);
        } else {
          results.deleted++;
        }
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
            deletion_requested_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (anonErr) {
          results.errors.push(
            `Anonymize user ${user.id}: ${anonErr.message}`
          );
        } else {
          results.anonymized++;
          await supabase
            .from("conversations")
            .delete()
            .eq("user_id", user.id);
          await supabase.from("favorites").delete().eq("user_id", user.id);
        }
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
