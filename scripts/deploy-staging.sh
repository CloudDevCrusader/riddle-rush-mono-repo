#!/bin/bash
# ===========================================
# Deploy to Staging Environment
# ===========================================
# Usage: ./scripts/deploy-staging.sh [commit message]

set -e

BRANCH="staging"
DEFAULT_MSG="chore: deploy to staging"
COMMIT_MSG="${1:-${DEFAULT_MSG}}"

echo "🎭 Deploying to STAGING environment"
echo "===================================="

# Check if .env exists
if [[ ! -f ".env" ]]; then
	echo "⚠️  Warning: .env file not found. Copy from .env.example"
	echo "   cp .env.example .env"
fi

# Check for uncommitted changes
if [[ -n "$(git status --porcelain)" ]]; then
	echo "📝 Uncommitted changes detected"
	git status --short
	echo ""
fi

# Run checks
echo "🔍 Running pre-deploy checks..."
echo ""

echo "📦 Installing dependencies..."
corepack enable
corepack prepare pnpm@10.27.0 --activate
pnpm install --frozen-lockfile

echo "✅ Running linter..."
pnpm run lint || {
	echo "❌ Lint failed"
	exit 1
}

echo "🔷 Running type check..."
pnpm run typecheck || {
	echo "❌ Type check failed"
	exit 1
}

echo "🧪 Running unit tests..."
pnpm run test:unit || {
	echo "❌ Tests failed"
	exit 1
}

echo "🏗️  Building application..."
pnpm run build || {
	echo "❌ Build failed"
	exit 1
}

echo ""
echo "✅ All checks passed!"
echo ""

# Git operations
echo "📤 Pushing ${o $BRA}NCH..."

# Stash any uncommitted changes
STASHED=false
if [[ -n "$(git status --porcelain)" ]]; then
	git stash push -m "deploy-staging-temp"
	STASHED=true
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Fetch latest
git fetch origin

# Checkout/create staging branch
if git show-ref --verify --quiet refs/heads/"$BRANCH"; then
	git checkout "$BRANCH"
	git pull origin "$BRANCH" || true
else
	git checkout -b "$BRANCH"
fi

# Merge current branch
if [[ "${CURRENT_BRANCH}" != "${BRANCH}" ]]; then
	git merge "$CURRENT_BRANCH" -m "${COMMIT_MSG}"
fi

# Push to remote
git push -u origin "$BRANCH"

echo ""
echo "✅ Successfully deployed t${ $BRAN}CH!"
echo "🔗 Pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
echo ""

# Return to original branch
git checkout "$CURRENT_BRANCH"

# Restore stashed changes
if [[ "${STASHED}" = true ]]; then
	git stash pop
fi

echo "🎉 Done! Check GitLab for deployment status."
