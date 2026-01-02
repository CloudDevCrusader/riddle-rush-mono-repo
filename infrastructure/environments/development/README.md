# Development Environment

This directory manages the **new development infrastructure** (separate from production).

## Setup

1. **Copy example variables:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit terraform.tfvars (optional):**
   ```hcl
   project_name = "riddle-rush-pwa"
   aws_region   = "eu-central-1"
   # bucket_name will be auto-generated as: riddle-rush-pwa-dev-ACCOUNT_ID
   ```

3. **Initialize:**
   ```bash
   terraform init
   ```

4. **Plan:**
   ```bash
   terraform plan
   ```

5. **Apply:**
   ```bash
   terraform apply
   ```

## Differences from Production

- **Bucket name:** Auto-generated with `-dev-` suffix
- **Shorter cache times:** Faster iteration during development
- **Shorter lifecycle:** 7 days instead of 30 days for old versions
- **Separate CloudFront:** Independent distribution for testing

## Usage

```bash
# Navigate to dev environment
cd infrastructure/environments/development

# Initialize
terraform init

# Plan
terraform plan

# Apply (creates new infrastructure)
terraform apply

# Destroy (removes all dev infrastructure)
terraform destroy
```

## Variables

See `terraform.tfvars.example` for available variables.

## Outputs

After applying:
```bash
terraform output
```

Use outputs for deployment:
```bash
BUCKET=$(terraform output -raw bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)
AWS_S3_BUCKET=$BUCKET AWS_CLOUDFRONT_ID=$CF_ID ./aws-deploy.sh development
```

## Cost Considerations

Development environment uses:
- Same CloudFront price class (PriceClass_100)
- Shorter cache times (reduces costs slightly)
- Separate resources (isolated from production)

**Estimated cost:** ~$1-3/month for low traffic

