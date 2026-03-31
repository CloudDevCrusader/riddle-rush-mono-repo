# Phase 17: Repo Cleanup, Documentation & Optimization - Research

**Researched:** 2026-03-14
**Domain:** Repository hygiene, dead code detection, dependency management, documentation
**Confidence:** HIGH

## Summary

The repository has accumulated significant cruft from experimentation with many AI coding tools, multiple CI/CD platforms, and various tool integrations. There are **1,199 tracked files across 30+ AI tool configuration directories** (`.agent/`, `.agents/`, `.ai/`, `.augment/`, `.cline/`, `.codebuddy/`, `.codex/`, `.continue/`, `.cursor/`, `.grok/`, `.junie/`, `.kilocode/`, `.kiro/`, `.mcpjam/`, `.old.gemeni/`, `.opencode/`, `.openhands/`, `.pi/`, `.qoder/`, `.qwen/`, `.tdad/`, `.trae/`, `.vibe/`, `.windsurf/`, `.zencoder/`), stale CI configs (CircleCI + GitLab alongside GitHub Actions), orphaned root-level files (962KB `config.json`, `junit.xml`, `package-lock.json`, `debug-500-main-menu.png`, `terraform.tfstate`), and root-level production dependencies that belong in the `tools/` workspace. The `pnpm audit` reports 22 vulnerabilities including 1 critical.

The cleanup is mostly mechanical (file removal, dependency moves, gitignore additions) but requires careful auditing to avoid breaking working code. Knip is the recommended tool for dead code and unused dependency detection.

**Primary recommendation:** Use Knip for automated dead code/unused dependency detection, then manually audit and remove orphaned files, stale CI configs, and misplaced dependencies. Document large refactoring opportunities as STATE.md todos.

## Standard Stack

### Core Tools

| Tool                     | Version                   | Purpose                                          | Why Standard                                    |
| ------------------------ | ------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| Knip                     | ^5.86                     | Dead code, unused deps, unused exports detection | Industry standard, monorepo-native, Nuxt plugin |
| pnpm audit               | built-in                  | Security vulnerability detection                 | Native to pnpm                                  |
| pnpm outdated            | built-in                  | Outdated dependency detection                    | Native to pnpm                                  |
| syncpack                 | ^14.0 (already installed) | Cross-workspace dependency consistency           | Already in project                              |
| rollup-plugin-visualizer | ^7.0 (already installed)  | Bundle size analysis                             | Already in game app                             |

### Supporting

| Tool              | Purpose                             | When to Use                                   |
| ----------------- | ----------------------------------- | --------------------------------------------- |
| `nuxt analyze`    | Nuxt-specific bundle analysis       | When investigating bundle size                |
| `git filter-repo` | Remove large files from git history | Only if git history cleanup is needed (defer) |

### Alternatives Considered

| Instead of        | Could Use | Tradeoff                                                       |
| ----------------- | --------- | -------------------------------------------------------------- |
| Knip              | depcheck  | depcheck is unmaintained, no monorepo support, recommends Knip |
| Manual file audit | ts-prune  | ts-prune only finds unused exports, Knip does everything       |

**Installation:**

```bash
pnpm add -wD knip
```

## Architecture Patterns

### Cleanup Categories (Priority Order)

```
1. REMOVE - Orphaned/stale files          (safe, no code changes)
2. GITIGNORE - Files that shouldn't be tracked  (safe, add to .gitignore)
3. RELOCATE - Misplaced dependencies/files  (requires testing)
4. DETECT - Dead code via Knip             (requires analysis)
5. UPDATE - Outdated/vulnerable deps       (requires testing)
6. DOCUMENT - Update docs to match reality (safe, no code changes)
7. DEFER - Large refactoring opportunities  (document only)
```

### Pattern: Knip Configuration for This Project

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "workspaces": {
    ".": {
      "entry": ["main.py"],
      "ignoreDependencies": [
        "@anthropic-ai/claude-agent-sdk",
        "@composio/claude-agent-sdk",
        "@composio/core"
      ]
    },
    "apps/game": {
      "entry": ["app.vue", "nuxt.config.ts"],
      "project": ["**/*.{ts,vue}"],
      "ignore": ["**/*.spec.ts", "**/*.test.ts"]
    },
    "packages/*": {}
  }
}
```

Note: Knip's Nuxt plugin does not yet fully support Nuxt 4 directory structure (GitHub issue #1255). Manual entry/project paths may be needed for the game app.

### Anti-Patterns to Avoid

- **Removing AI tool configs without checking if they are gitignored:** Some may be needed for team members using those tools. Add to `.gitignore` instead of deleting from working dir.
- **Bulk dependency updates without testing:** Update one category at a time, run `workspace:check` after each.
- **Removing "unused" exports that are used at runtime:** Nuxt auto-imports composables -- Knip may flag them as unused. Verify before removing.

## Don't Hand-Roll

| Problem                     | Don't Build                     | Use Instead                                 | Why                                           |
| --------------------------- | ------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Unused dependency detection | Custom scripts to parse imports | Knip                                        | Understands 100+ tool configs, monorepo-aware |
| Outdated dep detection      | Manual package.json review      | `pnpm outdated -r`                          | Recursive, shows current vs latest            |
| Vulnerability scanning      | Manual CVE checking             | `pnpm audit`                                | Checks npm advisory database                  |
| Bundle size analysis        | Manual chunk inspection         | `rollup-plugin-visualizer` / `nuxt analyze` | Visual treemaps                               |
| Dependency version sync     | Manual version alignment        | `syncpack lint` / `syncpack fix`            | Already configured in project                 |

## Common Pitfalls

### Pitfall 1: Nuxt Auto-Imports Confuse Knip

**What goes wrong:** Knip flags composables, components, and pages as unused because Nuxt auto-imports them without explicit import statements.
**Why it happens:** Knip's Nuxt plugin handles some of this, but Nuxt 4 support is incomplete.
**How to avoid:** Run Knip in report mode first (`knip --reporter compact`), manually review all "unused" composables and components before removing. Add false positives to `ignoreDependencies` or `ignore` in config.
**Warning signs:** Knip reports `usePageSetup`, `GameButton`, etc. as unused.

### Pitfall 2: Root-Level Dependencies Used by tools/ Directory

**What goes wrong:** Removing root `dependencies` like `@langchain/openai`, `@voltagent/core`, `ai`, `langchain`, `@e2b/code-interpreter` breaks tools/ scripts.
**Why it happens:** These are production deps in root `package.json` but only used by `tools/` directory scripts.
**How to avoid:** Move these to a dedicated `tools/` workspace `package.json` before removing from root. Or if `tools/` is not a workspace, make it one first.
**Warning signs:** `tools/` scripts fail after dependency removal.

### Pitfall 3: Removing CI Configs Still Used by Some Branches

**What goes wrong:** Deleting `.gitlab-ci.yml` or `.circleci/config.yml` breaks CI on branches that still reference them.
**Why it happens:** Project migrated from GitLab to GitHub but old configs remain.
**How to avoid:** Verify all active branches use GitHub Actions before removing. Check STATE.md -- CircleCI was already removed (quick-task), but the config file remains tracked.
**Warning signs:** CI breaks on feature branches.

### Pitfall 4: Breaking Husky Hooks During Cleanup

**What goes wrong:** Reorganizing files triggers pre-commit hooks that fail on partially-cleaned state.
**Why it happens:** ESLint, TypeScript checks run on every commit.
**How to avoid:** Run `pnpm run workspace:check` after each logical cleanup step. Commit in small batches.

### Pitfall 5: Large Files in Git History

**What goes wrong:** Removing `debug-500-main-menu.png` (556KB), `config.json` (962KB), `package-lock.json` (618KB) from tracked files doesn't reclaim space in `.git/`.
**Why it happens:** Git stores history forever.
**How to avoid:** Just remove from tracking and add to `.gitignore`. History rewriting is a separate, destructive operation -- defer to future.

## Code Examples

### Running Knip for the First Time

```bash
# Install
pnpm add -wD knip

# Run in report mode (no changes)
npx knip --reporter compact

# Run with fix (auto-remove unused deps from package.json)
npx knip --fix --no-config-hints
```

### Removing Files from Git Tracking (Keep Local)

```bash
# Remove from git but keep on disk
git rm --cached config.json junit.xml package-lock.json debug-500-main-menu.png terraform.tfstate uv.lock

# Add to .gitignore
echo "config.json" >> .gitignore
echo "junit.xml" >> .gitignore
echo "package-lock.json" >> .gitignore
echo "debug-500-main-menu.png" >> .gitignore
echo "terraform.tfstate" >> .gitignore
echo "uv.lock" >> .gitignore
```

### Checking Bundle Size

```bash
# From apps/game/
npx nuxi analyze
```

## Identified Cleanup Targets

### Category 1: Orphaned/Stale Root Files (REMOVE from git)

| File                              | Size  | Reason                                             |
| --------------------------------- | ----- | -------------------------------------------------- |
| `config.json`                     | 962KB | OpenCode AI tool config, not project config        |
| `junit.xml`                       | 134KB | CI artifact, should not be tracked                 |
| `package-lock.json`               | 618KB | npm lockfile in pnpm project                       |
| `debug-500-main-menu.png`         | 556KB | Debug screenshot                                   |
| `terraform.tfstate`               | 181B  | Terraform state (sensitive, empty but still wrong) |
| `uv.lock`                         | 84KB  | Python UV lockfile                                 |
| `pyproject-old.toml`              | 196B  | Deprecated config                                  |
| `seed.spec.ts`                    | 141B  | Orphaned test file at root                         |
| `main.py`                         | 99B   | Orphaned Python entry point at root                |
| `nuxt.config.terraform.ts`        | 2.7KB | Unused Nuxt config variant                         |
| `CI_CD_IMPLEMENTATION_SUMMARY.md` | 4.8KB | Historical summary, move to docs/archive           |
| `COMPLETION-SUMMARY.md`           | 7.3KB | Historical summary, move to docs/archive           |
| `DEPLOYMENT-CHECKLIST.md`         | 3.2KB | Redundant with docs/                               |
| `trigger.config.ts`               | 610B  | Trigger.dev config, likely unused                  |
| `opencode.json`                   | 3.8KB | OpenCode AI tool config                            |
| `mcp-config.yaml`                 | 3.5KB | MCP config, possibly redundant with .mcp.json      |
| `flags.json`                      | 130B  | Feature flags config, likely stale                 |
| `stagewise.json`                  | 78B   | Stagewise AI tool config                           |
| `fastmcp.json`                    | 2.4KB | FastMCP config (may be needed for Claude Desktop)  |
| `.eslintignore`                   | 469B  | Unnecessary with ESLint 9 flat config              |
| `.gitignore.monorepo`             | 113B  | Unused secondary gitignore                         |

### Category 2: AI Tool Config Directories (ADD to .gitignore)

| Directory                   | Files | Action                                      |
| --------------------------- | ----- | ------------------------------------------- |
| `.agent/`                   | 37    | Keep (OpenSpec skills used by project)      |
| `.agents/`                  | 728   | Keep (Claude skills used by .claude/skills) |
| `.ai/`                      | 1     | Remove from git, gitignore                  |
| `.augment/`                 | 17    | Remove from git, gitignore                  |
| `.cline/`                   | 17    | Remove from git, gitignore                  |
| `.codebuddy/`               | 18    | Remove from git, gitignore                  |
| `.codex/`                   | 3     | Remove from git, gitignore                  |
| `.continue/`                | 17    | Remove from git, gitignore                  |
| `.crush/` (untracked)       | -     | Add to gitignore                            |
| `.cursor/`                  | 23    | Remove from git, gitignore                  |
| `.grok/`                    | 1     | Remove from git, gitignore                  |
| `.junie/`                   | 17    | Remove from git, gitignore                  |
| `.kilocode/`                | 17    | Remove from git, gitignore                  |
| `.kiro/`                    | 19    | Remove from git, gitignore                  |
| `.mcpjam/`                  | 17    | Remove from git, gitignore                  |
| `.old.gemeni/`              | 2     | Remove from git, gitignore                  |
| `.opencode/`                | 117   | Remove from git, gitignore                  |
| `.openhands/`               | 19    | Remove from git, gitignore                  |
| `.pi/`                      | 17    | Remove from git, gitignore                  |
| `.qoder/`                   | 17    | Remove from git, gitignore                  |
| `.qwen/`                    | 17    | Remove from git, gitignore                  |
| `.superdesign/` (untracked) | -     | Add to gitignore                            |
| `.tdad/`                    | 1     | Remove from git, gitignore                  |
| `.trae/`                    | 18    | Remove from git, gitignore                  |
| `.vibe/`                    | 18    | Remove from git, gitignore                  |
| `.windsurf/`                | 18    | Remove from git, gitignore                  |
| `.zencoder/`                | 20    | Remove from git, gitignore                  |

**Total: ~450+ files to remove from tracking**

Also remove/gitignore these root-level AI tool files:

- `.cursorrules`, `.vibemodes`, `.roomodes`, `.goosehints`, `.aiignore`, `.brew-packages`
- `.aider.chat.history.md`, `.aider.input.history`, `.aider.tags.cache.v4/`

### Category 3: Stale CI/CD Configs

| File                                          | Status                          | Action                          |
| --------------------------------------------- | ------------------------------- | ------------------------------- |
| `.circleci/config.yml`                        | Confirmed removed in quick-task | Delete directory                |
| `.gitlab-ci.yml`                              | Project moved to GitHub         | Remove (verify no GitLab usage) |
| `.gitlab/`                                    | GitLab-specific configs         | Remove (verify no GitLab usage) |
| `.github/workflows/gemini-*.yml` (5 files)    | Gemini Code Assist configs      | Audit if actively used          |
| `.github/workflows/opencode.yml`              | OpenCode AI tool                | Audit if actively used          |
| `.github/workflows/ios-e2e.yml`               | iOS E2E (no iOS app)            | Remove                          |
| `.github/workflows/test-deployed.yml.example` | Example file                    | Remove                          |

### Category 4: Orphaned Directories

| Directory          | Files     | Reason                                                     |
| ------------------ | --------- | ---------------------------------------------------------- |
| `src/`             | ~11 files | CircleCI orb source -- stale                               |
| `cfn-project/`     | 1 file    | CloudFormation config -- stale                             |
| `oclif/`           | 7 files   | Empty oclif scaffolding (duplicate of packages/riddle-cli) |
| `archive/`         | 1 file    | Old docs                                                   |
| `bin/.idea/`       | 9 files   | IDE config tracked in git                                  |
| `bin/Untitled`     | 1 file    | Unnamed file                                               |
| `middleware/`      | 1 file    | Root-level middleware (should be in apps/game)             |
| `services/`        | 2 files   | Root-level services (should be in apps/game)               |
| `openspec/`        | 4 files   | OpenSpec changes (check if still in progress)              |
| `skills/`          | dir       | Symlinks/copies of .agents/skills (redundant)              |
| `specs/`           | dir       | Spec files (check if still needed)                         |
| `templates/`       | dir       | Template files (check if referenced)                       |
| `vibe-mcp-config/` | dir       | Vibe AI tool config                                        |
| `worktrees/`       | dir       | Empty worktrees directory                                  |

### Category 5: Misplaced Root Dependencies

| Package                           | Current Location       | Should Be                    |
| --------------------------------- | ---------------------- | ---------------------------- |
| `@e2b/code-interpreter`           | root `dependencies`    | `tools/` workspace           |
| `@langchain/openai`               | root `dependencies`    | `tools/` workspace           |
| `@voltagent/core`                 | root `dependencies`    | `tools/` workspace           |
| `@voltagent/mcp-server`           | root `dependencies`    | `tools/` workspace           |
| `ai`                              | root `dependencies`    | `tools/` workspace           |
| `langchain`                       | root `dependencies`    | `tools/` workspace           |
| `zod`                             | root `dependencies`    | `tools/` workspace or shared |
| `@anthropic-ai/claude-agent-sdk`  | root `devDependencies` | `tools/` workspace           |
| `@composio/claude-agent-sdk`      | root `devDependencies` | `tools/` workspace           |
| `@composio/core`                  | root `devDependencies` | `tools/` workspace           |
| `@pnpm/filter-workspace-packages` | root `devDependencies` | Audit if used                |
| `@trigger.dev/sdk`                | root `devDependencies` | `tools/` workspace or remove |
| `jest`                            | root `devDependencies` | Remove (project uses Vitest) |

### Category 6: Suspect Game App Files

| File                               | Reason                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| `pages/component-test.vue`         | Test page, should not ship to production                   |
| `pages/websocket-demo.vue`         | Demo page, should not ship to production                   |
| `pages/results.vue`                | May conflict with `pages/results/` directory               |
| `assets/figma/` (109 files, 2.9MB) | Figma exports -- check if referenced or just source assets |

### Category 7: Vulnerability Report (22 vulnerabilities)

- **1 critical** -- needs immediate attention
- **10 high** -- should be resolved
- **9 moderate** -- should be resolved where possible
- **2 low** -- can defer

Run `pnpm audit` for full details and fix what can be fixed with `pnpm update -r && pnpm audit --fix`.

## Documentation Gaps

### CLAUDE.md Updates Needed

- `packageManager` field says `pnpm@10.28.2` in docs but actual is `pnpm@10.30.3`
- Phase 12 shown as "complete" in STATE.md but plans are still unchecked in ROADMAP.md
- Composables table may be outdated (check for new/removed composables since Phase 12)
- Components table may be outdated
- "Phase 13 of 13" in STATE.md but there are now Phases 14, 15, 17

### README.md Updates Needed

- Check if monorepo structure diagram matches current directory layout
- Check if technology versions are current
- Quick start instructions may reference outdated commands

### docs/ Cleanup

- Many docs dated Feb 8 2026 or earlier -- check relevance
- `DEPLOYMENT.md` (35KB), `DEVELOPMENT.md` (45KB), `DESIGN.md` (38KB) -- large files that may have outdated sections
- `docs/nuxt.config.ts` -- stale file in docs directory
- `docs/pages/` -- pages in docs directory?

## State of the Art

| Old Approach             | Current Approach    | When Changed | Impact                                              |
| ------------------------ | ------------------- | ------------ | --------------------------------------------------- |
| depcheck for unused deps | Knip                | 2024-2025    | Knip is monorepo-native, handles 100+ tool configs  |
| Manual dead code review  | Knip unused exports | 2024-2025    | Automated detection of unused files, exports, types |
| npm lockfile             | pnpm lockfile only  | Already done | Remove stale `package-lock.json`                    |

## Open Questions

1. **Are any `tools/` scripts actively used?**
   - What we know: Root package.json has `ai:status`, `ai:agents`, `ai:tools` scripts
   - What's unclear: Whether anyone runs these regularly
   - Recommendation: Keep tools/ but move their deps out of root package.json into a tools workspace

2. **Is GitLab CI still used on any branch?**
   - What we know: GitHub Actions is primary CI, CircleCI was removed
   - What's unclear: Whether any deployment still uses GitLab
   - Recommendation: Verify with git log on .gitlab-ci.yml, then remove

3. **Are Gemini GitHub workflows active?**
   - What we know: 5 Gemini-related workflow files exist
   - What's unclear: Whether Gemini Code Assist is configured
   - Recommendation: Check if GEMINI secrets are set in GitHub repo settings

4. **Should `apps/game/assets/figma/` be tracked?**
   - What we know: 109 PNG files, 2.9MB, Figma design exports
   - What's unclear: Whether these are source assets or build artifacts
   - Recommendation: If build artifacts from Figma sync, add to gitignore

## Validation Architecture

> Nyquist validation is not explicitly disabled in config.json, so including this section.

### Test Framework

| Property           | Value                                       |
| ------------------ | ------------------------------------------- |
| Framework          | Vitest 4.x + Playwright                     |
| Config file        | `apps/game/vitest.config.ts`                |
| Quick run command  | `pnpm run test`                             |
| Full suite command | `pnpm run workspace:check && pnpm run test` |

### Phase Requirements -> Test Map

| Req ID   | Behavior                        | Test Type | Automated Command                              | File Exists? |
| -------- | ------------------------------- | --------- | ---------------------------------------------- | ------------ |
| CLEAN-01 | No orphaned files after cleanup | manual    | `git ls-files \| wc -l` (compare before/after) | N/A          |
| CLEAN-02 | workspace:check passes          | smoke     | `pnpm run workspace:check`                     | Existing     |
| CLEAN-03 | Knip reports clean              | smoke     | `npx knip --reporter compact`                  | Wave 0       |
| CLEAN-04 | No new vulnerabilities          | smoke     | `pnpm audit --audit-level critical`            | Existing     |
| CLEAN-05 | Docs accuracy                   | manual    | Visual review                                  | N/A          |
| CLEAN-06 | Build still works               | smoke     | `pnpm run build`                               | Existing     |

### Sampling Rate

- **Per task commit:** `pnpm run workspace:check`
- **Per wave merge:** `pnpm run workspace:check && pnpm run build && pnpm run test`
- **Phase gate:** Full suite green, Knip clean, `pnpm audit` reviewed

### Wave 0 Gaps

- [ ] Install Knip: `pnpm add -wD knip`
- [ ] Create `knip.json` configuration for monorepo
- [ ] Baseline Knip report before changes

## Sources

### Primary (HIGH confidence)

- Direct repository analysis via `git ls-files`, `ls`, `pnpm audit`, `pnpm outdated`
- [Knip official docs](https://knip.dev/) - Dead code detection, monorepo support
- [Knip Nuxt plugin](https://knip.dev/reference/plugins/nuxt) - Nuxt-specific configuration
- [pnpm audit docs](https://pnpm.io/cli/audit) - Vulnerability scanning

### Secondary (MEDIUM confidence)

- [Knip Nuxt 4 support issue #1255](https://github.com/webpro-nl/knip/issues/1255) - Nuxt 4 paths not fully supported yet
- [Knip npm package](https://www.npmjs.com/package/knip) - v5.86.0, ~4M weekly downloads
- [pnpm monorepo best practices](https://blog.glen-thomas.com/software%20engineering/2025/10/02/mastering-pnpm-workspaces-complete-guide-to-monorepo-management.html)

### Tertiary (LOW confidence)

- [depcheck deprecation](https://github.com/depcheck/depcheck) - Recommends Knip as replacement

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Knip is well-established, directly verified capabilities
- Architecture: HIGH - Based on direct repository analysis, all targets identified from actual file listing
- Pitfalls: HIGH - Based on known project patterns (Nuxt auto-imports, pnpm monorepo)
- Cleanup targets: HIGH - Every item verified via `git ls-files` output

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable domain, tooling moves slowly)
