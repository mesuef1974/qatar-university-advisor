/**
 * Sentry — Edge Runtime Configuration
 *
 * Minimal config for Edge runtime (middleware, edge routes).
 * The Edge runtime has stricter constraints — keep this small.
 *
 * Reference: DEC-SEC-003 — Action #4
 */
// (Sentry installed during npm install)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
});
