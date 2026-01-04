#!/usr/bin/env bash
# Scan staged files for potential secrets/credentials

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib.sh"
ensure_repo_root

PATTERNS=(
  # API Keys
  'api[_-]?key\s*[=:]\s*["\x27][a-zA-Z0-9]{16,}'
  'apikey\s*[=:]\s*["\x27][a-zA-Z0-9]{16,}'
  
  # AWS
  'AKIA[0-9A-Z]{16}'
  # Match AWS secret access key with actual value (not just variable name)
  # This pattern requires an actual value after = or :, not a variable reference
  'aws[_-]?secret[_-]?access[_-]?key\s*[=:]\s*["\x27]?[a-zA-Z0-9/+=]{20,}["\x27]?'
  
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

# Patterns to ignore (context-specific false positives)
# These patterns indicate the line is just exporting a variable, not setting a secret value
IGNORE_PATTERNS=(
  # Environment variable exports without values (just variable names)
  'export\s+[A-Z_]+=\$\{[A-Z_]+\}'
  'export\s+[A-Z_]+=\$[A-Z_]+'
  '[A-Z_]+=\$\{[A-Z_]+\}'
  '[A-Z_]+=\$[A-Z_]+'
)

check_file() {
  local file="$1"
  
  # Skip ignored files
  for pattern in "${IGNORE_FILES[@]}"; do
    if [[ "$file" == $pattern ]]; then
      return 0
    fi
  done
  
  # Skip if file doesn't exist
  [ -f "$file" ] || return 0
  
  for pattern in "${PATTERNS[@]}"; do
    # Check if pattern matches
    local matched_lines=$(grep -niE "$pattern" "$file" 2>/dev/null || true)
    if [ -n "$matched_lines" ]; then
      # Check each matched line to see if it's a false positive
      local has_real_secret=false
      while IFS= read -r line; do
        [ -z "$line" ] && continue
        local is_false_positive=false
        # Check if this line matches any ignore pattern (environment variable export)
        for ignore_pattern in "${IGNORE_PATTERNS[@]}"; do
          if echo "$line" | grep -qiE "$ignore_pattern" 2>/dev/null; then
            is_false_positive=true
            break
          fi
        done
        
        if [ "$is_false_positive" = false ]; then
          has_real_secret=true
          break
        fi
      done <<< "$matched_lines"
      
      if [ "$has_real_secret" = true ]; then
        echo -e "${RED}BLOCKED${NC}: Potential secret found in $file"
        echo "Pattern: $pattern"
        echo "$matched_lines" | head -3
        return 1
      fi
    fi
  done
  
  return 0
}

main() {
  local exit_code=0
  
  # Get staged files or all tracked files
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    log "Not a git repository"
    exit 0
  fi

  local files=()
  if git diff --cached --name-only --diff-filter=ACM -z >/dev/null 2>&1; then
    mapfile -d '' -t files < <(git diff --cached --name-only --diff-filter=ACM -z 2>/dev/null)
  fi

  if [ "${#files[@]}" -eq 0 ]; then
    mapfile -d '' -t files < <(git diff --name-only -z HEAD 2>/dev/null || true)
  fi

  if [ "${#files[@]}" -eq 0 ]; then
    exit 0
  fi

  for file in "${files[@]}"; do
    if ! check_file "$file"; then
      exit_code=1
    fi
  done
  
  if [ $exit_code -ne 0 ]; then
    log ""
    log "${RED}Commit blocked!${NC} Remove secrets before committing."
    log "If this is a false positive, use: git commit --no-verify"
  fi
  
  exit $exit_code
}

main
