# Disaster Recovery Runbook — Qatar University Advisor

**المرجع:** DEC-SEC-003 — Action #5
**التاريخ:** 2026-04-26
**النسخة:** v1.0
**RTO المستهدف:** 4 ساعات
**RPO المستهدف:** 24 ساعة (يومي)

---

## 1. سيناريوهات الكوارث

| # | السيناريو | الاحتمال | الأثر | RTO |
|---|---|---|---|---|
| DR-1 | سقوط Vercel | منخفض | كامل (الموقع + البوت) | 1 ساعة |
| DR-2 | سقوط Supabase | منخفض-متوسط | كامل | 2 ساعة |
| DR-3 | Meta WhatsApp suspend | متوسط | البوت فقط | 24 ساعة |
| DR-4 | Gemini API outage | متوسط | البوت AI | 30 د |
| DR-5 | Upstash outage | منخفض | rate limiting + dedup | 15 د |
| DR-6 | تسريب SERVICE_ROLE_KEY | منخفض-كارثي | كامل | 1 ساعة |
| DR-7 | حذف بيانات بالخطأ | منخفض | حسب النطاق | 4 ساعات |
| DR-8 | RLS policy regression | متوسط | تسريب PII | 30 د |

---

## 2. الإجراءات

### DR-1 — Vercel Down
1. تحقّق من https://www.vercel-status.com
2. **إذا < 1 ساعة**: انتظر — لا حلول وسطية.
3. **إذا > 1 ساعة**: deploy على Cloudflare Pages كـ failover (يحتاج إعداد مسبق):
   ```bash
   npm run build
   npx wrangler pages deploy .next/standalone
   ```
4. حدّث DNS إلى Cloudflare.
5. أعلن للمستخدمين عبر صفحة Status.

### DR-2 — Supabase Down
1. تحقّق من https://status.supabase.com
2. البوت يصمت تلقائياً (Circuit Breaker في `lib/circuit-breaker.ts`).
3. **إذا > 30 د**: فعّل read-only fallback:
   - أضف env var `READONLY_MODE=1`.
   - الكود يرجّع رسالة "الخدمة قيد الصيانة".
4. **إذا > 4 ساعات**: استعادة من backup إلى مشروع Supabase جديد.

### DR-3 — Meta WhatsApp Suspend
1. اقرأ بريد Meta Business — السبب عادة policy violation.
2. راسل Meta Support خلال 24 ساعة.
3. **fallback مؤقت**: web chat على الموقع (مُهيَّأ مسبقاً).
4. أعلن للمستخدمين.

### DR-4 — Gemini Outage
1. تحقّق من https://status.cloud.google.com
2. الكود يرجّع cached responses من `knowledge_cache`.
3. **إذا > 30 د**: قرار CEO → إعادة Claude كـ fallback (DEC-AI-001 المؤجل).

### DR-5 — Upstash Outage
1. الكود يستخدم in-memory dedup كـ fallback (موجود في `webhook/route.ts`).
2. Rate limiting يصبح per-instance (محدود لكن آمن).
3. لا إجراء إضافي مطلوب.

### DR-6 — SERVICE_ROLE_KEY Leaked 🔴
1. **فوري**: Supabase Dashboard → Settings → API → **Roll keys**.
2. حدّث `SUPABASE_SERVICE_ROLE_KEY` في Vercel فوراً.
3. أعد deploy.
4. راجع access logs في Supabase لـ 30 د الماضية.
5. إذا تم وصول مشبوه → افتح INC-SEC ticket + إبلاغ NCSA خلال 72 ساعة (PDPPL).

### DR-7 — حذف بيانات بالخطأ
1. **توقف فوراً** عن أي كتابة.
2. Supabase Dashboard → Database → **Backups** → استعد آخر نسخة.
3. إذا < 7 أيام: متوفر تلقائياً.
4. إذا > 7 أيام: تواصل Supabase support (Pro plan يحتفظ 30 يوم).

### DR-8 — RLS Regression
1. تحقّق:
   ```bash
   curl -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/users"
   ```
2. إذا رجّع rows → **ثغرة مفتوحة**.
3. شغّل migration 003 من `supabase/migrations/003_pdppl_rls_hotfix.sql` يدوياً.
4. إبلاغ NCSA خلال 72 ساعة (PDPPL Article 14).

---

## 3. Backups

| المصدر | التكرار | المحتفظ به | الموقع |
|---|---|---|---|
| Supabase DB | يومي | 7 أيام (Free) / 30 يوم (Pro) | Supabase managed |
| Code | كل push | للأبد | GitHub |
| Vercel build | كل deploy | 30 يوم | Vercel |
| Logs | يومي | 30 يوم (Vercel) | Vercel |

**فجوة:** لا backup مستقل عن Supabase. **توصية**: إضافة weekly export إلى S3/R2 (P1).

## 4. Communication Plan

| الشريحة | القناة | المسؤول |
|---|---|---|
| المستخدمون | صفحة Status + WhatsApp broadcast | Operations |
| الفريق الداخلي | Slack #incidents | CEO |
| Meta/Supabase | Support tickets | Engineering |
| NCSA (إن لزم) | البريد الرسمي | Legal + CEO |

## 5. Post-Incident

- محضر incident خلال 48 ساعة في `الأرشيف-المؤسسي/01_محاضر-الاجتماعات/`.
- Postmortem blameless في `الأرشيف-المؤسسي/05_التقارير-والتقييمات/`.
- تحديث هذا الـ runbook بالدروس المستفادة.

---

**آخر اختبار**: لم يُجرَ بعد — **توصية**: chaos drill ربعي (P1).
