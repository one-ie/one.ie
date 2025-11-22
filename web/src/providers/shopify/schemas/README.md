# Shopify Validation Schemas

**Cycles 19-20 Implementation**

Comprehensive Zod validation schemas for all Shopify data structures in the ONE Platform.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Schema Categories](#schema-categories)
- [Usage Examples](#usage-examples)
- [Validation Helpers](#validation-helpers)
- [Edge Cases](#edge-cases)
- [Testing](#testing)

---

## Overview

This module provides runtime validation for all Shopify data transformations using [Zod](https://zod.dev/). These schemas ensure data integrity when:

- **Transforming** Shopify API responses to ONE Platform entities
- **Validating** webhook payloads from Shopify
- **Creating** connections and events from Shopify data
- **Syncing** products, customers, and orders

**Key Features:**
- ✅ Runtime type safety with TypeScript inference
- ✅ Comprehensive error messages
- ✅ Branded types for ID safety
- ✅ Complex validation rules (e.g., price ranges, email formats)
- ✅ Helper functions for common transformations

---

## Installation

The schemas are already available in your project:

```typescript
import {
  // Property schemas
  ProductPropertiesSchema,
  ProductVariantPropertiesSchema,
  CustomerPropertiesSchema,
  OrderPropertiesSchema,

  // Metadata schemas
  PurchasedMetadataSchema,
  OrderPlacedMetadataSchema,
  PaymentProcessedMetadataSchema,

  // Validation helpers
  parse,
  safeParse,
  validate,
  validateOrThrow,

  // Shopify helpers
  extractNumericId,
  generateVariantSlug,
  computeStockStatus,
} from '@/providers/shopify/schemas';
```

---

## Schema Categories

### 1. Property Schemas (`properties.ts`)

Validate Thing properties for Shopify entities.

#### Product Properties
```typescript
const productSchema = ProductPropertiesSchema;

// Fields:
// - shopifyId, shopifyHandle, title, description
// - vendor, productType, tags, status
// - options (up to 3), priceRange, totalInventory
// - images, featuredImage, seo
// - shopifyMetadata (id, gid, timestamps)
```

#### Product Variant Properties
```typescript
const variantSchema = ProductVariantPropertiesSchema;

// Fields:
// - shopifyId, shopifyProductId, sku, barcode
// - price, compareAtPrice, costPerItem, currency
// - selectedOptions, inventoryQuantity, inventoryPolicy
// - weight, weightUnit, requiresShipping
// - image, position, shopifyMetadata
```

#### Customer Properties
```typescript
const customerSchema = CustomerPropertiesSchema;

// Fields:
// - shopifyId, email, phone, firstName, lastName
// - addresses, defaultAddress, state, verified
// - marketing (email/sms consent), acceptsMarketing
// - tags, note, orderStats
// - taxExempt, currency, isGuest
```

#### Order Properties
```typescript
const orderSchema = OrderPropertiesSchema;

// Fields:
// - shopifyId, orderNumber, orderName
// - customerEmail, customerPhone, customerId
// - subtotalPrice, totalPrice, totalTax, totalShipping
// - financialStatus, fulfillmentStatus
// - lineItems, discounts, shippingAddress, billingAddress
```

### 2. Metadata Schemas (`metadata.ts`)

Validate metadata for Connections and Events.

#### Connection Metadata

**Purchased** (customer → variant):
```typescript
const purchasedSchema = PurchasedMetadataSchema;

// Fields:
// - shopifyOrderId, orderNumber, orderName
// - shopifyLineItemId, quantity, currentQuantity
// - unitPrice, totalPrice, discountedPrice, currency
// - productTitle, variantTitle, sku, variantSnapshot
// - fulfillmentStatus, fulfillableQuantity
// - requiresShipping, taxable, purchasedAt
```

**In Cart** (customer → variant):
```typescript
const inCartSchema = InCartMetadataSchema;
```

**Variant Of** (variant → product):
```typescript
const variantOfSchema = VariantOfMetadataSchema;
```

**Belongs To** (product → collection):
```typescript
const belongsToSchema = BelongsToMetadataSchema;
```

#### Event Metadata

**Order Placed**:
```typescript
const orderPlacedSchema = OrderPlacedMetadataSchema;
```

**Payment Processed**:
```typescript
const paymentProcessedSchema = PaymentProcessedMetadataSchema;
```

**Order Fulfilled**:
```typescript
const orderFulfilledSchema = OrderFulfilledMetadataSchema;
```

**Order Refunded**:
```typescript
const orderRefundedSchema = OrderRefundedMetadataSchema;
```

**Inventory Updated**:
```typescript
const inventoryUpdatedSchema = InventoryUpdatedMetadataSchema;
```

**Cart Abandoned**:
```typescript
const cartAbandonedSchema = CartAbandonedMetadataSchema;
```

---

## Usage Examples

### Example 1: Validate Product from Shopify API

```typescript
import { ProductPropertiesSchema, parse } from '@/providers/shopify/schemas';

// Shopify GraphQL response
const shopifyProduct = {
  id: "gid://shopify/Product/7891234567890",
  title: "Classic T-Shirt",
  handle: "classic-t-shirt",
  description: "<p>Comfortable cotton t-shirt</p>",
  status: "ACTIVE",
  // ... more fields
};

// Transform to ONE Platform format
const productProperties = {
  shopifyId: extractNumericId(shopifyProduct.id),
  shopifyHandle: shopifyProduct.handle,
  title: shopifyProduct.title,
  description: stripHtml(shopifyProduct.description),
  status: shopifyProduct.status.toLowerCase(),
  // ... more transformations
  shopifyMetadata: {
    id: extractNumericId(shopifyProduct.id),
    gid: shopifyProduct.id,
    createdAt: shopifyProduct.createdAt,
    updatedAt: shopifyProduct.updatedAt,
  },
};

// Validate (throws on error)
const validated = parse(ProductPropertiesSchema, productProperties);

// ✅ TypeScript now knows validated is type ProductProperties
console.log(validated.title); // Type-safe!
```

### Example 2: Safe Validation with Error Handling

```typescript
import { ProductVariantPropertiesSchema, safeParse } from '@/providers/shopify/schemas';

const result = safeParse(ProductVariantPropertiesSchema, rawVariantData);

if (result.success) {
  // Validation succeeded
  const variant = result.data;
  console.log(`Variant ${variant.sku} validated successfully`);
} else {
  // Validation failed
  console.error('Validation errors:');
  result.error.errors.forEach((err) => {
    console.error(`- ${err.path.join('.')}: ${err.message}`);
  });
}
```

### Example 3: Create "purchased" Connection

```typescript
import { PurchasedMetadataSchema, validateOrThrow } from '@/providers/shopify/schemas';

// Create metadata for purchased connection
const metadata = {
  shopifyOrderId: "5555555555",
  orderNumber: "#1001",
  orderName: "1001",
  shopifyLineItemId: "11111",
  quantity: 2,
  currentQuantity: 2,
  unitPrice: 19.99,
  totalPrice: 39.98,
  currency: "USD",
  productTitle: "Classic T-Shirt",
  variantTitle: "Small / Blue",
  sku: "TSHIRT-SM-BLU",
  fulfillmentStatus: "fulfilled",
  fulfillableQuantity: 0,
  requiresShipping: true,
  taxable: true,
  purchasedAt: "2024-11-22T10:00:00Z",
};

// Validate (throws ShopifyValidationError on failure)
const validatedMetadata = validateOrThrow(PurchasedMetadataSchema, metadata);

// Use in connection
const connection = {
  groupId: storeGroupId,
  fromThingId: customerId,
  toThingId: variantId,
  relationshipType: "purchased",
  metadata: validatedMetadata,
};
```

### Example 4: Create "order_placed" Event

```typescript
import { OrderPlacedMetadataSchema, validate } from '@/providers/shopify/schemas';

const eventMetadata = {
  shopifyOrderId: "5555555555",
  orderNumber: "#1001",
  orderName: "1001",
  customerEmail: "customer@example.com",
  subtotal: 39.98,
  tax: 3.20,
  shipping: 5.00,
  discount: 0,
  total: 48.18,
  currency: "USD",
  itemCount: 2,
  lineItems: [
    {
      productId: "7891234567890",
      variantId: "4567890",
      quantity: 2,
      price: 39.98,
    },
  ],
  isTest: false,
  confirmed: true,
  shopifyCreatedAt: "2024-11-22T10:00:00Z",
  shopifyProcessedAt: "2024-11-22T10:00:00Z",
};

// Validate (returns null on error)
const validated = validate(OrderPlacedMetadataSchema, eventMetadata);

if (validated) {
  // Create event
  const event = {
    groupId: storeGroupId,
    type: "order_placed",
    actorId: customerId,
    metadata: validated,
    timestamp: new Date(validated.shopifyProcessedAt).getTime(),
  };
}
```

### Example 5: Validate Array of Products

```typescript
import { ProductPropertiesSchema, validateArray } from '@/providers/shopify/schemas';

const products = [product1, product2, product3];

const result = validateArray(ProductPropertiesSchema, products);

if (result.success) {
  console.log(`Validated ${result.data.length} products`);
  // Batch create in database
} else {
  console.error('Some products failed validation:', result.error);
}
```

### Example 6: Partial Validation for Updates

```typescript
import { ProductPropertiesSchema, validatePartial } from '@/providers/shopify/schemas';

// Only updating title and price
const updates = {
  title: "New Product Title",
  priceRange: {
    min: 29.99,
    max: 49.99,
    currency: "USD",
  },
};

const result = validatePartial(ProductPropertiesSchema, updates);

if (result.success) {
  // Apply partial update
  await updateProduct(productId, result.data);
}
```

---

## Validation Helpers

### Core Functions

#### `parse<T>(schema, data): T`
Parse and validate (throws on error).

```typescript
const product = parse(ProductPropertiesSchema, rawData);
```

#### `safeParse<T>(schema, data): ValidationResult<T>`
Safe validation with result object.

```typescript
const result = safeParse(ProductPropertiesSchema, rawData);
if (result.success) { /* use result.data */ }
```

#### `validate<T>(schema, data): T | null`
Validate and return null on error.

```typescript
const product = validate(ProductPropertiesSchema, rawData);
if (product) { /* use product */ }
```

#### `validateOrThrow<T>(schema, data): T`
Validate and throw `ShopifyValidationError` on failure.

```typescript
try {
  const product = validateOrThrow(ProductPropertiesSchema, rawData);
} catch (error) {
  if (error instanceof ShopifyValidationError) {
    console.error(error.fieldErrors);
  }
}
```

### Shopify-Specific Helpers

#### `extractNumericId(gid: string): string`
Extract numeric ID from Shopify GID.

```typescript
extractNumericId("gid://shopify/Product/123") // "123"
extractNumericId("456") // "456"
```

#### `createGid(resourceType: string, id: string): string`
Create Shopify GID.

```typescript
createGid("Product", "123") // "gid://shopify/Product/123"
```

#### `parseGid(gid: string): { ... } | null`
Parse Shopify GID into components.

```typescript
parseGid("gid://shopify/Product/123")
// { protocol: "gid", namespace: "shopify", resource: "Product", id: "123" }
```

#### `generateVariantSlug(handle: string, options: SelectedOption[]): string`
Generate URL slug for variant.

```typescript
generateVariantSlug("classic-t-shirt", [
  { name: "Size", value: "Small" },
  { name: "Color", value: "Blue" },
])
// "classic-t-shirt-small-blue"
```

#### `computeStockStatus(...): StockStatus`
Compute stock status from inventory data.

```typescript
computeStockStatus(5, true, true, 10) // "low_stock"
computeStockStatus(100, true, true, 10) // "in_stock"
```

#### `stripHtml(html: string): string`
Remove HTML tags from string.

```typescript
stripHtml("<p>Hello <strong>world</strong></p>") // "Hello world"
```

#### `calculateDiscountPercentage(price: number, compareAtPrice: number): number`
Calculate discount percentage.

```typescript
calculateDiscountPercentage(15.99, 24.99) // 36
```

#### `formatMoney(amount: number, currency: string, locale?: string): string`
Format money amount.

```typescript
formatMoney(19.99, "USD") // "$19.99"
formatMoney(19.99, "EUR", "de-DE") // "19,99 €"
```

---

## Edge Cases

### 1. Products Without Variants

Shopify creates a default variant even for single-option products.

```typescript
// ✅ Always create both Product and ProductVariant Things
// Even if there's only 1 variant
```

### 2. Guest Checkout (No Customer)

```typescript
const customerProperties = {
  email: "guest@example.com",
  isGuest: true,
  shopifyId: null, // Guest customers have no Shopify ID
  // ...
};

// ✅ Schema validates guest customers
const validated = parse(CustomerPropertiesSchema, customerProperties);
```

### 3. Deleted Products in Orders

```typescript
// ❌ Variant was deleted after order placed
const lineItem = {
  // ...
  variantId: null, // Deleted variant
};

// ✅ Store snapshot in metadata
const metadata = {
  variantSnapshot: {
    selectedOptions: [...],
    price: 19.99,
    image: "https://...",
  },
  // ...
};
```

### 4. Price Validation

```typescript
// ❌ Invalid: compareAtPrice < price
const variant = {
  price: 24.99,
  compareAtPrice: 19.99, // Should be higher!
};

// ✅ Schema will catch this error
const result = safeParse(ProductVariantPropertiesSchema, variant);
// result.success === false
```

### 5. Multi-Currency Orders

```typescript
// ✅ Always use shopMoney (store currency) for consistency
const metadata = {
  total: parseFloat(order.totalPriceSet.shopMoney.amount),
  currency: order.totalPriceSet.shopMoney.currencyCode,
  // Don't use presentmentMoney (customer's currency)
};
```

---

## Testing

### Unit Tests

Create tests for your transformation functions:

```typescript
import { describe, test, expect } from 'bun:test';
import { ProductPropertiesSchema, safeParse } from '@/providers/shopify/schemas';

describe('Product Validation', () => {
  test('validates valid product', () => {
    const product = {
      shopifyId: "123",
      shopifyHandle: "test-product",
      title: "Test Product",
      status: "active",
      options: [],
      tags: [],
      images: [],
      tracksInventory: true,
      shopifyMetadata: {
        id: "123",
        createdAt: "2024-11-22T10:00:00Z",
        updatedAt: "2024-11-22T10:00:00Z",
      },
    };

    const result = safeParse(ProductPropertiesSchema, product);
    expect(result.success).toBe(true);
  });

  test('rejects invalid price range', () => {
    const product = {
      // ... valid fields
      priceRange: {
        min: 100,
        max: 50, // ❌ min > max
        currency: "USD",
      },
    };

    const result = safeParse(ProductPropertiesSchema, product);
    expect(result.success).toBe(false);
  });
});
```

---

## Schema Counts

**Total Schemas Created:**
- **Property Schemas:** 4 (Product, ProductVariant, Customer, Order)
- **Connection Metadata Schemas:** 6 (purchased, in_cart, variant_of, belongs_to, contains, fulfilled_by)
- **Event Metadata Schemas:** 11 (order_placed, payment_processed, order_fulfilled, order_refunded, order_cancelled, product_created, product_updated, product_deleted, inventory_updated, cart_abandoned, customer_created)
- **Helper Schemas:** 15+ (Image, SEO, Money, Address, ProductOption, etc.)

**Total:** 36+ schemas

**Validation Helpers:** 25+ functions

---

## Next Steps

**Cycle 21:** Implement Shopify API client with GraphQL queries
**Cycle 22:** Create transformation functions (Shopify → ONE)
**Cycle 23:** Implement webhook handlers

---

## References

- **Zod Documentation:** https://zod.dev/
- **Shopify API:** https://shopify.dev/docs/api
- **ONE Platform Ontology:** `/one/knowledge/ontology.md`

---

**Built with clarity, simplicity, and infinite scale in mind.**
