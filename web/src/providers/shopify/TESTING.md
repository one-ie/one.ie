---
title: Shopify Integration - Testing Guide
created: 2025-11-22
updated: 2025-11-22
status: PLACEHOLDER - Awaiting Cycles 16-24
---

# Shopify Integration - Testing Guide

**Status:** ⚠️ **PLACEHOLDER** - This guide will be implemented after Cycles 16-24 are complete

**Purpose:** Comprehensive testing strategy for the Shopify integration

**Current Implementation:** 0% (no code to test yet)

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [E2E Tests](#e2e-tests)
5. [Test Data Fixtures](#test-data-fixtures)
6. [Running Tests](#running-tests)
7. [Coverage Goals](#coverage-goals)
8. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

The Shopify integration follows the ONE Platform testing principles:

1. **Type Safety First:** TypeScript catches most errors at compile time
2. **Schema Validation:** Zod schemas ensure runtime data integrity
3. **Pure Functions:** Transformers are pure functions (easy to test)
4. **Effect.ts Patterns:** All business logic testable in isolation
5. **Test Pyramid:** Many unit tests, some integration tests, few E2E tests

### Test Coverage Goals

| Layer | Coverage Target | Priority |
|-------|----------------|----------|
| Transformers (to-one.ts, to-shopify.ts) | 95%+ | P0 (Critical) |
| Zod Schemas (properties.ts, metadata.ts) | 100% | P0 (Critical) |
| GraphQL Queries/Mutations | 80%+ | P1 (High) |
| Type Definitions | N/A (TypeScript) | P2 (Medium) |
| Services (Phase 3) | 90%+ | P0 (Critical) |
| Components (Phase 5) | 80%+ | P1 (High) |

---

## Unit Tests

### 1. Type Definition Tests

**File:** `__tests__/types/things.test.ts`

**Status:** ❌ Not created (awaiting Cycle 16)

**Purpose:** Validate TypeScript type definitions compile correctly

**Example Test Structure:**

```typescript
import { describe, it, expect } from 'vitest';
import type { ShopifyProductProperties, ShopifyVariantProperties } from '../types/things';

describe('Thing Type Definitions', () => {
  describe('ShopifyProductProperties', () => {
    it('should accept valid product properties', () => {
      const validProduct: ShopifyProductProperties = {
        shopifyProductId: 'gid://shopify/Product/123',
        handle: 'awesome-tshirt',
        productType: 'Apparel',
        vendor: 'My Brand',
        tags: ['summer', 'cotton'],
        status: 'active',
        publishedAt: '2025-01-01T00:00:00Z',
        options: [],
        images: [],
        seo: {
          title: 'Awesome T-Shirt',
          description: 'The best shirt ever'
        }
      };

      expect(validProduct).toBeDefined();
    });

    it('should enforce required fields', () => {
      // @ts-expect-error - Missing required field
      const invalidProduct: ShopifyProductProperties = {
        handle: 'test'
      };
    });
  });
});
```

---

### 2. Zod Schema Tests

**File:** `__tests__/schemas/properties.test.ts`

**Status:** ❌ Not created (awaiting Cycle 19)

**Purpose:** Validate Zod schemas correctly parse and reject data

**Example Test Structure:**

```typescript
import { describe, it, expect } from 'vitest';
import { ShopifyProductPropertiesSchema } from '../schemas/properties';

describe('Shopify Property Schemas', () => {
  describe('ShopifyProductPropertiesSchema', () => {
    it('should parse valid product properties', () => {
      const validData = {
        shopifyProductId: 'gid://shopify/Product/123',
        handle: 'awesome-tshirt',
        productType: 'Apparel',
        vendor: 'My Brand',
        tags: ['summer'],
        status: 'active',
        publishedAt: '2025-01-01T00:00:00Z',
        options: [],
        images: [],
        seo: {
          title: 'Test',
          description: 'Test'
        }
      };

      const result = ShopifyProductPropertiesSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.shopifyProductId).toBe('gid://shopify/Product/123');
      }
    });

    it('should reject invalid status', () => {
      const invalidData = {
        shopifyProductId: 'gid://shopify/Product/123',
        status: 'invalid-status',  // Not 'active' | 'draft' | 'archived'
        // ... other fields
      };

      const result = ShopifyProductPropertiesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        handle: 'test'
        // Missing shopifyProductId
      };

      const result = ShopifyProductPropertiesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('shopifyProductId');
      }
    });

    it('should accept null for optional fields', () => {
      const data = {
        shopifyProductId: 'gid://shopify/Product/123',
        publishedAt: null,  // Optional field
        // ... other fields
      };

      const result = ShopifyProductPropertiesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
```

**Test Coverage:**
- ✅ Valid data passes
- ✅ Invalid data fails with correct error messages
- ✅ Required fields are enforced
- ✅ Optional fields accept null
- ✅ Enums validate correctly
- ✅ Nested objects validate
- ✅ Arrays validate

---

### 3. Connection Metadata Schema Tests

**File:** `__tests__/schemas/metadata.test.ts`

**Status:** ❌ Not created (awaiting Cycle 20)

**Example Test Structure:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  BelongsToMetadataSchema,
  PurchasedMetadataSchema,
  ContainsMetadataSchema,
  InCartMetadataSchema
} from '../schemas/metadata';

describe('Connection Metadata Schemas', () => {
  describe('ContainsMetadataSchema', () => {
    it('should validate order line item metadata', () => {
      const validMetadata = {
        lineItemId: 'gid://shopify/LineItem/123',
        variantId: 'variant-thing-id',
        quantity: 2,
        price: '29.99',
        totalDiscount: '5.00',
        fulfillmentStatus: 'fulfilled' as const
      };

      const result = ContainsMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it('should reject negative quantity', () => {
      const invalidMetadata = {
        lineItemId: 'gid://shopify/LineItem/123',
        quantity: -1,  // Invalid!
        price: '29.99'
      };

      const result = ContainsMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });
  });

  describe('InCartMetadataSchema', () => {
    it('should validate cart connection metadata', () => {
      const validMetadata = {
        variantId: 'variant-thing-id',
        quantity: 1,
        addedAt: '2025-01-20T15:45:00Z'
      };

      const result = InCartMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });
  });
});
```

---

### 4. Transformation Tests (Shopify → ONE)

**File:** `__tests__/transformers/to-one.test.ts`

**Status:** ❌ Not created (awaiting Cycle 23)

**Purpose:** Test transformation functions convert Shopify data to ONE entities correctly

**Example Test Structure:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  transformProductToThing,
  transformVariantToThing,
  transformOrderToThingAndConnections
} from '../transformers/to-one';
import { mockShopifyProduct, mockShopifyOrder } from './fixtures';

describe('Shopify → ONE Transformations', () => {
  describe('transformProductToThing', () => {
    it('should transform basic product fields', () => {
      const shopifyProduct = mockShopifyProduct();
      const groupId = 'store-group-id';

      const result = transformProductToThing(shopifyProduct, groupId);

      expect(result.type).toBe('product');
      expect(result.groupId).toBe(groupId);
      expect(result.name).toBe(shopifyProduct.title);
      expect(result.description).toBe(shopifyProduct.bodyHtml);
    });

    it('should map Shopify ID to properties', () => {
      const shopifyProduct = mockShopifyProduct({
        id: 'gid://shopify/Product/123456789'
      });

      const result = transformProductToThing(shopifyProduct, 'group-id');

      expect(result.properties.shopifyProductId).toBe('gid://shopify/Product/123456789');
    });

    it('should handle missing optional fields', () => {
      const shopifyProduct = mockShopifyProduct({
        bodyHtml: null,  // No description
        publishedAt: null  // Not published
      });

      const result = transformProductToThing(shopifyProduct, 'group-id');

      expect(result.description).toBe('');
      expect(result.properties.publishedAt).toBeNull();
    });

    it('should transform product options array', () => {
      const shopifyProduct = mockShopifyProduct({
        options: [
          { name: 'Size', values: ['S', 'M', 'L'] },
          { name: 'Color', values: ['Red', 'Blue'] }
        ]
      });

      const result = transformProductToThing(shopifyProduct, 'group-id');

      expect(result.properties.options).toHaveLength(2);
      expect(result.properties.options[0].name).toBe('Size');
      expect(result.properties.options[0].values).toContain('M');
    });

    it('should transform images array', () => {
      const shopifyProduct = mockShopifyProduct({
        images: [
          {
            src: 'https://cdn.shopify.com/image1.jpg',
            altText: 'Product front',
            position: 1
          },
          {
            src: 'https://cdn.shopify.com/image2.jpg',
            altText: 'Product back',
            position: 2
          }
        ]
      });

      const result = transformProductToThing(shopifyProduct, 'group-id');

      expect(result.properties.images).toHaveLength(2);
      expect(result.properties.images[0].src).toBe('https://cdn.shopify.com/image1.jpg');
    });

    it('should parse tags string to array', () => {
      const shopifyProduct = mockShopifyProduct({
        tags: 'summer, cotton, bestseller'
      });

      const result = transformProductToThing(shopifyProduct, 'group-id');

      expect(result.properties.tags).toEqual(['summer', 'cotton', 'bestseller']);
    });
  });

  describe('transformOrderToThingAndConnections', () => {
    it('should create order thing with correct properties', () => {
      const shopifyOrder = mockShopifyOrder();

      const { thing, connections } = transformOrderToThingAndConnections(
        shopifyOrder,
        'group-id'
      );

      expect(thing.type).toBe('order');
      expect(thing.name).toBe(`Order #${shopifyOrder.orderNumber}`);
      expect(thing.properties.totalPrice).toBe(shopifyOrder.totalPrice);
    });

    it('should create connection for each line item', () => {
      const shopifyOrder = mockShopifyOrder({
        lineItems: [
          { productId: 'product-1', quantity: 2, price: '29.99' },
          { productId: 'product-2', quantity: 1, price: '49.99' }
        ]
      });

      const { connections } = transformOrderToThingAndConnections(
        shopifyOrder,
        'group-id'
      );

      expect(connections).toHaveLength(2);
      expect(connections[0].type).toBe('contains');
      expect(connections[0].metadata.quantity).toBe(2);
    });

    it('should handle orders with discounts', () => {
      const shopifyOrder = mockShopifyOrder({
        discountCodes: [
          { code: 'SUMMER10', amount: '5.00', type: 'percentage' }
        ]
      });

      const { thing } = transformOrderToThingAndConnections(
        shopifyOrder,
        'group-id'
      );

      expect(thing.properties.discountCodes).toHaveLength(1);
      expect(thing.properties.discountCodes[0].code).toBe('SUMMER10');
    });
  });
});
```

**Test Coverage:**
- ✅ All fields transform correctly
- ✅ Optional fields handled properly
- ✅ Arrays transform correctly
- ✅ Nested objects transform
- ✅ IDs map to correct properties
- ✅ Edge cases (null, empty arrays, etc.)

---

### 5. Reverse Transformation Tests (ONE → Shopify)

**File:** `__tests__/transformers/to-shopify.test.ts`

**Status:** ❌ Not created (awaiting Cycle 24)

**Example Test Structure:**

```typescript
import { describe, it, expect } from 'vitest';
import {
  transformThingToProductInput,
  transformThingToVariantInput
} from '../transformers/to-shopify';
import { mockProductThing } from './fixtures';

describe('ONE → Shopify Transformations', () => {
  describe('transformThingToProductInput', () => {
    it('should transform thing to Shopify product input', () => {
      const productThing = mockProductThing();

      const result = transformThingToProductInput(productThing);

      expect(result.title).toBe(productThing.name);
      expect(result.bodyHtml).toBe(productThing.description);
      expect(result.handle).toBe(productThing.properties.handle);
    });

    it('should throw error for non-product things', () => {
      const orderThing = { type: 'order', name: 'Order #1' };

      expect(() => {
        // @ts-expect-error - Testing runtime error
        transformThingToProductInput(orderThing);
      }).toThrow('Invalid thing type');
    });

    it('should convert tags array to comma-separated string', () => {
      const productThing = mockProductThing({
        properties: {
          tags: ['summer', 'cotton', 'bestseller']
        }
      });

      const result = transformThingToProductInput(productThing);

      expect(result.tags).toBe('summer,cotton,bestseller');
    });
  });
});
```

---

## Integration Tests

### 1. GraphQL Query Tests

**File:** `__tests__/integration/graphql-queries.test.ts`

**Status:** ❌ Not created (awaiting Cycle 21)

**Purpose:** Test GraphQL queries against Shopify API (or mock)

**Example Test Structure:**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { createShopifyClient } from '../ShopifyClient';
import { GET_PRODUCT, LIST_PRODUCTS } from '../graphql/queries';

describe('GraphQL Queries Integration', () => {
  let client: ReturnType<typeof createShopifyClient>;

  beforeAll(() => {
    client = createShopifyClient({
      storeDomain: process.env.TEST_SHOPIFY_STORE_DOMAIN!,
      accessToken: process.env.TEST_SHOPIFY_ACCESS_TOKEN!
    });
  });

  describe('GET_PRODUCT', () => {
    it('should fetch product by ID', async () => {
      const productId = 'gid://shopify/Product/123';

      const response = await client.query(GET_PRODUCT, { id: productId });

      expect(response.product).toBeDefined();
      expect(response.product.id).toBe(productId);
      expect(response.product.title).toBeDefined();
    });

    it('should return null for non-existent product', async () => {
      const response = await client.query(GET_PRODUCT, {
        id: 'gid://shopify/Product/999999999'
      });

      expect(response.product).toBeNull();
    });
  });

  describe('LIST_PRODUCTS', () => {
    it('should fetch paginated products', async () => {
      const response = await client.query(LIST_PRODUCTS, { first: 10 });

      expect(response.products.edges).toBeDefined();
      expect(response.products.edges.length).toBeLessThanOrEqual(10);
      expect(response.products.pageInfo).toBeDefined();
    });
  });
});
```

**Note:** Integration tests require a test Shopify store or mocked GraphQL responses.

---

### 2. Full Sync Flow Tests

**File:** `__tests__/integration/product-sync.test.ts`

**Status:** ❌ Not created (awaiting Cycles 21-24)

**Purpose:** Test complete flow: Shopify API → Transform → ONE Platform

**Example Test Structure:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { syncProduct } from '../services/ProductService';
import { createMockProvider } from '@/providers/__tests__/mocks';

describe('Product Sync Integration', () => {
  let mockProvider: ReturnType<typeof createMockProvider>;

  beforeEach(() => {
    mockProvider = createMockProvider();
  });

  it('should sync product from Shopify to ONE', async () => {
    const shopifyProductId = 'gid://shopify/Product/123';

    const result = await syncProduct(shopifyProductId, mockProvider);

    // Verify thing was created
    expect(mockProvider.things.create).toHaveBeenCalled();

    const createdThing = mockProvider.things.create.mock.calls[0][0];
    expect(createdThing.type).toBe('product');
    expect(createdThing.properties.shopifyProductId).toBe(shopifyProductId);
  });

  it('should sync product variants', async () => {
    const shopifyProductId = 'gid://shopify/Product/123';

    await syncProduct(shopifyProductId, mockProvider);

    // Verify variants were created
    const variantCreates = mockProvider.things.create.mock.calls.filter(
      call => call[0].type === 'product_variant'
    );

    expect(variantCreates.length).toBeGreaterThan(0);
  });

  it('should create variant → product connections', async () => {
    const shopifyProductId = 'gid://shopify/Product/123';

    await syncProduct(shopifyProductId, mockProvider);

    // Verify connections were created
    expect(mockProvider.connections.create).toHaveBeenCalled();

    const variantConnections = mockProvider.connections.create.mock.calls.filter(
      call => call[0].type === 'variant_of'
    );

    expect(variantConnections.length).toBeGreaterThan(0);
  });
});
```

---

## E2E Tests

### 1. Complete Checkout Flow

**File:** `web/test/e2e/shopify-checkout.test.ts`

**Status:** ❌ Not created (awaiting Phase 5)

**Purpose:** Test entire user flow from browsing to checkout

**Example Test Structure:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Shopify Checkout Flow', () => {
  test('user can browse products, add to cart, and checkout', async ({ page }) => {
    // 1. Navigate to shop
    await page.goto('/shop');

    // 2. Browse products
    await expect(page.locator('.product-grid')).toBeVisible();

    // 3. Click product
    await page.click('.product-card:first-child');

    // 4. Select variant
    await page.selectOption('select[name="size"]', 'L');
    await page.selectOption('select[name="color"]', 'Red');

    // 5. Add to cart
    await page.click('button:has-text("Add to Cart")');

    // 6. Verify cart updated
    await expect(page.locator('.cart-count')).toHaveText('1');

    // 7. Open cart
    await page.click('.cart-button');

    // 8. Verify product in cart
    await expect(page.locator('.cart-item')).toBeVisible();

    // 9. Click checkout
    await page.click('button:has-text("Checkout")');

    // 10. Verify redirected to Shopify checkout
    await expect(page).toHaveURL(/checkout\.shopify\.com/);
  });
});
```

---

## Test Data Fixtures

### Shopify API Response Mocks

**File:** `__tests__/fixtures/shopify-product.ts`

**Status:** ❌ Not created

**Example Fixture:**

```typescript
export function mockShopifyProduct(overrides = {}) {
  return {
    id: 'gid://shopify/Product/123456789',
    title: 'Awesome T-Shirt',
    handle: 'awesome-tshirt',
    bodyHtml: '<p>The most comfortable shirt ever</p>',
    productType: 'Apparel',
    vendor: 'My Brand',
    tags: 'summer, cotton, bestseller',
    status: 'active',
    publishedAt: '2025-01-01T00:00:00Z',
    options: [
      {
        name: 'Size',
        values: ['S', 'M', 'L', 'XL']
      },
      {
        name: 'Color',
        values: ['Red', 'Blue', 'Green']
      }
    ],
    images: [
      {
        id: 'gid://shopify/ProductImage/111',
        src: 'https://cdn.shopify.com/s/files/1/0001/image1.jpg',
        altText: 'Red t-shirt front',
        position: 1
      }
    ],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/456',
        title: 'Red / L',
        sku: 'TS-RED-L',
        price: '29.99',
        compareAtPrice: '39.99',
        inventoryQuantity: 100,
        option1: 'Red',
        option2: 'L'
      }
    ],
    ...overrides
  };
}

export function mockShopifyOrder(overrides = {}) {
  return {
    id: 'gid://shopify/Order/789',
    orderNumber: 1001,
    email: 'customer@example.com',
    financialStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    currency: 'USD',
    subtotalPrice: '59.98',
    totalTax: '5.40',
    totalShipping: '10.00',
    totalPrice: '75.38',
    totalDiscounts: '5.00',
    lineItems: [
      {
        id: 'gid://shopify/LineItem/111',
        productId: 'gid://shopify/Product/123',
        variantId: 'gid://shopify/ProductVariant/456',
        quantity: 2,
        price: '29.99',
        title: 'Awesome T-Shirt - Red / L'
      }
    ],
    discountCodes: [],
    shippingAddress: {
      address1: '123 Main St',
      city: 'New York',
      province: 'NY',
      country: 'US',
      zip: '10001'
    },
    ...overrides
  };
}
```

---

## Running Tests

### Commands

```bash
# Run all tests
bun test

# Run unit tests only
bun test:unit

# Run integration tests
bun test:integration

# Run E2E tests
bun test:e2e

# Run with coverage
bun test:coverage

# Watch mode (during development)
bun test:watch
```

### Configuration

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

---

## Coverage Goals

### Required Coverage by Phase

**Phase 2 (Cycles 16-25):**
- Type definitions: N/A (TypeScript enforced)
- Zod schemas: 100% coverage
- Transformers: 95% coverage

**Phase 3 (Cycles 26-40):**
- Services: 90% coverage
- Error handling: 100% coverage

**Phase 5 (Cycles 66-85):**
- Components: 80% coverage
- State management: 90% coverage

### Coverage Reports

Run `bun test:coverage` to generate:
- `coverage/index.html` - Visual coverage report
- `coverage/coverage-summary.json` - JSON summary

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/shopify-tests.yml`

```yaml
name: Shopify Integration Tests

on:
  push:
    paths:
      - 'web/src/providers/shopify/**'
  pull_request:
    paths:
      - 'web/src/providers/shopify/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-summary.json
```

---

## Test Checklist

### Before Committing

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code coverage meets thresholds (95%+ for transformers)
- [ ] No TypeScript errors
- [ ] Zod schemas validate sample data
- [ ] Test fixtures are up to date

### Before Deploying

- [ ] All E2E tests pass
- [ ] Integration tests pass against production Shopify store
- [ ] Performance tests completed
- [ ] Error scenarios tested
- [ ] Webhook handling tested

---

## Next Steps

**After Cycles 16-24 are complete:**

1. Create all test files listed above
2. Write test fixtures for all Shopify entities
3. Set up CI/CD pipeline
4. Run tests and achieve 95%+ coverage
5. Document any edge cases discovered during testing

---

**Status:** ⚠️ PLACEHOLDER - Awaiting implementation of Cycles 16-24

**Last Updated:** 2025-11-22

**See Also:**
- `/home/user/one.ie/one/events/shopify-mapping-validation.md` - Validation report
- `/home/user/one.ie/web/src/providers/shopify/examples.ts` - Integration examples
