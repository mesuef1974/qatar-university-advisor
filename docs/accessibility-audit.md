# Accessibility Audit Report — WCAG 2.2 AA
## Qatar University Advisor

**Audit Date:** _[INSERT DATE]_
**Auditor:** _[INSERT NAME / TEAM]_
**Target Compliance:** WCAG 2.2 Level AA

---

## 1. Executive Summary

This document is the accessibility audit report for the Qatar University Advisor application. It covers implemented features, test results, known gaps, and recommendations for ongoing compliance.

---

## 2. Implemented Accessibility Features

The following WCAG 2.2 AA requirements have been addressed:

| Feature | WCAG Criterion | Status |
|---------|---------------|--------|
| `lang="ar" dir="rtl"` on HTML | 3.1.1 Language of Page | Pass |
| Skip Navigation Link | 2.4.1 Bypass Blocks | Pass |
| Focus Visible styles (3px outline) | 2.4.7 Focus Visible | Pass |
| Screen Reader announcements | 4.1.3 Status Messages | Pass |
| Reduced Motion support (`prefers-reduced-motion`) | 2.3.3 Animation from Interactions | Pass |
| Touch targets 44x44px minimum | 2.5.8 Target Size (Minimum) | Pass |
| `aria-label` on icon buttons | 4.1.2 Name, Role, Value | Pass |
| `aria-live` for new chat messages | 4.1.3 Status Messages | Pass |
| `role="main"` on content area | 1.3.1 Info and Relationships | Pass |

---

## 3. Test Results

### 3.1 Lighthouse Accessibility Score

| Metric | Score |
|--------|-------|
| Lighthouse Accessibility | _[PLACEHOLDER: run `npx lighthouse YOUR_URL --only-categories=accessibility` and record score here]_ |
| Target | 90+ |

> **How to run:** In Chrome DevTools > Lighthouse tab, check "Accessibility" and run the audit. Record the score above.

### 3.2 Contrast Ratios

| Element | Foreground | Background | Ratio | Minimum Required | Status |
|---------|-----------|------------|-------|-----------------|--------|
| Body text | _#333333_ | _#FFFFFF_ | _12.63:1_ | 4.5:1 (AA normal text) | Pass |
| Chat bubble (user) | _[INSERT]_ | _[INSERT]_ | _[INSERT]_ | 4.5:1 | _[TEST]_ |
| Chat bubble (bot) | _[INSERT]_ | _[INSERT]_ | _[INSERT]_ | 4.5:1 | _[TEST]_ |
| Primary button text | _[INSERT]_ | _[INSERT]_ | _[INSERT]_ | 4.5:1 | _[TEST]_ |
| Link text | _[INSERT]_ | _[INSERT]_ | _[INSERT]_ | 4.5:1 | _[TEST]_ |
| Placeholder text | _[INSERT]_ | _[INSERT]_ | _[INSERT]_ | 4.5:1 | _[TEST]_ |
| Large headings (18px+) | _[INSERT]_ | _[INSERT]_ | _[INSERT]_ | 3:1 (AA large text) | _[TEST]_ |

> **Tool:** Use Chrome DevTools color picker or https://webaim.org/resources/contrastchecker/ to verify each ratio.

### 3.3 Keyboard Navigation Test Results

| Test Case | Expected Behavior | Result |
|-----------|-------------------|--------|
| Tab through all interactive elements | Focus moves in logical order (top to bottom, right to left for RTL) | _[PASS/FAIL]_ |
| Skip Navigation link | First Tab press reveals skip link; Enter jumps to main content | _[PASS/FAIL]_ |
| Chat input focus | Input receives focus after page load | _[PASS/FAIL]_ |
| Send message with Enter | Pressing Enter submits the message | _[PASS/FAIL]_ |
| Escape closes modals/overlays | Pressing Escape dismisses any open modal | _[PASS/FAIL]_ |
| No keyboard traps | Tab never gets stuck in a component | _[PASS/FAIL]_ |
| Focus returns after modal close | Focus returns to the triggering element | _[PASS/FAIL]_ |
| Focus visible on all elements | All focused elements show 3px outline | _[PASS/FAIL]_ |

---

## 4. Known Gaps / Issues

| ID | Issue | Severity | WCAG Criterion | Status |
|----|-------|----------|---------------|--------|
| A11Y-001 | _[Example: Chat history not announced to screen readers on load]_ | Medium | 4.1.3 | Open |
| A11Y-002 | _[Example: Color-only status indicators without text alternative]_ | High | 1.4.1 | Open |
| A11Y-003 | _[Add discovered issues here]_ | _[H/M/L]_ | _[criterion]_ | Open |

> **Instructions:** Fill this table during each audit pass. Track issues to resolution.

---

## 5. Recommendations

### 5.1 Automated axe-core Integration in CI

Add `axe-core` to your CI pipeline to catch regressions automatically:

```bash
npm install --save-dev @axe-core/cli
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "test:a11y": "axe http://localhost:3000 --exit"
  }
}
```

For integration with a test framework (recommended):
```bash
npm install --save-dev axe-core @axe-core/playwright
```

Example Playwright a11y test (`tests/accessibility.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();

  expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
});
```

Add to your CI workflow (GitHub Actions):
```yaml
- name: Run accessibility tests
  run: npx playwright test tests/accessibility.spec.ts
```

### 5.2 Screen Reader Testing

Manual testing with NVDA (Windows) or VoiceOver (macOS) should be performed at least once per release. Key flows to test:
- Starting a new conversation
- Receiving a bot response
- Navigating between suggested majors/colleges

### 5.3 Ongoing Audit Cadence

- **Every PR:** Automated axe-core checks in CI
- **Every sprint:** Manual keyboard navigation walkthrough
- **Quarterly:** Full audit with screen reader and contrast review

---

## 6. Applicable Standards

- **WCAG 2.2 Level A + AA** -- primary compliance target
- ~~EN 301 549 (European Accessibility Standard)~~ -- **Not applicable.** EN 301 549 is the European standard for ICT accessibility. For Qatar, there is no equivalent national ICT accessibility regulation at this time. WCAG 2.2 AA remains the appropriate international benchmark.

---

## 7. Testing Tools Reference

| Tool | Purpose |
|------|---------|
| Lighthouse (Chrome DevTools) | Automated accessibility scoring |
| axe DevTools (browser extension) | In-browser accessibility analysis |
| axe-core (npm) | CI-integrated automated testing |
| NVDA / JAWS | Screen reader testing (Windows) |
| VoiceOver | Screen reader testing (macOS/iOS) |
| WebAIM Contrast Checker | Color contrast ratio verification |
| Keyboard only (no mouse) | Keyboard navigation testing |
