# ONE Platform Backend

**Backend implementation of the 6-dimension ontology using Convex.**

## Architecture

```
Web (Astro + React) → Backend (Convex) → 6-Dimension Ontology
```

This backend implements the universal 6-dimension ontology that models reality itself.

## 6-Dimension Ontology

5 database tables implement the 6 dimensions:

1. **groups** → Multi-tenant containers (organizations, teams, projects)
2. **things** → People + Things (all entities, 66+ types)
3. **connections** → All relationships (25+ types)
4. **events** → Complete audit trail (67+ types)
5. **knowledge** → Labels + embeddings + RAG

People are represented as things with `type: 'creator'`.

## Directory Structure

```
backend/
├── convex/
│   ├── schema.ts           # 6-dimension ontology schema
│   ├── queries/            # Read operations (multi-tenant scoped)
│   │   ├── groups.ts
│   │   ├── entities.ts     # Things queries
│   │   ├── connections.ts
│   │   ├── events.ts
│   │   └── knowledge.ts
│   ├── mutations/          # Write operations (with event logging)
│   │   ├── groups.ts
│   │   ├── entities.ts     # Things mutations
│   │   ├── connections.ts
│   │   ├── events.ts
│   │   └── knowledge.ts
│   └── services/           # Effect.ts business logic
│       └── funnel/         # Funnel builder services
│           ├── funnel.ts
│           ├── step.ts
│           └── element.ts
├── convex.json             # Convex configuration
├── package.json
└── tsconfig.json
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to production
npm run deploy

# Generate types
npm run codegen
```

## Schema Design

The schema is designed following these principles:

1. **Reality-based** - Models reality, not specific technology
2. **Zero migrations** - Reality doesn't change, so schema doesn't need to migrate
3. **Pattern convergence** - One pattern for all entity types (98% AI accuracy)
4. **Multi-tenant** - All data scoped by `groupId`
5. **Audit trail** - All actions logged in events table

See `/one/knowledge/ontology.md` for full specification.

## Thing Types (66+)

### People Types
- creator, customer, team_member

### Agent Types
- agent, engineering_agent, strategy_agent, marketing_agent

### Content Types
- blog_post, video, podcast, course, lesson, article

### Product Types
- digital_product, membership, consultation, nft

### Community Types
- community, conversation, message

### Token Types
- token, token_contract

### Platform Types
- website, landing_page, template, livestream

### Business Types
- payment, subscription, invoice, metric, insight, task

### Funnel Builder Types (NEW)
- funnel, funnel_step, page_element, funnel_template, page_template
- form_submission, ab_test, funnel_domain, funnel_analytics
- email_sequence, custom_code

## Connection Types (25+)

### Ownership
- owns, created_by

### AI
- clone_of, trained_on, powers

### Content
- authored, generated_by, published_to, part_of, references

### Community
- member_of, following, moderates, participated_in

### Business
- manages, reports_to, collaborates_with

### Token
- holds_tokens, staked_in, earned_from

### Product
- purchased, enrolled_in, completed, teaching

### Funnel Builder (NEW)
- funnel_contains_step, step_contains_element, funnel_based_on_template
- step_based_on_template, visitor_entered_funnel, visitor_viewed_step
- visitor_submitted_form, customer_purchased_via_funnel
- funnel_leads_to_product, ab_test_variant, funnel_sends_email
- funnel_uses_domain

## Event Types (67+)

### Entity Lifecycle
- entity_created, entity_updated, entity_deleted, entity_archived

### User Events
- user_registered, user_verified, user_login, profile_updated

### Organization
- organization_created, user_joined_org, user_removed_from_org

### Agent Events
- agent_created, agent_executed, agent_completed, agent_failed

### Workflow
- task_completed, implementation_complete, fix_started, fix_complete

### Analytics
- metric_calculated, insight_generated, prediction_made

### Funnel Builder (NEW)
- funnel_created, funnel_published, funnel_unpublished, funnel_duplicated
- funnel_archived, step_added, step_removed, step_reordered
- element_added, element_updated, element_removed
- form_submitted, purchase_completed, ab_test_started, ab_test_completed
- email_sent, domain_connected, analytics_generated

## Convex Patterns

### Query Pattern

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { type: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 2. Get user's group
    const person = await ctx.db.query("things")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(t => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) return [];

    // 3. Query with groupId scope
    let q = ctx.db.query("things")
      .withIndex("by_group_type", q =>
        q.eq("groupId", person.groupId).eq("type", args.type)
      );

    // 4. Apply filters
    if (args.status) {
      q = q.filter(thing => thing.status === args.status);
    }

    return await q.take(100);
  },
});
```

### Mutation Pattern

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    type: v.string(),
    name: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 2. Get user's group
    const person = await ctx.db.query("things")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(t => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) throw new Error("User must belong to a group");

    // 3. Create thing
    const thingId = await ctx.db.insert("things", {
      type: args.type,
      name: args.name,
      properties: args.properties,
      groupId: person.groupId,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 4. Log event
    await ctx.db.insert("events", {
      type: "entity_created",
      actorId: person._id,
      targetId: thingId,
      timestamp: Date.now(),
      metadata: {
        entityType: args.type,
        entityName: args.name,
        groupId: person.groupId,
      },
    });

    return thingId;
  },
});
```

## Multi-Tenant Isolation

All data is scoped by `groupId`:

- ✅ Every thing MUST have `groupId` (except platform things)
- ✅ Every query MUST filter by `groupId`
- ✅ Every mutation MUST validate `groupId` ownership
- ✅ Events include `groupId` in metadata

This ensures complete data isolation between organizations.

## Performance

### Indexes

All queries use indexes for O(log n) performance:

- `by_group_type` - Primary query pattern (groupId + type)
- `by_type_status` - Type filtering with status
- `search_things` - Full-text search on name

### Vector Search

Knowledge table has vector index for RAG:

- Dimensions: 3072 (OpenAI text-embedding-3-large)
- Filter fields: knowledgeType, sourceThingId

## Security

### Authentication

All operations require `ctx.auth.getUserIdentity()`.

### Authorization

Users can only access data in their group:

```typescript
const person = await getPerson(identity.email);
if (thing.groupId !== person.groupId) {
  throw new Error("Unauthorized");
}
```

### Validation

All inputs validated with Convex validators:

```typescript
args: {
  email: v.string(),
  name: v.string(),
  type: v.union(v.literal("creator"), v.literal("customer")),
}
```

## Testing

```bash
# Unit tests (coming soon)
npm test

# Integration tests (coming soon)
npm run test:integration
```

## Deployment

```bash
# Deploy to production
npm run deploy

# Deploy will:
# 1. Push schema to Convex cloud
# 2. Generate types
# 3. Deploy functions
```

## Learn More

- [Ontology Specification](/one/knowledge/ontology.md)
- [Schema Design](/one/things/plans/cycle-011-schema-design.md)
- [Backend Patterns](/one/knowledge/patterns/backend/)
- [Convex Documentation](https://docs.convex.dev)

---

**Built on the 6-dimension ontology - the universal code generation language.**
