#!/bin/bash

# Track Changes Hook - ONE Platform
# Helps users of the template track their customizations
# Groups changes by: template (/web, /one, /.claude) vs custom (everything else)
# Works regardless of what the user names their custom directories

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
CHANGES_LOG="$PROJECT_DIR/one/events/0-changes.md"

# Get commit info
COMMIT_SHORT=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B | head -1)
COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)

# Function to count changes in a directory
count_dir_changes() {
  local dir="$1"
  echo "$COMMIT_FILES" | grep "^$dir/" | wc -l | xargs
}

# Count template changes (these are in every clone)
CHANGES_WEB=$(count_dir_changes "web")
CHANGES_ONE=$(count_dir_changes "one")
CHANGES_CLAUDE=$(count_dir_changes ".claude")

# Count known custom directories
CHANGES_ONE_IE=$(count_dir_changes "one.ie")
CHANGES_CLI=$(count_dir_changes "cli")

# Count unknown directories (user's custom directories)
CHANGES_CUSTOM=0
while IFS= read -r file; do
  # Skip template directories
  if [[ ! "$file" =~ ^(web|one|\.claude)/ ]]; then
    # Skip known custom dirs too
    if [[ ! "$file" =~ ^(one\.ie|cli)/ ]]; then
      CHANGES_CUSTOM=$((CHANGES_CUSTOM + 1))
    fi
  fi
done <<< "$COMMIT_FILES"

# Build summary (template first, then custom)
SUMMARY=""
[ "$CHANGES_WEB" -gt 0 ] && SUMMARY+="web:$CHANGES_WEB "
[ "$CHANGES_ONE" -gt 0 ] && SUMMARY+="one:$CHANGES_ONE "
[ "$CHANGES_CLAUDE" -gt 0 ] && SUMMARY+=".claude:$CHANGES_CLAUDE "

CUSTOM_SUMMARY=""
[ "$CHANGES_ONE_IE" -gt 0 ] && CUSTOM_SUMMARY+="one.ie:$CHANGES_ONE_IE "
[ "$CHANGES_CLI" -gt 0 ] && CUSTOM_SUMMARY+="cli:$CHANGES_CLI "
[ "$CHANGES_CUSTOM" -gt 0 ] && CUSTOM_SUMMARY+="custom:$CHANGES_CUSTOM "

SUMMARY=$(echo "$SUMMARY" | xargs)
CUSTOM_SUMMARY=$(echo "$CUSTOM_SUMMARY" | xargs)

# Format: template changes | custom changes (if any)
if [ -n "$CUSTOM_SUMMARY" ]; then
  if [ -n "$SUMMARY" ]; then
    FULL_SUMMARY="$SUMMARY | $CUSTOM_SUMMARY [customization]"
  else
    FULL_SUMMARY="$CUSTOM_SUMMARY [customization]"
  fi
else
  FULL_SUMMARY="$SUMMARY"
fi

# Create compact markdown entry
ENTRY="**$COMMIT_SHORT** — $FULL_SUMMARY — \`$COMMIT_MSG\`

"

# Create one/events directory if it doesn't exist
mkdir -p "$(dirname "$CHANGES_LOG")" 2>/dev/null

# Initialize changes log if it doesn't exist
if [ ! -f "$CHANGES_LOG" ]; then
  cat > "$CHANGES_LOG" << 'EOF'
# Change Tracking

Track template upgrades vs your customizations. Updated on each commit.

**Format:** `template-changes | your-custom-changes [customization] — message`

| Tag | Meaning |
|-----|---------|
| `[customization]` | Your custom directories changed |
| No tag | Only template or documentation changes |

**Examples:**
- `web:2 one:1 — Add new component` — Template only
- `one.ie:3 [customization] — Update home page` — Your customizations
- `web:1 | one.ie:2 [customization] — Sync with template + update site` — Both

---

EOF
fi

# Prepend new entry to changes log (newest first)
{
  echo "$ENTRY"
  cat "$CHANGES_LOG"
} > "$CHANGES_LOG.tmp" && mv "$CHANGES_LOG.tmp" "$CHANGES_LOG" 2>/dev/null

exit 0
