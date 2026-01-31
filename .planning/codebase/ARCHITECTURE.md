# Architecture

**Analysis Date:** 2026-01-31

## Pattern Overview

**Overall:** Client-side Pinia store pattern with IndexedDB persistence and composition-based architecture.

**Key Characteristics:**

- Pure client-side SPA (SSR disabled: `ssr: false` in `nuxt.config.ts`)
- State-driven game logic via Pinia stores (`stores/game.ts`, `stores/settings.ts`)
- IndexedDB for persistent storage across sessions
- Composable-based code reuse with auto-imported helpers
- File-based routing with optional route parameters
- Nuxt 4 with PWA capabilities and offline-first approach

## Layers

**Presentation (Pages & Components):**

- Purpose: User interface rendering and interactions
- Location: `apps/game/pages/`, `apps/game/components/`, `apps/game/layouts/`
- Contains: Vue SFC pages, reusable components, layout wrappers
- Depends on: Composables, stores, i18n
- Used by: Router, Nuxt framework

**State Management (Stores):**

- Purpose: Centralized application state, game logic, session management
- Location: `apps/game/stores/game.ts`, `apps/game/stores/settings.ts`
- Contains: Pinia store definitions with state, getters, actions
- Depends on: IndexedDB composable, logger, types
- Used by: All pages, components, and composables

**Business Logic (Composables):**

- Purpose: Reusable logic for game mechanics, data handling, UI utilities
- Location: `apps/game/composables/`
- Contains: 26 composables including game actions, state queries, I/O operations
- Depends on: Stores, external APIs (PetScan), IndexedDB
- Used by: Pages, components, other composables

**Data Persistence (IndexedDB):**

- Purpose: Offline storage and session persistence
- Location: `apps/game/composables/useIndexedDB.ts`
- Contains: Database initialization, CRUD operations for game sessions, statistics, leaderboard, settings
- Database structure: `riddle-rush-db` with stores: `gameSession`, `gameHistory`, `statistics`, `leaderboard`, `settings`
- Used by: `stores/game.ts`, settings management

**Shared Resources (Packages):**

- Purpose: Types, constants, configuration shared across apps
- Location: `packages/types/src/`, `packages/shared/src/`, `packages/config/`
- Contains: TypeScript interfaces, route definitions, constants, Vite config
- Used by: Game app, docs app, type safety

## Data Flow

**Game Session Initialization Flow:**

1. Application starts → `app.vue` mounts
2. `app.vue` calls `gameStore.loadFromDB()` and `settingsStore.loadSettings()`
3. Game store loads persisted session from IndexedDB if exists
4. PWA install prompt captured and stored in game store
5. Online/offline status monitored

**Round Flow:**

1. Main menu (`pages/index.vue`) → player setup (`pages/players.vue`)
2. Round start (`pages/round-start.vue`) → selects category and letter
3. Game page (`pages/game/[[gameId]].vue`) → players submit answers
4. Answers validated via `useAnswerCheck()` composable:
   - Checks offline data from `/data/offlineAnswers.json`
   - Falls back to PetScan API if offline data unavailable
   - Results cached for 5 minutes
5. Results page (`pages/results/[[gameId]].vue`) → displays scores
6. Leaderboard (`pages/leaderboard.vue`) → final rankings

**State Persistence:**

1. Any mutation in `stores/game.ts` is followed by `saveGameSessionToDB()`
2. Session automatically serialized to JSON and stored in IndexedDB
3. Settings persisted to localStorage via `stores/settings.ts`
4. Game history indexed by `startTime` for quick retrieval

## Key Abstractions

**GameSession:**

- Purpose: Represents a complete game with all players, rounds, category selection
- Examples: `packages/types/src/game.ts` - `GameSession` interface
- Pattern: Immutable updates via store mutations, then persisted to IndexedDB

**GameStore Actions (state mutations):**

- `startNewGame()` - Creates new session with selected category/letter
- `submitPlayerAnswer(playerId, answer)` - Records player submission and scores it
- `endGame()` - Marks session completed, saves to history
- `setOnlineStatus(isOnline)` - Tracks connectivity for API fallback
- Location: `apps/game/stores/game.ts`

**Composable Clusters:**

Game State Composables:

- `useGameState()` - Proxies common store getters for pages
- `useGameActions()` - High-level game operations (start, end, share)
- Location: `apps/game/composables/useGameState.ts`, `useGameActions.ts`

Data I/O Composables:

- `useIndexedDB()` - Low-level database operations
- `useAnswerCheck()` - Validates answers via offline data or API
- Location: `apps/game/composables/useIndexedDB.ts`, `useAnswerCheck.ts`

UI/Navigation Composables:

- `useNavigation()` - Type-safe router with loading states
- `useToast()`, `useModal()`, `useLoading()` - UI feedback
- `usePageSetup()` - Common page utilities (router, baseUrl, i18n)
- Location: `apps/game/composables/`

## Entry Points

**Application Root:**

- Location: `apps/game/app.vue`
- Triggers: Application startup
- Responsibilities: Initializes stores from persistence, sets up PWA listeners, manages splash screen

**Game Start:**

- Location: `apps/game/pages/index.vue` (main menu)
- Triggers: User clicks "Play"
- Responsibilities: Navigation to player setup

**Player Setup:**

- Location: `apps/game/pages/players.vue`
- Triggers: Play button clicked
- Responsibilities: Configure player names, max players setting

**Category Selection:**

- Location: `apps/game/pages/round-start.vue`
- Triggers: All players added
- Responsibilities: Display categories (50 at a time), select via Fortune Wheel or click

**Game Page:**

- Location: `apps/game/pages/game/[[gameId]].vue` (optional gameId param)
- Triggers: Category selected
- Responsibilities: Display category/letter, accept player answers, calculate scores

**Results:**

- Location: `apps/game/pages/results/[[gameId]].vue`
- Triggers: All players submitted answers
- Responsibilities: Show round scores, trigger leaderboard

## Error Handling

**Strategy:** Graceful degradation with user-facing toast notifications.

**Patterns:**

- IndexedDB Failure: Falls back to session in-memory, warns user
  - Pattern: Try-catch in `useIndexedDB()`, return null/empty on error
  - Files: `apps/game/composables/useIndexedDB.ts`

- API Failure (PetScan): Uses offline data or returns empty results
  - Pattern: Catch fetch errors, log via `useLogger()`, don't throw
  - Files: `apps/game/composables/useAnswerCheck.ts`

- Category Load Failure: Uses cached categories if available, shows error toast
  - Pattern: Store error message, check cache before throwing
  - Files: `apps/game/stores/game.ts` - `fetchCategories()` action

- Store Persistence Failure: Logs warning but allows game to continue
  - Pattern: Try-catch in store actions, don't block user interaction
  - Files: `apps/game/stores/game.ts` - `saveGameSessionToDB()`

## Cross-Cutting Concerns

**Logging:**

- Framework: `useLogger()` composable wraps console
- Behavior: Only logs in development mode (`process.env.NODE_ENV !== 'production'`)
- Location: `apps/game/composables/useLogger.ts`
- Usage: All errors and warnings go through logger for consistency

**Validation:**

- Answer validation: `useAnswerCheck()` queries offline data or PetScan API
- Player name validation: Checked in `pages/players.vue` before submission
- Category filtering: Available categories loaded from `public/data/categories.json`

**Authentication:**

- PWA install prompt: Captured in `app.vue`, stored in game store
- No user authentication - all data local to device

**Internationalization:**

- Framework: `@nuxtjs/i18n` with Nuxt 4
- Default locale: German (`de`)
- Available locales: `de`, `en`
- Translation files: `apps/game/i18n/locales/de.json`, `en.json`
- Strategy: `no_prefix` (no locale in URL)
- Auto-import: `useI18n()` composable auto-available in all components

**State Synchronization:**

- All game state changes flow through Pinia store mutations
- Mutations trigger `saveGameSessionToDB()` to persist changes
- Settings changes trigger `saveSettings()` to localStorage
- Online status monitored and stored in `gameStore.isOnline`

---

_Architecture analysis: 2026-01-31_
