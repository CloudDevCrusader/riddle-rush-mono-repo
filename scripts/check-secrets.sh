#!/bin/bash
# Scan staged files for potential secrets/credentials

RED='\033[0;31m'
NC='\033[0m'

PATTERNS=(
	# API Keys
	'api[_-]?key\s*[=:]\s*["\x27][a-zA-Z0-9]{16,}'
	'apikey\s*[=:]\s*["\x27][a-zA-Z0-9]{16,}'

	# AWS
	'AKIA[0-9A-Z]{16}'
	# Match AWS secret access key assignments with actual values (not variable references or placeholders)
	# Excludes lines where value starts with $ (variable reference) or < (placeholder like <YOUR_SECRET_KEY>)
	'aws[_-]?secret[_-]?access[_-]?key\s*[=:]\s*[^$<][^=]{15,}'

	# Private keys
	'-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'

	# Tokens
	'token\s*[=:]\s*["\x27][a-zA-Z0-9_-]{20,}'
	'bearer\s+[a-zA-Z0-9_-]{20,}'

	# Passwords
	'password\s*[=:]\s*["\x27][^\s"'\'']{8,}'
	'passwd\s*[=:]\s*["\x27][^\s"'\'']{8,}'
	'pwd\s*[=:]\s*["\x27][^\s"'\'']{8,}'

	# Database URLs with credentials
	'(mysql|postgres|mongodb|redis)://[^:]+:[^@]+@'

	# GitHub/GitLab tokens
	'gh[pousr]_[A-Za-z0-9_]{36,}'
	'glpat-[A-Za-z0-9_-]{20,}'

	# Slack
	'xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}'

	# Generic secrets
	'secret\s*[=:]\s*["\x27][a-zA-Z0-9_-]{16,}'
	'client[_-]?secret\s*[=:]\s*["\x27][a-zA-Z0-9_-]{16,}'
)

# Files to ignore
IGNORE_FILES=(
	"*.lock"
	"package-lock.json"
	"*.md"
	"check-secrets.sh"
	".env.example"
)

check_file() {
	local file="$1"

	# Skip ignored files
	for pattern in "${IGNORE_FILES[@]}"; do
		if [[ ${file} == ${pattern} ]]; then
			return 0
		fi
	done

	# Skip if file doesn't exist
	[[ -f ${file} ]] || return 0

	# Placeholder patterns to ignore (obvious fake credentials)
	local placeholder_patterns='<YOUR_|YOUR_.*_HERE|REPLACE_ME|CHANGE_ME|EXAMPLE_'

	for pattern in "${PATTERNS[@]}"; do
		# Get matching lines and filter out placeholders in one go
		matches=$(grep -niE "${pattern}" "${file}" 2>/dev/null | grep -viE "${placeholder_patterns}")
		
		if [[ -n ${matches} ]]; then
			echo -e "${RED}BLOCKED${NC}: Potential secret found in ${file}"
			echo "Pattern: ${pattern}"
			echo "${matches}" | head -3
			return 1
		fi
	done

	return 0
}

main() {
	local exit_code=0

	# Get staged files or all tracked files
	if git rev-parse --git-dir >/dev/null 2>&1; then
		files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null)
		if [[ -z ${files} ]]; then
			files=$(git diff --name-only HEAD 2>/dev/null)
		fi
	else
		echo "Not a git repository"
		exit 0
	fi

	if [[ -z ${files} ]]; then
		exit 0
	fi

	for file in ${files}; do
		if ! check_file "${file}"; then
			exit_code=1
		fi
	done

	if [[ ${exit_code} -ne 0 ]]; then
		echo ""
		echo -e "${RED}Commit blocked!${NC} Remove secrets before committing."
		echo "If this is a false positive, use: git commit --no-verify"
	fi

	exit "${exit_code}"
}

main
