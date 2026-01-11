#!/bin/bash
# ===========================================
# Lint & Style Check Script
# ===========================================
# Runs comprehensive linting and style checks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHECK_ALL=false
FIX_MODE=false
SCOPE="game"  # Default to game app

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all|-a)
            CHECK_ALL=true
            shift
            ;;
        --fix)
            FIX_MODE=true
            shift
            ;;
        --scope|-s)
            SCOPE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --all, -a        Check all packages (default: game app only)"
            echo "  --fix            Auto-fix issues where possible"
            echo "  --scope, -s      Specify scope (game, docs, shared, types, config)"
            echo "  --help, -h       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run ESLint
run_eslint() {
    local package_filter="@riddle-rush/${SCOPE}"
    
    if [[ "$CHECK_ALL" = true ]]; then
        package_filter=""
    fi
    
    echo -e "\n${BLUE}🔍 Running ESLint...${NC}"
    
    if [[ "$FIX_MODE" = true ]]; then
        echo -e "   Mode: Auto-fix enabled"
        if [[ -n "$package_filter" ]]; then
            pnpm run lint:fix --filter="$package_filter"
        else
            pnpm run lint:fix
        fi
    else
        echo -e "   Mode: Check only"
        if [[ -n "$package_filter" ]]; then
            pnpm run lint --filter="$package_filter"
        else
            pnpm run lint
        fi
    fi
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo -e "${GREEN}✓ ESLint passed${NC}"
        return 0
    else
        echo -e "${RED}❌ ESLint failed${NC}"
        return 1
    fi
}

# Run Prettier
run_prettier() {
    echo -e "\n${BLUE}🎨 Running Prettier...${NC}"
    
    if [[ "$FIX_MODE" = true ]]; then
        echo -e "   Mode: Auto-format enabled"
        if [[ "$CHECK_ALL" = true ]]; then
            pnpm run format
        else
            # For specific scope, we'll check the relevant directories
            case "$SCOPE" in
                "game")
                    pnpm run format --filter="@riddle-rush/game"
                    ;;
                "docs")
                    pnpm run format --filter="@riddle-rush/docs"
                    ;;
                "shared")
                    pnpm run format --filter="@riddle-rush/shared"
                    ;;
                "types")
                    pnpm run format --filter="@riddle-rush/types"
                    ;;
                "config")
                    pnpm run format --filter="@riddle-rush/config"
                    ;;
            esac
        fi
    else
        echo -e "   Mode: Check only"
        # Prettier doesn't have a built-in check mode that works well with pnpm filters
        # So we'll run format and check if any files were changed
        
        # Create a temporary file to capture git status
        local git_status_file=$(mktemp)
        git status --porcelain > "$git_status_file"
        
        # Run format
        if [[ "$CHECK_ALL" = true ]]; then
            pnpm run format > /dev/null 2>&1
        else
            case "$SCOPE" in
                "game")
                    pnpm run format --filter="@riddle-rush/game" > /dev/null 2>&1
                    ;;
                "docs")
                    pnpm run format --filter="@riddle-rush/docs" > /dev/null 2>&1
                    ;;
                "shared")
                    pnpm run format --filter="@riddle-rush/shared" > /dev/null 2>&1
                    ;;
                "types")
                    pnpm run format --filter="@riddle-rush/types" > /dev/null 2>&1
                    ;;
                "config")
                    pnpm run format --filter="@riddle-rush/config" > /dev/null 2>&1
                    ;;
            esac
        fi
        
        # Check if any files were changed
        local new_git_status_file=$(mktemp)
        git status --porcelain > "$new_git_status_file"
        
        if ! diff -q "$git_status_file" "$new_git_status_file" > /dev/null; then
            echo -e "${RED}❌ Prettier formatting issues found${NC}"
            echo -e "   Files need formatting. Run with --fix to auto-format."
            
            # Show which files would be formatted
            git diff --name-only "$git_status_file" "$new_git_status_file" | while read -r file; do
                echo -e "   - $file"
            done
            
            # Revert the formatting changes
            git checkout -- .
            
            rm "$git_status_file" "$new_git_status_file"
            return 1
        else
            echo -e "${GREEN}✓ Prettier formatting is correct${NC}"
            rm "$git_status_file" "$new_git_status_file"
            return 0
        fi
    fi
}

# Run TypeScript checks
run_typescript() {
    echo -e "\n${BLUE}🔷 Running TypeScript checks...${NC}"
    
    if [[ "$CHECK_ALL" = true ]]; then
        pnpm run typecheck
    else
        pnpm run typecheck --filter="@riddle-rush/${SCOPE}"
    fi
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo -e "${GREEN}✓ TypeScript checks passed${NC}"
        return 0
    else
        echo -e "${RED}❌ TypeScript checks failed${NC}"
        return 1
    fi
}

# Run Syncpack (dependency version sync)
run_syncpack() {
    echo -e "\n${BLUE}📦 Running Syncpack...${NC}"
    
    pnpm run syncpack:check
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo -e "${GREEN}✓ Dependency versions are synchronized${NC}"
        return 0
    else
        echo -e "${RED}❌ Dependency version mismatches found${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}  Lint & Style Check${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo -e "   Scope: ${SCOPE}"
    echo -e "   Check all packages: ${CHECK_ALL}"
    echo -e "   Auto-fix mode: ${FIX_MODE}"
    
    local all_passed=true
    
    # Run checks
    run_eslint || all_passed=false
    run_prettier || all_passed=false
    run_typescript || all_passed=false
    
    if [[ "$CHECK_ALL" = true ]]; then
        run_syncpack || all_passed=false
    fi
    
    # Summary
    echo -e "\n${BLUE}===========================================${NC}"
    if [[ "$all_passed" = true ]]; then
        echo -e "${GREEN}✓ All lint & style checks passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some lint & style checks failed${NC}"
        echo -e "   Run with --fix to auto-fix issues where possible"
        exit 1
    fi
}

# Run main function
main "$@"
