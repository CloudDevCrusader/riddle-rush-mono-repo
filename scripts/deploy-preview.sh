#!/bin/bash
# ===========================================
# Deploy Preview to Vercel + alias preview.riddlerush.de
# ===========================================
# Usage: ./scripts/deploy-preview.sh [options]
#
# Deploys a preview build to Vercel and aliases it to preview.riddlerush.de
#
# Options:
#   --skip-checks    Skip pre-deployment checks (typecheck, lint)
#   --skip-alias     Deploy only, don't update preview.riddlerush.de alias
#   --help           Show this help message

set -e
set -o pipefail

PREVIEW_DOMAIN="preview.riddlerush.de"
SKIP_CHECKS=false
SKIP_ALIAS=false

for arg in "$@"; do
	case "${arg}" in
	--skip-checks)
		SKIP_CHECKS=true
		;;
	--skip-alias)
		SKIP_ALIAS=true
		;;
	--help)
		echo "Usage: $0 [options]"
		echo "Options:"
		echo "  --skip-checks    Skip pre-deployment checks"
		echo "  --skip-alias     Deploy only, don't update ${PREVIEW_DOMAIN}"
		echo "  --help           Show this help message"
		exit 0
		;;
	*)
		echo "Unknown option: ${arg}"
		echo "Run with --help for usage"
		exit 1
		;;
	esac
done

echo "================================================"
echo "  Vercel Preview Deploy → ${PREVIEW_DOMAIN}"
echo "================================================"
echo ""

# Check vercel CLI
if ! command -v vercel &>/dev/null; then
	echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
	exit 1
fi

# Pre-deployment checks
if [ "${SKIP_CHECKS}" = false ]; then
	echo "🔍 Running pre-deployment checks..."
	pnpm run typecheck || {
		echo "❌ TypeScript errors. Fix before deploying."
		exit 1
	}
	pnpm run lint || {
		echo "❌ Lint errors. Fix before deploying."
		exit 1
	}
	echo "✅ Checks passed"
	echo ""
fi

# Deploy to Vercel (preview, not production)
echo "🚀 Deploying to Vercel..."
DEPLOY_URL=$(vercel --yes 2>&1 | tee /dev/stderr | grep -oE 'https://[a-zA-Z0-9._-]+\.vercel\.app')

if [ -z "${DEPLOY_URL}" ]; then
	echo "❌ Failed to capture Vercel deployment URL"
	exit 1
fi

echo ""
echo "✅ Deployed to: ${DEPLOY_URL}"

# Set alias
if [ "${SKIP_ALIAS}" = false ]; then
	echo ""
	echo "🔗 Aliasing ${DEPLOY_URL} → ${PREVIEW_DOMAIN}..."
	vercel alias set "${DEPLOY_URL}" "${PREVIEW_DOMAIN}"

	echo ""
	echo "================================================"
	echo "  ✅ Preview live at: https://${PREVIEW_DOMAIN}"
	echo "  📦 Vercel URL:      ${DEPLOY_URL}"
	echo "================================================"
else
	echo ""
	echo "================================================"
	echo "  ✅ Deployed (alias skipped)"
	echo "  📦 Vercel URL: ${DEPLOY_URL}"
	echo "================================================"
fi
