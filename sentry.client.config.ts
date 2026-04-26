/**
 * Sentry — Client (Browser) Configuration
 *
 * PDPPL Compliance: All user PII is scrubbed before transmission.
 * Replays mask all text and block all media to prevent leakage.
 *
 * Reference: DEC-SEC-003 — Action #4
 */
// @ts-expect-error -- @sentry/nextjs is installed by Vercel build; may not be present locally
import * as Sentry from "@sentry/nextjs";

// Whitelist of safe query string parameters (everything else is dropped)
const ALLOWED_QUERY_PARAMS = new Set(["page", "limit"]);

// Sensitive header substrings (case-insensitive)
const SENSITIVE_HEADER_PATTERNS = ["authorization", "cookie", "apikey"];

// PDPPL: PII fields that must never reach Sentry
const PII_FIELDS = [
  "phone",
  "gpa",
  "nationality",
  "message",
  "consent_text",
  "email",
  "national_id",
  "qid",
  "ip",
];

function scrubQueryString(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url, "http://localhost");
    const toDelete: string[] = [];
    u.searchParams.forEach((_, key) => {
      if (!ALLOWED_QUERY_PARAMS.has(key)) toDelete.push(key);
    });
    toDelete.forEach((k) => u.searchParams.delete(k));
    return u.pathname + (u.search || "") + (u.hash || "");
  } catch {
    return url.split("?")[0];
  }
}

function scrubHeaders(
  headers: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!headers) return headers;
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_HEADER_PATTERNS.some((p) => lower.includes(p))) continue;
    cleaned[k] = v;
  }
  return cleaned;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance tracing — 10% sample
  tracesSampleRate: 0.1,

  // Session Replay — only on errors (PDPPL-safe defaults)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // PDPPL: never send default PII
  sendDefaultPii: false,

  beforeSend(event: any) {
    // Scrub request body PII
    if (event.request?.data && typeof event.request.data === "object") {
      const data = event.request.data as Record<string, unknown>;
      for (const field of PII_FIELDS) delete data[field];
    }

    // Scrub query strings
    if (event.request?.url) {
      event.request.url = scrubQueryString(event.request.url);
    }
    if (event.request?.query_string) {
      event.request.query_string = "[scrubbed]";
    }

    // Scrub headers
    if (event.request?.headers) {
      event.request.headers = scrubHeaders(
        event.request.headers as Record<string, string>,
      );
    }

    // Scrub user identity
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      event.user.id = "[scrubbed]";
    }

    return event;
  },
});
