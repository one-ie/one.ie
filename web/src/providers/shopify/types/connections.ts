/**
 * Shopify Connection Type Definitions (Cycle 17)
 *
 * Complete TypeScript types for all Shopify relationship types mapped to ONE's Connection dimension.
 * All types extend the base Connection type from DataProvider and add Shopify-specific metadata.
 *
 * Based on Phase 1 research:
 * - /one/connections/shopify-complete-mapping.md
 * - /one/connections/shopify-order-flow.md
 */

import type { Connection } from "@/types/data-provider";

// ============================================================================
// CONNECTION TYPE CONSTANTS
// ============================================================================

/**
 * Shopify-specific connection types
 * These extend the base ConnectionType with Shopify e-commerce relationships
 */
export const SHOPIFY_CONNECTION_TYPES = {
	/** Customer purchased a product variant (from order line item) */
	PURCHASED: "purchased",

	/** Customer has product variant in cart (active checkout) */
	IN_CART: "in_cart",

	/** Product belongs to a collection */
	BELONGS_TO: "belongs_to",

	/** Order contains product (line item relationship) */
	CONTAINS: "contains",

	/** Variant is a variation of product */
	VARIANT_OF: "variant_of",

	/** Order fulfilled by fulfillment */
	FULFILLED_BY: "fulfilled_by",

	/** Order refunded by refund */
	REFUNDED_BY: "refunded_by",

	/** Order discounted by discount code */
	DISCOUNTED_BY: "discounted_by",

	/** Order paid with gift card */
	PAID_WITH: "paid_with",

	/** Customer favorited/wishlisted product */
	FAVORITED: "favorited",

	/** Customer owns gift card */
	OWNS_GIFT_CARD: "owns",
} as const;

export type ShopifyConnectionType =
	(typeof SHOPIFY_CONNECTION_TYPES)[keyof typeof SHOPIFY_CONNECTION_TYPES];

// ============================================================================
// PURCHASED CONNECTION (Customer → Product Variant)
// ============================================================================

/**
 * Metadata for "purchased" connection
 * Represents a customer purchasing a specific variant from an order
 */
export interface PurchasedConnectionMetadata {
	/** Shopify order ID */
	shopifyOrderId: string;

	/** Order number (e.g., "#1001") */
	orderNumber: string;

	/** Order name without # (e.g., "1001") */
	orderName: string;

	/** Shopify line item ID */
	shopifyLineItemId: string;

	/** Quantity purchased */
	quantity: number;

	/** Current quantity (after refunds/removals) */
	currentQuantity: number;

	/** Price per unit at time of purchase */
	unitPrice: number;

	/** Total price for this line item */
	totalPrice: number;

	/** Discounted price if discount was applied */
	discountedPrice?: number;

	/** Currency code (ISO 4217) */
	currency: string;

	/** Product title (snapshot at purchase time) */
	productTitle: string;

	/** Variant title (snapshot at purchase time) */
	variantTitle: string;

	/** SKU code (snapshot at purchase time) */
	sku?: string;

	/** Fulfillment status for this line item */
	fulfillmentStatus: "unfulfilled" | "partial" | "fulfilled" | "not_eligible";

	/** Quantity that can still be fulfilled */
	fulfillableQuantity: number;

	/** Whether shipping is required */
	requiresShipping: boolean;

	/** Whether item is taxable */
	taxable: boolean;

	/** When purchase occurred (ISO 8601) */
	purchasedAt: string;
}

/**
 * Purchased connection: Customer → ProductVariant
 *
 * @example
 * ```typescript
 * const purchase: PurchasedConnection = {
 *   _id: "k500...",
 *   fromEntityId: "k777...", // Customer
 *   toEntityId: "k124...",   // ProductVariant
 *   relationshipType: "purchased",
 *   groupId: "k999...",      // Store
 *   metadata: {
 *     shopifyOrderId: "5555555555",
 *     orderNumber: "#1001",
 *     orderName: "1001",
 *     shopifyLineItemId: "11111",
 *     quantity: 2,
 *     currentQuantity: 2,
 *     unitPrice: 19.99,
 *     totalPrice: 39.98,
 *     currency: "USD",
 *     productTitle: "Classic T-Shirt",
 *     variantTitle: "Small / Blue",
 *     sku: "TSHIRT-SM-BLU",
 *     fulfillmentStatus: "fulfilled",
 *     fulfillableQuantity: 0,
 *     requiresShipping: true,
 *     taxable: true,
 *     purchasedAt: "2024-11-22T10:00:00Z"
 *   },
 *   createdAt: 1732269600000,
 *   updatedAt: 1732269600000
 * };
 * ```
 */
export interface PurchasedConnection extends Connection {
	relationshipType: "purchased";
	metadata: PurchasedConnectionMetadata;
}

// ============================================================================
// IN_CART CONNECTION (Customer → Product Variant)
// ============================================================================

/**
 * Metadata for "in_cart" connection
 * Represents a customer's active cart/checkout
 */
export interface InCartConnectionMetadata {
	/** Checkout/cart token */
	cartToken: string;

	/** Variant ID in cart */
	variantId: string;

	/** Quantity in cart */
	quantity: number;

	/** When item was added to cart (ISO 8601) */
	addedAt: string;

	/** Line item properties (customizations, engravings, etc.) */
	properties?: Array<{ name: string; value: string }>;
}

/**
 * In Cart connection: Customer → ProductVariant
 *
 * @example
 * ```typescript
 * const cartItem: InCartConnection = {
 *   _id: "k501...",
 *   fromEntityId: "k777...", // Customer
 *   toEntityId: "k124...",   // ProductVariant
 *   relationshipType: "in_cart",
 *   groupId: "k999...",
 *   metadata: {
 *     cartToken: "cart123",
 *     variantId: "4567890",
 *     quantity: 1,
 *     addedAt: "2025-01-20T15:45:00Z",
 *     properties: [
 *       { name: "Engraving", value: "Happy Birthday!" }
 *     ]
 *   },
 *   createdAt: 1737389100000
 * };
 * ```
 */
export interface InCartConnection extends Connection {
	relationshipType: "in_cart";
	metadata: InCartConnectionMetadata;
}

// ============================================================================
// BELONGS_TO CONNECTION (Product → Collection)
// ============================================================================

/**
 * Metadata for "belongs_to" connection
 * Represents a product belonging to a collection (group)
 */
export interface BelongsToConnectionMetadata {
	/** Position in collection */
	position?: number;

	/** Whether product is featured in collection */
	featured?: boolean;
}

/**
 * Belongs To connection: Product → Collection (Group)
 *
 * @example
 * ```typescript
 * const membership: BelongsToConnection = {
 *   _id: "k502...",
 *   fromEntityId: "k123...",  // Product
 *   toEntityId: "k1000...",   // Collection Group
 *   relationshipType: "belongs_to",
 *   groupId: "k999...",
 *   metadata: {
 *     position: 5,
 *     featured: true
 *   },
 *   createdAt: 1700000000000
 * };
 * ```
 */
export interface BelongsToConnection extends Connection {
	relationshipType: "belongs_to";
	metadata?: BelongsToConnectionMetadata;
}

// ============================================================================
// CONTAINS CONNECTION (Order → Product)
// ============================================================================

/**
 * Metadata for "contains" connection
 * Represents an order containing a product (line item)
 */
export interface ContainsConnectionMetadata {
	/** Shopify line item ID */
	lineItemId: string;

	/** Variant ID for this line item */
	variantId: string;

	/** Quantity ordered */
	quantity: number;

	/** Price per unit */
	price: number;

	/** Total discount for this line item */
	totalDiscount: number;

	/** Whether line item is a gift card */
	giftCard: boolean;

	/** Quantity that can be fulfilled */
	fulfillableQuantity: number;

	/** Fulfillment status */
	fulfillmentStatus?: string;

	/** Line item properties (customizations) */
	properties?: Array<{ name: string; value: string }>;
}

/**
 * Contains connection: Order → Product
 *
 * @example
 * ```typescript
 * const lineItem: ContainsConnection = {
 *   _id: "k503...",
 *   fromEntityId: "k789...",  // Order
 *   toEntityId: "k123...",    // Product
 *   relationshipType: "contains",
 *   groupId: "k999...",
 *   metadata: {
 *     lineItemId: "gid://shopify/LineItem/123",
 *     variantId: "k124...",
 *     quantity: 2,
 *     price: 29.99,
 *     totalDiscount: 3.00,
 *     giftCard: false,
 *     fulfillableQuantity: 2,
 *     fulfillmentStatus: "fulfilled",
 *     properties: []
 *   },
 *   createdAt: 1732269600000
 * };
 * ```
 */
export interface ContainsConnection extends Connection {
	relationshipType: "contains";
	metadata: ContainsConnectionMetadata;
}

// ============================================================================
// VARIANT_OF CONNECTION (Variant → Product)
// ============================================================================

/**
 * Metadata for "variant_of" connection
 * Represents a variant belonging to a product
 */
export interface VariantOfConnectionMetadata {
	/** Display position of variant */
	position?: number;
}

/**
 * Variant Of connection: ProductVariant → Product
 *
 * @example
 * ```typescript
 * const variantLink: VariantOfConnection = {
 *   _id: "k504...",
 *   fromEntityId: "k124...",  // ProductVariant
 *   toEntityId: "k123...",    // Product
 *   relationshipType: "variant_of",
 *   groupId: "k999...",
 *   metadata: {
 *     position: 1
 *   },
 *   createdAt: 1700000000000
 * };
 * ```
 */
export interface VariantOfConnection extends Connection {
	relationshipType: "variant_of";
	metadata?: VariantOfConnectionMetadata;
}

// ============================================================================
// FULFILLED_BY CONNECTION (Order → Fulfillment)
// ============================================================================

/**
 * Metadata for "fulfilled_by" connection
 * Represents an order being fulfilled by a fulfillment
 */
export interface FulfilledByConnectionMetadata {
	/** Line items included in this fulfillment */
	lineItems: Array<{
		lineItemId: string;
		quantity: number;
	}>;

	/** Tracking information */
	trackingNumber?: string;
	trackingCompany?: string;
	trackingUrl?: string;
}

/**
 * Fulfilled By connection: Order → Fulfillment
 *
 * @example
 * ```typescript
 * const fulfillmentLink: FulfilledByConnection = {
 *   _id: "k505...",
 *   fromEntityId: "k789...",  // Order
 *   toEntityId: "k333...",    // Fulfillment
 *   relationshipType: "fulfilled_by",
 *   groupId: "k999...",
 *   metadata: {
 *     lineItems: [
 *       { lineItemId: "gid://shopify/LineItem/123", quantity: 2 }
 *     ],
 *     trackingNumber: "9400111899563824166000",
 *     trackingCompany: "USPS",
 *     trackingUrl: "https://tools.usps.com/..."
 *   },
 *   createdAt: 1732284000000
 * };
 * ```
 */
export interface FulfilledByConnection extends Connection {
	relationshipType: "fulfilled_by";
	metadata: FulfilledByConnectionMetadata;
}

// ============================================================================
// REFUNDED_BY CONNECTION (Order → Refund)
// ============================================================================

/**
 * Metadata for "refunded_by" connection
 * Represents an order being refunded
 */
export interface RefundedByConnectionMetadata {
	/** Refund amount */
	refundAmount: number;

	/** Currency code */
	currency: string;

	/** Refund reason */
	refundReason?: string;

	/** Line items refunded */
	lineItemsRefunded?: Array<{
		lineItemId: string;
		quantity: number;
		amount: number;
	}>;
}

/**
 * Refunded By connection: Order → Refund
 *
 * @example
 * ```typescript
 * const refundLink: RefundedByConnection = {
 *   _id: "k506...",
 *   fromEntityId: "k789...",  // Order
 *   toEntityId: "k666...",    // Refund
 *   relationshipType: "refunded_by",
 *   groupId: "k999...",
 *   metadata: {
 *     refundAmount: 32.69,
 *     currency: "USD",
 *     refundReason: "customer_request",
 *     lineItemsRefunded: [
 *       { lineItemId: "11111", quantity: 1, amount: 32.69 }
 *     ]
 *   },
 *   createdAt: 1737456000000
 * };
 * ```
 */
export interface RefundedByConnection extends Connection {
	relationshipType: "refunded_by";
	metadata: RefundedByConnectionMetadata;
}

// ============================================================================
// DISCOUNTED_BY CONNECTION (Order → Discount)
// ============================================================================

/**
 * Metadata for "discounted_by" connection
 * Represents a discount being applied to an order
 */
export interface DiscountedByConnectionMetadata {
	/** Discount amount applied */
	discountAmount: number;

	/** Currency code */
	currency: string;

	/** Discount code used */
	discountCode: string;
}

/**
 * Discounted By connection: Order → Discount
 *
 * @example
 * ```typescript
 * const discountLink: DiscountedByConnection = {
 *   _id: "k507...",
 *   fromEntityId: "k789...",  // Order
 *   toEntityId: "k111...",    // Discount
 *   relationshipType: "discounted_by",
 *   groupId: "k999...",
 *   metadata: {
 *     discountAmount: 5.00,
 *     currency: "USD",
 *     discountCode: "SUMMER10"
 *   },
 *   createdAt: 1732269600000
 * };
 * ```
 */
export interface DiscountedByConnection extends Connection {
	relationshipType: "discounted_by";
	metadata: DiscountedByConnectionMetadata;
}

// ============================================================================
// PAID_WITH CONNECTION (Order → Gift Card)
// ============================================================================

/**
 * Metadata for "paid_with" connection
 * Represents payment using a gift card
 */
export interface PaidWithConnectionMetadata {
	/** Amount paid with this gift card */
	amountUsed: number;

	/** Currency code */
	currency: string;

	/** Gift card code (last 4 digits for security) */
	last4?: string;
}

/**
 * Paid With connection: Order → GiftCard
 *
 * @example
 * ```typescript
 * const paymentLink: PaidWithConnection = {
 *   _id: "k508...",
 *   fromEntityId: "k789...",  // Order
 *   toEntityId: "k222...",    // GiftCard
 *   relationshipType: "paid_with",
 *   groupId: "k999...",
 *   metadata: {
 *     amountUsed: 22.50,
 *     currency: "USD",
 *     last4: "9012"
 *   },
 *   createdAt: 1732269600000
 * };
 * ```
 */
export interface PaidWithConnection extends Connection {
	relationshipType: "paid_with";
	metadata: PaidWithConnectionMetadata;
}

// ============================================================================
// FAVORITED CONNECTION (Customer → Product)
// ============================================================================

/**
 * Metadata for "favorited" connection
 * Represents a customer wishlisting a product
 */
export interface FavoritedConnectionMetadata {
	/** When product was favorited (ISO 8601) */
	favoritedAt: string;

	/** Optional note from customer */
	note?: string;
}

/**
 * Favorited connection: Customer → Product
 *
 * @example
 * ```typescript
 * const wishlistItem: FavoritedConnection = {
 *   _id: "k509...",
 *   fromEntityId: "k777...",  // Customer
 *   toEntityId: "k123...",    // Product
 *   relationshipType: "favorited",
 *   groupId: "k999...",
 *   metadata: {
 *     favoritedAt: "2025-01-18T09:00:00Z",
 *     note: "Birthday gift idea"
 *   },
 *   createdAt: 1737192000000
 * };
 * ```
 */
export interface FavoritedConnection extends Connection {
	relationshipType: "favorited";
	metadata?: FavoritedConnectionMetadata;
}

// ============================================================================
// OWNS (Gift Card) CONNECTION (Customer → Gift Card)
// ============================================================================

/**
 * Metadata for "owns" connection (gift card ownership)
 * Represents a customer owning a gift card
 */
export interface OwnsGiftCardConnectionMetadata {
	/** When gift card was purchased/received (ISO 8601) */
	purchasedAt: string;

	/** Whether customer purchased it or received it as gift */
	source: "purchased" | "gift" | "promotion";
}

/**
 * Owns connection: Customer → GiftCard
 *
 * @example
 * ```typescript
 * const giftCardOwnership: OwnsGiftCardConnection = {
 *   _id: "k510...",
 *   fromEntityId: "k777...",  // Customer
 *   toEntityId: "k222...",    // GiftCard
 *   relationshipType: "owns",
 *   groupId: "k999...",
 *   metadata: {
 *     purchasedAt: "2025-01-10T00:00:00Z",
 *     source: "purchased"
 *   },
 *   createdAt: 1736467200000
 * };
 * ```
 */
export interface OwnsGiftCardConnection extends Connection {
	relationshipType: "owns";
	metadata?: OwnsGiftCardConnectionMetadata;
}

// ============================================================================
// UNION TYPE FOR ALL SHOPIFY CONNECTIONS
// ============================================================================

/**
 * Union type of all Shopify Connection types
 * Use for type narrowing and pattern matching
 */
export type ShopifyConnection =
	| PurchasedConnection
	| InCartConnection
	| BelongsToConnection
	| ContainsConnection
	| VariantOfConnection
	| FulfilledByConnection
	| RefundedByConnection
	| DiscountedByConnection
	| PaidWithConnection
	| FavoritedConnection
	| OwnsGiftCardConnection;

/**
 * Map of connection types to their metadata schemas
 */
export interface ShopifyConnectionMetadataMap {
	purchased: PurchasedConnectionMetadata;
	in_cart: InCartConnectionMetadata;
	belongs_to: BelongsToConnectionMetadata | undefined;
	contains: ContainsConnectionMetadata;
	variant_of: VariantOfConnectionMetadata | undefined;
	fulfilled_by: FulfilledByConnectionMetadata;
	refunded_by: RefundedByConnectionMetadata;
	discounted_by: DiscountedByConnectionMetadata;
	paid_with: PaidWithConnectionMetadata;
	favorited: FavoritedConnectionMetadata | undefined;
	owns: OwnsGiftCardConnectionMetadata | undefined;
}

/**
 * Helper type to get metadata type for a connection type
 */
export type MetadataForConnectionType<T extends ShopifyConnectionType> =
	T extends keyof ShopifyConnectionMetadataMap
		? ShopifyConnectionMetadataMap[T]
		: never;
