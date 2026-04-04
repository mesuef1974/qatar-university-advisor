# OPS-A2: Monitoring Dashboard Configuration

> Qatar University Advisor — Production Monitoring Setup

---

## 1. Vercel Analytics Setup

### 1.1 Enable Vercel Web Analytics

1. Go to **Vercel Dashboard > Project > Analytics**.
2. Click **Enable** on the Web Analytics tab.
3. Vercel auto-injects the tracking script on deployment — no code changes needed.

### 1.2 Enable Vercel Speed Insights

1. Install the package (already bundled if using Next.js/Vite on Vercel):
   ```bash
   npm i @vercel/speed-insights
   ```
2. Add to the app entry point:
   ```ts
   import { injectSpeedInsights } from '@vercel/speed-insights';
   injectSpeedInsights();
   ```
3. After deployment, visit **Vercel Dashboard > Speed Insights** to view Core Web Vitals (LCP, FID, CLS).

### 1.3 Key Metrics to Track

| Metric          | Target    | Location in Dashboard        |
|-----------------|-----------|------------------------------|
| LCP             | < 2.5s    | Speed Insights > Web Vitals  |
| FID / INP       | < 200ms   | Speed Insights > Web Vitals  |
| CLS             | < 0.1     | Speed Insights > Web Vitals  |
| Page Views      | —         | Analytics > Overview         |
| Unique Visitors | —         | Analytics > Overview         |
| Top Pages       | —         | Analytics > Pages            |

---

## 2. Uptime Monitoring (BetterStack / Checkly)

### 2.1 Option A — BetterStack (Better Uptime)

#### Setup

1. Create an account at [betterstack.com](https://betterstack.com).
2. Add a new **HTTP Monitor** for the health endpoint.
3. Configure a **Status Page** (optional) for public visibility.

#### Example Monitor Configuration

```yaml
# BetterStack Monitor — Health Endpoint
monitor:
  name: "Qatar Advisor — Health Check"
  url: "https://qatar-university-advisor.vercel.app/api/health"
  monitor_type: "status"
  method: "GET"
  expected_status_codes:
    - 200
  check_frequency: 60          # seconds
  request_timeout: 15          # seconds
  confirmation_period: 0       # alert immediately
  regions:
    - "eu"
    - "us"

# Alert Policy
alert_policy:
  name: "Production Alerts"
  escalation:
    - step: 1
      wait: 0
      targets:
        - type: "email"
          value: "ops-team@example.com"
    - step: 2
      wait: 300                # 5 minutes
      targets:
        - type: "slack_webhook"
          value: "https://hooks.slack.com/services/XXX/YYY/ZZZ"
```

#### Heartbeat (Cron Monitoring)

```yaml
heartbeat:
  name: "Qatar Advisor — Cron Health Ping"
  period: 300                  # expect a ping every 5 minutes
  grace: 60                    # grace period before alerting
```

### 2.2 Option B — Checkly

#### Setup

1. Create an account at [checklyhq.com](https://www.checklyhq.com).
2. Create an **API Check** for the health endpoint.
3. Optionally create a **Browser Check** for full page load validation.

#### Example API Check (`checkly.config.ts`)

```ts
// checkly.config.ts — Monitoring as Code
import { defineConfig } from 'checkly';

export default defineConfig({
  projectName: 'Qatar University Advisor',
  logicalId: 'qatar-advisor-prod',
  checks: {
    frequency: 1,              // every 1 minute
    locations: ['eu-west-1', 'me-south-1'],
    tags: ['production', 'api'],
    runtimeId: '2024.02',
    alertChannels: [],         // configured below
  },
});
```

#### Example API Check Script

```ts
// __checks__/health.check.ts
import { ApiCheck, AssertionBuilder } from 'checkly/constructs';

new ApiCheck('health-endpoint', {
  name: 'Health Endpoint',
  request: {
    url: 'https://qatar-university-advisor.vercel.app/api/health',
    method: 'GET',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.status').equals('ok'),
      AssertionBuilder.responseTime().lessThan(3000),
    ],
  },
  degradedResponseTime: 2000,
  maxResponseTime: 5000,
});
```

#### Example Alert Channel

```ts
// __checks__/alert-channels.ts
import { EmailAlertChannel, SlackAlertChannel } from 'checkly/constructs';

new EmailAlertChannel('ops-email', {
  address: 'ops-team@example.com',
});

new SlackAlertChannel('ops-slack', {
  webhookUrl: 'https://hooks.slack.com/services/XXX/YYY/ZZZ',
});
```

---

## 3. Alert Thresholds

| Alert                  | Condition                                   | Severity | Action               |
|------------------------|---------------------------------------------|----------|----------------------|
| **Downtime**           | `/api/health` returns non-200               | Critical | Page on-call         |
| **Error Rate**         | > 5% of requests fail in 5-minute window    | High     | Slack + Email        |
| **Response Time (P95)**| P95 > 3 seconds                             | Warning  | Slack notification   |
| **Response Time (P99)**| P99 > 5 seconds                             | High     | Slack + Email        |
| **Supabase Down**      | Health check reports `supabase: "down"`     | Critical | Page on-call         |
| **SSL Expiry**         | Certificate expires within 14 days          | Warning  | Email notification   |

### Alert Rules in BetterStack Format

```yaml
alert_rules:
  - name: "Downtime Alert"
    trigger: "monitor_down"
    condition: "status_code != 200"
    for: "0s"                  # immediate
    severity: "critical"
    channels: ["email", "slack", "pagerduty"]

  - name: "High Error Rate"
    trigger: "metric_threshold"
    metric: "error_rate"
    condition: "> 5%"
    window: "5m"
    severity: "high"
    channels: ["email", "slack"]

  - name: "Slow Response (P95)"
    trigger: "metric_threshold"
    metric: "response_time_p95"
    condition: "> 3000ms"
    window: "5m"
    severity: "warning"
    channels: ["slack"]
```

### Alert Rules in Checkly Format

```ts
// Checkly alert settings (per-check)
{
  alertSettings: {
    escalationType: 'RUN_BASED',
    runBasedEscalation: {
      failedRunThreshold: 2,   // alert after 2 consecutive failures
    },
    reminders: {
      amount: 3,
      interval: 5,            // remind every 5 minutes
    },
  },
}
```

---

## 4. Health Check Dashboard Layout

### 4.1 Recommended `/api/health` Response Schema

```json
{
  "status": "ok",
  "timestamp": "2026-04-04T12:00:00.000Z",
  "version": "1.3.0",
  "uptime": 86400,
  "checks": {
    "supabase": "connected",
    "api": "ok"
  },
  "responseTime": {
    "p50": 120,
    "p95": 450,
    "p99": 980
  }
}
```

### 4.2 Dashboard Panels

```
+---------------------------------------------------------------+
|                    Qatar Advisor — Monitoring                  |
+---------------------------------------------------------------+
|                                                                |
|  [1] HEALTH STATUS          [2] RESPONSE TIME                 |
|  ┌─────────────────┐        ┌─────────────────────────┐       |
|  │ API Health: OK   │        │ P50:  120ms  (target <500ms) │ |
|  │ Uptime:   99.9%  │        │ P95:  450ms  (target <3s)   │ |
|  │ Last Check: 30s  │        │ P99:  980ms  (target <5s)   │ |
|  └─────────────────┘        └─────────────────────────┘       |
|                                                                |
|  [3] ERROR RATE             [4] SUPABASE STATUS               |
|  ┌─────────────────┐        ┌─────────────────────────┐       |
|  │ Current:  0.3%   │        │ Connection: connected    │     |
|  │ Threshold: 5%    │        │ Latency:    45ms         │     |
|  │ Window:   5min   │        │ Pool:       3/10 active  │     |
|  └─────────────────┘        └─────────────────────────┘       |
|                                                                |
|  [5] UPTIME TIMELINE (30 days)                                |
|  ┌─────────────────────────────────────────────────────┐      |
|  │ ████████████████████████████████████████████████████ │      |
|  │ Mar 5 ─────────────────────────────────── Apr 4     │      |
|  │ 99.95% uptime  |  1 incident  |  MTTR: 4m          │      |
|  └─────────────────────────────────────────────────────┘      |
|                                                                |
+---------------------------------------------------------------+
```

### 4.3 Panel Descriptions

| # | Panel               | Data Source                        | Refresh  |
|---|---------------------|------------------------------------|----------|
| 1 | Health Status       | `GET /api/health` status field     | 30s      |
| 2 | Response Time       | Vercel Speed Insights / Checkly    | 1 min    |
| 3 | Error Rate          | Vercel Analytics / BetterStack     | 1 min    |
| 4 | Supabase Status     | `GET /api/health` checks.supabase  | 30s      |
| 5 | Uptime Timeline     | BetterStack / Checkly uptime data  | 5 min    |

---

## 5. Status Page (Optional)

### BetterStack Status Page

```yaml
status_page:
  name: "Qatar University Advisor"
  subdomain: "qatar-advisor"         # status.qatar-advisor.betteruptime.com
  custom_domain: "status.example.com" # optional
  sections:
    - name: "Core Services"
      monitors:
        - "Health Endpoint"
        - "Supabase Database"
    - name: "Web Application"
      monitors:
        - "Homepage Load"
        - "Chat Interface"
```

### Checkly Status Page

Configure via Checkly Dashboard > Status Pages, or via `checkly.config.ts`:

```ts
// Status page groups
{
  statusPages: [{
    name: 'Qatar Advisor Status',
    url: 'https://status.qatar-advisor.example.com',
    checks: ['health-endpoint'],
  }],
}
```

---

## 6. Quick Start Checklist

- [ ] Enable Vercel Web Analytics in project dashboard
- [ ] Enable Vercel Speed Insights and inject script
- [ ] Create BetterStack or Checkly account
- [ ] Add `/api/health` HTTP monitor (60s interval)
- [ ] Configure alert channels (Email + Slack)
- [ ] Set alert thresholds (downtime, error rate > 5%, P95 > 3s)
- [ ] Create status page (optional)
- [ ] Verify alerts fire correctly with a test downtime
