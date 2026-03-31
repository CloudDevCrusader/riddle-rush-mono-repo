---
phase: quick-260331-vtk
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/game/pages/round-start.vue
autonomous: true
requirements: [FIX-REDIRECT, FIX-SPINNER, UX-INLINE-RESULTS]
must_haves:
  truths:
    - 'After both wheels complete, the game navigates to the game page'
    - 'The spinner shows during navigation and does not disappear prematurely'
    - 'Each wheel result appears inline below its wheel as soon as that wheel finishes spinning'
  artifacts:
    - path: 'apps/game/pages/round-start.vue'
      provides: 'Fixed round-start page with correct store method and inline results'
      contains: 'advanceToConfiguredRound'
  key_links:
    - from: 'apps/game/pages/round-start.vue'
      to: 'apps/game/stores/gameStore.ts'
      via: 'advanceToConfiguredRound(category, letter)'
      pattern: 'advanceToConfiguredRound'
---

<objective>
Fix three bugs on the round-start page: (1) redirect fails because `startGame()` calls a non-existent `startConfiguredRound` method instead of `advanceToConfiguredRound`, (2) the loading spinner disappears because the redirect error is caught silently, and (3) category/letter results should appear inline under each wheel as it completes instead of in a separate results display phase.

Purpose: The round-start page is completely broken for multi-round games due to the wrong method name. This fix restores core gameplay flow and improves the UX by showing results inline.
Output: A working round-start page that navigates to the game after wheels spin.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/game/pages/round-start.vue
@apps/game/stores/gameStore.ts (reference only — DO NOT EDIT)
@packages/shared/src/constants.ts (reference only — DO NOT EDIT)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix redirect and simplify startGame to use advanceToConfiguredRound</name>
  <files>apps/game/pages/round-start.vue</files>
  <action>
Replace the entire `startGame()` function (lines 268-330) with a simplified version that delegates to `advanceToConfiguredRound()`:

```typescript
const startGame = async () => {
  if (!selectedCategory.value || !selectedLetter.value) return

  startingGame.value = true

  try {
    await gameStore.advanceToConfiguredRound(selectedCategory.value, selectedLetter.value)

    const gameId = gameStore.currentSession?.id
    if (gameId) {
      await goToGame(gameId)
    } else {
      await goToGame()
    }

    startingGame.value = false
  } catch (error) {
    const logger = useLogger()
    logger.error('Failed to start game:', error)
    startingGame.value = false
    toast.error(t('game.error_starting', 'Failed to start game. Please try again.'))
  }
}
```

Rationale: The old `startGame()` duplicated all the logic that `advanceToConfiguredRound()` already handles (pending players, no session, completed round, mid-round refresh). The bug was that line 302 called `gameStore.startConfiguredRound(...)` which does not exist. This also fixes the spinner (Issue 2) since the function no longer throws.
</action>
<verify>
<automated>cd /Users/markuswagner/projects/riddle-rush-mono-repo && grep -c "advanceToConfiguredRound" apps/game/pages/round-start.vue && ! grep -q "startConfiguredRound" apps/game/pages/round-start.vue && echo "PASS" || echo "FAIL"</automated>
</verify>
<done> - `startGame()` calls `gameStore.advanceToConfiguredRound(selectedCategory.value, selectedLetter.value)` - No reference to the non-existent `startConfiguredRound` method remains - The duplicated session/player logic is removed from `startGame()` - Error handling and spinner state management are preserved
</done>
</task>

<task type="auto">
  <name>Task 2: Show results inline under each wheel as it completes</name>
  <files>apps/game/pages/round-start.vue</files>
  <action>
**Template changes:**

1. Add inline result labels below each wheel that appear on `spin-complete`. Inside the `.wheel-wrapper.top-wheel` div (after the `.wheel-container.flipped` div, around line 48), add:

```html
<transition name="result-pop">
  <div v-if="categorySpinComplete" class="inline-result" data-testid="round-category-inline-result">
    <span class="inline-result-icon">{{ selectedCategoryIcon }}</span>
    <span class="inline-result-text">{{ selectedCategoryName }}</span>
  </div>
</transition>
```

2. Inside the `.wheel-wrapper.bottom-wheel` div (after the `.wheel-container` div, around line 80), add:

```html
<transition name="result-pop">
  <div v-if="letterSpinComplete" class="inline-result" data-testid="round-letter-inline-result">
    <span class="inline-result-text inline-result-letter">{{ selectedLetter }}</span>
  </div>
</transition>
```

3. Remove the entire `<!-- Selected Values Display Phase -->` section (the `<transition name="results-fade">` block, lines 86-117). This is the old results display that appeared after both wheels completed.

4. Update the wheels container visibility condition (line 28): Change `v-if="isFortuneWheelEnabled && !wheelsComplete"` to `v-if="isFortuneWheelEnabled && !startingGame"` so the wheels stay visible (with their inline results) until navigation begins.

**Script changes:**

5. In `checkBothComplete()` (lines 252-266), replace the current implementation with a simplified version that goes directly to startGame after a brief pause:

```typescript
const checkBothComplete = () => {
  if (categorySpinComplete.value && letterSpinComplete.value) {
    isSpinning.value = false
    wheelsComplete.value = true
    // Brief pause to let users see both results, then navigate
    setTimeout(() => {
      startGame()
    }, RESULTS_DISPLAY_DURATION_MS)
  }
}
```

This removes the nested setTimeout (no more WHEEL_FADE_DELAY_MS wait for fade-out then RESULTS_DISPLAY_DURATION_MS wait for separate display). Users see results inline as each wheel stops, then after RESULTS_DISPLAY_DURATION_MS (2s) from the last wheel completing, navigation begins.

6. Remove the unused `WHEEL_FADE_DELAY_MS` import from the import statement on line 132. Keep only `RESULTS_DISPLAY_DURATION_MS`.

**Style changes:**

7. Add styles for inline results (after the `.wheel-label` styles around line 545):

```css
/* Inline Results (appear under wheel on completion) */
.inline-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 215, 0, 0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.inline-result-icon {
  font-size: clamp(24px, 4vw, 36px);
}

.inline-result-text {
  font-family: var(--font-display);
  font-size: clamp(var(--font-size-lg), 3vw, var(--font-size-xl));
  font-weight: var(--font-weight-black);
  color: var(--color-white);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 215, 0, 0.4);
}

.inline-result-letter {
  font-size: clamp(var(--font-size-xl), 4vw, var(--font-size-2xl));
  background: linear-gradient(135deg, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Result pop transition */
.result-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.result-pop-enter-from {
  opacity: 0;
  transform: scale(0.5) translateY(-10px);
}
```

8. Remove the old results-display CSS that is now unused: `.results-display`, `.result-item`, `.result-label`, `.result-value`, `.result-icon`, `.result-text`, `.result-letter`, `.divider`, `.results-fade-*`, `.animate-scale-in`, and the `@keyframes scaleIn` block (lines 547-671 approximately). Keep the `.wheel-fade-*` transitions since the wheel container still uses them for the initial entry.

9. In the `.wheel-wrapper.bottom-wheel .wheel-label` style rule, keep `order: 2` as-is (the inline-result will naturally appear after the wheel container in DOM order).
   </action>
   <verify>
   <automated>cd /Users/markuswagner/projects/riddle-rush-mono-repo && grep -q "inline-result" apps/game/pages/round-start.vue && ! grep -q "results-display" apps/game/pages/round-start.vue && grep -q "categorySpinComplete" apps/game/pages/round-start.vue && pnpm run --filter @riddle-rush/game typecheck 2>&1 | tail -5</automated>
   </verify>
   <done> - Inline result labels appear below each wheel immediately when that wheel finishes spinning - The old separate results-display section is removed - Wheels remain visible until navigation starts (showing both inline results) - After both wheels complete, navigation starts after RESULTS_DISPLAY_DURATION_MS (2s) - TypeScript compilation passes
   </done>
   </task>

</tasks>

<verification>
1. `grep "advanceToConfiguredRound" apps/game/pages/round-start.vue` shows the correct method call
2. `grep "startConfiguredRound" apps/game/pages/round-start.vue` returns no matches
3. `grep "inline-result" apps/game/pages/round-start.vue` confirms inline result elements exist
4. `grep "results-display" apps/game/pages/round-start.vue` returns no matches (old section removed)
5. `pnpm run --filter @riddle-rush/game typecheck` passes
</verification>

<success_criteria>

- The round-start page calls `advanceToConfiguredRound` and successfully navigates to the game page
- The spinner appears during navigation and does not flash/disappear due to errors
- Each wheel's result (category name/icon, letter) appears inline below the wheel as soon as that wheel stops spinning
- The old full-screen results display phase is removed
- TypeScript compilation passes with no errors
  </success_criteria>

<output>
After completion, create `.planning/quick/260331-vtk-fix-round-start-redirect-not-working-sec/260331-vtk-SUMMARY.md`
</output>
