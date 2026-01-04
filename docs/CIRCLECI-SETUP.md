# CircleCI Setup Guide

This guide explains how to set up and use CircleCI for the Riddle Rush Nuxt PWA monorepo.

## Overview

CircleCI configuration (`.circleci/config.yml`) mirrors the GitLab CI pipeline structure with the following stages:

1. **Test** - Unit tests (Vitest)
2. **Quality** - SonarCloud code analysis
3. **Build** - Build game app and documentation
4. **Deploy** - AWS S3 + CloudFront deployment
5. **Verify** - E2E tests against deployed sites

## Initial Setup

### 1. Connect Repository to CircleCI

1. Go to [CircleCI](https://circleci.com/)
2. Sign in with your GitHub/GitLab account
3. Click "Add Projects"
4. Find and select your repository
5. Click "Set Up Project"
6. Choose "Use existing config" (since `.circleci/config.yml` already exists)

### 2. Configure Environment Variables

Go to **Project Settings → Environment Variables** and add:

#### Required for AWS Deployment

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (mark as secret)

#### Optional

- `GOOGLE_ANALYTICS_ID` - For analytics tracking
- `SONAR_TOKEN` - For SonarCloud analysis (if using)
- `SONAR_PROJECT_KEY` - SonarCloud project key
- `SONAR_ORGANIZATION` - SonarCloud organization

### 3. Configure Manual Approvals (Recommended)

For production deployments, configure manual approvals:

1. Go to **Project Settings → Advanced Settings**
2. Enable "Manual approval required" for:
   - `deploy-aws-prod` job
   - `verify-e2e-aws-prod` job

For development deployments, you can optionally enable manual approvals for:

- `deploy-aws-dev` job
- `verify-e2e-aws-dev` job

## Workflows

### test-and-build

Runs on all branches and pull requests:

- **test** - Unit tests
- **sonarcloud-check** - Code quality (main branches only)
- **build** - Build game app (main/development/staging)
- **build-docs** - Build documentation (main only)
- **test-e2e-local** - E2E tests against local build (optional)

### deploy-dev

Runs on `development` branch:

1. **test** - Run unit tests
2. **build** - Build game app
3. **deploy-aws-dev** - Deploy to AWS development
4. **verify-e2e-aws-dev** - Verify deployment with E2E tests

### deploy-prod

Runs on `main` branch or version tags (`v*`):

1. **test** - Run unit tests
2. **build** - Build game app
3. **deploy-aws-prod** - Deploy to AWS production (manual approval recommended)
4. **verify-e2e-aws-prod** - Verify deployment with E2E tests (manual approval recommended)

## Job Details

### test

- **Image**: `cimg/node:20.19.0`
- **Steps**: Install dependencies, run unit tests
- **Artifacts**: Test coverage reports

### sonarcloud-check

- **Image**: `sonarsource/sonar-scanner-cli:latest`
- **Steps**: Run SonarCloud analysis
- **Runs on**: main, development, staging branches

### build

- **Image**: `cimg/node:20.19.0`
- **Steps**: Install dependencies, build game app
- **Artifacts**: Built application in `apps/game/.output`

### build-docs

- **Image**: `cimg/node:20.19.0`
- **Steps**: Build documentation site
- **Artifacts**: Generated docs in `public/`
- **Runs on**: main branch only

### deploy-aws-dev / deploy-aws-prod

- **Image**: `cimg/node:20.19.0`
- **Steps**:
  1. Setup pnpm and install dependencies
  2. Install AWS CLI and Terraform
  3. Get Terraform outputs for environment
  4. Deploy to AWS using `aws-deploy.sh`
- **Requires**: `build` job to complete
- **Environment Variables**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

### test-e2e-local

- **Image**: `mcr.microsoft.com/playwright:v1.57.0-noble`
- **Steps**: Run E2E tests against local build
- **Artifacts**: Test results and Playwright reports

### verify-e2e-aws-dev / verify-e2e-aws-prod

- **Image**: `mcr.microsoft.com/playwright:v1.57.0-noble`
- **Steps**:
  1. Get CloudFront domain from Terraform
  2. Wait 60 seconds for CloudFront propagation
  3. Run critical E2E tests against deployed site
- **Requires**: Corresponding deployment job
- **Artifacts**: Test results and Playwright reports

## Caching

CircleCI automatically caches:

- **Dependencies**: `node_modules` and `~/.pnpm-store` (keyed by `pnpm-lock.yaml` checksum)
- **SonarCloud**: `.sonar/cache` (keyed by `sonar-project.properties` checksum)

## Branch Filters

### Automatic Runs

- **All branches**: `test` job runs automatically
- **main/development/staging**: Full test and build pipeline
- **main**: Documentation build
- **development**: Development deployment workflow
- **main + tags**: Production deployment workflow

### Manual Triggers

Some jobs can be triggered manually via CircleCI UI:

- E2E tests (`test-e2e-local`)
- Deployment jobs (if manual approval is configured)
- Verification jobs (if manual approval is configured)

## Comparison with GitLab CI

| Feature              | GitLab CI           | CircleCI                |
| -------------------- | ------------------- | ----------------------- |
| Change Detection     | ✅ Automatic        | ⚠️ Manual (via filters) |
| Manual Approval      | ✅ Built-in         | ⚠️ UI configuration     |
| Monorepo Support     | ✅ Change detection | ⚠️ Basic filtering      |
| Custom Docker Images | ✅ Registry support | ✅ Public images        |
| Artifacts            | ✅ 7-30 days        | ✅ Configurable         |
| Parallel Jobs        | ✅ Yes              | ✅ Yes                  |

## Troubleshooting

### Build Fails with "pnpm not found"

The `setup-pnpm` command should handle this automatically. If issues persist:

1. Check that `packageManager` field in `package.json` is set correctly
2. Verify corepack is enabled in the Docker image

### AWS Deployment Fails

1. **Check Environment Variables**: Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
2. **Check Terraform Outputs**: Verify Terraform is initialized and outputs are available
3. **Check Permissions**: Ensure AWS credentials have S3 and CloudFront permissions

### E2E Tests Fail on Deployed Site

1. **Wait Time**: Tests wait 60 seconds for CloudFront propagation - may need more time
2. **Base URL**: Verify `BASE_URL` environment variable is set correctly
3. **Network Issues**: Check if deployed site is accessible from CircleCI runners

### SonarCloud Analysis Fails

1. **Check Token**: Ensure `SONAR_TOKEN` is set in environment variables
2. **Check Project Key**: Verify `SONAR_PROJECT_KEY` and `SONAR_ORGANIZATION` are correct
3. **Check Config**: Verify `sonar-project.properties` exists and is configured

## Best Practices

1. **Use Manual Approvals**: Enable manual approvals for production deployments
2. **Monitor Workflows**: Set up notifications for failed builds
3. **Review Artifacts**: Check test reports and build outputs regularly
4. **Keep Secrets Secure**: Never commit secrets to the repository
5. **Test Locally First**: Run tests locally before pushing to trigger CI

## Related Documentation

- [GitLab CI/CD](.gitlab-ci.yml) - Alternative CI/CD configuration
- [AWS Deployment Guide](AWS-DEPLOYMENT.md) - AWS deployment details
- [Testing Guide](TESTING.md) - Testing documentation
- [Deployment Scripts](DEPLOYMENT-SCRIPTS.md) - Deployment script reference
