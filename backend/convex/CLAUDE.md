# Convex Database Layer - CLAUDE.md

## This is a Cascading Context File

**You've read `/CLAUDE.md` (root) and `/backend/CLAUDE.md` (backend).** This file adds CONVEX-SPECIFIC database patterns.

**What you learned from backend:**
- 6-dimension implementation
- 6-step mutation pattern (CRITICAL)
- Effect.ts service layer
- Multi-tenant isolation

**What this file adds:**
- Schema definition patterns
- Index strategies
- Query optimization
- Migration patterns

---

## ⚠️ CRITICAL: Search Existing Schema First

**Before modifying schema or creating indexes:**

```bash
# Check existing schema
cat backend/convex/schema.ts

# List all indexes
grep -r "\.index(" backend/convex/schema.ts

# Search for similar index patterns
grep -r "by_group" backend/convex/schema.ts

# Check existing queries using indexes
grep -r "withIndex" backend/convex/queries/
```

**Ask yourself:**
- Does an index already exist for this query pattern?
- Can I reuse an existing compound index?
- Does a similar table structure already exist?
- Can I add a field instead of creating a new table?

**Examples:**
```typescript
// ✅ CORRECT: Use existing index pattern
// Schema already has: .index("by_group_type", ["groupId", "type"])
// Query uses: .withIndex("by_group_type", q => q.eq("groupId", gid).eq("type", t))

// ❌ WRONG: Create duplicate index
// .index("by_group_product", ["groupId", "type"])  // Don't do this!
// .index("by_group_course", ["groupId", "type"])   // by_group_type already covers this!
```

**Why this matters:**
- **Consistent index naming** = Easy to find and reuse
- Duplicate indexes = Slower writes + confusion
- The 5-table schema covers ALL entity types

---

## Your Role: Database Layer for 6 Dimensions

**Convex provides real-time database with typed functions:**

```
Schema (schema.ts) → Mutations → Queries → Real-time subscriptions
```

**Key principle:** 5 tables (groups, things, connections, events, knowledge) implement 6 dimensions.

---

## Schema Patterns

**Read full schema:** `/one/connections/schema.md`

**5-table structure:**

```typescript
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  groups: defineTable({
    name: v.string(),
    type: v.union(v.literal("friend_circle"), v.literal("business"), ...),
    parentGroupId: v.optional(v.id("groups")), // Hierarchical nesting
    properties: v.any(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_status", ["status"])
    .index("by_parent", ["parentGroupId"]),

  things: defineTable({
    groupId: v.id("groups"),     // CRITICAL: Multi-tenant scoping
    type: v.string(),            // 66+ types (product, course, creator, etc.)
    name: v.string(),
    properties: v.any(),         // Type-specific data
    status: v.union(v.literal("draft"), v.literal("active"), ...),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_group_type", ["groupId", "type"])
    .index("by_group_status", ["groupId", "status"])
    .index("by_type", ["type"]),

  // connections, events, knowledge tables...
});
```

**Golden Rule:** Every table (except groups) has `groupId: v.id("groups")` for multi-tenancy.

---

## Index Strategies

**CRITICAL:** Add index for every query pattern.

```typescript
// Query pattern: list things by group + type
.query("things")
  .withIndex("by_group_type", q => q.eq("groupId", groupId).eq("type", type))

// Index required:
.index("by_group_type", ["groupId", "type"])
```

**Common indexes:**
- `by_group_type` - List entities of type in group
- `by_group_status` - Filter by status in group
- `by_created_at` - Sort by creation time
- `by_from_to` - Connections from → to
- `by_actor_timestamp` - Events by actor over time

**Compound index rules:**
- First field MUST be equality check (eq)
- Second field can be range/sort (gt, lt, order)
- Order matters: `["groupId", "type"]` ≠ `["type", "groupId"]`

**Read full patterns:** `/one/connections/schema.md#indexes`

---

## Query Patterns

**Always scope by groupId:**

```typescript
// List things
export const list = query({
  args: { groupId: v.id("groups"), type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("things")
      .withIndex("by_group_type", q =>
        q.eq("groupId", args.groupId).eq("type", args.type)
      )
      .collect();
  }
});

// Get single thing
export const get = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    const thing = await ctx.db.get(args.id);
    if (!thing) throw new Error("Not found");

    // Verify tenant access (if needed)
    const group = await ctx.db.get(thing.groupId);
    if (!group || group.status !== "active") {
      throw new Error("Invalid group");
    }

    return thing;
  }
});
```

**Read query patterns:** `/one/knowledge/patterns/backend/query-template.md`

---

## Mutation Patterns

**Follow 6-step universal pattern** (see `/backend/CLAUDE.md`).

**Additional Convex-specific rules:**

1. **Use Convex validators:**
```typescript
args: {
  groupId: v.id("groups"),
  type: v.string(),
  name: v.string(),
  properties: v.any()
}
```

2. **Use indexes for lookups:**
```typescript
const existing = await ctx.db
  .query("things")
  .withIndex("by_group_type", q => q.eq("groupId", groupId).eq("type", type))
  .filter(q => q.eq(q.field("name"), name))
  .first();
```

3. **Batch operations when possible:**
```typescript
const things = await Promise.all(
  ids.map(id => ctx.db.get(id))
);
```

**Read mutation patterns:** `/one/knowledge/patterns/backend/mutation-template.md`

---

## Migration Patterns

**When schema changes:**

1. Add new field with `v.optional()`
2. Deploy migration function
3. Run migration to backfill
4. Remove `v.optional()` once complete

**Example:**

```typescript
// Step 1: Add optional field
defineTable({
  groupId: v.id("groups"),
  newField: v.optional(v.string()), // NEW
  // ...
})

// Step 2: Migration function
export const migrateNewField = internalMutation({
  handler: async (ctx) => {
    const things = await ctx.db.query("things").collect();
    for (const thing of things) {
      if (!thing.newField) {
        await ctx.db.patch(thing._id, {
          newField: "default_value"
        });
      }
    }
  }
});

// Step 3: Run migration (CLI)
// npx convex run mutations/migrations:migrateNewField

// Step 4: Remove optional after backfill complete
newField: v.string() // No longer optional
```

**Read migration guide:** `/one/connections/schema.md#migrations`

---

## Database Operations

**Core operations:**

```typescript
// Insert
const id = await ctx.db.insert("things", { groupId, type, name, ... });

// Get by ID
const thing = await ctx.db.get(id);

// Query with index
const things = await ctx.db
  .query("things")
  .withIndex("by_group_type", q => q.eq("groupId", groupId).eq("type", type))
  .collect();

// Patch (update)
await ctx.db.patch(id, { name: "New Name", updatedAt: Date.now() });

// Soft delete (preferred)
await ctx.db.patch(id, { deletedAt: Date.now(), status: "archived" });

// Hard delete (avoid)
await ctx.db.delete(id);
```

**Read full API:** `/one/connections/api-reference.md#database-operations`

---

## Auth Context

```typescript
// Get current user identity
const identity = await ctx.auth.getUserIdentity();
// Returns: { tokenIdentifier, email, name, ...claims }

if (!identity) {
  throw new Error("Unauthenticated");
}
```

**Find user entity:**
```typescript
const user = await ctx.db
  .query("things")
  .withIndex("by_group_type", q =>
    q.eq("groupId", groupId).eq("type", "creator")
  )
  .filter(q =>
    q.eq(q.field("properties.userId"), identity.tokenIdentifier)
  )
  .first();
```

---

## Type Validation

```typescript
import {
  THING_TYPES,
  CONNECTION_TYPES,
  EVENT_TYPES,
  isThingType,
  isConnectionType,
  isEventType
} from "../types/ontology";

// Validate at runtime
if (!isThingType(args.type)) {
  throw new Error(
    `Invalid entity type "${args.type}". Must be one of: ${THING_TYPES.join(", ")}`
  );
}
```

**Types are auto-generated from YAML.** See `/backend/convex/types/ontology.ts`

---

## Common Patterns

**Multi-tenant scoping:**
```typescript
.withIndex("by_group_type", q =>
  q.eq("groupId", args.groupId).eq("type", args.type)
)
```

**Soft delete filtering:**
```typescript
.filter(q => q.eq(q.field("deletedAt"), undefined))
```

**Event logging:**
```typescript
await ctx.db.insert("events", {
  groupId: groupId,
  type: "thing_created",
  actorId: actor._id,
  targetId: entityId,
  timestamp: Date.now(),
  metadata: { /* context */ }
});
```

---

## Common Mistakes

**Pattern divergence (CRITICAL):**
- ❌ Creating separate tables per entity type (products, courses, tokens tables)
- ❌ Creating entity-specific indexes when generic ones exist
- ❌ Not searching for existing indexes before creating new ones
- ❌ Building from scratch without checking schema patterns
- ✅ ALWAYS search existing schema/indexes first
- ✅ ALWAYS use 5-table structure (groups, things, connections, events, knowledge)
- ✅ ALWAYS reuse compound indexes (by_group_type, by_group_status, etc.)

**Index mistakes:**
- ❌ Creating `by_group_product` when `by_group_type` covers all types
- ❌ Wrong field order in compound indexes
- ❌ Missing indexes for common query patterns
- ✅ Use consistent naming: `by_<field1>_<field2>`
- ✅ First field = equality check, second = range/sort

**Query optimization failures:**
- ❌ Queries without indexes (full table scans)
- ❌ Not filtering by groupId first
- ❌ Using `.collect()` when `.first()` is enough
- ✅ ALWAYS use `.withIndex()` for queries
- ✅ ALWAYS scope by groupId for multi-tenancy

---

## Development Commands

```bash
cd backend/

# Start Convex dev server (watch mode)
npx convex dev

# Deploy to production
npx convex deploy

# Run query from CLI
npx convex run queries/things:list '{"groupId": "...", "type": "user"}'

# View function logs
npx convex logs --history 50 --success
```

---

## Further Reading

**Convex-specific:**
- Schema patterns: `/one/connections/schema.md`
- Query optimization: `/one/connections/api-reference.md#queries`
- Real-time subscriptions: `/one/connections/api-docs.md#real-time`

**Related:**
- Backend patterns: `/backend/CLAUDE.md`
- Service layer: `/one/connections/service-layer.md`
- Effect.ts: `/one/connections/effect.md`

---

**Convex Specialist: Database layer for 6-dimension ontology with real-time subscriptions.**
