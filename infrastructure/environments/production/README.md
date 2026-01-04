# Production Environment

This directory manages the **existing production infrastructure**.

## Importing Existing Infrastructure

If you have existing AWS resources (from CloudFormation or manual creation):

### Option 1: Using Import Script

1. **Copy example variables:**

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit terraform.tfvars:**

   ```hcl
   bucket_name = "your-existing-bucket-name"
   # Or leave empty to create new
   ```

3. **Run import script:**
   ```bash
   ./import-existing.sh
   ```

### Option 2: Manual Import

1. **Initialize:**

   ```bash
   terraform init
   ```

2. **Import S3 bucket:**

   ```bash
   terraform import aws_s3_bucket.website your-bucket-name
   ```

3. **Import CloudFront:**

   ```bash
   terraform import aws_cloudfront_distribution.website E1234567890ABC
   ```

4. **Import related resources:**
   ```bash
   terraform import aws_s3_bucket_versioning.website your-bucket-name
   terraform import aws_s3_bucket_public_access_block.website your-bucket-name
   terraform import aws_s3_bucket_website_configuration.website your-bucket-name
   ```

### Option 3: Using terraformer

```bash
# From infrastructure root
./scripts/import-with-terraformer.sh

# Select option 3 (Import both S3 and CloudFront)
# Or manually:
terraformer import aws --resources=s3,cloudfront --regions=eu-central-1 --filter="Name=tags.Environment;Value=production"
```

## After Import

1. **Review plan:**

   ```bash
   terraform plan
   ```

2. **Fix any differences:**
   - Update resource names in main.tf if needed
   - Adjust configurations to match existing setup
   - Review and update variables

3. **Apply:**
   ```bash
   terraform apply
   ```

## Usage

```bash
# Navigate to prod environment
cd infrastructure/environments/production

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply

# Destroy (use with caution!)
terraform destroy
```

## Variables

See `terraform.tfvars.example` for available variables.

**Important:** If importing existing resources, specify:

- `bucket_name` - Your existing S3 bucket name
- Or use terraform import commands with resource IDs

## Outputs

After applying:

```bash
terraform output
```

Use outputs for deployment:

```bash
BUCKET=$(terraform output -raw bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)
AWS_S3_BUCKET=$BUCKET AWS_CLOUDFRONT_ID=$CF_ID ./aws-deploy.sh production
```
