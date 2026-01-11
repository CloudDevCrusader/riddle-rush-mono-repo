#!/bin/bash

# Blue-Green Configuration Validation Script
# Validates that the blue-green deployment configuration is syntactically correct

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'  # No Color

echo "${YELLOW}=== Blue-Green Configuration Validation ===${NC}"
echo ""

# Function to validate an environment
validate_environment() {
    local env_name=$1
    local env_dir=$2
    
    echo "${YELLOW}Validating $env_name environment...${NC}"
    
    # Change to environment directory
    cd "$env_dir"
    
    # Initialize Terraform
    echo "Initializing Terraform..."
    if terraform init -backend=false > /dev/null 2>&1; then
        echo "${GREEN}✅ PASS: Terraform initialization successful${NC}"
    else
        echo "${RED}❌ FAILED: Terraform initialization failed${NC}"
        return 1
    fi
    
    # Validate configuration
    echo "Validating Terraform configuration..."
    if terraform validate > /dev/null 2>&1; then
        echo "${GREEN}✅ PASS: Terraform configuration is valid${NC}"
    else
        echo "${RED}❌ FAILED: Terraform configuration validation failed${NC}"
        return 1
    fi
    
    # Check that blue-green module is referenced
    echo "Checking blue-green module configuration..."
    if grep -q "module.*blue_green" main.tf; then
        echo "${GREEN}✅ PASS: Blue-green module is referenced in main.tf${NC}"
    else
        echo "${RED}❌ FAILED: Blue-green module not found in main.tf${NC}"
        return 1
    fi
    
    # Check that use_green variable exists
    if grep -q "use_green" variables.tf; then
        echo "${GREEN}✅ PASS: use_green variable is defined${NC}"
    else
        echo "${RED}❌ FAILED: use_green variable not found${NC}"
        return 1
    fi
    
    # Check that required outputs are defined
    echo "Checking required outputs..."
    local required_outputs=("blue_bucket_name" "green_bucket_name" "active_bucket_name" 
                           "cloudfront_distribution_id" "cloudfront_domain_name")
    
    local missing_outputs=()
    for output in "${required_outputs[@]}"; do
        if ! grep -q "output.*$output" main.tf; then
            missing_outputs+=("$output")
        fi
    done
    
    if [[ ${#missing_outputs[@]} -eq 0 ]]; then
        echo "${GREEN}✅ PASS: All required outputs are defined${NC}"
    else
        echo "${RED}❌ FAILED: Missing required outputs: ${missing_outputs[*]}${NC}"
        return 1
    fi
    
    echo "${YELLOW}$env_name environment: ALL VALIDATIONS PASSED${NC}"
    echo ""
    
    # Change back to infrastructure directory
    cd "$OLDPWD"
    
    return 0
}

# Main validation execution
PASS_COUNT=0
FAIL_COUNT=0

# Validate development environment
validate_environment "Development" "environments/development" && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# Validate production environment
validate_environment "Production" "environments/production" && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# Summary
echo "${YELLOW}=== Validation Summary ===${NC}"
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [[ $FAIL_COUNT -eq 0 ]]; then
    echo "${GREEN}🎉 ALL VALIDATIONS PASSED! Blue-green deployment configuration is correct.${NC}"
    exit 0
else
    echo "${RED}❌ SOME VALIDATIONS FAILED! Please review the output above.${NC}"
    exit 1
fi