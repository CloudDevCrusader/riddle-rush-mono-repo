# IAM Setup for Riddle Rush PWA

This document explains the IAM (Identity and Access Management) setup for the Riddle Rush PWA project.

## Table of Contents

- [Overview](#overview)
- [IAM Roles](#iam-roles)
- [IAM Users](#iam-users)
- [IAM Groups](#iam-groups)
- [Usage](#usage)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The IAM setup includes:

1. **Developer Role**: Limited permissions for developers
2. **Admin Role**: Broader permissions for administrators
3. **Additional Admin User**: Optional user for team collaboration
4. **Developers Group**: Group for managing developer access

## IAM Roles

### Developer Role

**Purpose**: Provides least-privilege access for developers to work on the project.

**Permissions**:

- S3: List, Get, Put, Delete objects in the website bucket
- CloudFront: Get distribution, list distributions, create invalidations
- CloudWatch Logs: Create log groups, streams, and put log events
- DynamoDB: Get, Put, Update, Query, Scan items in project tables
- Lambda: List, Get, Invoke functions
- API Gateway: GET and POST operations
- CloudWatch: Get metrics, list metrics, get dashboards

**Security**: Requires MFA (Multi-Factor Authentication) to assume the role.

### Admin Role

**Purpose**: Provides broader access for administrators to manage the infrastructure.

**Permissions**:

- S3: Full access to website and logs buckets
- CloudFront: Full access
- CloudWatch Logs: Full access
- DynamoDB: Full access to project tables
- Lambda: Full access to project functions
- API Gateway: Full access
- CloudWatch & SNS: Full access
- IAM: Read-only access (list roles, users, policies)
- Route53: Manage DNS records

**Security**: Requires MFA to assume the role.

## IAM Users

### Additional Admin User (Optional)

**Purpose**: Allows creating an additional admin user for team collaboration.

**Configuration**:

- Controlled by `create_additional_admin` variable (default: `false`)
- Username controlled by `additional_admin_username` variable (default: `"admin2"`)

**Permissions**:

- Manage their own login profile and access keys
- Assume both admin and developer roles
- Attach/detach policies to their own user

## IAM Groups

### Developers Group

**Purpose**: Group for managing developer access consistently.

**Permissions**:

- Manage their own IAM credentials (login profile, access keys)
- Assume the developer role
- Attach/detach policies to their own user

## Usage

### Terraform Configuration

Add these variables to your `terraform.tfvars` file:

```hcl
# IAM Configuration
create_additional_admin = true
additional_admin_username = "admin2"
```

### Applying IAM Changes

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Assuming Roles

**Developer Role**:

```bash
aws sts assume-role --role-arn arn:aws:iam::ACCOUNT_ID:role/PROJECT_NAME-developer-role --role-session-name developer-session
```

**Admin Role**:

```bash
aws sts assume-role --role-arn arn:aws:iam::ACCOUNT_ID:role/PROJECT_NAME-admin-role --role-session-name admin-session
```

### Creating Admin Invitation

Use the provided script to create an admin user invitation:

```bash
./scripts/create-admin-invite.sh
```

This script will:

1. Create an IAM user with the specified username
2. Generate a secure temporary password
3. Create access keys for programmatic access
4. Generate an invitation link
5. Create a credentials file with all necessary information

## Security Best Practices

### 1. Least Privilege Principle

- Always use the developer role unless admin access is required
- Regularly review and update IAM policies
- Remove unused permissions

### 2. MFA Requirements

- All roles require MFA to assume
- Enable MFA for all IAM users
- Use hardware MFA devices or authenticator apps

### 3. Credential Management

- Rotate access keys regularly (every 90 days)
- Never share access keys or passwords
- Use AWS Secrets Manager for sensitive credentials
- Enable password policies with minimum length and complexity

### 4. Monitoring and Auditing

- Enable AWS CloudTrail for API logging
- Set up CloudWatch alarms for suspicious activity
- Regularly review IAM access analyzer findings
- Monitor for unused credentials

### 5. Role Assumption

- Use role assumption instead of long-term credentials
- Set appropriate session durations
- Use role chaining carefully

## Troubleshooting

### Common Issues

**Issue: Access Denied when assuming role**

- Solution: Ensure MFA is enabled and configured correctly
- Solution: Check that the user has permissions to assume the role

**Issue: Cannot create IAM resources**

- Solution: Ensure you have sufficient IAM permissions
- Solution: Check AWS service quotas for IAM resources

**Issue: Terraform fails to create IAM resources**

- Solution: Check for naming conflicts
- Solution: Ensure you're using a user with admin privileges

### Debugging Commands

```bash
# Check current IAM user permissions
aws iam list-attached-user-policies --user-name YOUR_USERNAME

# Check role trust relationships
aws iam get-role --role-name ROLE_NAME

# Test role assumption
aws sts assume-role --role-arn ROLE_ARN --role-session-name test-session

# List IAM users
aws iam list-users

# List IAM roles
aws iam list-roles
```

## Outputs

The IAM module provides several useful outputs:

- `developer_role_arn`: ARN of the developer IAM role
- `admin_role_arn`: ARN of the admin IAM role
- `additional_admin_user_arn`: ARN of the additional admin user (if created)
- `developers_group_arn`: ARN of the developers IAM group
- `developer_role_assume_command`: Command to assume developer role
- `admin_role_assume_command`: Command to assume admin role

## Example Workflow

### 1. Set up IAM infrastructure

```bash
cd infrastructure
terraform init
terraform apply -target=aws_iam_role.developer -target=aws_iam_role.admin
```

### 2. Create additional admin user

```bash
# Edit terraform.tfvars
create_additional_admin = true
additional_admin_username = "john"

# Apply changes
terraform apply
```

### 3. Generate invitation

```bash
./scripts/create-admin-invite.sh
```

### 4. Share credentials securely

Share the generated credentials file and invitation link with the new admin using a secure method (encrypted email, secure file transfer, etc.).

### 5. New admin setup

1. Login to AWS Console using the provided credentials
2. Change password immediately
3. Enable MFA
4. Assume the appropriate role
5. Begin working on the project

## Migration from Existing Setup

If you already have IAM resources and want to migrate to this setup:

1. **Backup existing IAM configuration**:

   ```bash
   aws iam generate-credential-report
   ```

2. **Gradually transition users**:
   - Create new roles and policies
   - Test with a small group first
   - Gradually migrate all users

3. **Clean up old resources**:
   - Remove unused IAM users, roles, and policies
   - Update any scripts or automation that reference old IAM resources

## Best Practices for Production

1. **Use AWS IAM Identity Center** for enterprise environments
2. **Implement permission boundaries** for additional security
3. **Set up AWS Organizations** for multi-account environments
4. **Use AWS SSO** for centralized identity management
5. **Implement service control policies** for account-level guardrails

## References

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [AWS IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [AWS Security Token Service](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html)
