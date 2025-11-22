# Backend Architecture - AI Website Builder

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         6-DIMENSION ONTOLOGY                        │
│                                                                     │
│  GROUPS → PEOPLE → THINGS → CONNECTIONS → EVENTS → KNOWLEDGE      │
│    ↓        ↓        ↓          ↓            ↓          ↓          │
│  Isolation  Auth   Entities   Relations   Audit      Search       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Create Website

```
User Request
    ↓
[Mutation: websites.create]
    ↓
1. Authenticate (getUserIdentity)
    ↓
2. Get Creator Entity (email → creator)
    ↓
3. Validate Group (groupId, status, limits)
    ↓
4. Create Website Entity
   {
     type: "website",
     name: "My Website",
     groupId: creator.groupId,
     properties: { subdomain, domain, template },
     status: "draft"
   }
    ↓
5. Create Connection (creator → website)
   {
     fromEntityId: creator._id,
     toEntityId: website._id,
     relationshipType: "owns"
   }
    ↓
6. Log Event
   {
     type: "entity_created",
     actorId: creator._id,
     targetId: website._id,
     metadata: { entityType: "website" }
   }
    ↓
7. Return websiteId
```

### Generate Page (AI)

```
User Prompt: "Create a landing page for a coffee shop"
    ↓
[Mutation: ai.generatePage]
    ↓
1. Authenticate & Validate Ownership
    ↓
2. Check AI Message Limits (group.usage.aiMessages < group.limits.aiMessages)
    ↓
3. Create AI Conversation Entity
   {
     type: "ai_conversation",
     properties: {
       prompt: "Create a landing page...",
       messages: [...],
       conversationStatus: "generating"
     }
   }
    ↓
4. Call AI API (OpenAI/Anthropic) [TODO: Implement]
   Prompt → GPT-4o → HTML/CSS code
    ↓
5. Create Page Entity
   {
     type: "landing_page",
     properties: {
       code: "<html>...</html>",
       generatedBy: "ai",
       aiModel: "gpt-4o",
       tokensUsed: 500
     }
   }
    ↓
6. Create Connections
   - website → page (contains)
   - creator → page (created_by)
   - ai_conversation → page (generated_by)
    ↓
7. Update Group Usage
   - aiMessages++
   - pages++
    ↓
8. Log Events
   - ai_page_generated
   - entity_created
    ↓
9. Return { pageId, conversationId, tokensUsed }
```

### Deploy Website

```
User Request: "Deploy to production"
    ↓
[Mutation: deployments.create]
    ↓
1. Authenticate & Validate Ownership
    ↓
2. Check Deployment Limits
    ↓
3. Create Deployment Entity
   {
     type: "deployment",
     properties: {
       websiteId: website._id,
       environment: "production",
       deploymentStatus: "pending",
       startedAt: Date.now()
     },
     status: "deploying"
   }
    ↓
4. Create Connections
   - website → deployment (part_of)
   - creator → deployment (created_by)
    ↓
5. Update Group Usage (deployments++)
    ↓
6. Log Event (deployment_started)
    ↓
7. Trigger Cloudflare Deployment [TODO: Implement]
    ↓
   [External: Cloudflare Pages API]
    ↓
   Build → Deploy → Webhook
    ↓
[Mutation: deployments.updateStatus]
    ↓
8. Update Deployment Status
   {
     deploymentStatus: "live",
     url: "https://mysite.pages.dev",
     completedAt: Date.now()
   }
    ↓
9. Log Event (deployment_completed)
    ↓
10. Return deploymentId
```

## Entity Relationships

```
┌─────────────┐
│   Creator   │
│  (Person)   │
└──────┬──────┘
       │ owns
       ↓
┌─────────────┐
│   Website   │
│   (Thing)   │
└──────┬──────┘
       │ contains
       ↓
┌─────────────┐        ┌──────────────────┐
│    Page     │ ← - -  │ AI Conversation  │
│   (Thing)   │generated│     (Thing)      │
└──────┬──────┘   by   └──────────────────┘
       │ part_of
       ↓
┌─────────────┐
│ Deployment  │
│   (Thing)   │
└─────────────┘
```

## Multi-Tenant Isolation

```
┌────────────────────────────────────────────────────────────────┐
│                         GROUP A (groupId: 1)                   │
│                                                                │
│  Creator A                                                     │
│    ↓ owns                                                      │
│  Website A1                                                    │
│    ↓ contains                                                  │
│  Pages A1-P1, A1-P2, A1-P3                                     │
│    ↓ part_of                                                   │
│  Deployments A1-D1, A1-D2                                      │
│                                                                │
│  ✅ Can access: All entities with groupId = 1                  │
│  ❌ Cannot access: Entities with groupId = 2                   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                         GROUP B (groupId: 2)                   │
│                                                                │
│  Creator B                                                     │
│    ↓ owns                                                      │
│  Website B1, Website B2                                        │
│    ↓ contains                                                  │
│  Pages B1-P1, B2-P1                                            │
│    ↓ part_of                                                   │
│  Deployments B1-D1                                             │
│                                                                │
│  ✅ Can access: All entities with groupId = 2                  │
│  ❌ Cannot access: Entities with groupId = 1                   │
└────────────────────────────────────────────────────────────────┘
```

## Event Timeline

```
Time →
─────────────────────────────────────────────────────────────────→

T1: entity_created (website)
    {
      type: "entity_created",
      actorId: creator._id,
      targetId: website._id,
      timestamp: 1700000000000,
      metadata: { entityType: "website" }
    }

T2: ai_page_generated (landing_page)
    {
      type: "ai_page_generated",
      actorId: creator._id,
      targetId: page._id,
      timestamp: 1700000060000,
      metadata: {
        prompt: "Create landing page...",
        tokensUsed: 500,
        model: "gpt-4o"
      }
    }

T3: entity_created (page)
    {
      type: "entity_created",
      actorId: creator._id,
      targetId: page._id,
      timestamp: 1700000061000,
      metadata: {
        entityType: "landing_page",
        generatedBy: "ai"
      }
    }

T4: page_modified
    {
      type: "page_modified",
      actorId: creator._id,
      targetId: page._id,
      timestamp: 1700000120000,
      metadata: {
        prompt: "Add pricing section",
        tokensUsed: 300
      }
    }

T5: deployment_started
    {
      type: "deployment_started",
      actorId: creator._id,
      targetId: deployment._id,
      timestamp: 1700000180000,
      metadata: {
        environment: "production"
      }
    }

T6: deployment_completed
    {
      type: "deployment_completed",
      actorId: creator._id,
      targetId: deployment._id,
      timestamp: 1700000240000,
      metadata: {
        url: "https://mysite.pages.dev",
        duration: 60000
      }
    }
```

## Query Patterns

### List User's Websites

```
[Query: websites.list]
    ↓
1. Get creator from identity.email
    ↓
2. Query entities
   WHERE groupId = creator.groupId
   AND type = "website"
   AND deletedAt = null
   AND status = "published" (optional filter)
    ↓
3. Enrich with:
   - pageCount (via connections)
   - deploymentCount (count deployments)
   - latestDeployment (latest live deployment)
    ↓
4. Return enriched websites
```

### Get Page with Related Data

```
[Query: pages.get]
    ↓
1. Validate access (page.groupId = creator.groupId)
    ↓
2. Get page entity
    ↓
3. Enrich with connections:
   - website (via part_of connection)
   - creator (via created_by connection)
   - modifications (via modified connections)
    ↓
4. Return {
     ...page,
     _connections: {
       website,
       creator,
       modifications: [...]
     }
   }
```

## Resource Quotas

```
┌────────────────────────────────────────────────────────────┐
│                    Group Limits                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Starter Plan:                                             │
│    websites: 1                                             │
│    pages: 10                                               │
│    aiMessages: 50/month                                    │
│    deployments: 10/month                                   │
│    storage: 1 GB                                           │
│                                                            │
│  Pro Plan:                                                 │
│    websites: 5                                             │
│    pages: 100                                              │
│    aiMessages: 500/month                                   │
│    deployments: 100/month                                  │
│    storage: 10 GB                                          │
│                                                            │
│  Enterprise Plan:                                          │
│    websites: Unlimited                                     │
│    pages: Unlimited                                        │
│    aiMessages: Unlimited                                   │
│    deployments: Unlimited                                  │
│    storage: Unlimited                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘

Quota Check Before Operations:
─────────────────────────────────
if (group.usage.websites >= group.limits.websites) {
  throw new Error("Website limit reached");
}

if (group.usage.aiMessages >= group.limits.aiMessages) {
  throw new Error("AI message limit reached");
}

Usage Update After Operations:
──────────────────────────────
await ctx.db.patch(groupId, {
  usage: {
    ...group.usage,
    websites: group.usage.websites + 1,
    aiMessages: group.usage.aiMessages + 1
  }
});
```

## Indexes for Performance

```
Schema Indexes:
──────────────

groups:
  - by_slug: ["slug"]
  - by_parent: ["parentGroupId"]
  - by_status: ["status"]

entities:
  - by_type: ["type"]
  - by_group: ["groupId"]
  - by_group_type: ["groupId", "type"]  ← CRITICAL for multi-tenant queries
  - by_status: ["status"]
  - by_created: ["createdAt"]
  - search_entities: searchField="name", filter=["type", "status", "groupId"]

connections:
  - from_entity: ["fromEntityId"]
  - to_entity: ["toEntityId"]
  - from_type: ["fromEntityId", "relationshipType"]  ← For ownership checks
  - to_type: ["toEntityId", "relationshipType"]      ← For page lookups
  - bidirectional: ["fromEntityId", "toEntityId", "relationshipType"]

events:
  - by_type: ["type"]
  - by_actor: ["actorId"]
  - by_target: ["targetId"]
  - by_timestamp: ["timestamp"]
  - by_actor_type: ["actorId", "type"]
  - by_type_timestamp: ["type", "timestamp"]

knowledge:
  - by_type: ["knowledgeType"]
  - by_source: ["sourceEntityId"]
  - by_group: ["groupId"]
  - by_embedding: vectorField="embedding", dimensions=3072
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                      │
└─────────────────────────────────────────────────────────────┘

User Login
    ↓
ctx.auth.getUserIdentity()
    ↓
{
  email: "user@example.com",
  tokenIdentifier: "...",
  subject: "..."
}
    ↓
Query entities
WHERE type = "creator"
AND properties.email = identity.email
    ↓
Creator Entity
{
  _id: "creator123",
  groupId: "group456",
  properties: {
    email: "user@example.com",
    role: "org_owner"
  }
}
    ↓
All subsequent operations scoped by creator.groupId

┌─────────────────────────────────────────────────────────────┐
│                    Authorization Checks                     │
└─────────────────────────────────────────────────────────────┘

Mutation Request (e.g., update website)
    ↓
1. Get creator from identity
    ↓
2. Get target entity (website)
    ↓
3. Verify creator owns website:
   Query connections
   WHERE fromEntityId = creator._id
   AND toEntityId = website._id
   AND relationshipType = "owns"
    ↓
4. If connection exists → ALLOW
   If connection missing → DENY (throw error)
```

## Future Enhancements

1. **AI Integration**
   - Replace placeholders in `mutations/ai.ts`
   - OpenAI API for code generation
   - Anthropic API for modifications
   - Token usage tracking

2. **Deployment Pipeline**
   - Cloudflare Pages API integration
   - Build process (compile pages)
   - Webhook handlers for status updates
   - Rollback mechanism

3. **Component Library**
   - Pre-built components (hero, features, pricing)
   - Vector embeddings for semantic search
   - AI can search and reuse components
   - Template marketplace

4. **Real-Time Collaboration**
   - Live editing with multiple users
   - Cursor positions via Convex subscriptions
   - Conflict resolution

5. **Analytics**
   - Page view tracking
   - Conversion metrics
   - AI generation costs
   - Deployment history

---

**Architecture designed for scalability, security, and AI-first development.**
