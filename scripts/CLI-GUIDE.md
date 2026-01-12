# RiddleRush CLI Guide

A unified command-line interface for managing the Riddle Rush monorepo.

## Installation

```bash
# Install the CLI and create 'rush' alias
./scripts/install-cli.sh

# Activate in current session
source ~/.bashrc  # or ~/.zshrc

# Verify installation
rush --help
```

## Quick Start

```bash
rush                    # Show help
rush list               # List all available commands
rush help agent         # Show help for a specific category
rush agent validate     # Run a command
```

## Command Structure

```
rush <category> <command> [arguments...]
```

## Categories

### 🤖 Agent - AI Workflow Tools

AI agent automation and validation tools.

| Command    | Script                   | Description                    |
| ---------- | ------------------------ | ------------------------------ |
| `autofix`  | `agent-autofix.sh`       | Auto-fix agent workflow issues |
| `commands` | `agent-commands.sh`      | Show available agent commands  |
| `status`   | `agent-status.sh`        | Check agent workflow status    |
| `validate` | `agent-validate.sh`      | Validate agent configuration   |
| `setup`    | `setup-agent-configs.sh` | Setup agent configurations     |

**Examples:**

```bash
rush agent validate
rush agent autofix
rush agent status
```

### ☁️ AWS - Infrastructure & Deployment

AWS infrastructure management and Terraform operations.

| Command           | Script                      | Description                 |
| ----------------- | --------------------------- | --------------------------- |
| `assume-role`     | `assume-aws-role.sh`        | Assume AWS IAM role         |
| `deploy`          | `aws-deploy.sh`             | Deploy to AWS S3/CloudFront |
| `cleanup-buckets` | `cleanup-s3-buckets.sh`     | Clean up S3 buckets         |
| `create-iam`      | `create-iam-roles.sh`       | Create IAM roles            |
| `setup-creds`     | `setup-aws-credentials.sh`  | Setup AWS credentials       |
| `setup-iam`       | `setup-aws-iam.sh`          | Setup AWS IAM               |
| `get-outputs`     | `get-terraform-outputs.sh`  | Get Terraform outputs       |
| `sync-outputs`    | `sync-terraform-outputs.sh` | Sync Terraform outputs      |
| `tf-apply`        | `terraform-apply.sh`        | Apply Terraform changes     |
| `tf-plan`         | `terraform-plan.sh`         | Plan Terraform changes      |

**Examples:**

```bash
rush aws tf-plan production
rush aws tf-apply production
rush aws deploy production
rush aws get-outputs development
```

### 🔨 Build - Compilation Tools

Build and compilation utilities.

| Command     | Script                       | Description                      |
| ----------- | ---------------------------- | -------------------------------- |
| `docker`    | `build-docker-image.sh`      | Build Docker image               |
| `lambda`    | `build-lambda.sh`            | Build Lambda functions           |
| `websocket` | `build-websocket-lambdas.sh` | Build WebSocket Lambda functions |

**Examples:**

```bash
rush build docker
rush build lambda
rush build websocket
```

### 🔄 CI - CI/CD Pipeline

Continuous Integration and Deployment scripts.

| Command  | Script         | Description      |
| -------- | -------------- | ---------------- |
| `build`  | `ci-build.sh`  | CI build process |
| `deploy` | `ci-deploy.sh` | CI deployment    |
| `e2e`    | `ci-e2e.sh`    | CI E2E tests     |
| `test`   | `ci-test.sh`   | CI unit tests    |

**Examples:**

```bash
rush ci build
rush ci test
rush ci e2e
```

### 🚀 Deploy - Deployment Scripts

Environment-specific deployment tools.

| Command          | Script                     | Description           |
| ---------------- | -------------------------- | --------------------- |
| `dev`            | `deploy-dev.sh`            | Deploy to development |
| `infrastructure` | `deploy-infrastructure.sh` | Deploy infrastructure |
| `prod`           | `deploy-prod.sh`           | Deploy to production  |
| `staging`        | `deploy-staging.sh`        | Deploy to staging     |

**Examples:**

```bash
rush deploy dev
rush deploy staging
rush deploy prod
rush deploy infrastructure production
```

### 🧪 Test - Testing Utilities

Testing and quality assurance tools.

| Command             | Script                      | Description                |
| ------------------- | --------------------------- | -------------------------- |
| `e2e-deployed`      | `e2e-deployed.sh`           | E2E tests on deployed site |
| `e2e-local`         | `e2e-local.sh`              | E2E tests locally          |
| `trunk`             | `run-tests-with-trunk.sh`   | Run tests with Trunk       |
| `trunk-integration` | `test-trunk-integration.sh` | Test Trunk integration     |
| `upload-flaky`      | `upload-flaky-tests.sh`     | Upload flaky test results  |

**Examples:**

```bash
rush test e2e-local
rush test e2e-deployed production
rush test trunk
```

### ✨ Quality - Code Quality & Linting

Code quality, linting, and formatting tools.

| Command          | Script                | Description             |
| ---------------- | --------------------- | ----------------------- |
| `check-lint`     | `check-lint-style.sh` | Check linting and style |
| `check-secrets`  | `check-secrets.sh`    | Scan for secrets        |
| `trunk-eslint`   | `trunk-eslint.sh`     | Run ESLint via Trunk    |
| `trunk-prettier` | `trunk-prettier.sh`   | Run Prettier via Trunk  |
| `python-format`  | `python-format.sh`    | Format Python code      |
| `python-lint`    | `python-lint.sh`      | Lint Python code        |

**Examples:**

```bash
rush quality check-lint
rush quality check-secrets
rush quality trunk-eslint
rush quality python-format
```

### 🔧 Utils - Maintenance & Utilities

General maintenance and utility scripts.

| Command             | Script                          | Description                   |
| ------------------- | ------------------------------- | ----------------------------- |
| `check-deps`        | `check-dependencies.sh`         | Check dependencies            |
| `diagnose-ts`       | `diagnose-typescript-issues.sh` | Diagnose TypeScript issues    |
| `diagnose-vscode`   | `diagnose-vscode-issues.sh`     | Diagnose VS Code issues       |
| `migrate-env`       | `migrate-env-variables.sh`      | Migrate environment variables |
| `optimize-monorepo` | `optimize-for-monorepo.sh`      | Optimize for monorepo         |

**Examples:**

```bash
rush utils check-deps
rush utils diagnose-ts
rush utils optimize-monorepo
```

## Common Workflows

### Development Workflow

```bash
# Start development
cd apps/game
pnpm run dev

# Validate code quality
rush quality check-lint
rush agent validate

# Run tests
rush test e2e-local

# Deploy to dev
rush deploy dev
```

### Production Deployment

```bash
# Plan infrastructure changes
rush aws tf-plan production

# Apply changes
rush aws tf-apply production

# Deploy application
rush deploy prod

# Verify with E2E tests
rush test e2e-deployed production
```

### CI/CD Workflow

```bash
# Simulate CI pipeline locally
rush ci build
rush ci test
rush ci e2e
```

### Infrastructure Management

```bash
# Setup AWS credentials
rush aws setup-creds

# Create IAM roles
rush aws create-iam

# Plan and apply Terraform
rush aws tf-plan production
rush aws tf-apply production

# Get outputs
rush aws get-outputs production
```

## Command Groups

Commands are organized into logical groups for easier discovery:

### Core Development

- `agent` - AI workflow automation
- `quality` - Code quality checks
- `test` - Testing utilities

### Infrastructure

- `aws` - AWS and Terraform
- `build` - Compilation tools
- `deploy` - Deployment scripts

### Automation

- `ci` - CI/CD pipeline
- `utils` - Maintenance tools

## Tips & Tricks

### Tab Completion

If you're using Bash, the CLI supports basic tab completion:

```bash
rush <TAB>          # Shows categories
rush agent <TAB>    # Shows agent commands (in future versions)
```

### Help System

Get help at any level:

```bash
rush                  # General help
rush help             # Same as above
rush help agent       # Category-specific help
rush list             # List all commands
```

### Environment Variables

Some scripts use environment variables:

```bash
# AWS credentials
export AWS_PROFILE=riddle-rush
export AWS_REGION=eu-central-1

# Then run AWS commands
rush aws deploy production
```

### Script Arguments

Pass arguments directly to scripts:

```bash
rush aws tf-plan production          # Passes "production" to terraform-plan.sh
rush deploy infrastructure staging   # Passes "staging" to deploy-infrastructure.sh
```

## Troubleshooting

### Command Not Found

If `rush` command is not found:

```bash
# Re-run installer
./scripts/install-cli.sh

# Activate in current session
source ~/.bashrc  # or ~/.zshrc
```

### Permission Denied

If you get permission errors:

```bash
# Make CLI executable
chmod +x scripts/cli.sh

# Or reinstall
./scripts/install-cli.sh
```

### Script Not Found

If a specific script is not found:

```bash
# Check if script exists
ls scripts/

# Update CLI mapping if needed
vim scripts/cli.sh
```

## Advanced Usage

### Creating Custom Groups

You can extend the CLI by adding new categories in `scripts/cli.sh`:

```bash
# Add new category
declare -A CATEGORIES=(
    ...
    ["my-category"]="My custom category"
)

# Add scripts for the category
declare -A MY_CATEGORY_SCRIPTS=(
    ["my-command"]="my-script.sh"
)
```

### Wrapper Scripts

Create wrapper scripts for common workflows:

```bash
#!/bin/bash
# scripts/quick-deploy.sh
rush quality check-lint
rush agent validate
rush deploy dev
```

## Integration with Package.json

You can also add npm/pnpm scripts:

```json
{
  "scripts": {
    "rush": "./scripts/cli.sh",
    "rush:help": "./scripts/cli.sh help",
    "rush:list": "./scripts/cli.sh list"
  }
}
```

Then use:

```bash
pnpm rush agent validate
pnpm rush:list
```

## Contributing

When adding new scripts to the project:

1. Place the script in `scripts/` directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add it to the appropriate category in `scripts/cli.sh`
4. Update this documentation
5. Run `rush list` to verify

## See Also

- [AGENTS.md](../AGENTS.md) - Agent workflow documentation
- [AWS-DEPLOYMENT.md](../docs/AWS-DEPLOYMENT.md) - AWS deployment guide
- [TERRAFORM-SETUP.md](../docs/TERRAFORM-SETUP.md) - Terraform setup guide
- [scripts/README.md](README.md) - Scripts directory documentation
