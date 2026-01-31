#!/bin/bash
# ===========================================
# Load Infrastructure Variables from .env
# ===========================================
# Lightweight alternative to get-terraform-outputs.sh that reads
# from the .env file instead of requiring Terraform to be initialized.
#
# Usage:
#   source ./scripts/load-infra-env.sh              # Load and display
#   source ./scripts/load-infra-env.sh --quiet       # Load without output
#   source ./scripts/load-infra-env.sh --validate    # Load and validate AWS access
#   source ./scripts/load-infra-env.sh --sync        # Sync from Terraform state into .env
#   source ./scripts/load-infra-env.sh --import dev  # Import existing AWS resources into Terraform
#   source ./scripts/load-infra-env.sh --import prod # Import existing AWS resources into Terraform
#
# After sourcing, all AWS_* variables are exported to your shell.

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

# Resolve project root (git root takes priority, fallback to script location)
if git rev-parse --show-toplevel &>/dev/null; then
	PROJECT_ROOT="$(git rev-parse --show-toplevel)"
else
	SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
	PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi
ENV_FILE="${PROJECT_ROOT}/.env"

# Parse arguments
QUIET=false
VALIDATE=false
SYNC=false
IMPORT=false
IMPORT_ENV=""
for arg in "$@"; do
	case "${arg}" in
	--quiet | -q)
		QUIET=true
		;;
	--validate | -v)
		VALIDATE=true
		;;
	--sync | -s)
		SYNC=true
		;;
	--import | -i)
		IMPORT=true
		;;
	dev | development)
		IMPORT_ENV="development"
		;;
	prod | production)
		IMPORT_ENV="production"
		;;
	--help | -h)
		echo "Usage: source ./scripts/load-infra-env.sh [OPTIONS] [ENVIRONMENT]"
		echo ""
		echo "Options:"
		echo "  --quiet, -q       Load without printing output"
		echo "  --validate, -v    Validate AWS credentials after loading"
		echo "  --sync, -s        Sync values from Terraform state into .env"
		echo "  --import, -i      Import existing AWS resources into Terraform state"
		echo "  --help, -h        Show this help message"
		echo ""
		echo "Environments (for --import and --sync):"
		echo "  dev, development  Development environment"
		echo "  prod, production  Production environment"
		echo ""
		echo "Examples:"
		echo "  source ./scripts/load-infra-env.sh --import dev   # Import dev resources"
		echo "  source ./scripts/load-infra-env.sh --import prod  # Import prod resources"
		echo "  source ./scripts/load-infra-env.sh --validate     # Load and validate"
		echo ""
		echo "Exported variables:"
		echo "  AWS_REGION              AWS region"
		echo "  AWS_PROFILE             AWS CLI profile"
		echo "  AWS_S3_BUCKET           S3 bucket name"
		echo "  AWS_CLOUDFRONT_ID       CloudFront distribution ID"
		echo "  AWS_CLOUDFRONT_DOMAIN   CloudFront domain name"
		echo "  AWS_ROUTE53_ZONE_ID     Route53 hosted zone ID"
		echo "  AWS_ROUTE53_DOMAIN      Route53 domain name"
		echo "  AWS_WEBSITE_URL         Website URL"
		echo "  AWS_S3_WEBSITE_URL      S3 website endpoint URL"
		echo "  AWS_CERTIFICATE_ARN     ACM certificate ARN"
		return 0 2>/dev/null || exit 0
		;;
	esac
done

# ---------- Load from .env ----------
if [[ ! -f "${ENV_FILE}" ]]; then
	echo -e "${RED}.env file not found at ${ENV_FILE}${NC}"
	echo -e "${YELLOW}Copy from .env.example: cp .env.example .env${NC}"
	return 1 2>/dev/null || exit 1
fi

# Extract and export AWS infrastructure variables from .env
# Strips inline comments (e.g., "value # comment" -> "value")
while IFS='=' read -r key value; do
	# Skip comments and empty lines
	[[ -z "${key}" || "${key}" =~ ^[[:space:]]*# ]] && continue

	# Only process AWS_* variables
	key=$(echo "${key}" | xargs) # trim whitespace
	[[ "${key}" != AWS_* ]] && continue

	# Strip inline comments and trim
	value=$(echo "${value}" | sed 's/ *#.*//' | xargs)

	# Export if non-empty
	if [[ -n "${value}" ]]; then
		export "${key}=${value}"
	fi
done <"${ENV_FILE}"

# ---------- Sync from Terraform ----------
if [[ "${SYNC}" == true ]]; then
	# Detect environment from arg or .env bucket name
	if [[ -z "${IMPORT_ENV}" ]]; then
		if [[ "${AWS_S3_BUCKET}" == *"development"* ]]; then
			IMPORT_ENV="development"
		elif [[ "${AWS_S3_BUCKET}" == *"staging"* ]]; then
			IMPORT_ENV="staging"
		else
			IMPORT_ENV="production"
		fi
	fi

	TF_DIR="${PROJECT_ROOT}/infrastructure/environments/${IMPORT_ENV}"

	if [[ ! -d "${TF_DIR}/.terraform" ]]; then
		echo -e "${RED}Terraform not initialized for ${IMPORT_ENV}. Run 'terraform init' in ${TF_DIR} first.${NC}"
		return 1 2>/dev/null || exit 1
	fi

	echo -e "${BLUE}Syncing from Terraform state (${IMPORT_ENV})...${NC}"
	pushd "${TF_DIR}" >/dev/null

	# Read values from Terraform
	TF_BUCKET=$(terraform output -raw bucket_name 2>/dev/null || echo "")
	TF_CF_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
	TF_CF_DOMAIN=$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo "")
	TF_CF_ZONE=$(terraform output -raw cloudfront_hosted_zone_id 2>/dev/null || echo "")
	TF_WEBSITE_URL=$(terraform output -raw website_url 2>/dev/null || echo "")

	popd >/dev/null

	# Update .env file with Terraform values
	update_env_value() {
		local key="$1"
		local value="$2"
		if [[ -n "${value}" ]]; then
			if grep -q "^${key}=" "${ENV_FILE}"; then
				sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
			fi
		fi
	}

	update_env_value "AWS_S3_BUCKET" "${TF_BUCKET}"
	update_env_value "AWS_CLOUDFRONT_ID" "${TF_CF_ID}"
	update_env_value "AWS_CLOUDFRONT_DOMAIN" "${TF_CF_DOMAIN}"
	update_env_value "AWS_WEBSITE_URL" "${TF_WEBSITE_URL}"

	echo -e "${GREEN}Updated .env with Terraform values from ${IMPORT_ENV}${NC}"
fi

# ---------- Import existing AWS resources ----------
if [[ "${IMPORT}" == true ]]; then
	if [[ -z "${IMPORT_ENV}" ]]; then
		echo -e "${RED}Environment required. Usage: source ./scripts/load-infra-env.sh --import dev|prod${NC}"
		return 1 2>/dev/null || exit 1
	fi

	TF_DIR="${PROJECT_ROOT}/infrastructure/environments/${IMPORT_ENV}"

	if [[ ! -d "${TF_DIR}" ]]; then
		echo -e "${RED}Terraform directory not found: ${TF_DIR}${NC}"
		return 1 2>/dev/null || exit 1
	fi

	# Validate required env vars
	if [[ -z "${AWS_S3_BUCKET}" ]]; then
		echo -e "${RED}AWS_S3_BUCKET not set in .env${NC}"
		return 1 2>/dev/null || exit 1
	fi
	if [[ -z "${AWS_CLOUDFRONT_ID}" ]]; then
		echo -e "${RED}AWS_CLOUDFRONT_ID not set in .env${NC}"
		return 1 2>/dev/null || exit 1
	fi

	PROFILE_FLAG=""
	if [[ -n "${AWS_PROFILE}" ]]; then
		PROFILE_FLAG="--profile ${AWS_PROFILE}"
	fi

	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
	echo -e "${BLUE}Importing AWS resources into Terraform (${IMPORT_ENV})${NC}"
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
	echo -e "  S3 Bucket:     ${GREEN}${AWS_S3_BUCKET}${NC}"
	echo -e "  CloudFront ID: ${GREEN}${AWS_CLOUDFRONT_ID}${NC}"
	echo ""

	# --- Step 1: Initialize Terraform ---
	echo -e "${BLUE}[1/5] Initializing Terraform...${NC}"
	ORIG_DIR="$(pwd)"
	cd "${TF_DIR}"

	if ! terraform init -input=false >/dev/null 2>&1; then
		echo -e "${RED}Terraform init failed${NC}"
		cd "${ORIG_DIR}"
		return 1 2>/dev/null || exit 1
	fi
	echo -e "  ${GREEN}Done${NC}"
	echo ""

	# --- Step 2: Look up resource IDs from AWS ---
	echo -e "${BLUE}[2/5] Looking up resource IDs from AWS...${NC}"

	# Build AWS CLI args array for consistent usage
	AWS_ARGS=()
	if [[ -n "${AWS_PROFILE}" ]]; then
		AWS_ARGS+=(--profile "${AWS_PROFILE}")
	fi
	if [[ -n "${AWS_REGION}" ]]; then
		AWS_ARGS+=(--region "${AWS_REGION}")
	fi

	# OAC ID from CloudFront distribution
	OAC_ID=$(aws cloudfront get-distribution --id "${AWS_CLOUDFRONT_ID}" "${AWS_ARGS[@]}" \
		--query 'Distribution.DistributionConfig.Origins.Items[0].OriginAccessControlId' --output text 2>/dev/null)
	if [[ -n "${OAC_ID}" && "${OAC_ID}" != "None" ]]; then
		echo -e "  OAC ID:        ${GREEN}${OAC_ID}${NC}"
	else
		echo -e "  OAC ID:        ${YELLOW}not found (will skip)${NC}"
		OAC_ID=""
	fi

	# ACM Certificate ARN from CloudFront
	CERT_ARN=$(aws cloudfront get-distribution --id "${AWS_CLOUDFRONT_ID}" "${AWS_ARGS[@]}" \
		--query 'Distribution.DistributionConfig.ViewerCertificate.ACMCertificateArn' --output text 2>/dev/null)
	if [[ -n "${CERT_ARN}" && "${CERT_ARN}" != "None" ]]; then
		echo -e "  Certificate:   ${GREEN}${CERT_ARN}${NC}"
	else
		CERT_ARN=""
	fi

	# Custom cache policies for this environment
	STATIC_CACHE_ID=$(aws cloudfront list-cache-policies "${AWS_ARGS[@]}" --type custom \
		--query "CachePolicyList.Items[?CachePolicy.CachePolicyConfig.Name=='${IMPORT_ENV}-static-assets-aggressive'].CachePolicy.Id" \
		--output text 2>/dev/null)
	if [[ -n "${STATIC_CACHE_ID}" && "${STATIC_CACHE_ID}" != "None" ]]; then
		echo -e "  Static Cache:  ${GREEN}${STATIC_CACHE_ID}${NC}"
	else
		echo -e "  Static Cache:  ${YELLOW}not found (will skip)${NC}"
		STATIC_CACHE_ID=""
	fi

	HTML_CACHE_ID=$(aws cloudfront list-cache-policies "${AWS_ARGS[@]}" --type custom \
		--query "CachePolicyList.Items[?CachePolicy.CachePolicyConfig.Name=='${IMPORT_ENV}-html-edge-optimized'].CachePolicy.Id" \
		--output text 2>/dev/null)
	if [[ -n "${HTML_CACHE_ID}" && "${HTML_CACHE_ID}" != "None" ]]; then
		echo -e "  HTML Cache:    ${GREEN}${HTML_CACHE_ID}${NC}"
	else
		echo -e "  HTML Cache:    ${YELLOW}not found (will skip)${NC}"
		HTML_CACHE_ID=""
	fi

	# Route53 zone ID
	R53_ZONE_ID=$(aws route53 list-hosted-zones "${AWS_ARGS[@]}" \
		--query 'HostedZones[?Name==`riddlerush.de.`].Id' --output text 2>/dev/null | sed 's|/hostedzone/||')
	if [[ -n "${R53_ZONE_ID}" && "${R53_ZONE_ID}" != "None" ]]; then
		echo -e "  Route53 Zone:  ${GREEN}${R53_ZONE_ID}${NC}"
	else
		echo -e "  Route53 Zone:  ${YELLOW}not found (will skip DNS)${NC}"
		R53_ZONE_ID=""
	fi

	# Determine domain for DNS records
	if [[ "${IMPORT_ENV}" == "development" ]]; then
		DOMAIN_NAME="dev.riddlerush.de"
	elif [[ "${IMPORT_ENV}" == "production" ]]; then
		DOMAIN_NAME="riddlerush.de"
	else
		DOMAIN_NAME=""
	fi
	echo ""

	# --- Step 3: Generate terraform.tfvars ---
	echo -e "${BLUE}[3/5] Generating terraform.tfvars...${NC}"
	{
		echo "bucket_name     = \"${AWS_S3_BUCKET}\""
		if [[ -n "${DOMAIN_NAME}" ]]; then
			echo "domain_names    = [\"${DOMAIN_NAME}\"]"
		fi
		if [[ -n "${CERT_ARN}" ]]; then
			echo "certificate_arn = \"${CERT_ARN}\""
		fi
	} >terraform.tfvars
	echo -e "  ${GREEN}Written terraform.tfvars${NC}"
	echo ""

	# --- Step 4: Import resources ---
	echo -e "${BLUE}[4/5] Importing resources...${NC}"

	IMPORT_COUNT=0
	IMPORT_ERRORS=0

	import_resource() {
		local address="$1"
		local id="$2"
		local label="$3"

		if [[ -z "${id}" ]]; then
			echo -e "  ${DIM}SKIP ${label} (no ID)${NC}"
			return
		fi

		# Check if already in state
		if terraform state show "${address}" &>/dev/null; then
			echo -e "  ${DIM}EXISTS ${label}${NC}"
			return
		fi

		if terraform import "${address}" "${id}" &>/dev/null; then
			echo -e "  ${GREEN}✓${NC} ${label}"
			((IMPORT_COUNT++))
		else
			echo -e "  ${RED}✗${NC} ${label} (${id})"
			((IMPORT_ERRORS++))
		fi
	}

	echo -e "\n  ${BLUE}S3 Module${NC}"
	import_resource "module.s3_website.aws_s3_bucket.website" \
		"${AWS_S3_BUCKET}" "S3 Bucket"
	import_resource "module.s3_website.aws_s3_bucket_versioning.website[0]" \
		"${AWS_S3_BUCKET}" "S3 Versioning"
	import_resource "module.s3_website.aws_s3_bucket_lifecycle_configuration.website" \
		"${AWS_S3_BUCKET}" "S3 Lifecycle"
	import_resource "module.s3_website.aws_s3_bucket_public_access_block.website" \
		"${AWS_S3_BUCKET}" "S3 Public Access Block"
	import_resource "module.s3_website.aws_s3_bucket_website_configuration.website" \
		"${AWS_S3_BUCKET}" "S3 Website Config"

	# S3 Transfer Acceleration (production only)
	if [[ "${IMPORT_ENV}" == "production" ]]; then
		import_resource "module.s3_website.aws_s3_bucket_accelerate_configuration.website[0]" \
			"${AWS_S3_BUCKET}" "S3 Transfer Acceleration"
	fi

	echo -e "\n  ${BLUE}CloudFront Module${NC}"
	import_resource "module.cloudfront.aws_cloudfront_distribution.website" \
		"${AWS_CLOUDFRONT_ID}" "CloudFront Distribution"
	import_resource "module.cloudfront.aws_cloudfront_origin_access_control.website" \
		"${OAC_ID}" "CloudFront OAC"
	import_resource "module.cloudfront.aws_cloudfront_cache_policy.static_assets_aggressive" \
		"${STATIC_CACHE_ID}" "Cache Policy (Static Assets)"
	import_resource "module.cloudfront.aws_cloudfront_cache_policy.html_edge_optimized" \
		"${HTML_CACHE_ID}" "Cache Policy (HTML)"
	import_resource "module.cloudfront.aws_s3_bucket_policy.website" \
		"${AWS_S3_BUCKET}" "S3 Bucket Policy (CloudFront)"

	echo -e "\n  ${BLUE}Route53 Records${NC}"
	if [[ -n "${R53_ZONE_ID}" && -n "${DOMAIN_NAME}" ]]; then
		import_resource "aws_route53_record.cloudfront_a[0]" \
			"${R53_ZONE_ID}_${DOMAIN_NAME}_A" "Route53 A Record (${DOMAIN_NAME})"
		import_resource "aws_route53_record.cloudfront_aaaa[0]" \
			"${R53_ZONE_ID}_${DOMAIN_NAME}_AAAA" "Route53 AAAA Record (${DOMAIN_NAME})"
	else
		echo -e "  ${DIM}SKIP DNS records (no zone or domain)${NC}"
	fi

	# Vercel preview record (development only)
	if [[ "${IMPORT_ENV}" == "development" && -n "${R53_ZONE_ID}" ]]; then
		# Check if record exists in AWS
		PREVIEW_EXISTS=$(aws route53 list-resource-record-sets --hosted-zone-id "${R53_ZONE_ID}" "${AWS_ARGS[@]}" \
			--query "ResourceRecordSets[?Name=='preview.riddlerush.de.' && Type=='CNAME']" --output text 2>/dev/null)
		if [[ -n "${PREVIEW_EXISTS}" && "${PREVIEW_EXISTS}" != "None" ]]; then
			import_resource "aws_route53_record.vercel_preview" \
				"${R53_ZONE_ID}_preview.riddlerush.de_CNAME" "Route53 CNAME (preview.riddlerush.de)"
		fi
	fi

	echo ""

	# --- Step 5: Verify ---
	echo -e "${BLUE}[5/5] Running terraform plan to verify...${NC}"
	echo ""
	terraform plan -detailed-exitcode 2>&1 | tail -5
	PLAN_EXIT=${PIPESTATUS[0]}

	echo ""
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
	echo -e "  Imported: ${GREEN}${IMPORT_COUNT}${NC} resources"
	if [[ ${IMPORT_ERRORS} -gt 0 ]]; then
		echo -e "  Errors:   ${RED}${IMPORT_ERRORS}${NC}"
	fi
	if [[ ${PLAN_EXIT} -eq 0 ]]; then
		echo -e "  State:    ${GREEN}No changes needed — perfectly in sync!${NC}"
	elif [[ ${PLAN_EXIT} -eq 2 ]]; then
		echo -e "  State:    ${YELLOW}Drift detected — review 'terraform plan' output above${NC}"
		echo -e "  ${DIM}Run 'terraform apply' to align AWS with your .tf files${NC}"
	else
		echo -e "  State:    ${RED}Plan failed — check errors above${NC}"
	fi
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

	cd "${ORIG_DIR}"
fi

# ---------- Display ----------
if [[ "${QUIET}" != true && "${IMPORT}" != true ]]; then
	echo -e "${BLUE}AWS Infrastructure Variables${NC}"
	echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

	print_var() {
		local label="$1"
		local value="$2"
		if [[ -n "${value}" ]]; then
			echo -e "  ${GREEN}${label}${NC}=${value}"
		else
			echo -e "  ${DIM}${label}${NC}=${DIM}(not set)${NC}"
		fi
	}

	echo -e "\n ${BLUE}Core${NC}"
	print_var "AWS_REGION" "${AWS_REGION}"
	print_var "AWS_PROFILE" "${AWS_PROFILE}"

	echo -e "\n ${BLUE}S3${NC}"
	print_var "AWS_S3_BUCKET" "${AWS_S3_BUCKET}"
	print_var "AWS_S3_WEBSITE_URL" "${AWS_S3_WEBSITE_URL}"

	echo -e "\n ${BLUE}CloudFront${NC}"
	print_var "AWS_CLOUDFRONT_ID" "${AWS_CLOUDFRONT_ID}"
	print_var "AWS_CLOUDFRONT_DOMAIN" "${AWS_CLOUDFRONT_DOMAIN}"

	echo -e "\n ${BLUE}Route53${NC}"
	print_var "AWS_ROUTE53_ZONE_ID" "${AWS_ROUTE53_ZONE_ID}"
	print_var "AWS_ROUTE53_DOMAIN" "${AWS_ROUTE53_DOMAIN}"

	echo -e "\n ${BLUE}Website${NC}"
	print_var "AWS_WEBSITE_URL" "${AWS_WEBSITE_URL}"
	print_var "AWS_CERTIFICATE_ARN" "${AWS_CERTIFICATE_ARN}"

	echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

# ---------- Validate ----------
if [[ "${VALIDATE}" == true ]]; then
	echo -e "\n${BLUE}Validating AWS access...${NC}"

	if ! command -v aws &>/dev/null; then
		echo -e "${RED}AWS CLI not installed${NC}"
		return 1 2>/dev/null || exit 1
	fi

	PROFILE_FLAG=""
	if [[ -n "${AWS_PROFILE}" ]]; then
		PROFILE_FLAG="--profile ${AWS_PROFILE}"
	fi

	# Check credentials
	if CALLER=$(aws sts get-caller-identity ${PROFILE_FLAG} 2>/dev/null); then
		ACCOUNT=$(echo "${CALLER}" | grep -o '"Account"[^,]*' | cut -d'"' -f4)
		ARN=$(echo "${CALLER}" | grep -o '"Arn"[^,]*' | cut -d'"' -f4)
		echo -e "  ${GREEN}Account:${NC} ${ACCOUNT}"
		echo -e "  ${GREEN}Identity:${NC} ${ARN}"
	else
		echo -e "  ${RED}Failed to validate AWS credentials${NC}"
		return 1 2>/dev/null || exit 1
	fi

	# Check S3 bucket access
	if [[ -n "${AWS_S3_BUCKET}" ]]; then
		if aws s3 ls "s3://${AWS_S3_BUCKET}" ${PROFILE_FLAG} &>/dev/null; then
			echo -e "  ${GREEN}S3 bucket:${NC} accessible"
		else
			echo -e "  ${YELLOW}S3 bucket:${NC} not accessible (may not exist yet)"
		fi
	fi

	# Check CloudFront
	if [[ -n "${AWS_CLOUDFRONT_ID}" ]]; then
		if CF_STATUS=$(aws cloudfront get-distribution --id "${AWS_CLOUDFRONT_ID}" ${PROFILE_FLAG} --query 'Distribution.Status' --output text 2>/dev/null); then
			echo -e "  ${GREEN}CloudFront:${NC} ${CF_STATUS}"
		else
			echo -e "  ${YELLOW}CloudFront:${NC} not accessible"
		fi
	fi

	echo -e "\n${GREEN}Validation complete${NC}"
fi
