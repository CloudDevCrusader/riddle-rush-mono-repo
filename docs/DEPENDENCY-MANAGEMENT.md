# Dependency Management Guide

This guide covers how to manage and upgrade dependencies in the project.

## Overview

The project uses multiple tools for dependency management:
- **npm-check-updates (ncu)** - Check and update dependencies
- **Dependabot** - Automated dependency updates via GitHub
- **Renovate** - Alternative automated dependency updates (if using GitLab)

## Quick Commands

```bash
# Check for outdated dependencies
pnpm run deps:check

# Interactive update (recommended)
pnpm run deps:update

# Update only patch versions (safest)
pnpm run deps:update:patch

# Update only minor versions (recommended)
pnpm run deps:update:minor
```

## Manual Update Process

### 1. Check Outdated Dependencies

```bash
pnpm run deps:check
```

This will:
- Show all outdated packages
- Check for security vulnerabilities
- Provide update commands

### 2. Review Updates

Review the list of outdated packages. Pay special attention to:
- **Major versions** - May include breaking changes
- **Nuxt/Vue packages** - Core framework updates
- **Security updates** - Should be applied immediately

### 3. Update Dependencies

**Interactive Update (Recommended):**
```bash
pnpm run deps:update
```

This opens an interactive prompt where you can:
- Select which packages to update
- Review changes before applying
- Skip packages that might cause issues

**Automatic Update (Minor/Patch only):**
```bash
# Only patch versions (safest)
pnpm run deps:update:patch

# Minor and patch versions (recommended)
pnpm run deps:update:minor
```

### 4. Test After Updates

After updating, always test:

```bash
# Type checking
pnpm run typecheck

# Unit tests
pnpm run test:unit

# Build test
pnpm run generate

# E2E tests (optional but recommended)
pnpm run test:e2e:local
```

### 5. Commit Changes

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: update dependencies"
```

## Automated Updates

### GitHub Dependabot

If using GitHub, Dependabot is configured in `.github/dependabot.yml`:

**Features:**
- Weekly updates (Mondays at 9:00 AM)
- Groups updates by type (production/dev)
- Only minor and patch updates (major requires manual review)
- Creates PRs automatically

**Configuration:**
- Updates: Weekly on Mondays
- Limit: 5 open PRs at a time
- Labels: `dependencies`, `automated`
- Reviewers: Set in config

### Renovate (GitLab/GitHub)

If using Renovate, configuration is in `renovate.json`:

**Features:**
- Groups updates by ecosystem (Nuxt, Vue, Testing)
- Weekly schedule (Mondays before 10 AM)
- Only minor and patch updates
- Requires status checks to pass

**Setup:**
1. Install Renovate app (GitHub) or bot (GitLab)
2. Configuration is automatically read from `renovate.json`
3. PRs are created automatically

## Update Strategy

### Patch Updates (x.x.X)
- **Frequency**: Weekly
- **Risk**: Low
- **Action**: Auto-merge after tests pass

### Minor Updates (x.X.x)
- **Frequency**: Monthly
- **Risk**: Medium
- **Action**: Review changelog, test thoroughly

### Major Updates (X.x.x)
- **Frequency**: As needed
- **Risk**: High
- **Action**: Manual review, migration guide, extensive testing

## Critical Packages

These packages require extra care when updating:

### Core Framework
- `nuxt` - Check migration guides
- `vue` - Check breaking changes
- `@nuxt/*` - Check compatibility

### Build Tools
- `vite` - Check build configuration
- `@vite-pwa/nuxt` - Check PWA config
- `@nuxt/image` - Check image optimization

### Testing
- `@playwright/test` - Check test compatibility
- `vitest` - Check test configuration

## Troubleshooting

### Update Breaks Build

1. **Check changelog** for breaking changes
2. **Revert update**: `git checkout package.json pnpm-lock.yaml`
3. **Update incrementally**: Update one package at a time
4. **Check GitHub issues** for known problems

### Type Errors After Update

1. **Clear cache**: `rm -rf node_modules .nuxt .output`
2. **Reinstall**: `pnpm install`
3. **Regenerate types**: `pnpm run postinstall`
4. **Check TypeScript version** compatibility

### Test Failures After Update

1. **Check test framework changelog**
2. **Update test utilities** if needed
3. **Review test configuration**
4. **Check for deprecated APIs**

## Best Practices

1. **Update Regularly**: Don't let dependencies get too outdated
2. **Test Thoroughly**: Always test after updates
3. **Read Changelogs**: Understand what changed
4. **Update Incrementally**: Major updates one at a time
5. **Keep Lock File**: Always commit `pnpm-lock.yaml`
6. **Document Changes**: Note any breaking changes in commits

## Security Updates

Security updates should be applied immediately:

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically (if possible)
pnpm audit fix

# Update specific vulnerable package
pnpm update <package-name>
```

## Monitoring

### Check Update Status

```bash
# List outdated packages
ncu

# Check specific package
ncu nuxt

# Check with version constraints
ncu --target minor
```

### Review Dependencies

```bash
# List all dependencies
pnpm list

# Check dependency tree
pnpm list --depth=1

# Find why a package is installed
pnpm why <package-name>
```

## CI/CD Integration

Dependency updates are automatically tested in CI:

1. **Dependabot/Renovate** creates PR
2. **CI runs tests** (`test`, `typecheck`, `build`)
3. **PR is reviewed** if tests pass
4. **Merge** after approval

## Resources

- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [Renovate Docs](https://docs.renovatebot.com/)
- [pnpm Docs](https://pnpm.io/)

---

**Last Updated:** 2026-01-02  
**Status:** ✅ Dependency Management Configured

