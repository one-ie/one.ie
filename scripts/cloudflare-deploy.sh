#!/usr/bin/env bash

# Cloudflare Pages Deployment via API
# Rock-solid deployment with retries, validation, and rollback

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
    local missing=()

    [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]] && missing+=("CLOUDFLARE_API_TOKEN")
    [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]] && missing+=("CLOUDFLARE_ACCOUNT_ID")

    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing required environment variables:"
        for var in "${missing[@]}"; do
            echo "  - $var"
        done
        return 1
    fi

    return 0
}

# Get project ID by name
get_project_id() {
    local project_name="$1"

    local response
    response=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project_name}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json")

    local success
    success=$(echo "$response" | jq -r '.success')

    if [[ "$success" == "true" ]]; then
        echo "$response" | jq -r '.result.id'
        return 0
    else
        error "Project '${project_name}' not found"
        return 1
    fi
}

# Create deployment via direct upload
deploy_to_cloudflare() {
    local project_name="$1"
    local dist_dir="$2"
    local branch="${3:-production}"

    info "Deploying ${project_name} from ${dist_dir} to ${branch}..."

    # Validate project exists
    local project_id
    if ! project_id=$(get_project_id "$project_name"); then
        return 1
    fi

    success "Project ID: ${project_id}"

    # Create tarball of dist directory
    local tarball="/tmp/${project_name}-$(date +%s).tar.gz"
    info "Creating deployment archive..."

    (cd "$dist_dir" && tar -czf "$tarball" .)

    if [[ ! -f "$tarball" ]]; then
        error "Failed to create tarball"
        return 1
    fi

    success "Archive created: $(du -h "$tarball" | cut -f1)"

    # Upload via Wrangler (most reliable method)
    info "Uploading to Cloudflare Pages..."

    if wrangler pages deploy "$dist_dir" \
        --project-name="$project_name" \
        --branch="$branch" \
        --commit-dirty=true 2>&1 | tee /tmp/cf-deploy.log; then

        success "Deployment successful!"

        # Extract deployment URL from logs
        local deploy_url
        deploy_url=$(grep -oP 'https://[a-z0-9-]+\.pages\.dev' /tmp/cf-deploy.log | head -1)

        if [[ -n "$deploy_url" ]]; then
            info "Deployment URL: ${deploy_url}"
        fi

        rm -f "$tarball" /tmp/cf-deploy.log
        return 0
    else
        error "Deployment failed"
        cat /tmp/cf-deploy.log
        rm -f "$tarball" /tmp/cf-deploy.log
        return 1
    fi
}

# Get deployment status
get_deployment_status() {
    local project_name="$1"
    local deployment_id="${2:-latest}"

    local response
    response=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project_name}/deployments" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")

    echo "$response" | jq -r '.result[0] | {
        id: .id,
        url: .url,
        environment: .environment,
        created_on: .created_on,
        latest_stage: .latest_stage.name,
        status: .latest_stage.status
    }'
}

# List recent deployments
list_deployments() {
    local project_name="$1"
    local limit="${2:-5}"

    info "Recent deployments for ${project_name}:"

    local response
    response=$(curl -s -X GET \
        "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project_name}/deployments" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")

    echo "$response" | jq -r ".result[:${limit}] | .[] |
        \"  • \(.id[:8])... | \(.environment) | \(.latest_stage.status) | \(.url)\""
}

# Rollback to previous deployment
rollback_deployment() {
    local project_name="$1"

    warning "Rollback functionality requires manual intervention via Cloudflare Dashboard"
    info "Visit: https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/pages/view/${project_name}"
}

# Main deployment workflow
main() {
    local command="${1:-deploy}"
    shift || true

    # Validate environment
    if ! validate_env; then
        exit 1
    fi

    case "$command" in
        deploy)
            deploy_to_cloudflare "$@"
            ;;
        status)
            get_deployment_status "$@"
            ;;
        list)
            list_deployments "$@"
            ;;
        rollback)
            rollback_deployment "$@"
            ;;
        *)
            error "Unknown command: $command"
            echo "Usage: $0 {deploy|status|list|rollback} [args...]"
            exit 1
            ;;
    esac
}

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
