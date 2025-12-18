#!/bin/bash
# ===========================================
# Deploy to Development Environment
# ===========================================
# Usage: ./scripts/deploy-dev.sh [commit message]

set -e

BRANCH="development"
DEFAULT_MSG="chore: deploy to development"
COMMIT_MSG="${1:-$DEFAULT_MSG}"

echo "🚀 Deploying to DEVELOPMENT environment"
echo "========================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Copy from .env.example"
    echo "   cp .env.example .env"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected"
    git status --short
    echo ""
fi

# Run checks
echo "🔍 Running pre-deploy checks..."
echo ""

echo "📦 Installing dependencies..."
npm ci --prefer-offline

echo "✅ Running linter..."
npm run lint || { echo "❌ Lint failed"; exit 1; }

echo "🔷 Running type check..."
npm run typecheck || { echo "❌ Type check failed"; exit 1; }

echo "🧪 Running unit tests..."
npm run test:unit || { echo "❌ Tests failed"; exit 1; }

echo "🏗️  Building application..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo ""
echo "✅ All checks passed!"
echo ""

# Git operations
echo "📤 Pushing to $BRANCH..."

# Stash any uncommitted changes
STASHED=false
if [ -n "$(git status --porcelain)" ]; then
    git stash push -m "deploy-dev-temp"
    STASHED=true
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Fetch latest
git fetch origin

# Checkout/create development branch
if git show-ref --verify --quiet refs/heads/$BRANCH; then
    git checkout $BRANCH
    git pull origin $BRANCH || true
else
    git checkout -b $BRANCH
fi

# Merge current branch
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    git merge $CURRENT_BRANCH -m "$COMMIT_MSG"
fi

# Push to remote
git push -u origin $BRANCH

echo ""
echo "✅ Successfully deployed to $BRANCH!"
echo "🔗 Pipeline: https://gitlab.com/djdiox/guess-game-nuxt-pwa/-/pipelines"
echo ""

# Return to original branch
git checkout $CURRENT_BRANCH

# Restore stashed changes
if [ "$STASHED" = true ]; then
    git stash pop
fi

echo "🎉 Done! Check GitLab for deployment status."
