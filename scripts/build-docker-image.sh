#!/usr/bin/env bash

# Build Docker CI image locally
# Usage: ./scripts/build-docker-image.sh [tag]

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root
require_cmd docker

TAG="${1:-local}"
IMAGE_NAME="riddle-rush-ci"

log "=================================="
log "Building Docker CI Image"
log "=================================="
log "Image: ${IMAGE_NAME}:${TAG}"
log ""

# Build the image
docker build \
  -f .gitlab/Dockerfile.ci \
  -t "${IMAGE_NAME}:${TAG}" \
  --progress=plain \
  .

log ""
log "=================================="
log "✅ Docker image built successfully!"
log "=================================="
log "Image: ${IMAGE_NAME}:${TAG}"
log ""
log "To test the image:"
log "  docker run --rm -it ${IMAGE_NAME}:${TAG} bash"
log ""
log "To run tests in the image:"
log "  docker run --rm ${IMAGE_NAME}:${TAG} pnpm run test:unit"
log ""
