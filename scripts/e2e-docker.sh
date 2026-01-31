#!/bin/bash
set -e

# E2E tests with Playwright running in Docker
# Automatically starts the Playwright server container, runs tests, and cleans up.
#
# Usage:
#   ./scripts/e2e-docker.sh              # Run all E2E tests
#   ./scripts/e2e-docker.sh --grep @smoke # Pass extra Playwright CLI args

PW_VERSION="1.57.0"
PW_IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"
PW_PORT="4300"
CONTAINER_NAME="playwright-e2e-server"

cleanup() {
  echo ""
  echo "Stopping Playwright Docker container..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Stop any leftover container from a previous run
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "Starting Playwright ${PW_VERSION} server in Docker on port ${PW_PORT}..."

docker run \
  -d \
  -p "${PW_PORT}:${PW_PORT}" \
  --rm \
  --init \
  --name "${CONTAINER_NAME}" \
  --workdir /home/pwuser \
  --user pwuser \
  "${PW_IMAGE}" \
  /bin/sh -c "npx -y playwright@${PW_VERSION} run-server --port ${PW_PORT} --host 0.0.0.0"

# Wait for the server to be ready
echo "Waiting for Playwright server to be ready..."
RETRIES=30
until curl -s "http://localhost:${PW_PORT}" >/dev/null 2>&1 || [ "$RETRIES" -eq 0 ]; do
  RETRIES=$((RETRIES - 1))
  sleep 1
done

if [ "$RETRIES" -eq 0 ]; then
  echo "ERROR: Playwright server failed to start within 30 seconds"
  echo "Docker logs:"
  docker logs "${CONTAINER_NAME}" 2>&1 || true
  exit 1
fi

echo "Playwright server is ready."
echo ""

# Run Playwright tests, connecting to the Docker server
PW_TEST_CONNECT_WS_ENDPOINT="ws://localhost:${PW_PORT}" \
  npx playwright test --config=apps/game/playwright.config.ts "$@"
