#!/bin/bash

# Clean Markdown Hook - ONE Platform
# Moves unwanted markdown files from root and /web to .archive/
# Root allowed: README.md, CLAUDE.md, AGENTS.md, LICENSE.md, SECURITY.md
# /web allowed: README.md, CLAUDE.md, AGENTS.md, LICENSE.md, SECURITY.md
# Everything else moves to respective .archive/ directories

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

# Allowed files (same for both root and web)
ALLOWED_FILES=(
  "README.md"
  "CLAUDE.md"
  "AGENTS.md"
  "LICENSE.md"
  "SECURITY.md"
)

# Function to clean markdown files in a directory
clean_directory() {
  local dir="$1"
  local archive_dir="${dir}/.archive"

  if [ ! -d "$dir" ]; then
    return
  fi

  # Create archive directory if it doesn't exist
  mkdir -p "$archive_dir"

  # Find all markdown files in this directory (max depth 1)
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

      # Display relative path (macOS compatible)
      rel_file=${file#"$PROJECT_DIR/"}
      rel_archive_dir=${archive_dir#"$PROJECT_DIR/"}
      echo "Moving $rel_file → $rel_archive_dir/$new_name"

      mv "$file" "$archive_dir/$new_name"

      # Stage the changes for git
      git add -A "$file" "$archive_dir/$new_name" 2>/dev/null || true
    fi
  done < <(find "$dir" -maxdepth 1 -name "*.md" -type f)
}

# Clean root directory
clean_directory "$PROJECT_DIR"

# Clean /web directory
clean_directory "$PROJECT_DIR/web"

exit 0
