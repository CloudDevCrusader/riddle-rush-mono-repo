# Architecture

**Analysis Date:** 2026-02-06

## Pattern Overview

**Overall:** Monorepo SPA with Client-Side State Management + IndexedDB Persistence

**Key Characteristics:**

- Client-only Nuxt 4 PWA (ssr: false) deployed as static files
- Pinia stores for reactive state with automatic IndexedDB persistence
- Composable-driven architecture for reusability and separation of concerns
- Turborepo task orchestration across workspace packages
- Multi-player game flow with round-based progression

## Layers

**Presentation Layer:**

- Purpose: Vue 3 components for UI rendering and user interaction
- Location: `apps/game/components/`, `apps/game/pages/`
- Contains: Page components, game design system components, layout components
- Depends on: Composables, Stores, Shared types
- Used by: Nuxt routing system, app.vue

**State Management Layer:**

- Purpose: Centralized reactive state with persistence
- Location: `apps/game/stores/`
- Contains: Pinia stores (`game.ts`, `settings.ts`)
- Depends on: Composables (useIndexedDB, useStatistics), Shared types
- Used by: Components, Composables, Pages

**Business Logic Layer:**

- Purpose: Reusable business logic and cross-cutting concerns
- Location: `apps/game/composables/`
- Contains: 26+ composables for game actions, state access, answer validation, audio, analytics
- Depends on: Stores, Shared constants, Types
- Used by: Components, Pages, Stores

**Data Persistence Layer:**

- Purpose: IndexedDB operations for offline-first storage
- Location: `apps/game/composables/useIndexedDB.ts`
- Contains: Database initialization, CRUD operations for sessions/history/statistics/leaderboard/settings
- Depends on: `idb` library, Shared types
- Used by: Stores (game.ts, settings.ts)

**Shared Layer:**

- Purpose: Workspace-level code sharing across apps
- Location: `packages/types/`, `packages/shared/`, `packages/config/`
- Contains: TypeScript types, constants, utilities, Vite configurations
- Depends on: Nothing (base layer)
- Used by: All apps and packages

## Data Flow

**Game Initialization Flow:**

1. `app.vue` mounts → loads persisted state from IndexedDB via `gameStore.loadFromDB()` and `settingsStore.loadSettings()`
2. User navigates to index page (`pages/index.vue`) → Main menu
3. User clicks "PLAY" → navigates to `pages/players.vue`
4. Players submit names → `gameStore.initializeMultiplayerSession(players)` → creates session in state
5. Navigate to `pages/round-start.vue` → fortune wheel selects category/letter
6. `gameStore.startRound()` → updates session, saves to IndexedDB
7. Navigate to `pages/game/[[gameId]].vue` → players submit answers
8. Each submission → `gameStore.submitPlayerAnswer()` → validates via `useAnswerCheck()` → updates scores → saves to IndexedDB
9. All players submit → navigate to `pages/results/[[gameId]].vue` → display scores
10. Next round or end game → either back to step 5 or navigate to `pages/leaderboard.vue`

**Answer Validation Flow:**

1. Player submits answer in game page
2. `useAnswerCheck().checkAnswer()` called with answer, category, letter
3. Fetch category terms from PetScan API (cached for 5 minutes) or offline data
4. Normalize answer and check against term list
5. Return `{ found: boolean, suggestions: string[] }`
6. If found → increment score, play correct sound, save to IndexedDB
7. If not found → show suggestions, play incorrect sound

**State Persistence Flow:**

1. Store action modifies state (e.g., `gameStore.submitPlayerAnswer()`)
2. Store action calls corresponding `save*ToDB()` method (e.g., `saveGameSession()`)
3. `useIndexedDB()` serializes data and writes to IndexedDB via `idb` library
4. On app mount, `loadFromDB()` reads from IndexedDB and hydrates store state
5. All operations atomic via IndexedDB transactions

**State Management:**

- Pinia stores are single source of truth
- Composables access stores via `useGameStore()`, `useSettingsStore()`
- Components access via computed properties from `useGameState()` composable
- All mutations go through store actions, never direct state modification

## Key Abstractions

**GameSession:**

- Purpose: Represents a complete game with multi-player state
- Examples: `stores/game.ts` state.currentSession
- Pattern: Single active session in memory, persisted to IndexedDB on every mutation
- Fields: `id`, `players[]`, `currentRound`, `category`, `letter`, `status`, `roundHistory`

**Player:**

- Purpose: Individual player state within a session
- Examples: `GameSession.players[]`
- Pattern: Array of player objects with scores and submission state
- Fields: `id`, `name`, `totalScore`, `currentRoundScore`, `hasSubmitted`, `avatar`

**Composables:**

- Purpose: Encapsulate reusable logic with reactive dependencies
- Examples: `composables/useGameState.ts`, `composables/useGameActions.ts`, `composables/useAnswerCheck.ts`
- Pattern: Export function returning reactive refs/computed values and methods
- Usage: `const { currentCategory, players } = useGameState()`

**Game Design Components:**

- Purpose: Reusable UI components with 3D effects and consistent styling
- Examples: `components/game/GameButton.vue`, `components/game/GameModal.vue`, `components/game/GamePlayerCard.vue`
- Pattern: Self-contained Vue components with props/emits, using UnoCSS utilities
- Usage: `<GameButton variant="primary" @click="handleAction">Label</GameButton>`

**IndexedDB Stores:**

- Purpose: Structured client-side database for offline persistence
- Examples: `gameSession`, `gameHistory`, `statistics`, `leaderboard`, `settings`
- Pattern: Object stores with optional indexes for querying
- Schema: `gameSession` (single current), `gameHistory` (keyPath: id, index: startTime), `leaderboard` (keyPath: sessionId, indexes: score, timestamp)

## Entry Points

**Application Root:**

- Location: `apps/game/app.vue`
- Triggers: Nuxt app mount
- Responsibilities: Global state initialization, event listeners (online/offline, PWA install prompt, keyboard shortcuts), splash screen control, layout/page rendering

**Main Entry (Index):**

- Location: `apps/game/pages/index.vue`
- Triggers: Root route `/`
- Responsibilities: Main menu, navigation to players/settings/credits/language

**Game Flow Entry:**

- Location: `apps/game/pages/players.vue`
- Triggers: User clicks "PLAY" from main menu
- Responsibilities: Collect player names (1-6), initialize multiplayer session, navigate to round-start

**Round Start:**

- Location: `apps/game/pages/round-start.vue`
- Triggers: After players page or after previous round results
- Responsibilities: Fortune wheel animation, category/letter selection, start new round, navigate to game page

**Game Page:**

- Location: `apps/game/pages/game/[[gameId]].vue`
- Triggers: After round-start completes
- Responsibilities: Answer input, validation, score tracking, player turn management, navigate to results when all submitted

**Results Page:**

- Location: `apps/game/pages/results/[[gameId]].vue`
- Triggers: After all players submit answers
- Responsibilities: Display round scores, show leaderboard, navigate to next round or final leaderboard

**Build Entry:**

- Location: `apps/game/nuxt.config.ts`
- Triggers: Build/dev process
- Responsibilities: Nuxt configuration, module registration, Vite plugins, PWA setup, i18n config

## Error Handling

**Strategy:** Composable-level try-catch with user feedback + logging

**Patterns:**

- Store actions wrap critical operations in try-catch blocks
- Errors logged via `useLogger()` (dev-only, stripped in production)
- User-facing errors displayed via `useToast()` with i18n messages
- Failed IndexedDB operations logged but don't crash app (graceful degradation)
- Network errors for PetScan API return empty arrays with warning logs
- Offline mode detected via `window.addEventListener('offline')` → state flag
- PWA service worker provides fallback for failed network requests (CacheFirst for static, NetworkFirst for API)

## Cross-Cutting Concerns

**Logging:** `useLogger()` composable wraps console with conditional logic (dev-only). Stripped from production builds via Vite tree-shaking.

**Validation:** Answer validation via `useAnswerCheck()` with PetScan API integration (5-min cache) or offline fallback. Letter validation checks first character match.

**Authentication:** Not implemented (client-only game, no user accounts). Optional `userId` field in GameSession for future extension.

**i18n:** `@nuxtjs/i18n` module with `de` (default) and `en` locales. Translation files in `apps/game/i18n/locales/`. `useI18n()` composable provides `t()` function. No URL prefix (`strategy: no_prefix`).

**Analytics:** `useAnalytics()` composable wraps Google Analytics 4. Events tracked: page views, game start, game end, answer submit. Configured via `GOOGLE_ANALYTICS_ID` env var.

**Audio:** `useAudio()` composable manages sound effects (correct answer, incorrect answer, new round, game end). Audio enabled/disabled via settings store.

**Performance Monitoring:** `usePerformance()` composable tracks page load times, component render times. Data logged in dev, collected for analytics in production.

**Feature Flags:** `useFeatureFlags()` composable integrates Unleash for remote feature toggling. Currently used for fortune wheel feature.

**PWA:** `@vite-pwa/nuxt` module with `registerType: 'autoUpdate'`. Service worker strategies: CacheFirst for static assets, NetworkFirst for API calls. Install prompt captured via `beforeinstallprompt` event.

---

_Architecture analysis: 2026-02-06_
