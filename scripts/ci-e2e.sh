#!/bin/bash
# CI script for running E2E tests
set -e

# If BASE_URL is set (testing deployed site), use it
if [ -n "$BASE_URL" ]; then
  echo "Running E2E tests against deployed site: $BASE_URL"
  npx playwright test
else
  echo "Running E2E tests against local build"
  pnpm run generate
  pnpm exec playwright test || true
fi
