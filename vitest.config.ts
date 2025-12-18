import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath, URL } from 'node:url'

export default defineVitestConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        overrides: {
          modules: ['@pinia/nuxt'],
          i18n: { locales: [] },
        },
      },
    },
    include: ['tests/unit/**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.nuxt', '.output', 'tests/e2e'],
  },
})
