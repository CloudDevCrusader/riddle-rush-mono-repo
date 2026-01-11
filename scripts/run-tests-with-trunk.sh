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

# Run unit tests with coverage and JUnit reporter
echo "🧪 Running unit tests with coverage..."
pnpm run test:unit:coverage -- --reporter=junit --outputFile=test-results/unit-test-results.xml

echo "✅ Tests completed. Results saved in test-results/ directory."

# List the generated test result files
ls -la test-results/
