// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  {
    ignores: [
      'playwright-report/**',
      'playwright-report-simple/**',
      'test-results/**',
      '.features-gen/**',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/quote-props': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/space-before-blocks': 'off',
      '@stylistic/space-infix-ops': 'off',
      '@stylistic/type-annotation-spacing': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@stylistic/indent-binary-ops': 'off',
      'vue/html-button-has-type': 'off',
      'vue/attributes-order': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/attribute-hyphenation': 'off',
      '@stylistic/ts/member-delimiter-style': 'off',
    },
  },
])
