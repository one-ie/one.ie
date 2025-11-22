/**
 * Shopify Event Type Definitions (Cycle 18)
 *
 * Complete TypeScript types for all Shopify event types mapped to ONE's Event dimension.
 * All types extend the base Event type from DataProvider and add Shopify-specific metadata.
 *
 * Based on Phase 1 research:
 * - /one/connections/shopify-complete-mapping.md
 * - /one/connections/shopify-order-flow.md
 */

import type { Event } from "@/types/data-provider";

// ============================================================================
// EVENT TYPE CONSTANTS
// ============================================================================

/**
 * Shopify-specific event types
 * Categorized by entity type for easier navigation
 */
export const SHOPIFY_EVENT_TYPES = {
	// Product events
	PRODUCT_CREATED: "product_created",
	PRODUCT_UPDATED: "product_updated",
	PRODUCT_DELETED: "product_deleted",
	PRODUCT_PUBLISHED: "product_published",
	PRODUCT_UNPUBLISHED: "product_unpublished",
	PRODUCT_VIEWED: "product_viewed",

	// Order events
	ORDER_PLACED: "order_placed",
	ORDER_UPDATED: "order_updated",
	ORDER_CONFIRMED: "order_confirmed",
	ORDER_FULFILLED: "order_fulfilled",
	ORDER_CANCELLED: "order_cancelled",
	ORDER_REFUNDED: "order_refunded",
	PAYMENT_PROCESSED: "payment_processed",
	PAYMENT_AUTHORIZED: "payment_authorized",
	PAYMENT_FAILED: "payment_failed",

	// Customer events
	CUSTOMER_REGISTERED: "customer_registered",
	CUSTOMER_UPDATED: "customer_updated",
	CUSTOMER_DELETED: "customer_deleted",
	CUSTOMER_ENABLED: "customer_enabled",
	CUSTOMER_DISABLED: "customer_disabled",

	// Cart events
	CART_CREATED: "cart_created",
	CART_UPDATED: "cart_updated",
	CART_ABANDONED: "cart_abandoned",
	ITEM_ADDED_TO_CART: "item_added_to_cart",
	ITEM_REMOVED_FROM_CART: "item_removed_from_cart",
	CHECKOUT_STARTED: "checkout_started",

	// Fulfillment events
	FULFILLMENT_CREATED: "fulfillment_created",
	FULFILLMENT_UPDATED: "fulfillment_updated",
	FULFILLMENT_SHIPPED: "fulfillment_shipped",
	FULFILLMENT_DELIVERED: "fulfillment_delivered",
	FULFILLMENT_CANCELLED: "fulfillment_cancelled",

	// Inventory events
	INVENTORY_ADJUSTED: "inventory_adjusted",
	INVENTORY_RESTOCKED: "inventory_restocked",
	INVENTORY_LOW_STOCK: "inventory_low_stock",

	// Collection events
	COLLECTION_CREATED: "collection_created",
	COLLECTION_UPDATED: "collection_updated",
	COLLECTION_DELETED: "collection_deleted",
	PRODUCT_ADDED_TO_COLLECTION: "product_added_to_collection",
	PRODUCT_REMOVED_FROM_COLLECTION: "product_removed_from_collection",
} as const;

export type ShopifyEventType =
	(typeof SHOPIFY_EVENT_TYPES)[keyof typeof SHOPIFY_EVENT_TYPES];

// ============================================================================
// PRODUCT EVENTS
// ============================================================================

/**
 * Product Created event metadata
 */
export interface ProductCreatedEventMetadata {
	/** Shopify webhook ID */
	shopifyWebhookId?: string;

	/** Shopify product ID */
	shopifyProductId: string;

	/** Product title */
	productTitle: string;

	/** Product type/category */
	productType?: string;

	/** Vendor/brand */
	vendor?: string;

	/** Product handle (slug) */
	handle: string;
}

/**
 * Product Created event
 *
 * @example
 * ```typescript
 * const event: ProductCreatedEvent = {
 *   _id: "k700...",
 *   type: "product_created",
 *   actorId: "k999...",  // Staff member
 *   targetId: "k123...", // Product Thing
 *   groupId: "k999...",
 *   timestamp: 1700000000000,
 *   metadata: {
 *     shopifyWebhookId: "webhook-123",
 *     shopifyProductId: "gid://shopify/Product/123",
 *     productTitle: "Awesome T-Shirt",
 *     productType: "Apparel",
 *     vendor: "My Brand",
 *     handle: "awesome-t-shirt"
 *   }
 * };
 * ```
 */
export interface ProductCreatedEvent extends Event {
	type: "product_created";
	metadata: ProductCreatedEventMetadata;
}

/**
 * Product Updated event metadata
 */
export interface ProductUpdatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyProductId: string;
	/** Fields that were changed */
	changes?: Record<string, { old: unknown; new: unknown }>;
}

/**
 * Product Updated event
 */
export interface ProductUpdatedEvent extends Event {
	type: "product_updated";
	metadata: ProductUpdatedEventMetadata;
}

/**
 * Product Deleted event metadata
 */
export interface ProductDeletedEventMetadata {
	shopifyWebhookId?: string;
	shopifyProductId: string;
	productTitle: string;
}

/**
 * Product Deleted event
 */
export interface ProductDeletedEvent extends Event {
	type: "product_deleted";
	metadata: ProductDeletedEventMetadata;
}

/**
 * Product Published event metadata
 */
export interface ProductPublishedEventMetadata {
	shopifyProductId: string;
	publishedAt: string;
}

/**
 * Product Published event
 */
export interface ProductPublishedEvent extends Event {
	type: "product_published";
	metadata: ProductPublishedEventMetadata;
}

/**
 * Product Unpublished event metadata
 */
export interface ProductUnpublishedEventMetadata {
	shopifyProductId: string;
	unpublishedAt: string;
}

/**
 * Product Unpublished event
 */
export interface ProductUnpublishedEvent extends Event {
	type: "product_unpublished";
	metadata: ProductUnpublishedEventMetadata;
}

/**
 * Product Viewed event metadata (client-side tracking)
 */
export interface ProductViewedEventMetadata {
	shopifyProductId: string;
	productTitle: string;
	/** Referrer URL */
	referrer?: string;
	/** User agent string */
	userAgent?: string;
	/** View duration in seconds */
	duration?: number;
}

/**
 * Product Viewed event
 */
export interface ProductViewedEvent extends Event {
	type: "product_viewed";
	metadata: ProductViewedEventMetadata;
}

// ============================================================================
// ORDER EVENTS
// ============================================================================

/**
 * Order line item summary
 */
export interface OrderLineItemSummary {
	productId: string;
	variantId: string;
	quantity: number;
	price: number;
}

/**
 * Order Placed event metadata
 */
export interface OrderPlacedEventMetadata {
	shopifyWebhookId?: string;
	shopifyOrderId: string;
	orderNumber: string;
	orderName: string;

	customerEmail?: string;
	customerPhone?: string;

	/** Financial summary */
	subtotal: number;
	tax: number;
	shipping: number;
	discount: number;
	total: number;
	currency: string;

	/** Line items summary */
	itemCount: number;
	lineItems: OrderLineItemSummary[];

	/** Addresses */
	shippingAddress?: {
		address1?: string;
		city?: string;
		province?: string;
		country?: string;
		zip?: string;
	};
	billingAddress?: {
		address1?: string;
		city?: string;
		province?: string;
		country?: string;
		zip?: string;
	};

	/** Flags */
	isTest: boolean;
	confirmed: boolean;

	/** Shopify timestamps */
	shopifyCreatedAt: string;
	shopifyProcessedAt: string;
}

/**
 * Order Placed event
 *
 * @example
 * ```typescript
 * const event: OrderPlacedEvent = {
 *   _id: "k600...",
 *   type: "order_placed",
 *   actorId: "k777...",  // Customer
 *   targetId: "k789...", // Order Thing
 *   groupId: "k999...",
 *   timestamp: 1732269600000,
 *   metadata: {
 *     shopifyWebhookId: "webhook-200",
 *     shopifyOrderId: "5555555555",
 *     orderNumber: "#1001",
 *     orderName: "1001",
 *     customerEmail: "customer@example.com",
 *     subtotal: 39.98,
 *     tax: 3.20,
 *     shipping: 5.00,
 *     discount: 0,
 *     total: 48.18,
 *     currency: "USD",
 *     itemCount: 2,
 *     lineItems: [
 *       { productId: "123", variantId: "456", quantity: 2, price: 39.98 }
 *     ],
 *     isTest: false,
 *     confirmed: true,
 *     shopifyCreatedAt: "2024-11-22T10:00:00Z",
 *     shopifyProcessedAt: "2024-11-22T10:00:00Z"
 *   }
 * };
 * ```
 */
export interface OrderPlacedEvent extends Event {
	type: "order_placed";
	metadata: OrderPlacedEventMetadata;
}

/**
 * Order Updated event metadata
 */
export interface OrderUpdatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyOrderId: string;
	orderNumber: string;
	changes?: Record<string, { old: unknown; new: unknown }>;
}

/**
 * Order Updated event
 */
export interface OrderUpdatedEvent extends Event {
	type: "order_updated";
	metadata: OrderUpdatedEventMetadata;
}

/**
 * Order Confirmed event metadata
 */
export interface OrderConfirmedEventMetadata {
	shopifyOrderId: string;
	orderNumber: string;
	confirmedAt: string;
}

/**
 * Order Confirmed event
 */
export interface OrderConfirmedEvent extends Event {
	type: "order_confirmed";
	metadata: OrderConfirmedEventMetadata;
}

/**
 * Order Fulfilled event metadata
 */
export interface OrderFulfilledEventMetadata {
	shopifyWebhookId?: string;
	shopifyOrderId: string;
	orderNumber: string;

	shopifyFulfillmentId: string;
	fulfillmentStatus: "success" | "cancelled" | "error";

	/** Tracking information */
	trackingCompany?: string;
	trackingNumber?: string;
	trackingUrl?: string;

	/** Line items fulfilled */
	lineItemsFulfilled: Array<{
		lineItemId: string;
		quantity: number;
	}>;

	fulfilledAt: string;
	deliveredAt?: string;
}

/**
 * Order Fulfilled event
 */
export interface OrderFulfilledEvent extends Event {
	type: "order_fulfilled";
	metadata: OrderFulfilledEventMetadata;
}

/**
 * Order Cancelled event metadata
 */
export interface OrderCancelledEventMetadata {
	shopifyWebhookId?: string;
	shopifyOrderId: string;
	orderNumber: string;
	cancelReason: "customer" | "fraud" | "inventory" | "declined" | "other";
	note?: string;
	cancelledAt: string;
}

/**
 * Order Cancelled event
 */
export interface OrderCancelledEvent extends Event {
	type: "order_cancelled";
	metadata: OrderCancelledEventMetadata;
}

/**
 * Order Refunded event metadata
 */
export interface OrderRefundedEventMetadata {
	shopifyWebhookId?: string;
	shopifyOrderId: string;
	orderNumber: string;

	shopifyRefundId: string;
	refundAmount: number;
	currency: string;
	refundReason?: string;
	note?: string;

	/** Line items refunded */
	lineItemsRefunded: Array<{
		lineItemId: string;
		quantity: number;
		amount: number;
	}>;

	/** Refund transactions */
	refundTransactions: Array<{
		transactionId: string;
		amount: number;
		gateway: string;
	}>;

	refundedAt: string;
}

/**
 * Order Refunded event
 */
export interface OrderRefundedEvent extends Event {
	type: "order_refunded";
	metadata: OrderRefundedEventMetadata;
}

/**
 * Payment Processed event metadata
 */
export interface PaymentProcessedEventMetadata {
	shopifyWebhookId?: string;
	shopifyOrderId: string;
	orderNumber: string;

	shopifyTransactionId: string;
	transactionKind: "sale" | "capture" | "authorization";
	transactionStatus: "success" | "pending" | "failure";

	amount: number;
	currency: string;
	gateway: string;

	processedAt: string;
}

/**
 * Payment Processed event
 */
export interface PaymentProcessedEvent extends Event {
	type: "payment_processed";
	metadata: PaymentProcessedEventMetadata;
}

/**
 * Payment Authorized event metadata
 */
export interface PaymentAuthorizedEventMetadata {
	shopifyOrderId: string;
	orderNumber: string;
	shopifyTransactionId: string;
	amount: number;
	currency: string;
	gateway: string;
	authorizedAt: string;
}

/**
 * Payment Authorized event
 */
export interface PaymentAuthorizedEvent extends Event {
	type: "payment_authorized";
	metadata: PaymentAuthorizedEventMetadata;
}

/**
 * Payment Failed event metadata
 */
export interface PaymentFailedEventMetadata {
	shopifyOrderId: string;
	orderNumber: string;
	shopifyTransactionId: string;
	amount: number;
	currency: string;
	gateway: string;
	errorMessage?: string;
	failedAt: string;
}

/**
 * Payment Failed event
 */
export interface PaymentFailedEvent extends Event {
	type: "payment_failed";
	metadata: PaymentFailedEventMetadata;
}

// ============================================================================
// CUSTOMER EVENTS
// ============================================================================

/**
 * Customer Registered event metadata
 */
export interface CustomerRegisteredEventMetadata {
	shopifyWebhookId?: string;
	shopifyCustomerId: string;
	email?: string;
	phone?: string;
	accountState: "enabled" | "disabled" | "invited" | "declined";
	marketingOptIn: boolean;
	shopifyCreatedAt: string;
}

/**
 * Customer Registered event
 *
 * @example
 * ```typescript
 * const event: CustomerRegisteredEvent = {
 *   _id: "k900...",
 *   type: "customer_registered",
 *   actorId: "k777...",  // Customer (self-registration)
 *   groupId: "k999...",
 *   timestamp: 1660139400000,
 *   metadata: {
 *     shopifyWebhookId: "webhook-400",
 *     shopifyCustomerId: "7777777777",
 *     email: "john.doe@example.com",
 *     phone: "+12025551234",
 *     accountState: "enabled",
 *     marketingOptIn: true,
 *     shopifyCreatedAt: "2022-08-10T14:30:00Z"
 *   }
 * };
 * ```
 */
export interface CustomerRegisteredEvent extends Event {
	type: "customer_registered";
	metadata: CustomerRegisteredEventMetadata;
}

/**
 * Customer Updated event metadata
 */
export interface CustomerUpdatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyCustomerId: string;
	changes?: Record<string, { old: unknown; new: unknown }>;
}

/**
 * Customer Updated event
 */
export interface CustomerUpdatedEvent extends Event {
	type: "customer_updated";
	metadata: CustomerUpdatedEventMetadata;
}

/**
 * Customer Deleted event metadata
 */
export interface CustomerDeletedEventMetadata {
	shopifyWebhookId?: string;
	shopifyCustomerId: string;
	email?: string;
}

/**
 * Customer Deleted event
 */
export interface CustomerDeletedEvent extends Event {
	type: "customer_deleted";
	metadata: CustomerDeletedEventMetadata;
}

/**
 * Customer Enabled event metadata
 */
export interface CustomerEnabledEventMetadata {
	shopifyCustomerId: string;
	enabledAt: string;
}

/**
 * Customer Enabled event
 */
export interface CustomerEnabledEvent extends Event {
	type: "customer_enabled";
	metadata: CustomerEnabledEventMetadata;
}

/**
 * Customer Disabled event metadata
 */
export interface CustomerDisabledEventMetadata {
	shopifyCustomerId: string;
	disabledAt: string;
	reason?: string;
}

/**
 * Customer Disabled event
 */
export interface CustomerDisabledEvent extends Event {
	type: "customer_disabled";
	metadata: CustomerDisabledEventMetadata;
}

// ============================================================================
// CART EVENTS
// ============================================================================

/**
 * Cart Created event metadata
 */
export interface CartCreatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyCheckoutId: string;
	cartToken: string;
	itemCount: number;
}

/**
 * Cart Created event
 */
export interface CartCreatedEvent extends Event {
	type: "cart_created";
	metadata: CartCreatedEventMetadata;
}

/**
 * Cart Updated event metadata
 */
export interface CartUpdatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyCheckoutId: string;
	cartToken: string;
	addedItems?: Array<{ productId: string; variantId: string; quantity: number }>;
	removedItems?: Array<{
		productId: string;
		variantId: string;
		quantity: number;
	}>;
}

/**
 * Cart Updated event
 */
export interface CartUpdatedEvent extends Event {
	type: "cart_updated";
	metadata: CartUpdatedEventMetadata;
}

/**
 * Cart Abandoned event metadata
 */
export interface CartAbandonedEventMetadata {
	shopifyCheckoutId: string;
	cartToken: string;
	abandonedAt: string;
	cartValue: number;
	itemCount: number;
	email?: string;
	recoveryUrl?: string;
}

/**
 * Cart Abandoned event
 */
export interface CartAbandonedEvent extends Event {
	type: "cart_abandoned";
	metadata: CartAbandonedEventMetadata;
}

/**
 * Item Added to Cart event metadata
 */
export interface ItemAddedToCartEventMetadata {
	shopifyCheckoutId: string;
	cartToken: string;
	productId: string;
	variantId: string;
	quantity: number;
	price: number;
}

/**
 * Item Added to Cart event
 */
export interface ItemAddedToCartEvent extends Event {
	type: "item_added_to_cart";
	metadata: ItemAddedToCartEventMetadata;
}

/**
 * Item Removed from Cart event metadata
 */
export interface ItemRemovedFromCartEventMetadata {
	shopifyCheckoutId: string;
	cartToken: string;
	productId: string;
	variantId: string;
	quantity: number;
}

/**
 * Item Removed from Cart event
 */
export interface ItemRemovedFromCartEvent extends Event {
	type: "item_removed_from_cart";
	metadata: ItemRemovedFromCartEventMetadata;
}

/**
 * Checkout Started event metadata
 */
export interface CheckoutStartedEventMetadata {
	shopifyCheckoutId: string;
	cartToken: string;
	totalPrice: number;
	currency: string;
	itemCount: number;
}

/**
 * Checkout Started event
 */
export interface CheckoutStartedEvent extends Event {
	type: "checkout_started";
	metadata: CheckoutStartedEventMetadata;
}

// ============================================================================
// FULFILLMENT EVENTS
// ============================================================================

/**
 * Fulfillment Created event metadata
 */
export interface FulfillmentCreatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyFulfillmentId: string;
	shopifyOrderId: string;
	orderNumber: string;
	trackingNumber?: string;
	trackingCompany?: string;
}

/**
 * Fulfillment Created event
 */
export interface FulfillmentCreatedEvent extends Event {
	type: "fulfillment_created";
	metadata: FulfillmentCreatedEventMetadata;
}

/**
 * Fulfillment Updated event metadata
 */
export interface FulfillmentUpdatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyFulfillmentId: string;
	shipmentStatus?: "in_transit" | "out_for_delivery" | "delivered" | "failure";
	deliveredAt?: string;
}

/**
 * Fulfillment Updated event
 */
export interface FulfillmentUpdatedEvent extends Event {
	type: "fulfillment_updated";
	metadata: FulfillmentUpdatedEventMetadata;
}

/**
 * Fulfillment Shipped event metadata
 */
export interface FulfillmentShippedEventMetadata {
	shopifyFulfillmentId: string;
	shopifyOrderId: string;
	trackingNumber?: string;
	trackingCompany?: string;
	trackingUrl?: string;
	shippedAt: string;
}

/**
 * Fulfillment Shipped event
 */
export interface FulfillmentShippedEvent extends Event {
	type: "fulfillment_shipped";
	metadata: FulfillmentShippedEventMetadata;
}

/**
 * Fulfillment Delivered event metadata
 */
export interface FulfillmentDeliveredEventMetadata {
	shopifyFulfillmentId: string;
	shopifyOrderId: string;
	deliveredAt: string;
}

/**
 * Fulfillment Delivered event
 */
export interface FulfillmentDeliveredEvent extends Event {
	type: "fulfillment_delivered";
	metadata: FulfillmentDeliveredEventMetadata;
}

/**
 * Fulfillment Cancelled event metadata
 */
export interface FulfillmentCancelledEventMetadata {
	shopifyFulfillmentId: string;
	shopifyOrderId: string;
	cancelledAt: string;
	reason?: string;
}

/**
 * Fulfillment Cancelled event
 */
export interface FulfillmentCancelledEvent extends Event {
	type: "fulfillment_cancelled";
	metadata: FulfillmentCancelledEventMetadata;
}

// ============================================================================
// INVENTORY EVENTS
// ============================================================================

/**
 * Inventory Adjusted event metadata
 */
export interface InventoryAdjustedEventMetadata {
	shopifyWebhookId?: string;
	shopifyVariantId: string;
	locationId: string;
	oldQuantity: number;
	newQuantity: number;
	reason: "sold" | "damaged" | "returned" | "adjustment" | "restocked";
}

/**
 * Inventory Adjusted event
 */
export interface InventoryAdjustedEvent extends Event {
	type: "inventory_adjusted";
	metadata: InventoryAdjustedEventMetadata;
}

/**
 * Inventory Restocked event metadata
 */
export interface InventoryRestockedEventMetadata {
	shopifyVariantId: string;
	locationId: string;
	quantityAdded: number;
	newQuantity: number;
	restockedAt: string;
}

/**
 * Inventory Restocked event
 */
export interface InventoryRestockedEvent extends Event {
	type: "inventory_restocked";
	metadata: InventoryRestockedEventMetadata;
}

/**
 * Inventory Low Stock event metadata
 */
export interface InventoryLowStockEventMetadata {
	shopifyVariantId: string;
	locationId: string;
	currentQuantity: number;
	threshold: number;
}

/**
 * Inventory Low Stock event
 */
export interface InventoryLowStockEvent extends Event {
	type: "inventory_low_stock";
	metadata: InventoryLowStockEventMetadata;
}

// ============================================================================
// COLLECTION EVENTS
// ============================================================================

/**
 * Collection Created event metadata
 */
export interface CollectionCreatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyCollectionId: string;
	collectionTitle: string;
	collectionHandle: string;
}

/**
 * Collection Created event
 */
export interface CollectionCreatedEvent extends Event {
	type: "collection_created";
	metadata: CollectionCreatedEventMetadata;
}

/**
 * Collection Updated event metadata
 */
export interface CollectionUpdatedEventMetadata {
	shopifyWebhookId?: string;
	shopifyCollectionId: string;
	changes?: Record<string, { old: unknown; new: unknown }>;
}

/**
 * Collection Updated event
 */
export interface CollectionUpdatedEvent extends Event {
	type: "collection_updated";
	metadata: CollectionUpdatedEventMetadata;
}

/**
 * Collection Deleted event metadata
 */
export interface CollectionDeletedEventMetadata {
	shopifyWebhookId?: string;
	shopifyCollectionId: string;
	collectionTitle: string;
}

/**
 * Collection Deleted event
 */
export interface CollectionDeletedEvent extends Event {
	type: "collection_deleted";
	metadata: CollectionDeletedEventMetadata;
}

/**
 * Product Added to Collection event metadata
 */
export interface ProductAddedToCollectionEventMetadata {
	shopifyCollectionId: string;
	shopifyProductId: string;
	position?: number;
}

/**
 * Product Added to Collection event
 */
export interface ProductAddedToCollectionEvent extends Event {
	type: "product_added_to_collection";
	metadata: ProductAddedToCollectionEventMetadata;
}

/**
 * Product Removed from Collection event metadata
 */
export interface ProductRemovedFromCollectionEventMetadata {
	shopifyCollectionId: string;
	shopifyProductId: string;
}

/**
 * Product Removed from Collection event
 */
export interface ProductRemovedFromCollectionEvent extends Event {
	type: "product_removed_from_collection";
	metadata: ProductRemovedFromCollectionEventMetadata;
}

// ============================================================================
// UNION TYPE FOR ALL SHOPIFY EVENTS
// ============================================================================

/**
 * Union type of all Shopify Event types
 * Use for type narrowing and pattern matching
 */
export type ShopifyEvent =
	| ProductCreatedEvent
	| ProductUpdatedEvent
	| ProductDeletedEvent
	| ProductPublishedEvent
	| ProductUnpublishedEvent
	| ProductViewedEvent
	| OrderPlacedEvent
	| OrderUpdatedEvent
	| OrderConfirmedEvent
	| OrderFulfilledEvent
	| OrderCancelledEvent
	| OrderRefundedEvent
	| PaymentProcessedEvent
	| PaymentAuthorizedEvent
	| PaymentFailedEvent
	| CustomerRegisteredEvent
	| CustomerUpdatedEvent
	| CustomerDeletedEvent
	| CustomerEnabledEvent
	| CustomerDisabledEvent
	| CartCreatedEvent
	| CartUpdatedEvent
	| CartAbandonedEvent
	| ItemAddedToCartEvent
	| ItemRemovedFromCartEvent
	| CheckoutStartedEvent
	| FulfillmentCreatedEvent
	| FulfillmentUpdatedEvent
	| FulfillmentShippedEvent
	| FulfillmentDeliveredEvent
	| FulfillmentCancelledEvent
	| InventoryAdjustedEvent
	| InventoryRestockedEvent
	| InventoryLowStockEvent
	| CollectionCreatedEvent
	| CollectionUpdatedEvent
	| CollectionDeletedEvent
	| ProductAddedToCollectionEvent
	| ProductRemovedFromCollectionEvent;

/**
 * Map of event types to their metadata schemas
 */
export interface ShopifyEventMetadataMap {
	product_created: ProductCreatedEventMetadata;
	product_updated: ProductUpdatedEventMetadata;
	product_deleted: ProductDeletedEventMetadata;
	product_published: ProductPublishedEventMetadata;
	product_unpublished: ProductUnpublishedEventMetadata;
	product_viewed: ProductViewedEventMetadata;
	order_placed: OrderPlacedEventMetadata;
	order_updated: OrderUpdatedEventMetadata;
	order_confirmed: OrderConfirmedEventMetadata;
	order_fulfilled: OrderFulfilledEventMetadata;
	order_cancelled: OrderCancelledEventMetadata;
	order_refunded: OrderRefundedEventMetadata;
	payment_processed: PaymentProcessedEventMetadata;
	payment_authorized: PaymentAuthorizedEventMetadata;
	payment_failed: PaymentFailedEventMetadata;
	customer_registered: CustomerRegisteredEventMetadata;
	customer_updated: CustomerUpdatedEventMetadata;
	customer_deleted: CustomerDeletedEventMetadata;
	customer_enabled: CustomerEnabledEventMetadata;
	customer_disabled: CustomerDisabledEventMetadata;
	cart_created: CartCreatedEventMetadata;
	cart_updated: CartUpdatedEventMetadata;
	cart_abandoned: CartAbandonedEventMetadata;
	item_added_to_cart: ItemAddedToCartEventMetadata;
	item_removed_from_cart: ItemRemovedFromCartEventMetadata;
	checkout_started: CheckoutStartedEventMetadata;
	fulfillment_created: FulfillmentCreatedEventMetadata;
	fulfillment_updated: FulfillmentUpdatedEventMetadata;
	fulfillment_shipped: FulfillmentShippedEventMetadata;
	fulfillment_delivered: FulfillmentDeliveredEventMetadata;
	fulfillment_cancelled: FulfillmentCancelledEventMetadata;
	inventory_adjusted: InventoryAdjustedEventMetadata;
	inventory_restocked: InventoryRestockedEventMetadata;
	inventory_low_stock: InventoryLowStockEventMetadata;
	collection_created: CollectionCreatedEventMetadata;
	collection_updated: CollectionUpdatedEventMetadata;
	collection_deleted: CollectionDeletedEventMetadata;
	product_added_to_collection: ProductAddedToCollectionEventMetadata;
	product_removed_from_collection: ProductRemovedFromCollectionEventMetadata;
}

/**
 * Helper type to get metadata type for an event type
 */
export type MetadataForEventType<T extends ShopifyEventType> =
	T extends keyof ShopifyEventMetadataMap ? ShopifyEventMetadataMap[T] : never;

/**
 * Event categories for organization and filtering
 */
export const SHOPIFY_EVENT_CATEGORIES = {
	PRODUCT: [
		"product_created",
		"product_updated",
		"product_deleted",
		"product_published",
		"product_unpublished",
		"product_viewed",
	],
	ORDER: [
		"order_placed",
		"order_updated",
		"order_confirmed",
		"order_fulfilled",
		"order_cancelled",
		"order_refunded",
	],
	PAYMENT: ["payment_processed", "payment_authorized", "payment_failed"],
	CUSTOMER: [
		"customer_registered",
		"customer_updated",
		"customer_deleted",
		"customer_enabled",
		"customer_disabled",
	],
	CART: [
		"cart_created",
		"cart_updated",
		"cart_abandoned",
		"item_added_to_cart",
		"item_removed_from_cart",
		"checkout_started",
	],
	FULFILLMENT: [
		"fulfillment_created",
		"fulfillment_updated",
		"fulfillment_shipped",
		"fulfillment_delivered",
		"fulfillment_cancelled",
	],
	INVENTORY: [
		"inventory_adjusted",
		"inventory_restocked",
		"inventory_low_stock",
	],
	COLLECTION: [
		"collection_created",
		"collection_updated",
		"collection_deleted",
		"product_added_to_collection",
		"product_removed_from_collection",
	],
} as const;

/**
 * Helper to check if event belongs to a category
 */
export function isEventInCategory(
	eventType: string,
	category: keyof typeof SHOPIFY_EVENT_CATEGORIES,
): boolean {
	return SHOPIFY_EVENT_CATEGORIES[category].includes(
		eventType as ShopifyEventType,
	);
}
