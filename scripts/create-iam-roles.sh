#!/bin/bash
# ===========================================
# Create IAM Roles for Riddle Rush Deployment
# ===========================================
# Usage: ./scripts/create-iam-roles.sh
#
# This script creates IAM roles needed for deploying Riddle Rush:
# 1. Developer Role - Read access + limited deploy
# 2. Admin Role - Full access to resources
# 3. Deployer Role - CI/CD deployment access

set -e

ACCOUNT_ID="720377205549"
PROJECT_NAME="riddlerush"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Creating IAM Roles for ${PROJECT_NAME}${NC}"
echo "=========================================="
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    exit 1
fi

# Verify credentials
echo -e "${BLUE}Verifying AWS credentials...${NC}"
CURRENT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
if [ -z "$CURRENT_ACCOUNT" ]; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Please configure credentials first:"
    echo "  1. Get access keys from AWS Console"
    echo "  2. Run: aws configure --profile riddlerush"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated as account: ${CURRENT_ACCOUNT}${NC}"
echo ""

# ===========================================
# 1. Create Trust Policy (allows you to assume the role)
# ===========================================

echo -e "${BLUE}📝 Creating trust policy...${NC}"

cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${ACCOUNT_ID}:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# ===========================================
# 2. Create Developer Role
# ===========================================

echo -e "\n${BLUE}👨‍💻 Creating Developer Role...${NC}"

# Create developer policy
cat > /tmp/developer-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "cloudfront:GetDistribution",
        "cloudfront:ListDistributions"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::${PROJECT_NAME}-*/*"
    }
  ]
}
EOF

# Create role
aws iam create-role \
    --role-name "${PROJECT_NAME}-developer-role" \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --description "Developer role for ${PROJECT_NAME} with read/limited deploy access" \
    --tags Key=Project,Value=${PROJECT_NAME} Key=ManagedBy,Value=Script \
    2>/dev/null && echo -e "${GREEN}✓ Created ${PROJECT_NAME}-developer-role${NC}" \
    || echo -e "${YELLOW}⚠️  Role already exists or error occurred${NC}"

# Attach inline policy
aws iam put-role-policy \
    --role-name "${PROJECT_NAME}-developer-role" \
    --policy-name "${PROJECT_NAME}-developer-policy" \
    --policy-document file:///tmp/developer-policy.json \
    && echo -e "${GREEN}✓ Attached developer policy${NC}" \
    || echo -e "${YELLOW}⚠️  Policy attachment failed${NC}"

# ===========================================
# 3. Create Admin Role
# ===========================================

echo -e "\n${BLUE}👑 Creating Admin Role...${NC}"

# Create admin policy
cat > /tmp/admin-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "route53:*",
        "acm:*",
        "iam:GetRole",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Create role
aws iam create-role \
    --role-name "${PROJECT_NAME}-admin-role" \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --description "Admin role for ${PROJECT_NAME} with full management access" \
    --tags Key=Project,Value=${PROJECT_NAME} Key=ManagedBy,Value=Script \
    2>/dev/null && echo -e "${GREEN}✓ Created ${PROJECT_NAME}-admin-role${NC}" \
    || echo -e "${YELLOW}⚠️  Role already exists or error occurred${NC}"

# Attach inline policy
aws iam put-role-policy \
    --role-name "${PROJECT_NAME}-admin-role" \
    --policy-name "${PROJECT_NAME}-admin-policy" \
    --policy-document file:///tmp/admin-policy.json \
    && echo -e "${GREEN}✓ Attached admin policy${NC}" \
    || echo -e "${YELLOW}⚠️  Policy attachment failed${NC}"

# ===========================================
# 4. Create Deployer Role (for CI/CD)
# ===========================================

echo -e "\n${BLUE}🚀 Creating Deployer Role (CI/CD)...${NC}"

# Create deployer policy
cat > /tmp/deployer-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::${PROJECT_NAME}-*",
        "arn:aws:s3:::${PROJECT_NAME}-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Create role
aws iam create-role \
    --role-name "${PROJECT_NAME}-deployer-role" \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --description "Deployer role for ${PROJECT_NAME} CI/CD pipelines" \
    --tags Key=Project,Value=${PROJECT_NAME} Key=ManagedBy,Value=Script \
    2>/dev/null && echo -e "${GREEN}✓ Created ${PROJECT_NAME}-deployer-role${NC}" \
    || echo -e "${YELLOW}⚠️  Role already exists or error occurred${NC}"

# Attach inline policy
aws iam put-role-policy \
    --role-name "${PROJECT_NAME}-deployer-role" \
    --policy-name "${PROJECT_NAME}-deployer-policy" \
    --policy-document file:///tmp/deployer-policy.json \
    && echo -e "${GREEN}✓ Attached deployer policy${NC}" \
    || echo -e "${YELLOW}⚠️  Policy attachment failed${NC}"

# ===========================================
# Cleanup
# ===========================================

rm -f /tmp/trust-policy.json /tmp/developer-policy.json /tmp/admin-policy.json /tmp/deployer-policy.json

# ===========================================
# Summary
# ===========================================

echo ""
echo -e "${GREEN}✅ IAM Roles Created Successfully!${NC}"
echo ""
echo -e "${BLUE}Created Roles:${NC}"
echo -e "  1. ${PROJECT_NAME}-developer-role"
echo -e "     ${YELLOW}ARN:${NC} arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}-developer-role"
echo ""
echo -e "  2. ${PROJECT_NAME}-admin-role"
echo -e "     ${YELLOW}ARN:${NC} arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}-admin-role"
echo ""
echo -e "  3. ${PROJECT_NAME}-deployer-role"
echo -e "     ${YELLOW}ARN:${NC} arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}-deployer-role"
echo ""
echo -e "${BLUE}💡 To assume a role:${NC}"
echo -e "   ${GREEN}source ./scripts/assume-aws-role.sh developer${NC}"
echo -e "   ${GREEN}source ./scripts/assume-aws-role.sh admin${NC}"
echo -e "   ${GREEN}source ./scripts/assume-aws-role.sh deployer${NC}"
echo ""
echo -e "${YELLOW}⚠️  Note: Roles may take a few seconds to propagate${NC}"
