#!/bin/bash

# Agent Validation Script
# Quick validation before committing changes

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔍 Agent Validation - Pre-Commit Checks            ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Track if any checks fail
FAILED=0

# Function to run check
run_check() {
  local name="$1"
  local cmd="$2"
  
  echo -e "${BLUE}Running: ${name}${NC}"
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ ${name} passed${NC}"
    echo ""
    return 0
  else
    echo -e "${RED}✗ ${name} failed${NC}"
    echo ""
    FAILED=1
    return 1
  fi
}

# 1. Syncpack check
run_check "Syncpack (dependency sync)" "pnpm run syncpack:check"

# 2. TypeScript check
run_check "TypeScript (type checking)" "pnpm run typecheck"

# 3. ESLint check
run_check "ESLint (code quality)" "pnpm run lint"

# 4. Python lint (if Python files exist)
if find . -name "*.py" -not -path "*/node_modules/*" -not -path "*/.venv/*" | head -1 | grep -q .; then
  run_check "Python Linting" "pnpm run python:lint"
fi

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Ready to commit.${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo -e "  1. ${BLUE}git add .${NC}"
  echo -e "  2. ${BLUE}git commit -m \"feat: your message\"${NC}"
  echo -e "  3. ${BLUE}git push${NC}"
else
  echo -e "${RED}❌ Some checks failed. Please fix issues before committing.${NC}"
  echo ""
  echo -e "${YELLOW}Quick fixes:${NC}"
  echo -e "  • Auto-fix linting: ${BLUE}pnpm run lint:fix${NC}"
  echo -e "  • Format code: ${BLUE}pnpm run format${NC}"
  echo -e "  • Fix Python: ${BLUE}pnpm run python:format${NC}"
  echo -e "  • Then re-run: ${BLUE}pnpm run agent:validate${NC}"
  exit 1
fi
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
