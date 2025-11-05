#!/bin/bash

# Push to all remotes: main repo + subtrees + one.ie
# Usage: ./.claude/hooks/push.sh [all|main|one|web|oneie]
#
# CRITICAL: This script ALWAYS pulls before pushing to prevent branch divergence
# Rule: Always pull first, then push. Never push without pulling.

set -e

COMMAND="${1:-all}"

# ============================================================
# PULL FIRST - Prevent branch divergence
# ============================================================
pull_main() {
    echo "🔄 Pulling latest from origin/main..."
    if ! git pull origin main --ff-only 2>/dev/null; then
        echo "⚠️  Fast-forward pull failed (branches may be diverged)"
        echo "Attempting merge pull..."
        git pull origin main --no-rebase
    fi
    echo "✅ Pulled latest changes"
}

push_main() {
    # Pull first (CRITICAL - prevents divergence)
    pull_main
    echo ""
    echo "📤 Pushing main repo to origin (one-ie/one)..."
    git push origin main
    echo "✅ Main repo pushed"
}

push_one() {
    # Pull first (CRITICAL - prevents divergence)
    pull_main
    echo ""
    echo "📤 Pushing /one subtree to one-repo (one-ie/ontology)..."
    git push one-repo $(git subtree split --prefix one main):main --force
    echo "✅ /one subtree pushed"
}

push_web() {
    # Pull first (CRITICAL - prevents divergence)
    pull_main
    echo ""
    echo "📤 Pushing /web subtree to web-repo (one-ie/web)..."
    git push web-repo $(git subtree split --prefix web main):main --force
    echo "✅ /web subtree pushed"
}

push_oneie() {
    # Pull first (CRITICAL - prevents divergence)
    pull_main
    echo ""
    echo "📤 Pushing to one.ie repo (one-ie/one.ie)..."
    if [ -d "one.ie" ]; then
        cd one.ie
        # Pull in one.ie directory too
        git pull origin main --ff-only 2>/dev/null || git pull origin main --no-rebase
        git push origin main
        cd ..
        echo "✅ one.ie repo pushed"
    else
        echo "⚠️  one.ie directory not found, skipping"
    fi
}

case "$COMMAND" in
    all)
        push_main
        push_one
        push_web
        push_oneie
        echo "🎉 All remotes synced!"
        ;;
    main)
        push_main
        ;;
    one)
        push_one
        ;;
    web)
        push_web
        ;;
    oneie)
        push_oneie
        ;;
    *)
        echo "Usage: ./.claude/hooks/push.sh [all|main|one|web|oneie]"
        echo ""
        echo "Examples:"
        echo "  ./.claude/hooks/push.sh all        # Push to all remotes"
        echo "  ./.claude/hooks/push.sh main       # Push main repo only"
        echo "  ./.claude/hooks/push.sh one        # Push /one subtree only"
        echo "  ./.claude/hooks/push.sh web        # Push /web subtree only"
        echo "  ./.claude/hooks/push.sh oneie      # Push one.ie repo only"
        exit 1
        ;;
esac
