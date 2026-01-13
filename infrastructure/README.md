# Infrastructure as Code

This directory contains Terraform configurations for managing AWS infrastructure.

## Prerequisites

### Install tfenv (Terraform Version Manager)

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
tfenv install latest
tfenv use latest
```

### Install terraformer (Convert existing resources to Terraform)

**macOS:**

```bash
brew install terraformer
```

**Linux:**

```bash
# Download from releases
wget https://github.com/GoogleCloudPlatform/terraformer/releases/download/0.8.24/terraformer-aws-linux-amd64
chmod +x terraformer-aws-linux-amd64
sudo mv terraformer-aws-linux-amd64 /usr/local/bin/terraformer
```

**Or via Go:**

```bash
go install github.com/GoogleCloudPlatform/terraformer/cmd/terraformer@latest
```

## Structure

```
infrastructure/
├── README.md              # This file
├── main.tf                # Main Terraform configuration
├── variables.tf           # Input variables
├── outputs.tf             # Output values
├── terraform.tfvars.example # Example variables file
├── .terraform-version      # Terraform version (for tfenv)
├── environments/          # Environment-specific configs
│   ├── production/
│   ├── staging/
│   └── development/
└── modules/               # Reusable modules
    └── s3-cloudfront/
```

## Usage

### Quick Start

**1. Import Production Infrastructure (Existing):**

```bash
cd infrastructure/environments/production
./find-resources.sh          # Find existing resources
./import-existing.sh         # Import them
# Or use: pnpm run infra:prod:import
```

**2. Create Development Infrastructure (New):**

```bash
cd infrastructure/environments/development
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
# Or use: pnpm run infra:dev:apply
```

### Environment-Specific Commands

**Production:**

```bash
cd infrastructure/environments/production
terraform init
terraform plan
terraform apply
```

**Development:**

```bash
cd infrastructure/environments/development
terraform init
terraform plan
terraform apply
```

### Using terraformer to Import Existing Resources

If you have existing AWS resources:

```bash
# From infrastructure root
./scripts/import-with-terraformer.sh

# Or manually
terraformer import aws --resources=s3,cloudfront --regions=eu-central-1
```

See `environments/IMPORT-GUIDE.md` for detailed import instructions.

## Variables

Key variables (see `variables.tf`):

- `project_name` - Project identifier
- `environment` - Environment name (production/staging/development)
- `domain_name` - Custom domain (optional)
- `certificate_arn` - ACM certificate ARN (optional)
- `region` - AWS region

## Outputs

After deployment, outputs include:

- S3 bucket name
- CloudFront distribution ID
- CloudFront domain name
- Website URL

## Best Practices

1. **State Management**: Use remote state (S3 + DynamoDB)
2. **Versioning**: Pin Terraform version in `.terraform-version`
3. **Secrets**: Never commit `terraform.tfvars` with secrets
4. **Review**: Always run `terraform plan` before `apply`
5. **Modules**: Use modules for reusable components

## Troubleshooting

### CloudFront AlreadyExists errors (OAC/Cache Policies)

If Terraform fails with `AlreadyExists` for CloudFront Origin Access Control or Cache Policies,
clean up the orphaned resources and retry:

```bash
./scripts/cleanup-cloudfront-leftovers.sh development
```

If a resource is still attached to a distribution, detach it first or delete the distribution
before retrying.

## Migration from CloudFormation

The Terraform configuration replicates the CloudFormation template:

- S3 bucket with website hosting
- CloudFront distribution
- Proper cache behaviors
- Security configurations

## Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [tfenv](https://github.com/tfutils/tfenv)
- [terraformer](https://github.com/GoogleCloudPlatform/terraformer)
