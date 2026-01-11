# Agent Workflow Guidelines

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
