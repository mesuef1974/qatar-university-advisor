/**
 * Next.js Middleware — Qatar University Advisor
 * ═══════════════════════════════════════════════
 * Protects the /admin panel from search-engine indexing and caching.
 * General security headers are already set in next.config.ts;
 * this middleware adds admin-specific overrides at the edge.
 */

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // ── Admin panel — prevent indexing and caching ───────────────────
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
  }

  return response;
}

export const config = {
  // Apply only to page routes — skip API routes, Next.js internals, and static assets.
  // Excluded patterns:
  //   api            — API routes
  //   _next/static   — compiled JS/CSS bundles
  //   _next/image    — image optimisation API
  //   favicon.ico    — browser favicon
  //   *.ext          — any static file extension (images, fonts, styles, scripts)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)",
  ],
};
