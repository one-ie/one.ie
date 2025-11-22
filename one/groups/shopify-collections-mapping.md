---
title: Shopify Collections Mapping
dimension: groups
category: shopify-integration
tags: shopify, ecommerce, collections, categorization, smart-collections
related_dimensions: things, connections, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document maps Shopify's Collections system to ONE's Groups dimension.
  Location: one/groups/shopify-collections-mapping.md
  Purpose: Documents how Shopify collections integrate with ONE's hierarchical group structure
  Related dimensions: things (products), connections (product-collection), knowledge (collection rules)
  For AI agents: Read this to understand Shopify collections mapping to ONE Platform.
---

# Shopify Collections Mapping

**Status:** Planning
**Integration Phase:** Cycle 9 of 100
**Last Updated:** 2025-11-22

## Executive Summary

This document maps Shopify's Collections system to ONE Platform's **Groups** dimension (dimension 1). Shopify has two collection types: **Manual Collections** (merchant curated) and **Smart Collections** (rule-based automation). Both map to groups with `type: "collection"` that can be hierarchically nested under the store group.

## Shopify Collections Overview

### Collection Types

#### 1. Manual Collections (Custom Collections)

Merchant manually selects which products to include.

```json
{
  "id": 841564295,
  "handle": "macbooks",
  "title": "Macbooks",
  "updated_at": "2025-01-20T12:31:01-05:00",
  "body_html": "<p>The best laptops for creatives</p>",
  "published_at": "2007-08-31T20:00:00-04:00",
  "sort_order": "manual",
  "template_suffix": null,
  "published_scope": "web",
  "admin_graphql_api_id": "gid://shopify/Collection/841564295",
  "image": {
    "created_at": "2025-01-20T12:31:01-05:00",
    "alt": "Macbook collection banner",
    "width": 1200,
    "height": 600,
    "src": "https://cdn.shopify.com/..."
  }
}
```

**Key Properties:**
- `handle`: URL-friendly identifier (e.g., `/collections/macbooks`)
- `title`: Display name
- `body_html`: Description (supports HTML)
- `sort_order`: How products are sorted (`manual`, `best-selling`, `alpha-asc`, `alpha-desc`, `price-asc`, `price-desc`, `created`, `created-desc`)
- `published_scope`: Visibility (`web`, `global`)
- `image`: Collection banner/hero image

#### 2. Smart Collections

Products automatically added based on selection rules.

```json
{
  "id": 482865238,
  "handle": "macbooks",
  "title": "Macbooks",
  "updated_at": "2025-01-20T12:31:01-05:00",
  "body_html": "<p>All MacBook products</p>",
  "published_at": "2008-02-01T19:00:00-05:00",
  "sort_order": "best-selling",
  "template_suffix": null,
  "disjunctive": false,
  "rules": [
    {
      "column": "title",
      "relation": "contains",
      "condition": "MacBook"
    },
    {
      "column": "vendor",
      "relation": "equals",
      "condition": "Apple"
    }
  ],
  "published_scope": "web",
  "admin_graphql_api_id": "gid://shopify/Collection/482865238"
}
```

**Key Properties:**
- `rules`: Array of conditions that determine membership
- `disjunctive`: Boolean determining rule logic
  - `false` (default): ALL rules must match (AND logic)
  - `true`: ANY rule can match (OR logic)

### Smart Collection Rules

#### Available Rule Columns (2025)

```typescript
type RuleColumn =
  | "title"                              // Product title
  | "type"                               // Product type
  | "vendor"                             // Product vendor
  | "variant_title"                      // Variant title
  | "variant_compare_at_price"           // Variant compare price
  | "variant_weight"                     // Variant weight
  | "variant_inventory"                  // Variant inventory quantity
  | "variant_price"                      // Variant price
  | "tag"                                // Product tags
  | "product_metafield_definition"       // Product metafields
  | "variant_metafield_definition"       // Variant metafields
  | "PRODUCT_CATEGORY_ID_WITH_DESCENDANTS";  // NEW 2025: Product taxonomy
```

#### Available Relations

```typescript
type RuleRelation =
  | "equals"              // Exact match
  | "not_equals"          // Does not match
  | "contains"            // Contains substring
  | "not_contains"        // Does not contain substring
  | "starts_with"         // Starts with prefix
  | "ends_with"           // Ends with suffix
  | "greater_than"        // > (for numbers)
  | "less_than";          // < (for numbers)
```

#### Example Rules

**Apparel Collection:**
```json
{
  "disjunctive": false,
  "rules": [
    {
      "column": "type",
      "relation": "equals",
      "condition": "Apparel"
    }
  ]
}
```

**Sale Items (Multiple Conditions):**
```json
{
  "disjunctive": false,  // ALL rules must match (AND)
  "rules": [
    {
      "column": "variant_compare_at_price",
      "relation": "greater_than",
      "condition": "0"
    },
    {
      "column": "tag",
      "relation": "equals",
      "condition": "sale"
    }
  ]
}
```

**New Arrivals (Last 30 Days):**
Smart collections don't support date-based rules directly. Use tags + automated tagging:
```json
{
  "rules": [
    {
      "column": "tag",
      "relation": "equals",
      "condition": "new-arrival"
    }
  ]
}
```

#### NEW 2025: Product Taxonomy Rules

```json
{
  "rules": [
    {
      "column": "PRODUCT_CATEGORY_ID_WITH_DESCENDANTS",
      "relation": "equals",
      "condition": "gid://shopify/ProductCategory/123"
    }
  ]
}
```

This dynamically includes:
- Products directly in category 123
- Products in any descendant categories

Example: Category "Clothing" includes "Shirts", "Pants", "Dresses" subcategories automatically.

### Product-Collection Relationships

#### The Collect Resource

Links products to manual collections only (smart collections managed by rules).

```json
{
  "id": 841564295,
  "collection_id": 841564295,
  "product_id": 632910392,
  "created_at": "2025-01-20T12:31:01-05:00",
  "updated_at": "2025-01-20T12:31:01-05:00",
  "position": 1,
  "sort_value": "0000000001"
}
```

**Key Properties:**
- `position`: Manual sort order within collection (1-indexed)
- `sort_value`: Internal sorting identifier
- Can only be created/deleted for manual collections
- Smart collections: attempting to create Collect returns `403 Forbidden`

## API Transition (2025)

### Legacy REST API (Deprecated April 1, 2025)

```
GET /admin/api/2024-10/collections.json
GET /admin/api/2024-10/custom_collections.json
GET /admin/api/2024-10/smart_collections.json
GET /admin/api/2024-10/collects.json
```

### New GraphQL Admin API (Required)

```graphql
query GetCollections {
  collections(first: 50) {
    edges {
      node {
        id
        title
        handle
        descriptionHtml
        sortOrder
        ruleSet {
          appliedDisjunctively
          rules {
            column
            relation
            condition
          }
        }
        products(first: 10) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
}
```

### Create Collection (Manual)

```graphql
mutation CreateCollection($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      id
      title
      handle
    }
    userErrors {
      field
      message
    }
  }
}
```

### Add Product to Collection

```graphql
mutation AddProductToCollection($collectionId: ID!, $productIds: [ID!]!) {
  collectionAddProducts(id: $collectionId, productIds: $productIds) {
    collection {
      id
      productsCount
    }
    userErrors {
      field
      message
    }
  }
}
```

## Mapping to ONE Platform

### Collection as Group

Each Shopify collection maps to a `group` with `type: "collection"`:

```typescript
{
  _id: Id<"groups">,
  type: "collection",
  name: "Macbooks",
  parentGroupId: Id<"groups">,  // Store group (business)
  properties: {
    // Shopify identifiers
    shopifyCollectionId: "gid://shopify/Collection/841564295",
    handle: "macbooks",

    // Collection metadata
    description: "<p>The best laptops for creatives</p>",
    descriptionPlainText: "The best laptops for creatives",

    // Visual identity
    image: {
      src: "https://cdn.shopify.com/s/files/1/0001/1234/collections/macbooks.jpg",
      alt: "Macbook collection banner",
      width: 1200,
      height: 600,
    },
    templateSuffix: null,

    // Display settings
    sortOrder: "manual",  // How products are sorted in this collection
    publishedScope: "web",
    publishedAt: 1186185600000,

    // Collection type
    collectionType: "manual",  // "manual" | "smart"

    // Smart collection rules (if applicable)
    smartRules?: {
      disjunctive: false,  // AND vs OR logic
      rules: [
        {
          column: "title",
          relation: "contains",
          condition: "MacBook"
        },
        {
          column: "vendor",
          relation: "equals",
          condition: "Apple"
        }
      ]
    },

    // Product count (cached)
    productsCount: 12,

    // SEO
    seo?: {
      title: "MacBook Laptops | Premium Apple Devices",
      description: "Shop our curated collection of MacBook laptops...",
    },
  },
  status: "active",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
}
```

### Hierarchical Collections (Nested Groups)

Shopify doesn't natively support nested collections, but ONE Platform does via `parentGroupId`:

```
Store Group (business)
├─ All Products Collection (collection)
├─ Electronics Collection (collection)
│  ├─ Computers Collection (collection)
│  │  ├─ Macbooks Collection (collection)
│  │  └─ Windows Laptops Collection (collection)
│  └─ Phones Collection (collection)
└─ Apparel Collection (collection)
   ├─ Men's Apparel (collection)
   └─ Women's Apparel (collection)
```

**Implementation:**
```typescript
// Parent: Electronics
{
  _id: "electronics_123",
  type: "collection",
  name: "Electronics",
  parentGroupId: "store_group_456",  // Store
}

// Child: Computers
{
  _id: "computers_789",
  type: "collection",
  name: "Computers",
  parentGroupId: "electronics_123",  // Parent collection
}

// Grandchild: Macbooks
{
  _id: "macbooks_012",
  type: "collection",
  name: "Macbooks",
  parentGroupId: "computers_789",  // Parent collection
}
```

### Product-Collection Relationship (Connection)

Products belong to collections via `connections` with `type: "belongs_to"`:

```typescript
{
  _id: Id<"connections">,
  type: "belongs_to",
  fromId: Id<"things">,        // Product
  toId: Id<"groups">,          // Collection group
  groupId: Id<"groups">,       // Store group
  properties: {
    // For manual collections only
    collectId?: "gid://shopify/Collect/841564295",
    position: 1,               // Manual sort order
    sortValue: "0000000001",

    // For smart collections
    matchedRules?: [
      {
        column: "title",
        relation: "contains",
        condition: "MacBook",
        matched: true
      },
      {
        column: "vendor",
        relation: "equals",
        condition: "Apple",
        matched: true
      }
    ],
    autoAdded: true,           // true for smart collections

    addedAt: 1700000000000,
  },
  status: "active",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
}
```

## Collection Events

### Event Type: `collection_created`

```typescript
{
  _id: Id<"events">,
  type: "collection_created",
  thingId: Id<"groups">,       // Collection group
  groupId: Id<"groups">,       // Store group
  userId: Id<"things">,        // Admin who created
  properties: {
    collectionId: "gid://shopify/Collection/841564295",
    collectionType: "manual",  // or "smart"
    title: "Macbooks",
    handle: "macbooks",
  },
  timestamp: 1700000000000,
}
```

### Event Type: `collection_updated`

```typescript
{
  _id: Id<"events">,
  type: "collection_updated",
  thingId: Id<"groups">,
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    collectionId: "gid://shopify/Collection/841564295",
    changes: {
      title: { from: "Macbooks", to: "MacBook Laptops" },
      sortOrder: { from: "manual", to: "best-selling" },
    },
  },
  timestamp: 1700000000000,
}
```

### Event Type: `product_added_to_collection`

```typescript
{
  _id: Id<"events">,
  type: "product_added_to_collection",
  thingId: Id<"things">,       // Product
  groupId: Id<"groups">,       // Collection group
  userId: Id<"things">,        // Admin (for manual) or system (for smart)
  properties: {
    collectionId: "gid://shopify/Collection/841564295",
    collectionType: "manual",
    productId: "gid://shopify/Product/632910392",
    position: 1,               // For manual collections
    autoAdded: false,          // true for smart collections
  },
  timestamp: 1700000000000,
}
```

### Event Type: `product_removed_from_collection`

```typescript
{
  _id: Id<"events">,
  type: "product_removed_from_collection",
  thingId: Id<"things">,
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    collectionId: "gid://shopify/Collection/841564295",
    productId: "gid://shopify/Product/632910392",
    reason: "manual_removal",  // or "no_longer_matches_rules"
  },
  timestamp: 1700000000000,
}
```

### Event Type: `smart_collection_rules_updated`

```typescript
{
  _id: Id<"events">,
  type: "smart_collection_rules_updated",
  thingId: Id<"groups">,       // Collection
  groupId: Id<"groups">,       // Store
  userId: Id<"things">,
  properties: {
    collectionId: "gid://shopify/Collection/482865238",
    previousRules: [
      { column: "title", relation: "contains", condition: "MacBook" }
    ],
    newRules: [
      { column: "title", relation: "contains", condition: "MacBook" },
      { column: "vendor", relation: "equals", condition: "Apple" }
    ],
    disjunctive: false,
    productsAffected: {
      added: 3,
      removed: 1,
    }
  },
  timestamp: 1700000000000,
}
```

## Real-Time Updates via Webhooks

### Collection Webhooks

```
collections/create         → Trigger: collection_created event
collections/update         → Trigger: collection_updated event
collections/delete         → Trigger: collection_deleted event
```

### Product-Collection Webhooks

Shopify doesn't provide dedicated webhooks for Collect operations. Monitor via:

```
products/update            → Check collection membership changes
collections/update         → Check products_count changes
```

### Webhook Processing Pattern

```typescript
// Convex mutation
export const handleCollectionUpdate = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    handle: v.string(),
    collection_type: v.string(),
    rules: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Find or create collection group
    const collection = await ctx.db
      .query("groups")
      .withIndex("by_type", q => q.eq("type", "collection"))
      .filter(q =>
        q.eq(q.field("properties.shopifyCollectionId"), args.id)
      )
      .first();

    if (!collection) {
      // Create new collection group
      const newCollection = await ctx.db.insert("groups", {
        type: "collection",
        name: args.title,
        parentGroupId: storeGroupId,  // Get from context
        properties: {
          shopifyCollectionId: args.id,
          handle: args.handle,
          collectionType: args.collection_type,
          smartRules: args.rules,
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create event
      await ctx.db.insert("events", {
        type: "collection_created",
        thingId: newCollection,
        groupId: storeGroupId,
        properties: { /* ... */ },
        timestamp: Date.now(),
      });
    } else {
      // Update existing collection
      await ctx.db.patch(collection._id, {
        name: args.title,
        "properties.handle": args.handle,
        "properties.smartRules": args.rules,
        updatedAt: Date.now(),
      });

      // Create event
      await ctx.db.insert("events", {
        type: "collection_updated",
        thingId: collection._id,
        groupId: collection.parentGroupId,
        properties: { /* ... */ },
        timestamp: Date.now(),
      });
    }
  },
});
```

## Smart Collection Rule Evaluation

### Client-Side Evaluation (ONE Platform)

For smart collections, ONE Platform can evaluate rules locally:

```typescript
// Effect.ts service
export const SmartCollectionService = {
  evaluateRules: (product: Thing, rules: CollectionRule[], disjunctive: boolean) => {
    const results = rules.map(rule => evaluateRule(product, rule));

    return disjunctive
      ? results.some(r => r)  // OR: Any rule matches
      : results.every(r => r);  // AND: All rules match
  },

  evaluateRule: (product: Thing, rule: CollectionRule) => {
    const value = getProductProperty(product, rule.column);
    const condition = rule.condition;

    switch (rule.relation) {
      case "equals":
        return value === condition;
      case "not_equals":
        return value !== condition;
      case "contains":
        return String(value).includes(condition);
      case "not_contains":
        return !String(value).includes(condition);
      case "starts_with":
        return String(value).startsWith(condition);
      case "ends_with":
        return String(value).endsWith(condition);
      case "greater_than":
        return Number(value) > Number(condition);
      case "less_than":
        return Number(value) < Number(condition);
      default:
        return false;
    }
  },

  // Automatically maintain product-collection connections
  updateSmartCollectionMembership: async (productId: Id<"things">) => {
    const product = await getProduct(productId);
    const smartCollections = await getSmartCollections();

    for (const collection of smartCollections) {
      const shouldBelongTo = evaluateRules(
        product,
        collection.properties.smartRules.rules,
        collection.properties.smartRules.disjunctive
      );

      const existingConnection = await getConnection(product._id, collection._id);

      if (shouldBelongTo && !existingConnection) {
        // Add product to collection
        await createConnection({
          type: "belongs_to",
          fromId: product._id,
          toId: collection._id,
          properties: { autoAdded: true },
        });

        await createEvent({
          type: "product_added_to_collection",
          thingId: product._id,
          groupId: collection._id,
        });
      } else if (!shouldBelongTo && existingConnection) {
        // Remove product from collection
        await deleteConnection(existingConnection._id);

        await createEvent({
          type: "product_removed_from_collection",
          thingId: product._id,
          groupId: collection._id,
          properties: { reason: "no_longer_matches_rules" },
        });
      }
    }
  },
};
```

### Trigger Re-Evaluation

Re-evaluate smart collection membership when:
1. Product properties change (title, vendor, type, tags, etc.)
2. Variant properties change (price, weight, inventory)
3. Smart collection rules are updated

```typescript
// Convex mutation - triggered by product update
export const handleProductUpdate = mutation({
  handler: async (ctx, args) => {
    // ... update product ...

    // Re-evaluate all smart collections
    await SmartCollectionService.updateSmartCollectionMembership(
      args.productId
    );
  },
});
```

## Integration with ONE Platform Features

### 1. Navigation Menus

Use collections for automated navigation:

```typescript
// Query collections for menu
export const getCollectionMenu = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("groups")
      .withIndex("by_type_and_parent", q =>
        q.eq("type", "collection").eq("parentGroupId", args.groupId)
      )
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();

    return buildHierarchy(collections);  // Nested structure
  },
});
```

### 2. Faceted Search

Use collections as filters:

```typescript
// Search products with collection filter
export const searchProducts = query({
  args: {
    collectionId: v.optional(v.id("groups")),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("things")
      .withIndex("by_type", q => q.eq("type", "product"))
      .collect();

    if (args.collectionId) {
      // Filter by collection membership
      const connections = await ctx.db
        .query("connections")
        .withIndex("by_type_and_to", q =>
          q.eq("type", "belongs_to").eq("toId", args.collectionId)
        )
        .collect();

      const productIds = new Set(connections.map(c => c.fromId));
      products = products.filter(p => productIds.has(p._id));
    }

    // Apply text search
    return products.filter(p =>
      p.name.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});
```

### 3. AI-Powered Collections

Use AI to suggest products for manual collections:

```typescript
// Clone analyzes collection and suggests products
const suggestions = await clone.analyze({
  context: "collection_curation",
  collection: {
    title: "Summer Essentials",
    description: "Must-have items for summer",
    existingProducts: currentProducts,
  },
  catalog: allProducts,
  question: "Which 10 products should be added to this collection?",
});

// Returns: Ranked list with reasoning
// 1. Sunscreen SPF 50 - Essential sun protection
// 2. Beach Towel Set - Perfect for summer outings
// ...
```

## Best Practices

### 1. Collection Organization

**Flat Structure (Shopify Native):**
- All Products
- New Arrivals
- Best Sellers
- Sale Items
- Electronics
- Apparel
- Home & Garden

**Hierarchical Structure (ONE Platform):**
```
Store
├─ Featured Collections
│  ├─ New Arrivals
│  ├─ Best Sellers
│  └─ Sale Items
├─ Categories
│  ├─ Electronics
│  │  ├─ Computers
│  │  └─ Phones
│  └─ Apparel
│     ├─ Men's
│     └─ Women's
└─ Seasonal
   ├─ Summer 2025
   └─ Holiday 2024
```

### 2. Smart vs Manual

**Use Smart Collections for:**
- Dynamic categorization (price ranges, vendors, types)
- Time-based collections (new arrivals via tags)
- Automated merchandising (best sellers)
- Large catalogs (1000+ products)

**Use Manual Collections for:**
- Curated selections (gift guides, editorial)
- Seasonal campaigns
- Limited-time promotions
- Small catalogs (<100 products)

### 3. Performance Optimization

**Problem:** Large collections (1000+ products) slow to load

**Solution:**
```typescript
// Paginate collection products
export const getCollectionProducts = query({
  args: {
    collectionId: v.id("groups"),
    page: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_type_and_to", q =>
        q.eq("type", "belongs_to").eq("toId", args.collectionId)
      )
      .order("desc")  // Sort by position for manual collections
      .paginate({
        cursor: args.page * args.limit,
        numItems: args.limit,
      });

    // Fetch products in batch
    const products = await Promise.all(
      connections.page.map(c => ctx.db.get(c.fromId))
    );

    return {
      products,
      hasMore: connections.isDone,
      total: connections.page.length,
    };
  },
});
```

### 4. SEO Optimization

Collections are key landing pages for SEO:

```typescript
{
  properties: {
    seo: {
      title: "Men's Running Shoes | Free Shipping on Orders $50+",
      description: "Shop our collection of men's running shoes from top brands like Nike, Adidas, and New Balance. Free shipping on orders over $50.",
      keywords: ["running shoes", "mens athletic footwear", "sneakers"],
    },
    metafields: {
      og_image: "https://cdn.shopify.com/collections/mens-running-shoes.jpg",
      og_description: "Discover the best running shoes for men...",
    }
  }
}
```

## Implementation Roadmap

### Phase 1: Basic Collections
- Sync manual and smart collections as groups
- Map products to collections via connections
- Display collection pages on storefront
- Handle collection create/update/delete webhooks

### Phase 2: Smart Collections
- Implement rule evaluation engine
- Automatically maintain product-collection connections
- Support all rule columns and relations
- Handle rule updates with re-evaluation

### Phase 3: Advanced Features
- Hierarchical nested collections
- AI-powered collection curation
- Collection performance analytics
- Automated merchandising (feature high-margin products)

## Next Steps

1. **Cycle 10:** Implement ShopifyProvider base class → `backend/convex/services/providers/ShopifyProvider.ts`
2. **Cycle 11-15:** Implement sync methods (products, collections, orders, customers, inventory)
3. **Cycle 20:** Build ShopifyProvider UI for OAuth and configuration

## References

- [Shopify Collection API](https://shopify.dev/docs/api/admin-rest/latest/resources/collection)
- [Smart Collections](https://shopify.dev/docs/api/admin-rest/latest/resources/smartcollection)
- [Manual Collections (Custom)](https://help.shopify.com/en/manual/products/collections/manual-shopify-collection)
- [Smart Collection Rules](https://help.shopify.com/en/manual/products/collections/smart-collections)
- [Collection GraphQL API](https://shopify.dev/docs/api/admin-graphql/latest/objects/collection)
- [Collect Resource](https://shopify.dev/docs/api/admin-rest/latest/resources/collect)
- [Product Taxonomy (2025)](https://shopify.dev/changelog/introducing-productcategoryidwithdescendants-in-collectionrulecolumn-for-smart-collections)

---

**Document Status:** Draft - Awaiting review and implementation
**Next Review:** After Cycle 10 complete
