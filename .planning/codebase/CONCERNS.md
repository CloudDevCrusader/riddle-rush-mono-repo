# Codebase Concerns

**Analysis Date:** 2026-02-13

## Tech Debt

**Skipped Unit Tests (Game Store):**

- Issue: 7+ unit tests in the game store spec are skipped with TODOs citing CI environment issues (Node 20 vs 24 differences, state pollution between tests, race conditions, timing-dependent failures)
- Files: `apps/game/tests/unit/game-store.spec.ts`
- Impact: Core game logic (session management, scoring, player operations) lacks automated regression coverage. Bugs in these areas go undetected until production.
- Fix approach: Pin Node version in CI, isolate store state per test with `createPinia()` fresh instances, replace `setTimeout` assertions with `vi.advanceTimersByTime()`.

**Skipped E2E Tests (Results Page):**

- Issue: 6+ E2E tests for the results page are skipped, covering score display, button interactions, and navigation flows
- Files: `apps/game/tests/e2e/results.spec.ts`
- Impact: No automated verification of the post-game experience — score rendering, replay flow, and navigation after game completion are all untested.
- Fix approach: Fix the component mounting/rendering issues causing failures, ensure test fixtures provide complete game state.

**Empty Seed Test:**

- Issue: `seed.spec.ts` at root is an empty placeholder with no test content
- Files: `seed.spec.ts`
- Impact: Clutters test runs, gives false confidence in test count
- Fix approach: Either implement seeding tests or delete the file.

**Duplicate Game Logic — GameService vs Store:**

- Issue: `GameService.ts` duplicates logic already present in the game store (shuffling, player creation, score calculation, Levenshtein distance). Two sources of truth for core game mechanics.
- Files: `services/GameService.ts`, `apps/game/stores/game.ts`
- Impact: Changes to game logic must be made in two places. Divergence causes subtle scoring/matching bugs.
- Fix approach: Consolidate all game logic into either the store or the service. If the service is meant to be portable, remove Nuxt alias imports (`~/types/game`) and have the store delegate to it.

**Static-Only Class Anti-Pattern:**

- Issue: `StorageService.ts` uses a class with only static methods, requiring an eslint-disable for `no-extraneous-class`
- Files: `services/StorageService.ts`
- Impact: Unnecessary OOP overhead, harder to tree-shake, eslint rules suppressed
- Fix approach: Convert to plain exported functions (`export function saveToStorage(...)`)

**Legacy Single-Player Code:**

- Issue: Scattered `// Legacy support` and `// Legacy single-player` comments indicate abandoned code paths that are still executed
- Files: `apps/game/stores/game.ts` (multiple locations throughout the 555-line file)
- Impact: Increases store complexity, confuses future developers about which code paths are active
- Fix approach: Audit all legacy-commented code paths, remove dead code, ensure multiplayer-only paths are clean.

**Unimplemented Wikipedia Search Provider:**

- Issue: Wikipedia is declared as a search provider in types but throws "not yet implemented" at runtime
- Files: `apps/game/composables/useAnswerCheck.ts:148`, `packages/types/src/game.ts`
- Impact: If a user somehow selects Wikipedia as provider, they get a runtime error instead of a graceful fallback
- Fix approach: Either implement the Wikipedia provider or remove it from the type union and UI options.

**Mock Database Response in Socket Server:**

- Issue: `getUserStats` handler returns mock/stub data with comment "replace with actual database query"
- Files: `apps/game/server/plugins/socket.ts`
- Impact: User statistics are fabricated, not real. Any UI displaying stats shows incorrect data.
- Fix approach: Connect to actual data store or remove the endpoint until implemented.

**Incompatible Mobile App:**

- Issue: `apps/mobile` uses NativeScript with Vue 2 (`nativescript-vue: ^2.9.3`, `vue-template-compiler`) while the game app uses Vue 3 with Composition API
- Files: `apps/mobile/package.json`, `apps/mobile/app/components/`
- Impact: Mobile app cannot share any Vue components, composables, or stores with the game app. The two apps are effectively separate codebases despite being in the same monorepo.
- Fix approach: Either upgrade mobile to NativeScript + Vue 3 or extract it to a separate repo.

**Misplaced Root Dependencies:**

- Issue: Root `package.json` includes heavy AI/agent dependencies (`langchain`, `@e2b/code-interpreter`, `@voltagent/core`, `@langchain/anthropic`) in production dependencies that are unrelated to the game
- Files: `package.json` (root)
- Impact: Inflated install times, confusing dependency graph, potential version conflicts
- Fix approach: Move AI agent dependencies to a separate workspace package or devDependencies if only used for tooling.

## Known Bugs

**Potential Score Assignment Bug:**

- Symptoms: `assignPlayerScore` in the game store deduplicates score updates with `if (points !== player.currentRoundScore)` — this could silently discard legitimate score changes to the same numeric value (e.g., re-submitting after a correction)
- Files: `apps/game/stores/game.ts` (within `assignPlayerScore` action)
- Trigger: Two consecutive answer submissions that evaluate to the same point value
- Workaround: None — the logic silently drops the update

**Insecure and Non-Persistent User ID:**

- Symptoms: `useWebSocket.ts` generates userId with `Math.random().toString(36).substring(2, 15)` — not cryptographically secure and regenerated on every page load
- Files: `apps/game/composables/useWebSocket.ts:16`
- Trigger: Every new WebSocket connection creates a new identity
- Workaround: None — users effectively lose their multiplayer identity on refresh

**Category Loading Race Condition Guard:**

- Symptoms: Category loading uses a polling loop with 100ms intervals up to 10 seconds (`while` loop checking `!categories.value?.length`) as a guard against race conditions
- Files: `apps/game/stores/game.ts:114-123`
- Trigger: When categories haven't loaded by the time game initialization runs
- Workaround: The polling loop itself is the workaround — it masks a missing reactive dependency or initialization ordering issue

## Security Considerations

**CORS Wildcard on WebSocket Server:**

- Risk: Socket.IO server accepts connections from any origin (`cors: { origin: '*' }`)
- Files: `apps/game/server/plugins/socket.ts:10`
- Current mitigation: None
- Recommendations: Restrict to known origins (game domain, localhost for dev). Use environment variable for allowed origins.

**Terraform State File Committed:**

- Risk: `terraform.tfstate` is committed to the repository. While currently nearly empty (181 bytes), this file can contain secrets (API keys, database passwords) as infrastructure grows.
- Files: `terraform.tfstate`
- Current mitigation: State is mostly empty
- Recommendations: Add `terraform.tfstate` and `*.tfstate.backup` to `.gitignore`. Use remote state backend (S3 + DynamoDB).

**Minimal XSS Sanitization:**

- Risk: Player name input sanitization only strips `<>` characters — does not handle attribute injection, unicode tricks, or encoded entities
- Files: `apps/game/pages/game/[[gameId]].vue:188`
- Current mitigation: Basic `<>` stripping
- Recommendations: Use a proper sanitization library (e.g., DOMPurify) or enforce strict alphanumeric pattern validation on player names.

**GA4 Plugin Uses innerHTML Pattern:**

- Risk: `gtag.client.ts` injects Google Analytics config ID via script tag creation, using `(window as any).gtag` pattern
- Files: `apps/game/plugins/gtag.client.ts`
- Current mitigation: Config ID comes from runtime config, not user input
- Recommendations: Use the official `@nuxtjs/gtag` module or ensure CSP headers allow inline scripts.

**Placeholder CloudWatch Endpoint Exposed:**

- Risk: `useErrorSync.ts` contains a hardcoded placeholder URL `'https://your-api-gateway.execute-api.region.amazonaws.com/prod/logs'` — if error sync is enabled, it sends error logs to a non-existent (or potentially squattable) endpoint
- Files: `apps/game/composables/useErrorSync.ts:171`
- Current mitigation: The endpoint likely returns 404, so errors are silently lost
- Recommendations: Move endpoint to environment configuration, disable error sync until a real endpoint is configured.

## Performance Bottlenecks

**Oversized Single-File Components:**

- Problem: Several Vue SFCs exceed 500 lines with heavy inline styles and complex template logic
- Files: `apps/game/pages/game/[[gameId]].vue` (912 lines), `apps/game/pages/round-start.vue` (627 lines), `apps/game/components/FortuneWheel.vue` (512 lines), `apps/game/components/SettingsModal.vue` (511 lines), `apps/game/components/StoryboardDevOverlay.vue` (529 lines)
- Cause: All logic, template, and styles in a single file with no extraction to composables or child components
- Improvement path: Extract composables for logic (e.g., `useFortuneWheel`, `useGamePage`), break into smaller child components, move styles to utility classes or extracted CSS.

**Unbatched IndexedDB Writes:**

- Problem: `saveSessionToDB()` is called on every player answer submission, triggering a full IndexedDB write each time
- Files: `apps/game/stores/game.ts` (within answer submission flow), `apps/game/composables/useIndexedDB.ts`
- Cause: No debouncing or batching of DB operations
- Improvement path: Debounce `saveSessionToDB()` calls (e.g., 500ms), or batch writes at round/game boundaries.

**Full History Rewrite on Save:**

- Problem: `saveGameHistory` iterates and puts ALL history entries on every save, not just new/changed ones
- Files: `apps/game/composables/useIndexedDB.ts` (within save logic)
- Cause: No diffing or append-only pattern
- Improvement path: Track which entries are new/dirty and only write those, or use an append-only pattern with a cursor.

**JSON Deep Clone for Session History:**

- Problem: Session history is copied using `JSON.parse(JSON.stringify(session))` — blocks the main thread for large sessions and silently drops non-serializable data (Dates, functions, undefined values)
- Files: `apps/game/stores/game.ts`
- Cause: Quick-and-dirty deep clone instead of using `structuredClone()` or a targeted copy
- Improvement path: Use `structuredClone()` (available in all modern browsers and Node 17+) or create a typed `cloneSession()` utility.

## Fragile Areas

**Plugin Initialization Order:**

- Files: `apps/game/plugins/00.init-plugin-system.client.ts`, `apps/game/nuxt.config.ts`
- Why fragile: A plugin exists solely to work around `@nuxtjs/i18n` circular dependency. The Nuxt config also has a `filterProblematicPlugins` function that removes i18n SSR plugins at runtime. Both are undocumented ordering hacks.
- Safe modification: Do not rename or reorder plugins without understanding the i18n initialization chain. Test SSR and client-side rendering after any plugin changes.
- Test coverage: No tests cover plugin initialization order.

**SSR-Unsafe Composables:**

- Files: `apps/game/composables/useLogger.ts:52`, `apps/game/composables/useErrorSync.ts`
- Why fragile: `useLogger` references `window.location.href` and `navigator.userAgent` without SSR guards. `useErrorSync` uses `typeof useRuntimeConfig !== 'undefined'` as a runtime feature detection pattern. Both will crash or behave unpredictably during SSR.
- Safe modification: Always wrap browser API access in `if (import.meta.client)` or `onMounted()` hooks. Test both SSR and CSR rendering paths.
- Test coverage: No SSR-specific tests exist.

**IndexedDB Singleton in HMR:**

- Files: `apps/game/composables/useIndexedDB.ts`
- Why fragile: Uses a module-level `let dbInstance` singleton. During HMR (hot module replacement) in development, the module re-executes but the old DB connection may still be open, causing "blocked" or "version change" errors.
- Safe modification: Add HMR cleanup handler (`if (import.meta.hot) { import.meta.hot.dispose(() => dbInstance?.close()) }`) or use a Nuxt-managed provide/inject pattern.
- Test coverage: Unit tests mock IndexedDB entirely, so this issue is invisible in tests.

**Dual IndexedDB Connections:**

- Files: `apps/game/composables/useIndexedDB.ts`, `apps/game/composables/useErrorSync.ts`
- Why fragile: `useErrorSync` opens its own separate IndexedDB database (`ErrorLogs`) independent of the main game database. Two concurrent DB connections increase resource usage and can cause blocking during version upgrades.
- Safe modification: Consolidate into a single database with multiple object stores, or ensure version management is coordinated.
- Test coverage: Neither DB connection pattern is tested in integration.

**Misplaced Middleware:**

- Files: `middleware/game-active.global.ts` (at monorepo root)
- Why fragile: Global middleware placed at monorepo root instead of `apps/game/middleware/`. Nuxt may not auto-register it correctly depending on the workspace configuration. If Nuxt's file-system routing doesn't scan the root `middleware/` directory, this middleware is silently ignored.
- Safe modification: Move to `apps/game/middleware/game-active.global.ts`.
- Test coverage: No tests verify middleware registration or behavior.

## Scaling Limits

**In-Memory WebSocket State:**

- Current capacity: Single-server deployment with all WebSocket rooms held in memory
- Limit: Cannot scale horizontally — adding a second server would split rooms, causing players to be invisible to each other
- Scaling path: Add Redis adapter for Socket.IO (`@socket.io/redis-adapter`) to share state across instances.

**IndexedDB Storage:**

- Current capacity: Browser-dependent (typically 50MB-unlimited with user permission)
- Limit: Game history grows unbounded — no cleanup or rotation strategy
- Scaling path: Implement max history size with LRU eviction, or archive old sessions to server-side storage.

## Dependencies at Risk

**NativeScript Vue 2 in Mobile App:**

- Risk: Vue 2 reached end-of-life December 2023. `nativescript-vue ^2.9.3` has no path to Vue 3 without a full rewrite.
- Impact: Mobile app cannot receive Vue security patches, cannot use any shared Vue 3 code from the game app
- Migration plan: Evaluate NativeScript + Vue 3 compatibility, or consider alternative mobile frameworks (Capacitor, Expo).

**Heavy AI Agent Dependencies at Root:**

- Risk: `langchain`, `@langchain/anthropic`, `@e2b/code-interpreter`, `@voltagent/core` are fast-moving packages with frequent breaking changes
- Impact: `pnpm install` is slower, dependency resolution conflicts possible with game dependencies
- Migration plan: Isolate into a separate `packages/ai-tools` workspace or move to devDependencies.

## Missing Critical Features

**No Real User Statistics Backend:**

- Problem: `getUserStats` returns mock data — there is no database or API for persisting user statistics across sessions
- Blocks: Leaderboards, player progression, achievement systems, and any server-side game analytics

**No Error Reporting in Production:**

- Problem: CloudWatch endpoint in `useErrorSync` is a placeholder URL. No Sentry, Datadog, or other error tracking is configured.
- Blocks: Visibility into production errors — bugs go undetected until users report them manually.

**No Authentication System:**

- Problem: Players are identified only by in-memory names and random WebSocket IDs. No login, no persistent identity.
- Blocks: Cross-session game history, multiplayer friend lists, saved preferences synced across devices.

## Test Coverage Gaps

**Untested Composables (11 of 26):**

- What's not tested: `useGameActions`, `useGameState`, `useAnalytics`, `useStoryboard`, `useOptimizedImage`, `useAudio`, `useAnswerCheck`, `useColorMode`, `usePerformance`, `useDeviceCapabilities`, `useFeatureFlags`
- Files: `apps/game/composables/useGameActions.ts`, `apps/game/composables/useGameState.ts`, `apps/game/composables/useAnalytics.ts`, `apps/game/composables/useStoryboard.ts`, `apps/game/composables/useOptimizedImage.ts`, `apps/game/composables/useAudio.ts`, `apps/game/composables/useAnswerCheck.ts`, `apps/game/composables/useColorMode.ts`, `apps/game/composables/usePerformance.ts`, `apps/game/composables/useDeviceCapabilities.ts`, `apps/game/composables/useFeatureFlags.ts`
- Risk: Core gameplay composables (`useGameActions`, `useGameState`, `useAnswerCheck`) handle critical game logic — scoring, round management, answer validation — with zero test coverage
- Priority: High for `useAnswerCheck` (fuzzy matching logic), `useGameActions` (state mutations), `useGameState` (derived state). Medium for others.

**GameService Has No Tests:**

- What's not tested: Levenshtein distance calculation, fuzzy answer matching, score computation, player creation helpers
- Files: `services/GameService.ts`
- Risk: Core scoring algorithm changes could break fairness without detection
- Priority: High — this is the scoring engine

**No Integration Tests:**

- What's not tested: Store-to-composable interactions, plugin initialization chains, WebSocket message flows
- Files: All stores, composables, and plugins
- Risk: Individual units may pass but fail when composed. The plugin ordering hack (`00.init-plugin-system.client.ts`) is especially vulnerable.
- Priority: Medium

**Pervasive `as any` Casting (~50+ instances):**

- What's not tested: Type safety at cast boundaries — the TypeScript compiler cannot verify correctness where `as any` is used
- Files: `apps/game/composables/usePageSetup.ts`, `apps/game/composables/useErrorSync.ts:100`, `apps/game/plugins/error-sync.client.ts:7`, and ~47 other locations across source files
- Risk: Runtime type errors in production that TypeScript should have caught at compile time
- Priority: Medium — systematically replace with proper typing or `as unknown as TargetType` with runtime guards

---

_Concerns audit: 2026-02-13_
