# Shopify GraphQL vs REST API

**Version:** 1.0.0
**Last Updated:** 2025-11-22
**Cycle:** 11 of 100
**Status:** Research Complete

## Executive Summary

**Critical Update (April 2025):** Shopify mandates GraphQL for all new public apps. The REST Admin API is now legacy, and migration is required for modern integrations.

**Recommendation for ONE Platform:** Use **GraphQL Admin API exclusively** for all new Shopify integrations. REST API should only be used for legacy support or specific edge cases where GraphQL is not yet available.

## API Comparison Matrix

| Feature | GraphQL Admin API | REST Admin API | Winner |
|---------|------------------|----------------|--------|
| **Status** | Current, required for new apps | Legacy (deprecated Oct 2024) | GraphQL ✅ |
| **Performance** | 75% cost reduction, 5x fewer calls | Fixed cost per endpoint | GraphQL ✅ |
| **Flexibility** | Fetch exact fields needed | Fixed response structure | GraphQL ✅ |
| **Bulk Operations** | Native support, up to 100 records | Multiple individual requests | GraphQL ✅ |
| **Rate Limiting** | Cost-based (1000 points/min) | Request-based (40 req/sec) | GraphQL ✅ |
| **Learning Curve** | Steeper (query language) | Simpler (standard HTTP) | REST ✅ |
| **Caching** | Complex (query-specific) | Simple (URL-based) | REST ✅ |
| **Bandwidth** | 30% reduction | Standard | GraphQL ✅ |
| **Documentation** | Comprehensive, current | Legacy, outdated | GraphQL ✅ |

## Migration Timeline

**Critical Dates:**
- **October 1, 2024:** REST Admin API officially marked as legacy
- **April 1, 2025:** All new public apps **must use GraphQL exclusively**
- **Existing Apps:** Can continue using REST but should plan migration

**ONE Platform Strategy:**
- ✅ Build all new integrations with GraphQL
- ✅ Use GraphQL for metafields, products, orders, inventory
- ⚠️ Plan REST deprecation for existing integrations
- ✅ Target 100% GraphQL by Q2 2025

## Performance Comparison

### Real-World Case Studies

**Case Study 1: API Call Reduction**
- **Before (REST):** 200,000 API calls
- **After (GraphQL):** 40,000 API calls
- **Improvement:** 5x reduction (80% fewer calls)

**Case Study 2: Query Cost Optimization**
- **Before (REST):** Fixed cost per endpoint, multiple endpoints needed
- **After (GraphQL):** Single query fetches nested data
- **Improvement:** 75% cost reduction, increased throughput beyond REST limits

**Case Study 3: Bandwidth Efficiency**
- **GraphQL:** 30% reduction in bandwidth usage
- **Reason:** Fetch only required fields, eliminate over-fetching

### Performance Metrics

```typescript
// REST: Multiple requests required
GET /admin/api/2024-10/products/123.json          // Request 1
GET /admin/api/2024-10/products/123/variants.json // Request 2
GET /admin/api/2024-10/products/123/images.json   // Request 3
GET /admin/api/2024-10/products/123/metafields.json // Request 4
// Total: 4 requests, ~40 points cost, ~200ms latency

// GraphQL: Single request
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    title
    variants(first: 10) { edges { node { id price } } }
    images(first: 5) { edges { node { url } } }
    metafields(first: 10) { edges { node { key value } } }
  }
}
// Total: 1 request, ~15 points cost, ~80ms latency
// 75% cost reduction, 60% latency improvement
```

## GraphQL API Deep Dive

### Query Structure

**Basic Query:**
```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    title
    description
    variants(first: 10) {
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
```

**Variables:**
```json
{
  "id": "gid://shopify/Product/123456789"
}
```

### Mutations

**Create/Update Product:**
```graphql
mutation ProductCreate($input: ProductInput!) {
  productCreate(input: $input) {
    product {
      id
      title
      status
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "title": "New Product",
    "descriptionHtml": "<p>Product description</p>",
    "vendor": "ONE Platform",
    "productType": "Digital Course"
  }
}
```

### Pagination

**Cursor-Based Pagination:**
```graphql
query GetProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    edges {
      cursor
      node {
        id
        title
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Implementation:**
```typescript
async function* fetchAllProducts() {
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const result = await shopify.graphql(`
      query GetProducts($first: Int!, $after: String) {
        products(first: 250, after: $after) {
          edges {
            cursor
            node { id title }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `, { first: 250, after: cursor });

    yield result.products.edges.map(e => e.node);

    hasNextPage = result.products.pageInfo.hasNextPage;
    cursor = result.products.pageInfo.endCursor;
  }
}
```

### Bulk Operations

**Bulk Query (for large datasets):**
```graphql
mutation BulkOperationRunQuery($query: String!) {
  bulkOperationRunQuery(query: $query) {
    bulkOperation {
      id
      status
      url
    }
    userErrors {
      field
      message
    }
  }
}
```

**Query String:**
```graphql
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
```

**Bulk operations benefits:**
- Process up to **millions of records**
- Returns JSONL file with results
- Bypasses standard rate limits
- Ideal for data exports, migrations, analytics

### Error Handling

**GraphQL uses `userErrors` field:**
```typescript
const result = await shopify.graphql(`
  mutation ProductCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product { id }
      userErrors {
        field
        message
      }
    }
  }
`, { input });

if (result.productCreate.userErrors.length > 0) {
  console.error("Validation errors:", result.productCreate.userErrors);
  // Log to ONE Platform Events dimension
  await createEvent({
    type: "shopify_product_create_failed",
    thingId: appThingId,
    properties: {
      errors: result.productCreate.userErrors,
      input: input
    }
  });
  throw new Error("Product creation failed");
}

const product = result.productCreate.product;
```

## REST API Reference (Legacy)

### Basic Endpoints

**Get Product:**
```http
GET /admin/api/2024-10/products/123456789.json
```

**Create Product:**
```http
POST /admin/api/2024-10/products.json
Content-Type: application/json

{
  "product": {
    "title": "New Product",
    "body_html": "<p>Product description</p>",
    "vendor": "ONE Platform",
    "product_type": "Digital Course"
  }
}
```

**Update Product:**
```http
PUT /admin/api/2024-10/products/123456789.json
Content-Type: application/json

{
  "product": {
    "id": 123456789,
    "title": "Updated Product Title"
  }
}
```

### Pagination

**Link Header-Based:**
```http
GET /admin/api/2024-10/products.json?limit=250

Response Headers:
Link: <https://shop.myshopify.com/admin/api/2024-10/products.json?limit=250&page_info=abc123>; rel="next"
```

**Implementation:**
```typescript
async function* fetchAllProductsREST() {
  let url = '/admin/api/2024-10/products.json?limit=250';

  while (url) {
    const response = await fetch(url);
    const data = await response.json();
    yield data.products;

    // Parse Link header for next page
    const linkHeader = response.headers.get('Link');
    url = parseLinkHeader(linkHeader)?.next || null;
  }
}
```

## When to Use Each API

### Use GraphQL When:

1. **Fetching Nested Data**
   ```graphql
   # Single request for product + variants + metafields + images
   query {
     product(id: $id) {
       title
       variants(first: 50) { edges { node { price } } }
       metafields(first: 10) { edges { node { key value } } }
       images(first: 5) { edges { node { url } } }
     }
   }
   ```

2. **Optimizing for Performance**
   - Fetch only needed fields
   - Reduce bandwidth by 30%
   - 75% cost reduction vs REST

3. **Bulk Operations**
   - Exporting large datasets
   - Migrations
   - Analytics queries

4. **Complex Queries**
   - Filtering by metafield values
   - Multi-resource queries
   - Relationship traversal

5. **New Apps (Required)**
   - All new apps after April 2025 **must use GraphQL**

### Use REST When:

1. **Simple CRUD Operations**
   ```http
   # Quick product lookup
   GET /admin/api/2024-10/products/123.json
   ```

2. **Caching Requirements**
   - REST responses easier to cache (URL-based)
   - Standard HTTP caching headers

3. **Legacy Integration Support**
   - Existing apps built on REST
   - Third-party tools expecting REST

4. **Specific Endpoints Not Yet in GraphQL**
   - Check API coverage: https://shopify.dev/docs/api/admin-graphql

**Note:** REST should be used **only** for legacy support. All new development should use GraphQL.

## Best Practices

### 1. Query Optimization

**✅ Good: Fetch only needed fields**
```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    title
    status
  }
}
```

**❌ Bad: Fetch all fields**
```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    # ... 50+ fields
  }
}
```

### 2. Batch Mutations

**✅ Good: Batch metafield updates**
```graphql
mutation BatchUpdate($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id }
    userErrors { field message }
  }
}
```

**❌ Bad: Individual mutations**
```graphql
# Sending 100 separate mutations
mutation UpdateMetafield($metafield: MetafieldsSetInput!) {
  metafieldsSet(metafields: [$metafield]) {
    metafields { id }
  }
}
```

### 3. Use Fragments for Reusability

```graphql
fragment ProductBasicInfo on Product {
  id
  title
  status
  createdAt
  updatedAt
}

fragment ProductInventory on Product {
  totalInventory
  tracksInventory
  variants(first: 50) {
    edges {
      node {
        inventoryQuantity
      }
    }
  }
}

query GetProduct($id: ID!) {
  product(id: $id) {
    ...ProductBasicInfo
    ...ProductInventory
  }
}
```

### 4. Handle Pagination Correctly

```typescript
// ✅ Good: Cursor-based pagination with proper limits
async function getAllProducts() {
  const products = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const result = await fetchProducts(250, cursor);
    products.push(...result.edges.map(e => e.node));

    hasNextPage = result.pageInfo.hasNextPage;
    cursor = result.pageInfo.endCursor;

    // Rate limit protection
    await sleep(500);
  }

  return products;
}

// ❌ Bad: Fetching all at once or using offset-based pagination
async function getAllProducts() {
  return await fetchProducts(10000, 0); // Will fail or timeout
}
```

### 5. Error Handling Strategy

```typescript
async function executeGraphQLMutation(mutation, variables) {
  try {
    const result = await shopify.graphql(mutation, variables);

    // Check for userErrors (validation/business logic errors)
    const operation = Object.keys(result)[0];
    if (result[operation].userErrors?.length > 0) {
      await logToOneEvents({
        type: "shopify_mutation_validation_error",
        errors: result[operation].userErrors
      });
      throw new ValidationError(result[operation].userErrors);
    }

    return result[operation];
  } catch (error) {
    // Network or GraphQL syntax errors
    await logToOneEvents({
      type: "shopify_mutation_error",
      error: error.message
    });
    throw error;
  }
}
```

### 6. Query Cost Monitoring

```typescript
async function executeWithCostTracking(query, variables) {
  const result = await shopify.graphql(query, variables);

  // GraphQL extensions contain cost information
  const cost = result.extensions?.cost;

  if (cost) {
    console.log(`Query cost: ${cost.actualQueryCost}/${cost.throttleStatus.currentlyAvailable}`);

    // Log to ONE Platform Events
    await createEvent({
      type: "shopify_query_executed",
      properties: {
        actualCost: cost.actualQueryCost,
        availablePoints: cost.throttleStatus.currentlyAvailable,
        maximumAvailable: cost.throttleStatus.maximumAvailable
      }
    });
  }

  return result;
}
```

## Migration Strategy: REST → GraphQL

### Phase 1: Audit (Week 1)

**Identify all REST API usage:**
```bash
# Find REST API calls
grep -r "admin/api.*\.json" ./src
grep -r "shopify.rest\." ./src

# Categorize by endpoint
grep -r "products.json" ./src > rest-products.txt
grep -r "orders.json" ./src > rest-orders.txt
grep -r "customers.json" ./src > rest-customers.txt
```

### Phase 2: Map REST to GraphQL (Week 2)

**Create mapping document:**
```markdown
| REST Endpoint | GraphQL Query/Mutation | Complexity |
|---------------|------------------------|------------|
| GET /products/{id}.json | product(id: $id) | Low |
| POST /products.json | productCreate(input: $input) | Medium |
| GET /products/{id}/metafields.json | product(id: $id) { metafields } | Low |
```

### Phase 3: Implement GraphQL (Weeks 3-6)

**Create GraphQL service layer:**
```typescript
// services/shopify/graphql/products.ts
export async function getProduct(id: string) {
  return await shopify.graphql(`
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        variants(first: 50) {
          edges { node { id price inventoryQuantity } }
        }
      }
    }
  `, { id });
}

// Replace REST calls incrementally
// Before:
const product = await shopify.rest.Product.find({ id: 123 });

// After:
const product = await getProduct("gid://shopify/Product/123");
```

### Phase 4: Test in Parallel (Week 7)

**Run both APIs side-by-side:**
```typescript
async function testMigration(productId) {
  const [restResult, graphqlResult] = await Promise.all([
    fetchProductREST(productId),
    fetchProductGraphQL(productId)
  ]);

  // Compare results
  const differences = compareResults(restResult, graphqlResult);
  if (differences.length > 0) {
    console.warn("Migration discrepancies:", differences);
  }
}
```

### Phase 5: Cutover (Week 8)

**Remove REST code:**
```typescript
// Remove REST imports
- import { Shopify } from '@shopify/shopify-api/rest/admin/2024-10';

// Remove REST service files
- services/shopify/rest/

// Update all imports to GraphQL services
+ import { getProduct } from 'services/shopify/graphql/products';
```

## Integration with ONE Platform

### Service Layer Architecture

```typescript
// services/shopify/client.ts
import { shopifyGraphQL } from './graphql/client';

export const ShopifyService = {
  // Use GraphQL for all operations
  products: {
    get: (id) => shopifyGraphQL.getProduct(id),
    create: (input) => shopifyGraphQL.createProduct(input),
    update: (id, input) => shopifyGraphQL.updateProduct(id, input),
    list: (filters) => shopifyGraphQL.listProducts(filters)
  },

  metafields: {
    set: (metafields) => shopifyGraphQL.setMetafields(metafields),
    get: (ownerId, namespace, key) => shopifyGraphQL.getMetafield(ownerId, namespace, key)
  },

  // Legacy REST only if absolutely necessary
  legacy: {
    // Deprecated methods with warnings
  }
};
```

### ONE Platform Thing Creation

```typescript
async function syncShopifyProduct(shopifyProductId: string) {
  // Fetch from Shopify using GraphQL
  const shopifyProduct = await ShopifyService.products.get(
    `gid://shopify/Product/${shopifyProductId}`
  );

  // Create ONE Platform Thing
  const thingId = await createThing({
    type: "shopify_product",
    groupId: merchantGroupId,
    properties: {
      shopify_product_id: shopifyProduct.id,
      title: shopifyProduct.title,
      status: shopifyProduct.status,
      variants_count: shopifyProduct.variants.edges.length
    }
  });

  // Store Thing ID in Shopify metafield using GraphQL
  await ShopifyService.metafields.set([{
    ownerId: shopifyProduct.id,
    namespace: "$app",
    key: "one_thing_id",
    type: "single_line_text_field",
    value: thingId
  }]);

  // Create Event for audit trail
  await createEvent({
    type: "shopify_product_synced",
    thingId: thingId,
    properties: {
      shopify_product_id: shopifyProductId,
      sync_method: "graphql",
      timestamp: new Date().toISOString()
    }
  });
}
```

## Resources

- **GraphQL Admin API Reference:** https://shopify.dev/docs/api/admin-graphql
- **REST Admin API (Legacy):** https://shopify.dev/docs/api/admin-rest
- **Migration Guide:** https://shopify.dev/docs/apps/build/graphql/migrate/learn-how
- **GraphQL Best Practices:** https://shopify.dev/docs/api/usage/graphql
- **Bulk Operations:** https://shopify.dev/docs/api/usage/bulk-operations
- **Performance Case Studies:** https://www.shopify.com/partners/blog/graphql-vs-rest

## Next Steps

- **Cycle 12:** Study Shopify rate limits and throttling strategies
- **Cycle 13:** Design GraphQL query patterns for ONE Platform
- **Cycle 14:** Implement GraphQL service layer
- **Cycle 15:** Create bulk operation handlers for large datasets

---

**Built for the ONE Platform - GraphQL-first, future-proof Shopify integration.**
