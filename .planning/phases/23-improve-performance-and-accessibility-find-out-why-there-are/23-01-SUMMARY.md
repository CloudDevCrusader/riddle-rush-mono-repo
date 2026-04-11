---
phase: 23-improve-performance-and-accessibility-find-out-why-there-are
plan: 01
subsystem: infra
tags: [lighthouse, unlighthouse, performance, accessibility, core-web-vitals, baseline]

requires:
  - phase: none
    provides: standalone — first plan in phase

provides:
  - Lighthouse CLI tooling wired via pnpm scripts and Turborepo task
  - Pre-change performance baseline with per-route Core Web Vitals scores
  - Quantifiable gap analysis (Performance −9, Accessibility −14 from targets)

affects:
  - 23-02 (image path fixes — LCP improvement expected)
  - 23-03 (accessibility improvements — a11y score improvement expected)
  - 23-04 (performance optimization — perf score improvement expected)

tech-stack:
  added: [unlighthouse@0.17.7]
  patterns: [lighthouse-baseline-before-optimization, turborepo-uncached-audit-task]

key-files:
  created:
    - .planning/phases/23-improve-performance-and-accessibility-find-out-why-there-are/23-PERF-BASELINE.md
  modified:
    - apps/game/package.json (pre-existing — tooling already wired)
    - turbo.json (pre-existing — task already registered)

key-decisions:
  - 'Task 1 tooling was already wired during research/planning — no code changes needed'
  - 'Baseline captured against production (riddlerush.de) rather than local preview for real-world accuracy'
  - 'Per-route breakdown included with Core Web Vitals (LCP, FCP, CLS, TBT) for granular optimization targeting'

patterns-established:
  - 'Lighthouse baseline pattern: capture before optimization, compare after with same tool and target'
  - 'Production-targeted audit: scan live site for real-world metrics, not local dev server'

requirements-completed: [PERF-01]

duration: 15min
completed: 2026-04-11
---

# Phase 23 Plan 01: Lighthouse Tooling & Baseline Summary

**Unlighthouse CLI wired with Turborepo task and production baseline captured: Performance 81, Accessibility 76, Best Practices 100, SEO 99 across 10 routes**

## Performance

- **Duration:** 15 min (across two execution sessions)
- **Started:** 2026-04-11T04:19:21Z
- **Completed:** 2026-04-11T04:25:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Verified Lighthouse tooling (unlighthouse) already installed and wired in package.json scripts and turbo.json
- Captured comprehensive production baseline: 10 routes audited against `https://riddlerush.de`
- Identified LCP (avg 4.8 s) as the dominant performance bottleneck across all routes
- Documented per-route breakdown with all four Lighthouse categories and Core Web Vitals
- Identified worst-performing routes: `/splash` (56 a11y, 76 perf), `/credits` (73 perf, 6.3s LCP)

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Unlighthouse command and Turborepo task (D-08)** — Pre-satisfied, no commit needed. All three acceptance criteria already met:
   - `unlighthouse@^0.17.7` in devDependencies
   - `lighthouse` and `lighthouse:ci` scripts in apps/game/package.json
   - `lighthouse` task in turbo.json with `dependsOn: ["build"]` and `cache: false`
2. **Task 2: Capture and store pre-change Lighthouse baseline (D-10)** — `640ae7016` (docs)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified

- `.planning/phases/23-improve-performance-and-accessibility-find-out-why-there-are/23-PERF-BASELINE.md` — Comprehensive baseline with summary scores, per-route breakdown, Core Web Vitals, and key observations

## Decisions Made

- **Task 1 pre-satisfied:** Unlighthouse tooling was wired during the research/planning phase. All three acceptance criteria (devDependency, scripts, turbo task) were already present. No code changes required.
- **Production target over local preview:** Baseline captured against live `https://riddlerush.de` for real-world accuracy (network latency, CDN effects, actual asset loading). This gives a more meaningful optimization baseline than local preview.
- **Per-route granularity:** Included individual route scores and Core Web Vitals beyond the minimum requirement of category averages, enabling targeted optimization in subsequent plans.

## Deviations from Plan

None — plan executed exactly as written. Task 1 was already satisfied (tooling pre-wired), which is an expected outcome since research phases often install tooling needed for measurement.

## Issues Encountered

- **ci-result.json structure:** Initial JSON parsing used wrong key path (`report.categories` instead of `categories`). Corrected by inspecting actual JSON structure — scores are at `route.categories.{name}.score`.
- **Stale baseline file:** A prior planning step had created `23-PERF-BASELINE.md` with different scores (P=0.93, A=0.64). Updated with accurate production scan data.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Baseline established — Plans 23-02 through 23-04 can measure improvement against these numbers
- Key optimization targets identified:
  - **LCP reduction** (4.8 s → target ≤ 2.5 s): likely image optimization + lazy loading
  - **Accessibility** (76 → target 90+): focus on `/splash` (56), `/round-start` (67), `/leaderboard` (69), `/players` (69)
  - Best Practices (100) and SEO (99) need no work

## Self-Check: PASSED

- ✅ `23-PERF-BASELINE.md` exists
- ✅ `23-01-SUMMARY.md` exists
- ✅ Commit `640ae7016` found in git log

---

_Phase: 23-improve-performance-and-accessibility-find-out-why-there-are_
_Completed: 2026-04-11_
