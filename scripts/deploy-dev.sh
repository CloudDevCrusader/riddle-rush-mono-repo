#!/bin/bash
# ===========================================
# Deploy Development Environment to AWS
# ===========================================
# Usage: ./scripts/deploy-dev.sh
# Example: ./scripts/deploy-dev.sh
#
# This script deploys the development environment to AWS S3 + CloudFront.
# It loads AWS configuration from Terraform outputs or environment variables.
#
# Note: Infrastructure must be deployed separately using terraform-plan.sh and terraform-apply.sh

set -e

# Get script directory and source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/lib/deploy-common.sh"

ENVIRONMENT="development"

echo -e "${BLUE}🚀 Deploying to DEVELOPMENT environment (AWS)${NC}"
echo "=========================================="

# AWS checks
check_aws_cli
check_aws_credentials

# Load AWS configuration
echo -e "\n📋 Loading AWS configuration..."
load_aws_config "$ENVIRONMENT"

# Set development environment variables
export NODE_ENV=development

# Display configuration
display_deployment_config "$ENVIRONMENT" "$NODE_ENV"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "\n${YELLOW}⚠️  Warning: .env file not found. Copy from .env.example${NC}"
    echo "   cp .env.example .env"
fi

# Run pre-deployment checks
run_pre_deployment_checks

# Deploy to AWS using aws-deploy.sh
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}☁️  Deploying to AWS...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Ensure aws-deploy.sh is executable
chmod +x "$SCRIPT_DIR/aws-deploy.sh"

# Set development environment variables
export NODE_ENV=development
export BASE_URL=/

# Ensure Terraform outputs are exported for aws-deploy.sh
export AWS_S3_BUCKET="$AWS_S3_BUCKET"
export AWS_CLOUDFRONT_ID="$AWS_CLOUDFRONT_ID"
export AWS_REGION="$AWS_REGION"

echo -e "${BLUE}Development features enabled:${NC}"
echo -e "  ${GREEN}✓ NODE_ENV=development${NC} (enables dev plugins, sourcemaps, keeps console logs)"
echo -e "  ${GREEN}✓ Dev plugins:${NC} inspect, vue-devtools, visualizer"
echo -e "  ${GREEN}✓ Sourcemaps:${NC} enabled for debugging"
echo -e "  ${GREEN}✓ Console logs:${NC} preserved (not removed)"
echo -e "\n${BLUE}Using infrastructure:${NC}"
echo -e "  ${GREEN}✓ S3 Bucket:${NC} ${AWS_S3_BUCKET}"
echo -e "  ${GREEN}✓ Region:${NC} ${AWS_REGION}"
if [ -n "$AWS_CLOUDFRONT_ID" ]; then
    echo -e "  ${GREEN}✓ CloudFront:${NC} ${AWS_CLOUDFRONT_ID}"
fi

# Call aws-deploy.sh with development environment
export SKIP_PRE_DEPLOYMENT_CHECKS=true
cd "$SCRIPT_DIR/.."
./scripts/aws-deploy.sh "$ENVIRONMENT"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Development deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Display deployment URL
CURRENT_URL=$(display_deployment_url "$ENVIRONMENT")

echo -e "\n${BLUE}💡 Tips:${NC}"
echo -e "  - Run E2E tests: ${YELLOW}BASE_URL=${CURRENT_URL} pnpm run test:e2e${NC}"
echo -e "  - Check CloudFront invalidation status in AWS Console"
echo -e "  - Monitor deployment in AWS S3 Console"
echo -e "  - To manage infrastructure: ${YELLOW}./scripts/terraform-plan.sh development${NC} and ${YELLOW}./scripts/terraform-apply.sh development${NC}"

echo -e "\n${GREEN}✅ Done!${NC}"
