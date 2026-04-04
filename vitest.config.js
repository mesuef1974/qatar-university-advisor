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
      ],
      // QA-A1: Sprint 1 — threshold 70% (الهدف النهائي 80%)
      thresholds: {
        lines:      70,
        functions:  70,
        branches:   70,
        statements: 70,
      },
    },
  },
});
