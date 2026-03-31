# Phase 14: Maintenance & Quality of Life - Research

**Researched:** 2026-03-21
**Domain:** i18n completeness, multiplayer bug investigation, game store review, TypeScript typecheck, GitHub Actions CI/CD
**Confidence:** HIGH (code read directly from repo)

---

## Summary

Phase 14 addresses four categories of technical debt that have accumulated across the visual redesign phases (1-13), plus a user-requested focus on improving the GitHub Actions deployment pipeline. Each area was investigated by reading the current source code directly.

The i18n work is well-scoped: most user-facing strings already use `t()`, but several pages have hardcoded fallback strings in `useHead` titles, `aria-label` attributes, and a few visible text nodes (credits section headings, splash "LOADING...."). The translation key infrastructure (`de.json`, `en.json`) is comprehensive — the work is adding missing keys and wiring them in, not building the system.

The multiplayer round-skip bug traces to `advancePlayerIndex` in `usePlayerManager`, which is intentionally non-wrapping (returns `currentIndex + 1` without modulo). If the index is not reset to `0` before a new round is shown, players can be skipped. The `startNextRound` action in the game store does reset `currentPlayerIndex = 0` but only after the round advances — timing and state read order in the game page are the likely culprit.

The game store (`stores/game.ts`, 344 lines) is already well-refactored: all logic is delegated to composable helpers (`useCategoryManager`, `useSessionManager`, `usePlayerManager`, `usePersistence`, `useGameLifecycle`). It functions as a thin orchestration layer. Further reduction is low ROI at this point.

The intermittent `nuxi typecheck` error is linked to `@vite-pwa/nuxt` type conflicts — a known issue referenced in STATE.md. The current nuxt.config.ts already imports `type { Manifest as ViteBundleManifest }` from `vue-bundle-renderer`, suggesting a prior partial fix attempt. Resolution likely requires a `@ts-expect-error` annotation or pinning the type version.

The GitHub Actions CI/CD setup has multiple workflow files that overlap (`tests.yml`, `deploy.yml`, `optimized-ci-cd.yml`, `comprehensive-ci-cd.yml`). The active production workflow is `deploy.yml` (triggers on main/PR). The `optimized-ci-cd.yml` and `comprehensive-ci-cd.yml` are near-identical duplicates. Key improvements available: consolidate workflows, add pnpm store caching to `deploy-dev.yml`, enforce typecheck as blocking in deploy.yml (it currently uses `workspace:check` which includes typecheck), and add deployment health verification.

**Primary recommendation:** Work sequentially — i18n first (mechanical, safe), then multiplayer bug fix (requires careful testing), then CI/CD cleanup (structural), then typecheck investigation (unpredictable effort).

---

## Standard Stack

### Core (Already in project)

| Library            | Version | Purpose              | Notes                                                   |
| ------------------ | ------- | -------------------- | ------------------------------------------------------- |
| `@nuxtjs/i18n`     | v10     | Internationalization | `restructureDir: '.'` — paths resolve from project root |
| `pinia`            | current | Game state store     | Being migrated to Zustand in Phase 19                   |
| `vitest`           | current | Unit tests           | Used in `apps/game/tests/unit/`                         |
| `@playwright/test` | current | E2E tests            | Used in `apps/game/tests/e2e/`                          |

### Supporting (GitHub Actions)

| Tool                         | Version | Purpose            | Notes                               |
| ---------------------------- | ------- | ------------------ | ----------------------------------- |
| `actions/cache@v4`           | v4      | pnpm store caching | Already used in optimized-ci-cd.yml |
| `pnpm/action-setup@v4`       | v4      | pnpm setup         | Already used everywhere             |
| `actions/upload-artifact@v4` | v4      | Test result upload | Used in some workflows              |

---

## Architecture Patterns

### i18n Pattern (Current project convention)

- Translation files: `apps/game/translations/locales/de.json` and `en.json`
- Key namespace: flat namespaces like `game.*`, `common.*`, `scoring.*`, `credits.*`
- Usage in Vue: `{{ t('key', 'Fallback text') }}` — fallback is the second argument
- `useHead` titles: currently NOT using `t()` (hardcoded strings)
- `aria-label` attributes: mixed — some use `t()`, some are hardcoded English strings

### Current i18n Key Coverage (Verified)

**Already covered by translation keys:**

- All game actions, error messages in `game.*` namespace
- Player setup in `players.*` namespace
- Scoring in `scoring.*` namespace
- Menu buttons in `menu.*` namespace
- Common UI in `common.*` namespace

**Hardcoded strings found (need i18n keys):**

| Location                        | Hardcoded Text                                 | Suggested Key                                                      |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| `pages/splash.vue:65`           | `LOADING....` (visible text)                   | `common.loading` (already exists as "Laden...")                    |
| `pages/splash.vue:57`           | `RIDDLE RUSH` (GameHeader content)             | App name — intentionally not translated, acceptable                |
| `pages/game/[[gameId]].vue:65`  | `: 'LOADING...'` (fallback in template)        | `common.loading`                                                   |
| `pages/game/[[gameId]].vue:314` | `title: 'Riddle Rush - Game'` (useHead)        | `game.page_title` (key exists in de.json)                          |
| `pages/game/[[gameId]].vue:30`  | `aria-label="Pause game"`                      | New key: `game.pause`                                              |
| `pages/index.vue:118`           | `title: 'Main Menu'` (useHead)                 | New key: `menu.title` (key exists as "Menü")                       |
| `pages/round-start.vue:305-309` | `title: 'Round Start'` + description (useHead) | New keys: `game.round_start_title`, `game.round_start_description` |
| `pages/credits.vue:13`          | `Back` (button text)                           | `common.back` (already exists)                                     |
| `pages/credits.vue:22`          | `Game Design` (section heading)                | `credits.game_design` (key exists)                                 |
| `pages/credits.vue:32`          | `Programming` (section heading)                | `credits.programming` (key exists)                                 |
| `pages/credits.vue:40`          | `Art` (section heading)                        | `credits.art` (key exists)                                         |
| `pages/language.vue:5`          | `aria-label="Go back"`                         | `common.back` (key exists)                                         |
| `pages/game/[[gameId]].vue:16`  | `alt="Back"` (img alt)                         | `common.back` (key exists)                                         |

**Keys that exist but are not wired up:** `credits.game_design`, `credits.programming`, `credits.art`, `credits.title`, `common.back`, `game.page_title`

**Missing translation keys (need adding to both locale files):**

- `game.pause` ("Pause game" / "Spiel pausieren")
- `game.round_start_title` ("Round Start" / "Rundenstart")
- `game.round_start_description` ("Spinning for category and letter" / "Dreht für Kategorie und Buchstabe")
- `home.page_title` ("Main Menu" / "Hauptmenü") — or reuse `menu.title`

### Multiplayer Round Skip Bug — Root Cause Analysis

**Context from STATE.md:** "Investigate multiplayer round flow skipping last player in round 1 (seen with 2-3 players)"

**How turn progression works (verified from code):**

1. `advancePlayerIndex(currentIndex, _playerCount)` in `usePlayerManager.ts:168` returns `currentIndex + 1` — no modulo wrapping by design
2. `currentPlayerTurn` getter returns `players[currentPlayerIndex] ?? null` — returns null when index >= player count (meaning all have gone)
3. `allPlayersSubmitted` checks `players.every(p => p.hasSubmitted)` — correct
4. The game page hides the answer input when `allPlayersSubmitted` is true OR `currentPlayerTurn` is null

**Likely bug location:** The NEXT button condition in the game page template:

```
v-if="allPlayersSubmitted || players.length === 0"
```

If a player submits and the index advances past the last player (index becomes `players.length`), `currentPlayerTurn` returns null. This hides the turn indicator but `allPlayersSubmitted` may not yet be true if one player's `hasSubmitted` isn't set correctly. The NEXT button only shows when `allPlayersSubmitted` OR no players at all.

**Secondary concern:** When `submitPlayerAnswer` is called for the last player, the index advances to `players.length`. This leaves `currentPlayerTurn` as null and hides the form. But `allPlayersSubmitted.value` check happens AFTER the submit — if there's a reactivity lag in the store getter, the NEXT button might not appear immediately.

**Verified flow gap:** After the last player submits, the page should auto-navigate or show the NEXT button. Currently the NEXT button uses `v-if="allPlayersSubmitted || players.length === 0"` — this should work. The bug may manifest on page reload when `currentPlayerIndex` is restored from IndexedDB but the players haven't reset `hasSubmitted`. This aligns with quick task #007: "Fix page reload on game start causing wrong player."

**Investigation approach for plan:** Add logging around `submitPlayerAnswer` and `allPlayersSubmitted` to confirm which player is being skipped, then trace whether the IndexedDB restore of `currentPlayerIndex` is the source.

### Game Store Complexity Assessment

**Current state (verified):** `stores/game.ts` is 344 lines. The store was already refactored in Phase 12 — all complex logic is in composables:

- `useCategoryManager` — category fetch, random selection, display count
- `useSessionManager` — session creation, cloning
- `usePlayerManager` — player CRUD, turn progression, leaderboard
- `usePersistence` — IndexedDB read/write
- `useGameLifecycle` — statistics updates, round results

**Assessment:** The store is already lean. It delegates everything non-trivial. Further reduction options are minimal:

- Could merge `endGame` and `completeGame` (very similar) but they have different semantics (end=clear session, complete=keep session for leaderboard)
- Could remove `resumeOrStartNewGame` (single use, trivial)
- Could flatten `resetPlayerSubmissions` into `startNextRound`

**Recommendation for plan:** Document the store is already well-structured. Defer deep refactor to Phase 19 (Pinia-to-Zustand migration) where the store will be rewritten anyway. Only fix obvious structural issues if found.

### TypeScript / nuxi typecheck Error

**Context from STATE.md:** "Investigate and fix intermittent `nuxi typecheck` error related to `@vite-pwa/nuxt`"

**Evidence in codebase:** `nuxt.config.ts` line 7 imports `type { Manifest as ViteBundleManifest } from 'vue-bundle-renderer'` — this import exists but `ViteBundleManifest` is not used in the visible code fragment, suggesting it was added to satisfy a type reference.

**Known pattern in this project:** `@ts-expect-error` is already the established approach for cross-package vite/rollup Plugin type conflicts (documented in STATE.md decisions).

**Investigation strategy for plan:**

1. Run `pnpm run typecheck` locally and capture the exact error message
2. Check if error is in `nuxt.config.ts` or in a generated `.nuxt/` file
3. If in `.nuxt/` generated types, the fix is either a `@ts-expect-error` in `nuxt.config.ts` or a type augmentation in `apps/game/types/`
4. If intermittent: likely a generated type file that changes between runs — could be fixed by checking out a fresh `.nuxt/` directory

**Common cause:** `@vite-pwa/nuxt` augments the `NuxtConfig` type and sometimes generates incompatible `VitePlugin` types from `vite-plugin-pwa`. The `vue-bundle-renderer` `Manifest` type is unrelated and may be a red herring.

### GitHub Actions CI/CD — Current State and Improvement Areas

**Active workflows (verified):**

| File                      | Trigger                      | Purpose                                            | Status                                 |
| ------------------------- | ---------------------------- | -------------------------------------------------- | -------------------------------------- |
| `tests.yml`               | push/PR to main              | Typecheck + lint + unit tests                      | Non-blocking (continue-on-error: true) |
| `deploy.yml`              | push to main, PR to main/dev | Quality checks + Vercel deploy + E2E               | Primary production workflow            |
| `deploy-dev.yml`          | push to development          | Quality checks + AWS deploy                        | Development environment                |
| `optimized-ci-cd.yml`     | push/PR to main/dev          | Full pipeline (quality+test+build+security+deploy) | Duplicate of comprehensive             |
| `comprehensive-ci-cd.yml` | push/PR to main/dev          | Same as optimized                                  | Redundant duplicate                    |
| `cleanup-deployments.yml` | (unknown trigger)            | Cleanup stale deployments                          | Ancillary                              |

**Key Problems Identified:**

1. **Workflow duplication:** `optimized-ci-cd.yml` and `comprehensive-ci-cd.yml` are near-identical (both verified by reading). Both run on push to main and development. This doubles CI minutes with no differentiation.

2. **`tests.yml` is non-blocking:** The quality job has `continue-on-error: true`, meaning typecheck failures don't block anything. Low signal-to-noise ratio.

3. **`deploy.yml` duplicates quality-check work:** It runs `pnpm run workspace:check` (typecheck + lint + syncpack), which is also done by `tests.yml` when it triggers. For a push to main, both workflows trigger, running checks twice.

4. **pnpm store cache missing in `deploy-dev.yml`:** The dev AWS workflow does not have the pnpm store cache step that `optimized-ci-cd.yml` has. Every dev deployment does a fresh `pnpm install` from registry.

5. **No deployment health check:** After Vercel deploy in `deploy.yml`, there is no HTTP smoke test to confirm the deployment URL returns 200. The E2E step only runs on push to main (not PRs) and is non-blocking.

6. **Security scan is a no-op:** `optimized-ci-cd.yml` security-scan step runs `pnpm audit --prod` (non-blocking) then echoes "security checks completed." There's no actual additional tool configured.

7. **`deploy-dev.yml` has `if: always()` on deploy job:** The deploy step runs even when quality checks fail, due to `if: always()`. This can deploy broken code to the development environment.

8. **Trunk Check in deploy-dev.yml:** `deploy-dev.yml` uses `trunk-io/trunk-action@v1` which is not used elsewhere. This is a third-party linting platform dependency not documented in CLAUDE.md or AGENTS.md.

**Recommended CI/CD improvements:**

| Improvement                            | File                                                                      | Change                                                 |
| -------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Consolidate to one primary workflow    | Delete `comprehensive-ci-cd.yml`, keep `optimized-ci-cd.yml` as canonical | Remove duplication                                     |
| Add pnpm store cache to deploy-dev.yml | `deploy-dev.yml`                                                          | Copy cache step from optimized-ci-cd.yml               |
| Fix deploy-dev quality gate            | `deploy-dev.yml`                                                          | Change `if: always()` to `if: success()` on deploy job |
| Add deployment health check            | `deploy.yml`                                                              | `curl --fail <URL>` after Vercel deploy step           |
| Make tests.yml blocking                | `tests.yml`                                                               | Remove `continue-on-error: true` from quality job      |
| Document active workflow               | CLAUDE.md update                                                          | Clarify which workflow is canonical                    |

---

## Don't Hand-Roll

| Problem                              | Don't Build                 | Use Instead                                                                           |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------- |
| Translation key lookup with fallback | Custom string resolution    | `t('key', 'fallback')` — @nuxtjs/i18n already provides this                           |
| TypeScript error suppression         | Complex type augmentation   | `@ts-expect-error` with comment — established pattern in this project                 |
| pnpm cache in CI                     | Custom caching logic        | `actions/cache@v4` with `~/.pnpm-store` path — already pattern in optimized-ci-cd.yml |
| HTTP health check after deploy       | Custom verification service | `curl --fail --retry 3 <URL>` in bash step                                            |

---

## Common Pitfalls

### Pitfall 1: Missing translation keys in en.json when adding to de.json

**What goes wrong:** Adding a key only to `de.json` causes the English locale to show the key string literal or fallback, depending on how `t()` is called.
**Why it happens:** Manual key management without tooling.
**How to avoid:** Always update both `apps/game/translations/locales/de.json` AND `apps/game/translations/locales/en.json` in the same commit.
**Warning signs:** English display shows `key.name` text or the second-argument fallback instead of a translated string.

### Pitfall 2: Duplicate translation key sections in de.json

**What goes wrong:** `de.json` already has both `"language"` and `"settings"` keys defined TWICE (lines 160-163 and 221-225 for language; lines 211-219 and 288-300 for settings). JSON parsers use the last definition — the earlier keys are silently ignored.
**How to avoid:** When editing de.json, grep for the key namespace before adding. Merge the duplicate sections as part of this phase.
**Impact:** Translation keys defined in the first (earlier) block are effectively dead and unreachable.

### Pitfall 3: i18n `restructureDir` causes wrong path resolution

**What goes wrong:** If `restructureDir` is changed or removed, all locale file paths break silently.
**Prevention:** Keep `restructureDir: '.'` in nuxt.config.ts. Translation files are at `apps/game/translations/locales/` — paths are set in the i18n config at `apps/game/translations/i18n.config.ts`.

### Pitfall 4: advancePlayerIndex skips wrap-around for multiplayer

**What goes wrong:** `advancePlayerIndex` does NOT wrap — it returns `currentIndex + 1` without modulo. When a session is restored from IndexedDB with `currentPlayerIndex` already at `players.length`, the first submit goes to index `players.length + 1` which is null.
**Prevention:** Always call `resetPlayerRoundState` before displaying the game page for a new round. Verify that `startNextRound` resets `currentPlayerIndex = 0` before `saveSessionToDB()` is called.

### Pitfall 5: GitHub Actions workflow duplication causes confusion

**What goes wrong:** Multiple workflows triggered on the same event run the same jobs in parallel, consuming CI minutes and making the Actions tab hard to read.
**Prevention:** Remove one of `optimized-ci-cd.yml` / `comprehensive-ci-cd.yml`. Ensure only one workflow handles each event.

### Pitfall 6: deploy-dev.yml deploys even when quality checks fail

**What goes wrong:** The deploy job has `if: always()` — it runs regardless of whether quality checks pass or fail. Broken code gets deployed to dev.
**Prevention:** Change to `if: success()` or `if: needs.quality-checks.result == 'success'`.

---

## Code Examples

### i18n key addition pattern (both locale files)

```json
// apps/game/translations/locales/de.json — add inside "game" block:
"pause": "Spiel pausieren",
"round_start_title": "Rundenstart",
"round_start_description": "Dreht für Kategorie und Buchstabe"

// apps/game/translations/locales/en.json — same keys, English values:
"pause": "Pause game",
"round_start_title": "Round Start",
"round_start_description": "Spinning for category and letter"
```

### useHead with i18n (target pattern)

```typescript
// Source: current project pattern — verified in credits.vue
useHead({
  title: t('game.page_title'), // key already exists in de.json
  meta: [{ name: 'description', content: t('game.meta_description') }],
})
```

### Hardcoded string replacement pattern (credits.vue)

```vue
<!-- Before -->
<h2 class="section-heading">Game Design</h2>

<!-- After -->
<h2 class="section-heading">{{ t('credits.game_design') }}</h2>
```

### pnpm store cache step for GitHub Actions

```yaml
# Source: apps/game/.github/workflows/optimized-ci-cd.yml — verified
- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

### Deployment health check pattern

```yaml
- name: Verify deployment health
  if: steps.deploy.outputs.url != ''
  run: |
    curl --fail --retry 3 --retry-delay 5 "${{ steps.deploy.outputs.url }}"
    echo "Deployment health check passed"
```

### Fixing deploy-dev quality gate

```yaml
# In .github/workflows/deploy-dev.yml — change from:
deploy:
  needs: quality-checks
  if: always()

# To:
deploy:
  needs: quality-checks
  if: success()
```

---

## State of the Art

| Old Approach                  | Current Approach                    | Notes                                       |
| ----------------------------- | ----------------------------------- | ------------------------------------------- |
| CircleCI CI/CD                | GitHub Actions (Vercel deploy)      | Migrated in quick task (completed)          |
| npm-based test workflows      | pnpm/turbo quality checks           | Migrated (completed)                        |
| Pinia stores (monolithic)     | Composable-delegating Pinia store   | Phase 12 refactor complete                  |
| Single all-in-one CI workflow | Parallel jobs with dependency graph | Done in optimized-ci-cd.yml, but duplicated |

**Deprecated/outdated in this codebase:**

- `comprehensive-ci-cd.yml`: Exact duplicate of `optimized-ci-cd.yml` — should be removed
- `tests.yml`: Redundant with `deploy.yml` quality-checks job — consolidate or remove

---

## Open Questions

1. **Which workflow file is the "canonical" one that the team monitors?**
   - What we know: `deploy.yml` is triggered on push to main and handles Vercel deploy. `optimized-ci-cd.yml` also triggers on main push.
   - What's unclear: Both run simultaneously. Is one intentionally kept as fallback?
   - Recommendation: Ask or decide — delete the duplicate, use `deploy.yml` as canonical with the improvements listed above.

2. **Is the multiplayer round-skip reproducible with current code?**
   - What we know: The bug was logged in STATE.md. Quick task #007 fixed a related "wrong player on page reload" bug.
   - What's unclear: Whether the original round-skip bug is still present after the #007 fix.
   - Recommendation: Reproduce manually with 2-3 players before implementing a fix. If not reproducible, document as resolved by #007.

3. **What exact error does `nuxi typecheck` produce intermittently?**
   - What we know: Related to `@vite-pwa/nuxt`. The fix direction is `@ts-expect-error`.
   - What's unclear: Whether the error is in project source files or in generated `.nuxt/` types.
   - Recommendation: Run `pnpm run typecheck` in CI or locally after a clean install to capture the exact error before writing a fix task.

4. **Should the Trunk Check in deploy-dev.yml be removed?**
   - What we know: `trunk-io/trunk-action@v1` is only in `deploy-dev.yml` — not mentioned in any docs.
   - What's unclear: Whether anyone is using the Trunk dashboard.
   - Recommendation: Remove it unless there's a known dependency. It adds external service coupling not documented elsewhere.

---

## Validation Architecture

### Test Framework

| Property           | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Framework          | Vitest (unit), Playwright (E2E)                                |
| Config file        | `apps/game/vitest.config.ts`, `apps/game/playwright.config.ts` |
| Quick run command  | `pnpm run test:unit`                                           |
| Full suite command | `pnpm run test:unit && pnpm run test:e2e`                      |

### Phase Requirements → Test Map

| Req ID                 | Behavior                               | Test Type           | Automated Command          | File Exists?                 |
| ---------------------- | -------------------------------------- | ------------------- | -------------------------- | ---------------------------- |
| i18n completeness      | All hardcoded strings replaced         | Manual visual check | `pnpm run workspace:check` | N/A                          |
| Multiplayer round skip | 2-3 player game completes all turns    | E2E smoke           | `pnpm run test:e2e`        | Partial — check `tests/e2e/` |
| Game store review      | Store actions still work after changes | Unit                | `pnpm run test:unit`       | Existing                     |
| TypeScript typecheck   | `nuxi typecheck` passes clean          | CI                  | `pnpm run typecheck`       | N/A                          |
| CI/CD improvement      | Workflows run without duplication      | Manual review       | N/A                        | N/A                          |

### Sampling Rate

- **Per task commit:** `pnpm run workspace:check`
- **Per wave merge:** `pnpm run test:unit`
- **Phase gate:** Full workspace:check + unit tests pass before `/gsd:verify-work`

---

## Sources

### Primary (HIGH confidence)

- Direct code read: `apps/game/stores/game.ts` — game store structure (344 lines)
- Direct code read: `apps/game/composables/usePlayerManager.ts` — multiplayer turn logic
- Direct code read: `apps/game/pages/game/[[gameId]].vue` — game page template and script
- Direct code read: `apps/game/pages/results/[[gameId]].vue` — scoring page
- Direct code read: `apps/game/translations/locales/de.json` — translation key inventory
- Direct code read: `.github/workflows/*.yml` — all 7 workflow files
- Direct code read: `apps/game/nuxt.config.ts` — module configuration

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — pending todos and bug reports
- `.planning/ROADMAP.md` — phase definition and success criteria

---

## Metadata

**Confidence breakdown:**

- i18n audit: HIGH — code read directly, exact file locations documented
- Multiplayer bug root cause: MEDIUM — code traced, but not reproduced at runtime; quick task #007 may have already fixed it
- Game store assessment: HIGH — code read directly, structure is clear
- TypeScript typecheck error: LOW-MEDIUM — exact error not captured at runtime, investigation approach is sound
- GitHub Actions analysis: HIGH — all 7 workflow files read directly

**Research date:** 2026-03-21
**Valid until:** 2026-04-20 (30 days — workflow files and page structure are stable)
