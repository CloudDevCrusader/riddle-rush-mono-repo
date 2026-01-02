# AWS Deployment Guide

This guide walks you through deploying the Guess Game PWA to Amazon Web Services (AWS) using S3 for static hosting and optionally CloudFront for CDN.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Configuration](#environment-configuration)
- [CloudFront Setup (Optional)](#cloudfront-setup-optional)
- [Custom Domain Setup](#custom-domain-setup)
- [Troubleshooting](#troubleshooting)
- [Cost Estimation](#cost-estimation)

## Prerequisites

### 1. AWS Account

- Sign up at [aws.amazon.com](https://aws.amazon.com) if you don't have an account
- You'll need billing information, but the free tier covers most small deployments

### 2. AWS CLI Installation

**MacOS/Linux:**
```bash
# Using Homebrew (MacOS)
brew install awscli

# Or using pip
pip install awscli
```

**Windows:**
Download from [AWS CLI Windows Installer](https://aws.amazon.com/cli/)

**Verify installation:**
```bash
aws --version
# Should output: aws-cli/2.x.x ...
```

### 3. AWS CLI Configuration

Configure your AWS credentials:

```bash
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: Get from [IAM Console](https://console.aws.amazon.com/iam/)
- **AWS Secret Access Key**: Generated with Access Key
- **Default region**: e.g., `us-east-1`, `eu-west-1`, `ap-southeast-1`
- **Default output format**: `json` (recommended)

#### Creating IAM Credentials

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Create user with name like `riddle-rush-deployer`
4. Attach policies:
   - `AmazonS3FullAccess` (required for S3 deployment)
   - `CloudFrontFullAccess` (optional, for CloudFront CDN)
5. Create access key → Copy Access Key ID and Secret Access Key
6. Run `aws configure` and enter credentials

## Quick Start

The simplest deployment (S3 only, no CloudFront):

```bash
# Set your bucket name (must be globally unique)
export AWS_S3_BUCKET=my-riddle-rush-app

# Optional: Set AWS region (default: us-east-1)
export AWS_REGION=us-east-1

# Deploy
./aws-deploy.sh production
```

The script will:
1. ✅ Run linter, type checks, and unit tests
2. 🏗️ Build the production bundle
3. 🪣 Create S3 bucket (if it doesn't exist)
4. ☁️ Upload all files with optimized caching
5. 🎉 Display your deployment URL

**Your app will be live at:**
```
http://my-riddle-rush-app.s3-website-us-east-1.amazonaws.com
```

## Detailed Setup

### Step 1: Choose a Bucket Name

S3 bucket names must be:
- Globally unique across all AWS accounts
- 3-63 characters long
- Lowercase letters, numbers, and hyphens only
- No periods (for SSL compatibility)

**Good examples:**
- `riddle-rush-prod-2024`
- `my-company-riddle-rush`
- `guessgame-john-doe`

**Bad examples:**
- `guess.game.com` (contains periods)
- `GuessGame` (uppercase)
- `gg` (too short)

### Step 2: Configure Environment Variables

Create a `.env.aws` file in the project root:

```bash
# S3 Configuration
export AWS_S3_BUCKET=your-unique-bucket-name
export AWS_REGION=us-east-1

# CloudFront (optional - add after CloudFront setup)
# export AWS_CLOUDFRONT_ID=E1234567890ABC

# Google Analytics (optional)
# export GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# App version
export APP_VERSION=1.0.0
```

Load it before deployment:
```bash
source .env.aws
./aws-deploy.sh production
```

### Step 3: Run Deployment

```bash
# Make script executable (first time only)
chmod +x aws-deploy.sh

# Deploy
./aws-deploy.sh production
```

The deployment script will:

1. **Validate AWS credentials** - Ensure you're authenticated
2. **Pre-deployment checks** - Lint, typecheck, unit tests
3. **Build application** - Generate static files
4. **Create/verify S3 bucket** - Set up if needed
5. **Upload files** - With optimized cache headers:
   - Static assets (JS/CSS/images): 1 year cache
   - HTML files: No cache (always fresh)
   - Service Worker: No cache (critical for PWA updates)
   - Manifest: 1 day cache
6. **CloudFront invalidation** - Clear CDN cache (if configured)

### Step 4: Verify Deployment

Check these after deployment:

1. **S3 Website URL** works (shown after deployment)
2. **All pages load** (/, /game, /leaderboard, etc.)
3. **PWA install prompt** appears
4. **Offline mode** works (disable network in DevTools)
5. **Service Worker** registers (check DevTools → Application → Service Workers)

## Environment Configuration

### Production vs Staging

Deploy to different buckets for different environments:

**Production:**
```bash
export AWS_S3_BUCKET=riddle-rush-prod
./aws-deploy.sh production
```

**Staging:**
```bash
export AWS_S3_BUCKET=riddle-rush-staging
./aws-deploy.sh staging
```

**Development:**
```bash
export AWS_S3_BUCKET=riddle-rush-dev
./aws-deploy.sh development
```

### Environment-Specific Settings

For different configurations per environment, modify `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseUrl: '/',
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
      appVersion: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
    },
  },
})
```

## CloudFront Setup (Optional)

CloudFront provides:
- HTTPS support (required for production PWAs)
- Global CDN (faster loading worldwide)
- Custom domain support
- DDoS protection
- Better caching control

### Step 1: Create CloudFront Distribution

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click "Create Distribution"
3. **Origin Domain**: Select your S3 bucket from dropdown
   - **Important**: Use the S3 website endpoint format:
     `your-bucket.s3-website-us-east-1.amazonaws.com`
   - NOT the bucket name directly
4. **Origin Path**: Leave empty
5. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
6. **Allowed HTTP Methods**: GET, HEAD, OPTIONS
7. **Cache Policy**: CachingOptimized
8. **Price Class**: Use only North America and Europe (cheapest)
9. **Alternate Domain Names (CNAMEs)**: Add your custom domain (optional)
10. **SSL Certificate**: Default CloudFront certificate (or custom from ACM)
11. **Default Root Object**: `index.html`

### Step 2: Configure Custom Error Responses

For SPA routing to work, add custom error response:

1. Go to your distribution → Error Pages
2. Create custom error response:
   - **HTTP Error Code**: 403 Forbidden
   - **Customize Error Response**: Yes
   - **Response Page Path**: `/404.html`
   - **HTTP Response Code**: 200 OK
3. Create another for 404:
   - **HTTP Error Code**: 404 Not Found
   - **Customize Error Response**: Yes
   - **Response Page Path**: `/404.html`
   - **HTTP Response Code**: 200 OK

### Step 3: Update Deployment Script

Add CloudFront distribution ID to your environment:

```bash
# Get distribution ID from CloudFront console (e.g., E1234567890ABC)
export AWS_CLOUDFRONT_ID=E1234567890ABC

# Deploy (will now invalidate CloudFront cache)
./aws-deploy.sh production
```

### Step 4: Wait for Distribution Deployment

Initial CloudFront deployment takes 15-20 minutes. Status will change from "In Progress" to "Deployed".

Your app will then be available at:
```
https://d1234abcd5678.cloudfront.net
```

## Custom Domain Setup

### Step 1: Get SSL Certificate

1. Go to [AWS Certificate Manager (ACM)](https://console.aws.amazon.com/acm/)
2. **Important**: If using CloudFront, request certificate in **us-east-1** region
3. Click "Request certificate" → "Request a public certificate"
4. Enter domain names:
   - `yourdomain.com`
   - `www.yourdomain.com` (if you want both)
5. **Validation method**: DNS validation (recommended)
6. Click "Request"
7. Add the CNAME records to your DNS (provided by ACM)
8. Wait for validation (usually 5-30 minutes)

### Step 2: Update CloudFront Distribution

1. Go to CloudFront → Your distribution → Edit
2. **Alternate Domain Names (CNAMEs)**: Add `yourdomain.com`, `www.yourdomain.com`
3. **SSL Certificate**: Custom SSL certificate → Select your ACM certificate
4. Save changes

### Step 3: Configure DNS (Route 53 or External)

#### Using Route 53 (Recommended):

1. Go to [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Select your hosted zone (or create one)
3. Create record:
   - **Record name**: Leave empty (for apex) or `www`
   - **Record type**: A
   - **Alias**: Yes
   - **Route traffic to**: Alias to CloudFront distribution
   - **Distribution**: Select your CloudFront distribution
4. Repeat for www subdomain if needed

#### Using External DNS Provider:

Add CNAME record:
```
Type: CNAME
Name: www
Value: d1234abcd5678.cloudfront.net
TTL: 300
```

For apex domain (yourdomain.com), use ALIAS record if supported, or redirect to www.

### Step 4: Test

```bash
# Should show CloudFront IP
dig yourdomain.com

# Should load your app
curl -I https://yourdomain.com

# Visit in browser
open https://yourdomain.com
```

## Troubleshooting

### Deployment Script Fails

**Problem**: `AWS CLI is not installed`
**Solution**: Install AWS CLI (see Prerequisites)

**Problem**: `AWS credentials not configured`
**Solution**: Run `aws configure` with valid credentials

**Problem**: `Bucket name already exists`
**Solution**: Choose a different, globally unique bucket name

**Problem**: `Access Denied when creating bucket`
**Solution**: Check IAM permissions - need `s3:CreateBucket`, `s3:PutObject`, etc.

### Site Not Loading

**Problem**: S3 URL returns AccessDenied
**Solution**: Check bucket policy allows public read access:
```bash
aws s3api get-bucket-policy --bucket your-bucket-name
```

**Problem**: CloudFront shows 403 error
**Solution**:
- Verify origin is S3 website endpoint, not bucket name
- Check custom error responses are configured
- Check bucket policy allows CloudFront access

**Problem**: Old version still showing after deployment
**Solution**:
- Wait 5-15 minutes for CloudFront invalidation
- Clear browser cache: Ctrl+Shift+R (hard refresh)
- Check invalidation status in CloudFront console

### PWA Not Working

**Problem**: Service Worker won't register
**Solution**: PWAs require HTTPS - use CloudFront or custom domain with SSL

**Problem**: Install prompt not showing
**Solution**:
- Must be served over HTTPS
- User must visit site at least twice
- Check manifest.json is accessible

**Problem**: Offline mode not working
**Solution**:
- Check service worker registered in DevTools
- Check cache storage in DevTools → Application → Cache Storage
- Verify workbox files uploaded correctly

### Custom Domain Issues

**Problem**: SSL certificate stuck in "Pending validation"
**Solution**: Add CNAME records provided by ACM to your DNS

**Problem**: Domain shows "This site can't be reached"
**Solution**:
- Wait for DNS propagation (can take 24-48 hours)
- Verify CNAME points to CloudFront distribution
- Test with `dig yourdomain.com`

**Problem**: Mixed content warnings
**Solution**: Ensure all resources loaded over HTTPS, update any http:// URLs

## Cost Estimation

### S3 Costs (as of 2024)

**Storage**: $0.023 per GB/month
- App size: ~20 MB = $0.0005/month
- 1,000 deployments: ~$0.50/month

**Data Transfer**:
- First 1 GB/month: Free (AWS Free Tier)
- Next 9.999 TB: $0.09/GB
- 10,000 pageviews × 20 MB = 200 GB = ~$18/month

**Requests**:
- Free Tier: 2,000 PUT, 20,000 GET requests/month
- After: $0.005 per 1,000 PUT, $0.0004 per 1,000 GET

**Estimated S3 only**: $0-5/month for small traffic

### CloudFront Costs

**Data Transfer**:
- First 1 TB/month: $0.085/GB
- 200 GB = $17/month (cheaper than S3 alone!)

**Requests**:
- First 10M requests/month: $0.0075/10,000
- 100,000 requests = $0.075/month

**Estimated with CloudFront**: $1-20/month for small to medium traffic

### Free Tier Benefits (First 12 Months)

- **S3**: 5 GB storage, 20,000 GET, 2,000 PUT requests
- **CloudFront**: 1 TB data transfer out, 10M requests
- **Route 53**: Hosted zone ($0.50/month, not free)

**Estimated first year**: $0-1/month with free tier

### Production Recommendations

**Minimal Setup** ($0-5/month):
- S3 static hosting only
- Use S3 website URL
- Good for: Testing, internal apps, low traffic

**Recommended Setup** ($5-20/month):
- S3 + CloudFront
- Custom domain + SSL
- Good for: Production apps, public sites

**Enterprise Setup** ($50+/month):
- S3 + CloudFront + WAF
- Multiple regions
- CloudWatch monitoring & alerts
- Good for: High traffic, security-critical apps

## CI/CD Integration

### GitHub Actions Example

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

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.26.2

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to AWS
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_CLOUDFRONT_ID: ${{ secrets.AWS_CLOUDFRONT_ID }}
        run: |
          chmod +x aws-deploy.sh
          ./aws-deploy.sh production
```

Add secrets in GitHub: Settings → Secrets and variables → Actions

### GitLab CI Example

Add to `.gitlab-ci.yml`:

```yaml
deploy:aws:
  stage: deploy
  image: node:20
  before_script:
    - apt-get update && apt-get install -y awscli
    - corepack enable
    - corepack prepare pnpm@10.26.2 --activate
  script:
    - chmod +x aws-deploy.sh
    - ./aws-deploy.sh production
  environment:
    name: production-aws
    url: https://yourdomain.com
  only:
    - main
```

Add variables in GitLab: Settings → CI/CD → Variables

## Next Steps

After successful deployment:

1. ✅ Test all pages and features
2. ✅ Verify PWA installation works
3. ✅ Test offline functionality
4. ✅ Run E2E tests against deployed URL:
   ```bash
   BASE_URL=https://yourdomain.com pnpm run test:e2e
   ```
5. ✅ Set up monitoring (CloudWatch, Google Analytics)
6. ✅ Configure security headers (via CloudFront functions)
7. ✅ Set up backup/recovery procedures
8. ✅ Document runbook for team

## Support

- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: https://console.aws.amazon.com/support/
- Project Issues: https://github.com/yourusername/riddle-rush-nuxt-pwa/issues
