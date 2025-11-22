# Shopify Transformers

Comprehensive bidirectional transformation functions for converting between Shopify API data and ONE Platform entities following the 6-dimension ontology.

**Cycles:** 23-24 of 100-cycle Shopify Integration Plan

**Version:** 1.0.0

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Files](#files)
- [Transformation Counts](#transformation-counts)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Edge Cases](#edge-cases)
- [Performance Considerations](#performance-considerations)
- [Testing](#testing)
- [Related Documentation](#related-documentation)

---

## Overview

The Shopify Transformers module provides:

1. **Shopify → ONE Transformations** - Convert Shopify API data to ONE entities
2. **ONE → Shopify Transformations** - Convert ONE entities to Shopify API inputs
3. **Utilities** - Common helpers for IDs, money, addresses, metafields, etc.
4. **Error Types** - Specific error classes for transformation failures
5. **Validation** - Input validation and business rule checks

### Design Principles

- **Effect.ts for type safety** - All transformations return `Effect.Effect<Result, Error>`
- **Zod schemas for validation** - Validate input data before transformation
- **Preserve original IDs** - Store Shopify IDs in metadata
- **Create snapshots** - Preserve historical data (e.g., order line items)
- **Graceful degradation** - Handle missing/null fields without failing
- **Discriminated unions** - Use type safety throughout

---

## Architecture

```
transformers/
├── index.ts              # Barrel export (use this for imports)
├── utils.ts              # Utilities, error types, helpers
├── to-one.ts             # Shopify → ONE transformations
├── to-shopify.ts         # ONE → Shopify transformations
└── README.md             # This file
```

### Transformation Flow

```
SHOPIFY API → Transformers → ONE Platform
    ↓                            ↓
GraphQL/REST              Things, Connections,
   Data                   Events, Knowledge
    ↑                            ↑
Transformers ← ONE Platform Entities
```

---

## Files

### `index.ts` - Barrel Export

Central export point for all transformers, utilities, and types.

**Usage:**
```typescript
import {
  transformShopifyProduct,
  transformToShopifyProduct,
  extractNumericId,
  parseMoney
} from "@/providers/shopify/transformers";
```

### `utils.ts` - Utilities & Error Types

Common utilities for transformations:

**Error Types (4):**
- `TransformationError` - General transformation failure
- `ValidationError` - Zod validation failure
- `MissingDataError` - Required data missing
- `ReferenceNotFoundError` - Referenced entity doesn't exist

**ID Utilities:**
- `extractNumericId()` - Extract numeric ID from GID
- `formatToGid()` - Format numeric ID to GID

**String Utilities:**
- `stripHtml()` - Remove HTML tags
- `generateSlug()` - Create URL-friendly slug
- `generateVariantSlug()` - Create variant slug from options

**Money Utilities:**
- `parseMoney()` - Parse Shopify Money to number
- `formatMoney()` - Format number to Shopify Money

**Address Utilities:**
- `transformAddress()` - Shopify MailingAddress → ONE Address
- `transformToShopifyAddress()` - ONE Address → Shopify MailingAddress

**Metafields Utilities:**
- `transformMetafields()` - Shopify Metafields array → ONE format
- `transformToShopifyMetafields()` - ONE format → Shopify array

**Timestamp Utilities:**
- `parseTimestamp()` - ISO 8601 → Unix milliseconds
- `formatTimestamp()` - Unix milliseconds → ISO 8601

**Validation Utilities:**
- `validateRequired()` - Check required fields with Effect
- `isValidEmail()` - Validate email format
- `isValidPhone()` - Validate phone format

**Edge Case Utilities:**
- `hasVariants()` - Check if product has variants
- `isTestOrder()` - Check if order is test
- `isGuestCustomer()` - Check if customer is guest
- `getDefaultVariant()` - Get first variant from product
- `calculateDiscountPercentage()` - Calculate discount %

### `to-one.ts` - Shopify → ONE Transformations

Forward transformations from Shopify API to ONE Platform entities.

**Product Transformations (2):**
- `transformShopifyProduct()` - Product → Thing (type: "product")
- `transformShopifyVariant()` - Variant → Thing (type: "product_variant")

**Order Transformations (5):**
- `transformOrderToConnections()` - Line items → Connections (type: "purchased")
- `transformOrderToPlacedEvent()` - Order → Event (type: "order_placed")
- `transformTransactionsToEvents()` - Transactions → Events (payment_processed, etc.)
- `transformFulfillmentsToEvents()` - Fulfillments → Events (order_fulfilled)
- `transformRefundsToEvents()` - Refunds → Events (order_refunded)

**Customer Transformations (2):**
- `transformShopifyCustomer()` - Customer → Thing (type: "creator", role: "customer")
- `transformCustomerTagsToKnowledge()` - Tags → Knowledge labels

**Collection Transformations (2):**
- `transformShopifyCollection()` - Collection → Group (type: "collection")
- `transformCollectionProductConnections()` - Products → Connections (belongs_to)

**Inventory Transformations (1):**
- `transformInventoryLevels()` - Update variant inventory properties

**Checkout/Cart Transformations (2):**
- `transformCartToConnections()` - Cart items → Connections (in_cart)
- `transformCheckoutToEvents()` - Checkout → Events (checkout_created, checkout_completed)

**Total:** 14 forward transformations

### `to-shopify.ts` - ONE → Shopify Transformations

Reverse transformations from ONE Platform entities to Shopify API inputs.

**Product Transformations (2 + 3 validators):**
- `transformToShopifyProduct()` - Thing → ShopifyProductInput
- `transformToShopifyVariant()` - Thing → ShopifyProductVariantInput
- `validateProductInput()` - Validate product input
- `validateVariantInput()` - Validate variant input
- `validateProductBusinessRules()` - Validate business rules

**Customer Transformations (1 + 2 validators):**
- `transformToShopifyCustomer()` - Thing → ShopifyCustomerInput
- `validateCustomerInput()` - Validate customer input
- `validateCustomerBusinessRules()` - Validate business rules

**Order Transformations (1 + 1 validator):**
- `transformToDraftOrder()` - Connections + Event → ShopifyDraftOrderInput
- `validateDraftOrderInput()` - Validate draft order input

**Collection Transformations (1 + 1 validator):**
- `transformToShopifyCollection()` - Group → ShopifyCollectionInput
- `validateCollectionInput()` - Validate collection input

**Helpers (2):**
- `extractTagsFromKnowledge()` - Extract tags from Knowledge labels
- `mergeTagsIntoInput()` - Merge tags into entity input

**Total:** 5 reverse transformations + 7 validators + 2 helpers

---

## Transformation Counts

### Summary

| Category | Shopify → ONE | ONE → Shopify | Total |
|----------|---------------|---------------|-------|
| **Products** | 2 | 2 + 3 validators | 7 |
| **Orders** | 5 | 1 + 1 validator | 7 |
| **Customers** | 2 | 1 + 2 validators | 5 |
| **Collections** | 2 | 1 + 1 validator | 4 |
| **Inventory** | 1 | 0 | 1 |
| **Checkout/Cart** | 2 | 0 | 2 |
| **Utilities** | 20+ | 2 helpers | 22+ |
| **Error Types** | 4 | 0 | 4 |
| **TOTAL** | **14** | **5 + 7 + 2** | **52+** |

---

## Usage Examples

### Example 1: Transform Shopify Product to ONE Thing

```typescript
import { Effect } from "effect";
import { transformShopifyProduct } from "@/providers/shopify/transformers";

// Shopify product from API
const shopifyProduct = {
  id: "gid://shopify/Product/7891234567890",
  title: "Classic T-Shirt",
  handle: "classic-t-shirt",
  status: "ACTIVE",
  vendor: "Acme Clothing",
  productType: "T-Shirts",
  // ... more fields
};

// Transform to ONE Thing
const productThing = await Effect.runPromise(
  transformShopifyProduct(shopifyProduct, groupId)
);

// Result:
// {
//   groupId: "k999...",
//   type: "product",
//   name: "Classic T-Shirt",
//   slug: "classic-t-shirt",
//   properties: {
//     shopifyId: "7891234567890",
//     status: "active",
//     vendor: "Acme Clothing",
//     productType: "T-Shirts",
//     // ...
//   }
// }
```

### Example 2: Transform Order to Connections + Events

```typescript
import { Effect } from "effect";
import {
  transformOrderToConnections,
  transformOrderToPlacedEvent,
  transformTransactionsToEvents,
} from "@/providers/shopify/transformers";

async function syncOrder(shopifyOrder, customerId, groupId) {
  // 1. Create purchase connections (one per line item)
  const connections = await Effect.runPromise(
    transformOrderToConnections(shopifyOrder, customerId, groupId)
  );

  for (const conn of connections) {
    await db.connections.create(conn);
  }

  // 2. Create order_placed event
  const orderEvent = await Effect.runPromise(
    transformOrderToPlacedEvent(shopifyOrder, customerId, groupId)
  );

  await db.events.create(orderEvent);

  // 3. Create payment events
  const paymentEvents = await Effect.runPromise(
    transformTransactionsToEvents(shopifyOrder, customerId, groupId)
  );

  for (const event of paymentEvents) {
    await db.events.create(event);
  }
}
```

### Example 3: Create Product in Shopify (Reverse)

```typescript
import { Effect } from "effect";
import {
  transformToShopifyProduct,
  validateProductInput,
  validateProductBusinessRules,
} from "@/providers/shopify/transformers";

// ONE Product Thing
const productThing = {
  groupId: "k999...",
  type: "product",
  name: "New Product",
  slug: "new-product",
  properties: {
    // ... product properties
  },
};

// Transform to Shopify input with validation
const productInput = await Effect.runPromise(
  Effect.gen(function* () {
    const input = yield* transformToShopifyProduct(productThing);
    const validated = yield* validateProductInput(input);
    const businessValidated = yield* validateProductBusinessRules(validated);
    return businessValidated;
  })
);

// Send to Shopify API
const response = await shopifyClient.product.create({
  product: productInput,
});
```

### Example 4: Error Handling with Effect

```typescript
import { Effect, Match } from "effect";
import {
  transformShopifyProduct,
  TransformationError,
  ValidationError,
  MissingDataError,
} from "@/providers/shopify/transformers";

const result = await Effect.runPromise(
  Effect.gen(function* () {
    const productThing = yield* transformShopifyProduct(shopifyProduct, groupId);
    return { success: true, data: productThing };
  }).pipe(
    Effect.catchAll((error) =>
      Match.value(error).pipe(
        Match.tag("TransformationError", (e) =>
          Effect.succeed({
            success: false,
            error: `Transformation failed: ${e.message}`,
          })
        ),
        Match.tag("ValidationError", (e) =>
          Effect.succeed({
            success: false,
            error: `Validation failed for ${e.field}: ${e.message}`,
          })
        ),
        Match.tag("MissingDataError", (e) =>
          Effect.succeed({
            success: false,
            error: `Missing required field: ${e.field}`,
          })
        ),
        Match.orElse((e) =>
          Effect.succeed({
            success: false,
            error: `Unknown error: ${e}`,
          })
        )
      )
    )
  )
);

if (!result.success) {
  console.error(result.error);
}
```

---

## Error Handling

### Error Types

All transformations return `Effect.Effect<Result, Error>` where Error can be:

**1. TransformationError**
```typescript
{
  _tag: "TransformationError",
  message: string,
  source: "shopify" | "one",
  entityType: string,
  cause?: unknown
}
```

**2. ValidationError**
```typescript
{
  _tag: "ValidationError",
  message: string,
  field?: string,
  value?: unknown,
  cause?: unknown
}
```

**3. MissingDataError**
```typescript
{
  _tag: "MissingDataError",
  field: string,
  entityType: string
}
```

**4. ReferenceNotFoundError**
```typescript
{
  _tag: "ReferenceNotFoundError",
  entityType: string,
  referenceId: string
}
```

### Error Handling Pattern

```typescript
import { Effect, Match } from "effect";

const result = await Effect.runPromise(
  transformation.pipe(
    Effect.catchAll((error) =>
      Match.value(error).pipe(
        Match.tag("TransformationError", handleTransformationError),
        Match.tag("ValidationError", handleValidationError),
        Match.tag("MissingDataError", handleMissingDataError),
        Match.tag("ReferenceNotFoundError", handleReferenceError),
        Match.orElse(handleUnknownError)
      )
    )
  )
);
```

---

## Edge Cases

The transformers handle these edge cases:

### Products

**1. Products Without Variants**
- Shopify creates a default variant automatically
- ONE creates both Product Thing AND ProductVariant Thing
- Connection: variant_of

**2. Variants Without Images**
- Variant inherits from product's featuredImage
- Transformation sets `image: undefined`

**3. Archived/Draft Products**
- Status mapped to `properties.status: "archived" | "draft"`
- Can be filtered in queries

**4. Products with 2,048 Variants**
- Create 2,048 separate ProductVariant Things
- Use batch operations for performance

**5. Missing Metafields**
- Metafields parsed as JSON if type is json/list
- Falls back to string if parsing fails

### Orders

**1. Guest Checkout (No Customer)**
- Create temporary Customer Thing with `isGuest: true`
- Use email/phone as identifier
- Can be merged later if customer creates account

**2. Partial Fulfillments**
- Multiple `order_fulfilled` events (one per fulfillment)
- Connection metadata: `fulfillmentStatus: "partial"`
- Track `fulfillableQuantity` for remaining items

**3. Partial Refunds**
- Create `order_refunded` event
- Update connection `currentQuantity`
- Don't delete connection (preserve history)

**4. Test Orders**
- Flag: `isTest: true` in metadata
- Still synced to ONE
- Filter out in production queries

**5. Deleted Products**
- Store product/variant info in connection metadata (snapshot)
- Don't create connection if variant Thing doesn't exist
- Rely on event metadata for historical data

### Customers

**1. Phone-Only Customers (No Email)**
- Use phone as identifier
- Slug: `phone-1234567890`

**2. Disabled Customer Accounts**
- `accountState: "disabled"`
- Keep in database (order history)
- Filter out from public queries

**3. Invited Customers (Not Yet Accepted)**
- `accountState: "invited"`
- `verifiedEmail: false`
- Create `customer_invited` event

**4. Missing Default Address**
- `defaultAddress: undefined`
- Render logic: use first address as fallback

### Collections

**1. Smart Collections**
- Store `ruleSet` in properties
- Rules can be re-evaluated when products change

**2. Empty Collections**
- `productCount: 0`
- No connections created

---

## Performance Considerations

### Batch Operations

```typescript
// DON'T: Transform and create one at a time
for (const product of products) {
  const thing = await transformShopifyProduct(product, groupId);
  await db.things.create(thing);
}

// DO: Transform all, then batch create
const things = await Promise.all(
  products.map((p) => Effect.runPromise(transformShopifyProduct(p, groupId)))
);

await db.things.batchCreate(things);
```

### Large Catalogs

- Paginate product fetches (Shopify max: 250 per request)
- Use batch operations for 100+ variants
- Cache frequently accessed products
- Index by shopifyId for fast lookups

### Image Handling

- Store Shopify CDN URLs (don't download images)
- Use Shopify's image transformation URLs
- Lazy load variant images

### Search Optimization

- Index product name, SKU, tags for full-text search
- Create Knowledge chunks for descriptions (RAG)
- Use Knowledge labels for faceted search

---

## Testing

### Unit Tests (TODO)

```typescript
import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { transformShopifyProduct } from "./transformers";

describe("transformShopifyProduct", () => {
  it("should transform basic product", async () => {
    const shopifyProduct = {
      id: "gid://shopify/Product/123",
      title: "Test Product",
      handle: "test-product",
      status: "ACTIVE",
      // ...
    };

    const result = await Effect.runPromise(
      transformShopifyProduct(shopifyProduct, "groupId")
    );

    expect(result.type).toBe("product");
    expect(result.name).toBe("Test Product");
    expect(result.properties.shopifyId).toBe("123");
  });

  it("should handle missing description", async () => {
    const shopifyProduct = {
      id: "gid://shopify/Product/123",
      title: "Test Product",
      handle: "test-product",
      status: "ACTIVE",
      description: null,
      // ...
    };

    const result = await Effect.runPromise(
      transformShopifyProduct(shopifyProduct, "groupId")
    );

    expect(result.description).toBeUndefined();
  });

  it("should fail for missing required fields", async () => {
    const shopifyProduct = {
      id: null, // Missing ID
      title: "Test Product",
      // ...
    };

    await expect(
      Effect.runPromise(transformShopifyProduct(shopifyProduct, "groupId"))
    ).rejects.toMatchObject({
      _tag: "MissingDataError",
      field: "id",
    });
  });
});
```

### Integration Tests (TODO)

Test with real Shopify API data:

```typescript
import { describe, it, expect } from "vitest";
import { fetchShopifyProduct } from "@/providers/shopify/api";
import { transformShopifyProduct } from "./transformers";

describe("Shopify Integration", () => {
  it("should transform real product from API", async () => {
    // Fetch real product
    const shopifyProduct = await fetchShopifyProduct("123");

    // Transform
    const result = await Effect.runPromise(
      transformShopifyProduct(shopifyProduct, "groupId")
    );

    // Verify
    expect(result.type).toBe("product");
    expect(result.properties.shopifyId).toBe("123");
  });
});
```

---

## Related Documentation

### ONE Platform Ontology

- `/one/knowledge/ontology.md` - 6-dimension specification (Version 1.0.0)
- `/one/knowledge/architecture.md` - Platform architecture
- `/one/connections/workflow.md` - 6-phase development process

### Shopify Integration Plan

- `/one/things/plans/shopify-integration-100-cycles.md` - 100-cycle integration plan
- `/one/things/shopify-product-mapping.md` - Product/Variant mapping (Cycle 4)
- `/one/connections/shopify-order-flow.md` - Order flow mapping (Cycle 5)
- `/one/people/shopify-customer-mapping.md` - Customer mapping (Cycle 6)

### Shopify API Documentation

- [Product Model Components](https://shopify.dev/docs/apps/build/graphql/migrate/new-product-model/product-model-components)
- [ProductVariant GraphQL](https://shopify.dev/docs/api/admin-graphql/latest/objects/ProductVariant)
- [Order GraphQL Object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Order)
- [Customer GraphQL Object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Customer)

---

## Contributing

When adding new transformations:

1. **Add to appropriate file** - `to-one.ts` for Shopify → ONE, `to-shopify.ts` for reverse
2. **Use Effect.ts** - Return `Effect.Effect<Result, Error>`
3. **Validate inputs** - Use `validateRequired()` for required fields
4. **Handle edge cases** - Check for null/undefined, deleted products, etc.
5. **Add JSDoc** - Document parameters, return types, examples
6. **Export in index.ts** - Add to barrel export
7. **Update counts** - Update transformation counts in README
8. **Write tests** - Add unit tests and integration tests

---

## Changelog

**Version 1.0.0 (Cycles 23-24)**

- ✅ Created transformation utilities and error types
- ✅ Implemented 14 Shopify → ONE transformations
- ✅ Implemented 5 ONE → Shopify transformations
- ✅ Added 7 validation functions
- ✅ Added 20+ utility functions
- ✅ Created barrel export file
- ✅ Documented all transformations and usage patterns

**Next Steps (Cycle 25+)**

- Add unit tests for all transformations
- Add integration tests with real Shopify API
- Optimize batch operations for large catalogs
- Add Zod schemas for runtime validation
- Create transformation middleware for error handling

---

**Built with clarity, simplicity, and infinite scale in mind.**
