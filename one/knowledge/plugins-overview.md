---
title: ElizaOS Plugins Overview
dimension: knowledge
category: user-guide
tags: elizaos, plugins, integration, features, user-guide
related_dimensions: things, connections, events
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: draft
ai_context: |
  This document is part of the knowledge dimension in the user-guide category.
  Location: one/knowledge/plugins-overview.md
  Purpose: User-facing documentation for elizaOS plugin system
  Related dimensions: things, connections, events
  For AI agents: Read this to understand how users interact with plugins.
---

# ElizaOS Plugins - User Guide

**Transform your AI agents with 261+ ready-to-use plugins.**

---

## What Are ElizaOS Plugins?

ElizaOS plugins extend your AI agents with powerful capabilities - from blockchain transactions to web scraping, from Discord integration to advanced knowledge systems. Think of them as apps for your AI agents.

**ONE Platform brings you:**
- 🔌 **261+ Plugins** - Instant access to the entire ElizaOS ecosystem
- 🔒 **Secure Execution** - Sandboxed, monitored, and permission-controlled
- 🎯 **One-Click Install** - Browse, install, configure in minutes
- 🌐 **Multi-Dimension** - Plugins map perfectly to the 6-dimension ontology

---

## Plugin Categories

### 🪙 Blockchain & Crypto
Connect your agents to blockchain networks:
- **plugin-solana** - Solana transactions, token swaps, NFT operations
- **plugin-0x** - Cross-chain token swaps with slippage protection
- **plugin-evm** - Ethereum and EVM-compatible chains
- **plugin-wallet** - Multi-chain wallet management

**Use Cases:**
- Automated trading strategies
- Portfolio management
- NFT minting and transfers
- DeFi protocol interactions

### 🧠 Knowledge & Memory
Give your agents long-term memory and reasoning:
- **plugin-knowledge** - RAG-powered knowledge bases
- **plugin-memory** - Persistent conversation memory
- **plugin-timeline** - Agent reasoning visualization
- **plugin-context** - Context aggregation and summarization

**Use Cases:**
- Customer support with conversation history
- Research assistants with domain knowledge
- Personalized recommendations
- Learning agents that improve over time

### 💬 Social & Communication
Connect agents to social platforms:
- **plugin-discord** - Discord bot integration
- **plugin-telegram** - Telegram messaging
- **plugin-twitter** - Twitter/X posting and monitoring
- **plugin-slack** - Slack workspace integration

**Use Cases:**
- Community management bots
- Social media automation
- Team collaboration assistants
- Customer engagement

### 🌐 Web & Browser
Enable web scraping and automation:
- **plugin-browser** - Playwright-based web scraping
- **plugin-content** - Content extraction and analysis
- **plugin-search** - Web search integration
- **plugin-scraper** - Advanced scraping patterns

**Use Cases:**
- Market research and monitoring
- Competitive analysis
- Data collection and aggregation
- Automated testing

### 🤖 LLM & AI
Connect to AI model providers:
- **plugin-openrouter** - Access 100+ LLM models
- **plugin-openai** - GPT-4, GPT-3.5 integration
- **plugin-anthropic** - Claude integration
- **plugin-llama** - Open-source model access

**Use Cases:**
- Multi-model routing (cost optimization)
- Model comparison and benchmarking
- Specialized model selection
- Fallback strategies

### 🔧 Developer Tools
Build and debug agents:
- **plugin-debug** - Debugging and logging tools
- **plugin-test** - Automated testing framework
- **plugin-monitor** - Performance monitoring
- **plugin-analytics** - Usage analytics

**Use Cases:**
- Plugin development
- Performance optimization
- Error tracking
- Usage insights

---

## How Plugins Work

### The 6-Dimension Plugin Architecture

Every plugin maps to ONE's 6-dimension ontology:

```
1. GROUPS → Plugin installed at organization level
2. PEOPLE → You control which agents can use plugins
3. THINGS → Plugins are entities (elizaos_plugin, plugin_instance)
4. CONNECTIONS → Plugins connect to agents (plugin_powers)
5. EVENTS → Complete audit trail (plugin_installed, plugin_action_executed)
6. KNOWLEDGE → Plugin documentation embedded for semantic search
```

### Plugin Lifecycle

```
DISCOVER → INSTALL → CONFIGURE → ACTIVATE → USE → MONITOR
```

1. **Discover** - Browse the plugin marketplace, search semantically
2. **Install** - One-click installation with dependency resolution
3. **Configure** - Set API keys, customize behavior
4. **Activate** - Enable for specific agents
5. **Use** - Execute plugin actions through your agents
6. **Monitor** - Track usage, performance, errors

---

## Quick Start

### 1. Browse the Plugin Marketplace

Navigate to **Plugins** in the main menu or visit `/plugins`.

**Features:**
- Search by name, capability, or description
- Filter by category (blockchain, knowledge, social, etc.)
- Sort by popularity, rating, or recency
- View verified plugins (official ElizaOS plugins)

### 2. View Plugin Details

Click any plugin to see:
- **Description** - What the plugin does
- **Capabilities** - Actions, providers, evaluators available
- **Dependencies** - Required plugins and packages
- **Configuration** - Required API keys and settings
- **Examples** - Code samples and usage patterns
- **Reviews** - Community ratings and feedback

### 3. Install a Plugin

Click **Install** and follow the wizard:

**Step 1: Review Dependencies**
- View all required plugins
- Auto-install dependencies

**Step 2: Configure Settings**
- Enter API keys (encrypted and secure)
- Set plugin options
- Define permissions

**Step 3: Confirm Installation**
- Review plugin permissions
- Accept terms
- Install

**Installation completes in < 2 minutes.**

### 4. Activate for Agents

After installation:
1. Go to **Plugins → Installed**
2. Click the plugin
3. Click **Activate for Agent**
4. Select which agents can use this plugin
5. Save

### 5. Execute Plugin Actions

Plugins work automatically through your agents, or manually:

**Automatic (Agent-Driven):**
```
User: "Check my Solana wallet balance"
Agent: → Uses plugin-solana automatically
```

**Manual (Action Executor):**
1. Go to **Plugins → Installed → [Plugin Name]**
2. Click **Execute Action**
3. Select action (e.g., "Get Token Balance")
4. Fill parameters
5. Run

---

## Plugin Permissions

Plugins can request these permissions:

| Permission | Description | Risk Level |
|-----------|-------------|-----------|
| `network.external` | Make HTTP requests | Medium |
| `storage.read` | Read from database | Low |
| `storage.write` | Write to database | Medium |
| `secrets.access` | Access API keys | High |
| `events.publish` | Publish events | Low |
| `knowledge.query` | Query embeddings | Low |

**You control all permissions.** Review before installation.

---

## Security & Safety

### How We Keep You Safe

1. **Sandboxed Execution**
   - Plugins run in isolated containers
   - No access to your system files
   - Resource limits enforced (CPU, memory, time)

2. **Code Analysis**
   - Static analysis before installation
   - Malicious pattern detection
   - Dependency security scanning

3. **Permission Control**
   - Fine-grained permissions
   - Approve each capability
   - Revoke anytime

4. **Network Isolation**
   - Allowlist-only network access
   - Block internal IPs
   - Block cloud metadata endpoints
   - Rate limiting on external requests

5. **Audit Trail**
   - Every plugin action logged
   - Complete event history
   - Performance monitoring
   - Error tracking

6. **Plugin Reputation**
   - Trust scores (0-100)
   - Community ratings
   - Installation count
   - Error rate trends
   - Author reputation

### Best Practices

✅ **Do:**
- Review plugin permissions before installing
- Use official/verified plugins when possible
- Monitor plugin usage and logs
- Keep plugins updated
- Report suspicious behavior

❌ **Don't:**
- Share API keys across plugins
- Grant unnecessary permissions
- Install unverified plugins in production
- Ignore security warnings

---

## Pricing & Quotas

### Plugin Execution Quotas

| Tier | Executions/Day | Price |
|------|---------------|-------|
| Free | 100 | $0 |
| Pro | 10,000 | $29/mo |
| Enterprise | Unlimited | Custom |

**Note:** Some plugins may have their own API costs (e.g., OpenAI, blockchain gas fees).

### Quota Management

- View usage: **Plugins → Analytics**
- Real-time quota tracking
- Alerts when approaching limits
- Automatic quota resets daily

---

## Troubleshooting

### Plugin Won't Install

**Symptoms:** Installation fails or hangs

**Solutions:**
1. Check dependencies - ensure all required plugins are available
2. Verify credentials - API keys must be valid
3. Check quotas - ensure you haven't hit installation limits
4. Review logs - check error messages in installation history

### Plugin Action Fails

**Symptoms:** Action execution returns error

**Solutions:**
1. Verify configuration - ensure API keys are correct
2. Check permissions - plugin may need additional permissions
3. Review parameters - ensure action parameters are valid
4. Check logs - view execution logs for error details
5. Test manually - use Action Executor to debug

### Performance Issues

**Symptoms:** Plugin actions are slow

**Solutions:**
1. Check quotas - rate limits may be throttling
2. Review caching - enable caching for repeated queries
3. Optimize parameters - reduce data fetched
4. Monitor resource usage - check CPU/memory in analytics

### Can't Find Plugin

**Symptoms:** Plugin doesn't appear in marketplace

**Solutions:**
1. Use semantic search - describe what you need
2. Check filters - remove category/rating filters
3. Browse all - click "View All Plugins"
4. Request plugin - submit plugin request if not available

---

## Advanced Features

### Plugin Collections

Pre-curated plugin bundles for common use cases:

- **"Essential AI Tools"** - Knowledge, memory, timeline
- **"Blockchain Starter Pack"** - Solana, wallet, 0x
- **"Social Media Suite"** - Discord, Twitter, Telegram
- **"Web Scraping Tools"** - Browser, content extraction

**Install entire collections with one click.**

### Plugin Comparison

Compare up to 3 plugins side-by-side:
- Feature matrix
- Performance benchmarks
- Pricing comparison
- Community ratings

### Custom Plugin Development

Want to build your own plugin?
- Read the [Plugin Development Guide](/knowledge/plugin-development-guide)
- Use the Plugin CLI: `npx @one-platform/plugin-cli init`
- Submit to marketplace via pull request

---

## Support & Community

### Get Help

- **Documentation**: `/plugins/docs`
- **Examples**: `/plugins/examples`
- **Support**: support@one.ie
- **Community**: Discord channel #plugins

### Contributing

- Submit plugins to marketplace
- Report bugs and security issues
- Request new plugins
- Write plugin reviews

---

## Next Steps

1. **Browse Plugins**: Explore the marketplace
2. **Install Your First Plugin**: Try plugin-knowledge for RAG
3. **Read Configuration Guide**: Learn advanced configuration
4. **Join Community**: Share your plugin use cases

**Ready to supercharge your AI agents? Start exploring plugins now.**

---

**Built with the 6-dimension ontology. ElizaOS plugins, universally compatible.**
