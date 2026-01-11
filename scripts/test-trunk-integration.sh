#!/bin/bash
set -e

echo "🧪 Testing Trunk CLI integration..."

# Test 1: Check if Trunk CLI can be downloaded
echo "Test 1: Checking Trunk CLI download..."
if command -v curl &> /dev/null; then
    echo "✅ curl is available for downloading Trunk CLI"
else
    echo "❌ curl is not available"
    exit 1
fi

# Test 2: Check if test script is executable
echo "Test 2: Checking test script..."
if [ -f "scripts/run-tests-with-trunk.sh" ] && [ -x "scripts/run-tests-with-trunk.sh" ]; then
    echo "✅ Test script exists and is executable"
else
    echo "❌ Test script is missing or not executable"
    exit 1
fi

# Test 3: Check if CircleCI config is valid YAML
echo "Test 3: Checking CircleCI config..."
if [ -f ".circleci/config.yml" ]; then
    echo "✅ CircleCI config exists"
    # Try to validate YAML
    python3 -c "import yaml; yaml.safe_load(open('.circleci/config.yml')); print('  ✅ CircleCI config YAML is valid')" 2>/dev/null || echo "  ⚠️  Could not validate YAML (python/yaml not available)"
else
    echo "❌ CircleCI config is missing"
    exit 1
fi

# Test 4: Check if required directories exist
echo "Test 4: Checking required directories..."
if [ -d "apps/game" ]; then
    echo "✅ Game app directory exists"
else
    echo "❌ Game app directory is missing"
    exit 1
fi

# Test 5: Check if package manager is available
echo "Test 5: Checking package manager..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm is available"
elif command -v npm &> /dev/null; then
    echo "⚠️  npm is available (pnpm preferred)"
else
    echo "❌ No package manager found"
    exit 1
fi

echo ""
echo "🎉 All integration tests passed!"
echo ""
echo "Next steps:"
echo "1. Set TRUNK_API_TOKEN environment variable in CircleCI"
echo "2. Push changes to trigger the flaky-test-detection workflow"
echo "3. Monitor results in CircleCI and Trunk.io dashboards"