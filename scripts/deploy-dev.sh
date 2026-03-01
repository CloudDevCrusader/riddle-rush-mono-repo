#!/bin/bash
# ===========================================
# Deploy Development Environment to Vercel
# ===========================================
# Usage: ./scripts/deploy-dev.sh [options]
# Example: ./scripts/deploy-dev.sh
#         ./scripts/deploy-dev.sh --skip-checks
#         ./scripts/deploy-dev.sh --prod
#
# This script deploys the development environment to Vercel.
# Uses vercel.json for build/output configuration.
#
# Options:
#   --skip-checks    Skip pre-deployment checks (lint, typecheck, tests)
#   --prod           Deploy as production (promotes to main alias)
#   --help           Show this help message
#
# Required:
#   - Vercel CLI installed (npx vercel)
#   - Project linked (vercel link)
#   - VERCEL_TOKEN env var or interactive login

set -e
set -o pipefail

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parse command line arguments
SKIP_CHECKS=false
PROD_FLAG=""
for arg in "$@"; do
	case "${arg}" in
	--skip-checks)
		SKIP_CHECKS=true
		;;
	--prod)
		PROD_FLAG="--prod"
		;;
	--help)
		echo "Usage: $0 [options]"
		echo "Options:"
		echo "  --skip-checks    Skip pre-deployment checks"
		echo "  --prod           Deploy as production"
		echo "  --help           Show this help message"
		exit 0
		;;
	*)
		echo "Unknown option: ${arg}"
		exit 1
		;;
	esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_ROOT}"

ENVIRONMENT="development"

echo -e "${BLUE}🚀 Deploying to DEVELOPMENT environment (Vercel)${NC}"
echo "=========================================="

# Check Vercel CLI
if ! command -v vercel &>/dev/null && ! npx vercel --version &>/dev/null 2>&1; then
	echo -e "${RED}❌ Vercel CLI not found. Install with: pnpm add -g vercel${NC}"
	exit 1
fi
echo -e "  ${GREEN}✓ Vercel CLI available${NC}"

# Check for Vercel token (CI) or interactive login
if [[ -n ${VERCEL_TOKEN} ]]; then
	echo -e "  ${GREEN}✓ VERCEL_TOKEN found${NC}"
	TOKEN_FLAG="--token=${VERCEL_TOKEN}"
else
	echo -e "  ${YELLOW}ℹ  No VERCEL_TOKEN — using interactive login${NC}"
	TOKEN_FLAG=""
fi

# Set environment variables
export STAGE=development
export NODE_ENV=development

echo -e "\n${BLUE}Environment:${NC}"
echo -e "  ${GREEN}✓ STAGE=${STAGE}${NC}"
echo -e "  ${GREEN}✓ NODE_ENV=${NODE_ENV}${NC}"
if [[ -n ${PROD_FLAG} ]]; then
	echo -e "  ${GREEN}✓ Production deployment${NC}"
else
	echo -e "  ${GREEN}✓ Preview deployment${NC}"
fi

# Run pre-deployment checks
if [[ ${SKIP_CHECKS} == false ]]; then
	echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
	echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

	echo -e "\n📋 Typecheck..."
	pnpm run typecheck

	echo -e "\n📋 Lint..."
	pnpm run lint

	echo -e "\n📋 Unit tests..."
	pnpm run test:unit

	echo -e "  ${GREEN}✓ All checks passed${NC}"
else
	echo -e "\n${YELLOW}⚠️  Skipping pre-deployment checks${NC}"
fi

# Deploy to Vercel
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}☁️  Deploying to Vercel...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Pull Vercel environment info
echo -e "\n📋 Pulling Vercel environment..."
vercel pull --yes --environment=preview ${TOKEN_FLAG}

# Build with Vercel
echo -e "\n📋 Building project..."
vercel build ${TOKEN_FLAG}

# Deploy prebuilt output
echo -e "\n📋 Deploying..."
DEPLOYMENT_URL=$(vercel deploy --prebuilt ${PROD_FLAG} ${TOKEN_FLAG})

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Development deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}🔗 Deployment URL:${NC} ${DEPLOYMENT_URL}"

echo -e "\n${BLUE}💡 Tips:${NC}"
echo -e "  - Run E2E tests: ${YELLOW}BASE_URL=${DEPLOYMENT_URL} pnpm run test:e2e${NC}"
echo -e "  - View deployment: ${YELLOW}vercel inspect ${DEPLOYMENT_URL}${NC}"
echo -e "  - List deployments: ${YELLOW}vercel ls${NC}"
echo -e "  - View logs: ${YELLOW}vercel logs${NC}"

echo -e "\n${GREEN}✅ Done!${NC}"
