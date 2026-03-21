---
gsd_state_version: 1.0
milestone: v1.0.3
milestone_name: milestone
status: executing
stopped_at: Completed 14-01-PLAN.md
last_updated: '2026-03-21T22:22:10.931Z'
last_activity: 2026-03-21
progress:
  total_phases: 20
  completed_phases: 16
  total_plans: 53
  completed_plans: 47
  percent: 88
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Every screen in the app must visually match its corresponding mockup at 1080×1920 base resolution while scaling responsively to all screen sizes.
**Current focus:** Post-release feature enhancements.

## Current Position

Phase: 19 of 19 (Move from Pinia to Zustand)
Plan: 3 of 3 — Next
Status: In progress
Last activity: 2026-03-21
Next Plan: 19-02 — Consumer import swap (big-bang cutover)

Progress: [████████░░] 88% (44/50 total plans complete)

## Performance Metrics

**Velocity:**

- Total plans completed: 41
- Average duration: 3.4 min
- Total execution time: ~2h 11min

**By Phase:**

| Phase                      | Plans | Total | Avg/Plan |
| -------------------------- | ----- | ----- | -------- |
| 01-design-tokens           | 3/3   | 20min | 7min     |
| 02-design-utilities        | 2/2   | 5min  | 2.5min   |
| 03-core-layout-components  | 2/2   | 10min | 5min     |
| 04-interactive-components  | 2/2   | 5min  | 2.5min   |
| 05-structural-components   | 3/3   | 20min | 7min     |
| 06-splash-navigation       | 2/2   | 6min  | 3min     |
| 07-player-setup            | 2/2   | 6min  | 3min     |
| 08-core-gameplay           | 2/2   | 5min  | 2.5min   |
| 09-game-results            | 2/2   | 7min  | 3.5min   |
| 10-settings-pages          | 2/2   | 7min  | 3.5min   |
| 11-modal-dialogs           | 3/3   | 9min  | 3min     |
| 11.1-scoring-player-config | 2/2   | 14min | 7min     |
| 12-app-optimization        | 10/10 | 44min | 4.4min   |
| 13-post-round-flow         | 1/1   | 4min  | 4min     |

**Recent Trend:**

- Last 5 plans: 4min, 4min, 4min, 3min, 4min
- Trend: Consistent ~3-8 min per plan

_Updated after each plan completion_
| Phase 19 P01 | 9min | 2 tasks | 15 files |
| Phase 14-02 P02 | 3min | 2 tasks | 3 files |
| Phase 14-03 P03 | 4min | 2 tasks | 1 files |
| Phase 14-01 P01 | 5min | 2 tasks | 8 files |

## Accumulated Context

### Roadmap Evolution

- Phase 18 added: enable fortune-wheel as default review/refactor if implementation works and looks good
- Phase 19 added: Move from Pinia to Zustand

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **[New]** Repo cleanup commands for stale/orphaned files must use guarded `git rm --cached`/`git mv` checks so previously-untracked targets do not fail execution (17-01).
- **[New]** `.gitignore` AI config section now explicitly preserves `.agent/` and `.agents/` with negated rules while ignoring non-essential AI tool directories (17-01).
- **[New]** Fortune wheel local fallback default is now enabled (`settings.fortuneWheelEnabled = true`) when no GitLab client is configured (18-01).
- **[New]** Feature-flag precedence remains GitLab-first, with explicit fortune-wheel fallback default (`isEnabled('fortune-wheel', true)`) to document intended behavior (18-01).
- **[New]** Round-start contract finalized: fortune wheel is the default user path; immediate random start is fallback-only when the wheel flag resolves disabled (GitLab authoritative when configured, local settings fallback otherwise) (18-02).
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
- [Phase 19]: Use #imports instead of 'vue' for Vue reactivity in Nuxt auto-import context
- [Phase 19]: Settings store persist-only: removed manual loadSettings/saveSettings, persist middleware handles all
- [Phase 19]: subscribe+version pattern for Zustand-Vue reactivity bridge (ref counter + computed getState)
- [Phase 14-02]: Added .github/workflows/\* to secret scanner ignore paths to prevent false positives on GitHub Actions template refs
- [Phase 14-03]: Removed unused ViteBundleManifest import and no-op build:manifest hook from nuxt.config.ts to eliminate dead code and potential type conflict source
- [Phase 14-03]: Multiplayer round-skip bug confirmed fixed by quick task #007 (index-based currentPlayerIndex); no additional code changes needed
- [Phase 14-03]: Game store (406 lines, 5 composable delegates) assessed as well-structured; defer deep refactor to Phase 19 Zustand migration
- [Phase 14-01]: Merged duplicate language/credits/settings JSON sections keeping union of keys to prevent silent shadowing

### Pending Todos

- Replace all texts with translation keys.
- Investigate multiplayer round flow skipping last player in round 1 (seen with 2-3 players).
- Review game store size (~352 lines) for further simplification and bug risk.
- **[New]** Investigate and fix intermittent `nuxi typecheck` error related to `@vite-pwa/nuxt`.
- **[New]** Test and fix full game workflow with multi-round scoring (modal 3 options, predicted rank, answer input feature flag).
- **[New]** Refactor game mode to single source of truth with documented state flow chart.

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

Last session: 2026-03-21T22:22:10.929Z
Stopped at: Completed 14-01-PLAN.md
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
