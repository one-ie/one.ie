#!/bin/bash

# ============================================================
# Fast Commit + Push Script
# ============================================================
# Quickly stage, commit, and push changes
# Usage: ./.claude/hooks/commit-push.sh "commit message"
#
# Examples:
#   ./.claude/hooks/commit-push.sh "quick fix"
#   ./.claude/hooks/commit-push.sh "update docs"
# ============================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get commit message
COMMIT_MSG="${1:-chore: quick update}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Fast Commit + Push${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check for changes
echo -e "${BLUE}Step 1: Check for changes${NC}"
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}⚠ No changes to commit${NC}"
    exit 0
fi
CHANGE_COUNT=$(git status -s | wc -l)
echo -e "${GREEN}✓ Found ${CHANGE_COUNT} file(s) to commit${NC}"
echo ""

# Step 2: Stage changes
echo -e "${BLUE}Step 2: Stage all changes${NC}"
git add -A
echo -e "${GREEN}✓ Changes staged${NC}"
echo ""

# Step 3: Commit
echo -e "${BLUE}Step 3: Create commit${NC}"
git commit -m "$(cat <<EOF
${COMMIT_MSG}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
COMMIT_HASH=$(git log -1 --format="%h")
echo -e "${GREEN}✓ Committed: ${COMMIT_HASH}${NC}"
echo ""

# Step 4: Push
echo -e "${BLUE}Step 4: Push to origin${NC}"
git push origin main
echo -e "${GREEN}✓ Pushed to origin/main${NC}"
echo ""

# Step 5: Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Commit + Push Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  📝 Commit: ${COMMIT_HASH}"
echo "  📦 Files: ${CHANGE_COUNT}"
echo "  ✅ Status: Synced to origin/main"
echo ""
