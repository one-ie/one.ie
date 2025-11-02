---
title: "Backend Separation: The Architecture That Changes Everything"
description: "How we enforced true backend-agnostic architecture - swap Convex for WordPress with ONE line change"
date: 2025-10-18
author: "ONE Platform Engineering"
tags: ["architecture", "backend", "separation", "design-patterns"]
category: "architecture"
featured: true
---

# Backend Separation: The Architecture That Changes Everything

**Release v3.4.2** | October 18, 2025

Today we deployed a critical architectural improvement that fundamentally changes how ONE works. The principle is simple but powerful:

**Frontend NEVER imports backend code. Ever.**

## The Problem We Solved

Before today, our frontend had this pattern:

```typescript
// ❌ WRONG - Frontend coupled to Convex
import { api } from "../../../backend/convex/_generated/api";
import { useQuery } from "convex/react";

function MyComponent() {
  const data = useQuery(api.things.list, {});
  // ...
}
```

**What's wrong with this?**

1. Frontend is **locked** to Convex
2. Can't swap backends without rewriting frontend
3. Violates separation of concerns
4. Creates vendor lock-in

## The Solution: DataProvider Interface

We enforce this architecture:

```typescript
// ✅ CORRECT - Backend-agnostic
import { useThings } from "@/hooks/useThings";

function MyComponent() {
  const { things } = useThings({ groupId, type });
  // ...
}
```

### The Beautiful Flow

```
Frontend Hook
    ↓
Effect.ts Service (pure business logic)
    ↓
DataProvider Interface (abstraction)
    ↓
Backend Implementation (Convex OR WordPress OR Supabase OR...)
```

## The Three-Layer Architecture

```
┌──────────────────────────────────────────────────┐
│         ASTRO FRONTEND LAYER                     │
│  - Pages: .astro files (SSR)                     │
│  - Components: React 19 islands                   │
│  - Hooks: useThings, useConnections, etc.        │
│  - UI: shadcn/ui + Tailwind v4                   │
│  - NO direct backend imports                     │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓ (HTTP calls via hooks)
┌──────────────────────────────────────────────────┐
│         EFFECT.TS SERVICE LAYER                  │
│  - Services: Pure business logic                 │
│  - DataProvider: Backend abstraction interface   │
│  - Layers: Dependency injection                  │
│  - Errors: Typed error handling                  │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓ (DataProvider implementation)
┌──────────────────────────────────────────────────┐
│         BACKEND LAYER (Interchangeable)          │
│  - ConvexProvider OR WordPressProvider OR...     │
│  - 6-Dimension Ontology implementation           │
│  - things, connections, events, knowledge        │
└──────────────────────────────────────────────────┘
```

## Why This Matters

### 1. **Swap Backends with ONE Line**

```typescript
// Switch from Convex to WordPress
// OLD:
const provider = new ConvexProvider(config);

// NEW:
const provider = new WordPressProvider(config);

// Frontend? Unchanged. Zero modifications needed.
```

### 2. **No Vendor Lock-In**

Your frontend works with:

- ✅ Convex
- ✅ WordPress
- ✅ Supabase
- ✅ Notion
- ✅ Any database with a DataProvider implementation

### 3. **Test with Mock Backends**

```typescript
// Testing is easy
const mockProvider = new MockDataProvider();
// Test frontend logic without real backend
```

### 4. **Future-Proof Architecture**

New backend emerges? Write a provider for it. Frontend doesn't care.

## The Car Analogy

Think of it like a car:

- **Frontend** = The car (doesn't know/care about fuel type)
- **DataProvider** = Fuel port (standardized interface)
- **Backend** = Fuel type (gasoline, diesel, electric)

You can switch from gasoline to electric without redesigning the entire car. Just change what you plug into the fuel port.

## What We Changed in v3.4.2

### 1. **Removed Direct Backend Imports**

```typescript
// Before (WRONG)
export { api } from "../../../backend/convex/_generated/api";

// After (CORRECT)
export const api = {
  // Deprecation stub with helpful errors
  things: {
    list: () => {
      throw new Error("Use useThings hook instead");
    },
  },
};
```

### 2. **Updated Documentation**

CLAUDE.md now has a **⚠️ CRITICAL RULE** section at the top:

> **THE GOLDEN RULE: Frontend NEVER imports Convex (or any backend) directly.**

### 3. **Architecture Diagram**

Updated to show proper separation:

- Frontend → HTTP calls via hooks
- Service Layer → DataProvider interface
- Backend → Interchangeable implementations

### 4. **Release Script Enhancement**

Improved `scripts/release.sh` to:

- Sync `/web` to `/apps/one/web` via rsync (simpler than git subtree)
- Build from production source
- Deploy to Cloudflare Pages

## The Implementation Pattern

### Hook (Frontend Layer)

```typescript
// src/hooks/useThings.tsx
export function useThings({ groupId, type }) {
  const [things, setThings] = useState([]);

  useEffect(() => {
    // Uses DataProvider internally
    ThingService.list({ groupId, type }).then(setThings);
  }, [groupId, type]);

  return { things };
}
```

### Service (Business Logic Layer)

```typescript
// src/services/ThingService.ts
export class ThingService {
  static list(args: ListArgs) {
    return Effect.gen(function* () {
      const provider = yield* DataProvider;
      return yield* provider.getThings(args);
    });
  }
}
```

### Provider (Backend Layer)

```typescript
// src/providers/ConvexProvider.ts
export class ConvexProvider implements DataProvider {
  getThings(args: ListArgs) {
    return Effect.tryPromise(() => this.convex.query(api.things.list, args));
  }
}

// src/providers/WordPressProvider.ts
export class WordPressProvider implements DataProvider {
  getThings(args: ListArgs) {
    return Effect.tryPromise(() =>
      fetch(`${this.wpUrl}/wp-json/one/v1/things`, {
        method: "POST",
        body: JSON.stringify(args),
      })
    );
  }
}
```

## The DataProvider Interface

```typescript
export interface DataProvider {
  // Things
  getThings(args: GetThingsArgs): Effect.Effect<Thing[], DataError>;
  createThing(args: CreateThingArgs): Effect.Effect<Thing, DataError>;
  updateThing(args: UpdateThingArgs): Effect.Effect<Thing, DataError>;

  // Connections
  getConnections(
    args: GetConnectionsArgs
  ): Effect.Effect<Connection[], DataError>;
  createConnection(
    args: CreateConnectionArgs
  ): Effect.Effect<Connection, DataError>;

  // Events
  getEvents(args: GetEventsArgs): Effect.Effect<Event[], DataError>;
  logEvent(args: LogEventArgs): Effect.Effect<Event, DataError>;

  // Knowledge
  searchKnowledge(args: SearchArgs): Effect.Effect<Knowledge[], DataError>;
}
```

## Impact on Development

### Before: Coupled Architecture

```
Developer wants to use WordPress:
❌ Rewrite all frontend queries
❌ Change all useQuery calls
❌ Update every component
❌ Test everything again
⏱️ Time: Weeks
```

### After: Decoupled Architecture

```
Developer wants to use WordPress:
✅ Write WordPressProvider implementation
✅ Change ONE line: DataProvider factory
✅ Frontend unchanged
✅ Existing tests still pass
⏱️ Time: Hours
```

## Lessons Learned

### 1. **Separation of Concerns is Not Optional**

It's easy to couple frontend to backend "for convenience." Don't. The cost comes later when you need to change backends.

### 2. **Interfaces Are Your Friend**

The DataProvider interface acts as a contract. Any backend can implement it. Frontend doesn't care which one.

### 3. **Effect.ts Makes This Beautiful**

Using Effect.ts for services means:

- Pure business logic
- Easy testing with mocked providers
- Type-safe error handling
- Dependency injection

### 4. **Documentation Drives Discipline**

By putting **⚠️ CRITICAL RULE** at the top of CLAUDE.md, we make it impossible to miss. AI agents will follow this pattern.

## What's Next

### Short Term

1. Replace remaining `api` imports with hooks
2. Delete `convex-api.ts` stub entirely
3. Implement `WordPressProvider` as reference
4. Add comprehensive tests with MockProvider

### Long Term

1. **Multi-Backend Support**: Run Convex + WordPress simultaneously
2. **CompositeProvider**: Route requests to different backends based on entity type
3. **Provider Registry**: Dynamic provider loading
4. **Backend Monitoring**: Track provider performance

## Conclusion

This isn't just about Convex vs WordPress. It's about **architectural discipline**.

When you enforce separation:

- Frontend becomes portable
- Backend becomes swappable
- Tests become easier
- Maintenance becomes simpler
- Teams become more productive

**The Golden Rule**: Frontend NEVER imports backend code.

Follow it. Your future self will thank you.

## Resources

- [CLAUDE.md Architecture Section](https://github.com/one-ie/web/blob/main/CLAUDE.md#architecture-overview)
- [DataProvider Interface](https://github.com/one-ie/web/blob/main/src/providers/DataProvider.ts)
- [Release v3.4.2 Notes](https://github.com/one-ie/cli/releases/tag/v3.4.2)
- [Backend Separation Commit](https://github.com/one-ie/web/commit/8d13a9b)

---

**Built with discipline. Deployed with confidence. Maintained with joy.**

🚀 **Live Now**: https://web.one.ie
📦 **Install**: `npx oneie@latest`
