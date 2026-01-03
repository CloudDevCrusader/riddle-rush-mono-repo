#!/bin/bash
set -e

echo "🚀 Setting up Riddle Rush development environment..."

# Determine workspace root - devcontainers typically mount to /workspace
# but some environments (like Codespaces) use /workspaces/...
WORKSPACE_ROOT="/workspace"
if [ ! -d "$WORKSPACE_ROOT" ] || [ ! -f "$WORKSPACE_ROOT/package.json" ]; then
  # Try alternative locations
  if [ -d "/workspaces/riddle-rush-nuxt-pwa" ] && [ -f "/workspaces/riddle-rush-nuxt-pwa/package.json" ]; then
    WORKSPACE_ROOT="/workspaces/riddle-rush-nuxt-pwa"
    echo "📁 Using workspace at: $WORKSPACE_ROOT"
  fi
fi

# Change to workspace root
cd "$WORKSPACE_ROOT" || { echo "❌ Cannot access workspace directory"; exit 1; }

# Enable corepack for pnpm
echo "📦 Enabling corepack and installing pnpm..."
corepack enable
corepack prepare pnpm@10.27.0 --activate

# Verify pnpm installation
pnpm --version

# Install project dependencies
echo "📥 Installing project dependencies..."
pnpm install --frozen-lockfile

# Install Playwright browsers (for E2E testing)
echo "🎭 Installing Playwright browsers..."
cd apps/game
pnpm exec playwright install --with-deps chromium
cd ../..

# Generate Nuxt types
echo "🔧 Generating Nuxt types..."
pnpm run postinstall || true

# Setup git hooks (if not in CI)
if [ -z "$CI" ]; then
  echo "🪝 Setting up git hooks..."
  pnpm run prepare || true
fi

echo "✅ Development environment setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm run dev          - Start game app"
echo "  pnpm run dev:docs     - Start docs app"
echo "  pnpm run test         - Run unit tests"
echo "  pnpm run test:e2e     - Run E2E tests"
echo "  pnpm run typecheck    - Type check"
echo "  pnpm run lint         - Lint code"
