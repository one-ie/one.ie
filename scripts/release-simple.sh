#!/bin/bash

# ============================================================
# ONE Platform Simple Release Script
# ============================================================
# Simplified release for two-site architecture
# Usage: ./scripts/release-simple.sh [version_bump]
#   version_bump: major, minor, patch (optional)
#
# Examples:
#   ./scripts/release-simple.sh patch
#   ./scripts/release-simple.sh minor
#   ./scripts/release-simple.sh major
# ============================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Version bump (optional)
VERSION_BUMP="${1:-none}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   ONE Platform Release${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get script directory and navigate to root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR" || exit 1

# Step 1: Generate starter template from oneie
echo -e "${BLUE}Step 1: Generate starter template${NC}"
cd oneie
if ! bun run build:starter; then
    echo -e "${RED}✗ Failed to generate starter template${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Starter template generated${NC}"
echo ""

# Step 2: Commit oneie changes
echo -e "${BLUE}Step 2: Commit oneie (production site)${NC}"
cd oneie
if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "chore: update production site

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo -e "${GREEN}✓ oneie committed${NC}"
else
    echo -e "${YELLOW}⚠ No changes in oneie${NC}"
fi
cd ..
echo ""

# Step 3: Commit web changes (auto-generated)
echo -e "${BLUE}Step 3: Commit web (starter template)${NC}"
cd web
if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "chore: regenerate starter template from oneie

Auto-generated from oneie/ production site.

⚠️ This repository is AUTO-GENERATED. Do not edit directly.

Generated via: cd oneie && bun run build:starter

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo -e "${GREEN}✓ web committed${NC}"
else
    echo -e "${YELLOW}⚠ No changes in web${NC}"
fi
cd ..
echo ""

# Step 4: Version bump in CLI (if requested)
if [[ "$VERSION_BUMP" != "none" ]]; then
    echo -e "${BLUE}Step 4: Version bump (${VERSION_BUMP})${NC}"
    if [ -d "cli" ]; then
        cd cli
        OLD_VERSION=$(node -p "require('./package.json').version")
        npm version "$VERSION_BUMP" --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo -e "${GREEN}✓ Version bumped: ${OLD_VERSION} → ${NEW_VERSION}${NC}"
        cd ..
    else
        echo -e "${YELLOW}⚠ cli/ directory not found, skipping version bump${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠ Skipping version bump${NC}"
    echo ""
fi

# Step 5: Push to GitHub
echo -e "${BLUE}Step 5: Push to GitHub${NC}"

echo "Push oneie to GitHub? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    cd oneie
    git push origin main
    echo -e "${GREEN}✓ oneie pushed to GitHub${NC}"
    cd ..
fi

echo "Push web to GitHub? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    cd web
    git push origin main
    echo -e "${GREEN}✓ web pushed to GitHub${NC}"
    cd ..
fi
echo ""

# Step 6: Deploy to Cloudflare
echo -e "${BLUE}Step 6: Deploy to Cloudflare Pages${NC}"

echo "Deploy oneie to one.ie? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    ./scripts/deploy-oneie.sh
fi

echo ""
echo "Deploy web to web.one.ie? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    ./scripts/deploy-web.sh
fi
echo ""

# Step 7: Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Release Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📦 Sites:"
echo "  - oneie: https://one.ie"
echo "  - web: https://web.one.ie"
echo ""
echo "🔗 GitHub:"
echo "  - oneie: https://github.com/one-ie/oneie"
echo "  - web: https://github.com/one-ie/web"
echo ""
