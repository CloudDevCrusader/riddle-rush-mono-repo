---
phase: 21-refactor-and-fix-e2e-and-unit-tests
plan: '02'
subsystem: e2e-tests
tags: [testing, e2e, playwright, data-testid, refactor]
dependency_graph:
  requires: []
  provides: [stable-e2e-selectors]
  affects:
    [
      credits.spec.ts,
      language.spec.ts,
      results.spec.ts,
      offline.spec.ts,
      translations-check.spec.ts,
    ]
tech_stack:
  added: []
  patterns: [data-testid selectors, shared helper imports]
key_files:
  created: []
  modified:
    - apps/game/tests/e2e/credits.spec.ts
    - apps/game/tests/e2e/language.spec.ts
    - apps/game/tests/e2e/results.spec.ts
    - apps/game/tests/e2e/offline.spec.ts
    - apps/game/tests/e2e/translations-check.spec.ts
    - apps/game/tests/e2e/helpers/game-flow.ts
decisions:
  - 'Used filter({ hasText }) with data-testid^= prefix selectors for named credit sections/headings to preserve text-based verification while eliminating CSS class dependency'
  - 'Added waitForSplashComplete to game-flow.ts as exported function using data-testid splash-screen selector instead of duplicating it inline in credits.spec.ts'
  - "offline.spec.ts: replaced both .offline references (offlineIndicatorByClass variable) with [data-testid='offline-indicator'] to be consistent"
metrics:
  duration: '8 minutes'
  completed: '2025-01-01'
  tasks_completed: 5
  files_changed: 6
---

# Phase 21 Plan 02: Refactor E2E Specs to data-testid Selectors Summary

**One-liner:** Replaced all CSS class selectors in 5 E2E spec files with `data-testid` attributes and extracted `waitForSplashComplete` into the shared `game-flow.ts` helper.

## What Was Done

Refactored 5 E2E test files to eliminate fragile CSS class selectors (`.credits-page`, `.language-option`, `.scoring-page__score-value`, etc.) and replace them with stable `data-testid` attribute selectors. Also added shared helper imports from `game-flow.ts` to all 5 files.

### Files Changed

| File                         | Changes                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `game-flow.ts`               | Added exported `waitForSplashComplete` helper using `[data-testid="splash-screen"]`                |
| `credits.spec.ts`            | Removed local `waitForSplashComplete`, imported from game-flow; replaced 9 CSS selectors           |
| `language.spec.ts`           | Added `hideDevtools` import; replaced 8 CSS selectors across 2 test suites                         |
| `results.spec.ts`            | Added `hideDevtools` to imports; replaced 7 CSS selectors; used index-based testid for first entry |
| `offline.spec.ts`            | Added `hideDevtools` import; replaced `.offline` CSS selector                                      |
| `translations-check.spec.ts` | Added `hideDevtools` import; replaced 3 CSS selectors; added `hideDevtools(page)` call             |

### Selector Mapping Applied

**credits.spec.ts:**

- `.credits-page` → `[data-testid="credits-page"]`
- `.title-image` → `[data-testid="credits-title-image"]`
- `.credits-panel` → `[data-testid="credits-panel"]`
- `.credit-section` → `[data-testid^="credits-section-"]`
- `.section-heading` → `[data-testid^="credits-section-heading-"]`
- `.credit-name` → `[data-testid^="credits-name-"]`
- `.back-btn` → `[data-testid="credits-back-button"]`
- `.btn-ok` → `[data-testid="credits-ok-button"]`
- `.container` → `[data-testid="credits-container"]`
- `.page-bg` → `[data-testid="page-background"]`

**language.spec.ts:**

- `.language-option` → `[data-testid^="language-option-"]`
- `.flag-container, .flag-image` → `[data-testid^="language-flag-"]`
- `.checkmark` → `[data-testid^="language-checkmark-"]`
- `.ok-btn, button.ok-btn` → `[data-testid="language-ok-button"]`
- `.language-card` → `[data-testid="language-card"]`
- `.bg-pattern` → `[data-testid="page-background-pattern"]`
- `.options-btn` → `[data-testid="main-menu-options"]`
- `.menu-item` → `[data-testid^="menu-item-"]`

**results.spec.ts:**

- `.game-background` → `[data-testid="page-background"]`
- `.game-header` → `[data-testid="results-header"]`
- `.scoring-page__list` → `[data-testid="results-scores-container"]`
- `.scoring-page__player-entry` → `[data-testid^="results-player-entry-"]` / `[data-testid="results-player-entry-0"]`
- `.scoring-page__score-controls` → `[data-testid^="results-score-controls-"]`
- `.scoring-page__score-value` → `[data-testid^="results-score-display-"]`
- `.player-leaderboard` → `[data-testid="player-leaderboard"]`

**offline.spec.ts:**

- `.offline` → `[data-testid="offline-indicator"]`

**translations-check.spec.ts:**

- `.start-button` → `[data-testid="players-start-button"]`
- `.result-text` → `[data-testid="round-start-result"]`
- `.category-name` → `[data-testid="game-category-name"]`

## Commits

| Hash        | Message                                                        |
| ----------- | -------------------------------------------------------------- |
| `e9d66aee9` | `test(21-02): refactor E2E specs to use data-testid selectors` |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — these are test files only; no UI rendering stubs introduced.

## Self-Check: PASSED

- ✅ `apps/game/tests/e2e/credits.spec.ts` — modified, zero CSS class selectors, imports game-flow
- ✅ `apps/game/tests/e2e/language.spec.ts` — modified, zero CSS class selectors, imports game-flow
- ✅ `apps/game/tests/e2e/results.spec.ts` — modified, zero CSS class selectors, imports game-flow
- ✅ `apps/game/tests/e2e/offline.spec.ts` — modified, zero CSS class selectors, imports game-flow
- ✅ `apps/game/tests/e2e/translations-check.spec.ts` — modified, zero CSS class selectors, imports game-flow
- ✅ `apps/game/tests/e2e/helpers/game-flow.ts` — `waitForSplashComplete` exported
- ✅ Commit `e9d66aee9` verified in git log
