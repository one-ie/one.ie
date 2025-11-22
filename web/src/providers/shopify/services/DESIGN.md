# Shopify Services Design Document

**Version:** 1.0.0
**Date:** 2025-11-22
**Cycles:** 26-27 of 100
**Status:** Design Complete, Implementation Pending

---

## Executive Summary

This document describes the design of two foundational Effect.ts services for Shopify integration:

1. **ShopifyClient** - GraphQL communication layer with rate limiting
2. **ShopifyAuth** - OAuth 2.0 authentication and token management

These services provide the foundation for all Shopify operations in the ONE Platform, following Effect.ts patterns for composability, type safety, and error handling.

---

## Architecture Overview

### Service Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      ONE Platform                            │
│                  (6-Dimension Ontology)                      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   ShopifyProvider                            │
│           (Maps Shopify → ONE Ontology)                      │
└─────────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌──────────────────────┐      ┌──────────────────────┐
│   ShopifyClient      │      │   ShopifyAuth        │
│  (GraphQL Layer)     │      │  (OAuth Layer)       │
└──────────────────────┘      └──────────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
              ┌─────────────────────────────┐
              │   Shopify Admin API          │
              │   (GraphQL + OAuth 2.0)      │
              └─────────────────────────────┘
```

### Data Flow

```
User Request
    │
    ▼
ShopifyProvider.getProduct(id)
    │
    ├─▶ ShopifyAuth.getAccessToken(shop)
    │       │
    │       └─▶ [Retrieve encrypted token]
    │       └─▶ [Decrypt token]
    │       └─▶ Return: "shpat_abc123..."
    │
    └─▶ ShopifyClient.query(GET_PRODUCT, { id })
            │
            ├─▶ [Check rate limits]
            ├─▶ [Inject access token]
            ├─▶ [Execute GraphQL query]
            ├─▶ [Track cost from response]
            └─▶ Return: { product: { id, title, ... } }
    │
    ▼
Transform to ONE Ontology
    │
    ▼
Return Thing (type: "product")
```

---

## ShopifyClient Service

### Purpose

Handle all GraphQL communication with Shopify Admin API including rate limiting, retries, and error handling.

### Key Features

1. **Automatic Authentication**
   - Injects `X-Shopify-Access-Token` header
   - Retrieves token via ShopifyAuth service
   - Handles authentication errors gracefully

2. **Rate Limit Management**
   - Tracks available points (1000 max, 50/sec restore)
   - Estimates query cost before execution
   - Waits for points if needed (adaptive throttling)
   - Updates state from response extensions

3. **Retry Logic**
   - Exponential backoff for 429 errors
   - Configurable max attempts (default: 5)
   - Timing-aware delays (initial: 1s, max: 30s)
   - Only retries transient errors (network, rate limit)

4. **Error Handling**
   - Network errors (connection, timeout, DNS)
   - GraphQL errors (validation, execution)
   - Rate limit errors (429)
   - Authentication errors (401, 403)
   - Structured error types for each failure mode

5. **Bulk Operations**
   - Start bulk query for large datasets
   - Poll for completion
   - Download JSONL results
   - Parse into records

### Service Interface

```typescript
class ShopifyClient {
  query<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: QueryOptions
  ): Effect.Effect<T, NetworkError | GraphQLError | RateLimitError | AuthenticationError>

  mutate<T>(
    mutation: string,
    variables?: Record<string, unknown>,
    options?: QueryOptions
  ): Effect.Effect<T, NetworkError | GraphQLError | RateLimitError | AuthenticationError>

  bulkOperation(
    query: string
  ): Effect.Effect<BulkOperationResult, GraphQLError | BulkOperationError>

  getRateLimitStatus(): Effect.Effect<RateLimitState, never>

  estimateCost(
    query: string,
    variables?: Record<string, unknown>
  ): Effect.Effect<number, never>

  waitForRateLimit(estimatedCost: number): Effect.Effect<number, never>
}
```

### Error Types

1. **NetworkError**
   - Connection failed
   - Timeout
   - DNS resolution failed
   - Properties: `shop`, `message`, `code`, `cause`

2. **GraphQLError**
   - Query validation failed
   - Field doesn't exist
   - Type mismatch
   - Properties: `shop`, `query`, `errors[]`

3. **RateLimitError**
   - 429 Too Many Requests
   - Insufficient points
   - Properties: `shop`, `availablePoints`, `requestedCost`, `retryAfter`

4. **AuthenticationError**
   - Invalid access token
   - Expired token
   - Missing token
   - Properties: `shop`, `message`, `statusCode`

5. **BulkOperationError**
   - Bulk query failed
   - Download failed
   - Parse failed
   - Properties: `operationId`, `status`, `errorCode`, `message`

### Rate Limit Tracking

**In-Memory State:**

```typescript
interface RateLimitState {
  currentlyAvailable: number;  // Points available now
  maximumAvailable: number;    // Max points (1000)
  restoreRate: number;         // Points/second (50)
  lastUpdated: number;         // Timestamp
}
```

**Tracking Flow:**

1. **Before Query:**
   - Estimate query cost (heuristics)
   - Check if enough points available
   - Wait if needed (adaptive throttling)

2. **After Query:**
   - Extract cost from `response.extensions.cost`
   - Update state with actual cost
   - Update available points

3. **Estimation:**
   - Calculate restored points since last update
   - Add to current available
   - Cap at maximum (1000)

**Example:**

```typescript
// Time 0: 1000 points available
await client.query(expensiveQuery); // Costs 500 points
// State: { currentlyAvailable: 500, lastUpdated: 0 }

// Time 5s: Auto-calculate available
// Restored: 5s × 50 points/s = 250 points
// Available: 500 + 250 = 750 points

await client.query(anotherQuery); // Costs 100 points
// State: { currentlyAvailable: 650, lastUpdated: 5000 }
```

### Retry Strategy

**Exponential Backoff:**

```typescript
interface RetryOptions {
  maxAttempts: number;    // Default: 5
  initialDelay: number;   // Default: 1000ms
  maxDelay: number;       // Default: 30000ms
}

// Attempt 1: Fail → Wait 1s
// Attempt 2: Fail → Wait 2s
// Attempt 3: Fail → Wait 4s
// Attempt 4: Fail → Wait 8s
// Attempt 5: Fail → Throw error
```

**Retryable Errors:**
- ✅ Network errors (ECONNRESET, ETIMEDOUT)
- ✅ Rate limit errors (429)
- ✅ Server errors (500, 502, 503)
- ❌ Authentication errors (401, 403)
- ❌ Validation errors (400)
- ❌ Not found errors (404)

### Usage Examples

**Simple Query:**

```typescript
const program = Effect.gen(function* () {
  const client = yield* ShopifyClient;
  const result = yield* client.query(GET_PRODUCT, { id: "gid://shopify/Product/123" });
  return result.product;
});

const product = await Effect.runPromise(program.pipe(Effect.provide(ShopifyClientLive)));
```

**With Error Handling:**

```typescript
const program = Effect.gen(function* () {
  const client = yield* ShopifyClient;

  const result = yield* client.query(GET_PRODUCT, { id: "gid://shopify/Product/123" })
    .pipe(
      Effect.catchTag('RateLimitError', (error) => {
        console.log(`Rate limited, retry after ${error.retryAfter}s`);
        return Effect.fail(error);
      }),
      Effect.catchTag('NetworkError', (error) => {
        console.error('Network error:', error.message);
        return Effect.fail(error);
      })
    );

  return result.product;
});
```

**Bulk Operation:**

```typescript
const program = Effect.gen(function* () {
  const client = yield* ShopifyClient;

  // Start bulk operation
  const bulkResult = yield* client.bulkOperation(`
    {
      products {
        edges {
          node { id title }
        }
      }
    }
  `);

  // Download results (when completed)
  const products = yield* downloadBulkResults(bulkResult.url);
  return products;
});
```

---

## ShopifyAuth Service

### Purpose

Handle OAuth 2.0 authentication and secure token management for Shopify stores.

### Key Features

1. **OAuth 2.0 Flow**
   - Authorization code grant
   - State parameter for CSRF protection
   - Redirect URL validation
   - Code exchange for token

2. **Token Security**
   - AES-256-CBC encryption
   - Encrypted storage
   - Timing-safe HMAC verification
   - No plaintext tokens in database

3. **Multi-Shop Support**
   - Shop → GroupId mapping
   - One organization can have multiple shops
   - Shop credentials isolated by groupId

4. **HMAC Verification**
   - Timing-safe comparison
   - Prevents timing attacks
   - Validates request authenticity

### Service Interface

```typescript
class ShopifyAuth {
  buildAuthorizationUrl(
    params: OAuthAuthorizationParams
  ): Effect.Effect<string, InvalidShopDomainError>

  verifyCallback(
    params: OAuthCallbackParams,
    expectedState: string,
    clientSecret: string
  ): Effect.Effect<string, InvalidShopDomainError | HmacVerificationError | StateMismatchError>

  exchangeToken(
    shop: string,
    code: string,
    clientId: string,
    clientSecret: string
  ): Effect.Effect<AccessTokenResponse, TokenExchangeError>

  storeAccessToken(
    shop: string,
    groupId: string,
    tokenResponse: AccessTokenResponse,
    installedBy?: string
  ): Effect.Effect<string, TokenStorageError>

  getAccessToken(shop: string): Effect.Effect<string, TokenNotFoundError | TokenStorageError>

  refreshToken(shop: string): Effect.Effect<string, TokenNotFoundError | AuthorizationError>

  validateShop(shop: string): Effect.Effect<string, InvalidShopDomainError>

  verifyHmac(
    params: Record<string, string>,
    hmac: string,
    secret: string
  ): Effect.Effect<boolean, HmacVerificationError>

  getCredentials(shop: string): Effect.Effect<ShopCredentials, TokenNotFoundError>

  listShopsForGroup(groupId: string): Effect.Effect<string[], never>

  getGroupForShop(shop: string): Effect.Effect<string, ShopNotFoundError>

  revokeToken(shop: string, revokedBy?: string): Effect.Effect<void, TokenNotFoundError | TokenStorageError>

  encryptToken(token: string): Effect.Effect<string, TokenStorageError>

  decryptToken(encryptedToken: string): Effect.Effect<string, TokenStorageError>
}
```

### Error Types

1. **AuthorizationError**
   - OAuth flow failed
   - User denied access
   - Properties: `shop`, `reason`, `details`

2. **TokenNotFoundError**
   - No token stored for shop
   - Shop not installed
   - Properties: `shop`, `groupId`, `message`

3. **TokenStorageError**
   - Database error
   - Encryption failed
   - Decryption failed
   - Properties: `shop`, `operation`, `reason`, `cause`

4. **InvalidShopDomainError**
   - Invalid format
   - Not *.myshopify.com
   - Properties: `shop`, `reason`

5. **HmacVerificationError**
   - HMAC signature invalid
   - Tampering detected
   - Properties: `shop`, `providedHmac`, `reason`

6. **StateMismatchError**
   - CSRF state mismatch
   - Possible attack
   - Properties: `expected`, `received`, `message`

7. **TokenExchangeError**
   - Code exchange failed
   - Invalid code
   - Properties: `shop`, `code`, `httpStatus`, `reason`

8. **ShopNotFoundError**
   - Shop not in group
   - No mapping exists
   - Properties: `shop`, `groupId`, `message`

### OAuth Flow

**1. User Initiates Installation:**

```
GET /shopify/install?shop=example.myshopify.com
```

**2. Build Authorization URL:**

```typescript
const state = generateState(); // Random nonce
const url = yield* auth.buildAuthorizationUrl({
  shop: 'example.myshopify.com',
  clientId: 'abc123',
  scopes: 'read_products,write_orders',
  redirectUri: 'https://one.ie/shopify/callback',
  state
});

// Save state in session
session.oauthState = state;

// Redirect user to Shopify
res.redirect(url);
```

**3. User Approves (on Shopify):**

```
https://example.myshopify.com/admin/oauth/authorize
  ?client_id=abc123
  &scope=read_products,write_orders
  &redirect_uri=https://one.ie/shopify/callback
  &state=randomnonce123
```

**4. Shopify Redirects Back:**

```
GET /shopify/callback
  ?code=0907a61c0c8d55e99db179b68161bc00
  &hmac=700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf
  &shop=example.myshopify.com
  &state=randomnonce123
  &timestamp=1337178173
```

**5. Verify Callback:**

```typescript
const shop = yield* auth.verifyCallback(
  callbackParams,
  session.oauthState,
  clientSecret
);
// Verified: shop = 'example.myshopify.com'
```

**6. Exchange Code for Token:**

```typescript
const tokenResponse = yield* auth.exchangeToken(
  shop,
  callbackParams.code,
  clientId,
  clientSecret
);

// tokenResponse.access_token = 'shpat_abc123...'
```

**7. Store Token:**

```typescript
const credId = yield* auth.storeAccessToken(
  shop,
  groupId,
  tokenResponse,
  userId
);

// Token encrypted and stored in database
```

### Encryption

**Token Encryption (AES-256-CBC):**

```typescript
// Encrypt
const encrypted = encryptTokenValue('shpat_abc123...', encryptionKey);
// Format: "iv:encryptedData"
// Example: "a1b2c3d4e5f6....:7g8h9i0j1k2l...."

// Decrypt
const plaintext = decryptTokenValue(encrypted, encryptionKey);
// Returns: "shpat_abc123..."
```

**Encryption Key:**
- 256-bit key (32 bytes)
- Stored in environment variable
- Never committed to version control
- Rotated periodically (manual process)

### HMAC Verification

**Why Timing-Safe Comparison?**

Regular string comparison (`===`) can leak information through timing attacks:
- Comparison stops at first mismatch
- Attacker measures response time
- Can deduce correct characters one by one

**Solution: `crypto.timingSafeEqual()`**
- Constant-time comparison
- Always compares all bytes
- Prevents timing attacks

**Implementation:**

```typescript
function verifyHmacSignature(
  params: Record<string, string>,
  providedHmac: string,
  secret: string
): boolean {
  // 1. Calculate expected HMAC
  const calculatedHmac = calculateHmac(params, secret);

  // 2. Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedHmac, 'hex'),
      Buffer.from(calculatedHmac, 'hex')
    );
  } catch {
    return false; // Length mismatch
  }
}
```

### Multi-Shop Support

**Data Model:**

```typescript
// Shop credentials (one per shop)
interface ShopCredentials {
  shop: string;                  // 'example.myshopify.com'
  encryptedToken: string;        // 'iv:encrypted'
  scopes: string;                // 'read_products,write_orders'
  installedAt: number;           // 1732291200000
  groupId: string;               // 'group_123'
  associatedUser?: {...};        // Optional
}

// Shop → Group mapping
interface ShopGroupMapping {
  shop: string;      // 'example.myshopify.com'
  groupId: string;   // 'group_123'
  installedAt: number;
  installedBy?: string; // 'user_456'
}
```

**Queries:**

```typescript
// Get all shops for organization
const shops = yield* auth.listShopsForGroup('group_123');
// ['shop1.myshopify.com', 'shop2.myshopify.com']

// Get organization for shop
const groupId = yield* auth.getGroupForShop('example.myshopify.com');
// 'group_123'

// Get credentials
const creds = yield* auth.getCredentials('example.myshopify.com');
// { shop, encryptedToken, scopes, groupId, ... }
```

### Usage Examples

**Complete OAuth Flow:**

```typescript
// Step 1: Install initiation
app.get('/shopify/install', async (req, res) => {
  const { shop } = req.query;

  const program = Effect.gen(function* () {
    const auth = yield* ShopifyAuth;

    // Generate state
    const state = generateState();
    req.session.oauthState = state;

    // Build URL
    const url = yield* auth.buildAuthorizationUrl({
      shop,
      clientId: process.env.SHOPIFY_CLIENT_ID,
      scopes: 'read_products,write_orders',
      redirectUri: 'https://one.ie/shopify/callback',
      state
    });

    return url;
  });

  const url = await Effect.runPromise(program.pipe(Effect.provide(ShopifyAuthLive)));
  res.redirect(url);
});

// Step 2: OAuth callback
app.get('/shopify/callback', async (req, res) => {
  const program = Effect.gen(function* () {
    const auth = yield* ShopifyAuth;

    // Verify callback
    const shop = yield* auth.verifyCallback(
      req.query,
      req.session.oauthState,
      process.env.SHOPIFY_CLIENT_SECRET
    );

    // Exchange code for token
    const tokenResponse = yield* auth.exchangeToken(
      shop,
      req.query.code,
      process.env.SHOPIFY_CLIENT_ID,
      process.env.SHOPIFY_CLIENT_SECRET
    );

    // Store token
    const credId = yield* auth.storeAccessToken(
      shop,
      req.user.groupId,
      tokenResponse,
      req.user.id
    );

    return { shop, credId };
  });

  const result = await Effect.runPromise(program.pipe(Effect.provide(ShopifyAuthLive)));
  res.send(`Installation successful! Shop: ${result.shop}`);
});
```

**Using Access Token:**

```typescript
const program = Effect.gen(function* () {
  const auth = yield* ShopifyAuth;
  const client = yield* ShopifyClient;

  // Get token
  const token = yield* auth.getAccessToken('example.myshopify.com');

  // Use token in request (handled internally by ShopifyClient)
  const result = yield* client.query(GET_SHOP);

  return result.shop;
});
```

---

## Service Composition

### How Services Work Together

```typescript
// Example: Fetch product from Shopify
const getProduct = (shop: string, productId: string) =>
  Effect.gen(function* () {
    // 1. Get dependencies
    const auth = yield* ShopifyAuth;
    const client = yield* ShopifyClient;

    // 2. Get access token (decrypted)
    const token = yield* auth.getAccessToken(shop);

    // 3. Execute query (token injected automatically)
    const result = yield* client.query(GET_PRODUCT, { id: productId });

    // 4. Return result
    return result.product;
  });

// Usage
const program = getProduct('example.myshopify.com', 'gid://shopify/Product/123')
  .pipe(
    Effect.provide(ShopifyAuthLive),
    Effect.provide(ShopifyClientLive)
  );

const product = await Effect.runPromise(program);
```

### Dependency Injection

**Service Layers:**

```typescript
// Define services
const ShopifyAuthLive = Layer.succeed(ShopifyAuth, {...});
const ShopifyClientLive = Layer.succeed(ShopifyClient, {...});

// Compose layers
const ShopifyServices = Layer.mergeAll(
  ShopifyAuthLive,
  ShopifyClientLive
);

// Provide to program
const program = Effect.gen(function* () {
  // Services auto-injected
  const auth = yield* ShopifyAuth;
  const client = yield* ShopifyClient;

  // Use services...
});

const result = await Effect.runPromise(
  program.pipe(Effect.provide(ShopifyServices))
);
```

### Error Handling

**Comprehensive Error Handling:**

```typescript
const program = Effect.gen(function* () {
  const auth = yield* ShopifyAuth;
  const client = yield* ShopifyClient;

  const token = yield* auth.getAccessToken(shop)
    .pipe(
      Effect.catchTag('TokenNotFoundError', (error) => {
        // Shop not installed, redirect to install
        console.log(`Shop not installed: ${error.shop}`);
        return Effect.fail({ type: 'NotInstalled', shop: error.shop });
      }),
      Effect.catchTag('TokenStorageError', (error) => {
        // Database error
        console.error(`Storage error: ${error.reason}`);
        return Effect.fail({ type: 'StorageError', message: error.reason });
      })
    );

  const result = yield* client.query(GET_PRODUCT, { id })
    .pipe(
      Effect.catchTag('RateLimitError', (error) => {
        // Rate limited, wait and retry
        console.log(`Rate limited, retry after ${error.retryAfter}s`);
        return Effect.fail({ type: 'RateLimit', retryAfter: error.retryAfter });
      }),
      Effect.catchTag('AuthenticationError', (error) => {
        // Token expired or invalid, re-authenticate
        console.error(`Auth error: ${error.message}`);
        return Effect.fail({ type: 'AuthError', message: error.message });
      }),
      Effect.catchTag('NetworkError', (error) => {
        // Network issue, retry
        console.error(`Network error: ${error.message}`);
        return Effect.fail({ type: 'NetworkError', message: error.message });
      })
    );

  return result.product;
});
```

---

## Design Decisions

### 1. Effect.ts Over Promises

**Why Effect.ts?**
- ✅ Composable error handling (tagged errors)
- ✅ Type-safe error types
- ✅ Dependency injection via Context
- ✅ Retry/timeout built-in
- ✅ Testing easier (mock layers)

**Alternative Considered: Plain async/await**
- ❌ Error types not type-safe (throw any)
- ❌ No built-in retry/timeout
- ❌ Dependency injection manual
- ❌ Testing requires mocks/stubs

**Decision: Effect.ts wins for composability and type safety.**

### 2. In-Memory Rate Limit Tracking

**Why In-Memory?**
- ✅ Fast access (no database roundtrip)
- ✅ Restored points calculated on-demand
- ✅ Stateless (no session dependency)
- ✅ Shared across all requests (singleton)

**Alternative Considered: Database storage**
- ❌ Slower (100ms+ latency)
- ❌ Race conditions (concurrent updates)
- ❌ Eventual consistency issues

**Decision: In-memory wins for performance.**

**Trade-off:** Rate limit state lost on server restart (acceptable, resets to maximum).

### 3. Tagged Error Types

**Why Tagged Errors?**
- ✅ Discriminated unions (exhaustive checking)
- ✅ Pattern matching via `catchTag`
- ✅ Type-safe error properties
- ✅ Self-documenting (clear failure modes)

**Alternative Considered: Error codes**
- ❌ Not type-safe (string codes)
- ❌ Need manual mapping
- ❌ Easy to miss cases

**Decision: Tagged errors win for type safety.**

### 4. Timing-Safe HMAC Verification

**Why Timing-Safe?**
- ✅ Prevents timing attacks
- ✅ Constant-time comparison
- ✅ Security best practice

**Alternative Considered: String comparison**
- ❌ Vulnerable to timing attacks
- ❌ Leaks information

**Decision: Timing-safe wins for security.**

### 5. AES-256-CBC Encryption

**Why AES-256-CBC?**
- ✅ Industry standard
- ✅ Built into Node.js crypto
- ✅ Secure (256-bit key)
- ✅ Fast

**Alternative Considered: AES-GCM**
- ✅ Authenticated encryption
- ❌ More complex API
- ❌ Overkill for token storage

**Decision: AES-256-CBC wins for simplicity and security.**

### 6. Multi-Shop via GroupId

**Why GroupId Mapping?**
- ✅ Aligns with 6-dimension ontology
- ✅ Multi-tenant by design
- ✅ One org can have multiple shops

**Alternative Considered: One shop per org**
- ❌ Limited (can't support multi-shop merchants)
- ❌ Doesn't scale

**Decision: Multi-shop wins for flexibility.**

---

## Implementation Plan

### Cycle 26: ShopifyClient Service ✅
**Status:** Design Complete

**Deliverables:**
- ✅ Service interface definition
- ✅ Error type definitions
- ✅ Rate limit tracking design
- ✅ Retry logic design
- ✅ Helper functions (stubs)

**Next Steps (Cycles 28-39):**
- Cycle 28-30: HTTP client integration
- Cycle 31-33: Rate limit middleware
- Cycle 34-36: Retry logic implementation
- Cycle 37-39: Logging and monitoring

### Cycle 27: ShopifyAuth Service ✅
**Status:** Design Complete

**Deliverables:**
- ✅ Service interface definition
- ✅ Error type definitions
- ✅ OAuth flow design
- ✅ Encryption design
- ✅ Helper functions (stubs)

**Next Steps (Cycles 40-51):**
- Cycle 40-42: OAuth flow implementation
- Cycle 43-45: Token storage (Convex)
- Cycle 46-48: Encryption implementation
- Cycle 49-51: Multi-shop management

---

## Dependencies

### Required Context

Both services require:
- **Shop domain** - Shopify store (e.g., example.myshopify.com)
- **GroupId** - ONE Platform organization ID
- **Configuration** - API credentials from environment

### Environment Variables

```bash
# Shopify OAuth Credentials
SHOPIFY_CLIENT_ID=abc123def456          # From Partners dashboard
SHOPIFY_CLIENT_SECRET=xyz789uvw012      # From Partners dashboard
SHOPIFY_OAUTH_CALLBACK=https://one.ie/shopify/callback

# Encryption
SHOPIFY_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef  # 64 hex chars (32 bytes)

# API Configuration
SHOPIFY_API_VERSION=2025-10             # API version
SHOPIFY_SCOPES=read_products,write_orders,read_customers  # Default scopes
```

### External Dependencies

```json
{
  "effect": "^3.0.0",           // Effect.ts runtime
  "crypto": "node:crypto"       // Node.js crypto (built-in)
}
```

---

## Testing Strategy

### Unit Tests

**ShopifyClient:**
- Query execution (success)
- Mutation execution (success)
- Rate limit tracking
- Retry logic (exponential backoff)
- Error handling (network, GraphQL, rate limit)
- Cost estimation

**ShopifyAuth:**
- OAuth URL building
- HMAC verification
- State validation
- Token encryption/decryption
- Token storage/retrieval
- Multi-shop mapping

### Integration Tests

- Complete OAuth flow (end-to-end)
- Token exchange with Shopify API
- GraphQL query with real shop
- Rate limit handling (429 errors)
- Bulk operations

### Test Fixtures

```typescript
// Mock Shopify responses
const mockProductResponse = {
  data: {
    product: {
      id: 'gid://shopify/Product/123',
      title: 'Test Product'
    }
  },
  extensions: {
    cost: {
      requestedQueryCost: 12,
      actualQueryCost: 12,
      throttleStatus: {
        maximumAvailable: 1000,
        currentlyAvailable: 988,
        restoreRate: 50
      }
    }
  }
};

// Mock access token response
const mockTokenResponse: AccessTokenResponse = {
  access_token: 'shpat_abc123def456',
  scope: 'read_products,write_orders',
  expires_in: null,
  associated_user: {
    id: 12345,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    email_verified: true,
    account_owner: true,
    locale: 'en',
    collaborator: false
  }
};
```

---

## Performance Considerations

### Rate Limit Optimization

**Target:** 95% point utilization without 429 errors

**Strategy:**
1. Estimate cost before query
2. Wait if insufficient points
3. Track actual cost from response
4. Adjust estimator based on history

**Metrics to Monitor:**
- Average available points
- 429 error rate (target: <1%)
- Query cost accuracy (estimate vs actual)

### Caching

**What to Cache:**
- ✅ Shop → GroupId mapping (5 min TTL)
- ✅ Encrypted tokens (in-memory, 1 hour TTL)
- ❌ GraphQL responses (handled by ShopifyProvider)

**Why Cache Tokens?**
- Reduces database reads
- Faster authentication
- Still secure (encrypted in cache)

### Bulk Operations

**When to Use:**
- >1,000 records needed
- Large exports (all products, all orders)
- Analytics queries

**Performance:**
- Bypasses rate limits
- Processes millions of records
- Asynchronous (no timeout)

---

## Security Considerations

### Token Security

1. **Encryption:**
   - AES-256-CBC encryption
   - Random IV per token
   - 256-bit encryption key

2. **Storage:**
   - Never store plaintext tokens
   - Encrypt before database write
   - Decrypt only when needed

3. **Key Management:**
   - Encryption key in environment variable
   - Never commit to version control
   - Rotate periodically (manual)

### HMAC Verification

1. **Timing-Safe Comparison:**
   - Use `crypto.timingSafeEqual()`
   - Prevents timing attacks
   - Constant-time comparison

2. **Signature Validation:**
   - Verify all OAuth callbacks
   - Check webhook signatures
   - Reject invalid signatures

### CSRF Protection

1. **State Parameter:**
   - Random nonce (32 bytes)
   - Stored in session
   - Verified on callback

2. **Redirect URI Validation:**
   - Must match configured URL
   - HTTPS required
   - No open redirects

---

## Monitoring & Observability

### Metrics to Track

**ShopifyClient:**
- Total queries/mutations
- Rate limit hits (429 errors)
- Average available points
- Query cost (estimated vs actual)
- Retry attempts
- Error rates by type

**ShopifyAuth:**
- OAuth flows initiated
- OAuth flows completed
- Token exchanges (success/failure)
- HMAC verification failures
- Token retrievals
- Encryption/decryption errors

### Logging

**Structured Logs:**

```typescript
// Query execution
{
  service: 'ShopifyClient',
  operation: 'query',
  shop: 'example.myshopify.com',
  query: 'GET_PRODUCT',
  cost: { requested: 12, actual: 12 },
  available: 988,
  duration: 234
}

// OAuth flow
{
  service: 'ShopifyAuth',
  operation: 'exchangeToken',
  shop: 'example.myshopify.com',
  groupId: 'group_123',
  success: true,
  duration: 1234
}

// Error
{
  service: 'ShopifyClient',
  operation: 'query',
  shop: 'example.myshopify.com',
  error: {
    type: 'RateLimitError',
    availablePoints: 50,
    requestedCost: 100,
    retryAfter: 2
  }
}
```

### Alerts

**Critical:**
- Rate limit error rate >5%
- Token decryption failures
- HMAC verification failures

**Warning:**
- Average available points <200
- Retry rate >10%
- OAuth flow abandonment >50%

---

## Future Enhancements

### Phase 2 (Cycles 52-60)
- Token refresh flow (online access)
- Multi-location support
- Webhook signature verification
- Batch query optimization

### Phase 3 (Cycles 61-70)
- GraphQL cost cache (improve estimates)
- Adaptive rate limiting (ML-based)
- Circuit breaker improvements
- Request deduplication

### Phase 4 (Cycles 71-80)
- Multi-region support
- Token rotation automation
- Advanced caching strategies
- Performance optimization

---

## Conclusion

These services provide a solid foundation for Shopify integration:

✅ **Type-safe** - Effect.ts + TypeScript
✅ **Composable** - Service layers + dependency injection
✅ **Resilient** - Retry logic + error handling
✅ **Secure** - Encryption + HMAC verification
✅ **Performant** - Rate limiting + bulk operations
✅ **Observable** - Logging + metrics

**Next Steps:**
1. Implement HTTP client (Cycles 28-30)
2. Implement OAuth flow (Cycles 40-42)
3. Add Convex storage (Cycles 43-45)
4. Integrate with ShopifyProvider (Cycles 52-54)

---

**Design Review:** ✅ Complete
**Implementation:** 🔄 Pending
**Testing:** 🔄 Pending
**Documentation:** ✅ Complete
