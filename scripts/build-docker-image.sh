#!/bin/bash

# Build Docker CI image locally
# Usage: ./scripts/build-docker-image.sh [tag]

set -e

TAG="${1:-local}"
IMAGE_NAME="riddle-rush-ci"

echo "=================================="
echo "Building Docker CI Image"
echo "=================================="
echo "Image: $IMAGE_NAME:$TAG"
echo ""

# Build the image
docker build \
  -f .gitlab/Dockerfile.ci \
  -t "$IMAGE_NAME:$TAG" \
  --progress=plain \
  .

echo ""
echo "=================================="
echo "✅ Docker image built successfully!"
echo "=================================="
echo "Image: $IMAGE_NAME:$TAG"
echo ""
echo "To test the image:"
echo "  docker run --rm -it $IMAGE_NAME:$TAG bash"
echo ""
echo "To run tests in the image:"
echo "  docker run --rm $IMAGE_NAME:$TAG pnpm run test:unit"
echo ""
