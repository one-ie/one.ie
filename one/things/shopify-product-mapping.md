---
title: Shopify Product Model → ONE Thing Mapping
dimension: things
category: shopify
tags: shopify, product, variant, inventory, ecommerce, mapping
related_dimensions: connections, events, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete mapping of Shopify Product and ProductVariant models to ONE's Thing dimension.
  Includes transformation logic, edge cases, and examples of Shopify JSON → ONE Thing conversion.
  Part of Shopify Integration (Cycle 4).
---

# Shopify Product Model → ONE Thing Mapping

**Version:** 1.0.0
**Cycle:** 4 of 100
**Purpose:** Map Shopify Products and Variants to ONE's universal Thing dimension

---

## Executive Summary

**Shopify's Product Model (2024):**
- Product with up to 2,048 variants (increased from 100 in older APIs)
- Up to 3 options per product (size, color, material, etc.)
- Variants represent every combination of options
- Options and option values are now first-class entities
- Images can be assigned to products or specific variants
- Inventory tracking at variant level

**ONE Platform Mapping:**
- **Product** → `Thing` (type: "product")
- **ProductVariant** → `Thing` (type: "product_variant")
- **Product → Variant relationship** → `Connection` (type: "variant_of")
- **Product → Collection** → `Connection` (type: "belongs_to")

**Key Decision:** Variants are separate Things (not embedded in product properties) to support:
- Direct connections (customer purchased variant X)
- Individual variant tracking
- Variant-specific events (variant out of stock)
- Scalability (2,048 variants per product)

---

## Shopify Product Structure (GraphQL 2024-04+)

### Core Product Fields

```graphql
type Product {
  id: ID!                          # Global ID (gid://shopify/Product/123)
  title: String!                   # Display name
  description: String              # HTML or plain text
  handle: String!                  # URL-friendly slug
  status: ProductStatus!           # ACTIVE, ARCHIVED, DRAFT
  vendor: String                   # Brand/manufacturer
  productType: String              # Category (T-Shirts, Books, etc.)
  tags: [String!]!                 # Product tags

  # Options (up to 3)
  options: [ProductOption!]!       # Size, Color, Material, etc.

  # Variants (up to 2,048)
  variants(first: Int!): ProductVariantConnection!

  # Media (images, videos)
  media(first: Int!): MediaConnection!

  # SEO
  seo: SEO!                        # title, description

  # Pricing
  priceRangeV2: ProductPriceRangeV2!

  # Inventory
  totalInventory: Int              # Sum across all variants
  tracksInventory: Boolean!

  # Metadata
  metafields: [Metafield!]!

  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!
  publishedAt: DateTime
}
```

### Product Options (First-Class in 2024)

```graphql
type ProductOption {
  id: ID!
  name: String!                    # "Size", "Color", "Material"
  position: Int!                   # 1, 2, or 3
  values: [String!]!               # ["Small", "Medium", "Large"]
  optionValues: [ProductOptionValue!]!
}

type ProductOptionValue {
  id: ID!
  name: String!                    # "Small"
  hasVariants: Boolean!
}
```

### Product Variant Structure

```graphql
type ProductVariant {
  id: ID!                          # Global ID (gid://shopify/ProductVariant/456)
  title: String!                   # "Small / Blue"
  sku: String                      # Stock Keeping Unit
  barcode: String                  # UPC/EAN/ISBN

  # Pricing
  price: Money!
  compareAtPrice: Money            # Original price (for discounts)

  # Inventory
  inventoryQuantity: Int!
  inventoryPolicy: ProductVariantInventoryPolicy!  # DENY or CONTINUE
  inventoryManagement: ProductVariantInventoryManagement
  availableForSale: Boolean!

  # Options (selected values)
  selectedOptions: [SelectedOption!]!  # {name: "Size", value: "Small"}

  # Physical properties
  weight: Float
  weightUnit: WeightUnit
  requiresShipping: Boolean!

  # Media
  image: Image                     # Variant-specific image

  # Position
  position: Int!

  # Metadata
  metafields: [Metafield!]!

  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

## ONE Thing Mapping

### Product → Thing (type: "product")

```typescript
// ONE Platform Thing structure for Shopify Product
{
  _id: Id<'things'>,
  groupId: Id<'groups'>,           // Shopify Store ID
  type: "product",
  name: string,                    // Product title
  slug: string,                    // Product handle (URL-friendly)
  description?: string,            // Product description (plain text or HTML)

  properties: {
    // Shopify identifiers
    shopifyId: string,             // gid://shopify/Product/123 or "123"
    shopifyHandle: string,         // URL handle

    // Status
    status: "active" | "archived" | "draft",

    // Categorization
    vendor?: string,               // Brand/manufacturer
    productType?: string,          // Category

    // Options (up to 3)
    options: Array<{
      name: string,                // "Size", "Color", "Material"
      position: number,            // 1, 2, or 3
      values: string[]             // ["Small", "Medium", "Large"]
    }>,

    // Pricing (range across variants)
    priceRange: {
      min: number,
      max: number,
      currency: string             // "USD", "EUR", etc.
    },

    // Inventory
    totalInventory?: number,       // Sum across all variants
    tracksInventory: boolean,

    // SEO
    seo?: {
      title?: string,
      description?: string
    },

    // Media
    images: Array<{
      url: string,
      altText?: string,
      position: number
    }>,
    featuredImage?: {
      url: string,
      altText?: string
    },

    // Shopify metadata
    metafields?: Record<string, any>,

    // Timestamps (from Shopify)
    shopifyCreatedAt: string,      // ISO 8601
    shopifyUpdatedAt: string,
    shopifyPublishedAt?: string
  },

  // ONE Platform standard fields
  createdAt: number,               // ONE timestamp (milliseconds)
  updatedAt: number,
  createdBy?: Id<'things'>         // Creator/admin who synced
}
```

### ProductVariant → Thing (type: "product_variant")

```typescript
// ONE Platform Thing structure for Shopify ProductVariant
{
  _id: Id<'things'>,
  groupId: Id<'groups'>,           // Same as parent product
  type: "product_variant",
  name: string,                    // Variant title ("Small / Blue")
  slug: string,                    // Generated from product handle + variant options

  properties: {
    // Shopify identifiers
    shopifyId: string,             // gid://shopify/ProductVariant/456 or "456"
    shopifyProductId: string,      // Parent product ID

    // SKU & Barcode
    sku?: string,                  // Stock Keeping Unit
    barcode?: string,              // UPC/EAN/ISBN

    // Pricing
    price: number,
    compareAtPrice?: number,       // Original price (for discounts)
    currency: string,              // "USD", "EUR", etc.

    // Selected options (what makes this variant unique)
    selectedOptions: Array<{
      name: string,                // "Size"
      value: string                // "Small"
    }>,

    // Inventory
    inventoryQuantity: number,
    inventoryPolicy: "deny" | "continue",  // Deny = can't sell when out of stock
    inventoryManagement?: string,  // "shopify", "third_party", null
    availableForSale: boolean,

    // Physical properties
    weight?: number,
    weightUnit?: "kg" | "lb" | "oz" | "g",
    requiresShipping: boolean,

    // Media
    image?: {
      url: string,
      altText?: string
    },

    // Position
    position: number,              // Display order

    // Shopify metadata
    metafields?: Record<string, any>,

    // Timestamps (from Shopify)
    shopifyCreatedAt: string,
    shopifyUpdatedAt: string
  },

  // ONE Platform standard fields
  createdAt: number,
  updatedAt: number,
  createdBy?: Id<'things'>
}
```

---

## Transformation Logic

### Step 1: Map Product to ONE Thing

```typescript
function transformShopifyProductToThing(
  shopifyProduct: ShopifyProduct,
  groupId: Id<'groups'>
): ThingInput {
  return {
    groupId,
    type: "product",
    name: shopifyProduct.title,
    slug: shopifyProduct.handle,
    description: stripHtml(shopifyProduct.description),

    properties: {
      shopifyId: extractNumericId(shopifyProduct.id),
      shopifyHandle: shopifyProduct.handle,
      status: shopifyProduct.status.toLowerCase(),
      vendor: shopifyProduct.vendor,
      productType: shopifyProduct.productType,

      options: shopifyProduct.options.map(opt => ({
        name: opt.name,
        position: opt.position,
        values: opt.values
      })),

      priceRange: {
        min: parseFloat(shopifyProduct.priceRangeV2.minVariantPrice.amount),
        max: parseFloat(shopifyProduct.priceRangeV2.maxVariantPrice.amount),
        currency: shopifyProduct.priceRangeV2.minVariantPrice.currencyCode
      },

      totalInventory: shopifyProduct.totalInventory,
      tracksInventory: shopifyProduct.tracksInventory,

      seo: shopifyProduct.seo ? {
        title: shopifyProduct.seo.title,
        description: shopifyProduct.seo.description
      } : undefined,

      images: shopifyProduct.media.edges
        .filter(edge => edge.node.__typename === 'MediaImage')
        .map((edge, index) => ({
          url: edge.node.image.url,
          altText: edge.node.alt,
          position: index + 1
        })),

      featuredImage: shopifyProduct.featuredImage ? {
        url: shopifyProduct.featuredImage.url,
        altText: shopifyProduct.featuredImage.altText
      } : undefined,

      metafields: transformMetafields(shopifyProduct.metafields),

      shopifyCreatedAt: shopifyProduct.createdAt,
      shopifyUpdatedAt: shopifyProduct.updatedAt,
      shopifyPublishedAt: shopifyProduct.publishedAt
    }
  };
}
```

### Step 2: Map ProductVariant to ONE Thing

```typescript
function transformShopifyVariantToThing(
  shopifyVariant: ShopifyProductVariant,
  productId: Id<'things'>,
  groupId: Id<'groups'>
): ThingInput {
  return {
    groupId,
    type: "product_variant",
    name: shopifyVariant.title,
    slug: generateVariantSlug(shopifyVariant),

    properties: {
      shopifyId: extractNumericId(shopifyVariant.id),
      shopifyProductId: extractNumericId(shopifyVariant.product.id),

      sku: shopifyVariant.sku,
      barcode: shopifyVariant.barcode,

      price: parseFloat(shopifyVariant.price.amount),
      compareAtPrice: shopifyVariant.compareAtPrice
        ? parseFloat(shopifyVariant.compareAtPrice.amount)
        : undefined,
      currency: shopifyVariant.price.currencyCode,

      selectedOptions: shopifyVariant.selectedOptions.map(opt => ({
        name: opt.name,
        value: opt.value
      })),

      inventoryQuantity: shopifyVariant.inventoryQuantity,
      inventoryPolicy: shopifyVariant.inventoryPolicy.toLowerCase(),
      inventoryManagement: shopifyVariant.inventoryManagement,
      availableForSale: shopifyVariant.availableForSale,

      weight: shopifyVariant.weight,
      weightUnit: shopifyVariant.weightUnit?.toLowerCase(),
      requiresShipping: shopifyVariant.requiresShipping,

      image: shopifyVariant.image ? {
        url: shopifyVariant.image.url,
        altText: shopifyVariant.image.altText
      } : undefined,

      position: shopifyVariant.position,

      metafields: transformMetafields(shopifyVariant.metafields),

      shopifyCreatedAt: shopifyVariant.createdAt,
      shopifyUpdatedAt: shopifyVariant.updatedAt
    }
  };
}
```

### Step 3: Create Product-Variant Connection

```typescript
function createProductVariantConnection(
  productId: Id<'things'>,
  variantId: Id<'things'>,
  groupId: Id<'groups'>
): ConnectionInput {
  return {
    groupId,
    fromThingId: variantId,        // Variant
    toThingId: productId,          // Product
    relationshipType: "variant_of",
    metadata: {
      // Can add variant-specific metadata here
    }
  };
}
```

---

## Transformation Examples

### Example 1: Simple Product with 2 Variants

**Shopify Product JSON:**

```json
{
  "id": "gid://shopify/Product/7891234567890",
  "title": "Classic T-Shirt",
  "handle": "classic-t-shirt",
  "description": "<p>Comfortable cotton t-shirt</p>",
  "status": "ACTIVE",
  "vendor": "Acme Clothing",
  "productType": "T-Shirts",
  "tags": ["casual", "cotton", "summer"],
  "options": [
    {
      "id": "gid://shopify/ProductOption/123",
      "name": "Size",
      "position": 1,
      "values": ["Small", "Medium", "Large"]
    },
    {
      "id": "gid://shopify/ProductOption/124",
      "name": "Color",
      "position": 2,
      "values": ["Blue", "Red"]
    }
  ],
  "priceRangeV2": {
    "minVariantPrice": { "amount": "19.99", "currencyCode": "USD" },
    "maxVariantPrice": { "amount": "24.99", "currencyCode": "USD" }
  },
  "totalInventory": 250,
  "tracksInventory": true,
  "variants": {
    "edges": [
      {
        "node": {
          "id": "gid://shopify/ProductVariant/4567890",
          "title": "Small / Blue",
          "sku": "TSHIRT-SM-BLU",
          "price": { "amount": "19.99", "currencyCode": "USD" },
          "inventoryQuantity": 100,
          "selectedOptions": [
            { "name": "Size", "value": "Small" },
            { "name": "Color", "value": "Blue" }
          ]
        }
      },
      {
        "node": {
          "id": "gid://shopify/ProductVariant/4567891",
          "title": "Medium / Red",
          "sku": "TSHIRT-MD-RED",
          "price": { "amount": "24.99", "currencyCode": "USD" },
          "inventoryQuantity": 150,
          "selectedOptions": [
            { "name": "Size", "value": "Medium" },
            { "name": "Color", "value": "Red" }
          ]
        }
      }
    ]
  }
}
```

**ONE Platform Transformation:**

```typescript
// Product Thing
{
  _id: "k123...",                  // Generated by Convex
  groupId: "k999...",              // Shopify Store group ID
  type: "product",
  name: "Classic T-Shirt",
  slug: "classic-t-shirt",
  description: "Comfortable cotton t-shirt",

  properties: {
    shopifyId: "7891234567890",
    shopifyHandle: "classic-t-shirt",
    status: "active",
    vendor: "Acme Clothing",
    productType: "T-Shirts",

    options: [
      { name: "Size", position: 1, values: ["Small", "Medium", "Large"] },
      { name: "Color", position: 2, values: ["Blue", "Red"] }
    ],

    priceRange: {
      min: 19.99,
      max: 24.99,
      currency: "USD"
    },

    totalInventory: 250,
    tracksInventory: true,

    images: [],

    shopifyCreatedAt: "2024-01-15T10:00:00Z",
    shopifyUpdatedAt: "2024-11-22T14:30:00Z"
  },

  createdAt: 1700000000000,
  updatedAt: 1700000000000
}

// Variant 1 Thing
{
  _id: "k124...",
  groupId: "k999...",
  type: "product_variant",
  name: "Small / Blue",
  slug: "classic-t-shirt-small-blue",

  properties: {
    shopifyId: "4567890",
    shopifyProductId: "7891234567890",
    sku: "TSHIRT-SM-BLU",

    price: 19.99,
    currency: "USD",

    selectedOptions: [
      { name: "Size", value: "Small" },
      { name: "Color", value: "Blue" }
    ],

    inventoryQuantity: 100,
    inventoryPolicy: "deny",
    availableForSale: true,
    requiresShipping: true,

    position: 1,

    shopifyCreatedAt: "2024-01-15T10:00:00Z",
    shopifyUpdatedAt: "2024-11-22T14:30:00Z"
  },

  createdAt: 1700000000000,
  updatedAt: 1700000000000
}

// Connection: Variant → Product
{
  _id: "k200...",
  groupId: "k999...",
  fromThingId: "k124...",          // Variant
  toThingId: "k123...",            // Product
  relationshipType: "variant_of",
  metadata: {},
  createdAt: 1700000000000
}

// Knowledge: Product Tags
{
  _id: "k300...",
  groupId: "k999...",
  sourceThingId: "k123...",        // Product
  knowledgeType: "label",
  text: "casual",
  labels: ["tag", "product"],
  createdAt: 1700000000000
}
```

---

## Edge Cases & Challenges

### 1. Products Without Variants

**Scenario:** Single-option product (no size/color choices)

**Shopify:** Creates a default variant automatically

**ONE Mapping:**
- Create both Product Thing AND ProductVariant Thing
- Even single-option products have 1 variant in Shopify
- Keep the variant for consistency

### 2. Variants Without Inventory Tracking

**Scenario:** Digital products or services don't track inventory

**Shopify:** `tracksInventory: false`, `inventoryQuantity: null`

**ONE Mapping:**
```typescript
properties: {
  tracksInventory: false,
  inventoryQuantity: 0,           // Default to 0
  availableForSale: true,         // Can still be sold
  inventoryPolicy: "continue"     // Allow overselling
}
```

### 3. Products with 2,048 Variants

**Scenario:** Product with many combinations (3 options × many values)

**Shopify:** Supports up to 2,048 variants in new API

**ONE Mapping:**
- Create 2,048 separate Things (type: "product_variant")
- Use batch creation for performance
- Consider lazy loading (fetch variants on demand)

### 4. Variant Images

**Scenario:** Some variants have specific images, others inherit from product

**Shopify:** As of 2024-07, variant.image returns null unless explicitly set

**ONE Mapping:**
```typescript
// Variant with image
properties: {
  image: { url: "...", altText: "..." }
}

// Variant without image (inherits from product)
properties: {
  image: undefined  // or null
}

// Render logic: fallback to product.properties.featuredImage
```

### 5. Archived or Draft Products

**Scenario:** Product status is ARCHIVED or DRAFT (not ACTIVE)

**ONE Mapping:**
```typescript
properties: {
  status: "archived" | "draft"
}

// Still sync to ONE Platform, but filter in queries
// Don't show in public product listings
// Allow admin access only
```

### 6. Price Variations (Compare At Price)

**Scenario:** Variant has original price vs sale price

**Shopify:**
```json
{
  "price": { "amount": "15.99" },
  "compareAtPrice": { "amount": "24.99" }
}
```

**ONE Mapping:**
```typescript
properties: {
  price: 15.99,                   // Current sale price
  compareAtPrice: 24.99,          // Original price
  discountPercentage: 36          // Calculated: (24.99 - 15.99) / 24.99 * 100
}
```

### 7. Metafields (Custom Data)

**Scenario:** Store uses Shopify metafields for custom product data

**Shopify:**
```json
{
  "metafields": [
    {
      "namespace": "custom",
      "key": "material",
      "value": "100% organic cotton",
      "type": "single_line_text_field"
    }
  ]
}
```

**ONE Mapping:**
```typescript
properties: {
  metafields: {
    "custom.material": {
      value: "100% organic cotton",
      type: "single_line_text_field"
    }
  }
}

// Alternative: Create Knowledge entries for searchable metafields
```

---

## Query Patterns

### Get Product with Variants

```typescript
// Query product
const product = await provider.things.get({ thingId: productId });

// Query all variants for product
const variants = await provider.connections.query({
  toThingId: productId,
  relationshipType: "variant_of"
}).then(connections =>
  Promise.all(connections.map(c =>
    provider.things.get({ thingId: c.fromThingId })
  ))
);
```

### Get Variant by SKU

```typescript
const variant = await provider.things.query({
  groupId,
  type: "product_variant",
  filters: {
    "properties.sku": sku
  }
});
```

### Check Product Availability

```typescript
const variants = await getProductVariants(productId);
const inStock = variants.some(v =>
  v.properties.availableForSale &&
  v.properties.inventoryQuantity > 0
);
```

---

## Sync Strategy

### Initial Sync (Full Product Catalog)

1. Fetch all products from Shopify (paginated)
2. For each product:
   - Create Product Thing
   - Create Knowledge labels for tags
   - Fetch all variants (paginated)
   - Create ProductVariant Things
   - Create variant_of Connections
3. Store sync metadata (last sync time, cursor)

### Incremental Sync (Webhooks)

1. Listen to Shopify webhooks:
   - `products/create` → Create Product + Variants
   - `products/update` → Update Product Thing
   - `products/delete` → Soft delete (mark status: "deleted")
   - `product_listings/add` → Publish product
   - `product_listings/remove` → Unpublish product
   - `inventory_levels/update` → Update variant inventory

2. Process webhook payload → Transform → Update ONE database

---

## Performance Considerations

### Batch Operations

- Use Convex batch operations for creating 100+ variants
- Paginate large product catalogs (Shopify max: 250 per request)
- Cache frequently accessed products

### Image Handling

- Store Shopify CDN URLs (don't download images)
- Use Shopify's image transformation URLs (resize, crop)
- Lazy load variant images

### Search Optimization

- Index product name, SKU, tags for full-text search
- Create Knowledge chunks for product descriptions (RAG)
- Use Knowledge labels for faceted search (by tag, type, vendor)

---

## Related Dimensions

**Connections:**
- `variant_of` - ProductVariant → Product
- `belongs_to` - Product → Collection
- `purchased` - Customer → ProductVariant (from Orders)

**Events:**
- `product_created` - Product added to catalog
- `product_updated` - Product modified
- `product_viewed` - Customer viewed product
- `variant_out_of_stock` - Inventory depleted

**Knowledge:**
- Product tags → labels
- Product descriptions → chunks (RAG)
- SEO data → labels

---

## Next Steps

**Cycle 5:** Map Shopify Orders to Connections + Events
**Cycle 6:** Map Shopify Customers to People

---

## References

**Shopify Documentation:**
- [Product Model Components](https://shopify.dev/docs/apps/build/graphql/migrate/new-product-model/product-model-components)
- [Product Variant GraphQL](https://shopify.dev/docs/api/admin-graphql/latest/objects/ProductVariant)
- [New Product APIs (2024-04)](https://shopify.dev/changelog/new-graphql-product-apis-that-support-up-to-2000-variants-now-available-in-2024-04)

**ONE Platform:**
- `/one/knowledge/ontology.md` - 6-dimension specification
- `/one/things/plans/shopify-integration-100-cycles.md` - Integration plan

---

**Built with clarity, simplicity, and infinite scale in mind.**
