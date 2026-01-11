#!/bin/bash
# ===========================================
# AWS Credentials Setup Helper
# ===========================================
# Usage: ./scripts/setup-aws-credentials.sh
#
# This script helps you set up AWS credentials properly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 AWS Credentials Setup${NC}"
echo "=========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo ""
    echo "Install AWS CLI v2:"
    echo "  curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "  unzip awscliv2.zip"
    echo "  sudo ./aws/install"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI found: $(aws --version)${NC}"
echo ""

# Backup existing config
if [ -f ~/.aws/credentials ]; then
    echo -e "${BLUE}📋 Backing up existing credentials...${NC}"
    cp ~/.aws/credentials ~/.aws/credentials.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Backup created${NC}"
fi

if [ -f ~/.aws/config ]; then
    echo -e "${BLUE}📋 Backing up existing config...${NC}"
    cp ~/.aws/config ~/.aws/config.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Backup created${NC}"
fi

echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}How to get AWS Access Keys:${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo "1. Log into AWS Console: https://console.aws.amazon.com/"
echo "2. Click your name (top right) → Security credentials"
echo "3. Scroll to 'Access keys' section"
echo "4. Click 'Create access key'"
echo "5. Choose 'Command Line Interface (CLI)'"
echo "6. Check acknowledgment → Next"
echo "7. Copy both Access Key ID and Secret Access Key"
echo ""
echo -e "${YELLOW}=========================================${NC}"
echo ""

# Prompt for configuration method
echo -e "${BLUE}Choose setup method:${NC}"
echo "  1) Use aws configure command (Recommended)"
echo "  2) I'll help you edit the files manually"
echo "  3) Exit"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Running aws configure...${NC}"
        echo -e "${YELLOW}When prompted, enter your AWS credentials:${NC}"
        echo ""
        aws configure --profile riddlerush
        
        echo ""
        echo -e "${GREEN}✅ Configuration complete!${NC}"
        echo ""
        echo -e "${BLUE}Testing credentials...${NC}"
        if aws sts get-caller-identity --profile riddlerush &>/dev/null; then
            ACCOUNT=$(aws sts get-caller-identity --profile riddlerush --query Account --output text)
            USER=$(aws sts get-caller-identity --profile riddlerush --query Arn --output text)
            echo -e "${GREEN}✓ Credentials working!${NC}"
            echo -e "  Account: ${ACCOUNT}"
            echo -e "  User: ${USER}"
        else
            echo -e "${RED}❌ Credentials test failed${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}I'll create template files for you to edit${NC}"
        echo ""
        
        # Create directories
        mkdir -p ~/.aws
        
        # Create credentials template
        cat > ~/.aws/credentials << 'EOF'
[default]
aws_access_key_id = <YOUR_ACCESS_KEY_ID>
aws_secret_access_key = <YOUR_SECRET_KEY>

[riddlerush]
aws_access_key_id = <YOUR_ACCESS_KEY_ID>
aws_secret_access_key = <YOUR_SECRET_KEY>
EOF
        
        # Create config template
        cat > ~/.aws/config << 'EOF'
[default]
region = eu-central-1
output = json

[profile riddlerush]
region = eu-central-1
output = json
EOF
        
        echo -e "${GREEN}✓ Template files created${NC}"
        echo ""
        echo -e "${YELLOW}Now edit these files:${NC}"
        echo "  1. ~/.aws/credentials - Replace <YOUR_ACCESS_KEY_ID> and <YOUR_SECRET_KEY>"
        echo "  2. ~/.aws/config - Region is already set to eu-central-1"
        echo ""
        echo -e "${BLUE}Edit now?${NC}"
        read -p "Open in nano? [y/N]: " edit_choice
        
        if [[ "$edit_choice" =~ ^[Yy]$ ]]; then
            nano ~/.aws/credentials
            echo ""
            echo -e "${BLUE}Testing credentials...${NC}"
            if aws sts get-caller-identity --profile riddlerush &>/dev/null; then
                echo -e "${GREEN}✓ Credentials working!${NC}"
            else
                echo -e "${RED}❌ Credentials test failed${NC}"
                echo "Please edit ~/.aws/credentials and try again"
                exit 1
            fi
        fi
        ;;
        
    3)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ AWS Setup Complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Create IAM roles:"
echo -e "     ${GREEN}./scripts/create-iam-roles.sh${NC}"
echo ""
echo "  2. Test Terraform:"
echo -e "     ${GREEN}export AWS_PROFILE=riddlerush${NC}"
echo -e "     ${GREEN}pnpm run terraform:plan development${NC}"
echo ""
echo "  3. Or assume a role (if you created roles):"
echo -e "     ${GREEN}source ./scripts/assume-aws-role.sh developer${NC}"
echo ""
