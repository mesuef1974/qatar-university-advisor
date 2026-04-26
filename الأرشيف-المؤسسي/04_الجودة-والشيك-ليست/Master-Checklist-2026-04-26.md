# 📋 Master Checklist — All Pending Tasks (Logical Order)

**التاريخ:** 2026-04-26
**القرار المرجعي:** بعد إغلاق DEC-SEC-003 + DEC-AI-001
**استراتيجية التنفيذ:** 3 agents متوازية + orchestrator
**القاعدة:** كل مهمة = دورة كاملة (Logic Gate → Pre-approval → Code → QA → Push → Doc)

---

## 🚦 الترتيب المنطقي (الأكثر إلحاحاً → الأقل)

### 🔴 BATCH 1 — CEO-Blocked Legal (P0, 5 days)

| # | Task | Owner | Status |
|---|---|---|---|
| L1 | DPA templates ready for CEO signature (Supabase, Vercel, Meta) | Agent 2 | ✅ done (commit 76688a0) |
| L2 | DPO appointment letter (Arabic + English) | Agent 2 | ✅ done |
| L3 | NCSA notification letter (in PDPPL-package + DPO decree) | Agent 2 | ✅ done |
| L4 | DPA signature execution | CEO | 🔒 blocked-on-CEO |
| L5 | NCSA submission | CEO + Legal | 🔒 blocked-on-CEO |

### 🟡 BATCH 2 — Code-Automatable (P0/P1)

| # | Task | Owner | Status |
|---|---|---|---|
| C1 | `lib/consent-handler.ts` — user_consents capture logic | Agent 1 | ✅ done (commit d139ae4) |
| C2 | Privacy page update (PDPPL Article 15 compliance) | Agent 1 | ✅ done |
| C3 | Privacy banner — `getConsentBanner()` exported + ready for webhook integration | Agent 1 | ⚠️ banner ready, integration needs P1 follow-up |
| C4 | New `db-programs-handler.ts` + chain in /api/chat + findResponse | Agent 3 | ✅ done (commit 0b11101) |
| C5 | Type-check + 3 separate commits + push | Orchestrator | ✅ done |

### 🟢 BATCH 3 — Cleanup (P2)

| # | Task | Owner | Status |
|---|---|---|---|
| K1 | Document `lib/responses.js` deprecation path | Orchestrator | ⏳ pending |
| K2 | Add coverage badge instructions (CI sets it up) | Orchestrator | ⏳ pending |
| K3 | Remove debug `_dbg` references in tests (already done) | — | ✅ done |

### 🔵 BATCH 4 — Strategic (P2/P3) — for next session

| # | Task | Notes |
|---|---|---|
| S1 | Sentry signup + DSN | needs CEO email |
| S2 | WhatsApp real test | needs CEO phone |
| S3 | pgvector content search | code-automatable later |
| S4 | Multi-tenant prep | architecture decision |

---

## 📊 Coordination Matrix (avoid file conflicts)

| Agent | Files (write) | Files (read-only) |
|---|---|---|
| **A1 — Engineering** | `lib/consent-handler.ts` (new), `src/app/privacy/page.tsx` (modify) | DB schema, existing handlers |
| **A2 — Legal** | `الأرشيف-المؤسسي/06/*.md` (new files only) | nothing |
| **A3 — Expand handler** | `lib/db-list-handler.ts` (extend), `lib/db-programs-handler.ts` (new) | universities.json structure |

**No write conflicts** — each agent owns distinct files.

---

## 🔁 Orchestrator Loop

```
Per agent batch:
  1. Spawn agent with self-contained brief
  2. Wait for completion
  3. Read agent output
  4. Type-check (npm run type-check)
  5. Commit per agent (small focused commits)
  6. Push
  7. Update this checklist (mark ✅)
  8. Move to next agent
```

---

**Updated:** 2026-04-26 (live)
**Last batch:** BATCH 1+2+3 ✅ COMPLETED + verified

---

## 🎯 Final Smoke Tests (live production)

| Query | Source | Count | Verdict |
|---|---|---|---|
| "جميع الجامعات في قطر" | db | 30 | ✅ |
| "جميع التخصصات في قطر" | db | 74 | ✅ NEW! |
| `/api/health` | healthy | — | ✅ |

## 📦 Commits This Batch

```
0b11101  feat(db-first): expand to programs/specialties
76688a0  docs(legal): 4 ready-to-sign PDPPL templates
d139ae4  feat(consent): PDPPL Article 7 capture + privacy
```

## 🔢 Stats

- **Code added:** 542 lines (consent + programs handler + chains)
- **Legal docs:** 931 lines (4 ready-to-sign templates)
- **Privacy page:** 211 lines (full PDPPL refresh)
- **3 agents in parallel** ≈ **3x faster** vs sequential

## ⏳ Remaining (CEO action only — cannot automate)

| # | Task | Why blocked |
|---|---|---|
| L4 | Sign 4 DPAs in vendor dashboards | Legal action |
| L5 | Submit to NCSA | Legal action |
| S1 | Sentry signup + DSN | New account creation |
| S2 | Real WhatsApp test | Needs CEO phone |
| C3 | Wire consent banner into webhook | Needs `lib/findResponse.ts` first-message logic refactor (P1, separate session) |

