---
phase: 01-design-tokens
plan: 02
subsystem: design-system
tags: [scss, css-variables, design-tokens, typography, spacing, utility-classes]

# Dependency graph
requires:
  - 01-01-research
provides:
  - Enhanced design token system
  - Mockup-aligned color palette
  - Fluid typography and spacing scales
  - Text shadow presets for embossed effects
  - Utility classes for common patterns
affects:
  - All future component development
  - Page styling implementations
  - Responsive design consistency

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CSS custom properties for runtime token access
    - Fluid typography using clamp()
    - SCSS maps for token organization
    - Utility-first CSS classes

# File tracking
key-files:
  created: []
  modified:
    - apps/game/assets/scss/design-system.scss

# Decisions
decisions:
  - id: spacing-formula
    summary: Use precise fluid clamp() formula for spacing scale
    context: Spacing needs to scale smoothly from 360px to 1080px viewport
    choice: clamp(min, min + (max - min) * viewport-fraction, max)
    alternatives: [percentage-based, fixed breakpoints]
    rationale: Provides smooth scaling without breakpoint jumps

  - id: radius-scale
    summary: Added 2xl radius value (36px)
    context: Mockups show larger border radius for certain panels
    choice: Extended radius scale to include 2xl (36px)
    alternatives: [use xl with custom overrides]
    rationale: Maintains consistent naming convention and reusability

  - id: utility-classes
    summary: Added mockup-specific utility classes
    context: Common text effects and typography patterns from mockups
    choice: Created utility classes for embossed text, glow effects, and display typography
    alternatives: [inline styles, component-specific classes]
    rationale: Promotes consistency and reduces duplication across components

# Metrics
duration: 2m 14s
completed: 2026-01-31
---

# Phase 1 Plan 02: Enhanced Design Tokens Summary

**One-liner:** Refined design token system with precise fluid spacing, extended radius scale, and mockup-specific utility classes for consistent styling.

## What Was Built

Enhanced the existing design-system.scss file with refined values that exactly match the plan specifications:

### 1. Spacing Scale Refinement

Updated the `$spacing` map with precise fluid clamp() values calculated for 360px-1080px viewport:

- xs: 0.5rem → 0.625rem (8px → 10px)
- sm: 0.75rem → 1rem (12px → 16px)
- md: 1rem → 1.5rem (16px → 24px)
- lg: 1.5rem → 2.25rem (24px → 36px)
- xl: 2rem → 3rem (32px → 48px)
- 2xl: 3rem → 4.5rem (48px → 72px)
- 3xl: 4rem → 6rem (64px → 96px)

### 2. Border Radius Scale Update

Updated the `$radius` map to include 2xl value:

- sm: 8px (refined from 10px)
- md: 12px (refined from 18px)
- lg: 20px (refined from 26px)
- xl: 28px (refined from 38px)
- **2xl: 36px** (newly added)
- full: 9999px (unchanged)

### 3. Mockup-Specific Utility Classes

Added comprehensive utility classes for common mockup patterns:

**Text Effects:**

- `.text-embossed-gold` - Gold text with 3D embossed effect and glow
- `.text-embossed-white` - White text with subtle emboss
- `.text-embossed-dark` - Dark text with light highlight
- `.text-glow-gold` - Gold text with outer glow only

**Typography:**

- `.font-display` - Display font with bold weight
- `.title-display` - Large display titles (48px → 72px)
- `.title-lg` - Large titles (36px → 48px)
- `.title-md` - Medium titles (28px → 36px)

## Decisions Made

### Spacing Formula Precision

**Decision:** Use precise fluid clamp() calculations based on viewport fraction
**Why:** Ensures smooth scaling without visual jumps at breakpoints. Formula: `clamp(min, min + (max - min) * (100vw - 360px) / (1080px - 360px), max)`

### Extended Radius Scale

**Decision:** Add 2xl radius value (36px) to the scale
**Why:** Mockups show larger border radius for certain panels and cards. Maintains consistent naming convention.

### Utility Class Approach

**Decision:** Create utility classes for common mockup patterns
**Why:** Reduces duplication, promotes consistency, and makes it easy to apply mockup-aligned styling across components.

## Technical Implementation

### SCSS Architecture

- **Maps:** Organized tokens in SCSS maps for easy maintenance
- **CSS Custom Properties:** Auto-generated from maps using `@each` loops
- **Utility Classes:** Created reusable classes for common patterns
- **Fluid Typography:** All text sizes use clamp() for responsive scaling

### Design Token Categories

1. **Colors:** 30+ color tokens including button, border, text, and panel colors
2. **Gradients:** 12 gradient definitions for backgrounds and buttons
3. **Typography:** 9 font sizes, 5 weights, and 6 text shadow presets
4. **Spacing:** 7 fluid spacing values
5. **Radius:** 6 border radius values
6. **Shadows:** 5 box shadow presets
7. **Transitions:** 4 timing functions

## Files Changed

### Modified

- **apps/game/assets/scss/design-system.scss** (63 lines added, 11 lines removed)
  - Updated `$spacing` map with precise fluid values
  - Updated `$radius` map with refined values and 2xl addition
  - Added mockup-specific utility classes at end of file

## Verification

All verification checks passed:

- ✅ Color definitions present (btn-green-light, border-gold, text-yellow, etc.)
- ✅ Gradient definitions present (btn-green, btn-blue, btn-orange, btn-red)
- ✅ CSS custom properties auto-generated via @each loops
- ✅ Text shadow presets defined (embossed-gold, embossed-white, glow-gold)
- ✅ Utility classes added (text-embossed-gold, title-display, etc.)
- ✅ Radius scale includes 2xl value
- ✅ SCSS compilation successful
- ✅ TypeScript validation passed
- ✅ ESLint checks passed

## Next Phase Readiness

### Blockers

None

### Concerns

None

### Recommendations

1. **Component development** can now begin using these tokens
2. **Page styling** should reference CSS custom properties (var(--color-_, --spacing-_, etc.))
3. **Utility classes** should be preferred for common patterns to maintain consistency

## Deviations from Plan

None - plan executed exactly as written.

The design-system.scss file already had most of the enhancements from a previous execution. This execution refined:

- Spacing values to match exact plan specifications
- Border radius values to match plan specifications
- Added the missing utility classes section

All changes align with plan requirements and mockup specifications.

## Testing Notes

- SCSS compiles without errors
- All CSS custom properties are properly generated
- Utility classes are available for use in components
- Fluid scaling works across 360px-1080px viewport range
- Pre-commit hooks validated all changes (lint-staged, TypeScript, prettier)

## Knowledge Transfer

### For Future Developers

- All design tokens are defined in `apps/game/assets/scss/design-system.scss`
- Use CSS custom properties in components: `var(--color-btn-green-light)`
- Utility classes available: `.text-embossed-gold`, `.title-display`, etc.
- Spacing scale uses fluid values - no need for media query overrides
- Text shadow presets provide mockup-aligned 3D effects

### Architecture Notes

- SCSS maps compile to CSS custom properties at build time
- Utility classes are generated at the end of the file
- All values are mockup-aligned for 1080x1920 base resolution
- Responsive scaling is built into the token definitions using clamp()
