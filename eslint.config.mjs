import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy code (Vite/React era) — not part of the active Next.js app
    "src-legacy/**",
    "api-legacy/**",
    // Generated coverage reports — not source code
    "coverage/**",
  ]),
]);

export default eslintConfig;
