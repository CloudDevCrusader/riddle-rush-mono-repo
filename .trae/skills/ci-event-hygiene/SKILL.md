---
name: 'ci-event-hygiene'
description: 'Audits CI workflow triggers and overlap, consolidates required checks, and prevents duplicate runs. Invoke when CI runs multiple workflows per PR or required checks are flaky/broken.'
---

# CI Event Hygiene

This skill audits and fixes CI workflow trigger overlap (GitHub Actions and/or CircleCI) so PRs run the intended checks exactly once, with stable job names for branch protection.

## Invoke When

- Multiple CI workflows run for the same `push`/`pull_request` event.
- Branch protection “required checks” are missing, renamed, or duplicated.
- CI is slow because the same steps execute in several workflows.
- CI appears flaky because different pipelines use different Node/pnpm/test commands.

## Inputs To Collect (If Available)

- The authoritative CI system for merges (GitHub Actions vs CircleCI).
- Current branch protection required check names (or the list of expected jobs).
- Repo constraints: Node version policy, package manager, main build/test commands.

If inputs are missing, infer from `package.json`, CI configs, and existing scripts.

## What To Inspect

### GitHub Actions

- All files in `.github/workflows/*.yml` / `*.yaml`.
- For each workflow:
  - `on:` triggers (push/PR, paths filters, schedules, issue_comment, workflow_run).
  - Concurrency settings (`concurrency.group`, `cancel-in-progress`).
  - Job names and whether they should be stable (branch protection dependencies).
  - Reusable workflows (`workflow_call`) and callers.

### CircleCI

- `.circleci/config.yml`:
  - Schema version correctness (`2.1` for orbs/advanced features).
  - Workflow filters and branch filters.
  - Job dependency graph (`requires`).
  - Any non-standard keys that break config validation.

## Deliverables

- A map of “events → workflows triggered” to highlight redundancy.
- A proposed single source of truth for PR validation (one workflow/pipeline).
- Concrete edits to:
  - Restrict triggers (e.g., only one workflow runs for PRs).
  - Gate deploy workflows to `workflow_dispatch` or protected branches.
  - Normalize job names so branch protection stays stable.
  - Add `concurrency` to reduce duplicate runs.

## Decision Rules

- Prefer **one** PR validation workflow for required checks.
- Keep deploy workflows separate and gated (e.g., only `main`, tags, or manual).
- Avoid job renames if branch protection depends on them; if renaming is necessary, provide a migration note.
- Use repo-wide Node/pnpm policy consistently.

## Output Format

- **Findings**: short bullets pointing to the exact workflow file and trigger causing overlap.
- **Proposed Contract**: the list of required checks (stable job names).
- **Patch Plan**: minimal set of edits to achieve the contract.

## Example Prompt

"Audit our GitHub Actions so only one workflow runs on PRs, keep required checks stable, and gate deploy workflows to main/tags. Provide a patch plan and the exact files to change."
