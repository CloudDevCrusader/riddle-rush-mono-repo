#!/usr/bin/env bash
# Run E2E tests against deployed AWS sites (S3 + CloudFront)

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root
ensure_pnpm
require_cmd curl

# Get environment (production, staging, or dev)
ENVIRONMENT="${1:-production}"

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
        die "Invalid environment: ${ENVIRONMENT}. Usage: $0 [production|staging|dev]"
        ;;
esac

# Try to get CloudFront domain from Terraform outputs
TERRAFORM_DIR="infrastructure/environments/${TERRAFORM_ENV}"
BASE_URL=""

if [ -d "$TERRAFORM_DIR" ] && command -v terraform >/dev/null 2>&1; then
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform if needed
    if [ ! -d ".terraform" ]; then
        log "${YELLOW}⚠️  Terraform not initialized. Initializing...${NC}"
        terraform init -backend=false 2>/dev/null || terraform init 2>/dev/null || true
    fi
    
    # Get CloudFront domain from Terraform
    CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo "")
    WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")
    
    cd - > /dev/null
    
    if [ -n "$WEBSITE_URL" ]; then
        BASE_URL="$WEBSITE_URL"
        log "${GREEN}✓ Using website URL from Terraform: ${BASE_URL}${NC}"
    elif [ -n "$CLOUDFRONT_DOMAIN" ]; then
        BASE_URL="https://$CLOUDFRONT_DOMAIN"
        log "${GREEN}✓ Using CloudFront domain from Terraform: ${BASE_URL}${NC}"
    fi
fi

# Fallback to environment variables if Terraform outputs not available
if [ -z "${BASE_URL}" ]; then
    case $ENVIRONMENT in
        production|prod)
            BASE_URL="${AWS_CLOUDFRONT_DOMAIN:-}"
            if [ -z "$BASE_URL" ]; then
                die "CloudFront domain not found. Set AWS_CLOUDFRONT_DOMAIN or run 'terraform apply' in ${TERRAFORM_DIR}"
            fi
            # Ensure URL has https:// prefix
            if [[ ! "$BASE_URL" =~ ^https?:// ]]; then
                BASE_URL="https://$BASE_URL"
            fi
            ;;
        staging)
            BASE_URL="${AWS_CLOUDFRONT_DOMAIN_STAGING:-}"
            if [ -z "$BASE_URL" ]; then
                die "CloudFront domain not found for staging"
            fi
            if [[ ! "$BASE_URL" =~ ^https?:// ]]; then
                BASE_URL="https://$BASE_URL"
            fi
            ;;
        dev|development)
            BASE_URL="${AWS_CLOUDFRONT_DOMAIN_DEV:-}"
            if [ -z "$BASE_URL" ]; then
                die "CloudFront domain not found for development"
            fi
            if [[ ! "$BASE_URL" =~ ^https?:// ]]; then
                BASE_URL="https://$BASE_URL"
            fi
            ;;
    esac
fi

log "${BLUE}========================================${NC}"
log "${BLUE}Running E2E tests against ${ENVIRONMENT}${NC}"
log "${BLUE}URL: ${BASE_URL}${NC}"
log "${BLUE}========================================${NC}"
log ""

# Check if the site is reachable
log "${BLUE}Checking if site is reachable...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|301\|302"; then
  log "${GREEN}✓ Site is reachable${NC}"
else
  die "Site is not reachable at ${BASE_URL}. Please check if the site is deployed"
fi

log ""

# Check if we should run only critical tests
CRITICAL_ONLY="${CRITICAL_TESTS_ONLY:-false}"
if [ "${CRITICAL_ONLY}" = "true" ] || [ "${CRITICAL_ONLY}" = "1" ]; then
  log "${YELLOW}⚠️  Running CRITICAL tests only (@critical tag)${NC}"
  BASE_URL="${BASE_URL}" CRITICAL_TESTS_ONLY=true pnpm -C apps/game exec playwright test --grep @critical
else
  log "${BLUE}Running all Playwright tests...${NC}"
  BASE_URL="${BASE_URL}" pnpm -C apps/game exec playwright test
fi

log ""
log "${GREEN}========================================${NC}"
log "${GREEN}E2E tests completed!${NC}"
log "${GREEN}========================================${NC}"
