#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
  printf '%b\n' "$*"
}

warn() {
  printf '%b\n' "${YELLOW}⚠️  $*${NC}" >&2
}

die() {
  printf '%b\n' "${RED}❌ $*${NC}" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

ensure_repo_root() {
  cd "${REPO_ROOT}"
}

ensure_pnpm() {
  if ! command -v corepack >/dev/null 2>&1; then
    die "corepack is required to prepare pnpm"
  fi

  local package_manager=""
  local pnpm_version=""

  if command -v node >/dev/null 2>&1; then
    package_manager=$(node -p "require('${REPO_ROOT}/package.json').packageManager" 2>/dev/null || true)
  fi

  if [[ "${package_manager}" == pnpm@* ]]; then
    pnpm_version="${package_manager#pnpm@}"
  else
    pnpm_version="10.26.2"
  fi

  corepack enable
  corepack prepare "pnpm@${pnpm_version}" --activate
}
