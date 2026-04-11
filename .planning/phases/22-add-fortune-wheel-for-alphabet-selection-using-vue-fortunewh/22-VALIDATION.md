---
phase: 22
slug: add-fortune-wheel-for-alphabet-selection-using-vue-fortunewh
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | vitest + playwright                                                                                                        |
| **Config file**        | `apps/game/vitest.config.ts`, `apps/game/playwright.config.ts`                                                             |
| **Quick run command**  | `pnpm --filter @riddle-rush/game test:unit -- tests/unit/composables/use-fortune-wheel-selection.spec.ts`                  |
| **Full suite command** | `pnpm run workspace:check && pnpm --filter @riddle-rush/game test:e2e -- tests/e2e/round-start.spec.ts --project=chromium` |
| **Estimated runtime**  | ~90 seconds                                                                                                                |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @riddle-rush/game test:unit -- tests/unit/composables/use-fortune-wheel-selection.spec.ts`
- **After every plan wave:** Run `pnpm run workspace:check && pnpm --filter @riddle-rush/game test:e2e -- tests/e2e/round-start.spec.ts --project=chromium`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                                                              | Test Type | Automated Command                                                                                         | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | ---------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- | ----------- | ---------- |
| 22-01-01 | 01   | 1    | PAGE-04     | T-22-01    | Wheel selection input is validated and bounded to known category+letter sets | unit      | `pnpm --filter @riddle-rush/game test:unit -- tests/unit/composables/use-fortune-wheel-selection.spec.ts` | ❌ W0       | ⬜ pending |
| 22-02-01 | 02   | 2    | PAGE-04     | T-22-02    | Round-start only transitions with verified selection payload                 | unit      | `pnpm --filter @riddle-rush/game test:unit -- tests/unit/components/fortune-alphabet-wheel.spec.ts`       | ❌ W0       | ⬜ pending |
| 22-03-01 | 03   | 3    | PAGE-04     | T-22-03    | End-to-end flow preserves guarded navigation from `/round-start` to `/game`  | e2e       | `pnpm --filter @riddle-rush/game test:e2e -- tests/e2e/round-start.spec.ts --project=chromium`            | ✅          | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `apps/game/tests/unit/composables/use-fortune-wheel-selection.spec.ts` — stubs for selection behavior and fallback
- [ ] `apps/game/tests/unit/components/fortune-alphabet-wheel.spec.ts` — wrapper component interaction and emit contract

---

## Manual-Only Verifications

| Behavior                                              | Requirement | Why Manual                                    | Test Instructions                                                                                                       |
| ----------------------------------------------------- | ----------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Visual alignment of fortune wheel against UI contract | PAGE-04     | UI polish and animation perception are visual | Run `pnpm --filter @riddle-rush/game dev`, open `/round-start`, verify spacing/typography/color against `22-UI-SPEC.md` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
