#!/usr/bin/env bash

# ===========================================
# Setup AWS IAM User for GitLab CI Deployment
# ===========================================
# This script creates an IAM user with permissions for S3 and CloudFront deployment
# Run with: ./scripts/setup-aws-iam.sh

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

# Configuration
IAM_USER_NAME="gitlab-ci-deployer"
IAM_POLICY_NAME="GitLabCIDeploymentPolicy"

log "${BLUE}🔐 Setting up AWS IAM for GitLab CI Deployment${NC}"
log "=============================================="

# Check if AWS CLI is installed
require_cmd aws
require_cmd jq

# Check AWS credentials
log "\n🔑 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    die "AWS credentials not configured. Please run 'aws configure'"
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
log "${GREEN}✓ AWS CLI configured${NC}"
log "  Account: ${AWS_ACCOUNT}"

# Create IAM policy
log "\n📝 Creating IAM policy: ${IAM_POLICY_NAME}..."

# Check if policy already exists
EXISTING_POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='${IAM_POLICY_NAME}'].Arn" --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_POLICY_ARN" ]; then
    warn "Policy already exists: ${EXISTING_POLICY_ARN}"
    POLICY_ARN=$EXISTING_POLICY_ARN
else
    # Create policy document
    POLICY_TMP_FILE="$(mktemp)"
    cat > "${POLICY_TMP_FILE}" <<'EOF'
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
EOF

    POLICY_ARN=$(aws iam create-policy \
        --policy-name "${IAM_POLICY_NAME}" \
        --policy-document "file://${POLICY_TMP_FILE}" \
        --description "Policy for GitLab CI to deploy to S3 and invalidate CloudFront" \
        --query 'Policy.Arn' \
        --output text)

    log "${GREEN}✓ Policy created: ${POLICY_ARN}${NC}"
    rm -f "${POLICY_TMP_FILE}"
fi

# Create IAM user
log "\n👤 Creating IAM user: ${IAM_USER_NAME}..."

if aws iam get-user --user-name "${IAM_USER_NAME}" &> /dev/null; then
    warn "User already exists: ${IAM_USER_NAME}"
    log "${YELLOW}   Deleting existing access keys...${NC}"

    # Delete existing access keys
    EXISTING_KEYS=$(aws iam list-access-keys --user-name "${IAM_USER_NAME}" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
    for key in $EXISTING_KEYS; do
        aws iam delete-access-key --user-name "${IAM_USER_NAME}" --access-key-id "$key"
        log "${GREEN}   ✓ Deleted key: ${key}${NC}"
    done
else
    aws iam create-user --user-name "${IAM_USER_NAME}" > /dev/null
    log "${GREEN}✓ User created: ${IAM_USER_NAME}${NC}"
fi

# Attach policy to user
log "\n🔗 Attaching policy to user..."
aws iam attach-user-policy \
    --user-name "${IAM_USER_NAME}" \
    --policy-arn "${POLICY_ARN}"

log "${GREEN}✓ Policy attached${NC}"

# Create access key
log "\n🔑 Creating access key..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "${IAM_USER_NAME}")

ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')

# Display credentials
log "\n${GREEN}✅ Setup complete!${NC}"
log "\n${BLUE}================================================${NC}"
log "${BLUE}GitLab CI/CD Variables Configuration${NC}"
log "${BLUE}================================================${NC}"
log "\nAdd these variables to GitLab → Settings → CI/CD → Variables:"
log "\n${YELLOW}Variable Name:${NC} AWS_ACCESS_KEY_ID"
log "${YELLOW}Value:${NC} ${ACCESS_KEY_ID}"
log "${YELLOW}Type:${NC} Variable"
log "${YELLOW}Flags:${NC} Protected ✓, Masked ✓"
log "\n${YELLOW}Variable Name:${NC} AWS_SECRET_ACCESS_KEY"
log "${YELLOW}Value:${NC} ${SECRET_ACCESS_KEY}"
log "${YELLOW}Type:${NC} Variable"
log "${YELLOW}Flags:${NC} Protected ✓, Masked ✓"
log "\n${YELLOW}Variable Name:${NC} AWS_S3_BUCKET"
log "${YELLOW}Value:${NC} <your-s3-bucket-name>"
log "${YELLOW}Type:${NC} Variable"
log "${YELLOW}Flags:${NC} Protected ✓"
log "\n${YELLOW}Variable Name:${NC} AWS_CLOUDFRONT_ID"
log "${YELLOW}Value:${NC} <your-cloudfront-distribution-id>"
log "${YELLOW}Type:${NC} Variable"
log "${YELLOW}Flags:${NC} Protected ✓"
log "\n${BLUE}================================================${NC}"

log "\n${RED}⚠️  IMPORTANT: Save these credentials securely!${NC}"
log "${RED}   They will not be shown again.${NC}"

# Save to file (optional)
log "\n💾 Saving credentials to aws-credentials.txt (DO NOT commit this file)..."
cat > aws-credentials.txt <<EOF
# AWS Credentials for GitLab CI Deployment
# Generated: $(date)
# DO NOT COMMIT THIS FILE TO GIT

AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}

# Add to .gitignore if not already there
# Add these to GitLab CI/CD Variables (Settings → CI/CD → Variables)
# Mark as Protected and Masked
EOF

log "${GREEN}✓ Credentials saved to aws-credentials.txt${NC}"

# Add to .gitignore
if ! grep -q "aws-credentials.txt" .gitignore 2>/dev/null; then
    log "\n📝 Adding aws-credentials.txt to .gitignore..."
    echo "aws-credentials.txt" >> .gitignore
    log "${GREEN}✓ Added to .gitignore${NC}"
fi

log "\n${GREEN}🎉 IAM setup complete!${NC}"
echo -e "\nNext steps:"
echo -e "1. Add the credentials to GitLab CI/CD Variables"
echo -e "2. Set AWS_S3_BUCKET variable (your S3 bucket name)"
echo -e "3. Set AWS_CLOUDFRONT_ID variable (your CloudFront distribution ID)"
echo -e "4. Push a tag to trigger deployment: git tag v1.0.0 && git push origin v1.0.0"
