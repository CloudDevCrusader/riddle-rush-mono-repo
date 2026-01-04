#!/usr/bin/env bash
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

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
source "${SCRIPT_DIR}/deploy-common.sh"
ensure_repo_root

# Validate environment argument
ENV="${1:-}"
if [ -z "${ENV}" ]; then
    log "${RED}❌ Error: Environment not specified${NC}"
    log ""
    log "Usage:"
    log "  ./scripts/deploy.sh dev [commit message]"
    log "  ./scripts/deploy.sh prod [version]"
    log "  ./scripts/deploy.sh staging [commit message]"
    log ""
    log "Examples:"
    log "  ./scripts/deploy.sh dev \"fix: update game logic\""
    log "  ./scripts/deploy.sh prod 1.2.0"
    log "  ./scripts/deploy.sh staging \"test: staging deployment\""
    exit 1
fi

# Validate environment value
if [[ ! "${ENV}" =~ ^(dev|development|prod|production|staging)$ ]]; then
    log "${RED}❌ Error: Invalid environment '${ENV}'${NC}"
    log "   Valid options: dev, development, prod, production, staging"
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
log ""
log "${CYAN}╔════════════════════════════════════════╗${NC}"
log "${CYAN}║   🚀 Deploying to ${ENV_NAME}${NC}"
log "${CYAN}╚════════════════════════════════════════╝${NC}"
log ""

# Check environment
check_env

# Production-specific checks
if [ "$ENV" = "production" ]; then
    # Safety check - must be on main or staging
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "${CURRENT_BRANCH}" != "main" ] && [ "${CURRENT_BRANCH}" != "staging" ]; then
        warn "You are on '${CURRENT_BRANCH}' branch"
        log "   Production deploys should come from 'main' or 'staging'"
        read -r -p "Continue anyway? (y/N) " -n 1
        log ""
        if [[ ! ${REPLY:-} =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        die "Uncommitted changes detected. Commit or stash changes before deploying."
    fi
fi

# Show current status
log "${BLUE}📊 Current Status:${NC}"
log "   Branch: $(git rev-parse --abbrev-ref HEAD)"
log "   Commit: $(git rev-parse --short HEAD)"
if [ -n "$(git status --porcelain)" ]; then
    log "   ${YELLOW}Uncommitted changes:${NC}"
    git status --short | sed 's/^/     /'
    log ""
fi

# Run pre-deploy checks
run_checks

# Production version tagging
if [ "${ENV}" = "production" ] && [ -n "${VERSION:-}" ]; then
    log ""
    log "${CYAN}🏷️  Creating version tag: v${VERSION}${NC}"
    
    # Validate version format (semver)
    if [[ ! "${VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
        die "Invalid version format '${VERSION}'. Expected X.Y.Z or X.Y.Z-prerelease"
    fi

    # Check if tag already exists
    if git rev-parse "v${VERSION}" >/dev/null 2>&1; then
        die "Tag v${VERSION} already exists"
    fi

    # Update package.json version
    pnpm version "${VERSION}" --no-git-tag-version
    git add package.json pnpm-lock.yaml
    git commit -m "chore(release): v${VERSION}"

    # Create annotated tag
    git tag -a "v${VERSION}" -m "Release v${VERSION}"
    log "${GREEN}✅ Version tag created${NC}"
fi

# Deploy to branch
if [ "${ENV}" = "production" ]; then
    # Production: push to main branch
    log ""
    log "${BLUE}📤 Pushing to ${BRANCH}...${NC}"
    
    git fetch origin
    git pull origin "${BRANCH}" || warn "Could not pull (branch might not exist remotely)"
    git push origin "${BRANCH}"
    
    if [ -n "${VERSION:-}" ]; then
        git push origin "v${VERSION}"
        log "${GREEN}🏷️  Tag v${VERSION} pushed${NC}"
    fi
else
    # Dev/Staging: use common deploy function
    deploy_to_branch "${BRANCH}" "${COMMIT_MSG}"
fi

# Success message
log ""
log "${GREEN}╔════════════════════════════════════════╗${NC}"
log "${GREEN}║   ✅ Deployment Initiated!${NC}"
log "${GREEN}╚════════════════════════════════════════╝${NC}"
log ""
log "${BLUE}📋 Deployment Details:${NC}"
log "   Environment: ${ENV_NAME}"
log "   Branch: ${BRANCH}"
if [ "${ENV}" = "production" ] && [ -n "${VERSION:-}" ]; then
    log "   Version: v${VERSION}"
fi
log "   URL: ${URL}"
log ""
log "${BLUE}🔗 Links:${NC}"
log "   Pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
log "   Site: ${URL}"
log ""

# Show next steps
if [ "${ENV}" = "production" ]; then
    log "${CYAN}📝 Next Steps:${NC}"
    log "   1. Monitor pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
    log "   2. Wait for deployment to complete (~2-5 minutes)"
    log "   3. Verify deployment at: ${URL}"
    if [ -n "${VERSION:-}" ]; then
        log "   4. AWS deployment will trigger automatically (if configured)"
    fi
else
    log "${CYAN}📝 Next Steps:${NC}"
    log "   1. Monitor pipeline: https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
    log "   2. Wait for deployment to complete (~2-5 minutes)"
    log "   3. Verify deployment at: ${URL}"
fi

log ""
log "${GREEN}🎉 Done!${NC}"
log ""
