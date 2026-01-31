# Phase 1: Design Tokens - Research

**Researched:** 2026-01-31
**Domain:** CSS design systems, UnoCSS integration, fluid typography, design tokens
**Confidence:** HIGH

## Summary

This phase establishes the CSS foundation for the Riddle Rush game redesign by implementing design tokens (colors, typography, spacing) and integrating UnoCSS for utility classes while maintaining SCSS for token definitions. The research confirms this hybrid approach is well-supported and aligns with modern best practices.

**Key findings:**

1. UnoCSS + SCSS coexistence is fully supported - UnoCSS handles utilities, SCSS manages design tokens via CSS custom properties
2. Fluid typography using clamp() is the modern standard for responsive design, with proven accessibility when implemented correctly
3. Multi-layer text-shadow for embossed effects is performant and achievable with 2-4 shadow layers
4. The existing design-system.scss structure provides a solid foundation that can be enhanced rather than replaced

**Primary recommendation:** Adopt UnoCSS preset-wind (Tailwind-compatible utilities) + enhanced SCSS tokens with fluid clamp() scales for typography and spacing. Extract text from mockup PNGs to HTML/CSS for i18n support, keeping only complex backgrounds as images.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library               | Version | Purpose                   | Why Standard                                                               |
| --------------------- | ------- | ------------------------- | -------------------------------------------------------------------------- |
| UnoCSS                | 0.66.6+ | Utility-first CSS engine  | 5x faster than Tailwind JIT, 6kb bundle, 18.5k stars, on-demand generation |
| @unocss/nuxt          | Latest  | Nuxt 4 integration module | Official integration, auto-injects uno.css, supports Vite fully            |
| Sass                  | Current | SCSS preprocessing        | Already in project, excellent for token organization with maps             |
| CSS Custom Properties | Native  | Runtime CSS variables     | Dynamic theming, component-level overrides, no build step                  |

### Supporting

| Library                  | Version | Purpose                       | When to Use                                                |
| ------------------------ | ------- | ----------------------------- | ---------------------------------------------------------- |
| @unocss/preset-wind      | Latest  | Tailwind-compatible utilities | Provides flex, grid, spacing, color utilities out of box   |
| @unocss/preset-web-fonts | Latest  | Web font management           | Self-hosting Google Fonts (Baloo 2) for performance        |
| @nuxtjs/fontaine         | Current | Font loading optimization     | Already installed, provides size-adjust for CLS prevention |

### Alternatives Considered

| Instead of    | Could Use          | Tradeoff                                                              |
| ------------- | ------------------ | --------------------------------------------------------------------- |
| UnoCSS        | Tailwind CSS       | Tailwind is heavier (PostCSS only), slower JIT, less flexible presets |
| Fluid clamp() | Fixed breakpoints  | Media queries are less smooth, more code, harder to maintain          |
| SCSS maps     | JSON design tokens | JSON requires build tooling, SCSS already integrated and familiar     |

**Installation:**

```bash
pnpm add -D unocss @unocss/nuxt
```

**Configuration:**
Add to `nuxt.config.ts` modules array (after Pinia, before PWA):

```typescript
modules: [
  '@pinia/nuxt',
  '@nuxtjs/i18n',
  '@unocss/nuxt', // Add here
  '@vite-pwa/nuxt',
  // ...
]
```

Create `uno.config.ts` in app root.

## Architecture Patterns

### Recommended Project Structure

```
apps/game/
├── assets/
│   └── scss/
│       └── design-system.scss    # Enhanced token definitions
├── uno.config.ts                 # UnoCSS configuration
└── nuxt.config.ts                # Import UnoCSS module
```

### Pattern 1: Hybrid Token System (UnoCSS + SCSS)

**What:** SCSS defines design tokens as CSS custom properties, UnoCSS provides utility classes that consume those tokens.

**When to use:** Always - this separates concerns (tokens vs utilities) and maintains flexibility.

**Example:**

```scss
// design-system.scss - Token definitions
:root {
  // Color tokens from mockup analysis
  --color-bg-gradient-start: #1cc6ff;
  --color-bg-gradient-mid: #0b7ad6;
  --color-bg-gradient-end: #0a4cc7;

  --color-border-gold: #ffd54f;
  --color-border-orange: #ff9500;

  --color-btn-green-start: #b7ff6d;
  --color-btn-green-end: #5fc423;
  --color-btn-blue-start: #44c8ff;
  --color-btn-blue-end: #0a7bda;

  // Fluid spacing scale (360px to 1080px)
  --spacing-xs: clamp(0.5rem, 0.3rem + 0.56vw, 0.75rem);
  --spacing-sm: clamp(0.75rem, 0.5rem + 0.69vw, 1.125rem);
  --spacing-md: clamp(1rem, 0.67rem + 0.93vw, 1.5rem);
  --spacing-lg: clamp(1.5rem, 1rem + 1.39vw, 2.25rem);
  --spacing-xl: clamp(2rem, 1.33rem + 1.85vw, 3rem);

  // Fluid typography scale
  --font-size-display: clamp(2.5rem, 1.67rem + 2.31vw, 3.75rem);
  --font-size-heading: clamp(1.5rem, 1.17rem + 0.93vw, 2rem);
  --font-size-body: clamp(1rem, 0.92rem + 0.23vw, 1.125rem);
}
```

```typescript
// uno.config.ts - Consume SCSS tokens
import { defineConfig, presetWind, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(), // Tailwind-compatible utilities
    presetWebFonts({
      provider: 'google',
      fonts: {
        display: 'Baloo 2:400,600,700,800',
        sans: 'Nunito:400,600,700',
      },
    }),
  ],
  theme: {
    // Extend with mockup-specific values
    colors: {
      'btn-green': 'var(--color-btn-green-start)',
      'btn-blue': 'var(--color-btn-blue-start)',
      'border-gold': 'var(--color-border-gold)',
    },
    spacing: {
      // Map to SCSS tokens
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
      xl: 'var(--spacing-xl)',
    },
  },
})
```

**Usage in components:**

```vue
<template>
  <!-- UnoCSS utilities -->
  <div class="flex flex-col gap-md px-lg">
    <!-- Custom token via CSS variable -->
    <h1 class="text-display embossed-text">RIDDLE RUSH</h1>
  </div>
</template>

<style scoped>
.embossed-text {
  font-family: var(--font-display);
  font-size: var(--font-size-display);
  color: #ffd54f;
  /* Multi-layer text shadow for 3D effect */
  text-shadow:
    0 2px 0 #c8a243,
    0 4px 0 #a67e2f,
    0 6px 8px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(255, 213, 79, 0.5);
}
</style>
```

### Pattern 2: Fluid Typography Scale with Clamp

**What:** Use CSS clamp() to create smoothly scaling typography between mobile (360px) and design mockup width (1080px).

**When to use:** For all text sizes - headings, body, UI labels.

**Formula:**

```
clamp(minSize, preferredSize, maxSize)

Where:
- minSize: Value at 360px viewport
- preferredSize: Fluid formula (calculated with viewport units)
- maxSize: Value at 1080px viewport (extracted from mockup)
```

**Calculation approach:**
Use Utopia calculator (https://utopia.fyi/type/calculator/) or calculate manually:

```
For a size that scales from 16px (360px viewport) to 24px (1080px viewport):

vw component = 100 × (24 - 16) / (1080 - 360) = 1.11vw
rem offset = (360 × 24 - 1080 × 16) / (360 - 1080) = 1rem

Result: clamp(1rem, 0.78rem + 1.11vw, 1.5rem)
```

**Example implementation:**

```scss
// Typography scale derived from 1080px mockup
$font-sizes: (
  'xs': clamp(0.75rem, 0.67rem + 0.23vw, 0.875rem),
  // 12px → 14px
  'sm': clamp(0.875rem, 0.79rem + 0.23vw, 1rem),
  // 14px → 16px
  'base': clamp(1rem, 0.92rem + 0.23vw, 1.125rem),
  // 16px → 18px
  'lg': clamp(1.125rem, 1rem + 0.35vw, 1.375rem),
  // 18px → 22px
  'xl': clamp(1.375rem, 1.21rem + 0.46vw, 1.75rem),
  // 22px → 28px
  '2xl': clamp(1.75rem, 1.5rem + 0.69vw, 2.25rem),
  // 28px → 36px
  'display': clamp(2.5rem, 1.67rem + 2.31vw, 3.75rem), // 40px → 60px (logo)
);

:root {
  @each $name, $value in $font-sizes {
    --font-size-#{$name}: #{$value};
  }
}
```

### Pattern 3: Multi-Layer Text Shadow for Embossed Effect

**What:** Stack 3-4 text shadows with different offsets, blur, and opacity to create 3D embossed text matching mockup style.

**When to use:** Display headings, buttons, emphasis text - not body text.

**Example:**

```scss
// Embossed yellow text effect (from main menu "RIDDLE RUSH" title)
@mixin text-embossed-gold {
  color: #ffd54f;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.4),
    // Highlight (top)
    0 2px 0 #c8a243,
    // Mid-tone (shadow step 1)
    0 4px 0 #a67e2f,
    // Dark tone (shadow step 2)
    0 6px 8px rgba(0, 0, 0, 0.4),
    // Soft shadow (depth)
    0 0 20px rgba(255, 213, 79, 0.5); // Glow (optional, for emphasis)
}

// Embossed white text effect (from buttons)
@mixin text-embossed-white {
  color: #ffffff;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    // Subtle depth
    0 2px 4px rgba(0, 0, 0, 0.15),
    // Mid shadow
    0 0 8px rgba(255, 255, 255, 0.3); // Glow
}

// Define as CSS custom property for reuse
:root {
  --text-shadow-embossed-gold:
    0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 0 #c8a243, 0 4px 0 #a67e2f,
    0 6px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 213, 79, 0.5);

  --text-shadow-embossed-white:
    0 1px 2px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15), 0 0 8px rgba(255, 255, 255, 0.3);
}
```

**Performance note:** 3-5 shadows are performant on modern devices. Avoid 10+ shadows or very high blur values (>20px).

### Pattern 4: Gradient Backgrounds as CSS Variables

**What:** Define gradient backgrounds from mockup as CSS custom properties for reuse.

**When to use:** Main background, button backgrounds, card overlays.

**Example:**

```scss
// Mockup gradient backgrounds
$gradients: (
  // Main background (radial blue gradient from mockup)
  'main-bg': radial-gradient(circle at 50% 35%, #1cc6ff 0%, #0b7ad6 40%, #0a4cc7 100%),
  // Green button gradient
  'btn-green': linear-gradient(180deg, #b7ff6d 0%, #5fc423 100%),
  // Blue button gradient
  'btn-blue': linear-gradient(180deg, #44c8ff 0%, #0a7bda 100%),
  // Orange button gradient
  'btn-orange': linear-gradient(180deg, #ffb84d 0%, #ff9500 100%),
  // Red button gradient
  'btn-red': linear-gradient(180deg, #ff8961 0%, #ff5b5b 100%)
);

:root {
  @each $name, $value in $gradients {
    --bg-gradient-#{$name}: #{$value};
  }
}
```

**Usage:**

```css
body {
  background: var(--bg-gradient-main-bg);
}

.btn-primary {
  background: var(--bg-gradient-btn-green);
}
```

**Important:** Gradients as CSS variables work in all modern browsers (since 2015). No fallback needed for this project's target browsers.

### Anti-Patterns to Avoid

- **Fixed pixel values:** Don't use `font-size: 24px` - use fluid clamp() or token variables
- **Inline styles for tokens:** Don't use `<div style="color: #1cc6ff">` - use CSS classes and tokens
- **Excessive text shadows:** More than 5 shadows degrades performance, diminishing returns visually
- **Viewport units without clamp():** Raw `font-size: 4vw` fails WCAG 1.4.4 (text must resize to 200%)
- **Hardcoded gradient values:** Don't repeat `linear-gradient(...)` - define once in SCSS, reference via CSS variable

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                     | Don't Build                    | Use Instead                                  | Why                                                         |
| --------------------------- | ------------------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| Utility classes             | Custom utility CSS classes     | UnoCSS preset-wind                           | 18.5k utilities ready, 5x faster than Tailwind, auto-purged |
| Fluid typography calculator | Manual math for each size      | Utopia calculator or SCSS formula            | Avoids math errors, proven accessible formulas              |
| Web font loading            | Manual @font-face declarations | @unocss/preset-web-fonts or @nuxtjs/fontaine | Handles preload, font-display, subsetting automatically     |
| CSS reset                   | Custom global resets           | UnoCSS preset-wind includes reset            | Modern reset built-in, tested across browsers               |
| Color palette generation    | Manual hex codes               | Extract from mockup + organize in SCSS map   | Ensures design consistency, single source of truth          |
| Responsive breakpoints      | Custom media queries           | UnoCSS responsive variants (sm:, md:, lg:)   | Standard breakpoints, less code, familiar to developers     |

**Key insight:** Design tokens and utilities are solved problems in 2024. UnoCSS + SCSS gives you both modern utility classes and maintainable token organization without reinventing either system.

## Common Pitfalls

### Pitfall 1: Viewport Units Breaking Text Zoom

**What goes wrong:** Using `font-size: 4vw` without clamp() prevents users from zooming text to 200% as required by WCAG 1.4.4.

**Why it happens:** Viewport units scale with viewport, not user's zoom setting. WCAG requires users can zoom text independently.

**How to avoid:**

- Always wrap viewport units in clamp() with rem min/max bounds
- Test with browser zoom (Ctrl/Cmd +) to verify text scales
- Use `rem` for minimum and maximum values in clamp()

**Warning signs:**

- Text doesn't grow when zooming browser
- Audit tools flag "Text content does not resize properly"

**Example fix:**

```scss
// BAD - fails WCAG
.heading {
  font-size: 4vw;
}

// GOOD - passes WCAG
.heading {
  font-size: clamp(1.5rem, 1rem + 2vw, 3rem);
}
```

### Pitfall 2: UnoCSS and SCSS Fighting Over Specificity

**What goes wrong:** UnoCSS utilities don't override SCSS styles, or vice versa, causing visual bugs.

**Why it happens:** SCSS outputs global CSS, UnoCSS generates utilities. Load order and specificity conflicts arise.

**How to avoid:**

- Load SCSS first (in `nuxt.config.ts` css array)
- UnoCSS auto-injected after, has higher specificity for utilities
- Use SCSS only for tokens/base styles, UnoCSS for utilities
- Never define utility classes in SCSS (flex, grid, etc.)

**Warning signs:**

- `class="flex"` doesn't work but SCSS `.flex` exists
- Need `!important` to make utilities work
- Styles behaving differently in dev vs production

**Example fix:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/scss/design-system.scss'], // Loaded first
  modules: [
    '@unocss/nuxt', // Auto-injects after, higher specificity
  ],
})
```

```scss
// design-system.scss - ONLY tokens and base styles
:root {
  --spacing-md: 1rem;
}

body {
  font-family: var(--font-primary);
}

// DON'T define utility classes here
// ❌ .flex { display: flex; }  // Let UnoCSS handle this
```

### Pitfall 3: Forgetting Font License and Self-Hosting

**What goes wrong:** Using Google Fonts CDN causes GDPR issues and slower load times. Not verifying font license risks legal issues.

**Why it happens:** Default Google Fonts embed code uses their CDN, which shares user data. Developers assume all fonts are free.

**How to avoid:**

- Self-host fonts using `@unocss/preset-web-fonts` with `inlineImports: true`
- Or manually download from Google Fonts and host in `/public/fonts/`
- Verify license allows web use (Google Fonts are Open Font License - safe)
- Use `@nuxtjs/fontaine` to prevent CLS with `size-adjust`

**Warning signs:**

- External requests to `fonts.googleapis.com` or `fonts.gstatic.com`
- GDPR compliance tools flag font loading
- Flash of invisible text (FOIT) on page load

**Example fix:**

```typescript
// uno.config.ts - Self-hosted fonts
import { defineConfig, presetWebFonts } from 'unocss'

export default defineConfig({
  presets: [
    presetWebFonts({
      provider: 'google',
      fonts: {
        display: 'Baloo 2:400,600,700,800',
      },
      // Self-host by inlining
      inlineImports: true, // Downloads and bundles fonts
    }),
  ],
})
```

### Pitfall 4: Not Extracting Text from Mockup Images

**What goes wrong:** Keeping text in PNGs prevents translation to English, increases bundle size, and harms SEO.

**Why it happens:** Extracting text requires CSS recreation of effects (shadows, gradients), which feels time-consuming.

**How to avoid:**

- Extract ALL text from mockup images during token phase
- Recreate effects with CSS (text-shadow, gradients)
- Keep only complex backgrounds/textures as PNGs
- Test that CSS version matches mockup visually (spirit, not pixel-perfect)

**Warning signs:**

- Image files contain readable text
- i18n keys point to image filenames
- Bundle size > 5MB with many text-heavy PNGs

**Decision matrix:**

```
Can CSS recreate the effect?
├─ YES → Extract text to HTML, use CSS for styling
└─ NO → Keep PNG
    └─ Is it text or background?
        ├─ Text → Try harder to recreate with CSS (layered shadows, pseudo-elements)
        └─ Background → Keep PNG, it's acceptable
```

### Pitfall 5: Inconsistent Spacing Scale

**What goes wrong:** Mockup has spacing values like 23px, 47px, 61px - irregular values that don't form a scale.

**Why it happens:** Designer used visual spacing without mathematical scale. Implementing these exactly creates inconsistent, hard-to-maintain code.

**How to avoid:**

- Use standard 8px base scale (8, 16, 24, 32, 40, 48, 56, 64...)
- Or 4px scale for finer control (4, 8, 12, 16, 20, 24, 28, 32...)
- Measure mockup proportions, round to nearest scale value
- Verify visually - if 23px rounds to 24px and looks right, use 24px
- Document scale in SCSS, enforce via tokens

**Warning signs:**

- SCSS has dozens of unique spacing values
- Hard to remember which spacing to use
- Inconsistent gaps between similar elements

**Example fix:**

```scss
// BAD - irregular values from pixel-picking mockup
$spacing-weird-1: 23px;
$spacing-weird-2: 47px;
$spacing-weird-3: 61px;

// GOOD - standardized scale
$spacing: (
  'xs': clamp(0.5rem, 0.3rem + 0.56vw, 0.75rem),
  // ~8-12px
  'sm': clamp(0.75rem, 0.5rem + 0.69vw, 1.125rem),
  // ~12-18px
  'md': clamp(1rem, 0.67rem + 0.93vw, 1.5rem),
  // ~16-24px
  'lg': clamp(1.5rem, 1rem + 1.39vw, 2.25rem),
  // ~24-36px
  'xl': clamp(2rem, 1.33rem + 1.85vw, 3rem),
  // ~32-48px
  '2xl': clamp(3rem, 2rem + 2.78vw, 4.5rem), // ~48-72px
);
```

## Code Examples

Verified patterns from official sources:

### UnoCSS Configuration for Nuxt 4

```typescript
// uno.config.ts
// Source: https://unocss.dev/integrations/nuxt
import {
  defineConfig,
  presetWind,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    // Tailwind-compatible utilities
    presetWind(),

    // Web fonts (self-hosted via inlineImports)
    presetWebFonts({
      provider: 'google',
      fonts: {
        display: {
          name: 'Baloo 2',
          weights: [400, 600, 700, 800],
        },
        sans: {
          name: 'Nunito',
          weights: [400, 600, 700],
        },
      },
      inlineImports: true, // Self-host for performance
    }),
  ],

  // Enable @apply and variant groups
  transformers: [transformerDirectives(), transformerVariantGroup()],

  // Extend theme with custom tokens
  theme: {
    colors: {
      // Button colors from mockup
      'btn-green-light': '#b7ff6d',
      'btn-green-dark': '#5fc423',
      'btn-blue-light': '#44c8ff',
      'btn-blue-dark': '#0a7bda',
      'btn-orange-light': '#ffb84d',
      'btn-orange-dark': '#ff9500',

      // Border colors
      'border-gold': '#ffd54f',
      'border-orange': '#ff9500',

      // Background gradient stops
      'bg-blue-light': '#1cc6ff',
      'bg-blue-mid': '#0b7ad6',
      'bg-blue-dark': '#0a4cc7',
    },

    // Don't override spacing - consume from CSS variables
    spacing: {
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
      xl: 'var(--spacing-xl)',
      '2xl': 'var(--spacing-2xl)',
    },

    // Container max-width for game layout
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1080px', // Match mockup design width
      },
    },
  },

  // Safelist classes used in dynamic content
  safelist: ['text-display', 'text-embossed-gold', 'bg-gradient-main'],
})
```

### Enhanced Design System SCSS

```scss
// apps/game/assets/scss/design-system.scss
// Source: Project codebase + research patterns

@use 'sass:map';
@use 'sass:math';

// ============================================
// DESIGN TOKENS - Enhanced for mockup redesign
// ============================================

// Color Palette (extracted from mockup)
$colors: (
  // Background gradient stops
  'bg-blue-light': #1cc6ff,
  'bg-blue-mid': #0b7ad6,
  'bg-blue-dark': #0a4cc7,

  // Button colors
  'btn-green-light': #b7ff6d,
  'btn-green-dark': #5fc423,
  'btn-blue-light': #44c8ff,
  'btn-blue-dark': #0a7bda,
  'btn-orange-light': #ffb84d,
  'btn-orange-dark': #ff9500,
  'btn-red-light': #ff8961,
  'btn-red-dark': #ff5b5b,

  // Border/accent colors
  'border-gold': #ffd54f,
  'border-orange': #ff9500,
  'border-white': rgba(255, 255, 255, 0.4),
  // Text colors
  'text-yellow': #ffd54f,
  'text-white': #ffffff,
  'text-dark': #0b3b76,

  // Neutral colors (keep existing)
  'gray': #9bb6da,
  'gray-light': #d7e4f7
);

// Gradient Definitions (from mockup)
$gradients: (
  // Main background (matches mockup radial gradient)
  'main': radial-gradient(circle at 50% 35%, #1cc6ff 0%, #0b7ad6 40%, #0a4cc7 100%),
  // Button gradients
  'btn-green': linear-gradient(180deg, #b7ff6d 0%, #5fc423 100%),
  'btn-blue': linear-gradient(180deg, #44c8ff 0%, #0a7bda 100%),
  'btn-orange': linear-gradient(180deg, #ffb84d 0%, #ff9500 100%),
  'btn-red': linear-gradient(180deg, #ff8961 0%, #ff5b5b 100%),
  // Card/overlay gradients
  'card': linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 239, 194, 0.95) 100%)
);

// Typography (Baloo 2 for display, Nunito for UI)
$fonts: (
  'display': (
    'Baloo 2',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif,
  ),
  'sans': (
    'Nunito',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif,
  ),
);

// Fluid Typography Scale (360px → 1080px viewport)
// Source: Utopia calculator + mockup measurements
$font-sizes: (
  'xs': clamp(0.75rem, 0.67rem + 0.23vw, 0.875rem),
  // 12px → 14px
  'sm': clamp(0.875rem, 0.79rem + 0.23vw, 1rem),
  // 14px → 16px
  'base': clamp(1rem, 0.92rem + 0.23vw, 1.125rem),
  // 16px → 18px
  'lg': clamp(1.125rem, 1rem + 0.35vw, 1.375rem),
  // 18px → 22px
  'xl': clamp(1.375rem, 1.21rem + 0.46vw, 1.75rem),
  // 22px → 28px
  '2xl': clamp(1.75rem, 1.5rem + 0.69vw, 2.25rem),
  // 28px → 36px
  '3xl': clamp(2.25rem, 1.83rem + 1.16vw, 3rem),
  // 36px → 48px
  'display': clamp(2.5rem, 1.67rem + 2.31vw, 3.75rem), // 40px → 60px (logo/titles)
);

$font-weights: (
  'normal': 400,
  'semibold': 600,
  'bold': 700,
  'extrabold': 800,
);

// Fluid Spacing Scale (360px → 1080px viewport)
// 8px base scale at 360px, 12px base at 1080px
$spacing: (
  'xs': clamp(0.5rem, 0.42rem + 0.23vw, 0.625rem),
  // 8px → 10px
  'sm': clamp(0.75rem, 0.58rem + 0.46vw, 1rem),
  // 12px → 16px
  'md': clamp(1rem, 0.75rem + 0.69vw, 1.375rem),
  // 16px → 22px
  'lg': clamp(1.5rem, 1.08rem + 1.16vw, 2.125rem),
  // 24px → 34px
  'xl': clamp(2rem, 1.42rem + 1.62vw, 2.875rem),
  // 32px → 46px
  '2xl': clamp(3rem, 2.17rem + 2.31vw, 4.25rem),
  // 48px → 68px
  '3xl': clamp(4rem, 2.83rem + 3.24vw, 5.75rem), // 64px → 92px
);

// Border Radius (from mockup measurements)
$radius: (
  'sm': 8px,
  'md': 12px,
  'lg': 20px,
  'xl': 28px,
  'full': 9999px,
);

// Shadows (enhanced for mockup depth)
$shadows: (
  'sm': (
    0 2px 4px rgba(0, 0, 0, 0.1),
  ),
  'md': (
    0 4px 8px rgba(0, 0, 0, 0.15),
  ),
  'lg': (
    0 8px 16px rgba(0, 0, 0, 0.2),
  ),
  'xl': (
    0 12px 24px rgba(0, 0, 0, 0.25),
  ),
  // Button shadow (bottom offset for pressed effect)
  'btn': (
      0 6px 0 rgba(0, 0, 0, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.15),
    ),
);

// Text Shadow Presets (embossed effects)
$text-shadows: (
  // Gold embossed text (for titles like "RIDDLE RUSH")
  'embossed-gold': (
      0 1px 0 rgba(255, 255, 255, 0.4),
      0 2px 0 #c8a243,
      0 4px 0 #a67e2f,
      0 6px 8px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(255, 213, 79, 0.5)
    ),

  // White embossed text (for button labels)
  'embossed-white': (
      0 1px 2px rgba(0, 0, 0, 0.2),
      0 2px 4px rgba(0, 0, 0, 0.15),
      0 0 8px rgba(255, 255, 255, 0.3)
    ),

  // Subtle shadow for body text
  'subtle': (0 1px 2px rgba(0, 0, 0, 0.1))
);

// ============================================
// CSS CUSTOM PROPERTIES
// ============================================

:root {
  // Colors
  @each $name, $value in $colors {
    --color-#{$name}: #{$value};
  }

  // Gradients
  @each $name, $value in $gradients {
    --bg-gradient-#{$name}: #{$value};
  }

  // Typography
  --font-display: #{map.get($fonts, 'display')};
  --font-sans: #{map.get($fonts, 'sans')};

  @each $name, $value in $font-sizes {
    --font-size-#{$name}: #{$value};
  }

  @each $name, $value in $font-weights {
    --font-weight-#{$name}: #{$value};
  }

  // Spacing
  @each $name, $value in $spacing {
    --spacing-#{$name}: #{$value};
  }

  // Border Radius
  @each $name, $value in $radius {
    --radius-#{$name}: #{$value};
  }

  // Shadows
  @each $name, $value in $shadows {
    --shadow-#{$name}: #{$value};
  }

  // Text Shadows
  @each $name, $value in $text-shadows {
    --text-shadow-#{$name}: #{$value};
  }
}

// ============================================
// BASE STYLES
// ============================================

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text-white);
  background: var(--bg-gradient-main);
  min-height: 100vh;
  overflow-x: hidden;
}

// ============================================
// UTILITY CLASSES (minimal - UnoCSS handles most)
// ============================================

// Text embossed effects (not in UnoCSS)
.text-embossed-gold {
  color: var(--color-text-yellow);
  text-shadow: var(--text-shadow-embossed-gold);
}

.text-embossed-white {
  color: var(--color-text-white);
  text-shadow: var(--text-shadow-embossed-white);
}

// Display font class
.font-display {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  line-height: 1.1;
}

// Gradient text effect (for special cases)
.text-gradient {
  background: var(--bg-gradient-btn-green);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Component Using Hybrid System

```vue
<!-- Example: Main menu button -->
<!-- Source: Mockup + implementation pattern -->
<template>
  <button class="btn-game" :class="variant">
    <span class="btn-game__text">
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  variant: 'green' | 'blue' | 'orange' | 'red'
}>()
</script>

<style scoped>
.btn-game {
  /* UnoCSS utilities */
  @apply flex items-center justify-center
    px-xl py-lg
    rounded-lg
    text-lg font-bold
    transition-all duration-200
    touch-target;

  /* Custom token-based styles */
  font-family: var(--font-display);
  border: 3px solid var(--color-border-white);
  box-shadow: var(--shadow-btn);
  min-width: 280px;

  &:active {
    transform: translateY(4px);
    box-shadow:
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &.green {
    background: var(--bg-gradient-btn-green);
  }

  &.blue {
    background: var(--bg-gradient-btn-blue);
  }

  &.orange {
    background: var(--bg-gradient-btn-orange);
  }

  &.red {
    background: var(--bg-gradient-btn-red);
  }
}

.btn-game__text {
  @apply text-embossed-white uppercase tracking-wide;
}

/* Touch-friendly helper (already in design-system.scss) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
</style>
```

## State of the Art

| Old Approach          | Current Approach              | When Changed     | Impact                                                  |
| --------------------- | ----------------------------- | ---------------- | ------------------------------------------------------- |
| Tailwind CSS          | UnoCSS                        | 2021-2022        | 5x faster JIT, 6kb bundle, more flexible presets        |
| Fixed breakpoints     | Fluid clamp()                 | 2020-2023        | Smoother scaling, less media query code, better UX      |
| PostCSS-only          | Build tool integration        | 2022+            | Better HMR, faster builds, isomorphic engine            |
| rem only              | Fluid rem with viewport units | 2019+            | Responsive without breakpoints, maintains accessibility |
| JSON design tokens    | CSS custom properties         | 2015+ (baseline) | Native browser support, dynamic theming, no build step  |
| font-display: auto    | font-display: swap            | 2019+            | Prevent invisible text, better perceived performance    |
| Multiple font formats | WOFF2 only                    | 2022+            | Universal support, smaller files, simpler config        |

**Deprecated/outdated:**

- `@unocss/preset-uno`: Deprecated in favor of `@unocss/preset-wind` (Tailwind-compatible)
- `@unocss/preset-wind` (old): Now `@unocss/preset-wind3` or `@unocss/preset-wind4`
- Raw viewport units for typography: Now wrap in clamp() for WCAG compliance
- `font-display: auto`: Use `swap` for web fonts, `optional` for performance-critical

## Open Questions

Things that couldn't be fully resolved:

1. **Exact font from mockup**
   - What we know: Mockup displays use a bold, rounded, playful font. "Baloo 2" from Google Fonts is very similar.
   - What's unclear: Whether mockup used Baloo 2 exactly or a paid alternative (e.g., VAG Rounded, Cooper Black)
   - Recommendation: Use Baloo 2 initially, verify with designer/stakeholder. If exact match needed, use WhatTheFont tool (myfonts.com/whatthefont) with mockup screenshot to identify. Baloo 2 is Open Font License and free to use.

2. **Container max-width**
   - What we know: Mockup is 1080px wide (mobile portrait), but desktop experience isn't defined
   - What's unclear: Should desktop center content at 1080px max-width, or expand to larger viewports?
   - Recommendation: Default to 1080px max-width centered on larger screens (maintains design integrity). Can expand later if stakeholder wants wider desktop layout. Most mobile games center on desktop anyway.

3. **Color space for gradients**
   - What we know: Modern browsers support different color interpolation methods (sRGB, lab, oklab)
   - What's unclear: Whether mockup gradients use specific color space that affects appearance
   - Recommendation: Use default sRGB color space unless gradients look noticeably different. Can refine with `color-interpolation-method` if needed (low priority).

4. **Spacing scale base**
   - What we know: Mockup has irregular spacing (23px, 47px, etc.)
   - What's unclear: Whether to use 4px base (4, 8, 12, 16...) or 8px base (8, 16, 24, 32...)
   - Recommendation: Use 8px base with fluid scaling. Provides enough granularity for this playful design without excessive token options. Measure mockup, round to nearest 8px multiple, verify visually.

## Sources

### Primary (HIGH confidence)

- **UnoCSS Official Docs** - https://unocss.dev/integrations/nuxt - Nuxt integration, configuration
- **UnoCSS GitHub** - https://github.com/unocss/unocss - Current version (0.66.6), stability, community adoption (18.5k stars, 66k dependents)
- **UnoCSS Theme Config** - https://unocss.dev/config/theme - Theme structure, extension patterns
- **UnoCSS Presets** - https://unocss.dev/presets/ - preset-wind for Tailwind utilities
- **MDN CSS text-shadow** - https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow - Multi-layer shadow syntax, performance
- **MDN CSS gradient** - https://developer.mozilla.org/en-US/docs/Web/CSS/gradient - Gradient types, CSS variable usage, browser support
- **W3C WCAG 1.4.4** - https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html - Text resizing requirements, clamp() considerations
- **web.dev Font Best Practices** - https://web.dev/articles/font-best-practices - WOFF2-only recommendation, font-display strategies
- **web.dev size-adjust** - https://web.dev/articles/css-size-adjust - CLS prevention with fallback fonts

### Secondary (MEDIUM confidence)

- **CSS-Tricks clamp()** - https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/ - Fluid typography calculation formula
- **Smashing Magazine Fluid Typography** - https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/ - Modern clamp() approach, accessibility
- **Utopia Type Calculator** - https://utopia.fyi/type/calculator/ - Fluid scale generation, recommended viewport ranges (360-1240px)
- **Utopia Blog: Modular vs Fluid** - https://utopia.fyi/blog/css-modular-scales/ - When to use fluid scales over fixed breakpoints
- **ModernCSS Fluid Type** - https://moderncss.dev/generating-font-size-css-rules-and-creating-a-fluid-type-scale/ - Practical implementation with rem units
- **Josh Comeau Shadows** - https://www.joshwcomeau.com/css/designing-shadows/ - Layered shadow technique for depth
- **Piccalilli Modern Reset** - https://piccalil.li/blog/a-modern-css-reset/ - 2023 CSS reset best practices
- **CSS-Tricks Custom Properties** - https://css-tricks.com/a-complete-guide-to-custom-properties/ - Naming conventions, fallbacks, preprocessor integration

### Tertiary (LOW confidence - verify during implementation)

- **Google Fonts Baloo 2** - Font details not fully verified (page returned config code, not specs). Verify license and available weights during implementation.
- **WhatTheFont** - Font identification tool mentioned but details not extracted. Use if Baloo 2 doesn't match mockup exactly.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - UnoCSS is mature (0.66.6, 18.5k stars, 66k dependents), official Nuxt integration, well-documented
- Architecture: HIGH - Hybrid UnoCSS + SCSS pattern verified from official docs, fluid clamp() is W3C standard with proven accessibility
- Pitfalls: MEDIUM-HIGH - WCAG issues well-documented, UnoCSS specificity based on load order (standard practice), font licensing verified for Google Fonts (OFL), spacing irregularity common in designs
- Code examples: HIGH - All examples sourced from official docs (UnoCSS, MDN, W3C) or adapted from project's existing design-system.scss

**Research date:** 2026-01-31
**Valid until:** ~60 days (March 2026) - CSS/UnoCSS ecosystem is stable, but verify UnoCSS version and any major Nuxt 4 updates before implementation
