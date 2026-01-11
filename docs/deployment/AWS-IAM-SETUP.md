# AWS IAM Setup for GitLab CI Deployment

This guide explains how to set up AWS IAM credentials for automated deployment via GitLab CI.

## Quick Setup

Run the automated setup script:

```bash
./scripts/setup-aws-iam.sh
```

This script will:

1. ✅ Create an IAM policy with S3 and CloudFront permissions
2. ✅ Create an IAM user `gitlab-ci-deployer`
3. ✅ Attach the policy to the user
4. ✅ Generate access keys
5. ✅ Save credentials to `aws-credentials.txt` (gitignored)

## IAM Policy Permissions

The policy grants the following permissions:

### S3 Bucket Operations

- `s3:ListBucket` - List objects in buckets
- `s3:GetBucketLocation` - Get bucket region
- `s3:GetBucketWebsite` - Read website configuration
- `s3:PutBucketWebsite` - Configure static website hosting
- `s3:GetBucketPolicy` - Read bucket policy
- `s3:PutBucketPolicy` - Set bucket policy (for public access)

### S3 Object Operations

- `s3:PutObject` - Upload files
- `s3:PutObjectAcl` - Set object ACLs (for public read)
- `s3:GetObject` - Download files
- `s3:DeleteObject` - Remove old files
- `s3:ListMultipartUploadParts` - Handle large file uploads
- `s3:AbortMultipartUpload` - Cancel failed uploads

### CloudFront Operations

- `cloudfront:CreateInvalidation` - Clear CDN cache after deployment
- `cloudfront:GetInvalidation` - Check invalidation status
- `cloudfront:ListInvalidations` - List cache invalidations
- `cloudfront:GetDistribution` - Get distribution details

### Identity Verification

- `sts:GetCallerIdentity` - Verify AWS credentials

## Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Create IAM Policy

Go to AWS Console → IAM → Policies → Create Policy

Use this JSON policy document:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketWebsite",
        "s3:PutBucketWebsite",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy"
      ],
      "Resource": "arn:aws:s3:::*"
    },
    {
      "Sid": "S3ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListMultipartUploadParts",
        "s3:AbortMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::*/*"
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*"
    },
    {
      "Sid": "STSGetCallerIdentity",
      "Effect": "Allow",
      "Action": "sts:GetCallerIdentity",
      "Resource": "*"
    }
  ]
}
```

Name it: `GitLabCIDeploymentPolicy`

### 2. Create IAM User

1. Go to AWS Console → IAM → Users → Create User
2. Name: `gitlab-ci-deployer`
3. Attach the policy created above
4. Create access key (Application running outside AWS)
5. Save the credentials securely

### 3. Configure GitLab CI/CD Variables

Go to GitLab → Your Project → Settings → CI/CD → Variables

Add these variables:

| Variable Name           | Value                      | Type     | Flags                 |
| ----------------------- | -------------------------- | -------- | --------------------- |
| `AWS_ACCESS_KEY_ID`     | Your access key ID         | Variable | Protected ✓, Masked ✓ |
| `AWS_SECRET_ACCESS_KEY` | Your secret key            | Variable | Protected ✓, Masked ✓ |
| `AWS_S3_BUCKET`         | Your S3 bucket name        | Variable | Protected ✓           |
| `AWS_CLOUDFRONT_ID`     | Your CloudFront ID         | Variable | Protected ✓           |
| `AWS_REGION`            | e.g., us-east-1 (optional) | Variable | Protected ✓           |

## Security Best Practices

### ✅ DO:

- Mark credentials as **Protected** (only available on protected branches/tags)
- Mark credentials as **Masked** (hidden in job logs)
- Regularly rotate access keys
- Use separate IAM users for different environments
- Monitor CloudTrail logs for unauthorized access

### ❌ DON'T:

- Commit credentials to Git
- Share access keys
- Use root account credentials
- Grant more permissions than necessary
- Leave old access keys active

## Principle of Least Privilege

This policy follows AWS best practices by:

- ✅ Granting only required permissions
- ✅ Using specific service permissions (not `*`)
- ✅ Scoping to specific resources where possible
- ✅ No administrative permissions

## Troubleshooting

### "Access Denied" errors

1. Check that all variables are set in GitLab CI/CD
2. Verify IAM policy is attached to user
3. Check S3 bucket name matches `AWS_S3_BUCKET`
4. Verify CloudFront distribution ID is correct

### "Invalid credentials" errors

1. Verify access keys are correct in GitLab variables
2. Check if access keys were rotated
3. Ensure variables are marked as **Protected** for tag-based deployments

### Policy too permissive?

If you want to restrict to specific buckets, change:

```json
"Resource": "arn:aws:s3:::*"
```

to:

```json
"Resource": "arn:aws:s3:::your-specific-bucket-name"
```

And for objects:

```json
"Resource": "arn:aws:s3:::*/*"
```

to:

```json
"Resource": "arn:aws:s3:::your-specific-bucket-name/*"
```

## Cleanup

To remove the IAM user and policy:

```bash
# Detach policy
aws iam detach-user-policy \
  --user-name gitlab-ci-deployer \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GitLabCIDeploymentPolicy

# Delete access keys
aws iam list-access-keys --user-name gitlab-ci-deployer
aws iam delete-access-key --user-name gitlab-ci-deployer --access-key-id YOUR_KEY_ID

# Delete user
aws iam delete-user --user-name gitlab-ci-deployer

# Delete policy
aws iam delete-policy --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GitLabCIDeploymentPolicy
```

## Next Steps

After setting up IAM:

1. ✅ Configure GitLab CI/CD Variables
2. ✅ Create S3 bucket (if not exists)
3. ✅ Create CloudFront distribution (if not exists)
4. ✅ Push a version tag to trigger deployment
5. ✅ Monitor the pipeline in GitLab CI/CD

See [AWS Deployment Guide](AWS-DEPLOYMENT.md) for S3 and CloudFront setup.
