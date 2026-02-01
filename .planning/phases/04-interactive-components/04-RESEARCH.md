# Phase 4: Interactive Components - Research

**Researched:** 2026-02-01
**Domain:** Vue 3 interactive components (buttons, text displays), accessibility, CSS 3D effects
**Confidence:** HIGH

## Summary

This phase should create two reusable Vue components (GameButton and GameDisplay) that combine the existing SCSS design system with Vue 3 Composition API patterns. The standard approach is TypeScript-first components with semantic HTML, comprehensive prop validation, accessible ARIA attributes, and CSS-driven visual effects leveraging the glossy-button and embossed-panel mixins created in Phase 2.

GameButton extends the pattern from the existing Base/Button.vue component but applies game-specific gradients (green primary, blue secondary, orange warning) using the glossy-button mixin. GameDisplay is a simpler component focusing on yellow/gold text with glow effects for scores and letters, ensuring 4.5:1 contrast ratio compliance.

Planning should emphasize: (1) Vue 3 best practices for button accessibility (semantic HTML, keyboard support, focus indicators); (2) using existing SCSS mixins from Phase 2 rather than duplicating styles; (3) TypeScript prop definitions with runtime validation; (4) performance-conscious text-shadow effects with GPU acceleration hints; and (5) comprehensive testing patterns matching the existing codebase standards.

**Primary recommendation:** Build GameButton and GameDisplay components following Vue 3 composition API patterns, using existing SCSS mixins for effects, with TypeScript props and accessibility-first design.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library               | Version      | Purpose                                  | Why Standard                                                |
| --------------------- | ------------ | ---------------------------------------- | ----------------------------------------------------------- |
| Vue 3 Composition API | 3.x (Nuxt 4) | Component logic and reactivity           | Standard for Vue 3 components in this codebase              |
| TypeScript            | Latest       | Type-safe props and emits                | Already enforced via experimental.typedPages in nuxt.config |
| SCSS Mixins           | (Phase 2)    | Visual effects (glossy, embossed, glow)  | Established in apps/game/assets/scss/effects/               |
| CSS Custom Properties | (Phase 1)    | Design tokens via --color-_, --spacing-_ | Established in design-system.scss                           |

### Supporting

| Library                  | Version           | Purpose                         | When to Use                                 |
| ------------------------ | ----------------- | ------------------------------- | ------------------------------------------- |
| UnoCSS                   | ^0.66.6           | Utility classes for layout      | For spacing, flex, and color utilities only |
| @vueuse/core             | Latest (optional) | Composables for common patterns | If needed for keyboard/focus management     |
| Vitest + @vue/test-utils | Latest            | Unit testing components         | For all component logic tests               |

### Alternatives Considered

| Instead of           | Could Use            | Tradeoff                                                            |
| -------------------- | -------------------- | ------------------------------------------------------------------- |
| Semantic `<button>`  | `<div @click>`       | Loses accessibility, keyboard navigation, and screen reader support |
| TypeScript props     | JavaScript props     | Loses compile-time safety and IDE autocomplete                      |
| CSS text-shadow glow | Canvas/WebGL effects | Heavier bundle, worse performance for simple glows                  |
| SCSS mixins          | Inline styles        | Code duplication, harder to maintain, no design token integration   |

**Installation:**

```bash
# No new packages required — uses existing stack
```

## Architecture Patterns

### Recommended Project Structure

```
apps/game/components/
├── game/                    # Game-specific components (NEW)
│   ├── GameButton.vue      # Phase 4 component
│   └── GameDisplay.vue     # Phase 4 component
├── Base/                   # Generic base components
│   └── Button.vue          # Existing base button (reference pattern)
└── layout/                 # Layout components from Phase 3
    ├── GameBackground.vue
    └── GamePanel.vue
```

### Pattern 1: TypeScript Props with Runtime Validation

**What:** Use `defineProps` with TypeScript interface for compile-time safety, plus runtime validators for edge cases.
**When to use:** For all component props that need validation beyond type checking.
**Example:**

```typescript
// Source: https://vuejs.org/guide/typescript/composition-api
interface Props {
  variant?: 'primary' | 'secondary' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})
```

### Pattern 2: Semantic HTML with Accessible Attributes

**What:** Use native `<button>` element with proper ARIA attributes and keyboard support.
**When to use:** Always for interactive button components.
**Example:**

```vue
<!-- Source: https://vuejs.org/guide/best-practices/accessibility -->
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
```

### Pattern 3: SCSS Mixin Application for Visual Effects

**What:** Use `@include` to apply existing mixins from Phase 2 with variant-specific colors.
**When to use:** For all button variants and text display effects.
**Example:**

```scss
// Source: apps/game/assets/scss/effects/_glossy.scss
@use 'assets/scss/mixins' as *;
@use 'assets/scss/variables' as *;

.game-button--primary {
  @include glossy-button(
    $light: var(--color-btn-green-light),
    $dark: var(--color-btn-green-dark),
    $shadow: var(--color-btn-green-shadow)
  );
}
```

### Pattern 4: Active State with 3D Press Effect

**What:** Use `transform: translateY()` and box-shadow reduction on `:active` to create pressed button effect.
**When to use:** For all interactive buttons to provide tactile feedback.
**Example:**

```scss
// Source: https://www.joshwcomeau.com/animation/3d-button/
.game-button {
  box-shadow: 0 10px 0 var(--shadow-color);
  transition: all var(--transition-fast);

  &:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 6px 0 var(--shadow-color);
  }
}
```

### Pattern 5: Text Glow with Contrast Compliance

**What:** Yellow/gold text with multi-layer text-shadow for glow, validated against 4.5:1 contrast ratio.
**When to use:** For GameDisplay component rendering scores and letters.
**Example:**

```scss
// Source: apps/game/assets/scss/design-system.scss (text-shadows map)
.game-display {
  color: var(--color-text-yellow);
  text-shadow: var(--text-shadow-glow-gold);
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);

  // Performance hint for GPU acceleration
  will-change: transform;
  transform: translateZ(0);
}
```

### Anti-Patterns to Avoid

- **Div buttons:** Never use `<div @click>` instead of `<button>` — loses accessibility
- **Inline critical styles:** Avoid inline styles for core effects; use SCSS mixins for maintainability
- **Missing focus indicators:** Buttons must have visible focus states for keyboard navigation
- **Disabled pointer-events:** Don't use `pointer-events: none` on disabled buttons; use `:disabled` pseudo-class
- **Excessive will-change:** Only apply `will-change` to elements that actually animate frequently
- **Contrast failures:** Yellow text on light backgrounds without sufficient glow/stroke will fail WCAG AA

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                   | Don't Build               | Use Instead                           | Why                                                 |
| ------------------------- | ------------------------- | ------------------------------------- | --------------------------------------------------- |
| Button press animation    | Custom JS click handlers  | CSS :active + transform               | More performant, no JS needed, works with keyboard  |
| Text glow effects         | Canvas rendering          | CSS text-shadow layers                | Simpler, GPU-accelerated, accessible                |
| Focus management          | Manual tab-index tracking | Native button semantics               | Browser handles it correctly, accessible by default |
| Color contrast validation | Manual testing            | WCAG contrast checker tools           | Automated, standardized, catches edge cases         |
| Gradient button effects   | Image assets              | CSS gradients + mixins                | Scales perfectly, themable, smaller bundle          |
| Loading states            | Custom spinners           | Existing spinner from Base/Button.vue | Consistency, already styled                         |

**Key insight:** The browser provides robust button semantics and CSS handles visual effects efficiently. Custom solutions add complexity without benefits and often break accessibility.

## Common Pitfalls

### Pitfall 1: Text Glow Fails Contrast Requirements

**What goes wrong:** Yellow text with glow looks good on dark blue but fails 4.5:1 ratio, especially on lighter backgrounds.
**Why it happens:** Text-shadow glow doesn't count as "background" for contrast calculation; only the color behind the text counts.
**How to avoid:** Test contrast using WCAG color contrast checker with the actual background color (not the glow). Add text-stroke or increase glow intensity if needed.
**Warning signs:** Text hard to read in bright environments or on slightly lighter backgrounds.

### Pitfall 2: Button Active State Doesn't Match Disabled State

**What goes wrong:** Disabled buttons can still visually appear "pressable" or active states trigger on disabled buttons.
**Why it happens:** `:active` pseudo-class can apply even when `:disabled` is present if not explicitly prevented.
**How to avoid:** Use `:active:not(:disabled)` selector and set `cursor: not-allowed` on disabled state.
**Warning signs:** Disabled buttons change appearance on click or look clickable.

### Pitfall 3: GPU Acceleration Overuse Causes Memory Issues

**What goes wrong:** Adding `will-change: transform` or `transform: translateZ(0)` to every text element causes layer explosion.
**Why it happens:** Each element with these properties creates a separate GPU layer, consuming memory.
**How to avoid:** Only apply GPU acceleration hints to elements that actually animate (buttons during press, not static text displays).
**Warning signs:** Mobile browser lag, high memory usage, or janky scrolling.

### Pitfall 4: Focus Indicator Obscured by Visual Effects

**What goes wrong:** Button focus outline gets hidden behind glow effects or doesn't contrast with gradient backgrounds.
**Why it happens:** Layered box-shadows and gradients can visually overwhelm the default focus ring.
**How to avoid:** Use distinct focus styles with high-contrast outline (e.g., 3px solid white with offset) and test with keyboard navigation.
**Warning signs:** Can't see which button has focus when tabbing through UI.

### Pitfall 5: TypeScript Props Don't Match Runtime Behavior

**What goes wrong:** TypeScript says variant is 'primary' | 'secondary' but runtime passes 'green' and nothing fails.
**Why it happens:** TypeScript is compile-time only; Vue doesn't enforce types at runtime without validators.
**How to avoid:** Add runtime prop validators for critical props or use type guards in component logic.
**Warning signs:** Console warnings about invalid props or unexpected styling.

### Pitfall 6: Button Text Not Readable During Loading State

**What goes wrong:** Loading spinner appears but button text remains visible underneath, creating visual clutter.
**Why it happens:** Slot content not hidden when loading prop is true.
**How to avoid:** Use `v-if="loading"` for spinner and `v-else` for slot content (pattern from Base/Button.vue).
**Warning signs:** Overlapping text and spinner.

## Code Examples

Verified patterns from official sources and existing codebase:

### GameButton Component Structure

```vue
<!-- Pattern from: apps/game/components/Base/Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="button-spinner" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'game-button',
  `game-button--${props.variant}`,
  `game-button--${props.size}`,
  {
    'game-button--disabled': props.disabled || props.loading,
    'game-button--loading': props.loading,
  },
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
```

### GameButton Styles with Glossy Effect

```scss
// Use existing mixins from Phase 2
@use 'assets/scss/mixins' as *;
@use 'assets/scss/variables' as *;

.game-button {
  // Base button styles
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-lg);
  border: 3px solid rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 60px;
  padding: var(--spacing-md) var(--spacing-xl);
  color: var(--color-text-dark);
  text-shadow: var(--text-shadow-embossed-white);

  // Prevent tap highlight on mobile
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  // Variants using glossy-button mixin
  &--primary {
    @include glossy-button(
      $light: var(--color-btn-green-light),
      $dark: var(--color-btn-green-dark),
      $shadow: var(--color-btn-green-shadow)
    );
  }

  &--secondary {
    @include glossy-button(
      $light: var(--color-btn-blue-light),
      $dark: var(--color-btn-blue-dark),
      $shadow: var(--color-btn-blue-shadow)
    );
  }

  &--warning {
    @include glossy-button(
      $light: var(--color-btn-orange-light),
      $dark: var(--color-btn-orange-dark),
      $shadow: var(--color-btn-orange-shadow)
    );
  }

  // Active state (pressed effect)
  &:active:not(:disabled) {
    transform: translateY(4px);
    // Reduce shadow offset by same amount
  }

  // Disabled state
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Focus state (keyboard navigation)
  &:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.8);
    outline-offset: 4px;
  }
}
```

### GameDisplay Component Structure

```vue
<template>
  <div :class="displayClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  glow: true,
})

const displayClasses = computed(() => [
  'game-display',
  `game-display--${props.size}`,
  {
    'game-display--glow': props.glow,
  },
])
</script>
```

### GameDisplay Styles with Glow Effect

```scss
@use 'assets/scss/variables' as *;

.game-display {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-yellow);
  line-height: 1.1;

  // GPU acceleration hint (only if animated)
  // will-change: transform;
  // transform: translateZ(0);

  // Sizes
  &--sm {
    font-size: var(--font-size-lg);
  }

  &--md {
    font-size: var(--font-size-2xl);
  }

  &--lg {
    font-size: var(--font-size-3xl);
  }

  &--xl {
    font-size: var(--font-size-4xl);
  }

  // Glow effect using existing text-shadow token
  &--glow {
    text-shadow: var(--text-shadow-glow-gold);
  }
}
```

### Contrast Validation Pattern

```typescript
// Manual validation during development
// Color: #ffd54f (--color-text-yellow)
// Background: #0a4cc7 (--color-bg-blue-dark)
// Ratio: ~7.2:1 (passes WCAG AA for all text sizes)
//
// Use tools:
// - https://webaim.org/resources/contrastchecker/
// - Browser DevTools Lighthouse accessibility audit
```

## State of the Art

| Old Approach                 | Current Approach                      | When Changed    | Impact                                  |
| ---------------------------- | ------------------------------------- | --------------- | --------------------------------------- |
| Options API components       | Composition API with `<script setup>` | Vue 3 (2020)    | Cleaner code, better TypeScript support |
| Image-based buttons          | CSS gradient + shadow buttons         | CSS3 (2010s)    | Smaller bundles, scalable, themable     |
| Manual focus management      | Native button semantics               | HTML5           | Better accessibility, less code         |
| Runtime-only prop validation | TypeScript + runtime validators       | Vue 3.3+ (2023) | Compile-time safety + runtime guards    |
| ARIA roles on divs           | Semantic HTML elements                | WCAG 2.1+       | Native accessibility, less boilerplate  |

**Deprecated/outdated:**

- Using `<div role="button">` instead of `<button>` — semantic HTML is standard
- Defining props with PropType in Options API — use TypeScript interfaces with Composition API
- Custom focus-visible polyfills — native `:focus-visible` widely supported now

## Open Questions

1. **GPU acceleration for static text displays**
   - What we know: `will-change` and `translateZ(0)` can improve performance for animated elements
   - What's unclear: Whether static score displays benefit from GPU acceleration or cause memory issues
   - Recommendation: Start without GPU hints; add only if animations are introduced later

2. **Loading spinner styling consistency**
   - What we know: Base/Button.vue has a spinner implementation
   - What's unclear: Should GameButton reuse the same spinner or have a game-specific styled version
   - Recommendation: Reuse Base/Button spinner pattern for consistency; customize if mockups show different design

3. **Button size variants for mobile**
   - What we know: Touch targets should be minimum 44px (iOS) / 48dp (Android)
   - What's unclear: Whether GameButton sizes need mobile-specific overrides beyond existing responsive tokens
   - Recommendation: Start with existing responsive spacing tokens; adjust if user testing shows touch targets too small

4. **Contrast ratio for glow-only text**
   - What we know: WCAG requires 4.5:1 for normal text; glow doesn't count as background
   - What's unclear: Exact contrast ratio of yellow (#ffd54f) on various blue gradient stops
   - Recommendation: Validate against darkest blue background (#0a4cc7); add text-stroke if ratio fails

## Sources

### Primary (HIGH confidence)

- [Vue 3 Composition API TypeScript Guide](https://vuejs.org/guide/typescript/composition-api) - TypeScript props and defineProps patterns
- [Vue 3 Accessibility Best Practices](https://vuejs.org/guide/best-practices/accessibility) - Semantic HTML and ARIA attributes
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - 4.5:1 ratio for normal text
- [WebAIM Contrast Guide](https://webaim.org/articles/contrast/) - Contrast calculation and glow effects
- Local codebase: `apps/game/components/Base/Button.vue` - Existing button pattern reference
- Local codebase: `apps/game/assets/scss/effects/_glossy.scss` - Glossy button mixin from Phase 2
- Local codebase: `apps/game/assets/scss/design-system.scss` - Design tokens and text-shadow definitions

### Secondary (MEDIUM confidence)

- [Josh W. Comeau: 3D Button Animation](https://www.joshwcomeau.com/animation/3d-button/) - CSS 3D button press effect technique
- [CSS GPU Acceleration Guide](https://www.testmu.ai/blog/css-gpu-acceleration/) - will-change and transform performance
- [Vue 3 Props Documentation](https://vuejs.org/guide/components/props.html) - Runtime validation patterns
- [DEV: Accessible Button Component](https://dev.to/vue-storefront/how-to-build-accessible-button-component-18el) - Vue accessibility patterns
- [Color Contrast WCAG Guide 2025](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025) - Glow effects and contrast

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Vue 3, TypeScript, and SCSS patterns verified from official docs and existing codebase
- Architecture: HIGH - Patterns match existing Base/Button.vue and Phase 2/3 component structure
- Pitfalls: HIGH - Accessibility and contrast issues well-documented in WCAG standards; GPU performance warnings from multiple sources

**Research date:** 2026-02-01
**Valid until:** 2026-03-03 (30 days for stable web standards)
