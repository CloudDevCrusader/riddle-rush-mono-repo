#!/bin/bash
# Install RiddleRush CLI with 'rush' alias
# Usage: ./scripts/install-cli.sh

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI_SCRIPT="$SCRIPT_DIR/cli.sh"

print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

print_header() {
    echo
    print_color "$BOLD$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_color "$BOLD$CYAN" "$1"
    print_color "$BOLD$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
}

print_header "🎮 RiddleRush CLI Installer"

# Detect shell
SHELL_NAME=$(basename "$SHELL")
case $SHELL_NAME in
    bash)
        RC_FILE="$HOME/.bashrc"
        ;;
    zsh)
        RC_FILE="$HOME/.zshrc"
        ;;
    fish)
        RC_FILE="$HOME/.config/fish/config.fish"
        print_color "$YELLOW" "Warning: Fish shell detected. Manual setup may be required."
        ;;
    *)
        RC_FILE="$HOME/.profile"
        print_color "$YELLOW" "Warning: Unknown shell '$SHELL_NAME'. Using ~/.profile"
        ;;
esac

print_color "$BLUE" "Detected shell: $SHELL_NAME"
print_color "$BLUE" "RC file: $RC_FILE"
echo

# Create alias function
ALIAS_BLOCK="
# RiddleRush CLI alias
export RIDDLE_RUSH_ROOT=\"$PROJECT_ROOT\"
alias rush='$CLI_SCRIPT'
alias riddle-rush='$CLI_SCRIPT'

# RiddleRush CLI completion helper (optional)
_rush_completion() {
    local cur=\${COMP_WORDS[COMP_CWORD]}
    local prev=\${COMP_WORDS[COMP_CWORD-1]}

    case \$COMP_CWORD in
        1)
            COMPREPLY=( \$(compgen -W \"help list agent aws build ci deploy test quality utils\" -- \$cur) )
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

if [ -n \"\$BASH_VERSION\" ]; then
    complete -F _rush_completion rush
    complete -F _rush_completion riddle-rush
fi
"

# Check if alias already exists
if grep -q "RiddleRush CLI alias" "$RC_FILE" 2>/dev/null; then
    print_color "$YELLOW" "RiddleRush CLI alias already exists in $RC_FILE"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old alias block
        sed -i.bak '/# RiddleRush CLI alias/,/^fi$/d' "$RC_FILE"
        print_color "$GREEN" "Removed old alias"
    else
        print_color "$BLUE" "Skipping installation"
        exit 0
    fi
fi

# Add alias to RC file
echo "$ALIAS_BLOCK" >> "$RC_FILE"

print_color "$GREEN" "✓ Alias installed successfully!"
echo

print_header "🚀 Getting Started"

echo "The 'rush' command is now available!"
echo

print_color "$BOLD" "Activate it now:"
print_color "$CYAN" "  source $RC_FILE"
echo

print_color "$BOLD" "Or start a new terminal session"
echo

print_color "$BOLD" "Try these commands:"
print_color "$YELLOW" "  rush                    # Show help"
print_color "$YELLOW" "  rush list               # List all commands"
print_color "$YELLOW" "  rush help agent         # Help for agent category"
print_color "$YELLOW" "  rush agent validate     # Run agent validation"
print_color "$YELLOW" "  rush deploy prod        # Deploy to production"
echo

print_color "$BOLD$GREEN" "Happy coding! 🎮"
echo
