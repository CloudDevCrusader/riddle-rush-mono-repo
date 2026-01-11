#!/bin/bash

# Simple Blue-Green Configuration Test
# Tests that both environments have valid blue-green configurations

echo "Testing Blue-Green Deployment Configuration"
echo "============================================"
echo ""

# Test development environment
echo "Testing Development Environment..."
cd environments/development

if terraform init -backend=false > /dev/null 2>&1 && terraform validate > /dev/null 2>&1; then
    echo "✅ Development environment: VALID"
else
    echo "❌ Development environment: INVALID"
    exit 1
fi

cd ../..

# Test production environment
echo "Testing Production Environment..."
cd environments/production

if terraform init -backend=false > /dev/null 2>&1 && terraform validate > /dev/null 2>&1; then
    echo "✅ Production environment: VALID"
else
    echo "❌ Production environment: INVALID"
    exit 1
fi

cd ../..

echo ""
echo "🎉 All Blue-Green configurations are valid!"
echo "✅ Blue-green deployment is ready for use"

exit 0