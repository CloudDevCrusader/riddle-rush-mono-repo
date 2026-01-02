#!/bin/bash
# ===========================================
# Deploy to Production Environment
# ===========================================
# Usage: ./scripts/deploy-prod.sh [version]
# Example: ./scripts/deploy-prod.sh 1.2.0

set -e

BRANCH="main"
VERSION="${1:-}"

echo "🚀 Deploying to PRODUCTION environment"
echo "======================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Copy from .env.example"
    echo "   cp .env.example .env"
fi

# Safety check - must be on main or staging
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "⚠️  Warning: You are on '$CURRENT_BRANCH' branch"
    echo "   Production deploys should come from 'main' or 'staging'"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Uncommitted changes detected!"
    echo "   Commit or stash changes before deploying to production."
    git status --short
    exit 1
fi

# Run checks
echo "🔍 Running pre-deploy checks..."
echo ""

echo "📦 Installing dependencies..."
corepack enable
corepack prepare pnpm@10.27.0 --activate
pnpm install --frozen-lockfile

echo "✅ Running linter..."
pnpm run lint || { echo "❌ Lint failed"; exit 1; }

echo "🔷 Running type check..."
pnpm run typecheck || { echo "❌ Type check failed"; exit 1; }

echo "🧪 Running unit tests..."
pnpm run test:unit || { echo "❌ Tests failed"; exit 1; }

echo "🏗️  Building application..."
pnpm run build || { echo "❌ Build failed"; exit 1; }

echo ""
echo "✅ All checks passed!"
echo ""

# Version tagging
if [ -n "$VERSION" ]; then
    echo "🏷️  Creating version tag: v$VERSION"
    
    # Update package.json version
    pnpm version $VERSION --no-git-tag-version
    git add package.json pnpm-lock.yaml
    git commit -m "chore(release): v$VERSION"
    
    # Create annotated tag
    git tag -a "v$VERSION" -m "Release v$VERSION"
fi

# Git operations
echo "📤 Pushing to $BRANCH..."

git fetch origin
git pull origin $BRANCH

git push origin $BRANCH

if [ -n "$VERSION" ]; then
    git push origin "v$VERSION"
    echo "🏷️  Tag v$VERSION pushed"
fi

echo ""
echo "✅ Successfully deployed to PRODUCTION!"
echo "🔗 Pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
echo "🌐 Site: https://djdiox.gitlab.io/riddle-rush-nuxt-pwa"
echo ""

echo "🎉 Done! Check GitLab for deployment status."
