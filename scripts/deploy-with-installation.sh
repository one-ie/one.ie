#!/bin/bash
set -e

# Deploy ONE Platform with installation folder
# Usage: ./scripts/deploy-with-installation.sh [installation-name]

INSTALLATION_NAME="${1:-one-group}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying ONE Platform"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installation: ${INSTALLATION_NAME}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check for installation folder
if [ -d "/${INSTALLATION_NAME}" ]; then
  echo "✅ Installation folder found: /${INSTALLATION_NAME}"
  export INSTALLATION_NAME="${INSTALLATION_NAME}"
  export PUBLIC_INSTALLATION_NAME="${INSTALLATION_NAME}"
else
  echo "⚠️ Installation folder not found: /${INSTALLATION_NAME}"
  echo "   Using global /one/ templates only"
  unset INSTALLATION_NAME
  unset PUBLIC_INSTALLATION_NAME
fi

# 2. Build web
echo ""
echo "📦 Building web application..."
cd web
bun install
bun run build

# 3. Deploy to Cloudflare Pages
echo ""
echo "☁️ Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=web

# 4. Deploy backend to Convex
echo ""
echo "🔄 Deploying backend to Convex..."
cd ../backend
npx convex deploy

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Web: https://web.one.ie"
echo "Backend: https://shocking-falcon-870.convex.cloud"
if [ ! -z "${INSTALLATION_NAME}" ]; then
  echo "Installation: /${INSTALLATION_NAME}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
