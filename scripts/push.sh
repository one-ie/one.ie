#!/bin/bash

# Push to all remotes: main repo + subtrees
# Usage: ./scripts/push.sh [all|main|one|web]

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

case "$COMMAND" in
    all)
        push_main
        push_one
        push_web
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
    *)
        echo "Usage: ./scripts/push.sh [all|main|one|web]"
        echo ""
        echo "Examples:"
        echo "  ./scripts/push.sh all        # Push to all remotes"
        echo "  ./scripts/push.sh main       # Push main repo only"
        echo "  ./scripts/push.sh one        # Push /one subtree only"
        echo "  ./scripts/push.sh web        # Push /web subtree only"
        exit 1
        ;;
esac
