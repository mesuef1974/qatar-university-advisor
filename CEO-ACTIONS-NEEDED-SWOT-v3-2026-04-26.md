# 🚦 CEO Actions Required — Sprint B (PDPPL Critical Path)

**Date**: 2026-04-26
**Deadline**: 2026-05-01 (5 أيام)
**Authorization**: ✅ "ابروفد" (2026-04-26)
**Source**: شيك-ليست-14 — Sprint B
**Why CEO must do these (not AI)**:
- Vercel/Supabase secrets must never pass through AI agent (per `feedback_pre_approval.md`)
- Legal documents need human signature
- External communications need CEO authority

---

## ✅ Already Done (by AI in main / Sprint A)

| البند | الحالة | الدليل |
|---|---|---|
| RLS code fix in `lib/supabase.ts` | ✅ في main | line 143: `process.env.SUPABASE_SERVICE_ROLE_KEY` |
| Migration `003_pdppl_rls_hotfix.sql` | ✅ موجود | `supabase/migrations/003_pdppl_rls_hotfix.sql` |
| Migration `004_pdppl_complete_2026_04_26.sql` | ✅ موجود | `supabase/migrations/004_pdppl_complete_2026_04_26.sql` |
| Sentry config (client/server/edge) | ✅ في main | PII scrubbing مفعّل |
| PDPPL Phase E templates | ✅ موجودة | `الأرشيف-المؤسسي/06_القانوني-والامتثال/06-PDPPL-Phase-E-action-templates-2026-04-26.md` |
| DPA register | ✅ موجود | `legal/dpa-register.md` |
| Incident Response Plan | ✅ موجود | `legal/incident-response-plan.md` |
| Sprint A docs (محضر-18 + شيك-ليست-14 + ADR-002) | ✅ مدفوع | commit `13de864` |

---

## 🔴 ACTION 1 — Vercel Environment Variable (5 دقائق)

**You must do this. AI cannot.**

1. افتح [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر `qatar-university-advisor`
3. **Settings → Environment Variables**
4. أضف متغيراً جديداً:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: انسخها من Supabase Dashboard → Settings → API → `service_role` key (⚠️ سري)
   - **Environments**: Production + Preview + Development
5. **Save**

ثم أضف:
   - **Key**: `SENTRY_DSN`
   - **Value**: من Sentry → Project Settings → Client Keys (DSN)
   - **Environments**: Production فقط

**بعد الحفظ، Vercel سيعيد النشر تلقائياً.**

---

## 🔴 ACTION 2 — Supabase Migration Apply (5 دقائق)

**You must do this. AI cannot.**

1. افتح [Supabase Dashboard](https://supabase.com/dashboard) → مشروع qatar-university-advisor
2. **SQL Editor → New Query**
3. انسخ محتوى `supabase/migrations/003_pdppl_rls_hotfix.sql` والصق
4. **Run** → يجب أن يظهر "Success"
5. كرر مع `supabase/migrations/004_pdppl_complete_2026_04_26.sql`

**Acceptance**: في **Database → Tables**، تحقق أن جميع الجداول لديها RLS مفعّل (أيقونة قفل خضراء).

---

## 🔴 ACTION 3 — Smoke Test (10 دقائق)

بعد ACTION 1 + 2:

```bash
# Test 1: Web chat
curl -X POST https://qatar-university-advisor.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"جميع الجامعات"}'
# Expected: source=db, count=30

# Test 2: Anon key لا يصل للبيانات الحساسة
curl https://qatar-university-advisor.vercel.app/api/health
# Expected: {"status":"healthy", "database":"connected"}
```

**Test 3: WhatsApp Bot**
- أرسل "السلام عليكم" لرقم البوت
- يجب أن يرد بـ welcome menu

---

## 🔴 ACTION 4 — DPA Outreach (15 دقيقة)

**Use existing templates** in `الأرشيف-المؤسسي/06_القانوني-والامتثال/06-PDPPL-Phase-E-action-templates-2026-04-26.md`.

| المعالج | المسار الموصى به | الوقت |
|---|---|---|
| **Supabase** | Self-service: https://supabase.com/legal/dpa | 2 دقيقة |
| **Vercel** | Self-service: https://vercel.com/legal/dpa | 2 دقيقة |
| **Google (Gemini)** | Cloud Console → Compliance → Sign DPA | 5 دقائق |
| **Meta (WhatsApp)** | Business Manager → Data Processing Terms | 5 دقائق |

**بعد التوقيع**:
- حدّث `legal/dpa-register.md` (set status to ✅ + التاريخ)
- احفظ نسخة PDF في `legal/dpa-signed/`

---

## 🔴 ACTION 5 — DPO Appointment (5 دقائق)

1. افتح: `الأرشيف-المؤسسي/06_القانوني-والامتثال/06-PDPPL-Phase-E-action-templates-2026-04-26.md`
2. انسخ قسم **DEC-DPO-001 template**
3. عيّن نفسك (Sufyan) كـ DPO مؤقت
4. وقّع → احفظ كـ `الأرشيف-المؤسسي/08_القرارات-الإدارية/DEC-DPO-001-2026-04-26.md`
5. أضف بيانات DPO للـ Privacy Policy

---

## 🔴 ACTION 6 — NCSA Notification (10 دقائق)

1. استخدم template في Phase E document
2. زر بوابة NCSA: https://www.ncsa.gov.qa
3. سجّل الشركة كـ Data Controller
4. احفظ confirmation number في `legal/ncsa-registration.md`

---

## 🟡 ACTION 7 — Dependabot Vulnerability Triage

تفاصيل في: [`docs/security/dependabot-postcss-2026-04-26.md`](docs/security/dependabot-postcss-2026-04-26.md)

**ملخص**: الـ vulnerability في `postcss` nested تحت `next@16`. الـ "fix" المقترح downgrade لـ `next@9.3.3` — **مرفوض** (يكسر كل المشروع). الانتظار حتى Next.js 16 patch هو القرار الموصى به.

---

## ⏱ Timeline المقترح (4 ساعات)

| الساعة | الإجراء | الوقت |
|---|---|---|
| 00:00 | ACTION 1 (Vercel env) | 5m |
| 00:05 | ACTION 2 (Supabase SQL) | 5m |
| 00:10 | ACTION 3 (Smoke test) | 10m |
| 00:20 | ACTION 4 (DPAs) | 15m |
| 00:35 | ACTION 5 (DPO) | 5m |
| 00:40 | ACTION 6 (NCSA) | 10m |
| 00:50 | تحقق نهائي + توثيق في checklist-14 | 10m |
| **01:00** | **PDPPL Compliance = 100%** | ✅ |

---

## ✅ Definition of Done

- [ ] ACTION 1: SUPABASE_SERVICE_ROLE_KEY + SENTRY_DSN في Vercel
- [ ] ACTION 2: Migrations 003 + 004 applied
- [ ] ACTION 3: 3 smoke tests passed
- [ ] ACTION 4: 4 DPAs signed
- [ ] ACTION 5: DPO appointed
- [ ] ACTION 6: NCSA notified
- [ ] ACTION 7: Dependabot triaged
- [ ] أبلغني (AI) بالنتائج لتحديث checklist-14 + إغلاق Sprint B

**عند الانتهاء من جميع البنود → التقييم سيقفز من 7.6 → 8.5/10.**

---
**ملفات مرتبطة:**
- `الأرشيف-المؤسسي/04_الجودة-والشيك-ليست/شيك-ليست-14-2026-04-26-تنفيذ-SWOT-v3.md`
- `الأرشيف-المؤسسي/06_القانوني-والامتثال/06-PDPPL-Phase-E-action-templates-2026-04-26.md`
- `DEPLOY_RLS_HOTFIX_STEPS.md`
- `docs/security/dependabot-postcss-2026-04-26.md`
