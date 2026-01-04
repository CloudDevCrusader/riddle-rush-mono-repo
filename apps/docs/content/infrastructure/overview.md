---
title: Infrastructure Overview
description: Terraform-managed AWS infrastructure
---

# Infrastructure Overview

Riddle Rush infrastructure is managed with Terraform and deployed to AWS.

## Infrastructure Components

- **S3 Bucket** - Static website hosting
- **CloudFront** - CDN distribution
- **Terraform State** - Remote state in S3 with DynamoDB locking

## Environments

- **Production** (`environments/production/`) - Live production infrastructure
- **Development** (`environments/development/`) - Development/testing infrastructure

## Quick Start

### Import Existing Infrastructure

```bash
cd infrastructure/environments/production
./find-resources.sh
./import-existing.sh
```

### Create New Infrastructure

```bash
cd infrastructure/environments/development
terraform init
terraform plan
terraform apply
```

## Deployment

The application is deployed to AWS S3 + CloudFront, not GitLab Pages.

GitLab Pages now hosts the **documentation site** (this site).

## Next Steps

- [Terraform Setup](/docs/infrastructure/terraform)
- [AWS Deployment](/docs/infrastructure/deployment)
- [AWS Configuration](/docs/infrastructure/aws)
