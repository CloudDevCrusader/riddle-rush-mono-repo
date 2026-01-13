#!/bin/bash
# ===========================================
# Deploy Production Environment to AWS
# ===========================================
# Usage: ./scripts/deploy-prod.sh [options] [version]
# Example: ./scripts/deploy-prod.sh 1.2.0
#         ./scripts/deploy-prod.sh --skip-checks 1.2.0
#         ./scripts/deploy-prod.sh --dry-run 1.2.0
#
# This script deploys the production environment to AWS S3 + CloudFront.
# It loads AWS configuration from Terraform outputs or environment variables.
# Optional: Provide a version number to create a git tag.
#
# Options:
#   --skip-checks    Skip pre-deployment checks (lint, typecheck, tests)
#   --dry-run        Perform all checks but don't actually deploy
#   --help           Show this help message
#
# Note: Infrastructure must be deployed separately using terraform-plan.sh and terraform-apply.sh

set -e
set -o pipefail

# Parse command line arguments
SKIP_CHECKS=false
DRY_RUN=false
VERSION=""

for arg in "$@"; do
	case "${arg}" in
	--skip-checks)
		SKIP_CHECKS=true
		;;
	--dry-run)
		DRY_RUN=true
		;;
	--help)
		echo "Usage: $0 [options] [version]"
		echo "Options:"
		echo "  --skip-checks    Skip pre-deployment checks"
		echo "  --dry-run        Perform all checks but don't actually deploy"
		echo "  --help           Show this help message"
		exit 0
		;;
	*)
		# Assume it's a version number
		if [[ -z "${VERSION}" ]] && [[ ${arg} =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
			VERSION="${arg}"
		else
			echo "Unknown option: ${arg}"
			exit 1
		fi
		;;
	esac
done

# Export flags
if [[ "${SKIP_CHECKS}" = true ]]; then
	export SKIP_PRE_DEPLOYMENT_CHECKS=true
fi

if [[ "${DRY_RUN}" = true ]]; then
	echo -e "${YELLOW}🔍 DRY RUN MODE: All checks will be performed but deployment will be skipped${NC}"
	export DRY_RUN=true
fi

# Get script directory and source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${SCRIPT_DIR}/lib/deploy-common.sh"

ENVIRONMENT="production"

# Version is already parsed above, no need to parse again
if [[ -n "${VERSION}" ]]; then
	echo -e "\n${BLUE}🏷️  Version: v${VERSION}${NC}"
fi

echo -e "${BLUE}🚀 Deploying to PRODUCTION environment (AWS)${NC}"
echo "=========================================="

# Git checks
check_git_branch "main staging"
check_git_status

# AWS checks
check_aws_cli
check_aws_credentials

# Load AWS configuration
echo -e "\n📋 Loading AWS configuration..."
load_aws_config "${ENVIRONMENT}"

# Set production environment variables
export NODE_ENV=production

# Display configuration
display_deployment_config "${ENVIRONMENT}" "${NODE_ENV}" "${VERSION}"

# Check if .env exists
if [[ ! -f ".env" ]]; then
	echo -e "\n${YELLOW}⚠️  Warning: .env file not found. Copy from .env.example${NC}"
	echo "   cp .env.example .env"
fi

# Run pre-deployment checks
run_pre_deployment_checks

# Version tagging (before deployment)
create_version_tag "${VERSION}"

# Deploy to AWS using aws-deploy.sh
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}☁️  Deploying to AWS...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Ensure aws-deploy.sh is executable
chmod +x "${SCRIPT_DIR}/aws-deploy.sh"

# Set production environment variables
export NODE_ENV=production
export BASE_URL=/

# Ensure Terraform outputs are exported for aws-deploy.sh
export AWS_S3_BUCKET="${AWS_S3_BUCKET}"
export AWS_CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID}"
export AWS_REGION="${AWS_REGION}"

echo -e "${BLUE}Production build enabled:${NC}"
echo -e "  ${GREEN}✓ NODE_ENV=production${NC} (optimized build, no dev plugins, console logs removed)"
echo -e "\n${BLUE}Using infrastructure:${NC}"
echo -e "  ${GREEN}✓ S3 Bucket:${NC} ${AWS_S3_BUCKET}"
echo -e "  ${GREEN}✓ Region:${NC} ${AWS_REGION}"
if [[ -n "${AWS_CLOUDFRONT_ID}" ]]; then
	echo -e "  ${GREEN}✓ CloudFront:${NC} ${AWS_CLOUDFRONT_ID}"
fi

# Call aws-deploy.sh with production environment
export SKIP_PRE_DEPLOYMENT_CHECKS=true
cd "${SCRIPT_DIR}/.."
./scripts/aws-deploy.sh "${ENVIRONMENT}"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Production deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Display deployment URL
display_deployment_url "${ENVIRONMENT}" | head -n -1

# Push version tag if created
push_version_tag "${VERSION}"

echo -e "\n${BLUE}💡 Tips:${NC}"
echo -e "  - Run E2E tests: ${YELLOW}BASE_URL=https://your-domain.com pnpm run test:e2e${NC}"
echo -e "  - Check CloudFront invalidation status in AWS Console"
echo -e "  - Monitor deployment in AWS S3 Console"
echo -e "  - Verify PWA installation and offline functionality"
echo -e "  - To manage infrastructure: ${YELLOW}./scripts/terraform-plan.sh production${NC} and ${YELLOW}./scripts/terraform-apply.sh production${NC}"

echo -e "\n${GREEN}✅ Done!${NC}"
