# Setup Terraform State Bucket

Quick guide to set up remote state management for Terraform.

## Why Remote State?

- **Team Collaboration** - Multiple developers can work on infrastructure
- **State Locking** - Prevents concurrent modifications
- **State Backup** - Versioned state in S3
- **Security** - Encrypted state storage

## Quick Setup

### 1. Create State Bucket

```bash
cd infrastructure/state-bucket
terraform init
terraform plan
terraform apply
```

**Or use npm script:**
```bash
pnpm run infra:state:init
pnpm run infra:state:plan
pnpm run infra:state:apply
```

### 2. Get Backend Configuration

```bash
cd infrastructure/state-bucket
terraform output backend_config
```

This will show:
```hcl
backend "s3" {
  bucket         = "terraform-state-ACCOUNT_ID"
  key            = "ENVIRONMENT/terraform.tfstate"
  region         = "eu-central-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

### 3. Update Environment Configs

**Production (`environments/prod/main.tf`):**
```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "terraform-state-ACCOUNT_ID"  # Replace with actual bucket name
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
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "terraform-state-ACCOUNT_ID"  # Replace with actual bucket name
    key            = "development/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### 4. Migrate State

After updating backend configs, migrate existing state:

```bash
# Production
cd infrastructure/environments/prod
terraform init -migrate-state
# Answer "yes" when prompted

# Development
cd infrastructure/environments/development
terraform init -migrate-state
# Answer "yes" when prompted
```

## Verify

Check that state is in S3:

```bash
aws s3 ls s3://terraform-state-ACCOUNT_ID/
```

You should see:
- `prod/terraform.tfstate`
- `development/terraform.tfstate` (after creating dev environment)

## One-Time Setup

This setup is **one-time only**. After creating the state bucket and configuring backends, you don't need to run this again.

## Troubleshooting

### State Lock Error

If you get a state lock error:
```bash
# Check DynamoDB table
aws dynamodb scan --table-name terraform-state-lock

# Force unlock (use with caution!)
terraform force-unlock LOCK_ID
```

### Migration Failed

If migration fails:
1. Check S3 bucket exists
2. Check DynamoDB table exists
3. Verify backend configuration is correct
4. Check AWS credentials have proper permissions

## Next Steps

After setting up remote state:

1. ✅ State bucket created
2. ✅ Backend configured
3. ✅ State migrated
4. ⏳ Sync Terraform outputs: `pnpm run terraform:sync prod`
5. ⏳ Deploy with Terraform: `pnpm run deploy:terraform prod`

