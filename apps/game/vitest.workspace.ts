import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Unit tests - run in Node environment
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['tests/unit/**/*.{test,spec}.ts'],
      environment: 'happy-dom',
      globals: true,
    },
  },
])
