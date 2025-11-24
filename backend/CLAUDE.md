# Backend Development - CLAUDE.md

## This is a Cascading Context File

**You've read `/CLAUDE.md` (root).** This file adds BACKEND-SPECIFIC patterns.

**What you learned from root:**
- 6-dimension ontology (groups, people, things, connections, events, knowledge)
- 6-phase workflow (UNDERSTAND → MAP → DESIGN → IMPLEMENT → BUILD → TEST)
- Cascading context system (closer to file = higher precedence)
- Architecture: Web → Backend → 6-Dimension Ontology

**What this file adds:**
- Backend implements the 6 dimensions
- 6-step universal mutation pattern (CRITICAL)
- Effect.ts service layer (when to use)
- Multi-tenant isolation (groupId scoping)
- Event logging (audit trail)

---

## ⚠️ CRITICAL: Search Existing Code First

**Before creating ANY mutation or query:**

```bash
# List existing mutations/queries
ls backend/convex/mutations/ backend/convex/queries/

# Search for similar patterns
grep -r "export const" backend/convex/mutations/ | grep -i <keyword>

# Check for reusable services
ls backend/convex/services/
```

**Ask yourself:**
- Does a mutation/query already exist for this entity type?
- Can I extend an existing mutation with additional args?
- Can I reuse validation logic from another mutation?

**Examples:**
```typescript
// ✅ CORRECT: Use things.ts with type parameter
mutations/things.ts → create({type: "product"})
mutations/things.ts → create({type: "course"})

// ❌ WRONG: Create duplicate mutations
mutations/products.ts → create()
mutations/courses.ts → create()
```

**Why:** **ONE mutation per operation** (not per entity type) = Pattern convergence = 98% AI accuracy.

---

## Your Role: Implement the 6-Dimension Ontology

**Backend provides CRUD operations for 6 dimensions:**

```
Ontology Design      → Backend (You Build)      → Database (Convex)
────────────────────   ─────────────────────────  ──────────────────
groups               → mutations/groups.ts      → groups table
things               → mutations/things.ts      → things table (includes people)
connections          → mutations/connections.ts → connections table
events               → mutations/events.ts      → events table
knowledge            → mutations/knowledge.ts   → knowledge table
```

**Key principle:** Thin wrappers. Business logic in services.

**Read full architecture:** `/one/knowledge/architecture.md#backend-layer`

---

## The Universal Backend Pattern (CRITICAL)

**Every mutation follows these EXACT 6 steps.** AI agents achieve 98% accuracy because they see this pattern everywhere.

```typescript
export const create = mutation({
  args: { groupId, type, name, properties },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // 2. VALIDATE GROUP
    const group = await ctx.db.get(args.groupId);
    if (!group || group.status !== "active") {
      throw new Error("Invalid group");
    }

    // 3. VALIDATE TYPE (against ontology)
    if (!isThingType(args.type)) {
      throw new Error(`Invalid type: ${args.type}`);
    }

    // 4. GET ACTOR (for event logging)
    const actor = await ctx.db
      .query("things")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId).eq("type", "creator")
      )
      .filter(q => q.eq(q.field("properties.userId"), identity.tokenIdentifier))
      .first();

    // 5. CREATE ENTITY
    const entityId = await ctx.db.insert("things", {
      groupId: args.groupId,
      type: args.type,
      name: args.name,
      properties: args.properties || {},
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // 6. LOG EVENT (CRITICAL - never skip)
    if (actor) {
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "thing_created",
        actorId: actor._id,
        targetId: entityId,
        timestamp: Date.now(),
        metadata: { entityType: args.type }
      });
    }

    return entityId;
  }
});
```

**Why 98% accuracy?** AI sees this exact pattern in every mutation.

**Read full patterns:** `/one/knowledge/patterns/backend/mutation-template.md`

---

## Query Patterns

### Basic Query (List by Type)

```typescript
export const list = query({
  args: {
    groupId: v.id("groups"),
    type: v.string(),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("things")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId).eq("type", args.type)
      )
      .collect();

    // Optional status filter
    if (args.status) {
      results = results.filter(r => r.status === args.status);
    }

    return results;
  }
});
```

### Get Single Entity

```typescript
export const get = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    const thing = await ctx.db.get(args.id);
    if (!thing) throw new Error("Not found");

    // Verify group access (if needed)
    const group = await ctx.db.get(thing.groupId);
    if (!group || group.status !== "active") {
      throw new Error("Invalid group");
    }

    return thing;
  }
});
```

---

## Effect.ts Service Layer

**When to use:**
- Complex business logic (multi-step workflows)
- Service composition (combining services)
- Error handling with recovery (retry, fallback)
- Dependency injection (testing, mocking)

**When NOT to use:**
- Simple CRUD (Convex mutations are enough)
- Pure database queries
- Authentication checks

**Example: Token Purchase Service**

```typescript
export class TokenService extends Effect.Service<TokenService>()("TokenService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const sui = yield* SuiProvider;

    return {
      purchase: (args: {
        userId: Id<"things">;
        groupId: Id<"groups">;
        tokenId: Id<"things">;
        amount: number;
      }) => Effect.gen(function* () {
        // 1. Validate user exists
        const user = yield* Effect.tryPromise(() => db.get(args.userId));
        if (!user) {
          return yield* Effect.fail({
            _tag: "UserNotFound",
            message: "User not found"
          });
        }

        // 2. Validate token exists
        const token = yield* Effect.tryPromise(() => db.get(args.tokenId));
        if (!token) {
          return yield* Effect.fail({
            _tag: "TokenNotFound",
            message: "Token not found"
          });
        }

        // 3. Execute blockchain transaction
        const result = yield* sui.executeTransaction({
          from: user.properties.walletAddress,
          to: token.properties.contractAddress,
          amount: args.amount
        });

        // 4. Create connection (holds_tokens)
        const connectionId = yield* Effect.tryPromise(() =>
          db.insert("connections", {
            groupId: args.groupId,
            type: "holds_tokens",
            fromThingId: args.userId,
            toThingId: args.tokenId,
            properties: {
              amount: args.amount,
              txDigest: result.digest
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
        );

        // 5. Log event
        yield* Effect.tryPromise(() =>
          db.insert("events", {
            groupId: args.groupId,
            type: "tokens_purchased",
            actorId: args.userId,
            targetId: args.tokenId,
            timestamp: Date.now(),
            metadata: {
              amount: args.amount,
              txDigest: result.digest,
              connectionId
            }
          })
        );

        return {
          success: true,
          txDigest: result.digest,
          connectionId
        };
      })
    };
  }),
  dependencies: [ConvexDatabase.Default, SuiProvider.Default]
}) {}
```

**Read full guide:** `/one/connections/effect.md`, `/one/connections/service-layer.md`

---

## Multi-Tenant Isolation

**CRITICAL:** Every mutation/query MUST scope by groupId.

### Group Validation Pattern

```typescript
// 1. Get group from args (not from user)
const group = await ctx.db.get(args.groupId);
if (!group) throw new Error("Group not found");

// 2. Verify group is active
if (group.status !== "active") throw new Error("Group is not active");

// 3. (Optional) Verify user has access to group
const userInGroup = await ctx.db
  .query("things")
  .withIndex("group_type", q =>
    q.eq("groupId", args.groupId).eq("type", "creator")
  )
  .filter(q => q.eq(q.field("properties.userId"), identity.tokenIdentifier))
  .first();

if (!userInGroup) throw new Error("User not in group");
```

### Query Scoping Pattern

```typescript
// ALWAYS filter by groupId first
export const listThings = query({
  args: { groupId: v.id("groups"), type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("things")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId).eq("type", args.type)
      )
      .collect();
  }
});
```

**Never query without groupId scope.** Cross-tenant data leaks = security catastrophe.

**Read full patterns:** `/one/knowledge/patterns/backend/multitenant-pattern.md`

---

## Database Schema (5 Tables, 6 Dimensions)

```
groups table      → Dimension 1 (multi-tenant containers)
things table      → Dimensions 2 & 3 (people + things)
connections table → Dimension 4 (relationships)
events table      → Dimension 5 (audit trail)
knowledge table   → Dimension 6 (embeddings, labels)
```

**Why 5 tables for 6 dimensions?** People stored as things with `type: 'creator'`.

**Read full schema:** `/one/connections/schema.md` or `/backend/convex/CLAUDE.md`

---

## Connection Patterns

### Creating Relationships

```typescript
export const createConnection = mutation({
  args: {
    groupId: v.id("groups"),
    type: v.string(), // owns, follows, enrolled_in, etc.
    fromThingId: v.id("things"),
    toThingId: v.id("things"),
    properties: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    // 1. Validate both things exist
    const fromThing = await ctx.db.get(args.fromThingId);
    const toThing = await ctx.db.get(args.toThingId);

    if (!fromThing || !toThing) {
      throw new Error("Thing not found");
    }

    // 2. Validate connection type
    if (!isConnectionType(args.type)) {
      throw new Error(`Invalid connection type: ${args.type}`);
    }

    // 3. Create connection
    const connectionId = await ctx.db.insert("connections", {
      groupId: args.groupId,
      type: args.type,
      fromThingId: args.fromThingId,
      toThingId: args.toThingId,
      properties: args.properties || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // 4. Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "connection_created",
      actorId: fromThing._id,
      targetId: toThing._id,
      timestamp: Date.now(),
      metadata: { connectionType: args.type, connectionId }
    });

    return connectionId;
  }
});
```

### Querying Relationships

```typescript
export const getRelated = query({
  args: {
    fromThingId: v.id("things"),
    relationshipType: v.string()
  },
  handler: async (ctx, args) => {
    // Get all connections of this type from this thing
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", q =>
        q.eq("fromThingId", args.fromThingId).eq("type", args.relationshipType)
      )
      .collect();

    // Fetch the related things
    const relatedThings = await Promise.all(
      connections.map(conn => ctx.db.get(conn.toThingId))
    );

    return relatedThings.filter(thing => thing !== null);
  }
});
```

---

## Authentication & Authorization

### Getting Current User

```typescript
// 1. Get identity from auth context
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthenticated");

// 2. Find user entity in group
const user = await ctx.db
  .query("things")
  .withIndex("group_type", q =>
    q.eq("groupId", args.groupId).eq("type", "creator")
  )
  .filter(q => q.eq(q.field("properties.userId"), identity.tokenIdentifier))
  .first();

if (!user) throw new Error("User not found in group");
```

### Authorization by Role

```typescript
const role = user.properties.role; // "platform_owner" | "org_owner" | "org_user" | "customer"

if (role === "platform_owner") {
  // Full access to all groups
} else if (role === "org_owner") {
  // Admin access to their group + children
} else if (role === "org_user") {
  // Standard access to their group
} else {
  // Customer - read-only access
}
```

**Read full auth patterns:** `/one/knowledge/patterns/backend/auth-pattern.md`

---

## Event Logging

**CRITICAL:** Log events AFTER successful operations (not before).

```typescript
await ctx.db.insert("events", {
  groupId: args.groupId,        // REQUIRED: Multi-tenant scope
  type: "thing_created",         // From EVENT_TYPES ontology
  actorId: actor._id,            // Who did this
  targetId: entityId,            // What was affected
  timestamp: Date.now(),         // When it happened
  metadata: { entityType: args.type } // Additional context
});
```

**When to log:**
- After creating entity → `thing_created`
- After updating entity → `thing_updated`
- After deleting entity → `thing_deleted`
- After user action → specific event type (67+ types)

**Read event types:** `/one/knowledge/ontology.md#event-types`

---

## Type Validation

```typescript
import { THING_TYPES, isThingType } from "../types/ontology";

// Validate at runtime
if (!isThingType(args.type)) {
  throw new Error(`Invalid type: ${args.type}`);
}
```

**Available types:**
- **Thing types (66+):** creator, ai_clone, agent, blog_post, course, product, token
- **Connection types (25+):** owns, created_by, follows, enrolled_in, holds_tokens
- **Event types (67+):** thing_created, user_registered, course_completed

**Read full ontology:** `/one/knowledge/ontology.md`

---

## Error Handling

**Backend errors should be descriptive but safe.**

```typescript
// Authentication errors
if (!identity) throw new Error("Unauthenticated");

// Validation errors
if (!isThingType(args.type)) throw new Error(`Invalid type: ${args.type}`);

// Not found errors
if (!entity) throw new Error("Entity not found");

// State errors
if (group.status !== "active") throw new Error("Group is not active");

// Permission errors
if (role === "customer" && operation === "delete") {
  throw new Error("Insufficient permissions");
}
```

---

## Common Mistakes

**Pattern divergence (CRITICAL):**
- ❌ Separate mutations per entity type (products.ts, courses.ts)
- ❌ Creating new mutation when existing one can be extended
- ✅ ALWAYS search existing mutations first
- ✅ ALWAYS use universal 6-step pattern
- ✅ ALWAYS extend things.ts for new entity operations

**Multi-tenant violations:**
- ❌ Queries without groupId scoping
- ✅ ALWAYS validate groupId first
- ✅ ALWAYS filter by groupId in queries

**Event logging failures:**
- ❌ Skipping event logging
- ❌ Logging before operation succeeds
- ✅ ALWAYS log after successful operations

---

## Development Commands

```bash
cd backend/
npx convex dev   # Start Convex dev server
npx convex deploy # Deploy to production
npx convex run queries/things:list '{"groupId": "...", "type": "product"}'
npx convex logs --history 50 --success # View function logs
```

**Read full commands:** `/one/knowledge/development-commands.md`

---

## Further Cascading

**For Convex-specific patterns:**
- `/backend/convex/CLAUDE.md` - Database layer, schema, indexes, migrations

**Precedence rule:** Closer to file = higher precedence.

---

**Backend Specialist: Implement the 6-dimension ontology with 98% pattern accuracy.**
