# Terraform State Bucket Setup

This directory creates the S3 bucket and DynamoDB table needed for remote Terraform state management.

## Why Remote State?

- **Team Collaboration:** Multiple developers can work on infrastructure
- **State Locking:** Prevents concurrent modifications
- **State Backup:** Versioned state in S3
- **Security:** Encrypted state storage

## Setup

### 1. Initialize and Apply

```bash
cd infrastructure/state-bucket
terraform init
terraform plan
terraform apply
```

### 2. Get Backend Configuration

After applying, get the backend config:

```bash
terraform output backend_config
```

### 3. Update Environment Configs

Copy the backend configuration to each environment's `main.tf`:

**For production (`environments/prod/main.tf`):**
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

**For development (`environments/development/main.tf`):**
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

### 4. Migrate Existing State

After updating backend configs, migrate state:

```bash
# Production
cd environments/prod
terraform init -migrate-state

# Development
cd environments/development
terraform init -migrate-state
```

## One-Time Setup

This should be run **once** to set up state management for all environments.

## Variables

- `state_bucket_name` - Custom bucket name (optional)
- `dynamodb_table_name` - Custom table name (optional)
- `aws_region` - AWS region (default: eu-central-1)

## Outputs

- `state_bucket_name` - Bucket name for backend config
- `dynamodb_table_name` - Table name for backend config
- `backend_config` - Ready-to-use backend configuration

