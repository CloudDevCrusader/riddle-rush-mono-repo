#!/bin/bash
set -e

echo "🔍 Diagnosing TypeScript issues in .ts files..."
echo ""

# Test 1: Check TypeScript version consistency
echo "Test 1: Checking TypeScript version consistency..."

# Check root package.json
root_ts_version=$(grep -E '"typescript"' package.json | head -1 | sed 's/.*"typescript": "\([^"]*\)".*/\1/')
echo "Root TypeScript version: ${root_ts_version}"

# Check game app package.json
game_ts_version=$(grep -E '"typescript"' apps/game/package.json | head -1 | sed 's/.*"typescript": "\([^"]*\)".*/\1/')
echo "Game app TypeScript version: ${game_ts_version}"

# Check if versions match
if [[ "${root_ts_version}" = "${game_ts_version}" ]]; then
	echo "✅ TypeScript versions are consistent"
else
	echo "❌ ISSUE FOUND: TypeScript version mismatch between root and game app"
	echo "   Root: ${root_ts_version}"
	echo "   Game: ${game_ts_version}"
	echo "   Fix: Align TypeScript versions in package.json files"
fi

# Check what TypeScript version is actually installed
if [[ -f "node_modules/typescript/package.json" ]]; then
	installed_ts_version=$(grep -E '"version"' node_modules/typescript/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
	echo "Installed TypeScript version: ${installed_ts_version}"
else
	echo "⚠️  TypeScript not installed in root node_modules"
fi

# Check if Nuxt is using a different TypeScript version
if grep -q "typescript@5.9" apps/game/.nuxt/tsconfig.app.json; then
	echo "❌ ISSUE FOUND: Nuxt is using TypeScript 5.9.x but project is configured fo${ $root_ts_versi}on"
	echo "   This can cause type checking inconsistencies"
	echo "   Fix: Update project TypeScript version to match Nuxt's requirement"
fi

echo ""

# Test 2: Check tsconfig.json inheritance chain
echo "Test 2: Checking tsconfig.json inheritance chain..."

if [[ -f "tsconfig.json" ]]; then
	echo "✅ Root tsconfig.json found"

	# Check if it has proper extends
	if grep -q "extends" tsconfig.json; then
		echo "✅ Root tsconfig has extends (or is base config)"
	else
		echo "ℹ️  Root tsconfig is a base configuration"
	fi
else
	echo "❌ Root tsconfig.json missing"
fi

if [[ -f "apps/game/tsconfig.json" ]]; then
	echo "✅ Game app tsconfig.json found"

	# Check if it extends properly
	if grep -q "extends" apps/game/tsconfig.json; then
		echo "✅ Game tsconfig extends base configuration"

		# Check what it extends
		extends_line=$(grep "extends" apps/game/tsconfig.json)
		echo "   Extends: ${extends_line}"

		# Check if the extended files exist
		extended_files=$(echo "${extends_line}" | sed 's/.*extends": \[\(.*\)\].*/\1/' | tr -d '"[] ,')
		for file in ${extended_files}; do
			if [[ -f "${file}" ]]; then
				echo "   ✅ Extended file exists${ $fi}le"
			else
				echo "   ❌ Extended file missing${ $fi}le"
			fi
		done
	else
		echo "⚠️  Game tsconfig doesn't extend any base configuration"
	fi
else
	echo "❌ Game app tsconfig.json missing"
fi

echo ""

# Test 3: Check TypeScript compiler options
echo "Test 3: Checking TypeScript compiler options..."

if [[ -f "tsconfig.json" ]]; then
	# Check module resolution
	if grep -q '"moduleResolution": "bundler"' tsconfig.json; then
		echo "✅ Module resolution is correctly set to 'bundler'"
	else
		echo "⚠️  Module resolution might not be optimal for Nuxt"
	fi

	# Check strict mode
	if grep -q '"strict": true' tsconfig.json; then
		echo "✅ Strict mode is enabled"
	else
		echo "⚠️  Strict mode is not enabled"
	fi

	# Check baseUrl
	if grep -q '"baseUrl"' tsconfig.json; then
		echo "✅ baseUrl is configured"
	else
		echo "⚠️  baseUrl is not configured"
	fi

	# Check paths
	if grep -q '"paths"' tsconfig.json; then
		echo "✅ Path aliases are configured"
	else
		echo "⚠️  Path aliases are not configured"
	fi
else
	echo "❌ Cannot check compiler options - tsconfig.json missing"
fi

echo ""

# Test 4: Check for common TypeScript + Nuxt issues
echo "Test 4: Checking for common TypeScript + Nuxt compatibility issues..."

# Check if @types/node is installed
if grep -q "@types/node" package.json; then
	echo "✅ @types/node is installed"
else
	echo "⚠️  @types/node not found - may need for Node.js types"
fi

# Check if vue-tsc is installed
if grep -q "vue-tsc" apps/game/package.json; then
	echo "✅ vue-tsc is installed (good for Vue + TypeScript)"
else
	echo "⚠️  vue-tsc not found - consider installing"
fi

# Check for common problematic compiler options
if [[ -f "tsconfig.json" ]]; then
	if grep -q '"noImplicitAny": true' tsconfig.json; then
		echo "ℹ️  noImplicitAny is enabled (can cause more type errors)"
	fi

	if grep -q '"noUncheckedIndexedAccess": true' tsconfig.json; then
		echo "ℹ️  noUncheckedIndexedAccess is enabled (can cause more type errors)"
	fi

	if grep -q '"exactOptionalPropertyTypes": true' tsconfig.json; then
		echo "ℹ️  exactOptionalPropertyTypes is enabled (can cause more type errors)"
	fi
fi

echo ""

# Test 5: Check for missing type definitions
echo "Test 5: Checking for missing type definitions..."

# Check if there are any .d.ts files that might be missing
if [[ -f "apps/game/nuxt.d.ts" ]]; then
	echo "✅ Nuxt type declarations found"
else
	echo "⚠️  Nuxt type declarations missing - may need to run dev/build"
fi

# Check if there are type definition files in the project
if find apps/game -name "*.d.ts" -not -path "*/node_modules/*" -not -path "*/.nuxt/*" | grep -q .; then
	echo "✅ Custom type definition files found"
else
	echo "ℹ️  No custom type definition files found"
fi

echo ""

# Test 6: Check TypeScript language server issues
echo "Test 6: Checking for TypeScript language server issues..."

# Check if the project is using workspace TypeScript
if [[ -f ".vscode/settings.json" ]]; then
	if grep -q "typescript.tsdk" ".vscode/settings.json"; then
		tsdk_setting=$(grep "typescript.tsdk" ".vscode/settings.json")
		echo "✅ TypeScript SDK setting found${ $tsdk_setti}ng"

		if echo "${tsdk_setting}" | grep -q "node_modules/typescript"; then
			echo "✅ Using workspace TypeScript version"
		else
			echo "⚠️  Not using workspace TypeScript version"
		fi
	else
		echo "⚠️  TypeScript SDK setting not configured in VSCode"
	fi
else
	echo "⚠️  VSCode settings not found"
fi

echo ""

# Test 7: Check for import path issues
echo "Test 7: Checking for common import path issues..."

# Check if the project uses path aliases
if [[ -f "tsconfig.json" ]] && grep -q '"paths"' tsconfig.json; then
	echo "✅ Path aliases are configured in tsconfig.json"

	# Check if VSCode is configured to understand the aliases
	if [[ -f ".vscode/settings.json" ]]; then
		if grep -q "typescript.tsdk" ".vscode/settings.json"; then
			echo "✅ VSCode is configured for TypeScript"
		else
			echo "⚠️  VSCode may not be properly configured for path aliases"
		fi
	fi
else
	echo "ℹ️  No path aliases configured"
fi

echo ""

# Test 8: Check for monorepo-specific issues
echo "Test 8: Checking for monorepo-specific TypeScript issues..."

# Check if there are multiple TypeScript versions in the monorepo
if [[ -f "apps/game/node_modules/typescript/package.json" ]]; then
	game_installed_ts=$(grep -E '"version"' apps/game/node_modules/typescript/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
	echo "Game app TypeScript version: ${game_installed_ts}"

	if [[ -f "node_modules/typescript/package.json" ]]; then
		root_installed_ts=$(grep -E '"version"' node_modules/typescript/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
		echo "Root TypeScript version: ${root_installed_ts}"

		if [[ "${game_installed_ts}" != "${root_installed_ts}" ]]; then
			echo "❌ ISSUE FOUND: Different TypeScript versions in monorepo"
			echo "   Game: ${game_installed_ts}"
			echo "   Root: ${root_installed_ts}"
			echo "   Fix: Ensure consistent TypeScript version across monorepo"
		fi
	fi
fi

echo ""

echo "📋 Summary of TypeScript Issues Found:"
echo ""

issues_found=0

# Check for TypeScript version mismatch
if [[ -n "${root_ts_version}" ]] && [[ -n "${game_ts_version}" ]] && [[ "${root_ts_version}" != "${game_ts_version}" ]]; then
	echo "1. TypeScript version mismatch between root and game app"
	issues_found=$((issues_found + 1))
fi

# Check if Nuxt is using different TypeScript version
if grep -q "typescript@5.9" apps/game/.nuxt/tsconfig.app.json 2>/dev/null; then
	echo "2. Nuxt using TypeScript 5.9.x but project configured for different version"
	issues_found=$((issues_found + 1))
fi

# Check for monorepo TypeScript version issues
if [[ -f "apps/game/node_modules/typescript/package.json" ]] && [[ -f "node_modules/typescript/package.json" ]]; then
	game_ts=$(grep -E '"version"' apps/game/node_modules/typescript/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
	root_ts=$(grep -E '"version"' node_modules/typescript/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
	if [[ "${game_ts}" != "${root_ts}" ]]; then
		echo "3. Different TypeScript versions installed in monorepo"
		issues_found=$((issues_found + 1))
	fi
fi

if [[ "$issues_found" -eq 0 ]]; then
	echo "✅ No obvious TypeScript configuration issues found!"
	echo ""
	echo "If you're still seeing TypeScript errors, they may be:"
	echo "1. Genuine type errors that need to be fixed"
	echo "2. Temporary issues that can be resolved by:"
	echo "   - Restarting VSCode/Cursor"
	echo "   - Running 'pnpm run dev' to regenerate Nuxt types"
	echo "   - Running 'pnpm exec vue-tsc --noEmit' to check types"
	echo "   - Clearing TypeScript cache"
else
	echo ""
	echo "🔧 Recommended Fixes:"
	echo "1. Align TypeScript versions across the project"
	echo "2. Update package.json to use consistent TypeScript version"
	echo "3. Run 'pnpm install' to ensure consistent dependencies"
	echo "4. Restart VSCode/Cursor after making changes"
	echo "5. Run 'pnpm run dev' to regenerate Nuxt types"
fi

echo ""

echo "🎯 TypeScript Troubleshooting Commands:"
echo ""
echo "# Check TypeScript version"
echo "pnpm list typescript"
echo ""
echo "# Run TypeScript check"
echo "cd apps/game && pnpm exec vue-tsc --noEmit"
echo ""
echo "# Clear TypeScript cache"
echo "rm -rf node_modules/.cache/typescript"
echo ""
echo "# Regenerate Nuxt types"
echo "rm -rf apps/game/.nuxt && pnpm run dev"
echo ""
echo "# Check for specific type errors"
echo "pnpm exec tsc --noEmit --skipLibCheck"

echo ""
echo "📚 Reference:"
echo "- TypeScript + Nuxt Guide: https://nuxt.com/docs/guide/concepts/typescript"
echo "- Vue + TypeScript Guide: https://vuejs.org/guide/typescript/overview.html"
echo "- Monorepo TypeScript: https://www.typescriptlang.org/docs/handbook/project-references.html"
