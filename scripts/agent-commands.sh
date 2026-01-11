#!/bin/bash

# Agent Quick Commands Script
# Quick reference for common agent workflow commands

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Show header
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🤖 Riddle Rush - Agent Workflow Commands           ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Function to print section
print_section() {
    echo -e "${GREEN}$1${NC}"
    echo ""
}

# Function to print command
print_cmd() {
    echo -e "  ${YELLOW}$1${NC}"
    echo -e "  └─ $2"
    echo ""
}

# Quality Checks
print_section "📋 Quality Checks (Run after EVERY change)"
print_cmd "pnpm run workspace:check" "Run all checks (syncpack + typecheck + lint)"
print_cmd "pnpm run typecheck" "TypeScript validation only"
print_cmd "pnpm run lint" "ESLint checks"
print_cmd "pnpm run lint:fix" "Auto-fix linting issues"
print_cmd "pnpm run format" "Format code with Prettier"

# Testing
print_section "🧪 Testing"
print_cmd "pnpm run test:unit" "Run all unit tests"
print_cmd "pnpm --filter @riddle-rush/game test:unit" "Run game tests only"
print_cmd "pnpm run test:e2e" "Run E2E tests"
print_cmd "pnpm run test:unit:coverage" "Generate coverage report"

# Git Workflow
print_section "📝 Git Workflow"
print_cmd "git status" "Check current status"
print_cmd "git add ." "Stage all changes"
print_cmd "git commit -m \"feat: message\"" "Commit with conventional format"
print_cmd "git push" "Push to remote"

# Commit Types
print_section "🏷️  Commit Types"
echo -e "  ${YELLOW}feat:${NC}     New feature"
echo -e "  ${YELLOW}fix:${NC}      Bug fix"
echo -e "  ${YELLOW}docs:${NC}     Documentation only"
echo -e "  ${YELLOW}refactor:${NC} Code restructuring"
echo -e "  ${YELLOW}test:${NC}     Test changes"
echo -e "  ${YELLOW}chore:${NC}    Maintenance tasks"
echo -e "  ${YELLOW}perf:${NC}     Performance improvement"
echo -e "  ${YELLOW}style:${NC}    Formatting changes"
echo ""

# Development
print_section "🚀 Development"
print_cmd "pnpm run dev" "Start game app (localhost:3000)"
print_cmd "pnpm run dev:docs" "Start docs app"
print_cmd "pnpm run build" "Build for production"

# Package Management
print_section "📦 Package Management"
print_cmd "pnpm install" "Install dependencies"
print_cmd "pnpm add <package>" "Add dependency"
print_cmd "pnpm add -D <package>" "Add dev dependency"
print_cmd "pnpm remove <package>" "Remove dependency"

# Quick Workflow
print_section "⚡ Quick Workflow Template"
echo -e "  ${YELLOW}1.${NC} Make your changes"
echo -e "  ${YELLOW}2.${NC} pnpm run workspace:check"
echo -e "  ${YELLOW}3.${NC} git add ."
echo -e "  ${YELLOW}4.${NC} git commit -m \"feat: description\""
echo -e "  ${YELLOW}5.${NC} git push"
echo ""

# Footer
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📖 Full documentation: AGENTS.md${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
