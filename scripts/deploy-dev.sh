#!/bin/bash
# ===========================================
# Deploy Development Environment to AWS
# ===========================================
# Usage: ./scripts/deploy-dev.sh
#
# This script deploys the development environment to AWS S3 + CloudFront.
# It loads AWS configuration from Terraform outputs or environment variables.

set -e

ENVIRONMENT="development"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying to DEVELOPMENT environment (AWS)${NC}"
echo "=========================================="

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

# Load AWS configuration from Terraform outputs or .env.terraform
echo -e "\n📋 Loading AWS configuration..."

# Try to load from Terraform outputs first
if [ -f "infrastructure/environments/development/.env.terraform" ]; then
    echo -e "${BLUE}Loading from Terraform outputs...${NC}"
    source infrastructure/environments/development/.env.terraform
    echo -e "${GREEN}✓ Loaded from .env.terraform${NC}"
elif command -v terraform &> /dev/null && [ -d "infrastructure/environments/development" ]; then
    echo -e "${BLUE}Fetching Terraform outputs...${NC}"
    cd infrastructure/environments/development
    if [ -d ".terraform" ]; then
        export AWS_S3_BUCKET=$(terraform output -raw bucket_name 2>/dev/null || echo "")
        export AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
        export AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "eu-central-1")
        cd - > /dev/null
        echo -e "${GREEN}✓ Loaded from Terraform outputs${NC}"
    else
        cd - > /dev/null
        echo -e "${YELLOW}⚠️  Terraform not initialized. Using environment variables or defaults.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Terraform not available. Using environment variables.${NC}"
fi

# Set defaults if not provided
export AWS_S3_BUCKET="${AWS_S3_BUCKET:-riddle-rush-pwa-dev}"
export AWS_REGION="${AWS_REGION:-eu-central-1}"
# CloudFront ID is optional
export AWS_CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID:-}"

# Set development environment variables early
export NODE_ENV=development

# Display configuration
echo -e "\n${BLUE}Deployment Configuration:${NC}"
echo -e "  ${BLUE}Environment:${NC} ${ENVIRONMENT}"
echo -e "  ${BLUE}NODE_ENV:${NC} ${NODE_ENV} ${GREEN}(development features enabled)${NC}"
echo -e "  ${BLUE}S3 Bucket:${NC} ${AWS_S3_BUCKET}"
echo -e "  ${BLUE}Region:${NC} ${AWS_REGION}"
if [ -n "$AWS_CLOUDFRONT_ID" ]; then
    echo -e "  ${BLUE}CloudFront ID:${NC} ${AWS_CLOUDFRONT_ID}"
else
    echo -e "  ${YELLOW}CloudFront ID:${NC} Not configured (optional)"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "\n${YELLOW}⚠️  Warning: .env file not found. Copy from .env.example${NC}"
    echo "   cp .env.example .env"
fi

# Run pre-deployment checks
echo -e "\n🔍 Running pre-deployment checks..."
echo ""

echo -e "${BLUE}📦 Installing dependencies...${NC}"
corepack enable
corepack prepare pnpm@10.27.0 --activate
pnpm install --frozen-lockfile

echo -e "\n${BLUE}✅ Running linter...${NC}"
pnpm run lint || { echo -e "${RED}❌ Lint failed${NC}"; exit 1; }

echo -e "\n${BLUE}🔷 Running type check...${NC}"
pnpm run typecheck || { echo -e "${RED}❌ Type check failed${NC}"; exit 1; }

echo -e "\n${BLUE}🧪 Running unit tests...${NC}"
pnpm run test:unit || { echo -e "${RED}❌ Tests failed${NC}"; exit 1; }

echo -e "\n${GREEN}✓ All pre-deployment checks passed!${NC}"

# Deploy to AWS using aws-deploy.sh
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}☁️  Deploying to AWS...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Ensure aws-deploy.sh is executable
chmod +x aws-deploy.sh

# Set development environment variables
export NODE_ENV=development
export BASE_URL=/

echo -e "${BLUE}Development features enabled:${NC}"
echo -e "  ${GREEN}✓ NODE_ENV=development${NC} (enables dev plugins, sourcemaps, keeps console logs)"
echo -e "  ${GREEN}✓ Dev plugins:${NC} inspect, vue-devtools, visualizer"
echo -e "  ${GREEN}✓ Sourcemaps:${NC} enabled for debugging"
echo -e "  ${GREEN}✓ Console logs:${NC} preserved (not removed)"

# Call aws-deploy.sh with development environment
# The script will handle building and deployment
# NODE_ENV will be inherited by the build process
./aws-deploy.sh "$ENVIRONMENT"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Development deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Display deployment URL if CloudFront is configured
if [ -n "$AWS_CLOUDFRONT_ID" ]; then
    CF_DOMAIN=$(aws cloudfront get-distribution --id "$AWS_CLOUDFRONT_ID" --query 'Distribution.DomainName' --output text 2>/dev/null || echo "")
    if [ -n "$CF_DOMAIN" ]; then
        echo -e "\n${BLUE}🌐 Development URL:${NC}"
        echo -e "  ${GREEN}https://$CF_DOMAIN${NC}"
    fi
else
    echo -e "\n${BLUE}🌐 Development URL:${NC}"
    echo -e "  ${GREEN}http://$AWS_S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com${NC}"
fi

echo -e "\n${BLUE}💡 Tips:${NC}"
echo -e "  - Run E2E tests: ${YELLOW}BASE_URL=https://your-domain.com pnpm run test:e2e${NC}"
echo -e "  - Check CloudFront invalidation status in AWS Console"
echo -e "  - Monitor deployment in AWS S3 Console"

echo -e "\n${GREEN}✅ Done!${NC}"
