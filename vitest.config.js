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
      ],
      // TODO: QA-001 (المرحلة ج) — رفع تدريجياً إلى 80%
      thresholds: {
        lines:      30,
        functions:  30,
        branches:   30,
        statements: 30,
      },
    },
  },
});
