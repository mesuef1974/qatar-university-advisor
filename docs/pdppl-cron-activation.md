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

---

## Failure Handling

### What happens if the cron job fails?

**Vercel Cron retry behavior:**
- Vercel does **not** automatically retry failed cron invocations. If the function throws an error or times out, it simply fails and the next run occurs at the next scheduled time (next day at 2:00 AM UTC).
- The function has a default timeout of 10 seconds (Hobby) or 60 seconds (Pro). PDPPL cleanup should complete well within this window for typical user counts.

### Recommended failure mitigation:

1. **Structured logging** — The cron endpoint should log success/failure counts:
   ```js
   console.log(JSON.stringify({
     event: 'pdppl-cleanup',
     status: 'completed', // or 'failed'
     deletedUsers: 5,
     expiredRetention: 12,
     errors: [],
     timestamp: new Date().toISOString(),
   }));
   ```

2. **External uptime monitoring** — Use a free service (e.g., Better Uptime, Cronitor, or Checkly) to ping a heartbeat URL at the end of the cron function. If the heartbeat is missed, the service sends an alert.

3. **Manual re-run** — If a run fails, trigger it manually:
   ```bash
   curl -X POST https://qatar-university-advisor.vercel.app/api/cron-pdppl-cleanup \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. **Alerting via Vercel Logs** — On Vercel Pro, set up Log Drains to forward function logs to a service like Datadog or Axiom, then create alerts on error-level logs from `cron-pdppl-cleanup`.

---

## PDPPL Data Retention Periods

Under Qatar's Personal Data Protection and Privacy Law (Law No. 13 of 2016), data must not be retained longer than necessary for its purpose. The following retention schedule applies to this project:

| Data Type | Retention Period | Justification | Auto-Deleted by Cron |
|-----------|-----------------|---------------|---------------------|
| Chat conversation logs | 90 days | Needed for context continuity and support | Yes |
| User profile data (name, student ID) | Until deletion requested + 30 day grace period | Core service delivery | Yes |
| Analytics / usage metrics | 12 months | Aggregated for service improvement | No (anonymized) |
| Consent records | 3 years after last interaction | Legal proof of consent | No (manual review) |
| Error logs (with PII) | 30 days | Debugging and incident response | Yes |
| Embedding vectors (knowledge base) | Indefinite | No personal data; institutional knowledge only | N/A |

> **Note:** The `data_retention_until` column on the `users` table controls per-user retention. When this timestamp is reached, the cron job deletes the user's personal data. Users who request deletion get a 30-day grace period (via `deletion_requested_at`) before permanent removal.

---

## Data Subject Rights Beyond Auto-Deletion

PDPPL grants data subjects rights that go beyond automated retention cleanup. The system must support handling these manually:

### 1. Right of Access (Article 16)
- Data subjects can request a copy of all personal data held about them.
- **Implementation:** Build an admin endpoint or Supabase query that exports all data for a given user ID (profile, chat logs, consent records).

### 2. Right of Rectification (Article 17)
- Data subjects can request correction of inaccurate data.
- **Implementation:** Handle via admin panel or direct database update. Log the change for audit purposes.

### 3. Right of Objection (Article 18)
- Data subjects can object to processing of their data.
- **Implementation:** Add an `objection_status` flag if needed. When objection is raised, cease non-essential processing for that user.

### 4. Right of Erasure (manual trigger)
- While the cron handles scheduled deletions, a data subject may request immediate deletion.
- **Implementation:** Set `deletion_requested = TRUE` and `deletion_requested_at = NOW()` on the user record. For urgent requests (regulatory complaint), skip the 30-day grace period by directly purging data.

### 5. Handling Process
For any data subject rights request:
1. Verify the identity of the requester
2. Log the request with timestamp and type in an audit table
3. Respond within **30 days** (PDPPL requirement)
4. Document the action taken and notify the requester
5. Retain the request log (without the deleted data) for compliance audit
