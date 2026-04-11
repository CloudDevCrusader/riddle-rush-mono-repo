---
created: 2026-04-11T07:25:39.643Z
title: Review code, optimize weak points, minimize page reloads in game flow
area: ui
files:
  - apps/game/pages/results/[[gameId]].vue:16-23,322-337
  - apps/game/tests/e2e/helpers/game-flow.ts:201-280
  - apps/game/stores/gameStore.ts:147-149
  - apps/game/stores/hooks/useGameSession.ts:29
  - apps/game/composables/useGameState.ts
---

## Problem

During E2E test debugging, we discovered that the game flow uses full page reloads (`page.goto()` / `navigateTo()`) in several transitions, most notably when navigating to the results page. This causes:

1. **Async hydration race conditions** — The results page (`pages/results/[[gameId]].vue`) loads session data asynchronously in `onMounted`, but the `v-for` over `players` has no `v-if` guard. If `loadSessionById()` hasn't completed when the page renders, `players` is `[]` and zero player entries appear, causing E2E test failures.

2. **Unnecessary full-page navigations** — Some transitions between game pages trigger full reloads instead of client-side SPA navigation, adding latency and re-initializing state from IndexedDB unnecessarily.

3. **General code quality weak points** — Store loading patterns that don't guard against uninitialized state, missing loading states on async-dependent templates, and opportunities for cleaner data flow.

### Evidence from E2E failures

- 7+ E2E tests failed at `navigateToResults` (line 262 of `game-flow.ts`) because `results-player-entry-0` was not found after a `page.goto('/results/{gameId}')` reload.
- Fix applied: `expect.poll()` loop with store reload retries — this is a workaround, not a root cause fix.
- The app-side fix would be to prevent full reloads and/or add `v-if="players.length"` guards.

## Solution

1. **Audit all `navigateTo()` calls in game pages** — identify which trigger full reloads vs client-side navigation. Replace full reloads with `navigateTo()` using `{ replace: true }` or Vue Router `push()` where appropriate.

2. **Add template guards on async data** — Add `v-if` guards on templates that depend on async-loaded store data (e.g., `v-if="players.length > 0"` in results page, with a loading skeleton fallback).

3. **Review store initialization patterns** — Ensure stores expose loading states and that components wait for hydration before rendering data-dependent UI.

4. **General code review pass** — Address items from the existing code review todo (`code-review-2026-03-08.md`) that relate to navigation and state management (#7 round-start ghost session, #6 event listener cleanup, #15 busy-wait loop).
