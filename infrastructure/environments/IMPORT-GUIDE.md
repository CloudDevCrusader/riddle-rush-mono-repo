# Importing Existing Infrastructure Guide

This guide explains how to import your existing AWS infrastructure into Terraform.

## Overview

You have two environments:

- **Production (production/)** - Import existing infrastructure
- **Development (development/)** - Create new infrastructure

## Step 1: Find Your Existing Resources

### Option A: Using the Find Script

```bash
cd infrastructure/environments/production
./find-resources.sh
```

This will show:

- Existing S3 buckets
- Existing CloudFront distributions

### Option B: Manual AWS CLI

```bash
# List S3 buckets
aws s3 ls | grep riddle-rush

# List CloudFront distributions
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,Comment,DomainName]' --output table
```

## Step 2: Import Production Infrastructure

### Quick Import (Interactive)

```bash
cd infrastructure/environments/production
terraform init
./import-existing.sh
```

The script will:

1. Ask for your existing bucket name
2. Ask for your existing CloudFront ID
3. Import the resources automatically

### Manual Import

```bash
cd infrastructure/environments/production

# 1. Initialize
terraform init

# 2. Import S3 bucket
terraform import aws_s3_bucket.website your-bucket-name

# 3. Import related S3 resources
terraform import aws_s3_bucket_versioning.website your-bucket-name
terraform import aws_s3_bucket_public_access_block.website your-bucket-name
terraform import aws_s3_bucket_website_configuration.website your-bucket-name
terraform import aws_s3_bucket_lifecycle_configuration.website your-bucket-name

# 4. Import CloudFront distribution
terraform import aws_cloudfront_distribution.website E1234567890ABC

# 5. Import OAC (if exists, or it will be created)
# Note: If you have OAI, you may need to migrate to OAC first
```

### Using terraformer

```bash
# From infrastructure root
./scripts/import-with-terraformer.sh

# Select option 3 (Import both S3 and CloudFront)
# Or filter by name:
terraformer import aws --resources=s3,cloudfront --regions=eu-central-1 --filter="Name=tags.Name;Value=*riddle-rush*"
```

## Step 3: Verify Import

After importing, verify everything:

```bash
cd infrastructure/environments/production
terraform plan
```

**Expected:** Should show minimal or no changes if import was successful.

**If you see changes:**

- Review the differences
- Update `main.tf` to match your existing configuration
- Or accept the changes if they're improvements

## Step 4: Update Configuration

If your existing infrastructure differs from the Terraform config:

1. **Review plan output** - See what Terraform wants to change
2. **Update main.tf** - Adjust to match existing setup
3. **Re-run plan** - Verify no unwanted changes

Common adjustments:

- Cache behaviors
- Custom error responses
- Domain names
- Certificate ARNs

## Step 5: Apply (Optional)

If you made configuration changes:

```bash
terraform apply
```

This will update your infrastructure to match Terraform configuration.

## Step 6: Create Development Environment

After production is imported, create the new development environment:

```bash
cd infrastructure/environments/development
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Troubleshooting

### Import Fails: Resource Not Found

**Problem:** `Error: resource not found`

**Solution:**

- Verify resource names/IDs are correct
- Check AWS region matches
- Ensure you have proper permissions

### Import Fails: Resource Already Managed

**Problem:** `Error: resource already managed`

**Solution:**

- Resource already in state
- Check with `terraform state list`
- Remove from state if needed: `terraform state rm aws_s3_bucket.website`

### Plan Shows Many Changes

**Problem:** Plan shows unexpected changes after import

**Solution:**

1. Review each change
2. Update Terraform config to match existing
3. Use `terraform show` to see current state
4. Adjust `main.tf` accordingly

### OAI vs OAC Migration

**Problem:** Existing infrastructure uses OAI, Terraform uses OAC

**Solution:**

1. Import with OAI first
2. Update to OAC in Terraform
3. Apply changes (Terraform will migrate automatically)

## Migration Checklist

- [ ] Find existing resources (`./find-resources.sh`)
- [ ] Initialize Terraform (`terraform init`)
- [ ] Import S3 bucket
- [ ] Import CloudFront distribution
- [ ] Verify with plan (`terraform plan`)
- [ ] Update configuration if needed
- [ ] Apply changes (if any)
- [ ] Create development environment
- [ ] Test deployments to both environments

## Next Steps

After successful import:

1. **Set up remote state** (recommended for production)
2. **Create development environment**
3. **Update deployment scripts** to use Terraform outputs
4. **Document** any custom configurations

## Resources

- [Terraform Import](https://www.terraform.io/docs/cli/import/index.html)
- [Terraform State](https://www.terraform.io/docs/language/state/index.html)
- [AWS Provider Import](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
