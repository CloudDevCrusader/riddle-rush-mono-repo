#!/bin/bash

# Script to create an admin user invitation link
# This script generates a secure invitation link that can be shared with new admin users

set -e

echo "🔐 Creating Admin User Invitation"
echo "================================"

# Check if required tools are installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

# Get current AWS account information
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "eu-central-1")

# Read Terraform variables
if [ -f "terraform.tfvars" ]; then
    echo "📄 Reading Terraform variables from terraform.tfvars"
    PROJECT_NAME=$(grep -E "^project_name\s*=" terraform.tfvars | cut -d '"' -f 2 | tr -d ' ')
    ENVIRONMENT=$(grep -E "^environment\s*=" terraform.tfvars | cut -d '"' -f 2 | tr -d ' ')
    ADDITIONAL_ADMIN_USERNAME=$(grep -E "^additional_admin_username\s*=" terraform.tfvars | cut -d '"' -f 2 | tr -d ' ')
else
    # Use defaults
    PROJECT_NAME="riddle-rush-pwa"
    ENVIRONMENT="production"
    ADDITIONAL_ADMIN_USERNAME="admin2"
fi

# Generate a secure random password
PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9!@#$%^&*()_+' | head -c 16)

# Create the IAM user (if not exists)
echo "👤 Creating IAM user: ${PROJECT_NAME}-admin-${ADDITIONAL_ADMIN_USERNAME}"

USER_NAME="${PROJECT_NAME}-admin-${ADDITIONAL_ADMIN_USERNAME}"

# Check if user already exists
if aws iam get-user --user-name "$USER_NAME" &> /dev/null; then
    echo "ℹ️  User already exists: $USER_NAME"
else
    echo "🆕 Creating new user: $USER_NAME"
    aws iam create-user --user-name "$USER_NAME"
fi

# Create login profile with the generated password
echo "🔑 Creating login profile with temporary password"
aws iam create-login-profile \
    --user-name "$USER_NAME" \
    --password "$PASSWORD" \
    --password-reset-required

# Create access key
echo "🔑 Creating access key for programmatic access"
ACCESS_KEY_INFO=$(aws iam create-access-key --user-name "$USER_NAME")
ACCESS_KEY_ID=$(echo "$ACCESS_KEY_INFO" | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_INFO" | jq -r '.AccessKey.SecretAccessKey')

# Create a temporary credentials file
CREDS_FILE="${USER_NAME}-credentials.txt"
cat > "$CREDS_FILE" << EOF
🔐 AWS Credentials for: $USER_NAME
=====================================

AWS Console URL: https://${ACCOUNT_ID}.signin.aws.amazon.com/console
Username: $USER_NAME
Temporary Password: $PASSWORD

Programmatic Access:
AWS Access Key ID: $ACCESS_KEY_ID
AWS Secret Access Key: $SECRET_ACCESS_KEY

IMPORTANT SECURITY NOTES:
1. You will be required to change your password on first login
2. Enable MFA immediately after login
3. Store these credentials securely
4. Do not share these credentials with anyone
5. Rotate your access keys regularly

Role Information:
- Admin Role ARN: arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}-admin-role
- Developer Role ARN: arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}-developer-role

To assume admin role:
aws sts assume-role --role-arn arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}-admin-role --role-session-name admin-session

To assume developer role:
aws sts assume-role --role-arn arn:aws:iam::${ACCOUNT_ID}:role/${PROJECT_NAME}-developer-role --role-session-name developer-session
EOF

echo "✅ Credentials file created: $CREDS_FILE"

# Generate a secure invitation link
TIMESTAMP=$(date +%s)
INVITE_CODE=$(echo "${USER_NAME}-${TIMESTAMP}-${ACCOUNT_ID}" | sha256sum | cut -d ' ' -f 1 | head -c 12)

INVITE_LINK="https://${ACCOUNT_ID}.signin.aws.amazon.com/console?username=${USER_NAME}&invite=${INVITE_CODE}"

echo ""
echo "🎉 Admin User Invitation Created Successfully!"
echo "============================================"
echo ""
echo "📋 User Details:"
echo "   Username: $USER_NAME"
echo "   Account ID: $ACCOUNT_ID"
echo "   Region: $REGION"
echo ""
echo "🔗 Invitation Link:"
echo "   $INVITE_LINK"
echo ""
echo "📁 Credentials File:"
echo "   $CREDS_FILE"
echo ""
echo "📝 Next Steps:"
echo "   1. Share the credentials file securely with the new admin"
echo "   2. Share the invitation link"
echo "   3. Instruct the admin to:"
echo "      - Login to AWS Console using the temporary credentials"
echo "      - Change their password immediately"
echo "      - Enable MFA"
echo "      - Assume the appropriate role (admin or developer)"
echo ""
echo "⚠️  SECURITY WARNING:"
echo "   - This script has created sensitive credentials"
echo "   - The credentials file contains secrets that should be shared securely"
echo "   - Consider using AWS IAM Identity Center for production environments"
echo "   - Rotate credentials regularly"
echo ""
