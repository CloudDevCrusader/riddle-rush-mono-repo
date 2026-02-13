#!/bin/bash
# Setup script for Vercel deployment

set -e

echo "🚀 Riddle Rush - Vercel Deployment Setup"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is installed"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/game" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Step 1: Link to Vercel Project"
echo "----------------------------------"
echo "Running 'vercel link'..."
echo ""

vercel link

echo ""
echo "✅ Project linked to Vercel"
echo ""

# Check if .vercel/project.json exists
if [ -f ".vercel/project.json" ]; then
    echo "📋 Step 2: GitHub Secrets Configuration"
    echo "---------------------------------------"
    echo "Add these secrets to your GitHub repository:"
    echo "(Settings → Secrets and variables → Actions)"
    echo ""
    
    # Extract IDs from project.json
    ORG_ID=$(grep -o '"orgId":"[^"]*' .vercel/project.json | cut -d'"' -f4)
    PROJECT_ID=$(grep -o '"projectId":"[^"]*' .vercel/project.json | cut -d'"' -f4)
    
    echo "VERCEL_ORG_ID=$ORG_ID"
    echo "VERCEL_PROJECT_ID=$PROJECT_ID"
    echo "VERCEL_TOKEN=(Get from https://vercel.com/account/tokens)"
    echo ""
    echo "Copy these values and add them to GitHub Secrets."
    echo ""
fi

echo "📋 Step 3: Environment Variables"
echo "--------------------------------"
echo "Configure these in Vercel Dashboard → Project Settings → Environment Variables:"
echo ""
echo "For Production (main branch):"
echo "  STAGE=production"
echo "  NODE_ENV=production"
echo "  NUXT_PUBLIC_SITE_URL=https://[your-project].vercel.app"
echo "  ENABLE_ANALYTICS=true"
echo "  ENABLE_PWA=true"
echo "  ENABLE_DEBUG_PANEL=false"
echo ""
echo "For Development (development branch):"
echo "  STAGE=development"
echo "  NODE_ENV=development"
echo "  NUXT_PUBLIC_SITE_URL=https://[your-project]-dev.vercel.app"
echo "  ENABLE_ANALYTICS=false"
echo "  ENABLE_PWA=false"
echo "  ENABLE_DEBUG_PANEL=true"
echo ""

echo "📋 Step 4: Test Deployment"
echo "--------------------------"
echo "You can now test deployment with:"
echo ""
echo "  Development: pnpm run deploy:vercel:dev"
echo "  Production:  pnpm run deploy:vercel:prod"
echo ""

echo "📋 Step 5: Enable GitHub Actions"
echo "--------------------------------"
echo "Push to GitHub to activate automatic deployments:"
echo ""
echo "  git add ."
echo "  git commit -m 'feat: setup Vercel deployment with GitHub Actions'"
echo "  git push origin main"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🔗 Useful links:"
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - GitHub Actions: https://github.com/[your-username]/[your-repo]/actions"
echo "  - Documentation: docs/VERCEL-DEPLOYMENT.md"
echo ""