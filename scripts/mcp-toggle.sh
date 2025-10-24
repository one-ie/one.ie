#!/bin/bash
# MCP Toggle Script - Enable/Disable MCPs on demand
# Saves ~10-15k tokens by only loading MCPs when needed

set -e

MCP_JSON=".mcp.json"
MCP_BACKUP=".mcp.json.backup"
MCP_MINIMAL=".mcp.json.minimal"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_usage() {
    cat << EOF
${GREEN}MCP Toggle - Manage MCP context usage${NC}

Usage:
  ./scripts/mcp-toggle.sh [command] [mcp-name]

Commands:
  ${YELLOW}status${NC}              Show current MCP status
  ${YELLOW}enable [mcp]${NC}        Enable specific MCP
  ${YELLOW}disable [mcp]${NC}       Disable specific MCP
  ${YELLOW}minimal${NC}             Enable only essential MCPs (shadcn)
  ${YELLOW}full${NC}                Enable all MCPs
  ${YELLOW}backup${NC}              Backup current .mcp.json
  ${YELLOW}restore${NC}             Restore from backup

Available MCPs:
  - shadcn (4.7k tokens)
  - cloudflare-docs (1.4k tokens)
  - cloudflare-builds (5.7k tokens)
  - figma (2.0k tokens)
  - ide (1.3k tokens)

Examples:
  ./scripts/mcp-toggle.sh minimal          # Save ~10k tokens
  ./scripts/mcp-toggle.sh enable shadcn    # Enable only shadcn
  ./scripts/mcp-toggle.sh enable figma     # Add figma to enabled MCPs
  ./scripts/mcp-toggle.sh disable figma    # Remove figma
  ./scripts/mcp-toggle.sh full             # Enable all MCPs
EOF
}

backup_mcp_json() {
    if [ -f "$MCP_JSON" ]; then
        cp "$MCP_JSON" "$MCP_BACKUP"
        echo -e "${GREEN}✓${NC} Backed up .mcp.json to .mcp.json.backup"
    fi
}

restore_mcp_json() {
    if [ -f "$MCP_BACKUP" ]; then
        cp "$MCP_BACKUP" "$MCP_JSON"
        echo -e "${GREEN}✓${NC} Restored .mcp.json from backup"
        echo -e "${YELLOW}⚠${NC} Restart Claude Code to apply changes"
    else
        echo -e "${RED}✗${NC} No backup found"
        exit 1
    fi
}

show_status() {
    if [ ! -f "$MCP_JSON" ]; then
        echo -e "${RED}✗${NC} .mcp.json not found"
        exit 1
    fi

    echo -e "${GREEN}Current MCP Status:${NC}\n"

    # Check each MCP individually (macOS bash 3.2 compatible)
    if grep -q "\"shadcn\"" "$MCP_JSON" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} shadcn (enabled)"
    else
        echo -e "  ${RED}✗${NC} shadcn (disabled)"
    fi

    if grep -q "\"cloudflare-docs\"" "$MCP_JSON" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} cloudflare-docs (enabled)"
    else
        echo -e "  ${RED}✗${NC} cloudflare-docs (disabled)"
    fi

    if grep -q "\"cloudflare-builds\"" "$MCP_JSON" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} cloudflare-builds (enabled)"
    else
        echo -e "  ${RED}✗${NC} cloudflare-builds (disabled)"
    fi

    if grep -q "\"Framelink_Figma_MCP\"" "$MCP_JSON" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} figma (enabled)"
    else
        echo -e "  ${RED}✗${NC} figma (disabled)"
    fi

    if grep -q "\"ide\"" "$MCP_JSON" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} ide (enabled)"
    else
        echo -e "  ${RED}✗${NC} ide (disabled)"
    fi

    echo ""
    estimate_tokens
}

estimate_tokens() {
    local total=0

    if grep -q "\"shadcn\"" "$MCP_JSON" 2>/dev/null; then
        total=$((total + 4700))
    fi
    if grep -q "\"cloudflare-docs\"" "$MCP_JSON" 2>/dev/null; then
        total=$((total + 1400))
    fi
    if grep -q "\"cloudflare-builds\"" "$MCP_JSON" 2>/dev/null; then
        total=$((total + 5700))
    fi
    if grep -q "\"Framelink_Figma_MCP\"" "$MCP_JSON" 2>/dev/null; then
        total=$((total + 2000))
    fi
    if grep -q "\"ide\"" "$MCP_JSON" 2>/dev/null; then
        total=$((total + 1300))
    fi

    echo -e "${YELLOW}Estimated MCP tokens:${NC} ~${total} tokens"
    echo -e "${YELLOW}Potential savings:${NC} ~$((15100 - total)) tokens"
}

create_minimal_config() {
    backup_mcp_json

    cat > "$MCP_JSON" << 'EOF'
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli",
        "run",
        "@modelcontextprotocol/server-shadcn"
      ]
    }
  }
}
EOF

    echo -e "${GREEN}✓${NC} Created minimal .mcp.json (only shadcn enabled)"
    echo -e "${YELLOW}⚠${NC} Restart Claude Code to apply changes"
    echo -e "${GREEN}Savings:${NC} ~10k tokens"
}

create_full_config() {
    if [ -f "$MCP_BACKUP" ]; then
        restore_mcp_json
    else
        echo -e "${YELLOW}⚠${NC} No backup found, creating full config from scratch"

        cat > "$MCP_JSON" << 'EOF'
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@modelcontextprotocol/server-shadcn"]
    },
    "cloudflare-docs": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@cloudflare/mcp-server-cloudflare-docs"]
    },
    "cloudflare-builds": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@cloudflare/mcp-server-cloudflare-builds"]
    },
    "Framelink_Figma_MCP": {
      "command": "npx",
      "args": ["-y", "@framelink/figma-mcp"]
    },
    "ide": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
EOF

        echo -e "${GREEN}✓${NC} Created full .mcp.json (all MCPs enabled)"
        echo -e "${YELLOW}⚠${NC} Restart Claude Code to apply changes"
    fi
}

enable_mcp() {
    local mcp="$1"
    local mcp_key=""

    # Map friendly names to JSON keys
    case "$mcp" in
        "shadcn") mcp_key="shadcn" ;;
        "cloudflare-docs") mcp_key="cloudflare-docs" ;;
        "cloudflare-builds") mcp_key="cloudflare-builds" ;;
        "figma") mcp_key="Framelink_Figma_MCP" ;;
        "ide") mcp_key="ide" ;;
        *)
            echo -e "${RED}✗${NC} Unknown MCP: $mcp"
            echo "Available: shadcn, cloudflare-docs, cloudflare-builds, figma, ide"
            exit 1
            ;;
    esac

    backup_mcp_json

    # Check if already enabled
    if grep -q "\"$mcp_key\"" "$MCP_JSON" 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC} $mcp is already enabled"
        return
    fi

    # Add MCP to config (simplified - assumes JSON structure)
    # TODO: Use jq for proper JSON manipulation
    echo -e "${YELLOW}⚠${NC} Manual addition required - use 'full' command or edit .mcp.json"
    echo "Add this to .mcp.json:"
    echo ""

    case "$mcp" in
        "shadcn")
            cat << 'EOF'
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@modelcontextprotocol/server-shadcn"]
    }
EOF
            ;;
        "cloudflare-docs")
            cat << 'EOF'
    "cloudflare-docs": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@cloudflare/mcp-server-cloudflare-docs"]
    }
EOF
            ;;
        "cloudflare-builds")
            cat << 'EOF'
    "cloudflare-builds": {
      "command": "npx",
      "args": ["-y", "@smithery/cli", "run", "@cloudflare/mcp-server-cloudflare-builds"]
    }
EOF
            ;;
        "figma")
            cat << 'EOF'
    "Framelink_Figma_MCP": {
      "command": "npx",
      "args": ["-y", "@framelink/figma-mcp"]
    }
EOF
            ;;
        "ide")
            cat << 'EOF'
    "ide": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
EOF
            ;;
    esac
}

disable_mcp() {
    local mcp="$1"
    local mcp_key=""

    # Map friendly names to JSON keys
    case "$mcp" in
        "shadcn") mcp_key="shadcn" ;;
        "cloudflare-docs") mcp_key="cloudflare-docs" ;;
        "cloudflare-builds") mcp_key="cloudflare-builds" ;;
        "figma") mcp_key="Framelink_Figma_MCP" ;;
        "ide") mcp_key="ide" ;;
        *)
            echo -e "${RED}✗${NC} Unknown MCP: $mcp"
            exit 1
            ;;
    esac

    backup_mcp_json

    # Remove MCP from config
    # TODO: Use jq for proper JSON manipulation
    echo -e "${YELLOW}⚠${NC} Manual removal required"
    echo "Remove '$mcp_key' section from .mcp.json"
}

# Main command handler
case "${1:-}" in
    "status")
        show_status
        ;;
    "enable")
        if [ -z "${2:-}" ]; then
            echo -e "${RED}✗${NC} Specify MCP to enable"
            show_usage
            exit 1
        fi
        enable_mcp "$2"
        ;;
    "disable")
        if [ -z "${2:-}" ]; then
            echo -e "${RED}✗${NC} Specify MCP to disable"
            show_usage
            exit 1
        fi
        disable_mcp "$2"
        ;;
    "minimal")
        create_minimal_config
        ;;
    "full")
        create_full_config
        ;;
    "backup")
        backup_mcp_json
        ;;
    "restore")
        restore_mcp_json
        ;;
    "help"|"-h"|"--help"|"")
        show_usage
        ;;
    *)
        echo -e "${RED}✗${NC} Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
