#!/bin/bash

# AWS S3 + CloudFront Deployment Script
# This script builds and deploys the Guess Game PWA to AWS

set -e

echo "🚀 Starting AWS deployment..."

# Configuration (set these environment variables or modify directly)
S3_BUCKET="${AWS_S3_BUCKET:-guess-game-pwa}"
CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"
BUILD_DIR=".output/public"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI configured${NC}"

# Build the application
echo -e "\n📦 Building application..."
pnpm run generate

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory not found: $BUILD_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Check if S3 bucket exists
echo -e "\n🪣 Checking S3 bucket..."
if aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}⚠ Bucket doesn't exist. Creating...${NC}"
    aws s3 mb "s3://$S3_BUCKET" --region "$AWS_REGION"

    # Enable static website hosting
    aws s3 website "s3://$S3_BUCKET" \
        --index-document index.html \
        --error-document 404.html

    echo -e "${GREEN}✓ Bucket created and configured${NC}"
else
    echo -e "${GREEN}✓ Bucket exists${NC}"
fi

# Upload to S3
echo -e "\n☁️  Uploading to S3..."
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "sw.js" \
    --exclude "workbox-*.js"

# Upload HTML files with no-cache
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --include "sw.js" \
    --include "workbox-*.js" \
    --content-type "text/html"

echo -e "${GREEN}✓ Files uploaded to S3${NC}"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_ID" ]; then
    echo -e "\n🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*" > /dev/null
    echo -e "${GREEN}✓ CloudFront cache invalidated${NC}"
else
    echo -e "${YELLOW}⚠ No CloudFront distribution ID provided. Skipping cache invalidation.${NC}"
    echo -e "${YELLOW}  Set AWS_CLOUDFRONT_ID environment variable to enable this.${NC}"
fi

# Get website URL
if [ -n "$CLOUDFRONT_ID" ]; then
    CF_DOMAIN=$(aws cloudfront get-distribution --id "$CLOUDFRONT_ID" --query 'Distribution.DomainName' --output text)
    echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
    echo -e "CloudFront URL: ${GREEN}https://$CF_DOMAIN${NC}"
else
    echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
    echo -e "S3 Website URL: ${GREEN}http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com${NC}"
fi

echo -e "\n${YELLOW}Note: For production, you should:${NC}"
echo -e "  1. Set up CloudFront distribution"
echo -e "  2. Configure custom domain with Route 53"
echo -e "  3. Add SSL certificate from ACM"
echo -e "  4. Configure proper CORS and security headers"
