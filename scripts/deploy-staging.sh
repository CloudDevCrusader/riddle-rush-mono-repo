#!/usr/bin/env bash
# Wrapper for deployment to staging environment.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

exec "${SCRIPT_DIR}/deploy.sh" staging "$@"
