# Phase 3: Astro Integration - Next Steps

**Status:** Ready to Start
**Estimated Scope:** Infer 21-30
**Prerequisites:** Phase 1-2 Foundation (COMPLETE)

---

## What You'll Build in Phase 3

After Phase 1-2 (Effect-TS foundation), Phase 3 connects the ontology to Astro:

### 1. React Hook Layer (Frontend State Management)

**File:** `/web/src/hooks/useOntology.ts`

```typescript
// Core hook that uses the provider
export function useOntology() {
  const [provider, setProvider] = useState<IOntologyProvider | null>(null);

  useEffect(() => {
    getProvider().then(setProvider);
  }, []);

  return provider;
}

// Dimension-specific hooks
export function useGroups(filter?: GroupFilter) {
  const provider = useOntology();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (provider) {
      provider.groups.list(filter).then(setGroups);
    }
  }, [provider, filter]);

  return groups;
}

export function useThings(filter?: ThingFilter) { /* ... */ }
export function useConnections(filter?: ConnectionFilter) { /* ... */ }
export function useEvents(filter?: EventFilter) { /* ... */ }
export function useSearch(query: string) { /* ... */ }
```

### 2. React Components

**File:** `/web/src/components/ontology/GroupList.tsx`

```typescript
import { useGroups } from '@/hooks/useOntology';
import { Card } from '@/components/ui/card';

export function GroupList() {
  const groups = useGroups({ limit: 10 });

  return (
    <div>
      {groups.map(group => (
        <Card key={group._id}>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
        </Card>
      ))}
    </div>
  );
}
```

### 3. Astro SSR Integration

**File:** `/web/src/pages/groups/index.astro`

```astro
---
import { getProvider } from '@/lib/ontology/factory';
import GroupList from '@/components/ontology/GroupList';

const provider = await getProvider();
const groups = await provider.groups.list({ limit: 10 });
---

<Layout>
  <h1>Groups</h1>
  <GroupList client:load />
</Layout>
```

### 4. Dynamic Routes

**File:** `/web/src/pages/groups/[slug].astro`

```astro
---
import { getProvider } from '@/lib/ontology/factory';

const provider = await getProvider();
const group = await provider.groups.get(Astro.params.slug);

if (!group) return Astro.redirect('/404');
---

<Layout>
  <h1>{group.name}</h1>
  <!-- Render group details -->
</Layout>
```

**File:** `/web/src/pages/[group]/things/[id].astro`

```astro
---
import { getProvider } from '@/lib/ontology/factory';

const provider = await getProvider();
const thing = await provider.things.get(Astro.params.id);

if (!thing) return Astro.redirect('/404');
---

<Layout>
  <h1>{thing.name}</h1>
  <!-- Render thing details with connections -->
</Layout>
```

### 5. API Routes

**File:** `/web/src/pages/api/things/[id].ts`

```typescript
import type { APIRoute } from 'astro';
import { getProvider } from '@/lib/ontology/factory';

export const GET: APIRoute = async ({ params }) => {
  const provider = await getProvider();
  const thing = await provider.things.get(params.id);

  return new Response(JSON.stringify(thing), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const provider = await getProvider();
  const data = await request.json();
  const thing = await provider.things.update(params.id, data);

  return new Response(JSON.stringify(thing), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

---

## Implementation Order

### Iteration 1: Core Hooks (Infer 21-22)

Priority: HIGH - Foundation for all other work

```typescript
// /web/src/hooks/useOntology.ts
- useOntology() - Access provider instance
- useGroups(filter) - Get groups
- useThings(filter) - Get things
- useConnections(filter) - Get connections
- useEvents(filter) - Get events
- useSearch(query) - Search knowledge

// /web/src/hooks/useEntity.ts
- useGroup(id) - Get single group
- useThing(id) - Get single thing
- usePerson(id) - Get single person
- useConnection(id) - Get single connection
```

### Iteration 2: Basic Components (Infer 23-24)

Priority: HIGH - Used by pages

```typescript
// /web/src/components/ontology/GroupCard.tsx
- Display group info
- Show metadata
- Link to subgroups

// /web/src/components/ontology/ThingCard.tsx
- Display entity info
- Show properties
- List connections

// /web/src/components/ontology/ConnectionList.tsx
- Show relationships
- Filter by type
- Display metadata

// /web/src/components/ontology/EventTimeline.tsx
- Show event history
- Timeline view
- Actor/target information
```

### Iteration 3: Astro Pages (Infer 25-26)

Priority: MEDIUM - User-facing pages

```
/web/src/pages/
├── groups/
│   ├── index.astro - List all groups
│   └── [slug].astro - Single group
├── things/
│   ├── index.astro - List things by type
│   └── [id].astro - Single thing
├── people/
│   ├── index.astro - List people
│   └── [id].astro - Single person profile
└── search.astro - Knowledge search
```

### Iteration 4: API Routes (Infer 27-28)

Priority: MEDIUM - Backend for mutations

```
/web/src/pages/api/
├── groups/[id].ts - CRUD groups
├── things/[id].ts - CRUD things
├── people/[id].ts - CRUD people
├── connections/[id].ts - CRUD connections
├── events/[id].ts - Record events
└── knowledge/search.ts - Search knowledge
```

### Iteration 5: Integration & Polish (Infer 29-30)

Priority: MEDIUM - Refinement

- Error handling UI
- Loading states
- Pagination components
- Search UI components
- Feature flag-based UI rendering

---

## Concrete Example: Thing CRUD

This example shows the full flow for reading and updating a "Thing":

### 1. Hook Layer

```typescript
// /web/src/hooks/useThings.ts
import { useState, useEffect } from 'react';
import { getProvider } from '@/lib/ontology/factory';
import type { Thing, ThingFilter } from '@/lib/ontology/types';

export function useThings(filter?: ThingFilter) {
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const provider = await getProvider();
        const result = await provider.things.list(filter);
        setThings(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    })();
  }, [filter?.groupId, filter?.type]);

  return { things, loading, error };
}

export function useThing(id: string) {
  const [thing, setThing] = useState<Thing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const provider = await getProvider();
        const result = await provider.things.get(id);
        setThing(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const update = async (data: Partial<Thing>) => {
    try {
      const provider = await getProvider();
      const result = await provider.things.update(id, data);
      setThing(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  return { thing, loading, error, update };
}
```

### 2. Component Layer

```typescript
// /web/src/components/ontology/ThingCard.tsx
import { useThing } from '@/hooks/useThings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ThingCardProps {
  id: string;
  onUpdate?: (thing: any) => void;
}

export function ThingCard({ id, onUpdate }: ThingCardProps) {
  const { thing, loading, error, update } = useThing(id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!thing) return <div>Not found</div>;

  const handleStatusChange = async (newStatus: string) => {
    const updated = await update({ status: newStatus });
    onUpdate?.(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{thing.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{thing.description}</p>
        <div className="mt-4">
          <span className="text-sm text-gray-500">Type: {thing.type}</span>
          <span className="text-sm text-gray-500">Status: {thing.status}</span>
        </div>
        <div className="mt-4 space-x-2">
          <Button onClick={() => handleStatusChange('published')}>Publish</Button>
          <Button onClick={() => handleStatusChange('archived')}>Archive</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Astro Page

```astro
---
// /web/src/pages/things/[id].astro
import { getProvider } from '@/lib/ontology/factory';
import ThingCard from '@/components/ontology/ThingCard';
import Layout from '@/layouts/Layout.astro';

const id = Astro.params.id;
const provider = await getProvider();
const thing = await provider.things.get(id);

if (!thing) {
  return Astro.redirect('/404');
}
---

<Layout title={thing.name}>
  <div class="container py-8">
    <h1>{thing.name}</h1>
    <ThingCard client:load id={id} />
  </div>
</Layout>
```

### 4. API Route

```typescript
// /web/src/pages/api/things/[id].ts
import type { APIRoute } from 'astro';
import { getProvider } from '@/lib/ontology/factory';
import { isFeatureAvailable } from '@/lib/ontology/factory';

export const GET: APIRoute = async ({ params }) => {
  try {
    const provider = await getProvider();
    const thing = await provider.things.get(params.id);

    if (!thing) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(JSON.stringify(thing), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  if (!isFeatureAvailable('groups')) {
    return new Response('Feature not available', { status: 403 });
  }

  try {
    const data = await request.json();
    const provider = await getProvider();
    const updated = await provider.things.update(params.id, data);

    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

---

## Critical Decisions Made

### 1. Hooks Are Thin Wrappers

- Hooks don't implement business logic
- They simply call provider methods
- Business logic lives in Effect.ts services
- Hooks handle React state management only

### 2. Astro SSR Enabled

- Pages fetch data server-side
- Reduced JavaScript on client
- Better SEO and performance
- Static generation where possible

### 3. Feature Flags in UI

- `isFeatureAvailable('auth')` controls what UI shows
- Different UI for different backends
- No breaking changes when switching providers

### 4. Error Handling Strategy

- Type-safe errors from provider
- Match on `_tag` field
- Display user-friendly messages
- Log detailed errors for debugging

---

## Testing Strategy for Phase 3

### Unit Tests

```typescript
// test/unit/hooks/useThings.test.ts
describe('useThings hook', () => {
  it('should fetch things from provider', async () => {
    const mockProvider = createMockProvider();
    setGlobalProvider(mockProvider);

    const { result } = renderHook(() => useThings());

    expect(result.current.loading).toBe(false);
    expect(result.current.things.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// test/integration/pages/things.test.ts
describe('Things Page', () => {
  it('should render thing details', async () => {
    const response = await fetch('/api/things/123');
    const thing = await response.json();

    expect(thing.name).toBeDefined();
    expect(thing.type).toBeDefined();
  });
});
```

### E2E Tests

```typescript
// test/e2e/thing-crud.test.ts
describe('Thing CRUD Flow', () => {
  it('should create, read, update thing', async () => {
    // 1. Create thing via API
    const createRes = await fetch('/api/things', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Thing' }),
    });
    const thing = await createRes.json();

    // 2. Read thing
    const readRes = await fetch(`/api/things/${thing.id}`);
    const retrieved = await readRes.json();

    // 3. Update thing
    const updateRes = await fetch(`/api/things/${thing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'published' }),
    });
    const updated = await updateRes.json();

    expect(updated.status).toBe('published');
  });
});
```

---

## Files to Create in Phase 3

### Hooks (6 files)
1. `/web/src/hooks/useOntology.ts` - Core provider access
2. `/web/src/hooks/useGroups.ts` - Group hooks
3. `/web/src/hooks/useThings.ts` - Thing hooks
4. `/web/src/hooks/usePeople.ts` - Person hooks
5. `/web/src/hooks/useConnections.ts` - Connection hooks
6. `/web/src/hooks/useEvents.ts` - Event hooks
7. `/web/src/hooks/useSearch.ts` - Knowledge search

### Components (8 files)
1. `/web/src/components/ontology/GroupCard.tsx`
2. `/web/src/components/ontology/GroupList.tsx`
3. `/web/src/components/ontology/ThingCard.tsx`
4. `/web/src/components/ontology/ThingList.tsx`
5. `/web/src/components/ontology/ConnectionList.tsx`
6. `/web/src/components/ontology/EventTimeline.tsx`
7. `/web/src/components/ontology/SearchResults.tsx`
8. `/web/src/components/ontology/LoadingState.tsx`

### Pages (8 files)
1. `/web/src/pages/groups/index.astro`
2. `/web/src/pages/groups/[slug].astro`
3. `/web/src/pages/things/index.astro`
4. `/web/src/pages/things/[id].astro`
5. `/web/src/pages/people/index.astro`
6. `/web/src/pages/people/[id].astro`
7. `/web/src/pages/search.astro`
8. `/web/src/pages/dashboard.astro`

### API Routes (6 files)
1. `/web/src/pages/api/groups/[id].ts`
2. `/web/src/pages/api/things/[id].ts`
3. `/web/src/pages/api/people/[id].ts`
4. `/web/src/pages/api/connections/[id].ts`
5. `/web/src/pages/api/events/record.ts`
6. `/web/src/pages/api/knowledge/search.ts`

### Tests (12 files)
- Unit tests for each hook
- Integration tests for components
- E2E tests for full flows

---

## Success Criteria for Phase 3

- [ ] All 7 hooks implemented and tested
- [ ] All 8 components rendered correctly
- [ ] All 8 pages work with SSR
- [ ] All 6 API routes functional
- [ ] Feature flags control UI correctly
- [ ] Error handling working
- [ ] Loading states displayed
- [ ] Can switch backends without page changes
- [ ] Performance: <1s Lighthouse score
- [ ] TypeScript: 0 errors

---

## Getting Started Immediately

### Right Now: Create Hook Skeleton

```bash
# Create hooks directory
mkdir -p /Users/toc/Server/ONE/web/src/hooks

# Create useOntology.ts
touch /Users/toc/Server/ONE/web/src/hooks/useOntology.ts

# Create useThings.ts as example
touch /Users/toc/Server/ONE/web/src/hooks/useThings.ts
```

### Then: Implement useThings Hook (Reference Above)

### Then: Create ThingCard Component

### Then: Create Thing Pages

### Then: Create API Routes

### Finally: Test Everything

---

## Questions This Phase Answers

1. **How do Astro pages fetch from ontology?** - SSR data fetching via getProvider()
2. **How do React components access provider?** - useOntology() hook
3. **How do we show different UI for different backends?** - isFeatureAvailable()
4. **How do we handle errors in UI?** - Type-safe error matching
5. **How do we support dynamic routing?** - Astro dynamic routes with provider queries
6. **How do we create/update entities?** - API routes + React components
7. **How do we manage loading/error states?** - React hooks with useState/useEffect
8. **How do we test this?** - Mock provider + unit/integration/e2e tests

---

**Ready to start? Create the hooks directory and implement useOntology() first.**
