#!/bin/bash
# ===========================================
# Unified Deployment Script
# ===========================================
# Usage:
#   ./scripts/deploy.sh dev [commit message]
#   ./scripts/deploy.sh prod [version]
#   ./scripts/deploy.sh staging [commit message]
#
# Examples:
#   ./scripts/deploy.sh dev "fix: update game logic"
#   ./scripts/deploy.sh prod 1.2.0
#   ./scripts/deploy.sh staging "test: staging deployment"

set -e

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-common.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Validate environment argument
ENV="${1:-}"
if [ -z "$ENV" ]; then
    echo -e "${RED}❌ Error: Environment not specified${NC}"
    echo ""
    echo "Usage:"
    echo "  ./scripts/deploy.sh dev [commit message]"
    echo "  ./scripts/deploy.sh prod [version]"
    echo "  ./scripts/deploy.sh staging [commit message]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh dev \"fix: update game logic\""
    echo "  ./scripts/deploy.sh prod 1.2.0"
    echo "  ./scripts/deploy.sh staging \"test: staging deployment\""
    exit 1
fi

# Validate environment value
if [[ ! "$ENV" =~ ^(dev|development|prod|production|staging)$ ]]; then
    echo -e "${RED}❌ Error: Invalid environment '$ENV'${NC}"
    echo "   Valid options: dev, development, prod, production, staging"
    exit 1
fi

# Normalize environment names
case "$ENV" in
    dev|development)
        ENV="development"
        BRANCH="development"
        DEFAULT_MSG="chore: deploy to development"
        COMMIT_MSG="${2:-$DEFAULT_MSG}"
        ENV_NAME="DEVELOPMENT"
        URL="https://djdiox.gitlab.io/riddle-rush-nuxt-pwa/dev"
        ;;
    staging)
        BRANCH="staging"
        DEFAULT_MSG="chore: deploy to staging"
        COMMIT_MSG="${2:-$DEFAULT_MSG}"
        ENV_NAME="STAGING"
        URL="https://djdiox.gitlab.io/riddle-rush-nuxt-pwa/staging"
        ;;
    prod|production)
        ENV="production"
        BRANCH="main"
        VERSION="${2:-}"
        ENV_NAME="PRODUCTION"
        URL="https://djdiox.gitlab.io/riddle-rush-nuxt-pwa"
        ;;
esac

# Print header
echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🚀 Deploying to $ENV_NAME${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check environment
check_env

# Production-specific checks
if [ "$ENV" = "production" ]; then
    # Safety check - must be on main or staging
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "staging" ]; then
        echo -e "${YELLOW}⚠️  Warning: You are on '$CURRENT_BRANCH' branch${NC}"
        echo "   Production deploys should come from 'main' or 'staging'"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${RED}❌ Error: Uncommitted changes detected!${NC}"
        echo "   Commit or stash changes before deploying to production."
        git status --short
        exit 1
    fi
fi

# Show current status
echo -e "${BLUE}📊 Current Status:${NC}"
echo "   Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "   Commit: $(git rev-parse --short HEAD)"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "   ${YELLOW}Uncommitted changes:${NC}"
    git status --short | sed 's/^/     /'
    echo ""
fi

# Run pre-deploy checks
run_checks

# Production version tagging
if [ "$ENV" = "production" ] && [ -n "$VERSION" ]; then
    echo ""
    echo -e "${CYAN}🏷️  Creating version tag: v$VERSION${NC}"
    
    # Validate version format (semver)
    if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
        echo -e "${RED}❌ Error: Invalid version format '$VERSION'${NC}"
        echo "   Expected format: X.Y.Z or X.Y.Z-prerelease"
        echo "   Example: 1.2.0 or 1.2.0-beta"
        exit 1
    fi

    # Check if tag already exists
    if git rev-parse "v$VERSION" >/dev/null 2>&1; then
        echo -e "${RED}❌ Error: Tag v$VERSION already exists${NC}"
        exit 1
    fi

    # Update package.json version
    pnpm version "$VERSION" --no-git-tag-version
    git add package.json pnpm-lock.yaml
    git commit -m "chore(release): v$VERSION"

    # Create annotated tag
    git tag -a "v$VERSION" -m "Release v$VERSION"
    echo -e "${GREEN}✅ Version tag created${NC}"
fi

# Deploy to branch
if [ "$ENV" = "production" ]; then
    # Production: push to main branch
    echo ""
    echo -e "${BLUE}📤 Pushing to $BRANCH...${NC}"
    
    git fetch origin
    git pull origin "$BRANCH" || echo -e "${YELLOW}⚠️  Could not pull (branch might not exist remotely)${NC}"
    git push origin "$BRANCH"
    
    if [ -n "$VERSION" ]; then
        git push origin "v$VERSION"
        echo -e "${GREEN}🏷️  Tag v$VERSION pushed${NC}"
    fi
else
    # Dev/Staging: use common deploy function
    deploy_to_branch "$BRANCH" "$COMMIT_MSG"
fi

# Success message
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Deployment Initiated!${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Details:${NC}"
echo "   Environment: $ENV_NAME"
echo "   Branch: $BRANCH"
if [ "$ENV" = "production" ] && [ -n "$VERSION" ]; then
    echo "   Version: v$VERSION"
fi
echo "   URL: $URL"
echo ""
echo -e "${BLUE}🔗 Links:${NC}"
echo "   Pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
echo "   Site: $URL"
echo ""

# Show next steps
if [ "$ENV" = "production" ]; then
    echo -e "${CYAN}📝 Next Steps:${NC}"
    echo "   1. Monitor pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
    echo "   2. Wait for deployment to complete (~2-5 minutes)"
    echo "   3. Verify deployment at: $URL"
    if [ -n "$VERSION" ]; then
        echo "   4. AWS deployment will trigger automatically (if configured)"
    fi
else
    echo -e "${CYAN}📝 Next Steps:${NC}"
    echo "   1. Monitor pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
    echo "   2. Wait for deployment to complete (~2-5 minutes)"
    echo "   3. Verify deployment at: $URL"
fi

echo ""
echo -e "${GREEN}🎉 Done!${NC}"
echo ""
