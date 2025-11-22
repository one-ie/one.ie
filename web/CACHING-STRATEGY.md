# Caching Strategy

**Platform:** ONE Chat Platform
**Frontend:** Astro 5 + React 19
**Backend:** Convex
**Last Updated:** 2025-11-22

---

## Overview

ONE Chat Platform uses a **reactive caching strategy** powered by Convex. No manual cache management required - Convex handles caching automatically with real-time updates.

---

## Architecture

```
┌─────────────┐        ┌──────────────┐        ┌──────────────┐
│   Browser   │        │ Convex Cloud │        │  Database    │
│             │        │              │        │              │
│  useQuery() │◄─────► │ Query Cache  │◄─────► │   Storage    │
│             │ WebSocket│(Automatic)  │        │              │
└─────────────┘        └──────────────┘        └──────────────┘
      │                      │
      │ Subscribe            │ Reactive Updates
      │                      │
      ▼                      ▼
┌─────────────┐        ┌──────────────┐
│  Component  │        │  All Clients │
│  Renders    │        │  Updated     │
└─────────────┘        └──────────────┘
```

---

## Server-Side Caching (Convex)

### How It Works

1. **First Query:**
   ```typescript
   const messages = useQuery(api.queries.getChannelMessages, {
     channelId: "channel123",
     limit: 50
   });
   ```
   - Convex executes query
   - Results cached on server
   - WebSocket subscription created

2. **Subsequent Queries:**
   - Same params = cache hit (instant)
   - Different params = new query + cache

3. **Mutations:**
   ```typescript
   await sendMessage({ content: "Hello", channelId: "channel123" });
   ```
   - Mutation executes
   - Affected queries invalidated
   - Subscribers receive updates via WebSocket

### Cache Characteristics

| Feature | Behavior |
|---------|----------|
| Storage | Server-side (Convex Cloud) |
| Scope | Global (shared across all clients) |
| Invalidation | Automatic (on mutations) |
| TTL | No expiration (always fresh) |
| Consistency | Strong (real-time updates) |
| Configuration | Zero (handled by Convex) |

---

## Client-Side Caching (React)

### useQuery Hook

**Pattern:**
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MessageList({ channelId }: { channelId: string }) {
  const messages = useQuery(api.queries.getChannelMessages, {
    channelId,
    limit: 50
  });

  if (messages === undefined) {
    return <div>Loading...</div>; // Initial load
  }

  return (
    <div>
      {messages.map(msg => <Message key={msg._id} message={msg} />)}
    </div>
  );
}
```

**Behavior:**
- **First render:** Returns `undefined` (loading)
- **After load:** Returns data
- **On update:** Component re-renders with new data
- **On unmount:** Unsubscribes from query

### Cache Lifecycle

```
Component Mount
    ↓
Subscribe to Query ─────► Convex Cache Hit? ─── Yes ──► Return Cached Data
    ↓                            │
    │                            No
    │                            ↓
    │                    Execute Query
    │                            ↓
    │                    Cache Result
    │                            ↓
    ▼                            ▼
Component Renders with Data
    │
    │ (Mutation occurs elsewhere)
    ↓
WebSocket Update Received
    ↓
Component Re-renders
    │
    ▼
Component Unmount ─────► Unsubscribe
```

---

## Mutations & Optimistic Updates

### Standard Mutation

**Pattern:**
```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MessageComposer({ channelId }: { channelId: string }) {
  const sendMessage = useMutation(api.mutations.sendMessage);

  const handleSubmit = async (content: string) => {
    // Send mutation
    await sendMessage({ content, channelId });

    // Convex automatically:
    // 1. Invalidates affected queries
    // 2. Pushes updates to all subscribers
    // 3. Components re-render with new data
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**No manual refetch needed!** ✨

### Optimistic Updates (Advanced)

**Pattern:**
```typescript
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function MessageList({ channelId }: { channelId: string }) {
  const messages = useQuery(api.queries.getChannelMessages, { channelId });
  const sendMessage = useMutation(api.mutations.sendMessage);

  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);

  const handleSend = async (content: string) => {
    // Create optimistic message
    const optimistic = {
      _id: `temp-${Date.now()}`,
      content,
      createdAt: Date.now(),
      author: currentUser,
    };

    // Add to local state immediately
    setOptimisticMessages(prev => [...prev, optimistic]);

    try {
      // Send to server
      await sendMessage({ content, channelId });

      // Clear optimistic message (server data replaces it)
      setOptimisticMessages([]);
    } catch (error) {
      // Remove optimistic message on error
      setOptimisticMessages([]);
      toast.error("Failed to send message");
    }
  };

  // Merge optimistic and real messages
  const allMessages = [...(messages || []), ...optimisticMessages];

  return (
    <div>
      {allMessages.map(msg => <Message key={msg._id} message={msg} />)}
    </div>
  );
}
```

**Use optimistic updates for:**
- Better perceived performance
- Instant UI feedback
- Offline-first experiences

---

## Cache Configuration

### No Configuration Needed ✅

Convex handles caching automatically. **Zero configuration required** for:
- Query result caching
- Cache invalidation
- Real-time subscriptions
- Optimistic updates (optional)

### If You Must Configure (Advanced)

**Disable subscriptions (polling mode):**
```typescript
// Use ConvexHttpClient instead of ConvexReactClient
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

const messages = await convex.query(api.queries.getChannelMessages, {
  channelId
});

// No subscriptions, no real-time updates
// Manual refetch required
```

**Why you shouldn't:** Loses real-time updates, requires manual cache management.

---

## Cache Invalidation

### Automatic Invalidation

**Convex invalidates caches automatically** when mutations affect query results.

Example:
```typescript
// Query: Get messages in channel
const messages = useQuery(api.queries.getChannelMessages, {
  channelId: "channel123"
});

// Mutation: Send message
await sendMessage({
  content: "Hello",
  channelId: "channel123"
});

// Convex automatically:
// 1. Detects mutation affects getChannelMessages query
// 2. Invalidates cache for channelId="channel123"
// 3. Pushes update to all subscribed clients
// 4. Components re-render with new message
```

**No manual invalidation needed!** 🎉

### Manual Invalidation (Rarely Needed)

If you need to force a refetch:
```typescript
import { useQuery } from "convex/react";

const messages = useQuery(api.queries.getChannelMessages, {
  channelId,
  // Add timestamp to force refetch
  _invalidate: Date.now()
});
```

**Warning:** Usually not needed. Use only for debugging or special cases.

---

## Multi-Tenant Caching

### Scoped by groupId

All queries are scoped by `groupId` for multi-tenancy:

```typescript
// backend/convex/queries/getChannelMessages.ts
const messages = await ctx.db
  .query("things")
  .filter((q) => q.eq(q.field("groupId"), userGroupId))
  .collect();
```

**Benefits:**
- Data isolation between organizations
- Cache hits only within same group
- Security by design (no cross-org data leaks)

---

## Performance Characteristics

### Query Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Cache hit latency | < 10ms | Instant (server-side cache) |
| Cache miss latency | 30-80ms | Database query |
| WebSocket latency | < 50ms | Real-time update delivery |
| Subscription overhead | Minimal | ~1KB per query |

### Best Practices

**DO ✅**
- Use `useQuery()` for reactive data
- Let Convex handle caching
- Use optimistic updates for better UX
- Scope queries by groupId

**DON'T ❌**
- Manually fetch and cache data
- Use localStorage for query results
- Poll for updates (use subscriptions)
- Disable subscriptions unnecessarily

---

## Troubleshooting

### Issue: Component Not Updating

**Symptom:** Data changes but component doesn't re-render.

**Check:**
1. Using `useQuery()` (not `ConvexHttpClient`)?
2. Query params haven't changed?
3. WebSocket connected? (check browser console)

**Solution:**
```typescript
// ✅ GOOD: Reactive
const messages = useQuery(api.queries.getChannelMessages, { channelId });

// ❌ BAD: Not reactive
const [messages, setMessages] = useState([]);
useEffect(() => {
  convex.query(api.queries.getChannelMessages, { channelId })
    .then(setMessages);
}, [channelId]);
```

### Issue: Stale Data

**Symptom:** Data is outdated after mutation.

**Check:**
1. Mutation completed successfully?
2. Query params match mutation scope?
3. Cache invalidation working?

**Solution:**
```typescript
// Ensure mutation uses correct parameters
await sendMessage({
  content: "Hello",
  channelId: channelId // ← Must match query channelId
});
```

### Issue: Too Many Re-renders

**Symptom:** Component renders repeatedly.

**Check:**
1. Query params changing on each render?
2. Creating new objects in query params?

**Solution:**
```typescript
// ❌ BAD: New object every render
const messages = useQuery(api.queries.getChannelMessages, {
  channelId,
  filters: { read: false } // ← New object!
});

// ✅ GOOD: Stable params
const messages = useQuery(api.queries.getChannelMessages, {
  channelId,
  unreadOnly: false
});
```

---

## Monitoring

### Convex Dashboard

**Access:** https://dashboard.convex.dev/

**Metrics:**
- Cache hit rate
- Query latency
- Subscription count
- WebSocket connections

### Browser DevTools

**Check subscriptions:**
```typescript
// In browser console
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('ws://'))
```

**Monitor updates:**
```typescript
// Log all query updates
const messages = useQuery(api.queries.getChannelMessages, { channelId });

useEffect(() => {
  console.log('Messages updated:', messages);
}, [messages]);
```

---

## Summary

### Key Points

1. **Zero Configuration:** Convex handles caching automatically
2. **Real-Time Updates:** WebSocket subscriptions for reactive data
3. **Automatic Invalidation:** Mutations invalidate affected queries
4. **Global Cache:** Shared across all clients (not per-client)
5. **No Manual Work:** Use `useQuery()` and forget about caching

### Cache Flow

```
useQuery() → Convex Cache Hit? → Yes → Return Instantly
    │                  │
    │                  No
    │                  ↓
    │            Execute Query
    │                  ↓
    │            Cache Result
    │                  ↓
    ▼                  ▼
Subscribe to Updates via WebSocket
    │
    ↓
(Mutation occurs)
    │
    ↓
Cache Invalidated
    │
    ↓
WebSocket Push Update
    │
    ↓
Component Re-renders
```

---

**Next Steps:**
- ✅ Caching already optimal (no changes needed)
- [ ] Monitor cache performance in Convex dashboard
- [ ] Add optimistic updates for better UX (optional)

**Document Owner:** agent-frontend
**Review Cycle:** Quarterly
