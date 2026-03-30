# Plan: Commit and push a working version

## Goal
Create a clean, verified commit from the current workspace state and push it to the active remote branch.

## Assumptions
- A git repository is already initialized and connected to a remote.
- You want one focused commit that includes the currently intended changes.
- "Working version" means quality checks and relevant tests pass before commit/push.

## Implementation steps
1. Inspect current repository state:
   - Check branch, staged/unstaged files, and untracked files.
   - Review diffs to ensure only intended changes are included.

2. Ensure dependencies and baseline are ready:
   - Confirm workspace dependencies are installed.
   - If needed, refresh install state before validation.

3. Run required quality checks:
   - Execute the workspace quality gate command (`pnpm run workspace:check`).
   - Resolve any TypeScript, lint, or syncpack issues until checks pass.

4. Run relevant automated tests for touched areas:
   - Prefer at least unit tests for changed logic.
   - Run E2E tests when UI/flow-critical files are affected.
   - Continue only when relevant tests pass.

5. Prepare a focused commit:
   - Stage only intended files.
   - Write a Conventional Commit message that matches the actual change type and scope.
   - Create the commit after verifying staged diff.

6. Push to remote:
   - Push the active branch to origin.
   - Verify push succeeds and remote is up to date.

7. Final verification and handoff:
   - Re-check clean working tree after push.
   - Share summary: commit hash, branch, pushed status, and validations executed.

## Deliverables
- One successful commit with a conventional message.
- Branch pushed to remote.
- Confirmation that checks/tests used for verification passed.
