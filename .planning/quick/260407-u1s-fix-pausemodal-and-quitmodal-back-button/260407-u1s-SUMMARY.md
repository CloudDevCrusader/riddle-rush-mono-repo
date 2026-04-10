# Quick Task 260407-u1s: Fix PauseModal and QuitModal buttons

**Bug:** `gameStore.hasActiveSession()` called as function but it's a ComputedRef — throws TypeError, silently crashing Restart/Home/Yes handlers.

**Fix:** Changed to `gameStore.hasActiveSession.value` in 3 locations (PauseModal x2, QuitModal x1).

## Files Modified

- `apps/game/components/PauseModal.vue` — lines 69, 77
- `apps/game/components/QuitModal.vue` — line 54

## Completed: 2026-04-07
