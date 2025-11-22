---
title: ElizaOS Plugin System - Ontology Mapping
dimension: connections
category: integration
tags: elizaos, plugins, ontology, 6-dimensions, mapping
related_dimensions: things, connections, events, groups, people, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: CYCLE-001
ai_context: |
  This document is part of the connections dimension in the integration category.
  Location: one/connections/elizaos-ontology-mapping.md
  Purpose: Map ElizaOS plugin concepts to ONE's 6-dimension ontology
  Related dimensions: things, connections, events, groups, people, knowledge
  For AI agents: Read this to understand how ElizaOS plugins map to the 6 dimensions.
---

# ElizaOS Plugin System → 6-Dimension Ontology Mapping

**Purpose:** Define how every ElizaOS plugin concept maps to ONE's 6-dimension reality model.

**Principle:** The 6-dimension ontology models reality itself. ElizaOS plugins are just another system that maps perfectly to it.

---

## Overview

ElizaOS provides 261+ plugins that extend AI agent capabilities across:
- **Blockchain** (Solana, 0x, EVM chains)
- **Knowledge** (RAG, memory, timeline)
- **Clients** (Discord, Twitter, Telegram)
- **Browser** (Playwright automation)
- **LLMs** (OpenRouter, multiple providers)
- **Adapters** (Storage, database integrations)

**Challenge:** Integrate 261+ plugins into ONE Platform without breaking the ontology.

**Solution:** Every plugin concept maps to one of the 6 dimensions. No exceptions.

---

## The Complete Mapping

### DIMENSION 1: GROUPS (Isolation Boundary)

**Purpose:** Multi-tenant plugin installations with organization scoping.

| ElizaOS Concept | ONE Implementation | Why It Works |
|-----------------|-------------------|--------------|
| Plugin installation scope | `groupId` field on plugin instances | Every org has isolated plugin configurations |
| Plugin registry | Global (no groupId) | Shared registry, org-specific installations |
| Plugin secrets | Org-scoped KV storage | API keys isolated per organization |
| Plugin usage limits | `groups.limits.plugin_executions` | Quota enforcement per org |
| Plugin billing | `groups.subscription.plugin_tier` | Free/Pro/Enterprise tiers |

**Key Insight:** Plugin registry is global (shared knowledge), but installations are org-scoped (isolated instances).

**Example:**
```typescript
// Global plugin definition (no groupId)
{
  _id: "plugin_solana_xyz",
  type: "elizaos_plugin",
  name: "@elizaos/plugin-solana",
  properties: {
    npm_package: "@elizaos/plugin-solana",
    version: "1.2.3",
    capabilities: ["blockchain", "token_swap", "wallet_query"]
  }
}

// Organization-specific installation (groupId scoped)
{
  _id: "instance_abc",
  type: "plugin_instance",
  groupId: "org_123",
  properties: {
    plugin_id: "plugin_solana_xyz",
    config: { rpc_url: "https://api.mainnet-beta.solana.com" },
    secrets: { /* encrypted API keys */ },
    status: "active"
  }
}
```

---

### DIMENSION 2: PEOPLE (Authorization & Governance)

**Purpose:** Define who can install, configure, and use plugins.

| ElizaOS Concept | ONE Implementation | Role Permissions |
|-----------------|-------------------|------------------|
| Plugin author | `person` with role `plugin_author` | Can publish to registry (platform_owner approval) |
| Plugin installer | `person` with role `org_owner` | Can install/uninstall plugins in their org |
| Plugin user | `person` with role `org_user` | Can execute actions from installed plugins |
| Plugin admin | `person` with role `org_owner` | Can configure plugin settings |

**Authorization Matrix:**

| Action | platform_owner | org_owner | org_user | customer |
|--------|----------------|-----------|----------|----------|
| Add to global registry | ✅ | ❌ | ❌ | ❌ |
| Install plugin in org | ✅ | ✅ | ❌ | ❌ |
| Configure plugin | ✅ | ✅ | ❌ | ❌ |
| Execute plugin action | ✅ | ✅ | ✅ | ❌ |
| View plugin logs | ✅ | ✅ | ✅ | ❌ |
| Uninstall plugin | ✅ | ✅ | ❌ | ❌ |

**Key Insight:** People dimension handles ALL authorization. No custom permission system needed.

---

### DIMENSION 3: THINGS (Entities)

**Purpose:** All plugin-related entities are `things` with different types.

| ElizaOS Concept | Thing Type | Properties | Lifecycle |
|-----------------|-----------|------------|-----------|
| Plugin definition | `elizaos_plugin` | npm_package, version, capabilities, registry_url | Immutable once published |
| Plugin installation | `plugin_instance` | plugin_id, config, secrets, status | draft → active → suspended → archived |
| Plugin action | `plugin_action` | plugin_id, action_name, parameters, validation | Defined by plugin |
| Plugin provider | `plugin_provider` | plugin_id, provider_name, data_source | Defined by plugin |
| Plugin evaluator | `plugin_evaluator` | plugin_id, evaluator_name, scoring_logic | Defined by plugin |
| Plugin client | `plugin_client` | plugin_id, client_type, connection_config | Discord, Twitter, etc. |
| Plugin adapter | `plugin_adapter` | plugin_id, adapter_type, storage_config | Database, storage |
| Plugin service | `plugin_service` | plugin_id, service_name, utilities | Helper services |

**New Thing Types to Add to Ontology:**
1. `elizaos_plugin` - Plugin definition from registry
2. `plugin_instance` - Installed plugin in organization
3. `plugin_action` - Available plugin action
4. `plugin_provider` - Plugin data provider
5. `plugin_evaluator` - Plugin evaluator
6. `plugin_client` - Plugin client integration
7. `plugin_adapter` - Plugin storage adapter
8. `plugin_service` - Plugin service utility

**Key Insight:** ONE thing type ≠ ONE ElizaOS plugin. A plugin can create multiple thing types (actions, providers, evaluators).

**Example:**
```typescript
// Plugin definition (thing type: elizaos_plugin)
{
  type: "elizaos_plugin",
  name: "@elizaos/plugin-solana",
  properties: {
    npm_package: "@elizaos/plugin-solana",
    github_repo: "elizaos/plugins/solana",
    version: "1.2.3",
    capabilities: ["blockchain", "token_swap", "wallet_query"],
    dependencies: ["@solana/web3.js"]
  }
}

// Plugin instance (thing type: plugin_instance)
{
  type: "plugin_instance",
  groupId: "org_123",
  name: "Solana Plugin (Production)",
  properties: {
    plugin_id: "plugin_solana_xyz",
    config: { rpc_url: "https://api.mainnet-beta.solana.com" },
    status: "active"
  }
}

// Plugin action (thing type: plugin_action)
{
  type: "plugin_action",
  groupId: "org_123",
  name: "swapTokens",
  properties: {
    plugin_instance_id: "instance_abc",
    action_name: "swapTokens",
    parameters: { fromToken: "string", toToken: "string", amount: "number" }
  }
}
```

---

### DIMENSION 4: CONNECTIONS (Relationships)

**Purpose:** How plugins relate to agents, organizations, and each other.

| ElizaOS Concept | Connection Type | fromThingId | toThingId | Metadata |
|-----------------|----------------|-------------|-----------|----------|
| Plugin dependency | `plugin_depends_on` | plugin A | plugin B | version requirements |
| Agent uses plugin | `plugin_powers` | plugin instance | agent | enabled actions |
| Plugin provides action | `plugin_provides` | plugin instance | action | action metadata |
| Plugin installed in org | `plugin_installed_in` | plugin instance | group | installation timestamp |
| Plugin created by author | `plugin_created_by` | plugin | person | author info |
| Agent uses plugin instance | `plugin_uses` | agent | plugin instance | configuration |

**New Connection Types to Add to Ontology:**
1. `plugin_depends_on` - Plugin dependency relationships
2. `plugin_powers` - Plugin → Agent relationship
3. `plugin_provides` - Plugin → Action/Provider relationship
4. `plugin_installed_in` - Plugin Instance → Organization
5. `plugin_created_by` - Plugin → Author (person)
6. `plugin_uses` - Agent → Plugin Instance

**Key Insight:** Connections enable plugin composition. An agent can use multiple plugins by creating multiple `plugin_uses` connections.

**Example:**
```typescript
// Agent uses Solana plugin
{
  fromThingId: "agent_xyz",
  toThingId: "plugin_instance_solana",
  relationshipType: "plugin_uses",
  metadata: {
    enabled_actions: ["swapTokens", "getBalance"],
    priority: 1
  }
}

// Solana plugin depends on wallet plugin
{
  fromThingId: "plugin_solana",
  toThingId: "plugin_wallet",
  relationshipType: "plugin_depends_on",
  metadata: {
    version_required: ">=2.0.0"
  }
}
```

---

### DIMENSION 5: EVENTS (Audit Trail)

**Purpose:** Complete lifecycle tracking of all plugin operations.

| ElizaOS Concept | Event Type | When Fired | Metadata |
|-----------------|-----------|------------|----------|
| Plugin found in registry | `plugin_discovered` | Registry sync | plugin details |
| Plugin installed | `plugin_installed` | Post-installation | plugin_id, groupId |
| Plugin activated for agent | `plugin_activated` | Agent enables plugin | agent_id, plugin_id |
| Plugin disabled | `plugin_deactivated` | Agent disables plugin | reason |
| Plugin removed | `plugin_uninstalled` | Org removes plugin | reason, data_deleted |
| Plugin action executed | `plugin_action_executed` | Action runs | action, params, result |
| Plugin error | `plugin_error_occurred` | Execution fails | error, stack_trace |
| Plugin updated | `plugin_updated` | Version change | old_version, new_version |
| Plugin configured | `plugin_configured` | Settings changed | config_diff |

**New Event Types to Add to Ontology:**
1. `plugin_discovered` - Plugin found in registry
2. `plugin_installed` - Plugin added to organization
3. `plugin_activated` - Plugin enabled for agent
4. `plugin_deactivated` - Plugin disabled
5. `plugin_uninstalled` - Plugin removed
6. `plugin_action_executed` - Plugin action ran
7. `plugin_error_occurred` - Plugin failure logged
8. `plugin_updated` - Plugin version changed
9. `plugin_configured` - Plugin settings modified

**Key Insight:** Every plugin operation creates an event. Complete audit trail for debugging and compliance.

**Example:**
```typescript
// Plugin installation event
{
  eventType: "plugin_installed",
  actorId: "person_admin",
  targetId: "plugin_instance_solana",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    plugin_version: "1.2.3",
    groupId: "org_123",
    installation_method: "marketplace"
  }
}

// Plugin action execution event
{
  eventType: "plugin_action_executed",
  actorId: "agent_xyz",
  targetId: "action_swap_tokens",
  timestamp: Date.now(),
  metadata: {
    plugin_id: "plugin_solana",
    action_name: "swapTokens",
    execution_time_ms: 234,
    success: true,
    result: { tx_hash: "abc123..." }
  }
}
```

---

### DIMENSION 6: KNOWLEDGE (Understanding)

**Purpose:** Enable semantic search, discovery, and RAG over plugin ecosystem.

| ElizaOS Concept | Knowledge Type | Text | Embedding | Usage |
|-----------------|---------------|------|-----------|-------|
| Plugin README | `chunk` | Full README content | 3072-dim vector | Semantic search for "blockchain plugins" |
| Plugin capability | `label` | "blockchain", "token_swap" | None | Categorical filtering |
| Plugin example | `chunk` | Code examples | 3072-dim vector | Example-based discovery |
| Plugin FAQ | `chunk` | Q&A pairs | 3072-dim vector | "How do I configure Solana RPC?" |
| Plugin compatibility | `label` | "elizaos@v1.0.0" | None | Version filtering |

**Knowledge Strategy:**
1. **Embeddings for READMEs** - Semantic search: "Find plugins for token swaps"
2. **Capability vectors** - "What can this plugin do?"
3. **Compatibility embeddings** - "Does this work with ElizaOS v1.0?"
4. **Example embeddings** - "Show me how to use plugin-solana"
5. **Q&A knowledge base** - RAG: "How do I configure API keys?"

**Key Insight:** Knowledge dimension enables AI-powered plugin discovery. No manual tagging needed.

**Example:**
```typescript
// Plugin README embedding
{
  knowledgeType: "chunk",
  text: "@elizaos/plugin-solana enables blockchain operations on Solana...",
  embedding: [0.123, -0.456, ...], // 3072 dimensions
  sourceThingId: "plugin_solana",
  labels: ["blockchain", "solana", "token_swap"]
}

// Semantic search query
const results = await ctx.db.query("knowledge")
  .withIndex("by_embedding", q =>
    q.eq("embedding", userQueryEmbedding).eq("knowledgeType", "chunk")
  )
  .take(10);
// Returns: plugin-solana, plugin-0x, plugin-wallet (ranked by similarity)
```

---

## Summary: Complete Mapping Table

| ElizaOS Concept | ONE Dimension | Implementation | Why It Works |
|-----------------|---------------|----------------|--------------|
| Plugin registry | KNOWLEDGE | Global plugin definitions | Shared across all orgs |
| Plugin installation | GROUPS + THINGS | `plugin_instance` with `groupId` | Org-scoped isolation |
| Plugin author | PEOPLE | `person` with role `plugin_author` | Authorization handled |
| Plugin dependencies | CONNECTIONS | `plugin_depends_on` | Relationship tracking |
| Plugin lifecycle | EVENTS | 9 new event types | Complete audit trail |
| Plugin discovery | KNOWLEDGE | README embeddings + labels | AI-powered search |
| Plugin actions | THINGS | `plugin_action` type | Composable capabilities |
| Plugin secrets | GROUPS | Org-scoped encrypted storage | Multi-tenant security |
| Plugin permissions | PEOPLE | Role-based authorization | Existing RBAC model |
| Plugin usage tracking | EVENTS | `plugin_action_executed` | Analytics and quotas |

---

## Key Insights

### 1. Zero Impedance Mismatch
Every ElizaOS concept maps cleanly to a dimension. No forcing, no exceptions.

### 2. Plugin Registry = Global Knowledge
The plugin registry is KNOWLEDGE (shared), but installations are THINGS (org-scoped).

### 3. Plugins Create Multiple Things
One plugin can create: plugin_instance, plugin_action, plugin_provider, plugin_evaluator.

### 4. Connections Enable Composition
Agents use plugins via CONNECTIONS. Multiple plugins = multiple connections.

### 5. Events Provide Complete Audit
Every plugin operation creates an event. Debugging and compliance built-in.

### 6. Knowledge Enables Discovery
Embeddings power semantic search. "Find blockchain plugins" works without tags.

---

## What This Enables

**For Developers:**
- Install any of 261+ ElizaOS plugins in ONE Platform
- No custom integration code needed (adapter layer handles it)
- Full TypeScript type safety and validation

**For Organizations:**
- Multi-tenant plugin isolation (org A can't see org B's plugins)
- Granular permissions (who can install vs. use plugins)
- Complete audit trail (who did what, when)

**For AI Agents:**
- Semantic plugin discovery ("Find plugins for blockchain")
- Automatic capability composition (chain multiple plugins)
- Self-service troubleshooting (RAG over plugin docs)

**For Platform:**
- Universal plugin architecture (works for ANY plugin ecosystem)
- No schema migrations (all plugins map to existing 6 dimensions)
- Infinite extensibility (new plugin types = just new properties)

---

## Next Steps

1. **Extend ontology** → Add 8 thing types, 6 connection types, 9 event types
2. **Design adapter layer** → Bridge ElizaOS plugins to ONE services
3. **Build registry service** → Sync from elizaos-plugins GitHub repo
4. **Create UI** → Plugin marketplace and management dashboard
5. **Test with 10 plugins** → Validate mapping with diverse plugin types

---

**Built with the 6-dimension ontology. ElizaOS plugins, universally compatible.**
