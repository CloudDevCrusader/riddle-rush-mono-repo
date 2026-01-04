# Production Environment (DEPRECATED)

⚠️ **This directory is deprecated. Use `environments/prod/` instead.**

This directory is kept for reference only. All production infrastructure should be managed through `environments/prod/`.

## Migration

If you have existing Terraform state in this directory, you should:

1. Migrate your state to `environments/prod/`
2. Update any scripts or CI/CD pipelines to use `environments/prod/`
3. Remove this directory once migration is complete
