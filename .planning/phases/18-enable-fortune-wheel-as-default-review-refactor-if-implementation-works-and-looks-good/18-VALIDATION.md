---
phase: 18
slug: fortune-wheel-warnings-e2e-refactor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| **Framework**          | Vitest + Playwright                                              |
| **Config file**        | `apps/game/vitest.config.ts`, `apps/game/playwright.config.ts`   |
| **Quick run command**  | `pnpm run workspace:check`                                       |
| **Full suite command** | `pnpm run workspace:check && pnpm run test && pnpm run test:e2e` |
| **Estimated runtime**  | ~60 seconds (workspace:check + unit), ~180 seconds (+ E2E)       |

---

## Sampling Rate

- **After every task commit:** Run `pnpm run workspace:check`
- **After every plan wave:** Run `pnpm run workspace:check && pnpm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Behavior                        | Test Type   | Automated Command                                             | Status             |
| ------------------------------- | ----------- | ------------------------------------------------------------- | ------------------ |
| Zero duplicated import warnings | build check | `pnpm run typecheck 2>&1 \| grep -c "duplicated"` should be 0 | ⬜ pending         |
| Fortune wheel is default        | E2E         | `round-start.spec.ts` already validates                       | ✅ green           |
| All unit tests pass             | unit        | `pnpm run test`                                               | ✅ green (734/734) |
| E2E suite passes reliably       | E2E         | `pnpm run test:e2e`                                           | ⬜ pending         |
| `workspace:check` clean         | integration | `pnpm run workspace:check`                                    | ⬜ pending         |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `tests/e2e/helpers/game-flow.ts` — consolidated game flow helpers (does not exist yet)
- Existing infrastructure covers all other phase requirements.

---

## Manual-Only Verifications

| Behavior                     | Why Manual           | Test Instructions                                                            |
| ---------------------------- | -------------------- | ---------------------------------------------------------------------------- |
| Fortune wheel visual quality | Visual UX assessment | Load round-start page, verify wheel animation is smooth and visually correct |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
