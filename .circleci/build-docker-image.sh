#!/usr/bin/env bash
# Build and optionally push the custom CircleCI Docker image
#
# Usage:
#   ./build-docker-image.sh [OPTIONS]
#
# Options:
#   --push              Push image to registry after building
#   --registry REGISTRY Registry to push to (default: GitLab Container Registry)
#   --project PROJECT   GitLab project path (default: djdiox/riddle-rush-nuxt-pwa)
#   --tag TAG           Custom tag (default: latest)
#
# Examples:
#   # Build only
#   ./build-docker-image.sh
#
#   # Build and push to GitLab Container Registry
#   ./build-docker-image.sh --push
#
#   # Build and push with custom tag
#   ./build-docker-image.sh --push --tag v1.0.0
#
#   # Build and push to custom GitLab project
#   ./build-docker-image.sh --push --project youruser/yourproject

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
PUSH=false
REGISTRY="registry.gitlab.com"
PROJECT="djdiox/riddle-rush-nuxt-pwa"
TAG="latest"
IMAGE_NAME="ci-build"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --push)
      PUSH=true
      shift
      ;;
    --registry)
      REGISTRY="$2"
      shift 2
      ;;
    --project)
      PROJECT="$2"
      shift 2
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    -h|--help)
      sed -n '2,/^$/p' "$0" | sed 's/^# //'
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}" >&2
      exit 1
      ;;
  esac
done

# Construct full image name
FULL_IMAGE_NAME="${REGISTRY}/${PROJECT}/${IMAGE_NAME}:${TAG}"

echo -e "${BLUE}=== Building Custom CircleCI Docker Image ===${NC}"
echo -e "Image name: ${GREEN}${FULL_IMAGE_NAME}${NC}"
echo -e "Dockerfile: ${SCRIPT_DIR}/Dockerfile"
echo ""

# Build the image
echo -e "${BLUE}Building Docker image...${NC}"
docker build \
  -t "${FULL_IMAGE_NAME}" \
  -f "${SCRIPT_DIR}/Dockerfile" \
  "${REPO_ROOT}"

echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo ""

# Verify the image
echo -e "${BLUE}Verifying installed tools...${NC}"
docker run --rm "${FULL_IMAGE_NAME}" bash -c '
  echo "Node: $(node --version)"
  echo "npm: $(npm --version)"
  echo "pnpm: $(corepack pnpm --version)"
  echo "AWS CLI: $(aws --version)"
  echo "Terraform: $(terraform version -json | grep -o "\"version\":\"[^\"]*\"" | cut -d\" -f4)"
'
echo ""

# Push if requested
if [ "$PUSH" = true ]; then
  echo -e "${BLUE}Pushing image to GitLab Container Registry...${NC}"
  echo -e "${YELLOW}You may be prompted to login to ${REGISTRY}${NC}"
  echo -e "${YELLOW}Login with: docker login ${REGISTRY} -u <gitlab-username> -p <gitlab-access-token>${NC}"

  docker push "${FULL_IMAGE_NAME}"

  echo -e "${GREEN}✅ Image pushed successfully${NC}"
  echo ""
  echo -e "${GREEN}Image available at: ${FULL_IMAGE_NAME}${NC}"
  echo ""
  echo -e "${BLUE}To use in CircleCI:${NC}"
  echo -e "  1. Update config.yml x-custom-image anchor with: ${FULL_IMAGE_NAME}"
  echo -e "  2. Add GitLab registry credentials to CircleCI environment variables:"
  echo -e "     - GITLAB_REGISTRY_USER (your GitLab username)"
  echo -e "     - GITLAB_REGISTRY_TOKEN (GitLab access token with read_registry scope)"
else
  echo -e "${YELLOW}Image built but not pushed (use --push to push)${NC}"
  echo ""
  echo -e "${BLUE}To push to GitLab Container Registry:${NC}"
  echo -e "  1. Login: docker login ${REGISTRY} -u <username> -p <access-token>"
  echo -e "  2. Push: docker push ${FULL_IMAGE_NAME}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
