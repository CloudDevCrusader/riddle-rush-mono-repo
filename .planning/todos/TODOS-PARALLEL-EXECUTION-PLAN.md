# Pending todos — parallel execution plan

**Created:** 2026-04-11  
**Goal:** Close or downgrade backlog items with clear waves; run independent tracks in parallel.

## Wave A — Parallel (code + tests, no doc-only)

| Track | Todo file | Owner | Deliverable |
| ----- | --------- | ----- | ----------- |
| **A1** | `2026-04-10-fix-language-spec-e2e-failures.md` | tests + `language.vue` / menu | `language.spec.ts` green; testids match DOM |
| **A2** | `2026-04-10-fix-scoring-flow-spec-e2e-failures.md` | tests + results | `scoring-flow.spec.ts` green; locators match post-round UI |
| **A3** | `2026-04-10-fix-mobile-website-not-full-page.md` | `app.vue`, `layouts/default.vue`, viewport | Full viewport height (`100dvh` / safe-area); no gray band |
| **A4** | `2026-04-11-review-code-optimize-weak-points-*.md` + `#6,#7` from code-review | `results/[[gameId]].vue`, `game-flow.ts`, `round-start.vue`, `app.vue` | `v-if`/loading guard for async session; remove ghost session fallback; listener cleanup |

**Parallelism:** A1/A2/A3 touch different files — safe. A4 touches results + round-start + app — coordinate after A2 if same PR.

## Wave B — Verification (mostly read/config; can parallel with A after code lands)

| Track | Todo file | Deliverable |
| ----- | --------- | ----------- |
| **B1** | `2026-04-10-verify-category-selection-in-fortune-wheel-flip-through-anim.md` | Manual or E2E note in todo; fix `FlipThroughAnimation.vue` if selection wrong |
| **B2** | `2026-04-10-verify-android-build-is-universal.md` | Document min/target SDK + ABI in todo; adjust `capacitor`/`build.gradle` if filters break universality |

## Wave C — Product / architecture (not “one PR”; split or promote to roadmap phase)

| Todo | Approach |
| ---- | -------- |
| `2026-03-02-test-and-fix-full-game-workflow-with-multi-round-scoring.md` | Confirm modal3 buttons + predicted rank + flag in app; add/adjust E2E; then move todo to **done** |
| `2026-03-02-refactor-game-mode-to-single-source-of-truth-*.md` | **Milestone:** Mermaid `docs/` or `.planning/` state-flow + incremental store consolidation; do not block Wave A |
| `2026-03-02-research-and-select-feature-flag-solution.md` | **Decision doc** (1–2 pages): stay on Unleash vs Flipt/PostHog; no code unless decision says switch |
| `2026-04-11-add-polished-animations-throughout-the-app.md` | **Incremental:** `prefers-reduced-motion`, page transition + 1–2 high-traffic screens per PR |
| `code-review-2026-03-08.md` | Burn down by priority in small commits (logger, dead imports, i18n titles, etc.) |

## Completion rule

When a todo is satisfied: move its file from `pending/` to `done/` and trim the duplicate bullet from `.planning/STATE.md` **Pending Todos** if present.

## Current run (this session)

1. Execute Wave A tracks in parallel (agents or local branches merged carefully).  
2. Run `pnpm run workspace:check` and targeted `playwright test` for changed specs.  
3. Wave B verification next; Wave C items become follow-up milestones unless trivial.

---

## Parallel subagent results (2026-04-11)

### Category / “flip-through” (FortuneAlphabetWheel)

- **Component:** Carousel during spin is **cosmetic**; **final category** is chosen with `Math.random` over category list at spin start; **letter** from wheel segment + `validateSelection`.
- **Risk:** UX mismatch — strip animation is not bound to the actual category; document for players if confused.
- **Tests:** E2E should assert post-spin `fortune-wheel-selected-*` matches game session after navigation; flag-off path uses `startFallbackRound` (random category + letter).

### Android universality

- **SDK:** min24, compile/target 36 (`variables.gradle`).
- **Default Capacitor flavor `play`:** **ARM-only** (`armeabi-v7a`, `arm64-v8a`) — fine for Play; **x86 emulators** need **`universal`** flavor build.
- **Output:** AAB release via `android.buildOptions.releaseType` — Play serves per-device APKs from bundle.

### E2E dev host note

- If Playwright webServer hits **`EMFILE: too many open files`**, raise limit (e.g. `ulimit -n 10240`) before `pnpm exec playwright test`.
