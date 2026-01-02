#!/bin/bash

# Dependency Check and Update Script
# Checks for outdated dependencies and provides update commands

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Dependency Check & Update Tool${NC}"
echo "========================================"

# Check if npm-check-updates is installed
if ! command -v ncu &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm-check-updates not found. Installing...${NC}"
    npm install -g npm-check-updates
fi

echo -e "\n${BLUE}1. Checking for outdated dependencies...${NC}"
ncu

echo -e "\n${BLUE}2. Checking for security vulnerabilities...${NC}"
pnpm audit || echo -e "${YELLOW}⚠️  pnpm audit not available${NC}"

echo -e "\n${BLUE}3. Available update commands:${NC}"
echo -e "${GREEN}# Update all dependencies to latest versions:${NC}"
echo -e "  ${YELLOW}ncu -u && pnpm install${NC}"
echo ""
echo -e "${GREEN}# Update only patch versions (safe):${NC}"
echo -e "  ${YELLOW}ncu -t patch -u && pnpm install${NC}"
echo ""
echo -e "${GREEN}# Update only minor versions (recommended):${NC}"
echo -e "  ${YELLOW}ncu -t minor -u && pnpm install${NC}"
echo ""
echo -e "${GREEN}# Interactive update (recommended):${NC}"
echo -e "  ${YELLOW}ncu -i && pnpm install${NC}"
echo ""
echo -e "${GREEN}# Check specific package:${NC}"
echo -e "  ${YELLOW}ncu nuxt${NC}"

echo -e "\n${BLUE}4. Recommended workflow:${NC}"
echo -e "  1. Review outdated packages: ${YELLOW}ncu${NC}"
echo -e "  2. Interactive update: ${YELLOW}ncu -i${NC}"
echo -e "  3. Install updates: ${YELLOW}pnpm install${NC}"
echo -e "  4. Test: ${YELLOW}pnpm run test:unit && pnpm run typecheck${NC}"
echo -e "  5. Build: ${YELLOW}pnpm run generate${NC}"

echo -e "\n${GREEN}✅ Dependency check complete${NC}"

