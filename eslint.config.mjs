import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
})
  .append({
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  })
  .append({
    files: ['**/tests/**/*.ts', '**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
    },
  })
  .append({
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  })
  .append({
    ignores: [
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      'node_modules/',
      '.nuxt/',
      '.output/',
      'dist/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '*.min.js',
      'scripts/',
      '.claude/',
      '.opencode/',
      '.planning/',
      '.zenflow/',
      'openspec/',
      'android/',
=======
=======
>>>>>>> Stashed changes
      '**/node_modules/',
      '**/.nuxt/',
      '**/.output/',
      '**/dist/',
      '**/coverage/',
      '**/playwright-report/',
      '**/playwright-report-simple/',
      '**/test-results/',
      '**/.features-gen/',
      '**/*.min.js',
      '**/scripts/',
      '**/.claude/',
      '**/.agents/',
      '**/.agent/',
      '**/.opencode/',
      '**/.planning/',
      '**/.zenflow/',
      '**/.yoyo/',
      '**/openspec/',
      '**/android/',
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    ],
  })
