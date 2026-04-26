# Sentry Setup Guide — Qatar University Advisor

**المرجع:** DEC-SEC-003 — Action #4
**الحالة:** جاهز للتطبيق — ينتظر DSN من CEO

---

## 1. لماذا Sentry؟

نقطة ضعف W8 من SWOT 2026-04-25: **لا Observability حقيقية**.
الأخطاء الإنتاجية صامتة → MTTR غير محدود.

## 2. التكلفة

- **Developer plan**: مجاني (5K errors/شهر) — كافٍ مبدئياً.
- **Team plan**: $26/شهر (50K errors) — للنمو.

## 3. خطوات التطبيق (CEO/Engineering)

### 3.1 إنشاء حساب + مشروع
1. افتح https://sentry.io/signup
2. اختر **Next.js** كمشروع.
3. انسخ الـ **DSN** (يبدأ بـ `https://...@...ingest.sentry.io/...`).

### 3.2 تثبيت SDK
```bash
cd D:/qatar-university-advisor
npm install --save @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

الـ wizard ينشئ:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`
- يحدّث `next.config.ts` بـ `withSentryConfig`

### 3.3 إضافة env vars في Vercel

| Name | Environment | Value |
|---|---|---|
| `SENTRY_DSN` | Production + Preview | الـ DSN من 3.1 |
| `NEXT_PUBLIC_SENTRY_DSN` | Production + Preview | نفس DSN (للـ client) |
| `SENTRY_AUTH_TOKEN` | Production + Preview | من Sentry Settings → Auth Tokens |
| `SENTRY_ORG` | Production + Preview | اسم المنظمة |
| `SENTRY_PROJECT` | Production + Preview | `qatar-university-advisor` |

### 3.4 PDPPL Data Scrubbing (إلزامي)

في `sentry.server.config.ts`:

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // PDPPL: scrub PII قبل الإرسال
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      delete data.phone;
      delete data.gpa;
      delete data.nationality;
      delete data.message;
    }
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      event.user.id = '[scrubbed]';
    }
    return event;
  },
  // PDPPL: لا نسجل headers تحوي WhatsApp tokens
  sendDefaultPii: false,
});
```

### 3.5 اختبار

أضف route تجريبي مؤقت:
```typescript
// src/app/api/_test-sentry/route.ts
export async function GET() {
  throw new Error('Sentry test — DEC-SEC-003');
}
```

ثم: `curl https://<domain>/api/_test-sentry` → الخطأ يجب أن يظهر في Sentry dashboard خلال دقيقة. **احذف الـ route فوراً بعد التحقق.**

### 3.6 تنبيهات

في Sentry → Alerts → Create:
- **Critical**: P0 errors (5xx + unhandled) → فوري.
- **Warning**: > 10 errors/min → 5 دقائق.
- القناة: Email + (اختياري) Slack.

## 4. Quality Gate

بعد التطبيق، أكمل بنود E1-E4 في شيك ليست-12.

## 5. Rollback

إزالة `SENTRY_DSN` من Vercel → fail-silent (الكود لن يكسر).

---

## 6. Post-Signup Checklist (مرجع سريع للـ CEO)

ملفات Sentry تم إنشاؤها مسبقاً (pre-staged) في الـ repo:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`
- `next.config.ts` (مغلّف بـ `withSentryConfig`)
- `@sentry/nextjs` مضاف لـ `package.json`

**الخطوات بعد الحصول على DSN من Sentry:**

1. **أضف 5 env vars في Vercel** (Production + Preview):

   | Variable | Source |
   |---|---|
   | `SENTRY_DSN` | Sentry → Project Settings → Client Keys |
   | `NEXT_PUBLIC_SENTRY_DSN` | نفس DSN |
   | `SENTRY_AUTH_TOKEN` | Sentry → User Auth Tokens (scopes: `project:releases`, `org:read`) |
   | `SENTRY_ORG` | اسم منظمة Sentry (e.g. `qatar-university-advisor`) |
   | `SENTRY_PROJECT` | اسم المشروع (e.g. `qatar-university-advisor`) |

2. **شغّل redeploy** على Vercel (`Deployments → ⋯ → Redeploy`).
   - npm install سيركّب `@sentry/nextjs` تلقائياً.
   - Build سيرفع source maps إلى Sentry (`SENTRY_AUTH_TOKEN` مطلوب).

3. **تحقّق سريع**: أضف route تجريبي مؤقت `/api/_test-sentry` (راجع §3.5) ثم احذفه فوراً بعد ظهور الخطأ في Sentry dashboard (يستغرق < 1 دقيقة).

4. **PDPPL**: السكربتات الحالية تُسقط `phone, gpa, nationality, message, consent_text, email, ip` + headers الحساسة + query strings (whitelist: `page, limit` فقط) قبل الإرسال.
