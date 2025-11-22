---
title: Shopify Integration - Cache Strategy
dimension: knowledge
category: integration
tags: shopify, caching, performance, redis, memory-cache
related_dimensions: things, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: 38 of 100
ai_context: |
  Comprehensive caching strategy for Shopify integration on ONE Platform.
  Covers multi-level caching, TTL policies, webhook invalidation, and cache warming.
  Designed for production reliability and optimal performance.
---

# Shopify Integration - Cache Strategy

**Version:** 1.0.0
**Cycle:** 38 of 100
**Status:** Design Complete
**Created:** 2025-11-22

---

## Executive Summary

This document defines a comprehensive caching strategy for the ONE Platform Shopify integration. The strategy implements multi-level caching with intelligent TTL policies, webhook-driven invalidation, and cache warming to minimize API calls while maintaining data freshness.

**Key Objectives:**
- **Reduce API calls by 80%+** through aggressive caching
- **Respect rate limits** by caching frequently accessed data
- **Maintain data freshness** via webhook invalidation
- **Improve response times** with multi-level cache hierarchy
- **Enable offline-first** experiences with cache warming

---

## 1. Cache Architecture

### Multi-Level Cache Hierarchy

```typescript
┌─────────────────────────────────────────────────┐
│              Application Layer                   │
└─────────────────┬───────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼────┐
    │  Memory  │    │  Redis   │
    │  Cache   │    │  Cache   │
    │ (L1)     │    │  (L2)    │
    └────┬─────┘    └─────┬────┘
         │                │
         └────────┬────────┘
                  │
         ┌────────▼─────────┐
         │  Shopify API     │
         │  (Source)        │
         └──────────────────┘
```

**Level 1 (Memory Cache):**
- In-process memory cache
- Ultra-fast access (< 1ms)
- Limited capacity (100MB default)
- Per-instance (not shared)
- Best for: Frequently accessed, small data

**Level 2 (Redis Cache):**
- Distributed cache
- Fast access (~5ms)
- Large capacity (configurable)
- Shared across instances
- Best for: Shared data, larger datasets

**Level 3 (Shopify API):**
- Source of truth
- Slow access (~100-500ms)
- Rate limited
- Only accessed on cache miss

### Cache Service Interface

```typescript
import { Effect, Layer } from 'effect';
import { Redis } from '@effect/platform';

export class CacheError extends Error {
  readonly _tag = 'CacheError';
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  version: string;
}

export interface CacheConfig {
  memorySize: number;        // Max memory cache size (bytes)
  defaultTTL: number;        // Default TTL (seconds)
  enableRedis: boolean;      // Enable Redis L2 cache
  redisUrl?: string;         // Redis connection URL
  keyPrefix: string;         // Key prefix for namespacing
}

export class CacheService extends Effect.Service<CacheService>()('CacheService', {
  effect: Effect.gen(function* () {
    // Dependencies
    const redis = yield* Redis.Redis;
    const config = yield* Effect.config<CacheConfig>();

    // L1: Memory cache
    const memoryCache = new Map<string, CacheEntry<any>>();
    let memoryCacheSize = 0;

    // Internal helpers
    const estimateSize = (value: any): number => {
      return JSON.stringify(value).length;
    };

    const evictLRU = (): void => {
      if (memoryCache.size === 0) return;
      const firstKey = memoryCache.keys().next().value;
      const entry = memoryCache.get(firstKey);
      if (entry) {
        memoryCacheSize -= estimateSize(entry.value);
        memoryCache.delete(firstKey);
      }
    };

    const isExpired = (entry: CacheEntry<any>): boolean => {
      return Date.now() > entry.expiresAt;
    };

    return {
      /**
       * Get value from cache
       * Checks L1 (memory) first, then L2 (Redis), returns null on miss
       */
      get: <T>(key: string) =>
        Effect.gen(function* () {
          const fullKey = `${config.keyPrefix}:${key}`;

          // Check L1 (memory)
          const memEntry = memoryCache.get(fullKey);
          if (memEntry && !isExpired(memEntry)) {
            yield* Effect.log(`Cache hit (L1): ${key}`);
            return memEntry.value as T;
          }

          // Remove expired entry
          if (memEntry) {
            memoryCache.delete(fullKey);
          }

          // Check L2 (Redis)
          if (config.enableRedis) {
            const redisValue = yield* Effect.tryPromise({
              try: () => redis.get(fullKey),
              catch: (error) => new CacheError(`Redis get failed: ${error}`),
            });

            if (redisValue) {
              const entry: CacheEntry<T> = JSON.parse(redisValue);
              if (!isExpired(entry)) {
                yield* Effect.log(`Cache hit (L2): ${key}`);

                // Promote to L1
                const size = estimateSize(entry.value);
                while (memoryCacheSize + size > config.memorySize && memoryCache.size > 0) {
                  evictLRU();
                }
                memoryCache.set(fullKey, entry);
                memoryCacheSize += size;

                return entry.value;
              } else {
                // Remove expired entry
                yield* Effect.tryPromise({
                  try: () => redis.del(fullKey),
                  catch: () => new CacheError('Redis delete failed'),
                });
              }
            }
          }

          // Cache miss
          yield* Effect.log(`Cache miss: ${key}`);
          return null as T | null;
        }),

      /**
       * Set value in cache with optional TTL
       */
      set: <T>(key: string, value: T, ttl?: number) =>
        Effect.gen(function* () {
          const fullKey = `${config.keyPrefix}:${key}`;
          const effectiveTTL = ttl ?? config.defaultTTL;
          const entry: CacheEntry<T> = {
            value,
            expiresAt: Date.now() + effectiveTTL * 1000,
            version: '1.0',
          };

          // Set in L1 (memory)
          const size = estimateSize(value);
          while (memoryCacheSize + size > config.memorySize && memoryCache.size > 0) {
            evictLRU();
          }
          memoryCache.set(fullKey, entry);
          memoryCacheSize += size;

          // Set in L2 (Redis)
          if (config.enableRedis) {
            yield* Effect.tryPromise({
              try: () => redis.setex(fullKey, effectiveTTL, JSON.stringify(entry)),
              catch: (error) => new CacheError(`Redis set failed: ${error}`),
            });
          }

          yield* Effect.log(`Cache set: ${key} (TTL: ${effectiveTTL}s)`);
        }),

      /**
       * Delete specific key from all cache levels
       */
      delete: (key: string) =>
        Effect.gen(function* () {
          const fullKey = `${config.keyPrefix}:${key}`;

          // Delete from L1
          const memEntry = memoryCache.get(fullKey);
          if (memEntry) {
            memoryCacheSize -= estimateSize(memEntry.value);
            memoryCache.delete(fullKey);
          }

          // Delete from L2
          if (config.enableRedis) {
            yield* Effect.tryPromise({
              try: () => redis.del(fullKey),
              catch: (error) => new CacheError(`Redis delete failed: ${error}`),
            });
          }

          yield* Effect.log(`Cache deleted: ${key}`);
        }),

      /**
       * Invalidate all keys matching a pattern
       * Example: "products:*" invalidates all product caches
       */
      invalidatePattern: (pattern: string) =>
        Effect.gen(function* () {
          const fullPattern = `${config.keyPrefix}:${pattern}`;

          // Invalidate L1 (memory)
          const keysToDelete: string[] = [];
          for (const key of memoryCache.keys()) {
            if (matchPattern(key, fullPattern)) {
              keysToDelete.push(key);
            }
          }
          for (const key of keysToDelete) {
            const entry = memoryCache.get(key);
            if (entry) {
              memoryCacheSize -= estimateSize(entry.value);
            }
            memoryCache.delete(key);
          }

          // Invalidate L2 (Redis)
          if (config.enableRedis) {
            const keys = yield* Effect.tryPromise({
              try: () => redis.keys(fullPattern),
              catch: (error) => new CacheError(`Redis keys failed: ${error}`),
            });

            if (keys.length > 0) {
              yield* Effect.tryPromise({
                try: () => redis.del(...keys),
                catch: (error) => new CacheError(`Redis del failed: ${error}`),
              });
            }
          }

          yield* Effect.log(`Cache invalidated: ${pattern} (${keysToDelete.length} keys)`);
        }),

      /**
       * Get or set pattern: fetch from cache, or compute and cache if missing
       */
      getOrSet: <T>(key: string, compute: Effect.Effect<T, Error>, ttl?: number) =>
        Effect.gen(function* () {
          const cached = yield* this.get<T>(key);
          if (cached !== null) {
            return cached;
          }

          const value = yield* compute;
          yield* this.set(key, value, ttl);
          return value;
        }),

      /**
       * Clear all caches (use with caution)
       */
      clear: () =>
        Effect.gen(function* () {
          // Clear L1
          memoryCache.clear();
          memoryCacheSize = 0;

          // Clear L2
          if (config.enableRedis) {
            const keys = yield* Effect.tryPromise({
              try: () => redis.keys(`${config.keyPrefix}:*`),
              catch: (error) => new CacheError(`Redis keys failed: ${error}`),
            });

            if (keys.length > 0) {
              yield* Effect.tryPromise({
                try: () => redis.del(...keys),
                catch: (error) => new CacheError(`Redis del failed: ${error}`),
              });
            }
          }

          yield* Effect.log('Cache cleared (all levels)');
        }),

      /**
       * Get cache statistics
       */
      stats: () =>
        Effect.gen(function* () {
          return {
            l1Size: memoryCache.size,
            l1Bytes: memoryCacheSize,
            l1MaxBytes: config.memorySize,
            l2Enabled: config.enableRedis,
          };
        }),
    };
  }),
}) {}

// Pattern matching helper
function matchPattern(key: string, pattern: string): boolean {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  return regex.test(key);
}
```

---

## 2. Cache Policies by Entity Type

### Products Cache

**TTL:** 30 minutes
**Invalidation:** `products/update`, `products/delete` webhooks
**Warming:** Yes (on app startup)

```typescript
export class ProductCachePolicy {
  static readonly TTL = 60 * 30; // 30 minutes

  static key(productId: string): string {
    return `products:${productId}`;
  }

  static listKey(filters?: { collectionId?: string; vendor?: string }): string {
    if (filters?.collectionId) {
      return `products:collection:${filters.collectionId}`;
    }
    if (filters?.vendor) {
      return `products:vendor:${filters.vendor}`;
    }
    return 'products:all';
  }

  static invalidatePattern(): string {
    return 'products:*';
  }
}
```

**Usage:**
```typescript
async function getProduct(id: string) {
  return cacheService.getOrSet(
    ProductCachePolicy.key(id),
    Effect.tryPromise(() => shopify.product.get(id)),
    ProductCachePolicy.TTL
  );
}
```

### Collections Cache

**TTL:** 60 minutes
**Invalidation:** `collections/update`, `collections/delete` webhooks
**Warming:** Yes (on app startup)

```typescript
export class CollectionCachePolicy {
  static readonly TTL = 60 * 60; // 60 minutes

  static key(collectionId: string): string {
    return `collections:${collectionId}`;
  }

  static listKey(): string {
    return 'collections:all';
  }

  static invalidatePattern(): string {
    return 'collections:*';
  }
}
```

### Shop Info Cache

**TTL:** 24 hours
**Invalidation:** `shop/update` webhook
**Warming:** Yes (on app startup)

```typescript
export class ShopCachePolicy {
  static readonly TTL = 60 * 60 * 24; // 24 hours

  static key(shopDomain: string): string {
    return `shop:${shopDomain}`;
  }

  static invalidatePattern(): string {
    return 'shop:*';
  }
}
```

### Inventory Cache

**TTL:** 5 minutes
**Invalidation:** `inventory_levels/update` webhook
**Warming:** No (too volatile)

```typescript
export class InventoryCachePolicy {
  static readonly TTL = 60 * 5; // 5 minutes

  static key(inventoryItemId: string): string {
    return `inventory:${inventoryItemId}`;
  }

  static invalidatePattern(): string {
    return 'inventory:*';
  }
}
```

### Cart Cache

**TTL:** No cache (always fresh)
**Invalidation:** N/A
**Warming:** No

```typescript
// Never cache cart data - always fetch fresh
async function getCart(cartId: string) {
  return shopify.cart.get(cartId); // No caching
}
```

### Orders Cache

**TTL:** No cache (always fresh)
**Invalidation:** N/A
**Warming:** No

```typescript
// Never cache order data - always fetch fresh
async function getOrder(orderId: string) {
  return shopify.order.get(orderId); // No caching
}
```

---

## 3. Webhook-Driven Cache Invalidation

### Invalidation Service

```typescript
import { Effect } from 'effect';

export class CacheInvalidationService extends Effect.Service<CacheInvalidationService>()(
  'CacheInvalidationService',
  {
    effect: Effect.gen(function* () {
      const cache = yield* CacheService;

      return {
        /**
         * Handle product update webhook
         */
        onProductUpdate: (productId: string) =>
          Effect.gen(function* () {
            yield* cache.delete(ProductCachePolicy.key(productId));
            yield* cache.invalidatePattern(ProductCachePolicy.listKey());
            yield* Effect.log(`Invalidated cache for product: ${productId}`);
          }),

        /**
         * Handle product delete webhook
         */
        onProductDelete: (productId: string) =>
          Effect.gen(function* () {
            yield* cache.invalidatePattern(ProductCachePolicy.invalidatePattern());
            yield* Effect.log(`Invalidated all product caches (product deleted: ${productId})`);
          }),

        /**
         * Handle collection update webhook
         */
        onCollectionUpdate: (collectionId: string) =>
          Effect.gen(function* () {
            yield* cache.delete(CollectionCachePolicy.key(collectionId));
            yield* cache.invalidatePattern(CollectionCachePolicy.listKey());
            yield* cache.invalidatePattern(`products:collection:${collectionId}`);
            yield* Effect.log(`Invalidated cache for collection: ${collectionId}`);
          }),

        /**
         * Handle inventory update webhook
         */
        onInventoryUpdate: (inventoryItemId: string) =>
          Effect.gen(function* () {
            yield* cache.delete(InventoryCachePolicy.key(inventoryItemId));
            yield* Effect.log(`Invalidated cache for inventory: ${inventoryItemId}`);
          }),

        /**
         * Handle shop update webhook
         */
        onShopUpdate: (shopDomain: string) =>
          Effect.gen(function* () {
            yield* cache.delete(ShopCachePolicy.key(shopDomain));
            yield* Effect.log(`Invalidated cache for shop: ${shopDomain}`);
          }),
      };
    }),
  }
) {}
```

### Webhook Integration

```typescript
// Convex mutation for handling webhooks
export const handleProductUpdateWebhook = mutation({
  args: {
    shopifyProductId: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. Process webhook (update database)
    await ctx.db.insert('shopify_products', {
      shopifyId: args.shopifyProductId,
      data: args.payload,
      updatedAt: Date.now(),
    });

    // 2. Invalidate cache
    await Effect.runPromise(
      Effect.gen(function* () {
        const invalidation = yield* CacheInvalidationService;
        yield* invalidation.onProductUpdate(args.shopifyProductId);
      })
    );

    // 3. Log event to ONE Platform
    await ctx.db.insert('events', {
      type: 'shopify_product_updated',
      thingId: args.shopifyProductId,
      properties: {
        source: 'webhook',
        timestamp: Date.now(),
      },
    });
  },
});
```

---

## 4. Cache Warming Strategy

### Startup Cache Warming

```typescript
export class CacheWarmingService extends Effect.Service<CacheWarmingService>()(
  'CacheWarmingService',
  {
    effect: Effect.gen(function* () {
      const cache = yield* CacheService;
      const shopify = yield* ShopifyService;

      return {
        /**
         * Warm cache on application startup
         */
        warmOnStartup: (shopDomain: string) =>
          Effect.gen(function* () {
            yield* Effect.log('Starting cache warming...');

            // 1. Warm shop info
            yield* Effect.gen(function* () {
              const shop = yield* shopify.shop.get();
              yield* cache.set(ShopCachePolicy.key(shopDomain), shop, ShopCachePolicy.TTL);
            });

            // 2. Warm collections
            yield* Effect.gen(function* () {
              const collections = yield* shopify.collection.list({ limit: 250 });
              yield* cache.set(
                CollectionCachePolicy.listKey(),
                collections,
                CollectionCachePolicy.TTL
              );

              // Cache individual collections
              for (const collection of collections) {
                yield* cache.set(
                  CollectionCachePolicy.key(collection.id),
                  collection,
                  CollectionCachePolicy.TTL
                );
              }
            });

            // 3. Warm top 100 products
            yield* Effect.gen(function* () {
              const products = yield* shopify.product.list({ limit: 100 });
              for (const product of products) {
                yield* cache.set(
                  ProductCachePolicy.key(product.id),
                  product,
                  ProductCachePolicy.TTL
                );
              }
            });

            yield* Effect.log('Cache warming complete');
          }),

        /**
         * Warm cache for specific collection
         */
        warmCollection: (collectionId: string) =>
          Effect.gen(function* () {
            const products = yield* shopify.product.list({
              collectionId,
              limit: 250,
            });

            yield* cache.set(
              `products:collection:${collectionId}`,
              products,
              ProductCachePolicy.TTL
            );

            for (const product of products) {
              yield* cache.set(
                ProductCachePolicy.key(product.id),
                product,
                ProductCachePolicy.TTL
              );
            }

            yield* Effect.log(`Warmed cache for collection: ${collectionId}`);
          }),

        /**
         * Refresh stale caches (background job)
         */
        refreshStale: () =>
          Effect.gen(function* () {
            // This would be called periodically (e.g., every hour)
            // to refresh caches that are about to expire

            yield* Effect.log('Refreshing stale caches...');

            // Implementation would check cache TTLs and refresh
            // items that are close to expiration
          }),
      };
    }),
  }
) {}
```

---

## 5. Cache Monitoring & Metrics

### Metrics Service

```typescript
export class CacheMetricsService extends Effect.Service<CacheMetricsService>()(
  'CacheMetricsService',
  {
    effect: Effect.gen(function* () {
      const cache = yield* CacheService;

      let hits = 0;
      let misses = 0;
      let invalidations = 0;

      return {
        recordHit: () =>
          Effect.sync(() => {
            hits++;
          }),

        recordMiss: () =>
          Effect.sync(() => {
            misses++;
          }),

        recordInvalidation: () =>
          Effect.sync(() => {
            invalidations++;
          }),

        getMetrics: () =>
          Effect.gen(function* () {
            const stats = yield* cache.stats();
            const total = hits + misses;
            const hitRate = total > 0 ? hits / total : 0;

            return {
              hits,
              misses,
              hitRate,
              invalidations,
              ...stats,
            };
          }),

        reset: () =>
          Effect.sync(() => {
            hits = 0;
            misses = 0;
            invalidations = 0;
          }),
      };
    }),
  }
) {}
```

### Monitoring Dashboard Query

```typescript
// Convex query for cache metrics dashboard
export const getCacheMetrics = query({
  args: {},
  handler: async (ctx) => {
    const metrics = await Effect.runPromise(
      Effect.gen(function* () {
        const cacheMetrics = yield* CacheMetricsService;
        return yield* cacheMetrics.getMetrics();
      })
    );

    return {
      hitRate: `${(metrics.hitRate * 100).toFixed(2)}%`,
      hits: metrics.hits,
      misses: metrics.misses,
      invalidations: metrics.invalidations,
      l1Size: metrics.l1Size,
      l1Bytes: `${(metrics.l1Bytes / 1024 / 1024).toFixed(2)} MB`,
      l1MaxBytes: `${(metrics.l1MaxBytes / 1024 / 1024).toFixed(2)} MB`,
      l2Enabled: metrics.l2Enabled,
    };
  },
});
```

---

## 6. Implementation Checklist

### Phase 1: Basic Memory Cache (Cycle 40)
- [ ] Implement `CacheService` with L1 (memory) support
- [ ] Define cache policies for products, collections, shop
- [ ] Integrate with `ShopifyProductService`
- [ ] Add basic TTL support
- [ ] Test cache hit/miss behavior

### Phase 2: Redis Layer (Cycle 41)
- [ ] Add Redis dependency to backend
- [ ] Implement L2 (Redis) cache layer
- [ ] Configure cache promotion (L2 → L1)
- [ ] Test multi-level cache behavior
- [ ] Add distributed cache invalidation

### Phase 3: Webhook Invalidation (Cycle 42)
- [ ] Implement `CacheInvalidationService`
- [ ] Integrate with webhook handlers
- [ ] Test pattern-based invalidation
- [ ] Add invalidation event logging

### Phase 4: Cache Warming (Cycle 43)
- [ ] Implement `CacheWarmingService`
- [ ] Add startup warming logic
- [ ] Create background refresh job
- [ ] Test warming performance

### Phase 5: Monitoring (Cycle 44)
- [ ] Implement `CacheMetricsService`
- [ ] Add Convex query for metrics dashboard
- [ ] Create cache stats UI component
- [ ] Set up alerts for low hit rates

---

## 7. Configuration Examples

### Development Configuration
```typescript
const devCacheConfig: CacheConfig = {
  memorySize: 100 * 1024 * 1024, // 100MB
  defaultTTL: 300, // 5 minutes
  enableRedis: false, // Memory only
  keyPrefix: 'shopify:dev',
};
```

### Production Configuration
```typescript
const prodCacheConfig: CacheConfig = {
  memorySize: 500 * 1024 * 1024, // 500MB
  defaultTTL: 1800, // 30 minutes
  enableRedis: true,
  redisUrl: process.env.REDIS_URL,
  keyPrefix: 'shopify:prod',
};
```

---

## 8. Best Practices

1. **Cache immutable data aggressively** (shop info, historical orders)
2. **Cache volatile data conservatively** (inventory, cart)
3. **Never cache sensitive data** (payment info, customer PII)
4. **Always invalidate on writes** (via webhooks)
5. **Monitor hit rates** (target: >80% for products)
6. **Use pattern invalidation** for related data
7. **Warm cache on startup** to reduce cold start latency
8. **Set appropriate TTLs** based on data volatility
9. **Log cache operations** for debugging
10. **Test cache invalidation** thoroughly

---

## 9. Testing Strategy

```typescript
describe('CacheService', () => {
  it('should return null on cache miss', async () => {
    const result = await cache.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should cache and retrieve values', async () => {
    await cache.set('key', { value: 'test' }, 60);
    const result = await cache.get('key');
    expect(result).toEqual({ value: 'test' });
  });

  it('should expire after TTL', async () => {
    await cache.set('key', 'value', 1); // 1 second
    await sleep(1500);
    const result = await cache.get('key');
    expect(result).toBeNull();
  });

  it('should invalidate by pattern', async () => {
    await cache.set('products:1', { id: 1 });
    await cache.set('products:2', { id: 2 });
    await cache.invalidatePattern('products:*');

    expect(await cache.get('products:1')).toBeNull();
    expect(await cache.get('products:2')).toBeNull();
  });

  it('should promote from L2 to L1', async () => {
    // Set in L2 only
    await redis.set('shopify:test', JSON.stringify({ value: 'test' }));

    // Get should promote to L1
    const result = await cache.get('test');
    expect(result).toEqual({ value: 'test' });

    // Verify in L1
    const stats = await cache.stats();
    expect(stats.l1Size).toBe(1);
  });
});
```

---

## 10. Related Documentation

- **Rate Limiting:** `/home/user/one.ie/one/knowledge/shopify-rate-limits.md`
- **Best Practices:** `/home/user/one.ie/one/knowledge/shopify-best-practices.md`
- **Retry Strategy:** `/home/user/one.ie/one/knowledge/shopify-retry-strategy.md` (Cycle 39)
- **Service Layer:** `/home/user/one.ie/one/knowledge/shopify-service-layer.md` (Cycle 45)

---

## Summary

This cache strategy provides:

✅ **Multi-level caching** (memory + Redis)
✅ **Intelligent TTL policies** (5 min to 24 hours)
✅ **Webhook-driven invalidation** (real-time freshness)
✅ **Cache warming** (reduce cold starts)
✅ **Pattern-based invalidation** (efficient bulk updates)
✅ **Monitoring & metrics** (hit rates, sizes)
✅ **Production-ready** (LRU eviction, distributed cache)

**Expected Impact:**
- 80%+ reduction in API calls
- 90%+ cache hit rate for products
- Sub-10ms response times for cached data
- Improved rate limit headroom

---

**Built for the ONE Platform - fast, reliable, scalable caching.**
