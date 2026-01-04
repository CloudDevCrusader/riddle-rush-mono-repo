#!/bin/bash
# ===========================================
# Terraform Apply Script
# ===========================================
# Usage: ./scripts/terraform-apply.sh [environment] [--auto-approve]
# Example: ./scripts/terraform-apply.sh production
#          ./scripts/terraform-apply.sh production --auto-approve
#
# This script applies terraform changes for the specified environment.
# It uses the plan file created by terraform-plan.sh if available,
# otherwise runs plan and apply together.

set -e

# Get script directory and source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/lib/deploy-common.sh"

ENVIRONMENT="${1:-production}"
AUTO_APPROVE="${2:-}"

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

echo -e "${BLUE}🚀 Applying Terraform Changes for ${ENVIRONMENT} environment${NC}"
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

cd "$TERRAFORM_DIR" || {
    echo -e "${RED}❌ Cannot cd to Terraform directory: $TERRAFORM_DIR${NC}"
    exit 1
}

# Check if plan file exists
if [ -f "tfplan" ]; then
    echo -e "\n${BLUE}📋 Using existing plan file...${NC}"
    
    # Show plan summary
    terraform show tfplan | head -50
    
    # Ask for confirmation unless auto-approve is set
    if [ "$AUTO_APPROVE" != "--auto-approve" ] && [ -z "$CI" ] && [ -z "$AUTO_APPLY" ]; then
        echo -e "\n${YELLOW}⚠️  About to apply these changes. Continue?${NC}"
        read -p "Apply terraform changes? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}⚠️  Aborted. Plan file preserved.${NC}"
            cd - > /dev/null
            exit 0
        fi
    fi
    
    # Apply the plan
    echo -e "\n${BLUE}🚀 Applying Terraform changes...${NC}"
    terraform apply tfplan || {
        echo -e "${RED}❌ Terraform apply failed${NC}"
        rm -f tfplan
        cd - > /dev/null
        exit 1
    }
    
    rm -f tfplan
    echo -e "${GREEN}✓ Terraform apply completed${NC}"
else
    # No plan file, run plan and apply together
    echo -e "\n${BLUE}📋 No plan file found. Running plan and apply...${NC}"
    
    set +e
    terraform plan -detailed-exitcode -out=tfplan
    PLAN_EXIT_CODE=$?
    set -e
    
    if [ $PLAN_EXIT_CODE -eq 1 ]; then
        echo -e "${RED}❌ Terraform plan failed${NC}"
        rm -f tfplan
        cd - > /dev/null
        exit 1
    elif [ $PLAN_EXIT_CODE -eq 2 ]; then
        # Changes detected
        echo -e "\n${YELLOW}Terraform will make the following changes:${NC}"
        terraform show tfplan | head -50
        
        # Ask for confirmation unless auto-approve is set
        if [ "$AUTO_APPROVE" != "--auto-approve" ] && [ -z "$CI" ] && [ -z "$AUTO_APPLY" ]; then
            echo -e "\n${YELLOW}⚠️  About to apply these changes. Continue?${NC}"
            read -p "Apply terraform changes? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}⚠️  Aborted. Plan file preserved.${NC}"
                cd - > /dev/null
                exit 0
            fi
        fi
        
        # Apply changes
        if [ "$AUTO_APPROVE" = "--auto-approve" ] || [ -n "$CI" ] || [ -n "$AUTO_APPLY" ]; then
            echo -e "\n${BLUE}🚀 Auto-applying Terraform changes...${NC}"
            terraform apply -auto-approve tfplan || {
                echo -e "${RED}❌ Terraform apply failed${NC}"
                rm -f tfplan
                cd - > /dev/null
                exit 1
            }
        else
            echo -e "\n${BLUE}🚀 Applying Terraform changes...${NC}"
            terraform apply tfplan || {
                echo -e "${RED}❌ Terraform apply failed${NC}"
                rm -f tfplan
                cd - > /dev/null
                exit 1
            }
        fi
        
        rm -f tfplan
        echo -e "${GREEN}✓ Terraform apply completed${NC}"
    else
        # No changes (exit code 0)
        echo -e "${GREEN}✓ No infrastructure changes detected${NC}"
        rm -f tfplan
    fi
fi

# Refresh outputs after apply
load_terraform_outputs "$TERRAFORM_DIR"

# Wait for CloudFront to be ready if distribution was created/updated
if [ -n "$AWS_CLOUDFRONT_ID" ]; then
    wait_for_cloudfront_ready "$AWS_CLOUDFRONT_ID"
fi

cd - > /dev/null

echo -e "\n${GREEN}✅ Terraform apply complete!${NC}"
echo -e "${BLUE}💡 To deploy the application, run:${NC}"
echo -e "   ${YELLOW}./scripts/aws-deploy.sh $ENVIRONMENT${NC}"
