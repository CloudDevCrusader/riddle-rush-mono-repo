#!/usr/bin/env bash
# Build game app for monorepo
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root
ensure_pnpm

pnpm -C apps/game run generate
