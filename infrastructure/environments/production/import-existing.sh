#!/bin/bash

# Script to import existing production infrastructure
# This imports your current AWS resources into Terraform state

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📥 Importing Existing Production Infrastructure${NC}"
echo "=================================================="

# Check if terraform is available
if ! command -v terraform &>/dev/null; then
	echo -e "${RED}❌ Terraform not found. Run 'pnpm run infra:setup' first${NC}"
	exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
	echo -e "${RED}❌ AWS credentials not configured${NC}"
	exit 1
fi

# Prompt for existing resource names
echo -e "\n${BLUE}Enter your existing AWS resource names:${NC}"
read -p "Existing S3 bucket name (or press Enter to skip): " BUCKET_NAME
read -p "Existing CloudFront distribution ID (or press Enter to skip): " CLOUDFRONT_ID

if [[ -z "${BUCKET_NAME}" ]] && [[ -z "${CLOUDFRONT_ID}" ]]; then
	echo -e "${YELLOW}⚠️  No resources specified${NC}"
	echo ""
	echo -e "${BLUE}To import manually, run:${NC}"
	echo "  terraform import aws_s3_bucket.website your-bucket-name"
	echo "  terraform import aws_cloudfront_distribution.website E1234567890ABC"
	echo ""
	echo -e "${BLUE}Or find your resources:${NC}"
	echo "  aws s3 ls | grep riddle-rush"
	echo "  aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Comment]' --output table"
	exit 0
fi

echo -e "\n${BLUE}Initializing Terraform...${NC}"
terraform init

echo -e "\n${BLUE}Importing resources...${NC}"

# Import S3 bucket if specified
if [[ -n "${BUCKET_NAME}" ]]; then
	echo -e "${GREEN}Importing S3 bucket: ${BUCKET_NAME}${NC}"
	terraform import aws_s3_bucket.website "${BUCKET_NAME}" || {
		echo -e "${YELLOW}⚠️  S3 bucket import failed. You may need to import manually${NC}"
	}

	# Import related resources
	terraform import aws_s3_bucket_versioning.website "${BUCKET_NAME}" 2>/dev/null || true
	terraform import aws_s3_bucket_public_access_block.website "${BUCKET_NAME}" 2>/dev/null || true
	terraform import aws_s3_bucket_website_configuration.website "${BUCKET_NAME}" 2>/dev/null || true
	terraform import aws_s3_bucket_lifecycle_configuration.website "${BUCKET_NAME}" 2>/dev/null || true
fi

# Import CloudFront distribution if specified
if [[ -n "${CLOUDFRONT_ID}" ]]; then
	echo -e "${GREEN}Importing CloudFront distribution: ${CLOUDFRONT_ID}${NC}"
	terraform import aws_cloudfront_distribution.website "${CLOUDFRONT_ID}" || {
		echo -e "${YELLOW}⚠️  CloudFront import failed. You may need to import manually${NC}"
	}

	# Import OAC (may need to be created if using old OAI)
	echo -e "${YELLOW}Note: If using old OAI, you may need to migrate to OAC${NC}"
fi

echo -e "\n${BLUE}Running terraform plan to verify...${NC}"
terraform plan

echo -e "\n${GREEN}✅ Import complete!${NC}"
echo -e "${BLUE}Review the plan above and run 'terraform apply' if everything looks correct${NC}"
