#!/bin/bash

# Agent Status Script
# Show current git status and next recommended steps

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   📊 Agent Status - Repository Overview              ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Current branch
BRANCH=$(git branch --show-current)
echo -e "${CYAN}📍 Current Branch:${NC} ${GREEN}${BRANCH}${NC}"
echo ""

# Git status
echo -e "${CYAN}📝 Git Status:${NC}"
if git diff-index --quiet HEAD --; then
  echo -e "${GREEN}  ✓ No uncommitted changes${NC}"
else
  echo -e "${YELLOW}  • Uncommitted changes detected${NC}"
  echo ""
  git status --short
fi
echo ""

# Unpushed commits
UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l || echo "0")
if [ "$UNPUSHED" -gt 0 ]; then
  echo -e "${CYAN}📤 Unpushed Commits:${NC} ${YELLOW}${UNPUSHED}${NC}"
  git log @{u}.. --oneline --color=always | head -5
  echo ""
else
  echo -e "${CYAN}📤 Unpushed Commits:${NC} ${GREEN}0 (all synced)${NC}"
  echo ""
fi

# Last 3 commits
echo -e "${CYAN}📜 Recent Commits:${NC}"
git log --oneline --color=always -3
echo ""

# Check if changes are staged
STAGED=$(git diff --cached --name-only | wc -l)
UNSTAGED=$(git diff --name-only | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)

echo -e "${CYAN}📦 Changes Summary:${NC}"
echo -e "  • Staged: ${GREEN}${STAGED}${NC}"
echo -e "  • Unstaged: ${YELLOW}${UNSTAGED}${NC}"
echo -e "  • Untracked: ${YELLOW}${UNTRACKED}${NC}"
echo ""

# Recommended next steps
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}💡 Recommended Next Steps:${NC}"
echo ""

if [ "$UNSTAGED" -gt 0 ] || [ "$UNTRACKED" -gt 0 ]; then
  echo -e "  ${YELLOW}1.${NC} Review changes: ${BLUE}git diff${NC}"
  echo -e "  ${YELLOW}2.${NC} Run validation: ${BLUE}pnpm run agent:validate${NC}"
  echo -e "  ${YELLOW}3.${NC} Auto-fix issues: ${BLUE}pnpm run agent:fix${NC}"
  echo -e "  ${YELLOW}4.${NC} Stage changes: ${BLUE}git add .${NC}"
  echo -e "  ${YELLOW}5.${NC} Commit: ${BLUE}git commit -m \"feat: description\"${NC}"
elif [ "$STAGED" -gt 0 ]; then
  echo -e "  ${YELLOW}1.${NC} Review staged: ${BLUE}git diff --staged${NC}"
  echo -e "  ${YELLOW}2.${NC} Commit: ${BLUE}git commit -m \"feat: description\"${NC}"
elif [ "$UNPUSHED" -gt 0 ]; then
  echo -e "  ${YELLOW}1.${NC} Push commits: ${BLUE}git push${NC}"
else
  echo -e "  ${GREEN}✓ Repository is clean and up to date!${NC}"
  echo -e "  ${YELLOW}→${NC} Ready for new work"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
