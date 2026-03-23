---
phase: 15-visual-polish-animations-bug-fixes
plan: 04
subsystem: ui
tags:
  [fortune-wheel, css, animations, v-motion, page-transitions, vue, nuxt, design-system, gameheader]

# Dependency graph
requires:
  - phase: 15-visual-polish-animations-bug-fixes
    provides: Plan 01 — round-start.vue uses GameBackground wrapper
  - phase: 02-design-utilities
    provides: design-system.scss with --color-border-gold, --color-bg-blue-*, --font-display
  - phase: 18-enable-fortune-wheel-as-default-review-refactor-if-implementation-works-and-looks-good
    provides: FortuneWheel.vue component with segment rendering and spin logic
provides:
  - FortuneWheel redesigned with game-system blue/teal palette and gold embossed ring
  - CSS triangle pointer replacing emoji ▼
  - Fluid wheel sizing with min() and ≤400px override
  - index.vue uses GameHeader text instead of LOGO.png
  - Directional slide-left/slide-right page transitions via definePageMeta
  - Staggered v-motion entrance animations on menu buttons, player inputs, leaderboard items
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'v-motion stagger: hardcoded delays (0, 80, 160, 240ms) for non-v-for elements'
    - 'v-motion stagger: Number(index) * 80 for v-for elements (fixes TS2362)'
    - 'definePageMeta per page for named transitions (slide-left for forward, slide-right for back)'
    - 'CSS triangle via clip-path: polygon(50% 100%, 0% 0%, 100% 0%) + font-size: 0 to hide emoji fallback'

key-files:
  created: []
  modified:
    - apps/game/components/FortuneWheel.vue
    - apps/game/pages/index.vue
    - apps/game/pages/players.vue
    - apps/game/pages/leaderboard.vue
    - apps/game/app.vue
    - apps/game/pages/round-start.vue
    - apps/game/pages/settings.vue
    - apps/game/pages/game/[[gameId]].vue

key-decisions:
  - 'FortuneWheel uses 6 blue/teal tones (not 3) for better adjacent-segment contrast'
  - 'CSS pointer uses font-size:0 + clip-path to override emoji ▼ without changing template HTML'
  - 'Number(index) wrapper needed for v-motion :enter delay expression to avoid TS2362'
  - 'splash.vue loading bar already had correct styling — no changes needed for Part F'
  - 'Removed baseUrl from index.vue destructuring since LOGO.png reference was removed'

patterns-established:
  - 'Page transition direction: forward-nav pages use slide-left, back-nav pages use slide-right'
  - 'v-motion stagger delay: 80ms between sequential elements'
  - 'prefers-reduced-motion: 0ms transition fallback in app.vue for slide transitions'

requirements-completed: [POLISH-01, POLISH-03]

# Metrics
duration: 25min
completed: 2026-03-23
---

# Phase 15 Plan 04: FortuneWheel Redesign & Animations Summary

**Redesigned FortuneWheel with game-system blue palette and gold embossed ring, replaced LOGO.png with GameHeader text, added directional slide page transitions and staggered v-motion entrance animations**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-23
- **Completed:** 2026-03-23
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Redesigned FortuneWheel CSS: 6-tone blue/teal segment palette replacing rainbow colors, gold embossed outer ring using `--color-border-gold`, CSS triangle pointer via clip-path replacing ▼ emoji, gold gradient center hub, fluid sizing with `min(90vw, 90dvh, 420px)` and `@media (max-width: 400px)` override
- Removed 4 obsolete media query breakpoints (480px, 640px, 768px) — only ≤400px override remains
- Replaced LOGO.png image with `<GameHeader color="gold">RIDDLE RUSH</GameHeader>` text on index.vue
- Fixed CREDITS button from `variant="secondary"` to `variant="warning"` (orange)
- Added staggered v-motion entrance animations to 4 menu buttons (0/80/160/240ms), player input rows, and leaderboard items
- Implemented directional slide-left/slide-right CSS page transitions in app.vue with `definePageMeta` per page
- Added `prefers-reduced-motion` fallback with 0ms transitions

## Task Commits

All Phase 15 changes are currently uncommitted (pending batch commit after all plans complete):

1. **Task 1: FortuneWheel redesign** - FortuneWheel.vue CSS and defaultColors updated
2. **Task 2: index.vue fixes, page transitions, staggered animations** - index.vue, app.vue, players.vue, leaderboard.vue, round-start.vue, settings.vue, game/[[gameId]].vue updated

## Files Created/Modified

- `apps/game/components/FortuneWheel.vue` - Replaced rainbow defaultColors with 6 blue/teal tones, replaced entire `<style scoped>` with gold embossed ring (`border: clamp(6px, 2vw, 12px) solid var(--color-border-gold)`), CSS triangle pointer (clip-path + font-size:0), fluid container sizing, removed 4 obsolete media queries
- `apps/game/pages/index.vue` - Replaced LOGO.png with `<GameHeader color="gold">`, CREDITS button `variant="warning"`, added v-motion stagger to 4 menu buttons, removed `.logo-container`/`.logo-image` CSS, added `definePageMeta` for slide-right
- `apps/game/app.vue` - Added slide-left and slide-right CSS transitions using `translateX(30px)`, 250ms ease, with `prefers-reduced-motion` fallback. Removed generic `.page-enter/leave` rules.
- `apps/game/pages/players.vue` - Added `v-motion` with `Number(index) * 80` delay to player rows, added `definePageMeta` for slide-left
- `apps/game/pages/leaderboard.vue` - Added `v-motion` with `Number(index) * 80` delay to leaderboard rows, added `definePageMeta` for slide-left
- `apps/game/pages/round-start.vue` - Added `definePageMeta` for slide-left transition
- `apps/game/pages/settings.vue` - Added `definePageMeta` for slide-right transition
- `apps/game/pages/game/[[gameId]].vue` - Added `definePageMeta` for slide-left transition

## Decisions Made

- **6 blue tones instead of 3:** Plan suggested 3 alternating tones, but 6 tones provide better adjacent-segment contrast across varying segment counts. All tones are from the game design system palette.
- **CSS pointer technique:** Used `font-size: 0` to hide the ▼ emoji character while keeping it in HTML as accessibility/fallback. The visual pointer is a CSS-drawn gold gradient triangle using `clip-path: polygon(50% 100%, 0% 0%, 100% 0%)`.
- **TypeScript workaround:** `index * 80` in v-for template expressions with v-motion `:enter` caused TS2362 ("left-hand side of arithmetic must be number"). Wrapping with `Number(index) * 80` resolved it.
- **splash.vue Part F skipped:** The loading bar already had orange gradient fill and white border styling matching the mockup — no changes needed.
- **Removed baseUrl:** Since LOGO.png reference was removed from index.vue, the `baseUrl` destructuring from `useRuntimeConfig()` was also removed as it became unused.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - TypeScript] Number() wrapper for v-motion delay expression**

- **Found during:** Task 2 (adding v-motion to v-for elements)
- **Issue:** `index * 80` in `:enter="{ ... delay: index * 80 }"` caused TS2362 in strict mode
- **Fix:** Changed to `Number(index) * 80` in players.vue and leaderboard.vue
- **Files modified:** apps/game/pages/players.vue, apps/game/pages/leaderboard.vue
- **Verification:** pnpm run typecheck passes

**2. [Plan accuracy] splash.vue Part F was a no-op**

- **Found during:** Task 2 (checking splash.vue loading bar)
- **Issue:** Loading bar already had orange gradient fill and white border styling
- **Fix:** No changes needed — documented as already correct

---

**Total deviations:** 2 auto-fixed (1 TypeScript, 1 plan accuracy)
**Impact on plan:** Minor TypeScript fix. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 15 is fully complete across all 4 plans
- All visual polish requirements (POLISH-01 through POLISH-05) are addressed
- FortuneWheel, page transitions, and entrance animations are production-ready
- workspace:check passes, 759 unit tests pass

---

_Phase: 15-visual-polish-animations-bug-fixes_
_Completed: 2026-03-23_
