#!/bin/bash
# Pre-deployment check script
# Ensures the project can build successfully before deploying to Cloudflare Pages

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Pre-Deployment Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Change to web directory
cd "$(dirname "$0")/../web" || exit 1

echo ""
echo "📦 Step 1: Checking package-lock.json sync..."
if ! npm ci --dry-run > /dev/null 2>&1; then
  echo "❌ package-lock.json is out of sync with package.json"
  echo "   Regenerating package-lock.json..."
  rm -f package-lock.json
  npm install
  echo "✅ package-lock.json regenerated"
else
  echo "✅ package-lock.json is in sync"
fi

echo ""
echo "🔧 Step 2: Type checking..."
if ! bunx astro check --minimumSeverity error > /dev/null 2>&1; then
  echo "❌ Type errors detected"
  echo "   Run: bunx astro check"
  exit 1
else
  echo "✅ No critical type errors"
fi

echo ""
echo "🏗️  Step 3: Building production bundle..."
if ! bun run build > /dev/null 2>&1; then
  echo "❌ Build failed"
  echo "   Run: bun run build"
  exit 1
else
  echo "✅ Build succeeded"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All pre-deployment checks passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ready to deploy! Run:"
echo "  wrangler pages deploy dist"
echo ""
