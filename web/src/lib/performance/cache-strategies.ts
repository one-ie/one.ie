/**
 * Cache Strategies
 *
 * Provides caching utilities for:
 * - Browser cache (Cache API)
 * - Service worker cache strategies
 * - Cache headers configuration
 * - Cache invalidation
 */

export interface CacheConfig {
  /** Cache name */
  name: string;
  /** Max age in seconds */
  maxAge: number;
  /** Max entries in cache */
  maxEntries?: number;
  /** Network timeout in ms */
  networkTimeout?: number;
}

/**
 * Cache strategies
 */
export enum CacheStrategy {
  /** Network first, fallback to cache */
  NETWORK_FIRST = 'network-first',
  /** Cache first, fallback to network */
  CACHE_FIRST = 'cache-first',
  /** Try cache, then network (parallel) */
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
  /** Network only */
  NETWORK_ONLY = 'network-only',
  /** Cache only */
  CACHE_ONLY = 'cache-only',
}

/**
 * Cache configuration for different resource types
 */
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Static assets (images, fonts, etc.)
  static: {
    name: 'static-assets-v1',
    maxAge: 31536000, // 1 year
    maxEntries: 60,
  },

  // HTML pages
  pages: {
    name: 'pages-v1',
    maxAge: 86400, // 1 day
    maxEntries: 50,
    networkTimeout: 3000,
  },

  // API responses
  api: {
    name: 'api-cache-v1',
    maxAge: 300, // 5 minutes
    maxEntries: 100,
    networkTimeout: 5000,
  },

  // Images
  images: {
    name: 'images-v1',
    maxAge: 2592000, // 30 days
    maxEntries: 100,
  },
};

/**
 * Get cache headers for HTTP responses
 */
export function getCacheHeaders(
  strategy: 'static' | 'dynamic' | 'no-cache',
  maxAge?: number
): HeadersInit {
  switch (strategy) {
    case 'static':
      // Long-term caching for static assets
      return {
        'Cache-Control': `public, max-age=${maxAge || 31536000}, immutable`,
        'Vary': 'Accept-Encoding',
      };

    case 'dynamic':
      // Short-term caching for dynamic content
      return {
        'Cache-Control': `public, max-age=${maxAge || 300}, stale-while-revalidate=86400`,
        'Vary': 'Accept-Encoding',
      };

    case 'no-cache':
      // No caching
      return {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };

    default:
      return {};
  }
}

/**
 * Cache API utilities
 */
export class CacheManager {
  private cacheName: string;

  constructor(cacheName: string = 'app-cache-v1') {
    this.cacheName = cacheName;
  }

  /**
   * Add a request to cache
   */
  async put(request: Request | string, response: Response): Promise<void> {
    if (!('caches' in window)) return;

    const cache = await caches.open(this.cacheName);
    await cache.put(request, response);
  }

  /**
   * Get a cached response
   */
  async match(request: Request | string): Promise<Response | undefined> {
    if (!('caches' in window)) return undefined;

    const cache = await caches.open(this.cacheName);
    return cache.match(request);
  }

  /**
   * Delete a cached response
   */
  async delete(request: Request | string): Promise<boolean> {
    if (!('caches' in window)) return false;

    const cache = await caches.open(this.cacheName);
    return cache.delete(request);
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    if (!('caches' in window)) return;

    await caches.delete(this.cacheName);
  }

  /**
   * Get all cached URLs
   */
  async keys(): Promise<Request[]> {
    if (!('caches' in window)) return [];

    const cache = await caches.open(this.cacheName);
    return cache.keys();
  }
}

/**
 * Network-first strategy
 * Try network first, fallback to cache on failure
 */
export async function networkFirst(
  request: Request | string,
  config: CacheConfig
): Promise<Response> {
  const cache = await caches.open(config.name);

  try {
    // Try network first with timeout
    const networkPromise = fetch(request);
    const timeoutPromise = config.networkTimeout
      ? new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), config.networkTimeout)
        )
      : null;

    const response = timeoutPromise
      ? await Promise.race([networkPromise, timeoutPromise])
      : await networkPromise;

    // Cache successful response
    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // No cache available
    throw new Error('Network request failed and no cache available');
  }
}

/**
 * Cache-first strategy
 * Try cache first, fallback to network
 */
export async function cacheFirst(
  request: Request | string,
  config: CacheConfig
): Promise<Response> {
  const cache = await caches.open(config.name);

  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Cache miss, try network
  const networkResponse = await fetch(request);

  // Cache successful response
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

/**
 * Stale-while-revalidate strategy
 * Return cached response immediately, update cache in background
 */
export async function staleWhileRevalidate(
  request: Request | string,
  config: CacheConfig
): Promise<Response> {
  const cache = await caches.open(config.name);

  // Get cached response
  const cachedResponse = await cache.match(request);

  // Update cache in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

/**
 * Precache static assets
 */
export async function precacheAssets(urls: string[]): Promise<void> {
  if (!('caches' in window)) return;

  const cache = await caches.open(CACHE_CONFIGS.static.name);

  await Promise.all(
    urls.map(async url => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error(`Failed to precache ${url}:`, error);
      }
    })
  );
}

/**
 * Clean up old caches
 */
export async function cleanupOldCaches(currentCaches: string[]): Promise<void> {
  if (!('caches' in window)) return;

  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames.map(cacheName => {
      if (!currentCaches.includes(cacheName)) {
        return caches.delete(cacheName);
      }
    })
  );
}

/**
 * Get cache size
 */
export async function getCacheSize(cacheName: string): Promise<number> {
  if (!('caches' in window)) return 0;

  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    let totalSize = 0;
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export interface CacheStats {
  name: string;
  size: number;
  entries: number;
  urls: string[];
}

export async function getCacheStats(): Promise<CacheStats[]> {
  if (!('caches' in window)) return [];

  const cacheNames = await caches.keys();
  const stats: CacheStats[] = [];

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    const size = await getCacheSize(name);

    stats.push({
      name,
      size,
      entries: requests.length,
      urls: requests.map(req => req.url),
    });
  }

  return stats;
}

/**
 * Implement cache size limits
 */
export async function limitCacheSize(cacheName: string, maxEntries: number): Promise<void> {
  if (!('caches' in window)) return;

  const cache = await caches.open(cacheName);
  const requests = await cache.keys();

  if (requests.length > maxEntries) {
    // Remove oldest entries (FIFO)
    const toRemove = requests.slice(0, requests.length - maxEntries);
    await Promise.all(toRemove.map(req => cache.delete(req)));
  }
}

/**
 * Get recommended cache strategy for a URL
 */
export function getCacheStrategy(url: string): CacheStrategy {
  const urlObj = new URL(url, window.location.origin);

  // API requests
  if (urlObj.pathname.startsWith('/api/')) {
    return CacheStrategy.NETWORK_FIRST;
  }

  // Images
  if (/\.(png|jpg|jpeg|gif|webp|avif|svg)$/i.test(urlObj.pathname)) {
    return CacheStrategy.CACHE_FIRST;
  }

  // Static assets (JS, CSS, fonts)
  if (/\.(js|css|woff2?|ttf|eot)$/i.test(urlObj.pathname)) {
    return CacheStrategy.CACHE_FIRST;
  }

  // HTML pages
  if (urlObj.pathname.endsWith('.html') || !urlObj.pathname.includes('.')) {
    return CacheStrategy.STALE_WHILE_REVALIDATE;
  }

  // Default to network first
  return CacheStrategy.NETWORK_FIRST;
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(cacheName: string, maxAge: number): Promise<number> {
  if (!('caches' in window)) return 0;

  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const now = Date.now();
  let cleared = 0;

  for (const request of requests) {
    const response = await cache.match(request);
    if (!response) continue;

    const dateHeader = response.headers.get('date');
    if (!dateHeader) continue;

    const age = now - new Date(dateHeader).getTime();
    if (age > maxAge * 1000) {
      await cache.delete(request);
      cleared++;
    }
  }

  return cleared;
}
