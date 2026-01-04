# Terraform Infrastructure Refactoring

## Summary

The Terraform infrastructure has been refactored to use a reusable module pattern, eliminating code duplication and improving maintainability.

## Changes

### 1. Created Reusable Module

**Location**: `modules/s3-cloudfront/`

A new reusable module consolidates all S3 + CloudFront logic:

- S3 bucket with versioning and lifecycle management
- CloudFront distribution with optimized caching
- Origin Access Control (OAC)
- Custom cache behaviors for PWA files
- SPA routing support

**Benefits**:

- Single source of truth for infrastructure logic
- Easier to maintain and update
- Consistent configuration across environments
- Configurable TTL values per environment

### 2. Refactored Environments

All environments now use the module:

- **Production** (`environments/prod/`): Uses module with production-optimized settings
- **Development** (`environments/development/`): Uses module with shorter TTLs for faster iteration
- **Staging** (`environments/staging/`): New complete staging environment using module

### 3. Standardized Configuration

- All environments use identical variable definitions
- Consistent output structure across environments
- Standardized backend configuration

### 4. Environment-Specific Settings

Each environment can customize:

| Setting           | Production | Staging | Development |
| ----------------- | ---------- | ------- | ----------- |
| Default TTL       | 1 day      | 2 hours | 1 hour      |
| Data Files TTL    | 1 hour     | 30 min  | 30 min      |
| Version Retention | 30 days    | 14 days | 7 days      |
| Error Cache TTL   | 5 min      | 2 min   | 1 min       |

## Migration Guide

### For Existing Infrastructure

If you have existing Terraform state:

1. **Backup your state**:

   ```bash
   cd infrastructure/environments/prod
   terraform state pull > terraform.tfstate.backup
   ```

2. **Initialize with new module**:

   ```bash
   terraform init -upgrade
   ```

3. **Review changes**:

   ```bash
   terraform plan
   ```

4. **Apply if changes look correct**:
   ```bash
   terraform apply
   ```

### For New Environments

Simply use the module:

```hcl
module "website" {
  source = "../../modules/s3-cloudfront"

  project_name = "riddle-rush-pwa"
  environment  = "your-environment"
  # ... other variables
}
```

## File Structure

```
infrastructure/
├── modules/
│   └── s3-cloudfront/
│       ├── main.tf          # Module resources
│       ├── variables.tf     # Module variables
│       ├── outputs.tf       # Module outputs
│       └── README.md        # Module documentation
├── environments/
│   ├── prod/
│   │   ├── main.tf          # Uses module
│   │   ├── variables.tf     # Environment variables
│   │   └── outputs.tf      # Environment outputs
│   ├── development/
│   │   └── ... (same structure)
│   └── staging/
│       └── ... (same structure)
└── versions.tf              # Shared version constraints
```

## Benefits

1. **DRY Principle**: No code duplication between environments
2. **Maintainability**: Update module once, affects all environments
3. **Consistency**: All environments follow same patterns
4. **Flexibility**: Easy to add new environments
5. **Documentation**: Module has comprehensive README

## Next Steps

- [ ] Test module with existing infrastructure
- [ ] Update CI/CD pipelines if needed
- [ ] Consider adding more modules (monitoring, budgets, etc.)
- [ ] Document environment-specific deployment procedures

## Notes

- The `environments/production/` directory is deprecated (use `environments/prod/`)
- All environments maintain backward compatibility with existing state
- Module outputs match previous resource outputs for seamless migration
