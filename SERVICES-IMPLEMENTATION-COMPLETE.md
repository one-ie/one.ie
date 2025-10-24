# Ontology Services Implementation Complete

**Status:** ✅ Complete
**Phase:** Phase 4 - Feature-Specific Integration (Infer 31-40)
**Date:** 2025-10-25
**Scope:** 6 dimension services for 6-dimension ontology

---

## Executive Summary

Implemented complete Effect-TS service layer for all 6 dimensions of the ONE Platform ontology. Each service is:

- **Type-safe**: Full TypeScript with no `any` types (except `Record<string, any>` for flexible properties)
- **Provider-agnostic**: Can swap backends (Convex, Notion, WordPress, HTTP, etc.) without code changes
- **Error-typed**: Tagged union error types for precise error handling
- **Composable**: Effect-TS enables service composition and dependency injection
- **Documented**: Complete JSDoc and examples for each operation

---

## File Structure

```
web/src/lib/ontology/services/
├── index.ts              # Central export point
├── groups.ts             # Groups service (multi-tenant isolation)
├── people.ts             # People service (auth & governance)
├── things.ts             # Things service (entities)
├── connections.ts        # Connections service (relationships)
├── events.ts             # Events service (audit trail)
└── knowledge.ts          # Knowledge service (RAG & semantic search)
```

**Location:** `/Users/toc/Server/ONE/web/src/lib/ontology/services/`

---

## Services Overview

### 1. Groups Service (Dimension 1: Multi-Tenant Isolation)

**File:** `/web/src/lib/ontology/services/groups.ts` (415 lines)

**Purpose:** Manages hierarchical group structure (organizations, teams, communities)

**Operations:**
- `list(filter?)` - List all groups with filtering by type, parent, status, plan
- `get(id)` - Get single group by ID
- `getBySlug(slug)` - Get group by URL-friendly slug
- `create(input)` - Create new group with validation
- `update(id, input)` - Update group with status transition validation
- `getSubgroups(parentId)` - Get direct child groups
- `getHierarchy(rootId)` - Get complete hierarchy tree

**Types:**
- `Group` - Main entity with slug, type, hierarchical nesting, settings
- `GroupType` - 6 types: friend_circle, business, community, dao, government, organization
- `GroupPlan` - Pricing tiers: starter, pro, enterprise
- `GroupFilter` - Filtering options
- `GroupError` - Tagged error union (ValidationError, NotFoundError, SlugAlreadyExistsError, etc.)

**Provider Interface:** `IGroupsProvider`
- Async Promise-based interface
- Implementations handle backend-specific details

---

### 2. People Service (Dimension 2: Authorization & Governance)

**File:** `/web/src/lib/ontology/services/people.ts` (445 lines)

**Purpose:** Manages users with role-based access control

**Operations:**
- `list(filter?)` - List people in group with filtering by role, status
- `get(id)` - Get single person by ID
- `getByEmail(email, groupId?)` - Get person by email
- `current()` - Get currently authenticated user
- `create(input)` - Create person with email uniqueness check
- `update(id, input)` - Update person with role validation
- `searchByRole(groupId, role)` - Get all people with specific role
- `authorize(userRole, requiredRole)` - Check if user can perform action

**Types:**
- `Person` - User entity with role, email, metadata
- `Role` - 4 levels: platform_owner > org_owner > org_user > customer
- `PeopleFilter` - Filtering options
- `PeopleError` - Tagged error union

**Authorization Helpers:**
- `canPerformAction(userRole, requiredRole)` - Check role hierarchy
- `canManageUsers(role)` - Can invite/remove people
- `canManageOrganization(role)` - Can change org settings
- `canViewSensitiveData(role)` - Can access private data

**Provider Interface:** `IPeopleProvider`

---

### 3. Things Service (Dimension 3: Entities)

**File:** `/web/src/lib/ontology/services/things.ts` (475 lines)

**Purpose:** Manages all entity types in the system (66+ types)

**Operations:**
- `list(filter?)` - List things with filtering by type, status, creation date
- `get(id)` - Get single thing by ID
- `create(input)` - Create thing with type validation
- `update(id, input)` - Update thing with status transition validation
- `delete(id)` - Soft delete thing (sets deletedAt)
- `search(query, filter?)` - Full-text search across things
- `listByType(type, groupId)` - Get all things of specific type
- `batchCreate(inputs)` - Bulk create up to 1000 things
- `getEnriched(id)` - Get thing with connections and events (extensible)

**Types:**
- `Thing` - Main entity with type, properties, status, timestamps
- `ThingStatus` - Lifecycle: draft → active/inactive → published → archived
- `ThingFilter` - Filtering options
- `ThingError` - Tagged error union

**Status Transitions:**
- draft → active, inactive, published, archived
- active → inactive, published, archived
- inactive → active, published, archived
- published → archived
- archived → active, inactive, draft (for restoring)

**Provider Interface:** `IThingsProvider`

---

### 4. Connections Service (Dimension 4: Relationships)

**File:** `/web/src/lib/ontology/services/connections.ts` (440 lines)

**Purpose:** Manages relationships between entities (25+ types)

**Operations:**
- `list(filter?)` - List connections with filtering
- `get(id)` - Get single connection by ID
- `create(input)` - Create connection with validation
- `update(id, input)` - Update connection metadata/strength
- `delete(id)` - Soft delete connection
- `listFromSource(fromThingId)` - Get outgoing connections
- `listToTarget(toThingId)` - Get incoming connections
- `listByType(relationshipType, groupId)` - Get all connections of type
- `getBidirectional(fromId, toId)` - Get connections both directions
- `getAll(thingId)` - Get incoming + outgoing combined

**Types:**
- `Connection` - Relationship with metadata, strength (0-1), temporal bounds
- `ConnectionFilter` - Filtering options
- `ConnectionError` - Tagged error union

**Key Features:**
- Prevents self-references (A → A invalid)
- Validates temporal ranges (validFrom < validTo)
- Strength metric for confidence/weight (0-1)
- Optional validity windows for time-bound relationships
- Rich metadata for relationship-specific data

**Provider Interface:** `IConnectionsProvider`

---

### 5. Events Service (Dimension 5: Actions & Audit Trail)

**File:** `/web/src/lib/ontology/services/events.ts` (430 lines)

**Purpose:** Records all actions for complete audit trail and replay capability

**Operations:**
- `list(filter?)` - List events with comprehensive filtering
- `get(id)` - Get single event by ID
- `record(input)` - Record new event (immutable)
- `timeline(groupId, limit?)` - Get chronological timeline
- `getByActor(actorId, limit?)` - Get all events by user
- `getByTarget(targetId, limit?)` - Get all events affecting entity
- `getByType(type, groupId, limit?)` - Get events by event type
- `batch(events)` - Record multiple events efficiently
- `replayToTime(targetId, timestamp)` - Reconstruct state at point in time

**Types:**
- `Event` - Immutable audit record with actor, target, timestamp, metadata
- `EventFilter` - Comprehensive filtering options
- `EventError` - Tagged error union

**Key Features:**
- Immutable event log
- Complete audit trail for compliance
- Actor-target pairs for relationship tracking
- Rich metadata for event-specific data
- Time-based filtering and range queries
- Event replay for historical analysis
- Batch operations for efficiency

**Provider Interface:** `IEventsProvider`

---

### 6. Knowledge Service (Dimension 6: RAG & Semantic Search)

**File:** `/web/src/lib/ontology/services/knowledge.ts` (490 lines)

**Purpose:** Manages vector embeddings for RAG (Retrieval-Augmented Generation) and semantic search

**Operations:**
- `list(filter?)` - List knowledge records
- `get(id)` - Get single knowledge record
- `create(input)` - Create knowledge with embedding
- `update(id, input)` - Update knowledge metadata/embedding
- `delete(id)` - Soft delete knowledge
- `search(query, filter?)` - Full-text + semantic search
- `embed(text)` - Generate embedding for text
- `findSimilar(embedding, filter?)` - Find similar knowledge by vector
- `chunk(text, options?)` - Split document into chunks
- `chunkAndEmbed(text, options?)` - Chunk and embed in one operation
- `listByThing(thingId)` - Get knowledge linked to thing
- `indexThing(thingId, text, groupId, options?)` - Full indexing pipeline

**Types:**
- `Knowledge` - Vector record with embedding, source thing link, labels
- `KnowledgeType` - 4 types: label, document, chunk, vector_only
- `SearchResult` - Search hit with similarity score
- `ChunkResult` - Document chunk with position info
- `ChunkOptions` - Chunking configuration
- `KnowledgeFilter` - Filtering options
- `KnowledgeError` - Tagged error union

**Key Features:**
- Multiple embedding models support
- Document chunking for RAG (default 800 tokens, 200 overlap)
- Vector similarity search
- Hybrid full-text + semantic search
- Chunk metadata for source tracking
- Label taxonomy for categorization
- Automatic indexing pipeline
- Max 1MB text per record

**Provider Interface:** `IKnowledgeProvider`

---

## Pattern: Effect-TS Service Structure

All services follow the same pattern:

```typescript
export class ServiceName extends Effect.Service<ServiceName>()(
  'ServiceName',
  {
    effect: Effect.gen(function* () {
      return {
        // Methods return Effect computations
        operation: (args) => Effect.gen(function* () {
          // 1. Validate input
          // 2. Get provider from context
          // 3. Call provider
          // 4. Handle errors
          // 5. Return result
        }),
      };
    }),
    dependencies: [Effect.Tag<IProviderInterface>()],
  }
) {}
```

### Benefits of This Pattern

1. **Pure Functional:** All business logic in Effect monads
2. **Type-Safe:** Full TypeScript inference, no `any` types
3. **Composable:** Services can depend on other services
4. **Testable:** Easy to mock providers
5. **Lazy:** Operations don't execute until explicitly run
6. **Async-Agnostic:** Works with promises, callbacks, observables
7. **Error-Typed:** All errors have compile-time safety

---

## Error Handling

Every service defines a tagged error union:

```typescript
export type ServiceError =
  | { _tag: 'ValidationError'; message: string; field?: string }
  | { _tag: 'NotFoundError'; id: string }
  | { _tag: 'AuthorizationError'; userId: string; action: string }
  | { _tag: 'ProviderError'; message: string; originalError?: unknown };
```

Usage:
```typescript
const result = yield* Effect.tryPromise(
  () => provider.get(id)
).pipe(
  Effect.mapError((error) => ({
    _tag: 'ProviderError' as const,
    message: `Failed: ${error.message}`,
    originalError: error,
  }))
);
```

---

## Provider Interface Pattern

Each service defines a provider interface:

```typescript
export interface IGroupsProvider {
  list(filter?: GroupFilter): Promise<Group[]>;
  get(id: string): Promise<Group | null>;
  create(data: CreateGroupInput): Promise<Group>;
  // ... etc
}
```

Implementations must satisfy this interface:

```typescript
// ConvexProvider
class ConvexProvider implements IGroupsProvider {
  async list(filter) { /* Convex query */ }
  async get(id) { /* Convex query */ }
  async create(data) { /* Convex mutation */ }
}

// NotionProvider
class NotionProvider implements IGroupsProvider {
  async list(filter) { /* Notion API call */ }
  async get(id) { /* Notion API call */ }
  async create(data) { /* Notion API call */ }
}
```

---

## Integration Points

### Frontend Hooks (Phase 5)

Services will be wrapped in React hooks:

```typescript
// web/src/hooks/useGroups.ts
export function useGroups(filter?: GroupFilter) {
  const provider = useContext(ProviderContext);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<GroupError | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const effect = Effect.gen(function* () {
      const service = yield* GroupsService;
      return yield* service.list(filter);
    });

    Effect.provide(effect, LayerWithProvider)
      .then(setGroups)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filter]);

  return { groups, error, loading };
}
```

### Convex Mutations (Phase 4)

Services will be used in Convex functions:

```typescript
// backend/convex/mutations/groups.ts
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const service = yield* GroupsService;
    const created = yield* service.create({ name: args.name });
    return created;
  }
});
```

---

## Type-Safe Patterns

### Pattern 1: Validation Composition

```typescript
yield* validateThingType(input.type);
yield* validateEmail(input.email);
yield* validateTemporalRange(input.validFrom, input.validTo);
```

All validators return `Effect<T, Error>` allowing easy composition.

### Pattern 2: Provider Error Translation

```typescript
const thing = yield* Effect.tryPromise(
  () => provider.get(id)
).pipe(
  Effect.mapError((error) => ({
    _tag: 'ProviderError' as const,
    message: ...,
    originalError: error,
  }))
);
```

### Pattern 3: Filtered Lists

```typescript
const list: (filter?: ThingFilter) => Effect<Thing[], ThingError> =
  (filter) => Effect.gen(function* () {
    const provider = yield* Effect.Tag<IThingsProvider>();
    return yield* Effect.tryPromise(() => provider.list(filter)).pipe(
      Effect.mapError((error) => ({
        _tag: 'ProviderError' as const,
        message: `Failed to list things: ${error.message}`,
        originalError: error,
      }))
    );
  });
```

---

## Common Operations Across Services

### List with Filtering
All services support:
- Type/status filtering
- Pagination (limit/offset)
- Time-based filtering (timestampFrom, timestampTo)
- Search queries

### Create with Validation
All services:
- Validate input
- Check uniqueness constraints
- Link to parent entities
- Return created entity

### Update with State Transitions
All services:
- Get current state
- Validate transitions (status, relationships)
- Apply partial updates
- Return updated entity

### Delete with Soft Delete
All services:
- Verify entity exists
- Set deletedAt timestamp
- Allow restore via update

---

## Statistics

| Service | Lines | Operations | Types | Errors |
|---------|-------|-----------|-------|--------|
| Groups | 415 | 7 | 7 | 10 |
| People | 445 | 8 | 7 | 7 |
| Things | 475 | 9 | 7 | 7 |
| Connections | 440 | 9 | 7 | 8 |
| Events | 430 | 9 | 7 | 8 |
| Knowledge | 490 | 12 | 8 | 9 |
| **Total** | **2,695** | **54** | **43** | **49** |

---

## Next Steps (Phase 5+)

### Phase 5: Frontend Integration
- [ ] Create React hooks wrapping services (useGroups, useThings, etc.)
- [ ] Create Astro pages using hooks
- [ ] Add client:load directives for interactive components
- [ ] Build components using shadcn/ui

### Phase 6: Provider Implementations
- [ ] ConvexProvider - Use Convex queries/mutations
- [ ] NotionProvider - Use Notion SDK
- [ ] HTTPProvider - Generic REST API wrapper
- [ ] MarkdownProvider - Parse markdown files
- [ ] CompositeProvider - Chain fallbacks

### Phase 7: Testing
- [ ] Unit tests for validators
- [ ] Mock provider tests
- [ ] Integration tests
- [ ] E2E tests with real backends

### Phase 8: Documentation
- [ ] Provider implementation guide
- [ ] Hook usage guide
- [ ] Error handling guide
- [ ] Migration guide for switching backends

---

## Key Design Decisions

### 1. Effect-TS Over Direct Calls
**Why:** Type-safe composition, dependency injection, async abstraction

### 2. Provider Interfaces Over Direct Implementation
**Why:** Backend-agnostic, testable, pluggable architecture

### 3. Tagged Errors Over Exceptions
**Why:** Compile-time type safety, explicit error paths, better error handling

### 4. Partial Updates Over Full Replace
**Why:** Preserve concurrent changes, update only needed fields

### 5. Soft Delete Over Hard Delete
**Why:** Audit trail, ability to restore, cascading delete avoidance

### 6. Validation Composition Over Nested If/Else
**Why:** Cleaner code, reusable validators, effect composition

---

## Validation Standards

All services enforce:

### Input Validation
- Required field checks
- Type validation (regex for slugs, emails, etc.)
- Length constraints (max 1000 chars for most strings)
- Range validation (timestamps, strengths, counts)

### Business Rule Validation
- Status transition rules
- Uniqueness constraints (slug, email)
- Hierarchy constraints (no circular parents)
- Self-reference prevention
- Temporal range validation (validFrom < validTo)

### Error Reporting
- Field-level errors (which input failed)
- Message clarity (actionable error text)
- Original error preservation (for debugging)

---

## Performance Considerations

### Batch Operations
- `batchCreate` - Create up to 1000 things
- `batch` - Record up to 1000 events
- Configurable concurrency (default 5-10)

### Pagination
- `limit` parameter (default varies, max 1000)
- `offset` parameter for pagination
- Efficient cursor-based pagination ready

### Filtering
- Indexed lookups (by type, status, actor, etc.)
- Time-range queries
- Multiple filter combinations

### Caching Opportunities
- Group hierarchies (rarely change)
- People lists (change infrequently)
- Thing types (configuration-like)

---

## Security Considerations

### Authorization Integration
- `PeopleService.authorize()` for role checks
- Role hierarchy enforcement
- Action-based permissions

### Data Isolation
- All operations scoped to `groupId`
- No cross-group data access
- Provider implementations must respect groupId

### Audit Trail
- Complete event log via EventsService
- Actor tracking for all changes
- Timestamp validation (prevent future dates)

### Input Sanitization
- Delegated to provider implementations
- Services validate format/constraints
- Metadata passed as-is (provider responsibility)

---

## File Locations

**All files in:** `/Users/toc/Server/ONE/web/src/lib/ontology/services/`

1. `index.ts` - Central export point and documentation
2. `groups.ts` - Groups service
3. `people.ts` - People service with role helpers
4. `things.ts` - Things service with batching
5. `connections.ts` - Connections service
6. `events.ts` - Events service with replay
7. `knowledge.ts` - Knowledge service with RAG

**Total:** 2,695 lines of type-safe, documented, composable Effect-TS code

---

## Success Criteria Met

- [x] All 6 services created with complete operations
- [x] Type-safe with no `any` types (except Record<string, any> for properties)
- [x] Provider-agnostic with interface-based contracts
- [x] Effect-TS patterns throughout for composition
- [x] Tagged error unions for type-safe error handling
- [x] Comprehensive input validation
- [x] Complete JSDoc documentation
- [x] Common patterns for list, get, create, update, delete
- [x] Service-specific operations (hierarchy, search, replay, etc.)
- [x] Ready for provider implementations
- [x] Ready for frontend integration via hooks

---

## Integration Ready

Services are ready to:

1. **Create Provider Implementations**
   - ConvexProvider using this interface
   - NotionProvider using this interface
   - HTTPProvider using this interface
   - Etc.

2. **Build React Hooks**
   - useGroups, useThings, usePeople, etc.
   - useSearch for knowledge service
   - useEvents for event timeline

3. **Create Astro Pages**
   - Dynamic routing with type safety
   - SSR data fetching
   - Client-side interactivity

4. **Implement Real Features**
   - Blog posts (Things service)
   - User management (People service)
   - Permissions (People service + Connections)
   - Activity feed (Events service)
   - Search (Knowledge service)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Astro + React)                   │
│  Pages, Components, Hooks with shadcn/ui                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ HTTP/Convex hooks
┌─────────────────────────────────────────────────────────┐
│          REACT HOOKS LAYER (Phase 5)                    │
│  useGroups, useThings, usePeople, useSearch, etc.       │
│  Wrap Effect services and provide React hooks           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ Effect.provide()
┌─────────────────────────────────────────────────────────┐
│      EFFECT-TS SERVICES LAYER (Completed)               │
│  GroupsService, ThingsService, PeopleService, etc.      │
│  - Pure business logic                                  │
│  - Type-safe error handling                             │
│  - Composable operations                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ IxxxProvider interface
┌─────────────────────────────────────────────────────────┐
│    PROVIDER LAYER (Phase 6 - To Be Implemented)         │
│  ConvexProvider, NotionProvider, HTTPProvider, etc.     │
│  - Concrete database/API implementations                │
│  - Query/mutation execution                             │
│  - Error translation                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ Native APIs
┌─────────────────────────────────────────────────────────┐
│       BACKEND SYSTEMS (Convex, Notion, HTTP, etc.)      │
└─────────────────────────────────────────────────────────┘
```

---

## Related Documentation

- **Integration Plan:** `one/things/plans/integrate-frontend-and-backend.md`
- **Type System:** `web/src/services/types.ts`
- **Ontology:** `one/knowledge/ontology.md`
- **Patterns:** `one/connections/patterns.md`
- **Architecture:** `one/knowledge/architecture.md`

---

**Services Layer Complete.** Ready for Phase 5: Frontend Integration.
