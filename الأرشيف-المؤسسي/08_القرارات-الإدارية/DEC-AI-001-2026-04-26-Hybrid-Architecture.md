# قرار إداري DEC-AI-001 — Hybrid Architecture (Option C)

| الحقل | القيمة |
|---|---|
| **رقم القرار** | DEC-AI-001 |
| **التاريخ** | 2026-04-26 |
| **المُقرِّر** | Sufyan Mesyef (CEO) |
| **المرجع التحليلي** | Truth-Source-Audit-CORRECTED-2026-04-26.md |
| **الإطار** | Boring Tech First + Pragmatic Architecture |
| **حالة الموافقة** | ✅ صريحة "C" + "موافق هيا" |

---

## 1. السياق

التحليل العميق كشف:
- `data/universities.json` (3701 سطر، 30 جامعة) = single source of truth، يحدّثه Content Team
- Production Supabase ناقصة (19 جامعة، 32 program)
- التطبيق يستخدم JSON مباشرة بسبب نقص DB
- pgvector + analytics غير مفعَّلة على المحتوى

## 2. القرار — الخيار C (Hybrid Architecture)

### المبدأ
- **JSON يبقى single source of truth للـ Content Team** (سهل التحرير، Git history، PR review)
- **CI/CD pipeline** يحدّث Supabase تلقائياً عند تغيير JSON
- **التطبيق يقرأ من Supabase** (للـ scale + AI grounding + analytics)
- **JSON كـ fallback** إذا DB unavailable

### المعمارية

```
Content Team
    ↓ يحرّر
data/universities.json (Git)
    ↓ on commit
GitHub Action (etl-universities.mjs)
    ↓ generates
migration_TIMESTAMP_etl_auto_sync.sql
    ↓ apply
Supabase (Production)
    ↓ queries
findResponse.ts (التطبيق)
    ↓ يقرأ من DB
WhatsApp / Web Chat
```

## 3. مراحل التنفيذ (5 مراحل)

### ✅ المرحلة 1: ETL Pipeline (مكتملة 2026-04-26)
- ✅ `scripts/etl-universities.mjs` (Node.js ESM)
- ✅ Reads `data/universities.json` → generates UPSERT SQL
- ✅ Idempotent via DELETE + INSERT
- ✅ Migration `005a_etl_clean_slate.sql` (725 سطر)

### ✅ المرحلة 2: تطبيق على Production (مكتملة 2026-04-26)
- ✅ Apply via Supabase MCP `apply_migration`
- ✅ Verified counts:
  - 30 جامعة (وكانت 19) — +58%
  - 74 برنامج (وكان 32) — +131%
  - 15 جامعة بـ programs (وكان 4) — +275%
- ✅ Military colleges مضافة: ABMMC, AIRFORCE, NAVAL, CYBER
- ✅ QAA, AFG-ABERDEEN, CUQ-ULSTER, MIE-SPPU, QFBA, DFI، إلخ

### ⏳ المرحلة 3: تبديل findResponse للقراءة من DB (5-7 أيام)
- [ ] إضافة `lib/db-context.ts` query layer (موجود — يحتاج توسعة)
- [ ] تبديل `findResponse.ts` ليقرأ universities/programs من Supabase
- [ ] الاحتفاظ بـ JSON كـ fallback عند DB outage
- [ ] integration tests للتحقق من تطابق الردود
- [ ] canary deploy (10% traffic أولاً)

### ⏳ المرحلة 4: CI/CD Auto-Sync (مكتمل scaffold)
- ✅ `.github/workflows/sync-db-on-data-change.yml` ينشئ migration على كل تغيير في `data/`
- [ ] إضافة `SUPABASE_ACCESS_TOKEN` secret لتطبيق تلقائي
- [ ] دمج `supabase db push` لتطبيق ذاتي
- [ ] Notification في Slack/Email عند نجاح/فشل

### ⏳ المرحلة 5: تحسينات (مفتوحة)
- [ ] pgvector على content (semantic search على البرامج)
- [ ] Multi-tenant ready (للتوسع لجامعات أخرى)
- [ ] Dashboard للـ Content Team لتعديل JSON عبر UI
- [ ] Stage editor للـ JSON قبل merge

## 4. القياس (KPIs)

| KPI | الهدف | الحالي |
|---|---|---|
| Universities في DB | ≥ 30 | ✅ 30 |
| Programs في DB | ≥ 70 | ✅ 74 |
| Universities بـ programs | ≥ 15 | ✅ 15 |
| Source diversity | DB > JSON | ⏳ بعد المرحلة 3 |
| ETL idempotency | 100% | ✅ |
| CI auto-sync | يعمل | ⏳ بعد إضافة secret |

## 5. الحدود والمخاطر

### ✅ ما يحميه القرار
- لا حذف للملفات الحالية
- JSON يبقى مصدر مرجعي
- Rollback ممكن (DELETE + restore from JSON)
- لا تأثير على المستخدم النهائي (التطبيق لا يزال يعمل)

### ⚠️ المخاطر
- **R-1**: ETL قد يُسقط حقول مهمة (mitigation: JSON ↔ DB diff tools في المرحلة 3)
- **R-2**: GitHub Action يحتاج Supabase token (mitigation: secret rotation policy)
- **R-3**: تبديل findResponse قد يكسر اختبارات (mitigation: canary deploy)

## 6. التوقيعات

- [x] **CEO Approval**: صريح ("C" + "موافق هيا" 2026-04-26)
- [x] **Logic Gate**: مرّ
- [x] **Pre-Approval Protocol**: متحقَّق
- [x] **Documentation-First**: محقَّق (هذا القرار)
- [ ] **QA Sign-off**: معلَّق على المرحلة 3

## 7. الاجتماع التالي

**المقترح:** 2026-04-29 — مراجعة المرحلة 3 (تبديل findResponse)

---

**التوقيع**: Sufyan Mesyef — CEO — 2026-04-26
**التنفيذ**: AzkiaOS Cycle (Engineering + AI + DevOps)
