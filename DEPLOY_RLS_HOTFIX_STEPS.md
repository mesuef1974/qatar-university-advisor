# خطوات تطبيق RLS Hotfix — للمؤسس

> المرجع: DEC-SEC-002 — Qatar University Advisor — 2026-04-10
> Branch: `security/rls-hotfix`

## ما تم إنجازه (تلقائياً — Phase A)

- ✅ تعديل `lib/supabase.ts` لاستخدام `SUPABASE_SERVICE_ROLE_KEY` بدلاً من `SUPABASE_ANON_KEY` (يتجاوز RLS).
- ✅ إضافة `getSupabaseServerClient()` مع runtime check يفشل بوضوح إذا كانت env vars مفقودة.
- ✅ تعديل `src/app/api/health/route.ts` لاستخدام `SERVICE_ROLE_KEY` فقط.
- ✅ تعديل `src/app/api/cron/pdppl-cleanup/route.ts` لاستخدام `SERVICE_ROLE_KEY` فقط.
- ✅ تحديث `.env.example` بالـ placeholder الصحيح + تحذيرات أمنية.
- ✅ `tsc --noEmit` نجح بدون أي errors.
- ✅ Commit على branch `security/rls-hotfix` (لم يُدمج في `main` بعد).
- ⏳ ينتظر تنفيذك.

## ما لم يتم (لاحقاً — Phases B & C)

- ⏳ Phase B: إضافة `SUPABASE_SERVICE_ROLE_KEY` في Vercel + merge إلى `main` + deploy.
- ⏳ Phase C: تطبيق `supabase/migrations/003_pdppl_rls_hotfix.sql` في Supabase (بعد نجاح Phase B).
- ⏳ اختبار WhatsApp bot بعد كل phase.

---

## خطواتك (بالترتيب)

### 1. جيب SERVICE_ROLE_KEY من Supabase (5 دقائق)

1. افتح [Supabase Dashboard](https://supabase.com/dashboard).
2. اختر المشروع (qatar-university-advisor).
3. من القائمة اليسرى: **Settings → API**.
4. في قسم **Project API keys**:
   - انسخ قيمة `service_role` key.
   - ⚠️ هذا **secret** — لا تشاركه في Git أو chat أو أي مكان عام.
   - ⚠️ هذا المفتاح يتجاوز RLS — معاملته مثل كلمة مرور الـ admin.

### 2. أضفه في Vercel (3 دقائق)

1. افتح [Vercel Dashboard](https://vercel.com/dashboard).
2. اختر المشروع `qatar-university-advisor`.
3. **Settings → Environment Variables**.
4. اضغط **Add New**.
5. املأ:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY` (بدون `NEXT_PUBLIC_`!)
   - **Value:** الصق الـ key اللي نسخته من Supabase.
   - **Environments:** حدد ✅ Production ✅ Preview ✅ Development.
6. اضغط **Save**.

> **مهم جداً:** إذا وضعت `NEXT_PUBLIC_` في الاسم، الـ key راح يظهر في bundle المتصفح لكل زوار الموقع. هذه كارثة أمنية — تأكد من الاسم قبل الحفظ.

### 3. Deploy code change (أنا أكمله بعد إذنك)

بعد ما تخلّص الخطوتين 1 و 2، قل لي **"جاهز"** وأنا أكمل:

- Merge branch `security/rls-hotfix` → `main`.
- Vercel يكتشف الـ push تلقائياً ويعمل deploy.
- ننتظر deploy ينجح (~2 دقيقة).
- نختبر `/api/health` يرجّع `healthy`.
- نختبر WhatsApp bot يرد على رسالة اختبار.

### 4. بعد نجاح الـ deploy، نطبّق migration (Phase C)

- أنت تفتح **Supabase SQL Editor**.
- أنا أعطيك الـ SQL من `supabase/migrations/003_pdppl_rls_hotfix.sql` نسخ/لصق.
- تضغط **Run**.
- نراقب 5 دقائق للتأكد من عدم ظهور أخطاء RLS في Vercel logs.

### 5. اختبار نهائي

- ترسل رسالة WhatsApp اختبارية.
- تتأكد الـ bot يرد طبيعياً.
- نسجل النتيجة في `corporate/task-logs/`.

---

## نقاط انتباه

- **الـ 4 users الحاليين آمنون** — الـ migration 003 لا يحذف أي بيانات، فقط يبدّل RLS policies.
- **Rollback plan:** إذا انكسر شيء بعد Phase B، يكفي أنك تحذف env var من Vercel وتعمل revert للـ commit.
- **Phase C rollback:** إذا انكسر شيء بعد migration، عندك backup تلقائي من Supabase (Project → Database → Backups).
- **لا تطبّق migration 003 قبل ما تضيف SERVICE_ROLE_KEY وتتأكد أن deploy ناجح** — إذا عكست الترتيب، الـ backend راح ينكسر فوراً.

---

## ملاحظة تقنية للمراجعة

- `lib/supabase.ts` الآن يصدّر دالتين:
  - `getSupabaseServerClient()` — يفشل بوضوح عند غياب env vars (الاستخدام المفضل للكود الجديد).
  - `supabase` — backward-compat singleton (null إذا env vars مفقودة) — الكود القديم في `lib/consent-manager.js`, `lib/knowledge-base.js`, `lib/semantic-search.js` يستخدمه ويتعامل مع null بشكل سلس.
- Routes الجديدة (`/api/health`, `/api/cron/pdppl-cleanup`) ما تزال تنشئ client مباشرة، لكنها الآن تقرأ `SERVICE_ROLE_KEY` بدلاً من `ANON_KEY`.
