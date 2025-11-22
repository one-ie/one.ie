# Shopify Services

**Effect.ts service layer for Shopify integration**

This directory contains all Effect.ts services for interacting with the Shopify Admin API. Services are designed using the Effect.ts pattern for composability, type safety, and robust error handling.

---

## Service Overview

### Foundation Services (Cycles 26-27)

#### 🔌 ShopifyClient
**Purpose:** GraphQL communication layer with rate limiting and retry logic

**Features:**
- Query/mutation execution with automatic authentication
- Rate limit monitoring (1000 points max, 50 points/sec restore)
- Exponential backoff retry for transient errors
- Bulk operations for large datasets (>1,000 records)
- Cost estimation and tracking

**Usage:**
```typescript
import { ShopifyClient } from '@/providers/shopify/services';

const program = Effect.gen(function* () {
  const client = yield* ShopifyClient;
  const result = yield* client.query(GET_PRODUCT, { id: "gid://shopify/Product/123" });
  return result.product;
});
```

**Error Types:**
- `NetworkError` - Connection, timeout, DNS failures
- `GraphQLError` - Query validation, execution errors
- `RateLimitError` - 429 Too Many Requests
- `AuthenticationError` - Invalid/expired access token
- `BulkOperationError` - Bulk query failures

---

See full documentation in DESIGN.md
