#!/bin/bash

# ===========================================
# AWS S3 + CloudFront Deployment Script
# ===========================================
# This script builds, tests and deploys the Guess Game PWA to AWS
# Usage: ./aws-deploy.sh [environment]
# Example: ./aws-deploy.sh production

set -e

# Configuration
ENVIRONMENT="${1:-production}"
S3_BUCKET="${AWS_S3_BUCKET:-guess-game-pwa}"
CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"
BUILD_DIR=".output/public"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AWS deployment for ${ENVIRONMENT}...${NC}"
echo "======================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo -e "\n🔑 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
echo -e "${GREEN}✓ AWS CLI configured${NC}"
echo -e "  Account: ${AWS_ACCOUNT}"
echo -e "  User: ${AWS_USER}"

# Pre-deployment checks
echo -e "\n🔍 Running pre-deployment checks..."

echo -e "\n📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo -e "\n✅ Running linter..."
pnpm run lint || { echo -e "${RED}❌ Lint failed${NC}"; exit 1; }

echo -e "\n🔷 Running type check..."
pnpm run typecheck || { echo -e "${RED}❌ Type check failed${NC}"; exit 1; }

echo -e "\n🧪 Running unit tests..."
pnpm run test:unit || { echo -e "${RED}❌ Tests failed${NC}"; exit 1; }

echo -e "${GREEN}✓ All pre-deployment checks passed${NC}"

# Build the application
echo -e "\n🏗️  Building application..."
BASE_URL=/ pnpm run generate

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory not found: $BUILD_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Verify build output
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
echo -e "  Files generated: ${FILE_COUNT}"

# Check if S3 bucket exists
echo -e "\n🪣 Checking S3 bucket: ${S3_BUCKET}..."
if ! aws s3 ls "s3://$S3_BUCKET" 2>&1 > /dev/null; then
    echo -e "${YELLOW}⚠️  Bucket doesn't exist. Creating...${NC}"

    # Create bucket
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3 mb "s3://$S3_BUCKET"
    else
        aws s3 mb "s3://$S3_BUCKET" --region "$AWS_REGION"
    fi

    # Configure bucket for static website hosting
    aws s3 website "s3://$S3_BUCKET" \
        --index-document index.html \
        --error-document 404.html

    # Set bucket policy for public read access
    cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${S3_BUCKET}/*"
        }
    ]
}
EOF

    aws s3api put-bucket-policy --bucket "$S3_BUCKET" --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json

    # Disable block public access (required for static website hosting)
    aws s3api put-public-access-block \
        --bucket "$S3_BUCKET" \
        --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

    echo -e "${GREEN}✓ Bucket created and configured for static website hosting${NC}"
else
    echo -e "${GREEN}✓ Bucket exists${NC}"
fi

# Upload to S3 with optimized caching
echo -e "\n☁️  Uploading to S3..."

# Upload static assets with long-term caching (1 year)
echo -e "  Uploading static assets (CSS, JS, images)..."
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "sw.js" \
    --exclude "workbox-*.js" \
    --exclude "manifest.json" \
    --exclude "*.xml" \
    --exclude "*.txt"

# Upload HTML files and service worker with no-cache
echo -e "  Uploading HTML files and service worker..."
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html; charset=utf-8"

# Upload service worker files with no-cache
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "sw.js" \
    --include "workbox-*.js" \
    --content-type "application/javascript; charset=utf-8"

# Upload manifest and other special files
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --cache-control "public, max-age=86400" \
    --exclude "*" \
    --include "manifest.json" \
    --include "*.xml" \
    --include "robots.txt"

echo -e "${GREEN}✓ Files uploaded to S3${NC}"

# Get upload stats
TOTAL_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
echo -e "  Total size: ${TOTAL_SIZE}"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_ID" ]; then
    echo -e "\n🔄 Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}✓ CloudFront cache invalidated (ID: ${INVALIDATION_ID})${NC}"
    echo -e "  Note: Invalidation may take 5-15 minutes to complete"
else
    echo -e "${YELLOW}⚠️  No CloudFront distribution ID provided. Skipping cache invalidation.${NC}"
    echo -e "${YELLOW}  Set AWS_CLOUDFRONT_ID environment variable to enable this.${NC}"
fi

# Display deployment URLs
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$CLOUDFRONT_ID" ]; then
    CF_DOMAIN=$(aws cloudfront get-distribution --id "$CLOUDFRONT_ID" --query 'Distribution.DomainName' --output text)
    echo -e "\n${BLUE}CloudFront URL:${NC}"
    echo -e "  ${GREEN}https://$CF_DOMAIN${NC}"
else
    echo -e "\n${BLUE}S3 Website URL:${NC}"
    echo -e "  ${GREEN}http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com${NC}"
fi

# Show additional recommendations
echo -e "\n${YELLOW}📋 Production Checklist:${NC}"
if [ -z "$CLOUDFRONT_ID" ]; then
    echo -e "  ${YELLOW}□${NC} Set up CloudFront distribution for HTTPS and better performance"
fi
echo -e "  ${YELLOW}□${NC} Configure custom domain with Route 53"
echo -e "  ${YELLOW}□${NC} Add SSL certificate from ACM"
echo -e "  ${YELLOW}□${NC} Configure security headers (CSP, HSTS, etc.)"
echo -e "  ${YELLOW}□${NC} Set up monitoring and alerts (CloudWatch)"
echo -e "  ${YELLOW}□${NC} Configure WAF rules if needed"

echo -e "\n${BLUE}Deployment log saved to: deployment-$(date +%Y%m%d-%H%M%S).log${NC}"

# Save deployment metadata
cat > deployment-info.json <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "bucket": "$S3_BUCKET",
  "region": "$AWS_REGION",
  "cloudfrontId": "$CLOUDFRONT_ID",
  "deployedBy": "$AWS_USER",
  "buildSize": "$TOTAL_SIZE",
  "fileCount": $FILE_COUNT
}
EOF

echo -e "${GREEN}✅ Done!${NC}"
