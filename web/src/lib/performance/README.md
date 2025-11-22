# Performance Optimization Toolkit

Comprehensive performance optimization utilities for Core Web Vitals tracking, image optimization, and caching strategies.

## Quick Start

### 1. Monitor Performance

```tsx
import { PerformanceMetrics } from '@/components/analytics/PerformanceMetrics';

export function DashboardPage() {
  return (
    <PerformanceMetrics
      refreshInterval={5000}  // Update every 5s
      detailed={true}         // Show all tabs
    />
  );
}
```

### 2. Optimize Images

```tsx
import { OptimizedImage } from '@/components/examples/OptimizedImage';

export function ProductPage() {
  return (
    <OptimizedImage
      src="/product.jpg"
      alt="Product"
      widths={[640, 768, 1024]}
      quality={85}
      lazy={true}
    />
  );
}
```

### 3. Track Custom Metrics

```tsx
import { usePerformanceMark } from '@/hooks/usePerformance';

export function CheckoutFlow() {
  const { mark, measure } = usePerformanceMark('checkout');

  const handleCheckout = async () => {
    mark('start');
    await processCheckout();
    mark('end');

    const duration = measure('start', 'end');
    console.log(`Checkout: ${duration}ms`);
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

## Files

### Core Utilities

| File | Purpose | Size |
|------|---------|------|
| `image-optimizer.ts` | Image optimization & lazy loading | 620 lines |
| `performance-analyzer.ts` | Core Web Vitals & metrics | 580 lines |
| `cache-strategies.ts` | Caching utilities | 420 lines |

### React Components

| File | Purpose | Size |
|------|---------|------|
| `PerformanceMetrics.tsx` | Performance dashboard | 480 lines |
| `OptimizedImage.tsx` | Image component | 150 lines |

### React Hooks

| File | Purpose | Size |
|------|---------|------|
| `usePerformance.ts` | Performance hooks | 350 lines |

## API Reference

### Image Optimizer

#### `generateResponsiveSources(src, config)`

Generate responsive image sources with automatic format detection.

```typescript
const optimized = generateResponsiveSources('/image.jpg', {
  widths: [640, 768, 1024, 1280],
  format: 'webp',           // 'webp' | 'avif' | 'auto'
  quality: 85,              // 1-100
  lazy: true,               // Enable lazy loading
  cdnUrl: '',               // Optional CDN base URL
});

// Returns:
// {
//   src: string,
//   srcSet: string,
//   sizes: string,
//   width: number,
//   height: number,
//   format: string,
//   loading: 'lazy' | 'eager'
// }
```

#### `LazyImageLoader`

Lazy load images using IntersectionObserver.

```typescript
const loader = new LazyImageLoader({
  root: null,
  rootMargin: '50px',
  threshold: 0.01,
});

loader.observe(imageElement);
```

#### `getBestFormat()`

Detect best supported image format.

```typescript
const format = await getBestFormat();
// Returns: 'avif' | 'webp' | 'jpg'
```

### Performance Analyzer

#### `getPerformanceAnalyzer()`

Get singleton performance analyzer instance.

```typescript
const analyzer = getPerformanceAnalyzer();
```

#### `getWebVitals()`

Get current Core Web Vitals.

```typescript
const vitals = analyzer.getWebVitals();
// {
//   lcp: number | null,
//   fid: number | null,
//   cls: number | null,
//   ttfb: number | null,
//   fcp: number | null,
//   tti: number | null
// }
```

#### `getMetrics()`

Get complete performance metrics.

```typescript
const metrics = await analyzer.getMetrics();
// {
//   ...vitals,
//   loadTime: number,
//   domContentLoaded: number,
//   totalSize: number,
//   requestCount: number,
//   jsSize: number,
//   cssSize: number,
//   imageSize: number,
//   score: number
// }
```

#### `generateReport()`

Generate full performance report with issues and recommendations.

```typescript
const report = await analyzer.generateReport();
// {
//   metrics: PerformanceMetrics,
//   issues: PerformanceIssue[],
//   recommendations: string[],
//   score: number,
//   timestamp: number
// }
```

#### `mark(name)` & `measure(name, start, end?)`

Track custom performance events.

```typescript
analyzer.mark('feature-start');
// ... code to measure ...
analyzer.mark('feature-end');

const duration = analyzer.measure('feature-duration', 'feature-start', 'feature-end');
// Returns: duration in milliseconds
```

### Cache Strategies

#### `CacheManager`

Manage browser cache.

```typescript
const cache = new CacheManager('app-cache-v1');

// Add to cache
await cache.put(request, response);

// Get from cache
const response = await cache.match(request);

// Delete from cache
await cache.delete(request);

// Clear cache
await cache.clear();
```

#### `getCacheHeaders(strategy, maxAge?)`

Get cache headers for HTTP responses.

```typescript
const headers = getCacheHeaders('static', 31536000);
// {
//   'Cache-Control': 'public, max-age=31536000, immutable',
//   'Vary': 'Accept-Encoding'
// }
```

#### `networkFirst(request, config)`

Network-first caching strategy.

```typescript
const response = await networkFirst('/api/data', {
  name: 'api-cache-v1',
  maxAge: 300,
  networkTimeout: 5000,
});
```

#### `cacheFirst(request, config)`

Cache-first caching strategy.

```typescript
const response = await cacheFirst('/images/logo.png', {
  name: 'images-v1',
  maxAge: 2592000,
});
```

#### `staleWhileRevalidate(request, config)`

Stale-while-revalidate strategy.

```typescript
const response = await staleWhileRevalidate('/api/products', {
  name: 'api-cache-v1',
  maxAge: 300,
});
```

## React Hooks

### `useWebVitals()`

Monitor Core Web Vitals in components.

```tsx
function App() {
  const vitals = useWebVitals();

  return (
    <div>
      <p>LCP: {vitals.lcp}ms</p>
      <p>FID: {vitals.fid}ms</p>
      <p>CLS: {vitals.cls}</p>
    </div>
  );
}
```

### `usePerformanceMetrics()`

Get full performance metrics.

```tsx
function PerformanceWidget() {
  const { metrics, loading, refresh } = usePerformanceMetrics();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p>Score: {metrics.score}/100</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### `usePerformanceReport()`

Generate performance report.

```tsx
function PerformanceReport() {
  const { report, loading, refresh } = usePerformanceReport();

  if (loading) return <p>Generating...</p>;

  return (
    <div>
      <h2>Score: {report.score}/100</h2>
      <p>{report.issues.length} issues found</p>
    </div>
  );
}
```

### `usePerformanceMark(name)`

Track custom performance marks.

```tsx
function CheckoutFlow() {
  const { mark, measure } = usePerformanceMark('checkout');

  const handleCheckout = async () => {
    mark('start');
    await processCheckout();
    mark('end');
    const duration = measure('start', 'end');
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

### `useRenderTime(componentName)`

Track component render time.

```tsx
function ExpensiveComponent() {
  const renderTime = useRenderTime('ExpensiveComponent');

  return <p>Last render: {renderTime}ms</p>;
}
```

### `useSlowNetwork()`

Detect slow network conditions.

```tsx
function App() {
  const isSlowNetwork = useSlowNetwork();

  return (
    <div>
      {isSlowNetwork && <Banner>Slow network detected</Banner>}
    </div>
  );
}
```

### `useSaveDataMode()`

Detect save-data mode.

```tsx
function ImageGallery() {
  const saveData = useSaveDataMode();

  return saveData ? <p>Images hidden</p> : <Images />;
}
```

## Performance Budgets

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB | ≤ 200ms | 200ms - 600ms | > 600ms |
| FCP | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |

### Page Size Budgets

| Resource | Budget | Warning | Critical |
|----------|--------|---------|----------|
| Total | 1 MB | 1.5 MB | 3 MB |
| JavaScript | 500 KB | 1 MB | 2 MB |
| CSS | 100 KB | 200 KB | 500 KB |
| Images | Optimized | - | - |

## Best Practices

### Images

1. **Always use WebP/AVIF**
   ```tsx
   <OptimizedImage format="auto" />
   ```

2. **Lazy load below-the-fold images**
   ```tsx
   <OptimizedImage lazy={true} />
   ```

3. **Add width/height to prevent CLS**
   ```tsx
   <img width={800} height={600} />
   ```

4. **Preload critical images**
   ```tsx
   <OptimizedImage priority={true} />
   ```

### JavaScript

1. **Use code splitting**
   ```tsx
   const Component = lazy(() => import('./Component'));
   ```

2. **Defer non-critical scripts**
   ```html
   <script defer src="analytics.js"></script>
   ```

3. **Monitor bundle size**
   ```bash
   bun run build --analyze
   ```

### Caching

1. **Use appropriate strategies**
   ```tsx
   // Static assets
   cacheFirst(request, CACHE_CONFIGS.static);

   // API calls
   networkFirst(request, CACHE_CONFIGS.api);

   // Pages
   staleWhileRevalidate(request, CACHE_CONFIGS.pages);
   ```

2. **Set cache limits**
   ```tsx
   await limitCacheSize('images-v1', 100);
   ```

3. **Clean up old caches**
   ```tsx
   await cleanupOldCaches(['static-v2', 'api-v2']);
   ```

## Testing

### Manual Testing

```bash
# 1. Start dev server
cd web && bun run dev

# 2. Open performance page
open http://localhost:4321/analytics/performance

# 3. Check DevTools > Performance
# 4. View Core Web Vitals in Performance Insights
```

### Lighthouse

```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4321 --view

# Target scores:
# - Performance: 90+
# - Best Practices: 100
# - SEO: 90+
```

### WebPageTest

1. Go to https://www.webpagetest.org
2. Enter URL
3. Run test
4. Check:
   - First Byte: < 200ms
   - Start Render: < 1s
   - Speed Index: < 3s
   - Total Size: < 1MB

## Troubleshooting

### Images not lazy loading

1. Check `IntersectionObserver` support
2. Verify `data-src` attribute is set
3. Check `rootMargin` setting

### Performance score low

1. Check issues tab for specific problems
2. Review recommendations
3. Run Lighthouse audit
4. Check resource sizes

### Cache not working

1. Verify `caches` API support
2. Check cache name matches
3. Verify response is cacheable
4. Check cache size limits

## Examples

See full examples in:
- `/web/src/pages/analytics/performance.astro`
- `/web/src/components/examples/OptimizedImage.tsx`
- `/web/src/components/analytics/PerformanceMetrics.tsx`

## Next Steps

1. **Service Worker** - Add offline support
2. **RUM** - Track real user metrics
3. **CI Integration** - Automated performance tests
4. **Advanced Optimizations** - HTTP/3, prefetching

## Support

For questions or issues:
1. Check this README
2. Read inline documentation
3. Review examples
4. Check browser console for errors
