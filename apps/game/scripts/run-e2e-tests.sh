#!/bin/bash

# Script to run E2E tests with server management

set -e

echo "🚀 Starting E2E test server..."

# Kill any existing processes on port 3000
pkill -f "node.*3000" 2>/dev/null || true
sleep 2

# Start the server in the background
cd "$PWD"
node .output/server/index.mjs >/tmp/nuxt-server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
	echo "❌ Server failed to start"
	cat /tmp/nuxt-server.log
	exit 1
fi

echo "✅ Server started (PID: $SERVER_PID)"

# Run the tests
echo "🧪 Running E2E tests..."
pnpm run test:e2e:simple "$@"

TEST_EXIT_CODE=$?

# Cleanup
echo "🧹 Cleaning up..."
pkill -f "node.*3000" 2>/dev/null || true

if [ $TEST_EXIT_CODE -eq 0 ]; then
	echo "✅ Tests passed!"
else
	echo "❌ Tests failed with exit code $TEST_EXIT_CODE"
fi

exit $TEST_EXIT_CODE
