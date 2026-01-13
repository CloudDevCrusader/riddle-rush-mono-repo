# Development Deployment Guide

This guide explains how to deploy the Riddle Rush application to the development environment at `dev.riddlerush.de` with proper configuration to ensure the build is not minified and debugging features are enabled.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Configuration Overview](#configuration-overview)
- [Deployment Process](#deployment-process)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### 1. AWS Configuration

Ensure you have:

- AWS CLI configured with proper credentials
- AWS profile named "riddlerush" or appropriate permissions
- Terraform installed

### 2. Domain Setup

The development environment uses `dev.riddlerush.de`. You need:

- A valid SSL certificate in AWS Certificate Manager (ACM) for `dev.riddlerush.de`
- The certificate must be created in **us-east-1** region (required for CloudFront)
- DNS records pointing to the CloudFront distribution

### 3. Infrastructure Setup

The infrastructure is managed by Terraform. The configuration is located in:

```
infrastructure/environments/development/
```

## Configuration Overview

### Environment Variables

The deployment automatically sets the following environment variables for development:

- `NODE_ENV=development` - Ensures development mode
- `DEBUG_BUILD=true` - Disables minification and enables sourcemaps
- `BASE_URL=/` - Sets the base URL for the application

### Build Configuration

The Nuxt configuration (`apps/game/nuxt.config.ts`) automatically handles development builds:

```typescript
// Disable minification for development and debug builds
const isDev = process.env.NODE_ENV !== 'production'
const isDebugBuild = process.env.DEBUG_BUILD === 'true'
const shouldMinify = isDev || isLocalhostBuild || isDebugBuild ? false : 'esbuild'
```

### Development Features Enabled

When deploying to development:

- ✅ **No minification** - Code remains readable for debugging
- ✅ **Sourcemaps enabled** - Full debugging support
- ✅ **Console logs preserved** - All logging statements remain
- ✅ **Dev plugins enabled** - Vue DevTools, Vite inspect, visualizer
- ✅ **Debug panel available** - Accessible via settings

## Deployment Process

### Step 1: Configure Terraform

Edit `infrastructure/environments/development/terraform.tfvars`:

```hcl
# Development Environment Variables
project_name = "riddle-rush-pwa"
aws_region   = "eu-central-1"

# Development custom domain
domain_names = ["dev.riddlerush.de"]

# Certificate ARN for dev.riddlerush.de
# This certificate must be created in AWS Certificate Manager (ACM) in us-east-1 region
certificate_arn = "arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERTIFICATE_ID"

cloudfront_price_class = "PriceClass_100"
```

### Step 2: Plan and Apply Infrastructure

```bash
# Navigate to development infrastructure directory
cd infrastructure/environments/development

# Initialize Terraform
terraform init

# Plan the infrastructure
terraform plan

# Apply the infrastructure
terraform apply
```

### Step 3: Deploy the Application

```bash
# From the project root
./scripts/deploy-dev.sh
```

This script will:

1. Set `NODE_ENV=development`
2. Set `DEBUG_BUILD=true`
3. Build the application with development settings
4. Upload to S3
5. Invalidate CloudFront cache

### Step 4: Verify Deployment

The deployment script will output the CloudFront URL. You can also check:

```bash
# Check the deployment URL
echo "https://dev.riddlerush.de"

# Check CloudFront status
aws cloudfront get-distribution --id YOUR_CLOUDFRONT_ID
```

## Verification

### Check Build Configuration

After deployment, verify that the build is not minified:

1. Open `https://dev.riddlerush.de` in your browser
2. Open Developer Tools (F12)
3. Go to the "Sources" tab
4. Check that JavaScript files are readable (not minified)
5. Verify that sourcemaps are available

### Check Environment Variables

You can check the runtime configuration by:

```javascript
// In browser console
console.log(window.__NUXT__?.config?.public?.environment)
```

This should show `development`.

## Troubleshooting

### Issue: Build is still minified

**Solution:** Ensure `DEBUG_BUILD=true` is set before building.

```bash
# Set the environment variable
export DEBUG_BUILD=true

# Then deploy
./scripts/deploy-dev.sh
```

### Issue: NODE_ENV is not set to development

**Solution:** The deployment script should automatically set this. Check:

```bash
# Check the deploy-dev.sh script
grep -n "NODE_ENV=development" scripts/deploy-dev.sh
```

### Issue: Domain not resolving

**Solution:** Check DNS and CloudFront configuration:

```bash
# Check Route53 records
aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR_CLOUDFRONT_ID
```

### Issue: SSL certificate not valid

**Solution:** Ensure the certificate is:

- Created in **us-east-1** region
- Valid for `dev.riddlerush.de`
- Properly associated with the CloudFront distribution

## Advanced Configuration

### Custom Build Settings

You can override build settings by setting environment variables:

```bash
# Disable minification explicitly
export DEBUG_BUILD=true

# Set custom base URL
export BASE_URL=/custom-path

# Then deploy
./scripts/deploy-dev.sh
```

### Debug Builds in Production

For debugging production issues, you can create a debug build:

```bash
# Set both production and debug flags
export NODE_ENV=production
export DEBUG_BUILD=true

# Build
cd apps/game && pnpm run generate
```

This creates a production build with sourcemaps and no minification.

## Summary

The development deployment to `dev.riddlerush.de` is configured to:

- ✅ Use `NODE_ENV=development`
- ✅ Disable minification (`DEBUG_BUILD=true`)
- ✅ Enable sourcemaps for debugging
- ✅ Preserve console logs
- ✅ Enable development plugins

This ensures that developers can debug issues effectively while maintaining a production-like environment.
