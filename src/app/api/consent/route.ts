/**
 * POST /api/consent
 *
 * Records explicit informed consent per PDPPL Article 7 (Law 13/2016).
 * Called from the web ConsentModal after the user clicks "أوافق".
 *
 * Closes F-3 from PLATFORM_AUDIT_PoC_2026-04-26.
 */

import { NextRequest, NextResponse } from "next/server";
import { recordConsent } from "@lib/consent-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ConsentRequestBody {
  /**
   * Stable identifier for the web user. We accept either:
   * - phone (E.164) when consent is recorded after a real phone is captured
   * - sessionId starting with "web:" for anonymous web sessions
   */
  identifier: string;
}

function isAcceptableIdentifier(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  if (value.length > 128) return false;
  // Accept E.164-ish phone (8-15 digits, optional + and country code)
  if (/^\+?\d{8,15}$/.test(value)) return true;
  // Accept "web:<hash>" pattern produced by the web client
  if (/^web:[a-f0-9]{16,64}$/i.test(value)) return true;
  return false;
}

export async function POST(request: NextRequest) {
  let body: ConsentRequestBody;
  try {
    body = (await request.json()) as ConsentRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const identifier = body?.identifier?.trim?.() ?? "";
  if (!isAcceptableIdentifier(identifier)) {
    return NextResponse.json(
      { error: "Invalid identifier" },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent") || null;

  const result = await recordConsent(
    identifier,
    ip ?? undefined,
    userAgent ?? undefined
  );

  if (!result.success) {
    return NextResponse.json(
      { error: "Failed to record consent" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, id: result.id });
}
