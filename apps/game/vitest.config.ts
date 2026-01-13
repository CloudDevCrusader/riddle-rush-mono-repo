import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    pool: 'forks', // Use forks to avoid --localstorage-file warning with happy-dom
    setupFiles: ['tests/unit/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.ts'],
    exclude: ['node_modules', '.nuxt', '.output', 'tests/e2e'],
    coverage: {
      enabled: false, // Disabled due to version conflicts
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'cobertura'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '.nuxt/',
        '.output/',
        '**/*.config.ts',
        '**/types.ts',
      ],
      all: true,
      skipFull: false,
    },
  },
})
