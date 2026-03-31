# CI/CD Setup Guide

This guide explains how to set up the CI/CD pipeline for the Riddle Rush monorepo.

## Table of Contents

- [Required Secrets](#required-secrets)
- [Required Variables](#required-variables)
- [Workflow Overview](#workflow-overview)
- [Setup Instructions](#setup-instructions)
- [Troubleshooting](#troubleshooting)

## Required Secrets

The CI/CD pipeline requires the following secrets to be configured in your GitHub repository settings:

### Essential Secrets

| Secret Name    | Description                           | Required    | Example Format     |
| -------------- | ------------------------------------- | ----------- | ------------------ |
| `VERCEL_TOKEN` | Vercel API token for deployments      | ✅ Yes      | `vercel_abc123...` |
| `TURBO_TOKEN`  | Turborepo remote caching token        | ⚠️ Optional | `turbo_abc123...`  |
| `GITHUB_TOKEN` | GitHub token (automatically provided) | ✅ Yes      | `ghp_abc123...`    |

### Optional Secrets (for advanced features)

| Secret Name             | Description                                  | Required | Example Format    |
| ----------------------- | -------------------------------------------- | -------- | ----------------- |
| `AWS_ACCESS_KEY_ID`     | AWS access key for S3/CloudFront deployments | ❌ No    | `AKIA...`         |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key                               | ❌ No    | `abc123...`       |
| `AWS_S3_BUCKET`         | S3 bucket name                               | ❌ No    | `my-app-bucket`   |
| `AWS_CLOUDFRONT_ID`     | CloudFront distribution ID                   | ❌ No    | `E123...`         |
| `SONAR_TOKEN`           | SonarCloud token for code quality            | ❌ No    | `sonar_abc123...` |
| `SNYK_TOKEN`            | Snyk token for vulnerability scanning        | ❌ No    | `snyk_abc123...`  |

## Required Variables

Configure these variables in your GitHub repository settings under "Settings > Environments":

| Variable Name | Description         | Default Value    | Required |
| ------------- | ------------------- | ---------------- | -------- |
| `TURBO_TEAM`  | Turborepo team name | `your-team-name` | ❌ No    |

## Workflow Overview

The CI/CD pipeline consists of the following stages:

### 1. Quality Gates (Fast Feedback)

- **Dependency version check** (`syncpack:check`)
- **TypeScript type checking** (`typecheck`)
- **ESLint** (`lint`)
- **Code formatting check** (`format:check`)

### 2. Unit Tests (Parallel Execution)

- Runs on multiple Node.js versions (18, 20, 22)
- Runs on multiple operating systems (Ubuntu, Windows)
- Uploads test results and coverage reports

### 3. Build Artifacts

- Builds all packages using Turbo
- Caches build outputs for faster subsequent runs
- Uploads build artifacts

### 4. Security Scanning

- Runs `pnpm audit` for dependency vulnerabilities
- Placeholder for additional security tools (SAST, DAST)

### 5. Deployment

- **Vercel Deployment**: Deploys to production, development, or preview environments
- **Documentation**: Deploys to GitHub Pages (main branch only)

### 6. Summary & Reporting

- Generates comprehensive pipeline summary
- Provides deployment URLs and artifact links
- Shows performance metrics

## Setup Instructions

### Step 1: Configure GitHub Secrets

1. Go to your repository **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Add each required secret from the table above

### Step 2: Configure GitHub Variables

1. Go to **Settings > Secrets and variables > Actions > Variables**
2. Click **New variable**
3. Add `TURBO_TEAM` with your Turborepo team name

### Step 3: Configure Vercel

1. Create a Vercel account and project
2. Generate a Vercel token:
   - Go to Vercel Dashboard > Account Settings > Tokens
   - Create a new token with appropriate permissions
3. Add the token as `VERCEL_TOKEN` secret in GitHub

### Step 4: Enable GitHub Pages (Optional)

1. Go to **Settings > Pages**
2. Select **GitHub Actions** as the source
3. The documentation will be deployed automatically on main branch pushes

## Environment Configuration

The pipeline supports three environments:

| Environment     | Trigger                   | Deployment Target |
| --------------- | ------------------------- | ----------------- |
| **Production**  | `main` branch push        | Vercel Production |
| **Development** | `development` branch push | Vercel Preview    |
| **Preview**     | Pull Requests             | Vercel Preview    |

## Caching Strategy

The pipeline uses aggressive caching to optimize performance:

- **pnpm store cache**: Caches Node.js dependencies
- **Build output cache**: Caches compiled artifacts
- **Turbo cache**: Remote caching for Turborepo (if configured)

## Parallelization

- **Unit tests**: Run on multiple Node.js versions and OS combinations
- **Matrix strategy**: 2 Node.js versions × 2 OS = 4 parallel jobs
- **Fail-fast**: Disabled to allow all test combinations to complete

## Performance Optimization Tips

1. **Cache effectiveness**: Monitor cache hit/miss ratios in job logs
2. **Test sharding**: Consider splitting tests further for large test suites
3. **Self-hosted runners**: Use for faster execution of resource-intensive jobs
4. **Turbo remote caching**: Enable for distributed build caching

## Troubleshooting

### Common Issues

#### 1. Cache not working

- **Solution**: Clear cache and try again
- **Command**: `actions/cache@v4` will automatically handle cache invalidation

#### 2. Build failures

- **Check**: Run `pnpm run build:all` locally
- **Solution**: Fix build errors and commit changes

#### 3. Deployment failures

- **Check**: Verify Vercel token permissions
- **Solution**: Regenerate token with proper permissions

#### 4. Test failures

- **Check**: Run `pnpm run test:unit` locally
- **Solution**: Fix failing tests or update test expectations

### Debugging

Add `ACT=debug` environment variable to any job for verbose logging:

```yaml
env:
  ACT: debug
```

### Manual Triggers

You can manually trigger the pipeline:

1. Go to **Actions** tab
2. Select **Optimized CI/CD Pipeline**
3. Click **Run workflow**
4. Select branch and run

## Workflow Files

- **Main workflow**: `.github/workflows/optimized-ci-cd.yml`
- **Comprehensive workflow**: `.github/workflows/comprehensive-ci-cd.yml`
- **Legacy workflows**: `.github/workflows/tests.yml`, `.github/workflows/deploy.yml`

## Migration Guide

If you're migrating from the legacy workflows:

1. **Disable old workflows**: Rename or delete old workflow files
2. **Test new workflow**: Run on a feature branch first
3. **Monitor performance**: Compare execution times
4. **Gradual rollout**: Enable for main branch after validation

## Best Practices

1. **Keep secrets secure**: Never commit secrets to repository
2. **Monitor pipeline**: Set up notifications for failures
3. **Regular maintenance**: Update dependencies and workflow versions
4. **Document changes**: Update this guide when modifying the pipeline
5. **Performance tuning**: Regularly review and optimize caching strategies

## Support

For issues with the CI/CD pipeline:

1. Check GitHub Actions documentation
2. Review workflow logs for detailed error messages
3. Consult the Turborepo and Vercel documentation
4. Open an issue in this repository

---

**Last Updated**: 2024
**Maintainer**: CI/CD Team
