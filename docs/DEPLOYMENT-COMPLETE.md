# Deployment Guide

This guide covers all deployment options for Riddle Rush.

## Overview

Riddle Rush uses multiple deployment strategies:

1. **Primary**: GitLab CI → AWS S3 + CloudFront (https://riddlerush.de)
2. **Secondary**: GitHub Actions → Vercel (preview/production)
3. **Documentation**: GitLab Pages (https://djdiox.gitlab.io/riddle-rush-nuxt-pwa)

## Primary Deployment: AWS

### Prerequisites

- AWS credentials configured in GitLab CI variables:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET`
  - `AWS_CLOUDFRONT_ID`
  - `AWS_REGION` (default: eu-central-1)

### Deployment Process

1. Create a version tag: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. GitLab CI automatically:
   - Runs tests
   - Builds the application
   - Deploys to AWS S3
   - Invalidates CloudFront cache

### Manual Deployment

```bash
# Production
export AWS_S3_BUCKET=your-bucket
export AWS_CLOUDFRONT_ID=your-cloudfront-id
export AWS_REGION=eu-central-1
./scripts/aws-deploy.sh production

# Development
export AWS_S3_BUCKET=dev-bucket
export AWS_CLOUDFRONT_ID=dev-cloudfront-id
NODE_ENV=development ./scripts/aws-deploy.sh development
```

### Environments

- **Production**: https://riddlerush.de (main branch + version tags)
- **Development**: https://dev.riddlerush.de (development branch)

## Secondary Deployment: Vercel

### Setup

```bash
# Link project to Vercel
vercel link

# Pull environment variables
pnpm run vercel:env:pull
```

### Deployment Commands

```bash
# Preview deployment
vercel

# Development deployment
STAGE=development vercel

# Production deployment
STAGE=production vercel --prod
```

## Documentation Deployment: GitLab Pages

Documentation is automatically deployed to GitLab Pages when changes are pushed to `main` branch affecting:

- `apps/docs/**/*`
- `docs/**/*`
- `CLAUDE.md`
- `README.md`

URL: https://djdiox.gitlab.io/riddle-rush-nuxt-pwa

## CI/CD Pipelines

### GitLab CI

Location: `.gitlab-ci.yml`

Stages:

1. `test` - Unit tests
2. `quality` - SonarCloud analysis
3. `build` - Build application
4. `deploy` - Deploy to AWS
5. `verify` - E2E tests on deployed site

### GitHub Actions

Location: `.github/workflows/`

Workflows:

- `deploy.yml` - Main deployment
- `tests.yml` - Test automation
- `cleanup-deployments.yml` - Preview cleanup
- Various Gemini workflows for code review

## Troubleshooting

### AWS Deployment Fails

1. Check AWS credentials are set in GitLab CI variables
2. Verify S3 bucket and CloudFront distribution exist
3. Check CloudFront invalidation quota
4. Review deployment logs in GitLab CI

### Vercel Deployment Fails

1. Verify project is linked: `vercel link`
2. Check environment variables: `vercel env ls`
3. Review build logs in Vercel dashboard

### Documentation Not Updating

1. Wait 5-10 minutes for GitLab Pages to rebuild
2. Check GitLab Pages settings in GitLab
3. Review build logs in GitLab CI

## Additional Resources

- AWS Deployment: `docs/deployment/AWS-DEPLOYMENT.md`
- Vercel Deployment: `docs/VERCEL-DEPLOYMENT.md`
- CI/CD: `docs/WORKFLOW.md`
- Infrastructure: `infrastructure/`

---

**Last Updated**: 2026-02-21
