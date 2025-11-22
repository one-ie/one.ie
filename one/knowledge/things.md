---
title: Things - Entity Types Reference
dimension: knowledge
category: ontology
tags: things, entities, types, 6-dimensions
related_dimensions: connections, events, groups, people, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: CYCLE-002
ai_context: |
  This document is part of the knowledge dimension in the ontology category.
  Location: one/knowledge/things.md
  Purpose: Define all entity types (things) in the 6-dimension ontology
  Related dimensions: connections, events, groups, people, knowledge
  For AI agents: Read this to understand all available thing types.
---

# Things - Entity Types Reference

**Purpose:** Define all entity types that exist in the ONE Platform's 6-dimension ontology.

**Principle:** Everything is a `thing` with a `type` field. No separate tables for each entity.

---

## Overview

The `things` table is the universal container for ALL entities in ONE Platform:
- Users, agents, content, products, courses
- Blockchain assets, tokens, NFTs
- AI agents, workflows, tasks
- **ElizaOS plugins, plugin instances, actions**

**Database Implementation:**
```typescript
things: defineTable({
  type: v.string(),               // Entity type (66+ types)
  name: v.string(),               // Display name
  groupId: v.optional(v.id("groups")), // Org scoping (multi-tenant)
  properties: v.any(),            // Type-specific data (JSON)
  status: v.string(),             // Lifecycle status
  createdAt: v.number(),
  updatedAt: v.number()
})
```

**Key Insight:** New entity type = just add a new `type` value. No schema migration needed.

---

## Core Entity Types (Existing)

### 1. People & Organizations
- `creator` - Content creator, agent owner
- `audience_member` - Follower, subscriber, customer
- `organization` - Company, DAO, community
- `ai_clone` - Digital twin of creator

### 2. Content & Media
- `blog_post` - Article, written content
- `video` - Video content
- `podcast` - Audio content
- `livestream` - Live streaming session
- `landing_page` - Marketing page
- `website` - Full website
- `template` - Reusable page template

### 3. Education & Courses
- `course` - Educational course
- `lesson` - Individual lesson
- `module` - Course module (collection of lessons)
- `quiz` - Assessment
- `certification` - Completion certificate

### 4. Digital Products
- `digital_product` - Downloadable product
- `membership` - Subscription membership
- `consultation` - Consulting service
- `nft` - Non-fungible token

### 5. Community & Engagement
- `community` - Community group
- `conversation` - Discussion thread
- `message` - Individual message

### 6. Blockchain & Crypto
- `token` - Fungible token
- `token_contract` - Smart contract for token
- `wallet` - Blockchain wallet

### 7. Business Operations
- `payment` - Payment record
- `subscription` - Recurring subscription
- `invoice` - Invoice document
- `metric` - Business metric
- `insight` - AI-generated insight
- `task` - Work task

### 8. AI & Agents
- `engineering_agent` - AI engineer agent
- `strategy_agent` - Strategy AI agent
- `marketing_agent` - Marketing AI agent

---

## NEW: ElizaOS Plugin Entity Types (CYCLE-002)

### Plugin Ecosystem Types

#### 1. `elizaos_plugin`
**Purpose:** Plugin definition from ElizaOS registry (global, no groupId)

**Properties:**
```typescript
{
  type: "elizaos_plugin",
  name: "@elizaos/plugin-solana",
  properties: {
    npm_package: "@elizaos/plugin-solana",
    github_repo: "elizaos/plugins/solana",
    registry_url: "https://github.com/elizaos/plugins/registry",
    version: "1.2.3",
    capabilities: ["blockchain", "token_swap", "wallet_query"],
    dependencies: ["@solana/web3.js", "@elizaos/plugin-wallet"],
    author: "ElizaOS Team",
    license: "MIT",
    description: "Solana blockchain integration for AI agents",
    tags: ["blockchain", "solana", "defi"]
  }
}
```

**Lifecycle:** `draft` → `published` → `deprecated`

**Scoping:** Global (no groupId) - shared across all organizations

---

#### 2. `plugin_instance`
**Purpose:** Installed plugin in an organization (org-scoped)

**Properties:**
```typescript
{
  type: "plugin_instance",
  name: "Solana Plugin (Production)",
  groupId: "org_123",
  properties: {
    plugin_id: "plugin_solana_xyz", // Reference to elizaos_plugin
    plugin_version: "1.2.3",
    config: {
      rpc_url: "https://api.mainnet-beta.solana.com",
      network: "mainnet-beta",
      commitment: "confirmed"
    },
    secrets_encrypted: true, // Secrets stored separately
    installation_timestamp: 1234567890,
    installed_by: "person_admin_xyz"
  },
  status: "active" // draft | active | suspended | archived
}
```

**Lifecycle:** `draft` → `active` → `suspended` → `archived`

**Scoping:** Org-scoped (groupId required)

---

#### 3. `plugin_action`
**Purpose:** Available action provided by a plugin

**Properties:**
```typescript
{
  type: "plugin_action",
  name: "swapTokens",
  groupId: "org_123",
  properties: {
    plugin_instance_id: "instance_solana_123",
    action_name: "swapTokens",
    description: "Swap one Solana token for another",
    parameters: {
      fromToken: { type: "string", required: true, description: "Source token mint address" },
      toToken: { type: "string", required: true, description: "Destination token mint address" },
      amount: { type: "number", required: true, description: "Amount to swap" },
      slippage: { type: "number", required: false, default: 0.5, description: "Slippage tolerance (%)" }
    },
    returns: {
      type: "object",
      properties: {
        tx_hash: "string",
        amount_received: "number"
      }
    },
    examples: [
      {
        input: { fromToken: "SOL", toToken: "USDC", amount: 1 },
        output: { tx_hash: "abc123...", amount_received: 143.21 }
      }
    ]
  },
  status: "active"
}
```

**Lifecycle:** `active` | `deprecated`

**Scoping:** Org-scoped (inherited from plugin_instance)

---

#### 4. `plugin_provider`
**Purpose:** Data provider offered by a plugin

**Properties:**
```typescript
{
  type: "plugin_provider",
  name: "getTokenBalance",
  groupId: "org_123",
  properties: {
    plugin_instance_id: "instance_solana_123",
    provider_name: "getTokenBalance",
    description: "Get token balance for a wallet",
    data_source: "solana_rpc",
    cache_ttl: 60, // Seconds
    parameters: {
      wallet_address: { type: "string", required: true },
      token_mint: { type: "string", required: false }
    },
    returns: {
      type: "object",
      properties: {
        balance: "number",
        decimals: "number",
        ui_amount: "string"
      }
    }
  },
  status: "active"
}
```

**Lifecycle:** `active` | `deprecated`

**Scoping:** Org-scoped

---

#### 5. `plugin_evaluator`
**Purpose:** Evaluator for scoring and validation

**Properties:**
```typescript
{
  type: "plugin_evaluator",
  name: "validateTransaction",
  groupId: "org_123",
  properties: {
    plugin_instance_id: "instance_solana_123",
    evaluator_name: "validateTransaction",
    description: "Validate Solana transaction before execution",
    scoring_logic: "risk_based",
    parameters: {
      transaction: { type: "object", required: true }
    },
    returns: {
      type: "object",
      properties: {
        valid: "boolean",
        score: "number", // 0-1
        risks: "array<string>",
        recommendations: "array<string>"
      }
    }
  },
  status: "active"
}
```

**Lifecycle:** `active` | `deprecated`

**Scoping:** Org-scoped

---

#### 6. `plugin_client`
**Purpose:** Client integration (Discord, Twitter, Telegram, etc.)

**Properties:**
```typescript
{
  type: "plugin_client",
  name: "Discord Bot Integration",
  groupId: "org_123",
  properties: {
    plugin_instance_id: "instance_discord_123",
    client_type: "discord",
    connection_config: {
      bot_token_encrypted: true,
      guild_id: "123456789",
      channels: ["general", "announcements"]
    },
    capabilities: ["send_message", "read_messages", "manage_roles"],
    webhook_url: "https://one.ie/webhooks/discord/org_123"
  },
  status: "active"
}
```

**Lifecycle:** `active` | `suspended` | `archived`

**Scoping:** Org-scoped

**Client Types:** `discord`, `twitter`, `telegram`, `slack`, `whatsapp`

---

#### 7. `plugin_adapter`
**Purpose:** Storage or database adapter

**Properties:**
```typescript
{
  type: "plugin_adapter",
  name: "PostgreSQL Adapter",
  groupId: "org_123",
  properties: {
    plugin_instance_id: "instance_postgres_123",
    adapter_type: "database",
    storage_config: {
      host: "db.example.com",
      port: 5432,
      database: "ai_agents",
      credentials_encrypted: true
    },
    capabilities: ["read", "write", "query"],
    connection_pool_size: 10
  },
  status: "active"
}
```

**Lifecycle:** `active` | `suspended` | `archived`

**Scoping:** Org-scoped

**Adapter Types:** `database`, `storage`, `cache`, `queue`

---

#### 8. `plugin_service`
**Purpose:** Utility service provided by plugin

**Properties:**
```typescript
{
  type: "plugin_service",
  name: "Token Price Oracle",
  groupId: "org_123",
  properties: {
    plugin_instance_id: "instance_oracle_123",
    service_name: "getPriceUSD",
    service_type: "price_oracle",
    data_source: "jupiter_aggregator",
    refresh_interval: 10, // Seconds
    utilities: [
      { name: "getPriceUSD", description: "Get current USD price for token" },
      { name: "getHistoricalPrice", description: "Get historical price data" }
    ]
  },
  status: "active"
}
```

**Lifecycle:** `active` | `deprecated`

**Scoping:** Org-scoped

---

## Complete Thing Types List (74 Total)

### Core (24 types)
1. `creator` - Content creator
2. `audience_member` - Follower, subscriber
3. `organization` - Company, DAO
4. `ai_clone` - Digital twin
5. `blog_post` - Article
6. `video` - Video content
7. `podcast` - Audio content
8. `livestream` - Live stream
9. `landing_page` - Marketing page
10. `website` - Full website
11. `template` - Page template
12. `course` - Educational course
13. `lesson` - Course lesson
14. `module` - Course module
15. `quiz` - Assessment
16. `certification` - Certificate
17. `digital_product` - Product
18. `membership` - Subscription
19. `consultation` - Service
20. `nft` - Non-fungible token
21. `community` - Group
22. `conversation` - Discussion
23. `message` - Chat message
24. `token` - Fungible token

### Blockchain & Business (18 types)
25. `token_contract` - Smart contract
26. `wallet` - Blockchain wallet
27. `payment` - Payment record
28. `subscription` - Recurring subscription
29. `invoice` - Invoice
30. `metric` - Business metric
31. `insight` - AI insight
32. `task` - Work task
33. `engineering_agent` - AI engineer
34. `strategy_agent` - Strategy AI
35. `marketing_agent` - Marketing AI
36. `workflow` - Automated workflow
37. `integration` - External integration
38. `api_key` - API credential
39. `webhook` - Webhook endpoint
40. `schedule` - Scheduled task
41. `notification` - User notification
42. `report` - Analytics report

### ElizaOS Plugins (8 NEW types) - CYCLE-002
43. `elizaos_plugin` - Plugin definition
44. `plugin_instance` - Installed plugin
45. `plugin_action` - Plugin action
46. `plugin_provider` - Data provider
47. `plugin_evaluator` - Evaluator
48. `plugin_client` - Client integration
49. `plugin_adapter` - Storage adapter
50. `plugin_service` - Utility service

### Platform (24 types)
51. `user_settings` - User preferences
52. `theme` - UI theme
53. `component` - Reusable component
54. `page` - Generic page
55. `form` - Form definition
56. `email_template` - Email template
57. `sms_template` - SMS template
58. `push_notification` - Push notification
59. `ab_test` - A/B test
60. `feature_flag` - Feature toggle
61. `role` - User role
62. `permission` - Permission
63. `audit_log` - Audit record
64. `error_log` - Error record
65. `analytics_event` - Analytics event
66. `session` - User session
67. `device` - User device
68. `ip_address` - IP record
69. `geolocation` - Location data
70. `referrer` - Traffic source
71. `campaign` - Marketing campaign
72. `tag` - Content tag
73. `category` - Content category
74. `attachment` - File attachment

---

## Status Lifecycle

All things follow a common status lifecycle:

```
draft → active → published → suspended → archived
```

- **`draft`** - Being created, not visible to users
- **`active`** - Operational, available for use
- **`published`** - Public, discoverable (content only)
- **`suspended`** - Temporarily disabled (violations, non-payment)
- **`archived`** - Soft-deleted, retained for compliance

**Plugin-specific:**
- Plugin definitions: `draft` → `published` → `deprecated`
- Plugin instances: `draft` → `active` → `suspended` → `archived`

---

## Properties Field Guidelines

The `properties` field is a JSON object containing type-specific data:

**Rules:**
1. **Use TypeScript interfaces** for type safety
2. **Validate on write** using Zod schemas
3. **Keep flat when possible** (avoid deep nesting)
4. **Use arrays for lists** (not JSON strings)
5. **Encrypt secrets separately** (never in properties)

**Example:**
```typescript
// GOOD
properties: {
  rpc_url: "https://api.mainnet-beta.solana.com",
  network: "mainnet-beta",
  retry_attempts: 3
}

// BAD
properties: {
  config: {
    rpc: {
      url: "https://api.mainnet-beta.solana.com",
      settings: {
        network: {
          name: "mainnet-beta"
        }
      }
    }
  }
}
```

---

## Indexing Strategy

**Required indexes for plugin types:**

```typescript
// By type
.index("by_type", ["type"])

// By organization and type
.index("by_org_type", ["groupId", "type"])

// By status
.index("by_status", ["status"])

// Search by name
.searchIndex("search_things", {
  searchField: "name",
  filterFields: ["type", "status", "groupId"]
})
```

**Query examples:**
```typescript
// Get all plugins in organization
const plugins = await ctx.db.query("things")
  .withIndex("by_org_type", q =>
    q.eq("groupId", orgId).eq("type", "plugin_instance")
  )
  .collect();

// Search for plugins by name
const results = await ctx.db.query("things")
  .withSearchIndex("search_things", q =>
    q.search("name", "solana").eq("type", "elizaos_plugin")
  )
  .collect();
```

---

## Adding New Thing Types

**Process:**
1. **Define type name** - Use snake_case, be specific
2. **Design properties** - Create TypeScript interface
3. **Add to this document** - Update thing types list
4. **Create Zod validator** - Type-safe validation
5. **Add indexes if needed** - Query optimization
6. **Update tests** - Validate new type works

**Example:**
```typescript
// 1. Type name
const type = "plugin_instance";

// 2. Properties interface
interface PluginInstanceProperties {
  plugin_id: string;
  plugin_version: string;
  config: Record<string, any>;
  secrets_encrypted: boolean;
}

// 3. Zod validator
const pluginInstanceSchema = z.object({
  type: z.literal("plugin_instance"),
  name: z.string(),
  groupId: z.string(),
  properties: z.object({
    plugin_id: z.string(),
    plugin_version: z.string(),
    config: z.record(z.any()),
    secrets_encrypted: z.boolean()
  }),
  status: z.enum(["draft", "active", "suspended", "archived"])
});

// 4. Usage
await ctx.db.insert("things", {
  type: "plugin_instance",
  name: "Solana Plugin",
  groupId: org._id,
  properties: {
    plugin_id: "plugin_xyz",
    plugin_version: "1.2.3",
    config: { rpc_url: "..." },
    secrets_encrypted: true
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now()
});
```

---

**Built with the 6-dimension ontology. 74 thing types, infinitely extensible.**
