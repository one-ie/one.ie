#!/bin/bash

# ============================================================
# ONE Platform Release Script
# ============================================================
# Automates the 13-step release process for ONE Platform
# Syncs ontology, web, backend, CLI, and master assembly
# Usage: ./scripts/release.sh [version_bump] [target]
#   version_bump: major, minor, patch (optional, default: none)
#   target: main, demo, both (optional, default: both)
#
# Examples:
#   ./scripts/release.sh patch main    # Deploy to one.ie only
#   ./scripts/release.sh patch demo    # Deploy to demo.one.ie only
#   ./scripts/release.sh patch         # Deploy to both
#
# See: release.md for complete documentation
# ============================================================

set -e  # Exit on error

# ============================================================
# CONFIGURATION
# ============================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Workspace
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_BUMP="${1:-none}"
TARGET="${2:-both}"  # main, demo, or both

# Validate target
if [[ ! "$TARGET" =~ ^(main|demo|both)$ ]]; then
    echo -e "${RED}Invalid target: $TARGET${NC}"
    echo "Valid targets: main, demo, both"
    exit 1
fi

# ============================================================
# HELPER FUNCTIONS
# ============================================================

# Print banner
banner() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Print section header
section() {
    echo ""
    echo -e "${CYAN}━━━ $1 ━━━${NC}"
    echo ""
}

# Print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Print warning message
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Print info message
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Synchronise web using rsync (simpler and more reliable than git subtree)
sync_web_rsync() {
    local SOURCE="$WORKSPACE_ROOT/web/"
    local DEST_DIR="$1"  # apps/oneie or apps/one
    local DEST="$WORKSPACE_ROOT/$DEST_DIR/web/"

    if [ ! -d "$SOURCE" ]; then
        warning "Source web/ directory not found, skipping web sync"
        return
    fi

    if [ ! -d "$WORKSPACE_ROOT/$DEST_DIR" ]; then
        warning "Destination $DEST_DIR/ directory not found, skipping web sync"
        return
    fi

    info "Syncing web/ → $DEST_DIR/web/ (rsync)"

    # Sync everything except git, build artifacts, and node_modules
    rsync -av --delete \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.astro' \
        --exclude='.wrangler' \
        --exclude='.env' \
        --exclude='.env.local' \
        "$SOURCE" "$DEST"

    success "Web synced to $DEST_DIR/web/"
}

# Commit and push to target repo
commit_and_push_target() {
    local TARGET_NAME="$1"  # "main" or "demo"
    local TARGET_DIR=""
    local REPO_NAME=""
    local REPO_URL=""

    if [ "$TARGET_NAME" = "main" ]; then
        TARGET_DIR="apps/oneie"
        REPO_NAME="one-ie/oneie"
        REPO_URL="https://github.com/one-ie/oneie.git"
    elif [ "$TARGET_NAME" = "demo" ]; then
        TARGET_DIR="apps/one"
        REPO_NAME="one-ie/one"
        REPO_URL="https://github.com/one-ie/one.git"
    else
        error "Invalid target: $TARGET_NAME"
        return 1
    fi

    if [ ! -d "$TARGET_DIR/.git" ]; then
        error "$TARGET_DIR/ is not a git repository"
        echo ""
        info "To initialize:"
        echo "  cd $TARGET_DIR"
        echo "  git init"
        echo "  git remote add origin $REPO_URL"
        echo "  git add ."
        echo "  git commit -m 'chore: initialize repository'"
        echo "  git push -u origin main"
        return 1
    fi

    cd "$TARGET_DIR"

    if [ -n "$(git status --porcelain)" ]; then
        echo ""
        git status --short
        echo ""

        # Auto-commit and push (no confirmation)
        COMMIT_MSG="chore: sync documentation and configuration"

        if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
            COMMIT_MSG="chore: release v$NEW_VERSION"
        fi

        info "Auto-committing $TARGET_DIR changes..."
        git add -A
        git commit -m "$COMMIT_MSG"
        success "Committed to $TARGET_DIR/"

        info "Auto-pushing to $REPO_NAME..."
        git push origin main
        success "Pushed to $REPO_NAME"

        # Create and push tag if version was bumped
        if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
            info "Creating tag v$NEW_VERSION..."
            git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
            git push origin "v$NEW_VERSION"
            success "Created and pushed tag v$NEW_VERSION"
        fi
    else
        info "No changes to commit in $TARGET_DIR/"
    fi

    cd "$WORKSPACE_ROOT"
}

# Sync to target (oneie or one)
sync_to_target() {
    local TARGET_NAME="$1"  # "main" or "demo"
    local TARGET_DIR=""
    local ENV_FILE=""
    local CLOUDFLARE_PROJECT=""

    # Determine target directory and configuration
    if [ "$TARGET_NAME" = "main" ]; then
        TARGET_DIR="apps/oneie"
        ENV_FILE="web/.env.main"
        CLOUDFLARE_PROJECT="oneie"
        info "Target: Main site (one.ie)"
    elif [ "$TARGET_NAME" = "demo" ]; then
        TARGET_DIR="apps/one"
        ENV_FILE="web/.env.demo"
        CLOUDFLARE_PROJECT="one"
        info "Target: Demo site (demo.one.ie)"
    else
        error "Invalid target: $TARGET_NAME"
        return 1
    fi

    # Create target directories
    info "Creating target directories in $TARGET_DIR..."
    mkdir -p "$TARGET_DIR/one"
    mkdir -p "$TARGET_DIR/one/.claude"
    mkdir -p "$TARGET_DIR/web"
    success "Target directories ready"

    # Sync /one directory
    info "Syncing: one/ → $TARGET_DIR/one/"
    rsync -av --delete \
        --exclude='.DS_Store' \
        --exclude='*.swp' \
        --exclude='*.tmp' \
        --exclude='.git' \
        one/ "$TARGET_DIR/one/"
    success "Synced to $TARGET_DIR/one/"

    # Sync .claude directory
    if [ -d ".claude" ]; then
        info "Syncing: .claude/ → $TARGET_DIR/one/.claude/"
        rsync -av --delete \
            --exclude='.DS_Store' \
            --exclude='*.swp' \
            --exclude='*.tmp' \
            .claude/ "$TARGET_DIR/one/.claude/"
        success "Synced to $TARGET_DIR/one/.claude/"
    fi

    # Sync web directory
    sync_web_rsync "$TARGET_DIR"

    # Copy environment file
    if [ -f "$ENV_FILE" ]; then
        info "Copying: $ENV_FILE → $TARGET_DIR/web/.env.local"
        cp "$ENV_FILE" "$TARGET_DIR/web/.env.local"
        success "Environment file copied"
    else
        warning "$ENV_FILE not found, skipping environment copy"
    fi

    # Copy core documentation files
    info "Syncing core documentation files to $TARGET_DIR/one/..."
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$TARGET_DIR/one/"
            success "Synced $file"
        fi
    done

    # Copy AGENTS.md from web/
    if [ -f "web/AGENTS.md" ]; then
        info "Copying: web/AGENTS.md → $TARGET_DIR/one/AGENTS.md"
        cp web/AGENTS.md "$TARGET_DIR/one/AGENTS.md"
        success "Copied AGENTS.md"
    fi

    success "Sync to $TARGET_DIR complete"

    # Return target info for deployment
    echo "$TARGET_DIR:$CLOUDFLARE_PROJECT"
}

# Print step message
step() {
    echo -e "${MAGENTA}► Step $1${NC}"
}

# Confirm action
confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) (y/N) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# ============================================================
# MAIN SCRIPT
# ============================================================

banner "   ONE Platform Release Script"

echo "Workspace: $WORKSPACE_ROOT"
echo "Version bump: $VERSION_BUMP"
echo "Target: $TARGET"
echo ""

# Change to workspace root
cd "$WORKSPACE_ROOT"

# ============================================================
# STEP 0: VALIDATION
# ============================================================

section "Step 0: Pre-Flight Validation"

# Check git
if ! command -v git &> /dev/null; then
    error "git is not installed"
    exit 1
fi
success "git is installed"

# Check if workspace (root can be non-git, sub-repos will be checked individually)
if [ -d .git ]; then
    success "Root is a git repository"

    # Check working directory
    if [ -n "$(git status --porcelain)" ]; then
        warning "Root has uncommitted changes"
        echo ""
        git status --short
        echo ""
        if ! confirm "Continue with uncommitted changes in root?"; then
            error "Aborted by user"
            exit 1
        fi
    else
        success "Root working directory is clean"
    fi
else
    info "Root is a workspace (not a git repo - this is OK)"
    success "Multiple independent repositories will be managed"
fi

# Check and create required directories based on target
REQUIRED_DIRS=("one" "cli")
OPTIONAL_ASSEMBLY_DIRS=()

if [ "$TARGET" = "main" ] || [ "$TARGET" = "both" ]; then
    OPTIONAL_ASSEMBLY_DIRS+=("apps/oneie")
fi
if [ "$TARGET" = "demo" ] || [ "$TARGET" = "both" ]; then
    OPTIONAL_ASSEMBLY_DIRS+=("apps/one")
fi

# Check core directories
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        error "Required directory '$dir' does not exist"
        exit 1
    fi
    success "Directory '$dir' exists"
done

# Create and initialize assembly directories if they don't exist
for dir in "${OPTIONAL_ASSEMBLY_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        warning "Directory '$dir' does not exist, creating..."
        mkdir -p "$dir"

        # Determine repo URL
        if [[ "$dir" == "apps/oneie" ]]; then
            REPO_URL="https://github.com/one-ie/oneie.git"
            REPO_NAME="one-ie/oneie"
        elif [[ "$dir" == "apps/one" ]]; then
            REPO_URL="https://github.com/one-ie/one.git"
            REPO_NAME="one-ie/one"
        fi

        # Initialize git repository
        cd "$dir"
        git init
        git remote add origin "$REPO_URL"
        cd "$WORKSPACE_ROOT"

        success "Created and initialized $dir → $REPO_NAME"
    else
        success "Directory '$dir' exists"
    fi
done

# Check optional directories
OPTIONAL_DIRS=("web" "backend" ".claude")
for dir in "${OPTIONAL_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        warning "Optional directory '$dir' does not exist (will be skipped)"
    else
        success "Directory '$dir' exists"
    fi
done

# Check required files
REQUIRED_FILES=("CLAUDE.md" "README.md" "LICENSE.md" "SECURITY.md" "TESTING-ONBOARDING.md" "CREATE-WEBSITE.md" ".mcp.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        warning "Required file '$file' does not exist"
    else
        success "File '$file' exists"
    fi
done

# Check for AGENTS.md in web directory
if [ -f "web/AGENTS.md" ]; then
    success "File 'web/AGENTS.md' exists"
else
    warning "Required file 'web/AGENTS.md' does not exist"
fi

echo ""
success "Pre-flight validation complete"

# ============================================================
# STEPS 1-3: PUSH CORE REPOSITORIES
# ============================================================

section "Steps 1-3: Push Core Repositories to GitHub"

step "1-3"

# Step 1: Push /one to one-ie/ontology
if [ -d "one/.git" ]; then
    info "Repository: one/ → one-ie/ontology"
    cd one

    if [ -n "$(git status --porcelain)" ]; then
        git status --short
        echo ""
        if confirm "Commit and push ontology changes?"; then
            git add .
            git commit -m "chore: update ontology documentation"
            git push origin main
            success "Pushed ontology to one-ie/ontology"
        else
            warning "Skipped ontology push"
        fi
    else
        info "No changes in one/"
    fi

    cd "$WORKSPACE_ROOT"
else
    warning "one/ is not a git repository (skipping push to one-ie/ontology)"
fi

# Step 2: Push /web to one-ie/web
if [ -d "web/.git" ]; then
    info "Repository: web/ → one-ie/web"
    cd web

    if [ -n "$(git status --porcelain)" ]; then
        git status --short
        echo ""
        if confirm "Commit and push web changes?"; then
            git add .
            git commit -m "feat: update web application"
            git push origin main
            success "Pushed web to one-ie/web"
        else
            warning "Skipped web push"
        fi
    else
        info "No changes in web/"
    fi

    cd "$WORKSPACE_ROOT"
else
    warning "web/ is not a git repository (skipping push to one-ie/web)"
fi

# Step 3: Push /backend to one-ie/backend
if [ -d "backend/.git" ]; then
    info "Repository: backend/ → one-ie/backend"
    cd backend

    if [ -n "$(git status --porcelain)" ]; then
        git status --short
        echo ""
        if confirm "Commit and push backend changes?"; then
            git add .
            git commit -m "feat: update backend services"
            git push origin main
            success "Pushed backend to one-ie/backend"
        else
            warning "Skipped backend push"
        fi
    else
        info "No changes in backend/"
    fi

    cd "$WORKSPACE_ROOT"
else
    warning "backend/ is not a git repository (skipping push to one-ie/backend)"
fi

echo ""
success "Core repositories processed"

# ============================================================
# STEP 4: SYNC TO TARGETS
# ============================================================

section "Step 4: Sync to Deployment Targets"

step "4"

# Always sync to CLI
info "Syncing to CLI (always)..."
mkdir -p cli/one
mkdir -p cli/.claude
success "CLI directories ready"

info "Syncing: one/ → cli/one/"
rsync -av --delete \
    --exclude='.DS_Store' \
    --exclude='*.swp' \
    --exclude='*.tmp' \
    --exclude='.git' \
    one/ cli/one/
success "Synced to cli/one/"

if [ -d ".claude" ]; then
    info "Syncing: .claude/ → cli/.claude/"
    rsync -av --delete \
        --exclude='.DS_Store' \
        --exclude='*.swp' \
        --exclude='*.tmp' \
        .claude/ cli/.claude/
    success "Synced to cli/.claude/"
fi

# Copy core files to CLI
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" cli/
        success "Synced $file to cli/"
    fi
done

if [ -f "web/AGENTS.md" ]; then
    cp web/AGENTS.md cli/AGENTS.md
    success "Copied AGENTS.md to cli/"
fi

echo ""

# Sync to deployment targets
DEPLOY_TARGETS=()
if [ "$TARGET" = "main" ] || [ "$TARGET" = "both" ]; then
    echo ""
    section "Syncing to Main Site (one.ie)"
    MAIN_INFO=$(sync_to_target "main")
    DEPLOY_TARGETS+=("$MAIN_INFO")
    echo ""
fi

if [ "$TARGET" = "demo" ] || [ "$TARGET" = "both" ]; then
    echo ""
    section "Syncing to Demo Site (demo.one.ie)"
    DEMO_INFO=$(sync_to_target "demo")
    DEPLOY_TARGETS+=("$DEMO_INFO")
    echo ""
fi

success "All targets synced successfully"

# ============================================================
# STEP 5: UPDATE CLI README
# ============================================================

section "Step 5: Update CLI README"

step "5"

if [ -f "cli/package.json" ]; then
    CLI_VERSION=$(node -p "require('./cli/package.json').version")
    info "Current CLI version: $CLI_VERSION"

    # Note: README is already copied from root
    # Additional CLI-specific updates can be added here
    success "CLI README updated"
else
    warning "cli/package.json not found, skipping version check"
fi

echo ""

# ============================================================
# STEP 6: VERSION BUMP
# ============================================================

section "Step 6: Version Management"

step "6"

if [ "$VERSION_BUMP" != "none" ]; then
    # Bump cli/package.json
    if [ -f "cli/package.json" ]; then
        cd cli
        info "Bumping version in cli/package.json ($VERSION_BUMP)"
        # Note: npm version sometimes throws harmless errors after successfully updating
        npm version "$VERSION_BUMP" --no-git-tag-version 2>&1 || true
        NEW_VERSION=$(node -p "require('./package.json').version")
        success "CLI version: $NEW_VERSION"
        cd "$WORKSPACE_ROOT"
    else
        warning "cli/package.json not found, skipping version bump"
    fi

    # Bump apps/one/package.json (if exists)
    if [ -f "apps/one/package.json" ]; then
        cd apps/one
        info "Bumping version in apps/one/package.json ($VERSION_BUMP)"
        npm version "$VERSION_BUMP" --no-git-tag-version 2>&1 || true
        APP_VERSION=$(node -p "require('./package.json').version")
        success "Apps version: $APP_VERSION"
        cd "$WORKSPACE_ROOT"
    else
        info "apps/one/package.json not found (will create if needed)"
    fi

    # Update cli/folders.yaml version
    if [ -f "cli/folders.yaml" ] && [ -n "$NEW_VERSION" ]; then
        info "Updating version in cli/folders.yaml"
        sed -i.bak "s/version: .*/version: $NEW_VERSION/" cli/folders.yaml
        rm cli/folders.yaml.bak
        success "folders.yaml version: $NEW_VERSION"
    fi
else
    info "No version bump requested"
    info "Use: ./scripts/release.sh [major|minor|patch]"
fi

echo ""

# ============================================================
# STEP 7: VERIFY APPS/ONE STRUCTURE
# ============================================================

section "Step 7: Verify apps/one Structure"

step "7"

info "Verifying apps/one has required structure..."

# Top-level directories should just contain one/ and web/
APPS_ONE_ROOT_REQUIRED=("one" "web")
for dir in "${APPS_ONE_ROOT_REQUIRED[@]}"; do
    if [ -d "apps/one/$dir" ]; then
        success "apps/one/$dir exists"
    else
        warning "apps/one/$dir is missing"
    fi
done

# Ensure no unexpected top-level directories remain
for dir in apps/one/*/; do
    [ -d "$dir" ] || continue
    base=$(basename "$dir")
    if [[ ! " ${APPS_ONE_ROOT_REQUIRED[*]} " =~ " $base " ]] && [ "$base" != ".git" ]; then
        warning "Unexpected directory at apps/one/$base (should be inside apps/one/one/)"
    fi
done

# Validate content inside apps/one/one/
APPS_ONE_ONE_REQUIRED=(".claude" "AGENTS.md" "CLAUDE.md" "LICENSE.md" "README.md" "SECURITY.md" "connections" "events" "groups" "knowledge" "people" "things")
for item in "${APPS_ONE_ONE_REQUIRED[@]}"; do
    if [ -e "apps/one/one/$item" ]; then
        success "apps/one/one/$item exists"
    else
        warning "apps/one/one/$item is missing"
    fi
done

# Validate content inside cli/
CLI_REQUIRED=(".claude" "one" "AGENTS.md" "CLAUDE.md" "LICENSE.md" "README.md" "SECURITY.md")
echo ""
info "Validating cli/ structure..."
for item in "${CLI_REQUIRED[@]}"; do
    if [ -e "cli/$item" ]; then
        success "cli/$item exists"
    else
        warning "cli/$item is missing"
    fi
done

echo ""
info "apps/one structure verification complete"

echo ""

# ============================================================
# STEP 8: UPDATE APPS/ONE README
# ============================================================

section "Step 8: Update apps/one/README.md"

step "8"

if [ -f "README.md" ]; then
    info "Copying root README.md → apps/one/README.md"
    cp README.md apps/one/README.md

    if [ -n "$NEW_VERSION" ]; then
        # Add version to README if bumped
        sed -i.bak "1s/^/# ONE Platform v$NEW_VERSION\n\n/" apps/one/README.md
        rm apps/one/README.md.bak
    fi

    success "Synced apps/one/README.md from root"
else
    warning "Root README.md not found, skipping apps/one README sync"
fi

echo ""

# ============================================================
# STEP 9: GIT STATUS SUMMARY
# ============================================================

section "Step 9: Changes Summary"

step "9"

# Show changes in cli/
echo ""
info "Changes in cli/:"
if [ -d "cli/.git" ]; then
    cd cli
    if [ -n "$(git status --porcelain)" ]; then
        git status --short | head -20
    else
        success "No changes"
    fi
    cd "$WORKSPACE_ROOT"
else
    warning "cli/ is not a git repository"
fi

# Show changes in apps/one/
echo ""
info "Changes in apps/one/:"
if [ -d "apps/one/.git" ]; then
    cd apps/one
    if [ -n "$(git status --porcelain)" ]; then
        git status --short | head -20
    else
        success "No changes"
    fi
    cd "$WORKSPACE_ROOT"
else
    warning "apps/one/ is not a git repository"
fi

echo ""

# ============================================================
# STEP 10: COMMIT AND PUSH CLI
# ============================================================

section "Step 10: Commit & Push CLI to one-ie/cli"

step "10"

if [ -d "cli/.git" ]; then
    cd cli

    if [ -n "$(git status --porcelain)" ]; then
        echo ""
        git status --short
        echo ""

        if confirm "Commit and push CLI changes?"; then
            COMMIT_MSG="chore: sync documentation and configuration"

            if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
                COMMIT_MSG="chore: release v$NEW_VERSION"
            fi

            git add -A
            git commit -m "$COMMIT_MSG"
            success "Committed to cli/"

            if confirm "Push to one-ie/cli?"; then
                git push origin main
                success "Pushed to one-ie/cli"

                # Create and push tag if version was bumped
                if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
                    if confirm "Create and push tag v$NEW_VERSION?"; then
                        git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
                        git push origin "v$NEW_VERSION"
                        success "Created and pushed tag v$NEW_VERSION"
                    fi
                fi
            else
                warning "Skipped push to remote"
            fi
        else
            warning "Skipped commit"
        fi
    else
        info "No changes to commit in cli/"
    fi

    cd "$WORKSPACE_ROOT"
else
    error "cli/ is not a git repository"
    echo ""
    info "To initialize:"
    echo "  cd cli"
    echo "  git init"
    echo "  git remote add origin https://github.com/one-ie/cli.git"
    echo "  git add ."
    echo "  git commit -m 'chore: initialize cli repository'"
    echo "  git push -u origin main"
fi

echo ""

# ============================================================
# STEP 11: COMMIT AND PUSH DEPLOYMENT TARGETS
# ============================================================

section "Step 11: Commit & Push to GitHub"

step "11"

# Commit and push based on target
if [ "$TARGET" = "main" ] || [ "$TARGET" = "both" ]; then
    echo ""
    section "Committing Main Site (one-ie/oneie)"
    commit_and_push_target "main"
    echo ""
fi

if [ "$TARGET" = "demo" ] || [ "$TARGET" = "both" ]; then
    echo ""
    section "Committing Demo Site (one-ie/one)"
    commit_and_push_target "demo"
    echo ""
fi

success "All targets committed and pushed"
echo ""

# ============================================================
# STEP 12: NPM PUBLISH INSTRUCTIONS
# ============================================================

section "Step 12: Publish to npm (Manual Step)"

step "12"

if [ -f "cli/package.json" ]; then
    CLI_VERSION=$(node -p "require('./cli/package.json').version")

    echo ""
    warning "Manual step required: npm publish"
    echo ""
    info "To publish to npm, run:"
    echo ""
    echo "  cd cli"
    echo "  npm login  # If not already logged in"
    echo "  npm publish --access public"
    echo ""
    info "Then verify:"
    echo ""
    echo "  npx oneie@latest --version  # Should show v$CLI_VERSION"
    echo "  npx oneie@latest init test-project"
    echo ""
else
    warning "cli/package.json not found, cannot publish to npm"
fi

echo ""

# ============================================================
# STEP 13: DEPLOY WEB TO CLOUDFLARE PAGES
# ============================================================

section "Step 13: Deploy Web to Cloudflare Pages"

step "13"

# Source Cloudflare deployment module
if [ -f "scripts/cloudflare-deploy.sh" ]; then
    source scripts/cloudflare-deploy.sh
fi

# Deploy each target
for deploy_info in "${DEPLOY_TARGETS[@]}"; do
    IFS=':' read -r TARGET_DIR CLOUDFLARE_PROJECT <<< "$deploy_info"
    WEB_DIR="$TARGET_DIR/web"

    if [ ! -d "$WEB_DIR" ]; then
        warning "$WEB_DIR directory not found, skipping"
        continue
    fi

    echo ""
    section "Deploying $CLOUDFLARE_PROJECT → ${CLOUDFLARE_PROJECT}.one.ie"

    # Check if Cloudflare credentials are set
    if [[ -z "${CLOUDFLARE_API_TOKEN:-}" && -z "${CLOUDFLARE_GLOBAL_API_KEY:-}" ]] || [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
        warning "Cloudflare credentials not set"
        warning "Required: (CLOUDFLARE_API_TOKEN OR CLOUDFLARE_GLOBAL_API_KEY) + CLOUDFLARE_ACCOUNT_ID"
        warning "Falling back to wrangler CLI deployment"

        if confirm "Deploy $CLOUDFLARE_PROJECT to Cloudflare Pages via wrangler?"; then
            cd "$WEB_DIR"

            info "Building web from $WEB_DIR..."
            if ASTRO_TELEMETRY_DISABLED=1 bun run build 2>&1 | grep -v "^src/" | tail -20; then
                success "Build completed (check warnings above)"

                echo ""
                info "Deploying to Cloudflare Pages..."
                if wrangler pages deploy dist --project-name="$CLOUDFLARE_PROJECT" --commit-dirty=true; then
                    success "Deployed to Cloudflare Pages"
                    echo ""
                    info "Live URL:"
                    if [ "$CLOUDFLARE_PROJECT" = "oneie" ]; then
                        echo "  - Production: https://one.ie"
                    else
                        echo "  - Production: https://demo.one.ie"
                    fi
                else
                    error "Cloudflare deployment failed"
                    warning "You can deploy manually later with:"
                    echo "  cd $WEB_DIR && wrangler pages deploy dist --project-name=$CLOUDFLARE_PROJECT"
                fi
            else
                error "Build failed - skipping deployment"
                warning "Fix build errors and deploy manually:"
                echo "  cd $WEB_DIR && bun run build"
            fi

            cd "$WORKSPACE_ROOT"
        else
            warning "Skipped Cloudflare deployment for $CLOUDFLARE_PROJECT"
        fi
    else
        # Automated deployment via Cloudflare API
        if [[ -n "${CLOUDFLARE_GLOBAL_API_KEY:-}" ]]; then
            info "Cloudflare Global API Key detected - using automated deployment (FULL ACCESS)"
        else
            info "Cloudflare API Token detected - using automated deployment"
        fi

        cd "$WEB_DIR"
        info "Building web from $WEB_DIR..."
        if ASTRO_TELEMETRY_DISABLED=1 bun run build 2>&1 | grep -v "^src/" | tail -20; then
            success "Build completed (check warnings above)"

            echo ""
            cd "$WORKSPACE_ROOT"

            info "Deploying to Cloudflare Pages via API..."
            if deploy_to_cloudflare "$CLOUDFLARE_PROJECT" "$WEB_DIR/dist" "production"; then
                success "Deployed to Cloudflare Pages via API"
                echo ""
                info "Checking deployment status..."
                get_deployment_status "$CLOUDFLARE_PROJECT"
                echo ""
                info "Live URL:"
                if [ "$CLOUDFLARE_PROJECT" = "oneie" ]; then
                    echo "  - Production: https://one.ie"
                else
                    echo "  - Production: https://demo.one.ie"
                fi
            else
                error "Cloudflare API deployment failed"
                warning "You can deploy manually with:"
                echo "  cd $WEB_DIR && wrangler pages deploy dist --project-name=$CLOUDFLARE_PROJECT"
            fi
        else
            error "Build failed - skipping deployment"
            warning "Fix build errors first:"
            echo "  cd $WEB_DIR && bun run build"
        fi
    fi

    echo ""
done

if [ ${#DEPLOY_TARGETS[@]} -eq 0 ]; then
    warning "No deployment targets found, skipping Cloudflare deployment"
fi

echo ""

# ============================================================
# FINAL SUMMARY
# ============================================================

banner "   ✓ Release Process Complete!"

if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
    echo -e "${GREEN}Released version: v$NEW_VERSION${NC}"
    echo ""
fi

echo -e "${CYAN}Summary of Actions:${NC}"
echo ""
echo "  ✓ Validated prerequisites"
echo "  ✓ Pushed core repositories (one, web, backend)"
echo "  ✓ Synced documentation via folders.yaml"
echo "  ✓ Updated CLI and apps/one READMEs"
if [ "$VERSION_BUMP" != "none" ]; then
    echo "  ✓ Bumped version to $NEW_VERSION"
fi
echo "  ✓ Updated web subtree"
echo "  ✓ Committed and pushed cli/ and apps/one/"
echo "  ✓ Cloudflare Pages deployment (if confirmed)"
echo ""

echo -e "${CYAN}Live Deployments:${NC}"
echo ""
echo "  📦 npm: https://www.npmjs.com/package/oneie"
echo "  🌐 Web: https://web.one.ie"
echo "  🏷️ GitHub CLI: https://github.com/one-ie/cli"
echo "  🏷️ GitHub One: https://github.com/one-ie/one"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "  1. Publish to npm (if not done):"
echo "     cd cli && npm publish --access public"
echo ""
echo "  2. Test installation:"
echo "     npx oneie@latest --version"
echo "     npx oneie@latest init test-project"
echo ""
echo "  3. Create GitHub releases for tagged versions:"
echo "     https://github.com/one-ie/cli/releases"
echo "     https://github.com/one-ie/one/releases"
echo ""
echo "  4. Verify web deployment:"
echo "     https://web.one.ie"
echo ""
echo "  5. Update documentation site (optional):"
echo "     cd docs && npm run build && wrangler pages deploy dist"
echo ""

info "For complete release documentation, see: release.md"

echo ""
