#!/bin/bash

# Deploy script that uses Terraform outputs
# Usage: ./scripts/deploy-with-terraform.sh [environment]
# Example: ./scripts/deploy-with-terraform.sh prod

set -e

ENVIRONMENT="${1:-prod}"

# Normalize environment name for Terraform directory
TERRAFORM_ENV=""
case "$ENVIRONMENT" in
    development|dev)
        TERRAFORM_ENV="development"
        ;;
    production|prod)
        TERRAFORM_ENV="prod"
        ;;
    *)
        TERRAFORM_ENV="$ENVIRONMENT"
        ;;
esac

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying to ${ENVIRONMENT} using Terraform outputs...${NC}"
echo "=================================================="

# Get Terraform outputs
TERRAFORM_DIR="infrastructure/environments/${TERRAFORM_ENV}"

if [ ! -d "$TERRAFORM_DIR" ]; then
    echo -e "${RED}❌ Terraform directory not found: $TERRAFORM_DIR${NC}"
    exit 1
fi

# Sync Terraform outputs to JSON and .env files first
if [ -f "scripts/sync-terraform-outputs.sh" ]; then
    echo -e "${BLUE}🔄 Syncing Terraform outputs to JSON and .env files...${NC}"
    bash scripts/sync-terraform-outputs.sh "$TERRAFORM_ENV" || {
        echo -e "${YELLOW}⚠️  Failed to sync Terraform outputs, continuing with direct queries${NC}"
    }
fi

cd "$TERRAFORM_DIR" || exit 1

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    echo -e "${YELLOW}⚠️  Terraform not initialized. Initializing...${NC}"
    terraform init
fi

# Get Terraform outputs (validate what was synced)
echo -e "${BLUE}📋 Getting Terraform outputs...${NC}"
AWS_S3_BUCKET=$(terraform output -raw bucket_name 2>/dev/null || echo "")
AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "")
WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")

# Validate required outputs
if [ -z "$AWS_S3_BUCKET" ]; then
    echo -e "${RED}❌ Failed to get S3 bucket name from Terraform outputs${NC}"
    echo -e "${YELLOW}   Run 'terraform apply' in $TERRAFORM_DIR first${NC}"
    exit 1
fi

if [ -z "$AWS_CLOUDFRONT_ID" ]; then
    echo -e "${YELLOW}⚠️  CloudFront ID not found in Terraform outputs${NC}"
    echo -e "${YELLOW}   Cache invalidation will be skipped${NC}"
fi

if [ -z "$AWS_REGION" ]; then
    echo -e "${YELLOW}⚠️  AWS region not found in Terraform outputs, using default${NC}"
    AWS_REGION="eu-central-1"
fi

cd - > /dev/null || exit 1

echo -e "${GREEN}✅ Terraform outputs retrieved:${NC}"
echo -e "  S3 Bucket: $AWS_S3_BUCKET"
echo -e "  CloudFront ID: ${AWS_CLOUDFRONT_ID:-not set}"
echo -e "  AWS Region: $AWS_REGION"
if [ -n "$WEBSITE_URL" ]; then
    echo -e "  Website URL: $WEBSITE_URL"
fi

# Build the application
echo -e "\n${BLUE}📦 Building application...${NC}"
cd apps/game || exit 1
pnpm run generate
cd ../..

# Deploy using aws-deploy.sh with Terraform outputs
echo -e "\n${BLUE}☁️  Deploying to AWS...${NC}"
export AWS_S3_BUCKET
export AWS_CLOUDFRONT_ID
export AWS_REGION
./aws-deploy.sh "${ENVIRONMENT}"

# Get final website URL from Terraform if not already set
if [ -z "$WEBSITE_URL" ]; then
    cd "$TERRAFORM_DIR" || exit 1
    WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")
    cd - > /dev/null || exit 1
fi

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
if [ -n "$WEBSITE_URL" ]; then
    echo -e "${BLUE}Website URL: ${WEBSITE_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  Website URL not available from Terraform outputs${NC}"
fi

