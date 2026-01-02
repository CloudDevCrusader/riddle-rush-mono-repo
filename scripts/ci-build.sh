#!/bin/bash
set -e
# Build game app for monorepo
cd apps/game || exit 1
pnpm run generate
