#!/bin/bash

# ===========================================
# Deploy Application (after infrastructure is ready)
# ===========================================
# This script loads Terraform outputs and deploys the application.
# It assumes infrastructure is already deployed via Terraform.
#
# For separate operations, use:
#   - terraform-plan.sh / terraform-apply.sh (infrastructure only)
#   - aws-deploy.sh (build/upload/invalidate only)
#
# Usage: ./scripts/deploy-infrastructure.sh [environment]
# Example: ./scripts/deploy-infrastructure.sh production

set -e

ENVIRONMENT="${1:-production}"

# Map short environment names to full folder names
case "${ENVIRONMENT}" in
dev)
	ENVIRONMENT="development"
	;;
prod | production)
	ENVIRONMENT="production"
	;;
staging)
	ENVIRONMENT="staging"
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

# Source the get-terraform-outputs script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/get-terraform-outputs.sh" "${ENVIRONMENT}"

# Check if outputs were retrieved
if [[ -z "${AWS_S3_BUCKET}" ]]; then
	echo -e "${RED}❌ Failed to get Terraform outputs${NC}"
	exit 1
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
./scripts/aws-deploy.sh "${ENVIRONMENT}"

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}Website URL: ${WEBSITE_URL}${NC}"
