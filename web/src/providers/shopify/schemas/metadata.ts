/**
 * Shopify Metadata Schemas (Cycle 20)
 *
 * Zod schemas for validating connection and event metadata.
 * These schemas ensure data integrity for Shopify-related relationships
 * and lifecycle events in the ONE Platform.
 *
 * @module shopify/schemas/metadata
 */

import { z } from 'zod';
import {
  ShopifyProductIdSchema,
  ShopifyVariantIdSchema,
  ShopifyCustomerIdSchema,
  ShopifyOrderIdSchema,
  AddressSchema,
  SelectedOptionSchema,
  FinancialStatusSchema,
  FulfillmentStatusSchema,
  CancelReasonSchema,
  OrderLineItemSchema,
  DiscountApplicationSchema,
  type Address,
  type OrderLineItem,
} from './properties';

// ============================================================================
// CONNECTION METADATA SCHEMAS
// ============================================================================

/**
 * "purchased" Connection Metadata
 *
 * Represents customer → product variant purchase relationship.
 * Each line item in an order becomes a separate "purchased" connection.
 */
export const PurchasedMetadataSchema = z.object({
  // Order identification
  shopifyOrderId: ShopifyOrderIdSchema.describe('Shopify Order ID'),
  orderNumber: z.string().describe('Order number (e.g., "#1001")'),
  orderName: z.string().describe('Order name without # (e.g., "1001")'),

  // Line item details
  shopifyLineItemId: z.string().describe('Shopify Line Item ID'),
  quantity: z.number().int().positive().describe('Quantity purchased'),
  currentQuantity: z.number().int().nonnegative()
    .describe('Current quantity (after refunds/removals)'),

  // Pricing (snapshot at purchase time)
  unitPrice: z.number().nonnegative().describe('Price per unit'),
  totalPrice: z.number().nonnegative().describe('Total price for this line item'),
  discountedPrice: z.number().nonnegative().optional()
    .describe('Price after discounts applied'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),

  // Product snapshot (at purchase time)
  productTitle: z.string().describe('Product name at purchase'),
  variantTitle: z.string().optional().describe('Variant name at purchase'),
  sku: z.string().optional().describe('SKU code'),
  variantSnapshot: z.object({
    selectedOptions: z.array(SelectedOptionSchema),
    price: z.number(),
    image: z.string().url().optional(),
  }).optional().describe('Variant state at purchase time'),

  // Fulfillment status (per line item)
  fulfillmentStatus: z.enum(['unfulfilled', 'partial', 'fulfilled', 'not_eligible'])
    .describe('Line item fulfillment status'),
  fulfillableQuantity: z.number().int().nonnegative()
    .describe('Quantity that can be fulfilled'),

  // Flags
  requiresShipping: z.boolean().default(true).describe('Whether item requires shipping'),
  taxable: z.boolean().default(true).describe('Whether item is taxable'),

  // Timestamps
  purchasedAt: z.string().datetime().describe('When item was purchased (order.processedAt)'),
}).describe('Metadata for "purchased" connection (customer → variant)');

export type PurchasedMetadata = z.infer<typeof PurchasedMetadataSchema>;

/**
 * "in_cart" Connection Metadata
 *
 * Represents customer → product variant in shopping cart.
 */
export const InCartMetadataSchema = z.object({
  // Cart details
  shopifyCartId: z.string().optional().describe('Shopify Cart/Checkout ID'),

  // Line item
  quantity: z.number().int().positive().describe('Quantity in cart'),
  price: z.number().nonnegative().describe('Current price'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),

  // Variant info
  selectedOptions: z.array(SelectedOptionSchema).optional()
    .describe('Selected variant options'),

  // Timestamps
  addedAt: z.string().datetime().describe('When item was added to cart'),
  updatedAt: z.string().datetime().optional().describe('When quantity was last updated'),

  // Session tracking
  sessionId: z.string().optional().describe('Session ID for abandoned cart tracking'),
}).describe('Metadata for "in_cart" connection (customer → variant)');

export type InCartMetadata = z.infer<typeof InCartMetadataSchema>;

/**
 * "variant_of" Connection Metadata
 *
 * Represents product variant → product relationship.
 */
export const VariantOfMetadataSchema = z.object({
  // Position
  position: z.number().int().positive().describe('Variant display order'),

  // Sort order (custom)
  sortOrder: z.number().int().optional().describe('Custom sort order'),

  // Flags
  isDefaultVariant: z.boolean().default(false)
    .describe('Whether this is the default/featured variant'),
}).describe('Metadata for "variant_of" connection (variant → product)');

export type VariantOfMetadata = z.infer<typeof VariantOfMetadataSchema>;

/**
 * "belongs_to" Connection Metadata
 *
 * Represents product → collection relationship.
 */
export const BelongsToMetadataSchema = z.object({
  // Collection identification
  shopifyCollectionId: z.string().describe('Shopify Collection ID'),
  collectionHandle: z.string().describe('Collection handle (slug)'),
  collectionTitle: z.string().describe('Collection title'),

  // Position
  position: z.number().int().positive().describe('Product position in collection'),
  sortOrder: z.number().int().optional().describe('Custom sort order'),

  // Timestamps
  addedAt: z.string().datetime().describe('When product was added to collection'),
}).describe('Metadata for "belongs_to" connection (product → collection)');

export type BelongsToMetadata = z.infer<typeof BelongsToMetadataSchema>;

/**
 * "contains" Connection Metadata
 *
 * Represents order → line item relationship (if modeling orders as things).
 * Note: In ONE Platform, we prefer modeling orders as connections + events,
 * but this schema is provided for alternative implementations.
 */
export const ContainsMetadataSchema = z.object({
  // Line item details
  lineItemId: z.string().describe('Shopify Line Item ID'),
  quantity: z.number().int().positive().describe('Quantity'),
  price: z.number().nonnegative().describe('Unit price'),
  totalPrice: z.number().nonnegative().describe('Total price'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),

  // Product info
  productId: z.string().optional().describe('Product ID'),
  variantId: z.string().optional().describe('Variant ID'),
  sku: z.string().optional().describe('SKU'),

  // Fulfillment
  fulfillmentStatus: z.string().optional().describe('Fulfillment status'),
  fulfillableQuantity: z.number().int().nonnegative().describe('Fulfillable quantity'),
}).describe('Metadata for "contains" connection (order → line item)');

export type ContainsMetadata = z.infer<typeof ContainsMetadataSchema>;

/**
 * "fulfilled_by" Connection Metadata
 *
 * Represents order → staff member (who fulfilled the order).
 */
export const FulfilledByMetadataSchema = z.object({
  // Fulfillment details
  shopifyFulfillmentId: z.string().describe('Shopify Fulfillment ID'),
  fulfillmentStatus: z.enum(['success', 'cancelled', 'error', 'failure'])
    .describe('Fulfillment status'),

  // Tracking
  trackingCompany: z.string().optional().describe('Shipping company'),
  trackingNumber: z.string().optional().describe('Tracking number'),
  trackingUrl: z.string().url().optional().describe('Tracking URL'),

  // Timestamps
  fulfilledAt: z.string().datetime().describe('When fulfillment was created'),
  deliveredAt: z.string().datetime().optional().describe('When package was delivered'),
  inTransitAt: z.string().datetime().optional().describe('When package was in transit'),
}).describe('Metadata for "fulfilled_by" connection');

export type FulfilledByMetadata = z.infer<typeof FulfilledByMetadataSchema>;

// ============================================================================
// EVENT METADATA SCHEMAS
// ============================================================================

/**
 * "order_placed" Event Metadata
 *
 * Fired when customer creates an order (checkout complete).
 */
export const OrderPlacedMetadataSchema = z.object({
  // Order identification
  shopifyOrderId: ShopifyOrderIdSchema.describe('Shopify Order ID'),
  orderNumber: z.string().describe('Order number (e.g., "#1001")'),
  orderName: z.string().describe('Order name (e.g., "1001")'),

  // Customer info
  customerEmail: z.string().email().describe('Customer email'),
  customerPhone: z.string().optional().describe('Customer phone'),

  // Financial summary
  subtotal: z.number().nonnegative().describe('Subtotal price'),
  tax: z.number().nonnegative().describe('Total tax'),
  shipping: z.number().nonnegative().describe('Shipping cost'),
  discount: z.number().nonnegative().describe('Total discounts'),
  total: z.number().nonnegative().describe('Total order price'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),

  // Line items summary
  itemCount: z.number().int().positive().describe('Total items purchased'),
  lineItems: z.array(z.object({
    productId: z.string().optional(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
  })).describe('Line items summary'),

  // Addresses
  shippingAddress: AddressSchema.optional().describe('Shipping address'),
  billingAddress: AddressSchema.optional().describe('Billing address'),

  // Payment method
  paymentGateway: z.string().optional().describe('Payment gateway used'),
  paymentMethod: z.string().optional().describe('Payment method (credit_card, paypal, etc.)'),

  // Discounts
  discounts: z.array(DiscountApplicationSchema).optional().describe('Applied discounts'),

  // Flags
  isTest: z.boolean().default(false).describe('Whether this is a test order'),
  confirmed: z.boolean().default(false).describe('Whether order is confirmed'),

  // Notes
  note: z.string().optional().describe('Customer note'),

  // Shopify timestamps
  shopifyCreatedAt: z.string().datetime().describe('Shopify creation timestamp'),
  shopifyProcessedAt: z.string().datetime().describe('Shopify processing timestamp'),
})
  .describe('Metadata for "order_placed" event')
  .refine(
    (data) => {
      // Validate total calculation
      const calculated = data.subtotal + data.tax + data.shipping - data.discount;
      const diff = Math.abs(calculated - data.total);
      return diff < 0.01; // Allow small floating point errors
    },
    {
      message: 'Total must equal subtotal + tax + shipping - discount',
    }
  );

export type OrderPlacedMetadata = z.infer<typeof OrderPlacedMetadataSchema>;

/**
 * "payment_processed" Event Metadata
 *
 * Fired when payment is successfully captured.
 */
export const PaymentProcessedMetadataSchema = z.object({
  // Order
  shopifyOrderId: ShopifyOrderIdSchema.describe('Shopify Order ID'),
  orderNumber: z.string().describe('Order number'),

  // Transaction
  shopifyTransactionId: z.string().describe('Shopify Transaction ID'),
  transactionKind: z.enum(['sale', 'capture', 'authorization', 'void', 'refund'])
    .describe('Transaction type'),
  transactionStatus: z.enum(['success', 'pending', 'failure', 'error'])
    .describe('Transaction status'),

  // Payment details
  amount: z.number().nonnegative().describe('Payment amount'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),
  gateway: z.string().describe('Payment gateway (shopify_payments, stripe, etc.)'),

  // Authorization
  authorizationCode: z.string().optional().describe('Payment authorization code'),

  // Card details (last 4 digits only)
  cardBrand: z.string().optional().describe('Card brand (Visa, Mastercard, etc.)'),
  cardLast4: z.string().length(4).optional().describe('Last 4 digits of card'),

  // Error details (if failed)
  errorCode: z.string().optional().describe('Error code if transaction failed'),
  errorMessage: z.string().optional().describe('Error message'),

  // Timestamps
  processedAt: z.string().datetime().describe('When payment was processed'),
}).describe('Metadata for "payment_processed" event');

export type PaymentProcessedMetadata = z.infer<typeof PaymentProcessedMetadataSchema>;

/**
 * "order_fulfilled" Event Metadata
 *
 * Fired when order is completely fulfilled.
 */
export const OrderFulfilledMetadataSchema = z.object({
  // Order
  shopifyOrderId: ShopifyOrderIdSchema.describe('Shopify Order ID'),
  orderNumber: z.string().describe('Order number'),

  // Fulfillment
  shopifyFulfillmentId: z.string().describe('Shopify Fulfillment ID'),
  fulfillmentStatus: z.enum(['success', 'cancelled', 'error', 'failure'])
    .describe('Fulfillment status'),

  // Tracking
  trackingCompany: z.string().optional().describe('Shipping company'),
  trackingNumber: z.string().optional().describe('Tracking number'),
  trackingUrl: z.string().url().optional().describe('Tracking URL'),
  trackingNumbers: z.array(z.string()).optional()
    .describe('Multiple tracking numbers (if applicable)'),

  // Line items fulfilled
  lineItemsFulfilled: z.array(z.object({
    lineItemId: z.string(),
    quantity: z.number().int().positive(),
  })).describe('Line items included in fulfillment'),

  // Location
  locationId: z.string().optional().describe('Fulfillment location ID'),
  locationName: z.string().optional().describe('Fulfillment location name'),

  // Timestamps
  fulfilledAt: z.string().datetime().describe('When fulfillment was created'),
  deliveredAt: z.string().datetime().optional().describe('When delivered'),
  inTransitAt: z.string().datetime().optional().describe('When in transit'),
  estimatedDeliveryAt: z.string().datetime().optional()
    .describe('Estimated delivery date'),

  // Notes
  note: z.string().optional().describe('Fulfillment notes'),
}).describe('Metadata for "order_fulfilled" event');

export type OrderFulfilledMetadata = z.infer<typeof OrderFulfilledMetadataSchema>;

/**
 * "order_refunded" Event Metadata
 *
 * Fired when order is fully or partially refunded.
 */
export const OrderRefundedMetadataSchema = z.object({
  // Order
  shopifyOrderId: ShopifyOrderIdSchema.describe('Shopify Order ID'),
  orderNumber: z.string().describe('Order number'),

  // Refund
  shopifyRefundId: z.string().describe('Shopify Refund ID'),
  refundAmount: z.number().nonnegative().describe('Refund amount'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),

  // Refund type
  refundType: z.enum(['full', 'partial']).describe('Refund type'),

  // Reason
  refundReason: z.string().optional().describe('Refund reason'),
  note: z.string().optional().describe('Refund notes'),

  // Line items refunded
  lineItemsRefunded: z.array(z.object({
    lineItemId: z.string(),
    quantity: z.number().int().positive(),
    amount: z.number().nonnegative(),
    restockType: z.enum(['no_restock', 'cancel', 'return', 'legacy_restock']).optional(),
  })).describe('Line items included in refund'),

  // Shipping refund
  shippingRefund: z.number().nonnegative().optional()
    .describe('Shipping amount refunded'),

  // Transactions
  refundTransactions: z.array(z.object({
    transactionId: z.string(),
    amount: z.number().nonnegative(),
    gateway: z.string(),
    kind: z.string(),
  })).describe('Refund transactions'),

  // Restock
  restock: z.boolean().default(true).describe('Whether items were restocked'),

  // Timestamps
  refundedAt: z.string().datetime().describe('When refund was created'),
}).describe('Metadata for "order_refunded" event');

export type OrderRefundedMetadata = z.infer<typeof OrderRefundedMetadataSchema>;

/**
 * "order_cancelled" Event Metadata
 *
 * Fired when order is cancelled before fulfillment.
 */
export const OrderCancelledMetadataSchema = z.object({
  // Order
  shopifyOrderId: ShopifyOrderIdSchema.describe('Shopify Order ID'),
  orderNumber: z.string().describe('Order number'),

  // Cancellation
  cancelReason: CancelReasonSchema.describe('Cancellation reason'),
  note: z.string().optional().describe('Cancellation notes'),

  // Financial impact
  totalRefunded: z.number().nonnegative().optional()
    .describe('Amount refunded (if payment was captured)'),
  currency: z.string().length(3).optional().describe('Currency code'),

  // Restock
  restock: z.boolean().default(true).describe('Whether inventory was restocked'),

  // Email notification
  emailSent: z.boolean().optional().describe('Whether cancellation email was sent'),

  // Timestamps
  cancelledAt: z.string().datetime().describe('When order was cancelled'),
}).describe('Metadata for "order_cancelled" event');

export type OrderCancelledMetadata = z.infer<typeof OrderCancelledMetadataSchema>;

/**
 * "product_created" Event Metadata
 *
 * Fired when a new product is created.
 */
export const ProductCreatedMetadataSchema = z.object({
  // Product
  shopifyProductId: ShopifyProductIdSchema.describe('Shopify Product ID'),
  productHandle: z.string().describe('Product handle'),
  productTitle: z.string().describe('Product title'),
  productType: z.string().optional().describe('Product type'),
  vendor: z.string().optional().describe('Vendor'),

  // Variants
  variantCount: z.number().int().nonnegative().describe('Number of variants'),

  // Status
  status: z.enum(['active', 'archived', 'draft']).describe('Product status'),
  published: z.boolean().describe('Whether product is published'),

  // Timestamps
  shopifyCreatedAt: z.string().datetime().describe('Shopify creation timestamp'),
}).describe('Metadata for "product_created" event');

export type ProductCreatedMetadata = z.infer<typeof ProductCreatedMetadataSchema>;

/**
 * "product_updated" Event Metadata
 *
 * Fired when a product is updated.
 */
export const ProductUpdatedMetadataSchema = z.object({
  // Product
  shopifyProductId: ShopifyProductIdSchema.describe('Shopify Product ID'),
  productHandle: z.string().describe('Product handle'),
  productTitle: z.string().describe('Product title'),

  // Changed fields
  changedFields: z.array(z.string()).describe('List of fields that were updated'),

  // Previous values (optional snapshot)
  previousValues: z.record(z.string(), z.any()).optional()
    .describe('Previous field values'),

  // Timestamps
  shopifyUpdatedAt: z.string().datetime().describe('Shopify update timestamp'),
}).describe('Metadata for "product_updated" event');

export type ProductUpdatedMetadata = z.infer<typeof ProductUpdatedMetadataSchema>;

/**
 * "product_deleted" Event Metadata
 *
 * Fired when a product is deleted (soft delete).
 */
export const ProductDeletedMetadataSchema = z.object({
  // Product
  shopifyProductId: ShopifyProductIdSchema.describe('Shopify Product ID'),
  productHandle: z.string().describe('Product handle'),
  productTitle: z.string().describe('Product title'),

  // Deletion type
  deletionType: z.enum(['soft', 'hard']).default('soft')
    .describe('Whether this is a soft or hard delete'),

  // Timestamps
  deletedAt: z.string().datetime().describe('When product was deleted'),
}).describe('Metadata for "product_deleted" event');

export type ProductDeletedMetadata = z.infer<typeof ProductDeletedMetadataSchema>;

/**
 * "inventory_updated" Event Metadata
 *
 * Fired when inventory levels change.
 */
export const InventoryUpdatedMetadataSchema = z.object({
  // Variant
  shopifyVariantId: ShopifyVariantIdSchema.describe('Shopify Variant ID'),
  sku: z.string().optional().describe('SKU'),

  // Inventory change
  oldLevel: z.number().int().describe('Previous inventory level'),
  newLevel: z.number().int().describe('New inventory level'),
  delta: z.number().int().describe('Change amount (positive = increase, negative = decrease)'),

  // Location
  locationId: z.string().describe('Shopify Location ID'),
  locationName: z.string().optional().describe('Location name'),

  // Reason
  reason: z.enum(['restock', 'sale', 'damage', 'correction', 'promotion', 'received', 'other'])
    .optional()
    .describe('Reason for inventory change'),

  // Stock status
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock'])
    .optional()
    .describe('Computed stock status after change'),

  // Timestamps
  updatedAt: z.string().datetime().describe('When inventory was updated'),
}).describe('Metadata for "inventory_updated" event');

export type InventoryUpdatedMetadata = z.infer<typeof InventoryUpdatedMetadataSchema>;

/**
 * "cart_abandoned" Event Metadata
 *
 * Fired when a customer abandons their cart.
 */
export const CartAbandonedMetadataSchema = z.object({
  // Cart
  shopifyCartId: z.string().describe('Shopify Cart/Checkout ID'),
  cartToken: z.string().optional().describe('Cart token'),

  // Customer
  customerEmail: z.string().email().optional().describe('Customer email'),

  // Cart value
  cartValue: z.number().nonnegative().describe('Total cart value'),
  itemCount: z.number().int().positive().describe('Number of items in cart'),
  currency: z.string().length(3).toUpperCase().describe('Currency code'),

  // Items
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
  })).describe('Items in abandoned cart'),

  // Activity
  lastActivity: z.string().datetime().describe('Last cart activity timestamp'),
  createdAt: z.string().datetime().describe('When cart was created'),

  // Recovery
  recoveryUrl: z.string().url().optional().describe('Cart recovery URL'),
  recoveryEmailSent: z.boolean().optional()
    .describe('Whether recovery email was sent'),

  // Timestamps
  abandonedAt: z.string().datetime().describe('When cart was considered abandoned'),
}).describe('Metadata for "cart_abandoned" event');

export type CartAbandonedMetadata = z.infer<typeof CartAbandonedMetadataSchema>;

/**
 * "customer_created" Event Metadata
 *
 * Fired when a new customer is created.
 */
export const CustomerCreatedMetadataSchema = z.object({
  // Customer
  shopifyCustomerId: ShopifyCustomerIdSchema.describe('Shopify Customer ID'),
  email: z.string().email().describe('Customer email'),
  firstName: z.string().optional().describe('First name'),
  lastName: z.string().optional().describe('Last name'),

  // Account
  verified: z.boolean().describe('Whether email is verified'),
  accountCreationMethod: z.enum(['checkout', 'invite', 'admin', 'api'])
    .optional()
    .describe('How account was created'),

  // Marketing
  acceptsMarketing: z.boolean().describe('Marketing consent'),

  // Timestamps
  shopifyCreatedAt: z.string().datetime().describe('Shopify creation timestamp'),
}).describe('Metadata for "customer_created" event');

export type CustomerCreatedMetadata = z.infer<typeof CustomerCreatedMetadataSchema>;

// ============================================================================
// SHOPIFY-SPECIFIC METADATA
// ============================================================================

/**
 * Shopify ID Metadata (common fields)
 *
 * Used for storing Shopify identifiers across events and connections.
 */
export const ShopifyIdMetadataSchema = z.object({
  id: z.string().describe('Numeric Shopify ID'),
  gid: z.string().optional().describe('Global ID (gid://shopify/...)'),
  handle: z.string().optional().describe('URL-friendly handle'),
}).describe('Shopify identifier metadata');

export type ShopifyIdMetadata = z.infer<typeof ShopifyIdMetadataSchema>;

/**
 * Shopify Timestamp Metadata (common fields)
 *
 * Used for storing Shopify timestamps.
 */
export const ShopifyTimestampMetadataSchema = z.object({
  createdAt: z.string().datetime().describe('Shopify creation timestamp'),
  updatedAt: z.string().datetime().describe('Shopify update timestamp'),
  publishedAt: z.string().datetime().optional().describe('Shopify publication timestamp'),
}).describe('Shopify timestamp metadata');

export type ShopifyTimestampMetadata = z.infer<typeof ShopifyTimestampMetadataSchema>;

// ============================================================================
// DISCRIMINATED UNION TYPES
// ============================================================================

/**
 * All connection metadata types (discriminated union)
 */
export const ConnectionMetadataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('purchased'), data: PurchasedMetadataSchema }),
  z.object({ type: z.literal('in_cart'), data: InCartMetadataSchema }),
  z.object({ type: z.literal('variant_of'), data: VariantOfMetadataSchema }),
  z.object({ type: z.literal('belongs_to'), data: BelongsToMetadataSchema }),
  z.object({ type: z.literal('contains'), data: ContainsMetadataSchema }),
  z.object({ type: z.literal('fulfilled_by'), data: FulfilledByMetadataSchema }),
]);

export type ConnectionMetadata = z.infer<typeof ConnectionMetadataSchema>;

/**
 * All event metadata types (discriminated union)
 */
export const EventMetadataSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('order_placed'), data: OrderPlacedMetadataSchema }),
  z.object({ type: z.literal('payment_processed'), data: PaymentProcessedMetadataSchema }),
  z.object({ type: z.literal('order_fulfilled'), data: OrderFulfilledMetadataSchema }),
  z.object({ type: z.literal('order_refunded'), data: OrderRefundedMetadataSchema }),
  z.object({ type: z.literal('order_cancelled'), data: OrderCancelledMetadataSchema }),
  z.object({ type: z.literal('product_created'), data: ProductCreatedMetadataSchema }),
  z.object({ type: z.literal('product_updated'), data: ProductUpdatedMetadataSchema }),
  z.object({ type: z.literal('product_deleted'), data: ProductDeletedMetadataSchema }),
  z.object({ type: z.literal('inventory_updated'), data: InventoryUpdatedMetadataSchema }),
  z.object({ type: z.literal('cart_abandoned'), data: CartAbandonedMetadataSchema }),
  z.object({ type: z.literal('customer_created'), data: CustomerCreatedMetadataSchema }),
]);

export type EventMetadata = z.infer<typeof EventMetadataSchema>;
