# Import Current Infrastructure

This guide will help you import your existing AWS infrastructure into Terraform.

## Step 1: Find Your Resources

```bash
cd infrastructure/environments/prod
./find-resources.sh
```

This will show:
- Existing S3 buckets matching "riddle-rush"
- Existing CloudFront distributions

## Step 2: Import Resources

### Option A: Interactive Import

```bash
./import-existing.sh
```

The script will:
1. Ask for your S3 bucket name
2. Ask for your CloudFront distribution ID
3. Import them automatically

### Option B: Manual Import

If you know your resource names:

```bash
# Initialize Terraform
terraform init

# Import S3 bucket
terraform import aws_s3_bucket.website YOUR_BUCKET_NAME

# Import CloudFront distribution
terraform import aws_cloudfront_distribution.website E1234567890ABC

# Import related S3 resources
terraform import aws_s3_bucket_versioning.website YOUR_BUCKET_NAME
terraform import aws_s3_bucket_public_access_block.website YOUR_BUCKET_NAME
terraform import aws_s3_bucket_website_configuration.website YOUR_BUCKET_NAME
```

## Step 3: Verify Import

```bash
terraform plan
```

This should show minimal or no changes if the import was successful.

## Step 4: Update Configuration (if needed)

If `terraform plan` shows differences:
1. Review the differences
2. Update `main.tf` to match your existing setup
3. Re-run `terraform plan` until no unwanted changes

## Step 5: Apply (Optional)

If you made configuration changes:

```bash
terraform apply
```

## Common Issues

### OAI vs OAC

If your existing infrastructure uses OAI (Origin Access Identity), Terraform will use OAC (Origin Access Control). The import will handle this migration automatically.

### Resource Not Found

If import fails:
- Verify resource names/IDs are correct
- Check AWS region matches
- Ensure you have proper permissions

### Many Changes After Import

If plan shows many changes:
- Review each change carefully
- Update Terraform config to match existing
- Some changes may be improvements (accept them)

## Next Steps

After successful import:
1. Set up remote state (see `infrastructure/SETUP-STATE-BUCKET.md`)
2. Sync Terraform outputs: `pnpm run terraform:sync prod`
3. Deploy using Terraform: `pnpm run deploy:terraform prod`

