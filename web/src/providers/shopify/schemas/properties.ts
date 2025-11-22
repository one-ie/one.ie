/**
 * Shopify Property Schemas (Cycle 19)
 *
 * Zod schemas for validating Shopify Thing properties at runtime.
 * These schemas ensure data integrity when transforming Shopify API
 * responses to ONE Platform entities.
 *
 * @module shopify/schemas/properties
 */

import { z } from 'zod';

// ============================================================================
// BRANDED TYPES (Type-Safe IDs)
// ============================================================================

/**
 * Shopify Product ID (numeric string or GID)
 * Examples: "7891234567890" or "gid://shopify/Product/7891234567890"
 */
export const ShopifyProductIdSchema = z
  .string()
  .min(1)
  .describe('Shopify Product ID (numeric or GID format)')
  .brand<'ShopifyProductId'>();

export type ShopifyProductId = z.infer<typeof ShopifyProductIdSchema>;

/**
 * Shopify Product Variant ID (numeric string or GID)
 * Examples: "4567890" or "gid://shopify/ProductVariant/4567890"
 */
export const ShopifyVariantIdSchema = z
  .string()
  .min(1)
  .describe('Shopify Product Variant ID (numeric or GID format)')
  .brand<'ShopifyVariantId'>();

export type ShopifyVariantId = z.infer<typeof ShopifyVariantIdSchema>;

/**
 * Shopify Customer ID (numeric string or GID, can be empty for guests)
 */
export const ShopifyCustomerIdSchema = z
  .string()
  .describe('Shopify Customer ID (numeric or GID format, empty for guests)')
  .brand<'ShopifyCustomerId'>();

export type ShopifyCustomerId = z.infer<typeof ShopifyCustomerIdSchema>;

/**
 * Shopify Order ID (numeric string or GID)
 */
export const ShopifyOrderIdSchema = z
  .string()
  .min(1)
  .describe('Shopify Order ID (numeric or GID format)')
  .brand<'ShopifyOrderId'>();

export type ShopifyOrderId = z.infer<typeof ShopifyOrderIdSchema>;

// ============================================================================
// COMMON SCHEMAS (Reusable Components)
// ============================================================================

/**
 * Shopify Metadata (ID, GID, timestamps)
 */
export const ShopifyMetadataSchema = z.object({
  id: z.string().describe('Numeric Shopify ID'),
  gid: z.string().optional().describe('Global ID (gid://shopify/...)'),
  createdAt: z.string().datetime().describe('ISO 8601 creation timestamp'),
  updatedAt: z.string().datetime().describe('ISO 8601 update timestamp'),
}).describe('Shopify metadata (IDs and timestamps)');

export type ShopifyMetadata = z.infer<typeof ShopifyMetadataSchema>;

/**
 * Image schema (product/variant images)
 */
export const ImageSchema = z.object({
  url: z.string().url().describe('CDN image URL'),
  altText: z.string().optional().describe('Alternative text for accessibility'),
  width: z.number().int().positive().optional().describe('Image width in pixels'),
  height: z.number().int().positive().optional().describe('Image height in pixels'),
  position: z.number().int().positive().optional().describe('Display order position'),
}).describe('Product or variant image');

export type Image = z.infer<typeof ImageSchema>;

/**
 * SEO metadata schema
 */
export const SEOSchema = z.object({
  title: z.string().max(70).optional().describe('SEO title (max 70 chars)'),
  description: z.string().max(320).optional().describe('SEO description (max 320 chars)'),
}).describe('SEO metadata for search engines');

export type SEO = z.infer<typeof SEOSchema>;

/**
 * Money amount with currency
 */
export const MoneySchema = z.object({
  amount: z.number().nonnegative().describe('Amount (e.g., 19.99)'),
  currency: z.string().length(3).toUpperCase().describe('ISO 4217 currency code (USD, EUR, etc.)'),
}).describe('Money amount with currency');

export type Money = z.infer<typeof MoneySchema>;

/**
 * Address schema (shipping/billing)
 */
export const AddressSchema = z.object({
  address1: z.string().optional().describe('Street address line 1'),
  address2: z.string().optional().describe('Street address line 2'),
  city: z.string().optional().describe('City'),
  province: z.string().optional().describe('State/province'),
  provinceCode: z.string().optional().describe('State/province code'),
  country: z.string().optional().describe('Country name'),
  countryCode: z.string().length(2).optional().describe('ISO 3166-1 alpha-2 country code'),
  zip: z.string().optional().describe('Postal/ZIP code'),
  phone: z.string().optional().describe('Phone number'),
  company: z.string().optional().describe('Company name'),
  firstName: z.string().optional().describe('First name'),
  lastName: z.string().optional().describe('Last name'),
}).describe('Mailing address');

export type Address = z.infer<typeof AddressSchema>;

// ============================================================================
// PRODUCT PROPERTY SCHEMA
// ============================================================================

/**
 * Product option (Size, Color, Material, etc.)
 */
export const ProductOptionSchema = z.object({
  name: z.string().min(1).max(255).describe('Option name (e.g., "Size", "Color")'),
  position: z.number().int().min(1).max(3).describe('Option position (1, 2, or 3)'),
  values: z.array(z.string()).min(1).describe('Option values (e.g., ["Small", "Medium", "Large"])'),
}).describe('Product option (up to 3 per product)');

export type ProductOption = z.infer<typeof ProductOptionSchema>;

/**
 * Product status enum
 */
export const ProductStatusSchema = z.enum(['active', 'archived', 'draft']).describe('Product status');

export type ProductStatus = z.infer<typeof ProductStatusSchema>;

/**
 * Product price range
 */
export const PriceRangeSchema = z.object({
  min: z.number().nonnegative().describe('Minimum variant price'),
  max: z.number().nonnegative().describe('Maximum variant price'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),
}).describe('Price range across all variants');

export type PriceRange = z.infer<typeof PriceRangeSchema>;

/**
 * Complete Product Properties Schema
 * Maps to ONE Thing (type: "product")
 */
export const ProductPropertiesSchema = z.object({
  // Shopify identifiers
  shopifyId: ShopifyProductIdSchema.describe('Shopify Product ID'),
  shopifyHandle: z.string().min(1).describe('URL-friendly handle (slug)'),

  // Core product info
  title: z.string().min(1).max(255).describe('Product title'),
  description: z.string().optional().describe('Product description (plain text or HTML)'),
  vendor: z.string().optional().describe('Brand or manufacturer'),
  productType: z.string().optional().describe('Product category (e.g., "T-Shirts", "Books")'),
  tags: z.array(z.string()).default([]).describe('Product tags for categorization'),

  // Status
  status: ProductStatusSchema.describe('Product status'),

  // Options (up to 3)
  options: z.array(ProductOptionSchema).max(3).default([])
    .describe('Product options (Size, Color, Material, etc.)'),

  // Pricing
  priceRange: PriceRangeSchema.optional().describe('Price range across variants'),

  // Inventory
  totalInventory: z.number().int().nonnegative().optional()
    .describe('Total inventory across all variants'),
  tracksInventory: z.boolean().default(true)
    .describe('Whether inventory is tracked'),

  // Media
  images: z.array(ImageSchema).default([])
    .describe('Product images'),
  featuredImage: ImageSchema.optional()
    .describe('Main product image'),

  // SEO
  seo: SEOSchema.optional()
    .describe('SEO metadata'),

  // Shopify metadata
  shopifyMetadata: ShopifyMetadataSchema.describe('Shopify IDs and timestamps'),

  // Custom metafields (flexible schema)
  metafields: z.record(z.string(), z.any()).optional()
    .describe('Shopify metafields (custom data)'),

  // Publication
  publishedAt: z.string().datetime().optional()
    .describe('Publication timestamp'),
})
  .describe('Product properties for ONE Thing (type: "product")')
  .refine(
    (data) => {
      // Validate that if priceRange exists, min <= max
      if (data.priceRange && data.priceRange.min > data.priceRange.max) {
        return false;
      }
      return true;
    },
    {
      message: 'Price range min must be less than or equal to max',
    }
  );

export type ProductProperties = z.infer<typeof ProductPropertiesSchema>;

// ============================================================================
// PRODUCT VARIANT PROPERTY SCHEMA
// ============================================================================

/**
 * Selected option (variant's specific choice)
 */
export const SelectedOptionSchema = z.object({
  name: z.string().describe('Option name (e.g., "Size")'),
  value: z.string().describe('Selected value (e.g., "Small")'),
}).describe('Selected option for a variant');

export type SelectedOption = z.infer<typeof SelectedOptionSchema>;

/**
 * Inventory policy enum
 */
export const InventoryPolicySchema = z.enum(['deny', 'continue'])
  .describe('Inventory policy (deny = can\'t sell when out of stock, continue = allow overselling)');

export type InventoryPolicy = z.infer<typeof InventoryPolicySchema>;

/**
 * Weight unit enum
 */
export const WeightUnitSchema = z.enum(['kg', 'lb', 'oz', 'g'])
  .describe('Weight unit');

export type WeightUnit = z.infer<typeof WeightUnitSchema>;

/**
 * Stock status (computed from inventory)
 */
export const StockStatusSchema = z.enum(['in_stock', 'low_stock', 'out_of_stock', 'not_tracked'])
  .describe('Stock availability status');

export type StockStatus = z.infer<typeof StockStatusSchema>;

/**
 * Inventory by location
 */
export const InventoryByLocationSchema = z.object({
  locationId: z.string().describe('Shopify location ID'),
  locationName: z.string().optional().describe('Location name'),
  quantity: z.number().int().describe('Quantity at this location'),
  available: z.number().int().describe('Available quantity'),
}).describe('Inventory at a specific location');

export type InventoryByLocation = z.infer<typeof InventoryByLocationSchema>;

/**
 * Variant pricing
 */
export const VariantPricingSchema = z.object({
  price: z.number().nonnegative().describe('Current price'),
  compareAtPrice: z.number().nonnegative().optional().describe('Original price (for showing discounts)'),
  costPerItem: z.number().nonnegative().optional().describe('Cost per item (for profit calculations)'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),
}).describe('Variant pricing information');

export type VariantPricing = z.infer<typeof VariantPricingSchema>;

/**
 * Complete Product Variant Properties Schema
 * Maps to ONE Thing (type: "product_variant")
 */
export const ProductVariantPropertiesSchema = z.object({
  // Shopify identifiers
  shopifyId: ShopifyVariantIdSchema.describe('Shopify Variant ID'),
  shopifyProductId: ShopifyProductIdSchema.describe('Parent product ID'),

  // SKU & Barcode
  sku: z.string().optional().describe('Stock Keeping Unit'),
  barcode: z.string().optional().describe('Barcode (UPC, EAN, ISBN, etc.)'),

  // Pricing
  price: z.number().nonnegative().describe('Current price'),
  compareAtPrice: z.number().nonnegative().optional()
    .describe('Original price (for showing discounts)'),
  costPerItem: z.number().nonnegative().optional()
    .describe('Cost per item (for profit margin calculations)'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),

  // Selected options (what makes this variant unique)
  selectedOptions: z.array(SelectedOptionSchema).min(1)
    .describe('Selected options that define this variant'),

  // Inventory
  inventoryQuantity: z.number().int().describe('Total inventory quantity'),
  inventoryPolicy: InventoryPolicySchema.describe('Inventory policy'),
  inventoryManagement: z.string().optional()
    .describe('Inventory management system (shopify, third_party, etc.)'),
  inventoryByLocation: z.array(InventoryByLocationSchema).optional()
    .describe('Inventory breakdown by location'),
  availableForSale: z.boolean().describe('Whether variant is available for purchase'),
  stockStatus: StockStatusSchema.optional().describe('Computed stock status'),

  // Physical properties
  weight: z.number().nonnegative().optional().describe('Weight value'),
  weightUnit: WeightUnitSchema.optional().describe('Weight unit'),
  requiresShipping: z.boolean().default(true).describe('Whether variant requires shipping'),

  // Media
  image: ImageSchema.optional().describe('Variant-specific image'),

  // Position
  position: z.number().int().positive().describe('Display order position'),

  // Shopify metadata
  shopifyMetadata: ShopifyMetadataSchema.describe('Shopify IDs and timestamps'),

  // Custom metafields
  metafields: z.record(z.string(), z.any()).optional()
    .describe('Shopify metafields'),
})
  .describe('Product variant properties for ONE Thing (type: "product_variant")')
  .refine(
    (data) => {
      // If compareAtPrice exists, it should be >= current price
      if (data.compareAtPrice && data.compareAtPrice < data.price) {
        return false;
      }
      return true;
    },
    {
      message: 'Compare at price must be greater than or equal to current price',
    }
  );

export type ProductVariantProperties = z.infer<typeof ProductVariantPropertiesSchema>;

// ============================================================================
// CUSTOMER PROPERTY SCHEMA
// ============================================================================

/**
 * Marketing consent
 */
export const MarketingConsentSchema = z.object({
  email: z.object({
    consentUpdatedAt: z.string().datetime().optional(),
    marketingOptInLevel: z.enum(['single_opt_in', 'confirmed_opt_in', 'unknown']).optional(),
    marketingState: z.enum(['subscribed', 'unsubscribed', 'not_subscribed', 'pending']),
  }).optional().describe('Email marketing consent'),

  sms: z.object({
    consentUpdatedAt: z.string().datetime().optional(),
    marketingOptInLevel: z.enum(['single_opt_in', 'confirmed_opt_in', 'unknown']).optional(),
    marketingState: z.enum(['subscribed', 'unsubscribed', 'not_subscribed', 'pending']),
  }).optional().describe('SMS marketing consent'),
}).describe('Customer marketing consent preferences');

export type MarketingConsent = z.infer<typeof MarketingConsentSchema>;

/**
 * Customer order statistics
 */
export const OrderStatsSchema = z.object({
  count: z.number().int().nonnegative().describe('Total number of orders'),
  totalSpent: z.number().nonnegative().describe('Total amount spent'),
  averageOrderValue: z.number().nonnegative().optional().describe('Average order value'),
  lifetimeDuration: z.number().int().nonnegative().optional()
    .describe('Days since first order'),
  lastOrderDate: z.string().datetime().optional().describe('Date of last order'),
  firstOrderDate: z.string().datetime().optional().describe('Date of first order'),
}).describe('Customer order statistics');

export type OrderStats = z.infer<typeof OrderStatsSchema>;

/**
 * Customer state enum
 */
export const CustomerStateSchema = z.enum(['disabled', 'invited', 'enabled', 'declined'])
  .describe('Customer account state');

export type CustomerState = z.infer<typeof CustomerStateSchema>;

/**
 * Complete Customer Properties Schema
 * Maps to ONE Thing (type: "creator", role: "customer")
 */
export const CustomerPropertiesSchema = z.object({
  // Shopify identifiers
  shopifyId: ShopifyCustomerIdSchema.describe('Shopify Customer ID'),

  // Contact information
  email: z.string().email().describe('Customer email address'),
  phone: z.string().optional().describe('Customer phone number'),
  firstName: z.string().optional().describe('First name'),
  lastName: z.string().optional().describe('Last name'),

  // Addresses
  addresses: z.array(AddressSchema).default([]).describe('Customer addresses'),
  defaultAddress: AddressSchema.optional().describe('Default shipping/billing address'),

  // Account state
  state: CustomerStateSchema.default('enabled').describe('Account state'),
  verified: z.boolean().default(false).describe('Whether email is verified'),

  // Marketing
  marketing: MarketingConsentSchema.optional().describe('Marketing consent preferences'),
  acceptsMarketing: z.boolean().default(false).describe('Legacy marketing consent flag'),
  acceptsMarketingUpdatedAt: z.string().datetime().optional()
    .describe('When marketing consent was last updated'),

  // Tags
  tags: z.array(z.string()).default([]).describe('Customer tags'),

  // Notes
  note: z.string().optional().describe('Internal notes about customer'),

  // Order statistics
  orderStats: OrderStatsSchema.optional().describe('Order history statistics'),

  // Tax exemption
  taxExempt: z.boolean().default(false).describe('Whether customer is tax exempt'),
  taxExemptions: z.array(z.string()).optional().describe('Tax exemption types'),

  // Currency
  currency: z.string().length(3).optional().describe('Customer\'s preferred currency'),

  // Shopify metadata
  shopifyMetadata: ShopifyMetadataSchema.describe('Shopify IDs and timestamps'),

  // Custom metafields
  metafields: z.record(z.string(), z.any()).optional().describe('Shopify metafields'),

  // Guest flag
  isGuest: z.boolean().default(false).describe('Whether this is a guest customer (checkout without account)'),
})
  .describe('Customer properties for ONE Thing (type: "creator", role: "customer")')
  .refine(
    (data) => {
      // Email validation for guests
      if (data.isGuest && !data.email) {
        return false;
      }
      return true;
    },
    {
      message: 'Guest customers must have an email address',
    }
  );

export type CustomerProperties = z.infer<typeof CustomerPropertiesSchema>;

// ============================================================================
// ORDER PROPERTY SCHEMA
// ============================================================================

/**
 * Financial status enum
 */
export const FinancialStatusSchema = z.enum([
  'authorized',
  'pending',
  'paid',
  'partially_paid',
  'refunded',
  'partially_refunded',
  'voided',
  'expired',
]).describe('Order financial status');

export type FinancialStatus = z.infer<typeof FinancialStatusSchema>;

/**
 * Fulfillment status enum
 */
export const FulfillmentStatusSchema = z.enum([
  'fulfilled',
  'in_progress',
  'on_hold',
  'open',
  'partially_fulfilled',
  'pending_fulfillment',
  'restocked',
  'scheduled',
  'unfulfilled',
]).describe('Order fulfillment status');

export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>;

/**
 * Cancel reason enum
 */
export const CancelReasonSchema = z.enum([
  'customer',
  'fraud',
  'inventory',
  'declined',
  'other',
]).describe('Order cancellation reason');

export type CancelReason = z.infer<typeof CancelReasonSchema>;

/**
 * Line item in order
 */
export const OrderLineItemSchema = z.object({
  lineItemId: z.string().describe('Shopify Line Item ID'),
  productId: z.string().optional().describe('Product ID'),
  variantId: z.string().optional().describe('Variant ID'),

  title: z.string().describe('Product title'),
  variantTitle: z.string().optional().describe('Variant title'),
  sku: z.string().optional().describe('SKU'),

  quantity: z.number().int().positive().describe('Quantity ordered'),
  currentQuantity: z.number().int().nonnegative().describe('Current quantity (after refunds)'),
  fulfillableQuantity: z.number().int().nonnegative().describe('Quantity that can be fulfilled'),

  price: z.number().nonnegative().describe('Unit price'),
  totalPrice: z.number().nonnegative().describe('Total price for line item'),
  discountedPrice: z.number().nonnegative().optional().describe('Price after discounts'),

  requiresShipping: z.boolean().default(true).describe('Whether item requires shipping'),
  taxable: z.boolean().default(true).describe('Whether item is taxable'),
  fulfillmentStatus: z.string().optional().describe('Fulfillment status'),
}).describe('Order line item');

export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;

/**
 * Discount application
 */
export const DiscountApplicationSchema = z.object({
  type: z.string().describe('Discount type (automatic, discount_code, manual, script)'),
  code: z.string().optional().describe('Discount code (if applicable)'),
  title: z.string().describe('Discount title'),
  value: z.number().describe('Discount value'),
  valueType: z.enum(['fixed_amount', 'percentage']).describe('Value type'),
}).describe('Applied discount');

export type DiscountApplication = z.infer<typeof DiscountApplicationSchema>;

/**
 * Shipping line
 */
export const ShippingLineSchema = z.object({
  title: z.string().describe('Shipping method title'),
  price: z.number().nonnegative().describe('Shipping price'),
  code: z.string().optional().describe('Shipping code'),
  source: z.string().optional().describe('Shipping source'),
}).describe('Shipping line');

export type ShippingLine = z.infer<typeof ShippingLineSchema>;

/**
 * Complete Order Properties Schema
 *
 * NOTE: In ONE Platform, orders are represented as CONNECTIONS (type: "purchased")
 * and EVENTS (type: "order_placed", etc.), NOT as separate Things.
 *
 * This schema is provided for reference and for storing order metadata
 * in events/connections.
 */
export const OrderPropertiesSchema = z.object({
  // Shopify identifiers
  shopifyId: ShopifyOrderIdSchema.describe('Shopify Order ID'),
  orderNumber: z.string().describe('Order number (e.g., "#1001")'),
  orderName: z.string().describe('Order name (e.g., "1001" without #)'),

  // Customer information
  customerEmail: z.string().email().optional().describe('Customer email'),
  customerPhone: z.string().optional().describe('Customer phone'),
  customerId: z.string().optional().describe('Customer ID (null for guests)'),

  // Pricing
  subtotalPrice: z.number().nonnegative().describe('Subtotal before tax and shipping'),
  totalPrice: z.number().nonnegative().describe('Total order price'),
  totalTax: z.number().nonnegative().describe('Total tax'),
  totalShipping: z.number().nonnegative().describe('Total shipping cost'),
  totalDiscounts: z.number().nonnegative().describe('Total discounts applied'),
  currencyCode: z.string().length(3).toUpperCase().describe('Currency code'),

  // Status
  financialStatus: FinancialStatusSchema.describe('Payment status'),
  fulfillmentStatus: FulfillmentStatusSchema.describe('Fulfillment status'),

  // Line items
  lineItems: z.array(OrderLineItemSchema).min(1).describe('Order line items'),

  // Discounts
  discounts: z.array(DiscountApplicationSchema).default([]).describe('Applied discounts'),

  // Shipping
  shippingAddress: AddressSchema.optional().describe('Shipping address'),
  billingAddress: AddressSchema.optional().describe('Billing address'),
  shippingLine: ShippingLineSchema.optional().describe('Shipping method'),

  // Flags
  confirmed: z.boolean().default(false).describe('Whether order is confirmed'),
  isTest: z.boolean().default(false).describe('Whether this is a test order'),
  cancelled: z.boolean().default(false).describe('Whether order is cancelled'),
  cancelReason: CancelReasonSchema.optional().describe('Cancellation reason'),

  // Notes
  note: z.string().optional().describe('Customer note'),
  noteAttributes: z.record(z.string(), z.string()).optional()
    .describe('Additional note attributes'),

  // Timestamps
  shopifyMetadata: ShopifyMetadataSchema.describe('Shopify IDs and timestamps'),
  processedAt: z.string().datetime().optional().describe('When order was processed'),
  cancelledAt: z.string().datetime().optional().describe('When order was cancelled'),
  closedAt: z.string().datetime().optional().describe('When order was closed'),
})
  .describe('Order properties (stored in connection/event metadata, NOT as a Thing)')
  .refine(
    (data) => {
      // Validate that total = subtotal + tax + shipping - discounts
      const calculated = data.subtotalPrice + data.totalTax + data.totalShipping - data.totalDiscounts;
      const diff = Math.abs(calculated - data.totalPrice);

      // Allow for small floating point differences (< 0.01)
      return diff < 0.01;
    },
    {
      message: 'Total price must equal subtotal + tax + shipping - discounts',
    }
  );

export type OrderProperties = z.infer<typeof OrderPropertiesSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Compute stock status from inventory quantity and policy
 */
export function computeStockStatus(
  quantity: number,
  availableForSale: boolean,
  tracksInventory: boolean,
  lowStockThreshold: number = 10
): StockStatus {
  if (!tracksInventory) {
    return 'not_tracked';
  }

  if (!availableForSale || quantity <= 0) {
    return 'out_of_stock';
  }

  if (quantity <= lowStockThreshold) {
    return 'low_stock';
  }

  return 'in_stock';
}

/**
 * Extract numeric ID from Shopify GID
 * Example: "gid://shopify/Product/7891234567890" → "7891234567890"
 */
export function extractNumericId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}

/**
 * Generate variant slug from product handle and selected options
 * Example: "classic-t-shirt" + ["Small", "Blue"] → "classic-t-shirt-small-blue"
 */
export function generateVariantSlug(productHandle: string, selectedOptions: SelectedOption[]): string {
  const optionSlugs = selectedOptions
    .map(opt => opt.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    .join('-');

  return `${productHandle}-${optionSlugs}`;
}
