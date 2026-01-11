#!/bin/bash
# ===========================================
# Trunk Flaky Tests Upload Script
# ===========================================
# Uploads test results to Trunk for flaky test detection

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - read from environment variables or use defaults
TRUNK_ORG_SLUG="${TRUNK_ORG_SLUG:-cloudcrusaders}"
TRUNK_TOKEN="${TRUNK_TOKEN:-}"

# Check if token is set
if [[ -z "$TRUNK_TOKEN" ]]; then
    echo -e "${RED}❌ TRUNK_TOKEN environment variable is not set${NC}"
    echo -e "   Please set TRUNK_TOKEN environment variable with your Trunk API token"
    exit 1
fi

# Check if Trunk CLI is available
check_trunk_cli() {
    if ! command -v ./trunk &>/dev/null; then
        echo -e "${BLUE}📥 Downloading Trunk CLI...${NC}"
        curl -fsSLO --retry 3 https://trunk.io/releases/trunk
        chmod +x trunk
        if [[ $? -ne 0 ]]; then
            echo -e "${RED}❌ Failed to download Trunk CLI${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Trunk CLI downloaded${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}  Trunk Flaky Tests Upload${NC}"
    echo -e "${BLUE}===========================================${NC}"
    
    check_trunk_cli
    
    # Default test file
    local test_file="apps/game/test-results/unit-test-results.xml"
    
    # Check if the file exists
    if [[ ! -f "$test_file" ]]; then
        echo -e "${YELLOW}⚠️  No test result files found${NC}"
        echo -e "   Expected file: ${test_file}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Found test result file:${NC}"
    echo -e "  - ${test_file}"
    
    echo -e "\n${BLUE}🚀 Uploading test results to Trunk...${NC}"
    echo -e "   Organization: ${TRUNK_ORG_SLUG}"
    echo -e "   File: ${test_file}"
    
    # Upload the file
    ./trunk flakytests upload --junit-paths "$test_file" --org-url-slug "$TRUNK_ORG_SLUG" --token "$TRUNK_TOKEN"
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo -e "\n${GREEN}✓ Test results uploaded successfully!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Failed to upload test results${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
