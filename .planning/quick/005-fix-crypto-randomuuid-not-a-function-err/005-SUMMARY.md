---
phase: quick-005
plan: 01
subsystem: ui
tags: [crypto, uuid, safari, cross-browser, web-crypto-api]

# Dependency graph
requires: []
provides:
  - Cross-browser UUID v4 generation utility (generateUUID)
  - Safari-safe game start without crypto.randomUUID TypeError
affects: [any future code generating UUIDs]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Native-first with fallback pattern for Web APIs'
    - 'Nuxt auto-import utility from utils/ directory'

key-files:
  created:
    - apps/game/utils/uuid.ts
  modified:
    - apps/game/composables/usePlayerManager.ts
    - apps/game/composables/useSessionManager.ts
    - services/GameService.ts

key-decisions:
  - 'Use crypto.getRandomValues() fallback instead of Math.random() for cryptographic safety'
  - 'Non-null assertions for Uint8Array indexed access under noUncheckedIndexedAccess'
  - 'Explicit throw when crypto global is entirely unavailable (ultra-old browsers)'

patterns-established:
  - 'generateUUID(): cross-browser UUID generation utility auto-imported via Nuxt utils/'

# Metrics
duration: 4min
completed: 2026-03-04
---

# Quick Task 005: Fix crypto.randomUUID TypeError Summary

**Cross-browser UUID v4 utility with native-first + getRandomValues fallback, replacing all 5 crypto.randomUUID() call sites to fix Safari crash on game start**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T16:34:58Z
- **Completed:** 2026-03-04T16:38:44Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `generateUUID()` utility with native `crypto.randomUUID()` first, `crypto.getRandomValues()` fallback
- Replaced all 5 `crypto.randomUUID()` call sites in production code (1 in usePlayerManager, 2 in useSessionManager, 2 in GameService)
- Game can now start on Safari < 15.4 and non-secure HTTP contexts without TypeError

## Task Commits

Each task was committed atomically:

1. **Task 1: Create cross-browser UUID utility** - `25d954c1d` (feat)
2. **Task 2: Replace all crypto.randomUUID() usages** - `82540829a` (fix)

## Files Created/Modified

- `apps/game/utils/uuid.ts` - Cross-browser UUID v4 generation with native-first + getRandomValues fallback
- `apps/game/composables/usePlayerManager.ts` - Replaced crypto.randomUUID() with generateUUID() (auto-imported)
- `apps/game/composables/useSessionManager.ts` - Replaced 2x crypto.randomUUID() with generateUUID() (auto-imported)
- `services/GameService.ts` - Replaced 2x crypto.randomUUID() with generateUUID() + explicit import

## Decisions Made

- Used `globalThis.crypto` instead of bare `crypto` for TypeScript type narrowing
- Added non-null assertions (`!`) for Uint8Array indexed access due to `noUncheckedIndexedAccess: true` in Nuxt tsconfig
- Added explicit error throw when `crypto` global is entirely unavailable (defensive, unlikely in browsers)
- Used same `~/utils/uuid` import alias pattern in GameService.ts as existing `~/types/game` import

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TypeScript `noUncheckedIndexedAccess` caused `Object is possibly 'undefined'` on `Uint8Array` indexing — resolved with non-null assertions since array size is guaranteed
- LSP errors in `services/GameService.ts` for `~/` alias are pre-existing (file is outside Nuxt app directory) and don't affect build

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All UUID generation now goes through `generateUUID()` utility
- Any future code needing UUIDs should use `generateUUID()` (auto-imported in game app, explicit import elsewhere)

---

_Quick Task: 005-fix-crypto-randomuuid-not-a-function-err_
_Completed: 2026-03-04_

## Self-Check: PASSED
