# Terraform Outputs Bucket

This configuration creates a private S3 bucket for storing Terraform outputs JSON files.

## Usage

```bash
cd infrastructure/outputs-bucket
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

## Outputs

```bash
terraform output
```

## Notes

- The bucket is private with public access blocked.
- Server-side encryption (AES256) is enabled.
- Versioning is enabled with a 30-day noncurrent expiration policy.
