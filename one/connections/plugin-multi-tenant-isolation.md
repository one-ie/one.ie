---
title: ElizaOS Plugin Multi-Tenant Isolation Specification
dimension: connections
category: architecture
tags: elizaos, plugins, multi-tenant, isolation, security, groups
related_dimensions: groups, things, connections, events, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: CYCLE-006
ai_context: |
  This document is part of the connections dimension in the architecture category.
  Location: one/connections/plugin-multi-tenant-isolation.md
  Purpose: Define multi-tenant plugin architecture with organization-level isolation
  Related dimensions: groups, things, connections, events, people
  For AI agents: Read this to understand plugin isolation and security model.
---

# ElizaOS Plugin Multi-Tenant Isolation Specification

**Purpose:** Ensure complete isolation of plugin installations, configurations, and data across organizations.

**Principle:** Plugin registry is global (shared). Plugin installations are org-scoped (isolated).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  GLOBAL PLUGIN REGISTRY                      │
│  (Shared across all organizations, no groupId)              │
│                                                              │
│  - Plugin definitions (@elizaos/plugin-solana)              │
│  - Plugin metadata (version, capabilities, dependencies)    │
│  - Plugin documentation embeddings                          │
│  - Plugin ratings and reviews (global)                      │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Organizations install plugins
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              ORGANIZATION A (groupId: org_abc)               │
├─────────────────────────────────────────────────────────────┤
│  Plugin Instances:                                          │
│  - plugin-solana (mainnet, production RPC)                  │
│  - plugin-discord (Bot token A, Guild XYZ)                  │
│                                                              │
│  Configuration: Org A specific settings                     │
│  Secrets: Encrypted keys for Org A                          │
│  Usage: 1,523 plugin actions executed                       │
│  Agents: Agent A uses plugin-solana                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ORGANIZATION B (groupId: org_xyz)               │
├─────────────────────────────────────────────────────────────┤
│  Plugin Instances:                                          │
│  - plugin-solana (devnet, testing RPC)                      │
│  - plugin-twitter (Bot token B, Account ABC)                │
│                                                              │
│  Configuration: Org B specific settings                     │
│  Secrets: Encrypted keys for Org B                          │
│  Usage: 342 plugin actions executed                         │
│  Agents: Agent B uses plugin-solana                         │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight:** Same plugin (`@elizaos/plugin-solana`), different instances, complete isolation.

---

## Isolation Boundaries

### 1. Plugin Registry (Global, No Isolation)

**Scope:** Shared across ALL organizations

**What's Global:**
- Plugin definitions (type: `elizaos_plugin`, no groupId)
- Plugin versions and changelogs
- Plugin README and documentation embeddings
- Plugin capabilities and examples
- Plugin ratings and reviews (aggregated across all orgs)

**Why Global:**
- Single source of truth for plugin metadata
- Centralized updates and versioning
- Efficient storage (one copy for all orgs)
- Community-driven ratings and reviews

**Data Structure:**
```typescript
// Global plugin definition
{
  _id: "plugin_solana_abc",
  type: "elizaos_plugin",
  name: "@elizaos/plugin-solana",
  // NO groupId - global
  properties: {
    npm_package: "@elizaos/plugin-solana",
    version: "1.2.3",
    capabilities: ["blockchain", "token_swap"],
    github_repo: "elizaos/plugins/solana"
  }
}
```

---

### 2. Plugin Instances (Org-Scoped, Isolated)

**Scope:** Scoped to ONE organization (groupId required)

**What's Isolated:**
- Plugin instances (type: `plugin_instance`, groupId required)
- Plugin configurations (RPC URLs, settings)
- Plugin secrets (API keys, tokens) - encrypted per org
- Plugin usage metrics (execution count, error rate)
- Plugin-agent relationships (which agents use which plugins)

**Why Isolated:**
- Complete data isolation (Org A can't see Org B's data)
- Independent configuration (Org A: mainnet, Org B: devnet)
- Separate billing (usage tracked per org)
- Security (secrets never shared across orgs)

**Data Structure:**
```typescript
// Org A's plugin instance
{
  _id: "instance_org_a_solana",
  type: "plugin_instance",
  name: "Solana Plugin (Production)",
  groupId: "org_abc", // ORG ISOLATION
  properties: {
    plugin_id: "plugin_solana_abc",
    plugin_version: "1.2.3",
    config: {
      rpc_url: "https://api.mainnet-beta.solana.com",
      network: "mainnet-beta"
    },
    secrets_encrypted: true
  }
}

// Org B's plugin instance (COMPLETELY SEPARATE)
{
  _id: "instance_org_b_solana",
  type: "plugin_instance",
  name: "Solana Plugin (Testing)",
  groupId: "org_xyz", // DIFFERENT ORG
  properties: {
    plugin_id: "plugin_solana_abc", // Same plugin
    plugin_version: "1.2.3",
    config: {
      rpc_url: "https://api.devnet.solana.com",
      network: "devnet" // Different network
    },
    secrets_encrypted: true
  }
}
```

**Query Pattern:**
```typescript
// Get ALL plugin instances for organization
const orgPlugins = await ctx.db.query("things")
  .withIndex("by_org_type", q =>
    q.eq("groupId", userOrganizationId)
     .eq("type", "plugin_instance")
  )
  .collect();

// RESULT: Only returns plugins installed in user's org
// Org A sees: [plugin_instance_solana_mainnet, plugin_instance_discord]
// Org B sees: [plugin_instance_solana_devnet, plugin_instance_twitter]
```

---

### 3. Plugin Configurations (Org-Scoped)

**Scope:** Each organization has independent plugin configurations

**Configuration Isolation:**

| Configuration | Org A | Org B |
|---------------|-------|-------|
| Solana RPC URL | `https://api.mainnet-beta.solana.com` | `https://api.devnet.solana.com` |
| Solana Network | `mainnet-beta` | `devnet` |
| Discord Bot Token | `org_a_bot_token` (encrypted) | N/A (not installed) |
| Twitter API Key | N/A (not installed) | `org_b_api_key` (encrypted) |

**Example:**
```typescript
// Org A configuration
{
  plugin_instance_id: "instance_org_a_solana",
  groupId: "org_abc",
  config: {
    rpc_url: "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
    commitment: "confirmed",
    max_retries: 3
  }
}

// Org B configuration (DIFFERENT SETTINGS)
{
  plugin_instance_id: "instance_org_b_solana",
  groupId: "org_xyz",
  config: {
    rpc_url: "https://api.devnet.solana.com",
    network: "devnet",
    commitment: "processed",
    max_retries: 5
  }
}
```

---

### 4. Plugin Secrets (Org-Scoped, Encrypted)

**Scope:** Secrets stored per organization, encrypted at rest

**Secret Storage Architecture:**

```typescript
// Option 1: Encrypted in plugin instance properties
{
  type: "plugin_instance",
  groupId: "org_abc",
  properties: {
    config: { /* public config */ },
    secrets: {
      api_key: encrypt("org_a_api_key", orgAEncryptionKey),
      bot_token: encrypt("org_a_bot_token", orgAEncryptionKey)
    }
  }
}

// Option 2: External secret store (KV) with org-scoped keys
const secretKey = `secrets:${groupId}:${pluginInstanceId}:api_key`;
await kv.set(secretKey, encryptedValue);

// Option 3: Convex environment variables (per deployment)
// Secrets stored in Convex dashboard, accessed by org
```

**Secret Access Control:**
```typescript
// Only org owners can view/update secrets
async function updatePluginSecret(
  ctx: MutationCtx,
  args: { pluginInstanceId: Id<"things">, secretName: string, secretValue: string }
) {
  // 1. Get user's organization
  const user = await getAuthenticatedUser(ctx);
  const org = await ctx.db.get(user.groupId);

  // 2. Verify plugin belongs to user's org
  const pluginInstance = await ctx.db.get(args.pluginInstanceId);
  if (pluginInstance.groupId !== user.groupId) {
    throw new Error("Unauthorized: Plugin not in your organization");
  }

  // 3. Verify user has permission
  if (user.role !== "org_owner") {
    throw new Error("Unauthorized: Only org owners can update secrets");
  }

  // 4. Encrypt and store secret
  const encrypted = encrypt(args.secretValue, org.encryptionKey);
  await updatePluginSecret(args.pluginInstanceId, args.secretName, encrypted);
}
```

---

### 5. Plugin Usage Tracking (Org-Scoped)

**Scope:** Usage metrics tracked per organization

**Usage Metrics:**
- Plugin action execution count
- Plugin error count
- Plugin execution time (average, p50, p95, p99)
- Plugin data transfer (bytes)
- Plugin cost (compute units, API calls)

**Storage:**
```typescript
// Events table (already org-scoped via metadata)
{
  eventType: "plugin_action_executed",
  actorId: "agent_org_a",
  targetId: "action_swap_tokens",
  timestamp: Date.now(),
  metadata: {
    groupId: "org_abc", // ORG ISOLATION
    plugin_instance_id: "instance_org_a_solana",
    execution_time_ms: 234,
    success: true
  }
}

// Aggregated usage (in groups table)
{
  _id: "org_abc",
  type: "organization",
  usage: {
    plugin_executions: 1523,
    plugin_errors: 12,
    plugin_total_cost: 45.67 // USD
  },
  limits: {
    plugin_executions: 10000, // Monthly limit
    plugin_total_cost: 100.00  // Monthly budget
  }
}
```

**Query Pattern:**
```typescript
// Get plugin usage for organization
const orgUsage = await ctx.db.query("events")
  .withIndex("by_type", q => q.eq("eventType", "plugin_action_executed"))
  .filter(q => q.eq(q.field("metadata").groupId, userOrganizationId))
  .filter(q => q.gte(q.field("timestamp"), startOfMonth))
  .collect();

// Calculate total executions
const totalExecutions = orgUsage.length;
const successCount = orgUsage.filter(e => e.metadata.success).length;
const errorCount = orgUsage.filter(e => !e.metadata.success).length;
```

---

## Enforcement Mechanisms

### 1. Query-Level Isolation

**Every query MUST filter by groupId:**

```typescript
// CORRECT: Filtered by org
const orgPlugins = await ctx.db.query("things")
  .withIndex("by_org_type", q =>
    q.eq("groupId", userOrganizationId)
     .eq("type", "plugin_instance")
  )
  .collect();

// INCORRECT: Missing groupId filter (SECURITY VIOLATION)
const allPlugins = await ctx.db.query("things")
  .withIndex("by_type", q => q.eq("type", "plugin_instance"))
  .collect(); // Returns ALL orgs' plugins!!!
```

**Middleware Pattern:**
```typescript
// Automatic org filtering middleware
function withOrgFilter<T>(
  query: Query<T>,
  userGroupId: Id<"groups">
): Query<T> {
  return query.filter(q => q.eq(q.field("groupId"), userGroupId));
}

// Usage
const orgPlugins = await withOrgFilter(
  ctx.db.query("things").withIndex("by_type", q => q.eq("type", "plugin_instance")),
  user.groupId
).collect();
```

---

### 2. Mutation-Level Validation

**Every mutation MUST validate groupId:**

```typescript
async function installPlugin(
  ctx: MutationCtx,
  args: { pluginId: Id<"things"> }
) {
  // 1. Get authenticated user
  const user = await getAuthenticatedUser(ctx);

  // 2. Validate user has organization
  if (!user.groupId) {
    throw new Error("User must belong to an organization");
  }

  // 3. Create plugin instance (org-scoped)
  const pluginInstance = await ctx.db.insert("things", {
    type: "plugin_instance",
    groupId: user.groupId, // REQUIRED
    properties: { plugin_id: args.pluginId }
  });

  // 4. Log event with org metadata
  await ctx.db.insert("events", {
    eventType: "plugin_installed",
    actorId: user._id,
    targetId: pluginInstance,
    timestamp: Date.now(),
    metadata: {
      groupId: user.groupId // REQUIRED
    }
  });
}
```

---

### 3. Access Control Checks

**Verify resource ownership before mutations:**

```typescript
async function updatePluginConfig(
  ctx: MutationCtx,
  args: { pluginInstanceId: Id<"things">, config: any }
) {
  // 1. Get authenticated user
  const user = await getAuthenticatedUser(ctx);

  // 2. Get plugin instance
  const pluginInstance = await ctx.db.get(args.pluginInstanceId);

  // 3. VERIFY OWNERSHIP
  if (pluginInstance.groupId !== user.groupId) {
    throw new Error("Unauthorized: Plugin belongs to different organization");
  }

  // 4. Verify permissions
  if (user.role !== "org_owner") {
    throw new Error("Unauthorized: Only org owners can update plugin config");
  }

  // 5. Update config
  await ctx.db.patch(args.pluginInstanceId, {
    properties: {
      ...pluginInstance.properties,
      config: args.config
    }
  });
}
```

---

## Multi-Tenant Patterns

### Pattern 1: Same Plugin, Different Configs

**Use Case:** Two organizations use the same plugin with different configurations.

```typescript
// Org A: Mainnet production
{
  type: "plugin_instance",
  groupId: "org_a",
  properties: {
    plugin_id: "plugin_solana",
    config: { network: "mainnet-beta" }
  }
}

// Org B: Devnet testing
{
  type: "plugin_instance",
  groupId: "org_b",
  properties: {
    plugin_id: "plugin_solana",
    config: { network: "devnet" }
  }
}
```

---

### Pattern 2: Plugin Dependency Resolution (Org-Scoped)

**Use Case:** Plugin A depends on Plugin B. Both must be installed in the same org.

```typescript
async function installPluginWithDependencies(
  ctx: MutationCtx,
  args: { pluginId: Id<"things"> }
) {
  const user = await getAuthenticatedUser(ctx);
  const plugin = await ctx.db.get(args.pluginId);

  // Get plugin dependencies
  const dependencies = plugin.properties.dependencies || [];

  // Check if dependencies are installed IN THIS ORG
  for (const depPackage of dependencies) {
    const depInstalled = await ctx.db.query("things")
      .withIndex("by_org_type", q =>
        q.eq("groupId", user.groupId)
         .eq("type", "plugin_instance")
      )
      .filter(q => q.eq(q.field("properties").npm_package, depPackage))
      .first();

    if (!depInstalled) {
      throw new Error(`Dependency not installed: ${depPackage}`);
    }
  }

  // Install plugin
  return await ctx.db.insert("things", {
    type: "plugin_instance",
    groupId: user.groupId,
    properties: { plugin_id: args.pluginId }
  });
}
```

---

## Resource Quotas (Per Organization)

**Enforce limits at organization level:**

```typescript
// Organization limits
{
  _id: "org_abc",
  type: "organization",
  plan: "pro", // or "free", "enterprise"
  limits: {
    max_plugins_installed: 50,      // Max 50 plugins
    max_plugin_executions_monthly: 100000, // Max 100k actions/month
    max_plugin_storage_mb: 1000,    // Max 1GB storage
    max_agents_using_plugins: 10    // Max 10 agents can use plugins
  },
  usage: {
    plugins_installed: 5,
    plugin_executions_monthly: 1523,
    plugin_storage_mb: 45,
    agents_using_plugins: 2
  }
}
```

**Quota Enforcement:**
```typescript
async function installPlugin(ctx: MutationCtx, args: { pluginId: Id<"things"> }) {
  const user = await getAuthenticatedUser(ctx);
  const org = await ctx.db.get(user.groupId);

  // Check quota
  if (org.usage.plugins_installed >= org.limits.max_plugins_installed) {
    throw new Error(`Plugin limit reached: ${org.limits.max_plugins_installed}`);
  }

  // Install plugin
  const instance = await ctx.db.insert("things", {
    type: "plugin_instance",
    groupId: user.groupId,
    properties: { plugin_id: args.pluginId }
  });

  // Update usage
  await ctx.db.patch(user.groupId, {
    usage: {
      ...org.usage,
      plugins_installed: org.usage.plugins_installed + 1
    }
  });

  return instance;
}
```

---

## Security Checklist

- [ ] All plugin instances have `groupId` field
- [ ] All queries filter by user's `groupId`
- [ ] All mutations validate resource ownership (groupId match)
- [ ] Secrets encrypted per organization
- [ ] Usage tracking scoped to organization
- [ ] Quotas enforced per organization
- [ ] Events include `groupId` in metadata
- [ ] No cross-org data leakage in queries
- [ ] Plugin registry is global (no groupId)
- [ ] Plugin instances are org-scoped (groupId required)

---

**Built with the 6-dimension ontology. Complete multi-tenant isolation for plugin ecosystem.**
