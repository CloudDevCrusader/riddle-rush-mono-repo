# AWS Multi-Account Setup Guide

This guide explains how to set up independent AWS sub-accounts for each environment (dev, staging, production) using AWS Organizations.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Why Multi-Account?](#why-multi-account)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Terraform Configuration](#terraform-configuration)
- [GitLab CI/CD Configuration](#gitlab-cicd-configuration)
- [Cost Management](#cost-management)
- [Troubleshooting](#troubleshooting)

## Overview

Instead of deploying all environments to a single AWS account, we use **AWS Organizations** to create separate sub-accounts for each environment:

```
AWS Organization (Root Account)
├── Development Account
│   ├── S3 Bucket: riddle-rush-dev-*
│   └── CloudFront Distribution (dev)
├── Staging Account
│   ├── S3 Bucket: riddle-rush-staging-*
│   └── CloudFront Distribution (staging)
└── Production Account
    ├── S3 Bucket: riddle-rush-prod-*
    └── CloudFront Distribution (prod)
```

## Architecture

### Account Structure

| Account | Purpose | AWS Account ID | Access |
|---------|---------|----------------|--------|
| **Root** (Management) | AWS Organizations only | `123456789012` | Admin only, no deployments |
| **Development** | Dev deployments | `234567890123` | Dev team |
| **Staging** | Pre-prod testing | `345678901234` | Dev + QA teams |
| **Production** | Live application | `456789012345` | Restricted access |

### Security Benefits

✅ **Isolation**: Accidental changes in dev won't affect production
✅ **Blast Radius**: Security incidents contained to single account
✅ **Access Control**: Different IAM permissions per environment
✅ **Cost Tracking**: Separate billing per environment
✅ **Compliance**: Easier to audit and meet regulatory requirements

## Why Multi-Account?

### Security
- **Principle of Least Privilege**: Developers can't accidentally destroy production
- **Credential Separation**: Compromised dev credentials won't expose production
- **Root Account Protection**: Root account used only for organization management

### Operational
- **Clear Boundaries**: No confusion about which environment you're working in
- **Independent Resources**: Different quotas, limits, and configurations per environment
- **Parallel Deployments**: Deploy to dev without affecting production

### Financial
- **Cost Visibility**: See exactly what each environment costs
- **Budget Alerts**: Set different budgets for dev vs production
- **Cost Optimization**: Easily identify and clean up dev resources

## Prerequisites

### 1. Root AWS Account

You'll need:
- Existing AWS account (will become the root/management account)
- Root account email access (for verification)
- Credit card on file

### 2. Email Addresses

AWS requires **unique email addresses** for each sub-account. Options:

**Gmail Plus Addressing** (easiest):
```
Root:        your.email@gmail.com
Development: your.email+aws-dev@gmail.com
Staging:     your.email+aws-staging@gmail.com
Production:  your.email+aws-prod@gmail.com
```

**Separate Emails**:
```
Root:        admin@yourdomain.com
Development: aws-dev@yourdomain.com
Staging:     aws-staging@yourdomain.com
Production:  aws-prod@yourdomain.com
```

### 3. Required Tools

```bash
# AWS CLI v2
aws --version  # Should be 2.x.x

# Terraform
terraform --version  # Should be >= 1.5.0

# pnpm (for deployments)
pnpm --version
```

## Step-by-Step Setup

### Phase 1: Create AWS Organization

#### 1.1 Enable AWS Organizations

```bash
# Login to ROOT account
aws configure --profile riddle-rush-root

# Create organization
aws organizations create-organization --profile riddle-rush-root
```

Or via AWS Console:
1. Login to root account
2. Navigate to **AWS Organizations**
3. Click **Create organization**
4. Choose **All features** (not just consolidated billing)

#### 1.2 Create Development Sub-Account

```bash
# Create development account
aws organizations create-account \
  --email your.email+aws-dev@gmail.com \
  --account-name "Riddle Rush - Development" \
  --profile riddle-rush-root

# Get account ID from output
# Account ID will be like: 234567890123
```

**Save the Account ID** - you'll need it for IAM setup!

#### 1.3 Create Staging Sub-Account

```bash
aws organizations create-account \
  --email your.email+aws-staging@gmail.com \
  --account-name "Riddle Rush - Staging" \
  --profile riddle-rush-root
```

#### 1.4 Create Production Sub-Account

```bash
aws organizations create-account \
  --email your.email+aws-prod@gmail.com \
  --account-name "Riddle Rush - Production" \
  --profile riddle-rush-root
```

#### 1.5 Verify Sub-Accounts

```bash
# List all accounts
aws organizations list-accounts --profile riddle-rush-root

# Output should show:
# - Root account (master)
# - Development account
# - Staging account
# - Production account
```

### Phase 2: Configure Sub-Account Access

For each sub-account, you need to:
1. Assume the `OrganizationAccountAccessRole` (automatically created)
2. Create IAM user for deployments
3. Generate access keys

#### 2.1 Development Account Setup

```bash
# Get development account ID
DEV_ACCOUNT_ID="234567890123"  # Replace with your actual ID

# Assume role in development account
aws sts assume-role \
  --role-arn "arn:aws:iam::${DEV_ACCOUNT_ID}:role/OrganizationAccountAccessRole" \
  --role-session-name "dev-setup" \
  --profile riddle-rush-root

# Copy the credentials from output (AccessKeyId, SecretAccessKey, SessionToken)
# Export them temporarily:
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Create deployment IAM user
aws iam create-user --user-name riddle-rush-deployer

# Attach necessary policies
aws iam attach-user-policy \
  --user-name riddle-rush-deployer \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name riddle-rush-deployer \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

# Create access key
aws iam create-access-key --user-name riddle-rush-deployer

# Save output:
# AccessKeyId: AKIA... (this is AWS_DEV_ACCESS_KEY_ID)
# SecretAccessKey: ... (this is AWS_DEV_SECRET_ACCESS_KEY)
```

#### 2.2 Staging Account Setup

Repeat the same process for staging account:

```bash
STAGING_ACCOUNT_ID="345678901234"  # Replace with your actual ID

# Assume role, create user, generate keys (same as dev)
# Save as: AWS_STAGING_ACCESS_KEY_ID, AWS_STAGING_SECRET_ACCESS_KEY
```

#### 2.3 Production Account Setup

```bash
PROD_ACCOUNT_ID="456789012345"  # Replace with your actual ID

# Assume role, create user, generate keys (same as dev)
# Save as: AWS_PROD_ACCESS_KEY_ID, AWS_PROD_SECRET_ACCESS_KEY
```

### Phase 3: Configure AWS CLI Profiles

Update `~/.aws/config`:

```ini
[profile riddle-rush-root]
region = eu-central-1
output = json

[profile riddle-rush-dev]
region = eu-central-1
output = json

[profile riddle-rush-staging]
region = eu-central-1
output = json

[profile riddle-rush-prod]
region = eu-central-1
output = json
```

Update `~/.aws/credentials`:

```ini
[riddle-rush-root]
aws_access_key_id = AKIA...  # Root account (for organization management only)
aws_secret_access_key = ...

[riddle-rush-dev]
aws_access_key_id = AKIA...  # Development account deployer
aws_secret_access_key = ...

[riddle-rush-staging]
aws_access_key_id = AKIA...  # Staging account deployer
aws_secret_access_key = ...

[riddle-rush-prod]
aws_access_key_id = AKIA...  # Production account deployer
aws_secret_access_key = ...
```

### Phase 4: Test Account Access

```bash
# Test development account
aws sts get-caller-identity --profile riddle-rush-dev
# Should show development account ID

# Test staging account
aws sts get-caller-identity --profile riddle-rush-staging
# Should show staging account ID

# Test production account
aws sts get-caller-identity --profile riddle-rush-prod
# Should show production account ID
```

## Terraform Configuration

### Environment-Specific Backend Configuration

Each environment now uses its own AWS account:

**infrastructure/environments/development/backend.tf:**
```hcl
terraform {
  backend "s3" {
    bucket         = "riddle-rush-terraform-state-dev"
    key            = "development/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock-dev"

    # Development account credentials
    profile = "riddle-rush-dev"
  }
}
```

**infrastructure/environments/prod/backend.tf:**
```hcl
terraform {
  backend "s3" {
    bucket         = "riddle-rush-terraform-state-prod"
    key            = "production/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock-prod"

    # Production account credentials
    profile = "riddle-rush-prod"
  }
}
```

### Deploying with Terraform

```bash
# Deploy to development
cd infrastructure/environments/development
export AWS_PROFILE=riddle-rush-dev
terraform init
terraform plan
terraform apply

# Deploy to production
cd infrastructure/environments/prod
export AWS_PROFILE=riddle-rush-prod
terraform init
terraform plan
terraform apply
```

## GitLab CI/CD Configuration

### Environment Variables Setup

In GitLab: **Settings → CI/CD → Variables**, create:

#### Development Environment

| Variable | Value | Protected | Masked | Environment |
|----------|-------|-----------|--------|-------------|
| `AWS_DEV_ACCESS_KEY_ID` | `AKIA...` | ❌ | ✅ | `development` |
| `AWS_DEV_SECRET_ACCESS_KEY` | `***` | ❌ | ✅ | `development` |
| `AWS_DEV_ACCOUNT_ID` | `234567890123` | ❌ | ❌ | `development` |
| `AWS_DEV_S3_BUCKET` | `riddle-rush-dev-bucket` | ❌ | ❌ | `development` |
| `AWS_DEV_CLOUDFRONT_ID` | `E1234567890ABC` | ❌ | ❌ | `development` |

#### Staging Environment

| Variable | Value | Protected | Masked | Environment |
|----------|-------|-----------|--------|-------------|
| `AWS_STAGING_ACCESS_KEY_ID` | `AKIA...` | ✅ | ✅ | `staging` |
| `AWS_STAGING_SECRET_ACCESS_KEY` | `***` | ✅ | ✅ | `staging` |
| `AWS_STAGING_ACCOUNT_ID` | `345678901234` | ❌ | ❌ | `staging` |
| `AWS_STAGING_S3_BUCKET` | `riddle-rush-staging-bucket` | ❌ | ❌ | `staging` |
| `AWS_STAGING_CLOUDFRONT_ID` | `E2345678901BCD` | ❌ | ❌ | `staging` |

#### Production Environment

| Variable | Value | Protected | Masked | Environment |
|----------|-------|-----------|--------|-------------|
| `AWS_PROD_ACCESS_KEY_ID` | `AKIA...` | ✅ | ✅ | `production` |
| `AWS_PROD_SECRET_ACCESS_KEY` | `***` | ✅ | ✅ | `production` |
| `AWS_PROD_ACCOUNT_ID` | `456789012345` | ✅ | ❌ | `production` |
| `AWS_PROD_S3_BUCKET` | `riddle-rush-prod-bucket` | ✅ | ❌ | `production` |
| `AWS_PROD_CLOUDFRONT_ID` | `E3456789012CDE` | ✅ | ❌ | `production` |

**Important**:
- ✅ **Protected**: Only available on protected branches (main, tags)
- ✅ **Masked**: Hidden in job logs
- Set **Environment scope** to restrict variables to specific environments

### Updated GitLab CI/CD Pipeline

See the updated `.gitlab-ci.yml` file which now includes:
- Separate deployment jobs for each environment
- Environment-specific credentials
- Account ID verification before deployment

## Cost Management

### Set Up Billing Alerts

For each sub-account:

1. Login to sub-account
2. Navigate to **Billing → Billing preferences**
3. Enable **Receive Billing Alerts**
4. Create CloudWatch alarm:

```bash
# Development (lower threshold)
aws cloudwatch put-metric-alarm \
  --alarm-name "dev-billing-alert" \
  --alarm-description "Alert when dev costs exceed $10" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --profile riddle-rush-dev

# Production (higher threshold)
aws cloudwatch put-metric-alarm \
  --alarm-name "prod-billing-alert" \
  --alarm-description "Alert when prod costs exceed $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --profile riddle-rush-prod
```

### Cost Allocation Tags

Add tags to all resources for cost tracking:

```hcl
default_tags {
  tags = {
    Project     = "riddle-rush"
    Environment = "development"  # or "staging", "production"
    ManagedBy   = "Terraform"
    CostCenter  = "engineering"
  }
}
```

## Troubleshooting

### "Access Denied" when assuming role

**Problem**: Can't assume `OrganizationAccountAccessRole`

**Solution**:
```bash
# Verify you're using root account credentials
aws sts get-caller-identity --profile riddle-rush-root

# Verify sub-account exists
aws organizations list-accounts --profile riddle-rush-root

# Check if role exists in sub-account
aws iam get-role \
  --role-name OrganizationAccountAccessRole \
  --profile riddle-rush-dev
```

### Terraform state file in wrong account

**Problem**: Terraform state created in root account instead of sub-account

**Solution**:
```bash
# Delete existing state
rm -rf .terraform terraform.tfstate*

# Re-initialize with correct profile
export AWS_PROFILE=riddle-rush-dev
terraform init
```

### GitLab deployment fails with "Invalid credentials"

**Problem**: CI/CD job can't authenticate to AWS

**Solution**:
1. Verify variables are set correctly in GitLab
2. Check variable environment scope matches job environment
3. Verify credentials are valid:
   ```bash
   export AWS_ACCESS_KEY_ID="AKIA..."
   export AWS_SECRET_ACCESS_KEY="..."
   aws sts get-caller-identity
   ```

### Cannot create S3 bucket - "BucketAlreadyOwnedByYou"

**Problem**: Bucket name exists in different account

**Solution**:
```bash
# Use account-specific bucket name
# Include account ID in bucket name for uniqueness
bucket_name = "${var.project_name}-dev-${data.aws_caller_identity.current.account_id}"
```

## Security Best Practices

### 1. Never Use Root Account for Deployments

❌ **Bad**: Deploy using root account credentials
✅ **Good**: Deploy using sub-account IAM user with minimal permissions

### 2. Rotate Credentials Regularly

```bash
# Create new access key
aws iam create-access-key --user-name riddle-rush-deployer --profile riddle-rush-dev

# Update GitLab CI/CD variables with new key

# Delete old access key
aws iam delete-access-key \
  --user-name riddle-rush-deployer \
  --access-key-id AKIA_OLD_KEY \
  --profile riddle-rush-dev
```

### 3. Enable MFA on Root Account

1. Login to root account
2. **IAM → Security Credentials**
3. **Activate MFA** (use virtual MFA app like Google Authenticator)

### 4. Enable CloudTrail Logging

```bash
# Enable CloudTrail in each sub-account
aws cloudtrail create-trail \
  --name riddle-rush-audit-trail \
  --s3-bucket-name riddle-rush-cloudtrail-dev \
  --profile riddle-rush-dev

aws cloudtrail start-logging \
  --name riddle-rush-audit-trail \
  --profile riddle-rush-dev
```

## Next Steps

After completing this setup:

1. ✅ Test deployments to each environment
2. ✅ Set up billing alerts
3. ✅ Enable CloudTrail logging
4. ✅ Document account IDs and access in team password manager
5. ✅ Train team on multi-account workflows
6. ✅ Set up AWS SSO for easier access management (optional)

## Additional Resources

- [AWS Organizations Best Practices](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_best-practices.html)
- [AWS Multi-Account Strategy](https://aws.amazon.com/organizations/getting-started/best-practices/)
- [Terraform AWS Provider Authentication](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)
- [GitLab CI/CD Variables](https://docs.gitlab.com/ee/ci/variables/)
