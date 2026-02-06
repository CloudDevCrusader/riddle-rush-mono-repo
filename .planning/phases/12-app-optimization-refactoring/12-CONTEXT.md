# Phase 12: App Optimization & Refactoring - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Prepare Riddle Rush for production v1.0.3 release. This phase covers six areas: (1) testing composables with real logic, (2) fixing/expanding E2E tests for the new UI, (3) systematic visual audit against mockups with gap fixes, (4) full Terraform module extraction and optimization, (5) game app refactoring (bug fixes + code quality + UX polish), (6) deployment automation, versioning, and monitoring. Work should be split into parallel-capable specialist agents where possible.

Reference documents: `TASKS_V1.0.3.md` and `DEPLOYMENT-PLAN-v1.0.3.md` provide detailed task breakdowns.

</domain>

<decisions>
## Implementation Decisions

### Testing scope

- **Test what matters** — only composables with real logic (game session, audio/sound, IndexedDB, answer checking). Skip thin wrappers like useI18n, useRouter that just delegate to framework
- Integration tests for WebSocket and IndexedDB flows are worth it since they're core to the game
- No specific coverage target — focus on testing meaningful behavior, not chasing numbers

### E2E tests

- **Fix existing E2E tests first** — update selectors and assertions to work with new game design components (GameButton, GameModal, GamePanel, etc.) from phases 1-11
- **Then expand** — add coverage for modal dialogs, settings sliders, language switching, and offline flows
- Use `data-testid` attributes for language-agnostic testing

### Visual audit

- **Systematic audit** — run the app, screenshot every page at mobile resolution, compare side-by-side with mockups
- Log all gaps/mismatches as concrete fix tasks
- Pages to audit: splash, main menu, players, round-start, game, results/scoring, leaderboard, settings, language, quit modal, pause modal
- Mockup files in project: `alphabet.png`, `start.png`, `players.png`, `scoring.png`, `leaderboard.png`, `settings.png`, `language-selector.png`, `Splash screen.png`, `QUIT GAME.png`, `menu.png`

### Performance optimization

- Optimize **both initial load time and runtime smoothness** equally
- Initial load: bundle size analysis, code splitting, lazy loading opportunities
- Runtime: animation performance, transition smoothness, no jank during gameplay
- Target: Lighthouse >90 on all categories

### Terraform refactoring

- **Full module extraction** as described in TASKS_V1.0.3.md:
  - Extract CloudFront cache policies to reusable module
  - Create common variables module with validation
  - Add S3 lifecycle rules for cost optimization
  - Organize and document outputs
- User has **AWS access locally** — include live `terraform plan` validation steps
- Goal: `terraform plan` shows no changes after refactor (pure code improvement)

### Game app refactoring

- **Comprehensive cleanup**: bug fixes + code quality + visual/UX polish
- Fix known multiplayer bug: round flow skipping last player with 2-3 players
- Simplify game store (~550 lines) — break into smaller, focused stores or composables
- Clean up dead code, improve error handling
- Polish loading states, transitions, responsiveness
- Replace all hardcoded texts with translation keys (pending todo from STATE.md)

### Deployment & release

- **Claude's discretion** on deployment UX — design the most practical flow (likely a script with dry-run + confirm)
- Use **changesets workflow** for versioning: `pnpm changeset` → `pnpm changeset:version` → commit → tag
- Create GitHub release with proper release notes
- Version bump to 1.0.3

### Monitoring

- **CloudWatch basics** — error rate alarm (4xx/5xx) and latency alarm
- **Dashboard only** — no email/SNS notifications. Just a CloudWatch dashboard to check manually
- Appropriate for a static PWA: lightweight, low cost, catches deployment issues

### Execution strategy

- **Parallel specialist agents** — split work into independent streams that can run simultaneously:
  - Testing agent (unit tests + E2E)
  - Terraform agent (module extraction + validation)
  - Visual audit agent (screenshot + compare + log gaps)
  - Game refactor agent (store simplification + bug fixes + UX polish)
  - Deployment agent (script creation + versioning + release)
- Sequential dependencies: visual audit findings feed into game refactor; testing runs after refactoring; deployment runs last

</decisions>

<specifics>
## Specific Ideas

- "Try to play" — actually run the game and experience the flow, don't just read code
- "Compare it to the mockups" — side-by-side visual comparison, not just checking CSS properties
- "Create agents that are specialists" — user wants parallel execution with focused subagents
- "Rework the prod deployment so I can easily do that" — deployment must be a simple, repeatable process the user runs themselves
- Existing deployment scripts: `scripts/aws-deploy.sh`, `pnpm run deploy:prod`, `pnpm run deploy:dev`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 12-app-optimization-refactoring_
_Context gathered: 2026-02-06_
