#!/bin/bash
# CI script for running E2E tests
set -e

# Navigate to game app
cd apps/game || exit 1

# If BASE_URL is set (testing deployed site), use it
if [ -n "$BASE_URL" ]; then
  echo "Running E2E tests against deployed site: $BASE_URL"
  pnpm exec playwright test
else
  echo "Running E2E tests against local build"
  pnpm run generate
  pnpm exec playwright test
fi
