# Codebase Concerns

**Analysis Date:** 2026-02-06

## Tech Debt

**SSR/i18n Plugin Circular Dependencies:**

- Issue: Nuxt 4 + @nuxtjs/i18n SSR plugins cause "Cannot access 'NuxtPluginIndicator' before initialization" errors. Workaround involves manual plugin filtering in multiple hooks.
- Files: `apps/game/nuxt.config.ts` (lines 26-62, 289-308), `apps/game/utils/filter-ssr-plugins.ts`
- Impact: Fragile build process requiring custom Vite plugin and multiple hook interventions. SSR plugins disabled despite being auto-registered by i18n module.
- Fix approach: Upgrade to stable Nuxt 4 + i18n combo when circular dependency issues are resolved upstream, or switch to `no_prefix` strategy with fully client-side i18n.

**Legacy Single-Player Mode Support:**

- Issue: Game store maintains dual code paths for legacy single-player (score/attempts) and modern multi-player (players array)
- Files: `apps/game/stores/game.ts` (lines 61-62, 204-228, 232-256)
- Impact: Increased complexity, potential confusion about which fields to use, redundant state management
- Fix approach: Remove legacy single-player fields after confirming all pages use multi-player pattern, migrate any remaining single-player logic

**Manual Lodash Tree-Shaking:**

- Issue: Custom `useLodashSync()` composable exists to work around initialization issues, duplicates functionality
- Files: `apps/game/composables/useLodash.ts`, usage in `apps/game/stores/game.ts` (line 6, 34)
- Impact: Maintenance burden, potential for drift between sync/async versions
- Fix approach: Refactor to use standard lodash-es imports once initialization order is guaranteed

**WebSocket Infrastructure Not Fully Integrated:**

- Issue: WebSocket support exists (socket.io, AWS Lambda handlers, composable) but not used in core game flow
- Files: `apps/game/composables/useWebSocket.ts`, `apps/game/pages/websocket-demo.vue`, `apps/game/plugins/websocket.client.ts`, `infrastructure/lambda/websocket/`
- Impact: Unused infrastructure increasing bundle size, unclear whether real-time features are planned or abandoned
- Fix approach: Either integrate WebSocket features into game (multiplayer sync, live leaderboards) or remove if not part of roadmap

**Terraform Outputs Env Var Integration Complexity:**

- Issue: Complex runtime config merging Terraform outputs from environment variables with manual fallbacks
- Files: `apps/game/nuxt.config.ts` (lines 130-161), `nuxt.config.terraform.ts`
- Impact: Difficult to debug configuration issues, unclear precedence rules
- Fix approach: Standardize on single config source (env vars OR Terraform outputs), document clearly

**Test Page in Production:**

- Issue: `apps/game/pages/component-test.vue` exists for testing but not excluded from production builds
- Files: `apps/game/pages/component-test.vue`
- Impact: Exposes internal testing page to users if they guess the route
- Fix approach: Add route guard or exclude from production builds via nuxt.config

**Race Condition in Category Loading:**

- Issue: Fixed with polling workaround (100ms checks, 10s timeout) but not ideal
- Files: `apps/game/stores/game.ts` (lines 106-123)
- Impact: Could hang for 10 seconds if `categoriesLoading` flag gets stuck, no cancellation mechanism
- Fix approach: Use proper async locking (e.g., p-queue or manual promise cache) instead of polling

## Known Bugs

**Division by Zero Risk in Statistics:**

- Symptoms: Potential NaN values in average calculations when no games played
- Files: `apps/game/composables/useStatistics.ts`
- Trigger: Access statistics before any games completed
- Workaround: Frontend likely checks for empty data, but not guaranteed

**IndexedDB Transaction Silent Failures:**

- Symptoms: Save operations may fail silently in offline scenarios or quota exceeded
- Files: `apps/game/composables/useIndexedDB.ts` (catch blocks log but don't surface errors to UI)
- Trigger: Browser storage quota exceeded, incognito mode restrictions
- Workaround: None visible - errors logged but game continues without persistence

**PetScan API Not Implemented Error:**

- Symptoms: Wikipedia search provider throws "not yet implemented" error
- Files: `apps/game/composables/useAnswerCheck.ts` (line 148)
- Trigger: Category with `searchProvider: 'wikipedia'`
- Workaround: Only use 'petscan' or 'offline' providers

**Score Duplication Prevention Edge Case:**

- Symptoms: Score assignment prevents duplicate additions but could cause issues if legitimate re-scoring needed
- Files: `apps/game/stores/game.ts` (lines 468-472)
- Trigger: Assigning same score twice in a round (e.g., correction scenarios)
- Workaround: Clear player round state before re-scoring

## Security Considerations

**Client-Side Category Caching:**

- Risk: 5-minute category cache could serve stale data if categories.json updated
- Files: `apps/game/composables/useAnswerCheck.ts` (lines 16-19)
- Current mitigation: Cache duration short enough for most updates
- Recommendations: Add cache-busting query param based on app version

**Unvalidated User Input in WebSocket:**

- Risk: userId generated client-side (random string), no server validation visible
- Files: `apps/game/composables/useWebSocket.ts` (line 16)
- Current mitigation: Appears to be demo/monitoring feature only
- Recommendations: Add server-side user validation if WebSocket features go production

**CSP Allows unsafe-inline and unsafe-eval:**

- Risk: XSS protection weakened by allowing inline scripts/eval
- Files: `apps/game/nuxt.config.ts` (lines 592-593)
- Current mitigation: Client-only SPA reduces server-side XSS risk
- Recommendations: Tighten CSP for production by using nonces or removing unsafe directives

**Debug Build Environment Variable:**

- Risk: `DEBUG_BUILD=true` disables minification, exposing source logic
- Files: `apps/game/nuxt.config.ts` (lines 6-9)
- Current mitigation: Requires explicit env var set
- Recommendations: Ensure production deployments never set DEBUG_BUILD

**Google Analytics ID in Runtime Config:**

- Risk: gtagId exposed in client bundle
- Files: `apps/game/nuxt.config.ts` (line 143)
- Current mitigation: Analytics IDs are typically public anyway
- Recommendations: Acceptable - GA IDs are meant to be public

## Performance Bottlenecks

**Leaderboard Getter Recreates Objects:**

- Problem: Computed `leaderboard` getter sorts and maps players on every access
- Files: `apps/game/stores/game.ts` (lines 85-100)
- Cause: Pinia getter runs on every access, creating new PlayerWithRank objects
- Improvement path: Memoize with manual dirty tracking or use computed() ref in action

**JSON Cloning for Session History:**

- Problem: `JSON.parse(JSON.stringify())` used for deep cloning sessions
- Files: `apps/game/stores/game.ts` (lines 39-42, 262)
- Cause: Simple but slow for large objects
- Improvement path: Use structuredClone() (available in modern browsers) or lodash cloneDeep

**PetScan API No Timeout:**

- Problem: Fetch to PetScan has no timeout, could hang indefinitely
- Files: `apps/game/composables/useAnswerCheck.ts` (line 46)
- Cause: Native fetch without AbortController
- Improvement path: Add timeout using AbortSignal.timeout() or Promise.race()

**Service Worker Caching Large Files:**

- Problem: Debug builds allow up to 5MB per file in cache, could exhaust storage
- Files: `apps/game/nuxt.config.ts` (line 516)
- Cause: Unminified code with sourcemaps for debugging
- Improvement path: Reduce limit or exclude debug builds from PWA caching

**No Image Lazy Loading Enforcement:**

- Problem: Image optimization configured but lazy loading not enforced globally
- Files: `apps/game/nuxt.config.ts` (lines 358-439)
- Cause: Developers must remember to use NuxtImg/NuxtPicture components
- Improvement path: Create wrapper component that enforces lazy loading by default

## Fragile Areas

**Nuxt Plugin Initialization Order:**

- Files: `apps/game/nuxt.config.ts` (lines 289-308), `apps/game/plugins/00.init-plugin-system.client.ts`
- Why fragile: Multiple hooks filtering problematic plugins, depends on timing
- Safe modification: Test thoroughly after any module/plugin additions, especially i18n changes
- Test coverage: Not explicitly tested in unit/E2E suites

**IndexedDB Database Migrations:**

- Files: `apps/game/composables/useIndexedDB.ts` (lines 30-58)
- Why fragile: DB_VERSION=3, upgrade function doesn't handle oldVersion properly
- Safe modification: Always increment DB_VERSION, add version-specific migration logic
- Test coverage: No automated testing of DB migrations

**Base URL Configuration:**

- Files: `apps/game/nuxt.config.ts` (lines 21-24), multiple environment variable sources
- Why fragile: Complex resolution logic with multiple fallbacks and special cases
- Safe modification: Test in localhost, Playwright, and deployed environments after any change
- Test coverage: E2E tests check base URL but not all permutations

**Fortune Wheel Random Selection:**

- Files: `apps/game/stores/game.ts` (lines 22-28, 174-179)
- Why fragile: No seeding for tests, true randomness makes E2E tests harder
- Safe modification: Extract randomness to injectable service for test determinism
- Test coverage: E2E tests work around randomness using UI inspection

**Multi-Player State Reactivity:**

- Files: `apps/game/stores/game.ts` (lines 443-477)
- Why fragile: Manual player index updates required for Vue reactivity, easy to miss
- Safe modification: Always update via playerIndex = findIndex(), not direct array mutation
- Test coverage: Unit tests exist (`apps/game/tests/unit/game-store.spec.ts`) but limited multi-player scenarios

## Scaling Limits

**Single IndexedDB Instance:**

- Current capacity: Browser-dependent (typically 50MB - 10GB depending on available disk space)
- Limit: Unlimited game history could exhaust quota
- Scaling path: Add retention policy (e.g., keep last 100 games), implement data pruning

**In-Memory Category Cache:**

- Current capacity: All categories loaded into memory (~hundreds of entries currently)
- Limit: Thousands of categories would slow initial load
- Scaling path: Implement pagination, virtual scrolling, or lazy load categories on demand

**Service Worker Cache Size:**

- Current capacity: 2MB max per file (5MB in debug builds), no global limit set
- Limit: Large PWA cache could fill mobile device storage
- Scaling path: Implement cache eviction strategy, limit total cache size

**PetScan API Rate Limiting:**

- Current capacity: No rate limiting on client side
- Limit: Could hit PetScan API rate limits with many concurrent users
- Scaling path: Implement client-side rate limiting, add exponential backoff, or cache results

## Dependencies at Risk

**Nuxt 4 Compatibility:**

- Risk: Nuxt 4 still in active development (compatibilityVersion: 4)
- Impact: Breaking changes in patches could affect build/runtime
- Migration plan: Monitor Nuxt releases, have rollback plan to Nuxt 3 if needed

**@nuxtjs/i18n Circular Dependencies:**

- Risk: Module causes initialization errors with SSR plugins
- Impact: Custom workarounds required, may break on updates
- Migration plan: Consider switching to simpler i18n solution (vue-i18n directly) or wait for stable Nuxt 4 support

**Socket.io Infrastructure:**

- Risk: WebSocket infrastructure included but not actively used
- Impact: Bundle bloat, unused Lambda functions in AWS
- Migration plan: Either integrate WebSocket features or remove entirely (socket.io-client, server plugins, Lambda handlers)

**Sharp Image Processing:**

- Risk: Native dependency, can cause issues on different platforms
- Impact: Build failures on ARM/different OS if not properly configured
- Migration plan: Sharp is standard for Nuxt/Next.js, well-supported but ensure CI has proper build environment

## Missing Critical Features

**Error Boundary for PWA:**

- Problem: No global error boundary to catch unhandled Vue errors
- Blocks: Users see white screen on critical errors, no recovery path
- Priority: High

**Offline Queue for IndexedDB:**

- Problem: Failed writes logged but not retried when connection restored
- Blocks: Data loss in poor network conditions
- Priority: Medium

**Session Recovery UI:**

- Problem: Game store can load sessions but no UI flow to resume interrupted games
- Blocks: Users lose progress if they close app mid-game
- Priority: Medium

**Analytics for Critical Errors:**

- Problem: Errors logged to console but not sent to analytics/monitoring
- Blocks: Unable to track production issues systematically
- Priority: High

**Cache Invalidation Strategy:**

- Problem: No way to force reload categories/assets when updated
- Blocks: Users see stale data until cache expires or manual reload
- Priority: Medium

## Test Coverage Gaps

**IndexedDB Edge Cases:**

- What's not tested: Quota exceeded, concurrent writes, DB version migrations
- Files: `apps/game/composables/useIndexedDB.ts`
- Risk: Silent failures in production storage scenarios
- Priority: High

**Multi-Player State Transitions:**

- What's not tested: All players submitting simultaneously, network delays, round transitions with disconnections
- Files: `apps/game/stores/game.ts` (multi-player actions)
- Risk: Race conditions in production multiplayer games
- Priority: High

**PWA Installation Flow:**

- What's not tested: BeforeInstallPrompt event handling, installation outcomes
- Files: `apps/game/stores/game.ts` (lines 317-332)
- Risk: Install prompt may not work correctly on different browsers
- Priority: Medium

**Base URL Configuration:**

- What's not tested: All environment variable permutations (localhost, AWS, custom BASE_URL)
- Files: `apps/game/nuxt.config.ts` (base URL resolution)
- Risk: Asset 404s in specific deployment scenarios
- Priority: Medium

**Error Recovery Flows:**

- What's not tested: Network failures during game play, IndexedDB failures, category load failures
- Files: Multiple composables/stores
- Risk: Poor user experience when errors occur
- Priority: High

**WebSocket Reconnection:**

- What's not tested: Connection drops, reconnection logic, message queuing during disconnect
- Files: `apps/game/composables/useWebSocket.ts`
- Risk: WebSocket features (if enabled) fail ungracefully
- Priority: Low (feature not integrated)

**i18n Edge Cases:**

- What's not tested: Missing translation keys, locale switching during game, fallback behavior
- Files: `apps/game/i18n/locales/`
- Risk: UI shows keys instead of text in some scenarios
- Priority: Medium

**Build Variants:**

- What's not tested: DEBUG_BUILD mode, different NITRO_PRESET values, SSR disabled
- Files: `apps/game/nuxt.config.ts`
- Risk: Production builds differ from tested development builds
- Priority: Medium

---

_Concerns audit: 2026-02-06_
