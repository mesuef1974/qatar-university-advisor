/**
 * Next.js Middleware — Qatar University Advisor
 * ═══════════════════════════════════════════════
 * Runs at the edge before every matched page route.
 *
 * Responsibilities:
 *  1. Generate a per-request CSP nonce and set it in:
 *     - Request header `x-nonce`   → read by Server Components (e.g. layout.tsx)
 *     - Response header `Content-Security-Policy` → enforced by browsers
 *  2. Add admin-panel caching / indexing headers.
 *
 * Why nonces?
 *  `unsafe-inline` in script-src allows any inline <script> to run, including
 *  those injected via XSS. A per-request nonce limits execution to only the
 *  scripts that Next.js generates with that specific nonce value.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a cryptographically random base64 nonce using the Web Crypto API
 * (available in both Edge and Node.js runtimes).
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // btoa requires a binary string
  return btoa(String.fromCharCode(...bytes));
}

export function middleware(request: NextRequest): NextResponse {
  const nonce = generateNonce();
  const { pathname } = request.nextUrl;

  // ── Content Security Policy (per-request nonce) ──────────────────────────
  // `'strict-dynamic'` allows scripts loaded by nonce'd scripts to execute
  // without needing their own entries (e.g., Next.js lazy-loaded route chunks).
  // `'unsafe-inline'` is intentionally omitted from script-src so that
  // injected inline scripts cannot execute.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cdn.jsdelivr.net`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://graph.facebook.com https://*.upstash.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  // Forward the nonce to Server Components via a request header so that
  // layout.tsx can pass it to components that emit inline scripts (e.g. ThemeProvider).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Set CSP on the response so browsers enforce it.
  response.headers.set("Content-Security-Policy", csp);

  // ── Admin panel — prevent search-engine indexing and caching ─────────────
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
  }

  return response;
}

export const config = {
  // Apply only to page routes — skip API routes, Next.js internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)",
  ],
};
