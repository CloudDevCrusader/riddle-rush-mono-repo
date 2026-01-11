# IAM Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Initialize Terraform

```bash
cd infrastructure
terraform init
```

### 2. Apply IAM Configuration

```bash
terraform apply -target=aws_iam_role.developer -target=aws_iam_role.admin
```

### 3. Create Admin User (Optional)

Edit `terraform.tfvars`:

```hcl
create_additional_admin = true
additional_admin_username = "john"
```

Then apply:

```bash
terraform apply
```

### 4. Generate Invitation

```bash
./scripts/create-admin-invite.sh
```

## 📋 Common Commands

### Assume Developer Role

```bash
aws sts assume-role \
  --role-arn arn:aws:iam::ACCOUNT_ID:role/PROJECT_NAME-developer-role \
  --role-session-name developer-session
```

### Assume Admin Role

```bash
aws sts assume-role \
  --role-arn arn:aws:iam::ACCOUNT_ID:role/PROJECT_NAME-admin-role \
  --role-session-name admin-session
```

### List IAM Users

```bash
aws iam list-users
```

### List IAM Roles

```bash
aws iam list-roles
```

## 🔐 Security Checklist

- [ ] Enable MFA for all users
- [ ] Use roles instead of direct user permissions
- [ ] Rotate access keys every 90 days
- [ ] Monitor CloudTrail logs
- [ ] Review IAM policies regularly

## 📚 Resources

- **Full Documentation**: See `IAM-SETUP.md`
- **Troubleshooting**: See `IAM-SETUP.md#troubleshooting`
- **Best Practices**: See `IAM-SETUP.md#security-best-practices`

## 🎯 Quick Reference

| Resource   | Developer Access | Admin Access |
| ---------- | ---------------- | ------------ |
| S3 Bucket  | Read/Write       | Full Access  |
| CloudFront | Read/Invalidate  | Full Access  |
| DynamoDB   | CRUD             | Full Access  |
| Lambda     | Invoke           | Full Access  |
| CloudWatch | Read             | Full Access  |
| IAM        | Self-management  | Read-only    |

**Need help?** Check the full documentation or run:

```bash
aws iam help
```
