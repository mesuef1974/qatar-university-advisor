/**
 * Sentry — Server (Node.js) Configuration
 *
 * PDPPL Compliance: Strong PII scrubbing on server-side. All headers
 * containing auth/cookie/apikey are dropped. Query strings are whitelisted.
 *
 * Reference: DEC-SEC-003 — Action #4
 */
// (Sentry installed during npm install)
import * as Sentry from "@sentry/nextjs";

const ALLOWED_QUERY_PARAMS = new Set(["page", "limit"]);
const SENSITIVE_HEADER_PATTERNS = ["authorization", "cookie", "apikey"];

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
  "password",
  "token",
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
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: 0.1,

  // PDPPL: hard requirement — never send default PII server-side
  sendDefaultPii: false,

  beforeSend(event: any) {
    // Scrub request body PII
    if (event.request?.data && typeof event.request.data === "object") {
      const data = event.request.data as Record<string, unknown>;
      for (const field of PII_FIELDS) delete data[field];
    }

    // Scrub query strings (whitelist-based)
    if (event.request?.url) {
      event.request.url = scrubQueryString(event.request.url);
    }
    if (event.request?.query_string) {
      event.request.query_string = "[scrubbed]";
    }

    // Scrub headers — strip auth/cookie/apikey
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

    // Scrub extra contexts that might carry PII
    if (event.extra && typeof event.extra === "object") {
      const extra = event.extra as Record<string, unknown>;
      for (const field of PII_FIELDS) delete extra[field];
    }

    return event;
  },
});
