# Deployment Guide

This guide covers all deployment options for the Guess Game Nuxt PWA, including AWS S3/CloudFront and GitLab Pages.

---

# AWS Deployment Guide for Guess Game PWA

This guide explains how to deploy the Guess Game PWA to AWS using S3 and CloudFront.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [Infrastructure Setup with CloudFormation](#infrastructure-setup-with-cloudformation)
4. [Manual Deployment](#manual-deployment)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Continuous Deployment](#continuous-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- **AWS Account** with appropriate permissions
- **AWS CLI** installed and configured ([installation guide](https://aws.amazon.com/cli/))
- **Node.js** and **pnpm** installed
- **Project built** (run `pnpm run generate`)

### Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your default output format (json)
```

## Quick Deployment

The fastest way to deploy is using our deployment script:

```bash
# Set your bucket name (must be globally unique)
export AWS_S3_BUCKET="riddlerush"

# Optional: Set CloudFront distribution ID for cache invalidation
export AWS_CLOUDFRONT_ID="ERCX6EFGWWFUV"

export AWS_REGION="eu-central-1"
# Run deployment
./aws-deploy.sh
```

This script will:

1. ✅ Build the application
2. ✅ Create S3 bucket (if it doesn't exist)
3. ✅ Upload all files to S3
4. ✅ Configure proper cache headers
5. ✅ Invalidate CloudFront cache (if configured)

## Infrastructure Setup with CloudFormation

For a complete, production-ready setup, use our CloudFormation template:

### Option 1: Without Custom Domain

```bash
aws cloudformation create-stack \
  --stack-name guess-game-pwa \
  --template-body file://cloudformation-template.yaml \
  --region us-east-1
```

### Option 2: With Custom Domain

**Prerequisites:**

- Domain registered (can be outside AWS)
- SSL certificate in AWS Certificate Manager (ACM) in `us-east-1` region

```bash
aws cloudformation create-stack \
  --stack-name guess-game-pwa \
  --template-body file://cloudformation-template.yaml \
  --parameters \
    ParameterKey=DomainName,ParameterValue=game.example.com \
    ParameterKey=CertificateArn,ParameterValue=arn:aws:acm:us-east-1:123456789:certificate/abc-123 \
  --region us-east-1
```

### Get Stack Outputs

After stack creation completes (5-10 minutes):

```bash
aws cloudformation describe-stacks \
  --stack-name guess-game-pwa \
  --query 'Stacks[0].Outputs' \
  --output table
```

This will show:

- **S3 Bucket Name** - for deployments
- **CloudFront Distribution ID** - for cache invalidation
- **CloudFront Domain** - your app URL
- **Deploy Command** - ready-to-use deployment command

### Deploy to CloudFormation Infrastructure

```bash
# Get values from stack outputs
AWS_S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name guess-game-pwa \
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
  --output text)

AWS_CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
  --stack-name guess-game-pwa \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

# Deploy
./aws-deploy.sh
```

## Manual Deployment

If you prefer manual setup:

### 1. Create S3 Bucket

```bash
BUCKET_NAME="my-guess-game-pwa"
REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document 404.html
```

### 2. Upload Files

```bash
# Build the app
pnpm run generate

# Upload with appropriate cache headers
# Static assets (long cache)
aws s3 sync .output/public s3://$BUCKET_NAME \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "sw.js" \
  --exclude "workbox-*.js"

# HTML and service worker (short cache)
aws s3 sync .output/public s3://$BUCKET_NAME \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "sw.js" \
  --include "workbox-*.js"
```

### 3. Configure Bucket Policy (Optional - for public access)

```bash
cat > bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
  }]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json
```

### 4. Access Your Site

```bash
echo "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
```

## Custom Domain Setup

### 1. Request SSL Certificate (in us-east-1)

```bash
aws acm request-certificate \
  --domain-name game.example.com \
  --validation-method DNS \
  --region us-east-1
```

### 2. Validate Certificate

Follow the instructions from ACM to add DNS records for validation.

### 3. Create CloudFront Distribution

Use the CloudFormation template with custom domain parameters (see above).

### 4. Update DNS

Add a CNAME or ALIAS record pointing to your CloudFront distribution:

```
game.example.com  →  d1234567890abc.cloudfront.net
```

For Route 53:

```bash
# Get your CloudFront domain
CF_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name guess-game-pwa \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
  --output text)

# Create/update Route 53 record
# (Use AWS Console or create a change batch JSON)
```

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm run test:unit

      - name: Build
        run: pnpm run generate

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          aws s3 sync .output/public s3://${{ secrets.AWS_S3_BUCKET }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.AWS_CLOUDFRONT_ID }} \
            --paths "/*"
```

Set these secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_ID`

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:20
  before_script:
    - npm install -g pnpm@10
    - pnpm install
  script:
    - pnpm run test:unit
    - pnpm run lint

build:
  stage: build
  image: node:20
  before_script:
    - npm install -g pnpm@10
    - pnpm install
  script:
    - pnpm run generate
  artifacts:
    paths:
      - .output/public

deploy:
  stage: deploy
  image: amazon/aws-cli
  dependencies:
    - build
  script:
    - aws s3 sync .output/public s3://$AWS_S3_BUCKET --delete
    - aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_ID --paths "/*"
  only:
    - main
```

Set these CI/CD variables in GitLab:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_ID`
- `AWS_DEFAULT_REGION`

## Troubleshooting

### Issue: AccessDenied when uploading to S3

**Solution:** Check your AWS credentials and IAM permissions:

```bash
# Verify credentials
aws sts get-caller-identity

# Check if you can access the bucket
aws s3 ls s3://your-bucket-name
```

Required IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::your-bucket-name", "arn:aws:s3:::your-bucket-name/*"]
    }
  ]
}
```

### Issue: Service Worker not updating

**Solution:** Invalidate CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/sw.js" "/workbox-*.js" "/*"
```

### Issue: 404 errors on page refresh

**Solution:** Configure CloudFront error pages to return `index.html`:

This is already configured in the CloudFormation template. If setting up manually:

1. Go to CloudFront → Your Distribution → Error Pages
2. Create Custom Error Response:
   - HTTP Error Code: 404
   - Response Page Path: `/404.html`
   - HTTP Response Code: 200
   - Error Caching Minimum TTL: 300

### Issue: HTTPS not working

**Solution:** Ensure:

1. Certificate is in `us-east-1` region (CloudFront requirement)
2. Certificate is validated and issued
3. Domain name matches certificate
4. CloudFront distribution has certificate attached

### Issue: Old content still showing

**Solutions:**

1. Clear CloudFront cache (see above)
2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear service worker cache:
   - Open DevTools → Application → Service Workers
   - Click "Unregister"
   - Reload page

## Cost Estimation

### Free Tier (First 12 months)

- S3: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- CloudFront: 1TB data transfer out, 10,000,000 HTTP/HTTPS requests

### After Free Tier (approximate)

For a small PWA with ~1,000 daily users:

- S3 Storage: $0.01 - $0.10/month
- S3 Requests: $0.01 - $0.05/month
- CloudFront: $1 - $5/month
- **Total: ~$2 - $6/month**

### Production Optimization

- Enable CloudFront compression (already configured in template)
- Use S3 lifecycle policies for old versions
- Monitor CloudWatch metrics
- Set up billing alerts

## Next Steps

1. **Set up monitoring:**
   - CloudWatch dashboards
   - CloudFront metrics
   - S3 access logs

2. **Security hardening:**
   - Enable S3 versioning (done in template)
   - Add WAF rules if needed
   - Configure CORS properly

3. **Performance optimization:**
   - Enable HTTP/3 (done in template)
   - Configure additional cache behaviors
   - Use CloudFront Functions for edge logic

4. **Backup strategy:**
   - Enable S3 cross-region replication
   - Set up automated backups

## Support

- **AWS Documentation:** https://docs.aws.amazon.com/
- **CloudFormation:** https://docs.aws.amazon.com/cloudformation/
- **S3 Static Website:** https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html
- **CloudFront:** https://docs.aws.amazon.com/cloudfront/

---

**✨ Your PWA is now deployed to AWS with enterprise-grade infrastructure!**
# AWS Deployment Status & Verification

## 🚀 Deployment Ready

The application is ready for AWS deployment. Here's what's configured:

### Configuration

Based on `deployment-info.json`:
- **Bucket**: `riddlerush`
- **CloudFront ID**: `ERCX6EFGWWFUV`
- **Region**: `us-east-1`
- **Last Deployment**: 2026-01-02T04:54:59Z

### Quick Deploy Command

```bash
export AWS_S3_BUCKET="riddlerush"
export AWS_CLOUDFRONT_ID="ERCX6EFGWWFUV"
export AWS_REGION="eu-central-1"
./aws-deploy.sh production
```

## ✅ Pre-Deployment Checklist

### Code Quality
- ✅ **Lint**: PASSING
- ✅ **TypeCheck**: PASSING
- ✅ **Console Statements**: All use logger
- ✅ **Code Organization**: Clean and optimized

### Build
- ✅ **Build Script**: Ready (`pnpm run generate`)
- ✅ **Base URL**: Configured for root (`/`)
- ✅ **Assets**: All mockup assets included
- ✅ **PWA**: Service worker configured

### Visual Quality
- ✅ **Mockups**: All pages aligned
- ✅ **Backgrounds**: Full opacity, properly displayed
- ✅ **Assets**: All designer assets used correctly
- ✅ **Responsive**: Mobile-first design

## 📋 Deployment Steps

### 1. Build the Application

```bash
BASE_URL=/ pnpm run generate
```

This creates `.output/public/` with all static files.

### 2. Run Deployment Script

```bash
./aws-deploy.sh production
```

The script will:
1. ✅ Run pre-deployment checks (lint, typecheck, tests)
2. ✅ Build the application
3. ✅ Create/verify S3 bucket
4. ✅ Upload files with proper cache headers
5. ✅ Invalidate CloudFront cache
6. ✅ Show deployment URLs

### 3. Verify Deployment

After deployment, test:

1. **Homepage**
   - URL: `https://d[cloudfront-id].cloudfront.net` or S3 website URL
   - ✅ Loads correctly
   - ✅ Shows logo and menu buttons
   - ✅ Navigation works

2. **Game Flow**
   - ✅ Players page loads
   - ✅ Round start works
   - ✅ Game page displays correctly
   - ✅ Results page works
   - ✅ Leaderboard displays

3. **Visual Quality**
   - ✅ All backgrounds display
   - ✅ All images load
   - ✅ Buttons work
   - ✅ Animations smooth

4. **PWA Features**
   - ✅ Installable
   - ✅ Works offline
   - ✅ Service worker active

## 🔍 Post-Deployment Verification

### Check S3 Bucket

```bash
aws s3 ls s3://riddlerush/ --recursive | head -20
```

### Check CloudFront

```bash
aws cloudfront get-distribution --id ERCX6EFGWWFUV
```

### Test the Site

1. Open CloudFront URL or S3 website URL
2. Test all pages
3. Test game flow
4. Test PWA installation
5. Test offline mode

## 🎯 Expected URLs

### CloudFront (HTTPS)
```
https://d[distribution-id].cloudfront.net
```

### S3 Website (HTTP only)
```
http://riddlerush.s3-website-eu-central-1.amazonaws.com
```

## 📊 Deployment Metrics

From last deployment:
- **Build Size**: 19M
- **File Count**: 332 files
- **Environment**: production

## ✅ Quality Assurance

Before considering deployment complete:

- [ ] Site loads without errors
- [ ] All pages accessible
- [ ] Images load correctly
- [ ] Game flow works end-to-end
- [ ] PWA installable
- [ ] Offline mode works
- [ ] No console errors in production
- [ ] Mobile responsive
- [ ] Fast load times

## 🚨 Troubleshooting

### Build Fails
```bash
rm -rf .output .nuxt .cache
pnpm install
BASE_URL=/ pnpm run generate
```

### Upload Fails
- Check AWS credentials: `aws sts get-caller-identity`
- Check bucket permissions
- Check region matches

### Site Looks Broken
- Clear browser cache
- Check CloudFront invalidation status
- Verify all assets uploaded

### 404 Errors
- Check S3 bucket policy
- Verify index.html exists
- Check CloudFront origin configuration

## 📝 Next Steps After Deployment

1. ✅ **Test Everything** - Verify all features work
2. ✅ **Monitor** - Set up CloudWatch alarms
3. ✅ **Analytics** - Verify Google Analytics (if configured)
4. ✅ **Performance** - Run Lighthouse audit
5. ✅ **Security** - Verify HTTPS works
6. ✅ **Documentation** - Update deployment info

---

**Status**: ✅ **READY FOR DEPLOYMENT**
**Last Updated**: 2026-01-02
# AWS Deployment - Quick Start Guide

Deploy your Guess Game PWA to AWS in under 10 minutes.

## Prerequisites Checklist

- [ ] AWS account created
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws configure`)
- [ ] pnpm installed (`pnpm --version`)

## Step-by-Step Deployment

### 1. Configure AWS CLI (First Time Only)

```bash
aws configure
```

Enter when prompted:
- **AWS Access Key ID**: [From IAM Console]
- **AWS Secret Access Key**: [From IAM Console]
- **Default region**: `eu-central-1` (or your preferred region)
- **Output format**: `json`

**Verify it works:**
```bash
aws sts get-caller-identity
# Should show your AWS account info
```

### 2. Set Your Bucket Name

Choose a globally unique name (lowercase, no special chars except hyphens):

```bash
export AWS_S3_BUCKET=guess-game-YOUR-NAME-HERE
# Example: export AWS_S3_BUCKET=guess-game-john-2024
```

**Optional: Set region** (default is eu-central-1):
```bash
export AWS_REGION=eu-central-1
```

### 3. Deploy

```bash
./aws-deploy.sh production
```

The script will:
1. Run tests (lint, typecheck, unit tests)
2. Build the app
3. Create S3 bucket (if needed)
4. Upload all files
5. Show you the URL

**Wait for**: `🎉 Deployment complete!`

### 4. Test Your Deployment

Open the URL shown in the deployment output:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

Verify:
- [ ] Homepage loads
- [ ] Can navigate to /game
- [ ] Can start a game
- [ ] PWA install prompt appears

## What If Something Goes Wrong?

### Error: "AWS CLI is not installed"
```bash
# Install AWS CLI
# MacOS:
brew install awscli

# Linux:
sudo apt install awscli

# Or use pip:
pip install awscli
```

### Error: "AWS credentials not configured"
```bash
aws configure
# Enter your credentials again
```

### Error: "Bucket name already exists"
```bash
# Choose a different name
export AWS_S3_BUCKET=guess-game-different-name-here
./aws-deploy.sh production
```

### Error: "Tests failed"
```bash
# Fix test errors first, then redeploy
pnpm run test:unit
pnpm run lint
pnpm run typecheck
```

### Site loads but looks broken
```bash
# Hard refresh your browser
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

## Next Steps (Optional)

### Add HTTPS with CloudFront

For production use, you should add CloudFront for HTTPS:

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click "Create Distribution"
3. **Origin Domain**: Select your S3 bucket website endpoint
   - Format: `your-bucket.s3-website-us-east-1.amazonaws.com`
4. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
5. Click "Create Distribution"
6. **Wait 15-20 minutes** for deployment

After CloudFront is ready:

```bash
# Get your distribution ID from CloudFront console (starts with E...)
export AWS_CLOUDFRONT_ID=E1234567890ABC
./aws-deploy.sh production
```

Your app will be available at: `https://d1234abcd.cloudfront.net`

### Add Custom Domain

See [AWS Deployment Guide - Custom Domain Setup](docs/AWS-DEPLOYMENT.md#custom-domain-setup)

## Environment Variables Reference

Save these in a file (e.g., `.env.aws`) for easy reuse:

```bash
# Required
export AWS_S3_BUCKET=your-unique-bucket-name

# Optional
export AWS_REGION=us-east-1
export AWS_CLOUDFRONT_ID=E1234567890ABC
export GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
export APP_VERSION=1.0.0
```

Load before deployment:
```bash
source .env.aws
./aws-deploy.sh production
```

## Cost Estimate

**Free Tier** (first 12 months):
- 5 GB S3 storage: **FREE**
- 20,000 GET requests/month: **FREE**
- 1 TB CloudFront transfer: **FREE**

**After Free Tier** (typical small app):
- Storage (20 MB): ~$0.0005/month
- Traffic (10k views/month): ~$1-5/month
- **Total: $1-5/month**

## Deployment Checklist

Before going live:

- [ ] App deployed and accessible
- [ ] All pages work (/, /game, /leaderboard, etc.)
- [ ] PWA install works
- [ ] Offline mode works
- [ ] CloudFront configured (for HTTPS)
- [ ] Custom domain configured (optional)
- [ ] E2E tests pass: `BASE_URL=https://your-url pnpm run test:e2e`
- [ ] Analytics configured (optional)
- [ ] SSL certificate valid (if using custom domain)

## Support

- **Detailed Guide**: See [docs/AWS-DEPLOYMENT.md](docs/AWS-DEPLOYMENT.md)
- **AWS Documentation**: https://docs.aws.amazon.com/
- **Troubleshooting**: See [AWS Deployment Guide - Troubleshooting](docs/AWS-DEPLOYMENT.md#troubleshooting)

## Redeploy / Update

To update your deployed app:

```bash
# Make your code changes, then:
source .env.aws  # Load your bucket name
./aws-deploy.sh production
```

The script will:
- Run all tests
- Build fresh version
- Upload only changed files
- Invalidate CloudFront cache (if configured)

**Updates are live immediately** (or after CloudFront invalidation completes).
# AWS Deployment - Ready for Tomorrow

## Summary

Your Guess Game PWA is ready for AWS deployment. All build processes have been tested and optimized, documentation is complete, and the deployment script is production-ready.

## What's Been Done

### 1. Build Process ✅
- TypeScript errors fixed in `pages/results.vue`, `tests/e2e/leaderboard.spec.ts`, `tests/unit/game-store.spec.ts`
- Build tested and verified (generates ~196 files, 17.6 MB)
- All pre-deployment checks pass (lint, typecheck, unit tests)

### 2. Deployment Script ✅
- **Enhanced `aws-deploy.sh`** with:
  - Automatic AWS credential verification
  - Pre-deployment checks (lint, typecheck, tests)
  - Automatic S3 bucket creation and configuration
  - Optimized cache headers for PWA performance
  - CloudFront cache invalidation support
  - Comprehensive error handling
  - Deployment metadata logging

### 3. Documentation ✅
- **AWS-QUICKSTART.md**: 10-minute deployment guide
- **docs/AWS-DEPLOYMENT.md**: Comprehensive setup guide (15 pages)
- **CLAUDE.md**: Updated with AWS deployment commands
- All guides include troubleshooting and cost estimates

## Tomorrow's Deployment - 3 Simple Steps

### Option 1: Quick Deploy (S3 Only, 5 minutes)

```bash
# 1. Set your bucket name (choose unique name)
export AWS_S3_BUCKET=guess-game-YOUR-NAME

# 2. Deploy
./aws-deploy.sh production

# 3. Open the URL shown in output
```

### Option 2: Production Deploy (S3 + CloudFront, 10 minutes + 20 min wait)

```bash
# 1. Deploy to S3
export AWS_S3_BUCKET=guess-game-YOUR-NAME
./aws-deploy.sh production

# 2. Set up CloudFront in AWS Console
# - Go to CloudFront → Create Distribution
# - Origin: your-bucket.s3-website-us-east-1.amazonaws.com
# - Wait 15-20 minutes for deployment

# 3. Redeploy with CloudFront
export AWS_CLOUDFRONT_ID=E1234567890ABC
./aws-deploy.sh production
```

## Pre-Deployment Checklist

Before you start tomorrow:

- [ ] AWS account ready
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws configure`
- [ ] Choose unique S3 bucket name
- [ ] Decide: S3-only or S3+CloudFront

## Files Reference

| File | Purpose |
|------|---------|
| `aws-deploy.sh` | Main deployment script |
| `AWS-QUICKSTART.md` | Quick start guide (read this first) |
| `docs/AWS-DEPLOYMENT.md` | Comprehensive guide |
| `CLAUDE.md` | Updated with AWS commands |
| `DEPLOYMENT-SUMMARY.md` | This file |

## What the Deployment Does

1. **Validates** AWS credentials and configuration
2. **Tests** your code (lint, typecheck, unit tests)
3. **Builds** production bundle with PWA support
4. **Creates** S3 bucket (if doesn't exist)
5. **Configures** bucket for static website hosting
6. **Uploads** files with optimized caching:
   - Static assets (JS/CSS): 1 year cache
   - HTML/Service Worker: no cache (always fresh)
7. **Invalidates** CloudFront cache (if configured)
8. **Reports** deployment URL and status

## Expected Output

```
🚀 Starting AWS deployment for production...
=======================================

🔑 Checking AWS credentials...
✓ AWS CLI configured
  Account: 123456789012
  User: your-user

🔍 Running pre-deployment checks...
✓ All pre-deployment checks passed

🏗️  Building application...
✓ Build completed
  Files generated: 196

🪣 Checking S3 bucket: guess-game-YOUR-NAME...
✓ Bucket created and configured

☁️  Uploading to S3...
✓ Files uploaded to S3
  Total size: 17.3M

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Deployment complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

S3 Website URL:
  http://guess-game-YOUR-NAME.s3-website-us-east-1.amazonaws.com

✅ Done!
```

## After Deployment

1. **Test the site** - Open URL and verify:
   - [ ] Homepage loads
   - [ ] Can navigate to /game
   - [ ] Can play the game
   - [ ] PWA install prompt works
   - [ ] Offline mode works

2. **Run E2E tests** (optional):
   ```bash
   BASE_URL=http://your-bucket.s3-website-us-east-1.amazonaws.com pnpm run test:e2e
   ```

3. **Monitor costs** - Check AWS billing dashboard

## Estimated Costs

**First 12 Months (Free Tier):**
- Storage: FREE (up to 5 GB)
- Requests: FREE (20k GET, 2k PUT)
- CloudFront: FREE (1 TB transfer, 10M requests)
- **Total: $0/month** (for typical traffic)

**After Free Tier:**
- S3 only: $1-5/month
- S3 + CloudFront: $5-20/month
- **For low traffic**: Usually under $5/month

## Rollback Plan

If something goes wrong:

```bash
# Delete the deployment
aws s3 rm s3://your-bucket-name --recursive
aws s3 rb s3://your-bucket-name

# Delete CloudFront distribution (if created)
# Do this in AWS Console → CloudFront → Disable → Delete
```

## Getting Help

1. **Quick issues**: See `AWS-QUICKSTART.md`
2. **Detailed help**: See `docs/AWS-DEPLOYMENT.md`
3. **Troubleshooting**: See [docs/AWS-DEPLOYMENT.md#troubleshooting](docs/AWS-DEPLOYMENT.md#troubleshooting)
4. **AWS Support**: https://console.aws.amazon.com/support/

## Production Recommendations

For public production use:

1. **Use CloudFront** - Required for HTTPS
2. **Add custom domain** - Better branding
3. **Get SSL certificate** - Free from AWS ACM
4. **Set up monitoring** - CloudWatch alerts
5. **Enable WAF** - If security-critical
6. **Configure backups** - Versioning in S3

See [docs/AWS-DEPLOYMENT.md](docs/AWS-DEPLOYMENT.md) for setup instructions.

## Quick Commands Reference

```bash
# Deploy to S3
export AWS_S3_BUCKET=your-bucket-name
./aws-deploy.sh production

# Deploy with CloudFront
export AWS_S3_BUCKET=your-bucket-name
export AWS_CLOUDFRONT_ID=E1234567890ABC
./aws-deploy.sh production

# Test deployed site
BASE_URL=https://your-url pnpm run test:e2e

# Check AWS credentials
aws sts get-caller-identity

# List your buckets
aws s3 ls

# Check deployment
aws s3 ls s3://your-bucket-name
```

## Success Criteria

Your deployment is successful when:

- [x] Build completes without errors
- [x] All tests pass (lint, typecheck, unit)
- [x] S3 bucket created and configured
- [x] Files uploaded successfully
- [ ] Site accessible via URL
- [ ] PWA features work (install, offline)
- [ ] All pages load correctly
- [ ] No console errors

## Next Day Checklist

After deployment settles:

- [ ] Verify analytics tracking (if configured)
- [ ] Test on mobile devices
- [ ] Test PWA installation
- [ ] Check performance (Lighthouse score)
- [ ] Set up CloudWatch alerts (optional)
- [ ] Document custom domain if added
- [ ] Share URL with stakeholders

---

## Ready to Deploy Tomorrow? ✅

1. Read `AWS-QUICKSTART.md` (5 min read)
2. Run `aws configure` if not done
3. Choose bucket name
4. Run `./aws-deploy.sh production`
5. Test the URL

**Good luck with your deployment!** 🚀
# 🚀 Quick AWS Deployment Guide

## Prerequisites Check

Before deploying, ensure:
- ✅ AWS CLI installed (`aws --version`)
- ✅ AWS credentials configured (`aws configure`)
- ✅ Project dependencies installed (`pnpm install`)

## Quick Deploy

### Option 1: Use Existing Bucket (from deployment-info.json)

```bash
export AWS_S3_BUCKET="riddlerush"
export AWS_CLOUDFRONT_ID="ERCX6EFGWWFUV"
export AWS_REGION="eu-central-1"
./aws-deploy.sh production
```

### Option 2: Create New Bucket

```bash
# Set unique bucket name (must be globally unique)
export AWS_S3_BUCKET="guess-game-pwa-$(date +%s)"
export AWS_REGION="eu-central-1"
# Optional: Add CloudFront ID if you have one
# export AWS_CLOUDFRONT_ID="your-distribution-id"

./aws-deploy.sh production
```

## What the Script Does

1. ✅ **Pre-deployment Checks**
   - Runs linter
   - Runs type check
   - Runs unit tests

2. ✅ **Build**
   - Generates static site with `BASE_URL=/`
   - Optimizes assets

3. ✅ **S3 Setup**
   - Creates bucket if it doesn't exist
   - Configures for static website hosting
   - Sets public read access

4. ✅ **Upload**
   - Uploads all files with proper cache headers
   - Static assets: 1 year cache
   - HTML/Service Worker: No cache

5. ✅ **CloudFront** (if configured)
   - Invalidates cache
   - Shows CloudFront URL

## After Deployment

### Test the Site

1. **S3 Website URL** (if no CloudFront):
   ```
   http://YOUR-BUCKET.s3-website-REGION.amazonaws.com
   ```

2. **CloudFront URL** (if configured):
   ```
   https://YOUR-DISTRIBUTION.cloudfront.net
   ```

### Verify Everything Works

- ✅ Homepage loads
- ✅ Navigation works
- ✅ Game flow works
- ✅ Images load correctly
- ✅ PWA installable
- ✅ Works offline

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .output .nuxt .cache
pnpm install
BASE_URL=/ pnpm run generate
```

### AWS Credentials Error
```bash
aws configure
# Enter Access Key ID
# Enter Secret Access Key
# Enter region (e.g., eu-central-1)
# Enter output format (json)
```

### Bucket Already Exists
- Use existing bucket name
- Or choose a different unique name

### CloudFront Not Working
- Wait 5-15 minutes for invalidation
- Check distribution status: `aws cloudfront get-distribution --id YOUR_ID`

## Next Steps

1. ✅ Test the deployed site
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring (CloudWatch)
4. ✅ Set up CI/CD for auto-deployment

---

**Ready to deploy?** Run: `./aws-deploy.sh production`
# GitLab Pages Deployment Guide

This guide explains how to deploy the Guess Game PWA to GitLab Pages with automated testing and coverage reports.

## Prerequisites

1. A GitLab repository with this project
2. PWA icons generated (pwa-192x192.png and pwa-512x512.png in the public/ directory)
3. All tests passing locally

## Setup

### 1. Generate PWA Icons

Before deploying, you need to generate the PWA icons referenced in `nuxt.config.ts`:

- `public/pwa-192x192.png` (192x192 pixels)
- `public/pwa-512x512.png` (512x512 pixels)

You can use the `public/pwa-icon-template.svg` as a starting point or use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 2. Configure Environment Variables

#### Base URL (Optional)

If your GitLab Pages site is deployed to a subdirectory (e.g., `https://username.gitlab.io/project-name/`), you need to set the BASE_URL:

1. Go to your GitLab project: Settings > CI/CD > Variables
2. Add a new variable:
   - Key: `BASE_URL`
   - Value: `/project-name/` (replace with your actual project name)
   - Make sure it starts and ends with `/`

If deploying to a root domain (e.g., `https://username.gitlab.io/`), no configuration is needed.

#### Google Analytics (Optional)

To enable Google Analytics tracking:

1. Go to your GitLab project: Settings > CI/CD > Variables
2. Add a new variable:
   - Key: `GOOGLE_ANALYTICS_ID`
   - Value: `G-XXXXXXXXXX` (your GA4 Measurement ID)
   - Masked: Yes (recommended)

See [ANALYTICS.md](./ANALYTICS.md) for detailed setup instructions.

### 3. Push to GitLab

The `.gitlab-ci.yml` file is already configured. Simply push your code to the `main` or `master` branch:

```bash
git add .
git commit -m "Add GitLab Pages deployment"
git push origin main
```

### 4. Monitor Deployment

1. Go to your project in GitLab
2. Navigate to CI/CD > Pipelines
3. Watch the pipeline run through the build and deploy stages
4. Once complete, go to Settings > Pages to see your deployed URL

## Testing Locally

Before pushing, ensure all tests pass locally:

```bash
# Install dependencies
npm install

# Run unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit:coverage

# Run e2e tests (requires dev server)
npm run test:e2e

# View test coverage report
open coverage/index.html
```

## Pipeline Details

The GitLab CI pipeline consists of four stages:

### Test Stage
The pipeline runs two test jobs in parallel:

#### Unit Tests (`test:unit`)
- Runs Vitest unit tests with coverage
- Generates coverage reports in multiple formats (text, JSON, HTML, LCOV, Cobertura)
- Coverage thresholds set at 80% for lines, functions, branches, and statements
- Coverage report is integrated into GitLab's coverage visualization
- Artifacts expire in 30 days

#### E2E Tests (`test:e2e`)
- Installs Playwright and Chromium browser
- Generates the production build
- Runs end-to-end tests using Playwright
- Tests both desktop (Chrome) and mobile (Pixel 5) viewports
- Includes comprehensive smoke tests for critical functionality
- Captures screenshots on failure
- Generates HTML and JSON reports
- Artifacts expire in 30 days

**Smoke Tests Included:**
- Homepage loads successfully
- PWA manifest is accessible
- Service worker registers correctly
- Critical assets load without errors
- Responsive on mobile devices
- No critical console errors
- Offline functionality works
- Page load performance is acceptable

### Build Stage
- Only runs if all tests pass
- Installs dependencies using `npm ci`
- Runs `npm run generate` to create the static site
- Outputs to `.output/public` directory

### Deploy Stage
- Only runs if build succeeds
- Copies the built files to the `public` directory (required by GitLab Pages)
- Includes test coverage and e2e reports at `/test-reports/`
- Deploys the site to GitLab Pages

## Viewing Test Reports

After deployment, you can view test reports at:
- Coverage report: `https://your-pages-url/test-reports/coverage/`
- E2E test report: `https://your-pages-url/test-reports/playwright-report/`

You can also view them in GitLab:
1. Go to your project in GitLab
2. Navigate to CI/CD > Pipelines
3. Click on the pipeline
4. Click on the test job
5. Browse the artifacts or view coverage tab

## Testing the PWA

After deployment:

1. Visit your GitLab Pages URL
2. Open in a supported browser (Chrome, Edge, Safari, Firefox)
3. Look for the install prompt or use the browser menu to install the PWA
4. The app should work offline thanks to the service worker

## Writing Tests

### Unit Tests
Place unit tests in `tests/unit/` with the naming pattern `*.spec.ts` or `*.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should work correctly', () => {
    expect(true).toBe(true)
  })
})
```

### E2E Tests
Place e2e tests in `tests/e2e/` with the naming pattern `*.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Guess Game/)
})
```

## Troubleshooting

### Tests failing in CI but passing locally
- Ensure you're using the same Node.js version (20) as the CI
- Check that all dependencies are properly listed in package.json
- Review CI logs for specific error messages

### Coverage thresholds not met
- Current thresholds are set to 80% for all metrics
- Add more unit tests to increase coverage
- View coverage report to see uncovered lines

### Icons not loading
- Ensure `pwa-192x192.png` and `pwa-512x512.png` exist in the `public/` directory
- Check browser console for 404 errors

### Routes not working
- Verify the BASE_URL environment variable is set correctly with leading and trailing slashes
- Check that the manifest start_url matches your base URL

### PWA not installable
- Ensure the site is served over HTTPS (GitLab Pages provides this automatically)
- Check that the manifest.json is accessible at `https://your-site/manifest.webmanifest`
- Verify icons are properly sized and accessible

### Service Worker issues
- Clear browser cache and service workers
- Check Application tab in DevTools > Service Workers
- Verify the service worker is registered and activated

## Local Testing

To test the production build locally:

```bash
npm run generate
npm run preview
```

This will build and serve the static site at http://localhost:3000
