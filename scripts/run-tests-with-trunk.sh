#!/bin/bash
set -e

# Script to run tests and generate JUnit XML reports for Trunk flaky test detection

echo "🚀 Starting test execution with Trunk flaky test detection..."

# Navigate to game app
cd apps/game || exit 1

# Ensure test results directory exists
mkdir -p test-results

# Set environment variable to disable coverage and avoid conflicts with JUnit reporter
export TRUNK_TESTING=true

# Run unit tests with JUnit reporter (using vitest directly for better control)
echo "🧪 Running unit tests with JUnit reporter..."
pnpm exec vitest run --reporter=junit --outputFile=test-results/unit-test-results.xml

echo "✅ Tests completed. Results saved in test-results/ directory."

# List the generated test result files
ls -la test-results/

# Verify test results file was created
if [ ! -f "test-results/unit-test-results.xml" ]; then
    echo "❌ Test results file not found!"
    echo "Available files in test-results/:"
    ls -la test-results/ || echo "Directory is empty"
    exit 1
fi
