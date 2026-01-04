#!/bin/bash

# ===========================================
# AWS S3 + CloudFront Deployment Script
# ===========================================
# This script builds, uploads, and invalidates CloudFront cache.
# It does NOT manage Terraform infrastructure.
#
# Usage: ./scripts/aws-deploy.sh [environment]
# Example: ./scripts/aws-deploy.sh production
#
# This script handles:
#   - Building the application
#   - Uploading to S3
#   - Invalidating CloudFront cache
#
# This script does NOT handle:
#   - Terraform plan/apply (use terraform-plan.sh / terraform-apply.sh)
#   - Infrastructure management
#
# Environment variables required:
#   - AWS_S3_BUCKET (from Terraform outputs or environment)
#   - AWS_CLOUDFRONT_ID (from Terraform outputs, optional)
#   - AWS_REGION (from Terraform outputs or environment)
#   - NODE_ENV (production or development)
#
# Optional environment variables:
#   - SKIP_PRE_DEPLOYMENT_CHECKS (if set, skips lint/typecheck/tests)

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Source common functions if available
if [ -f "$SCRIPT_DIR/lib/deploy-common.sh" ]; then
    source "$SCRIPT_DIR/lib/deploy-common.sh"
else
    # Fallback colors if common lib not available
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
fi

# Configuration
ENVIRONMENT="${1:-production}"
S3_BUCKET="${AWS_S3_BUCKET:-riddle-rush-pwa}"
CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID:-}"
AWS_REGION="${AWS_REGION:-eu-central-1}"
BUILD_DIR="apps/game/.output/public"

echo -e "${BLUE}🚀 Starting AWS deployment for ${ENVIRONMENT}...${NC}"
echo "======================================="

# Display configuration
echo -e "\n${BLUE}Deployment Configuration:${NC}"
echo -e "  ${BLUE}Environment:${NC} ${ENVIRONMENT}"
echo -e "  ${BLUE}S3 Bucket:${NC} ${S3_BUCKET}"
echo -e "  ${BLUE}Region:${NC} ${AWS_REGION}"
if [ -n "$CLOUDFRONT_ID" ]; then
    echo -e "  ${BLUE}CloudFront ID:${NC} ${CLOUDFRONT_ID}"
fi
echo ""

# Check AWS CLI (only if not called from deploy scripts)
if [ -z "$SKIP_AWS_CHECKS" ]; then
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
else
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2 2>/dev/null || echo "unknown")
fi

# Pre-deployment checks (skip if already done by calling script)
if [ -z "$SKIP_PRE_DEPLOYMENT_CHECKS" ]; then
    echo -e "\n🔍 Running pre-deployment checks..."
    
    echo -e "\n📦 Installing dependencies..."
    pnpm install --frozen-lockfile
    
    echo -e "\n✅ Running linter..."
    (cd apps/game && pnpm run lint) || {
        echo -e "${RED}❌ Lint failed${NC}"
        exit 1
    }
    
    echo -e "\n🔷 Running type check..."
    (cd apps/game && pnpm run typecheck) || {
        echo -e "${RED}❌ Type check failed${NC}"
        exit 1
    }
    
    echo -e "\n🧪 Running unit tests..."
    (cd apps/game && pnpm run test:unit) || {
        echo -e "${RED}❌ Tests failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✓ All pre-deployment checks passed${NC}"
fi

# Build the application
if [ ! -d "$BUILD_DIR" ] || [ -z "$SKIP_PRE_DEPLOYMENT_CHECKS" ]; then
    echo -e "\n🏗️  Building application..."
    # Use NODE_ENV if set, otherwise default to production
    if [ -z "$NODE_ENV" ]; then
        export NODE_ENV=production
    fi
    echo -e "  ${BLUE}Building with NODE_ENV=${NODE_ENV}${NC}"
    (cd apps/game && BASE_URL=/ pnpm run generate)
    
    if [ -z "$CI" ]; then
        echo -e "${GREEN}✓ Build completed${NC}"
    fi
fi

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory not found: $BUILD_DIR${NC}"
    exit 1
fi

# Verify build output
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
echo -e "  Files generated: ${FILE_COUNT}"

# Ensure S3 bucket exists (Terraform should have created it, but check anyway)
echo -e "\n🪣 Checking S3 bucket: ${S3_BUCKET}..."
if ! aws s3 ls "s3://$S3_BUCKET" 2>&1 > /dev/null; then
    echo -e "${YELLOW}⚠️  Bucket doesn't exist. Creating...${NC}"
    echo -e "${YELLOW}   Note: This should be managed by Terraform. Consider running terraform apply.${NC}"
    
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
    # Wait a moment to ensure CloudFront distribution is ready after Terraform deployment
    echo -e "\n⏳ Waiting for CloudFront distribution to be ready before invalidation..."
    sleep 5
    
    # Check if distribution is ready (optional check, won't fail if it times out)
    status=$(aws cloudfront get-distribution --id "$CLOUDFRONT_ID" \
        --query 'Distribution.Status' --output text 2>/dev/null || echo "")
    
    if [ "$status" != "Deployed" ] && [ -n "$status" ]; then
        echo -e "${YELLOW}⚠️  CloudFront status: ${status} (not yet Deployed)${NC}"
        echo -e "${YELLOW}   Waiting additional 10 seconds...${NC}"
        sleep 10
    fi
    
    echo -e "\n🔄 Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$INVALIDATION_ID" ]; then
        echo -e "${GREEN}✓ CloudFront cache invalidated (Invalidation ID: ${INVALIDATION_ID})${NC}"
        echo -e "  Note: Invalidation may take 5-15 minutes to complete"
    else
        echo -e "${RED}❌ Failed to create CloudFront invalidation${NC}"
        echo -e "${YELLOW}   This may happen if the distribution was just created/updated${NC}"
        echo -e "${YELLOW}   Try running the invalidation manually later:${NC}"
        echo -e "${YELLOW}   aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths '/*'${NC}"
    fi
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

# Show additional recommendations (only for production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "\n${YELLOW}📋 Production Checklist:${NC}"
    if [ -z "$CLOUDFRONT_ID" ]; then
        echo -e "  ${YELLOW}□${NC} Set up CloudFront distribution for HTTPS and better performance"
    fi
    echo -e "  ${YELLOW}□${NC} Configure custom domain with Route 53"
    echo -e "  ${YELLOW}□${NC} Add SSL certificate from ACM"
    echo -e "  ${YELLOW}□${NC} Configure security headers (CSP, HSTS, etc.)"
    echo -e "  ${YELLOW}□${NC} Set up monitoring and alerts (CloudWatch)"
    echo -e "  ${YELLOW}□${NC} Configure WAF rules if needed"
fi

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

echo -e "\n${GREEN}✅ Done!${NC}"
