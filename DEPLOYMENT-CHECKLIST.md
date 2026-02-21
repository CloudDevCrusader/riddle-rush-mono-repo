# Deployment Preparation Checklist

## Current Status

- **Date**: 2026-02-21
- **Branch**: main
- **Repository**: https://github.com/CloudDevCrusader/riddle-rush-mono-repo.git
- **Quality Checks**: ✅ All passing

## Pre-Deployment Checklist

### Code Quality

- [x] TypeScript compilation: ✅ PASS
- [x] ESLint: ✅ PASS
- [x] Prettier: ✅ PASS (via lint:fix)
- [x] Syncpack: ✅ PASS (dependency versions consistent)

### Documentation

- [x] Outdated docs archived
- [x] New docs created and indexed
- [x] Deployment guides consolidated
- [x] Deployment status documented

### Deployment Configuration

- [x] GitLab CI configured (.gitlab-ci.yml)
- [x] GitHub Actions configured (.github/workflows/)
- [x] Vercel configuration (vercel.json)
- [x] AWS deployment scripts tested
- [x] Environment variables configured

## Deployment Options

### Option 1: AWS Production (Recommended)

```bash
# Create and push version tag
git tag v1.1.1
git push origin v1.1.1

# GitLab CI will automatically:
# 1. Run tests
# 2. Build application
# 3. Deploy to AWS S3
# 4. Invalidate CloudFront cache
```

**Result**: https://riddlerush.de

### Option 2: Vercel Production

```bash
# Push to main branch (GitHub Actions will deploy)
git push origin main

# Or deploy manually via Vercel CLI
vercel --prod
```

**Result**: Vercel production URL (check GitHub Actions output)

### Option 3: Development Deployment

```bash
# Deploy to AWS development
export AWS_S3_BUCKET=dev-bucket
export AWS_CLOUDFRONT_ID=dev-cloudfront-id
NODE_ENV=development ./scripts/aws-deploy.sh development

# Or push to development branch for Vercel
git checkout development
git push origin development
```

**Result**: https://dev.riddlerush.de or Vercel dev URL

## Verification Steps

### After AWS Deployment

1. Wait 2-3 minutes for CloudFront propagation
2. Visit https://riddlerush.de
3. Check browser console for errors
4. Test key functionality:
   - [ ] Page loads correctly
   - [ ] PWA installable
   - [ ] Game starts
   - [ ] Categories load
   - [ ] Settings work

### After Vercel Deployment

1. Check GitHub Actions workflow output
2. Visit deployment URL from workflow
3. Test same functionality as above

## Rollback Procedure

### AWS Rollback

```bash
# Deploy previous version from GitLab CI
# Or manually redeploy previous build
cd apps/game/.output/public
# Restore from backup or rebuild from previous commit
```

### Vercel Rollback

```bash
# Via Vercel Dashboard
# 1. Go to project deployments
# 2. Find previous deployment
# 3. Click "Promote to Production"

# Or via CLI
vercel rollback
```

## Monitoring

### AWS CloudWatch

- Check CloudFront distribution metrics
- Monitor S3 access logs
- Set up alarms for error rates

### Vercel Analytics

- Check deployment logs
- Monitor error rates
- Track performance metrics

## Support

### Issues?

- **AWS Deployment**: Check GitLab CI logs
- **Vercel Deployment**: Check GitHub Actions logs
- **General Issues**: See docs/TROUBLESHLESHOOTING.md

### Documentation

- **Complete Guide**: docs/DEPLOYMENT-COMPLETE.md
- **Status Report**: docs/DEPLOYMENT-STATUS.md
- **Refactoring Notes**: docs/REFACTORING-IMPROVEMENTS.md

---

**Prepared**: 2026-02-21  
**Status**: ✅ Ready for deployment
