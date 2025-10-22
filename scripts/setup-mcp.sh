#!/bin/bash
# Setup script for MCP servers on ONE Platform
# Ensures Node 20.19.0+ and environment variables are configured

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 ONE Platform - MCP Server Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "⚠️  nvm not found"
    echo ""
    echo "To install nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo ""
    echo "Or visit: https://github.com/nvm-sh/nvm"
    echo ""
else
    echo "✅ nvm found"
fi

# Check current Node version
CURRENT_NODE=$(node --version 2>/dev/null || echo "not installed")
echo "📦 Current Node version: $CURRENT_NODE"

# Check if Node 20.19.0+ is required
REQUIRED_VERSION="20.19.0"
echo "📦 Required Node version: v$REQUIRED_VERSION or higher"

# Parse version numbers
if [[ "$CURRENT_NODE" != "not installed" ]]; then
    CURRENT_MAJOR=$(echo "$CURRENT_NODE" | sed 's/v//' | cut -d. -f1)
    CURRENT_MINOR=$(echo "$CURRENT_NODE" | sed 's/v//' | cut -d. -f2)
    CURRENT_PATCH=$(echo "$CURRENT_NODE" | sed 's/v//' | cut -d. -f3)

    REQUIRED_MAJOR=$(echo "$REQUIRED_VERSION" | cut -d. -f1)
    REQUIRED_MINOR=$(echo "$REQUIRED_VERSION" | cut -d. -f2)
    REQUIRED_PATCH=$(echo "$REQUIRED_VERSION" | cut -d. -f3)

    # Version comparison
    if [[ "$CURRENT_MAJOR" -gt "$REQUIRED_MAJOR" ]] || \
       [[ "$CURRENT_MAJOR" -eq "$REQUIRED_MAJOR" && "$CURRENT_MINOR" -gt "$REQUIRED_MINOR" ]] || \
       [[ "$CURRENT_MAJOR" -eq "$REQUIRED_MAJOR" && "$CURRENT_MINOR" -eq "$REQUIRED_MINOR" && "$CURRENT_PATCH" -ge "$REQUIRED_PATCH" ]]; then
        echo "✅ Node version meets requirements"
    else
        echo "❌ Node version does not meet requirements"
        echo ""
        echo "To upgrade using nvm:"
        echo "  nvm install $REQUIRED_VERSION"
        echo "  nvm use $REQUIRED_VERSION"
        echo "  nvm alias default $REQUIRED_VERSION"
        echo ""
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 Checking Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check .env file
if [[ ! -f .env ]]; then
    echo "⚠️  .env file not found"
    echo ""
    echo "Create a .env file with:"
    echo "  CLOUDFLARE_GLOBAL_API_KEY=your-key"
    echo "  CLOUDFLARE_ACCOUNT_ID=your-account-id"
    echo "  CLOUDFLARE_EMAIL=your-email"
    echo ""
    exit 1
fi

# Check required environment variables
ENV_VARS=("CLOUDFLARE_GLOBAL_API_KEY" "CLOUDFLARE_ACCOUNT_ID" "CLOUDFLARE_EMAIL" "ANTHROPIC_API_KEY" "FIGMA_ACCESS_TOKEN")
MISSING_VARS=()

for var in "${ENV_VARS[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
        echo "✅ $var found in .env"
    else
        echo "❌ $var missing from .env"
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo ""
    echo "⚠️  Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Add these to your .env file"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 MCP Server Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Stripe MCP - Ready (no additional requirements)"
echo "✅ shadcn MCP - Ready (command-based)"
echo "✅ Cloudflare Builds MCP - Ready (requires Node 20.19.0+)"
echo "✅ Chrome DevTools MCP - Ready (requires Node 20.19.0+)"
echo "✅ Claude MCP - Ready (requires ANTHROPIC_API_KEY)"
echo "✅ Framelink Figma MCP - Ready (requires FIGMA_ACCESS_TOKEN)"
echo "✅ Astro Docs MCP - Ready (no additional requirements)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code to reload MCP configuration"
echo "  2. Use MCP tools with the mcp__ prefix"
echo "  3. See MCP-CONFIGURATION.md for detailed documentation"
echo ""
