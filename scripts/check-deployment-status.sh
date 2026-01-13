#!/bin/bash
# ===========================================
# Check Deployment Status
# ===========================================
# This script checks if a deployment is working correctly by:
# 1. Verifying files are in S3
# 2. Checking CloudFront invalidation status
# 3. Testing the actual website
#
# Usage: ./scripts/check-deployment-status.sh [environment]
# Example: ./scripts/check-deployment-status.sh development

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
source "${SCRIPT_DIR}/lib/deploy-common.sh"

ENVIRONMENT="${1:-development}"

echo -e "${BLUE}🔍 Checking deployment status for ${ENVIRONMENT}...${NC}"
echo "=========================================="

# Load AWS configuration
load_aws_config "${ENVIRONMENT}"

echo -e "\n${CYAN}📋 Configuration:${NC}"
echo -e "  S3 Bucket: ${AWS_S3_BUCKET}"
echo -e "  CloudFront ID: ${AWS_CLOUDFRONT_ID:-not set}"
echo -e "  Region: ${AWS_REGION}"

# Check S3 bucket
echo -e "\n${CYAN}🪣 Checking S3 bucket...${NC}"
if aws s3 ls "s3://${AWS_S3_BUCKET}/" >/dev/null 2>&1; then
	echo -e "${GREEN}✓ Bucket accessible${NC}"
	
	# Count files
	FILE_COUNT=$(aws s3 ls "s3://${AWS_S3_BUCKET}/" --recursive 2>/dev/null | wc -l)
	echo -e "  Files in bucket: ${FILE_COUNT}"
	
	# Check for index.html
	if aws s3 ls "s3://${AWS_S3_BUCKET}/index.html" >/dev/null 2>&1; then
		echo -e "${GREEN}✓ index.html exists${NC}"
		
		# Get file timestamp
		LAST_MODIFIED=$(aws s3 ls "s3://${AWS_S3_BUCKET}/index.html" --recursive | awk '{print $1" "$2}' | head -1)
		echo -e "  Last modified: ${LAST_MODIFIED}"
	else
		echo -e "${RED}❌ index.html not found in bucket${NC}"
	fi
else
	echo -e "${RED}❌ Cannot access bucket${NC}"
	exit 1
fi

# Check CloudFront
if [[ -n "${AWS_CLOUDFRONT_ID}" ]]; then
	echo -e "\n${CYAN}☁️  Checking CloudFront...${NC}"
	
	# Get distribution status
	DIST_STATUS=$(aws cloudfront get-distribution --id "${AWS_CLOUDFRONT_ID}" \
		--query 'Distribution.Status' --output text 2>/dev/null || echo "")
	
	if [[ -n "${DIST_STATUS}" ]]; then
		echo -e "  Status: ${DIST_STATUS}"
		
		if [[ "${DIST_STATUS}" = "Deployed" ]]; then
			echo -e "${GREEN}✓ Distribution is deployed${NC}"
		else
			echo -e "${YELLOW}⚠️  Distribution is ${DIST_STATUS} (may take time to deploy)${NC}"
		fi
		
		# Get domain name
		CF_DOMAIN=$(aws cloudfront get-distribution --id "${AWS_CLOUDFRONT_ID}" \
			--query 'Distribution.DomainName' --output text 2>/dev/null || echo "")
		echo -e "  Domain: ${CF_DOMAIN}"
		
		# Check recent invalidations
		echo -e "\n  Recent invalidations:"
		aws cloudfront list-invalidations --distribution-id "${AWS_CLOUDFRONT_ID}" --max-items 3 \
			--query 'InvalidationList.Items[*].[Id,Status,CreateTime]' --output table 2>/dev/null || \
			echo -e "    ${YELLOW}Could not fetch invalidations${NC}"
	else
		echo -e "${YELLOW}⚠️  Could not get distribution status${NC}"
	fi
else
	echo -e "\n${YELLOW}⚠️  CloudFront ID not set${NC}"
fi

# Test website
echo -e "\n${CYAN}🌐 Testing website...${NC}"

if [[ "${ENVIRONMENT}" = "development" ]]; then
	TEST_URL="https://dev.riddlerush.de"
elif [[ "${ENVIRONMENT}" = "production" ]]; then
	TEST_URL="https://riddlerush.de"
else
	TEST_URL="https://${CF_DOMAIN:-unknown}"
fi

echo -e "  URL: ${TEST_URL}"

# Check if URL is accessible
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${TEST_URL}" || echo "000")

if [[ "${HTTP_CODE}" = "200" ]]; then
	echo -e "${GREEN}✓ Website is accessible (HTTP ${HTTP_CODE})${NC}"
	
	# Check if page has content
	PAGE_CONTENT=$(curl -s --max-time 10 "${TEST_URL}" | head -c 500)
	if echo "${PAGE_CONTENT}" | grep -q "Riddle Rush"; then
		echo -e "${GREEN}✓ Page contains expected content${NC}"
	else
		echo -e "${YELLOW}⚠️  Page may be empty or not loading correctly${NC}"
		echo -e "  First 200 chars: ${PAGE_CONTENT:0:200}..."
	fi
elif [[ "${HTTP_CODE}" = "000" ]]; then
	echo -e "${RED}❌ Website is not accessible (timeout or DNS error)${NC}"
else
	echo -e "${YELLOW}⚠️  Website returned HTTP ${HTTP_CODE}${NC}"
fi

# Recommendations
echo -e "\n${CYAN}💡 Recommendations:${NC}"

if [[ "${HTTP_CODE}" != "200" ]] || [[ -z "${PAGE_CONTENT}" ]] || ! echo "${PAGE_CONTENT}" | grep -q "Riddle Rush"; then
	echo -e "  1. ${YELLOW}Run deployment:${NC} ./scripts/deploy-dev.sh"
	echo -e "  2. ${YELLOW}Invalidate CloudFront cache:${NC}"
	if [[ -n "${AWS_CLOUDFRONT_ID}" ]]; then
		echo -e "     aws cloudfront create-invalidation --distribution-id ${AWS_CLOUDFRONT_ID} --paths '/*'"
	fi
	echo -e "  3. ${YELLOW}Wait 5-15 minutes for CloudFront propagation${NC}"
	echo -e "  4. ${YELLOW}Check browser console for JavaScript errors${NC}"
fi

echo -e "\n${GREEN}✅ Status check complete${NC}"
