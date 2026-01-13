#!/bin/bash

# Upload Terraform outputs JSON files to an S3 bucket.
# Usage: ./scripts/upload-terraform-outputs.sh [development] [production]

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

OUTPUTS_BUCKET_REGION="${OUTPUTS_BUCKET_REGION:-${AWS_REGION:-eu-central-1}}"
OUTPUTS_BUCKET="${OUTPUTS_BUCKET:-}"

if [[ -z "${OUTPUTS_BUCKET}" ]]; then
	outputs_bucket_dir="${repo_root}/infrastructure/outputs-bucket"
	if [[ -d "${outputs_bucket_dir}" ]]; then
		OUTPUTS_BUCKET="$(terraform -chdir="${outputs_bucket_dir}" output -raw bucket_name 2>/dev/null || true)"
	fi
fi

if [[ -z "${OUTPUTS_BUCKET}" ]]; then
	echo "❌ Outputs bucket not set."
	echo "   Set OUTPUTS_BUCKET or run terraform apply in infrastructure/outputs-bucket."
	exit 1
fi

environments=("$@")
if [[ "${#environments[@]}" -eq 0 ]]; then
	environments=("development" "production")
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

for env in "${environments[@]}"; do
	tf_dir="${repo_root}/infrastructure/environments/${env}"
	if [[ ! -d "${tf_dir}" ]]; then
		echo "❌ Unknown environment: ${env}"
		exit 1
	fi

	output_file="${tmp_dir}/terraform-outputs-${env}.json"
	terraform -chdir="${tf_dir}" output -json > "${output_file}"
	aws s3 cp "${output_file}" "s3://${OUTPUTS_BUCKET}/terraform-outputs-${env}.json" --region "${OUTPUTS_BUCKET_REGION}"
done

echo "✅ Uploaded Terraform outputs to s3://${OUTPUTS_BUCKET} (region: ${OUTPUTS_BUCKET_REGION})."
