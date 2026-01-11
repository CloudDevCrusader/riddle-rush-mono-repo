#!/bin/bash
# Run E2E tests locally

set -e

echo "Running E2E tests locally..."
echo "This will build and test the app on http://localhost:3000"
echo ""

# Hint Nuxt build to skip minification for localhost test runs
export PLAYWRIGHT_TEST_BASE_URL="${PLAYWRIGHT_TEST_BASE_URL:-http://localhost:3000}"

# Generate static build
echo "Building application..."
pnpm run generate

echo ""
echo "Running Playwright tests..."
pnpm exec playwright test

echo ""
echo "E2E tests completed!"
echo ""
echo "To view the HTML report, run:"
echo "  npx playwright show-report"
