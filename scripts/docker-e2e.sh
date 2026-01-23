#!/bin/bash
# Run e2e tests in Docker

set -e

echo "Building Docker images..."
docker-compose -f docker-compose.e2e.yml build

echo "Starting game server..."
docker-compose -f docker-compose.e2e.yml up -d game

echo "Waiting for server to be healthy..."
docker-compose -f docker-compose.e2e.yml exec game curl -f http://localhost:3000 || sleep 10

echo "Running e2e tests..."
docker-compose -f docker-compose.e2e.yml run --rm e2e pnpm test:e2e

echo "Cleaning up..."
docker-compose -f docker-compose.e2e.yml down

echo "Done! Check playwright-report for results."
