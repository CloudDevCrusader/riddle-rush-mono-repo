---
phase: 17-repo-cleanup-docs-optimization
verified: 2026-03-14T22:59:00Z
status: gaps_found
score: 13/16 must-haves verified
gaps:
  - truth: 'Knip baseline report is generated and reviewed — false positives from Nuxt auto-imports are handled'
    status: failed
    reason: 'Knip is installed and runnable, but current report still contains a large unresolved unused-files/unused-deps set (including likely Nuxt auto-import false positives), indicating baseline triage is incomplete.'
    artifacts:
      - path: 'knip.json'
        issue: 'Configuration exists but does not suppress/triage enough known Nuxt false positives to provide an actionable baseline.'
      - path: 'package.json'
        issue: 'knip script exists, but `pnpm run knip` exits non-zero with unresolved findings.'
    missing:
      - 'Finalize baseline triage: separate true dead code vs Nuxt auto-import false positives'
      - 'Add/adjust ignore rules where justified and document rationale'
      - 'Produce a stable, reviewable Knip baseline for ongoing cleanup'
  - truth: 'Orphaned directories (src/, cfn-project/, oclif/, archive/, bin/.idea/, bin/Untitled, middleware/, services/, worktrees/, vibe-mcp-config/) are removed'
    status: failed
    reason: 'Several targeted orphaned directories still physically exist in the repository root.'
    artifacts:
      - path: 'src/'
        issue: 'Directory still exists on disk (`src/.DS_Store`).'
      - path: 'oclif/'
        issue: 'Directory still exists on disk (`oclif/.DS_Store`, `oclif/src/.DS_Store`).'
      - path: 'archive/'
        issue: 'Directory still exists on disk (`archive/.DS_Store`).'
    missing:
      - 'Delete remaining orphaned root directories from working tree (not only untrack from git)'
      - 'Re-validate root layout after deletion'
  - truth: 'README.md monorepo structure diagram matches the post-cleanup directory layout'
    status: failed
    reason: 'README structure diagram omits root directories that still exist (e.g., src/, oclif/, archive/, worktrees/), so it does not match current layout.'
    artifacts:
      - path: 'README.md'
        issue: 'Structure tree does not reflect actual root directory listing.'
    missing:
      - 'Either remove remaining stale directories or update README tree to reflect reality'
      - 'Keep docs and filesystem aligned after final cleanup pass'
---

# Phase 17: Repo Cleanup, Documentation & Optimization Verification Report

**Phase Goal:** Clean up repository structure, improve documentation coverage, identify and implement refactoring and optimization opportunities. Large improvements tracked as todos for future phases.
**Verified:** 2026-03-14T22:59:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                       | Status     | Evidence                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Orphaned root files are removed from git tracking                                           | ✓ VERIFIED | `git ls-files` for listed targets returned no tracked matches.                                                                                                 |
| 2   | AI tool config dirs removed from git tracking (except `.agent/`, `.agents/`) and gitignored | ✓ VERIFIED | `git ls-files` shows `.agent/` and `.agents/` tracked; non-essential AI dirs not tracked; `.gitignore` includes AI config block with keep rules.               |
| 3   | Stale root-level files are removed from git tracking                                        | ✓ VERIFIED | `git ls-files` for `.eslintignore`, `.gitignore.monorepo`, `stagewise.json`, `opencode.json`, `flags.json`, `mcp-config.yaml` returned none tracked.           |
| 4   | AI tool dot-files are removed from git tracking and gitignored                              | ✓ VERIFIED | `.gitignore` contains `.cursorrules`, `.vibemodes`, `.roomodes`, `.goosehints`, `.aiignore`, `.brew-packages`, `.aider.*`; `git ls-files` showed none tracked. |
| 5   | `pnpm run workspace:check` passes after cleanup                                             | ✓ VERIFIED | Command executed successfully (syncpack + typecheck + lint all green).                                                                                         |
| 6   | Knip is installed and configured for monorepo/Nuxt                                          | ✓ VERIFIED | `knip` in root devDependencies, `knip` script in package.json, `knip.json` with workspace config.                                                              |
| 7   | Knip baseline is reviewed and false positives handled                                       | ✗ FAILED   | `pnpm run knip` exits non-zero with broad unresolved findings, including likely Nuxt auto-import false positives.                                              |
| 8   | Stale CI configs removed                                                                    | ✓ VERIFIED | `git ls-files` checks for `.circleci`, `.gitlab*`, listed stale workflows returned no tracked files.                                                           |
| 9   | Orphaned directories are removed                                                            | ✗ FAILED   | Root directories `src/`, `oclif/`, and `archive/` still exist on disk (`glob` results).                                                                        |
| 10  | Suspect game files removed/moved                                                            | ✓ VERIFIED | `apps/game/pages/component-test.vue` and `apps/game/pages/websocket-demo.vue` are absent.                                                                      |
| 11  | Dependency audit completed and critical vulns addressed                                     | ✓ VERIFIED | `pnpm audit --audit-level critical` reports no critical vulnerabilities (19 vulns remain: high/moderate/low).                                                  |
| 12  | `pnpm run workspace:check` still passes (plan 02 gate)                                      | ✓ VERIFIED | Re-ran successfully during verification.                                                                                                                       |
| 13  | CLAUDE.md reflects current pnpm version/phase context/inventory                             | ✓ VERIFIED | `pnpm@10.30.3` matches `packageManager`; listed composables/components match current directories.                                                              |
| 14  | README structure matches post-cleanup layout                                                | ✗ FAILED   | README tree omits existing root dirs (`src/`, `oclif/`, `archive/`, `worktrees/`).                                                                             |
| 15  | Stale docs files archived or removed                                                        | ✓ VERIFIED | `docs/nuxt.config.ts` and `docs/pages/**` absent; `docs/archive/` contains archived docs.                                                                      |
| 16  | `pnpm run build` succeeds                                                                   | ✓ VERIFIED | Build command completed successfully for `@riddle-rush/game`.                                                                                                  |

**Score:** 13/16 truths verified

### Required Artifacts

| Artifact        | Expected                                                                         | Status     | Details                                                                                              |
| --------------- | -------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `.gitignore`    | Ignore orphaned/stale files and AI config dirs while preserving `.agent/.agents` | ✓ VERIFIED | Exists (244 lines), no stub patterns, explicit keep rules and cleanup sections present.              |
| `knip.json`     | Monorepo dead-code config                                                        | ⚠️ PARTIAL | Exists and substantive; wired to `package.json` via dep+script, but baseline still noisy/unresolved. |
| `package.json`  | Knip dependency + script wiring                                                  | ✓ VERIFIED | `knip` devDependency and script are present.                                                         |
| `CLAUDE.md`     | Accurate operational and structure documentation                                 | ✓ VERIFIED | pnpm version and component/composable inventories align with current files.                          |
| `README.md`     | Accurate project overview and monorepo tree                                      | ⚠️ PARTIAL | Core commands/version info valid; structure diagram mismatches actual current root.                  |
| `docs/archive/` | Archived stale docs                                                              | ✓ VERIFIED | Contains archived summary/checklist files.                                                           |

### Key Link Verification

| From                  | To                | Via                                           | Status      | Details                                                                                           |
| --------------------- | ----------------- | --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `.gitignore`          | git tracking      | ignore rules + untracking                     | ✓ WIRED     | Ignore sections cover stale root files and AI tool dirs; tracked-state checks confirm untracking. |
| `knip.json`           | `package.json`    | `knip` devDependency + `pnpm run knip` script | ✓ WIRED     | Config, dependency, and script are connected and executable.                                      |
| `CLAUDE.md`           | `package.json`    | pnpm version reference                        | ✓ WIRED     | Docs reference `pnpm@10.30.3`, matching `packageManager`.                                         |
| README structure docs | actual filesystem | monorepo tree block                           | ✗ NOT_WIRED | Documented tree diverges from existing root directories.                                          |

### Requirements Coverage

| Requirement | Status      | Blocking Issue                                                                                                                                        |
| ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLEAN-01    | ✓ SATISFIED | —                                                                                                                                                     |
| CLEAN-02    | ✓ SATISFIED | —                                                                                                                                                     |
| CLEAN-03    | ✗ BLOCKED   | Knip baseline triage incomplete; unresolved non-actionable findings remain mixed with real issues.                                                    |
| CLEAN-04    | ✓ SATISFIED | Critical vulnerabilities resolved; non-critical vulnerabilities remain.                                                                               |
| CLEAN-05    | ✗ BLOCKED   | README structure documentation does not match current repository layout.                                                                              |
| CLEAN-06    | ⚠️ PARTIAL  | TODOs are present in STATE.md, but large-refactor opportunity documentation is not clearly expanded/structured by this phase beyond existing backlog. |

### Anti-Patterns Found

| File                      | Line          | Pattern                                                  | Severity   | Impact                                                                       |
| ------------------------- | ------------- | -------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| `README.md`               | 61-81         | Structure documentation drift vs actual root directories | ⚠️ Warning | Misleads contributors about real repository layout after cleanup.            |
| `knip.json` / Knip output | runtime check | Unresolved broad findings mixed with false positives     | ⚠️ Warning | Reduces dead-code signal quality; hinders actionable optimization follow-up. |

### Human Verification Required

No additional human-only checks required for this phase outcome. Structural verification found objective gaps.

### Gaps Summary

Phase 17 made meaningful progress (tracking cleanup, docs refresh, Knip integration, critical-vuln resolution), but the phase goal is not fully achieved yet.

Primary blockers:

1. **Repository structure cleanup is incomplete** at filesystem level: targeted orphaned directories still exist (`src/`, `oclif/`, `archive/`).
2. **Knip optimization workflow is not yet operationally “baselined”**: tool is installed/wired, but unresolved high-noise output remains without finalized triage.
3. **Documentation coverage is partially out-of-sync**: README monorepo tree does not reflect current repository root state.

These gaps directly affect CLEAN-03 and CLEAN-05 and prevent full goal achievement.

---

_Verified: 2026-03-14T22:59:00Z_
_Verifier: Claude (gsd-verifier)_
