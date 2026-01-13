#!/bin/bash
set -euo pipefail

ENVIRONMENT="${1:-development}"

case "${ENVIRONMENT}" in
dev)
	ENVIRONMENT="development"
	;;
prod)
	ENVIRONMENT="production"
	;;
esac

if ! command -v aws &>/dev/null; then
	echo "aws CLI is required. Install from https://aws.amazon.com/cli/"
	exit 1
fi

OAC_NAME="${ENVIRONMENT}-oac-enhanced"
CACHE_POLICY_NAMES=(
	"${ENVIRONMENT}-static-assets-aggressive"
	"${ENVIRONMENT}-html-edge-optimized"
)

echo "Cleaning CloudFront leftovers for environment: ${ENVIRONMENT}"

OAC_ID=$(aws cloudfront list-origin-access-controls \
	--query "OriginAccessControlList.Items[?Name=='${OAC_NAME}'].Id | [0]" \
	--output text 2>/dev/null || echo "")

if [[ -n "${OAC_ID}" && "${OAC_ID}" != "None" ]]; then
	OAC_ETAG=$(aws cloudfront get-origin-access-control \
		--id "${OAC_ID}" \
		--query "ETag" \
		--output text)
	if aws cloudfront delete-origin-access-control --id "${OAC_ID}" --if-match "${OAC_ETAG}"; then
		echo "Deleted OAC: ${OAC_NAME} (${OAC_ID})"
	else
		echo "Failed to delete OAC: ${OAC_NAME} (${OAC_ID}). It may still be in use."
	fi
else
	echo "No OAC found with name: ${OAC_NAME}"
fi

for policy_name in "${CACHE_POLICY_NAMES[@]}"; do
	POLICY_ID=$(aws cloudfront list-cache-policies --type custom \
		--query "CachePolicyList.Items[?CachePolicy.CachePolicyConfig.Name=='${policy_name}'].CachePolicy.Id | [0]" \
		--output text 2>/dev/null || echo "")

	if [[ -n "${POLICY_ID}" && "${POLICY_ID}" != "None" ]]; then
		POLICY_ETAG=$(aws cloudfront get-cache-policy \
			--id "${POLICY_ID}" \
			--query "ETag" \
			--output text)
		if aws cloudfront delete-cache-policy --id "${POLICY_ID}" --if-match "${POLICY_ETAG}"; then
			echo "Deleted cache policy: ${policy_name} (${POLICY_ID})"
		else
			echo "Failed to delete cache policy: ${policy_name} (${POLICY_ID}). It may still be in use."
		fi
	else
		echo "No cache policy found with name: ${policy_name}"
	fi
done
