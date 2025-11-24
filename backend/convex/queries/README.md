# Query Layer - 6-Dimension Ontology

All read operations organized by dimension, following the ONE Platform ontology.

## Structure

Queries are organized into **6 dimensions** that model reality:

```
1. GROUPS      (groups.ts)      - Multi-tenant isolation & hierarchical nesting
2. PEOPLE      (people.ts)      - Authorization & governance
3. THINGS      (entities.ts)    - 66+ entity types (users, agents, content, etc)
4. CONNECTIONS (connections.ts) - 25+ relationship types (owns, follows, etc)
5. EVENTS      (events.ts)      - 67+ event types (purchased, created, viewed, etc)
6. KNOWLEDGE   (knowledge.ts)   - Vectors, embeddings, RAG & semantic search
```

## Quick Reference

### Dimension 1: GROUPS (12 queries)
- **getBySlug** - URL-based routing
- **getById** - Direct ID lookup
- **list** - Filter by type/status
- **getSubgroups** - Direct children only
- **getHierarchy** - All descendants recursive
- **getGroupPath** - Breadcrumb trail to root
- **isDescendantOf** - Permission check
- **getEntitiesInHierarchy** - All entities in group tree
- **getConnectionsInHierarchy** - All connections in group tree
- **getEventsInHierarchy** - All events in group tree
- **getStats** - Entity/connection/event/knowledge counts
- **search** - Full-text search by name/slug

### Dimension 2: PEOPLE (4 queries)
- **list** - List people in group
- **getById** - Get person by ID
- **getRole** - Get person's role
- **listByRole** - List people with specific role

### Dimension 3: THINGS (9 queries)
- **list** - Filter by type/status/limit
- **getById** - Get entity by ID
- **listByType** - Filter by entity type
- **listByStatus** - Filter by status
- **getProperties** - Get properties object
- **search** - Search entities by name
- **listRecent** - Most recently created
- **getStats** - Count by type/status
- **getRelated** - Entities connected to this one

### Dimension 4: CONNECTIONS (4 queries)
- **listFrom** - Outgoing relationships
- **listTo** - Incoming relationships
- **listBetween** - Relationships between two entities
- **listByType** - Filter by relationship type

### Dimension 5: EVENTS (7 queries)
- **list** - All events in group
- **byActor** - Events created by person
- **byTarget** - Events affecting entity
- **byTimeRange** - Time-based filtering
- **stats** - Event counts by type
- **recent** - Most recent events
- **getById** - Get event by ID

### Dimension 6: KNOWLEDGE (8 queries)
- **list** - All knowledge items
- **search** - Semantic search by embedding
- **bySourceThing** - Knowledge from specific entity
- **byThing** - Knowledge linked to entity
- **byLabel** - Filter by label
- **listLabels** - Available labels
- **stats** - Knowledge counts
- **getById** - Get knowledge by ID

## Implementation Notes

1. **Multi-tenancy**: All queries filter by `groupId` for isolation
2. **Indexes**: Use `withIndex()` for efficient filtering
3. **Recursion**: Hierarchy queries use bounded loops (maxDepth/maxIterations)
4. **Performance**: Return paginated results for large datasets
5. **Authorization**: Future: Add user permission checks

## Adding New Queries

1. Add to appropriate dimension file (groups, people, entities, connections, events, knowledge)
2. Add JSDoc comment explaining purpose
3. Include args validation with `v.string()`, `v.id()`, etc
4. Use indexes for filtering when available
5. Return early on missing data
6. Document performance characteristics

## Cross-Dimension Patterns

- **getEntitiesInHierarchy** (groups) → returns things in group tree
- **getConnectionsInHierarchy** (groups) → returns connections in group tree
- **getEventsInHierarchy** (groups) → returns events in group tree
- **listFrom/listTo** (connections) → references things by entity ID
- **byActor/byTarget** (events) → references people/things by ID
- **bySourceThing/byThing** (knowledge) → references things by entity ID

