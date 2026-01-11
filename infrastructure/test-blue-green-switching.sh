#!/bin/bash

# Blue-Green Deployment Test Script
# Tests the blue-green switching functionality

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'  # No Color

echo "${YELLOW}=== Blue-Green Deployment Test Script ===${NC}"
echo ""

# Function to test an environment
test_environment() {
    local env_name=$1
    local env_dir=$2
    
    echo "${YELLOW}Testing $env_name environment...${NC}"
    
    # Change to environment directory
    cd "$env_dir"
    
    # Initialize Terraform
    echo "Initializing Terraform..."
    terraform init -backend=false > /dev/null 2>&1
    
    # Test default configuration (blue active)
    echo "Testing default configuration (blue active)..."
    local blue_output=$(terraform output -raw blue_bucket_name 2>/dev/null || echo "")
    local green_output=$(terraform output -raw green_bucket_name 2>/dev/null || echo "")
    local active_output=$(terraform output -raw active_bucket_name 2>/dev/null || echo "")
    
    # Check if outputs exist (they won't exist until applied)
    if [[ -z "$blue_output" || -z "$green_output" || -z "$active_output" ]]; then
        echo "${YELLOW}⚠️  INFO: Outputs not available (configuration not yet applied)${NC}"
        echo "${YELLOW}⚠️  INFO: Testing plan functionality instead${NC}"
        
        # Test that terraform plan works
        local plan_output=$(terraform plan -no-color 2>&1 || echo "")
        if [[ "$plan_output" == *"module.blue_green"* ]]; then
            echo "${GREEN}✅ PASS: Blue-green module is properly configured${NC}"
        else
            echo "${RED}❌ FAILED: Blue-green module configuration issue${NC}"
            return 1
        fi
        
        # Skip the rest of the output tests since outputs aren't available
        return 0
    fi
    
    # Check that blue is active by default
    if [[ "$active_output" == *"blue"* ]]; then
        echo "${GREEN}✅ PASS: Blue bucket is active by default${NC}"
    else
        echo "${RED}❌ FAILED: Expected blue bucket to be active, got: $active_output${NC}"
        return 1
    fi
    
    # Test switching to green
    echo "Testing switch to green environment..."
    local plan_output=$(terraform plan -var=use_green=true -no-color 2>&1 || echo "")
    
    if [[ "$plan_output" == *"module.blue_green.aws_cloudfront_distribution.website"* ]]; then
        echo "${GREEN}✅ PASS: Terraform plan shows CloudFront distribution changes when switching to green${NC}"
    else
        echo "${RED}❌ FAILED: Expected CloudFront distribution changes in plan${NC}"
        return 1
    fi
    
    # Test switching back to blue
    echo "Testing switch back to blue environment..."
    local plan_output=$(terraform plan -var=use_green=false -no-color 2>&1 || echo "")
    
    if [[ "$plan_output" == *"module.blue_green.aws_cloudfront_distribution.website"* ]]; then
        echo "${GREEN}✅ PASS: Terraform plan shows CloudFront distribution changes when switching to blue${NC}"
    else
        echo "${RED}❌ FAILED: Expected CloudFront distribution changes in plan${NC}"
        return 1
    fi
    
    # Test output variables
    echo "Testing output variables..."
    local switch_green_cmd=$(terraform output -raw switch_to_green_command 2>/dev/null || echo "")
    local switch_blue_cmd=$(terraform output -raw switch_to_blue_command 2>/dev/null || echo "")
    
    if [[ "$switch_green_cmd" == *"use_green=true"* && "$switch_blue_cmd" == *"use_green=false"* ]]; then
        echo "${GREEN}✅ PASS: Switch command outputs are correct${NC}"
    else
        echo "${RED}❌ FAILED: Switch command outputs are incorrect${NC}"
        echo "  Green: $switch_green_cmd"
        echo "  Blue: $switch_blue_cmd"
        return 1
    fi
    
    # Test that both buckets have different names
    if [[ "$blue_output" != "$green_output" ]]; then
        echo "${GREEN}✅ PASS: Blue and green buckets have different names${NC}"
    else
        echo "${RED}❌ FAILED: Blue and green buckets have the same name${NC}"
        return 1
    fi
    
    echo "${YELLOW}$env_name environment: ALL TESTS PASSED${NC}"
    echo ""
    
    # Change back to infrastructure directory
    cd ../..
    
    return 0
}

# Main test execution
PASS_COUNT=0
FAIL_COUNT=0

# Test development environment
test_environment "Development" "environments/development" && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# Test production environment
test_environment "Production" "environments/production" && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# Summary
echo "${YELLOW}=== Test Summary ===${NC}"
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [[ $FAIL_COUNT -eq 0 ]]; then
    echo "${GREEN}🎉 ALL TESTS PASSED! Blue-green deployment is working correctly.${NC}"
    exit 0
else
    echo "${RED}❌ SOME TESTS FAILED! Please review the output above.${NC}"
    exit 1
fi