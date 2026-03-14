---
phase: 17
slug: repo-cleanup-docs-optimization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                         |
| ---------------------- | ------------------------------------------------------------- |
| **Framework**          | Vitest 4.x + Playwright                                       |
| **Config file**        | `apps/game/vitest.config.ts`                                  |
| **Quick run command**  | `pnpm run workspace:check`                                    |
| **Full suite command** | `pnpm run workspace:check && pnpm run test && pnpm run build` |
| **Estimated runtime**  | ~60 seconds                                                   |

---

## Sampling Rate

- **After every task commit:** Run `pnpm run workspace:check`
- **After every plan wave:** Run `pnpm run workspace:check && pnpm run build && pnpm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type | Automated Command                              | File Exists | Status     |
| -------- | ---- | ---- | ----------- | --------- | ---------------------------------------------- | ----------- | ---------- |
| 17-01-01 | 01   | 1    | CLEAN-01    | smoke     | `git ls-files \| wc -l` (compare before/after) | N/A         | ⬜ pending |
| 17-01-02 | 01   | 1    | CLEAN-02    | smoke     | `pnpm run workspace:check`                     | Existing    | ⬜ pending |
| 17-02-01 | 02   | 1    | CLEAN-03    | smoke     | `npx knip --reporter compact`                  | Wave 0      | ⬜ pending |
| 17-02-02 | 02   | 1    | CLEAN-04    | smoke     | `pnpm audit --audit-level critical`            | Existing    | ⬜ pending |
| 17-03-01 | 03   | 2    | CLEAN-05    | manual    | Visual review                                  | N/A         | ⬜ pending |
| 17-03-02 | 03   | 2    | CLEAN-06    | smoke     | `pnpm run build`                               | Existing    | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `pnpm add -wD knip` — Install Knip for dead code detection
- [ ] `knip.json` — Knip configuration for monorepo workspaces

_Existing infrastructure covers most phase requirements. Only Knip needs setup._

---

## Manual-Only Verifications

| Behavior                        | Requirement | Why Manual                         | Test Instructions                                             |
| ------------------------------- | ----------- | ---------------------------------- | ------------------------------------------------------------- |
| No orphaned files after cleanup | CLEAN-01    | File removal is manual audit       | Compare `git ls-files \| wc -l` before and after              |
| Docs accuracy                   | CLEAN-05    | Documentation review is subjective | Read CLAUDE.md and README.md, verify they match current state |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
