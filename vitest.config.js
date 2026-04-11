import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['lib/**/*.js', 'api/**/*.js'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.config.*',
        'src/**',
        'lib/data/**',           // Static data files (universities DB)
        'lib/responses.js',      // Large static responses (Sprint 2: refactor)
        'lib/responses-extended.js', // Large static responses (Sprint 2: refactor)
        'lib/responses/**',      // Static response data modules (Sprint 2: refactor)
      ],
      // QA-A1: Sprint 1 — threshold 50% (measured baseline; target raised each sprint)
      thresholds: {
        lines:      50,
        functions:  60,
        branches:   45,
        statements: 50,
      },
    },
  },
});
