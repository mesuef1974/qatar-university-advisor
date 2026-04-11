/**
 * Admin Dashboard API
 * GET /api/admin — Protected by Bearer token
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getStats, getTopQueries } from "@lib/supabase";
import { getCircuitStatus } from "@lib/circuit-breaker";

export async function GET(request: NextRequest) {
  // CORS
  const allowedOrigin =
    process.env.ADMIN_ORIGIN ||
    "https://qatar-university-advisor.vercel.app";

  const headers = {
    "Access-Control-Allow-Origin": allowedOrigin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  // Basic Auth
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin panel not configured. Set ADMIN_PASSWORD." },
      { status: 503, headers }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const providedPassword = authHeader.replace("Bearer ", "").trim();

  let passwordMatch = false;
  try {
    const a = Buffer.from(providedPassword);
    const b = Buffer.from(adminPassword);
    passwordMatch = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    passwordMatch = false;
  }

  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers }
    );
  }

  try {
    const [stats, topQueries, circuitStatus] = await Promise.all([
      getStats().catch(() => ({
        totalUsers: 0,
        totalMessages: 0,
        totalQueries: 0,
      })),
      getTopQueries(15).catch(() => []),
      Promise.resolve(getCircuitStatus()),
    ]);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        stats,
        topQueries,
        circuitStatus,
        botStatus: {
          vercel: "operational",
          whatsapp: "operational",
          gemini: "operational",
          supabase: circuitStatus.isHealthy ? "operational" : "degraded",
        },
      },
      { headers }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers }
    );
  }
}
