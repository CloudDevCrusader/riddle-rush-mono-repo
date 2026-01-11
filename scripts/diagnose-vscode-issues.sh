#!/bin/bash
set -e

echo "🔍 Diagnosing VSCode/Cursor Vue file issues..."
echo ""

# Test 1: Check for conflicting Volar extensions
echo "Test 1: Checking for conflicting Volar extensions..."
if [ -f ".vscode/extensions.json" ]; then
    echo "✅ VSCode extensions configuration found"
    
    # Check if the old Volar extension is recommended
    if grep -q "johnsoncodehk.volar" ".vscode/extensions.json"; then
        echo "❌ ISSUE FOUND: Old Volar extension (johnsoncodehk.volar) is still recommended"
        echo "   Fix: Remove 'johnsoncodehk.volar' from .vscode/extensions.json"
    else
        echo "✅ No old Volar extension found in recommendations"
    fi
    
    # Check if the new Volar extension is recommended
    if grep -q "vue.volar" ".vscode/extensions.json"; then
        echo "✅ Correct Volar extension (vue.volar) is recommended"
    else
        echo "⚠️  Warning: vue.volar not found in recommendations"
    fi
else
    echo "❌ VSCode extensions configuration missing"
fi

echo ""

# Test 2: Check VSCode settings
echo "Test 2: Checking VSCode settings..."
if [ -f ".vscode/settings.json" ]; then
    echo "✅ VSCode settings found"
    
    # Check nuxt.isNuxtApp setting
    if grep -q '"nuxt.isNuxtApp": true' ".vscode/settings.json"; then
        echo "✅ nuxt.isNuxtApp is correctly set to true"
    elif grep -q '"nuxt.isNuxtApp": false' ".vscode/settings.json"; then
        echo "❌ ISSUE FOUND: nuxt.isNuxtApp is incorrectly set to false"
        echo "   Fix: Change 'nuxt.isNuxtApp' to true in .vscode/settings.json"
    else
        echo "⚠️  Warning: nuxt.isNuxtApp setting not found"
    fi
    
    # Check Volar takeOverMode
    if grep -q '"volar.takeOverMode.enabled": false' ".vscode/settings.json"; then
        echo "✅ Volar takeOverMode is correctly disabled"
    else
        echo "⚠️  Warning: Volar takeOverMode setting not found or incorrect"
    fi
else
    echo "❌ VSCode settings missing"
fi

echo ""

# Test 3: Check TypeScript configuration
echo "Test 3: Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    echo "✅ Root TypeScript config found"
    
    # Check module resolution
    if grep -q '"moduleResolution": "bundler"' "tsconfig.json"; then
        echo "✅ Module resolution is correctly set to 'bundler'"
    else
        echo "⚠️  Warning: Module resolution might not be optimal for Nuxt"
    fi
else
    echo "❌ Root TypeScript config missing"
fi

if [ -f "apps/game/tsconfig.json" ]; then
    echo "✅ Game app TypeScript config found"
    
    # Check if it extends the correct configs
    if grep -q "extends" "apps/game/tsconfig.json"; then
        echo "✅ Game tsconfig extends base configuration"
    else
        echo "⚠️  Warning: Game tsconfig doesn't extend base configuration"
    fi
else
    echo "❌ Game app TypeScript config missing"
fi

echo ""

# Test 4: Check ESLint configuration
echo "Test 4: Checking ESLint configuration..."
if [ -f "eslint.config.mjs" ]; then
    echo "✅ Root ESLint config found"
else
    echo "❌ Root ESLint config missing"
fi

if [ -f "apps/game/eslint.config.mjs" ]; then
    echo "✅ Game app ESLint config found"
else
    echo "❌ Game app ESLint config missing"
fi

echo ""

# Test 5: Check package versions
echo "Test 5: Checking key package versions..."
echo "Checking Vue version..."
grep -E "\"vue\":" package.json apps/game/package.json 2>/dev/null || echo "Vue version not found in expected locations"

echo "Checking TypeScript version..."
grep -E "\"typescript\":" package.json apps/game/package.json 2>/dev/null || echo "TypeScript version not found in expected locations"

echo ""

# Test 6: Check for common Vue 3 + TypeScript issues
echo "Test 6: Checking for common Vue 3 + TypeScript issues..."

# Check if vue-tsc is installed
if grep -q "vue-tsc" apps/game/package.json; then
    echo "✅ vue-tsc is installed (good for TypeScript support in Vue files)"
else
    echo "⚠️  Warning: vue-tsc not found - consider installing for better Vue + TypeScript support"
fi

# Check if @vue/tsconfig is used
if [ -f "apps/game/.nuxt/tsconfig.json" ]; then
    echo "✅ Nuxt generated tsconfig found"
else
    echo "⚠️  Warning: Nuxt generated tsconfig not found - may need to run dev/build first"
fi

echo ""

# Test 7: Check VSCode workspace trust
echo "Test 7: Checking VSCode workspace configuration..."
if [ -f ".vscode/settings.json" ]; then
    # Check if workspace is trusted (common issue)
    if grep -q "security.workspace.trust" ".vscode/settings.json"; then
        echo "✅ Workspace trust settings found"
    else
        echo "ℹ️  Info: Workspace trust settings not configured (may need to trust workspace in VSCode)"
    fi
fi

echo ""

# Test 8: Check for missing .nuxt directory
echo "Test 8: Checking for Nuxt build artifacts..."
if [ -d "apps/game/.nuxt" ]; then
    echo "✅ Nuxt build directory exists"
    
    # Check if tsconfig.app.json exists (needed for Volar)
    if [ -f "apps/game/.nuxt/tsconfig.app.json" ]; then
        echo "✅ Nuxt TypeScript config for app exists"
    else
        echo "❌ ISSUE FOUND: apps/game/.nuxt/tsconfig.app.json missing"
        echo "   Fix: Run 'pnpm run dev' or 'pnpm run build' to generate Nuxt artifacts"
    fi
else
    echo "❌ ISSUE FOUND: Nuxt build directory missing"
    echo "   Fix: Run 'pnpm run dev' or 'pnpm run build' to generate Nuxt artifacts"
fi

echo ""

echo "📋 Summary of Potential Issues Found:"
echo ""

# Count issues found
issues_found=0

# Check for old Volar extension
if grep -q "johnsoncodehk.volar" ".vscode/extensions.json" 2>/dev/null; then
    echo "1. Old Volar extension still recommended"
    issues_found=$((issues_found + 1))
fi

# Check nuxt.isNuxtApp setting
if grep -q '"nuxt.isNuxtApp": false' ".vscode/settings.json" 2>/dev/null; then
    echo "2. nuxt.isNuxtApp incorrectly set to false"
    issues_found=$((issues_found + 1))
fi

# Check for missing .nuxt directory
if [ ! -f "apps/game/.nuxt/tsconfig.app.json" ]; then
    echo "3. Missing Nuxt TypeScript config (run dev/build)"
    issues_found=$((issues_found + 1))
fi

if [ $issues_found -eq 0 ]; then
    echo "✅ No obvious configuration issues found!"
    echo ""
    echo "If you're still seeing errors, try:"
    echo "1. Restart VSCode/Cursor"
    echo "2. Run 'pnpm run dev' to generate Nuxt artifacts"
    echo "3. Check VSCode output panel for specific error messages"
    echo "4. Ensure you have the correct Volar extension installed"
else
    echo ""
    echo "🔧 Recommended Fixes:"
    echo "1. Fix the $issues_found configuration issues above"
    echo "2. Restart VSCode/Cursor after making changes"
    echo "3. Run 'pnpm run dev' to regenerate Nuxt artifacts"
    echo "4. Ensure only 'Vue - Official' extension is installed"
fi

echo ""
echo "🎯 For more detailed troubleshooting, check:"
echo "- VSCode Output panel (View → Output)"
echo "- Volar extension output"
echo "- TypeScript server logs"
echo "- ESLint output"

echo ""
echo "📚 Reference: .vscode/README.md contains Volar troubleshooting guide"