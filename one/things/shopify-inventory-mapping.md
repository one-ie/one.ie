---
title: Shopify Inventory Management Mapping
dimension: things
category: shopify-integration
tags: shopify, ecommerce, inventory, stock, locations
related_dimensions: events, groups, connections
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document maps Shopify's Inventory Management system to ONE's Things dimension.
  Location: one/things/shopify-inventory-mapping.md
  Purpose: Documents how Shopify inventory data integrates with ONE's product things
  Related dimensions: events (inventory updates), groups (locations), connections (product-location)
  For AI agents: Read this to understand Shopify inventory mapping to ONE Platform.
---

# Shopify Inventory Management Mapping

**Status:** Planning
**Integration Phase:** Cycle 8 of 100
**Last Updated:** 2025-11-22

## Executive Summary

This document maps Shopify's Inventory Management system to ONE Platform's **Things** dimension (dimension 3). Shopify uses a multi-location inventory system with three core objects: **InventoryItem** (metadata), **InventoryLevel** (quantities per location), and **Location** (warehouses/stores). All inventory data maps to properties on product and variant things in ONE Platform.

## Shopify Inventory Overview

### Core Inventory Objects

#### 1. InventoryItem

Stores metadata about a product's stock unit.

```json
{
  "id": 39072856,
  "sku": "IPOD2008GREEN",
  "created_at": "2025-01-15T10:00:00-05:00",
  "updated_at": "2025-01-15T10:00:00-05:00",
  "requires_shipping": true,
  "cost": "25.00",
  "country_code_of_origin": "US",
  "province_code_of_origin": "NY",
  "harmonized_system_code": "1234567890",
  "tracked": true,
  "country_harmonized_system_codes": [
    {"harmonized_system_code": "1234567890", "country_code": "CA"}
  ]
}
```

**Key Properties:**
- `tracked`: Whether inventory levels are tracked (true/false)
- `cost`: Unit cost for profit calculations
- `sku`: Unique stock-keeping unit identifier
- `requires_shipping`: Physical vs digital products
- Customs/shipping metadata (harmonized codes, origin)

#### 2. InventoryLevel

Stores actual available quantity at a specific location.

```json
{
  "inventory_item_id": 39072856,
  "location_id": 487838322,
  "available": 5,
  "updated_at": "2025-01-20T11:00:00-05:00",
  "admin_graphql_api_id": "gid://shopify/InventoryLevel/548380009?inventory_item_id=39072856"
}
```

**Key Properties:**
- `available`: Units available for sale (can be negative if overselling allowed)
- `location_id`: Where inventory is stocked
- One inventory level per inventory item per location

#### 3. Location

Identifies where inventory is stocked or fulfilled from.

```json
{
  "id": 655441491,
  "name": "New York Warehouse",
  "address1": "150 West 26th Street",
  "address2": "11th Floor",
  "city": "New York",
  "zip": "10001",
  "province": "New York",
  "country": "US",
  "phone": "6466436970",
  "created_at": "2025-01-10T11:00:00-05:00",
  "updated_at": "2025-01-10T11:00:00-05:00",
  "country_code": "US",
  "country_name": "United States",
  "province_code": "NY",
  "legacy": false,
  "active": true,
  "admin_graphql_api_id": "gid://shopify/Location/655441491"
}
```

**Types:**
- Physical stores
- Warehouses
- Third-party fulfillment centers (e.g., Amazon FBA)
- Drop-shipping suppliers

### Multi-Location Tracking

Shopify automatically tracks inventory across up to **1,000 locations**:

```
Product Variant "Green iPod"
├─ New York Warehouse: 5 units available
├─ Los Angeles Store: 12 units available
├─ Amazon FBA: 100 units available
└─ Drop Shipper A: 500 units available
Total Available: 617 units
```

### Inventory Policies

#### Continue Selling When Out of Stock

```json
{
  "inventory_policy": "continue",  // or "deny"
  "inventory_management": "shopify"
}
```

- `deny`: Stop selling when inventory reaches 0
- `continue`: Allow selling with negative inventory (backorders/pre-orders)

## API Transition (2025)

### Legacy REST API (Deprecated April 1, 2025)

```
GET /admin/api/2024-10/inventory_items/{id}.json
GET /admin/api/2024-10/inventory_levels.json
POST /admin/api/2024-10/inventory_levels/set.json
```

### New GraphQL Admin API (Required)

```graphql
query GetInventoryLevels($itemId: ID!) {
  inventoryItem(id: $itemId) {
    id
    sku
    tracked
    unitCost {
      amount
      currencyCode
    }
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
```

### Permissions Required

- `read_inventory`: Retrieve inventory data
- `write_inventory`: Update stock levels

### Rate Limits

**Critical:** 40 requests per store per minute (replenished at 2/second)

## Mapping to ONE Platform

### Product Variant Thing with Inventory Properties

Each Shopify product variant maps to a `thing` with `type: "product_variant"` containing inventory metadata:

```typescript
{
  _id: Id<"things">,
  type: "product_variant",
  name: "Green iPod - 8GB",
  groupId: Id<"groups">,        // Store group
  properties: {
    // Core product data
    productId: "gid://shopify/Product/632910392",
    variantId: "gid://shopify/ProductVariant/39072856",
    sku: "IPOD2008GREEN",
    price: 199.99,
    compareAtPrice: 249.99,

    // Inventory metadata (from InventoryItem)
    inventoryItem: {
      id: "gid://shopify/InventoryItem/39072856",
      tracked: true,
      requiresShipping: true,
      cost: 25.00,
      costCurrency: "USD",
      countryOfOrigin: "US",
      provinceOfOrigin: "NY",
      harmonizedSystemCode: "1234567890",
    },

    // Inventory policy
    inventoryPolicy: "continue",  // or "deny"
    inventoryManagement: "shopify",

    // Aggregated inventory (calculated from all locations)
    inventory: {
      totalAvailable: 617,
      totalReserved: 23,
      totalOnHand: 640,
      totalCommitted: 23,
      lastUpdated: 1700000000000,
    },

    // Multi-location breakdown
    inventoryByLocation: [
      {
        locationId: "gid://shopify/Location/655441491",
        locationName: "New York Warehouse",
        available: 5,
        reserved: 2,
        onHand: 7,
        updatedAt: 1700000000000,
      },
      {
        locationId: "gid://shopify/Location/905684977",
        locationName: "Los Angeles Store",
        available: 12,
        reserved: 0,
        onHand: 12,
        updatedAt: 1700000000000,
      },
      {
        locationId: "gid://shopify/Location/24826418",
        locationName: "Amazon FBA",
        available: 100,
        reserved: 21,
        onHand: 121,
        updatedAt: 1700000000000,
      },
      {
        locationId: "gid://shopify/Location/44312345",
        locationName: "Drop Shipper A",
        available: 500,
        reserved: 0,
        onHand: 500,
        updatedAt: 1700000000000,
      }
    ],

    // Stock status (calculated field)
    stockStatus: "in_stock",  // "in_stock" | "low_stock" | "out_of_stock" | "backorder"
    lowStockThreshold: 10,
  },
  status: "active",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
}
```

### Inventory Terminology

**Key Metrics:**

1. **Available**: Units that can be sold immediately
   ```
   available = on_hand - reserved
   ```

2. **On Hand**: Physical units in the location
   ```
   on_hand = available + reserved
   ```

3. **Reserved**: Units allocated to pending orders
   ```
   reserved = committed (units in unfulfilled orders)
   ```

4. **Committed**: Units in orders awaiting fulfillment

### Location Thing (Optional)

For stores with complex fulfillment, locations can map to `groups`:

```typescript
{
  _id: Id<"groups">,
  type: "warehouse",
  name: "New York Warehouse",
  parentGroupId: Id<"groups">,  // Parent store group
  properties: {
    shopifyLocationId: "gid://shopify/Location/655441491",
    address: {
      address1: "150 West 26th Street",
      address2: "11th Floor",
      city: "New York",
      province: "NY",
      country: "US",
      zip: "10001",
    },
    phone: "+16466436970",
    active: true,
    legacy: false,
    fulfillmentType: "warehouse",  // "warehouse" | "retail" | "3pl" | "dropship"
  },
  status: "active",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
}
```

**When to use Groups for Locations:**
- Multi-location businesses with complex fulfillment logic
- Need to track location-specific settings/users
- Want to scope inventory queries by location

**When to use Properties array:**
- Simple inventory tracking
- Single location or few locations
- Don't need location-specific permissions

## Inventory Update Events

### Event Type: `inventory_level_updated`

```typescript
{
  _id: Id<"events">,
  type: "inventory_level_updated",
  thingId: Id<"things">,       // Product variant
  groupId: Id<"groups">,       // Store or location group
  userId: Id<"things">,        // User who made the change (if manual)
  properties: {
    inventoryItemId: "gid://shopify/InventoryItem/39072856",
    locationId: "gid://shopify/Location/655441491",
    locationName: "New York Warehouse",

    previousAvailable: 5,
    newAvailable: 3,
    delta: -2,

    reason: "sale",  // "sale" | "restock" | "adjustment" | "return" | "damage"
    relatedOrderId?: "gid://shopify/Order/12345",
  },
  timestamp: 1700000000000,
}
```

### Event Type: `inventory_restocked`

```typescript
{
  _id: Id<"events">,
  type: "inventory_restocked",
  thingId: Id<"things">,       // Product variant
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    locationId: "gid://shopify/Location/655441491",
    quantityAdded: 100,
    newTotal: 105,
    purchaseOrderId?: "PO-2025-001",
    supplier?: "Acme Wholesale",
  },
  timestamp: 1700000000000,
}
```

### Event Type: `inventory_low_stock_alert`

```typescript
{
  _id: Id<"events">,
  type: "inventory_low_stock_alert",
  thingId: Id<"things">,
  groupId: Id<"groups">,
  properties: {
    locationId: "gid://shopify/Location/655441491",
    currentLevel: 3,
    threshold: 10,
    daysUntilStockout: 2,  // Calculated based on sales velocity
    recommendedReorder: 50,
  },
  timestamp: 1700000000000,
}
```

### Event Type: `inventory_out_of_stock`

```typescript
{
  _id: Id<"events">,
  type: "inventory_out_of_stock",
  thingId: Id<"things">,
  groupId: Id<"groups">,
  properties: {
    locationId: "gid://shopify/Location/655441491",
    lastAvailable: 1700000000000,
    backordersAllowed: true,  // Based on inventory_policy
  },
  timestamp: 1700000000000,
}
```

## Real-Time Updates via Webhooks

### Inventory Webhooks

```
inventory_levels/update    → Trigger: inventory_level_updated event
inventory_items/create     → Trigger when new variant created
inventory_items/update     → Trigger when SKU/cost changes
inventory_items/delete     → Trigger when variant deleted
```

### Webhook Processing Pattern

```typescript
// Convex mutation
export const handleInventoryUpdate = mutation({
  args: {
    inventory_item_id: v.number(),
    location_id: v.number(),
    available: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Find product variant thing
    const variant = await ctx.db
      .query("things")
      .withIndex("by_type", q => q.eq("type", "product_variant"))
      .filter(q =>
        q.eq(
          q.field("properties.inventoryItem.id"),
          `gid://shopify/InventoryItem/${args.inventory_item_id}`
        )
      )
      .first();

    if (!variant) return;

    // 2. Update inventory by location
    const locationIndex = variant.properties.inventoryByLocation.findIndex(
      loc => loc.locationId === `gid://shopify/Location/${args.location_id}`
    );

    const previousAvailable =
      variant.properties.inventoryByLocation[locationIndex]?.available || 0;

    // 3. Update the variant thing
    await ctx.db.patch(variant._id, {
      "properties.inventoryByLocation": [
        ...variant.properties.inventoryByLocation.slice(0, locationIndex),
        {
          ...variant.properties.inventoryByLocation[locationIndex],
          available: args.available,
          updatedAt: Date.now(),
        },
        ...variant.properties.inventoryByLocation.slice(locationIndex + 1),
      ],
      "properties.inventory.totalAvailable": calculateTotalAvailable(
        variant.properties.inventoryByLocation
      ),
      "properties.inventory.lastUpdated": Date.now(),
    });

    // 4. Create event
    await ctx.db.insert("events", {
      type: "inventory_level_updated",
      thingId: variant._id,
      groupId: variant.groupId,
      properties: {
        locationId: `gid://shopify/Location/${args.location_id}`,
        previousAvailable,
        newAvailable: args.available,
        delta: args.available - previousAvailable,
        reason: "external_update",
      },
      timestamp: Date.now(),
    });

    // 5. Check for low stock alert
    if (args.available < variant.properties.lowStockThreshold) {
      await ctx.db.insert("events", {
        type: "inventory_low_stock_alert",
        thingId: variant._id,
        groupId: variant.groupId,
        properties: {
          locationId: `gid://shopify/Location/${args.location_id}`,
          currentLevel: args.available,
          threshold: variant.properties.lowStockThreshold,
        },
        timestamp: Date.now(),
      });
    }
  },
});
```

## Inventory Adjustment API Methods

### Set Inventory Level

```graphql
mutation SetInventoryLevel($inventoryItemId: ID!, $locationId: ID!, $available: Int!) {
  inventorySetOnHandQuantities(
    input: {
      reason: "correction"
      setQuantities: [
        {
          inventoryItemId: $inventoryItemId
          locationId: $locationId
          quantity: $available
        }
      ]
    }
  ) {
    userErrors {
      field
      message
    }
    inventoryAdjustmentGroup {
      createdAt
      reason
      changes {
        name
        delta
      }
    }
  }
}
```

### Adjust Inventory (Relative)

```graphql
mutation AdjustInventory($inventoryItemId: ID!, $locationId: ID!, $delta: Int!) {
  inventoryAdjustQuantities(
    input: {
      reason: "correction"
      changes: [
        {
          inventoryItemId: $inventoryItemId
          locationId: $locationId
          delta: $delta
        }
      ]
    }
  ) {
    userErrors {
      field
      message
    }
    inventoryAdjustmentGroup {
      createdAt
      reason
      changes {
        name
        delta
      }
    }
  }
}
```

## Integration with ONE Platform Features

### 1. Stock Status Calculation

```typescript
// Effect.ts service
export const InventoryService = {
  calculateStockStatus: (variant: Thing) => {
    const { totalAvailable, lowStockThreshold } = variant.properties.inventory;
    const { inventoryPolicy } = variant.properties;

    if (totalAvailable <= 0) {
      return inventoryPolicy === "continue" ? "backorder" : "out_of_stock";
    }

    if (totalAvailable <= lowStockThreshold) {
      return "low_stock";
    }

    return "in_stock";
  },

  getLocationWithMostStock: (variant: Thing) => {
    return variant.properties.inventoryByLocation.reduce((max, loc) =>
      loc.available > max.available ? loc : max
    );
  },

  getTotalValue: (variant: Thing) => {
    const { totalAvailable } = variant.properties.inventory;
    const { cost } = variant.properties.inventoryItem;
    return totalAvailable * cost;
  },
};
```

### 2. Low Stock Alerts

```typescript
// Convex scheduled function (runs daily)
export const checkLowStock = mutation({
  handler: async (ctx) => {
    const variants = await ctx.db
      .query("things")
      .withIndex("by_type", q => q.eq("type", "product_variant"))
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();

    for (const variant of variants) {
      const { totalAvailable, lowStockThreshold } =
        variant.properties.inventory;

      if (totalAvailable <= lowStockThreshold) {
        // Create alert event
        await ctx.db.insert("events", {
          type: "inventory_low_stock_alert",
          thingId: variant._id,
          groupId: variant.groupId,
          properties: {
            currentLevel: totalAvailable,
            threshold: lowStockThreshold,
          },
          timestamp: Date.now(),
        });

        // Send notification (implement via NotificationService)
        // await sendLowStockAlert(variant);
      }
    }
  },
});
```

### 3. Inventory Reports

```typescript
// Convex query
export const getInventoryReport = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const variants = await ctx.db
      .query("things")
      .withIndex("by_type_and_group", q =>
        q.eq("type", "product_variant").eq("groupId", args.groupId)
      )
      .collect();

    const totalValue = variants.reduce((sum, v) => {
      return sum + v.properties.inventory.totalAvailable * v.properties.inventoryItem.cost;
    }, 0);

    const stockStatus = {
      in_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
      backorder: 0,
    };

    variants.forEach(v => {
      const status = InventoryService.calculateStockStatus(v);
      stockStatus[status]++;
    });

    return {
      totalProducts: variants.length,
      totalValue,
      stockStatus,
      byLocation: calculateByLocation(variants),
    };
  },
});
```

## Best Practices

### 1. Caching Strategy

**Problem:** Rate limits (40 req/min) + large product catalogs

**Solution:**
- Cache inventory data in ONE Platform things
- Sync via webhooks (real-time)
- Fallback to periodic polling (every 15 min) for redundancy
- Cache location data (changes infrequently)

### 2. Batch Operations

Use GraphQL to fetch multiple inventory levels in single request:

```graphql
query GetMultipleInventoryLevels {
  inventoryItems(first: 50) {
    edges {
      node {
        id
        sku
        inventoryLevels(first: 10) {
          edges {
            node {
              available
              location { name }
            }
          }
        }
      }
    }
  }
}
```

### 3. Error Handling

```typescript
// Handle inventory adjustment errors
try {
  await shopifyInventoryAdjust({
    inventoryItemId,
    locationId,
    delta: -2,
  });
} catch (error) {
  if (error.message.includes("not enough inventory")) {
    // Product oversold - handle gracefully
    await notifyCustomer("backorder");
    await createBackorderEvent();
  }
  throw error;
}
```

### 4. Negative Inventory

**Shopify allows negative inventory** when `inventory_policy: "continue"`

**ONE Platform handling:**
```typescript
{
  available: -5,  // 5 units backordered
  stockStatus: "backorder",
}
```

Track backorder fulfillment via events:
```typescript
{
  type: "backorder_created",
  properties: {
    quantity: 5,
    estimatedFulfillmentDate: 1700000000000,
  }
}
```

## Implementation Roadmap

### Phase 1: Basic Inventory Sync
- Map InventoryItem metadata to product variant properties
- Sync inventory levels for single location
- Handle inventory update webhooks
- Display stock status on product pages

### Phase 2: Multi-Location Support
- Map locations to groups (optional)
- Sync inventory across all locations
- Aggregate total available quantity
- Support location-based fulfillment routing

### Phase 3: Advanced Features
- Low stock alerts and notifications
- Inventory reports and analytics
- Automatic reorder recommendations (AI-powered)
- Inventory forecasting based on sales velocity

## Next Steps

1. **Cycle 9:** Map Collections to Groups → `one/groups/shopify-collections-mapping.md`
2. **Cycle 10:** Implement ShopifyProvider base class
3. **Cycle 15:** Implement inventory sync methods

## References

- [Shopify InventoryLevel API](https://shopify.dev/docs/api/admin-rest/latest/resources/inventorylevel)
- [Shopify InventoryItem API](https://shopify.dev/docs/api/admin-rest/latest/resources/inventoryitem)
- [GraphQL Admin API - Inventory](https://shopify.dev/docs/api/admin-graphql/latest/objects/InventoryLevel)
- [Multi-Location Inventory Guide](https://shopify.dev/docs/apps/build/graphql-basics/manage-inventory)
- [Inventory Webhooks](https://shopify.dev/docs/api/webhooks#event-topics-inventory)

---

**Document Status:** Draft - Awaiting review and implementation
**Next Review:** After Cycle 9 complete
