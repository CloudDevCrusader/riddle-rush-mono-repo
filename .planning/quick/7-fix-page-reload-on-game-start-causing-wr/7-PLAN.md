---
phase: quick-007
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/types/src/game.ts
  - apps/game/composables/usePlayerManager.ts
  - apps/game/composables/useSessionManager.ts
  - apps/game/stores/game.ts
  - apps/game/tests/unit/game-store.spec.ts
  - apps/game/tests/unit/reactivity-improvements.spec.ts
autonomous: true
requirements: [FIX-007]

must_haves:
  truths:
    - 'After round reset, the correct player (index 0) is selected as current turn'
    - 'After a player submits, currentPlayerTurn advances to the next player by index'
    - 'currentPlayerIndex persists to IndexedDB with the session'
    - 'Page reload on game start does not cause wrong player selection'
  artifacts:
    - path: 'packages/types/src/game.ts'
      provides: 'GameSession with currentPlayerIndex field'
      contains: 'currentPlayerIndex'
    - path: 'apps/game/composables/usePlayerManager.ts'
      provides: 'Index-based getCurrentPlayerTurn and advancePlayerTurn'
    - path: 'apps/game/stores/game.ts'
      provides: 'Store getter and actions using currentPlayerIndex'
  key_links:
    - from: 'apps/game/stores/game.ts'
      to: 'apps/game/composables/usePlayerManager.ts'
      via: 'getCurrentPlayerTurn uses currentPlayerIndex'
      pattern: 'currentPlayerIndex'
    - from: 'apps/game/stores/game.ts'
      to: 'packages/types/src/game.ts'
      via: 'GameSession type includes currentPlayerIndex'
      pattern: 'currentPlayerIndex'
---

<objective>
Fix the bug where page reload during game start causes wrong player selection.

Purpose: The current `getCurrentPlayerTurn()` picks the first player with `hasSubmitted === false`, which always defaults to player[0] after round resets. Adding an explicit `currentPlayerIndex` to GameSession provides deterministic player turn tracking that survives resets and page reloads.

Output: Bug-fixed player turn logic with `currentPlayerIndex` field on GameSession, persisted to IndexedDB.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@packages/types/src/game.ts
@apps/game/composables/usePlayerManager.ts
@apps/game/composables/useSessionManager.ts
@apps/game/stores/game.ts
@apps/game/pages/game/[[gameId]].vue
@apps/game/pages/round-start.vue

<interfaces>
<!-- Key types and contracts the executor needs -->

From packages/types/src/game.ts:

```typescript
export interface GameSession {
  id: string
  userId?: string
  gameName?: string
  players: Player[]
  currentRound: number
  category: Category
  letter: string
  startTime: number
  endTime?: number
  score?: number
  attempts?: GameAttempt[]
  status: 'active' | 'completed' | 'abandoned'
  roundHistory: Array<{...}>
}

export interface Player {
  id: string
  name: string
  totalScore: number
  currentRoundScore: number
  currentRoundAnswer?: string
  hasSubmitted: boolean
  avatar?: string
}
```

From apps/game/composables/usePlayerManager.ts:

```typescript
function getCurrentPlayerTurn(players: Player[]): Player | null
function resetPlayerRoundState(players: Player[]): void
function resetPlayerSubmissions(players: Player[]): void
function submitPlayerAnswer(player: Player, answer: string): void
```

From apps/game/stores/game.ts:

```typescript
// Getter
currentPlayerTurn: (state) => {
  const playerManager = usePlayerManager()
  return playerManager.getCurrentPlayerTurn(state.currentSession?.players ?? [])
}

// Actions that reset player state:
async startNextRound(category?: Category, letter?: string)  // calls resetPlayerRoundState
async resetPlayerSubmissions()                                // calls resetPlayerSubmissions
async submitPlayerAnswer(playerId: string, answer: string)   // marks player submitted
```

</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add currentPlayerIndex to GameSession and update player turn logic</name>
  <files>
    packages/types/src/game.ts
    apps/game/composables/usePlayerManager.ts
    apps/game/composables/useSessionManager.ts
    apps/game/stores/game.ts
    apps/game/tests/unit/game-store.spec.ts
    apps/game/tests/unit/reactivity-improvements.spec.ts
  </files>
  <behavior>
    - getCurrentPlayerTurn with index 0 and 3 players returns players[0]
    - getCurrentPlayerTurn with index 1 and 3 players returns players[1]
    - getCurrentPlayerTurn with index beyond players length returns null
    - After submitPlayerAnswer for current player, currentPlayerIndex advances by 1
    - After startNextRound, currentPlayerIndex resets to 0
    - After resetPlayerSubmissions, currentPlayerIndex resets to 0
    - New session has currentPlayerIndex initialized to 0
  </behavior>
  <action>
    1. **packages/types/src/game.ts**: Add `currentPlayerIndex: number` to `GameSession` interface (after `currentRound`).

    2. **apps/game/composables/usePlayerManager.ts**:
       - Change `getCurrentPlayerTurn(players: Player[])` signature to `getCurrentPlayerTurn(players: Player[], currentPlayerIndex: number)`.
       - Implementation: return `players[currentPlayerIndex] ?? null` (simple index lookup, no more `find` by hasSubmitted).
       - Add new function `advancePlayerIndex(currentIndex: number, playerCount: number): number` that returns `currentIndex + 1` (does NOT wrap — when index >= playerCount, the getter returns null meaning all turns done).

    3. **apps/game/composables/useSessionManager.ts**:
       - In `createSession()`: add `currentPlayerIndex: 0` to the returned object.
       - In `createSinglePlayerSession()`: add `currentPlayerIndex: 0` to the returned object.

    4. **apps/game/stores/game.ts**:
       - Update `currentPlayerTurn` getter to pass `state.currentSession?.currentPlayerIndex ?? 0` as second arg to `getCurrentPlayerTurn`.
       - In `submitPlayerAnswer` action: after calling `playerManager.submitPlayerAnswer(player, answer)`, increment `this.currentSession.currentPlayerIndex` by 1. This is the key change — submitting advances the turn.
       - In `startNextRound` action: after `resetPlayerRoundState`, set `this.currentSession.currentPlayerIndex = 0`.
       - In `resetPlayerSubmissions` action: after `resetPlayerSubmissions`, set `this.currentSession.currentPlayerIndex = 0`.

    5. **Update existing tests**:
       - In `apps/game/tests/unit/game-store.spec.ts`: The test "currentPlayerTurn returns first unsubmitted player" (line 516) still passes since index starts at 0 = first player. The test "updates currentPlayerTurn to next player" (line 590) still passes since submitPlayerAnswer now increments the index. Fix any mock session objects that need `currentPlayerIndex` (lines ~1186, 1233 already have it).
       - In `apps/game/tests/unit/reactivity-improvements.spec.ts`: Tests that check `currentPlayerTurn` after `submitPlayerAnswer` should still pass since the index advances. Verify and fix if needed.

    **Important**: Do NOT change the `allPlayersSubmitted` logic — it correctly uses `hasSubmitted` flags. The `currentPlayerIndex` only controls whose turn it is, while `hasSubmitted` tracks completion.

    Run `pnpm run workspace:check` after all changes to verify TypeScript and lint pass.

  </action>
  <verify>
    <automated>cd /Users/markuswagner/projects/riddle-rush-mono-repo && pnpm run workspace:check && cd apps/game && pnpm run test:unit -- --run</automated>
  </verify>
  <done>
    - GameSession type includes currentPlayerIndex: number
    - getCurrentPlayerTurn uses index-based lookup instead of find-by-hasSubmitted
    - Player turn advances on answer submission via index increment
    - Round reset sets currentPlayerIndex back to 0
    - All existing unit tests pass (updated where needed)
    - workspace:check passes clean
  </done>
</task>

</tasks>

<verification>
1. `pnpm run workspace:check` passes (TypeScript + ESLint + Syncpack)
2. `cd apps/game && pnpm run test:unit -- --run` — all unit tests pass
3. Manual verification: start a 3-player game, submit answers for player 1 and 2, reload page — player 3 should be shown as current turn (not player 1)
</verification>

<success_criteria>

- currentPlayerIndex field exists on GameSession and is persisted to IndexedDB
- Player turn is determined by index, not by scanning hasSubmitted flags
- After round reset (startNextRound / resetPlayerSubmissions), index resets to 0
- After player submits answer, index advances to next player
- Page reload preserves the correct current player via persisted index
- All existing tests pass without regression
  </success_criteria>

<output>
After completion, create `.planning/quick/7-fix-page-reload-on-game-start-causing-wr/7-SUMMARY.md`
</output>
