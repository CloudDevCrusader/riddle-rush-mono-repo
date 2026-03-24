#!/bin/bash

# GitHub Actions Workflow Management Script
# This script helps manage and test GitHub Actions workflows using GitHub CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
	echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
	echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
	echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
	echo -e "${RED}❌ $1${NC}"
}

# Check if GitHub CLI is installed
if ! command -v gh &>/dev/null; then
	print_error "GitHub CLI (gh) is not installed. Please install it first."
	exit 1
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &>/dev/null; then
	print_error "GitHub CLI is not authenticated. Please run 'gh auth login' first."
	exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || echo "")
if [ -z "$REPO" ]; then
	print_error "Not in a git repository or unable to get repository info."
	exit 1
fi

print_status "Managing GitHub Actions workflows for: $REPO"

# Function to list workflows
list_workflows() {
	print_status "Listing all workflows..."
	echo ""
	gh workflow list --json name,id,state,url --jq '.[] | "\(.name) (\(.state)) - \(.url)"'
	echo ""
}

# Function to run a workflow
run_workflow() {
	local workflow_name=$1
	local ref=${2:-main}

	if [ -z "$workflow_name" ]; then
		print_error "Please provide a workflow name."
		echo "Usage: $0 run <workflow-name> [ref]"
		exit 1
	fi

	print_status "Running workflow: $workflow_name on branch: $ref"

	# Run the workflow
	if gh workflow run "$workflow_name" --ref="$ref"; then
		print_success "Workflow '$workflow_name' triggered successfully on branch '$ref'"

		# Get the latest run
		sleep 2
		local run_url
		run_url=$(gh run list --workflow="$workflow_name" --limit 1 --json url --jq '.[0].url')
		echo "🔗 Run URL: $run_url"

		# Ask if user wants to watch the run
		read -p "Would you like to watch the run progress? (y/n): " -n 1 -r
		echo
		if [[ $REPLY =~ ^[Yy]$ ]]; then
			print_status "Watching workflow run..."
			gh run watch --json status,conclusion,createdAt,startedAt,completedAt,updatedAt --jq '.'
		fi
	else
		print_error "Failed to trigger workflow '$workflow_name'"
		exit 1
	fi
}

# Function to get workflow status
workflow_status() {
	local workflow_name=$1

	if [ -z "$workflow_name" ]; then
		print_error "Please provide a workflow name."
		echo "Usage: $0 status <workflow-name>"
		exit 1
	fi

	print_status "Getting status for workflow: $workflow_name"

	# Get recent runs
	gh run list --workflow="$workflow_name" --limit 5 --json \
		databaseId,status,conclusion,createdAt,startedAt,completedAt,updatedAt,url \
		--jq '.[] | "Run #\(.databaseId): \(.status) -> \(.conclusion // "running") | \(.createdAt | split("T")[0]) | \(.url)"'
}

# Function to cancel a workflow run
cancel_run() {
	local run_id=$1

	if [ -z "$run_id" ]; then
		print_error "Please provide a run ID."
		echo "Usage: $0 cancel <run-id>"
		echo "Use 'gh run list' to see recent runs."
		exit 1
	fi

	print_status "Canceling run: $run_id"

	if gh run cancel "$run_id"; then
		print_success "Run $run_id canceled successfully"
	else
		print_error "Failed to cancel run $run_id"
	fi
}

# Function to delete workflow runs
delete_runs() {
	local workflow_name=$1
	local status=${2:-all}

	if [ -z "$workflow_name" ]; then
		print_error "Please provide a workflow name."
		echo "Usage: $0 delete <workflow-name> [status]"
		exit 1
	fi

	print_status "Deleting runs for workflow: $workflow_name with status: $status"

	# Get runs to delete
	local runs
	runs=$(gh run list --workflow="$workflow_name" --limit 100 --json databaseId --jq '.[].databaseId')

	if [ -z "$runs" ]; then
		print_warning "No runs found to delete."
		return
	fi

	# Ask for confirmation
	echo "This will delete the following runs:"
	echo "$runs" | nl
	read -p "Are you sure you want to delete these runs? (y/n): " -n 1 -r
	echo
	if [[ ! $REPLY =~ ^[Yy]$ ]]; then
		print_status "Deletion cancelled."
		return
	fi

	# Delete runs
	echo "$runs" | while read -r run_id; do
		if [ -n "$run_id" ]; then
			if gh run delete "$run_id"; then
				print_success "Deleted run $run_id"
			else
				print_error "Failed to delete run $run_id"
			fi
		fi
	done
}

# Function to enable/disable workflow
toggle_workflow() {
	local workflow_name=$1
	local action=$2

	if [ -z "$workflow_name" ] || [ -z "$action" ]; then
		print_error "Please provide workflow name and action (enable/disable)."
		echo "Usage: $0 toggle <workflow-name> <enable|disable>"
		exit 1
	fi

	if [ "$action" = "enable" ]; then
		print_status "Enabling workflow: $workflow_name"
		gh workflow enable "$workflow_name"
		print_success "Workflow '$workflow_name' enabled"
	elif [ "$action" = "disable" ]; then
		print_status "Disabling workflow: $workflow_name"
		gh workflow disable "$workflow_name"
		print_success "Workflow '$workflow_name' disabled"
	else
		print_error "Invalid action: $action. Use 'enable' or 'disable'."
		exit 1
	fi
}

# Function to show workflow logs
show_logs() {
	local run_id=$1

	if [ -z "$run_id" ]; then
		print_error "Please provide a run ID."
		echo "Usage: $0 logs <run-id>"
		echo "Use 'gh run list' to see recent runs."
		exit 1
	fi

	print_status "Showing logs for run: $run_id"
	gh run view "$run_id" --log
}

# Function to create a workflow issue template
create_issue_template() {
	print_status "Creating GitHub Actions issue template..."

	local template_path=".github/ISSUE_TEMPLATE/ci-failure.yml"

	mkdir -p .github/ISSUE_TEMPLATE

	cat >"$template_path" <<EOF
name: CI/CD Pipeline Failure
description: Report a failure in the CI/CD pipeline
title: "[CI Failure] "
labels: ["ci-failure", "needs-attention"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a CI/CD pipeline failure. Please provide as much detail as possible.

  - type: dropdown
    id: workflow
    attributes:
      label: Affected Workflow
      description: Which workflow failed?
      options:
        - "Optimized CI/CD Pipeline"
        - "Quality Checks"
        - "Other (please specify)"
    validations:
      required: true

  - type: dropdown
    id: job
    attributes:
      label: Failed Job
      description: Which specific job failed?
      options:
        - "Quality Gates"
        - "Unit Tests"
        - "E2E Tests"
        - "Build"
        - "Security Scan"
        - "Deployment"
        - "Unknown"
    validations:
      required: true

  - type: input
    id: run-url
    attributes:
      label: Run URL
      description: Link to the failed workflow run
      placeholder: https://github.com/owner/repo/actions/runs/1234567890
    validations:
      required: true

  - type: textarea
    id: error-message
    attributes:
      label: Error Message
      description: What was the error message?
      placeholder: Please include the full error message...
    validations:
      required: true

  - type: textarea
    id: reproduction-steps
    attributes:
      label: Reproduction Steps
      description: What steps led to this failure?
      placeholder: 1. Pushed to branch...\n2. Workflow started...\n3. Error occurred...
    validations:
      required: true

  - type: textarea
    id: additional-context
    attributes:
      label: Additional Context
      description: Any other information that might be helpful?
      placeholder: Add any logs, screenshots, or other relevant information...
    validations:
      required: false
EOF

	print_success "Issue template created at: $template_path"
}

# Function to show help
show_help() {
	echo "GitHub Actions Workflow Management Script"
	echo ""
	echo "Usage: $0 <command> [options]"
	echo ""
	echo "Commands:"
	echo "  list                          List all workflows"
	echo "  run <workflow> [ref]          Run a workflow (default ref: main)"
	echo "  status <workflow>             Show status of recent workflow runs"
	echo "  cancel <run-id>               Cancel a workflow run"
	echo "  delete <workflow> [status]    Delete workflow runs"
	echo "  toggle <workflow> <action>     Enable/disable workflow"
	echo "  logs <run-id>                 Show logs for a workflow run"
	echo "  issue-template               Create CI failure issue template"
	echo "  help                          Show this help message"
	echo ""
	echo "Examples:"
	echo "  $0 list"
	echo "  $0 run 'Optimized CI/CD Pipeline'"
	echo "  $0 run 'Optimized CI/CD Pipeline' development"
	echo "  $0 status 'Optimized CI/CD Pipeline'"
	echo "  $0 cancel 1234567890"
	echo "  $0 delete 'Optimized CI/CD Pipeline'"
	echo "  $0 toggle 'Optimized CI/CD Pipeline' disable"
	echo "  $0 logs 1234567890"
	echo ""
}

# Main script logic
case "${1-}" in
list)
	list_workflows
	;;
run)
	run_workflow "$2" "$3"
	;;
status)
	workflow_status "$2"
	;;
cancel)
	cancel_run "$2"
	;;
delete)
	delete_runs "$2" "$3"
	;;
toggle)
	toggle_workflow "$2" "$3"
	;;
logs)
	show_logs "$2"
	;;
issue-template)
	create_issue_template
	;;
help | --help | -h)
	show_help
	;;
*)
	print_error "Unknown command: $1"
	echo ""
	show_help
	exit 1
	;;
esac

print_success "Script completed successfully!"
