---
title: Shopify API Reference
dimension: connections
category: shopify-api-reference.md
tags: api, backend, integration, shopify, e-commerce, graphql, rest
related_dimensions: events, knowledge, people, things
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document is part of the connections dimension in the shopify-api-reference.md category.
  Location: one/connections/shopify-api-reference.md
  Purpose: Documents Shopify Admin API for building ShopifyProvider integration
  Related dimensions: events, knowledge, people, things
  For AI agents: Read this to understand Shopify's API architecture and capabilities.
---

# Shopify Admin API Reference

**Complete guide to Shopify's Admin API for ONE Platform integration**

**Last Updated:** 2025-11-22
**Status:** Research Complete
**API Version:** 2025-10 (Latest)

---

## Executive Summary

The Shopify Admin API enables apps and integrations to extend the Shopify admin, providing access to products, customers, orders, inventory, fulfillment, and more. This document focuses on information relevant to building a **ShopifyProvider** that implements the ONE Platform's DataProvider interface.

**Key Decisions:**
- ✅ **Use GraphQL Admin API** (required for all new apps as of April 1, 2025)
- ✅ REST Admin API is legacy (October 1, 2024+)
- ✅ API Version: 2025-10 (latest stable)
- ✅ Cost-based rate limiting (not request-based)

---

## Table of Contents

1. [API Architecture](#api-architecture)
2. [REST vs GraphQL](#rest-vs-graphql)
3. [API Versioning](#api-versioning)
4. [Core Resources](#core-resources)
5. [Rate Limits](#rate-limits)
6. [Request/Response Format](#requestresponse-format)
7. [Pagination](#pagination)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Mapping to ONE Ontology](#mapping-to-one-ontology)

---

## API Architecture

### Endpoint Structure

**GraphQL Admin API (Recommended):**
```
https://{store_name}.myshopify.com/admin/api/2025-10/graphql.json
```

**REST Admin API (Legacy):**
```
https://{store_name}.myshopify.com/admin/api/2025-10/{resource}.json
```

### Authentication

All API requests require a valid Shopify access token:

```http
POST /admin/api/2025-10/graphql.json
Host: {store_name}.myshopify.com
Content-Type: application/json
X-Shopify-Access-Token: {access_token}

{
  "query": "{ shop { name } }"
}
```

---

## REST vs GraphQL

### GraphQL Admin API (REQUIRED for new apps)

**Status:** As of October 1, 2024, the REST Admin API is legacy. Starting **April 1, 2025**, all new public apps **must** use GraphQL exclusively.

**Advantages:**
- ✅ Fetch multiple related resources in a single request
- ✅ Request only the fields you need (reduced payload size)
- ✅ Single endpoint for all operations
- ✅ Strongly typed schema
- ✅ Cost-based rate limiting (more flexible)
- ✅ Future-proof (active development)

**Example Query:**
```graphql
query {
  product(id: "gid://shopify/Product/1234567890") {
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

### REST Admin API (Legacy)

**Status:** Legacy as of October 1, 2024. Existing apps can continue using it, but new apps must use GraphQL.

**Use Cases:**
- Single-resource CRUD operations
- Simple integrations
- Legacy system compatibility

**Example Request:**
```http
GET /admin/api/2025-10/products/1234567890.json
Host: {store_name}.myshopify.com
X-Shopify-Access-Token: {access_token}
```

**ONE Platform Decision:** We will use **GraphQL Admin API exclusively** for the ShopifyProvider implementation.

---

## API Versioning

### Version Format

Shopify uses quarterly versioning: `YYYY-MM`

**Current Versions:**
- `2025-10` (Latest - October 2025)
- `2025-07` (July 2025)
- `2025-04` (April 2025)
- `2025-01` (January 2025)

### Version Lifecycle

- **New versions released quarterly** (January, April, July, October)
- **Versions supported for 12 months** after release
- **Breaking changes only in new versions** (opt-in)
- **Deprecations announced 6 months in advance**

### Version Selection

Specify version in the endpoint URL:

```
https://{store}.myshopify.com/admin/api/2025-10/graphql.json
                                        ^^^^^^^^
```

**Best Practice:** Pin to a specific version (e.g., `2025-10`) and upgrade intentionally.

---

## Core Resources

### 1. Products

**GraphQL Object:** `Product`

Represents goods and services offered to customers.

**Key Fields:**
- `id` - Global ID (e.g., `gid://shopify/Product/123`)
- `title` - Product name
- `description` - Product description (HTML)
- `productType` - Product category/type
- `vendor` - Product manufacturer/vendor
- `tags` - Searchable keywords
- `status` - `ACTIVE`, `ARCHIVED`, `DRAFT`
- `variants` - Product variants (size, color, etc.)
- `images` - Product images
- `priceRangeV2` - Min/max price across variants
- `totalInventory` - Total available quantity

**Example Query:**
```graphql
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        description
        productType
        status
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              inventoryQuantity
              sku
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Mutations:**
- `productCreate` - Create new product
- `productUpdate` - Update existing product
- `productDelete` - Delete product

**ONE Ontology Mapping:**
- **Dimension:** Things
- **Type:** `product`
- **Properties:** title, description, price, inventory, etc.

---

### 2. Orders

**GraphQL Object:** `Order`

Central hub connecting customer information, product details, payment processing, and fulfillment.

**Key Fields:**
- `id` - Global ID
- `name` - Order number (e.g., `#1001`)
- `createdAt` - Order creation timestamp
- `customer` - Customer who placed the order
- `lineItems` - Products in the order
- `totalPriceSet` - Total order value
- `displayFinancialStatus` - `PENDING`, `PAID`, `REFUNDED`, etc.
- `displayFulfillmentStatus` - `UNFULFILLED`, `FULFILLED`, etc.
- `shippingAddress` - Delivery address
- `billingAddress` - Billing address

**Example Query:**
```graphql
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    name
    createdAt
    customer {
      id
      email
      firstName
      lastName
    }
    lineItems(first: 50) {
      edges {
        node {
          id
          title
          quantity
          variant {
            id
            price
            sku
          }
        }
      }
    }
    totalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    displayFinancialStatus
    displayFulfillmentStatus
  }
}
```

**Mutations:**
- `orderCreate` - Create order (draft or paid)
- `orderUpdate` - Update order details
- `orderClose` - Close order
- `orderCancel` - Cancel order

**ONE Ontology Mapping:**
- **Dimension:** Things
- **Type:** `order`
- **Connections:** `purchased_by` (customer), `contains` (line items)
- **Events:** `order_created`, `order_paid`, `order_fulfilled`

---

### 3. Customers

**GraphQL Object:** `Customer`

Represents individuals who purchase from the store.

**Key Fields:**
- `id` - Global ID
- `email` - Customer email (unique)
- `firstName` / `lastName` - Customer name
- `phone` - Phone number
- `addresses` - Saved addresses
- `orders` - Customer's order history
- `totalSpent` - Lifetime value
- `numberOfOrders` - Total order count
- `tags` - Customer segmentation tags
- `state` - `ENABLED`, `DISABLED`, `INVITED`

**Example Query:**
```graphql
query GetCustomer($id: ID!) {
  customer(id: $id) {
    id
    email
    firstName
    lastName
    phone
    totalSpent
    numberOfOrders
    orders(first: 10) {
      edges {
        node {
          id
          name
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
}
```

**Mutations:**
- `customerCreate` - Create customer
- `customerUpdate` - Update customer details
- `customerDelete` - Delete customer (GDPR-compliant)

**ONE Ontology Mapping:**
- **Dimension:** People (or Things with type `customer`)
- **Type:** `customer`
- **Connections:** `purchased` (orders)

---

### 4. Inventory

**GraphQL Objects:** `InventoryItem`, `InventoryLevel`, `Location`

The Shopify inventory API is built around three core resources:

**InventoryItem:**
- Stores metadata about a product's stock unit
- Fields: `id`, `sku`, `tracked`, `cost`, `countryCodeOfOrigin`

**InventoryLevel:**
- Stores actual available quantity at a specific location
- Fields: `id`, `available`, `incoming`, `location`, `item`

**Location:**
- Identifies where inventory is stocked or fulfilled from
- Fields: `id`, `name`, `address`, `isActive`

**Example Query:**
```graphql
query GetInventory($productId: ID!) {
  product(id: $productId) {
    id
    title
    variants(first: 50) {
      edges {
        node {
          id
          sku
          inventoryItem {
            id
            tracked
            inventoryLevels(first: 10) {
              edges {
                node {
                  id
                  available
                  location {
                    id
                    name
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

**Mutations:**
- `inventorySetOnHandQuantities` - Set inventory quantity
- `inventoryAdjustQuantities` - Adjust inventory (delta)
- `inventoryActivate` - Activate inventory at location
- `inventoryDeactivate` - Deactivate inventory at location

**ONE Ontology Mapping:**
- **Dimension:** Things
- **Type:** `inventory_item`
- **Properties:** quantity, location, sku
- **Events:** `inventory_adjusted`, `inventory_transferred`

---

### 5. Shop

**GraphQL Object:** `Shop`

Represents the store itself (metadata).

**Key Fields:**
- `id` - Shop ID
- `name` - Store name
- `email` - Store contact email
- `myshopifyDomain` - `{store}.myshopify.com`
- `primaryDomain` - Custom domain
- `currencyCode` - Default currency (e.g., `USD`)
- `plan` - Shopify plan tier

**Example Query:**
```graphql
query {
  shop {
    id
    name
    email
    myshopifyDomain
    primaryDomain {
      host
    }
    currencyCode
  }
}
```

**ONE Ontology Mapping:**
- **Dimension:** Groups
- **Type:** `organization` or `store`
- **Purpose:** Multi-tenant container

---

## Rate Limits

### GraphQL Cost-Based System

Unlike traditional request-based rate limiting, GraphQL uses **calculated query costs** measured in **cost points**.

**Key Concepts:**
- Each **object** returned costs **1 point**
- **Mutations** cost **10 points** (standardized)
- **Connections** (one-to-many) cost **2 + N** points (N = objects returned)
- **Requested cost** calculated before execution
- **Actual cost** calculated during execution
- **Cost difference refunded** to client

### Rate Limit Allocations

Limits vary by Shopify plan:

| Plan | Points/Second | Bucket Limit |
|------|---------------|--------------|
| Standard | 50 | 1,000 |
| Advanced | 100 | 2,000 |
| Shopify Plus | 500 | 10,000 |

**Example:**
- Standard plan: 50 points/second
- Bucket fills at 50 points/second
- Maximum bucket size: 1,000 points

### Monitoring Costs

**Debug Header:**
```http
Shopify-GraphQL-Cost-Debug: 1
```

**Response Header:**
```json
{
  "extensions": {
    "cost": {
      "requestedQueryCost": 101,
      "actualQueryCost": 46,
      "throttleStatus": {
        "maximumAvailable": 1000,
        "currentlyAvailable": 954,
        "restoreRate": 50
      }
    }
  }
}
```

### Handling Rate Limits

**Response Code:** `429 Too Many Requests`

**Best Practices:**
1. **Monitor throttle status** in response headers
2. **Implement exponential backoff** on 429 responses
3. **Use bulk operations** for large datasets (no cost limits)
4. **Optimize queries** to request only needed fields
5. **Stagger requests** in a queue

---

## Request/Response Format

### GraphQL Request

```http
POST /admin/api/2025-10/graphql.json HTTP/1.1
Host: {store}.myshopify.com
Content-Type: application/json
X-Shopify-Access-Token: {access_token}

{
  "query": "query GetProduct($id: ID!) { product(id: $id) { id title } }",
  "variables": {
    "id": "gid://shopify/Product/1234567890"
  }
}
```

### GraphQL Response

```json
{
  "data": {
    "product": {
      "id": "gid://shopify/Product/1234567890",
      "title": "Awesome T-Shirt"
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 2,
      "actualQueryCost": 2,
      "throttleStatus": {
        "maximumAvailable": 1000,
        "currentlyAvailable": 998,
        "restoreRate": 50
      }
    }
  }
}
```

### Error Response

```json
{
  "errors": [
    {
      "message": "Field 'invalidField' doesn't exist on type 'Product'",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["product", "invalidField"],
      "extensions": {
        "code": "undefinedField",
        "typeName": "Product",
        "fieldName": "invalidField"
      }
    }
  ]
}
```

---

## Pagination

### Cursor-Based Pagination (GraphQL)

Shopify GraphQL uses **cursor-based pagination** with connections.

**Connection Structure:**
```graphql
{
  products(first: 10, after: "eyJsYXN0X2lkIjo...") {
    edges {
      cursor  # Opaque cursor string
      node {
        id
        title
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

**Pagination Pattern:**
```typescript
async function* paginateProducts(client: GraphQLClient) {
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await client.query({
      query: GET_PRODUCTS,
      variables: { first: 50, after: cursor }
    });

    for (const edge of response.data.products.edges) {
      yield edge.node;
    }

    hasNextPage = response.data.products.pageInfo.hasNextPage;
    cursor = response.data.products.pageInfo.endCursor;
  }
}
```

**Best Practices:**
- Use `first: 50` (or 100) for optimal performance
- Store cursors for resumable pagination
- Use `pageInfo.hasNextPage` to detect end

---

## Error Handling

### GraphQL Error Types

1. **Validation Errors** (before execution)
   - Invalid syntax
   - Unknown fields
   - Type mismatches

2. **User Errors** (during execution)
   - Business logic violations
   - Permission errors
   - Resource not found

3. **Rate Limit Errors**
   - 429 Too Many Requests
   - Cost exceeded

### Error Handling Pattern

```typescript
async function executeQuery(query: string, variables: any) {
  try {
    const response = await shopifyClient.query({ query, variables });

    // Check for GraphQL errors
    if (response.errors && response.errors.length > 0) {
      console.error('GraphQL errors:', response.errors);
      // Handle specific errors
    }

    // Check for user errors in mutations
    if (response.data?.productCreate?.userErrors?.length > 0) {
      console.error('User errors:', response.data.productCreate.userErrors);
      // Handle validation errors
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limit exceeded - implement backoff
      await sleep(calculateBackoff());
      return executeQuery(query, variables); // Retry
    }
    throw error;
  }
}
```

---

## Best Practices

### 1. Use GraphQL Exclusively

- REST API is legacy (April 1, 2025 deadline for new apps)
- GraphQL provides better performance and flexibility
- Future-proof your integration

### 2. Request Only What You Need

```graphql
# ❌ Bad: Over-fetching
query {
  products(first: 10) {
    edges {
      node {
        id
        title
        description
        variants(first: 100) {
          edges {
            node {
              # ... all fields
            }
          }
        }
      }
    }
  }
}

# ✅ Good: Request specific fields
query {
  products(first: 10) {
    edges {
      node {
        id
        title
        status
      }
    }
  }
}
```

### 3. Use Bulk Operations for Large Datasets

For querying/mutating 1000+ records, use **Bulk Operations**:

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

**Advantages:**
- No cost limits
- No rate limits
- Processes in background
- Returns JSONL file with results

### 4. Monitor Query Costs

Always include cost debugging in development:

```http
Shopify-GraphQL-Cost-Debug: 1
```

Optimize expensive queries before production.

### 5. Implement Exponential Backoff

```typescript
async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 6. Use API Versioning Wisely

- Pin to specific version (e.g., `2025-10`)
- Test new versions before upgrading
- Monitor deprecation notices
- Upgrade quarterly or as needed

---

## Mapping to ONE Ontology

### Products → Things

```typescript
// Shopify Product → ONE Thing
{
  type: "product",
  groupId: shopId, // Shop as group
  properties: {
    title: product.title,
    description: product.description,
    productType: product.productType,
    vendor: product.vendor,
    status: product.status,
    tags: product.tags,
  },
  metadata: {
    shopifyId: product.id,
    shopifyHandle: product.handle,
  }
}
```

### Orders → Things + Events

```typescript
// Shopify Order → ONE Thing
{
  type: "order",
  groupId: shopId,
  properties: {
    orderNumber: order.name,
    totalPrice: order.totalPriceSet.shopMoney.amount,
    currency: order.totalPriceSet.shopMoney.currencyCode,
    financialStatus: order.displayFinancialStatus,
    fulfillmentStatus: order.displayFulfillmentStatus,
  },
  metadata: {
    shopifyId: order.id,
  }
}

// Order Created → ONE Event
{
  type: "order_created",
  actorId: customerId,
  targetId: orderId,
  timestamp: order.createdAt,
  metadata: {
    provider: "shopify",
    shopifyOrderId: order.id,
  }
}
```

### Customers → People (or Things)

```typescript
// Shopify Customer → ONE Thing (type: customer)
{
  type: "customer",
  groupId: shopId,
  properties: {
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    totalSpent: customer.totalSpent,
    orderCount: customer.numberOfOrders,
  },
  metadata: {
    shopifyId: customer.id,
  }
}
```

### Inventory → Things

```typescript
// Shopify InventoryItem → ONE Thing
{
  type: "inventory_item",
  groupId: shopId,
  properties: {
    sku: inventoryItem.sku,
    quantity: inventoryLevel.available,
    location: location.name,
    tracked: inventoryItem.tracked,
  },
  metadata: {
    shopifyInventoryItemId: inventoryItem.id,
    shopifyLocationId: location.id,
  }
}
```

---

## Resources & References

**Official Documentation:**
- [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)
- [REST Admin API](https://shopify.dev/docs/api/admin-rest)
- [API Versioning](https://shopify.dev/docs/api/release-notes/2025-01)
- [Rate Limits](https://shopify.dev/docs/api/usage/limits)

**Tools:**
- [GraphiQL Explorer](https://shopify.dev/docs/api/usage/api-exploration/admin-graphiql-explorer) - In-browser GraphQL IDE
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) - Development tools

**Migration Guides:**
- [REST to GraphQL Migration](https://shopify.dev/docs/apps/build/graphql/migrate)

---

## Next Steps

1. **Read Authentication Guide:** [shopify-auth.md](./shopify-auth.md)
2. **Read Webhooks Guide:** [shopify-webhooks.md](./shopify-webhooks.md)
3. **Implement ShopifyProvider:** Map Shopify resources to ONE ontology
4. **Test with GraphiQL:** Explore API and test queries
5. **Build DataProvider:** Implement CRUD operations for each resource

---

**This documentation is part of the Shopify Integration for ONE Platform. See the 100-cycle plan in `/one/events/shopify-integration-plan.md` for implementation roadmap.**
