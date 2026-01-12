#!/bin/bash
set -e
# Run tests for game app in monorepo
# Ensure we're in the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT" || exit 1
cd apps/game || exit 1
pnpm run test:unit
