# Code Review Findings — 2026-03-08

Comprehensive review of `apps/game` by code-review-expert.
Critical bugs (#1, #2) and i18n interpolation (#3) fixed separately.

## High Priority

### 4. Raw console.\* calls bypass useLogger

- **Files**: `useWebSocket.ts` (17 calls), `useErrorSync.ts` (6 calls), `usePerformance.ts` (several)
- **Fix**: Replace all `console.*` with `logger.*` from `useLogger()`
- **Impact**: Leaks internal details in production, bypasses error-sync pipeline

### 5. Unused useScoringEngine import in game store

- **File**: `stores/game.ts:6`
- **Fix**: Remove dead import `import { useScoringEngine } from '../composables/useScoringEngine'`

### 6. Event listeners in app.vue never cleaned up

- **File**: `app.vue:60`
- **Fix**: Add `onUnmounted` with `removeEventListener` for online/offline/keydown/beforeinstallprompt
- **Impact**: HMR listener accumulation in dev

### 7. round-start.vue falls back to ['Player 1'] ghost session

- **File**: `round-start.vue:247`
- **Fix**: Redirect to players page instead of creating a single-player fallback session

### 8. Feature flag inconsistency — isFortuneWheelEnabled

- **File**: `useFeatureFlags.ts:58`
- **Fix**: Make GitLab authoritative when configured (match isAnswerInputEnabled pattern)
- **Impact**: Local settings can override GitLab's explicit "disabled"

## Medium Priority

### 9. Duplicate categoryIconMap in round-start.vue

- **File**: `round-start.vue:132`
- **Fix**: Use shared `useCategoryEmoji` composable instead of local map

### 10. checkPerfectGame badge logic doesn't match description

- **File**: `useStatistics.ts:213`
- **Fix**: Either implement proper tracking or change badge description

### 11. Duplicate goBack in usePageSetup and useNavigation

- **Fix**: Remove from usePageSetup, use useNavigation everywhere

### 12. Hardcoded English in useHead titles (4 pages)

- **Files**: `index.vue`, `leaderboard.vue`, `round-start.vue`, `game/[[gameId]].vue`
- **Fix**: Use `t()` for useHead title/meta

### 13. Hardcoded 'LOADING....' in splash.vue

- **File**: `splash.vue:65`
- **Fix**: Use `t('common.loading').toUpperCase()`

### 14. useAudio TypeError silently swallowed

- **File**: `useAudio.ts:67`
- **Fix**: Replace `throw new TypeError` with graceful return (like playScoreIncrease)

### 15. useCategoryManager busy-wait loop with no user feedback

- **File**: `useCategoryManager.ts:53`
- **Fix**: Use promise coordination instead of polling, show toast on timeout

### 16. IndexedDB singleton never cleared on versionchange

- **File**: `useIndexedDB.ts:19`
- **Fix**: Add `blocking()` handler to close connection

## Low Priority

### 17. useScoringEngine.determineWinners unused

- Remove dead export

### 18. No unit tests for decomposed composables

- Add tests for useSessionManager, usePersistence, useCategoryManager, usePlayerManager

### 19. Redundant useNavigation() in handleRestart

- **File**: `game/[[gameId]].vue:295`
- **Fix**: Destructure goToPlayers from existing call at line 159

### 20. useAudio reads IndexedDB on every sound play

- **File**: `useAudio.ts:229`
- **Fix**: Use Pinia settingsStore.soundEnabled instead of DB read
