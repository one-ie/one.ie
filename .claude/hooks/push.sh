#!/bin/bash

# Push to all remotes: main repo + subtrees + one.ie
# Usage: ./.claude/hooks/push.sh [all|main|one|web|oneie]

set -e

COMMAND="${1:-all}"

push_main() {
    echo "📤 Pushing main repo to origin (one-ie/one)..."
    git push origin main
    echo "✅ Main repo pushed"
}

push_one() {
    echo "📤 Pushing /one subtree to one-repo (one-ie/ontology)..."
    git push one-repo $(git subtree split --prefix one main):main --force
    echo "✅ /one subtree pushed"
}

push_web() {
    echo "📤 Pushing /web subtree to web-repo (one-ie/web)..."
    git push web-repo $(git subtree split --prefix web main):main --force
    echo "✅ /web subtree pushed"
}

push_oneie() {
    echo "📤 Pushing to one.ie repo (one-ie/one.ie)..."
    if [ -d "one.ie" ]; then
        cd one.ie
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
