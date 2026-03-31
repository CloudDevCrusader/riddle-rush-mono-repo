---
phase: 14
slug: maintenance-quality-of-life
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-21
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                            |
| ---------------------- | ------------------------------------------------ |
| **Framework**          | Vitest (unit) + Playwright (E2E)                 |
| **Config file**        | `apps/game/vitest.config.ts`                     |
| **Quick run command**  | `pnpm run test:unit`                             |
| **Full suite command** | `pnpm run workspace:check && pnpm run test:unit` |
| **Estimated runtime**  | ~30 seconds (unit), ~120 seconds (E2E)           |

---

## Sampling Rate

- **After every task commit:** Run `pnpm run workspace:check`
- **After every plan wave:** Run `pnpm run test:unit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                      | File Exists | Status     |
| -------- | ---- | ---- | ----------- | --------- | -------------------------------------- | ----------- | ---------- |
| 14-01-01 | 01   | 1    | i18n        | lint      | `pnpm run typecheck`                   | ✅          | ⬜ pending |
| 14-01-02 | 01   | 1    | i18n        | manual    | locale JSON valid JSON                 | ✅          | ⬜ pending |
| 14-02-01 | 02   | 1    | multiplayer | manual    | reproduce round-skip                   | ✅          | ⬜ pending |
| 14-03-01 | 03   | 1    | typecheck   | automated | `pnpm run typecheck`                   | ✅          | ⬜ pending |
| 14-04-01 | 04   | 2    | CI/CD       | manual    | verify workflow runs in GitHub Actions | ✅          | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- Vitest is already installed and configured
- TypeScript + ESLint checks run via `pnpm run workspace:check`
- No new test framework installation needed

---

## Manual-Only Verifications

| Behavior                             | Requirement        | Why Manual                        | Test Instructions                                                                   |
| ------------------------------------ | ------------------ | --------------------------------- | ----------------------------------------------------------------------------------- |
| Multiplayer round-skip fixed         | Success Criteria 2 | Requires 2+ players, real session | Start 2-player game, complete rounds, verify no round is skipped                    |
| CI/CD deployment works end-to-end    | User priority      | Requires GitHub Actions runner    | Push to dev branch, verify workflow completes without failures                      |
| All UI text shows translated strings | Success Criteria 1 | Requires visual inspection        | Switch locale to `en`, navigate all pages, check no German hardcoded strings appear |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
