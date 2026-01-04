bucket         = "riddle-rush-terraform-state-staging"
key            = "staging/terraform.tfstate"
region         = "eu-central-1"
encrypt        = true
dynamodb_table = "terraform-state-lock"
