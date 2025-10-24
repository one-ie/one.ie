#!/bin/bash

# ============================================================
# Setup apps/oneie Repository
# ============================================================
# Creates apps/oneie directory and initializes it for deployment
# Usage: ./scripts/setup-oneie.sh
# ============================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Setup apps/oneie Repository${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get workspace root
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$WORKSPACE_ROOT"

echo -e "${CYAN}Workspace: $WORKSPACE_ROOT${NC}"
echo ""

# Step 1: Create apps/oneie directory
echo -e "${CYAN}Step 1: Creating apps/oneie directory...${NC}"
if [ -d "apps/oneie" ]; then
    echo "⚠️  apps/oneie already exists"
else
    mkdir -p apps/oneie
    echo -e "${GREEN}✓${NC} Created apps/oneie"
fi
echo ""

# Step 2: Initialize git repository
echo -e "${CYAN}Step 2: Initializing git repository...${NC}"
cd apps/oneie

if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
else
    git init
    echo -e "${GREEN}✓${NC} Initialized git repository"
fi

# Set remote
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists"
    CURRENT_REMOTE=$(git remote get-url origin)
    echo "   Current: $CURRENT_REMOTE"
    if [ "$CURRENT_REMOTE" != "https://github.com/one-ie/oneie.git" ]; then
        git remote set-url origin https://github.com/one-ie/oneie.git
        echo -e "${GREEN}✓${NC} Updated remote to one-ie/oneie"
    fi
else
    git remote add origin https://github.com/one-ie/oneie.git
    echo -e "${GREEN}✓${NC} Added remote: one-ie/oneie"
fi

cd "$WORKSPACE_ROOT"
echo ""

# Step 3: Sync files
echo -e "${CYAN}Step 3: Syncing files to apps/oneie...${NC}"

# Create directory structure
mkdir -p apps/oneie/one
mkdir -p apps/oneie/one/.claude
mkdir -p apps/oneie/web

# Sync /one directory
echo "Syncing: one/ → apps/oneie/one/"
rsync -av --delete \
    --exclude='.DS_Store' \
    --exclude='*.swp' \
    --exclude='*.tmp' \
    --exclude='.git' \
    one/ apps/oneie/one/
echo -e "${GREEN}✓${NC} Synced one/"

# Sync .claude directory
if [ -d ".claude" ]; then
    echo "Syncing: .claude/ → apps/oneie/one/.claude/"
    rsync -av --delete \
        --exclude='.DS_Store' \
        --exclude='*.swp' \
        --exclude='*.tmp' \
        .claude/ apps/oneie/one/.claude/
    echo -e "${GREEN}✓${NC} Synced .claude/"
fi

# Sync web directory
if [ -d "web" ]; then
    echo "Syncing: web/ → apps/oneie/web/"
    rsync -av --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.astro' \
        --exclude='.wrangler' \
        --exclude='.env' \
        --exclude='.env.local' \
        web/ apps/oneie/web/
    echo -e "${GREEN}✓${NC} Synced web/"
fi

# Copy environment file
if [ -f "web/.env.main" ]; then
    echo "Copying: web/.env.main → apps/oneie/web/.env.local"
    cp web/.env.main apps/oneie/web/.env.local
    echo -e "${GREEN}✓${NC} Copied environment file"
fi

# Copy core documentation files
for file in CLAUDE.md README.md LICENSE.md SECURITY.md; do
    if [ -f "$file" ]; then
        cp "$file" apps/oneie/one/
        echo -e "${GREEN}✓${NC} Copied $file"
    fi
done

# Copy AGENTS.md from web/
if [ -f "web/AGENTS.md" ]; then
    cp web/AGENTS.md apps/oneie/one/AGENTS.md
    echo -e "${GREEN}✓${NC} Copied AGENTS.md"
fi

echo ""

# Step 4: Create initial commit
echo -e "${CYAN}Step 4: Creating initial commit...${NC}"
cd apps/oneie

git add -A

if git diff --cached --quiet; then
    echo "⚠️  No changes to commit"
else
    git commit -m "chore: initialize oneie repository

✨ Repository Structure:
- one/ → ONE Platform documentation and ontology
- one/.claude/ → Claude Code configuration
- web/ → Astro 5 + React 19 frontend (with .env.main config)

🌐 Deployment:
- Cloudflare Pages project: oneie
- Domain: https://one.ie
- Purpose: Main platform site with full backend

📦 Sync Source:
- Files synced from ONE root repository
- Environment: web/.env.main → web/.env.local

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo -e "${GREEN}✓${NC} Created initial commit"
fi

cd "$WORKSPACE_ROOT"
echo ""

# Step 5: Push to GitHub
echo -e "${CYAN}Step 5: Push to one-ie/oneie...${NC}"
cd apps/oneie

echo "Current git status:"
git status --short
echo ""

read -p "Push to one-ie/oneie? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main
    echo -e "${GREEN}✓${NC} Pushed to one-ie/oneie"
else
    echo "⚠️  Skipped push. You can push later with:"
    echo "   cd apps/oneie && git push -u origin main"
fi

cd "$WORKSPACE_ROOT"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Repository: apps/oneie"
echo "Remote: one-ie/oneie"
echo "Structure:"
echo "  ├── one/          (documentation + ontology)"
echo "  ├── one/.claude/  (Claude Code config)"
echo "  └── web/          (Astro + React frontend)"
echo ""
echo "Next steps:"
echo "1. Verify repository: cd apps/oneie && git remote -v"
echo "2. Use release script: ./scripts/release.sh patch main"
echo "3. Deploy to Cloudflare: oneie project → one.ie"
echo ""
