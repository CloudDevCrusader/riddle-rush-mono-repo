#!/bin/bash
set -e
# Run tests for game app in monorepo
cd apps/game || exit 1
pnpm run test:unit
