---
phase: 14-maintenance-quality-of-life
verified: 2026-03-21T23:45:00Z
status: gaps_found
score: 4/5 must-haves verified
re_verification: false
gaps:
  - truth: 'All user-facing text is replaced with i18n translation keys'
    status: partial
    reason: "leaderboard.vue still has hardcoded title: 'Leaderboard' and meta description: 'Game leaderboard' in useHead — not covered by plan 01 scope but required by ROADMAP success criterion SC1"
    artifacts:
      - path: 'apps/game/pages/leaderboard.vue'
        issue: "useHead({ title: 'Leaderboard', meta: [{ name: 'description', content: 'Game leaderboard' }] }) — hardcoded English strings not using t()"
    missing:
      - "Replace title: 'Leaderboard' with title: t('leaderboard.title') in leaderboard.vue useHead"
      - "Replace content: 'Game leaderboard' with t('leaderboard.description') and add the key to both de.json and en.json"
---

# Phase 14: Maintenance and Quality of Life Verification Report

**Phase Goal:** Address pending technical debt, bugs, and internationalization tasks to improve codebase health and stability.
**Verified:** 2026-03-21T23:45:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| #   | Truth                                                                            | Status   | Evidence                                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | All user-facing text is replaced with i18n translation keys                      | PARTIAL  | 8 of 9 pages converted; leaderboard.vue has hardcoded `title: 'Leaderboard'` and `content: 'Game leaderboard'` in useHead                                                                                                   |
| 2   | The multiplayer bug causing round skips is identified and resolved               | VERIFIED | Commit f205f0de3 introduced `currentPlayerIndex` field; both `stores/game.ts` and `stores/zustand/gameStore.ts` reset to 0 on `startNextRound` and `resetPlayerSubmissions`; `getCurrentPlayerTurn` uses index-based lookup |
| 3   | The game store's structure is reviewed and its complexity reduced where feasible | VERIFIED | Zustand store at 406 lines delegates to 5 composables (useCategoryManager, useSessionManager, usePlayerManager, usePersistence, useGameLifecycle); deferred deep refactor to Phase 19 per plan                              |
| 4   | The intermittent nuxi typecheck error is investigated and fixed                  | VERIFIED | Removed dead `ViteBundleManifest` import and no-op `build:manifest` hook from `apps/game/nuxt.config.ts` in commit 9d957d6dd; typecheck verified clean on 3 consecutive runs                                                |
| 5   | GitHub Actions CI/CD workflows reviewed and improved                             | VERIFIED | `deploy-dev.yml`: `if: always()` changed to `if: success()`, Trunk Check removed, pnpm store cache added; `comprehensive-ci-cd.yml` deleted; `optimized-ci-cd.yml` retained as canonical workflow                           |

**Score:** 4/5 truths verified (Truth 1 is partial)

---

## Required Artifacts

### Plan 01 — i18n Completion

| Artifact                                 | Expected                                                                 | Status   | Details                                                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/game/translations/locales/de.json` | German translations with new keys; merged duplicate sections             | VERIFIED | Contains `game.pause`, `game.round_start_title`, `game.round_start_description`, `home.page_title`; single `language`, `credits`, `settings` top-level blocks; 279 lines |
| `apps/game/translations/locales/en.json` | English translations matching de.json key structure                      | VERIFIED | All keys present with English values; same structure as de.json; 279 lines                                                                                               |
| `apps/game/pages/credits.vue`            | Uses t() for Back, Game Design, Programming, Art                         | VERIFIED | Lines 10, 13, 16, 22, 31, 40 all use `t()` calls; no hardcoded English strings remain                                                                                    |
| `apps/game/pages/splash.vue`             | Uses t('common.loading') for loading text                                | VERIFIED | Line 66: `{{ t('common.loading') }}`; `const { t } = useI18n()` in script setup                                                                                          |
| `apps/game/pages/game/[[gameId]].vue`    | Uses t() for pause aria-label, back alt, loading fallback, useHead title | VERIFIED | Lines 16, 30 use `t()`; useHead at line 313-321 uses `t('game.page_title')` and `t('game.meta_description')`                                                             |
| `apps/game/pages/round-start.vue`        | Uses t() for useHead title and description                               | VERIFIED | Lines 305, 309: `t('game.round_start_title')`, `t('game.round_start_description')`                                                                                       |
| `apps/game/pages/language.vue`           | Uses t() for back aria-label                                             | VERIFIED | Line 5: `:aria-label="t('common.back')"`                                                                                                                                 |
| `apps/game/pages/index.vue`              | Uses t() for useHead title                                               | VERIFIED | Line 118: `title: t('home.page_title')`                                                                                                                                  |

**Gap artifact:**

| Artifact                          | Expected                                        | Status | Details                                                                                                                                                                             |
| --------------------------------- | ----------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/game/pages/leaderboard.vue` | Uses t() for useHead title and meta description | STUB   | Lines 85-91: `title: 'Leaderboard'` and `content: 'Game leaderboard'` are hardcoded English strings; `leaderboard.title` key exists in both locale files but is not referenced here |

### Plan 02 — CI/CD Pipeline Fix

| Artifact                                    | Expected                                      | Status   | Details                                                                                                                                                        |
| ------------------------------------------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy-dev.yml`          | Quality gate fixed, pnpm cache, Trunk removed | VERIFIED | Line 59: `if: success()`; lines 77-83: `actions/cache@v4` with `~/.pnpm-store`; no `trunk` references in file; Trunk Check step absent from quality-checks job |
| `.github/workflows/comprehensive-ci-cd.yml` | Deleted                                       | VERIFIED | File does not exist; deleted in commit 9d957d6dd                                                                                                               |
| `.github/workflows/optimized-ci-cd.yml`     | Retained as canonical workflow                | VERIFIED | File exists                                                                                                                                                    |

### Plan 03 — Bug Fixes and Store Assessment

| Artifact                                    | Expected                                                    | Status   | Details                                                                                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/game/composables/usePlayerManager.ts` | Index-based `getCurrentPlayerTurn` and `advancePlayerIndex` | VERIFIED | `getCurrentPlayerTurn(players, currentPlayerIndex)` returns `players[currentPlayerIndex] ?? null` (line 157); `advancePlayerIndex` returns `currentIndex + 1` (line 169) |
| `apps/game/nuxt.config.ts`                  | Dead `ViteBundleManifest` import and no-op hook removed     | VERIFIED | No `ViteBundleManifest`, `vue-bundle-renderer`, or `build:manifest` references remain in file                                                                            |

---

## Key Link Verification

### Plan 01

| From                                  | To                             | Via                                                                                            | Status | Details                                                                                                |
| ------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `apps/game/pages/credits.vue`         | `translations/locales/de.json` | `t('credits.game_design')`, `t('credits.programming')`, `t('credits.art')`, `t('common.back')` | WIRED  | All calls present; keys exist in de.json (lines 66-70)                                                 |
| `apps/game/pages/game/[[gameId]].vue` | `translations/locales/de.json` | `t('game.page_title')`, `t('game.pause')`, `t('common.back')`                                  | WIRED  | `t('game.pause')` at line 30, `:alt="t('common.back')"` at line 16, `t('game.page_title')` at line 314 |

### Plan 02

| From                        | To                                  | Via                                          | Status | Details                                                                                  |
| --------------------------- | ----------------------------------- | -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `deploy-dev.yml deploy job` | `deploy-dev.yml quality-checks job` | `needs: quality-checks` with `if: success()` | WIRED  | Line 58: `needs: quality-checks`; line 59: `if: success()` — broken builds cannot deploy |

### Plan 03

| From                                  | To                                          | Via                                                                                            | Status | Details                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/game/pages/game/[[gameId]].vue` | `apps/game/composables/usePlayerManager.ts` | `currentPlayerTurn` from store which calls `getCurrentPlayerTurn(players, currentPlayerIndex)` | WIRED  | `currentPlayerTurn` used at lines 79, 84, 165, 221; store delegates to `getCurrentPlayerTurn` in both `game.ts` (line 62-64) and `gameStore.ts` (line 132-134) |

---

## Requirements Coverage

| Requirement    | Source Plan | Description                                                      | Status    | Evidence                                                                                    |
| -------------- | ----------- | ---------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| MAINT-I18N-01  | 14-01       | Complete i18n coverage for all pages                             | PARTIAL   | 8/9 pages converted; leaderboard.vue missing                                                |
| MAINT-CICD-01  | 14-02       | Fix CI/CD pipeline quality gate and cleanup                      | SATISFIED | deploy-dev.yml fixed; comprehensive-ci-cd.yml deleted                                       |
| MAINT-MULTI-01 | 14-03       | Investigate and confirm/fix multiplayer round-skip bug           | SATISFIED | Bug confirmed fixed by commit f205f0de3; index-based tracking verified in stores            |
| MAINT-TS-01    | 14-03       | Fix intermittent nuxi typecheck error                            | SATISFIED | Dead code removed from nuxt.config.ts; typecheck stable                                     |
| MAINT-STORE-01 | 14-03       | Review game store structure and reduce complexity where feasible | SATISFIED | Store assessed at 406 lines with 5 composable delegates; deep refactor deferred to Phase 19 |

---

## Anti-Patterns Found

| File                              | Line | Pattern                                                    | Severity | Impact                                                                |
| --------------------------------- | ---- | ---------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `apps/game/pages/leaderboard.vue` | 85   | `title: 'Leaderboard'` — hardcoded string in useHead       | Warning  | Leaderboard page title does not translate when user switches language |
| `apps/game/pages/leaderboard.vue` | 89   | `content: 'Game leaderboard'` — hardcoded meta description | Info     | Meta description not translated; lower priority (not visible in UI)   |

No stub implementations found. No `TODO`/`FIXME` comments in modified files. No empty handlers or placeholder returns.

---

## Human Verification Required

### 1. Multiplayer Round Progression

**Test:** Start a 3-player game. Player 1 submits an answer. Reload the page mid-round. Verify that Player 1's turn is not shown again and Player 2's input is shown.
**Expected:** After reload, `currentPlayerIndex` is restored from IndexedDB and the correct player's turn is displayed.
**Why human:** Page reload + IndexedDB restore path cannot be tested via static grep analysis.

### 2. Language Switching — Translation Completeness

**Test:** Switch app language to English, then navigate to Credits, Splash, Round Start, Game, and Index pages.
**Expected:** All page titles and user-facing text appear in English (no German strings leak through).
**Why human:** Runtime locale switching behavior cannot be verified statically.

### 3. CI/CD Pipeline Gate — Broken Build

**Test:** Push a commit with a TypeScript error to the `development` branch.
**Expected:** `quality-checks` job fails; `deploy` job does NOT run (blocked by `if: success()`).
**Why human:** Requires an actual GitHub Actions run on a branch with a real error.

---

## Gaps Summary

**1 gap blocking full ROADMAP criterion SC1 achievement:**

The ROADMAP success criterion SC1 states "All user-facing text is replaced with i18n translation keys." The plan 01 scope covered 6 pages explicitly and correctly handled all of them. However, `apps/game/pages/leaderboard.vue` was not included in the plan scope, and it retains two hardcoded English strings in `useHead()`:

- `title: 'Leaderboard'` — should be `title: t('leaderboard.title')` (key already exists in both locale files)
- `content: 'Game leaderboard'` — should use a translation key (e.g., `t('leaderboard.description')`) after adding the key to both locale files

This is a minimal fix: one key already exists, one needs to be added to de.json and en.json, and two lines in leaderboard.vue need to be updated. The fix is low-risk and does not require a new plan — it can be addressed as a gap closure task.

All other ROADMAP success criteria are fully verified in the codebase. The phase achieved 4/5 goal truths with strong evidence for each passing item.

---

_Verified: 2026-03-21T23:45:00Z_
_Verifier: Claude (gsd-verifier)_
