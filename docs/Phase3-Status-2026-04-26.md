# Phase 3 Status — DEC-AI-001 (Honest Assessment)

**Date:** 2026-04-26
**Status:** ⏸️ **Paused — needs focused debug session**

---

## ✅ What Works

| Component | Status |
|---|---|
| `data/universities.json` (3,701 lines, 30 unis) | ✅ Source of truth |
| `scripts/etl-universities.mjs` | ✅ Generates 725 lines SQL |
| Migration applied to Supabase | ✅ 30 unis + 74 programs |
| `lib/db-list-handler.ts` (188 lines) | ✅ Type-checks, local match works |
| `findResponse.ts` integration | ✅ Type-checks |
| `/api/chat/route.ts` integration | ✅ Type-checks |
| Vercel deploy of all changes | ✅ READY |
| GitHub Action `sync-db-on-data-change.yml` | ✅ Scaffold ready |

## ⚠️ What Doesn't Work (Yet)

In Vercel production runtime:
- Logger confirms handler **is invoked** (`DB-handler: invoking`)
- Logger reports `result=null (no match or error)` for every test
- Local Node test of same logic: **all 3 phrasings match correctly**

**Root cause hypothesis** (most likely → least likely):
1. **`supabase` singleton is null in this route's bundle context** → handler exits early at `if (!supabase) return null;`
2. Next.js Turbopack bundling difference between `findResponse.ts` (works elsewhere via webhook) and `route.ts` (doesn't work here)
3. Edge runtime vs Node runtime mismatch (less likely — `/api/chat` is `ƒ` dynamic = Node)

## 🔧 Recommended Next Steps (separate session)

1. **Add explicit `null` log:** `if (!supabase) { logger.error('supabase=null in route'); return null; }`
2. **Try eager client creation:** in handler, don't use singleton — call `createClient()` directly with env vars
3. **Strip dependency on lib/supabase.ts:** make handler self-contained
4. **Test on `/api/cron/pdppl-cleanup`** which already creates own client — copy pattern

## 📊 Production Impact

**ZERO regressions.** The handler is fail-safe — when it returns null (always, currently), the existing static path runs. Production behaves identically to pre-Phase-3.

## 📦 Commits in This Phase

```
899a0d3 feat(etl) Phase 1+2 — JSON → Supabase migrated
ffd8249 feat(db-first) Phase 3 — list queries from Supabase (findResponse path)
fd10280 fix(chat-api) wire DB list handler into /api/chat
bc111d7 debug(chat-api) add logs to trace DB handler invocation
```

## 🎯 Honest Score

| Phase | Score |
|---|---|
| Phase 1 (ETL script) | 10/10 ✅ |
| Phase 2 (Supabase populated) | 10/10 ✅ |
| Phase 3 (App reads from DB) | **3/10** — code in place but not active in prod |
| Phase 4 (CI auto-sync scaffold) | 8/10 ✅ |
| Phase 5 (vector search) | 0/10 (not started) |
| **Overall DEC-AI-001** | **6.2/10** |

## 💡 Pragmatic Truth

The **JSON-based path still works** as it has for months. We invested in DB infrastructure (Phase 1+2) which is now ready for future features. Phase 3 needs a debug session to land — not blocking anything immediate.

For now: **the platform serves users correctly via the existing JSON path**. DB is hot and ready when we debug Phase 3.

---

**Author:** AzkiaOS
**Auditor:** Sufyan Mesyef (CEO) — pending review
