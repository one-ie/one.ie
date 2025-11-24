# Convex Backend - 6-Dimension Ontology Index

Complete reference for the ONE Platform backend organized by the 6-dimension ontology.

## Quick Navigation

```
BACKEND STRUCTURE
├── schema.ts              - Database schema (groups, things, connections, events, knowledge tables)
├── auth.ts                - Authentication & Better Auth setup
│
├── DIMENSION 1: GROUPS (Multi-tenant isolation)
│  ├── queries/groups.ts       - Read operations
│  ├── mutations/groups.ts      - Write operations
│  └── services/groupService.ts - Business logic
│
├── DIMENSION 2: PEOPLE (Authorization & governance)
│  ├── queries/people.ts       - Read operations
│  ├── mutations/people.ts      - Write operations
│  └── services/peopleService.ts - Business logic
│
├── DIMENSION 3: THINGS (Entities - 66+ types)
│  ├── queries/entities.ts      - Read operations
│  ├── mutations/entities.ts     - Write operations
│  └── services/entityService.ts - Business logic
│
├── DIMENSION 4: CONNECTIONS (25+ relationship types)
│  ├── queries/connections.ts   - Read operations
│  ├── mutations/connections.ts  - Write operations
│  └── services/connectionService.ts - Business logic
│
├── DIMENSION 5: EVENTS (67+ event types - audit trail)
│  ├── queries/events.ts        - Read operations
│  ├── mutations/events.ts       - Write operations
│  └── services/eventService.ts  - Business logic
│
├── DIMENSION 6: KNOWLEDGE (Vectors, embeddings, RAG)
│  ├── queries/knowledge.ts      - Read operations
│  ├── mutations/knowledge.ts     - Write operations
│  └── services/ragService.ts    - Business logic
│
├── http.ts                - HTTP API endpoints
├── crons/                 - Scheduled jobs
└── lib/                   - Utilities, validation, helpers
```

## Dimension 1: GROUPS - Multi-tenant Isolation

**Purpose**: Partition the system into isolated groups with hierarchical nesting (friend circles → businesses → DAOs → governments)

| Query | Purpose |
|-------|---------|
| `getBySlug(slug)` | URL routing: `/group/acme` |
| `getById(groupId)` | Direct lookup by ID |
| `list(type?, status?)` | Filter groups |
| `getSubgroups(parentGroupId)` | Direct children |
| `getHierarchy(rootGroupId)` | All descendants recursive |
| `getGroupPath(groupId)` | Breadcrumb trail to root |
| `isDescendantOf(groupId, ancestorId)` | Permission check |
| `getEntitiesInHierarchy(rootGroupId)` | All things in tree |
| `getConnectionsInHierarchy(rootGroupId)` | All relationships in tree |
| `getEventsInHierarchy(rootGroupId)` | All actions in tree |
| `getStats(groupId, includeSubgroups?)` | Count entities, connections, events |
| `search(query, type?, visibility?)` | Full-text search |

**Mutations**:
- `create(name, type, slug, parentGroupId?, settings?)` → Id
- `update(groupId, name?, settings?)` → Id
- `archive(groupId)` → Id (soft delete)
- `restore(groupId)` → Id

**Key Features**:
- Hierarchical: Groups can nest infinitely
- Plans: starter, pro, enterprise (at organization level)
- Visibility: public or private
- Join policies: open, invite_only, approval_required
- Resource limits: users, storage, API calls

---

## Dimension 2: PEOPLE - Authorization & Governance

**Purpose**: Define who can do what (platform_owner, org_owner, org_user, customer)

| Query | Purpose |
|-------|---------|
| `list(groupId)` | All people in group |
| `getById(personId)` | Get person details |
| `getRole(personId)` | Get authorization level |
| `listByRole(groupId, role)` | Filter by permission |

**Mutations**:
- `create(groupId, name, email, role, userId?, properties?)` → Id
- `updateRole(personId, newRole, actorId?)` → Id
- `updateProfile(personId, name?, properties?)` → Id
- `removeFromGroup(personId, actorId?)` → Id

**Key Features**:
- Roles: platform_owner, org_owner, org_user, customer
- Stored as entities with type="creator"
- Properties: email, verified, last_login, preferences
- Multi-group membership: person can belong to multiple groups

---

## Dimension 3: THINGS - Entities (66+ Types)

**Purpose**: Model all nouns (users, agents, content, tokens, courses, products, etc.)

| Query | Purpose |
|-------|---------|
| `list(groupId, type?, status?, limit?)` | Filter entities |
| `getById(entityId, groupId?)` | Get entity |
| `listByType(groupId, type)` | All of specific type |
| `listByStatus(groupId, status)` | Filter by workflow |
| `getProperties(entityId)` | Get properties object |
| `search(groupId, query)` | Full-text search |
| `listRecent(groupId, limit?)` | Most recent |
| `getStats(groupId)` | Counts by type/status |
| `getRelated(entityId)` | Connected entities |

**Mutations**:
- `create(groupId, type, name, properties?, status?)` → Id
- `update(entityId, name?, properties?, status?)` → Id
- `archive(entityId)` → Id (soft delete)
- `restore(entityId)` → Id
- `bulkCreate(groupId, items[])` → Id[]

**Entity Types** (66+):
- People: creator, user, agent
- Content: article, video, course, module
- Commerce: product, payment_method, order, transaction
- Organization: team, department, role, permission
- Finance: account, token, staking_position, fund
- [See schema.ts for complete list]

**Key Features**:
- Status: draft, active, published, archived, inactive
- Properties: Flexible JSON object (no schema enforcement)
- Timestamps: createdAt, updatedAt
- Ownership: Linked via connections

---

## Dimension 4: CONNECTIONS - Relationships (25+ Types)

**Purpose**: Model how entities relate to each other

| Query | Purpose |
|-------|---------|
| `listFrom(groupId, fromEntityId, type?)` | Outgoing edges |
| `listTo(groupId, toEntityId, type?)` | Incoming edges |
| `listBetween(groupId, from, to, type?)` | Bidirectional |
| `listByType(groupId, relationshipType)` | Filter by type |

**Mutations**:
- `create(groupId, fromEntityId, toEntityId, type, metadata?, strength?)` → Id
- `upsert(...)` → Id (create or update)
- `bulkCreate(groupId, connections[])` → Id[]

**Relationship Types** (25+):

*Ownership & Membership*:
- owns, member_of, part_of

*Authorship*:
- created_by, authored, generated_by, published_to

*Derivation*:
- clone_of, trained_on, references

*Social*:
- following, collaborates_with

*Financial*:
- holds_tokens, staked_in, earned_from, purchased, transacted

*Educational*:
- enrolled_in, teaching, completed

*Organizational*:
- manages, reports_to, moderates

*Communication*:
- communicated, notified, referred

*Governance*:
- delegated, approved, fulfilled

**Key Features**:
- Bidirectional: Can query from→to or to→from
- Metadata: Custom fields per relationship type
- Strength: Relationship weight (0-1)
- Validity: validFrom/validTo timestamps
- Audit: Created by, updated by (via events)

---

## Dimension 5: EVENTS - Audit Trail (67+ Types)

**Purpose**: Complete record of what happened, who did it, when

| Query | Purpose |
|-------|---------|
| `list(groupId, limit?)` | All events in group |
| `byActor(groupId, actorId, limit?)` | Events by person |
| `byTarget(groupId, targetId, limit?)` | Events affecting entity |
| `byTimeRange(groupId, start, end, limit?)` | Time range |
| `stats(groupId)` | Counts by event type |
| `recent(groupId, limit?)` | Most recent first |
| `getById(eventId)` | Get event by ID |

**Mutations**:
- Automatically created by all mutations via logging

**Event Types** (67+):
- Entity: thing_created, thing_updated, thing_deleted, thing_restored
- Relationship: connection_created, connection_deleted, connection_updated
- Person: person_joined, person_left, role_changed
- Transaction: payment_initiated, payment_completed, payment_failed
- Content: article_published, video_uploaded, course_started
- [See schema.ts for complete list]

**Event Structure**:
```typescript
{
  groupId: Id<"groups">,
  type: string,           // Event type
  actorId?: Id<"entities">, // Who (person)
  targetId?: Id<"entities">, // What (thing)
  timestamp: number,      // When
  metadata: {
    // Event-specific data
    amount?: number,      // For transactions
    status?: string,      // State change
    reason?: string,      // Why it happened
    ... // Custom fields
  }
}
```

**Key Features**:
- Immutable: Events are never deleted
- Complete audit trail: Every change is recorded
- Temporal: Queryable by time range
- Traceable: Actor + Target + Action
- Enrichable: Metadata for domain-specific data

---

## Dimension 6: KNOWLEDGE - Vectors, Embeddings, RAG

**Purpose**: Store embeddings and labels for semantic search and AI understanding

| Query | Purpose |
|-------|---------|
| `list(groupId, limit?)` | All knowledge |
| `search(groupId, query, limit?)` | Semantic search |
| `bySourceThing(groupId, thingId, limit?)` | Knowledge from entity |
| `byThing(groupId, thingId, limit?)` | Knowledge linked to entity |
| `byLabel(groupId, label, limit?)` | Filter by tag |
| `listLabels(groupId)` | Available tags |
| `stats(groupId)` | Knowledge counts |
| `getById(knowledgeId)` | Get by ID |

**Mutations**:
- `create(groupId, sourceThingId?, content, labels?, metadata?)` → Id
- `update(knowledgeId, content?, labels?, metadata?)` → Id
- `delete(knowledgeId)` → Id
- `bulkCreate(groupId, items[])` → Id[]
- `linkToThing(knowledgeId, thingId)` → Id

**Knowledge Types**:
- label: Category tags
- chunk: Text fragments (extracted from content)
- vector_only: Just embeddings (no text)

**Key Features**:
- Embeddings: Numeric vectors for similarity search
- Labels: Tags for categorization
- Source tracking: Links back to original entity
- Metadata: Confidence score, model used, etc.
- RAG ready: Provides context for AI models

---

## Database Schema

```typescript
// DIMENSION 1: Multi-tenant isolation boundary
groups: {
  _id: Id<"groups">
  slug: string,
  name: string,
  type: GroupType,
  parentGroupId?: Id<"groups">,
  status: "active" | "archived",
  createdAt: number,
  updatedAt: number
}

// DIMENSION 2-6: All scoped to groupId for isolation
things: {
  _id: Id<"entities">,
  groupId: Id<"groups">,      // ← CRITICAL: Isolation
  type: string,               // creator, user, article, etc.
  name: string,
  properties: any,
  status: EntityStatus,
  createdAt: number,
  updatedAt: number
}

connections: {
  _id: Id<"connections">,
  groupId: Id<"groups">,      // ← CRITICAL: Isolation
  fromEntityId: Id<"entities">,
  toEntityId: Id<"entities">,
  relationshipType: string,
  metadata?: any,
  createdAt: number,
  updatedAt: number
}

events: {
  _id: Id<"events">,
  groupId: Id<"groups">,      // ← CRITICAL: Isolation
  type: string,
  actorId?: Id<"entities">,
  targetId?: Id<"entities">,
  timestamp: number,
  metadata?: any
}

knowledge: {
  _id: Id<"knowledge">,
  groupId: Id<"groups">,      // ← CRITICAL: Isolation
  sourceThingId?: Id<"entities">,
  content: string,
  embedding?: number[],
  labels?: string[],
  knowledgeType: "label" | "chunk" | "vector_only",
  createdAt: number,
  updatedAt: number
}
```

---

## Key Patterns

### Pattern 1: Multi-Tenancy Filter
```typescript
// ALWAYS include groupId filter FIRST
const results = await ctx.db
  .query("entities")
  .withIndex("group_type", (q) =>
    q.eq("groupId", args.groupId)  // ← First!
  )
  .collect();
```

### Pattern 2: Hierarchical Query
```typescript
// Get all data in group tree (groups + subgroups)
const rootId = /* ... */;
const hierarchy = await ctx.db
  .query("groups")
  .withIndex("by_parent", (q) => q.eq("parentGroupId", rootId))
  .collect();
// Then recursively fetch children...
```

### Pattern 3: Audit Trail
```typescript
// Log what happened
await ctx.db.insert("events", {
  groupId: args.groupId,
  type: "entity_created",
  actorId: userId,
  targetId: entityId,
  timestamp: Date.now(),
  metadata: { entityType: "article", title: "..." }
});
```

### Pattern 4: Graph Traversal
```typescript
// Find all followers
const following = await ctx.db
  .query("connections")
  .withIndex("from_entity", (q) => q.eq("fromEntityId", userId))
  .collect();
// Filter by relationshipType === "following"
const followers = following.filter(c => c.relationshipType === "following");
```

---

## Performance Considerations

### Index Strategy

1. **Always filter by groupId first** - 10x performance improvement
2. **Use available indexes** - See query comments for index names
3. **Limit large results** - Use `limit` parameter
4. **Denormalize when needed** - Pre-compute stats if accessed frequently
5. **Avoid N+1 queries** - Batch related queries

### Query Optimization Tips

1. Don't query without groupId unless necessary (slow)
2. Use `withIndex()` with proper field combinations
3. `.first()` for single results, `.collect()` for multiple
4. Recursive queries: always use `maxDepth`/`maxIterations`
5. Transactions: wrap mutations in `db.transaction()` if needed

---

## Adding New Features

### Step 1: Identify the Dimension
- Groups? → groups.ts
- People? → people.ts
- Things? → entities.ts
- Connections? → connections.ts
- Events? → events.ts
- Knowledge? → knowledge.ts

### Step 2: Add Queries
```typescript
export const myQuery = query({
  args: {
    groupId: v.id("groups"),  // ← Always include
    // ... other args
  },
  handler: async (ctx, args) => {
    // Implementation
  }
});
```

### Step 3: Add Mutations
```typescript
export const myMutation = mutation({
  args: {
    groupId: v.id("groups"),  // ← Always include
    // ... other args
  },
  handler: async (ctx, args) => {
    // Implementation with error handling
    // Log event if modifying data
  }
});
```

### Step 4: Add Service Layer (Optional)
```typescript
// services/myService.ts - Business logic with Effect.ts
export function myFunction(args) {
  return pipe(
    validate(args),
    Effect.flatMap(validated => wrapDatabase(...)),
    // ...
  );
}
```

### Step 5: Document
- Add JSDoc to query/mutation
- Update this index
- Add to relevant dimension README

---

## References

- **Ontology Spec**: `/one/knowledge/ontology.md`
- **Schema**: `convex/schema.ts`
- **Query Layer**: `convex/queries/README.md`
- **Mutation Layer**: `convex/mutations/README.md`
- **HTTP API**: `convex/http.ts`

---

**Built on the 6-Dimension Ontology**:
- GROUPS (partition) → PEOPLE (authorize) → THINGS (exist) → CONNECTIONS (relate) → EVENTS (record) → KNOWLEDGE (understand)
