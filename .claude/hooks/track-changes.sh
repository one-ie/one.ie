#!/bin/bash

# Track Changes Hook - ONE Platform
# Groups commit changes by directory (/web, /one, /.claude, /one.ie, /cli)
# Minimal context output, graceful fallbacks

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

# Get changes per directory
CHANGES_WEB=$(count_dir_changes "web")
CHANGES_ONE=$(count_dir_changes "one")
CHANGES_CLAUDE=$(count_dir_changes ".claude")
CHANGES_ONE_IE=$(count_dir_changes "one.ie")
CHANGES_CLI=$(count_dir_changes "cli")

# Build summary (only show non-zero dirs)
SUMMARY=""
[ "$CHANGES_WEB" -gt 0 ] && SUMMARY+="web: +$CHANGES_WEB "
[ "$CHANGES_ONE" -gt 0 ] && SUMMARY+="one: +$CHANGES_ONE "
[ "$CHANGES_CLAUDE" -gt 0 ] && SUMMARY+=".claude: +$CHANGES_CLAUDE "
[ "$CHANGES_ONE_IE" -gt 0 ] && SUMMARY+="one.ie: +$CHANGES_ONE_IE "
[ "$CHANGES_CLI" -gt 0 ] && SUMMARY+="cli: +$CHANGES_CLI "

# Trim whitespace
SUMMARY=$(echo "$SUMMARY" | xargs)

# Create compact markdown entry
ENTRY="**$COMMIT_SHORT** — $SUMMARY — \`$COMMIT_MSG\`

"

# Create one/events directory if it doesn't exist
mkdir -p "$(dirname "$CHANGES_LOG")" 2>/dev/null

# Initialize changes log if it doesn't exist
if [ ! -f "$CHANGES_LOG" ]; then
  cat > "$CHANGES_LOG" << 'EOF'
# Change Tracking

Grouped by directory. Updated on each commit.

---

EOF
fi

# Prepend new entry to changes log (newest first)
{
  echo "$ENTRY"
  cat "$CHANGES_LOG"
} > "$CHANGES_LOG.tmp" && mv "$CHANGES_LOG.tmp" "$CHANGES_LOG" 2>/dev/null

exit 0
