#!/bin/bash

# Script to get Terraform outputs and export them as environment variables
# Usage: source ./scripts/get-terraform-outputs.sh [environment]
# Example: source ./scripts/get-terraform-outputs.sh prod

set -e

ENVIRONMENT="${1:-prod}"
INFRA_DIR="infrastructure/environments/${ENVIRONMENT}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📤 Getting Terraform outputs for ${ENVIRONMENT}...${NC}"

# Check if directory exists
if [ ! -d "$INFRA_DIR" ]; then
    echo -e "${RED}❌ Environment directory not found: ${INFRA_DIR}${NC}"
    exit 1
fi

# Check if terraform is available
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform not found. Run 'pnpm run infra:setup' first${NC}"
    exit 1
fi

# Navigate to environment directory
cd "$INFRA_DIR"

# Check if initialized
if [ ! -d ".terraform" ]; then
    echo -e "${YELLOW}⚠️  Terraform not initialized. Running init...${NC}"
    terraform init
fi

# Get outputs
echo -e "${BLUE}Fetching outputs...${NC}"

# Export outputs as environment variables
export AWS_S3_BUCKET=$(terraform output -raw bucket_name 2>/dev/null || echo "")
export AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
export AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "eu-central-1")
export CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo "")
export WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")

# Go back to project root
cd - > /dev/null

# Display outputs
echo -e "\n${GREEN}✅ Terraform outputs exported:${NC}"
echo -e "  ${BLUE}AWS_S3_BUCKET${NC}=${AWS_S3_BUCKET}"
echo -e "  ${BLUE}AWS_CLOUDFRONT_ID${NC}=${AWS_CLOUDFRONT_ID}"
echo -e "  ${BLUE}AWS_REGION${NC}=${AWS_REGION}"
echo -e "  ${BLUE}CLOUDFRONT_DOMAIN${NC}=${CLOUDFRONT_DOMAIN}"
echo -e "  ${BLUE}WEBSITE_URL${NC}=${WEBSITE_URL}"

echo -e "\n${BLUE}💡 To use these in your current shell:${NC}"
echo -e "  ${YELLOW}source ./scripts/get-terraform-outputs.sh ${ENVIRONMENT}${NC}"

