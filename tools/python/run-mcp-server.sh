#!/bin/bash
# Wrapper script to run the FastMCP server with proper dependencies

cd "$(dirname "$0")/../.." || exit 1

# Use uv to run the Python script with dependencies
# This ensures all dependencies from pyproject.toml are available
exec uv run --no-project --directory tools/python python tools/python/main.py
