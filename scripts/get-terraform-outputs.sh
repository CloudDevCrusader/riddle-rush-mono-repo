#!/bin/bash
# Get Terraform outputs for a given environment
# Usage: ./scripts/get-terraform-outputs.sh [development|prod] [output_name]

set -e

ENVIRONMENT="${1:-development}"
OUTPUT_NAME="${2:-}"

TERRAFORM_DIR="infrastructure/environments/${ENVIRONMENT}"

if [ ! -d "$TERRAFORM_DIR" ]; then
    echo "Error: Terraform directory not found: $TERRAFORM_DIR" >&2
    exit 1
fi

cd "$TERRAFORM_DIR" || exit 1

if [ -z "$OUTPUT_NAME" ]; then
    # Return all outputs as JSON
    terraform output -json 2>/dev/null
else
    # Return specific output value
    terraform output -raw "$OUTPUT_NAME" 2>/dev/null
fi
