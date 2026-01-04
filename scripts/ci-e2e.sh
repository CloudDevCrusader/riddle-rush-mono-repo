#!/bin/bash
# CI script for running E2E tests
set -e

# Navigate to game app
cd apps/game || exit 1

# Check if we should run only critical tests
CRITICAL_ONLY=${CRITICAL_TESTS_ONLY:-false}
if [ "$CRITICAL_ONLY" = "true" ] || [ "$CRITICAL_ONLY" = "1" ]; then
  echo "⚠️  Running CRITICAL tests only (@critical tag)"
  TEST_CMD="pnpm exec playwright test --grep @critical"
else
  echo "Running all E2E tests"
  TEST_CMD="pnpm exec playwright test"
fi

# If BASE_URL is set (testing deployed site), use it
if [ -n "$BASE_URL" ]; then
  echo "Testing deployed site: $BASE_URL"
  $TEST_CMD
else
  echo "Testing local build"
  pnpm run generate
  $TEST_CMD
fi
