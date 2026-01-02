#!/bin/bash
# Run E2E tests against deployed GitLab Pages site

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get environment (production, staging, or dev)
ENVIRONMENT=${1:-production}

# Set base URL based on environment
case $ENVIRONMENT in
  production)
    # Note: GitLab Pages now hosts documentation, not the app
    # Use AWS deployment URL instead
    BASE_URL="${AWS_CLOUDFRONT_DOMAIN:-https://your-cloudfront-domain.cloudfront.net}"
    ;;
  staging)
    BASE_URL="${AWS_CLOUDFRONT_DOMAIN_STAGING:-https://your-staging-domain.cloudfront.net}"
    ;;
  dev)
    BASE_URL="${AWS_CLOUDFRONT_DOMAIN_DEV:-https://your-dev-domain.cloudfront.net}"
    ;;
  *)
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [production|staging|dev]"
    exit 1
    ;;
esac

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Running E2E tests against $ENVIRONMENT${NC}"
echo -e "${BLUE}URL: $BASE_URL${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if the site is reachable
echo -e "${BLUE}Checking if site is reachable...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|301\|302"; then
  echo -e "${GREEN}✓ Site is reachable${NC}"
else
  echo -e "${RED}✗ Site is not reachable at $BASE_URL${NC}"
  echo -e "${RED}Please check if the site is deployed${NC}"
  exit 1
fi

echo ""

# Run Playwright tests
echo -e "${BLUE}Running Playwright tests...${NC}"
BASE_URL=$BASE_URL npx playwright test

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}E2E tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"
