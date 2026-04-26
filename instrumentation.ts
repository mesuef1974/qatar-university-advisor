/**
 * Next.js 16 Instrumentation Entry Point
 *
 * Loads the appropriate Sentry runtime config based on NEXT_RUNTIME.
 * Also exports onRequestError for App Router error capture.
 *
 * Reference: DEC-SEC-003 — Action #4
 */
// (Sentry installed during npm install)
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
