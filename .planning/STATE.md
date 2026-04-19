---
gsd_state_version: 1.0
milestone: v1.0.3
milestone_name: milestone
status: Phase 24 executed — formal VERIFICATION.md / gsd-verifier optional
stopped_at: context exhaustion at 91% (2026-04-18)
last_updated: "2026-04-18T21:39:58.089Z"
progress:
  total_phases: 24
  completed_phases: 2
  total_plans: 7
  completed_plans: 7
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Every screen in the app must visually match its corresponding mockup at 1080×1920 base resolution while scaling responsively to all screen sizes.
**Current focus:** Milestone wrap-up / next roadmap item after Phase 24

## Current Position

Phase: 24 (pwa-update-notification-with-reload-button) — PLANS COMPLETE (2026-04-16)
Plan: 3 of 3 — all SUMMARY.md written

## Performance Metrics

**Velocity:**

- Total plans completed: 41
- Average duration: 3.4 min
- Total execution time: ~2h 11min

**By Phase:**

| Phase                         | Plans | Total | Avg/Plan |
| ----------------------------- | ----- | ----- | -------- |
| 01-design-tokens              | 3/3   | 20min | 7min     |
| 02-design-utilities           | 2/2   | 5min  | 2.5min   |
| 03-core-layout-components     | 2/2   | 10min | 5min     |
| 04-interactive-components     | 2/2   | 5min  | 2.5min   |
| 05-structural-components      | 3/3   | 20min | 7min     |
| 06-splash-navigation          | 2/2   | 6min  | 3min     |
| 07-player-setup               | 2/2   | 6min  | 3min     |
| 08-core-gameplay              | 2/2   | 5min  | 2.5min   |
| 09-game-results               | 2/2   | 7min  | 3.5min   |
| 10-settings-pages             | 2/2   | 7min  | 3.5min   |
| 11-modal-dialogs              | 3/3   | 9min  | 3min     |
| 11.1-scoring-player-config    | 2/2   | 14min | 7min     |
| 12-app-optimization           | 10/10 | 44min | 4.4min   |
| 13-post-round-flow            | 1/1   | 4min  | 4min     |
| 19-move-from-pinia-to-zustand | 2/3   | 24min | 12min    |

**Recent Trend:**

- Last 5 plans: 15min, 9min, 4min, 4min, 4min
- Trend: Consistent ~3-15 min per plan

_Updated after each plan completion_
| Phase 19 P02 | 15min | 2 tasks | 21 files |
| Phase 19 P01 | 9min | 2 tasks | 15 files |
| Phase 14-02 P02 | 3min | 2 tasks | 3 files |
| Phase 14-03 P03 | 4min | 2 tasks | 1 files |
| Phase 14-01 P01 | 5min | 2 tasks | 8 files |
| Phase 19 P03 | 15min | 3 tasks | 12 files |
| Phase 21 P01B | 31min | 2 tasks | 2 files |
| Phase 21 P05 | 8 | 4 tasks | 8 files |
| Phase 21 P06 | 8 | 2 tasks | 3 files |
| Phase 21 P08 | 8 | 3 tasks | 2 files |
| Phase 22 P01 | 45m | 3 tasks | 7 files |
| Phase 22 P02 | 70m | 2 tasks | 5 files |
| Phase 22 P03 | 40m | 2 tasks | 3 files |
| Phase 23 P01 | 15min | 2 tasks | 1 files |
| Phase 23 P02 | 1min | 2 tasks | 0 files |
| Phase 23 P03 | 2min | 2 tasks | 0 files |
| Phase 23 P04 | 8min | 2 tasks | 5 files |

## Accumulated Context

### Roadmap Evolution

- Phase 18 added: enable fortune-wheel as default review/refactor if implementation works and looks good
- Phase 19 added: Move from Pinia to Zustand
- Phase 21 added: Refactor and fix E2E and unit tests
- Phase 22 added: Add fortune wheel for alphabet selection using vue-fortunewheel
- Phase 23 added: Improve performance and accessibility. Find out why there are images on prod that can not be loaded

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **[New]** Repo cleanup commands for stale/orphaned files must use guarded `git rm --cached`/`git mv` checks so previously-untracked targets do not fail execution (17-01).
- **[New]** `.gitignore` AI config section now explicitly preserves `.agent/` and `.agents/` with negated rules while ignoring non-essential AI tool directories (17-01).
- **[New]** Fortune wheel local fallback default is now enabled (`settings.fortuneWheelEnabled = true`) when no GitLab client is configured (18-01).
- **[New]** Feature-flag precedence remains GitLab-first, with explicit fortune-wheel fallback default (`isEnabled('fortune-wheel', true)`) to document intended behavior (18-01).
- **[New]** Round-start contract finalized: fortune wheel is the default user path; immediate random start is fallback-only when the wheel flag resolves disabled (GitLab authoritative when configured, local settings fallback otherwise) (18-02).
- **[New]** E2E scoring/leaderboard flows now standardize on shared `game-flow` helpers, with feature-flag-aware answer submission via input-visibility checks before fill (18-02).
- **[New]** All 7 targeted game-flow E2E specs now import `./helpers/game-flow`; duplicate local flow helpers and legacy dialog/CSS game setup selectors are removed suite-wide (18-03).
- **[New]** Managed feature flags (`fortune-wheel`, `answer-input`, `websocket`) now resolve through one explicit precedence contract path: runtime force-disable (answer-input only) → GitLab → local settings → default (18-04).
- **[New]** Feature-flag regression suite now locks precedence/default semantics, including default-enabled fortune-wheel fallback when GitLab is unavailable (18-04).
- **[New]** Removed `apps/game/stores/index.ts` and `apps/game/stores/hooks/index.ts` to eliminate Nuxt auto-import collision warnings from barrel re-exports (18-01).
- **[New]** Pinia residue audit now validated against source scope (`apps/`, `packages/`, `tools/`) with allowlist-only historical/migration exceptions (18-01).
- **[New]** Phase warning closure is now tracked in `18-01-warning-inventory.md` with explicit fixed vs intentional-suppression rationale (18-01).
- **[New]** The post-round modal will have three choices: "Play Again", "New Game", and "View Leaderboard".
- **[New]** Documentation canonicalized to current repo state: CLAUDE.md + README.md now mirror real scripts, structure, and CI setup (17-03).
- **[New]** Root `docs/nuxt.config.ts` and `docs/pages/[...slug].vue` removed as stale docs app remnants after repo cleanup (17-03).
- **[New]** pnpm reference standardized to `pnpm@10.30.3` in project guidance docs to match `packageManager` (17-03).
- Syncpack v14 migration: use `lint`/`fix` commands, remove deprecated config properties.
- Use `@ts-expect-error` for cross-package vite/rollup Plugin type conflicts in monorepo.
- EC2 is more cost-effective than ECS Fargate for Tolgee hosting due to 24/7 uptime and persistent storage needs (avoids costly EFS/NAT Gateway).
- Tolgee admin password and SSH keys will be managed via a local, gitignored `terraform.tfvars` file for security.
- Terraform state for the `translation` environment will use the existing dev S3 bucket but a separate key path for isolation.
- No coins anywhere (not part of game mechanics, designer included speculatively) — REMOVED: focus on game, placeholder acceptable
- Keep text input on game page (required for multiplayer answer submission)
- No pause button top-right (simplify game header)
- CSS-first approach (mockup style achievable with CSS, avoid heavy images)
- Hybrid CSS approach: UnoCSS for utilities, SCSS for design tokens (01-01)
- UnoCSS theme extensions reference SCSS CSS variables (01-01)
- Module loading order: @unocss/nuxt after Pinia/i18n, before PWA (01-01)
- Spacing formula: Use precise fluid clamp() for smooth viewport scaling (01-02)
- Radius scale extended to 2xl (36px) for mockup alignment (01-02)
- Utility classes created for common mockup patterns (text effects, typography) (01-02)
- UnoCSS color shortcuts reference SCSS CSS variables (btn-green, border-gold, etc.) (01-03)
- Font family shortcuts added (display, sans) for utility class usage (01-03)
- Token test overlay pattern for visual verification of design system (01-03)
- Created `GameBackground` component for consistent app background (03-01)
- Created `GamePanel` component for styled content containers (03-02)
- CSS custom property for variant-specific values in active states (04-01)
- White text default for game buttons due to dark gradient backgrounds (04-01)
- No GPU acceleration hints for static text to avoid mobile memory issues (04-02)
- Dynamic tag prop pattern for semantic HTML flexibility (04-02)
- 3D text depth using 5-layer text-shadow with color-mix() (05-01)
- Inline SVG crowns for rank indicators to avoid external image dependencies (05-01)
- Dual scrollbar styling approach (webkit + Firefox) for broad compatibility (05-01)
- Two-part panel design using ::before/::after pseudo-elements (08-01)
- Text-stroke with paint-order for outlined text matching mockup (08-01)
- Component-based scoring page design replacing image-heavy layouts (09-01)
- Conditional score indicators: green for positive, red for negative, none for zero (09-01)
- Dark green text on light green background for accessibility in score indicators (09-01)
- Staggered v-motion animations with index-based delays (09-01)
- Wooden barrel track with brown gradient, green fill for slider progress (10-01)
- Orange/gold peg thumb matching game aesthetic for sliders (10-01)
- Emoji icons with muted variant at volume 0 for audio controls (10-01)
- Emoji flags for language indicators instead of PNG images (10-02)
- Staged selection pattern for language changes (apply on OK, not immediately) (10-02)
- Modal dismissal props default to true for backward compatibility (11-01)
- Danger variant uses same glossy-button mixin pattern as other variants (11-01)
- Use v-else for unlimited rank badges instead of v-else-if with index guard (11.1-02)
- SCORE_INCREMENT reduced from 10 to 1 for finer-grained scoring (11.1-01)
- Player range expanded to 2-10 with default 2, configurable via env vars (11.1-01)
- Player limits sourced from Nuxt runtimeConfig.public for env var overrides (11.1-01)
- data-testid naming convention: {page}-{element}-{type} for E2E test resilience (12-01)
- Dynamic data-testid via template literals for indexed elements (12-01)
- Reusable E2E test helper functions for multi-step game flows (12-01)
- Stateless composable extraction pattern: pass mutable state, composable returns pure functions (12-06)
- [Phase 19-01]: Use #imports instead of 'vue' for Vue reactivity in Nuxt auto-import context
- [Phase 19-01]: Settings store persist-only: removed manual loadSettings/saveSettings, persist middleware handles all
- [Phase 19-01]: subscribe+version pattern for Zustand-Vue reactivity bridge (ref counter + computed getState)
- [Phase 19-02]: Combined all Zustand hooks through useGameState composable for backward compatibility
- [Phase 19-02]: Plugins use settingsStore.getState() directly since they run outside Vue component scope
- [Phase 19-02]: Test pattern: gameStore.setState() for setup, gameStore.getState() for assertions (replaced Pinia patterns)
- [Phase 14-02]: Added .github/workflows/\* to secret scanner ignore paths to prevent false positives on GitHub Actions template refs
- [Phase 14-03]: Removed unused ViteBundleManifest import and no-op build:manifest hook from nuxt.config.ts to eliminate dead code and potential type conflict source
- [Phase 14-03]: Multiplayer round-skip bug confirmed fixed by quick task #007 (index-based currentPlayerIndex); no additional code changes needed
- [Phase 14-03]: Game store (406 lines, 5 composable delegates) assessed as well-structured; defer deep refactor to Phase 19 Zustand migration
- [Phase 14-01]: Merged duplicate language/credits/settings JSON sections keeping union of keys to prevent silent shadowing
- [Phase 19]: Use direct state mutation for gameStore test reset (setState breaks JS getter properties)
- [Phase 19]: Define inline typed window interfaces for page.evaluate() E2E callbacks (browser context isolation)
- [Phase 21]: Mock useAnalytics with behavioral replica to bypass import.meta.client compile-time constant
- [Phase 21]: Use typed mock factories with GameSession/Player/Category interfaces instead of any casts
- [Phase 21]: NativeScript components require native runtime — used node environment + pure TS logic tests instead of component mounting
- [Phase 21]: Expose useLogger on globalThis for integration tests instead of vi.mock since useWebSocket uses it as Nuxt auto-import (no explicit import)
- [Phase 21]: Extend vitest include to tests/integration/\*_/_.spec.ts in vitest.config.ts rather than a separate config file
- [Phase 21]: GameFlowState in gameStore.ts is already the single source of truth — no new type needed
- [Phase 22]: Use adapter validation boundary to emit only trusted categoryId+letter payloads from wheel wrapper.
- [Phase 22]: Round-start route keeps startConfiguredRound as sole orchestration API; wheel wrapper remains side-effect free.
- [Phase 22]: Phase verification captures command-level evidence in 22-E2E-VERIFICATION.md with explicit pass-rate reporting.
- [Phase 23]: Lighthouse baseline captured against production (riddlerush.de) for real-world accuracy; Task 1 pre-satisfied from research phase
- [Phase 23]: Plan 23-02 pre-satisfied: all asset path canonicalization, dead helper removal, and NuxtImg replacement were already in codebase
- [Phase 23]: Plan 23-03 pre-satisfied: asset cleanup, filename normalization, WebP pipeline, and lazy-loading policy were already in codebase
- [Phase 23]: All Plan 23-04 code changes pre-satisfied; verified and documented rather than re-implemented

### Pending Todos

_File moves and parallel plan: `.planning/todos/TODOS-PARALLEL-EXECUTION-PLAN.md`_

- Add feature flag (default **on**) to skip rounds and show only a single “award points” button—see `.planning/todos/pending/2026-04-18-add-feature-flag-to-skip-rounds-with-single-award-button.md`.
- Replace all texts with translation keys.
- Investigate multiplayer round flow skipping last player in round 1 (seen with 2-3 players).
- Review game store size (~352 lines) for further simplification and bug risk.
- Investigate and fix intermittent `nuxi typecheck` error related to `@vite-pwa/nuxt`.
- Add polished animations throughout the app (incremental PRs; see todo in `.planning/todos/pending/`).
- Research and select feature-flag provider strategy (todo in `pending/`).
- Burn down `code-review-2026-03-08.md` items in small commits.
- **Remaining:** audit `navigateTo` / full reload usage and simplify `game-flow.ts` workarounds now that results page has session loading + empty-state guard (todo `2026-04-11-review-code-optimize-weak-points-minimize-page-reloads-in-ga.md`).
- Audit Figma mockups against the app and close design gaps (see `.planning/todos/pending/2026-04-11-audit-figma-mockups-and-implement-design-gaps.md`).

### Completed Todos (2026-02-14)

- ~~Push pending commits to remote.~~ Done.
- ~~Switch CI/CD from CircleCI to Vercel.~~ Done — removed CircleCI, fixed SCSS import paths, verified Vercel build succeeds.
- ~~Add non-blocking GitHub Action for quality checks.~~ Done — replaced broken npm-based tests.yml with pnpm/turbo quality checks workflow.
- ~~Fix Docker image build for pnpm monorepo.~~ Done (quick-001) — fixed workspace file layering, corepack auto-version, output path, health check port. Pushed to GitHub.

### Blockers/Concerns

**General concerns:**

- Safari gradient rendering may differ from Chrome (verify early)
- Custom scrollbar styling may not work on all mobile browsers (graceful degradation)

### Quick Tasks Completed

| #   | Description                                         | Date       | Commit    | Directory                                                                                             |
| --- | --------------------------------------------------- | ---------- | --------- | ----------------------------------------------------------------------------------------------------- |
| 001 | Fix Docker image and push working version to GitHub | 2026-02-14 | 47e0140   | [001-fix-docker-image-and-push-working-versio](./quick/001-fix-docker-image-and-push-working-versio/) |
| 002 | Fix missing i18n keys and i18n lazy-load race       | 2026-02-19 | 402088fa1 | [002-fix-missing-i18n-keys-and-investigate-in](./quick/2-fix-missing-i18n-keys-and-investigate-in/)   |
| 003 | Host Tolgee on AWS EC2                              | 2026-02-19 | 9d80b2f   | [003-host-tolgee-on-aws-ec2](./quick/003-host-tolgee-on-aws-ec2/)                                     |
| 004 | Update all dependencies to latest versions          | 2026-02-20 | ca3745379 | [004-update-all-dependencies](./quick/004-update-all-dependencies-including-to-loc/)                  |
| 005 | Fix crypto.randomUUID TypeError on Safari           | 2026-03-04 | 82540829a | [005-fix-crypto-randomuuid-not-a-function-err](./quick/005-fix-crypto-randomuuid-not-a-function-err/) |
| 006 | Hide answer display when feature flag disabled      | 2026-03-04 | 7cc79e5a2 | [006-hide-answer-input-and-related-ui-when-fe](./quick/006-hide-answer-input-and-related-ui-when-fe/) |
| 007 | Fix page reload on game start causing wrong player  | 2026-03-08 | f205f0de3 | [7-fix-page-reload-on-game-start-causing-wr](./quick/7-fix-page-reload-on-game-start-causing-wr/)     |
| 008 | Fix i18n and score display bugs                     | 2026-03-08 | 87653cc8d | [8-fix-i18n-and-score-display-bugs](./quick/8-fix-i18n-and-score-display-bugs/)                       |

## Session Continuity

Last session: 2026-04-18T21:39:58.048Z
Stopped at: context exhaustion at 91% (2026-04-18)
Resume file: None

### Deployment: development

- **Version:** 1.1.0
- **Timestamp:** 20260305-013917
- **Branch:** development
- **Commit:** 58cc13669

### Deployment: development

- **Version:** 1.2.0
- **Timestamp:** 20260309-204433
- **Branch:** development
- **Commit:** d78a5cac9

### Deployment: development

- **Version:** 1.3.0
- **Timestamp:** 20260314-215422
- **Branch:** main
- **Commit:** 9942c7cb5

### Deployment: development

- **Version:** 1.4.3
- **Timestamp:** 20260409-235815
- **Branch:** release/v1.4.3
- **Commit:** 2cea4935f

### Deployment: development

- **Version:** 1.4.3
- **Timestamp:** 20260410-001240
- **Branch:** release/v1.4.3
- **Commit:** 97c5d80d7

### Deployment: development

- **Version:** 1.4.3
- **Timestamp:** 20260411-013743
- **Branch:** main
- **Commit:** bf3f2d051

### Deployment: development

- **Version:** 1.5.0
- **Timestamp:** 20260411-064416
- **Branch:** main
- **Commit:** 10867ce10

### Deployment: development

- **Version:** 1.5.0
- **Timestamp:** 20260412-011321
- **Branch:** develop
- **Commit:** 4e5006c48

### Deployment: production

- **Version:** 1.5.1
- **Timestamp:** 20260412-012209
- **Branch:** main
- **Commit:** ee84fbf3c

### Deployment: development

- **Version:** 1.5.7
- **Timestamp:** 20260417-213736
- **Branch:** development
- **Commit:** 7e09c7638

### Deployment: development

- **Version:** 1.5.7
- **Timestamp:** 20260417-214227
- **Branch:** development
- **Commit:** 7e09c7638

### Deployment: development

- **Version:** 1.5.7
- **Timestamp:** 20260417-214905
- **Branch:** development
- **Commit:** 7e09c7638

### Deployment: development

- **Version:** 1.5.7
- **Timestamp:** 20260417-215958
- **Branch:** development
- **Commit:** 5001720f4

### Deployment: development

- **Version:** 1.5.7
- **Timestamp:** 20260417-234729
- **Branch:** development
- **Commit:** 99c97ff76

### Deployment: development

- **Version:** 1.5.7
- **Timestamp:** 20260418-173824
- **Branch:** development
- **Commit:** 99c97ff76

### Deployment: development

- **Version:** 1.5.7
- **Timestamp:** 20260418-174621
- **Branch:** development
- **Commit:** 99c97ff76

### Deployment: development

- **Version:** 1.5.8
- **Timestamp:** 20260418-232959
- **Branch:** development
- **Commit:** e94bacf0d
