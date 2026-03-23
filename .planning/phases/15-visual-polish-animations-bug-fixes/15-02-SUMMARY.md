---
phase: 15-visual-polish-animations-bug-fixes
plan: 02
subsystem: infra
tags: [figma, design-tokens, css-custom-properties, sync-pipeline, nuxt-config]

# Dependency graph
requires:
  - phase: 02-design-utilities
    provides: design-system.scss with CSS custom properties (--color-*, --font-size-*, --spacing-*)
provides:
  - Figma Variables API sync script (scripts/sync-figma-tokens.mjs)
  - Placeholder figma-tokens.generated.css override layer
  - CSS cascade override infrastructure (figma-tokens loaded after design-system.scss)
  - pnpm run figma:sync-tokens command
affects: [15-visual-polish-animations-bug-fixes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'CSS cascade override: figma-tokens.generated.css loaded after design-system.scss in nuxt.config.ts css array'
    - 'Figma variable name mapping: slash-separated Figma paths → hyphen-separated CSS custom properties'

key-files:
  created:
    - scripts/sync-figma-tokens.mjs
    - apps/game/assets/css/figma-tokens.generated.css
  modified:
    - apps/game/nuxt.config.ts
    - package.json

key-decisions:
  - 'Created apps/game/assets/css/ directory (did not previously exist)'
  - 'Script uses native fetch API (Node 18+) — no additional dependencies'
  - 'Graceful error handling: missing FIGMA_ACCESS_TOKEN or FIGMA_FILE_KEY prints helpful error and exits with code 1'

patterns-established:
  - 'Figma token sync pipeline: pnpm run figma:sync-tokens reads API → writes CSS overrides'
  - 'Generated CSS files use /* Auto-generated — DO NOT EDIT */ header comment'

requirements-completed: [POLISH-02]

# Metrics
duration: 10min
completed: 2026-03-23
---

# Phase 15 Plan 02: Figma Token Sync Pipeline Summary

**Created Figma Variables API sync script and CSS cascade override infrastructure for design token flow from Figma to CSS custom properties**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-23
- **Completed:** 2026-03-23
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments

- Created `scripts/sync-figma-tokens.mjs` that reads Figma Variables REST API, maps variable names to CSS custom property names, and writes output to figma-tokens.generated.css
- Created placeholder `apps/game/assets/css/figma-tokens.generated.css` with `:root` block ready for token overrides
- Wired figma-tokens.generated.css into nuxt.config.ts CSS array AFTER design-system.scss so cascade overrides work
- Registered `pnpm run figma:sync-tokens` in root package.json

## Task Commits

All Phase 15 changes are currently uncommitted (pending batch commit after all plans complete):

1. **Task 1: Create Figma token sync script and placeholder CSS file** - scripts/sync-figma-tokens.mjs and apps/game/assets/css/figma-tokens.generated.css created
2. **Task 2: Wire into nuxt.config.ts and register pnpm script** - nuxt.config.ts and package.json updated

## Files Created/Modified

- `scripts/sync-figma-tokens.mjs` - ES module Node.js script: reads FIGMA_ACCESS_TOKEN + FIGMA_FILE_KEY from env, fetches Figma Variables API, maps `/`-separated names to `--`-prefixed CSS custom properties, writes CSS output. Handles COLOR and FLOAT types, skips BOOLEAN/STRING.
- `apps/game/assets/css/figma-tokens.generated.css` - Placeholder CSS file with `:root` block and DO NOT EDIT header comment
- `apps/game/nuxt.config.ts` - CSS array updated: `['~/assets/scss/design-system.scss', '~/assets/css/figma-tokens.generated.css']`
- `package.json` (root) - Added `"figma:sync-tokens": "node scripts/sync-figma-tokens.mjs"` script

## Decisions Made

- Used native `fetch` API (Node 18+) to avoid adding dependencies — the project already requires Node 20+
- Created `apps/game/assets/css/` directory since it didn't exist (only `assets/scss/` existed previously)
- Placeholder file is valid CSS that can be safely loaded by Nuxt even before any sync has been run

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The `apps/game/assets/css/` directory did not exist and had to be created before writing the placeholder file. Minor file system prerequisite, not a plan issue.

## User Setup Required

To use the Figma sync pipeline, users need to set environment variables:

```bash
export FIGMA_ACCESS_TOKEN=your-figma-personal-access-token
export FIGMA_FILE_KEY=your-figma-file-key
pnpm run figma:sync-tokens
```

Without these variables, the script exits with a clear error message. The placeholder CSS file works fine without syncing.

## Next Phase Readiness

- Figma token pipeline is infrastructure-ready
- Any future design token changes in Figma can be synced with one command
- workspace:check passes

---

_Phase: 15-visual-polish-animations-bug-fixes_
_Completed: 2026-03-23_
