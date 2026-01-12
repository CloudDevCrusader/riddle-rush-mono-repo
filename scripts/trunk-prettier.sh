#!/bin/bash
set -e

# Trunk Prettier script for Riddle Rush monorepo
# This script runs Prettier through Trunk with auto-fix capability

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT" || exit 1

echo "🎨 Running Prettier through Trunk..."

# Run Trunk check with Prettier filter
./.trunk-cache/cli/1.25.0-linux-x86_64/trunk check --filter=prettier "$@"

echo "✅ Prettier check complete!"
