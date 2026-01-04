---
title: Terraform Infrastructure
description: Complete guide for managing infrastructure with Terraform
---

# Terraform Infrastructure

Complete guide for managing infrastructure with Terraform.

## Setup

```bash
# Install Terraform via tfenv
pnpm run infra:setup

# Initialize
pnpm run infra:prod:init
```

## Import Existing Infrastructure

If you have existing AWS resources:

```bash
cd infrastructure/environments/production
./find-resources.sh
./import-existing.sh
```

## Create New Infrastructure

```bash
cd infrastructure/environments/development
terraform init
terraform plan
terraform apply
```

## State Management

Remote state is stored in S3 with DynamoDB locking.

See `infrastructure/SETUP-STATE-BUCKET.md` for setup.

## Resources

- [Terraform Setup Guide](/docs/infrastructure/terraform)
- [Terraform + Nuxt Integration](/docs/infrastructure/deployment)
