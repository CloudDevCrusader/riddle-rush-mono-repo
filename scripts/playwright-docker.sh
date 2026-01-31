#!/bin/bash
set -e

# Playwright Docker Server
# Runs a Playwright server in Docker for local E2E testing.
# Browsers run inside the container; tests run on your host machine.
#
# Usage:
#   ./scripts/playwright-docker.sh          # Start server on port 3001
#   ./scripts/playwright-docker.sh 3002     # Start server on custom port
#
# Then run tests with:
#   pnpm run test:e2e:docker

PW_VERSION="1.57.0"
PW_IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"
PW_PORT="${1:-4300}"

echo "Starting Playwright ${PW_VERSION} server on port ${PW_PORT}..."
echo "Connect from tests with: ws://localhost:${PW_PORT}"
echo "Press Ctrl+C to stop."
echo ""

docker run \
  -p "${PW_PORT}:${PW_PORT}" \
  --rm \
  --init \
  -it \
  --workdir /home/pwuser \
  --user pwuser \
  "${PW_IMAGE}" \
  /bin/sh -c "npx -y playwright@${PW_VERSION} run-server --port ${PW_PORT} --host 0.0.0.0"
