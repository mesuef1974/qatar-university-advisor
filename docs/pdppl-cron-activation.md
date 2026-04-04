# تفعيل PDPPL Cron على Production

## المتطلبات:
- CRON_SECRET في Vercel Environment Variables (Production)
- Vercel Pro أو Team plan (للـ Crons)

## الخطوات:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. أضف CRON_SECRET = [قيمة عشوائية آمنة، مثل: openssl rand -hex 32]
3. Redeploy المشروع
4. تحقق في Vercel Dashboard → Crons

## اختبار يدوي:
```bash
curl -X POST https://qatar-university-advisor.vercel.app/api/cron-pdppl-cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## ملاحظة على التوثيق (Authentication):
الـ endpoint يتحقق من `Authorization: Bearer <CRON_SECRET>` في الـ header.
Vercel Cron تُرسل هذا الـ header تلقائياً عند ضبط CRON_SECRET في environment variables.

## DB Migration مطلوبة قبل التفعيل:
قبل تشغيل الـ cron على Production، يجب تشغيل هذا الـ SQL في Supabase SQL Editor:
```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS deletion_requested      BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deletion_requested_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_deletion_requested
  ON users(deletion_requested)
  WHERE deletion_requested = TRUE;

CREATE INDEX IF NOT EXISTS idx_users_retention_until
  ON users(data_retention_until);
```

## الجدول: يعمل يومياً 2:00 AM UTC
الجدول مُعرَّف في `vercel.json`:
```json
{
  "path": "/api/cron-pdppl-cleanup",
  "schedule": "0 2 * * *"
}
```

## مراقبة التشغيل:
- Vercel Dashboard → Project → Crons → مراقبة آخر تشغيل
- السجلات في Vercel Dashboard → Deployments → Functions → cron-pdppl-cleanup
