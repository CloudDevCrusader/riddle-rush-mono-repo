---
inclusion: always
---

# Riddle Rush Design System - Figma Integration Guide

This document defines the design system rules for integrating Figma designs into the Riddle Rush codebase.

## Project Overview

**Tech Stack:**

- Framework: Nuxt 4 (Vue 3 + TypeScript)
- Styling: UnoCSS + SCSS (design-system.scss)
- State Management: Pinia
- Build Tool: Vite
- Package Manager: pnpm (monorepo with Turbo)

**Project Type:** Client-side SPA (PWA) - multiplayer party game

---

## 1. Design Token Definitions

### Location

Design tokens are defined in `apps/game/assets/scss/design-system.scss`

### Token Structure

**Colors** (CSS Custom Properties):

```scss
--color-bg-blue-light: #1cc6ff --color-bg-blue-mid: #0b7ad6 --color-bg-blue-dark: #0a4cc7
  --color-btn-green-light: #b7ff6d --color-btn-green-dark: #5fc423 --color-btn-orange-light: #ffb84d
  --color-text-yellow: #ffd54f --color-text-dark: #0b3b76;
```

**Spacing** (Fluid, responsive):

```scss
--spacing-xs: clamp(...) // 10px base
  --spacing-sm: clamp(...) // 16px base
  --spacing-md: clamp(...) // 24px base
  --spacing-lg: clamp(...); // 36px base
```

**Typography** (Fluid scale):

```scss
--font-size-xs: clamp(12px, ..., 14px) --font-size-base: clamp(16px, ..., 18px)
  --font-size-xl: clamp(22px, ..., 28px) --font-display: clamp(48px, ..., 72px);
```

**Border Radius**:

```scss
--radius-sm: clamp(8px, ...) --radius-md: clamp(12px, ...) --radius-lg: clamp(20px, ...);
```

---

## 2. Component Library

### Location

Components are in `apps/game/components/`

### Structure

```
components/
├── Base/           # Reusable base components
├── game/           # Game-specific components
├── layout/         # Layout components
└── *.vue           # Shared components
```

### Component Architecture

- **Composition API** with `<script setup>`
- **TypeScript** for type safety
- **Auto-imports** via unplugin-auto-import
- **Composables** for logic reuse (in `composables/`)

### Example Component Pattern

```vue
<script setup lang="ts">
import { useGameState } from '~/composables/useGameState'

const { currentRound } = useGameState()
</script>

<template>
  <div class="card">
    <h2 class="title-md text-embossed-gold">Round {{ currentRound }}</h2>
  </div>
</template>

<style scoped lang="scss">
.card {
  background: var(--bg-gradient-panel);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}
</style>
```

---

## 3. Frameworks & Libraries

### UI Framework

- **Nuxt 4** (Vue 3 with Composition API)
- **TypeScript** strict mode enabled

### Styling

- **UnoCSS** - Tailwind-compatible utility classes
- **SCSS** - Design system tokens and mixins
- **@vueuse/motion** - Animations

### Key Dependencies

```json
{
  "@pinia/nuxt": "State management",
  "@nuxtjs/i18n": "Internationalization",
  "@unocss/nuxt": "Utility-first CSS",
  "@vite-pwa/nuxt": "PWA support",
  "@vueuse/nuxt": "Vue composables",
  "lodash-es": "Utilities (tree-shaken)"
}
```

### Build System

- **Vite** - Fast HMR and optimized builds
- **Turbo** - Monorepo task orchestration
- **pnpm** - Fast, disk-efficient package manager

---

## 4. Asset Management

### Location

- Images: `apps/game/public/assets/`
- SCSS: `apps/game/assets/scss/`
- Data: `apps/game/public/data/`

### Image Optimization

- **@nuxt/image** with IPX provider
- Formats: WebP, AVIF (automatic)
- Lazy loading enabled by default
- Responsive images with srcset

### Presets

```typescript
{
  avatar: { width: 100, height: 100, format: 'webp', quality: 75 },
  icon: { width: 64, height: 64, format: 'webp', quality: 80 },
  hero: { width: 1200, format: 'webp', quality: 75 },
  lqip: { width: 20, quality: 20, blur: 5 }
}
```

### Usage

```vue
<NuxtImg src="/assets/logo.png" preset="icon" loading="lazy" alt="Logo" />
```

---

## 5. Icon System

### Location

Icons are stored in `apps/game/public/assets/icons/`

### Format

- SVG (preferred for scalability)
- PNG for raster icons (with @2x, @3x variants)

### Usage Pattern

```vue
<template>
  <img src="/assets/icons/star.svg" alt="Star" class="icon" />
</template>

<style scoped>
.icon {
  width: var(--spacing-lg);
  height: var(--spacing-lg);
}
</style>
```

### Icon Components

Create reusable icon components in `components/Base/Icon*.vue`

---

## 6. Styling Approach

### CSS Methodology

**Hybrid approach:**

1. **UnoCSS utilities** for layout and spacing
2. **SCSS tokens** for colors, typography, effects
3. **Scoped styles** for component-specific styling

### Example

```vue
<template>
  <!-- UnoCSS utilities for layout -->
  <div class="flex flex-col items-center gap-md p-lg">
    <!-- SCSS class for styled button -->
    <button class="btn btn-primary">Play Game</button>
  </div>
</template>

<style scoped lang="scss">
// Component-specific styles using design tokens
.btn {
  background: var(--bg-gradient-success);
  color: var(--color-text-dark);
  border-radius: var(--radius-lg);
}
</style>
```

### Global Styles

- Base styles in `design-system.scss`
- Component styles are scoped
- Utility classes from UnoCSS

### Responsive Design

```scss
// Mobile-first approach
@include mobile {
  // max-width: 768px
}

@include tablet {
  // 769px - 1024px
}

@include desktop {
  // min-width: 1025px
}
```

---

## 7. Project Structure

### Monorepo Organization

```
riddle-rush-mono-repo/
├── apps/
│   ├── game/              # Main Nuxt app
│   ├── docs/              # Documentation
│   └── mobile/            # Capacitor mobile app
├── packages/
│   ├── config/            # Shared configs
│   ├── shared/            # Shared utilities
│   └── types/             # Shared TypeScript types
├── infrastructure/        # AWS/Terraform
└── tools/                 # Development tools
```

### Game App Structure

```
apps/game/
├── assets/
│   └── scss/
│       └── design-system.scss
├── components/
│   ├── Base/
│   ├── game/
│   └── layout/
├── composables/           # Vue composables
├── layouts/               # Nuxt layouts
├── pages/                 # Nuxt pages (auto-routing)
├── plugins/               # Nuxt plugins
├── public/                # Static assets
├── stores/                # Pinia stores
├── translations/          # i18n files
├── utils/                 # Utility functions
├── nuxt.config.ts         # Nuxt configuration
└── uno.config.ts          # UnoCSS configuration
```

---

## 8. Figma to Code Workflow

### Step 1: Extract Design Tokens

When receiving Figma designs, map Figma variables to SCSS tokens:

**Figma → SCSS Mapping:**

- Colors → `$colors` map in design-system.scss
- Spacing → `$spacing` map (use fluid clamp values)
- Typography → `$font-sizes` and `$font-weights`
- Border Radius → `$radius` map
- Shadows → `$shadows` map

### Step 2: Component Translation

**DO NOT copy Tailwind classes directly from Figma output.**

Instead:

1. Identify the component type (button, card, modal, etc.)
2. Use existing design system classes
3. Create new SCSS mixins if needed
4. Use UnoCSS utilities for layout only

### Step 3: Replace Tailwind with Design System

**❌ Bad (Direct Figma output):**

```vue
<button class="bg-green-500 text-white px-4 py-2 rounded-lg">
  Click me
</button>
```

**✅ Good (Design system):**

```vue
<button class="btn btn-primary">
  Click me
</button>
```

### Step 4: Reuse Existing Components

Before creating new components, check:

- `components/Base/` for base components
- `components/game/` for game-specific components
- Existing buttons, cards, modals, etc.

### Step 5: Maintain Visual Parity

- Compare final UI with Figma screenshot
- Adjust spacing/sizing minimally
- Prefer design tokens over hardcoded values
- Test on mobile (320px) and desktop (1920px)

---

## 9. Design System Tokens Reference

### Color System

**Background Gradients:**

- `--bg-gradient-main` - Main app background (blue radial)
- `--bg-gradient-panel` - Card/panel gradient (white to cream)

**Button Colors:**

- Green: `--color-btn-green-light`, `--color-btn-green-dark`
- Blue: `--color-btn-blue-light`, `--color-btn-blue-dark`
- Orange: `--color-btn-orange-light`, `--color-btn-orange-dark`
- Red: `--color-btn-red-light`, `--color-btn-red-dark`

**Text Colors:**

- `--color-text-yellow` (#ffd54f) - Titles, emphasis
- `--color-text-dark` (#0b3b76) - Body text on light backgrounds
- `--color-text-white` (#ffffff) - Text on dark backgrounds

### Typography Scale

```
xs:      12px → 14px (fluid)
sm:      14px → 16px
base:    16px → 18px
lg:      18px → 22px
xl:      22px → 28px
2xl:     28px → 36px
3xl:     36px → 48px
4xl:     44px → 64px
display: 48px → 72px
```

### Spacing Scale

```
xs:  10px (fluid)
sm:  16px
md:  24px
lg:  36px
xl:  48px
2xl: 72px
3xl: 96px
```

### Effects

**Text Shadows:**

- `text-embossed-gold` - 3D gold effect for titles
- `text-embossed-white` - Subtle emboss for buttons
- `text-glow-gold` - Glowing emphasis text

**Box Shadows:**

- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- All shadows use fluid clamp() for responsive sizing

---

## 10. Component Patterns

### Button Pattern

```vue
<template>
  <button class="btn" :class="[variant, size]" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'default' | 'large'
  disabled?: boolean
}>()
</script>

<style scoped lang="scss">
.btn {
  @include touch-target(60px);
  font-family: var(--font-display);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);

  &.primary {
    background: var(--bg-gradient-success);
    color: var(--color-text-dark);
  }
}
</style>
```

### Card Pattern

```vue
<template>
  <div class="card" :class="{ 'card-gradient': gradient }">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.card {
  background: var(--bg-gradient-panel);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 3px solid rgba(255, 255, 255, 0.65);
}
</style>
```

---

## 11. Accessibility & Touch Targets

### Minimum Touch Target

All interactive elements must be at least **44px × 44px** (iOS) or **48px × 48px** (Android).

Use the mixin:

```scss
@include touch-target(60px);
```

### Focus States

```scss
.btn:focus-visible {
  outline: 2px solid var(--color-text-yellow);
  outline-offset: 2px;
}
```

### Color Contrast

- Text on light backgrounds: Use `--color-text-dark` (#0b3b76)
- Text on dark backgrounds: Use `--color-text-white` (#ffffff)
- Ensure WCAG AA compliance (4.5:1 for normal text)

---

## 12. Animation Guidelines

### Motion Presets

Available via `@vueuse/motion`:

```vue
<div v-motion-pop-bottom>Animates in</div>
<div v-motion-slide-left>Slides from left</div>
<div v-motion-fade>Fades in</div>
```

### Custom Animations

```scss
.animate-bounce {
  animation: bounce 1s infinite;
}

.animate-pulse {
  animation: pulse 2s infinite;
}
```

### Transition Timing

```scss
--transition-fast: 140ms cubic-bezier(0.4, 0, 0.2, 1) --transition-base: 220ms
  cubic-bezier(0.4, 0, 0.2, 1) --transition-slow: 320ms cubic-bezier(0.4, 0, 0.2, 1)
  --transition-bounce: 520ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 13. Internationalization (i18n)

### Translation Files

Located in `apps/game/translations/locales/`

### Usage

```vue
<script setup>
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('game.title') }}</h1>
</template>
```

### Supported Locales

- English (en)
- German (de) - default

---

## 14. State Management

### Pinia Stores

Located in `apps/game/stores/`

### Usage

```typescript
// stores/game.ts
export const useGameStore = defineStore('game', () => {
  const currentRound = ref(1)

  return { currentRound }
})

// In component
const gameStore = useGameStore()
```

---

## 15. Figma MCP Integration Guidelines

### When Converting Figma Designs:

1. **Treat Figma output as design reference, not final code**
2. **Replace Tailwind utilities with design system tokens**
3. **Reuse existing components** before creating new ones
4. **Use SCSS tokens** for colors, spacing, typography
5. **Use UnoCSS utilities** for layout (flex, grid, gap)
6. **Maintain 1:1 visual parity** with Figma screenshot
7. **Test responsiveness** (320px to 1920px)
8. **Validate accessibility** (touch targets, contrast, focus states)

### Code Style Preferences:

- **Composition API** with `<script setup>`
- **TypeScript** for type safety
- **Scoped styles** with SCSS
- **Auto-imports** (no manual imports for composables/components)
- **Fluid typography** (clamp values, not fixed px)
- **Mobile-first** responsive design

---

## 16. Quality Checklist

Before committing Figma-generated code:

- [ ] Replaced Tailwind classes with design system tokens
- [ ] Reused existing components where possible
- [ ] Used SCSS variables instead of hardcoded values
- [ ] Tested on mobile (320px) and desktop (1920px)
- [ ] Verified touch targets are ≥44px
- [ ] Checked color contrast (WCAG AA)
- [ ] Added proper TypeScript types
- [ ] Ran `pnpm run typecheck` and `pnpm run lint`
- [ ] Visual parity with Figma design confirmed
- [ ] Animations are smooth and performant

---

## 17. Common Patterns

### Layout Pattern

```vue
<template>
  <!-- UnoCSS for layout -->
  <div class="flex flex-col items-center gap-lg p-xl">
    <!-- Design system components -->
    <h1 class="title-display text-embossed-gold">
      {{ t('game.title') }}
    </h1>
    <button class="btn btn-primary btn-large">
      {{ t('game.start') }}
    </button>
  </div>
</template>
```

### Responsive Image Pattern

```vue
<NuxtImg
  src="/assets/hero.jpg"
  preset="hero"
  sizes="sm:100vw md:80vw lg:1200px"
  loading="lazy"
  alt="Hero image"
/>
```

### Modal Pattern

```vue
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content card" @click.stop>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}
</style>
```

---

## Summary

**Key Principles:**

1. Use design system tokens, not hardcoded values
2. Reuse existing components
3. UnoCSS for layout, SCSS for styling
4. Mobile-first, responsive design
5. Maintain visual parity with Figma
6. Prioritize accessibility and performance

**Content was rephrased for compliance with licensing restrictions.**
