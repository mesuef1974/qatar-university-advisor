# ADR-002 — Vite Coexistence with Next.js

**Status**: Accepted (interim)
**Date**: 2026-04-26
**Deciders**: CEO + Engineering
**Supersedes**: —
**Superseded by**: — (planned removal Sprint D)

## Context

The repository is primarily Next.js 16 (App Router) + Turbopack. However, `vite.config.js` still exists at the root and is referenced by an optional `jspdf` build path documented in ENG-002.

This was flagged in [SWOT-Analysis-2026-04-25.md](../SWOT-Analysis-2026-04-25.md) as W4 (architectural noise).

## Decision

**Keep `vite.config.js` for one more sprint** strictly to support the optional `jspdf` PDF export path. Remove it in Sprint D once the PDF export is migrated to a Next.js-native approach (e.g., `@react-pdf/renderer` or server-side puppeteer).

## Constraints

- `vite.config.js` MUST NOT be invoked by CI build path of the main app.
- Any developer touching it MUST link this ADR in the PR description.
- Any change here also requires updating `tsconfig.json` excludes if applicable.

## Alternatives Considered

1. **Remove now** — rejected: would break `jspdf` optional path mid-sprint without replacement.
2. **Migrate PDF export immediately** — rejected: not P0; PDPPL/RLS take precedence.
3. **Document and defer (chosen)** — eliminates ambiguity for new contributors; explicit removal date.

## Consequences

### Positive
- New contributors see explicit reasoning instead of unexplained config noise.
- Removal is calendared, not vague.

### Negative
- Two build configs coexist briefly.
- Risk of someone accidentally building via Vite — mitigated by CI only running Next.js build.

## Removal Plan

| Step | Owner | Target |
|---|---|---|
| Migrate jspdf to `@react-pdf/renderer` or server puppeteer | Engineering | Sprint D (≤ 2026-05-10) |
| Delete `vite.config.js` | Engineering | Same PR |
| Delete `vite.config.js` from `package.json` if referenced | Engineering | Same PR |
| Mark this ADR `Superseded` in a follow-up ADR-003 | Engineering | Same PR |

## References

- [ADR-001 — Architecture Baseline](ADR-001-architecture-baseline.md)
- [SWOT-Analysis-2026-04-25.md](../SWOT-Analysis-2026-04-25.md) (W4)
- [شيك-ليست-14](../../الأرشيف-المؤسسي/04_الجودة-والشيك-ليست/شيك-ليست-14-2026-04-26-تنفيذ-SWOT-v3.md) (D1)
