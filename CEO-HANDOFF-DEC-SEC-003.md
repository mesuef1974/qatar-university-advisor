# CEO Handoff — DEC-SEC-003 (دورة الإصلاحات الشاملة)

**التاريخ:** 2026-04-26
**المرجع:** DEC-SEC-003 + محضر-17 + شيك ليست-12
**الحالة:** الكود + التوثيق ✅ مُنفّذ — ينتظر إجراءات Console من CEO

---

## ✅ ما أنجزه AzkiaOS (تلقائياً اليوم)

| # | المُنجَز | الموقع |
|---|---|---|
| 1 | قرار إداري DEC-SEC-003 | `الأرشيف-المؤسسي/08_القرارات-الإدارية/DEC-SEC-003-2026-04-26-حزمة-الإصلاحات-الشاملة.md` |
| 2 | محضر-17 | `الأرشيف-المؤسسي/01_محاضر-الاجتماعات/محضر-17-2026-04-26-دورة-الإصلاحات-الشاملة.md` |
| 3 | شيك ليست-12 QA Gate | `الأرشيف-المؤسسي/04_الجودة-والشيك-ليست/شيك-ليست-12-2026-04-26-QA-Gate-DEC-SEC-003.md` |
| 4 | تقرير SWOT الشامل | `docs/SWOT-Analysis-2026-04-25.md` |
| 5 | دليل Sentry | `docs/setup/sentry-setup.md` |
| 6 | DR Runbook | `docs/runbooks/disaster-recovery.md` |
| 7 | حزمة PDPPL (DPA + DPO + NCSA) | `الأرشيف-المؤسسي/06_القانوني-والامتثال/PDPPL-package-2026-04-26.md` |
| 8 | CEO Handoff (هذه الوثيقة) | `CEO-HANDOFF-DEC-SEC-003.md` |

**Phase A** (تبديل `lib/supabase.ts` لـ SERVICE_ROLE_KEY) **مُطبَّق على main مسبقاً** — لا يحتاج عمل إضافي.

---

## 🚦 ما يحتاج إجراءك الآن (بالترتيب)

### الخطوة 1 — Phase B: إضافة SERVICE_ROLE_KEY في Vercel (5 دقائق)

1. **Supabase Dashboard** → اختر `qatar-university-advisor` → **Settings → API**
2. انسخ قيمة `service_role` key (⚠️ secret).
3. **Vercel Dashboard** → اختر المشروع → **Settings → Environment Variables → Add New**:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY` ← **بدون** `NEXT_PUBLIC_`
   - **Value**: الـ key المنسوخ
   - **Environments**: ✅ Production ✅ Preview ✅ Development
4. اضغط **Save**.
5. Vercel سيعيد deploy تلقائياً (~2 دقيقة).

### الخطوة 2 — Phase C: تطبيق migration 003 في Supabase (3 دقائق)

> **افعل هذه فقط بعد نجاح Phase B**

1. **Supabase Dashboard** → **SQL Editor** → **New query**
2. افتح `supabase/migrations/003_pdppl_rls_hotfix.sql` وانسخ محتواه كاملاً.
3. الصق في SQL Editor.
4. اضغط **Run**.
5. تحقّق من: `Success. No rows returned`.

### الخطوة 3 — Phase D: smoke test (5 دقائق)

```bash
# Health check
curl https://[your-domain]/api/health
# المتوقع: {"status":"healthy"}

# Anon denial test
curl -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/users?select=id"
# المتوقع: [] أو 401

# WhatsApp bot test
# أرسل "مرحبا" من رقمك إلى البوت → يجب أن يرد خلال 5 ثواني
```

### الخطوة 4 — Sentry (10 دقائق)

اتبع `docs/setup/sentry-setup.md`:
1. أنشئ حساب على sentry.io.
2. أضف 5 env vars في Vercel.
3. (يفضّل) قل لي "ركّب Sentry SDK" وأنا أكمل الكود.

### الخطوة 5 — PDPPL (24-72 ساعة)

اتبع `الأرشيف-المؤسسي/06_القانوني-والامتثال/PDPPL-package-2026-04-26.md`:
1. **اليوم**: وقّع DPA مع Supabase (موجود في dashboard) + Vercel + Meta.
2. **اليوم**: أصدر قرار DPO الرسمي.
3. **48 ساعة**: أرسل إشعار NCSA.
4. **48 ساعة**: راجع privacy policy على الموقع.

---

## 🔴 الترتيب الإلزامي

```
Phase B (Vercel env)
    ↓ (ينجح؟)
Phase C (Supabase migration)
    ↓ (ينجح؟)
Phase D (smoke tests)
    ↓ (ينجح؟)
Sentry setup
    ↓
PDPPL legal (DPA + DPO + NCSA)
    ↓
إغلاق DEC-SEC-003 + توقيع شيك ليست-12
```

> **لا تعكس الترتيب**. تطبيق Phase C قبل Phase B = backend مكسور فوراً.

---

## 🚨 خطة Rollback السريع

| الخطوة | إذا انكسر شيء |
|---|---|
| Phase B | احذف env var من Vercel → redeploy السابق |
| Phase C | شغّل بلوك ROLLBACK (آخر `003_pdppl_rls_hotfix.sql` مُعلَّق) |
| Sentry | احذف `SENTRY_DSN` env var |

---

## 📞 عند الإكمال

أرسل لي رسالة **"تم Phase B"**، **"تم Phase C"**، **"تم Phase D"** — وأنا:
1. أحدّث شيك ليست-12.
2. أحدّث محضر-17 → status = closed.
3. أكتب تقرير الإغلاق في `الأرشيف-المؤسسي/05_التقارير-والتقييمات/`.
4. أحدّث الذاكرة المؤسسية.
5. أدفع لـ GitHub.

---

**قاعدة القرار**: لا اعتبار `DEC-SEC-003` مغلقاً قبل توقيع جميع بنود شيك ليست-12 (Gates A→F).
