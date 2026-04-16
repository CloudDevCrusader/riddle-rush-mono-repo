---
scope: full-project
reviewers: [claude]
attempted: [gemini, codex, coderabbit, opencode]
failed:
  gemini: 'sandbox/MCP errors — CLI v0.37.1 stuck on API calls'
  codex: '401 Unauthorized — configured with Anthropic API key instead of OpenAI'
  coderabbit: 'diff-only review mode — no pending git changes to review'
  opencode: 'TUI-only app — no non-interactive CLI mode available'
reviewed_at: '2026-04-15T11:30:00.000Z'
project_version: 1.5.1
phases_reviewed: 23 (complete project)
---

# Cross-AI Project Review — Riddle Rush v1.5.1

## Reviewer Status

| CLI                       | Status      | Notes                                                          |
| ------------------------- | ----------- | -------------------------------------------------------------- |
| Claude (separate session) | **SUCCESS** | 183-line structured review with grades                         |
| Gemini                    | FAILED      | Sandbox image missing, MCP errors, stuck on API calls          |
| Codex                     | FAILED      | 401 Unauthorized — wrong API key (Anthropic key, needs OpenAI) |
| CodeRabbit                | FAILED      | Diff-only mode — no pending changes to review                  |
| OpenCode                  | FAILED      | TUI app only — no non-interactive `run` subcommand             |

> **Note:** Only 1 of 5 CLIs succeeded. To improve future reviews:
>
> - Fix Codex: set `OPENAI_API_KEY` (not `ANTHROPIC_API_KEY`)
> - Fix Gemini: update to latest version (`brew upgrade gemini-cli`) or check Docker daemon
> - CodeRabbit: only useful for PR/diff reviews, not project-wide assessments
> - OpenCode: no CLI mode available for non-interactive prompts

---

## Claude Review (Separate Session)

### 1. Overall Assessment

Riddle Rush is a **mature, well-architected PWA** that has successfully navigated 23 phases of visual redesign and optimization. The monorepo structure is exemplary — clean package boundaries, proper tooling (Turborepo, Syncpack, Husky), and a comprehensive SCSS design token system aligned with Figma. The core game logic is sound with proper separation between Pinia stores, composables, and IndexedDB persistence. However, the project carries **moderate technical debt** from its ambitious roadmap: CI quality gates are permissive (E2E tests and security scans don't block deployment), CSP headers are too relaxed, coverage enforcement is disabled, and several pages have grown oversized. The Pinia→Zustand→Pinia migration cycle was cleanly reverted with no residual code leaking into production. At v1.5.1 deployed to production, the project is **stable and functional but would benefit from hardening its quality gates and security posture** before the next major version.

### 2. Architecture Review

**Monorepo Structure — Grade: A**

| Aspect             | Assessment                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- |
| Package boundaries | Clean. `@riddle-rush/types`, `shared`, `config` have focused exports, no circular deps  |
| Turborepo          | Well-configured (123 lines). Smart caching, proper `dependsOn` chains, env var tracking |
| Syncpack           | Strict version consistency enforced. 40+ CVE patches in pnpmOverrides                   |
| pnpm workspace     | Clean 3-directory layout (apps/packages/tools)                                          |

**Design System — Grade: A-**

The 1,081-line SCSS design system is the project's strongest architectural asset. The `mockup-clamp()` fluid scaling function ensures pixel-fidelity across 360px–1080px viewports. 25 design colors, 7 spacing tiers, 7 font sizes, 6 transition timings, and 9 animation keyframes are all tokenized. Figma sync pipeline generates CSS custom properties that cascade correctly.

One concern: UnoCSS and SCSS coexist as a "hybrid" CSS strategy. Documented and intentional, but increases learning curve.

**State Management — Grade: B+**

Pinia used correctly with well-defined pattern: stores hold state + getters + actions, while 32 composables handle domain logic. The `gameStore.ts` (612 lines) acts as a **Facade** dispatching to focused composables like `usePlayerManager`, `useScoringEngine`, and `usePersistence`.

Key finding: 3 fire-and-forget IndexedDB saves (`void this.saveSessionToDB()`) — intentional UX optimizations, acceptable but should be documented inline.

**Component Architecture — Grade: B+**

26 components with consistent `Game[Component]` naming. Average size 276 lines. Two outlier pages (`players.vue`, `round-start.vue` at ~15K lines each) warrant decomposition.

### 3. Strengths

- **Token-based design system** with fluid responsive scaling (`mockup-clamp`), Figma sync pipeline, and comprehensive SCSS effects (glossy, embossed, 3D text, shadows)
- **Clean Zustand migration revert** — zero residual Zustand code in active codebase
- **Well-factored composables** — 32 composables averaging 130 lines each with clear single responsibilities
- **Robust IndexedDB persistence** — singleton instance caching, Zod schema validation on load, graceful error handling
- **Strong local quality gates** — pre-commit (lint-staged + secret scanning + TypeScript), commit-msg (Conventional Commits), pre-push (typecheck + unit tests + syncpack)
- **Comprehensive test suite** — 41 unit test files (90.31% line coverage, 93.25% function coverage), 16 E2E test files with `data-testid` selectors
- **PWA done right** — cache versioning, CacheFirst for fonts/images, NetworkFirst for start URL, auto-update with skipWaiting
- **CI parallelization** — 6 parallel E2E shards, multi-environment builds, Turbo cache integration
- **Monorepo discipline** — Syncpack prevents version skew, Changesets for versioning, clean package exports
- **Zod runtime validation** for IndexedDB data (catches schema drift between versions)

### 4. Concerns

#### HIGH Severity

- **CSP allows `unsafe-inline` + `unsafe-eval`** — effectively disables XSS protection. Permits any HTTPS script source with no domain whitelist.
- **E2E tests don't block deployment** (`continue-on-error: true`) — failing E2E suite won't prevent broken code reaching production.
- **Coverage enforcement disabled** (`enabled: false`, Codecov `fail_ci_if_error=false`) — 90% coverage could silently regress.
- **Security scan continues on error** — CodeQL failures don't block the pipeline.

#### MEDIUM Severity

- **Oversized pages** — `players.vue` and `round-start.vue` at ~15K lines each need decomposition.
- **gameStore branch coverage only 59.88%** — central game logic store has lowest branch coverage.
- **innerHTML usage for JSON-LD** and **gtagId interpolation in inline script** — minor XSS vectors if runtime config is compromised.
- **IndexedDB stores unencrypted data** including player answers, scores, and error logs — accessible to any XSS attack.
- **Only 1 integration test** for IndexedDB despite it being the persistence backbone.
- **Multiplayer statistics not tracked** — `useStatistics` skips multiplayer games entirely.
- **`FortuneAlphabetWheel.vue` at 664 lines** — complex with tightly coupled logic.

#### LOW Severity

- **lodash-es (118KB)** could be replaced by es-toolkit (~60% smaller).
- **Dual image optimizer plugins** installed — redundant.
- **No font preload hints** despite using @fontsource-variable packages.
- **Capacitor keystore env vars** not validated before build.
- **E2E only runs `@smoke` tests in CI** — full game workflow tests don't run in pipeline.

### 5. Technical Debt

**Must Address Before Next Major Version:**

1. **Fix CSP headers** — remove `unsafe-inline`/`unsafe-eval`, implement nonce-based CSP
2. **Re-enable coverage enforcement** — set 80% thresholds, make Codecov blocking
3. **Make E2E + security scans blocking** — remove `continue-on-error: true`
4. **Decompose oversized pages** — break `players.vue` and `round-start.vue` into sub-components

**Should Address:**

5. Increase gameStore branch coverage from 59.88% to ≥80%
6. Add integration tests for IndexedDB persistence flows
7. Replace lodash-es with es-toolkit or native alternatives
8. Remove dual image optimizer — keep only one
9. Clean up .backup files from Zustand migration

**Nice To Have:**

10. Add font preload hints for Baloo 2 and Nunito Variable
11. Implement error sampling for CloudWatch
12. Document fire-and-forget saves with inline comments

### 6. Suggestions (Prioritized)

1. **[P0 — Security]** Implement nonce-based CSP. Generate nonce per request, use for all inline scripts. Remove `unsafe-inline`/`unsafe-eval`.
2. **[P0 — Quality Gates]** Make CI enforcement strict — remove `continue-on-error: true` from E2E and CodeQL jobs.
3. **[P1 — Testing]** Re-enable vitest coverage with thresholds (lines: 80, branches: 75, functions: 85).
4. **[P1 — Architecture]** Split `players.vue` and `round-start.vue` into focused components.
5. **[P2 — State]** Consider splitting `gameStore.ts` into domain stores at 612 lines.
6. **[P2 — Bundle]** Replace lodash-es with es-toolkit. Run bundle analysis on CI.
7. **[P2 — Testing]** Run full E2E suite on `main` merges, keep `@smoke` for PRs.
8. **[P3 — Mobile]** Add keystore environment validation in Capacitor build scripts.
9. **[P3 — DX]** Remove `.backup` files from the Zustand revert.

### 7. Risk Assessment

**Overall Project Risk: MEDIUM (trending toward LOW)**

| Risk Dimension     | Level       | Justification                                                          |
| ------------------ | ----------- | ---------------------------------------------------------------------- |
| Stability          | LOW         | v1.5.1 in production, functional, no major runtime issues              |
| Security           | MEDIUM-HIGH | CSP effectively disabled; IndexedDB unencrypted; inline script vectors |
| Quality Regression | MEDIUM      | Coverage disabled; E2E non-blocking; gameStore undertested             |
| Architecture       | LOW         | Clean monorepo, proper package boundaries, well-factored composables   |
| Technical Debt     | MEDIUM      | Oversized pages, dual plugins, backup files, lodash weight             |
| Migration Risk     | LOW         | Zustand revert was clean, no residual artifacts                        |
| Deployment         | LOW         | CI/CD mature with parallelization, Turbo caching, multi-env            |
| Mobile             | LOW-MEDIUM  | Capacitor sound but keystore validation missing                        |

### Key Insights

1. **The design system is the project's greatest asset.** The `mockup-clamp()` fluid scaling, 25-color token palette, and Figma sync pipeline represent genuinely strong CSS architecture.

2. **The gap between local and CI quality gates is the biggest risk.** Locally, Husky hooks enforce everything. In CI, E2E tests, security scans, and coverage all use `continue-on-error: true`.

3. **The Zustand migration cycle was the right kind of mistake.** Trying it, discovering it didn't fit Nuxt, and reverting cleanly shows good engineering judgment.

---

## Consensus Summary

With only 1 successful reviewer, a full consensus summary is not applicable. The Claude review provides comprehensive coverage across architecture, security, testing, performance, and risk.

### Top Priority Actions

1. **Harden CSP** — `unsafe-inline`/`unsafe-eval` must go before any new features
2. **Make CI gates blocking** — E2E and security scans should fail the pipeline
3. **Re-enable coverage** — prevent silent regression of 90% line coverage
4. **Decompose oversized pages** — `players.vue` and `round-start.vue` need splitting

### CLI Fixes for Future Reviews

| CLI        | Fix                                                                 |
| ---------- | ------------------------------------------------------------------- |
| Gemini     | `brew upgrade gemini-cli` or check Docker daemon for sandbox images |
| Codex      | Set `OPENAI_API_KEY` env var (currently has Anthropic key)          |
| CodeRabbit | N/A — only useful for diff/PR reviews                               |
| OpenCode   | N/A — no non-interactive CLI mode available                         |
