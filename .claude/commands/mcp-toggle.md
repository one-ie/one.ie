# MCP Management

**Status:** MCPs are configured in Claude Code settings (Settings → MCP Servers).

Currently enabled MCPs for agent-ops:
- **shadcn**: Component registry access
- **cloudflare-docs**: Cloudflare documentation
- **cloudflare-builds**: Cloudflare Workers deployment
- **chrome-devtools**: Performance profiling

## No Script Needed

MCPs are now managed directly through Claude Code UI rather than shell scripts.

To modify MCP configuration:
1. Open Claude Code settings
2. Navigate to "MCP Servers"
3. Enable/disable as needed
4. Restart Claude Code

## For Agent-Ops Deployments

When using `/deploy` command:
- ✅ All necessary Cloudflare MCPs are enabled
- ✅ Wrangler CLI handles credential management
- ✅ No additional MCP configuration needed

See `/deploy` command documentation for deployment details.
