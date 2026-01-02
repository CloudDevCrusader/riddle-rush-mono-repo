import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: {
      semi: false,
      quotes: 'single',
      indent: 2,
      commaDangle: 'always-multiline',
      braceStyle: '1tbs',
      arrowParens: true,
      quoteProps: 'as-needed',
    },
  },
})
  .append({
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  })
  .append({
    files: ['tests/**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  })
  .append({
    ignores: [
      'node_modules/',
      '.nuxt/',
      '.output/',
      'dist/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '*.min.js',
    ],
  })
