# Import Current Infrastructure

Quick guide to import your existing AWS infrastructure into Terraform.

## Quick Start

```bash
# 1. Find your existing resources
cd infrastructure/environments/production
./find-resources.sh

# 2. Import them
./import-existing.sh

# 3. Verify
terraform plan
```

## What Gets Imported

- S3 bucket (website hosting)
- CloudFront distribution
- S3 bucket versioning
- S3 bucket policies
- CloudFront cache behaviors

## After Import

1. Review `terraform plan` output
2. Update configuration if needed
3. Set up remote state (optional but recommended)
4. Sync outputs: `pnpm run terraform:sync production`

## Need Help?

See `infrastructure/environments/production/IMPORT-INSTRUCTIONS.md` for detailed instructions.
