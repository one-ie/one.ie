# Shopify Metafields

**Version:** 1.0.0
**Last Updated:** 2025-11-22
**Cycle:** 10 of 100
**Status:** Research Complete

## Overview

Shopify Metafields are key-value pairs that enable storing custom data on Shopify resources (products, customers, orders, variants, collections, etc.). They extend the standard Shopify data model with application-specific or merchant-specific information.

## What Are Metafields?

**Definition:** Metafields are identified by three components:
1. **Owner Resource** - The Shopify resource (product, customer, order, etc.)
2. **Namespace** - Drives ownership and organization (e.g., `app`, `custom`, merchant-defined)
3. **Key** - The specific field name within the namespace

**Structure:**
```json
{
  "namespace": "app",
  "key": "sync_status",
  "value": "synced",
  "type": "single_line_text_field",
  "ownerId": "gid://shopify/Product/123456789"
}
```

## Metafield Namespaces

### Reserved Namespaces

**`$app` Namespace:**
- App-owned metafields with exclusive control
- Use when your app needs to prevent merchant modification
- Automatically scoped to your application
- Example: `$app.one_platform_id` for storing ONE Platform Thing IDs

**`custom` Namespace:**
- Standard namespace for merchant-owned metafields
- Visible and editable in Shopify admin
- Use for merchant-facing configuration

### Custom Namespaces

- Any non-reserved namespace can be used
- Best practice: Use your app name or domain
- Example: `one_platform.thing_id`, `one_platform.sync_status`

## Metafield Types

Shopify supports multiple data types for metafield values:

| Type | Description | Example Use Case |
|------|-------------|------------------|
| `single_line_text_field` | Short text (max 255 chars) | ONE Platform Thing ID |
| `multi_line_text_field` | Long text | Descriptions, notes |
| `number_integer` | Integer values | Sync timestamps, counters |
| `number_decimal` | Decimal numbers | Custom pricing, weights |
| `json` | JSON objects | Complex data structures |
| `boolean` | True/false | Feature flags, sync status |
| `date` | Date only | Publication dates |
| `date_time` | Date and time | Last sync timestamp |
| `url` | Valid URL | External references |
| `list.single_line_text_field` | Array of strings | Tags, categories |
| `file_reference` | Shopify file ID | Images, documents |
| `product_reference` | Product ID | Related products |
| `variant_reference` | Variant ID | Related variants |

**Full list:** https://shopify.dev/docs/apps/build/custom-data/metafields/types

## GraphQL Admin API (Recommended)

### Creating/Updating Metafields

**As of 2025-10 API version, use `metafieldsSet` mutation:**

```graphql
mutation CreateMetafield($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      id
      namespace
      key
      value
      type
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
  "metafields": [
    {
      "ownerId": "gid://shopify/Product/123456789",
      "namespace": "$app",
      "key": "one_thing_id",
      "type": "single_line_text_field",
      "value": "thing_abc123def456"
    }
  ]
}
```

**Key Advantages:**
- Sets metafield values regardless of whether they were previously created
- Upsert behavior (creates if missing, updates if exists)
- Batch operations supported (up to 25 metafields per request)

### Querying Metafields

**Fetch product with metafields:**
```graphql
query GetProductWithMetafields($id: ID!) {
  product(id: $id) {
    id
    title
    metafield(namespace: "$app", key: "one_thing_id") {
      value
      type
    }
    metafields(first: 10, namespace: "$app") {
      edges {
        node {
          id
          namespace
          key
          value
          type
        }
      }
    }
  }
}
```

### Creating Metafield Definitions

**For structured, reusable metafields:**
```graphql
mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition {
      id
      name
      namespace
      key
      type {
        name
      }
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
  "definition": {
    "name": "ONE Platform Thing ID",
    "namespace": "$app",
    "key": "one_thing_id",
    "type": "single_line_text_field",
    "ownerType": "PRODUCT"
  }
}
```

## REST Admin API (Legacy)

**Important:** As of October 1, 2024, the REST Admin API is legacy. Starting **April 1, 2025**, all new public apps **must use GraphQL exclusively**.

### REST Endpoints (Legacy Reference)

**Create metafield:**
```http
POST /admin/api/2024-10/products/{product_id}/metafields.json
Content-Type: application/json

{
  "metafield": {
    "namespace": "app",
    "key": "one_thing_id",
    "value": "thing_abc123def456",
    "type": "single_line_text_field"
  }
}
```

**Update metafield:**
```http
PUT /admin/api/2024-10/products/{product_id}/metafields/{metafield_id}.json
```

**Get metafields:**
```http
GET /admin/api/2024-10/products/{product_id}/metafields.json
```

## Mapping to ONE Platform Ontology

### Metafields → Thing Properties

Store ONE Platform Thing IDs in metafields to create bidirectional links:

```typescript
// Shopify Product → ONE Platform Thing
{
  namespace: "$app",
  key: "one_thing_id",
  value: "thing_01JCWXYZ123ABC",
  type: "single_line_text_field"
}

// ONE Platform Thing → Shopify Product
{
  thingId: "thing_01JCWXYZ123ABC",
  type: "shopify_product",
  properties: {
    shopify_product_id: "gid://shopify/Product/123456789",
    shopify_admin_url: "https://mystore.myshopify.com/admin/products/123456789"
  }
}
```

### Metafields → Knowledge Dimension

Use metafields for categorization and search:

```typescript
// Product categorization metafield
{
  namespace: "$app",
  key: "one_categories",
  value: JSON.stringify(["electronics", "featured", "new-arrival"]),
  type: "list.single_line_text_field"
}

// ONE Platform Knowledge entries
{
  thingId: "thing_01JCWXYZ123ABC",
  label: "electronics",
  source: "shopify_metafield"
}
```

### Sync Status Tracking

```typescript
// Track sync state in metafields
{
  namespace: "$app",
  key: "sync_metadata",
  value: JSON.stringify({
    last_sync: "2025-11-22T10:30:00Z",
    sync_status: "synced",
    one_thing_id: "thing_01JCWXYZ123ABC",
    version: 1
  }),
  type: "json"
}
```

## Best Practices

### 1. Use App-Owned Namespace

```typescript
// ✅ Good: App-owned namespace
const namespace = "$app";
const key = "one_thing_id";

// ❌ Bad: Custom namespace for internal data
const namespace = "custom";
const key = "one_thing_id";
```

### 2. Batch Operations

```typescript
// ✅ Good: Batch metafield updates (up to 25)
const metafields = products.map(p => ({
  ownerId: `gid://shopify/Product/${p.id}`,
  namespace: "$app",
  key: "one_thing_id",
  type: "single_line_text_field",
  value: p.thingId
}));

await metafieldsSet({ metafields });

// ❌ Bad: Individual requests
for (const product of products) {
  await metafieldsSet({
    metafields: [{
      ownerId: `gid://shopify/Product/${product.id}`,
      // ...
    }]
  });
}
```

### 3. Use Metafield Definitions

Define metafields once for consistency:

```typescript
// Create definition on app installation
await metafieldDefinitionCreate({
  definition: {
    name: "ONE Platform Thing ID",
    namespace: "$app",
    key: "one_thing_id",
    type: "single_line_text_field",
    ownerType: "PRODUCT",
    description: "Link to ONE Platform Thing"
  }
});
```

### 4. Handle Errors Gracefully

```typescript
const result = await metafieldsSet({ metafields });

if (result.userErrors.length > 0) {
  console.error("Metafield errors:", result.userErrors);
  // Log to ONE Platform Events dimension
  await createEvent({
    type: "shopify_metafield_error",
    thingId: appThingId,
    properties: {
      errors: result.userErrors,
      metafields: metafields
    }
  });
}
```

### 5. Query Optimization

```typescript
// ✅ Good: Fetch only needed metafields
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    metafield(namespace: "$app", key: "one_thing_id") {
      value
    }
  }
}

// ❌ Bad: Fetch all metafields
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    metafields(first: 250) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
  }
}
```

## Common Use Cases

### 1. Bidirectional Sync

Store ONE Platform Thing IDs on Shopify resources:

```typescript
// On Shopify product creation
const thingId = await createThing({
  type: "shopify_product",
  properties: {
    shopify_product_id: shopifyProduct.id,
    title: shopifyProduct.title
  }
});

// Store Thing ID in Shopify metafield
await metafieldsSet({
  metafields: [{
    ownerId: shopifyProduct.admin_graphql_api_id,
    namespace: "$app",
    key: "one_thing_id",
    type: "single_line_text_field",
    value: thingId
  }]
});
```

### 2. Custom Product Properties

Extend products with ONE-specific data:

```typescript
await metafieldsSet({
  metafields: [{
    ownerId: productGid,
    namespace: "$app",
    key: "course_content",
    type: "json",
    value: JSON.stringify({
      modules: 12,
      duration_hours: 24,
      skill_level: "intermediate"
    })
  }]
});
```

### 3. Inventory Sync State

Track synchronization status:

```typescript
await metafieldsSet({
  metafields: [{
    ownerId: productGid,
    namespace: "$app",
    key: "inventory_sync",
    type: "json",
    value: JSON.stringify({
      last_sync: new Date().toISOString(),
      one_inventory_id: "thing_inventory_123",
      sync_enabled: true
    })
  }]
});
```

## Performance Considerations

### Query Cost

Metafield queries add to GraphQL query cost:
- Fetching a single metafield: ~1 point
- Fetching metafields collection: ~5-10 points
- Creating/updating metafields: ~10 points per metafield

### Caching Strategy

```typescript
// Cache metafield definitions
const metafieldDefinitions = await fetchAndCache(
  "shopify_metafield_definitions",
  () => getMetafieldDefinitions(),
  { ttl: 3600 } // 1 hour
);

// Cache product metafields
const productMetafields = await fetchAndCache(
  `product_${productId}_metafields`,
  () => getProductMetafields(productId),
  { ttl: 300 } // 5 minutes
);
```

## Migration Path from REST to GraphQL

**Timeline:**
- **October 1, 2024:** REST API marked as legacy
- **April 1, 2025:** New apps must use GraphQL exclusively
- **Existing apps:** Can continue using REST but should plan migration

**Migration Steps:**

1. **Audit current metafield usage**
   ```bash
   # Find all REST API metafield calls
   grep -r "admin/api.*metafields" .
   ```

2. **Convert to GraphQL mutations**
   ```typescript
   // Before (REST)
   await shopify.rest.Metafield.all({ product_id: 123 });

   // After (GraphQL)
   await shopify.graphql(`
     query {
       product(id: "gid://shopify/Product/123") {
         metafields(first: 10) {
           edges { node { namespace key value } }
         }
       }
     }
   `);
   ```

3. **Test with 2025-10 API version**
4. **Update error handling for GraphQL userErrors**
5. **Batch operations where possible**

## Resources

- **Metafields Overview:** https://shopify.dev/docs/apps/build/custom-data
- **Metafield Types:** https://shopify.dev/docs/apps/build/custom-data/metafields/types
- **GraphQL Metafield Object:** https://shopify.dev/docs/api/admin-graphql/latest/objects/Metafield
- **metafieldsSet Mutation:** https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafieldsSet
- **Metafield Definitions:** https://shopify.dev/docs/apps/build/custom-data/metafields/definitions
- **REST Metafield API (Legacy):** https://shopify.dev/docs/api/admin-rest/latest/resources/metafield

## Next Steps

- **Cycle 11:** Study Shopify GraphQL API vs REST comparison
- **Cycle 12:** Study Shopify rate limits and throttling
- **Cycle 13:** Design metafield schema for ONE Platform integration
- **Cycle 14:** Implement metafield sync service

---

**Built for the ONE Platform - where Shopify data meets the 6-dimension ontology.**
