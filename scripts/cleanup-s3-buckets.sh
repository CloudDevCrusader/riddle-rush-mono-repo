#!/bin/bash
# ===========================================
# S3 Bucket Cleanup Script
# ===========================================
# Safely removes unnecessary S3 buckets

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKETS_TO_REMOVE=(
  "riddle-rush-pwa"                          # Legacy production bucket
  "riddle-rush-pwa-lambda-deployments-XXXXXXXXXXXX"  # Empty lambda deployments bucket
)

# Check if AWS CLI is available
check_aws_cli() {
    if ! command -v aws &>/dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
        exit 1
    fi
}

# Check AWS credentials
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

# Check if bucket exists
bucket_exists() {
    local bucket="$1"
    if aws s3api head-bucket --bucket "$bucket" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# List bucket contents
list_bucket_contents() {
    local bucket="$1"
    echo -e "\n${BLUE}📋 Contents of ${bucket}:${NC}"
    
    # Count objects
    local object_count=$(aws s3api list-objects --bucket "$bucket" --query "length(Contents[])" --output text 2>/dev/null || echo "0")
    
    if [[ "$object_count" -eq "0" ]]; then
        echo -e "  ${YELLOW}⚠️  Bucket is empty${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Bucket contains ${object_count} objects${NC}"
        echo -e "  First 5 objects:"
        aws s3api list-objects --bucket "$bucket" --max-items 5 --query "Contents[].Key" --output text 2>/dev/null | while read -r key; do
            echo -e "    - ${key}"
        done
    fi
}

# Empty bucket
empty_bucket() {
    local bucket="$1"
    echo -e "\n${BLUE}🧹 Emptying bucket ${bucket}...${NC}"
    
    # Delete all objects
    aws s3 rm "s3://${bucket}" --recursive --quiet
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✓ Bucket emptied successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to empty bucket${NC}"
        return 1
    fi
}

# Remove bucket
remove_bucket() {
    local bucket="$1"
    echo -e "\n${BLUE}🗑️  Removing bucket ${bucket}...${NC}"
    
    aws s3api delete-bucket --bucket "$bucket"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✓ Bucket removed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to remove bucket${NC}"
        return 1
    fi
}

# Main cleanup function
cleanup_buckets() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}  S3 Bucket Cleanup${NC}"
    echo -e "${BLUE}===========================================${NC}"
    
    local buckets_removed=0
    local buckets_skipped=0
    
    for bucket in "${BUCKETS_TO_REMOVE[@]}"; do
        echo -e "\n${BLUE}Processing bucket: ${bucket}${NC}"
        
        if ! bucket_exists "$bucket"; then
            echo -e "${YELLOW}⚠️  Bucket ${bucket} does not exist, skipping...${NC}"
            ((buckets_skipped++))
            continue
        fi
        
        list_bucket_contents "$bucket"
        
        # Ask for confirmation
        echo -e "\n${YELLOW}⚠️  WARNING: This will permanently delete all objects in ${bucket}${NC}"
        read -p "Continue with removal? (y/N) " -n 1 -r
        echo
        
        if [[ ! ${REPLY} =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}⚠️  Skipping ${bucket}${NC}"
            ((buckets_skipped++))
            continue
        fi
        
        # Empty and remove bucket
        if empty_bucket "$bucket" && remove_bucket "$bucket"; then
            ((buckets_removed++))
        else
            echo -e "${RED}❌ Failed to remove ${bucket}${NC}"
        fi
    done
    
    # Summary
    echo -e "\n${BLUE}===========================================${NC}"
    echo -e "${BLUE}  Cleanup Summary${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo -e "  Buckets removed: ${GREEN}${buckets_removed}${NC}"
    echo -e "  Buckets skipped: ${YELLOW}${buckets_skipped}${NC}"
    
    if [[ ${buckets_removed} -gt 0 ]]; then
        echo -e "\n${GREEN}✓ Cleanup completed successfully!${NC}"
    else
        echo -e "\n${YELLOW}⚠️  No buckets were removed${NC}"
    fi
}

# Main execution
main() {
    check_aws_cli
    check_aws_credentials
    cleanup_buckets
}

# Run main function
main "$@"
