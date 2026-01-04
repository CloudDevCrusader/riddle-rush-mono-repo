#!/usr/bin/env bash
# Get Terraform outputs for a given environment
# Usage: ./scripts/get-terraform-outputs.sh [development|prod] [output_name]

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

ENVIRONMENT="${1:-development}"
OUTPUT_NAME="${2:-}"

TERRAFORM_DIR="infrastructure/environments/${ENVIRONMENT}"

if [ ! -d "$TERRAFORM_DIR" ]; then
    die "Terraform directory not found: ${TERRAFORM_DIR}"
fi

cd "$TERRAFORM_DIR"
require_cmd terraform

if [ -z "$OUTPUT_NAME" ]; then
    # Return all outputs as JSON
    terraform output -json 2>/dev/null
else
    # Return specific output value
    terraform output -raw "$OUTPUT_NAME" 2>/dev/null
fi
