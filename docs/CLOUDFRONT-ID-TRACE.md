# CloudFront ID Usage Trace

This document shows where the CloudFront Distribution ID is set and how it flows through the deployment process to be used for cache invalidation.

## CloudFront ID Flow

### 1. **Source: Terraform Infrastructure**

The CloudFront Distribution ID is created by Terraform and exported as an output:

**File:** `infrastructure/environments/production/outputs.tf` (lines 11-14)

```terraform
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}
```

**File:** `infrastructure/environments/development/outputs.tf` (same structure)

The actual CloudFront distribution is created in:

- `infrastructure/environments/production/main.tf` (resource `aws_cloudfront_distribution.website`)
- `infrastructure/environments/development/main.tf` (resource `aws_cloudfront_distribution.website`)

### 2. **Loading: Deployment Scripts**

The CloudFront ID is loaded from Terraform outputs by the deployment scripts:

**File:** `scripts/lib/deploy-common.sh` (lines 191-263)

The `load_aws_config()` function loads the CloudFront ID in this order:

1. **From `terraform-outputs.json`** (preferred, lines 217-244):

   ```bash
   export AWS_CLOUDFRONT_ID=$(jq -r '.cloudfront_distribution_id.value // empty' "$outputs_json" 2>/dev/null || echo "")
   ```

2. **From `.env.terraform` file** (fallback, lines 246-251)

3. **From Terraform outputs directly** (final fallback, lines 254-256):
   ```bash
   export AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "$AWS_CLOUDFRONT_ID")
   ```

**File:** `scripts/deploy-prod.sh` (line 39)

```bash
load_aws_config "$ENVIRONMENT"
```

**File:** `scripts/deploy-dev.sh` (line 32)

```bash
load_aws_config "$ENVIRONMENT"
```

### 3. **Export: Environment Variable**

The CloudFront ID is exported as an environment variable:

**File:** `scripts/deploy-prod.sh` (line 73)

```bash
export AWS_CLOUDFRONT_ID="$AWS_CLOUDFRONT_ID"
```

**File:** `scripts/deploy-dev.sh` (line 63)

```bash
export AWS_CLOUDFRONT_ID="$AWS_CLOUDFRONT_ID"
```

### 4. **Usage: Cache Invalidation**

The CloudFront ID is used in `aws-deploy.sh` for cache invalidation:

**File:** `scripts/aws-deploy.sh` (line 41)

```bash
CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID:-}"
```

**File:** `scripts/aws-deploy.sh` (lines 228-240)

```bash
# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_ID" ]; then
    echo -e "\n🔄 Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}✓ CloudFront cache invalidated (ID: ${INVALIDATION_ID})${NC}"
    echo -e "  Note: Invalidation may take 5-15 minutes to complete"
else
    echo -e "${YELLOW}⚠️  No CloudFront distribution ID provided. Skipping cache invalidation.${NC}"
    echo -e "${YELLOW}  Set AWS_CLOUDFRONT_ID environment variable to enable this.${NC}"
fi
```

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Terraform Infrastructure                                  │
│    infrastructure/environments/production/main.tf           │
│    └─> Creates: aws_cloudfront_distribution.website         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Terraform Output                                          │
│    infrastructure/environments/production/outputs.tf        │
│    └─> Exports: cloudfront_distribution_id                  │
│        value = aws_cloudfront_distribution.website.id      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Load Configuration                                        │
│    scripts/lib/deploy-common.sh                             │
│    └─> load_aws_config()                                    │
│        ├─> Reads terraform-outputs.json                     │
│        ├─> Or reads .env.terraform                          │
│        └─> Or runs: terraform output -raw                   │
│            cloudfront_distribution_id                       │
│        └─> Sets: export AWS_CLOUDFRONT_ID="..."             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Deployment Scripts                                        │
│    scripts/deploy-prod.sh or scripts/deploy-dev.sh         │
│    └─> Calls: load_aws_config()                            │
│    └─> Exports: export AWS_CLOUDFRONT_ID="$AWS_CLOUDFRONT_ID"│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. AWS Deployment                                            │
│    scripts/aws-deploy.sh                                    │
│    └─> Reads: CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID:-}"       │
│    └─> Uses: aws cloudfront create-invalidation             │
│             --distribution-id "$CLOUDFRONT_ID"              │
│             --paths "/*"                                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Files Summary

| File                                                | Line(s)            | Purpose                                    |
| --------------------------------------------------- | ------------------ | ------------------------------------------ |
| `infrastructure/environments/production/outputs.tf` | 11-14              | Exports CloudFront ID from Terraform       |
| `infrastructure/environments/production/main.tf`    | 110+               | Creates CloudFront distribution resource   |
| `scripts/lib/deploy-common.sh`                      | 180, 223, 236, 263 | Loads CloudFront ID from Terraform outputs |
| `scripts/deploy-prod.sh`                            | 39, 73             | Loads and exports CloudFront ID            |
| `scripts/deploy-dev.sh`                             | 32, 63             | Loads and exports CloudFront ID            |
| `scripts/aws-deploy.sh`                             | 41, 228-240        | Uses CloudFront ID for cache invalidation  |

## Current CloudFront IDs

Based on the infrastructure files, the CloudFront distribution IDs are:

**Production:**

- Distribution ID: Retrieved from Terraform output `cloudfront_distribution_id`
- To view: `cd infrastructure/environments/production && terraform output cloudfront_distribution_id`
- Note: `terraform-outputs.json` is empty (not yet generated)

**Development:**

- **Distribution ID: `E2ILVGUF522S4M`** ✅ (from `terraform-outputs.json`)
- Domain: `dvd66jaack4ue.cloudfront.net`
- Source: `infrastructure/environments/development/terraform-outputs.json` (line 20)
- To view: `cd infrastructure/environments/development && terraform output cloudfront_distribution_id`

## Manual Usage

You can also set the CloudFront ID manually:

```bash
export AWS_CLOUDFRONT_ID="E1234567890ABC"
./scripts/aws-deploy.sh production
```

Or get it from Terraform outputs:

```bash
export AWS_CLOUDFRONT_ID=$(cd infrastructure/environments/production && terraform output -raw cloudfront_distribution_id)
./scripts/aws-deploy.sh production
```

## Invalidation Command

The actual AWS CLI command executed is:

```bash
aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text
```

This creates an invalidation for all paths (`/*`) and returns the invalidation ID.
