# SECURITY HOTFIX: RLS `USING(TRUE)` → Scoped Policies

**Date:** 2026-04-10
**Severity:** P0 — Critical
**Ticket:** DEC-SEC-002
**Related:** DEC-SEC-001 (VITE env var exposure, fixed earlier)
**Ref:** Consultation #1 — `advisor.pdppl_qatar.v1`
**Status:** Hotfix prepared — PENDING CEO review + manual production deployment

---

## 1. Vulnerability

All Row-Level Security (RLS) policies created in `schema.sql` and
`migrations/002_user_consents_and_indexes.sql` used `USING (TRUE)`.

Combined with the backend client in `lib/supabase.ts:89-96` which is
initialized with `SUPABASE_ANON_KEY` (not `SUPABASE_SERVICE_ROLE_KEY`),
this means:

- Any client possessing the anon key — **which is published to the
  browser in Next.js builds** — can execute arbitrary `SELECT`, `INSERT`,
  `UPDATE`, `DELETE` against every PII table.
- Rows in `users`, `conversations`, `favorites`, `analytics`, and
  `user_consents` are all reachable via direct REST calls to
  `/rest/v1/<table>`.
- Even RLS being `ENABLED` is meaningless when the single policy is
  `USING (TRUE)`.

### Affected data
- Student phones, nationality, GPA, academic track, profile JSON
- Full chat history between students and the AI advisor
- PDPPL Article 7 consent records (including withdrawal status, IP, UA)
- Semantic embeddings of conversations

### Compliance failure
- **PDPPL §5.3 Security Measures** — requires "appropriate technical and
  organizational measures" to protect personal data. `USING(TRUE)` is
  not a measure.
- **PDPPL Article 7** — consent records themselves are exposed, breaking
  auditability of consent.
- Classified as **Tier 2–4** administrative penalty exposure by
  Consultation #1.

---

## 2. Tables affected

### PII tables (RLS must DENY anon)
| Table                    | Sensitive fields                              |
|--------------------------|-----------------------------------------------|
| `users`                  | `phone`, `nationality`, `gpa`, `profile_data` |
| `conversations`          | `message` (chat content linked to user_id)    |
| `favorites`              | `user_id`, `university_id`                    |
| `analytics`              | `query` (may embed personal info)             |
| `user_consents`          | `phone`, `ip_address`, `user_agent`           |
| `knowledge_cache`        | `question` may contain personal queries       |
| `knowledge_embeddings`   | embedded content                              |
| `conversation_embeddings`| embeddings of student messages                |

### Public reference tables (anon SELECT allowed, scoped)
| Table                    | Policy                                   |
|--------------------------|------------------------------------------|
| `universities`           | `USING (is_active = TRUE)`               |
| `programs`               | `USING (is_active = TRUE)`               |
| `admission_requirements` | `USING (TRUE)` — no sensitive fields     |
| `tuition_fees`           | `USING (TRUE)` — reference data          |
| `scholarships`           | `USING (is_active = TRUE)`               |
| `salary_data`            | `USING (TRUE)` — reference data          |

---

## 3. Fix strategy

Because the app does **not** use Supabase Auth (users are keyed by phone
via the WhatsApp webhook, and `auth.uid()` is never set), standard
per-row `auth.uid()` policies cannot be applied to the PII tables.

The fix has three parts:

1. **Migration `003_pdppl_rls_hotfix.sql`** (this delivery):
   - Drops all `USING(TRUE)` policies.
   - Leaves PII tables with RLS enabled and **no policies for
     anon/authenticated** → PostgreSQL denies by default.
   - Revokes explicit table-level privileges from anon/authenticated on
     PII tables as defense-in-depth.
   - Recreates public reference policies scoped to `is_active = TRUE`
     where applicable.

2. **Backend client switch (code change, separate PR):**
   - `lib/supabase.ts` must be updated to use
     `SUPABASE_SERVICE_ROLE_KEY` for server-side operations that touch
     PII tables. `service_role` bypasses RLS by design.
   - This key MUST be a **server-only** env var (not prefixed with
     `NEXT_PUBLIC_` or `VITE_`). Vercel project settings →
     Environment Variables → Server.
   - The browser-facing code must NOT read PII tables directly; all
     reads should go through `/api/*` routes that run server-side.

3. **Tests** — `supabase/tests/rls_policies.test.sql` provides a smoke
   test suite using `SET ROLE anon` / `service_role` to confirm anon is
   denied on all PII tables and permitted on active reference rows.

---

## 4. Deployment steps (CEO approval required)

> Do NOT run automatically. Each step requires explicit CEO approval.

### Step 1 — Staging verification
1. Create a staging branch of the Supabase project (or copy production
   schema to a staging project).
2. Apply `supabase/migrations/003_pdppl_rls_hotfix.sql` via
   Dashboard → SQL Editor.
3. Run `supabase/tests/rls_policies.test.sql` and verify all assertions
   print `PASS`.

### Step 2 — Prepare backend code change
1. Open a separate PR that changes `lib/supabase.ts` to:
   - Read `SUPABASE_SERVICE_ROLE_KEY` for server-side usage
   - Keep `SUPABASE_ANON_KEY` only for any browser-reachable, reference-
     table-only client (if any)
2. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel project env vars
   (Production + Preview + Development). Server-only.
3. Verify that the whatsapp webhook route, cron cleanup route, and
   health route all work with the new key against staging.

### Step 3 — Production cutover
1. Merge the backend PR (do NOT deploy yet).
2. Apply `003_pdppl_rls_hotfix.sql` to production Supabase.
3. Immediately deploy the Vercel build containing the new client.
4. Smoke-test: send a WhatsApp message to the bot, confirm response,
   confirm new row in `users` and `conversations`.
5. Confirm anon-role query fails:
   ```bash
   curl -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        "$SUPABASE_URL/rest/v1/users?select=id"
   # expected: [] or permission denied
   ```

### Step 4 — Post-deploy
1. Monitor error logs for 1 hour for any RLS-related failures
   (`permission denied for table`).
2. Update Azkia DEC-SEC-002 status → `resolved`.
3. File follow-up ticket: "Migrate to Supabase Auth phone sign-in" so
   future RLS can use `auth.uid()`.

---

## 5. Rollback plan

If the production cutover breaks the app:

1. **Revert the Vercel deployment** to the previous commit
   (anon-key-based client) — this restores functionality but reopens
   the anon read path on reference tables only, because the PII policies
   are still locked down by the migration.
2. If `users`/`conversations` writes start failing, run the rollback
   block at the bottom of `003_pdppl_rls_hotfix.sql`:
   ```sql
   -- See commented "ROLLBACK" section of the migration file.
   -- This restores the insecure USING(TRUE) policies.
   -- Use only as an emergency measure; open a P0 incident and redeploy
   -- the fix within 24 hours.
   ```
3. Open an incident ticket: `INC-SEC-002` with root cause.

---

## 6. Testing checklist

- [ ] `003_pdppl_rls_hotfix.sql` applies without error on staging
- [ ] `rls_policies.test.sql` — all `PASS` notices
- [ ] Staging: anon REST call to `/rest/v1/users` returns empty / 401
- [ ] Staging: anon REST call to `/rest/v1/universities` returns active
      rows only
- [ ] Staging: backend (with service_role) can still insert into `users`
- [ ] Staging: backend can still insert into `conversations`
- [ ] Staging: `/api/cron/pdppl-cleanup` still deletes expired rows
- [ ] Production: same 6 checks above
- [ ] No increase in error logs within 1h post-deploy

---

## 7. Related

- **DEC-SEC-001** — VITE env var exposure fix (earlier)
- **Migration 001** — pgvector + embedding tables
- **Migration 002** — `user_consents` table + indexes
- **Consultation #1** — advisor.pdppl_qatar.v1 full PDPPL audit
