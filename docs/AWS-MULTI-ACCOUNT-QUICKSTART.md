# AWS Multi-Account Setup - Quick Start Guide

## Overview

The Riddle Rush deployment infrastructure has been upgraded to use **AWS Organizations with separate sub-accounts** for each environment, providing complete isolation between development, staging, and production deployments.

**Key Benefits:**
- ✅ Environment isolation - Dev/staging/prod completely separated
- ✅ Security - No more root account usage
- ✅ Cost tracking - Separate billing per environment
- ✅ Blast radius containment - Incidents isolated to one environment
- ✅ Deployment safety - Account verification prevents wrong-account deploys

## What Was Implemented

### 1. AWS Infrastructure Changes

**Terraform Backend Configuration:**
- Separate state buckets per environment
- Environment-specific backend.hcl files:
  - `infrastructure/environments/development/backend.hcl`
  - `infrastructure/environments/staging/backend.hcl`
  - `infrastructure/environments/prod/backend.hcl`

**Terraform Files Updated:**
- Added account verification instructions in main.tf headers
- Updated backend configuration to use .hcl files
- Environment-specific tags and naming

### 2. GitLab CI/CD Pipeline Changes

**Old Setup (❌ Insecure):**
```yaml
deploy:aws:
  script:
    - export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID      # Single account
    - export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
    - ./aws-deploy.sh production
```

**New Setup (✅ Secure):**
```yaml
deploy:aws:dev:
  script:
    - export AWS_ACCESS_KEY_ID=$AWS_DEV_ACCESS_KEY_ID
    - export AWS_SECRET_ACCESS_KEY=$AWS_DEV_SECRET_ACCESS_KEY
    - # Account verification happens automatically
    - ./aws-deploy.sh development

deploy:aws:staging:
  # Similar with AWS_STAGING_* credentials

deploy:aws:prod:
  # Similar with AWS_PROD_* credentials
  # Only runs on version tags
```

### 3. Deployment Script Enhancements

**aws-deploy.sh now includes:**
- Automatic AWS account ID verification
- Environment-specific account checks
- Safety checks to prevent cross-environment deployments
- Clear error messages if deploying to wrong account

Example output:
```bash
🔍 Verifying AWS account for environment: production...
✓ Account verification passed
  Deploying to: production (Account: 123456789012)
```

### 4. Documentation

- **Comprehensive Guide:** `docs/AWS-MULTI-ACCOUNT-SETUP.md` (600+ lines)
- **Quick Start:** This document

## Required GitLab CI/CD Variables

You need to configure these variables in **GitLab → Settings → CI/CD → Variables**:

### Development Environment
| Variable | Type | Value | Protected | Masked |
|----------|------|-------|-----------|--------|
| `AWS_DEV_ACCESS_KEY_ID` | Variable | Your dev IAM user access key | ✅ | ✅ |
| `AWS_DEV_SECRET_ACCESS_KEY` | Variable | Your dev IAM user secret key | ✅ | ✅ |
| `AWS_DEV_ACCOUNT_ID` | Variable | Dev AWS account ID (12 digits) | ❌ | ❌ |
| `AWS_DEV_S3_BUCKET` | Variable | e.g., `riddle-rush-dev-123456789012` | ❌ | ❌ |
| `AWS_DEV_CLOUDFRONT_ID` | Variable | CloudFront distribution ID (optional) | ❌ | ❌ |
| `AWS_DEV_CLOUDFRONT_DOMAIN` | Variable | CloudFront domain (optional) | ❌ | ❌ |
| `AWS_DEV_REGION` | Variable | e.g., `eu-central-1` (optional) | ❌ | ❌ |

### Staging Environment
| Variable | Type | Value | Protected | Masked |
|----------|------|-------|-----------|--------|
| `AWS_STAGING_ACCESS_KEY_ID` | Variable | Your staging IAM user access key | ✅ | ✅ |
| `AWS_STAGING_SECRET_ACCESS_KEY` | Variable | Your staging IAM user secret key | ✅ | ✅ |
| `AWS_STAGING_ACCOUNT_ID` | Variable | Staging AWS account ID | ❌ | ❌ |
| `AWS_STAGING_S3_BUCKET` | Variable | Staging S3 bucket name | ❌ | ❌ |
| `AWS_STAGING_CLOUDFRONT_ID` | Variable | CloudFront distribution ID (optional) | ❌ | ❌ |
| `AWS_STAGING_CLOUDFRONT_DOMAIN` | Variable | CloudFront domain (optional) | ❌ | ❌ |
| `AWS_STAGING_REGION` | Variable | e.g., `eu-central-1` (optional) | ❌ | ❌ |

### Production Environment
| Variable | Type | Value | Protected | Masked |
|----------|------|-------|-----------|--------|
| `AWS_PROD_ACCESS_KEY_ID` | Variable | Your prod IAM user access key | ✅ | ✅ |
| `AWS_PROD_SECRET_ACCESS_KEY` | Variable | Your prod IAM user secret key | ✅ | ✅ |
| `AWS_PROD_ACCOUNT_ID` | Variable | Production AWS account ID | ❌ | ❌ |
| `AWS_PROD_S3_BUCKET` | Variable | Production S3 bucket name | ❌ | ❌ |
| `AWS_PROD_CLOUDFRONT_ID` | Variable | CloudFront distribution ID (optional) | ❌ | ❌ |
| `AWS_PROD_CLOUDFRONT_DOMAIN` | Variable | CloudFront domain (optional) | ❌ | ❌ |
| `AWS_PROD_REGION` | Variable | e.g., `eu-central-1` (optional) | ❌ | ❌ |

**Note:** Remove old variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_ID`

## Quick Setup Steps

### Step 1: Set Up AWS Organizations (One-time)

Follow the comprehensive guide in `docs/AWS-MULTI-ACCOUNT-SETUP.md`, sections:
- **Section 1:** Create AWS Organization
- **Section 2:** Create Sub-Accounts for each environment
- **Section 3:** Create IAM users in each sub-account

**Result:** You'll have three separate AWS accounts:
- Development Account (e.g., 111111111111)
- Staging Account (e.g., 222222222222)
- Production Account (e.g., 333333333333)

### Step 2: Configure GitLab CI/CD Variables

1. Go to **GitLab → Your Project → Settings → CI/CD → Variables**
2. **Expand** the Variables section
3. **Add** all variables from the table above
4. For credentials, check **Protected** and **Masked**
5. **Save** variables

### Step 3: Initialize Terraform State for Each Environment

For each environment (development, staging, prod):

```bash
# 1. Set AWS profile for the environment
export AWS_PROFILE=riddle-rush-dev  # or riddle-rush-staging, riddle-rush-prod

# 2. Navigate to environment directory
cd infrastructure/environments/development  # or staging, prod

# 3. Create state bucket and DynamoDB table (see backend.hcl for commands)
aws s3 mb s3://riddle-rush-terraform-state-dev --region eu-central-1
aws s3api put-bucket-versioning \
  --bucket riddle-rush-terraform-state-dev \
  --versioning-configuration Status=Enabled
# ... (see backend.hcl for full commands)

# 4. Initialize Terraform with backend config
terraform init -backend-config=backend.hcl

# 5. Verify you're in correct account
aws sts get-caller-identity

# 6. Apply infrastructure
terraform plan
terraform apply
```

### Step 4: Test Deployments

**Test Development:**
```bash
# Push to development branch
git checkout development
git push

# Or manually trigger pipeline
# GitLab → CI/CD → Pipelines → Run Pipeline → Select 'development' branch
```

**Test Staging:**
```bash
# Push to staging branch
git checkout staging
git push
```

**Test Production:**
```bash
# Create and push version tag
git tag v1.0.0
git push --tags

# GitLab pipeline automatically deploys to production
```

### Step 5: Verify Multi-Account Setup

After deployment, verify you're using separate accounts:

```bash
# Check development deployment
aws cloudfront get-distribution \
  --id $AWS_DEV_CLOUDFRONT_ID \
  --profile riddle-rush-dev \
  --query 'Distribution.DomainName'

# Check production deployment
aws cloudfront get-distribution \
  --id $AWS_PROD_CLOUDFRONT_ID \
  --profile riddle-rush-prod \
  --query 'Distribution.DomainName'

# Verify different account IDs
aws sts get-caller-identity --profile riddle-rush-dev --query Account
aws sts get-caller-identity --profile riddle-rush-prod --query Account
```

## Local Development with Multi-Account

When deploying locally, set environment variables for the target environment:

**Development:**
```bash
export AWS_PROFILE=riddle-rush-dev
export AWS_S3_BUCKET=riddle-rush-dev-111111111111
export AWS_CLOUDFRONT_ID=E1234567890DEV
export AWS_DEV_ACCOUNT_ID=111111111111
./aws-deploy.sh development
```

**Production:**
```bash
export AWS_PROFILE=riddle-rush-prod
export AWS_S3_BUCKET=riddle-rush-prod-333333333333
export AWS_CLOUDFRONT_ID=E1234567890PRD
export AWS_PROD_ACCOUNT_ID=333333333333
./aws-deploy.sh production
```

**Safety Check:** The script will verify you're deploying to the correct account before proceeding.

## Troubleshooting

### "Wrong AWS account" error

**Symptom:**
```
❌ ERROR: Wrong AWS Account!
Expected Account: 111111111111
Current Account:  333333333333
```

**Solution:**
- Verify you're using the correct AWS profile or credentials
- Check that `AWS_DEV_ACCOUNT_ID` (or staging/prod) matches the account you're authenticated with
- Run `aws sts get-caller-identity` to see which account you're using

### "Access denied" errors

**Solution:**
- Verify IAM user has necessary permissions (see `docs/AWS-MULTI-ACCOUNT-SETUP.md` Section 3.3)
- Check that credentials are correctly set in GitLab CI/CD variables
- Ensure credentials are not expired

### Pipeline deploys to wrong environment

**Solution:**
- Check GitLab CI/CD rules in `.gitlab-ci.yml`
- Development deploys on `development` branch
- Staging deploys on `staging` branch
- Production deploys only on version tags (e.g., `v1.0.0`)

### Terraform state conflicts

**Solution:**
- Each environment has its own state bucket (riddle-rush-terraform-state-dev/staging/prod)
- Verify you're using correct backend.hcl file for the environment
- Check DynamoDB lock table exists in the target account

## Security Best Practices

✅ **Do:**
- Use separate IAM users for each environment
- Enable MFA on all IAM users
- Rotate access keys regularly (every 90 days)
- Use billing alerts in each sub-account
- Review CloudTrail logs periodically
- Use least-privilege IAM policies

❌ **Don't:**
- Share credentials between environments
- Use root account credentials for deployments
- Store credentials in code or commit them to Git
- Give developers production account access
- Skip account verification checks

## Cost Management

Each sub-account has separate billing, making it easy to track costs per environment:

**View Costs:**
```bash
# Development costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --profile riddle-rush-dev

# Production costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --profile riddle-rush-prod
```

**Set Billing Alerts:**
Follow Section 8 of `docs/AWS-MULTI-ACCOUNT-SETUP.md` to set up billing alerts for each account.

## Migration from Old Setup

If you were using the old single-account setup:

1. **Keep old variables temporarily** until migration is complete
2. **Set up new variables** as documented above
3. **Test new deployment** on development branch first
4. **Verify** development deployment works correctly
5. **Migrate staging** next, then production
6. **Remove old variables** after successful migration

## Next Steps

- [ ] Set up AWS Organizations (if not already done)
- [ ] Create sub-accounts for dev, staging, prod
- [ ] Create IAM users in each sub-account
- [ ] Configure GitLab CI/CD variables
- [ ] Initialize Terraform state for each environment
- [ ] Test development deployment
- [ ] Test staging deployment
- [ ] Test production deployment
- [ ] Set up billing alerts for each account
- [ ] Document custom domain setup (if applicable)
- [ ] Schedule access key rotation

## Additional Resources

- **Comprehensive Setup Guide:** `docs/AWS-MULTI-ACCOUNT-SETUP.md`
- **AWS Deployment Guide:** `docs/AWS-DEPLOYMENT.md`
- **Terraform Setup:** `docs/TERRAFORM-SETUP.md`
- **GitLab CI/CD Config:** `.gitlab-ci.yml`
- **Deployment Script:** `aws-deploy.sh`

## Support

If you encounter issues:
1. Check troubleshooting section above
2. Review comprehensive guide in `docs/AWS-MULTI-ACCOUNT-SETUP.md`
3. Verify all GitLab CI/CD variables are set correctly
4. Check GitLab pipeline logs for specific error messages
5. Verify AWS account IDs match expected values

---

**Last Updated:** 2025-01-03
**Author:** Claude Code
**Version:** 1.0.0
