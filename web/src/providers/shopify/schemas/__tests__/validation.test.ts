/**
 * Shopify Schema Validation Tests
 *
 * Tests for Zod validation schemas (Cycles 19-20)
 */

import { describe, test, expect } from 'bun:test';
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
  ShopifyValidationError,

  // Shopify helpers
  extractNumericId,
  createGid,
  parseGid,
  generateVariantSlug,
  computeStockStatus,
  stripHtml,
  calculateDiscountPercentage,
  normalizeHandle,
} from '../index';

// ============================================================================
// PROPERTY SCHEMA TESTS
// ============================================================================

describe('ProductPropertiesSchema', () => {
  test('validates valid product', () => {
    const product = {
      shopifyId: '7891234567890',
      shopifyHandle: 'classic-t-shirt',
      title: 'Classic T-Shirt',
      status: 'active' as const,
      options: [],
      tags: [],
      images: [],
      tracksInventory: true,
      shopifyMetadata: {
        id: '7891234567890',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(ProductPropertiesSchema, product);
    expect(result.success).toBe(true);
  });

  test('rejects invalid price range (min > max)', () => {
    const product = {
      shopifyId: '123',
      shopifyHandle: 'test',
      title: 'Test',
      status: 'active' as const,
      options: [],
      tags: [],
      images: [],
      tracksInventory: true,
      priceRange: {
        min: 100,
        max: 50, // Invalid: min > max
        currency: 'USD',
      },
      shopifyMetadata: {
        id: '123',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(ProductPropertiesSchema, product);
    expect(result.success).toBe(false);
  });

  test('validates product with complete data', () => {
    const product = {
      shopifyId: '7891234567890',
      shopifyHandle: 'classic-t-shirt',
      title: 'Classic T-Shirt',
      description: 'Comfortable cotton t-shirt',
      vendor: 'Acme Clothing',
      productType: 'T-Shirts',
      tags: ['casual', 'cotton', 'summer'],
      status: 'active' as const,
      options: [
        {
          name: 'Size',
          position: 1,
          values: ['Small', 'Medium', 'Large'],
        },
      ],
      priceRange: {
        min: 19.99,
        max: 24.99,
        currency: 'USD',
      },
      totalInventory: 250,
      tracksInventory: true,
      images: [
        {
          url: 'https://cdn.shopify.com/image.jpg',
          altText: 'Classic T-Shirt',
          position: 1,
        },
      ],
      seo: {
        title: 'Classic T-Shirt - Comfortable Cotton',
        description: 'Buy our comfortable cotton t-shirt',
      },
      shopifyMetadata: {
        id: '7891234567890',
        gid: 'gid://shopify/Product/7891234567890',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(ProductPropertiesSchema, product);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Classic T-Shirt');
      expect(result.data.tags).toHaveLength(3);
    }
  });
});

describe('ProductVariantPropertiesSchema', () => {
  test('validates valid variant', () => {
    const variant = {
      shopifyId: '4567890',
      shopifyProductId: '7891234567890',
      price: 19.99,
      currency: 'USD',
      selectedOptions: [
        { name: 'Size', value: 'Small' },
      ],
      inventoryQuantity: 100,
      inventoryPolicy: 'deny' as const,
      availableForSale: true,
      requiresShipping: true,
      position: 1,
      shopifyMetadata: {
        id: '4567890',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(ProductVariantPropertiesSchema, variant);
    expect(result.success).toBe(true);
  });

  test('rejects invalid compareAtPrice (less than price)', () => {
    const variant = {
      shopifyId: '4567890',
      shopifyProductId: '7891234567890',
      price: 24.99,
      compareAtPrice: 19.99, // Invalid: should be >= price
      currency: 'USD',
      selectedOptions: [{ name: 'Size', value: 'Small' }],
      inventoryQuantity: 100,
      inventoryPolicy: 'deny' as const,
      availableForSale: true,
      requiresShipping: true,
      position: 1,
      shopifyMetadata: {
        id: '4567890',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(ProductVariantPropertiesSchema, variant);
    expect(result.success).toBe(false);
  });
});

describe('CustomerPropertiesSchema', () => {
  test('validates valid customer', () => {
    const customer = {
      shopifyId: '7777777777',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      addresses: [],
      tags: [],
      state: 'enabled' as const,
      verified: true,
      acceptsMarketing: false,
      taxExempt: false,
      isGuest: false,
      shopifyMetadata: {
        id: '7777777777',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(CustomerPropertiesSchema, customer);
    expect(result.success).toBe(true);
  });

  test('validates guest customer', () => {
    const guest = {
      shopifyId: '',
      email: 'guest@example.com',
      addresses: [],
      tags: [],
      state: 'enabled' as const,
      verified: false,
      acceptsMarketing: false,
      taxExempt: false,
      isGuest: true,
      shopifyMetadata: {
        id: '',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(CustomerPropertiesSchema, guest);
    expect(result.success).toBe(true);
  });

  test('rejects invalid email', () => {
    const customer = {
      shopifyId: '123',
      email: 'invalid-email', // Invalid email
      addresses: [],
      tags: [],
      state: 'enabled' as const,
      verified: false,
      acceptsMarketing: false,
      taxExempt: false,
      isGuest: false,
      shopifyMetadata: {
        id: '123',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(CustomerPropertiesSchema, customer);
    expect(result.success).toBe(false);
  });
});

describe('OrderPropertiesSchema', () => {
  test('validates valid order', () => {
    const order = {
      shopifyId: '5555555555',
      orderNumber: '#1001',
      orderName: '1001',
      customerEmail: 'customer@example.com',
      subtotalPrice: 39.98,
      totalPrice: 48.18,
      totalTax: 3.20,
      totalShipping: 5.00,
      totalDiscounts: 0,
      currencyCode: 'USD',
      financialStatus: 'paid' as const,
      fulfillmentStatus: 'unfulfilled' as const,
      lineItems: [
        {
          lineItemId: '11111',
          title: 'Classic T-Shirt',
          quantity: 2,
          currentQuantity: 2,
          fulfillableQuantity: 2,
          price: 19.99,
          totalPrice: 39.98,
          requiresShipping: true,
          taxable: true,
        },
      ],
      discounts: [],
      confirmed: true,
      isTest: false,
      cancelled: false,
      shopifyMetadata: {
        id: '5555555555',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(OrderPropertiesSchema, order);
    expect(result.success).toBe(true);
  });

  test('rejects order with invalid total', () => {
    const order = {
      shopifyId: '5555555555',
      orderNumber: '#1001',
      orderName: '1001',
      subtotalPrice: 39.98,
      totalPrice: 100.00, // Invalid: doesn't match subtotal + tax + shipping - discounts
      totalTax: 3.20,
      totalShipping: 5.00,
      totalDiscounts: 0,
      currencyCode: 'USD',
      financialStatus: 'paid' as const,
      fulfillmentStatus: 'unfulfilled' as const,
      lineItems: [
        {
          lineItemId: '11111',
          title: 'Test',
          quantity: 1,
          currentQuantity: 1,
          fulfillableQuantity: 1,
          price: 39.98,
          totalPrice: 39.98,
          requiresShipping: true,
          taxable: true,
        },
      ],
      discounts: [],
      confirmed: true,
      isTest: false,
      cancelled: false,
      shopifyMetadata: {
        id: '5555555555',
        createdAt: '2024-11-22T10:00:00Z',
        updatedAt: '2024-11-22T10:00:00Z',
      },
    };

    const result = safeParse(OrderPropertiesSchema, order);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// METADATA SCHEMA TESTS
// ============================================================================

describe('PurchasedMetadataSchema', () => {
  test('validates valid purchased metadata', () => {
    const metadata = {
      shopifyOrderId: '5555555555',
      orderNumber: '#1001',
      orderName: '1001',
      shopifyLineItemId: '11111',
      quantity: 2,
      currentQuantity: 2,
      unitPrice: 19.99,
      totalPrice: 39.98,
      currency: 'USD',
      productTitle: 'Classic T-Shirt',
      fulfillmentStatus: 'fulfilled' as const,
      fulfillableQuantity: 0,
      requiresShipping: true,
      taxable: true,
      purchasedAt: '2024-11-22T10:00:00Z',
    };

    const result = safeParse(PurchasedMetadataSchema, metadata);
    expect(result.success).toBe(true);
  });
});

describe('OrderPlacedMetadataSchema', () => {
  test('validates valid order placed metadata', () => {
    const metadata = {
      shopifyOrderId: '5555555555',
      orderNumber: '#1001',
      orderName: '1001',
      customerEmail: 'customer@example.com',
      subtotal: 39.98,
      tax: 3.20,
      shipping: 5.00,
      discount: 0,
      total: 48.18,
      currency: 'USD',
      itemCount: 2,
      lineItems: [
        {
          productId: '7891234567890',
          variantId: '4567890',
          quantity: 2,
          price: 39.98,
        },
      ],
      isTest: false,
      confirmed: true,
      shopifyCreatedAt: '2024-11-22T10:00:00Z',
      shopifyProcessedAt: '2024-11-22T10:00:00Z',
    };

    const result = safeParse(OrderPlacedMetadataSchema, metadata);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// VALIDATION HELPER TESTS
// ============================================================================

describe('Validation Helpers', () => {
  const validProduct = {
    shopifyId: '123',
    shopifyHandle: 'test',
    title: 'Test',
    status: 'active' as const,
    options: [],
    tags: [],
    images: [],
    tracksInventory: true,
    shopifyMetadata: {
      id: '123',
      createdAt: '2024-11-22T10:00:00Z',
      updatedAt: '2024-11-22T10:00:00Z',
    },
  };

  test('parse() returns validated data', () => {
    const result = parse(ProductPropertiesSchema, validProduct);
    expect(result.title).toBe('Test');
  });

  test('parse() throws on invalid data', () => {
    expect(() => {
      parse(ProductPropertiesSchema, { invalid: 'data' });
    }).toThrow();
  });

  test('validate() returns data or null', () => {
    const valid = validate(ProductPropertiesSchema, validProduct);
    expect(valid).not.toBeNull();
    expect(valid?.title).toBe('Test');

    const invalid = validate(ProductPropertiesSchema, { invalid: 'data' });
    expect(invalid).toBeNull();
  });

  test('validateOrThrow() throws ShopifyValidationError', () => {
    expect(() => {
      validateOrThrow(ProductPropertiesSchema, { invalid: 'data' });
    }).toThrow(ShopifyValidationError);
  });
});

// ============================================================================
// SHOPIFY HELPER TESTS
// ============================================================================

describe('Shopify Helpers', () => {
  describe('extractNumericId', () => {
    test('extracts ID from GID', () => {
      expect(extractNumericId('gid://shopify/Product/7891234567890')).toBe('7891234567890');
    });

    test('returns numeric ID as-is', () => {
      expect(extractNumericId('123456')).toBe('123456');
    });
  });

  describe('createGid', () => {
    test('creates valid GID', () => {
      expect(createGid('Product', '123')).toBe('gid://shopify/Product/123');
    });

    test('handles numeric ID input', () => {
      expect(createGid('ProductVariant', 'gid://shopify/ProductVariant/456')).toBe(
        'gid://shopify/ProductVariant/456'
      );
    });
  });

  describe('parseGid', () => {
    test('parses valid GID', () => {
      const parsed = parseGid('gid://shopify/Product/123');
      expect(parsed).toEqual({
        protocol: 'gid',
        namespace: 'shopify',
        resource: 'Product',
        id: '123',
      });
    });

    test('returns null for invalid GID', () => {
      expect(parseGid('invalid')).toBeNull();
    });
  });

  describe('generateVariantSlug', () => {
    test('generates slug from options', () => {
      const slug = generateVariantSlug('classic-t-shirt', [
        { name: 'Size', value: 'Small' },
        { name: 'Color', value: 'Blue' },
      ]);
      expect(slug).toBe('classic-t-shirt-small-blue');
    });

    test('handles special characters', () => {
      const slug = generateVariantSlug('product', [
        { name: 'Option', value: 'Value With Spaces!' },
      ]);
      expect(slug).toBe('product-value-with-spaces');
    });
  });

  describe('computeStockStatus', () => {
    test('returns "in_stock" for high quantity', () => {
      expect(computeStockStatus(100, true, true, 10)).toBe('in_stock');
    });

    test('returns "low_stock" for low quantity', () => {
      expect(computeStockStatus(5, true, true, 10)).toBe('low_stock');
    });

    test('returns "out_of_stock" for zero quantity', () => {
      expect(computeStockStatus(0, true, true, 10)).toBe('out_of_stock');
    });

    test('returns "not_tracked" when inventory not tracked', () => {
      expect(computeStockStatus(0, true, false, 10)).toBe('not_tracked');
    });
  });

  describe('stripHtml', () => {
    test('removes HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    });

    test('handles HTML entities', () => {
      // Note: &nbsp; is replaced with space, but trim() removes leading/trailing spaces
      expect(stripHtml('&nbsp;test&nbsp;&amp;&lt;&gt;')).toBe('test &<>');
      expect(stripHtml('&amp;&lt;&gt;')).toBe('&<>');
      expect(stripHtml('Hello&nbsp;World')).toBe('Hello World');
    });

    test('handles null/undefined', () => {
      expect(stripHtml(null)).toBe('');
      expect(stripHtml(undefined)).toBe('');
    });
  });

  describe('calculateDiscountPercentage', () => {
    test('calculates discount correctly', () => {
      expect(calculateDiscountPercentage(15.99, 24.99)).toBe(36);
    });

    test('returns 0 for no discount', () => {
      expect(calculateDiscountPercentage(24.99, 24.99)).toBe(0);
    });

    test('returns 0 for invalid discount', () => {
      expect(calculateDiscountPercentage(30.00, 24.99)).toBe(0);
    });
  });

  describe('normalizeHandle', () => {
    test('normalizes handle', () => {
      expect(normalizeHandle('Classic T-Shirt!')).toBe('classic-t-shirt');
    });

    test('removes special characters', () => {
      expect(normalizeHandle('Product #123')).toBe('product-123');
    });

    test('handles multiple hyphens', () => {
      expect(normalizeHandle('test---product')).toBe('test-product');
    });
  });
});
