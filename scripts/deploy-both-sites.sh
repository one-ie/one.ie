#!/usr/bin/env bash

# Deploy ONE Platform to Both Sites
# Deploys same build to one.ie (marketing) and web.one.ie (demo)

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
error() { echo -e "${RED}✗${NC} $*" >&2; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warning() { echo -e "${YELLOW}⚠${NC} $*"; }
info() { echo -e "${BLUE}ℹ${NC} $*"; }

# Validate environment
validate_env() {
    if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]] && [[ -z "${CLOUDFLARE_GLOBAL_API_KEY:-}" ]]; then
        error "Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_GLOBAL_API_KEY"
        echo ""
        echo "Add to .env:"
        echo "  CLOUDFLARE_API_TOKEN=your-token"
        echo "  CLOUDFLARE_ACCOUNT_ID=your-account-id"
        echo ""
        echo "Or use Global API Key:"
        echo "  CLOUDFLARE_GLOBAL_API_KEY=your-key"
        echo "  CLOUDFLARE_EMAIL=your-email"
        return 1
    fi

    if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
        error "Missing CLOUDFLARE_ACCOUNT_ID"
        return 1
    fi

    return 0
}

# Load environment
load_env() {
    if [[ -f .env ]]; then
        info "Loading environment from .env..."
        set -a
        source .env
        set +a
    else
        warning "No .env file found"
    fi
}

# Build web app
build_web() {
    info "Building web app..."

    cd web

    if ! bun run build; then
        error "Build failed"
        return 1
    fi

    cd ..

    success "Build complete"
    return 0
}

# Deploy to Cloudflare Pages
deploy_to_project() {
    local project_name="$1"
    local domain="$2"

    info "Deploying to ${domain} (project: ${project_name})..."

    if wrangler pages deploy web/dist \
        --project-name="${project_name}" \
        --branch=main \
        --commit-dirty=true 2>&1 | tee "/tmp/cf-deploy-${project_name}.log"; then

        success "Deployed to ${domain}"

        # Extract deployment URL
        local deploy_url
        deploy_url=$(grep -oP 'https://[a-z0-9-]+\.pages\.dev' "/tmp/cf-deploy-${project_name}.log" | head -1)

        if [[ -n "$deploy_url" ]]; then
            info "Preview URL: ${deploy_url}"
        fi

        rm -f "/tmp/cf-deploy-${project_name}.log"
        return 0
    else
        error "Deployment to ${domain} failed"
        cat "/tmp/cf-deploy-${project_name}.log"
        rm -f "/tmp/cf-deploy-${project_name}.log"
        return 1
    fi
}

# Main deployment workflow
main() {
    echo ""
    echo "════════════════════════════════════════════════"
    echo "  ONE Platform - Dual Site Deployment"
    echo "════════════════════════════════════════════════"
    echo ""

    # Load environment
    load_env

    # Validate environment
    if ! validate_env; then
        exit 1
    fi

    # Build once
    if ! build_web; then
        error "Build failed - aborting deployment"
        exit 1
    fi

    echo ""
    info "Deploying to both sites..."
    echo ""

    # Deploy to marketing site (one.ie)
    if deploy_to_project "marketing" "one.ie"; then
        MARKETING_SUCCESS=true
    else
        MARKETING_SUCCESS=false
    fi

    echo ""

    # Deploy to demo site (web.one.ie)
    if deploy_to_project "demo" "web.one.ie"; then
        DEMO_SUCCESS=true
    else
        DEMO_SUCCESS=false
    fi

    echo ""
    echo "════════════════════════════════════════════════"
    echo "  Deployment Summary"
    echo "════════════════════════════════════════════════"
    echo ""

    if [[ "$MARKETING_SUCCESS" == true ]]; then
        success "Marketing Site: https://one.ie"
    else
        error "Marketing Site: FAILED"
    fi

    if [[ "$DEMO_SUCCESS" == true ]]; then
        success "Demo Site: https://web.one.ie"
    else
        error "Demo Site: FAILED"
    fi

    echo ""

    if [[ "$MARKETING_SUCCESS" == true ]] && [[ "$DEMO_SUCCESS" == true ]]; then
        success "Both sites deployed successfully!"
        exit 0
    else
        error "Some deployments failed"
        exit 1
    fi
}

# Run main
main "$@"
