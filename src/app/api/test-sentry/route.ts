/**
 * TEMPORARY — Sentry smoke test endpoint.
 * Triggers a deliberate error to verify Sentry captures it with PDPPL scrubbing.
 *
 * DELETE THIS FILE immediately after the first event lands in Sentry dashboard.
 */
import { NextResponse } from "next/server";

export async function GET() {
  // Deliberate error to test Sentry capture
  // Including a fake "phone" field to verify PDPPL scrubbing works
  const fakePayload = {
    phone: '+97400000000',  // should be scrubbed
    nationality: 'qatari',  // should be scrubbed
    test_marker: 'sentry-smoke-' + Date.now(),
  };
  throw new Error(
    `[Sentry Smoke Test] Deliberate error — payload: ${JSON.stringify(fakePayload)}`
  );

  // Unreachable but satisfies TS
  return NextResponse.json({ ok: false });
}
