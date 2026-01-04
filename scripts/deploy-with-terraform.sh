#!/usr/bin/env bash

# Deploy script that uses Terraform outputs
# Usage: ./scripts/deploy-with-terraform.sh [environment]
# Example: ./scripts/deploy-with-terraform.sh prod

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

ENVIRONMENT="${1:-prod}"

# Normalize environment name for Terraform directory
TERRAFORM_ENV=""
case "$ENVIRONMENT" in
    development|dev)
        TERRAFORM_ENV="development"
        ;;
    production|prod)
        TERRAFORM_ENV="prod"
        ;;
    *)
        TERRAFORM_ENV="$ENVIRONMENT"
        ;;
esac

log "${BLUE}🚀 Deploying to ${ENVIRONMENT} using Terraform outputs...${NC}"
log "=================================================="

# Get Terraform outputs
TERRAFORM_DIR="infrastructure/environments/${TERRAFORM_ENV}"

if [ ! -d "$TERRAFORM_DIR" ]; then
    die "Terraform directory not found: ${TERRAFORM_DIR}"
fi

# Sync Terraform outputs to JSON and .env files first
if [ -f "scripts/sync-terraform-outputs.sh" ]; then
    log "${BLUE}🔄 Syncing Terraform outputs to JSON and .env files...${NC}"
    bash scripts/sync-terraform-outputs.sh "$TERRAFORM_ENV" || warn "Failed to sync Terraform outputs, continuing with direct queries"
fi

cd "$TERRAFORM_DIR"

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    log "${YELLOW}⚠️  Terraform not initialized. Initializing...${NC}"
    require_cmd terraform
    terraform init
fi

# Get Terraform outputs (validate what was synced)
require_cmd terraform
log "${BLUE}📋 Getting Terraform outputs...${NC}"
AWS_S3_BUCKET=$(terraform output -raw bucket_name 2>/dev/null || echo "")
AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "")
WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")

# Validate required outputs
if [ -z "$AWS_S3_BUCKET" ]; then
    die "Failed to get S3 bucket name from Terraform outputs. Run 'terraform apply' in ${TERRAFORM_DIR} first"
fi

if [ -z "$AWS_CLOUDFRONT_ID" ]; then
    warn "CloudFront ID not found in Terraform outputs. Cache invalidation will be skipped"
fi

if [ -z "$AWS_REGION" ]; then
    warn "AWS region not found in Terraform outputs, using default"
    AWS_REGION="eu-central-1"
fi

cd - > /dev/null

log "${GREEN}✅ Terraform outputs retrieved:${NC}"
log "  S3 Bucket: ${AWS_S3_BUCKET}"
log "  CloudFront ID: ${AWS_CLOUDFRONT_ID:-not set}"
log "  AWS Region: ${AWS_REGION}"
if [ -n "$WEBSITE_URL" ]; then
    log "  Website URL: ${WEBSITE_URL}"
fi

# Build the application
log "\n${BLUE}📦 Building application...${NC}"
ensure_pnpm
pnpm -C apps/game run generate

# Deploy using aws-deploy.sh with Terraform outputs
log "\n${BLUE}☁️  Deploying to AWS...${NC}"
export AWS_S3_BUCKET
export AWS_CLOUDFRONT_ID
export AWS_REGION
./aws-deploy.sh "${ENVIRONMENT}"

# Get final website URL from Terraform if not already set
if [ -z "$WEBSITE_URL" ]; then
    cd "$TERRAFORM_DIR"
    WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")
    cd - > /dev/null
fi

log "\n${GREEN}✅ Deployment complete!${NC}"
if [ -n "$WEBSITE_URL" ]; then
    log "${BLUE}Website URL: ${WEBSITE_URL}${NC}"
else
    warn "Website URL not available from Terraform outputs"
fi
