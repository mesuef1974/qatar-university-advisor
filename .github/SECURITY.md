# Security Policy | سياسة الأمان

## Supported Versions | الإصدارات المدعومة

| Version | Supported |
|---------|-----------|
| latest (main) | ✅ |
| staging | ✅ |
| older | ❌ |

## Reporting a Vulnerability | الإبلاغ عن ثغرة

**لا تُنشئ GitHub Issue عام للثغرات الأمنية.**

للإبلاغ عن ثغرة أمنية:
1. راسلنا مباشرة عبر البوت
2. وصف الثغرة بالتفصيل
3. سنرد خلال 48 ساعة

## Security Standards | معايير الأمان
- OWASP Top 10 (2021)
- ISO 27001
- قانون حماية البيانات القطري رقم 13/2016 (PDPPL)

## Security Features | ميزات الأمان
- ✅ Prompt Injection Defense (18 patterns)
- ✅ Rate Limiting per IP
- ✅ HMAC-SHA256 Webhook Verification
- ✅ Circuit Breaker Pattern
- ✅ Input Sanitization (5 layers)
- ✅ No hardcoded secrets
- ✅ PDPPL Auto-deletion Cron
