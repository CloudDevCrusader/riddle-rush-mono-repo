# Monorepo CI/CD Optimization

This document explains the monorepo-aware CI/CD optimizations implemented in the GitLab pipeline.

## Overview

The project is structured as a monorepo with multiple apps and packages:

```
riddle-rush-monorepo/
├── apps/
│   ├── game/          # Main PWA game application
│   └── docs/          # Documentation site (Nuxt Content)
└── packages/
    ├── config/        # Shared Vite/build configs
    ├── shared/        # Shared utilities
    └── types/         # Shared TypeScript types
```

**Problem**: Previously, every commit triggered builds and tests for ALL apps, even when changes only affected one app.

**Solution**: Implement change detection rules in GitLab CI to only run jobs when relevant files change.

## Change Detection Strategy

### Game App Jobs

These jobs run when files in the game app or shared packages change:

- **`test`** - Unit tests for game app
- **`build`** - Game app build
- **`test:e2e:local`** - E2E tests for game app
- **`deploy:aws`** - AWS deployment (tags only)
- **`verify:e2e:aws`** - E2E verification of AWS deployment

**Trigger patterns**:

```yaml
changes:
  - apps/game/**/* # Game app source code
  - packages/**/* # Shared packages
  - pnpm-lock.yaml # Dependency changes
  - package.json # Root package config
  - .gitlab-ci.yml # CI config changes
  - scripts/ci-*.sh # CI scripts
```

### Docs App Jobs

These jobs run when documentation or docs app files change:

- **`build:docs`** - Documentation site build
- **`pages`** - GitLab Pages deployment

**Trigger patterns**:

```yaml
changes:
  - apps/docs/**/* # Docs app source code
  - docs/**/* # Documentation markdown files
  - CLAUDE.md # Project documentation
  - README.md # Main readme
```

### Always-Run Jobs

Some jobs always run regardless of changes:

- **`sonarcloud-check`** - Code quality (merge requests only)
- **Manual triggers** - All jobs available via web UI
- **Tags** - Full pipeline on version tags

## Examples

### Scenario 1: Game Code Change

**Change**: Update `apps/game/pages/index.vue`

**Jobs that run**:

- ✅ `test` - Unit tests run
- ✅ `build` - Game build runs
- ✅ `test:e2e:local` - Available manually
- ❌ `build:docs` - Skipped (no docs changes)
- ❌ `pages` - Skipped (no docs changes)

**Time saved**: ~2-3 minutes (skipped docs build)

### Scenario 2: Documentation Update

**Change**: Update `docs/AWS-DEPLOYMENT.md`

**Jobs that run**:

- ❌ `test` - Skipped (no game changes)
- ❌ `build` - Skipped (no game changes)
- ✅ `build:docs` - Docs build runs
- ✅ `pages` - GitLab Pages deployment runs

**Time saved**: ~3-4 minutes (skipped game tests and build)

### Scenario 3: Shared Package Update

**Change**: Update `packages/types/game.ts`

**Jobs that run**:

- ✅ `test` - Unit tests run (shared types changed)
- ✅ `build` - Game build runs
- ❌ `build:docs` - Skipped (docs not affected)

### Scenario 4: Version Tag

**Change**: Create tag `v1.2.0`

**Jobs that run**:

- ✅ ALL jobs run (full pipeline for releases)
- ✅ `deploy:aws` - AWS deployment triggered
- ✅ `verify:e2e:aws` - Available manually

## Implementation Details

### Rules vs. Only/Except

**Before** (old approach):

```yaml
test:
  only:
    - main
    - merge_requests
    - tags
```

**After** (new approach with change detection):

```yaml
test:
  rules:
    - if: $CI_COMMIT_TAG
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      changes:
        - apps/game/**/*
        - packages/**/*
    - if: $CI_COMMIT_BRANCH == "main"
      changes:
        - apps/game/**/*
        - packages/**/*
```

### Benefits of Rules

1. **Fine-grained control** - Different behavior based on trigger + changes
2. **Conditional execution** - Skip unnecessary jobs
3. **Manual overrides** - Always available via web UI
4. **Clear intent** - Self-documenting pipeline logic

## Performance Impact

### Before Optimization

**Full pipeline on every commit** (docs update example):

```
Stage        Job              Duration
-----        ---              --------
test         test             2m 30s
build        build            3m 15s
build        build:docs       2m 45s
deploy       pages            0m 15s
-----        ---              --------
TOTAL                         8m 45s
```

### After Optimization

**Smart pipeline** (docs update example):

```
Stage        Job              Duration    Status
-----        ---              --------    ------
test         test             -           ⏭️  SKIPPED
build        build            -           ⏭️  SKIPPED
build        build:docs       2m 45s      ✅ RAN
deploy       pages            0m 15s      ✅ RAN
-----        ---              --------
TOTAL                         3m 00s      💰 66% faster
```

**Savings**: ~5-6 minutes per docs-only commit

## Best Practices

### 1. Keep Patterns Specific

✅ **Good**:

```yaml
changes:
  - apps/game/**/*
  - packages/types/**/*
```

❌ **Bad**:

```yaml
changes:
  - '**/*' # Too broad, defeats purpose
```

### 2. Include Related Files

✅ **Good**:

```yaml
changes:
  - apps/game/**/*
  - packages/**/* # Shared dependencies
  - pnpm-lock.yaml # Dependency updates
  - .gitlab-ci.yml # CI changes
```

❌ **Bad**:

```yaml
changes:
  - apps/game/**/* # Misses shared package changes
```

### 3. Provide Manual Overrides

✅ **Good**:

```yaml
rules:
  - if: $CI_PIPELINE_SOURCE == "web" # Manual trigger
  - if: $CI_COMMIT_BRANCH == "main"
    changes:
      - apps/game/**/*
```

❌ **Bad**:

```yaml
rules:
  - if: $CI_COMMIT_BRANCH == "main"
    changes:
      - apps/game/**/*
  # No manual trigger - can't force run if needed
```

### 4. Test Critical Paths Fully

Always run full pipeline on:

- Version tags (releases)
- Manual triggers
- Critical branches (main)

## Debugging

### Check Why a Job Didn't Run

1. Go to **CI/CD → Pipelines**
2. Click on the pipeline
3. Jobs with 🔵 blue dot were skipped
4. Click job → "Why was this job skipped?"

### Force Run All Jobs

**Option 1**: Manual trigger via web UI

1. **CI/CD → Pipelines**
2. **Run Pipeline**
3. Select branch
4. All jobs available

**Option 2**: Create a version tag

```bash
git tag v1.2.3
git push --tags
```

### Test Change Detection Locally

GitLab doesn't provide local testing for rules, but you can simulate:

```bash
# Simulate game changes
git diff --name-only HEAD~1 | grep "apps/game/"

# Simulate docs changes
git diff --name-only HEAD~1 | grep -E "(apps/docs/|docs/|CLAUDE.md)"
```

## Troubleshooting

### Issue: Job skipped when it should run

**Cause**: Change pattern doesn't match modified files

**Solution**: Update `changes:` pattern to include the files

```yaml
changes:
  - apps/game/**/*
  - apps/game/.env.example # Add specific files if needed
```

### Issue: Job runs when it shouldn't

**Cause**: Pattern too broad or multiple rules matching

**Solution**: Make patterns more specific

```yaml
# Instead of:
changes:
  - "**/*"  # Matches everything

# Use:
changes:
  - apps/game/**/*  # Only game files
```

### Issue: All jobs always skipped

**Cause**: Rules don't match any trigger condition

**Solution**: Add fallback rules

```yaml
rules:
  - if: $CI_PIPELINE_SOURCE == "web" # Always allow manual
  - if: $CI_COMMIT_TAG # Always run on tags
  - if: $CI_COMMIT_BRANCH == "main"
    changes:
      - apps/game/**/*
```

## Future Improvements

- [ ] Add change detection for infrastructure/\* (Terraform)
- [ ] Parallel job execution for independent apps
- [ ] Cache dependencies per app (not just globally)
- [ ] Dynamic pipeline generation based on changes
- [ ] Turbo/Nx integration for even smarter caching

## References

- [GitLab CI/CD Rules](https://docs.gitlab.com/ee/ci/yaml/#rules)
- [GitLab Rules:Changes](https://docs.gitlab.com/ee/ci/yaml/#ruleschanges)
- [Monorepo CI/CD Best Practices](https://docs.gitlab.com/ee/ci/pipelines/pipeline_efficiency.html)
