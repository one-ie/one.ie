---
title: Frontend Architecture
description: Building the rendering layer - backend-agnostic, type-safe, composable
order: 3
---

# ONE Frontend Architecture

**Building the Rendering Layer - Backend-Agnostic, Type-Safe, Composable**

**Version:** 3.0.0 (Aligned with 6-Dimension Ontology)

---

## Executive Summary

The ONE frontend is **purely a rendering and interaction layer** with zero business logic. It:

1. **Renders UI** from data provided by backends
2. **Calls backend APIs** via abstract DataProvider interface
3. **Manages UI state** (loading, errors, forms)
4. **Displays real-time updates** via subscriptions

```
┌────────────────────────────────────────────────────────┐
│              FRONTEND (Astro + React)                  │
│  ✅ Renders HTML/React components                      │
│  ✅ Calls DataProvider interface                       │
│  ✅ Manages UI state only                              │
│  ✅ Backend-agnostic by design                         │
│  ❌ NO database access                                 │
│  ❌ NO business logic                                  │
│  ❌ NO data validation                                 │
└──────────────────────┬─────────────────────────────────┘
                       │ DataProvider Interface
                       │ (Universal 6-Dimension API)
                       ↓
┌────────────────────────────────────────────────────────┐
│         BACKEND PROVIDERS (Pluggable)                  │
│                                                        │
│  ConvexProvider      → Convex real-time backend       │
│  WordPressProvider   → WordPress CMS                  │
│  NotionProvider      → Notion databases               │
│  SupabaseProvider    → Supabase PostgreSQL            │
│  CustomProvider      → Your own API                   │
│                                                        │
│  Change backend with ONE line in config               │
└────────────────────────────────────────────────────────┘
```

**Tech Stack:**
- **Astro 5.14+** - SSR/SSG (pages, layouts)
- **React 19** - Interactive components (islands) with `react-dom/server.edge` for Cloudflare
- **Effect.ts** - Type-safe, composable operations
- **DataProvider Pattern** - Backend-agnostic interface
- **Tailwind CSS v4** - CSS-based configuration (no JS config)
- **shadcn/ui** - 50+ pre-installed accessible components
- **Better Auth** - Multi-method authentication
- **TypeScript 5.9+** - End-to-end type safety (strict mode)

---

## What Frontend IS and IS NOT

### ✅ Frontend IS Responsible For:

**1. Rendering UI**
```tsx
<h1>{course.name}</h1>
<p>{course.properties.description}</p>
```

**2. Calling Backend APIs**
```tsx
const program = Effect.gen(function* () {
  const provider = yield* DataProvider
  return yield* provider.things.list({ type: 'course' })
})
```

**3. Managing UI State**
```tsx
const { run, loading, error } = useEffectRunner()
```

**4. User Interactions**
```tsx
<button onClick={handleClick}>Create Course</button>
```

### ❌ Frontend IS NOT Responsible For:

**1. Database Operations**
```tsx
// ❌ NEVER do this in frontend
const courses = await db.query('things').filter(...).collect()
```

**2. Business Logic**
```tsx
// ❌ NEVER do this in frontend
if (user.tokens < course.price) {
  // Backend handles pricing, quotas, calculations
}
```

**3. Data Validation**
```tsx
// ❌ Frontend validation is UX-only
// Backend MUST validate for security
```

**4. Authorization**
```tsx
// ❌ Frontend can hide UI elements
// Backend MUST authorize all operations
```

---

## Backend-Agnostic Architecture

**Inspired by Astro's Content Layer Pattern**

Frontend components never know which backend they're talking to. Change backends by editing ONE line:

```typescript
// astro.config.ts
import { defineConfig } from 'astro/config'
import { one } from '@one/astro-integration'

// Import providers
import { convexProvider } from './src/providers/convex'
import { wordpressProvider } from './src/providers/wordpress'

export default defineConfig({
  integrations: [
    react(),
    one({
      // ✅ Change this ONE line to swap backends
      provider: convexProvider({
        url: import.meta.env.PUBLIC_CONVEX_URL
      })

      // Or use WordPress:
      // provider: wordpressProvider({
      //   url: 'https://yoursite.com',
      //   apiKey: import.meta.env.WORDPRESS_API_KEY
      // })
    })
  ]
})
```

**Key Principle:** Frontend code stays the same. Only data source changes.

---

## DataProvider Interface

**The universal 6-dimension ontology API.**

Every backend provider must implement this interface:

```typescript
// frontend/src/providers/DataProvider.ts
import { Effect, Context } from 'effect'

// Error types (universal across all providers)
export class ThingNotFoundError {
  readonly _tag = 'ThingNotFoundError'
  constructor(readonly thingId: string) {}
}

export class ConnectionCreateError {
  readonly _tag = 'ConnectionCreateError'
  constructor(readonly reason: string) {}
}

// DataProvider interface - all backends implement this
export interface DataProvider {
  // Dimension 1: Groups (Multi-tenant containers with hierarchical nesting)
  groups: {
    get: (id: string) => Effect.Effect<Group, GroupNotFoundError>
    list: (params?: {
      type?: 'friend_circle' | 'business' | 'community' | 'dao' | 'government' | 'organization'
      parentGroupId?: string
      status?: string
    }) => Effect.Effect<Group[], Error>
    create: (input: {
      name: string
      type: 'friend_circle' | 'business' | 'community' | 'dao' | 'government' | 'organization'
      parentGroupId?: string
      properties?: Record<string, any>
    }) => Effect.Effect<string, Error>
  }

  // Dimension 2: People (Authorization & governance)
  people: {
    get: (id: string) => Effect.Effect<Person, PersonNotFoundError>
    list: (params: {
      groupId?: string
      role?: 'platform_owner' | 'org_owner' | 'org_user' | 'customer'
    }) => Effect.Effect<Person[], Error>
  }

  // Dimension 3: Things (All entities - 66+ types)
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>
    list: (params: {
      type: ThingType
      groupId?: string
      filters?: Record<string, any>
    }) => Effect.Effect<Thing[], Error>
    create: (input: {
      type: ThingType
      name: string
      groupId: string
      properties: Record<string, any>
    }) => Effect.Effect<string, Error>
  }

  // Dimension 4: Connections (All relationships - 25+ types)
  connections: {
    create: (input: {
      fromThingId?: string
      toThingId?: string
      fromPersonId?: string
      toPersonId?: string
      relationshipType: ConnectionType
      groupId: string
      metadata?: Record<string, any>
    }) => Effect.Effect<string, ConnectionCreateError>
    getRelated: (params: {
      thingId: string
      relationshipType: ConnectionType
      direction: 'from' | 'to' | 'both'
    }) => Effect.Effect<Thing[], Error>
  }

  // Dimension 5: Events (Complete audit trail - 67+ types)
  events: {
    log: (event: {
      type: EventType
      actorId: string
      targetId?: string
      groupId: string
      metadata?: Record<string, any>
    }) => Effect.Effect<void, Error>
    list: (params: {
      groupId?: string
      actorId?: string
      type?: EventType
      limit?: number
    }) => Effect.Effect<Event[], Error>
  }

  // Dimension 6: Knowledge (Embeddings, vectors, RAG)
  knowledge: {
    search: (params: {
      query: string
      groupId?: string
      limit?: number
    }) => Effect.Effect<KnowledgeMatch[], Error>
  }
}

export const DataProvider = Context.GenericTag<DataProvider>('DataProvider')
```

**Key Insight:** This interface IS the 6-dimension ONE ontology. Any backend that implements it can power ONE.

**Critical:** All dimensions (things, connections, events, knowledge) are scoped to `groupId`. Groups provide hierarchical multi-tenant isolation.

---

## Provider Implementations

### Convex Provider

```typescript
// frontend/src/providers/convex/ConvexProvider.ts
import { Effect, Layer } from 'effect'
import { ConvexHttpClient } from 'convex/browser'
import { DataProvider } from '../DataProvider'

export class ConvexProvider implements DataProvider {
  constructor(private client: ConvexHttpClient) {}

  things = {
    get: (id: string) =>
      Effect.tryPromise({
        try: () => this.client.query(api.queries.things.get, { id }),
        catch: (error) => new ThingNotFoundError(id)
      }),

    list: (params) =>
      Effect.tryPromise({
        try: () => this.client.query(api.queries.things.list, params),
        catch: (error) => new Error(String(error))
      })
  }
}

export function convexProvider(config: { url: string }) {
  return Layer.succeed(
    DataProvider,
    new ConvexProvider(new ConvexHttpClient(config.url))
  )
}
```

### WordPress Provider

```typescript
// frontend/src/providers/wordpress/WordPressProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class WordPressProvider implements DataProvider {
  constructor(private baseUrl: string, private apiKey: string) {}

  things = {
    get: (id: string) =>
      Effect.gen(function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
              headers: { Authorization: `Bearer ${this.apiKey}` }
            }),
          catch: (error) => new Error(String(error))
        })

        const post = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        // Transform WordPress post → ONE thing
        return {
          _id: post.id.toString(),
          type: 'post' as ThingType,
          name: post.title.rendered,
          properties: {
            content: post.content.rendered,
            excerpt: post.excerpt.rendered
          }
        }
      })
  }
}

export function wordpressProvider(config: { url: string; apiKey: string }) {
  return Layer.succeed(
    DataProvider,
    new WordPressProvider(config.url, config.apiKey)
  )
}
```

---

## React Integration

### useEffectRunner Hook

```typescript
// frontend/src/hooks/useEffectRunner.ts
import { useCallback, useState } from 'react'
import { Effect } from 'effect'
import { ClientLayer } from '@/services/ClientLayer'

export function useEffectRunner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async <A, E>(
    effect: Effect.Effect<A, E>,
    options?: {
      onSuccess?: (result: A) => void
      onError?: (error: E) => void
    }
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await Effect.runPromise(
        effect.pipe(Effect.provide(ClientLayer))
      )

      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      options?.onError?.(err as E)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, loading, error }
}
```

### Using in Components

```tsx
// frontend/src/components/CourseEnrollButton.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { ConnectionService } from '@/services/ConnectionService'
import { Effect } from 'effect'

export function CourseEnrollButton({ courseId, userId }) {
  const { run, loading, error } = useEffectRunner()

  const handleEnroll = () => {
    const program = Effect.gen(function* () {
      const connections = yield* ConnectionService

      // Enroll = create connection
      return yield* connections.create({
        fromThingId: userId,
        toThingId: courseId,
        relationshipType: 'enrolled_in'
      })
    })

    run(program, {
      onSuccess: (id) => {
        console.log('Enrolled successfully')
        window.location.href = `/courses/${courseId}/learn`
      }
    })
  }

  return (
    <div>
      <button onClick={handleEnroll} disabled={loading}>
        {loading ? 'Enrolling...' : 'Enroll Now'}
      </button>
      {error && <Alert variant="destructive">{error}</Alert>}
    </div>
  )
}
```

---

## Component Patterns

### Generic Card Component

```tsx
// frontend/src/components/cards/Card.tsx
import { Card } from '@/components/ui/card'
import { getThingConfig } from '@/ontology/config'
import * as Icons from 'lucide-react'

interface CardProps {
  thing: {
    _id: string
    type: string
    name: string
    properties: Record<string, any>
  }
}

export function Card({ thing }: CardProps) {
  const config = getThingConfig(thing.type)
  const Icon = Icons[config.icon]

  const title = thing.properties[config.primaryField] || thing.name
  const subtitle = thing.properties[config.secondaryField]
  const image = thing.properties[config.imageField]

  return (
    <Card>
      {image && <img src={image} alt={title} />}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span>{config.displayName}</span>
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        <a href={`/${thing.type}s/${thing._id}`}>
          <button>View Details</button>
        </a>
      </div>
    </Card>
  )
}
```

---

## Page Patterns (SSR)

### Fetch Data, Render HTML

```astro
---
// frontend/src/pages/courses/[id].astro
import { getConvexClient } from '@/lib/convex'
import { api } from '@/lib/api'
import Layout from '@/layouts/Layout.astro'

// SSR: Fetch from backend
const convex = getConvexClient()

const course = await convex.query(api.queries.things.get, {
  id: Astro.params.id
})

if (!course) {
  return Astro.redirect('/404')
}

const lessons = await convex.query(api.queries.connections.getRelated, {
  thingId: course._id,
  relationshipType: 'part_of',
  direction: 'to'
})
---

<Layout title={course.name}>
  <header>
    <h1>{course.name}</h1>
    <p>{course.properties.description}</p>
    <span>${course.properties.price}</span>
  </header>

  <section>
    <h2>Lessons</h2>
    {lessons.map(lesson => (
      <div>
        <h3>{lesson.name}</h3>
        <p>{lesson.properties.content}</p>
      </div>
    ))}
  </section>

  <!-- Interactive component (React Island) -->
  <EnrollButton client:load courseId={course._id} />
</Layout>
```

---

## Multi-Tenant Routing

### Middleware: Extract Group from Subdomain

```typescript
// frontend/src/middleware.ts
import { defineMiddleware } from 'astro:middleware'
import { getConvexClient } from './lib/convex'
import { api } from './lib/api'

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)

  // Extract group slug from subdomain
  // fitnesspro.one.ie → "fitnesspro"
  const hostname = url.hostname
  const groupSlug = hostname.split('.')[0]

  if (['api', 'www', 'localhost'].includes(groupSlug)) {
    return next()
  }

  // Fetch group from backend (groups table)
  const convex = getConvexClient()
  const group = await convex.query(api.queries.groups.getBySlug, {
    slug: groupSlug
  })

  if (group) {
    context.locals.group = group
    context.locals.groupId = group._id
  }

  return next()
})
```

### Use Group Context in Pages

```astro
---
// frontend/src/pages/courses/index.astro
const group = Astro.locals.group

if (!group) {
  return Astro.redirect('/404')
}

const convex = getConvexClient()
const courses = await convex.query(api.queries.things.list, {
  type: 'course',
  groupId: group._id  // All things scoped to groupId
})
---

<Layout title={`${group.name} - Courses`}>
  <h1>{group.name} Courses</h1>
  {courses.map(course => (
    <Card thing={course} />
  ))}
</Layout>
```

---

## File Structure

```
frontend/
├── src/
│   ├── pages/                    # Astro pages (SSR/SSG)
│   │   ├── index.astro
│   │   ├── courses/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   └── [thingType]/
│   │       └── [id].astro
│   ├── components/               # React components
│   │   ├── cards/
│   │   │   └── Card.tsx
│   │   ├── lists/
│   │   │   └── ThingList.tsx
│   │   └── forms/
│   │       └── ThingForm.tsx
│   ├── providers/                # Backend providers
│   │   ├── DataProvider.ts       # Interface
│   │   ├── convex/
│   │   │   └── ConvexProvider.ts
│   │   └── wordpress/
│   │       └── WordPressProvider.ts
│   ├── services/                 # Effect.ts services
│   │   ├── ThingService.ts
│   │   ├── ConnectionService.ts
│   │   └── ClientLayer.ts
│   ├── hooks/
│   │   └── useEffectRunner.ts
│   └── middleware.ts
├── astro.config.ts               # Backend provider config
└── package.json
```

---

## Deployment

### Environment Setup

```bash
# Frontend .env.local
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Better Auth (Multi-method authentication)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:4321

# Or WordPress
WORDPRESS_URL=https://yoursite.com
WORDPRESS_API_KEY=your-key

# Or Supabase
PUBLIC_SUPABASE_URL=https://project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Deploy Frontend

```bash
cd web
bun run build

# Deploy to Cloudflare Pages (recommended for React 19)
wrangler pages deploy dist --project-name=web
```

**Important for React 19:** Ensure `react-dom/server.edge` is configured in `astro.config.mjs`:

```typescript
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge'  // Required for Cloudflare
      }
    }
  }
})
```

### Deploy Backend (Separate)

```bash
cd backend
npx convex deploy
# Deployed to: https://shocking-falcon-870.convex.cloud
```

**Frontend and backend are completely separate deployments.**

---

## Summary

### Frontend Responsibilities

| What | How |
|------|-----|
| **Render UI** | Astro pages + React components |
| **Call Backend** | Effect.ts services via DataProvider |
| **Manage UI State** | useState, useEffectRunner |
| **Route Users** | Astro routing, middleware |

### Backend Responsibilities

| What | Where |
|------|-------|
| **Database Operations** | Backend only |
| **Business Logic** | Backend only |
| **Data Validation** | Backend only |
| **Authorization** | Backend only |

### Key Principles

1. **Backend-Agnostic** - Change backends with ONE line
2. **Type-Safe** - Effect.ts enforces error handling
3. **Composable** - Services combine into complex flows
4. **Multi-Tenant** - Subdomain-based org isolation
5. **Stateless** - Frontend has no state, backend is source of truth

---

**Frontend is pure rendering. Backend is everything else.**

Effect.ts for type-safety. DataProvider for flexibility. Separate deployments.
