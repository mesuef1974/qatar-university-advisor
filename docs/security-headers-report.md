# تقرير Security Headers
## Qatar University Advisor | شركة النخبوية للبرمجيات

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

### الدرجة المتوقعة: A+
