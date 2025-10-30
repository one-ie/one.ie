#!/bin/bash

# ============================================================
# Copy Features from /web (Development) to /oneie (Production)
# ============================================================
#
# Usage:
#   ./scripts/copy-web-to-oneie.sh components   # Copy components only
#   ./scripts/copy-web-to-oneie.sh pages        # Copy pages only
#   ./scripts/copy-web-to-oneie.sh layouts      # Copy layouts only
#   ./scripts/copy-web-to-oneie.sh all          # Copy all (except content)
#
# Note: /src/content is NEVER copied (oneie content stays untouched)
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"

# Default to all
COPY_TYPE="${1:-all}"

# Validate input
if [[ ! "$COPY_TYPE" =~ ^(components|pages|layouts|all)$ ]]; then
    echo -e "${YELLOW}Invalid copy type: $COPY_TYPE${NC}"
    echo ""
    echo "Valid options:"
    echo "  components  - Copy src/components/ only"
    echo "  pages       - Copy src/pages/ only"
    echo "  layouts     - Copy src/layouts/ only"
    echo "  all         - Copy all (except content)"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Copying from /web (development) to /oneie (production)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Change to workspace root
cd "$WORKSPACE_ROOT"

# Check directories exist
if [ ! -d "web/src" ]; then
    echo -e "${YELLOW}❌ /web/src not found${NC}"
    exit 1
fi

if [ ! -d "oneie/src" ]; then
    echo -e "${YELLOW}❌ /oneie/src not found${NC}"
    exit 1
fi

# Copy based on type
case $COPY_TYPE in
    components)
        echo -e "${BLUE}Copying components...${NC}"
        if [ -d "web/src/components" ]; then
            cp -r "web/src/components"/* "oneie/src/components/" 2>/dev/null || true
            echo -e "${GREEN}✅ Components copied${NC}"
        else
            echo -e "${YELLOW}⚠️  /web/src/components not found${NC}"
        fi
        ;;
    pages)
        echo -e "${BLUE}Copying pages...${NC}"
        if [ -d "web/src/pages" ]; then
            cp -r "web/src/pages"/* "oneie/src/pages/" 2>/dev/null || true
            echo -e "${GREEN}✅ Pages copied${NC}"
        else
            echo -e "${YELLOW}⚠️  /web/src/pages not found${NC}"
        fi
        ;;
    layouts)
        echo -e "${BLUE}Copying layouts...${NC}"
        if [ -d "web/src/layouts" ]; then
            cp -r "web/src/layouts"/* "oneie/src/layouts/" 2>/dev/null || true
            echo -e "${GREEN}✅ Layouts copied${NC}"
        else
            echo -e "${YELLOW}⚠️  /web/src/layouts not found${NC}"
        fi
        ;;
    all)
        echo -e "${BLUE}Copying all (components, pages, layouts)...${NC}"

        if [ -d "web/src/components" ]; then
            cp -r "web/src/components"/* "oneie/src/components/" 2>/dev/null || true
            echo -e "${GREEN}✅ Components copied${NC}"
        fi

        if [ -d "web/src/pages" ]; then
            cp -r "web/src/pages"/* "oneie/src/pages/" 2>/dev/null || true
            echo -e "${GREEN}✅ Pages copied${NC}"
        fi

        if [ -d "web/src/layouts" ]; then
            cp -r "web/src/layouts"/* "oneie/src/layouts/" 2>/dev/null || true
            echo -e "${GREEN}✅ Layouts copied${NC}"
        fi

        echo -e "${YELLOW}⚠️  IMPORTANT: /src/content was NOT copied${NC}"
        echo -e "${YELLOW}    (oneie content stays untouched)${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "  ${YELLOW}1. Test in /oneie${NC}"
echo "     cd oneie && bun run dev"
echo ""
echo -e "  ${YELLOW}2. Verify changes${NC}"
echo "     # Visit http://localhost:4321"
echo "     # Test with backend enabled"
echo ""
echo -e "  ${YELLOW}3. Commit changes${NC}"
echo "     git add ."
echo "     git commit -m \"feat: clone from /web\""
echo "     git push origin main"
echo ""
echo -e "  ${YELLOW}4. Deploy${NC}"
echo "     bun run deploy"
echo ""
echo -e "${GREEN}✨ Copy complete!${NC}"
echo ""
