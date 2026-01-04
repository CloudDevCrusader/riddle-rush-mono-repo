#!/usr/bin/env bash
# Run E2E tests locally

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root
ensure_pnpm

log "Running E2E tests locally..."
log "This will build and test the app on http://localhost:3000"
log ""

# Generate static build
log "Building application..."
pnpm -C apps/game run generate

log ""
log "Running Playwright tests..."
pnpm -C apps/game exec playwright test

log ""
log "E2E tests completed!"
log ""
log "To view the HTML report, run:"
log "  pnpm -C apps/game exec playwright show-report"
