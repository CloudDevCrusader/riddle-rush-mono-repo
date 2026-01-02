# Terraform Infrastructure Setup

Complete guide for setting up and using Terraform infrastructure with tfenv and terraformer.

## Prerequisites

### 1. Install tfenv (Terraform Version Manager)

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

**Install Terraform:**
```bash
cd infrastructure
tfenv install
tfenv use
```

Or use the setup script:
```bash
pnpm run infra:setup
```

### 2. Install terraformer (Optional - for importing existing resources)

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

**Or via Go:**
```bash
go install github.com/GoogleCloudPlatform/terraformer/cmd/terraformer@latest
```

## Quick Start

### 1. Setup

```bash
# Install Terraform via tfenv
pnpm run infra:setup

# Or manually
cd infrastructure
./scripts/setup-tfenv.sh
```

### 2. Configure

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3. Initialize

```bash
pnpm run infra:init
# Or
cd infrastructure && terraform init
```

### 4. Plan

```bash
pnpm run infra:plan
# Or
cd infrastructure && terraform plan
```

### 5. Apply

```bash
pnpm run infra:apply
# Or
cd infrastructure && terraform apply
```

## Using terraformer to Import Existing Resources

If you have existing AWS resources (from CloudFormation or manual creation):

### Option 1: Interactive Script

```bash
cd infrastructure
./scripts/import-with-terraformer.sh
```

### Option 2: Manual Import

```bash
# Import S3 bucket
terraformer import aws --resources=s3 --regions=eu-central-1 --filter=Name=id;Value=your-bucket-name

# Import CloudFront distribution
terraformer import aws --resources=cloudfront --regions=eu-central-1

# Import both
terraformer import aws --resources=s3,cloudfront --regions=eu-central-1
```

### After Import

1. Review generated files in `imported-resources/`
2. Compare with existing `main.tf`
3. Merge configurations
4. Update resource names and variables
5. Run `terraform plan` to verify

## Project Structure

```
infrastructure/
├── README.md                    # Main documentation
├── main.tf                      # Main Terraform configuration
├── variables.tf                 # Input variables
├── outputs.tf                   # Output values
├── terraform.tfvars.example     # Example variables
├── .terraform-version          # Terraform version (for tfenv)
├── .gitignore                  # Git ignore rules
├── Makefile                    # Helper commands
├── scripts/
│   ├── setup-tfenv.sh          # Setup tfenv and Terraform
│   └── import-with-terraformer.sh # Import existing resources
├── environments/               # Environment-specific configs
│   ├── production/
│   ├── staging/
│   └── development/
└── modules/                     # Reusable modules
    └── s3-cloudfront/
```

## Environment-Specific Deployments

### Production

```bash
cd infrastructure/environments/production
terraform init
terraform plan
terraform apply
```

### Staging

```bash
cd infrastructure/environments/staging
terraform init
terraform plan
terraform apply
```

## Variables

Key variables (see `variables.tf`):

- `project_name` - Project identifier (default: "riddle-rush-pwa")
- `environment` - Environment name (production/staging/development)
- `aws_region` - AWS region (default: "eu-central-1")
- `bucket_name` - S3 bucket name (empty for auto-generated)
- `domain_name` - Custom domain (optional)
- `certificate_arn` - ACM certificate ARN (required if using custom domain)
- `cloudfront_price_class` - CloudFront price class

## Outputs

After deployment, get outputs:

```bash
terraform output
```

Available outputs:
- `bucket_name` - S3 bucket name
- `cloudfront_distribution_id` - CloudFront distribution ID
- `cloudfront_domain_name` - CloudFront domain name
- `website_url` - Website URL
- `deploy_command` - Command to deploy application updates

## Makefile Commands

```bash
cd infrastructure
make help      # Show all commands
make setup     # Install tfenv and Terraform
make init      # Initialize Terraform
make validate  # Validate configuration
make fmt       # Format Terraform files
make plan      # Show execution plan
make apply     # Apply changes
make destroy   # Destroy infrastructure
make import    # Import with terraformer
make output    # Show outputs
```

## Remote State (Recommended for Production)

Uncomment and configure in `main.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "riddle-rush-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

**Setup S3 backend:**
```bash
# Create S3 bucket for state
aws s3 mb s3://riddle-rush-terraform-state --region eu-central-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket riddle-rush-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-central-1
```

## Migration from CloudFormation

The Terraform configuration replicates the CloudFormation template:

1. **Review CloudFormation template** (`cloudformation-template.yaml`)
2. **Compare with Terraform** (`infrastructure/main.tf`)
3. **Use terraformer** to import existing resources (if needed)
4. **Test with plan** before applying
5. **Apply Terraform** to manage infrastructure
6. **Delete CloudFormation stack** (after verifying Terraform works)

## Best Practices

1. **Version Control**: Always commit Terraform files
2. **State Management**: Use remote state for production
3. **Secrets**: Never commit `terraform.tfvars` with secrets
4. **Review**: Always run `terraform plan` before `apply`
5. **Modules**: Use modules for reusable components
6. **Versioning**: Pin Terraform version in `.terraform-version`
7. **Backup**: Backup state files regularly

## Troubleshooting

### Terraform Version Mismatch

```bash
# Use tfenv to install correct version
tfenv install 1.9.0
tfenv use 1.9.0
```

### State Lock Issues

```bash
# If state is locked, check DynamoDB table
aws dynamodb scan --table-name terraform-state-lock

# Force unlock (use with caution)
terraform force-unlock <LOCK_ID>
```

### Import Errors

```bash
# If terraformer fails, import manually
terraform import aws_s3_bucket.website your-bucket-name
terraform import aws_cloudfront_distribution.website E1234567890ABC
```

## Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [tfenv](https://github.com/tfutils/tfenv)
- [terraformer](https://github.com/GoogleCloudPlatform/terraformer)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

---

**Last Updated:** 2026-01-02  
**Status:** ✅ Terraform Infrastructure Ready

