# AWS IAM Setup Guide

This guide explains how to set up AWS credentials and IAM roles for the Riddle Rush project.

## Table of Contents

- [Quick Start](#quick-start)
- [Step-by-Step Guide](#step-by-step-guide)
- [IAM Roles Overview](#iam-roles-overview)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Setup AWS credentials
./scripts/setup-aws-credentials.sh

# 2. Create IAM roles
./scripts/create-iam-roles.sh

# 3. Test with Terraform
export AWS_PROFILE=riddlerush
pnpm run terraform:plan development
```

---

## Step-by-Step Guide

### Step 1: Get AWS Access Keys

1. Log into [AWS Console](https://console.aws.amazon.com/)
2. Click your name (top right) → **Security credentials**
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Choose **Command Line Interface (CLI)**
6. Check acknowledgment → **Next**
7. Add description (optional) → **Create access key**
8. **Important**: Copy both:
   - Access Key ID
   - Secret Access Key
   - (You won't be able to see the secret again!)

### Step 2: Configure AWS CLI

**Option A: Using Helper Script (Recommended)**

```bash
./scripts/setup-aws-credentials.sh
```

Follow the prompts to:

- Configure credentials using `aws configure`
- Or manually edit config files

**Option B: Manual Configuration**

```bash
aws configure --profile riddlerush
```

When prompted, enter:

- AWS Access Key ID: [paste your access key]
- AWS Secret Access Key: [paste your secret key]
- Default region name: `eu-central-1`
- Default output format: `json`

**Option C: Edit Files Manually**

Create/edit `~/.aws/credentials`:

```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_KEY

[riddlerush]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_KEY
```

Create/edit `~/.aws/config`:

```ini
[default]
region = eu-central-1
output = json

[profile riddlerush]
region = eu-central-1
output = json
```

### Step 3: Verify Credentials

```bash
# Test default profile
aws sts get-caller-identity

# Test riddlerush profile
aws sts get-caller-identity --profile riddlerush

# Set as default for session
export AWS_PROFILE=riddlerush
aws sts get-caller-identity
```

You should see output like:

```json
{
  "UserId": "AIDAXXXXXXXXXXXXXXXX",
  "Account": "720377205549",
  "Arn": "arn:aws:iam::720377205549:user/your-username"
}
```

### Step 4: Create IAM Roles (Optional but Recommended)

IAM roles provide better security by allowing temporary credentials and limited permissions.

```bash
./scripts/create-iam-roles.sh
```

This creates three roles:

1. **Developer Role** - Read access + limited deploy
2. **Admin Role** - Full management access
3. **Deployer Role** - CI/CD deployment access

### Step 5: Use IAM Roles

To assume a role and get temporary credentials:

```bash
# Assume developer role
source ./scripts/assume-aws-role.sh developer

# Assume admin role
source ./scripts/assume-aws-role.sh admin

# Assume deployer role
source ./scripts/assume-aws-role.sh deployer
```

This exports temporary credentials (valid for 1 hour):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

### Step 6: Test with Terraform

```bash
# Using profile
export AWS_PROFILE=riddlerush
pnpm run terraform:plan development

# OR using assumed role
source ./scripts/assume-aws-role.sh developer
pnpm run terraform:plan development
```

---

## IAM Roles Overview

### Developer Role

**Purpose**: Day-to-day development work

**Permissions**:

- ✅ Read S3 buckets
- ✅ Upload/delete objects in project buckets
- ✅ View CloudFront distributions
- ❌ Cannot modify CloudFront
- ❌ Cannot modify IAM

**Use cases**:

- Testing deployments
- Debugging issues
- Reading logs

```bash
source ./scripts/assume-aws-role.sh developer
```

### Admin Role

**Purpose**: Full infrastructure management

**Permissions**:

- ✅ Full S3 access
- ✅ Full CloudFront access
- ✅ Route53 management
- ✅ ACM certificate management
- ✅ Limited IAM access

**Use cases**:

- Creating/destroying infrastructure
- Managing CloudFront distributions
- DNS configuration
- SSL certificate management

```bash
source ./scripts/assume-aws-role.sh admin
```

### Deployer Role

**Purpose**: CI/CD pipelines

**Permissions**:

- ✅ Upload/delete objects in project buckets
- ✅ Create CloudFront invalidations
- ✅ Read bucket configurations
- ❌ Cannot modify bucket policies
- ❌ Cannot modify IAM

**Use cases**:

- GitLab CI/CD deployments
- Automated releases
- Content invalidation

```bash
source ./scripts/assume-aws-role.sh deployer
```

---

## Troubleshooting

### Error: "No valid credential sources found"

**Cause**: Terraform can't find AWS credentials

**Solutions**:

1. **Set AWS_PROFILE environment variable**:

   ```bash
   export AWS_PROFILE=riddlerush
   pnpm run terraform:plan development
   ```

2. **Use assumed role**:

   ```bash
   source ./scripts/assume-aws-role.sh developer
   pnpm run terraform:plan development
   ```

3. **Export credentials directly**:
   ```bash
   export AWS_ACCESS_KEY_ID="your-key"
   export AWS_SECRET_ACCESS_KEY="your-secret"
   export AWS_DEFAULT_REGION="eu-central-1"
   ```

### Error: "Error: failed to refresh cached credentials"

**Cause**: Corrupted AWS config files or expired credentials

**Solution**: Run the setup script to fix:

```bash
./scripts/setup-aws-credentials.sh
```

### Error: "aws: command not found"

**Cause**: AWS CLI not installed

**Solution**: Install AWS CLI v2:

```bash
# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# macOS
brew install awscli

# Verify
aws --version
```

### Error: "AccessDenied" when assuming role

**Causes**:

1. Role doesn't exist yet
2. Your user doesn't have permission to assume the role
3. Role trust policy is incorrect

**Solutions**:

1. Create roles first:

   ```bash
   ./scripts/create-iam-roles.sh
   ```

2. Add AssumeRole permission to your IAM user:

   ```bash
   # In AWS Console: IAM → Users → Your User → Add permissions
   # Add policy: sts:AssumeRole for arn:aws:iam::ACCOUNT_ID:role/riddlerush-*
   ```

3. Wait a few seconds for AWS to propagate the changes

### Error: "An error occurred (NoSuchEntity) when calling CreateRole"

**Cause**: You don't have IAM permissions to create roles

**Solution**:

1. Ask your AWS administrator to create the roles
2. Or use root account credentials (not recommended for production)
3. Or just use your regular user credentials without roles

### Terraform works but deployments fail

**Check**:

1. S3 bucket exists:

   ```bash
   aws s3 ls s3://riddle-rush-pwa-dev-720377205549 --profile riddlerush
   ```

2. CloudFront distribution exists:

   ```bash
   aws cloudfront list-distributions --profile riddlerush
   ```

3. Permissions are correct:
   ```bash
   aws s3 cp test.txt s3://riddle-rush-pwa-dev-720377205549/test.txt --profile riddlerush
   ```

---

## Best Practices

### Security

1. **Never commit credentials** to Git
2. **Use IAM roles** instead of long-lived access keys when possible
3. **Rotate access keys** regularly (every 90 days)
4. **Enable MFA** on your AWS account
5. **Use least privilege** - start with developer role, escalate as needed

### Development Workflow

1. **Daily work**: Use developer role

   ```bash
   source ./scripts/assume-aws-role.sh developer
   ```

2. **Infrastructure changes**: Use admin role

   ```bash
   source ./scripts/assume-aws-role.sh admin
   pnpm run terraform:apply production
   ```

3. **CI/CD**: Use deployer role (via GitLab CI variables)

### Profile Management

Add to your `~/.zshrc` or `~/.bashrc` for convenience:

```bash
# AWS Profile shortcuts
alias aws-riddle='export AWS_PROFILE=riddlerush'
alias aws-dev='source ~/projects/riddle-rush-mono-repo/scripts/assume-aws-role.sh developer'
alias aws-admin='source ~/projects/riddle-rush-mono-repo/scripts/assume-aws-role.sh admin'

# Auto-set profile for Riddle Rush project
if [[ "$PWD" == *"riddle-rush"* ]]; then
    export AWS_PROFILE=riddlerush
fi
```

---

## Additional Resources

- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [AWS STS AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

## Quick Reference

```bash
# Setup credentials
./scripts/setup-aws-credentials.sh

# Create IAM roles
./scripts/create-iam-roles.sh

# Assume role
source ./scripts/assume-aws-role.sh <developer|admin|deployer>

# Use profile
export AWS_PROFILE=riddlerush

# Test credentials
aws sts get-caller-identity

# Test Terraform
pnpm run terraform:plan development

# Deploy
pnpm run deploy:dev
```
