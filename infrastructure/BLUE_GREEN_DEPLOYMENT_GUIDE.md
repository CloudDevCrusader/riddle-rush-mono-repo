# Blue-Green Deployment Guide

This guide explains how to use the blue-green deployment strategy to eliminate 404 errors during CloudFront/S3 deployments.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Deployment Process](#deployment-process)
- [Switching Between Environments](#switching-between-environments)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Blue-green deployment is a strategy that maintains two identical production environments (blue and green). Only one environment is live at any time, while the other serves as a staging area for the next deployment.

### Benefits

- **Zero Downtime**: Eliminates 404 errors during deployment
- **Instant Rollback**: Switch back to previous version instantly if issues arise
- **Reduced Risk**: Test new versions in production-like environment before going live
- **Faster Deployments**: Deploy to inactive environment while live environment continues serving traffic

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        CloudFront Distribution                 │
│                                                               │
│  ┌─────────────────┐       ┌─────────────────┐               │
│  │   S3 Blue       │       │   S3 Green      │               │
│  │  (Active)       │       │  (Inactive)     │               │
│  └─────────────────┘       └─────────────────┘               │
│              ▲                         ▲                     │
│              │                         │                     │
│              │                         │                     │
│  ┌───────────┴───────────┐ ┌───────────┴───────────┐       │
│  │   Deploy New Version  │ │   Switch Traffic       │       │
│  │   to Inactive Bucket  │ │   to New Version       │       │
│  └───────────────────────┘ └───────────────────────┘       │
└───────────────────────────────────────────────────────────────┘
```

## Deployment Process

### 1. Initial Setup

The blue-green deployment module creates:

- Two S3 buckets: `blue` and `green`
- One CloudFront distribution pointing to the active bucket (blue by default)
- Output variables for easy switching

### 2. Deployment Workflow

#### Step 1: Deploy to Inactive Environment

```bash
# Check current active environment
terraform output active_bucket_name

# Deploy to the inactive bucket (e.g., if blue is active, deploy to green)
AWS_S3_BUCKET=$(terraform output green_bucket_name) \
AWS_CLOUDFRONT_ID=$(terraform output cloudfront_distribution_id) \
AWS_REGION=eu-central-1 \
./scripts/aws-deploy.sh production
```

#### Step 2: Test the New Version

Test your application thoroughly in the inactive environment:

- Run automated tests
- Perform manual testing
- Verify all functionality works as expected

#### Step 3: Switch Traffic to New Version

```bash
# Switch to green environment
terraform apply -var=use_green=true

# Verify the switch
terraform output active_bucket_name  # Should show green bucket
```

#### Step 4: Monitor and Rollback (if needed)

```bash
# Monitor the new version for issues
# If problems occur, switch back immediately:
terraform apply -var=use_green=false
```

## Switching Between Environments

### Switch to Green Environment

```bash
# Preview changes
terraform plan -var=use_green=true

# Apply changes
terraform apply -var=use_green=true
```

### Switch to Blue Environment

```bash
# Preview changes
terraform plan -var=use_green=false

# Apply changes
terraform apply -var=use_green=false
```

### Quick Switch Commands

The module provides convenient output variables:

```bash
# Show switch commands
terraform output switch_to_green_command
terraform output switch_to_blue_command

# Example output:
# switch_to_green_command = "terraform apply -var=use_green=true"
# switch_to_blue_command = "terraform apply -var=use_green=false"
```

## Best Practices

### 1. Deployment Strategy

- **Always deploy to inactive environment first**
- **Test thoroughly before switching traffic**
- **Switch during low-traffic periods**
- **Monitor closely after switching**

### 2. Cache Management

The CloudFront distribution uses:

- **1 hour TTL** for static assets in production
- **5 minutes TTL** for static assets in development
- **1 minute TTL** for HTML files (allows faster switching)

### 3. Version Control

- Use S3 versioning (enabled by default)
- Keep 30 days of non-current versions
- Use unique version identifiers in your deployment scripts

### 4. Monitoring

- Monitor CloudFront metrics after switching
- Set up alarms for 4xx/5xx errors
- Verify cache hit ratio remains high

## Troubleshooting

### Issue: CloudFront Still Serving Old Content After Switch

**Solution:**

1. Wait for cache TTL to expire (1 minute for HTML, 1 hour for static assets)
2. Perform cache invalidation if needed:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id $(terraform output cloudfront_distribution_id) \
     --paths "/*"
   ```

### Issue: 404 Errors After Switching

**Solution:**

1. Verify files were deployed to the correct bucket
2. Check CloudFront distribution origin configuration
3. Switch back to previous environment:
   ```bash
   terraform apply -var=use_green=false  # or true depending on current state
   ```

### Issue: Terraform Plan Shows No Changes When Switching

**Solution:**

1. Ensure you're using the correct `-var=use_green` flag
2. Check that the CloudFront distribution is properly configured
3. Verify the module outputs show the correct active bucket

## Environment-Specific Notes

### Development Environment

- Uses shorter cache TTLs for faster testing
- Non-current version expiration: 7 days
- Ideal for testing blue-green switching process

### Production Environment

- Uses longer cache TTLs for better performance
- Non-current version expiration: 30 days
- S3 transfer acceleration enabled
- More conservative switching approach recommended

## Advanced Usage

### Automated Deployment Script

Create a deployment script that handles the blue-green switching:

```bash
#!/bin/bash
# deploy-blue-green.sh

# Get current active bucket
CURRENT_ACTIVE=$(terraform output -raw active_bucket_name)

# Determine target bucket
if [[ "$CURRENT_ACTIVE" == *"blue"* ]]; then
  TARGET="green"
  SWITCH_VAR="true"
else
  TARGET="blue"
  SWITCH_VAR="false"
fi

# Get target bucket name
TARGET_BUCKET=$(terraform output -raw ${TARGET}_bucket_name)

# Deploy to target bucket
echo "Deploying to $TARGET bucket..."
AWS_S3_BUCKET=$TARGET_BUCKET \
AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id) \
AWS_REGION=eu-central-1 \
./scripts/aws-deploy.sh production

# Ask for confirmation before switching
read -p "Deployment complete. Switch traffic to $TARGET environment? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Switching to $TARGET environment..."
  terraform apply -var="use_green=$SWITCH_VAR" -auto-approve
  echo "Switch complete!"
else
  echo "Switch cancelled. Traffic remains on current environment."
fi
```

### CI/CD Integration

Integrate blue-green deployment into your CI/CD pipeline:

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production

on:
  push:
    branches: [main]
    paths:
      - 'apps/game/**'
      - '!**.md'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Get Current Active Environment
        id: get-active
        run: |
          cd infrastructure/environments/production
          terraform init
          echo "active=$(terraform output -raw active_bucket_name)" >> $GITHUB_OUTPUT

      - name: Determine Target Environment
        id: determine-target
        run: |
          if [[ "${{ steps.get-active.outputs.active }}" == *"blue"* ]]; then
            echo "target=green" >> $GITHUB_OUTPUT
            echo "switch_var=true" >> $GITHUB_OUTPUT
          else
            echo "target=blue" >> $GITHUB_OUTPUT
            echo "switch_var=false" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to Target Environment
        run: |
          TARGET_BUCKET=$(cd infrastructure/environments/production && terraform output -raw ${{ steps.determine-target.outputs.target }}_bucket_name)
          echo "Deploying to $TARGET_BUCKET..."
          # Add your deployment commands here

      - name: Switch Traffic (Manual Approval)
        if: success()
        run: |
          echo "::warning::Manual approval required for production switch"
          echo "Run: terraform apply -var="use_green=${{ steps.determine-target.outputs.switch_var }}""
```

## Security Considerations

- **IAM Permissions**: Ensure deployment scripts have minimal required permissions
- **S3 Bucket Policies**: Restrict access to CloudFront only
- **CloudFront Security**: Enable AWS WAF for additional protection
- **Secrets Management**: Use AWS Secrets Manager for sensitive credentials

## Cost Optimization

- **S3 Storage**: Blue-green deployment doubles S3 storage costs
- **CloudFront**: No additional cost for the distribution itself
- **Cleanup**: Remove old versions regularly (lifecycle policies configured)

## Migration from Single Bucket

If migrating from a single-bucket setup:

1. **Backup existing bucket**
2. **Deploy blue-green infrastructure**
3. **Copy content to both blue and green buckets**
4. **Update DNS to point to new CloudFront distribution**
5. **Test thoroughly**
6. **Decommission old infrastructure**

## Monitoring and Alerts

Recommended CloudWatch alarms:

- **High 4xx Error Rate**: Alert when 4xx errors exceed threshold
- **High 5xx Error Rate**: Alert when 5xx errors exceed threshold
- **Low Cache Hit Ratio**: Alert when cache hit ratio drops significantly
- **High Latency**: Alert when response times increase

## Conclusion

The blue-green deployment strategy provides a robust solution for zero-downtime deployments. By following this guide, you can eliminate 404 errors during CloudFront/S3 deployments and achieve seamless updates to your application.

**Remember**: Always test in development environment before applying changes to production!
