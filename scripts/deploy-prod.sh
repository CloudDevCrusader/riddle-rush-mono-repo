#!/usr/bin/env bash
# Wrapper for deployment to production environment.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

exec "${SCRIPT_DIR}/deploy.sh" prod "$@"
