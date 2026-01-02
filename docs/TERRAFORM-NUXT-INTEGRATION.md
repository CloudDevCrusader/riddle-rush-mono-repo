# Terraform + Nuxt.js Integration

This guide explains how to integrate Terraform outputs with Nuxt.js for seamless deployment.

## Overview

The integration allows:
- **Automatic configuration** - Nuxt.js reads Terraform outputs
- **Deployment automation** - Deploy scripts use Terraform outputs
- **Environment management** - Separate configs for prod/dev

## Setup Steps

### 1. Create Terraform State Bucket (One-Time)

```bash
cd infrastructure/state-bucket
terraform init
terraform plan
terraform apply
```

This creates:
- S3 bucket for Terraform state
- DynamoDB table for state locking

**Get backend configuration:**
```bash
terraform output backend_config
```

### 2. Configure Remote State

Update each environment's `main.tf` with backend configuration:

**Production (`environments/prod/main.tf`):**
```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-ACCOUNT_ID"
    key            = "prod/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

**Development (`environments/development/main.tf`):**
```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-ACCOUNT_ID"
    key            = "development/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

**Migrate state:**
```bash
# Production
cd environments/prod
terraform init -migrate-state

# Development
cd environments/development
terraform init -migrate-state
```

### 3. Sync Terraform Outputs

After applying Terraform changes, sync outputs:

```bash
# Sync production outputs
pnpm run terraform:sync prod

# Sync development outputs
pnpm run terraform:sync development
```

This creates:
- `terraform-outputs.json` - JSON file with all outputs
- `.env.terraform` - Environment variables file

### 4. Use in Nuxt.js

Terraform outputs are available in `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    cloudfrontDomain: process.env.NUXT_PUBLIC_CLOUDFRONT_DOMAIN || '',
    websiteUrl: process.env.NUXT_PUBLIC_WEBSITE_URL || '',
    awsRegion: process.env.AWS_REGION || 'eu-central-1',
  },
}
```

**Access in components:**
```typescript
const { public: { cloudfrontDomain, websiteUrl } } = useRuntimeConfig()
```

### 5. Deploy with Terraform Outputs

**Option A: Using deploy script**
```bash
pnpm run deploy:terraform prod
```

**Option B: Manual**
```bash
# Get outputs
source ./scripts/get-terraform-outputs.sh prod

# Deploy
./aws-deploy.sh production
```

## Scripts Reference

### Get Terraform Outputs

```bash
# Export outputs as environment variables
source ./scripts/get-terraform-outputs.sh [environment]

# Or use npm script
pnpm run terraform:outputs [environment]
```

**Exports:**
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_ID`
- `AWS_REGION`
- `CLOUDFRONT_DOMAIN`
- `WEBSITE_URL`

### Sync Terraform Outputs

```bash
# Sync outputs to JSON and .env files
./scripts/sync-terraform-outputs.sh [environment]

# Or use npm script
pnpm run terraform:sync [environment]
```

**Creates:**
- `infrastructure/environments/{env}/terraform-outputs.json`
- `infrastructure/environments/{env}/.env.terraform`

### Deploy with Terraform

```bash
# Deploy using Terraform outputs
./scripts/deploy-with-terraform.sh [environment]

# Or use npm script
pnpm run deploy:terraform [environment]
```

## Workflow

### Initial Setup

1. **Create state bucket:**
   ```bash
   pnpm run infra:state:apply
   ```

2. **Configure remote state** in environment `main.tf` files

3. **Migrate state:**
   ```bash
   cd infrastructure/environments/prod
   terraform init -migrate-state
   ```

### Daily Workflow

1. **Make infrastructure changes:**
   ```bash
   cd infrastructure/environments/prod
   terraform plan
   terraform apply
   ```

2. **Sync outputs:**
   ```bash
   pnpm run terraform:sync prod
   ```

3. **Deploy application:**
   ```bash
   pnpm run deploy:terraform prod
   ```

## CI/CD Integration

### GitLab CI/CD

Add to `.gitlab-ci.yml`:

```yaml
deploy:terraform:
  stage: deploy
  script:
    - cd infrastructure/environments/prod
    - terraform init
    - terraform output -json > terraform-outputs.json
    - cd ../../..
    - source infrastructure/environments/prod/.env.terraform
    - pnpm run generate
    - ./aws-deploy.sh production
  only:
    - main
```

### GitHub Actions

```yaml
- name: Get Terraform Outputs
  run: |
    cd infrastructure/environments/prod
    terraform init
    terraform output -json > terraform-outputs.json
    source .env.terraform
    echo "AWS_S3_BUCKET=$AWS_S3_BUCKET" >> $GITHUB_ENV
    echo "AWS_CLOUDFRONT_ID=$AWS_CLOUDFRONT_ID" >> $GITHUB_ENV
```

## Troubleshooting

### Outputs Not Found

**Problem:** `terraform output` returns empty

**Solution:**
1. Ensure Terraform has been applied: `terraform apply`
2. Check state file exists: `terraform state list`
3. Verify outputs defined in `outputs.tf`

### Environment Variables Not Set

**Problem:** Nuxt.js can't read Terraform outputs

**Solution:**
1. Run sync script: `pnpm run terraform:sync prod`
2. Source the .env file: `source infrastructure/environments/prod/.env.terraform`
3. Or use get script: `source ./scripts/get-terraform-outputs.sh prod`

### State Lock Issues

**Problem:** `Error acquiring the state lock`

**Solution:**
1. Check if another process is running Terraform
2. Check DynamoDB table for locks
3. Force unlock (use with caution): `terraform force-unlock LOCK_ID`

## Best Practices

1. **Always sync outputs** after infrastructure changes
2. **Use remote state** for production environments
3. **Version control** - Commit `terraform-outputs.json` (not `.env.terraform`)
4. **Separate states** - Each environment has its own state
5. **Backup state** - Enable versioning on state bucket

## Files Reference

- `scripts/get-terraform-outputs.sh` - Export outputs as env vars
- `scripts/sync-terraform-outputs.sh` - Sync outputs to files
- `scripts/deploy-with-terraform.sh` - Deploy using outputs
- `nuxt.config.terraform.ts` - Terraform integration utilities
- `infrastructure/state-bucket/` - State bucket setup

---

**Status:** ✅ Integration Complete  
**Last Updated:** 2026-01-02

