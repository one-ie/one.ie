#!/bin/bash

# Track Changes Hook - ONE Platform
# Tracks file changes and commits, stores them in one/events/0-changes.md
# Triggered on post-commit to capture what was just committed

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
CHANGES_LOG="$PROJECT_DIR/one/events/0-changes.md"
HOOK_LOG_FILE="${HOOK_LOG_FILE:-$PROJECT_DIR/.claude/hooks.log}"

# Source hook logger for logging functions
if [ -f "$PROJECT_DIR/.claude/hooks/hook-logger.sh" ]; then
  source "$PROJECT_DIR/.claude/hooks/hook-logger.sh"
fi

# Create one/events directory if it doesn't exist
mkdir -p "$(dirname "$CHANGES_LOG")"

# Get the latest commit info
COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_SHORT=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_AUTHOR=$(git log -1 --pretty=%an)
COMMIT_DATE=$(git log -1 --pretty=%ai)
COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD)
COMMIT_STATS=$(git diff --stat HEAD~1..HEAD 2>/dev/null)

# Count files changed
FILE_COUNT=$(echo "$COMMIT_FILES" | wc -l | xargs)

# Create markdown entry for this commit
ENTRY="## $COMMIT_SHORT - $(date '+%Y-%m-%d %H:%M:%S')

**Author:** $COMMIT_AUTHOR
**Date:** $COMMIT_DATE
**Message:** $COMMIT_MSG
**Files Changed:** $FILE_COUNT

### Changed Files

\`\`\`
$COMMIT_FILES
\`\`\`

### Statistics

\`\`\`
$COMMIT_STATS
\`\`\`

---

"

# Initialize changes log if it doesn't exist
if [ ! -f "$CHANGES_LOG" ]; then
  cat > "$CHANGES_LOG" << 'EOF'
# Change Tracking Log

This file automatically tracks all commits to the ONE Platform repository.
Updated on each commit via `.claude/hooks/track-changes.sh`.

---

EOF
fi

# Prepend new entry to changes log (newest first)
{
  echo "$ENTRY"
  cat "$CHANGES_LOG"
} > "$CHANGES_LOG.tmp" && mv "$CHANGES_LOG.tmp" "$CHANGES_LOG"

# Log to hook logger if available
if [ -n "$log_message" ]; then
  log_message "INFO" "Tracked commit $COMMIT_SHORT with $FILE_COUNT files to one/events/0-changes.md"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] Tracked commit $COMMIT_SHORT with $FILE_COUNT files" >> "$HOOK_LOG_FILE"
fi

exit 0
