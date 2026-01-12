# Scripts Directory

This directory contains automation scripts for the Riddle Rush monorepo.

## 🎮 RiddleRush CLI (Recommended)

We provide a unified CLI called `rush` that organizes all scripts into logical categories.

### Quick Install

```bash
# Install the CLI
./scripts/install-cli.sh

# Activate (or restart terminal)
source ~/.bashrc  # or ~/.zshrc

# Start using
rush                # Show help
rush list           # List all commands
rush agent validate # Run a command
```

### Why Use the CLI?

✅ **Organized** - Scripts grouped by category (agent, aws, deploy, test, etc.)
✅ **Discoverable** - Easy to find the right script with `rush help`
✅ **Consistent** - Same interface for all operations
✅ **Documented** - Built-in help for every command
✅ **Fast** - Type less with short aliases

See [CLI-GUIDE.md](CLI-GUIDE.md) for complete documentation.

---

## Direct Script Usage

You can still run scripts directly if needed:

## Script Overview

### Infrastructure Management

- **`terraform-plan.sh`** - Runs Terraform plan (no changes applied)

  ```bash
  ./scripts/terraform-plan.sh production
  ./scripts/terraform-plan.sh development
  ```

- **`terraform-apply.sh`** - Applies Terraform changes
  ```bash
  ./scripts/terraform-apply.sh production
  ./scripts/terraform-apply.sh production --auto-approve
  ```

### Application Deployment

- **`aws-deploy.sh`** - Builds, uploads to S3, and invalidates CloudFront
  ```bash
  # Requires AWS environment variables to be set
  export AWS_S3_BUCKET=your-bucket
  export AWS_CLOUDFRONT_ID=your-distribution-id
  export AWS_REGION=eu-central-1
  ./scripts/aws-deploy.sh production
  ```

### Combined Deployment

- **`deploy-prod.sh`** - Production deployment (build + deploy)

  ```bash
  ./scripts/deploy-prod.sh 1.2.0    # With version tag
  ./scripts/deploy-prod.sh          # Without version tag
  ```

  **Note:** Infrastructure must be deployed separately using `terraform-plan.sh` and `terraform-apply.sh`

- **`deploy-dev.sh`** - Development deployment (build + deploy)

  ```bash
  ./scripts/deploy-dev.sh
  ```

  **Note:** Infrastructure must be deployed separately using `terraform-plan.sh` and `terraform-apply.sh`

- **`deploy-infrastructure.sh`** - Deploy app after infrastructure is ready
  ```bash
  ./scripts/deploy-infrastructure.sh production
  ```

## Quality & Testing Scripts

### Lint & Style Checks

- **`check-lint-style.sh`** - Comprehensive linting and style checks

  ```bash
  # Check game app (default)
  ./scripts/check-lint-style.sh

  # Check all packages
  ./scripts/check-lint-style.sh --all

  # Auto-fix issues
  ./scripts/check-lint-style.sh --fix

  # Check specific package
  ./scripts/check-lint-style.sh --scope shared
  ```

### Flaky Test Detection

- **`upload-flaky-tests.sh`** - Upload test results to Trunk for flaky test detection

  ```bash
  # Set Trunk token (required)
  export TRUNK_TOKEN="your-trunk-api-token"

  # Upload test results (auto-detects test files)
  ./scripts/upload-flaky-tests.sh

  # Or set token inline
  TRUNK_TOKEN="your-trunk-api-token" ./scripts/upload-flaky-tests.sh
  ```

  **Note:** The Trunk token should be kept secret. Use environment variables or CI/CD secrets.

## Workflow Examples

**For AI Agents:** See [Agent Workflow Guide](docs/development/AGENT-WORKFLOW.md) for detailed development workflow.

### Separate Terraform and Deployment

1. **Plan infrastructure changes:**

   ```bash
   ./scripts/terraform-plan.sh production
   ```

2. **Apply infrastructure changes:**

   ```bash
   ./scripts/terraform-apply.sh production
   ```

3. **Deploy application (build + upload + invalidate):**
   ```bash
   # Load Terraform outputs first
   source ./scripts/get-terraform-outputs.sh production
   ./scripts/aws-deploy.sh production
   ```

### Combined Workflow

**Full deployment workflow:**

```bash
# 1. Deploy infrastructure (if needed)
./scripts/terraform-plan.sh production
./scripts/terraform-apply.sh production

# 2. Deploy application
./scripts/deploy-prod.sh 1.2.0
```

## Environment Variables

The scripts use Terraform outputs by default, but you can override with environment variables:

- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_CLOUDFRONT_ID` - CloudFront distribution ID (optional)
- `AWS_REGION` - AWS region (default: eu-central-1)
- `NODE_ENV` - Build environment (production or development)
- `SKIP_PRE_DEPLOYMENT_CHECKS` - Skip lint/typecheck/tests (for aws-deploy.sh)

## Common Functions

All scripts use functions from `lib/deploy-common.sh`:

- `check_aws_cli()` - Verify AWS CLI is installed
- `check_aws_credentials()` - Verify AWS credentials are configured
- `terraform_init()` - Initialize Terraform if needed
- `terraform_plan_and_apply()` - Run plan and apply with confirmation
- `load_aws_config()` - Load AWS config from Terraform outputs
- `run_pre_deployment_checks()` - Run lint, typecheck, and tests
