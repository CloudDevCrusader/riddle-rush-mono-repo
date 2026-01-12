#!/bin/bash
set -e

# Trunk ESLint script for Riddle Rush monorepo
# This script runs ESLint through Trunk with auto-fix capability

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT" || exit 1

echo "🔍 Running ESLint through Trunk..."

# Run Trunk check with ESLint filter
./.trunk-cache/cli/1.25.0-linux-x86_64/trunk check --filter=eslint "$@"

echo "✅ ESLint check complete!"
