#!/bin/bash
set -e

# Python linting script for Riddle Rush monorepo
# This script runs Python linting using Trunk

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT" || exit 1

echo "🐍 Running Python linting with Trunk..."

# Find Python files and run Trunk check on them
PYTHON_FILES=$(find . -name "*.py" -not -path "*/.venv/*" -not -path "*/node_modules/*" -not -path "*/.trunk-cache/*" -not -path "*/ai/*" -not -path "*/.yoyo/*")

if [ -z "$PYTHON_FILES" ]; then
    echo "📋 No Python files found to lint"
    exit 0
fi

echo "🔍 Running Trunk check on Python files..."
echo "Files: $PYTHON_FILES"

# Run Trunk check on Python files
./trunk check $PYTHON_FILES

echo "✅ Python linting complete!"
