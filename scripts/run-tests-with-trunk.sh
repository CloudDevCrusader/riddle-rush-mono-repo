#!/bin/bash
set -e

# Script to run tests and generate JUnit XML reports for Trunk flaky test detection

echo "🚀 Starting test execution with Trunk flaky test detection..."

# Navigate to game app
cd apps/game || exit 1

# Ensure test results directory exists
mkdir -p test-results

# Run unit tests with JUnit reporter
echo "🧪 Running unit tests..."
pnpm run test:unit -- --reporter=junit --outputFile=test-results/unit-test-results.xml

# Run E2E tests with JUnit reporter
echo "🧪 Running E2E tests..."
pnpm exec playwright test --reporter=junit --output=test-results/e2e-test-results.xml

echo "✅ Tests completed. Results saved in test-results/ directory."

# List the generated test result files
ls -la test-results/