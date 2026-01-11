#!/bin/bash

# ===========================================
# Setup AWS IAM User for GitLab CI Deployment
# ===========================================
# This script creates an IAM user with permissions for S3 and CloudFront deployment
# Run with: ./scripts/setup-aws-iam.sh

set -e

# Configuration
IAM_USER_NAME="gitlab-ci-deployer"
IAM_POLICY_NAME="GitLabCIDeploymentPolicy"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔐 Setting up AWS IAM for GitLab CI Deployment${NC}"
echo "=============================================="

# Check if AWS CLI is installed
if ! command -v aws &>/dev/null; then
	echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
	echo "Visit: https://aws.amazon.com/cli/"
	exit 1
fi

# Check AWS credentials
echo -e "\n🔑 Checking AWS credentials..."
if ! aws sts get-caller-identity &>/dev/null; then
	echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
	exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS CLI configured${NC}"
echo -e "  Account: ${AWS_ACCOUNT}"

# Create IAM policy
echo -e "\n📝 Creating IAM policy: ${IAM_POLICY_NAME}..."

# Check if policy already exists
EXISTING_POLICY_ARN=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='${IAM_POLICY_NAME}'].Arn" --output text 2>/dev/null || echo "")

if [[ -n "${EXISTING_POLICY_ARN}" ]]; then
	echo -e "${YELLOW}⚠️  Policy already exists: ${EXISTING_POLICY_ARN}${NC}"
	POLICY_ARN=${EXISTING_POLICY_ARN}
else
	# Create policy document
	cat >/tmp/iam-policy.json <<'EOF'
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
		--policy-document file:///tmp/iam-policy.json \
		--description "Policy for GitLab CI to deploy to S3 and invalidate CloudFront" \
		--query 'Policy.Arn' \
		--output text)

	echo -e "${GREEN}✓ Policy created: ${POLICY_ARN}${NC}"
	rm /tmp/iam-policy.json
fi

# Create IAM user
echo -e "\n👤 Creating IAM user: ${IAM_USER_NAME}..."

if aws iam get-user --user-name "${IAM_USER_NAME}" &>/dev/null; then
	echo -e "${YELLOW}⚠️  User already exists: ${IAM_USER_NAME}${NC}"
	echo -e "${YELLOW}   Deleting existing access keys...${NC}"

	# Delete existing access keys
	EXISTING_KEYS=$(aws iam list-access-keys --user-name "${IAM_USER_NAME}" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
	for key in ${EXISTING_KEYS}; do
		aws iam delete-access-key --user-name "${IAM_USER_NAME}" --access-key-id "${key}"
		echo -e "${GREEN}   ✓ Deleted key: ${key}${NC}"
	done
else
	aws iam create-user --user-name "${IAM_USER_NAME}" >/dev/null
	echo -e "${GREEN}✓ User created: ${IAM_USER_NAME}${NC}"
fi

# Attach policy to user
echo -e "\n🔗 Attaching policy to user..."
aws iam attach-user-policy \
	--user-name "${IAM_USER_NAME}" \
	--policy-arn "${POLICY_ARN}"

echo -e "${GREEN}✓ Policy attached${NC}"

# Create access key
echo -e "\n🔑 Creating access key..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "${IAM_USER_NAME}")

ACCESS_KEY_ID=$(echo "${ACCESS_KEY_OUTPUT}" | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo "${ACCESS_KEY_OUTPUT}" | jq -r '.AccessKey.SecretAccessKey')

# Display credentials
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${BLUE}================================================${NC}"
echo -e "${BLUE}GitLab CI/CD Variables Configuration${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "\nAdd these variables to GitLab → Settings → CI/CD → Variables:"
echo -e "\n${YELLOW}Variable Name:${NC} AWS_ACCESS_KEY_ID"
echo -e "${YELLOW}Value:${NC} ${ACCESS_KEY_ID}"
echo -e "${YELLOW}Type:${NC} Variable"
echo -e "${YELLOW}Flags:${NC} Protected ✓, Masked ✓"
echo -e "\n${YELLOW}Variable Name:${NC} AWS_SECRET_ACCESS_KEY"
echo -e "${YELLOW}Value:${NC} ${SECRET_ACCESS_KEY}"
echo -e "${YELLOW}Type:${NC} Variable"
echo -e "${YELLOW}Flags:${NC} Protected ✓, Masked ✓"
echo -e "\n${YELLOW}Variable Name:${NC} AWS_S3_BUCKET"
echo -e "${YELLOW}Value:${NC} <your-s3-bucket-name>"
echo -e "${YELLOW}Type:${NC} Variable"
echo -e "${YELLOW}Flags:${NC} Protected ✓"
echo -e "\n${YELLOW}Variable Name:${NC} AWS_CLOUDFRONT_ID"
echo -e "${YELLOW}Value:${NC} <your-cloudfront-distribution-id>"
echo -e "${YELLOW}Type:${NC} Variable"
echo -e "${YELLOW}Flags:${NC} Protected ✓"
echo -e "\n${BLUE}================================================${NC}"

echo -e "\n${RED}⚠️  IMPORTANT: Save these credentials securely!${NC}"
echo -e "${RED}   They will not be shown again.${NC}"

# Save to file (optional)
echo -e "\n💾 Saving credentials to aws-credentials.txt (DO NOT commit this file)..."
cat >aws-credentials.txt <<EOF
# AWS Credentials for GitLab CI Deployment
# Generated: $(date)
# DO NOT COMMIT THIS FILE TO GIT

AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}

# Add to .gitignore if not already there
# Add these to GitLab CI/CD Variables (Settings → CI/CD → Variables)
# Mark as Protected and Masked
EOF

echo -e "${GREEN}✓ Credentials saved to aws-credentials.txt${NC}"

# Add to .gitignore
if ! grep -q "aws-credentials.txt" .gitignore 2>/dev/null; then
	echo -e "\n📝 Adding aws-credentials.txt to .gitignore..."
	echo "aws-credentials.txt" >>.gitignore
	echo -e "${GREEN}✓ Added to .gitignore${NC}"
fi

echo -e "\n${GREEN}🎉 IAM setup complete!${NC}"
echo -e "\nNext steps:"
echo -e "1. Add the credentials to GitLab CI/CD Variables"
echo -e "2. Set AWS_S3_BUCKET variable (your S3 bucket name)"
echo -e "3. Set AWS_CLOUDFRONT_ID variable (your CloudFront distribution ID)"
echo -e "4. Push a tag to trigger deployment: git tag v1.0.0 && git push origin v1.0.0"
