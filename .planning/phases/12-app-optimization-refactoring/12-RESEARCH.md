# Phase 12: App Optimization & Refactoring - Research

**Researched:** 2026-02-06
**Domain:** Testing, Terraform infrastructure, game app refactoring, deployment automation, visual audit
**Confidence:** HIGH (based on direct codebase investigation)

## Summary

This research investigates the current state of the Riddle Rush codebase across six areas: unit testing, E2E testing, Terraform infrastructure, game store structure, deployment scripts, and visual audit readiness. The codebase has extensive existing tests (19 unit test files, 9 E2E test files) but several composables with real logic lack tests. The E2E tests rely heavily on CSS class selectors that may be fragile after the visual redesign in phases 1-11. The Terraform infrastructure is comprehensive but has all resources defined in a large monolithic `main.tf` (538 lines) with cache policies defined inline. The game store at 555 lines is the largest single file and has clear extraction opportunities. Deployment scripts are well-structured with dry-run support already built in. Mockup files are located in `docs/mockups/` with 10 reference images.

**Primary recommendation:** Split this phase into 5-6 parallel specialist streams that can execute independently, with clear handoff points where visual audit findings feed into the game refactor stream, and testing follows refactoring.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Testing scope:** Only composables with real logic (game session, audio/sound, IndexedDB, answer checking). Skip thin wrappers like useI18n, useRouter that just delegate to framework
- **Integration tests:** WebSocket and IndexedDB flows are worth it since they're core to the game
- **No specific coverage target:** Focus on testing meaningful behavior, not chasing numbers
- **E2E tests:** Fix existing first (update selectors for new game design components), then expand (modal dialogs, settings sliders, language switching, offline)
- **Use data-testid:** For language-agnostic testing
- **Visual audit:** Systematic - screenshot every page at mobile resolution, compare side-by-side with mockups, log gaps as fix tasks
- **Performance:** Optimize both initial load time and runtime smoothness. Target Lighthouse >90 on all categories
- **Terraform:** Full module extraction (cache policies to reusable module, common variables module, S3 lifecycle rules, organized outputs). terraform plan shows no changes after refactor
- **User has AWS access locally** - include live terraform plan validation steps
- **Game app refactoring:** Fix multiplayer bug (round flow skipping last player with 2-3 players), simplify game store (~550 lines), clean dead code, improve error handling, polish loading states/transitions/responsiveness, replace hardcoded texts with translation keys
- **Deployment:** Claude's discretion on UX (likely script with dry-run + confirm). Use changesets workflow for versioning. Create GitHub release. Version bump to 1.0.3
- **Monitoring:** CloudWatch basics - error rate alarm (4xx/5xx), latency alarm, dashboard only (no email/SNS notifications)
- **Execution strategy:** Parallel specialist agents (testing, terraform, visual audit, game refactor, deployment). Visual audit findings feed into game refactor. Testing runs after refactoring. Deployment runs last.

### Claude's Discretion

- Deployment script UX design (dry-run + confirm pattern)
- Specific task breakdown within each specialist stream
- Order of operations within parallel streams

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (Already in Use)

| Library    | Version | Purpose                | Notes                                          |
| ---------- | ------- | ---------------------- | ---------------------------------------------- |
| Vitest     | current | Unit testing           | Already configured with happy-dom              |
| Playwright | current | E2E testing            | 3 browser projects configured                  |
| Pinia      | current | State management       | Game store + settings store                    |
| Terraform  | current | Infrastructure as code | AWS provider, eu-central-1                     |
| Changesets | current | Version management     | Already configured in `.changeset/config.json` |
| UnoCSS     | current | Utility CSS            | Part of hybrid CSS approach                    |

### Supporting

| Library            | Version | Purpose              | When to Use                             |
| ------------------ | ------- | -------------------- | --------------------------------------- |
| `idb`              | current | IndexedDB wrapper    | Already used by useIndexedDB composable |
| `socket.io-client` | current | WebSocket            | Already used by useWebSocket composable |
| `@faker-js/faker`  | current | Test data generation | Already used in E2E helpers             |

### No New Libraries Needed

This phase is purely about refactoring, testing, and optimizing existing code. No new dependencies should be added.

## Architecture Patterns

### Unit Test Pattern for Composables

The existing test pattern is well-established in `game-store.spec.ts`:

```typescript
// Pattern: Mock external dependencies, test pure logic
vi.mock('~/composables/useIndexedDB', () => ({
  useIndexedDB: () => ({
    saveGameSession: mockSaveGameSession,
    // ...
  }),
}))

describe('Composable Name', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const pinia = createPinia()
    setActivePinia(pinia)
  })
  // Tests...
})
```

### E2E Test Pattern

The existing E2E tests use CSS class selectors heavily. The new pattern should use `data-testid`:

```typescript
// OLD pattern (fragile):
const playBtn = page.locator('.play-btn')

// NEW pattern (resilient):
const playBtn = page.locator('[data-testid="play-button"]')
```

### Terraform Module Pattern

```
infrastructure/
  modules/
    cloudfront-cache-policies/  # NEW: extracted from main.tf
      main.tf
      variables.tf
      outputs.tf
    common-variables/           # NEW: shared variable definitions
      variables.tf
      outputs.tf
  main.tf                       # Refactored to use modules
```

### Game Store Decomposition Pattern

```
stores/
  game.ts                    # Core session management (reduced)
  game-categories.ts         # Category fetching, display, emoji (NEW)
  game-multiplayer.ts        # Player management, round logic (NEW)
  game-persistence.ts        # IndexedDB save/load (NEW)
```

## Don't Hand-Roll

| Problem                      | Don't Build        | Use Instead                                  | Why                                                                      |
| ---------------------------- | ------------------ | -------------------------------------------- | ------------------------------------------------------------------------ |
| IndexedDB mocking            | Custom mock        | `fake-indexeddb` or existing vi.mock pattern | Already works in game-store.spec.ts                                      |
| Audio context testing        | Simulate Web Audio | Mock AudioContext entirely                   | Web Audio API too complex to simulate                                    |
| Terraform state manipulation | Manual state edits | `terraform state mv`                         | Safe state refactoring                                                   |
| Bundle analysis              | Custom scripts     | `nuxi analyze` or `vite-bundle-analyzer`     | Built into Nuxt/Vite                                                     |
| Screenshot comparison        | Pixel diff tool    | Manual visual comparison                     | For 10 pages, manual is faster than setting up visual regression tooling |

## Common Pitfalls

### Pitfall 1: E2E Selector Breakage After Visual Redesign

**What goes wrong:** E2E tests use CSS class selectors (`.play-btn`, `.start-btn`, `.player-item`, etc.) that may have changed during phases 1-11 game design system migration.
**Why it happens:** Game design components (GameButton, GameModal, GamePanel) replaced original components with different CSS classes.
**How to avoid:** Run E2E tests FIRST to identify which selectors are broken. Add `data-testid` attributes to components before fixing selectors. Currently only 2 `data-testid` attributes exist in game pages (both in `game/[[gameId]].vue`).
**Warning signs:** Tests timing out waiting for selectors, `page.locator('.play-btn')` returning 0 elements.

### Pitfall 2: Multiplayer Bug - currentPlayerTurn Logic

**What goes wrong:** With 2-3 players, the round flow skips the last player.
**Why it happens:** The `currentPlayerTurn` getter uses `.find((p) => !p.hasSubmitted)` which returns the first unsubmitted player. The bug is likely in the game page flow logic, not the store itself. When all-but-one player has submitted, the UI may trigger the "all submitted" flow prematurely.
**How to avoid:** Write unit tests for the exact 2-player and 3-player scenarios first, then trace the bug through the page component logic.
**Warning signs:** `allPlayersSubmitted` returning true when one player hasn't submitted.

### Pitfall 3: Terraform Plan Showing Unexpected Changes

**What goes wrong:** After extracting cache policies to modules, `terraform plan` shows resources being destroyed and recreated instead of zero changes.
**Why it happens:** Moving resources from root config to modules creates new resource addresses. Terraform sees this as "destroy old, create new."
**How to avoid:** Use `terraform state mv` to move resource state to new module addresses BEFORE running plan. Example: `terraform state mv aws_cloudfront_cache_policy.static_assets module.cache_policies.aws_cloudfront_cache_policy.static_assets`
**Warning signs:** Plan output showing `- destroy` and `+ create` for cache policies.

### Pitfall 4: Game Store Decomposition Breaking Reactivity

**What goes wrong:** Extracting parts of the Pinia store into separate stores or composables breaks reactive bindings in components.
**Why it happens:** Pinia stores have a specific reactivity model. If a composable reads from store A but the data was moved to store B, the reactive dependency chain breaks.
**How to avoid:** Keep a facade in the original `game.ts` that delegates to new stores. Don't change the public API. Only change internal organization.
**Warning signs:** Components not updating when store state changes.

### Pitfall 5: SNS Topic Already Exists in Monitoring

**What goes wrong:** The user wants "dashboard only, no email/SNS notifications" but monitoring.tf already creates an SNS topic and alarms reference it.
**Why it happens:** Existing infrastructure already has `aws_sns_topic.cloudfront_alarms` with alarm actions pointing to it.
**How to avoid:** Don't remove the SNS topic (it would destroy/recreate alarms). Instead, just don't subscribe any email endpoints to it. The dashboard is already created in monitoring.tf. Focus on making the dashboard useful, not adding new alarm infrastructure.
**Warning signs:** Terraform plan showing SNS topic destruction.

### Pitfall 6: Changeset Workflow with Ignored Packages

**What goes wrong:** Running `pnpm changeset` doesn't bump the game version because the changeset config ignores internal packages.
**Why it happens:** `.changeset/config.json` has `"ignore": ["@riddle-rush/config", "@riddle-rush/shared", "@riddle-rush/types"]` but the game package `@riddle-rush/game` is NOT ignored, so it should work. However, the game is currently at version `1.0.0`, not `1.0.2`.
**How to avoid:** Create a changeset that bumps `@riddle-rush/game` to `1.0.3`. May need to do a minor or patch bump depending on semver calculation.
**Warning signs:** Version not updating after `pnpm changeset:version`.

## Code Examples

### Composables Needing Tests (Priority Order)

Based on the user's decision to "test what matters", here are the composables with real logic:

**1. useAnswerCheck (157 lines) - NO existing test**

- Real logic: PetScan API integration, offline fallback, category caching, result generation
- Mock: `$fetch` for categories, `fetch` for PetScan API
- Key tests: checkAnswer with petscan provider, checkAnswer with offline provider, cache behavior, error handling

**2. useAudio (237 lines) - NO existing test**

- Real logic: AudioContext management, volume control, mute state, sound sequences with timing
- Mock: `AudioContext`, `OscillatorNode`, `GainNode`, `useIndexedDB` for settings
- Key tests: mute prevents sound, volume affects output, playSoundIfEnabled checks settings

**3. useIndexedDB (295 lines) - NO existing test**

- Real logic: Database schema, transactions, cursor-based queries, error handling
- Mock: Use `fake-indexeddb` or mock `idb` library
- Key tests: CRUD operations, transaction atomicity, getGameHistory with cursor limit

**4. useStatistics (225 lines) - NO existing test**

- Real logic: Score calculation, streak tracking, badge logic, leaderboard entry creation
- Mock: `useIndexedDB`
- Key tests: updateStatistics with single-player session, streak counting, badge conditions

**5. useWebSocket (245 lines) - NO existing test**

- Real logic: Connection management, reconnection, event handling, ping monitoring
- Mock: `socket.io-client`
- Key tests: connect/disconnect lifecycle, connection monitoring, error handling

**6. useGameActions (142 lines) - NO existing test**

- Real logic: Error-wrapped game actions with toast notifications
- Mock: `useGameStore`, `useRouter`, `useToast`, `useAudio`, `useI18n`
- Key tests: startNewGame success/failure, error toast on failure

### Composables That Already Have Tests (19 files)

- game-store.spec.ts (1250 lines - very comprehensive)
- settings-store.spec.ts
- use-assets.spec.ts, use-category-emoji.spec.ts, use-feature-flags.spec.ts
- use-form.spec.ts, use-loading.spec.ts, use-local-storage.spec.ts
- use-lodash.spec.ts, use-logger.spec.ts, use-menu.spec.ts
- use-modal.spec.ts, use-navigation.spec.ts, use-page-swipe.spec.ts
- use-performance.spec.ts, use-toast.spec.ts
- factories.spec.ts, reactivity-improvements.spec.ts, routes.spec.ts

### Composables to SKIP per User Decision

- usePageSetup (74 lines) - thin wrapper
- useGameState (36 lines) - thin computed wrapper
- useAnalytics (74 lines) - thin wrapper around gtag
- useLocalStorage (already tested)
- useLodash (already tested)
- useLogger (already tested)
- useLoading (already tested)
- useModal (already tested)
- useMenu (already tested)
- useOptimizedImage (141 lines) - utility, not core game logic
- useStoryboard - dev tool only
- useErrorSync (230 lines) - could be tested but not core game logic
- usePageSwipe (already tested)
- useCategoryEmoji (already tested, indirectly via game store)

### E2E Tests - Current Selector Audit

Based on reading all 9 E2E test files, here are the CSS selectors used that need verification against new game design components:

**High Risk (likely broken):**
| Selector | Used In | Likely Replacement |
|----------|---------|-------------------|
| `.play-btn` | game-complete-flow, round-start | `[data-testid="play-button"]` |
| `.start-btn` | players, game-complete-flow, round-start, leaderboard | `[data-testid="start-button"]` |
| `.add-btn` | players, game-complete-flow | `[data-testid="add-player-button"]` |
| `.player-item` | players, game-complete-flow | `[data-testid="player-item"]` |
| `.answer-input` | game-complete-flow | `[data-testid="answer-input"]` |
| `.submit-answer-btn` | game-complete-flow | `[data-testid="submit-answer"]` |
| `.player-turn-indicator` | game-complete-flow | `[data-testid="player-turn"]` |
| `.turn-name` | game-complete-flow | `[data-testid="turn-name"]` |
| `.all-submitted-message` | game-complete-flow | `[data-testid="all-submitted"]` |
| `.score-item` | game-complete-flow, results | `[data-testid="score-item"]` |
| `.score-action-btn` | game-complete-flow, results | `[data-testid="score-action"]` |
| `.next-btn` | game-complete-flow, results, leaderboard | `[data-testid="next-button"]` |
| `.next-round-btn` | game-complete-flow, leaderboard | `[data-testid="next-round"]` |
| `.finish-btn` | game-complete-flow, leaderboard | `[data-testid="finish-button"]` |
| `.leaderboard-item` | game-complete-flow, leaderboard | `[data-testid="leaderboard-item"]` |
| `.leaderboard-list` | game-complete-flow, leaderboard | `[data-testid="leaderboard-list"]` |
| `.scores-list` | results | `[data-testid="scores-list"]` |
| `.round-indicator` | game-complete-flow, round-start | `[data-testid="round-indicator"]` |
| `.splash-screen` | multiple files | `[data-testid="splash-screen"]` |
| `.menu-page` | game-complete-flow | `[data-testid="menu-page"]` |
| `.options-btn` | language | `[data-testid="options-button"]` |
| `.language-option` | language | `[data-testid="language-option"]` |
| `.ok-btn` | language | `[data-testid="ok-button"]` |

**Medium Risk (may still work):**
| Selector | Used In |
|----------|---------|
| `.page-bg` | players, results, round-start |
| `.title-image` | players, leaderboard, credits |
| `.back-btn` | players, results, leaderboard, credits |
| `.credits-panel` | credits |

**Low Risk (structural):**

- `.splash-screen` - likely unchanged
- Page-level classes (`.players-page`, `.credits-page`) - likely unchanged

### Mockup Files Location

All mockup files are in `docs/mockups/`:

```
docs/mockups/
  alphabet.png        # Round start / fortune wheel
  start.png           # Start screen (may be same as menu)
  players.png         # Players management
  scoring.png         # Results/scoring page
  leaderboard.png     # Leaderboard
  settings.png        # Settings page
  language-selector.png  # Language selection
  Splash screen.png   # Splash screen
  QUIT GAME.png       # Quit game modal
  menu.png            # Main menu
```

Pages to screenshot and compare (from user's list):

1. splash -> `Splash screen.png`
2. main menu -> `menu.png`
3. players -> `players.png`
4. round-start -> `alphabet.png`
5. game -> (no specific mockup - verify against general design)
6. results/scoring -> `scoring.png`
7. leaderboard -> `leaderboard.png`
8. settings -> `settings.png`
9. language -> `language-selector.png`
10. quit modal -> `QUIT GAME.png`
11. pause modal -> (no specific mockup listed)

### Terraform Infrastructure - Current State

**Root-level files (2613 total lines):**
| File | Lines | Content |
|------|-------|---------|
| `main.tf` | 538 | S3 bucket, CloudFront distribution, cache policies, WAF, security headers, log bucket, CloudFront function |
| `iam.tf` | 418 | IAM roles and policies |
| `dashboard.tf` | 312 | CloudWatch dashboard with performance metrics |
| `websocket.tf` | 294 | API Gateway WebSocket, Lambda functions |
| `cloudwatch-api.tf` | 250 | CloudWatch error logs API |
| `monitoring.tf` | 239 | CloudWatch alarms (5xx, 4xx, latency, S3 size), SNS topic, Lambda@Edge, Route53 health check |
| `dynamodb.tf` | 197 | DynamoDB tables for users, leaderboard, performance, websocket connections |
| `outputs.tf` | 172 | All outputs (bucket, CloudFront, WebSocket, DynamoDB, etc.) |
| `variables.tf` | 91 | Variable definitions with some validation |
| `route53.tf` | 38 | Route53 hosted zone |
| `versions.tf` | 14 | Terraform and provider version constraints |

**Existing modules:**
| Module | Status | Content |
|--------|--------|---------|
| `modules/cloudfront/` | Has `main.tf` only | Basic CloudFront module |
| `modules/cloudfront-enhanced/` | Has `main.tf` only | Enhanced CloudFront module |
| `modules/lambda-ssr/` | Complete (main, variables, outputs) | Lambda for SSR |
| `modules/s3-website/` | Has `main.tf` only | S3 website hosting |
| `modules/s3-cloudfront/` | Has `README.md` only | Empty/placeholder |

**Key refactoring targets:**

1. Cache policies in `main.tf` lines 149-198 (static_assets and html_content) - extract to module
2. Variables in `variables.tf` - some have validation (environment, price_class), others don't (bucket_name, domain_name, certificate_arn)
3. S3 lifecycle rules already exist in `main.tf` lines 56-71 (DeleteOldVersions) and intelligent tiering lines 74-87
4. Monitoring already has CloudWatch alarms for 5xx, 4xx, and latency. SNS topic exists but user wants NO notifications - just keep the dashboard
5. The existing dashboard in `monitoring.tf` lines 86-164 covers traffic, error rates, total error rate, and cache hit rate

**What the user's CONTEXT.md says vs what already exists:**

- "Extract CloudFront cache policies to reusable module" - Cache policies ARE defined inline in main.tf. Need extraction.
- "Create common variables module with validation" - Some validation exists, needs expansion.
- "Add S3 lifecycle rules" - Already exist (lines 56-87 in main.tf). May just need review/optimization.
- "Organize and document outputs" - outputs.tf is 172 lines, already organized by section. Could use better grouping.

### Game Store Analysis (555 lines)

The game store has these logical sections that could be extracted:

**Category management (lines 106-183, ~77 lines):**

- `fetchCategories()`, `loadMoreCategories()`, `resetDisplayedCategories()`, `getCategoryById()`, `getRandomCategory()`, `generateLetter()`
- Could become a `useCategoryStore` or composable

**Single-player legacy actions (lines 193-276, ~83 lines):**

- `startNewGame()` (single-player path), `submitAttempt()`, `endGame()`
- Interleaved with multi-player logic

**Multi-player actions (lines 400-553, ~153 lines):**

- `setupPlayers()`, `submitPlayerAnswer()`, `assignPlayerScore()`, `updatePlayerAvatar()`, `completeRound()`, `startNextRound()`, `resetPlayerSubmissions()`, `getPlayerById()`
- Clear extraction candidate

**Persistence (lines 334-394, ~60 lines):**

- `loadFromDB()`, `saveSessionToDB()`, `saveHistoryToDB()`, `loadSessionById()`, `clearSession()`
- Already delegates to useIndexedDB, minimal extraction value

**State + Getters (lines 44-103, ~59 lines):**

- Core state shape and computed properties
- Should stay in main store

**The multiplayer bug ("skipping last player with 2-3 players"):**

- The `currentPlayerTurn` getter (line 82-84) returns the first player where `!p.hasSubmitted`. This looks correct.
- The `allPlayersSubmitted` getter (line 76-80) checks `players.every(p => p.hasSubmitted)`. This also looks correct.
- The bug is likely in the game page component flow, where navigation to results happens before the last player submits. Need to trace through `pages/game/[[gameId]].vue`.

### Deployment Scripts - Current State

**Well-structured deployment pipeline:**

1. `scripts/deploy-prod.sh` - Main entry point for production deployment
   - Parses CLI args (--skip-checks, --dry-run, version)
   - Git branch check (main or staging)
   - AWS credential verification
   - Loads config from Terraform outputs
   - Calls `aws-deploy.sh`
   - Creates git tag if version provided
   - 166 lines

2. `scripts/aws-deploy.sh` - Core deployment logic
   - Builds app, uploads to S3 with optimized caching
   - Handles CloudFront invalidation
   - DRY_RUN support already built in
   - 385 lines

3. `scripts/lib/deploy-common.sh` - Shared functions
   - `check_git_branch`, `check_git_status`, `check_aws_cli`, `check_aws_credentials`
   - `load_aws_config`, `display_deployment_config`, `run_pre_deployment_checks`
   - `create_version_tag`, `push_version_tag`, `display_deployment_url`
   - 15,484 bytes

4. Other deploy scripts:
   - `scripts/deploy-dev.sh` - Development environment
   - `scripts/deploy-staging.sh` - Staging environment
   - `scripts/deploy-docs.sh` - Documentation site
   - `scripts/ci-deploy.sh` - CI/CD pipeline
   - `scripts/deploy-infrastructure.sh` - Terraform deployment
   - `scripts/check-deployment-status.sh` - Post-deployment verification

**What needs improvement:**

- The existing `deploy-prod.sh` already has dry-run and version tagging. The user wants "a script I can easily run myself."
- The changeset workflow integration is missing from the deploy flow
- No GitHub release creation in the scripts
- Could add a unified `deploy.sh` that combines changeset version bump + deploy + git tag + GitHub release

### data-testid Usage - Critical Gap

**Current state:** Only 2 `data-testid` attributes exist in the entire game app (both in `game/[[gameId]].vue`):

- `data-testid="back-button"` (line 10)
- `data-testid="next-button"` (line 124)

**Zero `data-testid` attributes in components.** This is a major gap for E2E test resilience.

**Recommendation:** Before fixing E2E tests, add `data-testid` attributes to all interactive elements across all game design components and pages. This is a prerequisite for the E2E test update work.

## State of the Art

| Area                | Current State                           | Target State                                     | Impact                                 |
| ------------------- | --------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Unit test coverage  | 19 test files, key composables untested | Add 6 test files for composables with real logic | Catches regressions in core game logic |
| E2E test selectors  | CSS class-based (`.play-btn`)           | `data-testid`-based                              | Resilient to visual redesign changes   |
| Terraform structure | Monolithic main.tf (538 lines)          | Modular with extracted cache policies            | Easier to maintain across environments |
| Game store          | Single 555-line file                    | Split into 3-4 focused stores/composables        | Easier to test and maintain            |
| Deployment          | Script exists but manual                | Script with changeset + deploy + tag + release   | One-command release process            |
| Monitoring          | Alarms with SNS topic (no subscribers)  | Dashboard-only, no notification setup            | Matches user's lightweight requirement |

## Open Questions

1. **E2E test breakage extent:** Without running the E2E tests, it's impossible to know exactly which selectors are broken. The first task should be to run the existing E2E suite and catalog failures.
   - What we know: Tests use CSS class selectors extensively
   - What's unclear: Which classes still exist after phases 1-11
   - Recommendation: Run `pnpm run test:e2e` as the very first step

2. **Bundle size baseline:** No current production build size data available from the investigation.
   - What we know: Build output goes to `apps/game/.output/public`
   - What's unclear: Current size, what contributes most
   - Recommendation: Run `pnpm run build` and `du -sh` plus `nuxi analyze` early in the phase

3. **Game version mismatch:** The game package is at version `1.0.0`, but the target is `1.0.3`. The changeset config should handle this, but the jump from 1.0.0 to 1.0.3 may require multiple changesets or a manual version bump.
   - Recommendation: Manually set version to 1.0.3 in package.json, then use changeset for future versions

4. **Multiplayer bug root cause:** The store logic looks correct. The bug is likely in the game page component flow. Needs investigation of `pages/game/[[gameId]].vue` and how it handles player turn transitions.
   - Recommendation: Write a unit test that reproduces the exact scenario, then trace through the page component

## Sources

### Primary (HIGH confidence)

- Direct codebase investigation of all relevant files
- `apps/game/stores/game.ts` - 555 lines, full read
- `apps/game/composables/` - all 26 composables analyzed by line count and content
- `apps/game/tests/unit/` - all 19 test files cataloged
- `apps/game/tests/e2e/` - all 9 E2E test files fully read
- `infrastructure/` - all 12 .tf files read
- `scripts/` - all deployment scripts read
- `docs/mockups/` - all 10 mockup files located
- `TASKS_V1.0.3.md` - full task breakdown read (1430 lines)
- `DEPLOYMENT-PLAN-v1.0.3.md` - full deployment plan read (1131 lines)
- `.changeset/config.json` - changeset configuration verified

### Secondary (MEDIUM confidence)

- TASKS_V1.0.3.md references composables that don't exist (useGameSession, useSound, usePWA, useI18n, useRouter) - these appear to be aspirational names in the task doc that don't match actual filenames
- Multiplayer bug analysis is based on code reading, not runtime testing

## Metadata

**Confidence breakdown:**

- Composable test gaps: HIGH - direct file-by-file investigation
- E2E selector risk: HIGH - read all E2E files and cross-referenced with known component changes
- Terraform structure: HIGH - read all .tf files, counted lines, mapped dependencies
- Game store decomposition: HIGH - read full 555-line file, identified logical sections
- Deployment scripts: HIGH - read all scripts including shared library
- Multiplayer bug: MEDIUM - code analysis only, not runtime verified
- Visual audit readiness: HIGH - located all 10 mockup files, mapped to pages

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (stable codebase, no external dependencies changing)
