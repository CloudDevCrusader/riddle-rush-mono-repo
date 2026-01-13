#!/bin/bash
# Deploy docs to S3 and invalidate CloudFront (optional)

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

DOCS_S3_BUCKET="${DOCS_S3_BUCKET:-${AWS_S3_BUCKET_DOCS:-}}"
DOCS_CLOUDFRONT_ID="${DOCS_CLOUDFRONT_ID:-}"
DOCS_BASE_URL="${DOCS_BASE_URL:-/}"
DOCS_PUBLIC_SITE_URL="${DOCS_PUBLIC_SITE_URL:-https://docs.riddlerush.de}"

if [[ -z "${DOCS_S3_BUCKET}" ]]; then
  echo -e "${RED}Missing DOCS_S3_BUCKET (or AWS_S3_BUCKET_DOCS).${NC}"
  exit 1
fi

echo -e "${BLUE}Building docs...${NC}"
BASE_URL="${DOCS_BASE_URL}" NUXT_PUBLIC_SITE_URL="${DOCS_PUBLIC_SITE_URL}" \
  pnpm --filter @riddle-rush/docs run generate

echo -e "${BLUE}Syncing to s3://${DOCS_S3_BUCKET}...${NC}"
aws s3 sync apps/docs/.output/public "s3://${DOCS_S3_BUCKET}" --delete

if [[ -n "${DOCS_CLOUDFRONT_ID}" ]]; then
  echo -e "${BLUE}Invalidating CloudFront ${DOCS_CLOUDFRONT_ID}...${NC}"
  aws cloudfront create-invalidation --distribution-id "${DOCS_CLOUDFRONT_ID}" --paths "/*" >/dev/null
  echo -e "${GREEN}CloudFront invalidation submitted.${NC}"
else
  echo -e "${YELLOW}Skipping CloudFront invalidation (DOCS_CLOUDFRONT_ID not set).${NC}"
fi

echo -e "${GREEN}Docs deploy complete.${NC}"
