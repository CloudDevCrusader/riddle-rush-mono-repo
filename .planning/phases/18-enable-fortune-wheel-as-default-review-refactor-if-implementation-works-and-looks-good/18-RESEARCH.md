# Phase 18: Fortune Wheel Default, Warning Fixes, E2E Rework & Post-Zustand Refactoring - Research

**Researched:** 2026-03-22
**Domain:** Build warnings resolution, Nuxt auto-import deduplication, E2E test architecture, post-Zustand migration cleanup
**Confidence:** HIGH

## Summary

Phase 18 covers four interconnected workstreams that emerged after Phase 19 (Pinia to Zustand migration): (1) enabling fortune wheel as default, (2) fixing build warnings, (3) reworking the E2E test suite, and (4) post-Zustand cleanup. Research reveals that the fortune wheel is already enabled as the default (`fortuneWheelEnabled: true` in settingsStore, `isEnabled('fortune-wheel', true)` fallback in useFeatureFlags) -- this was completed during the earlier Phase 18 partial execution. The remaining work centers on concrete, auditable issues.

The most impactful issue is **19 duplicated import warnings** generated during `nuxi typecheck`. These stem from Nuxt's auto-import scanning `stores/`, `stores/hooks/`, and their barrel files (`index.ts`), which causes the same exports to be discovered from multiple paths simultaneously. The fix is structural: remove the barrel `index.ts` re-exports (since Nuxt auto-imports make them unnecessary) or exclude the `stores` directory from auto-import scanning.

The E2E test suite has **three systemic issues**: (1) 96 `waitForTimeout()` calls creating timing fragility, (2) massively duplicated helper functions across 4+ spec files (hideDevtools, navigateToResults, setupMultiplayerGame each defined 2-3 times), and (3) several tests depend on `answerInput` visibility which is behind the `isAnswerInputEnabled` feature flag (default: false), causing guaranteed failures when that flag is off. The E2E helpers infrastructure (`tests/e2e/helpers/`) is well-structured for Zustand (using `__zustand__` window global) and does NOT need migration -- the helpers were already updated during Phase 19.

**Primary recommendation:** Structure this phase as: (1) fix duplicated imports via store barrel file cleanup, (2) consolidate E2E helpers into the shared helpers directory, (3) fix E2E answer-input assumptions, (4) address remaining minor cleanup items.

## Standard Stack

### Core

| Library    | Version           | Purpose                     | Why Standard                         |
| ---------- | ----------------- | --------------------------- | ------------------------------------ |
| Zustand    | ^5.0.12 (current) | State management            | Already migrated in Phase 19         |
| Nuxt 4     | (project version) | Framework with auto-imports | Source of duplicated import warnings |
| Playwright | (project config)  | E2E testing                 | Existing E2E infrastructure          |
| Vitest     | (project config)  | Unit testing                | 734 tests all passing                |

### Supporting

| Library               | Version   | Purpose                                      | When to Use                    |
| --------------------- | --------- | -------------------------------------------- | ------------------------------ |
| `@riddle-rush/shared` | workspace | Shared constants (WHEEL_FADE_DELAY_MS, etc.) | Fortune wheel timing constants |

## Architecture Patterns

### Pattern 1: Nuxt Auto-Import Directory Scanning

**What:** `nuxt.config.ts` configures `imports.dirs: ['stores', 'stores/hooks', 'composables']`. Nuxt scans these directories and auto-imports all named exports. When `stores/index.ts` re-exports from `stores/settingsStore.ts` AND both files are in the scanned `stores/` directory, Nuxt sees the same export from two paths.

**Root cause of 19 warnings:**

```
stores/index.ts        re-exports -> settingsStore, gameStore, loadingStore, migrateFromPinia
stores/index.ts        re-exports -> useGameSession, useCategories, usePlayerActions, useInstallPrompt, useSettings, useLoading, GameSettings
stores/hooks/index.ts  re-exports -> same hooks + GameSettings
```

Each re-export creates a collision with the original source file that Nuxt also discovers.

**Fix approach:** Remove `stores/index.ts` barrel file. Nuxt auto-imports make it unnecessary -- consumers never need to write `import { gameStore } from '~/stores'` because Nuxt auto-imports `gameStore` directly from `stores/gameStore.ts`. The barrel file only exists for non-Nuxt contexts (tests, plugins), which use explicit imports anyway.

Similarly, `stores/hooks/index.ts` barrel can be removed since Nuxt auto-imports from the `stores/hooks/` directory.

**Warning:** The `plugins/zustand.ts` file uses explicit imports (`from '~/stores/gameStore'`), not auto-imports. This is correct and will continue working.

### Pattern 2: E2E Shared Helpers Architecture

**What:** The project already has a well-organized `tests/e2e/helpers/` directory with 7 modules (index.ts, waits.ts, assets.ts, diagnostics.ts, faker.ts, mobile.ts, realtime.ts). However, common game-flow operations (navigateToResults, setupMultiplayerGame, submitAllPlayerAnswers, hideDevtools, assignScores, confirmScoresAndWaitForModal) are defined locally in each spec file instead of in the shared helpers.

**Current duplication:**

- `hideDevtools()` -- defined in 3 spec files identically
- `navigateToResults()` -- defined in 3 spec files with near-identical code
- `setupMultiplayerGame()` -- defined in 2 spec files
- `submitAllPlayerAnswers()` -- defined in 2 spec files
- `assignScores()` / `assignScoresToPlayers()` -- defined in 2 spec files
- `confirmScoresAndWaitForModal()` -- defined in 2 spec files
- `goToNextRound()` / `continueToNextRound()` -- defined in 2 spec files
- `finishGame()` / `finishGameFromModal()` -- defined in 2 spec files

**Fix approach:** Create a new `tests/e2e/helpers/game-flow.ts` module that exports all these shared operations, then update spec files to import from helpers.

### Pattern 3: Feature-Flag-Aware E2E Tests

**What:** The game page's answer input field is behind `v-if="isAnswerInputEnabled"` (feature flag, default: false). Multiple E2E tests expect `[data-testid="game-answer-input"]` to be visible and attempt to `.fill()` it. These tests will fail when the answer-input flag is disabled.

**Affected tests:**

- `scoring-flow.spec.ts` -- `await expect(answerInput).toBeVisible()` + `fill('')`
- `scoring-ui.spec.ts` -- `page.locator('.answer-input')` + `fill()`
- `scoring-multi-round.spec.ts` -- same pattern
- `leaderboard.spec.ts` -- same pattern
- `game-complete-flow.spec.ts` -- `submitAllPlayerAnswers` fills input
- `full-game-workflow.spec.ts` -- `submitThreePlayerAnswers` fills input

**Fix approach:** The submit button (`[data-testid="game-submit-button"]`) is always visible regardless of the feature flag. Tests should:

1. Check if the answer input exists before filling
2. Always click the submit button (it works even without input when flag is off)
3. The shared helper should handle this branching logic once

### Pattern 4: Fortune Wheel Default is Already Enabled

**What:** The fortune wheel is already the default. From Phase 18's earlier partial execution:

- `settingsStore.ts` line 31: `fortuneWheelEnabled: true` (local default)
- `useFeatureFlags.ts` line 114: `isEnabled('fortune-wheel', true)` (GitLab fallback default)

**Remaining work:** Verify this is working correctly in the E2E tests. The `round-start.spec.ts` test already asserts wheel-default flow (line 54: `await expect(wheelsContainer).toBeVisible()`).

### Anti-Patterns to Avoid

- **waitForTimeout as a sync mechanism:** 96 instances across E2E tests. Replace with explicit state waits (`waitForSelector`, `waitForFunction`, Playwright's auto-waiting).
- **Duplicated local helpers:** Defining the same function in multiple spec files instead of sharing.
- **Barrel re-exports in Nuxt auto-import dirs:** Causes duplicated import warnings.

## Don't Hand-Roll

| Problem                         | Don't Build                  | Use Instead                          | Why                                |
| ------------------------------- | ---------------------------- | ------------------------------------ | ---------------------------------- |
| E2E game flow helpers           | Local functions in each spec | Shared `helpers/game-flow.ts` module | Already have helper infrastructure |
| Store auto-imports              | Custom import management     | Nuxt's built-in `imports.dirs`       | Framework handles it               |
| Feature flag branching in tests | Per-test conditionals        | Shared helper with flag detection    | Single point of change             |

## Common Pitfalls

### Pitfall 1: Removing barrel file breaks explicit imports in tests/plugins

**What goes wrong:** Removing `stores/index.ts` breaks any file that does `import { gameStore } from '~/stores'` or `import { settingsStore } from '~/stores'`.

**Why it happens:** Plugins and test files use explicit imports, not Nuxt auto-imports.

**How to avoid:** Before removing barrel files, grep for all explicit imports of `from '~/stores'` or `from '~/stores/hooks'` and update them to import from the specific source file (e.g., `from '~/stores/gameStore'`).

**Warning signs:** TypeScript compilation errors in plugins/ or tests/ after removing barrel files.

### Pitfall 2: E2E tests assume answer input is visible

**What goes wrong:** Tests fail with "Element not visible" when `isAnswerInputEnabled` is false (its default).

**Why it happens:** The input has `v-if="isAnswerInputEnabled"` but E2E tests don't check the flag.

**How to avoid:** E2E submit helper should check for input existence before attempting to fill, and always click the submit button.

### Pitfall 3: Fortune wheel timing in E2E creates race conditions

**What goes wrong:** Tests expecting `/round-start` URL may miss it because the wheel completes and navigates to `/game` too quickly, or too slowly for the timeout.

**Why it happens:** Fortune wheel spin duration + transition delays = variable total time.

**How to avoid:** Use `await expect(page).toHaveURL(/\/(round-start|game)/)` pattern (already used in `players.spec.ts` line 87) instead of strict `/round-start` assertion.

### Pitfall 4: `__zustand__` only exposed in dev mode

**What goes wrong:** E2E tests that use `page.evaluate(() => window.__zustand__)` fail when running against production builds.

**Why it happens:** `plugins/zustand.ts` line 21: `if (import.meta.dev && import.meta.client)`.

**How to avoid:** E2E tests currently run against dev server (`pnpm run dev`) so this works. If CI runs against built output, the `__zustand__` helpers will silently fail. Consider exposing in test mode too, or making helpers graceful when `__zustand__` is absent.

## Code Examples

### Duplicated Import Warning Root Cause

```typescript
// nuxt.config.ts -- this config causes the warnings
imports: {
  dirs: ['stores', 'stores/hooks', 'composables'],
},

// stores/index.ts -- barrel that re-exports (creates duplicates)
export { gameStore } from './gameStore'        // Nuxt also finds gameStore in stores/gameStore.ts
export { settingsStore } from './settingsStore' // Nuxt also finds settingsStore in stores/settingsStore.ts
export { useGameSession, ... } from './hooks'   // Nuxt also finds these in stores/hooks/*.ts
```

### Fix: Remove barrel re-exports

```typescript
// After fix: stores/index.ts should only contain non-auto-importable exports
// Or be removed entirely. Plugins use explicit paths:

// plugins/zustand.ts (already uses direct imports)
import { gameStore } from '~/stores/gameStore'
import { settingsStore } from '~/stores/settingsStore'
import { loadingStore } from '~/stores/loadingStore'
import { migrateFromPinia } from '~/stores/migrate'
```

### E2E Shared Helper Pattern

```typescript
// tests/e2e/helpers/game-flow.ts
import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function hideDevtools(page: Page) {
  await page.addStyleTag({
    content:
      '#nuxt-devtools-container, nuxt-devtools-frame { display: none !important; pointer-events: none !important; }',
  })
}

export async function submitPlayerAnswers(page: Page, count: number, answers?: string[]) {
  const submitBtn = page.locator('[data-testid="game-submit-button"]')

  for (let i = 0; i < count; i++) {
    // Answer input may not be visible (feature flag controlled)
    const answerInput = page.locator('[data-testid="game-answer-input"]')
    const isInputVisible = await answerInput.isVisible().catch(() => false)

    if (isInputVisible && answers?.[i] !== undefined) {
      await answerInput.fill(answers[i]!)
    }

    await expect(submitBtn).toBeEnabled({ timeout: 5000 })
    await submitBtn.click()

    if (i < count - 1) {
      await page.waitForTimeout(500) // Allow turn transition
    }
  }
}
```

## Detailed Warning Audit

### Duplicated Import Warnings (19 unique, repeated twice = 38 total output lines)

| Export Name        | Source A (ignored)                                                                                      | Source B (used)                    | Fix                      |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------ |
| `gameStore`        | `stores/gameStore.ts`                                                                                   | `stores/index.ts`                  | Remove from index.ts     |
| `settingsStore`    | `stores/index.ts`                                                                                       | `stores/settingsStore.ts`          | Remove from index.ts     |
| `loadingStore`     | `stores/index.ts`                                                                                       | `stores/loadingStore.ts`           | Remove from index.ts     |
| `migrateFromPinia` | `stores/index.ts`                                                                                       | `stores/migrate.ts`                | Remove from index.ts     |
| `GameSettings`     | `stores/index.ts` / `stores/settingsStore.ts` / `stores/hooks/index.ts` / `stores/hooks/useSettings.ts` | Last wins                          | Remove from all barrels  |
| `useGameSession`   | `stores/index.ts` / `stores/hooks/index.ts`                                                             | `stores/hooks/useGameSession.ts`   | Remove from both barrels |
| `useCategories`    | `stores/index.ts` / `stores/hooks/index.ts`                                                             | `stores/hooks/useCategories.ts`    | Remove from both barrels |
| `usePlayerActions` | `stores/index.ts` / `stores/hooks/index.ts`                                                             | `stores/hooks/usePlayerActions.ts` | Remove from both barrels |
| `useInstallPrompt` | `stores/index.ts` / `stores/hooks/index.ts`                                                             | `stores/hooks/useInstallPrompt.ts` | Remove from both barrels |
| `useSettings`      | `stores/index.ts` / `stores/hooks/index.ts`                                                             | `stores/hooks/useSettings.ts`      | Remove from both barrels |
| `useLoading`       | `stores/index.ts` / `stores/hooks/index.ts`                                                             | `stores/hooks/useLoading.ts`       | Remove from both barrels |

### ESLint Warnings

None. `pnpm run lint` passes cleanly with zero warnings.

### TypeScript Errors

None. `pnpm run typecheck` passes (only warnings, no errors).

### Unit Test Status

All 734 tests pass, 7 skipped. No failures.

## E2E Test Rework Audit

### Files Requiring Rework

| File                          | Issues                                                                   | Priority        |
| ----------------------------- | ------------------------------------------------------------------------ | --------------- | --- |
| `scoring-flow.spec.ts`        | Assumes answer input visible; `waitForTimeout(2000)` after round-start   | HIGH            |
| `scoring-ui.spec.ts`          | Uses `.answer-input` CSS class selector (fragile); assumes input visible | HIGH            |
| `scoring-multi-round.spec.ts` | Assumes answer input visible; strict `/round-start` URL assertions       | HIGH            |
| `leaderboard.spec.ts`         | Assumes answer input visible; fills input with text                      | HIGH            |
| `game-complete-flow.spec.ts`  | Assumes answer input visible; duplicated navigateToResults helper        | MEDIUM          |
| `full-game-workflow.spec.ts`  | Assumes answer input visible; duplicated helpers                         | MEDIUM          |
| `results.spec.ts`             | Strict `/round-start` URL assertion; old patterns                        | MEDIUM          |
| `round-start.spec.ts`         | Already updated for wheel-default; serial mode may cause slowness        | LOW             |
| `players.spec.ts`             | Already handles `/round-start                                            | game/` flexibly | LOW |
| `credits.spec.ts`             | No game flow; isolated test                                              | LOW             |
| `debug-console.spec.ts`       | No game flow; isolated test                                              | LOW             |
| `language.spec.ts`            | No game flow; isolated test                                              | LOW             |
| `offline.spec.ts`             | No game flow; isolated test                                              | LOW             |
| `translations-check.spec.ts`  | Already handles round-start                                              | game flexibly   | LOW |

### Systemic Issues to Fix

1. **96 `waitForTimeout()` calls** -- Replace with explicit state waits where possible
2. **3 copies of `hideDevtools()`** -- Move to shared helper
3. **3 copies of `navigateToResults()`** -- Move to shared helper
4. **Answer input assumption** -- Fix in shared helper, update all consumers
5. **`__zustand__` exposure is dev-only** -- Document limitation or extend to test builds

## Post-Zustand Cleanup Audit

### Pinia References Remaining

| Location                                | Type                                     | Action                                                           |
| --------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `stores/migrate.ts`                     | Migration utility (`migrateFromPinia()`) | KEEP -- needed for users upgrading from old Pinia-based versions |
| `plugins/zustand.ts`                    | Calls `migrateFromPinia()`               | KEEP -- one-time migration on startup                            |
| `tests/unit/settings-migration.spec.ts` | Tests for migration                      | KEEP -- validates migration works                                |

**No old Pinia patterns remain in app code.** No `defineStore`, `useSettingsStore`, `useGameStore`, `storeToRefs`, `setActivePinia`, `createPinia`, or `@pinia/nuxt` references exist in pages, components, composables, or plugins. The `pinia` package is not in any `package.json`.

### Store Pattern Issues

1. **`stores/index.ts` barrel file** -- Causes warnings, should be removed (see above)
2. **`stores/hooks/index.ts` barrel file** -- Same issue, should be removed
3. **Action references bound at hook creation time:** In `useSettings.ts` lines 96-106, actions are bound via `settingsStore.getState().updateSetting` etc. at composable creation time. This is a known Zustand pattern that works because actions are stable references, but it's worth documenting the pattern for future maintainers.

## Open Questions

1. **E2E test pass rate currently**
   - What we know: Unit tests all pass. E2E tests have structural issues (answer input assumption, timing).
   - What's unclear: Exact current E2E pass rate (would require running full suite against dev server).
   - Recommendation: Plan should include E2E run as first task to establish baseline, then fix.

2. **Whether to keep or remove Pinia migration utility**
   - What we know: `migrateFromPinia()` handles one-time localStorage format upgrade.
   - What's unclear: Whether any production users still have old Pinia format.
   - Recommendation: Keep for now. It's lightweight (50 lines) and runs once. Can be removed in a future cleanup phase.

3. **`__zustand__` exposure for CI E2E tests**
   - What we know: Currently dev-only (`import.meta.dev`). CI uses dev server.
   - What's unclear: Future CI changes might switch to built output.
   - Recommendation: Consider `import.meta.dev || import.meta.env.PLAYWRIGHT_TEST_BASE_URL` or similar.

## Validation Architecture

### Test Framework

| Property           | Value                                                            |
| ------------------ | ---------------------------------------------------------------- |
| Framework          | Vitest + Playwright                                              |
| Config files       | `apps/game/vitest.config.ts`, `apps/game/playwright.config.ts`   |
| Quick run command  | `pnpm run test`                                                  |
| Full suite command | `pnpm run workspace:check && pnpm run test && pnpm run test:e2e` |

### Phase Requirements to Test Map

| Behavior                        | Test Type   | Automated Command                                       | Status                |
| ------------------------------- | ----------- | ------------------------------------------------------- | --------------------- |
| Zero duplicated import warnings | build check | `pnpm run typecheck 2>&1 \| grep -c "WARN"` should be 0 | Currently 19 warnings |
| Fortune wheel is default        | E2E         | `round-start.spec.ts` already validates                 | PASS                  |
| All unit tests pass             | unit        | `pnpm run test`                                         | PASS (734/734)        |
| E2E suite passes reliably       | E2E         | `pnpm run test:e2e`                                     | Needs rework          |
| `workspace:check` clean         | integration | `pnpm run workspace:check`                              | PASS (warnings only)  |

### Sampling Rate

- **Per task commit:** `pnpm run workspace:check`
- **Per wave merge:** `pnpm run test && pnpm run workspace:check`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/e2e/helpers/game-flow.ts` -- consolidated game flow helpers (does not exist yet)
- None other -- existing test infrastructure covers all requirements

## Sources

### Primary (HIGH confidence)

- `apps/game/nuxt.config.ts` lines 92-94 -- auto-import dirs configuration causing warnings
- `apps/game/stores/index.ts` -- barrel file with re-exports (duplicated import source)
- `apps/game/stores/hooks/index.ts` -- barrel file with re-exports (duplicated import source)
- `apps/game/stores/settingsStore.ts` line 31 -- `fortuneWheelEnabled: true` (already default)
- `apps/game/composables/useFeatureFlags.ts` line 114 -- `isEnabled('fortune-wheel', true)` (already default)
- `apps/game/pages/game/[[gameId]].vue` line 88 -- `v-if="isAnswerInputEnabled"` (controls input visibility)
- `apps/game/plugins/zustand.ts` line 21 -- `__zustand__` exposure is dev-only
- `apps/game/tests/e2e/helpers/waits.ts` -- already uses `__zustand__` (Zustand-compatible)
- `pnpm run workspace:check` output -- 19 duplicated import warnings, 0 errors, 0 lint warnings
- `pnpm run test` output -- 734 passed, 7 skipped, 0 failed

### Secondary (MEDIUM confidence)

- E2E spec file analysis (14 spec files reviewed for patterns, duplication, and feature flag assumptions)
- `grep` analysis confirming zero remaining old Pinia patterns in app source code

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - directly derived from active repo implementation
- Architecture patterns: HIGH - confirmed via source code analysis and build output
- Warning audit: HIGH - based on actual `workspace:check` and `typecheck` output
- E2E rework: HIGH - based on direct file analysis, specific line references
- Pitfalls: HIGH - derived from concrete code patterns and known feature flag behavior

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable; no external dependency changes expected)
