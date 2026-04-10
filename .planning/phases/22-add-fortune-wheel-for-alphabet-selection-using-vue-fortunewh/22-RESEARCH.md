# Phase 22: Add fortune wheel for alphabet selection using vue-fortunewheel — Research

**Researched:** 2026-04-10  
**Domain:** Nuxt 4 + Vue 3 wheel interaction flow, library integration, UX fallback, testability  
**Confidence:** HIGH

## Summary

Phase 22 replaces the current round-start flip-through animation with an interactive fortune wheel experience for category + alphabet selection, using `vue-fortune-wheel`.

Current code already has a strong integration anchor:

- Route and flow exist at `apps/game/pages/round-start.vue`
- Feature-flag contract exists (`useFeatureFlags().isFortuneWheelEnabled`)
- Round start contract already routes through `advanceToConfiguredRound(category, letter)`
- E2E tests already target `/round-start` and tolerate both `/round-start` and `/game` transitions in helper flows

Primary implementation risks are:

1. Library compatibility with Vue 3 + Nuxt client runtime
2. Maintaining existing game-flow invariants while changing UI interaction model
3. Preserving deterministic tests when wheel animation adds async timing

Primary recommendation:

1. Add a **typed adapter contract** (`types/fortune-wheel.ts`) and composable selector logic first
2. Implement a dedicated `FortuneAlphabetWheel.vue` wrapper component (client-only safe)
3. Wire `round-start.vue` to consume the wrapper, while preserving fallback behavior when disabled/error
4. Add targeted unit + E2E coverage for deterministic verification

## Standard Stack

| Layer         | Choice                                            | Why                                          |
| ------------- | ------------------------------------------------- | -------------------------------------------- |
| Framework     | Nuxt 4 + Vue 3 (`<script setup lang=\"ts\">`)     | Existing project standard                    |
| State         | Pinia via existing `useGameState()` / `gameStore` | Existing round-start/game flow contract      |
| Styling       | Existing SCSS tokens + utilities                  | Matches current design system                |
| Wheel library | `vue-fortune-wheel`                               | Explicit phase requirement and roadmap scope |
| Tests         | Vitest + Playwright                               | Existing and required by AGENTS.md           |

## Architecture Patterns

### Pattern 1: Adapter-first library integration

Create internal types that normalize external wheel data and keep the rest of the app independent from the third-party component shape.

Recommended files:

- `apps/game/types/fortune-wheel.ts`
- `apps/game/composables/useFortuneWheelSelection.ts`

### Pattern 2: Keep game transition contract unchanged

Regardless of wheel UI internals, round start completion must still call:

- `gameStore.advanceToConfiguredRound(selectedCategory, selectedLetter)`
- then navigate with existing `goToGame(gameId?)`

This keeps downstream gameplay unaffected.

### Pattern 3: Feature-flag + fallback resilience

Respect existing precedence:

- If `isFortuneWheelEnabled` is false -> bypass wheel and continue current random-selection fallback
- If wheel fails/invalid result -> show toast error and provide retry path instead of hard crash

### Pattern 4: Test-visible deterministic hooks

Expose stable selectors for wheel flow:

- `data-testid="fortune-wheel-container"`
- `data-testid="fortune-wheel-spin-button"`
- `data-testid="fortune-wheel-selected-category"`
- `data-testid="fortune-wheel-selected-letter"`
- `data-testid="fortune-wheel-confirm-button"`

This keeps E2E resilient and avoids CSS selector fragility.

## Don't Hand-Roll

| Problem                  | Don’t build                  | Use instead                                   |
| ------------------------ | ---------------------------- | --------------------------------------------- |
| Spin animation engine    | Custom canvas wheel physics  | `vue-fortune-wheel` with wrapper component    |
| Store transition rewrite | New game-start orchestration | Existing `advanceToConfiguredRound()` flow    |
| Ad hoc test selectors    | class/text-based selection   | `data-testid` convention already used in repo |

## Common Pitfalls

1. **SSR/hydration mismatch**: wheel library may depend on browser APIs
   - Mitigation: render wheel client-side only in the component (`onMounted`/client-aware rendering path)

2. **Implicit timing assumptions in tests**:
   - Mitigation: assert for state transitions and selected artifacts, not fixed sleep durations

3. **Tight coupling to external prize shape**:
   - Mitigation: typed adapter contract in internal types + composable

4. **Breaking existing fallback semantics**:
   - Mitigation: preserve `isFortuneWheelEnabled` gate and random fallback branch explicitly

## Validation Architecture

### Test Framework

| Property           | Value                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Vitest + Playwright                                                                                                        |
| Config file        | `apps/game/vitest.config.ts`, `apps/game/playwright.config.ts`                                                             |
| Quick run command  | `pnpm --filter @riddle-rush/game test:unit -- tests/unit/composables/use-fortune-wheel-selection.spec.ts`                  |
| Full suite command | `pnpm run workspace:check && pnpm --filter @riddle-rush/game test:e2e -- tests/e2e/round-start.spec.ts --project=chromium` |
| Estimated runtime  | ~45-120s (targeted checks)                                                                                                 |

### Phase Verification Map

| Behavior                                                          | Test Type   | Automated Command                                                                                         |
| ----------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| Wheel selection composable produces valid category/letter result  | unit        | `pnpm --filter @riddle-rush/game test:unit -- tests/unit/composables/use-fortune-wheel-selection.spec.ts` |
| Wheel wrapper emits selected values and completion signal         | unit        | `pnpm --filter @riddle-rush/game test:unit -- tests/unit/components/fortune-alphabet-wheel.spec.ts`       |
| `/round-start` integrates wheel and reaches `/game` after confirm | e2e         | `pnpm --filter @riddle-rush/game test:e2e -- tests/e2e/round-start.spec.ts --project=chromium`            |
| No regressions in quality gates                                   | integration | `pnpm run workspace:check`                                                                                |

### Sampling Rate

- After each task commit: targeted unit/e2e command for touched area
- After wave completion: `pnpm run workspace:check`
- Before phase verification: targeted round-start e2e must be green

### Wave 0 Gaps

- [ ] `apps/game/tests/unit/composables/use-fortune-wheel-selection.spec.ts`
- [ ] `apps/game/tests/unit/components/fortune-alphabet-wheel.spec.ts`

## Sources

- `apps/game/pages/round-start.vue`
- `apps/game/composables/useFeatureFlags.ts`
- `apps/game/tests/e2e/round-start.spec.ts`
- `apps/game/tests/e2e/helpers/game-flow.ts`
- `apps/game/nuxt.config.ts`
- `/.planning/phases/22-add-fortune-wheel-for-alphabet-selection-using-vue-fortunewh/22-UI-SPEC.md`
- `https://github.com/XiaoLin1995/vue-fortune-wheel` (README API and props/events)
