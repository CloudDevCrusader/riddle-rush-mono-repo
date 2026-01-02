#!/bin/bash

# Script to find existing AWS resources for import

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Finding Existing AWS Resources${NC}"
echo "======================================"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

echo -e "\n${BLUE}S3 Buckets (matching 'riddle-rush'):${NC}"
aws s3 ls | grep -i riddle-rush || echo "  No matching buckets found"

echo -e "\n${BLUE}CloudFront Distributions:${NC}"
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Comment,DomainName]' --output table || echo "  No distributions found"

echo -e "\n${BLUE}To import, use:${NC}"
echo "  cd infrastructure/environments/prod"
echo "  ./import-existing.sh"
echo ""
echo "Or manually:"
echo "  terraform import aws_s3_bucket.website BUCKET_NAME"
echo "  terraform import aws_cloudfront_distribution.website DISTRIBUTION_ID"

