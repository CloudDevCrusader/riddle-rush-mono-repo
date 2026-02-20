---
phase: 004-update-all-dependencies
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - apps/game/package.json
  - apps/mobile/package.json
  - apps/tolgee/package.json
  - packages/config/package.json
  - packages/shared/package.json
  - packages/types/package.json
  - packages/riddle-cli/package.json
  - tools/composio/package.json
  - tools/langchain/package.json
  - tools/latitude-llm/package.json
  - tools/my-stagehand-app/package.json
  - tools/oclif/package.json
  - pnpm-lock.yaml
autonomous: true
requirements: [DEP-UPDATE]

must_haves:
  truths:
    - 'All external npm dependencies are at their latest versions'
    - 'All local workspace references (@riddle-rush/*) use correct versions'
    - 'Syncpack reports no version mismatches'
    - 'TypeScript compilation passes across all packages'
    - 'ESLint passes across all packages'
  artifacts:
    - path: 'pnpm-lock.yaml'
      provides: 'Updated lockfile reflecting latest dependency versions'
    - path: 'package.json'
      provides: 'Root package.json with latest dependency versions'
    - path: 'apps/game/package.json'
      provides: 'Game app package.json with latest dependency versions'
  key_links:
    - from: 'all package.json files'
      to: 'pnpm-lock.yaml'
      via: 'pnpm install resolution'
      pattern: 'pnpm update'
---

<objective>
Update all dependencies across the entire monorepo to their latest versions, including both external npm packages and local workspace references. Fix any resulting type errors, lint issues, or breaking changes.

Purpose: Keep the project up-to-date with latest security patches, bug fixes, and features from upstream dependencies.
Output: All package.json files updated with latest versions, clean lockfile, passing workspace:check.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@package.json
@pnpm-workspace.yaml
@.syncpackrc.json
@apps/game/package.json
@turbo.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update all dependencies to latest versions</name>
  <files>
    package.json
    apps/game/package.json
    apps/mobile/package.json
    apps/tolgee/package.json
    packages/config/package.json
    packages/shared/package.json
    packages/types/package.json
    packages/riddle-cli/package.json
    tools/composio/package.json
    tools/langchain/package.json
    tools/latitude-llm/package.json
    tools/my-stagehand-app/package.json
    tools/oclif/package.json
    pnpm-lock.yaml
  </files>
  <action>
    1. Run `pnpm update -r --latest` from the monorepo root to update ALL dependencies across ALL workspace packages to their absolute latest versions. This updates both the package.json version ranges and the lockfile.

    2. Run `pnpm run syncpack:fix` to ensure version consistency across workspace packages per .syncpackrc.json rules:
       - Workspace packages (@riddle-rush/**) use exact versions
       - External dependencies use caret (^) ranges
       - All packages use the same version for shared dependencies

    3. Run `pnpm install` to regenerate the lockfile cleanly after syncpack modifications.

    4. Run `pnpm run syncpack:check` to verify no mismatches remain. If mismatches persist, run `pnpm run syncpack:fix` again and repeat until clean.

    IMPORTANT NOTES:
    - If `pnpm update -r --latest` fails for specific packages (e.g., peer dependency conflicts), note them and try updating those individually with `pnpm update <package>@latest -r` or exclude them if they have known compatibility issues.
    - The mobile app (apps/mobile) uses NativeScript which may have specific version constraints -- if it causes issues, update it separately or skip it.
    - Workspace protocol references (workspace:*) should be preserved by pnpm automatically.

  </action>
  <verify>
    Run `pnpm run syncpack:check` -- must exit 0 with no mismatches reported.
    Run `pnpm ls --depth 0 -r 2>&1 | head -50` to confirm packages resolved correctly.
  </verify>
  <done>All package.json files reflect latest dependency versions. Syncpack reports zero mismatches. pnpm-lock.yaml is regenerated and consistent.</done>
</task>

<task type="auto">
  <name>Task 2: Fix breaking changes and validate workspace</name>
  <files>
    apps/game/package.json
    apps/game/nuxt.config.ts
    packages/types/src/game.ts
    packages/shared/src/index.ts
  </files>
  <action>
    1. Run `pnpm run typecheck` to check for TypeScript compilation errors introduced by updated dependencies. Common issues:
       - Type definition changes in @types/* packages
       - Breaking API changes in major version bumps (especially Nuxt ecosystem packages, Vitest, ESLint)
       - Changed export signatures in utility libraries

    2. For each TypeScript error, fix the affected source file. Common fixes:
       - Update import paths if packages restructured exports
       - Adjust type annotations to match new type definitions
       - Update API usage to match new library versions
       - If a package had a major bump with significant breaking changes, check its changelog/migration guide

    3. Run `pnpm run lint` to check for ESLint issues. If the ESLint config packages themselves were updated (e.g., @nuxt/eslint-config), new rules may be flagged.

    4. Run `pnpm run workspace:fix` to auto-fix any auto-fixable lint/format issues.

    5. Run `pnpm run workspace:check` (syncpack + typecheck + lint) as the final validation. ALL three must pass.

    6. If unit tests are quick, run `pnpm run test:unit` to verify no runtime regressions from updated deps.

    NOTES:
    - The files list above is indicative -- fix whatever files have errors. The game app is the most likely to have issues given its complexity.
    - If a specific dependency update causes irreconcilable issues (e.g., a major version with huge breaking changes that would take extensive refactoring), pin it back to the previous major version and note it as a deferred upgrade.
    - Nuxt 4 ecosystem updates should be handled carefully -- check compatibility between nuxt, @nuxt/devtools, @nuxt/eslint-config, @nuxt/image, @nuxtjs/i18n, etc.

  </action>
  <verify>
    Run `pnpm run workspace:check` -- must exit 0 (syncpack clean, typecheck clean, lint clean).
    Optionally run `pnpm run test:unit` to confirm no test regressions.
  </verify>
  <done>workspace:check passes with zero errors. All TypeScript compiles. All ESLint rules pass. No syncpack mismatches. The monorepo is fully updated and green.</done>
</task>

</tasks>

<verification>
- `pnpm run syncpack:check` exits 0
- `pnpm run typecheck` exits 0
- `pnpm run lint` exits 0
- `pnpm run workspace:check` exits 0 (combined check)
- `pnpm ls --depth 0 -r` shows no unresolved or missing dependencies
</verification>

<success_criteria>
All workspace dependencies updated to latest versions. Syncpack version consistency maintained. TypeScript compilation and ESLint pass across all packages. The monorepo is in a fully working state with `pnpm run workspace:check` passing cleanly.
</success_criteria>

<output>
After completion, create `.planning/quick/004-update-all-dependencies-including-to-loc/004-SUMMARY.md`
</output>
