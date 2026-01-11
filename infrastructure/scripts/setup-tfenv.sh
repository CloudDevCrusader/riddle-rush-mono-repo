#!/bin/bash

# Setup script for tfenv (Terraform Version Manager)
# This script installs tfenv and the required Terraform version

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up tfenv and Terraform...${NC}"

# Check if tfenv is installed
if ! command -v tfenv &>/dev/null; then
	echo -e "${YELLOW}⚠️  tfenv not found. Installing...${NC}"

	# Detect OS
	if [[ ${OSTYPE} == "darwin"* ]]; then
		# macOS
		if command -v brew &>/dev/null; then
			echo -e "${GREEN}Installing via Homebrew...${NC}"
			brew install tfenv
		else
			echo -e "${YELLOW}Homebrew not found. Please install manually:${NC}"
			echo "  brew install tfenv"
			exit 1
		fi
	else
		# Linux
		echo -e "${GREEN}Installing via git...${NC}"
		git clone https://github.com/tfutils/tfenv.git ~/.tfenv
		export PATH="${HOME}/.tfenv/bin:${PATH}"
		echo 'export PATH="$HOME/.tfenv/bin:$PATH"' >>~/.bashrc
	fi
else
	echo -e "${GREEN}✓ tfenv already installed${NC}"
fi

# Read Terraform version from .terraform-version
if [[ -f ".terraform-version" ]]; then
	TERRAFORM_VERSION=$(cat .terraform-version)
	echo -e "${BLUE}📌 Required Terraform version: ${TERRAFORM_VERSION}${NC}"

	# Install and use the version
	echo -e "${BLUE}Installing Terraform ${TERRAFORM_VERSION}...${NC}"
	tfenv install "${TERRAFORM_VERSION}"
	tfenv use "${TERRAFORM_VERSION}"

	echo -e "${GREEN}✓ Terraform ${TERRAFORM_VERSION} installed and activated${NC}"
else
	echo -e "${YELLOW}⚠️  .terraform-version not found. Installing latest...${NC}"
	tfenv install latest
	tfenv use latest
fi

# Verify installation
echo -e "\n${BLUE}Verifying installation...${NC}"
terraform version

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Copy terraform.tfvars.example to terraform.tfvars"
echo "  2. Edit terraform.tfvars with your values"
echo "  3. Run: terraform init"
echo "  4. Run: terraform plan"
echo "  5. Run: terraform apply"
