#!/bin/bash
# ===========================================
# Common Deployment Functions Library
# ===========================================
# Shared functions for deployment scripts
# Source this file in deployment scripts: source "$(dirname "$0")/lib/deploy-common.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===========================================
# AWS Functions
# ===========================================

check_aws_cli() {
	if ! command -v aws &>/dev/null; then
		echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
		echo "Visit: https://aws.amazon.com/cli/"
		exit 1
	fi
}

check_aws_credentials() {
	echo -e "\n🔑 Checking AWS credentials..."
	if ! aws sts get-caller-identity &>/dev/null; then
		echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
		exit 1
	fi

	AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
	AWS_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
	echo -e "${GREEN}✓ AWS CLI configured${NC}"
	echo -e "  Account: ${AWS_ACCOUNT}"
	echo -e "  User: ${AWS_USER}"
}

# ===========================================
# Terraform Functions
# ===========================================

terraform_init() {
	local terraform_dir="$1"

	# Resolve to absolute path if relative
	if [[ ${terraform_dir} != /* ]]; then
		terraform_dir="$(cd "$(dirname "${terraform_dir}")" && pwd)/$(basename "${terraform_dir}")"
	fi

	if [[ ! -d "${terraform_dir}/.terraform" ]]; then
		echo -e "${BLUE}Initializing Terraform...${NC}"
		cd "${terraform_dir}" || {
			echo -e "${RED}❌ Cannot cd to Terraform directory${ $terraform_d}ir${NC}"
			exit 1
		}
		terraform init || {
			echo -e "${RED}❌ Terraform init failed${NC}"
			cd - >/dev/null
			exit 1
		}
		cd - >/dev/null
		echo -e "${GREEN}✓ Terraform initialized${NC}"
	fi
}

terraform_plan_and_apply() {
	local terraform_dir="$1"
	local environment="$2"

	# Resolve to absolute path if relative
	if [[ ${terraform_dir} != /* ]]; then
		terraform_dir="$(cd "$(dirname "${terraform_dir}")" && pwd)/$(basename "${terraform_dir}")"
	fi

	if ! command -v terraform &>/dev/null || [[ ! -d "${terraform_dir}" ]]; then
		echo -e "\n${YELLOW}⚠️  Terraform not available or directory not fou${d: $terraform}_dir${NC}"
		return 1
	fi

	echo -e "\n🏗️  Managing infrastructure with Terraform..."
	cd "${terraform_dir}" || {
		echo -e "${RED}❌ Cannot cd to Terraform directory${ $terraform_d}ir${NC}"
		exit 1
	}

	# Initialize if needed
	if [[ ! -d ".terraform" ]]; then
		terraform_init "${terraform_dir}"
	fi

	# Run terraform plan with detailed exit code
	# Exit codes: 0 = no changes, 1 = error, 2 = changes present
	echo -e "\n${BLUE}📋 Running Terraform plan...${NC}"
	# Temporarily disable set -e to handle exit code 2 (changes present) gracefully
	set +e
	terraform plan -detailed-exitcode -out=tfplan
	PLAN_EXIT_CODE=$?
	set -e

	if [[ "$PLAN_EXIT_CODE" -eq 1 ]]; then
		echo -e "${RED}❌ Terraform plan failed${NC}"
		rm -f tfplan
		cd - >/dev/null
		exit 1
	elif [[ "$PLAN_EXIT_CODE" -eq 2 ]]; then
		# Changes detected
		echo -e "\n${YELLOW}Terraform will make the following changes:${NC}"
		terraform show tfplan | head -50

		# Ask for confirmation (unless in CI or AUTO_APPLY is set)
		if [[ -z "${CI}" ]] && [[ -z "${AUTO_APPLY}" ]]; then
			echo -e "\n${YELLOW}⚠️  Terraform plan shows changes. Apply them?${NC}"
			read -p "Continue with terraform apply? (y/N) " -n 1 -r
			echo
			if [[ ! ${REPLY} =~ ^[Yy]$ ]]; then
				echo -e "${YELLOW}⚠️  Skipping terraform apply. Using existing infrastructure.${NC}"
				rm -f tfplan
				cd - >/dev/null
				return 0
			fi
		fi

		# Apply changes
		if [[ -n "${CI}" ]] || [[ -n "${AUTO_APPLY}" ]]; then
			echo -e "\n${BLUE}🚀 Auto-applying Terraform changes (CI/AUTO_APPLY mode)...${NC}"
			terraform apply -auto-approve tfplan || {
				echo -e "${RED}❌ Terraform apply failed${NC}"
				rm -f tfplan
				cd - >/dev/null
				exit 1
			}
		else
			echo -e "\n${BLUE}🚀 Applying Terraform changes...${NC}"
			terraform apply tfplan || {
				echo -e "${RED}❌ Terraform apply failed${NC}"
				rm -f tfplan
				cd - >/dev/null
				exit 1
			}
		fi

		rm -f tfplan
		echo -e "${GREEN}✓ Terraform apply completed${NC}"

		# Refresh outputs after apply
		load_terraform_outputs "${terraform_dir}"

		# Wait for CloudFront to be ready if distribution was created/updated
		if [[ -n "${AWS_CLOUDFRONT_ID}" ]]; then
			wait_for_cloudfront_ready "${AWS_CLOUDFRONT_ID}"
		fi
	else
		# No changes (exit code 0)
		echo -e "${GREEN}✓ No infrastructure changes detected${NC}"
		rm -f tfplan
	fi

	cd - >/dev/null
	return 0
}

load_terraform_outputs() {
	local terraform_dir="$1"

	# Resolve to absolute path if relative
	if [[ ${terraform_dir} != /* ]]; then
		terraform_dir="$(cd "$(dirname "${terraform_dir}")" && pwd)/$(basename "${terraform_dir}")"
	fi

	if [[ ! -d "${terraform_dir}" ]]; then
		return 1
	fi

	cd "${terraform_dir}" || {
		echo -e "${RED}❌ Cannot cd to Terraform directory${ $terraform_d}ir${NC}"
		return 1
	}

	if [[ -d ".terraform" ]]; then
		echo -e "${BLUE}Loading Terraform outputs...${NC}"
		export AWS_S3_BUCKET=$(terraform output -raw bucket_name 2>/dev/null || echo "${AWS_S3_BUCKET}")
		export AWS_CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "${AWS_CLOUDFRONT_ID}")
		export AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "${AWS_REGION}")

		if [[ -n "${AWS_S3_BUCKET}" ]]; then
			echo -e "${GREEN}✓ Loaded Terraform outputs${NC}"
		fi
	fi

	cd - >/dev/null
}

wait_for_cloudfront_ready() {
	local distribution_id="$1"

	if [[ -z "${distribution_id}" ]]; then
		return 0
	fi

	echo -e "\n${BLUE}⏳ Waiting 30 seconds for CloudFront distribution to be ready...${NC}"
	echo -e "  Distribution ID: ${distribution_id}"
	sleep 30
	echo -e "${GREEN}✓ Wait complete${NC}"
}

load_aws_config() {
	local environment="$1"

	# Map short environment names to full folder names
	case "${environment}" in
	dev)
		environment="development"
		;;
	prod | production)
		environment="production"
		;;
	staging)
		environment="staging"
		;;
	esac

	# Get project root (assuming we're in scripts/lib or scripts directory)
	local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
	local project_root="$(cd "${script_dir}/../.." && pwd)"
	local terraform_dir="${project_root}/infrastructure/environments/${environment}"
	local default_bucket="riddle-rush-pwa-${environment}"
	local default_region="eu-central-1"

	# Prefer terraform-outputs.json as it's the direct source of truth
	# This file is generated by Terraform and contains the exact values
	local outputs_json="${terraform_dir}/terraform-outputs.json"
	if [[ -f "${outputs_json}" ]] && [[ -s "${outputs_json}" ]]; then
		echo -e "${BLUE}Loading from terraform-outputs.json (source of truth)...${NC}"

		# Try to use jq if available (most reliable)
		if command -v jq &>/dev/null; then
			export AWS_S3_BUCKET=$(jq -r '.bucket_name.value // empty' "${outputs_json}" 2>/dev/null || echo "")
			export AWS_CLOUDFRONT_ID=$(jq -r '.cloudfront_distribution_id.value // empty' "${outputs_json}" 2>/dev/null || echo "")
			# aws_region might not be in outputs, try to extract from deploy_command or use default
			export AWS_REGION=$(jq -r '.aws_region.value // empty' "${outputs_json}" 2>/dev/null || echo "")
			if [[ -z "${AWS_REGION}" ]]; then
				# Try to extract from deploy_command output if available
				local deploy_cmd=$(jq -r '.deploy_command.value // empty' "${outputs_json}" 2>/dev/null || echo "")
				if [[ -n "${deploy_cmd}" ]]; then
					export AWS_REGION=$(echo "${deploy_cmd}" | grep -o 'AWS_REGION=[^ ]*' | cut -d'=' -f2 || echo "")
				fi
			fi
		else
			# Fallback: use grep/sed to extract values (less reliable but works without jq)
			export AWS_S3_BUCKET=$(grep -o '"bucket_name"[^}]*"value"[^"]*"[^"]*"' "${outputs_json}" | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p' | head -1)
			export AWS_CLOUDFRONT_ID=$(grep -o '"cloudfront_distribution_id"[^}]*"value"[^"]*"[^"]*"' "${outputs_json}" | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p' | head -1)
			# Try to extract region from deploy_command
			local deploy_cmd=$(grep -o '"deploy_command"[^}]*"value"[^"]*"[^"]*"' "${outputs_json}" | sed -n 's/.*"value"[^"]*"\([^"]*\)".*/\1/p' | head -1)
			if [[ -n "${deploy_cmd}" ]]; then
				export AWS_REGION=$(echo "${deploy_cmd}" | grep -o 'AWS_REGION=[^ ]*' | cut -d'=' -f2 || echo "")
			fi
		fi

		echo -e "${GREEN}✓ Loaded from terraform-outputs.json${NC}"
	else
		# Fallback to .env.terraform file if JSON doesn't exist
		local env_file="${terraform_dir}/.env.terraform"
		if [[ -f "${env_file}" ]] && [[ -s "${env_file}" ]]; then
			echo -e "${BLUE}Loading from .env.terraform file...${NC}"
			source "${env_file}"
			echo -e "${GREEN}✓ Loaded from .env.terraform${NC}"
		else
			# Final fallback to Terraform outputs if neither file exists
			if [[ -d "${terraform_dir}" ]]; then
				load_terraform_outputs "${terraform_dir}"
			fi
		fi
	fi

	# Set defaults if not provided
	export AWS_S3_BUCKET="${AWS_S3_BUCKET:-${default_bucket}}"
	export AWS_REGION="${AWS_REGION:-${default_region}}"
	export AWS_CLOUDFRONT_ID="${AWS_CLOUDFRONT_ID-}"

	# Validate required outputs
	if [[ -z "${AWS_S3_BUCKET}" ]]; then
		echo -e "${RED}❌ Error: AWS_S3_BUCKET is not set${NC}"
		echo -e "${RED}   Please ensure Terraform outputs are configured or set AWS_S3_BUCKET environment variable${NC}"
		exit 1
	fi

	if [[ -z "${AWS_REGION}" ]]; then
		echo -e "${RED}❌ Error: AWS_REGION is not set${NC}"
		echo -e "${RED}   Please ensure Terraform outputs are configured or set AWS_REGION environment variable${NC}"
		exit 1
	fi
}

# ===========================================
# Pre-deployment Checks
# ===========================================

run_pre_deployment_checks() {
	echo -e "\n🔍 Running pre-deployment checks..."
	echo ""

	echo -e "${BLUE}📦 Installing dependencies...${NC}"
	corepack enable
	corepack prepare pnpm@10.27.0 --activate
	pnpm install --frozen-lockfile

	echo -e "\n${BLUE}✅ Running linter...${NC}"
	pnpm run lint || {
		echo -e "${RED}❌ Lint failed${NC}"
		exit 1
	}

	echo -e "\n${BLUE}🔷 Running type check...${NC}"
	pnpm run typecheck || {
		echo -e "${RED}❌ Type check failed${NC}"
		exit 1
	}

	echo -e "\n${BLUE}🧪 Running unit tests...${NC}"
	pnpm run test:unit || {
		echo -e "${RED}❌ Tests failed${NC}"
		exit 1
	}

	echo -e "\n${GREEN}✓ All pre-deployment checks passed!${NC}"
}

# ===========================================
# Configuration Display
# ===========================================

display_deployment_config() {
	local environment="$1"
	local node_env="$2"
	local version="${3-}"

	echo -e "\n${BLUE}Deployment Configuration:${NC}"
	echo -e "  ${BLUE}Environment:${NC} ${environment}"
	echo -e "  ${BLUE}NODE_ENV:${NC} ${node_env}"
	echo -e "  ${BLUE}S3 Bucket:${NC} ${GREEN}${AWS_S3_BUCKET}${NC}"
	echo -e "  ${BLUE}Region:${NC} ${GREEN}${AWS_REGION}${NC}"

	if [[ -n "${AWS_CLOUDFRONT_ID}" ]]; then
		echo -e "  ${BLUE}CloudFront ID:${NC} ${GREEN}${AWS_CLOUDFRONT_ID}${NC}"
	else
		if [[ "${environment}" = "production" ]]; then
			echo -e "  ${YELLOW}CloudFront ID:${NC} Not configured (recommended for production)"
		else
			echo -e "  ${YELLOW}CloudFront ID:${NC} Not configured (optional)"
		fi
	fi

	if [[ -n "${version}" ]]; then
		echo -e "  ${BLUE}Version:${NC} v${version}"
	fi
}

display_deployment_url() {
	local environment="$1"
	local env_capitalized=$(echo "${environment}" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')

	if [[ -n "${AWS_CLOUDFRONT_ID}" ]]; then
		local cf_domain=$(aws cloudfront get-distribution --id "${AWS_CLOUDFRONT_ID}" --query 'Distribution.DomainName' --output text 2>/dev/null || echo "")
		if [[ -n "${cf_domain}" ]]; then
			echo -e "\n${BLUE}🌐 ${env_capitalized} URL:${NC}"
			echo -e "  ${GREEN}https://${cf_domain}${NC}"
			echo "https://${cf_domain}"
			return
		fi
	fi

	local s3_url="http://${AWS_S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
	echo -e "\n${BLUE}🌐 ${env_capitalized} URL:${NC}"
	echo -e "  ${GREEN}${s3_url}${NC}"

	if [[ "${environment}" = "production" ]]; then
		echo -e "\n${YELLOW}⚠️  Note: Production should use CloudFront for HTTPS support${NC}"
	fi

	echo "${s3_url}"
}

# ===========================================
# Git Functions
# ===========================================

check_git_status() {
	if [[ -n "$(git status --porcelain)" ]]; then
		echo -e "${RED}❌ Error: Uncommitted changes detected!${NC}"
		echo -e "${RED}   Commit or stash changes before deploying.${NC}"
		git status --short
		exit 1
	fi
}

check_git_branch() {
	local allowed_branches="$1"
	local current_branch=$(git rev-parse --abbrev-ref HEAD)

	if [[ ! " ${allowed_branches} " =~ " ${current_branch} " ]]; then
		echo -e "${YELLOW}⚠️  Warning: You are ${n '$current_br}anch' branch${NC}"
		echo -e "${YELLOW}   Expected branches: ${allowed_branches}${NC}"
		read -p "Continue anyway? (y/N) " -n 1 -r
		echo
		if [[ ! ${REPLY} =~ ^[Yy]$ ]]; then
			exit 1
		fi
	fi
}

create_version_tag() {
	local version="$1"

	if [[ -z "${version}" ]]; then
		return 0
	fi

	echo -e "\n${BLUE}🏷️  Creating version t${g: v$ve}rsion${NC}"

	# Update package.json version
	pnpm version "${version}" --no-git-tag-version
	git add package.json pnpm-lock.yaml
	git commit -m "chore(release): v${version}"

	# Create annotated tag
	git tag -a "v${version}" -m "Release v${version}"

	echo -e "${GREEN}✓ Version tag created${NC}"
}

push_version_tag() {
	local version="$1"

	if [[ -z "${version}" ]]; then
		return 0
	fi

	echo -e "\n${BLUE}📤 Pushing version tag to remote...${NC}"
	git push origin "v${version}" || echo -e "${YELLOW}⚠️  Failed to push tag (may already exist)${NC}"
	echo -e "${GREEN}✓ Tag${v$versi}on pushed${NC}"
}
