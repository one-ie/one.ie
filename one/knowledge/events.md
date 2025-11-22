---
title: Events - Complete Event Type Reference
dimension: knowledge
category: ontology
tags: events, audit-trail, logging, 6-dimensions
related_dimensions: things, connections, people, groups, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: CYCLE-004
ai_context: |
  This document is part of the knowledge dimension in the ontology category.
  Location: one/knowledge/events.md
  Purpose: Define all event types for complete audit trail in the 6-dimension ontology
  Related dimensions: things, connections, people, groups, knowledge
  For AI agents: Read this to understand all event types and when to log them.
---

# Events - Complete Event Type Reference

**Purpose:** Define all event types that create a complete audit trail in ONE Platform.

**Principle:** Every action creates an event. Complete observability = complete understanding.

---

## Overview

The `events` table captures EVERY action in the system:
- Who did what, when, and why
- Complete audit trail for compliance
- Analytics and insights
- Debugging and troubleshooting
- AI agent reasoning transparency

**Database Implementation:**
```typescript
events: defineTable({
  eventType: v.string(),           // Event type (76+ types)
  actorId: v.id("things"),         // Who performed the action (person or agent)
  targetId: v.optional(v.id("things")), // What was affected
  timestamp: v.number(),           // When it happened
  metadata: v.any()                // Event-specific data (JSON)
})
```

**Key Insight:** Events are immutable. Once logged, never modified. Append-only audit trail.

---

## Event Structure

```typescript
{
  _id: "event_xyz",
  eventType: "plugin_installed",
  actorId: "person_admin_123",      // Who did this
  targetId: "plugin_instance_456",  // What was affected
  timestamp: 1700000000000,         // When (Unix milliseconds)
  metadata: {
    // Event-specific data
    plugin_name: "@elizaos/plugin-solana",
    plugin_version: "1.2.3",
    groupId: "org_789",
    installation_method: "marketplace"
  }
}
```

**Required Fields:**
- `eventType` - Type of event (from 76+ defined types)
- `actorId` - Thing that performed the action (person or agent)
- `timestamp` - Unix timestamp in milliseconds

**Optional Fields:**
- `targetId` - Thing that was affected by the action
- `metadata` - Additional context (JSON object)

---

## Core Event Types (Existing)

### 1. User Events (7 types)
- `user_registered` - New user registration
- `user_verified` - Email/phone verification complete
- `user_login` - User logged in
- `user_logout` - User logged out
- `profile_updated` - User profile modified
- `password_changed` - Password updated
- `account_deleted` - Account deleted

### 2. Organization Events (5 types)
- `organization_created` - New organization created
- `user_joined_org` - User joined organization
- `user_removed_from_org` - User removed from organization
- `org_settings_updated` - Organization settings changed
- `org_subscription_updated` - Subscription tier changed

### 3. Content Events (8 types)
- `content_created` - Content created (blog, video, etc.)
- `content_updated` - Content modified
- `content_published` - Content published to public
- `content_unpublished` - Content removed from public
- `content_deleted` - Content deleted
- `content_viewed` - Content viewed by user
- `content_liked` - Content liked/favorited
- `content_shared` - Content shared externally

### 4. Agent Events (6 types)
- `agent_created` - AI agent created
- `agent_executed` - Agent performed action
- `agent_completed` - Agent task completed
- `agent_failed` - Agent task failed
- `agent_updated` - Agent configuration changed
- `agent_deleted` - Agent deleted

### 5. Workflow Events (5 types)
- `workflow_started` - Workflow initiated
- `workflow_step_completed` - Workflow step finished
- `workflow_completed` - Workflow finished
- `workflow_failed` - Workflow failed
- `workflow_cancelled` - Workflow cancelled

### 6. Payment Events (7 types)
- `payment_initiated` - Payment started
- `payment_completed` - Payment successful
- `payment_failed` - Payment failed
- `refund_issued` - Refund processed
- `subscription_started` - Subscription began
- `subscription_cancelled` - Subscription ended
- `subscription_renewed` - Subscription renewed

### 7. Course Events (6 types)
- `course_created` - Course created
- `course_published` - Course published
- `user_enrolled` - User enrolled in course
- `lesson_completed` - Lesson finished
- `course_completed` - Course finished
- `certificate_issued` - Completion certificate issued

### 8. Token Events (6 types)
- `tokens_purchased` - Tokens bought
- `tokens_transferred` - Tokens sent
- `tokens_staked` - Tokens staked
- `tokens_unstaked` - Tokens unstaked
- `tokens_earned` - Tokens earned from activity
- `tokens_burned` - Tokens burned

### 9. Analytics Events (5 types)
- `metric_calculated` - Business metric computed
- `insight_generated` - AI insight created
- `prediction_made` - Prediction generated
- `report_generated` - Report created
- `alert_triggered` - Alert fired

### 10. Task Management Events (6 types)
- `task_created` - Task created
- `task_assigned` - Task assigned to person/agent
- `task_started` - Work began on task
- `task_completed` - Task finished
- `task_cancelled` - Task cancelled
- `task_delegated` - Task delegated to another

---

## NEW: ElizaOS Plugin Event Types (CYCLE-004)

### Plugin Lifecycle Events (9 NEW types)

#### 1. `plugin_discovered`
**When:** Plugin found in ElizaOS registry during sync

**Metadata:**
```typescript
{
  eventType: "plugin_discovered",
  actorId: "system_registry_sync",
  targetId: "plugin_solana_xyz",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    npm_package: "@elizaos/plugin-solana",
    version: "1.2.3",
    registry_url: "https://github.com/elizaos/plugins/registry",
    capabilities: ["blockchain", "token_swap"],
    discovery_method: "registry_sync"
  }
}
```

**Use Cases:**
- Track plugin registry growth
- Monitor new plugin releases
- Alert org owners of new relevant plugins

---

#### 2. `plugin_installed`
**When:** Plugin installed in an organization

**Metadata:**
```typescript
{
  eventType: "plugin_installed",
  actorId: "person_org_owner",
  targetId: "plugin_instance_123",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    plugin_version: "1.2.3",
    groupId: "org_abc",
    installation_method: "marketplace", // or "cli", "api"
    installation_duration_ms: 2345,
    dependencies_installed: ["@elizaos/plugin-wallet"]
  }
}
```

**Use Cases:**
- Audit trail for compliance
- Track plugin adoption rates
- Monitor installation success/failure
- Bill customers for plugin usage

---

#### 3. `plugin_activated`
**When:** Plugin enabled for an AI agent

**Metadata:**
```typescript
{
  eventType: "plugin_activated",
  actorId: "person_org_owner",
  targetId: "plugin_instance_123",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    agent_id: "agent_trader_xyz",
    enabled_actions: ["swapTokens", "getBalance"],
    activation_config: {
      priority: 1,
      auto_execute: true
    }
  }
}
```

**Use Cases:**
- Track which agents use which plugins
- Monitor plugin activation patterns
- Audit agent capabilities

---

#### 4. `plugin_deactivated`
**When:** Plugin disabled for an AI agent

**Metadata:**
```typescript
{
  eventType: "plugin_deactivated",
  actorId: "person_org_owner",
  targetId: "plugin_instance_123",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    agent_id: "agent_trader_xyz",
    reason: "temporary_suspension", // or "manual_disable", "error_threshold_exceeded"
    deactivation_details: {
      error_count: 15,
      last_error: "RPC connection timeout"
    }
  }
}
```

**Use Cases:**
- Identify problematic plugins
- Track plugin reliability
- Alert owners of deactivations

---

#### 5. `plugin_uninstalled`
**When:** Plugin removed from an organization

**Metadata:**
```typescript
{
  eventType: "plugin_uninstalled",
  actorId: "person_org_owner",
  targetId: "plugin_instance_123",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    plugin_version: "1.2.3",
    groupId: "org_abc",
    reason: "no_longer_needed", // or "cost_reduction", "migration", "security_concern"
    uninstallation_details: {
      days_installed: 45,
      total_executions: 1523,
      data_deleted: true
    }
  }
}
```

**Use Cases:**
- Track plugin churn
- Identify reasons for uninstallation
- Improve plugin retention

---

#### 6. `plugin_action_executed`
**When:** Plugin action runs (successful or failed)

**Metadata:**
```typescript
{
  eventType: "plugin_action_executed",
  actorId: "agent_trader_xyz",
  targetId: "action_swap_tokens",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    plugin_instance_id: "instance_123",
    action_name: "swapTokens",
    execution_time_ms: 234,
    success: true,
    input_params: {
      fromToken: "SOL",
      toToken: "USDC",
      amount: 1
    },
    output_result: {
      tx_hash: "abc123...",
      amount_received: 143.21
    },
    cost: {
      compute_units: 150000,
      fee_lamports: 5000
    }
  }
}
```

**Use Cases:**
- Track plugin usage per organization
- Monitor action execution success rates
- Calculate plugin execution costs
- Debug failed actions
- Analytics and insights

---

#### 7. `plugin_error_occurred`
**When:** Plugin execution fails

**Metadata:**
```typescript
{
  eventType: "plugin_error_occurred",
  actorId: "agent_trader_xyz",
  targetId: "plugin_instance_123",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    action_name: "swapTokens",
    error_type: "RPC_TIMEOUT", // or "INVALID_PARAMS", "INSUFFICIENT_FUNDS", etc.
    error_message: "RPC connection timeout after 30s",
    error_stack: "Error: RPC timeout\n  at swapTokens...",
    input_params: {
      fromToken: "SOL",
      toToken: "USDC",
      amount: 1
    },
    retry_attempt: 2,
    retry_scheduled: true
  }
}
```

**Use Cases:**
- Monitor plugin health
- Alert on error spikes
- Debug plugin issues
- Improve error handling

---

#### 8. `plugin_updated`
**When:** Plugin version updated in organization

**Metadata:**
```typescript
{
  eventType: "plugin_updated",
  actorId: "person_org_owner",
  targetId: "plugin_instance_123",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    old_version: "1.2.3",
    new_version: "1.3.0",
    update_type: "minor", // or "major", "patch"
    breaking_changes: false,
    changelog_url: "https://github.com/elizaos/plugins/releases/tag/v1.3.0",
    migration_required: false
  }
}
```

**Use Cases:**
- Track plugin version adoption
- Monitor update patterns
- Alert on breaking changes

---

#### 9. `plugin_configured`
**When:** Plugin settings modified

**Metadata:**
```typescript
{
  eventType: "plugin_configured",
  actorId: "person_org_owner",
  targetId: "plugin_instance_123",
  timestamp: Date.now(),
  metadata: {
    plugin_name: "@elizaos/plugin-solana",
    config_changes: {
      rpc_url: {
        old: "https://api.devnet.solana.com",
        new: "https://api.mainnet-beta.solana.com"
      },
      network: {
        old: "devnet",
        new: "mainnet-beta"
      }
    },
    secrets_updated: true, // API keys changed
    validation_passed: true
  }
}
```

**Use Cases:**
- Audit configuration changes
- Track environment transitions (devnet → mainnet)
- Monitor secret rotation

---

## Complete Event Types List (76 Total)

### Existing Event Types (67)
1. user_registered
2. user_verified
3. user_login
4. user_logout
5. profile_updated
6. password_changed
7. account_deleted
8. organization_created
9. user_joined_org
10. user_removed_from_org
11. org_settings_updated
12. org_subscription_updated
13. content_created
14. content_updated
15. content_published
16. content_unpublished
17. content_deleted
18. content_viewed
19. content_liked
20. content_shared
21. agent_created
22. agent_executed
23. agent_completed
24. agent_failed
25. agent_updated
26. agent_deleted
27. workflow_started
28. workflow_step_completed
29. workflow_completed
30. workflow_failed
31. workflow_cancelled
32. payment_initiated
33. payment_completed
34. payment_failed
35. refund_issued
36. subscription_started
37. subscription_cancelled
38. subscription_renewed
39. course_created
40. course_published
41. user_enrolled
42. lesson_completed
43. course_completed
44. certificate_issued
45. tokens_purchased
46. tokens_transferred
47. tokens_staked
48. tokens_unstaked
49. tokens_earned
50. tokens_burned
51. metric_calculated
52. insight_generated
53. prediction_made
54. report_generated
55. alert_triggered
56. task_created
57. task_assigned
58. task_started
59. task_completed
60. task_cancelled
61. task_delegated
62. entity_created
63. entity_updated
64. entity_deleted
65. entity_archived
66. connection_created
67. connection_deleted

### NEW: Plugin Events (9) - CYCLE-004
68. plugin_discovered
69. plugin_installed
70. plugin_activated
71. plugin_deactivated
72. plugin_uninstalled
73. plugin_action_executed
74. plugin_error_occurred
75. plugin_updated
76. plugin_configured

---

## Event Logging Patterns

### Pattern 1: Standard Event Log

```typescript
// After creating a thing
await ctx.db.insert("events", {
  eventType: "entity_created",
  actorId: person._id,
  targetId: entityId,
  timestamp: Date.now(),
  metadata: {
    entity_type: "plugin_instance",
    groupId: person.groupId
  }
});
```

### Pattern 2: Success/Failure Events

```typescript
// Plugin action execution
try {
  const result = await executePluginAction(params);

  await ctx.db.insert("events", {
    eventType: "plugin_action_executed",
    actorId: agent._id,
    targetId: action._id,
    timestamp: Date.now(),
    metadata: {
      success: true,
      execution_time_ms: 234,
      result: result
    }
  });
} catch (error) {
  await ctx.db.insert("events", {
    eventType: "plugin_error_occurred",
    actorId: agent._id,
    targetId: plugin._id,
    timestamp: Date.now(),
    metadata: {
      error_type: error.name,
      error_message: error.message,
      error_stack: error.stack
    }
  });
}
```

### Pattern 3: State Transition Events

```typescript
// Plugin activation (state: inactive → active)
await ctx.db.insert("events", {
  eventType: "plugin_activated",
  actorId: person._id,
  targetId: pluginInstance._id,
  timestamp: Date.now(),
  metadata: {
    previous_state: "inactive",
    new_state: "active",
    agent_id: agent._id
  }
});
```

---

## Querying Events

### Get Recent Events for Thing

```typescript
const events = await ctx.db.query("events")
  .withIndex("by_target", q =>
    q.eq("targetId", thingId)
  )
  .order("desc")
  .take(50);
```

### Get Events by Actor

```typescript
const userActions = await ctx.db.query("events")
  .withIndex("by_actor", q =>
    q.eq("actorId", userId)
  )
  .filter(q => q.gte(q.field("timestamp"), startTime))
  .collect();
```

### Get Events by Type

```typescript
const pluginErrors = await ctx.db.query("events")
  .withIndex("by_type", q =>
    q.eq("eventType", "plugin_error_occurred")
  )
  .filter(q => q.gte(q.field("timestamp"), Date.now() - 86400000))
  .collect();
```

### Get Events in Time Range

```typescript
const last24Hours = await ctx.db.query("events")
  .withIndex("by_time", q =>
    q.gte("timestamp", Date.now() - 86400000)
  )
  .collect();
```

---

## Indexing Strategy

**Required indexes for events:**

```typescript
events: defineTable({
  // ...fields
})
  .index("by_type", ["eventType"])
  .index("by_actor", ["actorId", "timestamp"])
  .index("by_target", ["targetId", "timestamp"])
  .index("by_time", ["timestamp"])
```

---

## Event Retention Policy

**Retention:**
- **Hot storage:** Last 90 days (queryable in real-time)
- **Warm storage:** 91-365 days (archived, slower queries)
- **Cold storage:** 365+ days (compliance archive, export-only)

**Never delete events** - they're the audit trail.

---

## Best Practices

### 1. Always Log Events
Every mutation MUST log an event. No exceptions.

### 2. Include Enough Context
Metadata should have enough information to reconstruct what happened.

### 3. Use Consistent Event Types
Don't invent new event types. Use existing ones or extend this document.

### 4. Protect Sensitive Data
Don't log passwords, API keys, or PII in metadata. Encrypt if necessary.

### 5. Log Both Success and Failure
Every operation should create an event, whether it succeeds or fails.

### 6. Include Timing Information
Log execution time, retry attempts, and performance metrics.

### 7. Link to Related Entities
Always include `actorId` and `targetId` when applicable.

---

## Analytics Use Cases

**Plugin adoption:**
```sql
SELECT plugin_name, COUNT(*) as installations
FROM events
WHERE eventType = 'plugin_installed'
GROUP BY plugin_name
ORDER BY installations DESC
```

**Plugin reliability:**
```sql
SELECT plugin_name,
  SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successes,
  SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failures
FROM events
WHERE eventType = 'plugin_action_executed'
GROUP BY plugin_name
```

**User activity:**
```sql
SELECT actorId, COUNT(*) as actions
FROM events
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY actorId
ORDER BY actions DESC
LIMIT 10
```

---

**Built with the 6-dimension ontology. 76 event types, complete audit trail.**
