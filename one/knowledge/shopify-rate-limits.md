# Shopify API Rate Limits

**Version:** 1.0.0
**Last Updated:** 2025-11-22
**Cycle:** 12 of 100
**Status:** Research Complete

## Overview

Shopify enforces rate limits to ensure API stability and fair resource allocation across all apps. Understanding and handling rate limits is **critical** for production-ready integrations, especially for high-volume operations like inventory syncing, bulk imports, and real-time webhooks.

## Rate Limiting Models

Shopify uses **two different rate limiting approaches** depending on the API:

1. **GraphQL Admin API:** Calculated query cost (points-based)
2. **REST Admin API:** Request-based leaky bucket algorithm
3. **Storefront API:** Different limits for customer-facing queries

## GraphQL Admin API Rate Limits

### Cost-Based System

**Core Limits:**
- **Maximum available points:** 1,000 points
- **Restore rate:** 50 points per second
- **Maximum burst:** 1,000 points at once
- **Window:** Rolling 60-second window

**Formula:**
```
Available Points = min(1000, Current Points + (50 × seconds_elapsed))
```

**Example:**
```typescript
// Time 0s: 1000 points available
await query({ cost: 100 }); // 900 points remaining

// Time 2s: 900 + (50 × 2) = 1000 points available (capped at max)
await query({ cost: 500 }); // 500 points remaining

// Time 4s: 500 + (50 × 2) = 600 points available
await query({ cost: 700 }); // ERROR: Insufficient points
```

### Query Cost Calculation

**Factors affecting cost:**
1. **Number of fields** requested
2. **Nested connections** (products → variants → metafields)
3. **Number of items** in connections (`first: N`)
4. **Mutations** (generally higher cost than queries)

**Example costs:**
```graphql
# Simple query: ~5 points
query {
  shop {
    name
    email
  }
}

# Medium query: ~15 points
query {
  product(id: $id) {
    id
    title
    variants(first: 10) {
      edges {
        node {
          id
          price
        }
      }
    }
  }
}

# Complex query: ~50-100 points
query {
  products(first: 50) {
    edges {
      node {
        id
        title
        variants(first: 20) {
          edges {
            node {
              id
              price
              inventoryQuantity
              metafields(first: 10) {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Cost Monitoring

**GraphQL responses include cost information:**
```typescript
const response = await shopify.graphql(`
  query {
    products(first: 10) {
      edges {
        node { id title }
      }
    }
  }
`);

// Response includes extensions with cost data
console.log(response.extensions.cost);
/*
{
  requestedQueryCost: 12,
  actualQueryCost: 12,
  throttleStatus: {
    maximumAvailable: 1000,
    currentlyAvailable: 988,
    restoreRate: 50
  }
}
*/
```

### Rate Limit Headers (GraphQL)

GraphQL responses include cost information in the **extensions** field, not HTTP headers.

**Access cost data:**
```typescript
interface GraphQLCostExtensions {
  cost: {
    requestedQueryCost: number;      // Estimated cost before execution
    actualQueryCost: number;         // Actual cost after execution
    throttleStatus: {
      maximumAvailable: number;      // Max points (1000)
      currentlyAvailable: number;    // Points remaining
      restoreRate: number;           // Points restored per second (50)
    };
  };
}

const result = await shopify.graphql(query);
const cost = result.extensions.cost;

if (cost.throttleStatus.currentlyAvailable < 100) {
  console.warn("Low on API points, slowing down requests");
}
```

## REST Admin API Rate Limits

### Leaky Bucket Algorithm

**Core Limits:**
- **Bucket size:** 40 requests
- **Leak rate:** 2 requests per second
- **Refill time:** ~20 seconds for empty bucket

**How it works:**
```
1. Bucket starts at 40 requests
2. Each API call removes 1 request from bucket
3. Every second, 2 requests are restored
4. If bucket is empty, requests return 429 error

Example:
Time 0s:  40 requests available
Time 1s:  Make 5 requests → 35 remaining, 2 restored → 37 available
Time 2s:  37 + 2 = 39 available
Time 20s: Bucket refilled to 40 (maximum)
```

### Rate Limit Headers (REST)

**Every REST API response includes:**
```http
HTTP/1.1 200 OK
X-Shopify-Shop-Api-Call-Limit: 32/40
Retry-After: 2.0
```

**Header breakdown:**
- `X-Shopify-Shop-Api-Call-Limit`: `current_calls / bucket_size`
- `Retry-After`: Seconds to wait before retrying (present on 429 errors)

**Parsing headers:**
```typescript
async function fetchWithRateLimit(url: string) {
  const response = await fetch(url);

  // Check rate limit
  const limitHeader = response.headers.get('X-Shopify-Shop-Api-Call-Limit');
  if (limitHeader) {
    const [current, max] = limitHeader.split('/').map(Number);
    const usage = current / max;

    if (usage > 0.8) {
      console.warn(`Rate limit warning: ${current}/${max} (${usage * 100}%)`);
      await sleep(1000); // Slow down
    }
  }

  // Handle 429 errors
  if (response.status === 429) {
    const retryAfter = parseFloat(response.headers.get('Retry-After') || '1');
    console.log(`Rate limited, retrying after ${retryAfter}s`);
    await sleep(retryAfter * 1000);
    return fetchWithRateLimit(url); // Retry
  }

  return response.json();
}
```

### 429 Too Many Requests

**Response format:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 2.0

{
  "errors": "Exceeded 2 calls per second for api client. Reduce request rates to resume uninterrupted service."
}
```

## Storefront API Rate Limits

**Different limits for customer-facing queries:**
- **Bucket size:** 60 points (2× REST API)
- **Leak rate:** 2 points per second
- **Cost calculation:** Similar to GraphQL Admin API

**Key differences:**
- Higher limits than Admin API (customer-facing)
- No authentication required for public queries
- Optimized for product browsing, cart operations

**Not typically used in ONE Platform integrations** (focus on Admin API).

## Retry Strategies

### 1. Exponential Backoff

**Recommended by Shopify:**
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if it's a rate limit error
      if (error.status === 429) {
        const retryAfter = error.retryAfter || initialDelay * Math.pow(2, attempt);

        console.log(`Rate limited, attempt ${attempt + 1}/${maxRetries}, waiting ${retryAfter}ms`);

        await sleep(retryAfter);
        continue;
      }

      // Non-rate-limit error, throw immediately
      throw error;
    }
  }

  throw new Error(`Max retries (${maxRetries}) exceeded: ${lastError.message}`);
}

// Usage
const product = await retryWithBackoff(() =>
  shopify.graphql(getProductQuery, { id })
);
```

### 2. Rate Limit Headers Strategy

**Use Retry-After header:**
```typescript
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url);

    if (response.status === 429) {
      const retryAfter = parseFloat(response.headers.get('Retry-After') || '1');

      // Official Shopify recommendation: 1 second minimum
      const delay = Math.max(retryAfter * 1000, 1000);

      console.log(`Rate limited, retrying after ${delay}ms`);
      await sleep(delay);
      continue;
    }

    if (response.ok) {
      return response.json();
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  throw new Error('Max retries exceeded');
}
```

### 3. Adaptive Throttling

**Dynamically adjust request rate based on available points:**
```typescript
class AdaptiveThrottle {
  private lastCost: number = 0;
  private availablePoints: number = 1000;
  private maxPoints: number = 1000;
  private restoreRate: number = 50;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if low on points
    while (this.availablePoints < 100) {
      const waitTime = (100 - this.availablePoints) / this.restoreRate * 1000;
      console.log(`Low on points (${this.availablePoints}), waiting ${waitTime}ms`);
      await sleep(waitTime);
      this.availablePoints = Math.min(
        this.maxPoints,
        this.availablePoints + (waitTime / 1000) * this.restoreRate
      );
    }

    const result = await fn();

    // Update available points from response
    if (result.extensions?.cost) {
      this.availablePoints = result.extensions.cost.throttleStatus.currentlyAvailable;
      this.lastCost = result.extensions.cost.actualQueryCost;
    }

    return result;
  }
}

// Usage
const throttle = new AdaptiveThrottle();

for (const productId of productIds) {
  await throttle.execute(() =>
    shopify.graphql(getProductQuery, { id: productId })
  );
}
```

### 4. Queue-Based Rate Limiting

**Distribute requests evenly over time:**
```typescript
import PQueue from 'p-queue';

// Limit to 2 requests per second (REST API)
const queue = new PQueue({
  interval: 1000,  // 1 second
  intervalCap: 2,  // 2 requests per interval
});

async function queuedFetch(url: string) {
  return queue.add(() => fetch(url));
}

// Queue 1000 requests - automatically throttled to 2/second
const promises = productIds.map(id =>
  queuedFetch(`/admin/api/2024-10/products/${id}.json`)
);

const results = await Promise.all(promises);
```

## Bulk Operations for High-Volume Scenarios

### When to Use Bulk Operations

**Use bulk operations when:**
- Fetching >1,000 records
- Exporting entire product catalog
- Migrating data
- Generating analytics reports
- Processing historical orders

**Benefits:**
- Bypass standard rate limits
- Process millions of records
- Asynchronous operation (no timeout)
- Results delivered as JSONL file

### Bulk Query Example

**1. Start bulk operation:**
```graphql
mutation {
  bulkOperationRunQuery(
    query: """
    {
      products {
        edges {
          node {
            id
            title
            variants {
              edges {
                node {
                  id
                  price
                  inventoryQuantity
                }
              }
            }
          }
        }
      }
    }
    """
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
```

**2. Poll for completion:**
```graphql
query {
  currentBulkOperation {
    id
    status
    errorCode
    createdAt
    completedAt
    objectCount
    fileSize
    url
    partialDataUrl
  }
}
```

**3. Download results:**
```typescript
async function runBulkQuery(query: string) {
  // Start operation
  const startResult = await shopify.graphql(`
    mutation {
      bulkOperationRunQuery(query: ${JSON.stringify(query)}) {
        bulkOperation { id status }
        userErrors { field message }
      }
    }
  `);

  const operationId = startResult.bulkOperationRunQuery.bulkOperation.id;

  // Poll until complete
  let status = 'RUNNING';
  let url = null;

  while (status === 'RUNNING') {
    await sleep(5000); // Check every 5 seconds

    const pollResult = await shopify.graphql(`
      query {
        currentBulkOperation {
          status
          url
        }
      }
    `);

    status = pollResult.currentBulkOperation.status;
    url = pollResult.currentBulkOperation.url;
  }

  if (status === 'COMPLETED' && url) {
    // Download JSONL file
    const response = await fetch(url);
    const jsonl = await response.text();

    // Parse JSONL (one JSON object per line)
    const records = jsonl
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    return records;
  }

  throw new Error(`Bulk operation failed: ${status}`);
}

// Usage
const allProducts = await runBulkQuery(`
  {
    products {
      edges {
        node {
          id
          title
          variants {
            edges {
              node {
                id
                price
              }
            }
          }
        }
      }
    }
  }
`);
```

### Bulk Operation Limits

**Constraints:**
- **1 bulk operation** per shop at a time
- **1 million objects** maximum per operation
- **1 GB** maximum file size
- **24 hours** maximum runtime
- **7 days** results retention

## Best Practices

### 1. Monitor Rate Limit Proactively

```typescript
class RateLimitMonitor {
  private metrics = {
    totalRequests: 0,
    rateLimitHits: 0,
    averageAvailablePoints: 0,
  };

  async track(fn: () => Promise<any>) {
    this.metrics.totalRequests++;

    try {
      const result = await fn();

      if (result.extensions?.cost) {
        const available = result.extensions.cost.throttleStatus.currentlyAvailable;
        this.metrics.averageAvailablePoints =
          (this.metrics.averageAvailablePoints + available) / 2;

        // Alert if consistently low
        if (available < 200) {
          console.warn(`Low API points: ${available}/1000`);
          await this.logToOneEvents('shopify_low_api_points', { available });
        }
      }

      return result;
    } catch (error) {
      if (error.status === 429) {
        this.metrics.rateLimitHits++;
        await this.logToOneEvents('shopify_rate_limit_hit', {
          totalRequests: this.metrics.totalRequests,
          hitRate: this.metrics.rateLimitHits / this.metrics.totalRequests,
        });
      }
      throw error;
    }
  }

  async logToOneEvents(type: string, properties: any) {
    // Log to ONE Platform Events dimension
    await createEvent({
      type,
      thingId: appThingId,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### 2. Implement Circuit Breaker

**Stop making requests after repeated failures:**
```typescript
class CircuitBreaker {
  private failures = 0;
  private maxFailures = 5;
  private resetTimeout = 60000; // 1 minute
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt = 0;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.maxFailures) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.error(`Circuit breaker opened, retry after ${this.resetTimeout}ms`);
    }
  }
}
```

### 3. Batch Requests

**Combine multiple operations into single request:**
```graphql
# ❌ Bad: 3 separate requests
mutation { productCreate(input: $input1) { ... } }
mutation { productCreate(input: $input2) { ... } }
mutation { productCreate(input: $input3) { ... } }

# ✅ Good: 1 request with batched data
mutation {
  product1: productCreate(input: $input1) {
    product { id }
    userErrors { field message }
  }
  product2: productCreate(input: $input2) {
    product { id }
    userErrors { field message }
  }
  product3: productCreate(input: $input3) {
    product { id }
    userErrors { field message }
  }
}
```

### 4. Use Webhooks Instead of Polling

**Don't poll for updates - use webhooks:**
```typescript
// ❌ Bad: Poll for new orders every 30 seconds
setInterval(async () => {
  const orders = await shopify.graphql(getOrdersQuery);
  // Process orders...
}, 30000);

// ✅ Good: Subscribe to order creation webhook
await shopify.webhooks.register({
  topic: 'ORDERS_CREATE',
  path: '/webhooks/orders/create',
});

// Webhook handler
app.post('/webhooks/orders/create', async (req, res) => {
  const order = req.body;
  await processNewOrder(order);
  res.status(200).send('OK');
});
```

### 5. Cache Aggressively

**Cache data that doesn't change frequently:**
```typescript
import { createCache } from './cache';

const cache = createCache<Product[]>({
  ttl: 300000, // 5 minutes
});

async function getProducts() {
  return cache.getOrSet('all_products', async () => {
    const products = await shopify.graphql(getProductsQuery);
    return products;
  });
}

// First call: hits API
await getProducts(); // API call

// Subsequent calls within 5 minutes: cached
await getProducts(); // Cached
await getProducts(); // Cached
```

### 6. Stagger Requests

**Spread requests over time instead of bursts:**
```typescript
async function processProducts(productIds: string[]) {
  for (const [index, id] of productIds.entries()) {
    await processProduct(id);

    // Stagger: wait 500ms between requests
    if (index < productIds.length - 1) {
      await sleep(500);
    }
  }
}

// Processes 1000 products over ~8 minutes (2 requests/second)
await processProducts(productIds);
```

## Error Handling Examples

### Comprehensive Error Handler

```typescript
class ShopifyRateLimitError extends Error {
  constructor(
    public retryAfter: number,
    public availablePoints: number,
    message?: string
  ) {
    super(message || `Rate limited, retry after ${retryAfter}s`);
    this.name = 'ShopifyRateLimitError';
  }
}

async function executeShopifyQuery<T>(
  query: string,
  variables?: any
): Promise<T> {
  try {
    const result = await shopify.graphql(query, variables);

    // Check for userErrors
    const operationName = Object.keys(result.data || {})[0];
    if (result.data?.[operationName]?.userErrors?.length > 0) {
      throw new Error(
        `GraphQL validation error: ${result.data[operationName].userErrors[0].message}`
      );
    }

    // Check for low points
    const cost = result.extensions?.cost;
    if (cost && cost.throttleStatus.currentlyAvailable < 100) {
      console.warn(
        `Low on API points: ${cost.throttleStatus.currentlyAvailable}/1000`
      );
    }

    return result.data;
  } catch (error) {
    // Handle rate limiting
    if (error.status === 429 || error.message?.includes('THROTTLED')) {
      const retryAfter = error.retryAfter || 1;
      const available = error.extensions?.cost?.throttleStatus?.currentlyAvailable || 0;

      throw new ShopifyRateLimitError(retryAfter, available);
    }

    // Handle network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.error('Network error, will retry:', error.message);
      throw error;
    }

    // Unknown error
    console.error('Shopify query error:', error);
    throw error;
  }
}

// Usage with retry
const product = await retryWithBackoff(() =>
  executeShopifyQuery(getProductQuery, { id })
);
```

## Integration with ONE Platform

### Rate Limit Event Logging

```typescript
async function logRateLimitEvent(
  type: 'hit' | 'warning' | 'recovered',
  details: any
) {
  await createEvent({
    type: `shopify_rate_limit_${type}`,
    thingId: appThingId,
    groupId: merchantGroupId,
    properties: {
      timestamp: new Date().toISOString(),
      api: details.api || 'graphql',
      available_points: details.availablePoints,
      requested_cost: details.requestedCost,
      retry_after: details.retryAfter,
      endpoint: details.endpoint,
    },
  });
}

// Log when rate limited
try {
  await shopify.graphql(query);
} catch (error) {
  if (error instanceof ShopifyRateLimitError) {
    await logRateLimitEvent('hit', {
      availablePoints: error.availablePoints,
      retryAfter: error.retryAfter,
    });
  }
}
```

### Rate Limit Metrics Dashboard

```typescript
// Query rate limit events from ONE Platform
async function getRateLimitMetrics(groupId: string, since: Date) {
  const events = await queryEvents({
    groupId,
    type: { $regex: /^shopify_rate_limit/ },
    createdAt: { $gte: since },
  });

  const metrics = {
    total_hits: events.filter((e) => e.type === 'shopify_rate_limit_hit').length,
    total_warnings: events.filter((e) => e.type === 'shopify_rate_limit_warning').length,
    avg_available_points: 0,
    endpoints_affected: new Set<string>(),
  };

  events.forEach((event) => {
    if (event.properties.available_points) {
      metrics.avg_available_points += event.properties.available_points;
    }
    if (event.properties.endpoint) {
      metrics.endpoints_affected.add(event.properties.endpoint);
    }
  });

  metrics.avg_available_points /= events.length || 1;

  return metrics;
}
```

## Resources

- **API Limits Overview:** https://shopify.dev/docs/api/usage/limits
- **REST Rate Limits:** https://shopify.dev/docs/api/admin-rest/usage/rate-limits
- **GraphQL Best Practices:** https://shopify.dev/docs/api/usage/graphql
- **Bulk Operations Guide:** https://shopify.dev/docs/api/usage/bulk-operations
- **Rate Limit Blog:** https://www.shopify.com/partners/blog/rate-limits
- **Optimization Guide:** https://www.shopify.com/partners/blog/optimize-rate-limit

## Next Steps

- **Cycle 13:** Design rate-limit-aware service layer for ONE Platform
- **Cycle 14:** Implement retry strategies with exponential backoff
- **Cycle 15:** Create bulk operation handlers for large datasets
- **Cycle 16:** Build rate limit monitoring dashboard in ONE Platform

---

**Built for the ONE Platform - reliable, resilient, production-ready Shopify integration.**
