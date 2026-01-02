.PHONY: help init plan apply destroy validate fmt import setup

# Default target
help:
	@echo "Terraform Infrastructure Management"
	@echo "===================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make setup       - Install tfenv and Terraform"
	@echo "  make init        - Initialize Terraform"
	@echo "  make validate    - Validate Terraform configuration"
	@echo "  make fmt         - Format Terraform files"
	@echo "  make plan        - Show execution plan"
	@echo "  make apply       - Apply Terraform changes"
	@echo "  make destroy     - Destroy infrastructure"
	@echo "  make import      - Import existing resources with terraformer"
	@echo "  make output      - Show Terraform outputs"
	@echo ""

setup:
	@./scripts/setup-tfenv.sh

init:
	@terraform init

validate:
	@terraform validate

fmt:
	@terraform fmt -recursive

plan:
	@terraform plan

apply:
	@terraform apply

destroy:
	@terraform destroy

import:
	@./scripts/import-with-terraformer.sh

output:
	@terraform output

refresh:
	@terraform refresh

show:
	@terraform show

state-list:
	@terraform state list

clean:
	@rm -rf .terraform .terraform.lock.hcl

