---
phase: 01-design-tokens
plan: 01
subsystem: ui
tags: [unocss, css, utility-first, design-tokens, nuxt]

# Dependency graph
requires:
  - phase: 00-foundation
    provides: Base Nuxt 4 application with existing SCSS design system
provides:
  - UnoCSS utility-first CSS framework integrated with Nuxt 4
  - Preset-wind (Tailwind-compatible) utilities available throughout app
  - Theme extensions wired to existing SCSS CSS custom properties
  - Transformers for @apply directive and variant groups
affects: [01-02, 01-03, ui, components, pages]

# Tech tracking
tech-stack:
  added: [unocss@66.6.0, @unocss/nuxt@66.6.0]
  patterns: [Hybrid CSS approach - UnoCSS for utilities, SCSS for design tokens]

key-files:
  created:
    - apps/game/uno.config.ts
  modified:
    - apps/game/package.json
    - apps/game/nuxt.config.ts

key-decisions:
  - "Use UnoCSS preset-wind for Tailwind-compatible utilities"
  - "Wire theme.spacing and theme.borderRadius to existing SCSS CSS variables"
  - "Enable transformerDirectives for @apply in Vue SFCs"
  - "Safelist common utility classes for dynamic usage"

patterns-established:
  - "Design tokens live in SCSS as CSS variables, UnoCSS consumes them via theme extensions"
  - "UnoCSS module loads after Pinia/i18n, before PWA in Nuxt modules array"
  - "Content scanning configured for .vue, .ts, .tsx files"

# Metrics
duration: 10min
completed: 2026-01-31
---

# Phase 01 Plan 01: UnoCSS Integration Summary

**UnoCSS utility-first CSS engine integrated with preset-wind, wired to existing SCSS design tokens via theme extensions**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-31T18:32:27Z
- **Completed:** 2026-01-31T18:42:51Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- UnoCSS and @unocss/nuxt packages installed in game app devDependencies
- uno.config.ts created with preset-wind, transformers, and theme extensions
- UnoCSS module registered in Nuxt config for automatic style injection
- Spacing and border-radius utilities now reference SCSS CSS custom properties
- Utility classes like flex, gap-md, px-lg available throughout the application

## Task Commits

Each task was committed atomically:

1. **Task 1: Install UnoCSS Dependencies** - `2df43dd` (chore)
2. **Task 2: Create UnoCSS Configuration** - `e09f5b4` (feat)
3. **Task 3: Register UnoCSS Module in Nuxt Config** - `5125641` (feat)

## Files Created/Modified

- `apps/game/package.json` - Added unocss@66.6.0 and @unocss/nuxt@66.6.0 to devDependencies
- `apps/game/uno.config.ts` - Created with preset-wind, transformers (directives, variant groups), theme extensions for spacing/borderRadius mapped to SCSS variables, safelist for common utilities, content scanning for .vue/.ts/.tsx
- `apps/game/nuxt.config.ts` - Added @unocss/nuxt to modules array (after Pinia/i18n, before PWA)

## Decisions Made

**Design token approach:**

- UnoCSS theme extensions reference SCSS CSS custom properties instead of duplicating values
- Maintains single source of truth in design-system.scss
- UnoCSS provides utility classes, SCSS provides token values

**Module loading order:**

- @unocss/nuxt loads after @pinia/nuxt and @nuxtjs/i18n but before @vite-pwa/nuxt
- Ensures styles are available before PWA processes assets

**Utility safelisting:**

- Common utilities (flex, gap-md, p-lg, etc.) added to safelist
- Prevents purging of dynamically-applied classes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - installation and configuration proceeded smoothly without errors. Dev server starts successfully with UnoCSS module loaded.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 01 Plan 02 (Enhance SCSS Tokens):**

- UnoCSS integration complete and verified
- Can now enhance design-system.scss tokens knowing UnoCSS will consume them
- Theme extensions are wired and ready to reference new CSS variables

**Ready for Phase 01 Plan 03 (Wire & Verify):**

- Foundation in place for comprehensive verification
- Utility classes available for testing in components

**No blockers or concerns.**

---

_Phase: 01-design-tokens_
_Completed: 2026-01-31_
