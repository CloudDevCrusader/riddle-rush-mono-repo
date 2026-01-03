# Backend configuration for Production environment
# This file configures Terraform to store state in the PRODUCTION AWS account

# Usage:
#   terraform init -backend-config=backend.hcl

# Note: Ensure AWS_PROFILE=riddle-rush-prod is set before running terraform commands
# Or use AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from production account

bucket         = "riddle-rush-terraform-state-prod"
key            = "production/terraform.tfstate"
region         = "eu-central-1"
encrypt        = true
dynamodb_table = "terraform-state-lock-prod"

# The bucket and DynamoDB table must be created manually in the production account first:
#
#   export AWS_PROFILE=riddle-rush-prod
#
#   # Create state bucket
#   aws s3 mb s3://riddle-rush-terraform-state-prod --region eu-central-1
#
#   # Enable versioning
#   aws s3api put-bucket-versioning \
#     --bucket riddle-rush-terraform-state-prod \
#     --versioning-configuration Status=Enabled
#
#   # Enable encryption
#   aws s3api put-bucket-encryption \
#     --bucket riddle-rush-terraform-state-prod \
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
#     --bucket riddle-rush-terraform-state-prod \
#     --public-access-block-configuration \
#     "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
#
#   # Create DynamoDB table for state locking
#   aws dynamodb create-table \
#     --table-name terraform-state-lock-prod \
#     --attribute-definitions AttributeName=LockID,AttributeType=S \
#     --key-schema AttributeName=LockID,KeyType=HASH \
#     --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
#     --region eu-central-1
