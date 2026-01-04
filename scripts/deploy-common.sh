#!/usr/bin/env bash
# ===========================================
# Common Deployment Functions
# ===========================================
# Shared functions used by all deployment scripts

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

# Check if .env exists
check_env() {
  if [ ! -f ".env" ]; then
    warn ".env file not found. Copy from .env.example"
    log "   cp .env.example .env"
  fi
}

# Run pre-deploy checks
run_checks() {
  log "${BLUE}🔍 Running pre-deploy checks...${NC}"
  log ""

  log "📦 Installing dependencies..."
  ensure_pnpm
  pnpm install --frozen-lockfile

  log "✅ Running linter..."
  pnpm run lint || die "Lint failed"

  log "🔷 Running type check..."
  pnpm run typecheck || die "Type check failed"

  log "🧪 Running unit tests..."
  pnpm run test:unit || die "Tests failed"

  log "🏗️  Building application..."
  pnpm run build || die "Build failed"

  log ""
  log "${GREEN}✅ All checks passed!${NC}"
  log ""
}

# Git deploy to branch
deploy_to_branch() {
  local branch="$1"
  local commit_msg="$2"
  local pipeline_url="https://gitlab.com/djdiox/riddle-rush-nuxt-pwa/-/pipelines"
  local stashed=false

  log "📤 Pushing to ${branch}..."

  if [ -n "$(git status --porcelain)" ]; then
    git stash push -m "deploy-${branch}-temp"
    stashed=true
  fi

  local current_branch
  current_branch="$(git rev-parse --abbrev-ref HEAD)"

  git fetch origin

  if git show-ref --verify --quiet "refs/heads/${branch}"; then
    git checkout "${branch}"
    git pull origin "${branch}" || true
  else
    git checkout -b "${branch}"
  fi

  if [ "${current_branch}" != "${branch}" ]; then
    git merge "${current_branch}" -m "${commit_msg}"
  fi

  git push -u origin "${branch}"

  log ""
  log "${GREEN}✅ Successfully deployed to ${branch}!${NC}"
  log "${BLUE}🔗 Pipeline: ${pipeline_url}${NC}"
  log ""

  git checkout "${current_branch}"

  if [ "${stashed}" = true ]; then
    if ! git stash pop; then
      warn "Stash pop failed; resolve conflicts manually."
    fi
  fi
}
