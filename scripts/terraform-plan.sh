#!/bin/bash
# ===========================================
# Terraform Plan Script
# ===========================================
# Usage: ./scripts/terraform-plan.sh [environment]
# Example: ./scripts/terraform-plan.sh production
#
# This script runs terraform plan for the specified environment.
# It does NOT apply changes - use terraform-apply.sh for that.

set -e

# Get script directory and source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/lib/deploy-common.sh"

ENVIRONMENT="${1:-production}"

# Map short environment names to full folder names
case "$ENVIRONMENT" in
    dev)
        ENVIRONMENT="development"
        ;;
    prod|production)
        ENVIRONMENT="production"
        ;;
    staging)
        ENVIRONMENT="staging"
        ;;
esac

echo -e "${BLUE}📋 Running Terraform Plan for ${ENVIRONMENT} environment${NC}"
echo "=========================================="

# AWS checks
check_aws_cli
check_aws_credentials

# Terraform directory
TERRAFORM_DIR="$PROJECT_ROOT/infrastructure/environments/$ENVIRONMENT"

if [ ! -d "$TERRAFORM_DIR" ]; then
    echo -e "${RED}❌ Terraform directory not found: $TERRAFORM_DIR${NC}"
    exit 1
fi

# Initialize if needed
terraform_init "$TERRAFORM_DIR"

# Run terraform plan
echo -e "\n${BLUE}📋 Running Terraform plan...${NC}"
cd "$TERRAFORM_DIR" || {
    echo -e "${RED}❌ Cannot cd to Terraform directory: $TERRAFORM_DIR${NC}"
    exit 1
}

terraform plan -detailed-exitcode -out=tfplan
PLAN_EXIT_CODE=$?

if [ $PLAN_EXIT_CODE -eq 1 ]; then
    echo -e "${RED}❌ Terraform plan failed${NC}"
    rm -f tfplan
    cd - > /dev/null
    exit 1
elif [ $PLAN_EXIT_CODE -eq 2 ]; then
    echo -e "\n${YELLOW}Terraform will make the following changes:${NC}"
    terraform show tfplan | head -100
    echo -e "\n${GREEN}✓ Plan file saved to tfplan${NC}"
    echo -e "${BLUE}💡 To apply these changes, run:${NC}"
    echo -e "   ${YELLOW}./scripts/terraform-apply.sh $ENVIRONMENT${NC}"
elif [ $PLAN_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ No infrastructure changes detected${NC}"
    rm -f tfplan
fi

cd - > /dev/null

echo -e "\n${GREEN}✅ Terraform plan complete!${NC}"
