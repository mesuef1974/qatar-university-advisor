/**
 * Security Headers Middleware
 * T-Q7-T018: CSP Headers كاملة
 * يُستخدم في API routes القديمة (legacy Vercel functions)
 * ملاحظة: الـ Next.js App Router يستخدم headers من next.config.ts
 */

/* global process */

// القيم المشتركة — يجب أن تتطابق مع next.config.ts
const CSP_CONNECT_SRC =
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://graph.facebook.com https://*.upstash.io";

/**
 * إضافة Security Headers لـ Vercel API Response
 * @param {object} res - Vercel response object
 */
export function addSecurityHeaders(res) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      // 'unsafe-inline' kept in style-src: React applies inline styles at runtime
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      CSP_CONNECT_SRC,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME Sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()'
  );

  // Cross-Origin isolation headers
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  // HSTS (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
}

/**
 * API Security Middleware — يُستخدم في أول كل handler
 */
export function apiSecurityMiddleware(req, res) {
  addSecurityHeaders(res);

  // Block unexpected methods
  const allowedMethods = ['GET', 'POST', 'OPTIONS'];
  if (!allowedMethods.includes(req.method)) {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }

  return true;
}
