# Infrastructure Environments Setup

## Overview

The infrastructure is now organized into separate environments:

- **Production (production/)** - Existing infrastructure to be imported
- **Development (development/)** - New infrastructure to be created

## Quick Start

### 1. Import Production Infrastructure

```bash
# Find your existing resources
cd infrastructure/environments/production
./find-resources.sh

# Import them
./import-existing.sh
# Or use npm script:
pnpm run infra:prod:import
```

### 2. Create Development Infrastructure

```bash
cd infrastructure/environments/development
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
# Or use npm scripts:
pnpm run infra:dev:init
pnpm run infra:dev:plan
pnpm run infra:dev:apply
```

## Environment Structure

```
infrastructure/environments/
├── production/              # Production (import existing)
│   ├── main.tf              # Production infrastructure
│   ├── variables.tf         # Production variables
│   ├── outputs.tf           # Production outputs
│   ├── terraform.tfvars.example
│   ├── import-existing.sh  # Import script
│   ├── find-resources.sh    # Find existing resources
│   └── README.md
├── development/             # Development (create new)
│   ├── main.tf              # Development infrastructure
│   ├── variables.tf         # Development variables
│   ├── outputs.tf           # Development outputs
│   ├── terraform.tfvars.example
│   └── README.md
├── staging/                 # Staging (future use)
└── README.md                # Environments overview
```

## NPM Scripts

### Production

```bash
pnpm run infra:prod:init     # Initialize production
pnpm run infra:prod:plan     # Plan production changes
pnpm run infra:prod:apply    # Apply production changes
pnpm run infra:prod:import   # Import existing resources
```

### Development

```bash
pnpm run infra:dev:init      # Initialize development
pnpm run infra:dev:plan      # Plan development changes
pnpm run infra:dev:apply     # Apply development changes
pnpm run infra:dev:destroy   # Destroy development infrastructure
```

## Workflow

### Initial Setup

1. **Import Production:**

   ```bash
   cd infrastructure/environments/production
   ./find-resources.sh
   ./import-existing.sh
   terraform plan  # Verify
   ```

2. **Create Development:**
   ```bash
   cd infrastructure/environments/development
   terraform init
   terraform apply
   ```

### Daily Operations

**Deploy to Production:**

```bash
cd infrastructure/environments/production
BUCKET=$(terraform output -raw bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)
cd ../../..
AWS_S3_BUCKET=$BUCKET AWS_CLOUDFRONT_ID=$CF_ID ./aws-deploy.sh production
```

**Deploy to Development:**

```bash
cd infrastructure/environments/development
BUCKET=$(terraform output -raw bucket_name)
CF_ID=$(terraform output -raw cloudfront_distribution_id)
cd ../../..
AWS_S3_BUCKET=$BUCKET AWS_CLOUDFRONT_ID=$CF_ID ./aws-deploy.sh development
```

## Key Differences

| Feature       | Production                     | Development                     |
| ------------- | ------------------------------ | ------------------------------- |
| **Source**    | Import existing                | Create new                      |
| **Bucket**    | `riddle-rush-pwa-prod-*`       | `riddle-rush-pwa-dev-*`         |
| **Cache TTL** | 1 day                          | 1 hour                          |
| **Lifecycle** | 30 days                        | 7 days                          |
| **State**     | `production/terraform.tfstate` | `development/terraform.tfstate` |

## Documentation

- **Import Guide:** `environments/IMPORT-GUIDE.md` - Detailed import instructions
- **Production:** `environments/production/README.md` - Production setup
- **Development:** `environments/development/README.md` - Development setup
- **Overview:** `environments/README.md` - Environments overview

## Next Steps

1. ✅ Import production infrastructure
2. ✅ Create development infrastructure
3. ⏳ Set up remote state (optional, recommended for production)
4. ⏳ Update CI/CD to use Terraform outputs
5. ⏳ Document any custom configurations
