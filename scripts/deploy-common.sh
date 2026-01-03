#!/bin/bash
# ===========================================
# Common Deployment Functions
# ===========================================
# Shared functions used by all deployment scripts

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Warning: .env file not found. Copy from .env.example${NC}"
        echo "   cp .env.example .env"
    fi
}

# Run pre-deploy checks
run_checks() {
    echo -e "${BLUE}🔍 Running pre-deploy checks...${NC}"
    echo ""

    echo "📦 Installing dependencies..."
    corepack enable
    corepack prepare pnpm@10.27.0 --activate
    pnpm install --frozen-lockfile

    echo "✅ Running linter..."
    pnpm run lint || { echo -e "${RED}❌ Lint failed${NC}"; exit 1; }

    echo "🔷 Running type check..."
    pnpm run typecheck || { echo -e "${RED}❌ Type check failed${NC}"; exit 1; }

    echo "🧪 Running unit tests..."
    pnpm run test:unit || { echo -e "${RED}❌ Tests failed${NC}"; exit 1; }

    echo "🏗️  Building application..."
    pnpm run build || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }

    echo ""
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
}

# Git deploy to branch
deploy_to_branch() {
    local BRANCH=$1
    local COMMIT_MSG=$2
    local PIPELINE_URL="https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"

    echo "📤 Pushing to $BRANCH..."

    # Stash any uncommitted changes
    STASHED=false
    if [ -n "$(git status --porcelain)" ]; then
        git stash push -m "deploy-$BRANCH-temp"
        STASHED=true
    fi

    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

    # Fetch latest
    git fetch origin

    # Checkout/create branch
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
    echo -e "${GREEN}✅ Successfully deployed to $BRANCH!${NC}"
    echo -e "${BLUE}🔗 Pipeline: $PIPELINE_URL${NC}"
    echo ""

    # Return to original branch
    git checkout $CURRENT_BRANCH

    # Restore stashed changes
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
}
