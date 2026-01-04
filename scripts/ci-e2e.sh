#!/usr/bin/env bash
# CI script for running E2E tests
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root
ensure_pnpm

CRITICAL_ONLY="${CRITICAL_TESTS_ONLY:-false}"
if [ "${CRITICAL_ONLY}" = "true" ] || [ "${CRITICAL_ONLY}" = "1" ]; then
  log "${YELLOW}⚠️  Running CRITICAL tests only (@critical tag)${NC}"
  TEST_CMD=(pnpm -C apps/game exec playwright test --grep @critical)
else
  log "Running all E2E tests"
  TEST_CMD=(pnpm -C apps/game exec playwright test)
fi

if [ -n "${BASE_URL:-}" ]; then
  log "Testing deployed site: ${BASE_URL}"
  BASE_URL="${BASE_URL}" "${TEST_CMD[@]}"
else
  log "Testing local build"
  BASE_URL="/" pnpm -C apps/game run generate
  BASE_URL="" PLAYWRIGHT_TEST_BASE_URL="http://localhost:3000" "${TEST_CMD[@]}"
fi
