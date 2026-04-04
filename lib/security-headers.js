/**
 * Security Headers Middleware
 * T-Q7-T018: CSP Headers كاملة
 * يُستخدم في API routes لإضافة headers الأمان
 */

/* global process */

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
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
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
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // HSTS (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
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
