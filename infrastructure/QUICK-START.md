# Terraform Quick Start Guide

## Prerequisites Installation

### 1. Install tfenv

**macOS:**
```bash
brew install tfenv
```

**Linux:**
```bash
git clone https://github.com/tfutils/tfenv.git ~/.tfenv
echo 'export PATH="$HOME/.tfenv/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 2. Install terraformer (for importing existing resources)

**macOS:**
```bash
brew install terraformer
```

**Linux:**
```bash
wget https://github.com/GoogleCloudPlatform/terraformer/releases/download/0.8.24/terraformer-aws-linux-amd64
chmod +x terraformer-aws-linux-amd64
sudo mv terraformer-aws-linux-amd64 /usr/local/bin/terraformer
```

## Quick Setup

```bash
# 1. Setup Terraform (installs via tfenv)
pnpm run infra:setup

# 2. Configure variables
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars

# 3. Initialize
pnpm run infra:init

# 4. Plan (review changes)
pnpm run infra:plan

# 5. Apply (create infrastructure)
pnpm run infra:apply
```

## Import Existing Resources

If you have existing AWS resources from CloudFormation:

```bash
# Interactive import
pnpm run infra:import

# Or manually
cd infrastructure
./scripts/import-with-terraformer.sh
```

## Common Commands

```bash
# Using npm scripts
pnpm run infra:setup    # Setup tfenv and Terraform
pnpm run infra:init     # Initialize Terraform
pnpm run infra:plan     # Show execution plan
pnpm run infra:apply    # Apply changes
pnpm run infra:destroy  # Destroy infrastructure
pnpm run infra:import   # Import existing resources

# Using Makefile
cd infrastructure
make setup      # Setup tfenv
make init       # Initialize
make plan       # Plan
make apply      # Apply
make destroy    # Destroy
make import     # Import

# Direct Terraform commands
cd infrastructure
terraform init
terraform plan
terraform apply
terraform destroy
terraform output
```

## Outputs

After applying, get outputs:

```bash
terraform output
```

Use outputs in deployment:
```bash
# Get bucket name
BUCKET=$(terraform output -raw bucket_name)

# Get CloudFront ID
CF_ID=$(terraform output -raw cloudfront_distribution_id)

# Deploy
AWS_S3_BUCKET=$BUCKET AWS_CLOUDFRONT_ID=$CF_ID ./aws-deploy.sh production
```

## Next Steps

1. Review `README.md` for detailed documentation
2. See `docs/TERRAFORM-SETUP.md` for complete guide
3. Configure remote state for production (see main.tf comments)

