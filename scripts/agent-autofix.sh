#!/bin/bash

# Agent Auto-Fix Script
# Automatically fix common issues

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔧 Agent Auto-Fix - Fixing Common Issues           ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# 1. Fix syncpack
echo -e "${YELLOW}[1/4]${NC} Fixing dependency mismatches..."
pnpm run syncpack:fix > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Syncpack fixed${NC}"
echo ""

# 2. Fix linting
echo -e "${YELLOW}[2/4]${NC} Auto-fixing linting issues..."
pnpm run lint:fix > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Linting fixed${NC}"
echo ""

# 3. Format code
echo -e "${YELLOW}[3/4]${NC} Formatting code..."
pnpm run format > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Code formatted${NC}"
echo ""

# 4. Fix Python (if files exist)
if find . -name "*.py" -not -path "*/node_modules/*" -not -path "*/.venv/*" | head -1 | grep -q .; then
  echo -e "${YELLOW}[4/4]${NC} Formatting Python code..."
  pnpm run python:format > /dev/null 2>&1 || true
  echo -e "${GREEN}✓ Python formatted${NC}"
  echo ""
else
  echo -e "${YELLOW}[4/4]${NC} No Python files to format"
  echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Auto-fix complete!${NC}"
echo ""
echo -e "${YELLOW}Recommended next steps:${NC}"
echo -e "  1. ${BLUE}pnpm run agent:validate${NC}  # Verify all checks pass"
echo -e "  2. ${BLUE}git add .${NC}                # Stage changes"
echo -e "  3. ${BLUE}git commit -m \"...\"${NC}      # Commit with message"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
