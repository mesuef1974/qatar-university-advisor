# Monitoring and Alerting Setup Guide

**Project:** Qatar University Advisor (WhatsApp Bot)
**Last Updated:** 2026-04-04
**Responsible Team:** DevOps / SRE Department
**Stack:** Vercel (Serverless), Supabase (PostgreSQL), Gemini AI API, Upstash Redis, WhatsApp Cloud API

---

## 1. Monitoring Architecture Overview

We monitor five layers of the Qatar University Advisor system:

| Layer              | What We Monitor                          | Primary Tool           |
|--------------------|------------------------------------------|------------------------|
| Application        | Errors, response times, function logs    | Sentry, Vercel Logs    |
| Infrastructure     | Uptime, DB connections, Redis memory     | UptimeRobot, Supabase  |
| API Costs          | Token usage, message volume, bandwidth   | Custom tracking + logs |
| Performance        | Core Web Vitals, Lighthouse scores       | Vercel Analytics, CI   |
| Security           | Vulnerabilities, SSL, CSP violations     | GitHub Actions, manual |

All alerts flow through two channels: **email** (primary) and **Discord/Slack webhook** (real-time).

---

## 2. Application Monitoring

### 2.1 Vercel Analytics (Built-in)

Vercel provides zero-config analytics for every deployment.

- **Dashboard:** `https://vercel.com/[team]/qatar-university-advisor/analytics`
- **Functions tab:** Shows invocation count, duration, and error rate for `/api/webhook` and `/api/admin`
- **Targets:**
  - Function duration: < 10 seconds (Vercel Hobby timeout)
  - Error rate: < 1% of total invocations
  - Cold start frequency: monitor but no hard target

No additional configuration is needed. Vercel Analytics is enabled by default on all plans.

### 2.2 Vercel Logs and Functions Monitoring

Access real-time and persisted logs:

- **Real-time logs:** `https://vercel.com/[team]/qatar-university-advisor/logs`
- **Filter by function:** Select `/api/webhook` to isolate bot traffic
- **Filter by status:** Use `status:500` to find server errors
- **Log retention:** 1 hour on Hobby, 3 days on Pro

For extended retention, forward logs to an external service (see Sentry below).

### 2.3 Error Tracking with Sentry

Sentry provides persistent error tracking beyond Vercel's log retention window.

**Step 1 -- Install the SDK:**

```bash
npm install @sentry/node
```

**Step 2 -- Create `lib/sentry.js`:**

```js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || "development",
  release: process.env.VERCEL_GIT_COMMIT_SHA || "local",
  tracesSampleRate: 0.2,       // 20% of transactions for performance
  profilesSampleRate: 0.1,     // 10% of sampled transactions for profiling
  beforeSend(event) {
    // Scrub PII -- remove phone numbers from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(b => ({
        ...b,
        message: b.message?.replace(/\+?\d{10,15}/g, "[REDACTED_PHONE]"),
      }));
    }
    return event;
  },
});

export default Sentry;
```

**Step 3 -- Wrap serverless handlers:**

```js
import Sentry from "../lib/sentry.js";

export default async function handler(req, res) {
  try {
    // ... existing handler logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: "webhook", method: req.method },
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
```

**Step 4 -- Add `SENTRY_DSN` to Vercel environment variables:**

```
vercel env add SENTRY_DSN
```

**Free tier limit:** 5,000 errors/month. Set a Sentry rate limit to avoid overage.

### 2.4 Custom Health Check Endpoint

The project does not currently have a `/api/health` endpoint. Create one at `api/health.js`:

```js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "unknown",
    services: {},
  };

  // Check Supabase connectivity
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    const { error } = await supabase.from("conversations").select("id").limit(1);
    checks.services.supabase = error ? "degraded" : "ok";
  } catch {
    checks.services.supabase = "down";
    checks.status = "degraded";
  }

  // Check Upstash Redis connectivity
  try {
    const redisResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
      { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
    );
    checks.services.redis = redisResponse.ok ? "ok" : "degraded";
  } catch {
    checks.services.redis = "down";
    checks.status = "degraded";
  }

  const httpStatus = checks.status === "ok" ? 200 : 503;
  res.status(httpStatus).json(checks);
}
```

This endpoint is used by UptimeRobot (Section 3.1) and can be called manually for quick diagnostics.

---

## 3. Infrastructure Monitoring

### 3.1 Uptime Monitoring with UptimeRobot

UptimeRobot (free tier: 50 monitors, 5-minute intervals) watches external availability.

**Setup steps:**

1. Create an account at https://uptimerobot.com
2. Add the following HTTP(s) monitors:

| Monitor Name               | URL                                              | Interval | Alert |
|----------------------------|--------------------------------------------------|----------|-------|
| Health Endpoint            | `https://[your-domain]/api/health`               | 5 min    | All   |
| Webhook Endpoint (GET)     | `https://[your-domain]/api/webhook`               | 5 min    | All   |
| Landing Page               | `https://[your-domain]/`                          | 5 min    | All   |

3. Configure alert contacts:
   - **Email:** Add the DevOps team distribution list
   - **Webhook:** Add a Discord/Slack incoming webhook URL
4. Set the keyword check on the health endpoint: expect `"status":"ok"` in the response body
5. Enable SSL certificate monitoring (warns 14 days before expiry)

### 3.2 Supabase Dashboard Monitoring

Monitor via the Supabase dashboard at `https://supabase.com/dashboard/project/[project-id]`.

**Key metrics to watch:**

| Metric                 | Location in Dashboard     | Warning Threshold        | Critical Threshold       |
|------------------------|---------------------------|--------------------------|--------------------------|
| Active connections     | Database > Health         | > 40 (of 60 on free)    | > 55                     |
| Database size          | Database > Health         | > 400 MB (of 500 free)  | > 475 MB                 |
| API requests/day       | API > Usage               | > 400K (of 500K free)   | > 475K                   |
| Auth users             | Authentication > Users    | Informational only       | --                       |
| Storage used           | Storage > Usage           | > 800 MB (of 1 GB free) | > 950 MB                 |

Supabase does not offer native alerting on the free tier. Check these manually during the weekly health review (Section 8).

### 3.3 Upstash Redis Monitoring

Monitor via the Upstash console at `https://console.upstash.com`.

**Key metrics:**

| Metric              | Target              | Action if Exceeded                        |
|---------------------|---------------------|-------------------------------------------|
| Daily commands       | < 8,000 (of 10K)   | Review rate-limit window settings         |
| Memory usage         | < 200 MB            | Audit TTLs, shorten conversation cache    |
| Rate limit hits      | Track trend         | If spiking, possible abuse -- check IPs   |
| Latency (p99)        | < 10 ms             | Check region mismatch                     |

Upstash provides a built-in "Usage" tab and supports webhook alerts on the Pay-as-you-go plan.

---

## 4. API Cost Monitoring

### 4.1 Gemini API Usage Tracking

The Gemini API bills by token count. Track usage via Google Cloud Console or Google AI Studio.

| Metric            | Free Tier Limit          | Warning Threshold   | Alert Action                     |
|-------------------|--------------------------|---------------------|----------------------------------|
| Requests/minute   | 15 RPM (Gemini 1.5)     | > 12 RPM sustained  | Increase rate-limit window       |
| Tokens/day        | 1,500 req/day            | > 1,200 req/day     | Review conversation length       |
| Cost/day          | Free for now             | > $1/day if on paid | Email finance + DevOps           |

**Implementation:** Add a counter in Redis that increments on each Gemini call:

```js
// In lib/ai-handler.js, after each successful Gemini call:
await redis.incr(`gemini:calls:${new Date().toISOString().slice(0, 10)}`);
await redis.expire(`gemini:calls:${new Date().toISOString().slice(0, 10)}`, 604800);
```

### 4.2 WhatsApp API Message Volume

Monitor via Meta Business Suite > WhatsApp Manager > Insights.

| Metric               | Target                | Alert Threshold          |
|----------------------|-----------------------|--------------------------|
| Messages sent/day    | Track baseline        | > 2x baseline            |
| Delivery rate        | > 95%                 | < 90%                    |
| Read rate            | Informational         | --                       |
| Quality rating       | Green (High)          | Yellow (Medium) or lower |

WhatsApp quality rating drops can cause message throttling. Monitor weekly.

### 4.3 Vercel Usage

Check at `https://vercel.com/[team]/usage`.

| Metric               | Hobby Limit           | Warning Threshold        |
|----------------------|-----------------------|--------------------------|
| Bandwidth             | 100 GB/month          | > 80 GB                  |
| Function invocations  | 100K/month            | > 80K                    |
| Function duration     | 100 GB-hours/month    | > 80 GB-hours            |
| Build minutes          | 6,000 min/month       | > 4,800 min              |

---

## 5. Performance Monitoring

### 5.1 Core Web Vitals

Vercel Analytics automatically tracks Core Web Vitals for the landing page:

- **LCP (Largest Contentful Paint):** Target < 2.5s
- **FID (First Input Delay):** Target < 100ms
- **CLS (Cumulative Layout Shift):** Target < 0.1
- **INP (Interaction to Next Paint):** Target < 200ms

View at: `https://vercel.com/[team]/qatar-university-advisor/analytics/web-vitals`

### 5.2 Lighthouse CI (GitHub Actions)

The project already has a Lighthouse CI workflow at `.github/workflows/performance.yml`. It runs on every push to `main` and on pull requests.

**Score targets:**

| Category        | Target | Blocking |
|-----------------|--------|----------|
| Performance     | >= 90  | Yes      |
| Accessibility   | >= 90  | Yes      |
| Best Practices  | >= 90  | Yes      |
| SEO             | >= 90  | No       |
| PWA             | >= 50  | No       |

If a PR drops any blocking score below the target, the CI check fails and the PR cannot merge.

### 5.3 API Response Time Tracking

Track the `/api/webhook` response time (the critical path for the WhatsApp bot).

**Targets:**

| Metric                | Target     | Critical   |
|-----------------------|------------|------------|
| Webhook p50 latency   | < 2s       | > 5s       |
| Webhook p99 latency   | < 8s       | > 10s      |
| Health endpoint p99    | < 500ms    | > 2s       |

Sentry performance monitoring (when enabled with `tracesSampleRate`) captures these automatically. Alternatively, add manual timing in the webhook handler:

```js
const start = Date.now();
// ... process message
const duration = Date.now() - start;
console.log(`[perf] webhook processed in ${duration}ms`);
```

Vercel logs preserve this for filtering (`duration:>5000`).

---

## 6. Alerting Configuration

### 6.1 Alert Channels

| Channel         | Purpose                    | Setup                                     |
|-----------------|----------------------------|-------------------------------------------|
| Email           | Primary, all severities    | DevOps distribution list                  |
| Discord webhook | Real-time P1/P2 alerts     | Incoming webhook in #alerts channel       |
| Sentry          | Error alerts               | Built-in email + Slack/Discord integration|
| UptimeRobot     | Downtime alerts            | Email + webhook                           |

**Discord webhook setup:**

1. In your Discord server, go to Server Settings > Integrations > Webhooks
2. Create a webhook in the `#monitoring-alerts` channel
3. Copy the webhook URL and add it to UptimeRobot and Sentry alert integrations

### 6.2 Alert Severity Levels

| Severity | Criteria                                   | Response Time | Notification          |
|----------|--------------------------------------------|---------------|-----------------------|
| P1       | Service down, webhook not responding       | 15 minutes    | Email + Discord + SMS |
| P2       | Error rate > 5%, degraded performance      | 1 hour        | Email + Discord       |
| P3       | Warning thresholds hit, cost anomaly       | 4 hours       | Email                 |
| P4       | Informational, trend alerts                | Next business day | Email digest       |

### 6.3 Escalation Procedures

1. **P1 -- Service outage:**
   - UptimeRobot fires alert to all channels
   - On-call engineer acknowledges within 15 minutes
   - If no acknowledgement in 30 minutes, escalate to team lead
   - Post status update in Discord every 15 minutes until resolved
   - Write postmortem within 48 hours

2. **P2 -- Degraded service:**
   - Sentry or manual detection triggers alert
   - On-call engineer investigates within 1 hour
   - Decide: hotfix, rollback (`vercel rollback`), or monitor
   - Document in incident log

3. **P3/P4 -- Warnings:**
   - Address during next working session
   - Track in issue tracker if action is needed

---

## 7. Dashboards

### 7.1 Recommended Dashboard Layout

Build a unified status page using a free tool like Grafana Cloud (free tier), Datadog (free tier for 1 host), or a simple HTML page served from `/status`.

**Suggested layout (4 panels):**

```
+------------------------------+------------------------------+
|   Service Health (live)      |   Error Rate (24h trend)     |
|   - Webhook: OK/DOWN        |   - Graph: errors over time  |
|   - Supabase: OK/DEGRADED   |   - Current rate: 0.3%       |
|   - Redis: OK/DOWN          |   - Target: < 1%             |
+------------------------------+------------------------------+
|   API Costs (MTD)            |   Performance (7d avg)       |
|   - Gemini calls: 842/1500  |   - Webhook p50: 1.8s        |
|   - WhatsApp msgs: 2,301    |   - LCP: 2.1s                |
|   - Vercel invocations: 12K |   - Lighthouse: 94           |
+------------------------------+------------------------------+
```

### 7.2 Key Metrics to Display

- **Uptime percentage** (30-day rolling, target 99.5%)
- **Webhook success rate** (non-5xx responses / total)
- **Average conversation length** (messages per session)
- **Gemini API call count** (daily, weekly, monthly)
- **Supabase connection count** (current)
- **Redis command count** (daily)
- **Deployment frequency** (commits to main / week)

---

## 8. Weekly Health Check Checklist

Perform this checklist every Monday morning. Copy into your issue tracker if desired.

- [ ] **Vercel error rate:** Check Functions tab, confirm < 1% error rate over past 7 days
- [ ] **Supabase connections:** Verify active connections < 40 (of 60 limit). Check database size.
- [ ] **Redis rate limiting:** Review Upstash usage tab. Confirm no unusual spikes in commands.
- [ ] **Gemini API cost:** Check Google AI Studio usage. Compare daily call count to budget.
- [ ] **WhatsApp delivery rate:** Open Meta Business Suite > Insights. Confirm delivery > 95%.
- [ ] **SSL certificate expiry:** UptimeRobot shows this; verify > 14 days remaining.
- [ ] **Dependency vulnerabilities:** Run `npm audit` locally or check the GitHub Security tab.
- [ ] **Sentry error digest:** Review new/unresolved issues from the past week. Assign owners.
- [ ] **Vercel bandwidth:** Check usage page. Confirm < 80% of monthly limit.
- [ ] **Lighthouse scores:** Review latest CI run on `main`. Confirm all blocking scores >= 90.
- [ ] **Cron job execution:** Verify `/api/cron-pdppl-cleanup` ran successfully each night (Vercel Cron tab).
- [ ] **Log review:** Scan Vercel logs for any repeated warnings or unusual patterns.

---

## 9. Runbook References

| Alert / Incident                     | Runbook Action                                                                 |
|--------------------------------------|--------------------------------------------------------------------------------|
| Health endpoint returns 503          | Check which service is `down` in the JSON response. Restart or check status.   |
| Webhook 500 errors spiking           | Check Sentry for stack trace. Likely causes: Gemini API timeout, Supabase down.|
| Supabase connection limit reached    | Kill idle connections via Supabase dashboard SQL editor: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '5 minutes';` |
| Redis out of memory                  | Review TTLs. Flush non-critical keys: rate-limit counters can be safely cleared.|
| WhatsApp quality rating dropped      | Stop outbound campaigns. Review message templates for policy violations.        |
| Gemini API rate limited (429)        | Increase backoff in `lib/ai-handler.js`. Consider caching frequent queries.     |
| SSL certificate expiring soon        | Vercel auto-renews. If custom domain, check DNS and Vercel domain settings.     |
| Lighthouse score dropped below 90    | Check recent CSS/JS changes. Run `npx lighthouse` locally to identify cause.    |
| Vercel build failing                 | Check build logs. Common causes: missing env vars, dependency conflicts.        |
| High Vercel function duration        | Profile with Sentry tracing. Check for missing `await`, slow DB queries.        |

---

## 10. Environment Variables Required for Monitoring

Add these to Vercel project settings (Settings > Environment Variables):

| Variable                      | Purpose                              | Required |
|-------------------------------|--------------------------------------|----------|
| `SENTRY_DSN`                  | Sentry error tracking                | Optional |
| `UPSTASH_REDIS_REST_URL`      | Redis health check + rate limiting   | Yes      |
| `UPSTASH_REDIS_REST_TOKEN`    | Redis authentication                 | Yes      |
| `SUPABASE_URL`                | Supabase health check                | Yes      |
| `SUPABASE_ANON_KEY`           | Supabase authentication              | Yes      |

---

## Revision History

| Date       | Author       | Change                                      |
|------------|--------------|----------------------------------------------|
| 2026-04-04 | DevOps/SRE   | Complete rewrite: full monitoring guide       |
