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
export AWS_S3_BUCKET="my-guess-game-pwa"

# Optional: Set CloudFront distribution ID for cache invalidation
export AWS_CLOUDFRONT_ID="E1234567890ABC"

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
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::your-bucket-name",
      "arn:aws:s3:::your-bucket-name/*"
    ]
  }]
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
