# Roadmap: Visual Redesign to Match Mockups

## Overview

Transform all Riddle Rush screens to match designer mockups pixel-for-pixel by building a modern CSS design system, creating 7 game-specific components, and migrating 8 pages and 2 modals. Foundation establishes tokens and utilities, components provide reusable UI building blocks, and pages deliver the complete visual overhaul from splash screen through gameplay to leaderboard.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design Tokens** - Color palette, typography, and spacing foundation
- [x] **Phase 2: Design Utilities** - Effects mixins and responsive scaling system
- [x] **Phase 3: Core Layout Components** - Panel and background containers
- [x] **Phase 4: Interactive Components** - Buttons and display elements
- [x] **Phase 5: Structural Components** - Headers, modals, and scrollable lists
- [x] **Phase 6: Splash & Navigation** - Initial screens and main menu
- [x] **Phase 7: Player Setup** - Player configuration interface
- [x] **Phase 8: Core Gameplay** - Main game screen (critical path)
- [x] **Phase 9: Game Results** - Scoring and leaderboard pages
- [x] **Phase 10: Settings Pages** - Options and language selection
- [x] **Phase 11: Modal Dialogs** - Quit and pause overlays
- [x] **Phase 11.1: Scoring & Player Config** - INSERTED: Score increment ±1, player count 2-10, leaderboard rank fixes
- [x] **Phase 12: App Optimization & Refactoring** - Production readiness, testing, and infrastructure
- [x] **Phase 13: Post-Round Next Step Modal** - Prompt to play another round or view leaderboard
- [x] **Phase 14: Maintenance & Quality of Life** - Address pending todos and bugs (completed 2026-03-21)
- [ ] **Phase 15: Visual Polish, Animations & Bug Fixes** - Mockup CSS fidelity, Figma sync prep, smooth animations, code dedup, bug fixes
- [ ] **Phase 17: Repo Cleanup, Documentation & Optimization** - Cleanup repo structure, improve documentation, research refactoring & optimization opportunities
- [x] **Phase 18: Fortune Wheel Default, Warning Fixes, E2E Rework & Post-Zustand Refactoring** - Enable fortune wheel default, fix warnings/duplicated imports, rework E2E tests, refactor post-migration changes (completed 2026-03-23)
- [x] **Phase 19: Move from Pinia to Zustand** - Complete Pinia-to-Zustand state management migration (completed 2026-03-22)
- [x] **Phase 20: Revert Zustand to Pinia** - Revert Zustand migration back to Pinia while preserving architectural improvements
- [ ] **Phase 21: Refactor and Fix E2E and Unit Tests** - Complete Phase 12 uncompleted unit tests, refactor remaining E2E specs, fix multi-round scoring workflow, achieve 100% E2E test pass rate

## Phase Details

### Phase 1: Design Tokens

**Goal**: Establish CSS custom properties for colors, typography, and spacing that match mockup specifications
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02
**Success Criteria** (what must be TRUE):

1. Blue gradient backgrounds, orange/gold borders, and button colors (green/blue/orange) available as CSS variables
2. Display font styles with multi-layer text-shadow for embossed effect defined as CSS variables
3. Spacing scale derived from 1080x1920 mockup values accessible throughout app
4. Typography scales maintain readability at 360px width and 1024px width

**Plans:** 5 plans

Plans:

- [x] 01-01-PLAN.md - Install and configure UnoCSS for utility-first CSS
- [x] 01-02-PLAN.md - Enhance design-system.scss with mockup-specific tokens
- [x] 01-03-PLAN.md - Wire UnoCSS to SCSS tokens and verify system

### Phase 2: Design Utilities

**Goal**: Create reusable SCSS mixins for visual effects and responsive scaling functions
**Depends on**: Phase 1
**Requirements**: FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):

1. Glossy gradient mixin produces mockup-matching button appearance
2. Embossed border mixin creates 3D panel effect with inner glow
3. Multi-layer drop shadow mixin applies to text and panels
4. Responsive scaling utility converts mockup pixel values to clamp() with viewport units
5. All effects maintain performance (no jank on scroll)
   **Plans:** 2 plans

Plans:

- [x] 02-01-PLAN.md - Add responsive scaling utilities and shadow/glow mixins
- [x] 02-02-PLAN.md - Create glossy button and embossed panel mixins

### Phase 3: Core Layout Components

**Goal**: GamePanel and GameBackground components provide foundation for all screens
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-05
**Success Criteria** (what must be TRUE):

1. GamePanel renders with orange/gold border, rounded corners (18-24px), and inner glow
2. GameBackground applies blue radial gradient with spotlight effect
3. Components scale responsively from 320px to 1024px width
4. Components can be composed (panel inside background) without style conflicts
   **Plans**: 2 plans

Plans:

- [x] 03-01-PLAN.md - Create GameBackground component
- [x] 03-02-PLAN.md - Create GamePanel component

### Phase 4: Interactive Components

**Goal**: GameButton and GameDisplay provide styled interactive elements matching mockups
**Depends on**: Phase 2
**Requirements**: COMP-02, COMP-03
**Success Criteria** (what must be TRUE):

1. GameButton renders gradient (green primary, blue secondary, orange warning) with embossed 3D effect
2. Button responds to normal/hover/active/disabled states with appropriate visual feedback
3. Button press shows active state (inset appearance)
4. GameDisplay renders yellow/gold text with glow effect for scores and letters
5. Display text remains readable against busy backgrounds (4.5:1 contrast minimum)
   **Plans**: 2 plans

Plans:

- [x] 04-01-PLAN.md - Create GameButton component with gradient variants and 3D press effect
- [x] 04-02-PLAN.md - Create GameDisplay component with gold text and glow effect

### Phase 5: Structural Components

**Goal**: GameHeader, GameModal, and GameScrollList complete component library
**Depends on**: Phase 3, Phase 4
**Requirements**: COMP-04, COMP-06, COMP-07
**Success Criteria** (what must be TRUE):

1. GameHeader applies decorative text effects to page titles
2. GameModal renders with colored header bar, backdrop, and centered positioning
3. Modal backdrop prevents interaction with underlying content
4. GameScrollList displays player/leaderboard cards with consistent styling
5. ScrollList handles 1-6 players without layout breaking
   **Plans**: 3 plans

Plans:

- [x] 05-01-PLAN.md - Create GameHeader and GameScrollList components
- [x] 05-02-PLAN.md - Create GameModal with focus trap
- [x] 05-03-PLAN.md - Verify structural components (visual + interaction)

### Phase 6: Splash & Navigation

**Goal**: Splash screen and main menu visually match mockups and provide entry to app
**Depends on**: Phase 5
**Requirements**: PAGE-01, PAGE-02
**Success Criteria** (what must be TRUE):

1. Splash screen displays "RIDDLE RUSH" title with 3D text effect
2. Loading bar animates at bottom of splash screen
3. Main menu shows PLAY/MENU/OPTIONS/CREDITS buttons stacked vertically
4. No coins or profile avatar visible on main menu
5. Buttons respond to touch/click with visual feedback
6. Navigation from splash to menu works smoothly (300-400ms transition)
   **Plans**: 2 plans

Plans:

- [x] 06-01-PLAN.md — Create splash.vue page with animated loading and auto-navigation
- [x] 06-02-PLAN.md — Refactor index.vue main menu to use GameButton components

### Phase 7: Player Setup

**Goal**: Players page matches mockup for configuring game participants
**Depends on**: Phase 5
**Requirements**: PAGE-03
**Success Criteria** (what must be TRUE):

1. Player count stepper (+/-) adjusts from 1 to 6 players
2. Name input fields display with placeholder text and mockup styling
3. Input fields appear/disappear when player count changes
4. START GAME button is styled and positioned as in mockup
5. No coins visible on players page
   **Plans**: 2 plans

Plans:

- [x] 07-01-PLAN.md — Rebuild players page layout, stepper, and inputs
- [x] 07-02-PLAN.md — Verify players page against mockup requirements

### Phase 8: Core Gameplay

**Goal**: Game page matches alphabet.png mockup for primary gameplay screen (critical path)
**Depends on**: Phase 5
**Requirements**: PAGE-04
**Success Criteria** (what must be TRUE):

1. Round indicator displays centered below header
2. Category panel has two-part design (orange header + cream body)
3. Large letter displays with 3D blue styling
4. Text input styled to fit theme (required for multiplayer)
5. Back button positioned top-left
6. NEXT button matches mockup green glossy styling
   **Plans**: 2 plans

Plans:

- [x] 08-01-PLAN.md — Refactor game page layout and styling to match mockup
- [x] 08-02-PLAN.md — Verify game page against mockup requirements

### Phase 9: Game Results

**Goal**: Scoring and leaderboard pages display game outcomes matching mockups
**Depends on**: Phase 5
**Requirements**: PAGE-05, PAGE-06
**Success Criteria** (what must be TRUE):

1. Scoring page shows player cards with name and score
2. Green +pts indicators display for correct answers
3. Red -pts indicators display for incorrect/skipped answers
4. NEXT ROUND button styled as in mockup
5. Leaderboard displays "Ranking" header
6. Crown icons appear for positions 1-3
7. Numbered badges appear for positions 4-6
8. Player names and scores align consistently
9. No coins visible on either page
   **Plans**: 2 plans

Plans:

- [x] 09-01-PLAN.md — Create GamePlayerCard component and scoring page with score indicators
- [x] 09-02-PLAN.md — Refactor leaderboard page to use GameScrollList with rank badges

### Phase 10: Settings Pages

**Goal**: Settings and language pages match mockups for app configuration
**Depends on**: Phase 5
**Requirements**: PAGE-07, PAGE-08
**Success Criteria** (what must be TRUE):

1. Settings page displays "OPTIONS" title in styled header
2. Sound/Music sliders have custom styled track and thumb
3. Slider values update visually when adjusted
4. OK button matches mockup styling
5. Language page displays "LANGUAGE" title in panel
6. English/German rows show flag icons with checkmark for selected language
7. Language selection updates when row clicked
8. OK button returns to previous screen
   **Plans**: 2 plans

Plans:

- [x] 10-01-PLAN.md — Create GameSlider component and refactor settings page
- [x] 10-02-PLAN.md — Refactor language page with emoji flags and selection checkmark

### Phase 11: Modal Dialogs

**Goal**: Quit and pause modals match mockups for in-game overlays
**Depends on**: Phase 5
**Requirements**: MODAL-01, MODAL-02
**Success Criteria** (what must be TRUE):

1. Quit modal displays red header bar with "QUIT GAME" title
2. Confirmation text asks "Are you sure you want to quit game?"
3. NO button styled red, YES button styled green
4. Pause modal displays blue header with "Game Paused"
5. Resume message appears below header
6. Resume button (green), Restart button (blue), Home button (orange) display stacked
7. Clicking outside modal does not dismiss it
8. Modal backdrop dims background content
   **Plans**: 3 plans

Plans:

- [x] 11-01-PLAN.md — Extend GameModal and GameButton with dismissal control and danger variant
- [x] 11-02-PLAN.md — Refactor QuitModal to use GameModal with danger variant
- [x] 11-03-PLAN.md — Refactor PauseModal to CSS-first with stacked buttons

### Phase 11.1: Scoring & Player Config (INSERTED)

**Goal**: Adjust scoring increment to ±1 per button press, make player count limits configurable via runtime config (env vars), set defaults to 2-10 players with default 2, and ensure leaderboard displays correct scores and rank positions for up to 10 players
**Depends on**: Phase 9 (Game Results)
**Success Criteria** (what must be TRUE):

1. Score +/- buttons on results page change score by 1 per press (not 10)
2. Player count limits (min, max, default) are configurable via Nuxt runtime config / environment variables
3. Default player range is 2-10 with default 2 (overridable per deployment)
4. Read-only leaderboard page shows each player's correct total score and rank position
5. GameScrollList rank badges display for positions 4-10 (not just 4-6)

**Plans**: 2 plans

Plans:

- [x] 11.1-01-PLAN.md — Update scoring increment, player limits via runtime config, and shared constants
- [x] 11.1-02-PLAN.md — Fix GameScrollList rank display for up to 10 players and verify leaderboard

### Phase 12: App Optimization & Refactoring

**Goal**: Prepare app for production v1.0.3 with comprehensive testing, optimized Terraform infrastructure, and proper deployment
**Depends on**: Phase 11
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):

1. All composables have unit tests with >75% coverage
2. Integration tests cover WebSocket and IndexedDB flows
3. E2E test suite passes with 100% success rate
4. Terraform infrastructure refactored with reusable modules and validation
5. CloudFront cache policies extracted to dedicated module
6. Production bundle built and optimized (<5MB total)
7. Lighthouse score >90 on all categories
8. Version 1.0.3 deployed to production with monitoring
9. Git tag v1.0.3 created and GitHub release published
10. 24-hour production monitoring shows stability

**Plans**: 10 plans

Plans:

- [ ] 12-01-PLAN.md — E2E test fixes with data-testid attributes
- [ ] 12-02-PLAN.md — Unit tests for useAnswerCheck, useGameActions, useGameState
- [ ] 12-03-PLAN.md — Unit tests for useStatistics, useAudio, useIndexedDB
- [ ] 12-04-PLAN.md — Extract S3, CloudFront, DynamoDB Terraform modules
- [ ] 12-05-PLAN.md — Extract Lambda, API Gateway, WebSocket, CloudWatch modules
- [ ] 12-06-PLAN.md — Extract category and session management composables
- [ ] 12-07-PLAN.md — Extract player and scoring management composables
- [ ] 12-08-PLAN.md — Extract attempt, statistics, persistence composables
- [ ] 12-09-PLAN.md — Visual audit of all game pages
- [ ] 12-10-PLAN.md — Deployment script enhancements

**Details**:

- **Wave 1 (Blocking):** Plan 01 - E2E fixes establish safety net
- **Wave 2 (Parallel):** Plans 02-08 - Testing, Terraform, Game Store refactoring
- **Wave 3 (Polish):** Plans 09-10 - Visual audit and deployment automation

### Phase 13: Post-Round Next Step Modal

**Goal**: Ensure a modal appears after all players are scored, asking whether to start another round or go to the leaderboard
**Depends on**: Phase 9, Phase 11
**Requirements**: MODAL-03
**Success Criteria** (what must be TRUE):

1. After all players have been played and points are set, a modal appears on the results flow
2. Modal asks: "Do you want to play another round, or go to the leaderboard?"
3. Choosing "Another round" starts the next round flow
4. Choosing "Leaderboard" navigates to the leaderboard screen
5. Modal does not appear prematurely (only after scoring is complete)

**Plans**: 1 plan

Plans:

- [x] 13-01-PLAN.md — Confirm post-round decision modal copy and flow

### Phase 14: Maintenance & Quality of Life

**Goal**: Address pending technical debt, bugs, and internationalization tasks to improve codebase health and stability.
**Depends on**: Phase 13
**Success Criteria** (what must be TRUE):

1. All user-facing text is replaced with i18n translation keys.
2. The multiplayer bug causing round skips is identified and resolved.
3. The game store's structure is reviewed, and its complexity is reduced where feasible.
4. The intermittent `nuxi typecheck` error is investigated and fixed.
5. GitHub Actions CI/CD workflows reviewed and improved — deploy-dev.yml quality gate fixed, pnpm cache added, comprehensive-ci-cd.yml duplicate removed.

**Plans:** 3/3 plans complete

Plans:

- [x] 14-01-PLAN.md — i18n completeness: replace hardcoded strings, merge duplicate locale sections
- [x] 14-02-PLAN.md — CI/CD improvements: fix deploy-dev.yml quality gate, delete duplicate workflow
- [x] 14-03-PLAN.md — Multiplayer bug investigation + fix, typecheck error fix, game store assessment

### Phase 15: Visual Polish, Animations & Bug Fixes

**Goal**: Achieve pixel-perfect CSS fidelity with mockups across all screens, prepare Figma sync pipeline, add smooth page/component animations, refactor duplicated code, and fix known bugs
**Depends on**: Phase 14
**Requirements**: POLISH-01, POLISH-02, POLISH-03, POLISH-04, POLISH-05
**Success Criteria** (what must be TRUE):

1. Every page with a mockup in docs/mockups/ visually matches the mockup CSS styling
2. Pages without mockups (round-start, credits) follow the established design system consistently
3. Figma token sync pipeline is prepared (CSS custom properties layer that Figma variables can override)
4. Page transitions use smooth, consistent animations (not jarring cuts)
5. Component mount/unmount animations feel polished (stagger, fade, slide)
6. No duplicated styling code across pages (shared via design system or composables)
7. Known bugs from STATE.md pending todos are resolved
8. All unit tests pass, workspace:check passes

**Plans:** 4 plans

Plans:

- [ ] 15-01-PLAN.md -- Remove duplicate scoped @keyframes, migrate round-start.vue to GameBackground
- [ ] 15-02-PLAN.md -- Figma token sync pipeline: sync script, CSS override layer, nuxt.config.ts wiring
- [ ] 15-03-PLAN.md -- Bug fixes: multiplayer round flow regression test + fix, remove orphaned PageTransition.vue
- [ ] 15-04-PLAN.md -- Fortune Wheel redesign (game palette + CSS pointer + 300px fluid), index.vue CSS gaps + page animations

**Details**:

- **Wave 1 (Parallel):** Plans 01, 02, 03 -- CSS foundation, Figma prep, bug fixes (independent)
- **Wave 2 (Sequential):** Plan 04 -- CSS gap fixes + animations (depends on Plan 01 for .page-shell class)

### Phase 17: Repo Cleanup, Documentation & Optimization

**Goal**: Clean up repository structure, improve documentation coverage, identify and implement refactoring and optimization opportunities. Large improvements tracked as todos for future phases.
**Depends on**: Phase 15
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03, CLEAN-04, CLEAN-05, CLEAN-06
**Success Criteria** (what must be TRUE):

1. Repository structure is clean — no orphaned files, outdated configs, or unused dependencies
2. Documentation is up-to-date — CLAUDE.md, README.md, and docs/ reflect current codebase state
3. Dead code and unused exports are identified and removed
4. Dependency audit completed — outdated/vulnerable packages updated or replaced
5. Build and bundle size optimized where quick wins exist
6. Large refactoring opportunities documented as todos in STATE.md for future work

**Plans:** 5 plans

Plans:

- [ ] 17-01-PLAN.md — Remove orphaned root files and AI tool config dirs from git tracking, update .gitignore
- [ ] 17-02-PLAN.md — Install Knip for dead code detection, remove stale CI configs and orphaned dirs
- [ ] 17-03-PLAN.md — Update CLAUDE.md and README.md to match current codebase, archive stale docs

**Details**:

- **Wave 1 (Parallel):** Plans 01, 02 — File cleanup and Knip setup (independent)
- **Wave 2 (Sequential):** Plan 03 — Documentation updates (depends on 01, 02 for accurate post-cleanup state)

### Phase 18: Fortune Wheel Default, Warning Fixes, E2E Rework & Post-Zustand Refactoring

**Goal:** Enable fortune wheel as the default round-start experience, fix build warnings (duplicated imports, unused vars), rework E2E test suite for reliability and Zustand compatibility, and refactor post-migration code quality issues across the codebase.
**Depends on:** Phase 19
**Success Criteria** (what must be TRUE):

1. Fortune wheel is the default round-start mode (no feature flag needed to enable it)
2. Zero duplicated import warnings in TypeScript/ESLint output
3. All build warnings addressed or intentionally suppressed with explanation
4. E2E test suite reworked — passes reliably, uses Zustand-compatible helpers
5. Post-Zustand migration cleanup complete — no leftover Pinia references, clean store patterns
6. `pnpm run workspace:check` passes with no errors
7. All existing unit tests pass after refactoring

**Plans:** 5 plans

Plans:

- [x] 18-01-PLAN.md — Remove store barrel files (fix 19 duplicated import warnings), verify fortune wheel default
- [x] 18-02-PLAN.md — Create shared E2E game-flow helpers, refactor HIGH priority specs
- [x] 18-03-PLAN.md — Refactor remaining E2E specs to use shared helpers, final suite audit
- [x] 18-04-PLAN.md — Finalize feature-flag contract and precedence tests (GitLab-first, fortune-wheel default fallback)
- [x] 18-05-PLAN.md — Single-source game flow refactor, multi-round workflow fixes, and code-review cleanup bundle

**Details**:

- **Wave 1 (Parallel):** Plans 01, 02 — Barrel cleanup and E2E helper creation (independent)
- **Wave 2 (Parallel):** Plans 03, 04 — E2E completion + feature-flag contract finalization (03 depends on 02, 04 depends on 01)
- **Wave 3 (Sequential):** Plan 05 — Unified game-flow + multi-round fixes (depends on 03 and 04)

### Phase 19: Move from Pinia to Zustand

**Goal:** Complete the Pinia-to-Zustand state management migration: move Zustand stores from nested directory to stores/ root, split monolithic Vue wrapper into focused reactive hooks, swap all consumer imports, remove Pinia entirely, and rewrite tests for Zustand isolation.
**Depends on:** Phase 18
**Requirements**: MIGRATE-01, MIGRATE-02, MIGRATE-03, MIGRATE-04, MIGRATE-05, MIGRATE-06, MIGRATE-07
**Plans:** 3/3 plans complete

Plans:

- [x] 19-01-PLAN.md — Move raw Zustand stores to stores/ root, create focused Vue hooks with reactivity bridge, create localStorage migration utility
- [x] 19-02-PLAN.md — Big-bang consumer cutover to focused hooks, remove Pinia entirely, delete old stores
- [x] 19-03-PLAN.md — Rewrite unit tests for Zustand, create migration test, clean up E2E helpers

**Details:**

- **Wave 1:** Plan 01 — Create new store files, hooks, and migration utility (foundation)
- **Wave 2:** Plan 02 — Swap all consumers, remove Pinia package and config, delete old files
- **Wave 3:** Plan 03 — Rewrite tests for Zustand isolation, add migration test, update E2E helpers

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 11.1 -> 12 -> 13 -> 14 -> 15 -> 17 -> 18 -> 19 -> 20 -> 21

| Phase                                 | Plans Complete | Status   | Completed  |
| ------------------------------------- | -------------- | -------- | ---------- |
| 1. Design Tokens                      | 3/3            | Complete | 2026-01-31 |
| 2. Design Utilities                   | 2/2            | Complete | 2026-01-31 |
| 3. Core Layout Components             | 2/2            | Complete | 2026-02-01 |
| 4. Interactive Components             | 2/2            | Complete | 2026-02-01 |
| 5. Structural Components              | 3/3            | Complete | 2026-02-01 |
| 6. Splash & Navigation                | 2/2            | Complete | 2026-02-01 |
| 7. Player Setup                       | 2/2            | Complete | 2026-02-01 |
| 8. Core Gameplay                      | 2/2            | Complete | 2026-02-01 |
| 9. Game Results                       | 2/2            | Complete | 2026-02-01 |
| 10. Settings Pages                    | 2/2            | Complete | 2026-02-01 |
| 11. Modal Dialogs                     | 3/3            | Complete | 2026-02-16 |
| 11.1. Scoring & Player Config         | 2/2            | Complete | 2026-02-16 |
| 12. App Optimization & Refactoring    | 10/10          | Complete | 2026-02-16 |
| 13. Post-Round Next Step Modal        | 1/1            | Complete | 2026-02-27 |
| 14. Maintenance & Quality of Life     | 3/3            | Complete | 2026-03-21 |
| 15. Visual Polish & Bug Fixes         | 0/4            | Planned  | —          |
| 17. Repo Cleanup, Docs & Optimization | 0/3            | Planned  | —          |
| 18. Fortune Wheel + Warnings + E2E    | 5/5            | Complete | 2026-03-23 |
| 19. Pinia to Zustand Migration        | 3/3            | Complete | 2026-03-22 |
| 20. Revert Zustand to Pinia           | 3/3            | Complete | 2026-03-23 |
| 21. Refactor and Fix E2E & Unit Tests | 0/10           | Planned  | —          |

### Phase 20: Revert Zustand to Pinia

**Goal**: Revert Zustand migration back to Pinia while preserving architectural improvements to eliminate reactivity issues and restore production stability.

**Success Criteria** (what must be TRUE):

1. Application reverts to stable Pinia-based state management
2. No reactivity issues between store and Vue templates
3. Unified GameFlowState and transition helpers preserved
4. Same composable API surface maintained (useGameState, useGameActions, etc.)
5. All E2E tests pass, especially multi-round scoring workflow
6. Application is production-ready without fundamental reactivity problems

**Plans:** 3/3 plans complete

Plans:

- [x] 20-01-PLAN.md — Convert main game store back to Pinia, preserve unified flow state
- [x] 20-02-PLAN.md — Update all Vue components and tests to use Pinia
- [x] 20-03-PLAN.md — Run comprehensive E2E tests and verify reactivity issues resolved

**Details**:

- **Wave 1:** Plan 01 — Convert main store to Pinia with preserved architecture
- **Wave 2:** Plan 02 — Update all components and tests for Pinia compatibility
- **Wave 3:** Plan 03 — Verify E2E tests pass and reactivity issues are resolved

### Phase 21: Refactor and Fix E2E and Unit Tests

**Goal**: Complete Phase 12 unimplemented unit test plans, refactor remaining E2E specs to use shared helpers, fix multi-round scoring workflow, and achieve 100% E2E test pass rate. Address all test-related technical debt and ensure comprehensive coverage of critical game flows.

**Depends on**: Phase 20
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05

**Success Criteria** (what must be TRUE):

1. All Phase 12 unimplemented unit test plans are complete (12-02, 12-03, 12-06, 12-07, 12-08)
2. Integration tests cover WebSocket and IndexedDB flows
3. E2E test suite passes with 100% success rate (no intermittent failures)
4. Multi-round scoring workflow test passes (modal 3 options, predicted rank, answer input feature flag)
5. Game mode refactored to single source of truth with documented state flow chart
6. All remaining E2E specs use shared helpers from tests/e2e/helpers/game-flow.ts
7. Zero CSS class selectors remain in E2E tests (all data-testid based)
8. All unit tests pass and workspace:check succeeds

**Plans:** 10 plans

Plans:

- [ ] 21-01-PLAN.md — Unit tests for core composables (CategoryManager, PlayerManager, ScoringEngine)
- [ ] 21-01A-PLAN.md — Unit tests for SessionManager and Persistence
- [ ] 21-01B-PLAN.md — Unit tests for GameLifecycle and Analytics
- [ ] 21-02-PLAN.md — Refactor E2E specs to data-testid selectors and shared helpers
- [ ] 21-03-PLAN.md — Add missing data-testid attributes to page components
- [ ] 21-04-PLAN.md — Mobile E2E tests for critical game flows (Pixel 5, iPad Pro 11)
- [ ] 21-05-PLAN.md — NativeScript mobile app unit and integration tests
- [ ] 21-06-PLAN.md — Integration tests for WebSocket and IndexedDB flows
- [ ] 21-07-PLAN.md — Fix multi-round scoring workflow E2E test
- [ ] 21-08-PLAN.md — Game mode refactor and state flow chart
- [ ] 21-09-PLAN.md — Verify 100% E2E test pass rate across full suite

**Details**:

**Wave 1 (Foundation - Parallel):** Plans 01, 01A, 01B, 02, 03
**Wave 2 (Integration & Expansion - Parallel):** Plans 04, 05, 06
**Wave 3 (Fix & Documentation - Parallel):** Plans 07, 08
**Wave 4 (Final Verification - Sequential):** Plan 09

Collected test-related todos from recent phases:

**From Phase 12 (Unimplemented Plans):**

- Unit tests for composables (12-02, 12-03, 12-06, 12-07, 12-08)
- Integration tests covering WebSocket and IndexedDB flows
- E2E test suite with 100% success rate

**From Phase 18 (Incomplete E2E Refactor):**

- Plan 18-03: Refactor remaining E2E specs to use shared helpers
- Remaining specs still use CSS class selectors instead of data-testid

**From STATE.md Pending Todos:**

- Test and fix full game workflow with multi-round scoring (modal 3 options, predicted rank, answer input feature flag)
- Refactor game mode to single source of truth with documented state flow chart

**Key Issues to Address:**

1. E2E tests have intermittent failures due to timing/race conditions
2. Some E2E specs still use fragile CSS class selectors
3. Unit test coverage gaps for key composables
4. Multi-round scoring workflow not fully tested end-to-end
5. Integration tests for WebSocket and IndexedDB missing
