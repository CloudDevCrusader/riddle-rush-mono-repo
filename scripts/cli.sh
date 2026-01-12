#!/bin/bash
# Riddle Rush CLI - Unified interface for all project scripts
# Usage: ./scripts/cli.sh [category] [command] [args...]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Script categories
declare -A CATEGORIES=(
    ["agent"]="Agent/AI workflow tools"
    ["aws"]="AWS infrastructure and deployment"
    ["build"]="Build and compilation tools"
    ["ci"]="CI/CD pipeline scripts"
    ["deploy"]="Deployment scripts"
    ["test"]="Testing utilities"
    ["quality"]="Code quality and linting"
    ["utils"]="Maintenance and utility scripts"
)

# Script mappings (category -> script names)
declare -A AGENT_SCRIPTS=(
    ["autofix"]="agent-autofix.sh"
    ["commands"]="agent-commands.sh"
    ["install"]="agent-install.sh"
    ["status"]="agent-status.sh"
    ["validate"]="agent-validate.sh"
    ["setup"]="setup-agent-configs.sh"
)

declare -A AWS_SCRIPTS=(
    ["assume-role"]="assume-aws-role.sh"
    ["deploy"]="aws-deploy.sh"
    ["cleanup-buckets"]="cleanup-s3-buckets.sh"
    ["create-iam"]="create-iam-roles.sh"
    ["setup-creds"]="setup-aws-credentials.sh"
    ["setup-iam"]="setup-aws-iam.sh"
    ["get-outputs"]="get-terraform-outputs.sh"
    ["sync-outputs"]="sync-terraform-outputs.sh"
    ["tf-apply"]="terraform-apply.sh"
    ["tf-plan"]="terraform-plan.sh"
)

declare -A BUILD_SCRIPTS=(
    ["docker"]="build-docker-image.sh"
    ["lambda"]="build-lambda.sh"
    ["websocket"]="build-websocket-lambdas.sh"
)

declare -A CI_SCRIPTS=(
    ["build"]="ci-build.sh"
    ["deploy"]="ci-deploy.sh"
    ["e2e"]="ci-e2e.sh"
    ["test"]="ci-test.sh"
)

declare -A DEPLOY_SCRIPTS=(
    ["dev"]="deploy-dev.sh"
    ["infrastructure"]="deploy-infrastructure.sh"
    ["prod"]="deploy-prod.sh"
    ["staging"]="deploy-staging.sh"
)

declare -A TEST_SCRIPTS=(
    ["e2e-deployed"]="e2e-deployed.sh"
    ["e2e-local"]="e2e-local.sh"
    ["trunk"]="run-tests-with-trunk.sh"
    ["trunk-integration"]="test-trunk-integration.sh"
    ["upload-flaky"]="upload-flaky-tests.sh"
)

declare -A QUALITY_SCRIPTS=(
    ["check-lint"]="check-lint-style.sh"
    ["check-secrets"]="check-secrets.sh"
    ["trunk-eslint"]="trunk-eslint.sh"
    ["trunk-prettier"]="trunk-prettier.sh"
    ["python-format"]="python-format.sh"
    ["python-lint"]="python-lint.sh"
)

declare -A UTILS_SCRIPTS=(
    ["check-deps"]="check-dependencies.sh"
    ["diagnose-ts"]="diagnose-typescript-issues.sh"
    ["diagnose-vscode"]="diagnose-vscode-issues.sh"
    ["migrate-env"]="migrate-env-variables.sh"
    ["optimize-monorepo"]="optimize-for-monorepo.sh"
)

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Function to print section headers
print_header() {
    echo
    print_color "$BOLD$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_color "$BOLD$CYAN" "$1"
    print_color "$BOLD$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
}

# Function to show usage
show_usage() {
    print_header "🎮 Riddle Rush CLI"

    echo "Usage:"
    print_color "$GREEN" "  ./scripts/cli.sh [category] [command] [args...]"
    print_color "$GREEN" "  ./scripts/cli.sh help [category]"
    print_color "$GREEN" "  ./scripts/cli.sh list"
    echo

    echo "Quick Commands:"
    print_color "$YELLOW" "  ./scripts/cli.sh agent validate      # Validate agent workflow"
    print_color "$YELLOW" "  ./scripts/cli.sh deploy prod         # Deploy to production"
    print_color "$YELLOW" "  ./scripts/cli.sh test e2e-local      # Run E2E tests locally"
    print_color "$YELLOW" "  ./scripts/cli.sh aws tf-plan         # Terraform plan"
    echo

    echo "Categories:"
    for category in "${!CATEGORIES[@]}"; do
        printf "  ${MAGENTA}%-12s${NC} %s\n" "$category" "${CATEGORIES[$category]}"
    done
    echo

    echo "For detailed help on a category:"
    print_color "$CYAN" "  ./scripts/cli.sh help [category]"
    echo
}

# Function to list all scripts
list_all_scripts() {
    print_header "📋 Available Scripts"

    for category in agent aws build ci deploy test quality utils; do
        local var_name="${category^^}_SCRIPTS[@]"
        local -n scripts_ref="${category^^}_SCRIPTS"

        print_color "$BOLD$MAGENTA" "[$category] ${CATEGORIES[$category]}"
        echo

        for cmd in "${!scripts_ref[@]}"; do
            local script="${scripts_ref[$cmd]}"
            printf "  ${GREEN}%-20s${NC} → %s\n" "$cmd" "$script"
        done
        echo
    done
}

# Function to show help for a specific category
show_category_help() {
    local category=$1

    if [[ ! -v "CATEGORIES[$category]" ]]; then
        print_color "$RED" "Error: Unknown category '$category'"
        echo
        echo "Available categories: ${!CATEGORIES[*]}"
        exit 1
    fi

    print_header "${CATEGORIES[$category]}"

    local var_name="${category^^}_SCRIPTS[@]"
    local -n scripts_ref="${category^^}_SCRIPTS"

    print_color "$BOLD" "Commands:"
    echo

    for cmd in "${!scripts_ref[@]}"; do
        local script="${scripts_ref[$cmd]}"
        local script_path="$SCRIPT_DIR/$script"

        printf "  ${GREEN}%-20s${NC}" "$cmd"

        # Try to extract description from script
        if [[ -f "$script_path" ]]; then
            local desc=$(head -n 10 "$script_path" | grep -E "^#.*" | grep -v "^#!/" | head -n 1 | sed 's/^#\s*//')
            if [[ -n "$desc" ]]; then
                echo "$desc"
            else
                echo "→ $script"
            fi
        else
            print_color "$YELLOW" "(script not found: $script)"
        fi
    done
    echo

    echo "Usage:"
    print_color "$CYAN" "  ./scripts/cli.sh $category <command> [args...]"
    echo

    echo "Examples:"
    case $category in
        agent)
            print_color "$YELLOW" "  ./scripts/cli.sh agent validate"
            print_color "$YELLOW" "  ./scripts/cli.sh agent autofix"
            ;;
        aws)
            print_color "$YELLOW" "  ./scripts/cli.sh aws tf-plan production"
            print_color "$YELLOW" "  ./scripts/cli.sh aws deploy production"
            ;;
        deploy)
            print_color "$YELLOW" "  ./scripts/cli.sh deploy prod"
            print_color "$YELLOW" "  ./scripts/cli.sh deploy dev"
            ;;
        test)
            print_color "$YELLOW" "  ./scripts/cli.sh test e2e-local"
            print_color "$YELLOW" "  ./scripts/cli.sh test e2e-deployed production"
            ;;
    esac
    echo
}

# Function to execute a script
execute_script() {
    local category=$1
    local command=$2
    shift 2
    local args=("$@")

    # Get script reference
    local var_name="${category^^}_SCRIPTS"
    local -n scripts_ref="$var_name"

    if [[ ! -v "scripts_ref[$command]" ]]; then
        print_color "$RED" "Error: Unknown command '$command' in category '$category'"
        echo
        echo "Run './scripts/cli.sh help $category' for available commands"
        exit 1
    fi

    local script="${scripts_ref[$command]}"
    local script_path="$SCRIPT_DIR/$script"

    if [[ ! -f "$script_path" ]]; then
        print_color "$RED" "Error: Script not found: $script_path"
        exit 1
    fi

    if [[ ! -x "$script_path" ]]; then
        print_color "$YELLOW" "Making script executable: $script"
        chmod +x "$script_path"
    fi

    print_color "$BLUE" "Executing: $script ${args[*]}"
    echo

    # Execute the script with arguments
    "$script_path" "${args[@]}"
}

# Main command dispatcher
main() {
    # Handle no arguments
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 0
    fi

    local cmd=$1

    case $cmd in
        help|-h|--help)
            if [[ $# -eq 1 ]]; then
                show_usage
            else
                show_category_help "$2"
            fi
            ;;
        list|-l|--list)
            list_all_scripts
            ;;
        agent|aws|build|ci|deploy|test|quality|utils)
            if [[ $# -lt 2 ]]; then
                show_category_help "$cmd"
                exit 1
            fi
            local category=$1
            shift
            execute_script "$category" "$@"
            ;;
        *)
            print_color "$RED" "Error: Unknown command or category '$cmd'"
            echo
            show_usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
