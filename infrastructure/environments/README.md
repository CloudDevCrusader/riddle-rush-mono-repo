# Infrastructure Environments

This directory contains environment-specific Terraform configurations.

## Structure

```
environments/
├── production/        # Production environment (existing infrastructure)
├── development/       # Development environment (new infrastructure)
└── staging/           # Staging environment (future use)
```

## Production (production/)

**Purpose:** Manage existing production infrastructure

**Status:** Import existing resources

**Quick Start:**

```bash
cd environments/production
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your existing bucket name
./import-existing.sh
```

**Or use npm scripts:**

```bash
pnpm run infra:prod:init
pnpm run infra:prod:import
pnpm run infra:prod:plan
pnpm run infra:prod:apply
```

## Development (development/)

**Purpose:** New development infrastructure (separate from production)

**Status:** Create new resources

**Quick Start:**

```bash
cd environments/development
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

**Or use npm scripts:**

```bash
pnpm run infra:dev:init
pnpm run infra:dev:plan
pnpm run infra:dev:apply
```

## Staging (staging/)

**Purpose:** Staging environment (for future use)

**Status:** Reserved for future implementation

## Environment Comparison

| Feature     | Production               | Development             |
| ----------- | ------------------------ | ----------------------- |
| Bucket Name | `riddle-rush-pwa-prod-*` | `riddle-rush-pwa-dev-*` |
| Cache TTL   | 1 day default            | 1 hour default          |
| Lifecycle   | 30 days                  | 7 days                  |
| Purpose     | Live production          | Development/testing     |
| Import      | Yes (existing)           | No (new)                |

## Workflow

### 1. Import Production Infrastructure

```bash
cd environments/production
./import-existing.sh
```

### 2. Create Development Infrastructure

```bash
cd environments/development
terraform init
terraform apply
```

### 3. Deploy to Each Environment

**Production:**

```bash
cd environments/production
BUCKET=$(terraform output -raw bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)
cd ../../..
AWS_S3_BUCKET=$BUCKET AWS_CLOUDFRONT_ID=$CF_ID ./aws-deploy.sh production
```

**Development:**

```bash
cd environments/development
BUCKET=$(terraform output -raw bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)
cd ../../..
AWS_S3_BUCKET=$BUCKET AWS_CLOUDFRONT_ID=$CF_ID ./aws-deploy.sh development
```

## State Management

Each environment has its own Terraform state:

- `production/terraform.tfstate` - Production state
- `development/terraform.tfstate` - Development state

**Recommended:** Use remote state (S3 backend) for production:

- Uncomment backend config in `production/main.tf`
- Create S3 bucket for state
- Initialize with `terraform init -migrate-state`

## Best Practices

1. **Separate States:** Each environment has independent state
2. **Naming:** Resources prefixed with environment name
3. **Tags:** All resources tagged with Environment
4. **Isolation:** Environments are completely separate
5. **Backup:** Regular state backups for production
