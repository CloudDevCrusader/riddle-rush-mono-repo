# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Every screen in the app must visually match its corresponding mockup at 1080×1920 base resolution while scaling responsively to all screen sizes.
**Current focus:** Infrastructure and tooling enhancements.

## Current Position

Phase: 12 of 12 (App Optimization & Refactoring)
Plan: 10 of 10 — Complete
Status: MILESTONE COMPLETE - Executing ad-hoc tasks.
Last activity: 2026-02-19 - Completed quick task 003: Host Tolgee on AWS EC2

Progress: [█████████████████████████████████] 100% (38/38 total plans complete)

## Performance Metrics

**Velocity:**

- Total plans completed: 38
- Average duration: 3.3 min
- Total execution time: ~1.9 hours

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

**Recent Trend:**

- Last 5 plans: 6min, 4min, 4min, 4min, 3min
- Trend: Consistent ~3-8 min per plan

_Updated after each plan completion_

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **[New]** EC2 is more cost-effective than ECS Fargate for Tolgee hosting due to 24/7 uptime and persistent storage needs (avoids costly EFS/NAT Gateway).
- **[New]** Tolgee admin password and SSH keys will be managed via a local, gitignored `terraform.tfvars` file for security.
- **[New]** Terraform state for the `translation` environment will use the existing dev S3 bucket but a separate key path for isolation.
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

### Pending Todos

- Replace all texts with translation keys.
- Investigate multiplayer round flow skipping last player in round 1 (seen with 2-3 players).
- Review game store size (~352 lines) for further simplification and bug risk.
- **[New]** Investigate and fix intermittent `nuxi typecheck` error related to `@vite-pwa/nuxt`.

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

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed Quick Task 3 (Host Tolgee on AWS EC2)
Resume file: None

### Phase 12 Plans Status

- **12-01**: Complete - E2E test resilience with data-testid selectors
- **12-02**: Complete - Composable unit tests
- **12-03**: Complete - Terraform project structure
- **12-04**: Complete - Terraform modules (S3, CloudFront, DynamoDB)
- **12-05**: Complete - Terraform modules (Lambda, API Gateway, WebSocket, CloudWatch)
- **12-06**: Complete - Extract useCategoryManager and useSessionManager from game store
- **12-07**: Complete - Extract usePlayerManager and useScoringEngine from game store
- **12-08**: Complete - Extract usePersistence and useGameLifecycle from game store
- **12-09**: (skipped or combined)
- **12-10**: Complete - Deployment script enhancements (logging, backup, verify, rollback, post-deploy)

**Phase 12 (App Optimization & Refactoring): COMPLETE** (10/10 plans complete)
