#!/bin/bash

# Script to import existing AWS resources using terraformer
# This helps migrate from CloudFormation or manually created resources

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Terraformer Import Script${NC}"
echo "========================================"

# Check if terraformer is installed
if ! command -v terraformer &>/dev/null; then
	echo -e "${RED}❌ terraformer not found${NC}"
	echo -e "${YELLOW}Install terraformer:${NC}"
	echo ""
	echo "macOS:"
	echo "  brew install terraformer"
	echo ""
	echo "Linux:"
	echo "  wget https://github.com/GoogleCloudPlatform/terraformer/releases/download/0.8.24/terraformer-aws-linux-amd64"
	echo "  chmod +x terraformer-aws-linux-amd64"
	echo "  sudo mv terraformer-aws-linux-amd64 /usr/local/bin/terraformer"
	echo ""
	echo "Or via Go:"
	echo "  go install github.com/GoogleCloudPlatform/terraformer/cmd/terraformer@latest"
	exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
	echo -e "${RED}❌ AWS credentials not configured${NC}"
	exit 1
fi

AWS_REGION="${AWS_REGION:-eu-central-1}"
IMPORT_DIR="./imported-resources"

echo -e "\n${BLUE}Configuration:${NC}"
echo "  Region: ${AWS_REGION}"
echo "  Import directory: ${IMPORT_DIR}"

# Create import directory
mkdir -p "${IMPORT_DIR}"

echo -e "\n${BLUE}Available import options:${NC}"
echo "  1. Import S3 bucket"
echo "  2. Import CloudFront distribution"
echo "  3. Import both S3 and CloudFront"
echo "  4. Import by resource name filter"
echo ""

read -p "Select option (1-4): " option

case ${option} in
1)
	echo -e "\n${BLUE}Importing S3 bucket...${NC}"
	read -p "Enter bucket name (or leave empty to import all): " bucket_name

	if [[ -z "${bucket_name}" ]]; then
		terraformer import aws --resources=s3 --regions="${AWS_REGION}" --path="${IMPORT_DIR}"
	else
		terraformer import aws --resources=s3 --regions="${AWS_REGION}" --filter="Name=id;Value=${bucket_name}" --path="${IMPORT_DIR}"
	fi
	;;
2)
	echo -e "\n${BLUE}Importing CloudFront distribution...${NC}"
	terraformer import aws --resources=cloudfront --regions="${AWS_REGION}" --path="${IMPORT_DIR}"
	;;
3)
	echo -e "\n${BLUE}Importing S3 and CloudFront...${NC}"
	terraformer import aws --resources=s3,cloudfront --regions="${AWS_REGION}" --path="${IMPORT_DIR}"
	;;
4)
	echo -e "\n${BLUE}Import by resource name filter...${NC}"
	read -p "Enter resource name pattern (e.g., riddle-rush-pwa): " pattern
	terraformer import aws --resources=s3,cloudfront --regions="${AWS_REGION}" --filter="Name=tags.Name;Value=*${pattern}*" --path="${IMPORT_DIR}"
	;;
*)
	echo -e "${RED}Invalid option${NC}"
	exit 1
	;;
esac

echo -e "\n${GREEN}✅ Import complete!${NC}"
echo -e "${BLUE}Generated files in: ${IMPORT_DIR}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review generated Terraform files in ${IMPORT_DIR}"
echo "  2. Compare with existing main.tf"
echo "  3. Merge configurations as needed"
echo "  4. Run: terraform plan to verify"
echo ""
echo -e "${YELLOW}Note:${NC} You may need to:"
echo "  - Update resource names to match your naming convention"
echo "  - Remove duplicate resources"
echo "  - Update variable references"
echo "  - Review and adjust configurations"
