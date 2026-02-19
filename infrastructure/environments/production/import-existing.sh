#!/bin/bash

# Import all live production resources into fresh Terraform state
# This script backs up existing state, initializes fresh, and imports all resources.
#
# Usage: ./import-existing.sh
#
# Prerequisites:
#   - AWS credentials configured
#   - Terraform installed
#   - terraform.tfvars file created with correct values

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Production Infrastructure Import ===${NC}"
echo ""

# Check prerequisites
if ! command -v terraform &>/dev/null; then
	echo -e "${RED}ERROR: Terraform not found${NC}"
	exit 1
fi

if ! aws sts get-caller-identity &>/dev/null; then
	echo -e "${RED}ERROR: AWS credentials not configured${NC}"
	exit 1
fi

if [[ ! -f "terraform.tfvars" ]]; then
	echo -e "${RED}ERROR: terraform.tfvars not found. Copy terraform.tfvars.example and fill in values.${NC}"
	exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
echo -e "AWS Account: ${GREEN}${ACCOUNT_ID}${NC}"

# Step 1: Backup existing state
echo -e "\n${BLUE}Step 1: Backing up existing state...${NC}"
BACKUP_KEY="production/terraform.tfstate.backup-$(date +%Y%m%d-%H%M%S)"
if aws s3 cp s3://riddle-rush-terraform-state-prod/production/terraform.tfstate "s3://riddle-rush-terraform-state-prod/${BACKUP_KEY}" 2>/dev/null; then
	echo -e "${GREEN}Backed up to ${BACKUP_KEY}${NC}"
else
	echo -e "${YELLOW}No existing state to backup (or backup failed)${NC}"
fi

# Step 2: Clear stale state and initialize fresh
echo -e "\n${BLUE}Step 2: Initializing fresh state...${NC}"
rm -rf .terraform .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup
terraform init -reconfigure

# Step 3: Import resources
echo -e "\n${BLUE}Step 3: Importing resources...${NC}"

import_resource() {
	local address="$1"
	local id="$2"
	local description="$3"

	echo -e "  ${BLUE}Importing: ${description}${NC}"
	if terraform import "$address" "$id" 2>&1 | tail -1; then
		echo -e "  ${GREEN}OK${NC}"
	else
		echo -e "  ${RED}FAILED: ${address} <- ${id}${NC}"
		FAILURES+=("${address}")
	fi
}

FAILURES=()

# --- S3 Website Module ---
echo -e "\n${BLUE}--- S3 Website ---${NC}"
import_resource "module.s3_website.aws_s3_bucket.website" \
	"riddle-rush-pwa-production-${ACCOUNT_ID}" \
	"S3 bucket"

import_resource "module.s3_website.aws_s3_bucket_versioning.website" \
	"riddle-rush-pwa-production-${ACCOUNT_ID}" \
	"S3 versioning"

import_resource "module.s3_website.aws_s3_bucket_public_access_block.website" \
	"riddle-rush-pwa-production-${ACCOUNT_ID}" \
	"S3 public access block"

import_resource "module.s3_website.aws_s3_bucket_website_configuration.website" \
	"riddle-rush-pwa-production-${ACCOUNT_ID}" \
	"S3 website configuration"

import_resource "module.s3_website.aws_s3_bucket_lifecycle_configuration.website_default[0]" \
	"riddle-rush-pwa-production-${ACCOUNT_ID}" \
	"S3 lifecycle configuration"

import_resource "module.s3_website.aws_s3_bucket_accelerate_configuration.website[0]" \
	"riddle-rush-pwa-production-${ACCOUNT_ID}" \
	"S3 transfer acceleration"

# --- CloudFront Module ---
echo -e "\n${BLUE}--- CloudFront ---${NC}"
import_resource "module.cloudfront.aws_cloudfront_origin_access_control.website" \
	"E1JJ7FX31NAXC0" \
	"CloudFront OAC"

import_resource "module.cloudfront.aws_cloudfront_cache_policy.static_assets_aggressive" \
	"bd83ae7b-8cba-4864-8db1-fc8a3ddd5c12" \
	"CloudFront static assets cache policy"

import_resource "module.cloudfront.aws_cloudfront_cache_policy.html_edge_optimized" \
	"0c15739c-59cf-4092-89c4-f25e9b998994" \
	"CloudFront HTML cache policy"

import_resource "module.cloudfront.aws_cloudfront_distribution.website" \
	"E2BNQ588XTOCIA" \
	"CloudFront distribution"

import_resource "module.cloudfront.aws_s3_bucket_policy.website" \
	"riddle-rush-pwa-production-${ACCOUNT_ID}" \
	"S3 bucket policy (CloudFront OAC)"

# --- Route53 ---
echo -e "\n${BLUE}--- Route53 ---${NC}"
ZONE_ID="Z0322135309SFAP6GAEEZ"

import_resource "aws_route53_record.cloudfront_a[0]" \
	"${ZONE_ID}_riddlerush.de_A" \
	"Route53 A record"

import_resource "aws_route53_record.cloudfront_aaaa[0]" \
	"${ZONE_ID}_riddlerush.de_AAAA" \
	"Route53 AAAA record"

# --- WAF ---
echo -e "\n${BLUE}--- WAF (us-east-1) ---${NC}"
import_resource "aws_wafv2_web_acl.cloudfront" \
	"ed9c2ad5-72bc-491e-8d9b-72b8cab30e40/riddle-rush-pwa-production-waf/CLOUDFRONT" \
	"WAF Web ACL"

import_resource "aws_cloudwatch_log_group.waf" \
	"aws-waf-logs-riddle-rush-pwa-production" \
	"WAF CloudWatch log group"

import_resource "aws_wafv2_web_acl_logging_configuration.cloudfront" \
	"arn:aws:wafv2:us-east-1:${ACCOUNT_ID}:global/webacl/riddle-rush-pwa-production-waf/ed9c2ad5-72bc-491e-8d9b-72b8cab30e40" \
	"WAF logging configuration"

# --- Cognito ---
echo -e "\n${BLUE}--- Cognito ---${NC}"
import_resource "aws_cognito_user_pool.main" \
	"eu-central-1_9DkqHYOyu" \
	"Cognito User Pool"

import_resource "aws_cognito_user_pool_client.main" \
	"eu-central-1_9DkqHYOyu/6hhaeg59b7486flhabqg4m7ba0" \
	"Cognito User Pool Client"

import_resource "aws_cloudwatch_log_group.cognito" \
	"/aws/cognito/riddle-rush-pwa-production" \
	"Cognito CloudWatch log group"

# --- API Gateway ---
echo -e "\n${BLUE}--- API Gateway ---${NC}"
import_resource "aws_apigatewayv2_api.main" \
	"36gr3d65m6" \
	"API Gateway v2 HTTP API"

import_resource "aws_apigatewayv2_stage.main" \
	"36gr3d65m6/api" \
	"API Gateway stage"

import_resource "aws_cloudwatch_log_group.api_gateway" \
	"/aws/apigateway/riddle-rush-pwa-production" \
	"API Gateway CloudWatch log group"

# --- IAM ---
echo -e "\n${BLUE}--- IAM ---${NC}"
import_resource "aws_iam_role.lambda" \
	"riddle-rush-pwa-production-lambda-role" \
	"Lambda IAM role"

import_resource "aws_iam_role_policy_attachment.lambda_basic" \
	"riddle-rush-pwa-production-lambda-role/arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" \
	"Lambda IAM policy attachment"

import_resource "aws_cloudwatch_log_group.lambda" \
	"/aws/lambda/riddle-rush-pwa-production-nuxt" \
	"Lambda CloudWatch log group"

# --- Monitoring ---
echo -e "\n${BLUE}--- Monitoring ---${NC}"
import_resource "aws_sns_topic.alerts" \
	"arn:aws:sns:eu-central-1:${ACCOUNT_ID}:riddle-rush-pwa-production-alerts" \
	"SNS alerts topic"

import_resource "aws_cloudwatch_log_group.cloudfront" \
	"/aws/cloudfront/riddle-rush-pwa-production" \
	"CloudFront CloudWatch log group"

import_resource "aws_cloudwatch_dashboard.main" \
	"riddle-rush-pwa-production-dashboard" \
	"CloudWatch dashboard"

import_resource "aws_cloudwatch_metric_alarm.cloudfront_4xx" \
	"riddle-rush-pwa-production-cloudfront-4xx" \
	"CloudWatch 4xx alarm"

import_resource "aws_cloudwatch_metric_alarm.cloudfront_5xx" \
	"riddle-rush-pwa-production-cloudfront-5xx" \
	"CloudWatch 5xx alarm"

# Step 4: Summary
echo -e "\n${BLUE}=== Import Summary ===${NC}"
if [[ ${#FAILURES[@]} -eq 0 ]]; then
	echo -e "${GREEN}All resources imported successfully!${NC}"
else
	echo -e "${RED}Failed imports (${#FAILURES[@]}):${NC}"
	for f in "${FAILURES[@]}"; do
		echo -e "  ${RED}- ${f}${NC}"
	done
fi

# Step 5: Run plan to verify
echo -e "\n${BLUE}Step 4: Running terraform plan to verify...${NC}"
echo -e "${YELLOW}Review the plan carefully. Ideally it should show no changes.${NC}"
echo ""
terraform plan -out=plan.tfplan

echo -e "\n${GREEN}=== Import Complete ===${NC}"
echo -e "Review the plan above. If everything looks correct:"
echo -e "  ${BLUE}terraform apply plan.tfplan${NC}"
echo ""
echo -e "If there are unexpected changes, do NOT apply."
echo -e "Instead, adjust main.tf to match the existing infrastructure."
