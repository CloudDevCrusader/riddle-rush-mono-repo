#!/bin/bash
# Build and package Nuxt SSR for AWS Lambda deployment

set -e

echo "🏗️  Building Nuxt SSR application for AWS Lambda..."
cd apps/game
NITRO_PRESET=aws-lambda pnpm run build

echo "📦 Packaging Lambda deployment..."
cd .output/server

# Create deployment zip
if [ -f "../../lambda-deploy.zip" ]; then
  rm ../../lambda-deploy.zip
fi

zip -r ../../lambda-deploy.zip . -x "*.map" "*.md"

cd ../..
echo "✅ Lambda package created: apps/game/lambda-deploy.zip"
echo "📊 Package size: $(du -h lambda-deploy.zip | cut -f1)"

# Optional: Upload to S3 for Terraform remote state
if [ ! -z "$S3_BUCKET" ]; then
  echo "📤 Uploading to S3..."
  aws s3 cp lambda-deploy.zip "s3://$S3_BUCKET/lambda-deploys/riddle-rush-$(date +%Y%m%d-%H%M%S).zip"
  aws s3 cp lambda-deploy.zip "s3://$S3_BUCKET/lambda-deploys/riddle-rush-latest.zip"
  echo "✅ Uploaded to S3"
fi

echo "🎉 Build complete!"
echo ""
echo "Next steps:"
echo "  1. cd infrastructure"
echo "  2. terraform plan"
echo "  3. terraform apply"
