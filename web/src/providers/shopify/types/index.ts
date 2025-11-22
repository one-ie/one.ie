/**
 * Shopify Type Definitions - Barrel Export
 *
 * Complete type system for Shopify integration with ONE Platform.
 * Includes Thing types, Connection types, Event types, type guards, and utilities.
 *
 * Usage:
 * ```typescript
 * import {
 *   ShopifyProduct,
 *   ShopifyProductVariant,
 *   isShopifyProduct,
 *   isPurchasedConnection,
 *   SHOPIFY_EVENT_TYPES
 * } from '@/providers/shopify/types';
 * ```
 */

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Thing types
export * from "./things";
export type {
	ShopifyProduct,
	ShopifyProductVariant,
	ShopifyOrder,
	ShopifyCheckout,
	ShopifyDiscount,
	ShopifyGiftCard,
	ShopifyFulfillment,
	ShopifyRefund,
	ShopifyThing,
	ShopifyThingType,
	ShopifyThingTypeMap,
	ShopifyProductProperties,
	ShopifyProductVariantProperties,
	ShopifyOrderProperties,
	ShopifyCheckoutProperties,
	ShopifyDiscountProperties,
	ShopifyGiftCardProperties,
	ShopifyFulfillmentProperties,
	ShopifyRefundProperties,
	ProductOption,
	ProductImage,
	ProductPriceRange,
	ProductSEO,
	SelectedOption,
	VariantImage,
	MailingAddress,
	ShippingLine,
	TaxLine,
	DiscountCode,
	RefundLineItem,
	RefundTransaction,
} from "./things";

// Connection types
export * from "./connections";
export type {
	ShopifyConnection,
	ShopifyConnectionType,
	PurchasedConnection,
	InCartConnection,
	BelongsToConnection,
	ContainsConnection,
	VariantOfConnection,
	FulfilledByConnection,
	RefundedByConnection,
	DiscountedByConnection,
	PaidWithConnection,
	FavoritedConnection,
	OwnsGiftCardConnection,
	PurchasedConnectionMetadata,
	InCartConnectionMetadata,
	BelongsToConnectionMetadata,
	ContainsConnectionMetadata,
	VariantOfConnectionMetadata,
	FulfilledByConnectionMetadata,
	RefundedByConnectionMetadata,
	DiscountedByConnectionMetadata,
	PaidWithConnectionMetadata,
	FavoritedConnectionMetadata,
	OwnsGiftCardConnectionMetadata,
	ShopifyConnectionMetadataMap,
	MetadataForConnectionType,
} from "./connections";
export { SHOPIFY_CONNECTION_TYPES } from "./connections";

// Event types
export * from "./events";
export type {
	ShopifyEvent,
	ShopifyEventType,
	ProductCreatedEvent,
	ProductUpdatedEvent,
	ProductDeletedEvent,
	ProductPublishedEvent,
	ProductUnpublishedEvent,
	ProductViewedEvent,
	OrderPlacedEvent,
	OrderUpdatedEvent,
	OrderConfirmedEvent,
	OrderFulfilledEvent,
	OrderCancelledEvent,
	OrderRefundedEvent,
	PaymentProcessedEvent,
	PaymentAuthorizedEvent,
	PaymentFailedEvent,
	CustomerRegisteredEvent,
	CustomerUpdatedEvent,
	CustomerDeletedEvent,
	CustomerEnabledEvent,
	CustomerDisabledEvent,
	CartCreatedEvent,
	CartUpdatedEvent,
	CartAbandonedEvent,
	ItemAddedToCartEvent,
	ItemRemovedFromCartEvent,
	CheckoutStartedEvent,
	FulfillmentCreatedEvent,
	FulfillmentUpdatedEvent,
	FulfillmentShippedEvent,
	FulfillmentDeliveredEvent,
	FulfillmentCancelledEvent,
	InventoryAdjustedEvent,
	InventoryRestockedEvent,
	InventoryLowStockEvent,
	CollectionCreatedEvent,
	CollectionUpdatedEvent,
	CollectionDeletedEvent,
	ProductAddedToCollectionEvent,
	ProductRemovedFromCollectionEvent,
	ShopifyEventMetadataMap,
	MetadataForEventType,
} from "./events";
export { SHOPIFY_EVENT_TYPES, SHOPIFY_EVENT_CATEGORIES } from "./events";

// ============================================================================
// TYPE GUARDS - THINGS
// ============================================================================

import type { Thing } from "@/types/data-provider";
import type {
	ShopifyProduct,
	ShopifyProductVariant,
	ShopifyOrder,
	ShopifyCheckout,
	ShopifyDiscount,
	ShopifyGiftCard,
	ShopifyFulfillment,
	ShopifyRefund,
	ShopifyThing,
	ShopifyThingType,
} from "./things";

/**
 * Type guard to check if a Thing is a ShopifyProduct
 */
export function isShopifyProduct(thing: Thing): thing is ShopifyProduct {
	return thing.type === "product";
}

/**
 * Type guard to check if a Thing is a ShopifyProductVariant
 */
export function isShopifyProductVariant(
	thing: Thing,
): thing is ShopifyProductVariant {
	return thing.type === "product_variant";
}

/**
 * Type guard to check if a Thing is a ShopifyOrder
 */
export function isShopifyOrder(thing: Thing): thing is ShopifyOrder {
	return thing.type === "order";
}

/**
 * Type guard to check if a Thing is a ShopifyCheckout
 */
export function isShopifyCheckout(thing: Thing): thing is ShopifyCheckout {
	return thing.type === "checkout";
}

/**
 * Type guard to check if a Thing is a ShopifyDiscount
 */
export function isShopifyDiscount(thing: Thing): thing is ShopifyDiscount {
	return thing.type === "discount";
}

/**
 * Type guard to check if a Thing is a ShopifyGiftCard
 */
export function isShopifyGiftCard(thing: Thing): thing is ShopifyGiftCard {
	return thing.type === "gift_card";
}

/**
 * Type guard to check if a Thing is a ShopifyFulfillment
 */
export function isShopifyFulfillment(
	thing: Thing,
): thing is ShopifyFulfillment {
	return thing.type === "fulfillment";
}

/**
 * Type guard to check if a Thing is a ShopifyRefund
 */
export function isShopifyRefund(thing: Thing): thing is ShopifyRefund {
	return thing.type === "refund";
}

/**
 * Type guard to check if a Thing is any Shopify entity
 */
export function isShopifyThing(thing: Thing): thing is ShopifyThing {
	const shopifyTypes: ShopifyThingType[] = [
		"product",
		"product_variant",
		"order",
		"checkout",
		"discount",
		"gift_card",
		"fulfillment",
		"refund",
	];
	return shopifyTypes.includes(thing.type as ShopifyThingType);
}

// ============================================================================
// TYPE GUARDS - CONNECTIONS
// ============================================================================

import type { Connection } from "@/types/data-provider";
import type {
	ShopifyConnection,
	ShopifyConnectionType,
	PurchasedConnection,
	InCartConnection,
	BelongsToConnection,
	ContainsConnection,
	VariantOfConnection,
	FulfilledByConnection,
	RefundedByConnection,
	DiscountedByConnection,
	PaidWithConnection,
	FavoritedConnection,
	OwnsGiftCardConnection,
} from "./connections";
import { SHOPIFY_CONNECTION_TYPES } from "./connections";

/**
 * Type guard to check if a Connection is a PurchasedConnection
 */
export function isPurchasedConnection(
	connection: Connection,
): connection is PurchasedConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.PURCHASED;
}

/**
 * Type guard to check if a Connection is an InCartConnection
 */
export function isInCartConnection(
	connection: Connection,
): connection is InCartConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.IN_CART;
}

/**
 * Type guard to check if a Connection is a BelongsToConnection
 */
export function isBelongsToConnection(
	connection: Connection,
): connection is BelongsToConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.BELONGS_TO;
}

/**
 * Type guard to check if a Connection is a ContainsConnection
 */
export function isContainsConnection(
	connection: Connection,
): connection is ContainsConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.CONTAINS;
}

/**
 * Type guard to check if a Connection is a VariantOfConnection
 */
export function isVariantOfConnection(
	connection: Connection,
): connection is VariantOfConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.VARIANT_OF;
}

/**
 * Type guard to check if a Connection is a FulfilledByConnection
 */
export function isFulfilledByConnection(
	connection: Connection,
): connection is FulfilledByConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.FULFILLED_BY;
}

/**
 * Type guard to check if a Connection is a RefundedByConnection
 */
export function isRefundedByConnection(
	connection: Connection,
): connection is RefundedByConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.REFUNDED_BY;
}

/**
 * Type guard to check if a Connection is a DiscountedByConnection
 */
export function isDiscountedByConnection(
	connection: Connection,
): connection is DiscountedByConnection {
	return (
		connection.relationshipType === SHOPIFY_CONNECTION_TYPES.DISCOUNTED_BY
	);
}

/**
 * Type guard to check if a Connection is a PaidWithConnection
 */
export function isPaidWithConnection(
	connection: Connection,
): connection is PaidWithConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.PAID_WITH;
}

/**
 * Type guard to check if a Connection is a FavoritedConnection
 */
export function isFavoritedConnection(
	connection: Connection,
): connection is FavoritedConnection {
	return connection.relationshipType === SHOPIFY_CONNECTION_TYPES.FAVORITED;
}

/**
 * Type guard to check if a Connection is an OwnsGiftCardConnection
 */
export function isOwnsGiftCardConnection(
	connection: Connection,
): connection is OwnsGiftCardConnection {
	return (
		connection.relationshipType === SHOPIFY_CONNECTION_TYPES.OWNS_GIFT_CARD
	);
}

/**
 * Type guard to check if a Connection is any Shopify connection
 */
export function isShopifyConnection(
	connection: Connection,
): connection is ShopifyConnection {
	const shopifyConnectionTypes = Object.values(SHOPIFY_CONNECTION_TYPES);
	return shopifyConnectionTypes.includes(
		connection.relationshipType as ShopifyConnectionType,
	);
}

// ============================================================================
// TYPE GUARDS - EVENTS
// ============================================================================

import type { Event } from "@/types/data-provider";
import type {
	ShopifyEvent,
	ShopifyEventType,
	ProductCreatedEvent,
	OrderPlacedEvent,
	CustomerRegisteredEvent,
	CartAbandonedEvent,
	FulfillmentCreatedEvent,
} from "./events";
import { SHOPIFY_EVENT_TYPES } from "./events";

/**
 * Type guard to check if an Event is a ProductCreatedEvent
 */
export function isProductCreatedEvent(
	event: Event,
): event is ProductCreatedEvent {
	return event.type === SHOPIFY_EVENT_TYPES.PRODUCT_CREATED;
}

/**
 * Type guard to check if an Event is an OrderPlacedEvent
 */
export function isOrderPlacedEvent(event: Event): event is OrderPlacedEvent {
	return event.type === SHOPIFY_EVENT_TYPES.ORDER_PLACED;
}

/**
 * Type guard to check if an Event is a CustomerRegisteredEvent
 */
export function isCustomerRegisteredEvent(
	event: Event,
): event is CustomerRegisteredEvent {
	return event.type === SHOPIFY_EVENT_TYPES.CUSTOMER_REGISTERED;
}

/**
 * Type guard to check if an Event is a CartAbandonedEvent
 */
export function isCartAbandonedEvent(
	event: Event,
): event is CartAbandonedEvent {
	return event.type === SHOPIFY_EVENT_TYPES.CART_ABANDONED;
}

/**
 * Type guard to check if an Event is a FulfillmentCreatedEvent
 */
export function isFulfillmentCreatedEvent(
	event: Event,
): event is FulfillmentCreatedEvent {
	return event.type === SHOPIFY_EVENT_TYPES.FULFILLMENT_CREATED;
}

/**
 * Type guard to check if an Event is any Shopify event
 */
export function isShopifyEvent(event: Event): event is ShopifyEvent {
	const shopifyEventTypes = Object.values(SHOPIFY_EVENT_TYPES);
	return shopifyEventTypes.includes(event.type as ShopifyEventType);
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract Shopify ID from properties
 */
export function extractShopifyId(thing: ShopifyThing): string {
	return thing.properties.shopifyId;
}

/**
 * Extract Shopify GID (Global ID) from properties
 */
export function extractShopifyGid(thing: ShopifyThing): string | undefined {
	return thing.properties.shopifyGid;
}

/**
 * Check if a thing has Shopify metadata
 */
export function hasShopifyMetadata(
	thing: Thing,
): thing is Thing & { properties: { shopifyId: string } } {
	return (
		typeof thing.properties === "object" &&
		thing.properties !== null &&
		"shopifyId" in thing.properties &&
		typeof thing.properties.shopifyId === "string"
	);
}

/**
 * Parse Shopify GID to extract numeric ID
 * Example: "gid://shopify/Product/123" → "123"
 */
export function parseShopifyGid(gid: string): string | null {
	const match = gid.match(/gid:\/\/shopify\/\w+\/(\d+)/);
	return match ? match[1] : null;
}

/**
 * Build Shopify GID from resource type and numeric ID
 * Example: buildShopifyGid("Product", "123") → "gid://shopify/Product/123"
 */
export function buildShopifyGid(resourceType: string, id: string): string {
	return `gid://shopify/${resourceType}/${id}`;
}

/**
 * Get resource type from Shopify GID
 * Example: "gid://shopify/Product/123" → "Product"
 */
export function getResourceTypeFromGid(gid: string): string | null {
	const match = gid.match(/gid:\/\/shopify\/(\w+)\/\d+/);
	return match ? match[1] : null;
}

// ============================================================================
// TYPE PREDICATES FOR PATTERN MATCHING
// ============================================================================

/**
 * Narrow Thing type based on type property
 */
export function narrowThingType<T extends ShopifyThingType>(
	thing: Thing,
	type: T,
): thing is Extract<ShopifyThing, { type: T }> {
	return thing.type === type;
}

/**
 * Narrow Connection type based on relationshipType property
 */
export function narrowConnectionType<T extends ShopifyConnectionType>(
	connection: Connection,
	type: T,
): connection is Extract<ShopifyConnection, { relationshipType: T }> {
	return connection.relationshipType === type;
}

/**
 * Narrow Event type based on type property
 */
export function narrowEventType<T extends ShopifyEventType>(
	event: Event,
	type: T,
): event is Extract<ShopifyEvent, { type: T }> {
	return event.type === type;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a Thing has required Shopify properties
 */
export function validateShopifyThing(thing: Thing): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!hasShopifyMetadata(thing)) {
		errors.push("Missing shopifyId in properties");
	}

	if (
		!thing.properties.shopifyCreatedAt ||
		typeof thing.properties.shopifyCreatedAt !== "string"
	) {
		errors.push("Missing or invalid shopifyCreatedAt");
	}

	if (
		!thing.properties.shopifyUpdatedAt ||
		typeof thing.properties.shopifyUpdatedAt !== "string"
	) {
		errors.push("Missing or invalid shopifyUpdatedAt");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Validate Shopify price (must be positive number)
 */
export function isValidShopifyPrice(price: unknown): price is number {
	return typeof price === "number" && price >= 0 && Number.isFinite(price);
}

/**
 * Validate Shopify quantity (must be non-negative integer)
 */
export function isValidShopifyQuantity(quantity: unknown): quantity is number {
	return (
		typeof quantity === "number" &&
		quantity >= 0 &&
		Number.isInteger(quantity)
	);
}

/**
 * Validate Shopify currency code (ISO 4217)
 */
export function isValidCurrencyCode(code: unknown): code is string {
	return (
		typeof code === "string" && /^[A-Z]{3}$/.test(code) // Basic validation
	);
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format Shopify price for display
 */
export function formatShopifyPrice(price: number, currency: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(price);
}

/**
 * Format order number for display
 * Example: 1001 → "#1001"
 */
export function formatOrderNumber(orderNumber: number | string): string {
	return `#${orderNumber}`;
}

/**
 * Format inventory status
 */
export function formatInventoryStatus(
	quantity: number,
	availableForSale: boolean,
): "in_stock" | "low_stock" | "out_of_stock" | "unavailable" {
	if (!availableForSale) return "unavailable";
	if (quantity === 0) return "out_of_stock";
	if (quantity < 10) return "low_stock";
	return "in_stock";
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(
	price: number,
	compareAtPrice: number,
): number {
	if (compareAtPrice <= price) return 0;
	return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Build query filter for Shopify entities
 */
export function buildShopifyThingFilter(
	type: ShopifyThingType,
	additionalFilters?: Record<string, unknown>,
): Record<string, unknown> {
	return {
		type,
		...additionalFilters,
	};
}

/**
 * Build query filter for Shopify connections
 */
export function buildShopifyConnectionFilter(
	relationshipType: ShopifyConnectionType,
	fromEntityId?: string,
	toEntityId?: string,
): Record<string, unknown> {
	const filter: Record<string, unknown> = { relationshipType };

	if (fromEntityId) filter.fromEntityId = fromEntityId;
	if (toEntityId) filter.toEntityId = toEntityId;

	return filter;
}

/**
 * Build query filter for Shopify events
 */
export function buildShopifyEventFilter(
	type: ShopifyEventType,
	actorId?: string,
	since?: number,
	until?: number,
): Record<string, unknown> {
	const filter: Record<string, unknown> = { type };

	if (actorId) filter.actorId = actorId;
	if (since !== undefined) filter.since = since;
	if (until !== undefined) filter.until = until;

	return filter;
}
