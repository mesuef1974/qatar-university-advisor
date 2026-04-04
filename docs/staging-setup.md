# دليل إعداد Staging Environment

## الخطوات:
1. في Vercel Dashboard → Settings → Git
2. تفعيل "Preview Deployments" لجميع branches
3. إنشاء branch `staging` من `main`
4. في Vercel → Environment Variables:
   - أضف كل متغيرات .env.staging.example بقيم Staging
   - اختر "Preview" فقط (ليس Production)
5. كل push لـ staging branch يُنشئ deployment تلقائياً

## قاعدة العمل:
feature-branch → staging branch → main (production)

## اختبار Staging:
- URL: https://qatar-university-advisor-git-staging-YOURTEAM.vercel.app
- Admin: /api/admin مع ADMIN_PASSWORD الخاص بـ Staging

## ملاحظات مهمة:
- قاعدة بيانات Staging يجب أن تكون مشروع Supabase مستقل عن Production
- لا تُشارك CRON_SECRET بين Staging و Production
- تأكد من تحديد "Preview" وليس "Production" أو "Development" عند إضافة متغيرات Staging في Vercel

---

## Finding the Vercel Team Slug

The Vercel team slug is required for CLI commands and API calls. You can find it in:

1. **`.vercel/project.json`** in the repo root -- look for the `orgId` field (e.g., `team_AXIPqswuvVNUlh98TalxN6SJ`)
2. **Vercel Dashboard** URL: `https://vercel.com/<team-slug>/...`
3. **Vercel CLI**: run `vercel whoami` or `vercel teams ls`

When constructing the staging preview URL, replace `YOURTEAM` with your team slug:
```
https://qatar-university-advisor-git-staging-<team-slug>.vercel.app
```

---

## Data Seeding

After setting up the staging Supabase project, populate it with test data so the staging environment is useful for QA.

### Option A: SQL seed script

Save the following as `scripts/seed-staging.sql` and run it against your **staging** Supabase instance (never production):

```sql
-- seed-staging.sql
-- Run against the STAGING Supabase project only.
-- psql $STAGING_DATABASE_URL -f scripts/seed-staging.sql

-- Sample colleges
INSERT INTO colleges (id, name_ar, name_en) VALUES
  ('col-1', 'كلية الهندسة', 'College of Engineering'),
  ('col-2', 'كلية العلوم', 'College of Science'),
  ('col-3', 'كلية إدارة الأعمال', 'College of Business')
ON CONFLICT (id) DO NOTHING;

-- Sample majors
INSERT INTO majors (id, college_id, name_ar, name_en, min_gpa) VALUES
  ('maj-1', 'col-1', 'هندسة الحاسب', 'Computer Engineering', 3.0),
  ('maj-2', 'col-1', 'هندسة كهربائية', 'Electrical Engineering', 2.8),
  ('maj-3', 'col-2', 'علوم الحاسب', 'Computer Science', 2.5),
  ('maj-4', 'col-3', 'نظم المعلومات الإدارية', 'Management Information Systems', 2.3)
ON CONFLICT (id) DO NOTHING;

-- Sample conversations (for testing chat flow)
INSERT INTO conversations (id, student_name, created_at) VALUES
  ('conv-1', 'طالب تجريبي', NOW()),
  ('conv-2', 'Test Student', NOW())
ON CONFLICT (id) DO NOTHING;
```

### Option B: Node.js seed script

```bash
# From the project root
SUPABASE_URL=$STAGING_SUPABASE_URL \
SUPABASE_ANON_KEY=$STAGING_SUPABASE_ANON_KEY \
node scripts/seed-staging.js
```

Create `scripts/seed-staging.js`:
```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Seeding staging database...');

  const { error } = await supabase.from('colleges').upsert([
    { id: 'col-1', name_ar: 'كلية الهندسة', name_en: 'College of Engineering' },
    { id: 'col-2', name_ar: 'كلية العلوم', name_en: 'College of Science' },
  ]);
  if (error) throw error;

  console.log('Staging seed complete.');
}

seed().catch(console.error);
```

> **Warning:** Never run seed scripts against the production database. Double-check your environment variables before executing.

---

## Promotion Workflow

How to promote changes from staging to production:

### 1. Develop on a feature branch

```
git checkout -b feature/my-change
# ... make changes, commit ...
git push origin feature/my-change
```

### 2. Merge to staging for QA

```
# Open a PR: feature/my-change -> staging
# Vercel auto-deploys a Preview for the staging branch
# QA team tests at the staging preview URL
```

### 3. Test on staging

- Verify the feature at the staging preview URL
- Run smoke tests against the staging API endpoints
- Confirm environment variables are correct (staging Supabase, staging secrets)

### 4. Promote to production

```
# Once staging is validated, open a PR: staging -> main
# Review the diff (should be the accumulated changes since last promotion)
git checkout main
git merge staging
git push origin main
# Vercel auto-deploys to production
```

### 5. Post-promotion checklist

- [ ] Verify production deployment succeeded in Vercel Dashboard
- [ ] Smoke-test the production URL
- [ ] Check Sentry / monitoring for new errors
- [ ] If rollback is needed: revert the merge commit on `main` and push
