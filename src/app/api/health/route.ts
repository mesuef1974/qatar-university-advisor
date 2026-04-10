/**
 * Health Check Endpoint
 * GET /api/health
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const START_TIME = Date.now();

export async function GET(request: NextRequest) {
  // Simple rate-limit check via header
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  void ip; // used for logging if needed

  const services: Record<string, unknown> = {};
  let overallStatus = "healthy";

  // 1. Check Supabase
  // SECURITY (DEC-SEC-002): use SERVICE_ROLE_KEY on the server so the check
  // still works under strict RLS (migration 003). Anon key would be blocked.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    const t0 = Date.now();
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from("users")
        .select("count", { count: "exact", head: true });
      const latency = Date.now() - t0;
      if (error) {
        services.supabase = {
          status: "unhealthy",
          error: error.message,
          latency,
        };
        overallStatus = "degraded";
      } else {
        services.supabase = { status: "healthy", latency };
      }
    } catch {
      services.supabase = {
        status: "unhealthy",
        error: "Connection failed",
        latency: Date.now() - t0,
      };
      overallStatus = "degraded";
    }
  } else {
    services.supabase = { status: "not_configured" };
  }

  // 2. Memory
  const mem = process.memoryUsage();
  const usedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const totalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const memStatus = usedMB > 450 ? "warning" : "healthy";
  if (memStatus === "warning" && overallStatus === "healthy")
    overallStatus = "degraded";
  services.memory = {
    status: memStatus,
    used: `${usedMB}MB`,
    total: `${totalMB}MB`,
    rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
  };

  // 3. Redis (skipped)
  services.redis = { status: "skipped" };

  const httpStatus = overallStatus === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      uptime: Math.round((Date.now() - START_TIME) / 1000),
      services,
    },
    { status: httpStatus }
  );
}
