# 🚀 Vercel Deployment Guide - Riddle Rush

## Overview

This guide covers the complete Vercel deployment setup with GitHub Actions CI/CD for development and production environments.

## 🎯 Deployment Strategy

| Branch        | Environment | URL                          | Auto Deploy | Stage         |
| ------------- | ----------- | ---------------------------- | ----------- | ------------- |
| `main`        | Production  | riddle-rush.vercel.app       | ✅          | `production`  |
| `development` | Development | riddle-rush-dev.vercel.app   | ✅          | `development` |
| Pull Requests | Preview     | riddle-rush-pr-\*.vercel.app | ✅          | `preview`     |

## 🛠 Initial Setup

### 1. Link Project to Vercel

```bash
# If not already done
vercel link

# Follow prompts to:
# - Select your Vercel team/account
# - Link to existing project or create new
# - Confirm project settings
```

### 2. Configure GitHub Secrets

Go to **GitHub Repository → Settings → Secrets and variables → Actions** and add:

| Secret Name         | How to Get                                                     | Required |
| ------------------- | -------------------------------------------------------------- | -------- |
| `VERCEL_TOKEN`      | [vercel.com/account/tokens](https://vercel.com/account/tokens) | ✅       |
| `VERCEL_ORG_ID`     | Run `vercel link` then check `.vercel/project.json`            | ✅       |
| `VERCEL_PROJECT_ID` | Run `vercel link` then check `.vercel/project.json`            | ✅       |

### 3. Configure Vercel Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

#### Production Environment (main branch)

```env
STAGE=production
NODE_ENV=production
NUXT_PUBLIC_SITE_URL=https://riddle-rush.vercel.app
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
ENABLE_ANALYTICS=true
ENABLE_PWA=true
ENABLE_DEBUG_PANEL=false
```

#### Development Environment (development branch)

```env
STAGE=development
NODE_ENV=development
NUXT_PUBLIC_SITE_URL=https://riddle-rush-dev.vercel.app
ENABLE_ANALYTICS=false
ENABLE_PWA=false
ENABLE_DEBUG_PANEL=true
```

## 📦 Deployment Process

### Automatic Deployments via GitHub Actions

The `.github/workflows/deploy.yml` handles:

- ✅ Quality checks (typecheck, lint, tests)
- ✅ Automatic deployment on push to main/development
- ✅ Preview deployments for PRs
- ✅ E2E tests after deployment

### Manual Deployment

```bash
# Development
STAGE=development vercel

# Production
STAGE=production vercel --prod
```

## 🔍 Monitoring Deployments

### Vercel Dashboard

- View all deployments at [vercel.com/dashboard](https://vercel.com/dashboard)
- Monitor build logs and analytics
- Manage environment variables

### CLI Commands

```bash
# List recent deployments
vercel ls

# View logs
vercel logs

# Check deployment status
vercel inspect [deployment-url]
```

## 🔄 Rollback Procedures

```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote [deployment-url]
```

## 🚨 Troubleshooting

### Build Failures

```bash
# Check logs
vercel logs

# Clear cache and retry
vercel --force

# Test locally
STAGE=production pnpm run build
```

### Environment Variable Issues

```bash
# Pull latest environment variables
vercel env pull .env.local

# List configured variables
vercel env ls
```

## Quick Commands Reference

```bash
# Deploy to development
git push origin development

# Deploy to production
git push origin main

# Create preview
git push origin feature/my-feature

# Check status
vercel ls
```
