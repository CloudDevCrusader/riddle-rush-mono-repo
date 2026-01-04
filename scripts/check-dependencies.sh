#!/usr/bin/env bash

# Dependency Check and Update Script
# Checks for outdated dependencies and provides update commands

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

log "${BLUE}📦 Dependency Check & Update Tool${NC}"
log "========================================"

ncu_cmd=()
if command -v ncu >/dev/null 2>&1; then
  ncu_cmd=(ncu)
else
  ncu_cmd=(npx -y npm-check-updates)
fi

log ""
log "${BLUE}1. Checking for outdated dependencies...${NC}"
"${ncu_cmd[@]}"

log ""
log "${BLUE}2. Checking for security vulnerabilities...${NC}"
if command -v pnpm >/dev/null 2>&1; then
  pnpm audit || warn "pnpm audit not available"
else
  warn "pnpm not available; skipping audit"
fi

log ""
log "${BLUE}3. Available update commands:${NC}"
log "${GREEN}# Update all dependencies to latest versions:${NC}"
log "  ${YELLOW}ncu -u && pnpm install${NC}"
log ""
log "${GREEN}# Update only patch versions (safe):${NC}"
log "  ${YELLOW}ncu -t patch -u && pnpm install${NC}"
log ""
log "${GREEN}# Update only minor versions (recommended):${NC}"
log "  ${YELLOW}ncu -t minor -u && pnpm install${NC}"
log ""
log "${GREEN}# Interactive update (recommended):${NC}"
log "  ${YELLOW}ncu -i && pnpm install${NC}"
log ""
log "${GREEN}# Check specific package:${NC}"
log "  ${YELLOW}ncu nuxt${NC}"

log ""
log "${BLUE}4. Recommended workflow:${NC}"
log "  1. Review outdated packages: ${YELLOW}ncu${NC}"
log "  2. Interactive update: ${YELLOW}ncu -i${NC}"
log "  3. Install updates: ${YELLOW}pnpm install${NC}"
log "  4. Test: ${YELLOW}pnpm run test:unit && pnpm run typecheck${NC}"
log "  5. Build: ${YELLOW}pnpm run generate${NC}"

log ""
log "${GREEN}✅ Dependency check complete${NC}"
