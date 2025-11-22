# Backend Development - CLAUDE.md

## This is a Cascading Context File

**You've read `/CLAUDE.md` (root).** This file adds BACKEND-SPECIFIC patterns.

**What you learned from root:**
- 6-dimension ontology (groups, people, things, connections, events, knowledge)
- 6-phase workflow (UNDERSTAND → MAP → DESIGN → IMPLEMENT → BUILD → TEST)
- Cascading context system (closer to file = higher precedence)
- Technology stack (Convex, Effect.ts, Better Auth)

---

## Your Role: Implement the 6-Dimension Ontology

**Frontend renders, Backend implements:**

```
Frontend (Renders)       Backend (You Build)
──────────────────       ───────────────────
<GroupSelector>     →    queries/groups.ts
<ThingCard>         →    queries/entities.ts + mutations/entities.ts
<ConnectionList>    →    queries/connections.ts + mutations/connections.ts
<EventTimeline>     →    queries/events.ts + mutations/events.ts
<SearchResults>     →    queries/knowledge.ts (vector search)
```

**Key principle:** Ontology implements reality. Frontend just renders it.

---

## Architecture Layers

### Layer 1: Schema (schema.ts)

**5 tables implement 6 dimensions:**

```typescript
groups       // Dimension 1: Multi-tenant isolation
things       // Dimensions 2 & 3: People + Things
connections  // Dimension 4: Relationships
events       // Dimension 5: Audit trail
knowledge    // Dimension 6: Labels + vectors
```

**Golden Rule:** NEVER add custom tables. Map to these 5.

### Layer 2: Queries (queries/*.ts)

**Read operations with multi-tenant scoping:**

```typescript
// queries/entities.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
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

    // 3. Query with groupId scope (CRITICAL for multi-tenant)
    let q = ctx.db.query("things")
      .withIndex("by_group_type", q =>
        q.eq("groupId", person.groupId).eq("type", args.type)
      );

    // 4. Apply filters
    if (args.status) {
      q = q.filter(thing => thing.status === args.status);
    }

    // 5. Limit results
    const limit = args.limit || 100;
    return await q.take(limit);
  },
});

export const get = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // 2. Get user's group
    const person = await ctx.db.query("things")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(t => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) return null;

    // 3. Get thing and verify group ownership
    const thing = await ctx.db.get(args.id);
    if (!thing || thing.groupId !== person.groupId) {
      return null; // Not found or unauthorized
    }

    return thing;
  },
});
```

**Pattern:** ALWAYS filter by groupId. NEVER leak cross-tenant data.

### Layer 3: Mutations (mutations/*.ts)

**Write operations with event logging:**

```typescript
// mutations/entities.ts
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
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user's group
    const person = await ctx.db.query("things")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(t => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Validate type (66+ valid types)
    const validTypes = [
      "creator", "customer", "agent", "blog_post", "video",
      "course", "product", "payment", "funnel", "funnel_step",
      // ... all 66+ types
    ];

    if (!validTypes.includes(args.type)) {
      throw new Error(`Invalid thing type: ${args.type}`);
    }

    // 4. Create thing
    const thingId = await ctx.db.insert("things", {
      type: args.type,
      name: args.name,
      properties: args.properties,
      groupId: person.groupId,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 5. Log event (CRITICAL for audit trail)
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

    // 6. Return result
    return thingId;
  },
});

export const update = mutation({
  args: {
    id: v.id("things"),
    name: v.optional(v.string()),
    properties: v.optional(v.any()),
    status: v.optional(v.string()),
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

    // 3. Get thing and verify ownership
    const thing = await ctx.db.get(args.id);
    if (!thing || thing.groupId !== person.groupId) {
      throw new Error("Unauthorized");
    }

    // 4. Update thing
    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.properties && { properties: args.properties }),
      ...(args.status && { status: args.status }),
      updatedAt: Date.now(),
    });

    // 5. Log event
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        updatedFields: Object.keys(args).filter(k => k !== "id"),
        groupId: person.groupId,
      },
    });
  },
});

export const remove = mutation({
  args: { id: v.id("things") },
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

    // 3. Get thing and verify ownership
    const thing = await ctx.db.get(args.id);
    if (!thing || thing.groupId !== person.groupId) {
      throw new Error("Unauthorized");
    }

    // 4. Soft delete (change status to archived)
    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    // 5. Log event
    await ctx.db.insert("events", {
      type: "entity_archived",
      actorId: person._id,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        entityType: thing.type,
        groupId: person.groupId,
      },
    });
  },
});
```

**Pattern:** ALWAYS log events. ALWAYS validate groupId. SOFT delete only.

### Layer 4: Services (services/*.ts)

**Effect.ts business logic (pure, composable):**

```typescript
// services/funnel/funnel.ts
import { Effect } from "effect";

// Define errors
export class FunnelNotFoundError {
  readonly _tag = "FunnelNotFoundError";
  constructor(public funnelId: string, public message: string) {}
}

export class FunnelAlreadyPublishedError {
  readonly _tag = "FunnelAlreadyPublishedError";
  constructor(public funnelId: string) {}
}

// Business logic (pure functions)
export const FunnelService = {
  /**
   * Validate funnel can be published
   */
  validateForPublish: (funnel: any) =>
    Effect.gen(function* () {
      if (funnel.status === "published") {
        return yield* Effect.fail(
          new FunnelAlreadyPublishedError(funnel._id)
        );
      }

      // Check has at least one step
      if (!funnel.properties?.stepCount || funnel.properties.stepCount === 0) {
        return yield* Effect.fail({
          _tag: "ValidationError",
          message: "Funnel must have at least one step",
        });
      }

      return funnel;
    }),

  /**
   * Calculate funnel metrics
   */
  calculateMetrics: (events: any[]) =>
    Effect.sync(() => {
      const visitors = new Set(events.map(e => e.actorId)).size;
      const conversions = events.filter(
        e => e.type === "purchase_completed"
      ).length;
      const conversionRate = visitors > 0 ? conversions / visitors : 0;

      return {
        visitors,
        conversions,
        conversionRate,
        revenue: events
          .filter(e => e.type === "purchase_completed")
          .reduce((sum, e) => sum + (e.metadata?.amount || 0), 0),
      };
    }),
};
```

**Pattern:** Pure business logic. No database calls. Composable with Effect.gen.

---

## Critical Patterns

### 1. Multi-Tenant Isolation

**ALWAYS filter by groupId:**

```typescript
// ❌ BAD: No groupId filter (leaks data)
const things = await ctx.db.query("things")
  .withIndex("by_type", q => q.eq("type", "product"))
  .collect();

// ✅ GOOD: Filter by groupId
const things = await ctx.db.query("things")
  .withIndex("by_group_type", q =>
    q.eq("groupId", person.groupId).eq("type", "product")
  )
  .collect();
```

### 2. Event Logging

**ALWAYS log mutations:**

```typescript
// ❌ BAD: No event logging
await ctx.db.insert("things", { ... });

// ✅ GOOD: Log event after mutation
const thingId = await ctx.db.insert("things", { ... });
await ctx.db.insert("events", {
  type: "entity_created",
  actorId: person._id,
  targetId: thingId,
  timestamp: Date.now(),
  metadata: { ... },
});
```

### 3. Soft Deletes

**NEVER hard delete:**

```typescript
// ❌ BAD: Hard delete
await ctx.db.delete(thingId);

// ✅ GOOD: Soft delete
await ctx.db.patch(thingId, { status: "archived" });
await ctx.db.insert("events", {
  type: "entity_archived",
  actorId: person._id,
  targetId: thingId,
  timestamp: Date.now(),
});
```

### 4. Index Usage

**ALWAYS use indexes:**

```typescript
// ❌ BAD: No index (scans entire table)
const things = await ctx.db.query("things")
  .filter(t => t.groupId === groupId && t.type === "product")
  .collect();

// ✅ GOOD: Use compound index
const things = await ctx.db.query("things")
  .withIndex("by_group_type", q =>
    q.eq("groupId", groupId).eq("type", "product")
  )
  .collect();
```

---

## Thing Types Reference (66+)

### People (Dimension 2)
- creator, customer, team_member

### Content
- blog_post, video, podcast, course, lesson, article

### Products
- digital_product, membership, consultation, nft, product

### Agents
- agent, engineering_agent, strategy_agent, marketing_agent

### Community
- community, conversation, message

### Tokens
- token, token_contract

### Platform
- website, landing_page, template, livestream

### Business
- payment, subscription, invoice, metric, insight, task

### Funnel Builder (NEW)
- funnel, funnel_step, page_element, funnel_template, page_template
- form_submission, ab_test, funnel_domain, funnel_analytics
- email_sequence, custom_code

---

## Connection Types Reference (25+)

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

### Tokens
- holds_tokens, staked_in, earned_from

### Products
- purchased, enrolled_in, completed, teaching

### Funnel Builder (NEW)
- funnel_contains_step, step_contains_element, funnel_based_on_template
- step_based_on_template, visitor_entered_funnel, visitor_viewed_step
- visitor_submitted_form, customer_purchased_via_funnel
- funnel_leads_to_product, ab_test_variant, funnel_sends_email
- funnel_uses_domain

---

## Event Types Reference (67+)

### Entity Lifecycle
- entity_created, entity_updated, entity_deleted, entity_archived

### User
- user_registered, user_verified, user_login, profile_updated

### Organization
- organization_created, user_joined_org, user_removed_from_org

### Agents
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

---

## Common Mistakes

**Ontology violations:**
- ❌ Creating custom tables
- ✅ Map to 5 tables (groups, things, connections, events, knowledge)

**Security violations:**
- ❌ Skipping authentication
- ✅ Always check `ctx.auth.getUserIdentity()`

**Multi-tenant violations:**
- ❌ Querying without groupId filter
- ✅ Always filter by `person.groupId`

**Audit trail violations:**
- ❌ Mutating without logging events
- ✅ Always create event record after mutation

**Delete violations:**
- ❌ Hard deleting records
- ✅ Soft delete with `status: "archived"`

---

## Development Commands

```bash
cd backend/

# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to production
npm run deploy

# Generate types
npm run codegen
```

---

## Further Cascading

**For more specific context:**
- Query patterns: `/one/knowledge/patterns/backend/convex-query-pattern.md`
- Mutation patterns: `/one/knowledge/patterns/backend/convex-mutation-pattern.md`
- Service patterns: `/one/knowledge/patterns/backend/service-template.md`

**Precedence rule:** Closer to file = higher precedence.

---

**Backend Specialist: Implement the 6-dimension ontology with multi-tenant isolation, event logging, and 98% AI accuracy through pattern convergence.**
