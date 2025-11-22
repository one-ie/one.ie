---
title: ElizaOS Plugin RBAC Specification
dimension: people
category: authorization
tags: elizaos, plugins, rbac, authorization, permissions, security
related_dimensions: groups, things, connections, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: CYCLE-007
ai_context: |
  This document is part of the people dimension in the authorization category.
  Location: one/people/plugin-rbac-specification.md
  Purpose: Define role-based access control for ElizaOS plugin system
  Related dimensions: groups, things, connections, events
  For AI agents: Read this to understand plugin permission model.
---

# ElizaOS Plugin RBAC Specification

**Purpose:** Define who can install, configure, and use plugins using ONE's existing 4-role authorization model.

**Principle:** No custom permission system. Map plugin operations to existing roles: `platform_owner`, `org_owner`, `org_user`, `customer`.

---

## Role Definitions

ONE Platform has 4 roles:

| Role | Scope | Plugin Context |
|------|-------|----------------|
| `platform_owner` | Global | Can manage global plugin registry |
| `org_owner` | Organization | Can install/configure plugins in their org |
| `org_user` | Organization | Can use plugins installed by org owner |
| `customer` | None | Cannot access plugins (future: marketplace purchases) |

**Key Insight:** Plugin permissions map perfectly to existing roles. No new roles needed.

---

## Permission Matrix

### Plugin Registry Operations (Global)

| Operation | platform_owner | org_owner | org_user | customer |
|-----------|----------------|-----------|----------|----------|
| View global plugin registry | ✅ | ✅ | ✅ | ❌ |
| Search for plugins | ✅ | ✅ | ✅ | ❌ |
| View plugin details | ✅ | ✅ | ✅ | ❌ |
| Add plugin to registry | ✅ | ❌ | ❌ | ❌ |
| Update plugin metadata | ✅ | ❌ | ❌ | ❌ |
| Remove plugin from registry | ✅ | ❌ | ❌ | ❌ |
| Moderate plugin ratings | ✅ | ❌ | ❌ | ❌ |
| Approve plugin submissions | ✅ | ❌ | ❌ | ❌ |

---

### Plugin Installation (Organization)

| Operation | platform_owner | org_owner | org_user | customer |
|-----------|----------------|-----------|----------|----------|
| View org's installed plugins | ✅ | ✅ | ✅ | ❌ |
| Install plugin in org | ✅ | ✅ | ❌ | ❌ |
| Uninstall plugin from org | ✅ | ✅ | ❌ | ❌ |
| Update plugin version | ✅ | ✅ | ❌ | ❌ |
| View plugin dependencies | ✅ | ✅ | ✅ | ❌ |

**Rationale:**
- **org_owner** manages infrastructure (what plugins are available)
- **org_user** consumes infrastructure (uses installed plugins)
- **platform_owner** has superuser access (debugging, support)

---

### Plugin Configuration (Organization)

| Operation | platform_owner | org_owner | org_user | customer |
|-----------|----------------|-----------|----------|----------|
| View plugin config | ✅ | ✅ | 🔍 | ❌ |
| Update plugin config | ✅ | ✅ | ❌ | ❌ |
| View plugin secrets (API keys) | ✅ | ✅ | ❌ | ❌ |
| Update plugin secrets | ✅ | ✅ | ❌ | ❌ |
| Reset plugin to defaults | ✅ | ✅ | ❌ | ❌ |

🔍 = View non-sensitive config only (org_user can see RPC URL, but not API keys)

**Rationale:**
- **Secrets are sensitive** → Only org_owner can view/update
- **Config impacts billing** → Only org_owner can change
- **org_user needs context** → Can view non-sensitive config (e.g., which network)

---

### Plugin Activation (Agent-Level)

| Operation | platform_owner | org_owner | org_user | customer |
|-----------|----------------|-----------|----------|----------|
| Activate plugin for agent | ✅ | ✅ | ✅ | ❌ |
| Deactivate plugin for agent | ✅ | ✅ | ✅ | ❌ |
| Configure plugin-agent settings | ✅ | ✅ | ✅ | ❌ |
| View which agents use plugin | ✅ | ✅ | ✅ | ❌ |

**Rationale:**
- **Agent management is accessible** → org_user can enable plugins for their agents
- **Doesn't impact org infrastructure** → Safe to delegate to org_user
- **Encourages plugin adoption** → More users = more value

---

### Plugin Execution (Runtime)

| Operation | platform_owner | org_owner | org_user | customer |
|-----------|----------------|-----------|----------|----------|
| Execute plugin action | ✅ | ✅ | ✅ | ❌ |
| View plugin execution logs | ✅ | ✅ | ✅ | ❌ |
| Retry failed plugin action | ✅ | ✅ | ✅ | ❌ |
| Cancel running plugin action | ✅ | ✅ | ✅ | ❌ |
| View plugin usage metrics | ✅ | ✅ | 🔍 | ❌ |

🔍 = org_user can view their own usage, org_owner can view all org usage

**Rationale:**
- **Execution is the value** → All authenticated org members can execute
- **Logs for debugging** → Transparency for all users
- **Usage tracking** → org_owner monitors quotas, org_user monitors their usage

---

### Plugin Ratings & Reviews (Global)

| Operation | platform_owner | org_owner | org_user | customer |
|-----------|----------------|-----------|----------|----------|
| View plugin ratings | ✅ | ✅ | ✅ | ❌ |
| Rate plugin (1-5 stars) | ✅ | ✅ | ✅ | ❌ |
| Write plugin review | ✅ | ✅ | ✅ | ❌ |
| Edit own review | ✅ | ✅ | ✅ | ❌ |
| Delete own review | ✅ | ✅ | ✅ | ❌ |
| Moderate reviews (delete others) | ✅ | ❌ | ❌ | ❌ |

**Rationale:**
- **Reviews improve quality** → All users can contribute
- **Moderation prevents abuse** → Only platform_owner can moderate

---

## Authorization Implementation Patterns

### Pattern 1: Query Authorization

**Verify user belongs to organization:**

```typescript
async function getInstalledPlugins(ctx: QueryCtx) {
  // 1. Get authenticated user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db.query("things")
    .withIndex("by_email", q => q.eq("email", identity.email))
    .filter(q => q.eq(q.field("type"), "creator"))
    .first();

  if (!user) throw new Error("User not found");

  // 2. Verify user has organization
  if (!user.properties.groupId) {
    throw new Error("User must belong to an organization");
  }

  // 3. Query org's plugins (auto-filtered by groupId)
  const plugins = await ctx.db.query("things")
    .withIndex("by_org_type", q =>
      q.eq("groupId", user.properties.groupId)
       .eq("type", "plugin_instance")
    )
    .collect();

  return plugins;
}
```

---

### Pattern 2: Mutation Authorization

**Verify user has required role:**

```typescript
async function installPlugin(
  ctx: MutationCtx,
  args: { pluginId: Id<"things"> }
) {
  // 1. Get authenticated user
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db.query("things")
    .withIndex("by_email", q => q.eq("email", identity.email))
    .filter(q => q.eq(q.field("type"), "creator"))
    .first();

  // 2. Verify role (only org_owner or platform_owner)
  if (user.properties.role !== "org_owner" && user.properties.role !== "platform_owner") {
    throw new Error("Unauthorized: Only org owners can install plugins");
  }

  // 3. Get organization
  const org = await ctx.db.get(user.properties.groupId);
  if (!org || org.status !== "active") {
    throw new Error("Invalid organization");
  }

  // 4. Check quota
  if (org.usage.plugins_installed >= org.limits.max_plugins_installed) {
    throw new Error("Plugin installation limit reached");
  }

  // 5. Install plugin
  const instance = await ctx.db.insert("things", {
    type: "plugin_instance",
    groupId: user.properties.groupId,
    properties: {
      plugin_id: args.pluginId,
      installed_by: user._id,
      installed_at: Date.now()
    },
    status: "active"
  });

  // 6. Log event
  await ctx.db.insert("events", {
    eventType: "plugin_installed",
    actorId: user._id,
    targetId: instance,
    timestamp: Date.now(),
    metadata: { groupId: user.properties.groupId }
  });

  return instance;
}
```

---

### Pattern 3: Field-Level Authorization

**Filter sensitive fields based on role:**

```typescript
async function getPluginConfig(
  ctx: QueryCtx,
  args: { pluginInstanceId: Id<"things"> }
) {
  // 1. Get authenticated user
  const user = await getAuthenticatedUser(ctx);

  // 2. Get plugin instance
  const plugin = await ctx.db.get(args.pluginInstanceId);

  // 3. Verify ownership
  if (plugin.groupId !== user.properties.groupId) {
    throw new Error("Unauthorized: Plugin belongs to different organization");
  }

  // 4. Filter sensitive fields based on role
  if (user.properties.role === "org_user") {
    // org_user: Return config WITHOUT secrets
    return {
      ...plugin.properties.config,
      // Redact secrets
      api_key: "***REDACTED***",
      bot_token: "***REDACTED***"
    };
  } else {
    // org_owner or platform_owner: Return full config
    return plugin.properties.config;
  }
}
```

---

### Pattern 4: Resource Ownership Check

**Verify user owns the resource before mutation:**

```typescript
async function updatePluginConfig(
  ctx: MutationCtx,
  args: { pluginInstanceId: Id<"things">, config: any }
) {
  const user = await getAuthenticatedUser(ctx);
  const plugin = await ctx.db.get(args.pluginInstanceId);

  // 1. Verify plugin belongs to user's org
  if (plugin.groupId !== user.properties.groupId) {
    throw new Error("Unauthorized: Plugin belongs to different organization");
  }

  // 2. Verify user has permission
  if (user.properties.role !== "org_owner" && user.properties.role !== "platform_owner") {
    throw new Error("Unauthorized: Only org owners can update plugin config");
  }

  // 3. Update config
  await ctx.db.patch(args.pluginInstanceId, {
    properties: {
      ...plugin.properties,
      config: args.config
    },
    updatedAt: Date.now()
  });

  // 4. Log event
  await ctx.db.insert("events", {
    eventType: "plugin_configured",
    actorId: user._id,
    targetId: args.pluginInstanceId,
    timestamp: Date.now()
  });
}
```

---

## Role-Specific Use Cases

### platform_owner Use Cases

**Scenario 1: Add Plugin to Registry**
```typescript
// Only platform_owner can add plugins to global registry
async function addPluginToRegistry(
  ctx: MutationCtx,
  args: { npmPackage: string, githubRepo: string }
) {
  const user = await getAuthenticatedUser(ctx);

  // Verify platform_owner
  if (user.properties.role !== "platform_owner") {
    throw new Error("Unauthorized: Only platform owners can add plugins to registry");
  }

  // Create global plugin definition (no groupId)
  return await ctx.db.insert("things", {
    type: "elizaos_plugin",
    name: args.npmPackage,
    // NO groupId - global
    properties: {
      npm_package: args.npmPackage,
      github_repo: args.githubRepo
    },
    status: "published"
  });
}
```

**Scenario 2: Moderate Plugin Reviews**
```typescript
// Only platform_owner can delete abusive reviews
async function deletePluginReview(
  ctx: MutationCtx,
  args: { reviewId: Id<"things"> }
) {
  const user = await getAuthenticatedUser(ctx);

  if (user.properties.role !== "platform_owner") {
    throw new Error("Unauthorized: Only platform owners can moderate reviews");
  }

  await ctx.db.delete(args.reviewId);
}
```

---

### org_owner Use Cases

**Scenario 1: Install Plugin**
```typescript
// org_owner installs plugin for their organization
await installPlugin(ctx, { pluginId: "plugin_solana_xyz" });
```

**Scenario 2: Configure Plugin Secrets**
```typescript
// org_owner updates API keys
async function updatePluginSecrets(
  ctx: MutationCtx,
  args: { pluginInstanceId: Id<"things">, secrets: Record<string, string> }
) {
  const user = await getAuthenticatedUser(ctx);

  // Only org_owner can update secrets
  if (user.properties.role !== "org_owner" && user.properties.role !== "platform_owner") {
    throw new Error("Unauthorized: Only org owners can update secrets");
  }

  // Encrypt secrets
  const encrypted = encryptSecrets(args.secrets, user.properties.groupId);

  await ctx.db.patch(args.pluginInstanceId, {
    properties: {
      secrets: encrypted
    }
  });
}
```

---

### org_user Use Cases

**Scenario 1: Activate Plugin for Agent**
```typescript
// org_user enables plugin for their agent
async function activatePluginForAgent(
  ctx: MutationCtx,
  args: { agentId: Id<"things">, pluginInstanceId: Id<"things"> }
) {
  const user = await getAuthenticatedUser(ctx);

  // org_user CAN activate plugins
  // (no role check - all org members can activate)

  // Create connection
  await ctx.db.insert("connections", {
    fromThingId: args.agentId,
    toThingId: args.pluginInstanceId,
    relationshipType: "plugin_uses",
    metadata: {
      activated_by: user._id,
      activated_at: Date.now()
    }
  });

  // Log event
  await ctx.db.insert("events", {
    eventType: "plugin_activated",
    actorId: user._id,
    targetId: args.pluginInstanceId,
    timestamp: Date.now()
  });
}
```

**Scenario 2: Execute Plugin Action**
```typescript
// org_user executes plugin action through their agent
async function executePluginAction(
  ctx: MutationCtx,
  args: { agentId: Id<"things">, actionName: string, params: any }
) {
  const user = await getAuthenticatedUser(ctx);

  // org_user CAN execute actions
  // (no role check - all org members can execute)

  // Execute action...
  const result = await runPluginAction(args.agentId, args.actionName, args.params);

  // Log event
  await ctx.db.insert("events", {
    eventType: "plugin_action_executed",
    actorId: args.agentId,
    metadata: {
      executor: user._id,
      action_name: args.actionName,
      success: true
    }
  });

  return result;
}
```

---

## Permission Helpers

### Reusable Authorization Functions

```typescript
// Check if user has role
function hasRole(user: Thing, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(user.properties.role);
}

// Get authenticated user
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx): Promise<Thing> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db.query("things")
    .withIndex("by_email", q => q.eq("email", identity.email))
    .filter(q => q.eq(q.field("type"), "creator"))
    .first();

  if (!user) throw new Error("User not found");

  return user;
}

// Require role
async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Role[]
): Promise<Thing> {
  const user = await getAuthenticatedUser(ctx);

  if (!hasRole(user, allowedRoles)) {
    throw new Error(`Unauthorized: Requires role ${allowedRoles.join(" or ")}`);
  }

  return user;
}

// Verify resource ownership
async function requireOwnership(
  ctx: QueryCtx | MutationCtx,
  resourceId: Id<"things">
): Promise<{ user: Thing; resource: Thing }> {
  const user = await getAuthenticatedUser(ctx);
  const resource = await ctx.db.get(resourceId);

  if (resource.groupId !== user.properties.groupId) {
    throw new Error("Unauthorized: Resource belongs to different organization");
  }

  return { user, resource };
}
```

**Usage:**
```typescript
// Require org_owner role
async function installPlugin(ctx: MutationCtx, args: { pluginId: Id<"things"> }) {
  const user = await requireRole(ctx, ["org_owner", "platform_owner"]);
  // ... install plugin
}

// Require resource ownership
async function updatePlugin(ctx: MutationCtx, args: { pluginId: Id<"things"> }) {
  const { user, resource } = await requireOwnership(ctx, args.pluginId);
  // ... update plugin
}
```

---

## Future: Customer Role (Marketplace)

**Future Enhancement:** Allow `customer` role to purchase and install plugins from marketplace.

```typescript
// customer can purchase plugin from marketplace
async function purchasePlugin(
  ctx: MutationCtx,
  args: { pluginId: Id<"things"> }
) {
  const user = await getAuthenticatedUser(ctx);

  // customer CAN purchase (new permission)
  if (user.properties.role === "customer") {
    // Process payment
    await processPayment(user._id, args.pluginId);

    // Install plugin for customer
    // (customer becomes org_owner of their personal org)
  }
}
```

---

## Security Best Practices

1. **Always authenticate** - Every mutation and query must verify identity
2. **Verify role** - Check user role before sensitive operations
3. **Verify ownership** - Ensure resource belongs to user's org
4. **Log all actions** - Create event for audit trail
5. **Fail closed** - Default to deny if permission unclear
6. **Redact secrets** - Never expose secrets to org_user
7. **Check quotas** - Enforce organization limits
8. **Use helpers** - Reuse authorization functions for consistency

---

**Built with the 6-dimension ontology. Four roles, complete access control.**
