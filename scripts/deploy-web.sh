#!/usr/bin/env bash

# Deploy web starter template to Cloudflare Pages
# Uses wrangler CLI with explicit credentials

set -e

echo "🚀 Deploying web to Cloudflare Pages..."

# Load credentials from .env
if [ -f .env ]; then
    source .env
fi

# Validate credentials
if [ -z "$CLOUDFLARE_GLOBAL_API_KEY" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_EMAIL" ]; then
    echo "❌ Missing Cloudflare credentials in .env"
    echo "Required: CLOUDFLARE_GLOBAL_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_EMAIL"
    exit 1
fi

# Get script directory and navigate to root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR" || exit 1

# Navigate to web directory
cd web || exit 1

# Build the site
echo "📦 Building web..."
bun run build

# Deploy using wrangler with explicit credentials
echo "☁️  Deploying to Cloudflare Pages..."
unset CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID
export CLOUDFLARE_EMAIL
export CLOUDFLARE_GLOBAL_API_KEY

wrangler pages deploy dist --project-name=web --branch=main

echo "✅ Deployment complete!"
echo "🌐 Site: https://web.one.ie"
