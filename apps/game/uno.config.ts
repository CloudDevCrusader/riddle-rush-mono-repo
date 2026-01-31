import { defineConfig, presetWind, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  // Tailwind-compatible utilities
  presets: [presetWind()],

  // Enable @apply and variant groups in Vue SFC styles
  transformers: [transformerDirectives(), transformerVariantGroup()],

  // Extend theme to consume SCSS CSS custom properties
  theme: {
    // Map spacing utilities to design-system.scss tokens
    spacing: {
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
      xl: 'var(--spacing-xl)',
      '2xl': 'var(--spacing-2xl)',
      '3xl': 'var(--spacing-3xl)',
    },

    // Map border radius to design tokens
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },

    // Container settings for game layout
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
  },

  // Safelist classes that may be used dynamically
  safelist: [
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'gap-md',
    'gap-lg',
    'p-md',
    'p-lg',
    'px-md',
    'py-md',
  ],

  // Content paths for scanning
  content: {
    pipeline: {
      include: [/\.vue$/, /\.ts$/, /\.tsx$/],
    },
  },
})
