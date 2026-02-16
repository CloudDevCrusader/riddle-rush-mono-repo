---
created: 2026-02-13T06:48
title: Add non-blocking GitHub Action for quality checks
area: tooling
files:
  - .github/workflows/
  - package.json
---

## Problem

After switching away from CircleCI, there's no CI visibility into code quality on PRs/pushes. Want a GitHub Action that runs typecheck, lint, and tests so results are visible — but **non-blocking** (checks should not gate merges). This gives the team awareness of test status without the friction of mandatory green builds.

## Solution

1. Create `.github/workflows/checks.yml` with jobs for:
   - `pnpm run typecheck`
   - `pnpm run lint`
   - `pnpm run test:unit`
2. Set `continue-on-error: true` on jobs so the workflow always shows as passing
3. Or use a separate status check name that's not required in branch protection rules
4. Trigger on push to main and PRs
5. Vercel remains the actual build/deploy system — this is informational only
