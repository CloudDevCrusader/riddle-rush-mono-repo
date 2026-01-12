# Route53 Import Guide for riddlerush.de

## Overview

This guide explains how to import the existing Route53 hosted zone for riddlerush.de into Terraform.

## Hosted Zone Details

- **Domain**: riddlerush.de
- **Hosted Zone ID**: Z0322135309SFAP6GAEEZ
- **Resource**: `aws_route53_zone.main`

## Prerequisites

1. AWS CLI configured with valid credentials
2. Terraform initialized in the infrastructure directory
3. AWS profile with Route53 permissions

## Import Steps

### 1. Ensure AWS credentials are set

```bash
# Option 1: Use AWS profile
export AWS_PROFILE=riddlerush

# Option 2: Use environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=eu-central-1
```

### 2. Verify AWS credentials

```bash
aws sts get-caller-identity
```

### 3. Import the Route53 hosted zone

```bash
cd /path/to/riddle-rush-mono-repo/infrastructure
terraform import aws_route53_zone.main Z0322135309SFAP6GAEEZ
```

### 4. Verify the import

```bash
terraform state show aws_route53_zone.main
```

### 5. Run terraform plan to see the state

```bash
terraform plan
```

## What was created

### Files Modified/Created:

1. **route53.tf** - New file containing:
   - Route53 hosted zone resource definition
   - A record (IPv4) alias to CloudFront
   - AAAA record (IPv6) alias to CloudFront

2. **outputs.tf** - Added outputs:
   - `route53_zone_id` - The hosted zone ID
   - `route53_name_servers` - Name servers for the zone

## DNS Records Setup

The configuration includes conditional creation of DNS records based on `var.domain_name`:

- When `domain_name` is set (e.g., "riddlerush.de"), A and AAAA records point to CloudFront
- Records are created as Route53 aliases for optimal performance

## Usage

### To use the domain with CloudFront:

1. Set the domain_name variable in terraform.tfvars:

   ```hcl
   domain_name = "riddlerush.de"
   certificate_arn = "arn:aws:acm:us-east-1:720377205549:certificate/your-cert-id"
   ```

2. Apply the configuration:

   ```bash
   terraform apply
   ```

3. The Route53 records will automatically point to your CloudFront distribution

## Troubleshooting

### If import fails with credential errors:

1. Check AWS credentials file: `~/.aws/credentials`
2. Ensure the file has valid format:
   ```ini
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   ```

### If the hosted zone already exists in state:

```bash
# Remove from state first
terraform state rm aws_route53_zone.main
# Then re-import
terraform import aws_route53_zone.main Z0322135309SFAP6GAEEZ
```

## Next Steps

After import:

1. Add any existing DNS records to the Terraform configuration
2. Review and update the domain_name variable as needed
3. Ensure ACM certificate is created for the domain (in us-east-1 for CloudFront)
4. Apply the configuration to create Route53 records
