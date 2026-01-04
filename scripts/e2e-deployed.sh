#!/bin/bash
# Run E2E tests against deployed AWS sites (S3 + CloudFront)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get environment (production, staging, or dev)
ENVIRONMENT=${1:-production}

# Normalize environment name for Terraform directory
TERRAFORM_ENV=""
case "$ENVIRONMENT" in
    production|prod)
        TERRAFORM_ENV="prod"
        ;;
    development|dev)
        TERRAFORM_ENV="development"
        ;;
    staging)
        TERRAFORM_ENV="staging"
        ;;
    *)
        echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
        echo "Usage: $0 [production|staging|dev]"
        exit 1
        ;;
esac

# Try to get CloudFront domain from Terraform outputs
TERRAFORM_DIR="infrastructure/environments/${TERRAFORM_ENV}"
BASE_URL=""

if [ -d "$TERRAFORM_DIR" ] && command -v terraform &> /dev/null; then
    cd "$TERRAFORM_DIR" || exit 1
    
    # Initialize Terraform if needed
    if [ ! -d ".terraform" ]; then
        echo -e "${YELLOW}⚠️  Terraform not initialized. Initializing...${NC}"
        terraform init -backend=false 2>/dev/null || terraform init 2>/dev/null || true
    fi
    
    # Get CloudFront domain from Terraform
    CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo "")
    WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")
    
    cd - > /dev/null || exit 1
    
    if [ -n "$WEBSITE_URL" ]; then
        BASE_URL="$WEBSITE_URL"
        echo -e "${GREEN}✓ Using website URL from Terraform: $BASE_URL${NC}"
    elif [ -n "$CLOUDFRONT_DOMAIN" ]; then
        BASE_URL="https://$CLOUDFRONT_DOMAIN"
        echo -e "${GREEN}✓ Using CloudFront domain from Terraform: $BASE_URL${NC}"
    fi
fi

# Fallback to environment variables if Terraform outputs not available
if [ -z "$BASE_URL" ]; then
    case $ENVIRONMENT in
        production|prod)
            BASE_URL="${AWS_CLOUDFRONT_DOMAIN:-}"
            if [ -z "$BASE_URL" ]; then
                echo -e "${RED}❌ CloudFront domain not found${NC}"
                echo -e "${YELLOW}   Set AWS_CLOUDFRONT_DOMAIN or run 'terraform apply' in ${TERRAFORM_DIR}${NC}"
                exit 1
            fi
            # Ensure URL has https:// prefix
            if [[ ! "$BASE_URL" =~ ^https?:// ]]; then
                BASE_URL="https://$BASE_URL"
            fi
            ;;
        staging)
            BASE_URL="${AWS_CLOUDFRONT_DOMAIN_STAGING:-}"
            if [ -z "$BASE_URL" ]; then
                echo -e "${RED}❌ CloudFront domain not found for staging${NC}"
                exit 1
            fi
            if [[ ! "$BASE_URL" =~ ^https?:// ]]; then
                BASE_URL="https://$BASE_URL"
            fi
            ;;
        dev|development)
            BASE_URL="${AWS_CLOUDFRONT_DOMAIN_DEV:-}"
            if [ -z "$BASE_URL" ]; then
                echo -e "${RED}❌ CloudFront domain not found for development${NC}"
                exit 1
            fi
            if [[ ! "$BASE_URL" =~ ^https?:// ]]; then
                BASE_URL="https://$BASE_URL"
            fi
            ;;
    esac
fi

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

# Check if we should run only critical tests
CRITICAL_ONLY=${CRITICAL_TESTS_ONLY:-false}
if [ "$CRITICAL_ONLY" = "true" ] || [ "$CRITICAL_ONLY" = "1" ]; then
  echo -e "${YELLOW}⚠️  Running CRITICAL tests only (@critical tag)${NC}"
  BASE_URL=$BASE_URL CRITICAL_TESTS_ONLY=true npx playwright test --grep @critical
else
  echo -e "${BLUE}Running all Playwright tests...${NC}"
  BASE_URL=$BASE_URL npx playwright test
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}E2E tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"
