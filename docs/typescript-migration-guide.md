# TypeScript Migration Guide -- Qatar University Advisor

| Field          | Value                                       |
|----------------|---------------------------------------------|
| Purpose        | Step-by-step plan for migrating the codebase from JavaScript to TypeScript |
| Current status | Phase 1 -- allowJs coexistence              |
| Last updated   | 2026-04-04                                  |

---

## 1. Migration Strategy: Incremental (allowJs to strict)

We adopt an **incremental** migration rather than a big-bang rewrite for three
reasons:

1. **Zero downtime** -- The production bot keeps shipping features while
   migration runs in parallel. No feature freeze required.
2. **Risk containment** -- Each file is converted, reviewed, and tested
   independently. A regression is scoped to one module, not the entire app.
3. **Learning curve** -- Team members adopt TypeScript patterns gradually
   instead of facing 40+ compiler errors across every file on day one.

The journey moves through five phases:

```
allowJs: true  -->  checkJs: true  -->  .js->.ts  -->  strict: true  -->  allowJs: false
```

---

## 2. Current State Assessment

### Already completed

| Asset                   | Path                    | Notes                                      |
|-------------------------|-------------------------|--------------------------------------------|
| Compiler configuration  | `tsconfig.json`         | `allowJs: true`, `checkJs: false`, path aliases configured |
| Core type definitions   | `types/index.ts`        | UserProfile, University, ConversationStage, BotResponse, SanitizeResult, RateLimitResult, CircuitBreakerStatus, AdminDashboard |
| Environment declarations| `types/environment.d.ts`| Typed `process.env` for Supabase, Gemini, WhatsApp, Admin, Redis |
| Type-check script       | `package.json`          | `npm run type-check` runs `tsc --noEmit`   |

### Remaining -- JavaScript files that need conversion

**API layer (3 files)**

- `api/webhook.js` -- WhatsApp webhook handler (highest traffic)
- `api/admin.js` -- Admin dashboard API
- `api/cron-pdppl-cleanup.js` -- Scheduled data cleanup

**Core library (17 files)**

- `lib/ai-handler.js` -- Gemini AI integration
- `lib/circuit-breaker.js` -- Circuit breaker pattern
- `lib/sanitizer.js` -- Input sanitization and injection detection
- `lib/rate-limiter.js` -- Rate limiting (Redis + in-memory)
- `lib/supabase.js` -- Database client
- `lib/whatsapp.js` -- WhatsApp Cloud API wrapper
- `lib/user-profiler.js` -- User profile extraction
- `lib/conversation-state.js` -- Conversation stage machine
- `lib/knowledge-base.js` -- University knowledge retrieval
- `lib/semantic-search.js` -- Semantic search over programs
- `lib/findResponse.js` -- Response matching engine
- `lib/responses.js` -- Static response map
- `lib/responses-extended.js` -- Extended responses
- `lib/nationality-advisor.js` -- Nationality-specific advice
- `lib/security-headers.js` -- HTTP security headers
- `lib/responses/*.js` -- Sub-modules (universities, admissions, scholarships, majors, response-formatter, index)
- `lib/data/universities-2026.js` -- University dataset

**Frontend (18 files)**

- `src/main.jsx`
- `src/App.jsx`
- `src/QatarUniversityAdvisor.jsx`
- `src/components/*.jsx` (13 component files)
- `src/hooks/useChat.js`, `src/hooks/useAccessibility.js`
- `src/styles/theme.js`
- `src/utils/generatePDF.js`
- `src/pages/AdminDashboard.jsx`, `src/pages/PrivacyPolicy.jsx`, `src/pages/TermsOfService.jsx`

**Tests (14 files)**

- `tests/webhook.test.js`, `tests/findResponse.test.js`
- `tests/integration/*.test.js` (3 files)
- `tests/unit/*.test.js` (3 files)
- `tests/e2e/*.spec.js` (5 files)
- `tests/e2e/helpers/test-utils.js`

---

## 3. tsconfig.json Configuration

The current configuration with explanation of every option:

```jsonc
{
  "compilerOptions": {
    // -- Emit & target --
    "target": "ES2022",              // Match Node 18+ / modern browsers
    "module": "ESNext",              // Vercel + Vite use ESM
    "moduleResolution": "bundler",   // Vite/esbuild resolution algorithm
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",             // React 17+ JSX transform

    // -- Migration knobs (change per phase) --
    "allowJs": true,                 // Phase 1: let .js and .ts coexist
    "checkJs": false,                // Phase 2: flip to true to surface errors in .js files
    "strict": false,                 // Phase 4: flip to true for full strictness
    "strictNullChecks": true,        // Already enabled -- catches null/undefined bugs early

    // -- Safety --
    "noEmit": true,                  // Vite handles emit; tsc is only a checker
    "isolatedModules": true,         // Required by Vite/esbuild (no cross-file const enums)
    "esModuleInterop": true,         // CommonJS interop for libraries like express
    "skipLibCheck": true,            // Faster checks; avoids conflicts in node_modules
    "resolveJsonModule": true,       // Import JSON files (university data, package.json)

    // -- Path aliases --
    "baseUrl": ".",
    "paths": {
      "@lib/*": ["lib/*"],
      "@api/*": ["api/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": [
    "src/**/*",
    "lib/**/*.ts",
    "api/**/*.ts",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "lib/**/*.js",                   // Phase 5: remove these two lines
    "api/**/*.js"
  ]
}
```

---

## 4. Migration Phases

### Phase 1 -- allowJs coexistence (current)

- `allowJs: true`, `checkJs: false`
- New files are written in `.ts` / `.tsx`.
- Existing `.js` files are excluded from type checking.
- Shared types live in `types/index.ts` and are imported by new code.
- **Exit criteria**: All new features are written in TypeScript for one full
  sprint.

### Phase 2 -- Enable checkJs

- Flip `checkJs: true` in tsconfig.json.
- Remove `lib/**/*.js` and `api/**/*.js` from the `exclude` array; add them to
  `include` instead.
- Run `npm run type-check` and triage errors into three buckets:
  - **Quick fix** -- add a JSDoc `@type` or `@param` annotation.
  - **Convert now** -- file is small and self-contained; rename to `.ts`.
  - **Suppress** -- add `// @ts-ignore` with a TODO comment and a ticket number.
- **Exit criteria**: `npm run type-check` passes with zero errors.

### Phase 3 -- Convert high-priority files

- Rename `.js` to `.ts` (or `.jsx` to `.tsx`) one file at a time.
- Add explicit types to function signatures, replacing `any` with concrete
  interfaces from `types/index.ts`.
- Update imports across the codebase (Vite resolves `.ts` automatically, but
  verify).
- Follow the File Conversion Priority order below.
- **Exit criteria**: All Priority 1 and Priority 2 files are `.ts`.

### Phase 4 -- Enable strict mode

- Flip `strict: true` in tsconfig.json. This enables:
  - `strictNullChecks` (already on)
  - `strictFunctionTypes`
  - `strictBindCallApply`
  - `strictPropertyInitialization`
  - `noImplicitAny`
  - `noImplicitThis`
  - `alwaysStrict`
- Fix all new errors. Most will be `noImplicitAny` in function parameters.
- **Exit criteria**: `npm run type-check` passes under `strict: true`.

### Phase 5 -- Remove allowJs

- Flip `allowJs: false`.
- Remove any remaining `.js` files or convert them.
- Delete the `exclude` entries for `.js` files.
- The codebase is now fully TypeScript.
- **Exit criteria**: No `.js` source files remain outside `node_modules`.

---

## 5. File Conversion Priority

| Priority | Scope | Files | Reasoning |
|----------|-------|-------|-----------|
| P1 -- API layer | `api/webhook.js`, `api/admin.js`, `api/cron-pdppl-cleanup.js` | 3 | Request/response typing prevents runtime crashes in production endpoints. These are Vercel serverless functions; typed request handlers catch malformed payloads at compile time. |
| P2 -- Core lib | `lib/ai-handler.js`, `lib/circuit-breaker.js`, `lib/sanitizer.js`, `lib/rate-limiter.js`, `lib/supabase.js`, `lib/whatsapp.js`, `lib/user-profiler.js`, `lib/conversation-state.js` | 8 | Business logic with complex data flow. Type safety here prevents the most expensive bugs (wrong stage transitions, lost user profiles, malformed AI prompts). |
| P3 -- Knowledge & responses | `lib/knowledge-base.js`, `lib/semantic-search.js`, `lib/findResponse.js`, `lib/responses.js`, `lib/responses-extended.js`, `lib/nationality-advisor.js`, `lib/responses/*.js`, `lib/data/universities-2026.js` | 10 | Data-heavy modules. Typing the University and AdmissionRequirements interfaces catches schema drift when university data is updated. |
| P4 -- Frontend components | `src/components/*.jsx`, `src/pages/*.jsx`, `src/hooks/*.js`, `src/App.jsx`, `src/main.jsx` | 18 | React components benefit from typed props but are lower risk because they are client-side and caught by visual QA. |
| P5 -- Tests | `tests/**/*.js` | 14 | Tests run last because they need to import typed modules. Converting them also validates that exported types are correct. |

---

## 6. Conversion Patterns

### 6.1 Plain function to typed function

**Before (`lib/sanitizer.js`)**

```js
export function sanitize(input) {
  if (typeof input !== 'string') return { safe: false, sanitized: '', reason: 'invalid_input' };
  const cleaned = input.trim().slice(0, 2000);
  return { safe: true, sanitized: cleaned };
}
```

**After (`lib/sanitizer.ts`)**

```ts
import type { SanitizeResult } from '@types/index';

export function sanitize(input: unknown): SanitizeResult {
  if (typeof input !== 'string') {
    return { safe: false, sanitized: '', reason: 'invalid_input' };
  }
  const cleaned = input.trim().slice(0, 2000);
  return { safe: true, sanitized: cleaned };
}
```

### 6.2 Vercel serverless handler to typed handler

**Before (`api/webhook.js`)**

```js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send(req.query['hub.challenge']);
  }
  // ...
}
```

**After (`api/webhook.ts`)**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method === 'GET') {
    res.status(200).send(req.query['hub.challenge'] as string);
    return;
  }
  // ...
}
```

### 6.3 React component to typed component with Props interface

**Before (`src/components/ChatMessage.jsx`)**

```jsx
export default function ChatMessage({ message, isUser, timestamp }) {
  return (
    <div className={isUser ? 'user-msg' : 'bot-msg'}>
      <p>{message}</p>
      <span>{timestamp}</span>
    </div>
  );
}
```

**After (`src/components/ChatMessage.tsx`)**

```tsx
interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={isUser ? 'user-msg' : 'bot-msg'}>
      <p>{message}</p>
      <span>{timestamp}</span>
    </div>
  );
}
```

### 6.4 Environment variables -- typed process.env

With `types/environment.d.ts` already in place, access is type-safe:

```ts
// No cast needed -- TypeScript knows the shape
const apiKey: string = process.env.GEMINI_API_KEY;

// Optional vars require a check
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
if (redisUrl) {
  // redisUrl is narrowed to string here
  connectRedis(redisUrl);
}
```

---

## 7. Common Migration Pitfalls

### 7.1 Implicit any

When `noImplicitAny` is on (Phase 4), every function parameter needs an
explicit type. The most common offender is callback parameters:

```ts
// ERROR: Parameter 'item' implicitly has an 'any' type
universities.filter(item => item.type === 'public');

// FIX
universities.filter((item: University) => item.type === 'public');
```

### 7.2 null vs undefined

The codebase uses `null` for "no value set" and `undefined` for "not provided".
Keep this convention. With `strictNullChecks: true`, always narrow before use:

```ts
function getGPA(profile: UserProfile): number {
  if (profile.gpa === null) {
    throw new Error('GPA not set');
  }
  return profile.gpa; // narrowed to number
}
```

### 7.3 Dynamic imports

Vite uses dynamic `import()` for code splitting. TypeScript handles this, but
watch for:

```ts
// Correct -- TypeScript infers the module type
const { generatePDF } = await import('./utils/generatePDF');

// Incorrect -- loses types
const mod = await import('./utils/generatePDF' as any);
```

### 7.4 Third-party libraries without types

Install `@types/*` packages for libraries that do not ship their own types:

```bash
npm install -D @types/node
```

For libraries with no community types, create a declaration file:

```ts
// types/missing-lib.d.ts
declare module 'some-untyped-lib' {
  export function doThing(input: string): Promise<string>;
}
```

### 7.5 JSON imports

`universities-2026.js` exports a large data object. When converting to `.ts`,
you may want to keep it as `.json` and use `resolveJsonModule`:

```ts
import universities from './data/universities-2026.json';
// TypeScript infers the shape from the JSON structure
```

Or add `as const` for literal types when the data is static.

---

## 8. Build and CI Integration

### 8.1 npm scripts

Add these to `package.json`:

```jsonc
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "build": "npm run type-check && vite build"
  }
}
```

### 8.2 Pre-commit hook

Use `lint-staged` with Husky to run type checking before every commit:

```jsonc
// .husky/pre-commit
#!/usr/bin/env sh
npx lint-staged

// package.json (or .lintstagedrc)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "bash -c 'npm run type-check'"]
  }
}
```

Note: Running full `tsc --noEmit` in a pre-commit hook can be slow on large
codebases. An alternative is to run it only in CI and use `eslint` with
`@typescript-eslint/parser` locally for faster feedback.

### 8.3 CI pipeline

Add a type-check step to the GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run type-check
```

This job should run in parallel with lint and test jobs and must pass before
merge to `main`.

---

## 9. Verification Checklist (per file conversion)

Use this checklist every time a `.js` file is renamed to `.ts` (or `.jsx` to
`.tsx`):

```
[ ] File renamed from .js/.jsx to .ts/.tsx
[ ] All function parameters have explicit types (no implicit any)
[ ] Return types are annotated on exported functions
[ ] Interfaces from types/index.ts are used instead of inline object types
[ ] null and undefined are handled (no non-null assertions without justification)
[ ] No use of `as any` -- use `unknown` and narrow instead
[ ] Imports updated across all files that reference this module
[ ] npm run type-check passes with zero errors
[ ] npm run build passes (Vite can resolve the new .ts file)
[ ] Existing tests still pass (npm test)
[ ] New type-level tests added if the module exports complex generics
[ ] PR reviewed by at least one team member familiar with TypeScript
```

---

## 10. Quick Reference -- Key Commands

| Command                        | Purpose                                 |
|--------------------------------|-----------------------------------------|
| `npm run type-check`           | Run the TypeScript compiler in check-only mode |
| `npm run type-check:watch`     | Continuous type checking during development |
| `npx tsc --noEmit --strict`    | Preview what Phase 4 will look like     |
| `npx tsc --noEmit --checkJs`   | Preview what Phase 2 will look like     |

---

## Appendix: Migration Tracker

Track file-by-file progress here. Update status as files are converted.

| File | Status | Assignee | Notes |
|------|--------|----------|-------|
| `types/index.ts` | Done | -- | Core type definitions |
| `types/environment.d.ts` | Done | -- | Env var declarations |
| `api/webhook.js` | Pending | -- | P1 -- start here |
| `api/admin.js` | Pending | -- | P1 |
| `api/cron-pdppl-cleanup.js` | Pending | -- | P1 |
| `lib/ai-handler.js` | Pending | -- | P2 |
| `lib/circuit-breaker.js` | Pending | -- | P2 |
| `lib/sanitizer.js` | Pending | -- | P2 |
| `lib/rate-limiter.js` | Pending | -- | P2 |
| `lib/supabase.js` | Pending | -- | P2 |
| `lib/whatsapp.js` | Pending | -- | P2 |
| `lib/user-profiler.js` | Pending | -- | P2 |
| `lib/conversation-state.js` | Pending | -- | P2 |
| `lib/knowledge-base.js` | Pending | -- | P3 |
| `lib/semantic-search.js` | Pending | -- | P3 |
| `lib/findResponse.js` | Pending | -- | P3 |
| `src/App.jsx` | Pending | -- | P4 |
| `src/QatarUniversityAdvisor.jsx` | Pending | -- | P4 |
