# Backend configuration for Development environment
# This file configures Terraform to store state in the DEVELOPMENT AWS account

# Usage:
#   terraform init -backend-config=backend.hcl

# Note: Ensure AWS_PROFILE=riddle-rush-dev is set before running terraform commands
# Or use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from development account

bucket         = "riddle-rush-terraform-state-dev"
key            = "development/terraform.tfstate"
region         = "eu-central-1"
encrypt        = true
dynamodb_table = "terraform-state-lock-dev"

# The bucket and DynamoDB table must be created manually in the development account first:
#
#   export AWS_PROFILE=riddle-rush-dev
#
#   # Create state bucket
#   aws s3 mb s3://riddle-rush-terraform-state-dev --region eu-central-1
#
#   # Enable versioning
#   aws s3api put-bucket-versioning \
#     --bucket riddle-rush-terraform-state-dev \
#     --versioning-configuration Status=Enabled
#
#   # Enable encryption
#   aws s3api put-bucket-encryption \
#     --bucket riddle-rush-terraform-state-dev \
#     --server-side-encryption-configuration '{
#       "Rules": [{
#         "ApplyServerSideEncryptionByDefault": {
#           "SSEAlgorithm": "AES256"
#         }
#       }]
#     }'
#
#   # Block public access
#   aws s3api put-public-access-block \
#     --bucket riddle-rush-terraform-state-dev \
#     --public-access-block-configuration \
#     "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
#
#   # Create DynamoDB table for state locking
#   aws dynamodb create-table \
#     --table-name terraform-state-lock-dev \
#     --attribute-definitions AttributeName=LockID,AttributeType=S \
#     --key-schema AttributeName=LockID,KeyType=HASH \
#     --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
#     --region eu-central-1
