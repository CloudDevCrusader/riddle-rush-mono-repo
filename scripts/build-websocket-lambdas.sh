#!/bin/bash
# Build script for WebSocket Lambda functions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAMBDA_DIR="$SCRIPT_DIR/../infrastructure/lambda/websocket"

echo "🔨 Building WebSocket Lambda functions..."

# Array of lambda functions
FUNCTIONS=("connect" "disconnect" "message")

for FUNC in "${FUNCTIONS[@]}"; do
  echo ""
  echo "📦 Building $FUNC function..."
  
  FUNC_DIR="$LAMBDA_DIR/$FUNC"
  
  if [ ! -d "$FUNC_DIR" ]; then
    echo "❌ Function directory not found: $FUNC_DIR"
    continue
  fi
  
  cd "$FUNC_DIR"
  
  # Install dependencies
  if [ -f "package.json" ]; then
    echo "📥 Installing dependencies for $FUNC..."
    npm install --production --silent
  fi
  
  # Create zip file
  echo "📦 Creating deployment package for $FUNC..."
  rm -f "../$FUNC.zip"
  
  if [ -d "node_modules" ]; then
    zip -r -q "../$FUNC.zip" index.js node_modules package.json
  else
    zip -r -q "../$FUNC.zip" index.js package.json
  fi
  
  # Get zip file size
  ZIP_SIZE=$(du -h "../$FUNC.zip" | cut -f1)
  echo "✅ Created $FUNC.zip ($ZIP_SIZE)"
  
  # Clean up node_modules to save space (optional)
  # rm -rf node_modules
done

cd "$SCRIPT_DIR"

echo ""
echo "✅ All Lambda functions built successfully!"
echo ""
echo "📍 Deployment packages location: $LAMBDA_DIR"
ls -lh "$LAMBDA_DIR"/*.zip 2>/dev/null || echo "No zip files found"

echo ""
echo "🚀 Ready to deploy with Terraform:"
echo "   cd infrastructure && terraform apply"
