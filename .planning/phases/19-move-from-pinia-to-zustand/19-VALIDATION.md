---
phase: 19
slug: move-from-pinia-to-zustand
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                            |
| ---------------------- | ------------------------------------------------ |
| **Framework**          | vitest 3.x                                       |
| **Config file**        | apps/game/vitest.config.ts                       |
| **Quick run command**  | `cd apps/game && pnpm run test:unit`             |
| **Full suite command** | `pnpm run test:unit && pnpm run workspace:check` |
| **Estimated runtime**  | ~30 seconds                                      |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/game && pnpm run test:unit`
- **After every plan wave:** Run `pnpm run workspace:check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type        | Automated Command                    | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------------- | ------------------------------------ | ----------- | ---------- |
| 19-01-01 | 01   | 1    | N/A         | typecheck        | `pnpm run typecheck`                 | N/A         | ⬜ pending |
| 19-01-02 | 01   | 1    | N/A         | unit             | `cd apps/game && pnpm run test:unit` | ✅          | ⬜ pending |
| 19-02-01 | 02   | 1    | N/A         | unit             | `cd apps/game && pnpm run test:unit` | ✅          | ⬜ pending |
| 19-03-01 | 03   | 2    | N/A         | unit + typecheck | `pnpm run workspace:check`           | ✅          | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Vitest is installed and configured. TypeScript checking via `pnpm run typecheck`. No additional test framework setup needed.

---

## Manual-Only Verifications

| Behavior                                 | Requirement | Why Manual                                   | Test Instructions                                                                        |
| ---------------------------------------- | ----------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Vue reactivity works with Zustand stores | N/A         | Reactivity bridge needs runtime verification | Start dev server, navigate through game flow, verify UI updates when store state changes |
| Settings persist across page reload      | N/A         | IndexedDB + localStorage interaction         | Change settings, reload page, verify settings retained                                   |
| Old Pinia data migrates correctly        | N/A         | Requires pre-existing localStorage data      | Seed old-format localStorage key, reload, verify migration                               |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
