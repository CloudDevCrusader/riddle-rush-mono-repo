#!/bin/bash
set -e

# Run nuxt prepare to generate types
nuxt prepare

# Add @ts-nocheck to pwa-icons-plugin.ts if it exists and doesn't already have it
if [[ -f .nuxt/pwa-icons-plugin.ts ]]; then
	if ! head -n 1 .nuxt/pwa-icons-plugin.ts | grep -q '@ts-nocheck'; then
		{ echo '// @ts-nocheck'; cat .nuxt/pwa-icons-plugin.ts; } > .nuxt/pwa-icons-plugin.tmp && mv .nuxt/pwa-icons-plugin.tmp .nuxt/pwa-icons-plugin.ts
	fi
fi

# Use vue-tsc directly to avoid nuxt typecheck regenerating files
vue-tsc --noEmit
