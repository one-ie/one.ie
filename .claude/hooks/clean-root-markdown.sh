#!/bin/bash

# Clean Root Markdown Hook - ONE Platform
# Moves unwanted markdown files from root to one/events/archived/
# Allowed files: README.md, CLAUDE.md, AGENTS.md, LICENSE.md, SECURITY.md
# Everything else moves to one/events/

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
ARCHIVE_DIR="$PROJECT_DIR/one/events/archived"

# Allowed files in root (only these are permitted)
ALLOWED_FILES=(
  "README.md"
  "CLAUDE.md"
  "AGENTS.md"
  "LICENSE.md"
  "SECURITY.md"
)

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Find all markdown files in root (max depth 1)
while IFS= read -r file; do
  filename=$(basename "$file")

  # Check if file is in allowed list
  is_allowed=0
  for allowed in "${ALLOWED_FILES[@]}"; do
    if [ "$filename" = "$allowed" ]; then
      is_allowed=1
      break
    fi
  done

  # If not allowed, move it
  if [ $is_allowed -eq 0 ]; then
    # Add timestamp to avoid collisions
    timestamp=$(date +%Y%m%d-%H%M%S)
    new_name="${filename%.md}-${timestamp}.md"

    echo "Moving $filename → one/events/archived/$new_name"
    mv "$file" "$ARCHIVE_DIR/$new_name"

    # Stage the changes for git
    git add -A "$file" "$ARCHIVE_DIR/$new_name" 2>/dev/null || true
  fi
done < <(find "$PROJECT_DIR" -maxdepth 1 -name "*.md" -type f)

exit 0
