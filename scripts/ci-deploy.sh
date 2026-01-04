#!/usr/bin/env bash
# CI deploy script for GitLab Pages (docs)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

rm -rf -- public
cp -r apps/docs/.output/public public
log "✅ Docs deployed to public/"
