#!/bin/bash
set -e

# Python formatting script for Riddle Rush monorepo
# This script auto-formats Python code using Trunk

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT" || exit 1

echo "🐍 Formatting Python code with Trunk..."

# Find Python files and run Trunk format on them
PYTHON_FILES=$(find . -name "*.py" -not -path "*/.venv/*" -not -path "*/node_modules/*" -not -path "*/.trunk-cache/*" -not -path "*/ai/*" -not -path "*/.yoyo/*")

if [ -z "$PYTHON_FILES" ]; then
    echo "📋 No Python files found to format"
    exit 0
fi

echo "🔧 Running Trunk format on Python files..."
echo "Files: $PYTHON_FILES"

# Run Trunk format on Python files
./trunk fmt $PYTHON_FILES

echo "✅ Python formatting complete!"
