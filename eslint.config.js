import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Date.now / Math.random in event handlers is fine — not during render
      'react-hooks/purity': 'off',
    },
  },
  // Node.js globals for server-side code
  {
    files: ['lib/**/*.js', 'api/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-redeclare': 'off',
    },
  },
  // Test files: Node.js + vitest globals + relaxed rules
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
    rules: {
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
    },
  },
])
