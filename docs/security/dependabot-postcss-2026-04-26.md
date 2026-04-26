# Security Triage — Dependabot Alert: postcss XSS

**Date**: 2026-04-26
**Severity (declared)**: Moderate (CVSS 6.1)
**Advisory**: [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) — PostCSS XSS via Unescaped `</style>`
**CWE**: CWE-79 (XSS)
**Affected version**: `postcss < 8.5.10`

## Detection Path

```
postcss < 8.5.10  (transitive)
  └─ next  (direct, current: 16.x)
       └─ effects: @sentry/nextjs, next-intl
```

## Proposed "Fix" by npm audit

```json
"fixAvailable": {
  "name": "next",
  "version": "9.3.3",
  "isSemVerMajor": true
}
```

**Verdict: ❌ REJECTED.** Downgrading `next@16 → next@9.3.3` would:
- Break the entire App Router architecture
- Lose React 19 compatibility
- Lose Turbopack
- Lose all post-9.x security patches (introducing far worse vulnerabilities)
- Make the app unbuildable

This is a known false-positive class in `npm audit` where the only suggested fix is destructive.

## Real Risk Analysis

The vulnerability requires:
1. User-controlled CSS being processed by PostCSS at **runtime** (not build time)
2. The output being rendered as HTML without sanitization

**In this project**:
- ✅ PostCSS runs at **build time only** (Tailwind processing)
- ✅ No user-controlled CSS is processed at runtime
- ✅ All user input passes through `sanitizeInput()` before rendering
- ✅ CSP headers strict (`Content-Security-Policy` whitelisted)

**Effective risk**: Negligible in this deployment.

## Mitigation Decision

| Option | Status |
|---|---|
| Downgrade Next.js | ❌ Rejected (destructive) |
| Manually pin `postcss@>=8.5.10` via `overrides` | 🟡 Possible (see below) |
| Wait for Next.js 16 patch release | ✅ **Chosen** |
| Disable Dependabot for this advisory | ❌ Don't suppress; track |

### Optional Workaround (if pressure mounts)

Add to `package.json`:
```json
"overrides": {
  "postcss": "^8.5.10"
}
```
**Risk**: may break Next.js's internal CSS pipeline. Test thoroughly. Not applied today.

## Action Items

- [ ] Monitor Next.js 16.x release notes weekly for postcss bump
- [ ] Re-run `npm audit` weekly until resolved
- [ ] If still open at 2026-05-31, apply the `overrides` workaround with QA gate

## Sign-off

**Decided by**: Security advisor (AzkiaOS) + Engineering
**Approved**: pending CEO ack in CEO-ACTIONS-NEEDED doc
**Next review**: 2026-05-03 (weekly)

## References

- npm audit output (2026-04-26): only postcss issue, all paths through `next`
- Next.js 16 changelog: https://github.com/vercel/next.js/releases
- CSP config: `next.config.ts`
