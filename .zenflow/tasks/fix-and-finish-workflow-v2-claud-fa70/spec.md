# Technical Specification: End-of-Game Workflow

## 1. Technical Context

| Aspect                | Detail                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------- |
| **Framework**         | Nuxt 4 (SSR disabled, client-side SPA)                                                       |
| **Language**          | TypeScript, Vue 3 Composition API (`<script setup>`)                                         |
| **State Management**  | Pinia (with IndexedDB persistence)                                                           |
| **CSS**               | Scoped SCSS with design system tokens (`@use '@/assets/scss/design-system' as *;`)           |
| **Component Library** | Custom game design system (`GameButton`, `GameModal`, `GameDisplay`, `GamePlayerCard`, etc.) |
| **Animation**         | `v-motion` directive from `@vueuse/motion`                                                   |
| **i18n**              | `@nuxtjs/i18n` with `useI18n()` / `usePageSetup()` composables, `de` + `en` locales          |
| **Shared Packages**   | `@riddle-rush/types` (types), `@riddle-rush/shared` (constants, routes)                      |
| **Routing**           | File-based Nuxt routing with `useNavigation()` composable                                    |
| **Persistence**       | IndexedDB via `useIndexedDB()` composable                                                    |

---

## 2. Implementation Approach

### 2.1 Strategy

The changes are concentrated in **one page** (`results/[[gameId]].vue`) with **supporting fixes** in the game store and QuitModal. All new UI is built from existing game design system components. No new pages, composables, or shared packages are needed.

### 2.2 Component Reuse Plan

| Existing Component  | How It's Used                                                     |
| ------------------- | ----------------------------------------------------------------- |
| `GamePlayerCard`    | **Enhanced** with a new `#actions` slot for inline score controls |
| `GameButton` (sm)   | `+` and `-` buttons flanking the score display                    |
| `GameDisplay` (sm)  | Shows the current score value between +/- buttons                 |
| `PlayerLeaderboard` | Mounted on results page, controlled by `showLeaderboard` ref      |
| `GameModal`         | "Round Complete" decision modal with two actions                  |
| `GameBackground`    | Already wraps the results page                                    |
| `GameHeader`        | Already used for page title                                       |

### 2.3 State Flow Diagram

```
results/[[gameId]].vue page loads
│
├─ Phase 1: SCORE ENTRY (initial state)
│  ├─ Each player card has +/- score controls
│  ├─ Local reactive Map<playerId, score> tracks pending scores
│  └─ "Confirm Scores" button at bottom
│
├─ Phase 2: CONFIRM SCORES (user clicks "Confirm")
│  ├─ For each player: gameStore.assignPlayerScore(id, score)
│  ├─ gameStore.completeRound()
│  └─ Set showLeaderboard = true
│
├─ Phase 3: LEADERBOARD OVERLAY (auto-dismisses)
│  ├─ PlayerLeaderboard visible with isGameCompleted=false
│  ├─ Auto-dismiss after RESULTS_DISPLAY_DURATION_MS (2000ms)
│  ├─ OR user taps overlay to dismiss
│  └─ On dismiss: showLeaderboard = false, showDecisionModal = true
│
└─ Phase 4: DECISION MODAL
   ├─ "Next Round" → goToRoundStart()
   └─ "Finish Game" → gameStore.completeGame() → goToLeaderboard()
```

---

## 3. Source Code Changes

### 3.1 Modified Files

#### 3.1.1 `apps/game/pages/results/[[gameId]].vue` — Major rewrite

**Current state:** 87 lines — renders player cards with names/answers and a "Next Round" button. No score entry, no store calls, no leaderboard.

**Changes:**

1. **Add local score tracking state:**

   ```ts
   const pendingScores = reactive(new Map<string, number>())

   // Initialize all players to 0 on mount
   onMounted(() => {
     for (const player of gameStore.players) {
       pendingScores.set(player.id, 0)
     }
   })
   ```

2. **Add score adjustment functions:**

   ```ts
   import { SCORE_INCREMENT, RESULTS_DISPLAY_DURATION_MS } from '@riddle-rush/shared/constants'

   const incrementScore = (playerId: string) => {
     const current = pendingScores.get(playerId) ?? 0
     pendingScores.set(playerId, current + SCORE_INCREMENT)
   }

   const decrementScore = (playerId: string) => {
     const current = pendingScores.get(playerId) ?? 0
     if (current >= SCORE_INCREMENT) {
       pendingScores.set(playerId, current - SCORE_INCREMENT)
     }
   }
   ```

3. **Add workflow phase state:**

   ```ts
   const showLeaderboard = ref(false)
   const showDecisionModal = ref(false)
   const isConfirming = ref(false)
   ```

4. **Add score confirmation handler:**

   ```ts
   const handleConfirmScores = async () => {
     if (isConfirming.value) return
     isConfirming.value = true

     try {
       // Assign scores to each player
       for (const [playerId, score] of pendingScores) {
         await gameStore.assignPlayerScore(playerId, score)
       }
       // Record round in history
       await gameStore.completeRound()
       // Show leaderboard overlay
       showLeaderboard.value = true
     } catch (error) {
       const logger = useLogger()
       logger.error('Error confirming scores:', error)
       toast.error(t('results.error_saving'))
       isConfirming.value = false
     }
   }
   ```

5. **Add leaderboard dismiss handler (auto-dismiss + manual):**

   ```ts
   let dismissTimer: ReturnType<typeof setTimeout> | null = null

   const handleLeaderboardDismiss = () => {
     if (dismissTimer) clearTimeout(dismissTimer)
     showLeaderboard.value = false
     showDecisionModal.value = true
   }

   watch(showLeaderboard, (visible) => {
     if (visible) {
       dismissTimer = setTimeout(handleLeaderboardDismiss, RESULTS_DISPLAY_DURATION_MS)
     }
   })

   onUnmounted(() => {
     if (dismissTimer) clearTimeout(dismissTimer)
   })
   ```

6. **Add decision modal handlers:**

   ```ts
   const handleNextRound = async () => {
     showDecisionModal.value = false
     await goToRoundStart()
   }

   const handleFinishGame = async () => {
     showDecisionModal.value = false
     await gameStore.completeGame()
     await goToLeaderboard()
   }
   ```

7. **Template changes:**
   - Replace `GamePlayerCard`'s simple rendering with score controls below each card (a row of `GameButton` `-` + `GameDisplay` score + `GameButton` `+`).
   - Replace the "Next Round" `GameButton` with a "Confirm Scores" `GameButton`.
   - Add `<PlayerLeaderboard>` overlay, bound to `showLeaderboard`.
   - Add `<GameModal>` for the decision prompt with two `GameButton` options.

**Template structure (pseudocode):**

```vue
<GameBackground>
  <div class="scoring-page">
    <GameHeader color="gold">{{ t('scoring.title') }}</GameHeader>

    <div class="scoring-page__list">
      <div v-for="(player, index) in players" :key="player.id" class="scoring-page__player-entry">
        <GamePlayerCard
          :player="player"
          :label="`${t('scoring.player')} ${index + 1}`"
          :show-indicator="false"
        />
        <!-- Score adjustment controls -->
        <div class="scoring-page__score-controls">
          <GameButton
            variant="danger" size="sm"
            :disabled="(pendingScores.get(player.id) ?? 0) <= 0"
            @click="decrementScore(player.id)"
          > - </GameButton>

          <GameDisplay size="sm" :glow="false">
            {{ pendingScores.get(player.id) ?? 0 }}
          </GameDisplay>

          <GameButton variant="primary" size="sm" @click="incrementScore(player.id)">
            +
          </GameButton>
        </div>
      </div>
    </div>

    <GameButton
      variant="primary" size="lg" full-width
      :loading="isConfirming"
      @click="handleConfirmScores"
    >
      {{ t('scoring.confirm_scores') }}
    </GameButton>
  </div>

  <!-- Leaderboard overlay -->
  <PlayerLeaderboard
    :visible="showLeaderboard"
    :players="leaderboard"
    :is-game-completed="false"
    :current-round="currentRound"
    @close="handleLeaderboardDismiss"
    @continue="handleLeaderboardDismiss"
  />

  <!-- Decision modal -->
  <GameModal
    v-model="showDecisionModal"
    :title="t('scoring.round_complete')"
    :close-on-backdrop="false"
    :close-on-escape="false"
  >
    <div class="decision-content">
      <p>{{ t('scoring.play_another_round') }}</p>
      <div class="decision-actions">
        <GameButton variant="primary" @click="handleNextRound">
          {{ t('scoring.next_round') }}
        </GameButton>
        <GameButton variant="secondary" @click="handleFinishGame">
          {{ t('scoring.finish_game') }}
        </GameButton>
      </div>
    </div>
  </GameModal>
</GameBackground>
```

**New SCSS for score controls:**

```scss
.scoring-page__player-entry {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.scoring-page__score-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}
```

---

#### 3.1.2 `apps/game/stores/game.ts` — Fix `assignPlayerScore` bug

**File:** `apps/game/stores/game.ts`, lines 458-477

**Bug:** The current implementation adds `points` to `totalScore` when `points !== player.currentRoundScore`, but this doesn't compute the correct delta. For example:

- User sets score to 10: `totalScore += 10` (correct, 0→10)
- User adjusts to 20: `totalScore += 20` (WRONG — should add the delta of 10, not the new total of 20)

**Fix:** Replace the increment logic with a delta calculation:

```ts
// Current (buggy):
if (points !== player.currentRoundScore) {
  player.totalScore += points
}
player.currentRoundScore = points

// Fixed:
const delta = points - player.currentRoundScore
player.totalScore += delta
player.currentRoundScore = points
```

This correctly handles:

- 0→10: delta = 10, totalScore += 10 ✓
- 10→20: delta = 10, totalScore += 10 ✓
- 20→10: delta = -10, totalScore -= 10 ✓
- 10→10: delta = 0, totalScore unchanged ✓

---

#### 3.1.3 `apps/game/components/QuitModal.vue` — Fix double `goHome()` bug

**File:** `apps/game/components/QuitModal.vue`, line 60

**Bug:** `handleYes()` calls `goHome()` directly AND emits `confirm`, which causes the parent `game/[[gameId]].vue:handleQuitConfirmed()` to also call `goHome()`. This triggers double navigation.

**Fix:** Remove the `goHome()` call from `QuitModal.handleYes()`. The parent is responsible for navigation after receiving the `confirm` event.

```ts
// Current:
const handleYes = async () => {
  audio.playClick()
  if (gameStore.hasActiveSession) {
    await gameStore.abandonGame()
  }
  emit('confirm')
  isVisible.value = false
  goHome() // ← REMOVE THIS LINE
}
```

The parent `game/[[gameId]].vue` already handles this:

```ts
const handleQuitConfirmed = () => {
  showQuitModal.value = false
  goHome() // ← This is the correct single navigation
}
```

---

#### 3.1.4 `apps/game/i18n/locales/de.json` — Add German translations

Add new keys under a `scoring` namespace:

```json
{
  "scoring": {
    "title": "Punktevergabe",
    "player": "Spieler",
    "confirm_scores": "Punkte best\u00e4tigen",
    "round_complete": "Runde abgeschlossen!",
    "play_another_round": "M\u00f6chtet ihr noch eine Runde spielen?",
    "next_round": "N\u00e4chste Runde",
    "finish_game": "Spiel beenden",
    "description": "Rundenergebnisse ansehen"
  }
}
```

---

#### 3.1.5 `apps/game/i18n/locales/en.json` — Add English translations

```json
{
  "scoring": {
    "title": "Scoring",
    "player": "Player",
    "confirm_scores": "Confirm Scores",
    "round_complete": "Round Complete!",
    "play_another_round": "Would you like to play another round?",
    "next_round": "Next Round",
    "finish_game": "Finish Game",
    "description": "View round scoring results"
  }
}
```

---

### 3.2 Files NOT Modified

| File                                           | Reason                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps/game/pages/leaderboard.vue`              | Already handles `isGameCompleted` correctly — hides "Next Round" when `true`, shows winner via `leaderboard` getter |
| `apps/game/components/PlayerLeaderboard.vue`   | Used as-is — props and events match our needs exactly                                                               |
| `apps/game/components/game/GameModal.vue`      | Used as-is — `closeOnBackdrop` and `closeOnEscape` props support our requirement                                    |
| `apps/game/components/game/GameButton.vue`     | Used as-is — `sm` size for +/- buttons, `lg` for confirm                                                            |
| `apps/game/components/game/GameDisplay.vue`    | Used as-is — `sm` size for score numbers                                                                            |
| `apps/game/components/game/GamePlayerCard.vue` | Used as-is — score controls placed outside/below the card rather than adding a slot, keeping the component simple   |
| `packages/shared/src/constants.ts`             | `SCORE_INCREMENT` and `RESULTS_DISPLAY_DURATION_MS` already exist                                                   |
| `packages/types/src/game.ts`                   | No type changes needed — `Player`, `PlayerWithRank`, `GameSession` already have all fields                          |
| `apps/game/pages/round-start.vue`              | No changes — `startNextRound()` already resets player state correctly                                               |
| `apps/game/pages/game/[[gameId]].vue`          | No changes — only the QuitModal parent handler is affected (and it already works correctly)                         |

---

## 4. Data Model & Interface Changes

### 4.1 No Type Changes

All required fields already exist in `@riddle-rush/types/game`:

- `Player.currentRoundScore` — set by `assignPlayerScore()`
- `Player.totalScore` — accumulated across rounds
- `GameSession.roundHistory` — populated by `completeRound()`
- `GameSession.status` — set to `'completed'` by `completeGame()`

### 4.2 No New Store Actions

All required store actions already exist and are implemented:

| Action                                | Location             | Status                                   |
| ------------------------------------- | -------------------- | ---------------------------------------- |
| `assignPlayerScore(playerId, points)` | `stores/game.ts:458` | Exists, needs bug fix                    |
| `completeRound()`                     | `stores/game.ts:493` | Exists, works correctly                  |
| `completeGame()`                      | `stores/game.ts:278` | Exists, works correctly                  |
| `endGame()`                           | `stores/game.ts:257` | Exists, already used on leaderboard page |
| `startNextRound()`                    | `stores/game.ts:513` | Exists, already used on round-start page |

### 4.3 Local State on Results Page

The results page uses **local reactive state** (not store state) to manage the workflow phases:

```ts
// Score entry
const pendingScores = reactive(new Map<string, number>())

// Workflow phase flags
const showLeaderboard = ref(false)
const showDecisionModal = ref(false)
const isConfirming = ref(false)
```

This keeps the page self-contained — the store is only written to when the user confirms.

---

## 5. Delivery Phases

### Phase 1: Store Bug Fix + QuitModal Fix

**Files:** `stores/game.ts`, `components/QuitModal.vue`

**Tasks:**

1. Fix `assignPlayerScore` delta calculation (2 lines changed)
2. Remove `goHome()` from `QuitModal.handleYes()` (1 line removed)

**Verification:**

- `pnpm run workspace:check` passes
- Existing unit tests for game store still pass

---

### Phase 2: Results Page — Score Entry UI

**Files:** `pages/results/[[gameId]].vue`, `locales/de.json`, `locales/en.json`

**Tasks:**

1. Add i18n keys to both locale files
2. Add local score tracking state and increment/decrement functions
3. Add score control row below each player card (+/- buttons + score display)
4. Replace "Next Round" button with "Confirm Scores" button
5. Wire confirm button to `assignPlayerScore()` + `completeRound()`

**Verification:**

- `pnpm run workspace:check` passes
- Manual test: navigate through game → results page → see score controls → adjust scores → confirm

---

### Phase 3: Results Page — Leaderboard Overlay + Decision Modal

**Files:** `pages/results/[[gameId]].vue`

**Tasks:**

1. Mount `PlayerLeaderboard` on results page with `showLeaderboard` binding
2. Add auto-dismiss timer (2000ms) and manual dismiss handler
3. Add `GameModal` for "Next Round or Finish?" decision
4. Wire "Next Round" to `goToRoundStart()` and "Finish Game" to `completeGame()` + `goToLeaderboard()`

**Verification:**

- `pnpm run workspace:check` passes
- Full flow test: game → results → score → confirm → leaderboard overlay → decision → next round (OR finish game → final leaderboard with winner)

---

## 6. Verification Approach

### 6.1 Automated Checks

```bash
# After every change
pnpm run workspace:check   # Syncpack + TypeScript + ESLint

# Unit tests
pnpm run test:unit          # Ensure existing store tests pass

# E2E tests (after full implementation)
pnpm run test:e2e           # Ensure existing flows aren't broken
```

### 6.2 Manual Test Scenarios

| #   | Scenario                                                  | Expected Result                                                               |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Start game → play round → reach results page              | See player cards with +/- score controls, default score 0                     |
| 2   | Tap + button multiple times                               | Score increments by 10 each tap                                               |
| 3   | Tap - button at score 0                                   | Button is disabled, score stays 0                                             |
| 4   | Set different scores for multiple players → tap "Confirm" | Scores saved, leaderboard overlay appears                                     |
| 5   | Wait 2 seconds on leaderboard overlay                     | Overlay auto-dismisses, decision modal appears                                |
| 6   | Tap leaderboard overlay before 2 seconds                  | Overlay dismisses early, decision modal appears                               |
| 7   | Choose "Next Round" in decision modal                     | Navigates to round-start page, new round begins with reset scores             |
| 8   | Choose "Finish Game" in decision modal                    | Navigates to leaderboard page, winner highlighted, "Next Round" button hidden |
| 9   | On final leaderboard, tap "OK"                            | Game ends, navigates home                                                     |
| 10  | Play 2+ rounds, checking scores accumulate                | `totalScore` increases correctly across rounds                                |
| 11  | Quit game mid-round via QuitModal                         | Only one navigation occurs (no double `goHome()`)                             |

### 6.3 Edge Cases to Test

- **Single player game**: Score controls and leaderboard work with 1 player
- **All players score 0**: Confirm still works, leaderboard shows all tied
- **Page refresh during score entry**: Pending scores reset (acceptable — not persisted until confirm)
- **Rapid button tapping**: Score controls respond correctly without race conditions (local state, no async)

---

## 7. Risk Assessment

| Risk                                                                                        | Severity | Mitigation                                                                                                         |
| ------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `assignPlayerScore` bug causes incorrect totals                                             | High     | Fix in Phase 1 before any score entry UI                                                                           |
| `PlayerLeaderboard` has button styling inconsistency (uses generic `.btn` not `GameButton`) | Low      | Cosmetic only — does not affect functionality. Can be improved in a follow-up.                                     |
| Auto-dismiss timer not cleaned up on unmount                                                | Medium   | Use `onUnmounted` to clear timeout; already planned                                                                |
| Reactive `Map` reactivity edge case in Vue 3                                                | Low      | Vue 3's `reactive()` supports `Map` natively since 3.x                                                             |
| Decision modal close via browser back button                                                | Low      | `closeOnBackdrop=false` + `closeOnEscape=false` prevent accidental close; browser back navigates away (acceptable) |
