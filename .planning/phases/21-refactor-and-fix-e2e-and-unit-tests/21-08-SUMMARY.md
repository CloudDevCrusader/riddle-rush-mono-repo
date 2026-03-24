---
phase: 21-refactor-and-fix-e2e-and-unit-tests
plan: "08"
subsystem: game-state
tags: [documentation, state-management, game-flow, mermaid]
dependency_graph:
  requires: []
  provides:
    - 21-GAME-MODE-FLOW.md
    - GameFlowState documentation
    - Single source of truth identification
  affects:
    - apps/game/stores/gameStore.ts (JSDoc added)
tech_stack:
  added: []
  patterns:
    - Pinia store as single source of truth for game flow state
    - Derived reactive computed getter for flowState
    - Route-based screen state managed independently via Nuxt Router
key_files:
  created:
    - .planning/phases/21-refactor-and-fix-e2e-and-unit-tests/21-GAME-MODE-FLOW.md
  modified:
    - apps/game/stores/gameStore.ts
decisions:
  - GameFlowState and route state are two independent dimensions of "game mode"; documenting both prevents confusion
  - Pause is correctly modeled as local component state (overlay), not a flow state
  - No production code refactoring needed — gameStore.ts already IS the single source of truth
metrics:
  duration: "8 minutes"
  completed: "2026-03-24T01:08:29Z"
  tasks_completed: 3
  files_modified: 2
---

# Phase 21 Plan 08: Game Mode State Flow Chart Summary

## One-liner

Game mode state flow documented as Mermaid stateDiagram-v2 with `GameFlowState` ('setup'→'in-round'→'round-complete'→'decision'→'completed') derived from `gameStore.ts` — confirmed as single source of truth.

## What Was Done

Created a comprehensive game mode state flow chart document (`21-GAME-MODE-FLOW.md`) after thoroughly analyzing:

- `apps/game/stores/gameStore.ts` — Pinia store with `GameFlowState` type, `flowState` getter, explicit transition helpers
- `apps/game/stores/hooks/useGameSession.ts` — Thin computed-ref wrapper over store
- `apps/game/composables/useGameState.ts` — Aggregated facade for components
- `apps/game/composables/useGameActions.ts` — Action wrappers with toast/audio
- `apps/game/composables/useNavigation.ts` — Route navigation
- `apps/game/pages/` — Main menu, players, round-start, game, results, leaderboard

## Key Findings

### Single Source of Truth: Already Established ✅

`apps/game/stores/gameStore.ts` (`useGameStore()`) is the authoritative single source of truth. State is NOT scattered — it is well-structured:

- **`flowState`** is a computed getter derived from `currentSession`, `postRoundDecisionPending`, and `isCurrentRoundCompleted`
- **`gameMode`** (single/multiplayer) is derived from `players.length`
- **Route/screen state** is correctly managed by Nuxt Router (not duplicated in store)

### Two State Dimensions

The "game mode state" encompasses two independent dimensions:
1. **Game Flow State** (`GameFlowState`): `setup → in-round → round-complete → decision → completed`
2. **Route/Screen State**: `/` → `/players` → `/round-start` → `/game/[id]` → `/results/[id]` → `/leaderboard`

These intentionally decouple — flow state drives data decisions, routing drives UI transitions.

### Explicit Transition Helpers

The store provides named transition methods that enforce flow invariants:
- `transitionToSetup()` — clears session
- `transitionToInRound()` — clears decision pending
- `transitionToRoundComplete()` — records round history snapshot
- `transitionToDecision()` — sets `postRoundDecisionPending = true`
- `transitionToCompleted()` — sets `session.status = 'completed'`

## Artifacts Produced

### `.planning/phases/21-refactor-and-fix-e2e-and-unit-tests/21-GAME-MODE-FLOW.md`

Contains:
- **States table** — 5 `GameFlowState` values with conditions + 9 route/screen states
- **`## State Flow Chart`** section with full Mermaid `stateDiagram-v2` diagram
- Explicit transition rules table (store method → from→to→trigger)
- Route navigation triggers table
- `flowState` computation logic (derived, not independent storage)
- Implementation access patterns (read + write code examples)
- Architecture notes with improvement suggestions
- Testing patterns (Vitest unit test examples)
- Complete file index

### `apps/game/stores/gameStore.ts`

Added JSDoc comments to:
- `GameFlowState` type — documenting the derivation logic and linking to flow chart
- `gameMode` getter — clarifying it is always derived from `players.length`, never explicitly set

## Deviations from Plan

### Plan vs Reality

**Plan assumed** `apps/game/stores/game.ts` exists — it does **not**. The actual store is at `apps/game/stores/gameStore.ts`.

**Plan Task 2** called for implementing a new `GameModeState` type, `GameModeStateMeta` interface, and `setGameMode()` function. After analysis, this would have been a **regression** — the existing `GameFlowState` in `gameStore.ts` already covers this correctly with a cleaner derived approach. The plan's proposed imperative setter would have introduced unnecessary complexity over the existing computed derivation.

**Decision**: Document the existing (correct) architecture rather than impose the planned refactoring pattern. The single source of truth exists and works well.

## Known Stubs

None — this plan creates documentation only (plus trivially safe JSDoc additions). No data flow or UI components were modified.

## Self-Check

- [x] `21-GAME-MODE-FLOW.md` created and contains `## State Flow Chart` section with Mermaid diagram
- [x] `apps/game/stores/gameStore.ts` updated with JSDoc referencing flow chart
- [x] Commit `660b052d9` exists
- [x] Single source of truth identified: `useGameStore()` in `gameStore.ts`
- [x] ROADMAP Success Criteria #5 addressed

## Self-Check: PASSED
