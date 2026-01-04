# Deployment Scripts Guide

This document describes the deployment scripts available for deploying the Riddle Rush game to different environments.

## Quick Start

```bash
# Deploy to development
pnpm run deploy:dev "fix: update game logic"

# Deploy to staging
pnpm run deploy:staging "test: staging deployment"

# Deploy to production with version
pnpm run deploy:prod 1.2.0
```

## Unified Deployment Script

The main deployment script is `scripts/deploy.sh` which handles all environments:

```bash
# Development
./scripts/deploy.sh dev [commit message]

# Staging
./scripts/deploy.sh staging [commit message]

# Production
./scripts/deploy.sh prod [version]
```

### Examples

```bash
# Development deployment
./scripts/deploy.sh dev "fix: update game logic"
./scripts/deploy.sh development "feat: add new feature"

# Staging deployment
./scripts/deploy.sh staging "test: verify deployment"

# Production deployment
./scripts/deploy.sh prod 1.2.0
./scripts/deploy.sh production 1.3.0-beta
```

## Environment-Specific Scripts

### Development (`scripts/deploy-dev.sh`)

Deploys to the `development` branch for GitLab Pages.

```bash
./scripts/deploy-dev.sh [commit message]
```

**Features:**
- Runs pre-deploy checks (lint, typecheck, tests, build)
- Allows uncommitted changes (stashes temporarily)
- Auto-creates/updates development branch
- Deploys to: `https://djdiox.gitlab.io/riddle-rush-nuxt-pwa/dev`

### Production (`scripts/deploy-prod.sh`)

Deploys to the `main` branch for GitLab Pages production.

```bash
./scripts/deploy-prod.sh [version]
```

**Features:**
- Requires clean working directory (no uncommitted changes)
- Runs all pre-deploy checks
- Optional version tagging (creates git tag)
- Updates package.json version
- Deploys to: `https://djdiox.gitlab.io/riddle-rush-nuxt-pwa`
- Triggers AWS deployment if version tag is provided

**Safety Checks:**
- Warns if not on main/staging branch
- Prevents deployment with uncommitted changes
- Validates version format (semver)

### Staging (`scripts/deploy-staging.sh`)

Deploys to the `staging` branch for GitLab Pages.

```bash
./scripts/deploy-staging.sh [commit message]
```

**Features:**
- Similar to development deployment
- Deploys to: `https://djdiox.gitlab.io/riddle-rush-nuxt-pwa/staging`

## Pre-Deploy Checks

All deployment scripts run the following checks before deploying:

1. **Dependencies**: Installs dependencies with `pnpm install --frozen-lockfile`
2. **Linting**: Runs `pnpm run lint`
3. **Type Checking**: Runs `pnpm run typecheck`
4. **Unit Tests**: Runs `pnpm run test:unit`
5. **Build**: Runs `pnpm run build` (or `pnpm run generate` for static)

If any check fails, deployment is aborted.

## Deployment Flow

### GitLab Pages Deployment

1. **Push to Branch**: Script pushes to target branch (development/staging/main)
2. **CI Pipeline**: GitLab CI automatically:
   - Runs tests
   - Builds the application
   - Deploys to GitLab Pages
3. **Access**: Site available at GitLab Pages URL

### AWS Deployment (Production Only)

When deploying to production with a version tag:

1. **Version Tag**: Script creates git tag (e.g., `v1.2.0`)
2. **CI Pipeline**: GitLab CI detects tag and:
   - Builds the application
   - Deploys to AWS S3 + CloudFront
3. **Access**: Site available at AWS CloudFront URL

## Version Format

Production deployments support semantic versioning:

- **Format**: `X.Y.Z` or `X.Y.Z-prerelease`
- **Examples**: 
  - `1.2.0` (stable release)
  - `1.2.0-beta` (prerelease)
  - `2.0.0-rc.1` (release candidate)

## Environment URLs

| Environment | Branch | URL |
|------------|--------|-----|
| Development | `development` | https://djdiox.gitlab.io/riddle-rush-nuxt-pwa/dev |
| Staging | `staging` | https://djdiox.gitlab.io/riddle-rush-nuxt-pwa/staging |
| Production | `main` | https://djdiox.gitlab.io/riddle-rush-nuxt-pwa |

## Troubleshooting

### "Uncommitted changes detected"

**Development/Staging**: Changes are automatically stashed and restored.

**Production**: You must commit or stash changes manually before deploying.

```bash
# Option 1: Commit changes
git add .
git commit -m "your message"
./scripts/deploy.sh prod 1.2.0

# Option 2: Stash changes
git stash
./scripts/deploy.sh prod 1.2.0
git stash pop
```

### "Invalid version format"

Version must follow semantic versioning (semver):

```bash
# ✅ Valid
./scripts/deploy.sh prod 1.2.0
./scripts/deploy.sh prod 1.2.0-beta

# ❌ Invalid
./scripts/deploy.sh prod 1.2
./scripts/deploy.sh prod v1.2.0
```

### "Tag already exists"

The version tag already exists. Use a different version:

```bash
# Check existing tags
git tag -l

# Use next version
./scripts/deploy.sh prod 1.2.1
```

### Pre-deploy checks fail

Fix the issues before deploying:

```bash
# Run checks manually
pnpm run lint
pnpm run typecheck
pnpm run test:unit
pnpm run build

# Fix issues, then deploy
./scripts/deploy.sh dev "fix: resolved issues"
```

## Best Practices

1. **Always test locally first**: Run `pnpm run generate` and `pnpm run preview` before deploying
2. **Use meaningful commit messages**: Helps track what was deployed
3. **Deploy to dev/staging first**: Test changes before production
4. **Use version tags for production**: Makes it easier to track releases
5. **Monitor the pipeline**: Check GitLab CI/CD pipelines for deployment status
6. **Verify after deployment**: Test the deployed site to ensure it works

## CI/CD Integration

Deployments are automatically handled by GitLab CI/CD:

- **Development**: Deploys on push to `development` branch
- **Staging**: Deploys on push to `staging` branch
- **Production**: Deploys on push to `main` branch
- **AWS**: Deploys on version tags (production only)

See `.gitlab-ci.yml` for full CI/CD configuration.

## Shared Script Library

All deployment and CI scripts use a shared library (`scripts/lib.sh`) that provides common utilities:

### Functions Provided

- **`log()`** - Standard logging output
- **`warn()`** - Warning messages (yellow, to stderr)
- **`die()`** - Error messages with exit (red, to stderr)
- **`require_cmd()`** - Check if a command exists, exit if missing
- **`ensure_repo_root()`** - Change to repository root directory
- **`ensure_pnpm()`** - Ensure pnpm is available via corepack, using version from `package.json` or default (10.26.2)

### Usage

Scripts source the library at the top:

```bash
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
```

This ensures consistent error handling, logging, and environment setup across all scripts.

## Related Scripts

- `scripts/lib.sh` - Shared utility library (used by all scripts)
- `scripts/deploy-common.sh` - Shared deployment functions
- `aws-deploy.sh` - AWS-specific deployment (used by CI)
- `scripts/deploy-with-terraform.sh` - Terraform-based deployment
