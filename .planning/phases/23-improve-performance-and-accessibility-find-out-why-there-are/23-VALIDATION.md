---
phase: 23
slug: improve-performance-and-accessibility-find-out-why-there-are
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                |
| ---------------------- | ------------------------------------ |
| **Framework**          | Vitest 3.x with happy-dom            |
| **Config file**        | `apps/game/vitest.config.ts`         |
| **Quick run command**  | `cd apps/game && pnpm run test:unit` |
| **Full suite command** | `pnpm run test:unit` (via Turbo)     |
| **Estimated runtime**  | ~15 seconds                          |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/game && pnpm run test:unit`
- **After every plan wave:** Run `pnpm run test:unit`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior           | Test Type     | Automated Command                                               | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | ------------------------- | ------------- | --------------------------------------------------------------- | ----------- | ---------- |
| 23-01-01 | 01   | 1    | D-01        | —          | N/A                       | manual        | Verify file count in `public/assets/`                           | N/A         | ⬜ pending |
| 23-01-02 | 01   | 1    | D-02        | —          | N/A                       | unit          | `cd apps/game && pnpm vitest run tests/unit/use-assets.spec.ts` | ✅          | ⬜ pending |
| 23-01-03 | 01   | 1    | D-03        | —          | N/A                       | manual/script | `find public/assets -name "*[A-Z ]*"`                           | N/A         | ⬜ pending |
| 23-01-04 | 01   | 1    | D-04        | —          | N/A                       | unit          | `cd apps/game && pnpm vitest run tests/unit/use-assets.spec.ts` | ✅          | ⬜ pending |
| 23-02-01 | 02   | 1    | D-05/D-06   | —          | N/A                       | e2e/smoke     | Build + check no 404s                                           | Manual      | ⬜ pending |
| 23-02-02 | 02   | 1    | D-07        | —          | N/A                       | smoke         | Inspect HTML output for `loading="lazy"`                        | Manual      | ⬜ pending |
| 23-03-01 | 03   | 1    | D-08        | —          | N/A                       | smoke         | `pnpm run lighthouse`                                           | ❌ W0       | ⬜ pending |
| 23-03-02 | 03   | 1    | D-09        | —          | N/A                       | smoke         | Run lighthouse after build                                      | Manual      | ⬜ pending |
| 23-03-03 | 03   | 1    | D-10        | —          | N/A                       | manual        | Document scores before changes                                  | N/A         | ⬜ pending |
| 23-04-01 | 04   | 2    | D-11        | T-23-01    | CDN dependency eliminated | smoke         | Build + verify no googleapis requests                           | Manual      | ⬜ pending |
| 23-04-02 | 04   | 2    | D-12        | —          | N/A                       | smoke         | Build + check output size < 500KB                               | Manual      | ⬜ pending |
| 23-04-03 | 04   | 2    | D-13        | —          | N/A                       | unit/smoke    | Import check + build                                            | Manual      | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] Add `useAssets.spec.ts` test cases for `getWebPAssetPath()` if added
- [ ] Lighthouse script needs to be created (D-08) — `pnpm run lighthouse` command
- [ ] No existing test for font loading — manual verification via Lighthouse

_Existing test infrastructure covers most unit-testable behaviors._

---

## Manual-Only Verifications

| Behavior                    | Requirement | Why Manual                 | Test Instructions                                             |
| --------------------------- | ----------- | -------------------------- | ------------------------------------------------------------- |
| Unreferenced images removed | D-01        | File deletion verification | Count files in `public/assets/`, compare before/after         |
| File names lowercase-kebab  | D-03        | Naming convention check    | Run `find public/assets -name "*[A-Z ]*"` — expect empty      |
| Images display correctly    | D-05/D-06   | Visual verification needed | Build, serve, navigate all pages — no broken images           |
| Lazy loading present        | D-07        | HTML attribute inspection  | Build, inspect non-critical `<img>` tags for `loading="lazy"` |
| Lighthouse scores 90+       | D-09        | Score benchmark            | Run `pnpm run lighthouse`, verify all categories ≥ 90         |
| Baseline captured           | D-10        | Pre-change measurement     | Run lighthouse before any code changes, save report           |
| Fonts self-hosted           | D-11        | Network request check      | Build, serve, verify no requests to fonts.googleapis.com      |
| JS under 500KB              | D-12        | Build output size          | Check `.output/public/_nuxt/` JS bundle sizes                 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
