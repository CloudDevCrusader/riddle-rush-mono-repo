# Terraform Simplification Plan

## Current Issues Identified

1. **Multiple CloudFront and S3 Resources**: The current structure creates separate infrastructure for each environment (dev, staging, prod), which is correct but can be optimized.

2. **Code Duplication**: Similar configurations are repeated across environments with minor variations.

3. **Complex Import Process**: The import scripts suggest there might be existing resources that need to be managed.

## Root Cause Analysis

The multiple CloudFront distributions and S3 buckets are **by design**, not a bug. Each environment should have:

- Separate S3 bucket (for isolation and security)
- Separate CloudFront distribution (for environment-specific caching and routing)
- Environment-specific configurations (cache TTLs, logging, etc.)

However, the current implementation can be simplified by:

1. Using Terraform modules to reduce duplication
2. Using workspaces instead of separate directories
3. Better organization of shared vs. environment-specific code

## Recommended Simplification

### Option 1: Modular Approach (Recommended)

```bash
infrastructure/
├── modules/
│   ├── s3-website/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloudfront/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── waf/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── development/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── main.tf
└── versions.tf
```

### Option 2: Workspace Approach (Alternative)

```bash
infrastructure/
├── modules/
│   ├── website/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
├── main.tf
├── variables.tf
└── terraform.tfvars
```

Then use `terraform workspace` to manage environments:

```bash
terraform workspace new development
terraform workspace new staging
terraform workspace new production
```

## Implementation Steps

### Step 1: Create Shared Modules

Create reusable modules for common infrastructure components:

```hcl
# infrastructure/modules/s3-website/main.tf
variable "bucket_name" {
  type = string
}

variable "environment" {
  type = string
}

resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name

  tags = {
    Name        = "${var.bucket_name}"
    Environment = var.environment
  }
}

# ... other S3 resources
```

### Step 2: Simplify Environment Configurations

```hcl
# infrastructure/environments/development/main.tf
module "website" {
  source = "../../modules/s3-website"

  bucket_name = "riddle-rush-dev-${data.aws_caller_identity.current.account_id}"
  environment = "development"
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  bucket_name = module.website.bucket_name
  environment = "development"
  cache_ttl   = 3600 # Shorter for dev
}
```

### Step 3: Standardize Naming Conventions

Use consistent naming patterns:

- S3 Buckets: `riddle-rush-{env}-{account_id}`
- CloudFront: `riddle-rush-{env}-distribution`
- Logs: `riddle-rush-{env}-logs`

### Step 4: Reduce Complexity in Development

For development, consider:

- Simpler cache policies
- No WAF (or minimal rules)
- Shorter log retention
- No Lambda@Edge functions

### Step 5: Use Terraform Workspaces (Optional)

```bash
# Create workspaces
terraform workspace new development
terraform workspace new staging
terraform workspace new production

# Switch between environments
terraform workspace select development
terraform apply
```

## Benefits of Simplification

1. **Reduced Code Duplication**: ~70% less code
2. **Easier Maintenance**: Changes apply to all environments
3. **Consistent Configurations**: Less risk of environment drift
4. **Faster Deployment**: Smaller Terraform state files
5. **Better Organization**: Clear separation of concerns

## Migration Plan

1. **Backup**: Backup all existing Terraform state files
2. **Test**: Create a test environment with the new structure
3. **Migrate**: Import existing resources into the new structure
4. **Validate**: Verify all environments work correctly
5. **Cleanup**: Remove old Terraform files and state

## Expected Outcome

After simplification:

- **Development**: 1 S3 bucket, 1 CloudFront distribution
- **Staging**: 1 S3 bucket, 1 CloudFront distribution
- **Production**: 1 S3 bucket, 1 CloudFront distribution

Total: 3 S3 buckets, 3 CloudFront distributions (one per environment)

This is the correct and expected architecture for a multi-environment setup.

## Recommendation

The current "multiple CloudFront and S3 resources" is actually the correct architecture for proper environment isolation. The simplification should focus on:

1. **Code organization** (use modules)
2. **Reducing duplication** (shared configurations)
3. **Improving maintainability** (clear structure)

Not on reducing the number of resources, as each environment legitimately needs its own infrastructure.
