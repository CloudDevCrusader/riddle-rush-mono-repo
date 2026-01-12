# Agent Workflow Guide

This document defines the standard workflow for AI agents working on this codebase to ensure code quality, regular commits, and smooth collaboration.

## 🚀 Task Runner: Turbo

This monorepo uses **Turbo** for task orchestration:

- **Parallel execution** - Runs tasks across projects simultaneously
- **Smart caching** - Skips unchanged tasks for faster builds
- **Dependency management** - Runs tasks in correct order
- **Remote caching** - Share cache across team (when enabled)

**Key Commands:**

```bash
turbo run build                        # Build all projects
turbo run typecheck lint               # Run multiple tasks
turbo run test --filter=@riddle-rush/game  # Target specific project
pnpm run workspace:check               # Full validation (uses Turbo)
```

## 🎯 Core Principles

1. **Make changes incrementally** - Small, focused commits are better than large dumps
2. **Validate after every change** - Run lint + typecheck after each logical change
3. **Commit frequently** - Commit after each successful validation
4. **Document changes** - Update relevant docs when making changes
5. **Test before commit** - Ensure tests pass for affected areas

---

## 📋 Standard Workflow for All Changes

**For detailed examples and troubleshooting, see:** [Agent Workflow Details](docs/development/AGENT-WORKFLOW.md)

### 1. Before Starting Work

```bash
# Pull latest changes
git pull origin main

# Ensure dependencies are up to date
pnpm install

# Verify baseline
pnpm run typecheck
pnpm run lint
pnpm run test:unit
```

### 2. Make Changes

- Make **small, focused changes** (one feature/fix at a time)
- Follow existing code patterns
- Update tests when changing logic
- Update documentation when changing behavior

### 3. After Each Logical Change

**Run quality checks (Turbo handles parallel execution):**

```bash
# Quick check (< 30 seconds)
pnpm run typecheck
pnpm run lint:fix
pnpm run format

# Full check (recommended - uses Turbo caching)
pnpm run workspace:check  # Runs all checks in parallel

# Or use Turbo directly for specific projects
turbo run typecheck --filter=@riddle-rush/game
```

### 4. Commit Frequently

**Commit after every logical unit of work**, not at the end of the session:

```bash
# Good - Small, focused commits
git add apps/game/composables/useLodash.ts
git commit -m "feat: add lodash composable with tree-shaking"

git add apps/game/plugins/gtag.client.ts
git commit -m "feat: add custom GA4 plugin"

git add apps/game/nuxt.config.ts
git commit -m "chore: enhance PWA caching strategies"
```

**Bad Practice:**

```bash
# Don't do this - too many unrelated changes
git add .
git commit -m "update stuff"
```

---

## Agent Workflow Checklist

After **EVERY** significant change, agents MUST:

### 1. **Validate Changes**

```bash
# Option 1: Full validation (recommended)
pnpm run workspace:check  # Runs syncpack + typecheck + lint + python checks

# Option 2: Quick validation
pnpm run typecheck  # TypeScript errors?
pnpm run lint:fix   # Auto-fix linting issues
pnpm run format     # Format code
```

**Note:** All commands use Turbo for caching and parallel execution.

### 2. **Verify Tests (if relevant)**

```bash
pnpm run test:unit     # For composable/store changes
pnpm run test:e2e      # For UI/flow changes
```

### 3. **Commit Changes Regularly**

**Commit after EVERY logical change:**

- ✅ After adding a new feature/composable
- ✅ After fixing a bug
- ✅ After refactoring a file
- ✅ After adding/updating tests
- ✅ After documentation updates

**Commit message format:**

```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Examples:**

```bash
git add apps/game/composables/useLodash.ts
git commit -m "feat(composables): add useLodash composable with tree-shaking"

git add apps/game/plugins/gtag.client.ts
git commit -m "feat: add custom GA4 plugin for Nuxt 4"

git add apps/game/nuxt.config.ts
git commit -m "chore: enhance PWA caching strategies"
```

<function_calls>
<invoke name="create">
<parameter name="file_text"># AI Agent Workflow & Guidelines

This document defines the workflow and best practices for AI agents (GitHub Copilot, Claude, Cursor, etc.) working on the Riddle Rush codebase.

## Table of Contents

- [Core Workflow](#core-workflow)
- [Change Validation Checklist](#change-validation-checklist)
- [Commit Strategy](#commit-strategy)
- [Task Breakdown Guidelines](#task-breakdown-guidelines)
- [Quality Gates](#quality-gates)
- [Common Workflows](#common-workflows)

---

## Core Principles

### 1. **Validate After Every Change**

After **ANY** code change, always run:

```bash
pnpm run typecheck && pnpm run lint:fix && pnpm run format
```

### 2. **Commit Frequently**

- Commit after each logical unit of work (not at the end of session)
- Use Conventional Commits format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Aim for commits every 10-20 minutes of work

### 3. **Test Before Commit**

Always run before committing:

```bash
pnpm run workspace:check  # Runs syncpack, typecheck, and lint
```

---

## Agent Workflow

### Pre-Work Checklist

```bash
# 1. Pull latest changes
git pull origin main

# 2. Check current status
pnpm run workspace:check

# 3. Create feature branch (if applicable)
git checkout -b feature/your-feature-name
```

### During Development

#### After ANY file change:

```bash
# 1. Run quality checks
pnpm run typecheck
pnpm run lint:fix

# 2. If checks pass, commit immediately
git add .
git commit -m "feat: descriptive message"

# 3. Continue work
```

#### **Commit Frequency Guidelines:**

- ✅ Commit after each logical unit of work
- ✅ After fixing lint/type errors
- ✅ After adding a new feature/function
- ✅ After refactoring a component
- ✅ Before switching context
- ❌ Don't wait until "everything is perfect"

### **Required Checks Before Commit:**

```bash
# Always run before committing
pnpm run typecheck
pnpm run lint
pnpm run format

# Or use the combined command
pnpm run workspace:check
```

### **Workflow Template:**

```bash
# 1. Make your changes
# 2. Run checks
pnpm run workspace:check  # Includes typecheck + lint + syncpack

# 3. If checks pass, stage changes
git add .

# 4. Commit with conventional commit message
git commit -m "feat: add new feature"

# 5. If checks fail, fix and try again
pnpm run lint:fix
pnpm run format
```

## Agent Workflow Integration

For AI agents working on this repository:

1. **After ANY code change**: Run `pnpm run workspace:check` (syncpack + typecheck + lint)
2. **Commit frequency**: Commit after every logical change (not just at the end)
3. **Commit message format**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
4. **Pre-commit checks**: Husky runs linting automatically via lint-staged

### Agent Workflow Template

```bash
# 1. Make changes to code
# 2. Run quality checks
pnpm run workspace:check  # Or: pnpm run typecheck && pnpm run lint
# 3. If checks pass, commit immediately
git add .
git commit -m "feat: description of change"
# 4. Continue with next task
```

### Quick Commands for Agents

```bash
# After any code change:
pnpm run workspace:check  # Runs syncpack + typecheck + lint

# Or individually:
pnpm run typecheck        # TypeScript checks
pnpm run lint:fix          # Auto-fix linting issues
pnpm run format            # Format code

# Test changes:
pnpm run test:unit         # Run unit tests
pnpm --filter @riddle-rush/game test:unit  # Game tests only

# Commit frequently with conventional commits:
git add .
git commit -m "feat: add new feature"
git commit -m "fix: resolve type error"
git commit -m "chore: update dependencies"
```

Now let me create a comprehensive workflow document:

<function_calls>
<invoke name="create">
<parameter name="file_text"># Agent Workflow Guidelines

This document defines the standard workflow for AI agents working on this codebase. Following these guidelines ensures code quality, proper testing, and a clean commit history.

---

## Table of Contents

- [Core Principles](#core-principles)
- [Standard Workflow](#standard-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Quality Checks](#quality-checks)
- [Example Workflows](#example-workflows)
- [Troubleshooting](#troubleshooting)

---

## Core Principles

### 1. **Small, Focused Changes**

- Make incremental changes, not sweeping refactors
- One logical change per commit
- Easier to review, test, and rollback if needed

### 2. **Commit Early, Commit Often**

- Commit after completing each logical unit of work
- Don't wait until everything is perfect
- Target: **1-3 commits per major task**

### 3. **Always Verify Before Committing**

- Run quality checks after **every change**
- Fix issues immediately
- Never commit broken code

### 4. **Clear Communication**

- Use conventional commit messages
- Update documentation with code changes
- Leave TODO comments for future work

---

## Standard Workflow

### Step 1: Plan the Change

Before making any changes:

```bash
# Check current status
git status
git log --oneline -5

# Pull latest changes
git pull origin main
```

**Actions:**

- Review existing code
- Identify affected files
- Plan commit boundaries

### Step 2: Make Changes

Focus on **one logical change** at a time:

- ✅ Fix a single bug
- ✅ Add one feature
- ✅ Refactor one module
- ❌ Fix bug + add feature + refactor (too much!)

### Step 3: Run Quality Checks

**REQUIRED after every change:**

```bash
# Run all checks (recommended)
pnpm run workspace:check

# Or run individually:
pnpm run typecheck    # TypeScript validation
pnpm run lint         # ESLint checks
pnpm run format       # Prettier formatting
pnpm run test:unit    # Unit tests (if affected)
```

**Fix any errors before proceeding!**

### Step 4: Stage & Review Changes

```bash
# See what changed
git status
git diff

# Stage specific files
git add <file1> <file2>

# Or stage all changes
git add .

# Review staged changes
git diff --staged
```

### Step 5: Commit

```bash
# Commit with conventional message
git commit -m "feat: add color mode toggle"

# Or use interactive mode for longer messages
git commit
```

See [Commit Guidelines](#commit-guidelines) below.

### Step 6: Push Regularly

Don't wait until the end of the day:

```bash
# Push after each commit or every 2-3 commits
git push origin <branch-name>
```

**Benefits:**

- Backup your work
- Enable collaboration
- Trigger CI/CD checks

---

## Commit Guidelines

### Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Commit Types

| Type       | Description                | Example                                        |
| ---------- | -------------------------- | ---------------------------------------------- |
| `feat`     | New feature                | `feat: add fortune wheel animation`            |
| `fix`      | Bug fix                    | `fix: resolve IndexedDB race condition`        |
| `docs`     | Documentation only         | `docs: update plugin configuration guide`      |
| `style`    | Formatting, no code change | `style: format composables with prettier`      |
| `refactor` | Code restructuring         | `refactor: extract validation logic to helper` |
| `test`     | Adding/updating tests      | `test: add unit tests for useLodash`           |
| `chore`    | Maintenance tasks          | `chore: update dependencies`                   |
| `perf`     | Performance improvement    | `perf: optimize image caching strategy`        |
| `ci`       | CI/CD changes              | `ci: add typecheck to workflow`                |
| `build`    | Build system changes       | `build: configure vite manual chunks`          |

### Commit Scope (Optional)

Indicates the area affected:

- `game` - Game app changes
- `docs` - Documentation app
- `config` - Shared config package
- `types` - Type definitions
- `ci` - CI/CD pipeline
- `deps` - Dependencies

**Examples:**

```bash
git commit -m "feat(game): add dark mode support"
git commit -m "fix(types): correct GameSession interface"
git commit -m "docs(plugins): document lodash composable"
git commit -m "chore(deps): update vite to 7.3.0"
```

### Good Commit Messages

✅ **Good:**

```
feat: add lodash composable with tree-shaking
fix: prevent duplicate game sessions in IndexedDB
docs: create agent workflow guidelines
refactor: simplify analytics event tracking
```

❌ **Bad:**

```
update stuff
fix bug
wip
changes
```

### When to Commit

**Commit after:**

- ✅ Completing a single feature/fix
- ✅ Adding a new file/component
- ✅ Refactoring one module
- ✅ Fixing linting/type errors
- ✅ Updating documentation

**Commit frequency:**

- 🎯 **Small task**: 1-2 commits
- 🎯 **Medium task**: 3-5 commits
- 🎯 **Large task**: 5-10 commits

---

## Quality Checks

### Pre-Commit Checklist

Before **every commit**, ensure:

- [ ] TypeScript compiles without errors
- [ ] ESLint passes (or autofixed)
- [ ] Code is formatted with Prettier
- [ ] Relevant tests pass
- [ ] No console.log statements (use useLogger)
- [ ] Documentation updated if needed

### Quick Check Commands

```bash
# Fastest - individual package
cd apps/game
pnpm run typecheck
pnpm run lint

# Comprehensive - all packages
pnpm run workspace:check

# Auto-fix issues
pnpm run lint:fix
pnpm run format
```

### Handling Failed Checks

**TypeScript Errors:**

```bash
# View errors
pnpm run typecheck

# Fix type issues, then verify
pnpm run typecheck
```

**Lint Errors:**

```bash
# Auto-fix most issues
pnpm run lint:fix

# Manual fix for remaining issues
pnpm run lint
```

**Test Failures:**

```bash
# Run affected tests
pnpm run test:unit

# Fix issues, re-run
pnpm run test:unit
```

**If checks fail:**

1. Read error messages carefully
2. Fix the issues
3. Re-run checks
4. Only commit when everything passes ✅

---

## Example Workflows

### Example 1: Adding a New Feature

```bash
# 1. Pull latest code
git pull origin main

# 2. Create feature branch (optional)
git checkout -b feat/color-mode-toggle

# 3. Make changes to add color mode
# - Edit components/ColorModeToggle.vue
# - Update composables/useColorMode.ts

# 4. Run quality checks
pnpm run workspace:check

# 5. Fix any issues
pnpm run lint:fix
pnpm run format

# 6. Re-check
pnpm run typecheck

# 7. Stage and commit
git add components/ColorModeToggle.vue composables/useColorMode.ts
git commit -m "feat: add color mode toggle component"

# 8. Push
git push origin feat/color-mode-toggle
```

### Example 2: Fixing Multiple Issues

```bash
# Fix bug #1 - Form validation
# 1. Edit composables/useForm.ts
# 2. Run checks
pnpm run typecheck && pnpm run lint
# 3. Commit
git add composables/useForm.ts
git commit -m "fix: correct email validation regex"
git push

# Fix bug #2 - Navigation issue
# 1. Edit composables/useNavigation.ts
# 2. Run checks
pnpm run typecheck && pnpm run lint
# 3. Commit
git add composables/useNavigation.ts
git commit -m "fix: handle undefined gameId in navigation"
git push
```

### Example 3: Refactoring with Tests

```bash
# 1. Refactor code
# Edit: composables/useAnalytics.ts

# 2. Update tests
# Edit: tests/unit/use-analytics.spec.ts

# 3. Run tests
pnpm run test:unit -- use-analytics

# 4. Run all checks
pnpm run workspace:check

# 5. Commit code and tests together
git add composables/useAnalytics.ts tests/unit/use-analytics.spec.ts
git commit -m "refactor: simplify analytics event tracking

- Extract common logic to helper function
- Add tests for new helper
- Update existing tests"

# 6. Push
git push
```

### Example 4: Documentation Update

```bash
# 1. Update docs after code change
# Edit: docs/PLUGINS.md

# 2. Format docs
pnpm run format

# 3. Commit separately
git add docs/PLUGINS.md
git commit -m "docs: document lodash composable usage"

# 4. Push
git push
```

---

## Troubleshooting

### Issue: "Too many changes, don't know what to commit"

**Solution:** Use `git add -p` for interactive staging:

```bash
git add -p composables/useForm.ts
# Choose which hunks to stage (y/n/s)
```

### Issue: "Forgot to run checks before committing"

**Solution:** Amend the commit:

```bash
# Run checks
pnpm run workspace:check

# Fix issues
pnpm run lint:fix

# Amend previous commit
git add .
git commit --amend --no-edit
```

### Issue: "Need to split a large commit"

**Solution:** Use interactive rebase:

```bash
# Reset last commit but keep changes
git reset HEAD~1

# Stage and commit in smaller chunks
git add file1.ts
git commit -m "feat: add feature part 1"

git add file2.ts
git commit -m "feat: add feature part 2"
```

### Issue: "Committed broken code"

**Solution:** Fix immediately:

```bash
# Fix the issues
# Run checks
pnpm run workspace:check

# Commit fix
git add .
git commit -m "fix: resolve type errors from previous commit"
```

### Issue: "Checks take too long"

**Solution:** Run scoped checks:

```bash
# Check only affected package
cd apps/game
pnpm run typecheck
pnpm run lint

# Or use turbo filters
pnpm run typecheck --filter=@riddle-rush/game
```

---

## Workflow Automation

### Pre-commit Hooks (Husky)

Already configured in `.husky/pre-commit`:

- Runs lint-staged on modified files
- Validates commit message format
- Prevents committing with errors

### Lint-Staged Configuration

See `.lintstagedrc.json`:

```json
{
  "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml}": ["prettier --write"]
}
```

### CI/CD Integration

After pushing, CI/CD automatically runs:

- Full workspace typecheck
- Full workspace lint
- All unit tests
- E2E tests (on main branch)
- Build verification

---

## Quick Reference Card

```bash
# 📝 Standard Flow
git pull                      # 1. Pull latest
# Make changes                # 2. Edit files
pnpm run workspace:check      # 3. Verify quality
git add .                     # 4. Stage changes
git commit -m "feat: ..."     # 5. Commit
git push                      # 6. Push

# 🔍 Quality Checks
pnpm run typecheck           # Type safety
pnpm run lint                # Code quality
pnpm run lint:fix            # Auto-fix lint
pnpm run format              # Format code
pnpm run test:unit           # Run tests

# 📦 Commit Types
feat:     New feature
fix:      Bug fix
docs:     Documentation
refactor: Code restructuring
test:     Test changes
chore:    Maintenance
perf:     Performance
style:    Formatting

# 🎯 Commit Frequency
Small task:   1-2 commits
Medium task:  3-5 commits
Large task:   5-10 commits
```

---

## Checklist for Agents

Before claiming a task is complete:

- [ ] All changes tested locally
- [ ] TypeScript passes (`pnpm run typecheck`)
- [ ] ESLint passes (`pnpm run lint`)
- [ ] Code formatted (`pnpm run format`)
- [ ] Relevant tests updated
- [ ] Documentation updated
- [ ] Multiple focused commits made
- [ ] All commits pushed
- [ ] No broken code committed
- [ ] Conventional commit messages used

---

**Remember:** Quality > Speed. Take time to verify each change!

**Last Updated:** January 2026

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
