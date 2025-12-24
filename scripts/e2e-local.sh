#!/bin/bash
# Run E2E tests locally

set -e

echo "Running E2E tests locally..."
echo "This will build and test the app on http://localhost:3000"
echo ""

# Generate static build
echo "Building application..."
npm run generate

echo ""
echo "Running Playwright tests..."
npx playwright test

echo ""
echo "E2E tests completed!"
echo ""
echo "To view the HTML report, run:"
echo "  npx playwright show-report"
