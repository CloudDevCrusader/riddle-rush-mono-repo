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
      '2xl': 'var(--radius-2xl)',
      full: 'var(--radius-full)',
    },

    // Map colors to design tokens
    colors: {
      'btn-green': {
        light: 'var(--color-btn-green-light)',
        dark: 'var(--color-btn-green-dark)',
        shadow: 'var(--color-btn-green-shadow)',
      },
      'btn-blue': {
        light: 'var(--color-btn-blue-light)',
        dark: 'var(--color-btn-blue-dark)',
        shadow: 'var(--color-btn-blue-shadow)',
      },
      'btn-orange': {
        light: 'var(--color-btn-orange-light)',
        dark: 'var(--color-btn-orange-dark)',
        shadow: 'var(--color-btn-orange-shadow)',
      },
      'btn-red': {
        light: 'var(--color-btn-red-light)',
        dark: 'var(--color-btn-red-dark)',
        shadow: 'var(--color-btn-red-shadow)',
      },
      'border-gold': 'var(--color-border-gold)',
      'border-orange': 'var(--color-border-orange)',
      'game-yellow': 'var(--color-text-yellow)',
      'game-dark': 'var(--color-text-dark)',
      'bg-blue': {
        light: 'var(--color-bg-blue-light)',
        mid: 'var(--color-bg-blue-mid)',
        dark: 'var(--color-bg-blue-dark)',
      },
    },

    // Map font families to design tokens
    fontFamily: {
      display: 'var(--font-display)',
      sans: 'var(--font-primary)',
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
    'text-game-yellow',
    'text-game-dark',
    'text-btn-green-light',
    'bg-btn-green-light',
    'border-border-gold',
  ],

  // Content paths for scanning
  content: {
    pipeline: {
      include: [/\.vue$/, /\.ts$/, /\.tsx$/],
    },
  },
})
