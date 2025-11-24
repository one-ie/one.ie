# Actions & Internal Actions Guide

## Overview

This directory contains **actions** and **internalActions** for the 6-dimension ontology.

### What's the Difference?

| Feature | Actions | Internal Actions |
|---------|---------|------------------|
| **Callable from** | Mutations, Queries, Actions, External API | Only mutations, queries, actions |
| **Use case** | External APIs, webhooks, async jobs | Shared utilities, validation, logging |
| **Can be** | Server-side long-running tasks | Fast shared operations |
| **Example** | Send email, process payment | Validate entity, log event |

---

## Actions Directory

Actions are server-side functions with `"use node"` that can call external services.

### actions/groups.ts - Dimension 1: Groups

Server-side operations for group management:

- **`sendInvitationEmail`** - Send group invitation via email
- **`notifyGroupAdmins`** - Notify admins when member joins
- **`exportGroupData`** - Export group data (JSON/CSV)
- **`archiveGroupResources`** - Cleanup after group deletion
- **`syncExternalDirectory`** - Sync with LDAP, Azure AD, Okta
- **`triggerWebhook`** - Send webhook notifications

```typescript
// Usage example:
const result = await ctx.runAction(api.actions.groups.sendInvitationEmail, {
  groupId: groupId,
  toEmail: "user@example.com",
  groupName: "Acme Corp",
  invitationUrl: "https://app.example.com/join/abc123"
});
```

### actions/entities.ts - Dimension 3: Things

Server-side operations for entity management:

- **`generateEmbeddings`** - Generate AI embeddings for content (OpenAI, HuggingFace)
- **`processEntityFile`** - Process uploaded files (images, videos, documents, audio)
- **`analyzeEntityContent`** - Analyze content with AI (summary, tags, sentiment)
- **`exportEntity`** - Export to PDF, EPUB, Markdown, HTML, JSON
- **`publishEntity`** - Cross-post to Twitter, LinkedIn, Facebook, newsletters
- **`notifyAboutEntity`** - Send notifications about changes

```typescript
// Usage example:
const embeddings = await ctx.runAction(api.actions.entities.generateEmbeddings, {
  entityId: entityId,
  groupId: groupId,
  content: "Article content...",
  model: "text-embedding-ada-002"
});
```

### actions/connections.ts - Dimension 4: Connections

Server-side operations for relationship management:

- **`analyzeConnectionStrength`** - Calculate AI-powered strength score
- **`processPayment`** - Handle payments via Stripe, crypto, PayPal
- **`generateRecommendations`** - Suggest new connections via graph analysis
- **`notifyConnectedEntities`** - Email/webhook notifications about relationship changes
- **`exportConnectionGraph`** - Export graph in GraphML, JSON, Cypher, DOT formats
- **`verifyConnection`** - Validate connection authenticity (blockchain, signatures)

```typescript
// Usage example:
const recommendations = await ctx.runAction(api.actions.connections.generateRecommendations, {
  entityId: userId,
  groupId: groupId,
  relationshipType: "following",
  limit: 10
});
```

### actions/knowledge.ts - Dimension 6: Knowledge

Server-side operations for RAG and semantic search:

- **`generateKnowledgeEmbeddings`** - Generate embeddings for semantic search
- **`processKnowledgeDocument`** - Extract text/images from documents
- **`chunkKnowledgeDocument`** - Split documents into optimal chunks
- **`indexKnowledgeVectors`** - Index in vector database (Pinecone, Weaviate)
- **`semanticSearch`** - Find relevant knowledge via similarity
- **`generateKnowledgeSummary`** - AI-powered summarization
- **`linkKnowledgeGraph`** - Create relationships between knowledge items

```typescript
// Usage example:
const results = await ctx.runAction(api.actions.knowledge.semanticSearch, {
  groupId: groupId,
  query: "How to implement authentication?",
  limit: 5,
  threshold: 0.75
});
```

---

## Internal Actions Directory

Internal actions are shared utilities only callable from mutations/queries/actions.

### internalActions/validation.ts - Input Validation

Reusable validation functions:

- **`validateEntityInGroup`** - Ensure entity belongs to group
- **`validateConnectionInGroup`** - Ensure connection is in group
- **`validateKnowledgeInGroup`** - Ensure knowledge is in group
- **`validateUserRole`** - Check RBAC permissions
- **`validateGroupActive`** - Ensure group is active
- **`validateEntityType`** - Check against ontology THING_TYPES
- **`validateConnectionType`** - Check against CONNECTION_TYPES
- **`validateStringLength`** - Validate string constraints
- **`validateEmail`** - Validate email format

```typescript
// Usage example in a mutation:
const validation = await ctx.runAction(api.internalActions.validation.validateEntityInGroup, {
  entityId: args.entityId,
  groupId: args.groupId
});
if (!validation.valid) throw new Error("Entity not found in group");
```

### internalActions/eventLogger.ts - Audit Trail

Centralized event logging:

- **`logEntityCreated`** - Log entity creation
- **`logEntityUpdated`** - Log entity updates with change list
- **`logEntityArchived`** - Log entity archival
- **`logConnectionCreated`** - Log connection creation
- **`logConnectionUpdated`** - Log connection updates
- **`logKnowledgeCreated`** - Log knowledge creation
- **`logKnowledgeUpdated`** - Log knowledge updates
- **`logGroupEvent`** - Generic group event logging
- **`logUserAction`** - Generic user action logging
- **`logErrorEvent`** - Log errors with severity

```typescript
// Usage example in a mutation:
await ctx.runAction(api.internalActions.eventLogger.logEntityCreated, {
  groupId: args.groupId,
  entityId: entityId,
  entityType: args.type,
  entityName: args.name,
  actorId: actor._id
});
```

### internalActions/search.ts - Search Utilities

Reusable search functions:

- **`searchEntitiesByName`** - Full-text search entities
- **`searchKnowledgeItems`** - Search knowledge by content and labels
- **`searchByConnections`** - Find entities by relationship patterns
- **`aggregateEntityStats`** - Count/group entities by type, status, date
- **`aggregateConnectionStats`** - Count/group connections by type, strength
- **`searchEvents`** - Search events by multiple filters
- **`globalSearch`** - Search across all dimensions at once

```typescript
// Usage example in a query:
const results = await ctx.runAction(api.internalActions.search.searchEntitiesByName, {
  groupId: args.groupId,
  query: args.searchTerm,
  entityType: "blog_post",
  limit: 20
});
```

---

## Integration Pattern

### From a Mutation

```typescript
// mutations/entities.ts
export const create = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // 1. Validate input
    const validation = await ctx.runAction(api.internalActions.validation.validateGroupActive, {
      groupId: args.groupId
    });
    if (!validation.active) throw new Error("Group not active");

    // 2. Create entity
    const entityId = await ctx.db.insert("entities", { /* ... */ });

    // 3. Log event
    await ctx.runAction(api.internalActions.eventLogger.logEntityCreated, {
      groupId: args.groupId,
      entityId,
      entityType: args.type,
      entityName: args.name,
      actorId: actor._id
    });

    // 4. Async operations (don't wait)
    ctx.runAction(api.actions.entities.generateEmbeddings, {
      entityId,
      groupId: args.groupId,
      content: args.name
    });

    return entityId;
  }
});
```

### From a Query

```typescript
// queries/entities.ts
export const search = query({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const results = await ctx.runAction(api.internalActions.search.searchEntitiesByName, {
      groupId: args.groupId,
      query: args.query,
      limit: args.limit
    });
    return results;
  }
});
```

### From an Action

```typescript
// actions/entities.ts
export const publishEntity = action({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    // Call other actions
    const recommendations = await ctx.runAction(api.actions.connections.generateRecommendations, {
      entityId: args.entityId,
      groupId: args.groupId
    });

    // Call internal actions
    await ctx.runAction(api.internalActions.eventLogger.logUserAction, {
      userId: args.publishedBy,
      groupId: args.groupId,
      action: "published_entity",
      resource: args.entityId
    });

    return { success: true };
  }
});
```

---

## Multi-Tenant Pattern

**All actions respect multi-tenant isolation via `groupId`:**

```typescript
// CRITICAL: Every action validates groupId
export const myAction = action({
  args: {
    groupId: v.id("groups"),
    // ... other args
  },
  handler: async (ctx, args) => {
    // Verify group exists
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    // All operations scoped to groupId
    return { success: true, groupId: args.groupId };
  }
});
```

---

## Error Handling

All actions follow consistent error pattern:

```typescript
try {
  // Operation
  return { success: true, /* results */ };
} catch (error) {
  // Log error
  await ctx.runAction(api.internalActions.eventLogger.logErrorEvent, {
    groupId: args.groupId,
    errorType: error.name,
    errorMessage: error.message,
    severity: "high"
  });

  throw error; // Re-throw for caller to handle
}
```

---

## Performance Considerations

### Use Actions For:
- ✅ Calling external APIs (don't block mutations)
- ✅ Long-running operations (email, file processing)
- ✅ Webhooks and integrations
- ✅ Heavy computations (AI models)

### Use Internal Actions For:
- ✅ Shared validation logic
- ✅ Event logging (consistent format)
- ✅ Search operations (reusable across queries)
- ✅ Aggregations and analytics

### Avoid:
- ❌ Calling actions from inside transaction-critical paths
- ❌ Circular action calls (A → B → A)
- ❌ Too many sequential external API calls (parallelize with Promise.all)

---

## Future Enhancements

- [ ] Rate limiting decorators for actions
- [ ] Retry policy helpers
- [ ] Caching layer for expensive operations
- [ ] Webhook delivery tracking
- [ ] Action analytics and monitoring
- [ ] Background job scheduling

---

## Related Documentation

- **Schema**: `convex/schema.ts` - Database structure
- **Mutations**: `convex/mutations/` - Write operations
- **Queries**: `convex/queries/` - Read operations
- **Services**: `convex/services/` - Business logic
- **Ontology**: `/one/knowledge/ontology.md` - 6-dimension model

---

Built with clarity, simplicity, and infinite scale in mind.
