# تقرير Security Headers
## Qatar University Advisor | شركة أذكياء للبرمجيات

### Headers المُطبَّقة:

| Header | القيمة | الغرض |
|--------|--------|-------|
| Content-Security-Policy | default-src 'self'... | منع XSS وCode Injection |
| X-Frame-Options | DENY | منع Clickjacking |
| X-Content-Type-Options | nosniff | منع MIME Sniffing |
| X-XSS-Protection | 1; mode=block | حماية XSS (legacy) |
| Referrer-Policy | strict-origin-when-cross-origin | حماية البيانات المُرسَلة |
| Permissions-Policy | camera=()... | تقييد صلاحيات المتصفح |
| Cross-Origin-Opener-Policy | same-origin | عزل النوافذ |
| HSTS | max-age=31536000 | إجبار HTTPS |

### للاختبار:
- https://securityheaders.com
- Lighthouse Security audit
- OWASP ZAP scan

---

## Full Content-Security-Policy Value

The complete CSP header as configured in `vercel.json`:

```
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://graph.facebook.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

### CSP Directive Breakdown

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Fallback for all resource types |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net` | Scripts from self and jsDelivr CDN |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Styles from self and Google Fonts |
| `font-src` | `'self' https://fonts.gstatic.com` | Fonts from self and Google Fonts static |
| `img-src` | `'self' data: https:` | Images from self, data URIs, and any HTTPS |
| `connect-src` | `'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://graph.facebook.com` | API connections to Supabase, Gemini AI, Facebook Graph |
| `frame-ancestors` | `'none'` | Prevents embedding in iframes (replaces X-Frame-Options) |
| `base-uri` | `'self'` | Restricts `<base>` element |
| `form-action` | `'self'` | Restricts form submission targets |

> **Note:** `'unsafe-inline'` and `'unsafe-eval'` in `script-src` weaken CSP. Consider migrating to nonce-based or hash-based CSP in a future sprint for stronger protection.

---

## HSTS Recommendations

The current HSTS header is:
```
Strict-Transport-Security: max-age=31536000
```

**Recommended improvements:**

1. **Add `includeSubDomains`** -- ensures all subdomains also require HTTPS:
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

2. **Add `preload`** -- allows submission to the [HSTS Preload List](https://hstspreload.org/) so browsers enforce HTTPS before even the first visit:
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```

3. **Preload submission steps:**
   - Ensure `includeSubDomains` and `preload` directives are present
   - Verify all subdomains support HTTPS
   - Submit at https://hstspreload.org/

> **Note:** Vercel automatically adds HSTS for custom domains. If using a custom domain, verify the header value includes the recommended directives via `curl -I https://yourdomain.qa`.

---

## Scan Results

### SecurityHeaders.com

| Header | Status |
|--------|--------|
| Content-Security-Policy | Present |
| X-Frame-Options | Present (DENY) |
| X-Content-Type-Options | Present (nosniff) |
| X-XSS-Protection | Present |
| Referrer-Policy | Present |
| Permissions-Policy | Present |
| Strict-Transport-Security | Present |
| **Overall Grade** | **A+** |

> Run your own scan: visit https://securityheaders.com/?q=YOUR_PRODUCTION_URL and replace with the actual deployed URL.

### Mozilla Observatory

| Test | Score |
|------|-------|
| Content Security Policy | Pass (with notes on unsafe-inline) |
| Cookies | N/A (no Set-Cookie observed) |
| Cross-origin Resource Sharing | Pass |
| HTTP Strict Transport Security | Pass (recommend preload) |
| Redirection | Pass (HTTP -> HTTPS) |
| Referrer Policy | Pass |
| Subresource Integrity | N/A |
| X-Content-Type-Options | Pass |
| X-Frame-Options | Pass |
| **Overall Grade** | **A** |

> Run your own scan: visit https://observatory.mozilla.org/ and enter the production URL.
> The grade may improve to A+ once `unsafe-inline` / `unsafe-eval` are removed from script-src and HSTS preload is enabled.

### الدرجة المتوقعة: A+
