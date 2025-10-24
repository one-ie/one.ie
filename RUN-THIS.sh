#!/bin/bash

# Quick setup for apps/oneie
# Copy and paste these commands into your terminal

cd /Users/toc/Server/ONE

# 1. Create directory
mkdir -p apps/oneie

# 2. Initialize git
cd apps/oneie
git init
git remote add origin https://github.com/one-ie/oneie.git

# 3. Create structure
cd /Users/toc/Server/ONE
mkdir -p apps/oneie/one/.claude
mkdir -p apps/oneie/web

# 4. Sync files
rsync -av --delete --exclude='.DS_Store' --exclude='.git' one/ apps/oneie/one/
rsync -av --delete --exclude='.DS_Store' .claude/ apps/oneie/one/.claude/
rsync -av --delete --exclude='node_modules' --exclude='dist' --exclude='.env' --exclude='.env.local' --exclude='.git' web/ apps/oneie/web/

# 5. Copy environment and docs
cp web/.env.main apps/oneie/web/.env.local
cp CLAUDE.md README.md LICENSE.md SECURITY.md apps/oneie/one/
cp web/AGENTS.md apps/oneie/one/AGENTS.md

# 6. Commit
cd apps/oneie
git add -A
git commit -m "chore: initialize oneie repository for one.ie deployment"

# 7. Push
git push -u origin main

echo "✅ Done! Repository pushed to one-ie/oneie"
