/**
 * Shopify Thing Type Definitions (Cycle 16)
 *
 * Complete TypeScript types for all Shopify entities mapped to ONE's Thing dimension.
 * All types extend the base Thing type from DataProvider and add Shopify-specific properties.
 *
 * Based on Phase 1 research:
 * - /one/connections/shopify-complete-mapping.md
 * - /one/things/shopify-product-mapping.md
 */

import type { Thing, ThingStatus } from "@/types/data-provider";

// ============================================================================
// SHOPIFY METADATA TYPES (Common across all things)
// ============================================================================

/**
 * Shopify identifiers that all Shopify things have
 */
export interface ShopifyThingMetadata {
	/** Shopify Global ID (e.g., "gid://shopify/Product/123") or numeric ID */
	shopifyId: string;

	/** Shopify GraphQL Global ID (full GID format) */
	shopifyGid?: string;

	/** When this entity was created in Shopify (ISO 8601) */
	shopifyCreatedAt: string;

	/** When this entity was last updated in Shopify (ISO 8601) */
	shopifyUpdatedAt: string;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

/**
 * Product option definition (Size, Color, Material, etc.)
 * Shopify products support up to 3 options
 */
export interface ProductOption {
	/** Option name (e.g., "Size", "Color", "Material") */
	name: string;

	/** Position in option list (1, 2, or 3) */
	position: number;

	/** Available values for this option (e.g., ["Small", "Medium", "Large"]) */
	values: string[];
}

/**
 * Product image metadata
 */
export interface ProductImage {
	/** CDN URL for the image */
	url: string;

	/** Alt text for accessibility */
	altText?: string;

	/** Position in image gallery (1-based) */
	position: number;
}

/**
 * Product price range across all variants
 */
export interface ProductPriceRange {
	/** Minimum price across all variants */
	min: number;

	/** Maximum price across all variants */
	max: number;

	/** Currency code (ISO 4217: USD, EUR, etc.) */
	currency: string;
}

/**
 * SEO metadata for products
 */
export interface ProductSEO {
	/** SEO title (meta title) */
	title?: string;

	/** SEO description (meta description) */
	description?: string;
}

/**
 * Shopify Product properties schema
 * Products are the main catalog entities containing multiple variants
 */
export interface ShopifyProductProperties extends ShopifyThingMetadata {
	/** URL-friendly handle (slug) */
	shopifyHandle: string;

	/** Product status in Shopify */
	status: "active" | "archived" | "draft";

	/** Brand or manufacturer */
	vendor?: string;

	/** Product category/type (e.g., "Apparel", "Electronics") */
	productType?: string;

	/** Product tags for organization and search */
	tags?: string[];

	/** Product options (up to 3: size, color, material, etc.) */
	options: ProductOption[];

	/** Price range across all variants */
	priceRange: ProductPriceRange;

	/** Total inventory across all variants */
	totalInventory?: number;

	/** Whether inventory is tracked for this product */
	tracksInventory: boolean;

	/** SEO metadata */
	seo?: ProductSEO;

	/** Product images */
	images: ProductImage[];

	/** Featured/primary image */
	featuredImage?: ProductImage;

	/** Shopify metafields (custom data) */
	metafields?: Record<string, unknown>;

	/** When product was published (ISO 8601) */
	shopifyPublishedAt?: string;
}

/**
 * Shopify Product Thing
 *
 * @example
 * ```typescript
 * const product: ShopifyProduct = {
 *   _id: "k123...",
 *   type: "product",
 *   name: "Awesome T-Shirt",
 *   status: "published",
 *   groupId: "k999...", // Store group ID
 *   properties: {
 *     shopifyId: "7891234567890",
 *     shopifyHandle: "awesome-t-shirt",
 *     status: "active",
 *     vendor: "My Brand",
 *     productType: "Apparel",
 *     tags: ["cotton", "summer", "bestseller"],
 *     options: [
 *       { name: "Size", position: 1, values: ["S", "M", "L", "XL"] },
 *       { name: "Color", position: 2, values: ["Red", "Blue", "Green"] }
 *     ],
 *     priceRange: { min: 19.99, max: 29.99, currency: "USD" },
 *     totalInventory: 250,
 *     tracksInventory: true,
 *     images: [
 *       { url: "https://cdn.shopify.com/...", altText: "Red shirt front", position: 1 }
 *     ],
 *     shopifyCreatedAt: "2024-01-15T10:00:00Z",
 *     shopifyUpdatedAt: "2024-11-22T14:30:00Z"
 *   },
 *   createdAt: 1700000000000,
 *   updatedAt: 1700000000000
 * };
 * ```
 */
export interface ShopifyProduct extends Thing {
	type: "product";
	properties: ShopifyProductProperties;
}

// ============================================================================
// PRODUCT VARIANT TYPES
// ============================================================================

/**
 * Selected option value for a variant (e.g., Size: "Small")
 */
export interface SelectedOption {
	/** Option name (e.g., "Size", "Color") */
	name: string;

	/** Selected value (e.g., "Small", "Blue") */
	value: string;
}

/**
 * Variant image metadata
 */
export interface VariantImage {
	/** CDN URL for the image */
	url: string;

	/** Alt text for accessibility */
	altText?: string;
}

/**
 * Shopify ProductVariant properties schema
 * Variants represent specific combinations of product options (e.g., "Small / Blue")
 */
export interface ShopifyProductVariantProperties extends ShopifyThingMetadata {
	/** Parent product Shopify ID */
	shopifyProductId: string;

	/** Stock Keeping Unit */
	sku?: string;

	/** Barcode (UPC/EAN/ISBN) */
	barcode?: string;

	/** Current price */
	price: number;

	/** Original price (for showing discounts) */
	compareAtPrice?: number;

	/** Currency code (ISO 4217) */
	currency: string;

	/** Selected options that define this variant */
	selectedOptions: SelectedOption[];

	/** Current inventory quantity */
	inventoryQuantity: number;

	/** Inventory policy: deny = can't sell when out of stock, continue = allow overselling */
	inventoryPolicy: "deny" | "continue";

	/** Inventory management system: "shopify", "third_party", or null */
	inventoryManagement?: string | null;

	/** Whether variant is available for sale */
	availableForSale: boolean;

	/** Physical weight */
	weight?: number;

	/** Weight unit */
	weightUnit?: "kg" | "lb" | "oz" | "g";

	/** Whether shipping is required */
	requiresShipping: boolean;

	/** Whether variant is taxable */
	taxable?: boolean;

	/** Variant-specific image */
	image?: VariantImage;

	/** Display position/order */
	position: number;

	/** Shopify metafields (custom data) */
	metafields?: Record<string, unknown>;
}

/**
 * Shopify ProductVariant Thing
 *
 * @example
 * ```typescript
 * const variant: ShopifyProductVariant = {
 *   _id: "k124...",
 *   type: "product_variant",
 *   name: "Awesome T-Shirt - Small / Blue",
 *   status: "published",
 *   groupId: "k999...",
 *   properties: {
 *     shopifyId: "4567890",
 *     shopifyProductId: "7891234567890",
 *     sku: "TSHIRT-SM-BLU",
 *     barcode: "1234567890123",
 *     price: 19.99,
 *     compareAtPrice: 24.99,
 *     currency: "USD",
 *     selectedOptions: [
 *       { name: "Size", value: "Small" },
 *       { name: "Color", value: "Blue" }
 *     ],
 *     inventoryQuantity: 100,
 *     inventoryPolicy: "deny",
 *     availableForSale: true,
 *     requiresShipping: true,
 *     position: 1,
 *     shopifyCreatedAt: "2024-01-15T10:00:00Z",
 *     shopifyUpdatedAt: "2024-11-22T14:30:00Z"
 *   },
 *   createdAt: 1700000000000,
 *   updatedAt: 1700000000000
 * };
 * ```
 */
export interface ShopifyProductVariant extends Thing {
	type: "product_variant";
	properties: ShopifyProductVariantProperties;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

/**
 * Mailing address structure
 */
export interface MailingAddress {
	address1?: string;
	address2?: string;
	city?: string;
	province?: string;
	provinceCode?: string;
	country?: string;
	countryCode: string;
	zip?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
	company?: string;
}

/**
 * Shipping line item
 */
export interface ShippingLine {
	title: string;
	price: number;
	code?: string;
}

/**
 * Tax line item
 */
export interface TaxLine {
	title: string;
	price: number;
	rate: number;
}

/**
 * Discount code application
 */
export interface DiscountCode {
	code: string;
	amount: number;
	type: "percentage" | "fixed_amount";
}

/**
 * Shopify Order properties schema
 * Orders represent customer purchases
 */
export interface ShopifyOrderProperties extends ShopifyThingMetadata {
	/** Order number (e.g., 1001) */
	orderNumber: number;

	/** Customer email */
	email?: string;

	/** Customer phone */
	phone?: string;

	/** Financial status: pending, paid, refunded, etc. */
	financialStatus:
		| "pending"
		| "authorized"
		| "paid"
		| "partially_paid"
		| "refunded"
		| "partially_refunded"
		| "voided";

	/** Fulfillment status: fulfilled, partial, unfulfilled */
	fulfillmentStatus:
		| "fulfilled"
		| "partial"
		| "unfulfilled"
		| "restocked"
		| "scheduled";

	/** Currency code */
	currency: string;

	/** Subtotal (before tax and shipping) */
	subtotalPrice: number;

	/** Total tax */
	totalTax: number;

	/** Total shipping cost */
	totalShipping: number;

	/** Total price (final amount) */
	totalPrice: number;

	/** Total discounts applied */
	totalDiscounts: number;

	/** When order was processed (ISO 8601) */
	processedAt?: string;

	/** When order was cancelled (ISO 8601) */
	cancelledAt?: string;

	/** When order was closed (ISO 8601) */
	closedAt?: string;

	/** Shipping address */
	shippingAddress?: MailingAddress;

	/** Billing address */
	billingAddress?: MailingAddress;

	/** Shipping method details */
	shippingLines?: ShippingLine[];

	/** Tax breakdown */
	taxLines?: TaxLine[];

	/** Applied discount codes */
	discountCodes?: DiscountCode[];

	/** Customer note */
	note?: string;

	/** Merchant tags */
	tags?: string[];

	/** Whether this is a test order */
	test?: boolean;

	/** Whether order is confirmed */
	confirmed?: boolean;

	/** Cancel reason if cancelled */
	cancelReason?:
		| "customer"
		| "fraud"
		| "inventory"
		| "declined"
		| "other"
		| null;
}

/**
 * Shopify Order Thing
 *
 * @example
 * ```typescript
 * const order: ShopifyOrder = {
 *   _id: "k789...",
 *   type: "order",
 *   name: "Order #1001",
 *   status: "published",
 *   groupId: "k999...",
 *   properties: {
 *     shopifyId: "5555555555",
 *     orderNumber: 1001,
 *     email: "customer@example.com",
 *     financialStatus: "paid",
 *     fulfillmentStatus: "fulfilled",
 *     currency: "USD",
 *     subtotalPrice: 39.98,
 *     totalTax: 3.20,
 *     totalShipping: 5.00,
 *     totalPrice: 48.18,
 *     totalDiscounts: 0,
 *     processedAt: "2024-11-22T10:00:00Z",
 *     test: false,
 *     confirmed: true,
 *     shopifyCreatedAt: "2024-11-22T10:00:00Z",
 *     shopifyUpdatedAt: "2024-11-22T14:00:00Z"
 *   },
 *   createdAt: 1732269600000,
 *   updatedAt: 1732284000000
 * };
 * ```
 */
export interface ShopifyOrder extends Thing {
	type: "order";
	properties: ShopifyOrderProperties;
}

// ============================================================================
// CHECKOUT TYPES
// ============================================================================

/**
 * Shopify Checkout properties schema
 * Checkouts represent abandoned carts
 */
export interface ShopifyCheckoutProperties extends ShopifyThingMetadata {
	/** Unique checkout token */
	token: string;

	/** Cart token */
	cartToken?: string;

	/** Customer email */
	email?: string;

	/** When checkout was completed (order created) */
	completedAt?: string;

	/** Abandoned checkout URL for recovery */
	abandonedCheckoutUrl?: string;

	/** Total price */
	totalPrice: number;

	/** Currency code */
	currency: string;
}

/**
 * Shopify Checkout Thing
 *
 * @example
 * ```typescript
 * const checkout: ShopifyCheckout = {
 *   _id: "k555...",
 *   type: "checkout",
 *   name: "Checkout ABC123",
 *   status: "active",
 *   groupId: "k999...",
 *   properties: {
 *     shopifyId: "555",
 *     token: "abc123def456",
 *     cartToken: "cart123",
 *     email: "customer@example.com",
 *     abandonedCheckoutUrl: "https://mystore.com/cart/abc123",
 *     totalPrice: 89.99,
 *     currency: "USD",
 *     shopifyCreatedAt: "2025-01-20T15:45:00Z",
 *     shopifyUpdatedAt: "2025-01-20T15:47:00Z"
 *   },
 *   createdAt: 1737389100000,
 *   updatedAt: 1737389220000
 * };
 * ```
 */
export interface ShopifyCheckout extends Thing {
	type: "checkout";
	properties: ShopifyCheckoutProperties;
}

// ============================================================================
// DISCOUNT TYPES
// ============================================================================

/**
 * Shopify Discount properties schema
 * Discounts represent promotional codes
 */
export interface ShopifyDiscountProperties extends ShopifyThingMetadata {
	/** Discount code (e.g., "SUMMER10") */
	code: string;

	/** Value type: percentage or fixed_amount */
	valueType: "percentage" | "fixed_amount";

	/** Discount value (10.0 for 10%, or 5.00 for $5 off) */
	value: string;

	/** When discount starts (ISO 8601) */
	startsAt?: string;

	/** When discount ends (ISO 8601) */
	endsAt?: string;

	/** Maximum number of uses */
	usageLimit?: number;

	/** Current usage count */
	usageCount?: number;

	/** Whether code can be used once per customer */
	oncePerCustomer?: boolean;

	/** Minimum subtotal amount required */
	minimumSubtotalAmount?: string;

	/** What discount applies to */
	appliesTo: "all_products" | "specific_collections" | "specific_products";

	/** Target product/collection IDs */
	targetSelection?: string[];

	/** Target type */
	targetType?: "line_item" | "shipping_line";
}

/**
 * Shopify Discount Thing
 *
 * @example
 * ```typescript
 * const discount: ShopifyDiscount = {
 *   _id: "k111...",
 *   type: "discount",
 *   name: "SUMMER10",
 *   status: "active",
 *   groupId: "k999...",
 *   properties: {
 *     shopifyId: "111",
 *     code: "SUMMER10",
 *     valueType: "percentage",
 *     value: "10.0",
 *     startsAt: "2025-06-01T00:00:00Z",
 *     endsAt: "2025-08-31T23:59:59Z",
 *     usageLimit: 1000,
 *     usageCount: 247,
 *     oncePerCustomer: true,
 *     minimumSubtotalAmount: "50.00",
 *     appliesTo: "all_products",
 *     targetSelection: [],
 *     targetType: "line_item",
 *     shopifyCreatedAt: "2025-05-01T00:00:00Z",
 *     shopifyUpdatedAt: "2025-11-22T10:00:00Z"
 *   },
 *   createdAt: 1714521600000,
 *   updatedAt: 1732269600000
 * };
 * ```
 */
export interface ShopifyDiscount extends Thing {
	type: "discount";
	properties: ShopifyDiscountProperties;
}

// ============================================================================
// GIFT CARD TYPES
// ============================================================================

/**
 * Shopify GiftCard properties schema
 * Gift cards represent store credit
 */
export interface ShopifyGiftCardProperties extends ShopifyThingMetadata {
	/** Unique gift card code */
	code: string;

	/** Initial value */
	initialValue: number;

	/** Current balance */
	balance: number;

	/** Currency code */
	currency: string;

	/** Expiration date (ISO 8601) */
	expiresOn?: string;

	/** Whether gift card is disabled */
	disabled: boolean;
}

/**
 * Shopify GiftCard Thing
 *
 * @example
 * ```typescript
 * const giftCard: ShopifyGiftCard = {
 *   _id: "k222...",
 *   type: "gift_card",
 *   name: "Gift Card - $50",
 *   status: "active",
 *   groupId: "k999...",
 *   properties: {
 *     shopifyId: "222",
 *     code: "GIFT-1234-5678-9012",
 *     initialValue: 50.00,
 *     balance: 27.50,
 *     currency: "USD",
 *     disabled: false,
 *     shopifyCreatedAt: "2025-01-10T00:00:00Z",
 *     shopifyUpdatedAt: "2025-01-15T12:00:00Z"
 *   },
 *   createdAt: 1736467200000,
 *   updatedAt: 1736942400000
 * };
 * ```
 */
export interface ShopifyGiftCard extends Thing {
	type: "gift_card";
	properties: ShopifyGiftCardProperties;
}

// ============================================================================
// FULFILLMENT TYPES
// ============================================================================

/**
 * Shopify Fulfillment properties schema
 * Fulfillments track shipments
 */
export interface ShopifyFulfillmentProperties extends ShopifyThingMetadata {
	/** Shopify order ID this fulfillment belongs to */
	shopifyOrderId: string;

	/** Fulfillment status */
	status: "pending" | "success" | "cancelled" | "error" | "failure";

	/** Shipping carrier/company */
	trackingCompany?: string;

	/** Tracking numbers */
	trackingNumbers?: string[];

	/** Tracking URLs */
	trackingUrls?: string[];

	/** Shipment status */
	shipmentStatus?:
		| "confirmed"
		| "in_transit"
		| "out_for_delivery"
		| "delivered"
		| "failure"
		| null;

	/** When shipment was delivered (ISO 8601) */
	deliveredAt?: string;

	/** When shipment entered transit (ISO 8601) */
	inTransitAt?: string;
}

/**
 * Shopify Fulfillment Thing
 *
 * @example
 * ```typescript
 * const fulfillment: ShopifyFulfillment = {
 *   _id: "k333...",
 *   type: "fulfillment",
 *   name: "Fulfillment for Order #1001",
 *   status: "published",
 *   groupId: "k999...",
 *   properties: {
 *     shopifyId: "333",
 *     shopifyOrderId: "5555555555",
 *     status: "success",
 *     trackingCompany: "USPS",
 *     trackingNumbers: ["9400111899563824166000"],
 *     trackingUrls: ["https://tools.usps.com/..."],
 *     shipmentStatus: "delivered",
 *     deliveredAt: "2025-01-18T14:30:00Z",
 *     shopifyCreatedAt: "2025-01-16T08:00:00Z",
 *     shopifyUpdatedAt: "2025-01-18T14:30:00Z"
 *   },
 *   createdAt: 1737014400000,
 *   updatedAt: 1737209400000
 * };
 * ```
 */
export interface ShopifyFulfillment extends Thing {
	type: "fulfillment";
	properties: ShopifyFulfillmentProperties;
}

// ============================================================================
// REFUND TYPES
// ============================================================================

/**
 * Refund line item details
 */
export interface RefundLineItem {
	/** Line item ID being refunded */
	lineItemId: string;

	/** Quantity refunded */
	quantity: number;

	/** Restock type: no_restock, cancel, return */
	restockType: "no_restock" | "cancel" | "return";

	/** Refund subtotal */
	subtotal: number;

	/** Refund tax amount */
	totalTax: number;
}

/**
 * Refund transaction details
 */
export interface RefundTransaction {
	/** Transaction kind (always "refund") */
	kind: "refund";

	/** Transaction status */
	status: "success" | "pending" | "failure" | "error";

	/** Refund amount */
	amount: number;

	/** Payment gateway */
	gateway?: string;
}

/**
 * Shopify Refund properties schema
 * Refunds track returns and refunds
 */
export interface ShopifyRefundProperties extends ShopifyThingMetadata {
	/** Shopify order ID this refund belongs to */
	shopifyOrderId: string;

	/** Refund note/reason */
	note?: string;

	/** When refund was processed (ISO 8601) */
	processedAt?: string;

	/** Line items refunded */
	refundLineItems?: RefundLineItem[];

	/** Refund transactions */
	transactions?: RefundTransaction[];

	/** Total refund amount */
	totalRefunded?: number;
}

/**
 * Shopify Refund Thing
 *
 * @example
 * ```typescript
 * const refund: ShopifyRefund = {
 *   _id: "k666...",
 *   type: "refund",
 *   name: "Refund for Order #1001",
 *   status: "published",
 *   groupId: "k999...",
 *   properties: {
 *     shopifyId: "666",
 *     shopifyOrderId: "5555555555",
 *     note: "Customer requested size exchange",
 *     processedAt: "2025-01-21T10:05:00Z",
 *     refundLineItems: [{
 *       lineItemId: "11111",
 *       quantity: 1,
 *       restockType: "return",
 *       subtotal: 29.99,
 *       totalTax: 2.70
 *     }],
 *     transactions: [{
 *       kind: "refund",
 *       status: "success",
 *       amount: 32.69
 *     }],
 *     totalRefunded: 32.69,
 *     shopifyCreatedAt: "2025-01-21T10:00:00Z",
 *     shopifyUpdatedAt: "2025-01-21T10:05:00Z"
 *   },
 *   createdAt: 1737456000000,
 *   updatedAt: 1737456300000
 * };
 * ```
 */
export interface ShopifyRefund extends Thing {
	type: "refund";
	properties: ShopifyRefundProperties;
}

// ============================================================================
// UNION TYPE FOR ALL SHOPIFY THINGS
// ============================================================================

/**
 * Union type of all Shopify Thing types
 * Use for type narrowing and pattern matching
 */
export type ShopifyThing =
	| ShopifyProduct
	| ShopifyProductVariant
	| ShopifyOrder
	| ShopifyCheckout
	| ShopifyDiscount
	| ShopifyGiftCard
	| ShopifyFulfillment
	| ShopifyRefund;

/**
 * Shopify Thing type discriminator
 * All possible type values for Shopify entities
 */
export type ShopifyThingType =
	| "product"
	| "product_variant"
	| "order"
	| "checkout"
	| "discount"
	| "gift_card"
	| "fulfillment"
	| "refund";

/**
 * Map of Shopify thing types to their property schemas
 */
export interface ShopifyThingTypeMap {
	product: ShopifyProductProperties;
	product_variant: ShopifyProductVariantProperties;
	order: ShopifyOrderProperties;
	checkout: ShopifyCheckoutProperties;
	discount: ShopifyDiscountProperties;
	gift_card: ShopifyGiftCardProperties;
	fulfillment: ShopifyFulfillmentProperties;
	refund: ShopifyRefundProperties;
}
