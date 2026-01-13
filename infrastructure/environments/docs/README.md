# Docs Environment

This stack provisions the documentation site at `docs.riddlerush.de` using S3 + CloudFront and DNS records in Route53.

## Notes

- Regional resources (S3) are created in `eu-central-1`.
- The ACM certificate is requested in `us-east-1` (CloudFront requirement).

## Usage

```bash
cd infrastructure/environments/docs
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

After apply, use the output `deploy_command` or run:

```bash
DOCS_S3_BUCKET=your-docs-bucket DOCS_CLOUDFRONT_ID=your-cf-id ./scripts/deploy-docs.sh
```
