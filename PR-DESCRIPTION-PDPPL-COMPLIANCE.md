# PR — PDPPL Article 7 Compliance + Audit P0 Fixes

> **هذا النص جاهز للنسخ إلى GitHub PR description عند فتح PR من `claude/trusting-lovelace-9ee6a3` إلى `main`.**

---

## 🎯 ما الذي يفعله هذا الـ PR

يُغلق **3 من P0 findings** في `PLATFORM_AUDIT_PoC_2026-04-26.md`، اثنان منها بمستوى 🔴 HIGH:

| Finding | الخطورة | المرجع |
|---|---|---|
| **F-1** CRON endpoint authentication bypass | 🔴 HIGH (CVSS 8.6) | `63f34ed` |
| **F-3** Consent UI absent — PDPPL Article 7 violation | 🔴 HIGH (~5M ر.ق exposure) | `8811e64` |
| **F-4** Raw user query stored in analytics without PII scrub | 🟠 MEDIUM (PDPPL 5+15) | `bafae92` |

**الموعد**: PDPPL deadline = 2026-05-01.

---

## 📋 التغييرات

### F-1 — CRON auth hard-fail (`src/app/api/cron/pdppl-cleanup/route.ts`)
- قبل: `if (cronSecret && ...)` يتجاوز الـ auth إذا `CRON_SECRET=""`
- بعد: empty/missing `CRON_SECRET` = 500 hard fail (no silent run)

### F-3 — Consent UI (PDPPL Article 7)
- **Web**: `<ConsentModal>` shadcn Dialog، gated بـ localStorage، mounted في `src/app/layout.tsx`
- **Web**: `POST /api/consent` يكتب في `user_consents` table عبر `recordConsent()`
- **WhatsApp**: webhook gate قبل `processMessage()` — أول رسالة من رقم جديد تُرَدّ بنص الموافقة + 3 أزرار
- **نص الموافقة**: تصحيح المواد القانونية (22-25 → 9-14) + ذكر كل مادة بشكل صريح
- **5 ملفات معدّلة + 2 ملفات جديدة** (292 إضافة)

### F-4 — PII scrubber في analytics
- `scrubPII()` جديد في `lib/sanitizer.ts` يحذف: Email, GPA/معدل, QID, +974 phone, 8-digit local, 9-15 digit catch-all
- `logQuery()` في `lib/supabase.ts` يستدعي `scrubPII(query)` قبل INSERT في `analytics`

---

## ✅ Quality Gates المُجتازة

- [x] `npx tsc --noEmit`: PASS
- [x] `npx vitest run tests/webhook.test.js`: 20/20 PASS (no regressions)
- [x] Browser preview: ConsentModal يُرَى بـ RTL صحيح
- [x] Decline flow: Modal يُغلق + localStorage يُحدَّث
- [x] No new dependencies added
- [x] No env var changes required (CEO أكّد وجود `SUPABASE_SERVICE_ROLE_KEY` + `CRON_SECRET` + `SENTRY_DSN`)

---

## 📚 المرجعيات

- **Logic Gate**: `Azkia/projects/qatar-university-advisor/logic-gates/LG-001-platform-audit-2026-04-26.md`
- **Audit PoC**: `Azkia/projects/qatar-university-advisor/08-reports/PLATFORM_AUDIT_PoC_2026-04-26.md`
- **Audit Full**: `Azkia/projects/qatar-university-advisor/08-reports/PLATFORM_AUDIT_FULL_2026-04-26.md`
- **Gate 2 Advisory**: `Azkia/projects/qatar-university-advisor/08-reports/GATE2_ADVISORY_2026-04-26.md`
- **Gate 3 Log**: `Azkia/projects/qatar-university-advisor/08-reports/GATE3_EXECUTION_LOG_2026-04-26.md`
- **Lesson Learned**: `Azkia/corporate/lessons-learned/LL-QUA-002-pdppl-consent-implementation.md`
- **Affidavit**: `legal/affidavit-pdppl-article-7-2026-04-XX.md` (CEO يوقّع يوم النشر)

---

## 🔄 خطة النشر

1. **Vercel Preview Build**: تلقائي على push (تحقّق من نجاح build)
2. **Smoke tests على Preview URL**:
   - زيارة الصفحة الرئيسية → ConsentModal يظهر
   - "لا أوافق" → Modal يُغلق
   - مسح localStorage + reload → Modal يظهر مرة أخرى
   - "أوافق" → Modal يُغلق + POST /api/consent يُرجع 200
   - فحص `user_consents` في Supabase → row جديد مع `is_active=true`
3. **Merge → main**: بعد نجاح smoke tests
4. **Production deploy**: تلقائي على merge
5. **Production smoke tests** (نفس الخطوات أعلاه على prod URL)
6. **WhatsApp test** برقم تجريبي جديد:
   - أرسل رسالة → expect نص الموافقة + 3 أزرار
   - اضغط "أوافق" → expect رسالة الشكر + suggestions
   - أرسل سؤال عادي → expect رد طبيعي
   - من رقم آخر، أرسل "لا أوافق" → expect رسالة الرفض
7. **CEO يوقّع** `legal/affidavit-pdppl-article-7-2026-04-XX.md` بتاريخ النشر
8. **NCSA notification** عبر بوابة NCSA — احفظ confirmation
9. **Archive**: نسخ الإقرار الموقّع إلى `الأرشيف-المؤسسي/06_القانوني-والامتثال/`

---

## ⚠️ Rollback Plan

في حالة اكتشاف ثغرة بعد النشر:
- **Quick rollback**: Vercel Dashboard → Deployments → اختر deployment سابق → Promote to Production (5 ثواني)
- **Database**: لا تغييرات في Migrations في هذا الـ PR — لا حاجة لـ DB rollback
- **localStorage cleanup**: غير مطلوب (المستخدمون فقط سيُسألون مرة أخرى)

---

## 🔮 ما الذي **لا** يُغلقه هذا الـ PR

في خارطة الطريق بعد 2026-05-01 (audit findings المتبقية):

| Finding | الموضوع | الموعد المقترح |
|---|---|---|
| F-2 | Rate limiter fail-open | PR منفصل اليوم/غداً |
| F-5 | RAG (knowledge_embeddings) backfill | 2026-05-15 |
| F-6 | تفكيك ملفات > 700 سطر | Sprint+1 |
| F-7+F-12 | Coverage scope expansion | Sprint+1 |
| F-8 | DR drill | 2026-05-15 |
| F-9 | Image optimization | Sprint+1 |
| F-10+F-11 | a11y + dark contrast | 2026-05-10 |
| F-13 | Sentry source maps + DORA dashboard | Sprint+1 |

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
