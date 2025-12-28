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
- **Default region**: `us-east-1` (or your preferred region)
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

**Optional: Set region** (default is us-east-1):
```bash
export AWS_REGION=us-east-1
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
