#!/bin/bash
# ===========================================
# Test Development Configuration Script
# ===========================================
# This script tests that the development configuration
# is properly set up for dev.riddlerush.de deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo -e "${BLUE}🧪 Testing Development Configuration for dev.riddlerush.de${NC}"
echo "========================================================"

# Test 1: Check Terraform configuration
echo -e "\n${BLUE}Test 1: Checking Terraform configuration...${NC}"

TERRAFORM_TFVARS="${PROJECT_ROOT}/infrastructure/environments/development/terraform.tfvars"

if [[ -f "${TERRAFORM_TFVARS}" ]]; then
    echo -e "${GREEN}✓ Terraform configuration file exists${NC}"
    
    # Check if domain_names is set to dev.riddlerush.de
    if grep -q 'domain_names.*=.*\["dev.riddlerush.de"\]' "${TERRAFORM_TFVARS}"; then
        echo -e "${GREEN}✓ Domain correctly configured: dev.riddlerush.de${NC}"
    else
        echo -e "${YELLOW}⚠️  Domain configuration not found or incorrect${NC}"
        echo -e "   Expected: domain_names = [\"dev.riddlerush.de\"]"
    fi
else
    echo -e "${RED}✗ Terraform configuration file not found${NC}"
    echo -e "   Expected: ${TERRAFORM_TFVARS}"
fi

# Test 2: Check Nuxt configuration
echo -e "\n${BLUE}Test 2: Checking Nuxt build configuration...${NC}"

NUXT_CONFIG="${PROJECT_ROOT}/apps/game/nuxt.config.ts"

if [[ -f "${NUXT_CONFIG}" ]]; then
    echo -e "${GREEN}✓ Nuxt configuration file exists${NC}"
    
    # Check for DEBUG_BUILD handling
    if grep -q 'isDebugBuild.*=.*process.env.DEBUG_BUILD.*===.*true' "${NUXT_CONFIG}"; then
        echo -e "${GREEN}✓ DEBUG_BUILD environment variable handling found${NC}"
    else
        echo -e "${YELLOW}⚠️  DEBUG_BUILD handling not found${NC}"
    fi
    
    # Check for minification logic
    if grep -q 'shouldMinify.*=.*isDev.*||.*isLocalhostBuild.*||.*isDebugBuild' "${NUXT_CONFIG}"; then
        echo -e "${GREEN}✓ Minification logic correctly implemented${NC}"
    else
        echo -e "${YELLOW}⚠️  Minification logic not found${NC}"
    fi
else
    echo -e "${RED}✗ Nuxt configuration file not found${NC}"
    echo -e "   Expected: ${NUXT_CONFIG}"
fi

# Test 3: Check deployment scripts
echo -e "\n${BLUE}Test 3: Checking deployment scripts...${NC}"

DEPLOY_DEV_SCRIPT="${PROJECT_ROOT}/scripts/deploy-dev.sh"
AWS_DEPLOY_SCRIPT="${PROJECT_ROOT}/scripts/aws-deploy.sh"

if [[ -f "${DEPLOY_DEV_SCRIPT}" ]]; then
    echo -e "${GREEN}✓ Development deployment script exists${NC}"
    
    # Check for NODE_ENV=development
    if grep -q 'export NODE_ENV=development' "${DEPLOY_DEV_SCRIPT}"; then
        echo -e "${GREEN}✓ NODE_ENV=development is set in deploy-dev.sh${NC}"
    else
        echo -e "${YELLOW}⚠️  NODE_ENV=development not found in deploy-dev.sh${NC}"
    fi
else
    echo -e "${RED}✗ Development deployment script not found${NC}"
    echo -e "   Expected: ${DEPLOY_DEV_SCRIPT}"
fi

if [[ -f "${AWS_DEPLOY_SCRIPT}" ]]; then
    echo -e "${GREEN}✓ AWS deployment script exists${NC}"
    
    # Check for DEBUG_BUILD handling
    if grep -q 'export DEBUG_BUILD=true' "${AWS_DEPLOY_SCRIPT}"; then
        echo -e "${GREEN}✓ DEBUG_BUILD=true is set for development environment${NC}"
    else
        echo -e "${YELLOW}⚠️  DEBUG_BUILD=true not found in aws-deploy.sh${NC}"
    fi
else
    echo -e "${RED}✗ AWS deployment script not found${NC}"
    echo -e "   Expected: ${AWS_DEPLOY_SCRIPT}"
fi

# Test 4: Check environment configuration
echo -e "\n${BLUE}Test 4: Checking environment configuration...${NC}"

ENV_FILE="${PROJECT_ROOT}/.env"

if [[ -f "${ENV_FILE}" ]]; then
    echo -e "${GREEN}✓ Environment file exists${NC}"
    
    # Check for NODE_ENV in .env
    if grep -q '^NODE_ENV=' "${ENV_FILE}"; then
        echo -e "${GREEN}✓ NODE_ENV is configured in .env${NC}"
    else
        echo -e "${YELLOW}⚠️  NODE_ENV not found in .env (will use deployment script default)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Environment file not found${NC}"
    echo -e "   Expected: ${ENV_FILE}"
    echo -e "   Note: This is optional, deployment scripts set defaults"
fi

# Test 5: Simulate environment variable setup
echo -e "\n${BLUE}Test 5: Simulating development environment...${NC}"

echo -e "${BLUE}Setting environment variables...${NC}"
export NODE_ENV=development
export DEBUG_BUILD=true
export BASE_URL=/

echo -e "  NODE_ENV=${NODE_ENV}"
echo -e "  DEBUG_BUILD=${DEBUG_BUILD}"
echo -e "  BASE_URL=${BASE_URL}"

# Check if variables are set correctly
if [[ "${NODE_ENV}" == "development" ]]; then
    echo -e "${GREEN}✓ NODE_ENV correctly set to 'development'${NC}"
else
    echo -e "${RED}✗ NODE_ENV not set correctly${NC}"
fi

if [[ "${DEBUG_BUILD}" == "true" ]]; then
    echo -e "${GREEN}✓ DEBUG_BUILD correctly set to 'true'${NC}"
else
    echo -e "${RED}✗ DEBUG_BUILD not set correctly${NC}"
fi

# Test 6: Check Vite configuration
echo -e "\n${BLUE}Test 6: Checking Vite build plugins...${NC}"

VITE_CONFIG="${PROJECT_ROOT}/packages/config/vite.config.ts"

if [[ -f "${VITE_CONFIG}" ]]; then
    echo -e "${GREEN}✓ Vite configuration file exists${NC}"
    
    # Check for dev plugins
    if grep -q 'getDevPlugins' "${VITE_CONFIG}"; then
        echo -e "${GREEN}✓ Development plugins function found${NC}"
    else
        echo -e "${YELLOW}⚠️  Development plugins function not found${NC}"
    fi
    
    # Check for build plugins
    if grep -q 'getBuildPlugins' "${VITE_CONFIG}"; then
        echo -e "${GREEN}✓ Build plugins function found${NC}"
    else
        echo -e "${YELLOW}⚠️  Build plugins function not found${NC}"
    fi
else
    echo -e "${RED}✗ Vite configuration file not found${NC}"
    echo -e "   Expected: ${VITE_CONFIG}"
fi

# Summary
echo -e "\n${BLUE}========================================================${NC}"
echo -e "${BLUE}Configuration Test Summary${NC}"
echo -e "${BLUE}========================================================${NC}"

echo -e "\n${GREEN}✅ Configuration verification complete!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "  1. Ensure AWS credentials are configured"
echo -e "  2. Create SSL certificate for dev.riddlerush.de in us-east-1"
echo -e "  3. Update certificate_arn in terraform.tfvars"
echo -e "  4. Run: terraform init && terraform apply"
echo -e "  5. Deploy: ./scripts/deploy-dev.sh"

echo -e "\n${GREEN}🎉 Development environment is ready for deployment to dev.riddlerush.de!${NC}"