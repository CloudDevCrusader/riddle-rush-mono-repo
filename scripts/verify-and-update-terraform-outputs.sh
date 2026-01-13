#!/bin/bash
# ===========================================
# Verify and Update Terraform Outputs
# ===========================================
# This script:
# 1. Gets the correct values from Terraform state
# 2. Checks all places where these values are stored
# 3. Updates them if they don't match
#
# Usage: ./scripts/verify-and-update-terraform-outputs.sh [environment]
# Example: ./scripts/verify-and-update-terraform-outputs.sh development
#          ./scripts/verify-and-update-terraform-outputs.sh production
#          ./scripts/verify-and-update-terraform-outputs.sh all
#
# Options:
#   --dry-run    Show what would be updated without making changes
#   --force      Force update even if values match

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parse arguments
DRY_RUN=false
FORCE=false
ENVIRONMENT=""

for arg in "$@"; do
	case "${arg}" in
	--dry-run)
		DRY_RUN=true
		;;
	--force)
		FORCE=true
		;;
	--help)
		echo "Usage: $0 [options] [environment]"
		echo "Options:"
		echo "  --dry-run    Show what would be updated without making changes"
		echo "  --force      Force update even if values match"
		echo "  --help       Show this help message"
		echo ""
		echo "Environments: development, production, staging, or 'all'"
		exit 0
		;;
	*)
		if [[ -z "${ENVIRONMENT}" ]]; then
			ENVIRONMENT="${arg}"
		fi
		;;
	esac
done

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Function to get Terraform output with fallbacks
get_terraform_output() {
	local env_dir="$1"
	local output_name="$2"
	local fallback1="${3:-}"
	local fallback2="${4:-}"

	cd "${env_dir}"

	# Try primary output name
	local value=$(terraform output -raw "${output_name}" 2>/dev/null || echo "")
	
	# Try fallbacks if primary is empty
	if [[ -z "${value}" ]] && [[ -n "${fallback1}" ]]; then
		value=$(terraform output -raw "${fallback1}" 2>/dev/null || echo "")
	fi
	
	if [[ -z "${value}" ]] && [[ -n "${fallback2}" ]]; then
		value=$(terraform output -raw "${fallback2}" 2>/dev/null || echo "")
	fi

	cd - >/dev/null
	echo "${value}"
}

# Function to get value from JSON file
get_json_value() {
	local json_file="$1"
	local key="$2"
	local fallback1="${3:-}"
	local fallback2="${4:-}"

	if [[ ! -f "${json_file}" ]]; then
		echo ""
		return
	fi

	if command -v jq &>/dev/null; then
		local value=$(jq -r ".${key}.value // empty" "${json_file}" 2>/dev/null || echo "")
		if [[ -z "${value}" ]] && [[ -n "${fallback1}" ]]; then
			value=$(jq -r ".${fallback1}.value // empty" "${json_file}" 2>/dev/null || echo "")
		fi
		if [[ -z "${value}" ]] && [[ -n "${fallback2}" ]]; then
			value=$(jq -r ".${fallback2}.value // empty" "${json_file}" 2>/dev/null || echo "")
		fi
		echo "${value}"
	else
		# Fallback without jq
		local value=$(grep -o "\"${key}\"[^}]*\"value\"[^\"]*\"[^\"]*\"" "${json_file}" 2>/dev/null | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p' | head -1 || echo "")
		if [[ -z "${value}" ]] && [[ -n "${fallback1}" ]]; then
			value=$(grep -o "\"${fallback1}\"[^}]*\"value\"[^\"]*\"[^\"]*\"" "${json_file}" 2>/dev/null | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p' | head -1 || echo "")
		fi
		if [[ -z "${value}" ]] && [[ -n "${fallback2}" ]]; then
			value=$(grep -o "\"${fallback2}\"[^}]*\"value\"[^\"]*\"[^\"]*\"" "${json_file}" 2>/dev/null | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p' | head -1 || echo "")
		fi
		echo "${value}"
	fi
}

# Function to update JSON file
update_json_file() {
	local json_file="$1"
	local key="$2"
	local value="$3"

	if [[ ! -f "${json_file}" ]]; then
		echo -e "${YELLOW}  ⚠️  JSON file not found: ${json_file}${NC}"
		return 1
	fi

	if command -v jq &>/dev/null; then
		if [[ "${DRY_RUN}" = true ]]; then
			echo -e "${CYAN}  [DRY RUN] Would update ${key} in ${json_file}${NC}"
			return 0
		fi
		
		# Update JSON using jq
		local temp_file=$(mktemp)
		jq ".${key}.value = \"${value}\"" "${json_file}" > "${temp_file}" && mv "${temp_file}" "${json_file}"
		return 0
	else
		echo -e "${YELLOW}  ⚠️  jq not available, cannot update JSON file${NC}"
		return 1
	fi
}

# Function to update .env.terraform file
update_env_file() {
	local env_file="$1"
	local key="$2"
	local value="$3"

	if [[ "${DRY_RUN}" = true ]]; then
		echo -e "${CYAN}  [DRY RUN] Would update ${key} in ${env_file}${NC}"
		return 0
	fi

	# Create file if it doesn't exist
	if [[ ! -f "${env_file}" ]]; then
		mkdir -p "$(dirname "${env_file}")"
		touch "${env_file}"
	fi

	# Update or add the key
	if grep -q "^${key}=" "${env_file}" 2>/dev/null; then
		# Update existing line
		if [[ "$(uname)" = "Darwin" ]]; then
			sed -i '' "s|^${key}=.*|${key}=${value}|" "${env_file}"
		else
			sed -i "s|^${key}=.*|${key}=${value}|" "${env_file}"
		fi
	else
		# Add new line
		echo "${key}=${value}" >> "${env_file}"
	fi
}

# Function to verify and update environment
verify_and_update_environment() {
	local env="$1"
	local env_dir="${PROJECT_ROOT}/infrastructure/environments/${env}"

	if [[ ! -d "${env_dir}" ]]; then
		echo -e "${YELLOW}⚠️  Environment directory not found: ${env}${NC}"
		return 1
	fi

	if [[ ! -d "${env_dir}/.terraform" ]]; then
		echo -e "${YELLOW}⚠️  Terraform not initialized for ${env}${NC}"
		echo -e "   Run: cd ${env_dir} && terraform init"
		return 1
	fi

	echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
	echo -e "${BLUE}🔍 Verifying ${env} environment...${NC}"
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

	# Get correct values from Terraform
	echo -e "\n${CYAN}📋 Getting values from Terraform state...${NC}"
	
	local terraform_bucket=$(get_terraform_output "${env_dir}" "bucket_name" "active_bucket_name" "blue_bucket_name")
	local terraform_cf_id=$(get_terraform_output "${env_dir}" "cloudfront_distribution_id")
	local terraform_cf_domain=$(get_terraform_output "${env_dir}" "cloudfront_domain_name")
	local terraform_region=$(get_terraform_output "${env_dir}" "aws_region")
	
	# Default region if not found
	if [[ -z "${terraform_region}" ]]; then
		terraform_region="eu-central-1"
	fi

	echo -e "  ${GREEN}✓${NC} S3 Bucket: ${terraform_bucket}"
	echo -e "  ${GREEN}✓${NC} CloudFront ID: ${terraform_cf_id}"
	echo -e "  ${GREEN}✓${NC} CloudFront Domain: ${terraform_cf_domain}"
	echo -e "  ${GREEN}✓${NC} Region: ${terraform_region}"

	# Check terraform-outputs.json
	echo -e "\n${CYAN}📄 Checking terraform-outputs.json...${NC}"
	local json_file="${env_dir}/terraform-outputs.json"
	
	if [[ -f "${json_file}" ]]; then
		local json_bucket=$(get_json_value "${json_file}" "bucket_name" "active_bucket_name" "blue_bucket_name")
		local json_cf_id=$(get_json_value "${json_file}" "cloudfront_distribution_id")
		local json_region=$(get_json_value "${json_file}" "aws_region")

		local needs_update=false

		# Check bucket name
		if [[ "${json_bucket}" != "${terraform_bucket}" ]] || [[ "${FORCE}" = true ]]; then
			if [[ -n "${terraform_bucket}" ]]; then
				echo -e "  ${YELLOW}⚠️  Bucket mismatch:${NC}"
				echo -e "     JSON: ${json_bucket}"
				echo -e "     Terraform: ${terraform_bucket}"
				update_json_file "${json_file}" "bucket_name" "${terraform_bucket}"
				# Also update active_bucket_name if it exists
				if [[ -n "$(get_json_value "${json_file}" "active_bucket_name")" ]]; then
					update_json_file "${json_file}" "active_bucket_name" "${terraform_bucket}"
				fi
				needs_update=true
			fi
		else
			echo -e "  ${GREEN}✓${NC} Bucket name matches"
		fi

		# Check CloudFront ID
		if [[ "${json_cf_id}" != "${terraform_cf_id}" ]] || [[ "${FORCE}" = true ]]; then
			if [[ -n "${terraform_cf_id}" ]]; then
				echo -e "  ${YELLOW}⚠️  CloudFront ID mismatch:${NC}"
				echo -e "     JSON: ${json_cf_id}"
				echo -e "     Terraform: ${terraform_cf_id}"
				update_json_file "${json_file}" "cloudfront_distribution_id" "${terraform_cf_id}"
				needs_update=true
			fi
		else
			echo -e "  ${GREEN}✓${NC} CloudFront ID matches"
		fi

		# Check region
		if [[ "${json_region}" != "${terraform_region}" ]] || [[ "${FORCE}" = true ]]; then
			if [[ -n "${terraform_region}" ]]; then
				echo -e "  ${YELLOW}⚠️  Region mismatch:${NC}"
				echo -e "     JSON: ${json_region}"
				echo -e "     Terraform: ${terraform_region}"
				update_json_file "${json_file}" "aws_region" "${terraform_region}"
				needs_update=true
			fi
		else
			echo -e "  ${GREEN}✓${NC} Region matches"
		fi

		if [[ "${needs_update}" = false ]] && [[ "${FORCE}" = false ]]; then
			echo -e "  ${GREEN}✓${NC} All values in terraform-outputs.json are up to date"
		fi
	else
		echo -e "  ${YELLOW}⚠️  terraform-outputs.json not found, generating...${NC}"
		if [[ "${DRY_RUN}" != true ]]; then
			cd "${env_dir}"
			terraform output -json | jq '.' > terraform-outputs.json
			cd - >/dev/null
			echo -e "  ${GREEN}✓${NC} Generated terraform-outputs.json"
		fi
	fi

	# Check .env.terraform file
	echo -e "\n${CYAN}📄 Checking .env.terraform...${NC}"
	local env_file="${env_dir}/.env.terraform"
	
	if [[ -f "${env_file}" ]]; then
		local env_bucket=$(grep "^AWS_S3_BUCKET=" "${env_file}" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "")
		local env_cf_id=$(grep "^AWS_CLOUDFRONT_ID=" "${env_file}" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "")
		local env_region=$(grep "^AWS_REGION=" "${env_file}" 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "")

		# Check bucket
		if [[ "${env_bucket}" != "${terraform_bucket}" ]] || [[ "${FORCE}" = true ]]; then
			if [[ -n "${terraform_bucket}" ]]; then
				echo -e "  ${YELLOW}⚠️  Bucket mismatch in .env.terraform${NC}"
				update_env_file "${env_file}" "AWS_S3_BUCKET" "${terraform_bucket}"
			fi
		else
			echo -e "  ${GREEN}✓${NC} Bucket matches in .env.terraform"
		fi

		# Check CloudFront ID
		if [[ "${env_cf_id}" != "${terraform_cf_id}" ]] || [[ "${FORCE}" = true ]]; then
			if [[ -n "${terraform_cf_id}" ]]; then
				echo -e "  ${YELLOW}⚠️  CloudFront ID mismatch in .env.terraform${NC}"
				update_env_file "${env_file}" "AWS_CLOUDFRONT_ID" "${terraform_cf_id}"
			fi
		else
			echo -e "  ${GREEN}✓${NC} CloudFront ID matches in .env.terraform"
		fi

		# Check region
		if [[ "${env_region}" != "${terraform_region}" ]] || [[ "${FORCE}" = true ]]; then
			if [[ -n "${terraform_region}" ]]; then
				echo -e "  ${YELLOW}⚠️  Region mismatch in .env.terraform${NC}"
				update_env_file "${env_file}" "AWS_REGION" "${terraform_region}"
			fi
		else
			echo -e "  ${GREEN}✓${NC} Region matches in .env.terraform"
		fi
	else
		echo -e "  ${YELLOW}⚠️  .env.terraform not found, creating...${NC}"
		if [[ "${DRY_RUN}" != true ]]; then
			cat > "${env_file}" << EOF
# Terraform outputs for ${env} environment
# Generated by verify-and-update-terraform-outputs.sh
# DO NOT EDIT MANUALLY - This file is auto-generated

AWS_S3_BUCKET=${terraform_bucket}
AWS_CLOUDFRONT_ID=${terraform_cf_id}
AWS_REGION=${terraform_region}
CLOUDFRONT_DOMAIN=${terraform_cf_domain}
EOF
			echo -e "  ${GREEN}✓${NC} Created .env.terraform"
		fi
	fi

	echo -e "\n${GREEN}✅ Verification complete for ${env}${NC}"
}

# Main logic
if [[ -z "${ENVIRONMENT}" ]]; then
	echo -e "${RED}❌ Error: Environment not specified${NC}"
	echo -e "Usage: $0 [options] <environment>"
	echo -e "       $0 [options] all"
	echo -e "\nOptions:"
	echo -e "  --dry-run    Show what would be updated without making changes"
	echo -e "  --force      Force update even if values match"
	echo -e "\nAvailable environments:"
	ls -1 "${PROJECT_ROOT}/infrastructure/environments" 2>/dev/null | grep -v README || echo "  (none found)"
	exit 1
fi

if [[ "${DRY_RUN}" = true ]]; then
	echo -e "${YELLOW}🔍 DRY RUN MODE: No changes will be made${NC}"
fi

case "${ENVIRONMENT}" in
	all)
		echo -e "${BLUE}🔄 Verifying all environments...${NC}"
		for env in development staging production; do
			verify_and_update_environment "${env}" || true
		done
		;;
	*)
		verify_and_update_environment "${ENVIRONMENT}"
		;;
esac

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [[ "${DRY_RUN}" = true ]]; then
	echo -e "${GREEN}✅ Verification complete (dry run)${NC}"
else
	echo -e "${GREEN}✅ All outputs verified and updated!${NC}"
fi
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}💡 Tip: Run this script after 'terraform apply' to keep all config files in sync${NC}"
