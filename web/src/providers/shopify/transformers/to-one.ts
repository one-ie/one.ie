/**
 * Shopify → ONE Transformations
 *
 * Transforms Shopify API data structures into ONE Platform entities following the 6-dimension ontology.
 *
 * @see /one/things/shopify-product-mapping.md - Product/Variant mapping
 * @see /one/connections/shopify-order-flow.md - Order/Connection mapping
 * @see /one/people/shopify-customer-mapping.md - Customer/People mapping
 */

import { Effect } from "effect";
import {
	extractNumericId,
	stripHtml,
	generateSlug,
	generateVariantSlug,
	parseMoney,
	transformAddress,
	transformMetafields,
	parseTimestamp,
	validateRequired,
	hasVariants,
	getDefaultVariant,
	calculateDiscountPercentage,
	isGuestCustomer,
	type ShopifyMoney,
	type ShopifyMailingAddress,
	type ShopifyMetafield,
	type ONEAddress,
	type ONEMetafields,
	TransformationError,
	ValidationError,
	MissingDataError,
} from "./utils";

// ============================================================================
// TYPE DEFINITIONS - Shopify API Types
// ============================================================================

/**
 * Shopify Product (GraphQL/REST API)
 */
export interface ShopifyProduct {
	id: string;
	title: string;
	description?: string | null;
	descriptionHtml?: string | null;
	handle: string;
	status: "ACTIVE" | "ARCHIVED" | "DRAFT";
	vendor?: string | null;
	productType?: string | null;
	tags?: string[];

	// Options (up to 3)
	options?: Array<{
		id?: string;
		name: string;
		position: number;
		values: string[];
	}>;

	// Price range
	priceRangeV2?: {
		minVariantPrice: ShopifyMoney;
		maxVariantPrice: ShopifyMoney;
	};

	// Inventory
	totalInventory?: number | null;
	tracksInventory?: boolean;

	// SEO
	seo?: {
		title?: string | null;
		description?: string | null;
	};

	// Media/Images
	featuredImage?: {
		url: string;
		altText?: string | null;
	};
	media?: {
		edges: Array<{
			node: {
				__typename?: string;
				alt?: string | null;
				image?: {
					url: string;
				};
			};
		}>;
	};
	images?: {
		edges: Array<{
			node: {
				url: string;
				altText?: string | null;
			};
		}>;
	};

	// Variants
	variants?: {
		edges: Array<{
			node: ShopifyProductVariant;
		}>;
	};

	// Metadata
	metafields?: ShopifyMetafield[];

	// Timestamps
	createdAt: string;
	updatedAt: string;
	publishedAt?: string | null;
}

/**
 * Shopify ProductVariant (GraphQL/REST API)
 */
export interface ShopifyProductVariant {
	id: string;
	title: string;
	sku?: string | null;
	barcode?: string | null;

	// Product reference
	product?: {
		id: string;
		handle?: string;
	};

	// Pricing
	price: ShopifyMoney;
	compareAtPrice?: ShopifyMoney | null;

	// Inventory
	inventoryQuantity: number;
	inventoryPolicy?: "DENY" | "CONTINUE";
	inventoryManagement?: string | null;
	availableForSale?: boolean;

	// Options
	selectedOptions: Array<{
		name: string;
		value: string;
	}>;

	// Physical properties
	weight?: number | null;
	weightUnit?: "KILOGRAMS" | "GRAMS" | "POUNDS" | "OUNCES";
	requiresShipping?: boolean;

	// Media
	image?: {
		url: string;
		altText?: string | null;
	};

	// Position
	position?: number;

	// Metadata
	metafields?: ShopifyMetafield[];

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Shopify Order (GraphQL/REST API)
 */
export interface ShopifyOrder {
	id: string;
	name: string; // "#1001"
	email?: string | null;
	phone?: string | null;

	// Customer
	customer?: ShopifyCustomer | null;

	// Line items
	lineItems: {
		edges: Array<{
			node: ShopifyLineItem;
		}>;
	};

	// Financial status
	displayFinancialStatus?:
		| "AUTHORIZED"
		| "PENDING"
		| "PAID"
		| "PARTIALLY_PAID"
		| "REFUNDED"
		| "PARTIALLY_REFUNDED"
		| "VOIDED";

	// Fulfillment status
	displayFulfillmentStatus?:
		| "FULFILLED"
		| "IN_PROGRESS"
		| "ON_HOLD"
		| "OPEN"
		| "PARTIALLY_FULFILLED"
		| "PENDING_FULFILLMENT"
		| "RESTOCKED"
		| "SCHEDULED"
		| "UNFULFILLED";

	// Pricing
	subtotalPriceSet?: { shopMoney: ShopifyMoney };
	totalTaxSet?: { shopMoney: ShopifyMoney };
	totalShippingPriceSet?: { shopMoney: ShopifyMoney };
	totalDiscountsSet?: { shopMoney: ShopifyMoney };
	totalPriceSet: { shopMoney: ShopifyMoney };
	currencyCode?: string;

	// Fulfillments
	fulfillments?: ShopifyFulfillment[];

	// Refunds
	refunds?: ShopifyRefund[];

	// Transactions
	transactions?: ShopifyTransaction[];

	// Addresses
	shippingAddress?: ShopifyMailingAddress;
	billingAddress?: ShopifyMailingAddress;

	// Timestamps
	createdAt: string;
	updatedAt: string;
	processedAt?: string;
	cancelledAt?: string | null;
	closedAt?: string | null;

	// Flags
	confirmed?: boolean;
	test?: boolean;
	cancelled?: boolean;
	cancelReason?: string | null;
}

/**
 * Shopify LineItem (Order line item)
 */
export interface ShopifyLineItem {
	id: string;
	title: string;
	quantity: number;
	currentQuantity?: number;

	// Variant reference
	variant?: ShopifyProductVariant | null;
	sku?: string | null;
	variantTitle?: string | null;

	// Pricing
	originalUnitPriceSet?: { shopMoney: ShopifyMoney };
	discountedUnitPriceSet?: { shopMoney: ShopifyMoney };
	originalTotalSet?: { shopMoney: ShopifyMoney };
	discountedTotalSet: { shopMoney: ShopifyMoney };

	// Fulfillment
	fulfillmentStatus?: "fulfilled" | "partial" | "unfulfilled" | "not_eligible" | null;
	fulfillableQuantity?: number;

	// Flags
	requiresShipping?: boolean;
	taxable?: boolean;
}

/**
 * Shopify Fulfillment
 */
export interface ShopifyFulfillment {
	id: string;
	status: "SUCCESS" | "CANCELLED" | "ERROR" | "FAILURE";
	trackingInfo?: Array<{
		company?: string | null;
		number?: string | null;
		url?: string | null;
	}>;
	fulfillmentLineItems?: {
		edges: Array<{
			node: {
				lineItem: {
					id: string;
				};
				quantity: number;
			};
		}>;
	};
	createdAt: string;
	updatedAt: string;
	deliveredAt?: string | null;
	inTransitAt?: string | null;
}

/**
 * Shopify Refund
 */
export interface ShopifyRefund {
	id: string;
	refundLineItems?: {
		edges: Array<{
			node: {
				lineItem: {
					id: string;
				};
				quantity: number;
			};
		}>;
	};
	transactions?: ShopifyTransaction[];
	totalRefundedSet?: { shopMoney: ShopifyMoney };
	note?: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Shopify Transaction (Payment)
 */
export interface ShopifyTransaction {
	id: string;
	kind: "SALE" | "CAPTURE" | "AUTHORIZATION" | "VOID" | "REFUND";
	status: "SUCCESS" | "FAILURE" | "PENDING" | "ERROR";
	gateway: string;
	amountSet: { shopMoney: ShopifyMoney };
	processedAt?: string;
}

/**
 * Shopify Customer (GraphQL/REST API)
 */
export interface ShopifyCustomer {
	id: string;
	email?: string | null;
	phone?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	displayName?: string;

	// Account status
	state?: "DISABLED" | "ENABLED" | "INVITED" | "DECLINED";
	verifiedEmail?: boolean;

	// Marketing consent
	emailMarketingConsent?: {
		marketingState: "SUBSCRIBED" | "UNSUBSCRIBED" | "NOT_SUBSCRIBED";
		marketingOptInLevel?: "SINGLE_OPT_IN" | "CONFIRMED_OPT_IN" | null;
		consentUpdatedAt?: string | null;
	};
	smsMarketingConsent?: {
		marketingState: "SUBSCRIBED" | "UNSUBSCRIBED" | "NOT_SUBSCRIBED";
		marketingOptInLevel?: "SINGLE_OPT_IN" | "CONFIRMED_OPT_IN" | null;
		consentUpdatedAt?: string | null;
	};

	// Addresses
	addresses?: {
		edges: Array<{
			node: ShopifyMailingAddress;
		}>;
	};
	defaultAddress?: ShopifyMailingAddress | null;

	// Tags
	tags?: string[];

	// Metadata
	metafields?: ShopifyMetafield[];
	note?: string | null;

	// Order statistics
	numberOfOrders?: number;
	amountSpent?: ShopifyMoney;
	lifetimeDuration?: string | null;

	// Tax
	taxExempt?: boolean;
	taxExemptions?: string[];

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

/**
 * Shopify Collection (GraphQL/REST API)
 */
export interface ShopifyCollection {
	id: string;
	title: string;
	description?: string | null;
	descriptionHtml?: string | null;
	handle: string;

	// Image
	image?: {
		url: string;
		altText?: string | null;
	};

	// Products
	products?: {
		edges: Array<{
			node: {
				id: string;
			};
		}>;
	};

	// Smart collection rules
	ruleSet?: {
		rules: Array<{
			column: string;
			relation: string;
			condition: string;
		}>;
	};

	// SEO
	seo?: {
		title?: string | null;
		description?: string | null;
	};

	// Metadata
	metafields?: ShopifyMetafield[];

	// Timestamps
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// TYPE DEFINITIONS - ONE Platform Types
// ============================================================================

/**
 * Generic ONE Thing input (used for creation)
 */
export interface ONEThingInput {
	groupId: string; // Id<'groups'>
	type: string;
	name: string;
	slug: string;
	description?: string;
	properties: Record<string, any>;
	createdBy?: string; // Id<'things'>
}

/**
 * ONE Connection input
 */
export interface ONEConnectionInput {
	groupId: string;
	fromThingId: string;
	toThingId: string;
	relationshipType: string;
	metadata?: Record<string, any>;
}

/**
 * ONE Event input
 */
export interface ONEEventInput {
	groupId: string;
	type: string;
	actorId?: string | null;
	targetId?: string | null;
	metadata?: Record<string, any>;
	timestamp?: number;
}

/**
 * ONE Knowledge input
 */
export interface ONEKnowledgeInput {
	groupId: string;
	sourceThingId: string;
	knowledgeType: "label" | "chunk" | "embedding";
	text: string;
	labels?: string[];
	vector?: number[];
}

// ============================================================================
// CYCLE 23: SHOPIFY → ONE TRANSFORMATIONS
// ============================================================================

// ----------------------------------------------------------------------------
// 1. PRODUCT TRANSFORMATIONS
// ----------------------------------------------------------------------------

/**
 * Transforms Shopify Product to ONE Thing (type: "product")
 *
 * @see /one/things/shopify-product-mapping.md
 *
 * @example
 * const productThing = transformShopifyProduct(shopifyProduct, groupId);
 */
export function transformShopifyProduct(
	shopifyProduct: ShopifyProduct,
	groupId: string
): Effect.Effect<ONEThingInput, TransformationError | MissingDataError> {
	return Effect.gen(function* () {
		// Validate required fields
		yield* validateRequired(shopifyProduct.id, "id", "Product");
		yield* validateRequired(shopifyProduct.title, "title", "Product");
		yield* validateRequired(shopifyProduct.handle, "handle", "Product");

		// Extract images
		const images: Array<{ url: string; altText?: string; position: number }> = [];

		if (shopifyProduct.images?.edges) {
			shopifyProduct.images.edges.forEach((edge, index) => {
				images.push({
					url: edge.node.url,
					altText: edge.node.altText || undefined,
					position: index + 1,
				});
			});
		} else if (shopifyProduct.media?.edges) {
			shopifyProduct.media.edges
				.filter((edge) => edge.node.__typename === "MediaImage" || edge.node.image)
				.forEach((edge, index) => {
					images.push({
						url: edge.node.image!.url,
						altText: edge.node.alt || undefined,
						position: index + 1,
					});
				});
		}

		// Build product Thing
		const thing: ONEThingInput = {
			groupId,
			type: "product",
			name: shopifyProduct.title,
			slug: shopifyProduct.handle,
			description: stripHtml(shopifyProduct.descriptionHtml || shopifyProduct.description),

			properties: {
				// Shopify identifiers
				shopifyId: extractNumericId(shopifyProduct.id),
				shopifyHandle: shopifyProduct.handle,

				// Status
				status: shopifyProduct.status.toLowerCase() as "active" | "archived" | "draft",

				// Categorization
				vendor: shopifyProduct.vendor || undefined,
				productType: shopifyProduct.productType || undefined,

				// Options (up to 3)
				options: shopifyProduct.options?.map((opt) => ({
					name: opt.name,
					position: opt.position,
					values: opt.values,
				})) || [],

				// Price range
				priceRange: shopifyProduct.priceRangeV2 ? {
					min: parseMoney(shopifyProduct.priceRangeV2.minVariantPrice),
					max: parseMoney(shopifyProduct.priceRangeV2.maxVariantPrice),
					currency: shopifyProduct.priceRangeV2.minVariantPrice.currencyCode,
				} : undefined,

				// Inventory
				totalInventory: shopifyProduct.totalInventory ?? undefined,
				tracksInventory: shopifyProduct.tracksInventory ?? false,

				// SEO
				seo: shopifyProduct.seo ? {
					title: shopifyProduct.seo.title || undefined,
					description: shopifyProduct.seo.description || undefined,
				} : undefined,

				// Media
				images,
				featuredImage: shopifyProduct.featuredImage ? {
					url: shopifyProduct.featuredImage.url,
					altText: shopifyProduct.featuredImage.altText || undefined,
				} : undefined,

				// Metadata
				metafields: transformMetafields(shopifyProduct.metafields),

				// Timestamps
				shopifyCreatedAt: shopifyProduct.createdAt,
				shopifyUpdatedAt: shopifyProduct.updatedAt,
				shopifyPublishedAt: shopifyProduct.publishedAt || undefined,
			},
		};

		return thing;
	});
}

/**
 * Transforms Shopify ProductVariant to ONE Thing (type: "product_variant")
 *
 * @see /one/things/shopify-product-mapping.md#product-variant-mapping
 *
 * @example
 * const variantThing = transformShopifyVariant(shopifyVariant, productId, groupId);
 */
export function transformShopifyVariant(
	shopifyVariant: ShopifyProductVariant,
	productHandle: string,
	groupId: string
): Effect.Effect<ONEThingInput, TransformationError | MissingDataError> {
	return Effect.gen(function* () {
		// Validate required fields
		yield* validateRequired(shopifyVariant.id, "id", "ProductVariant");
		yield* validateRequired(shopifyVariant.title, "title", "ProductVariant");

		// Generate variant slug
		const variantSlug = generateVariantSlug(productHandle, shopifyVariant.selectedOptions);

		// Build variant Thing
		const thing: ONEThingInput = {
			groupId,
			type: "product_variant",
			name: shopifyVariant.title,
			slug: variantSlug,

			properties: {
				// Shopify identifiers
				shopifyId: extractNumericId(shopifyVariant.id),
				shopifyProductId: shopifyVariant.product ? extractNumericId(shopifyVariant.product.id) : undefined,

				// SKU & Barcode
				sku: shopifyVariant.sku || undefined,
				barcode: shopifyVariant.barcode || undefined,

				// Pricing
				price: parseMoney(shopifyVariant.price),
				compareAtPrice: shopifyVariant.compareAtPrice ? parseMoney(shopifyVariant.compareAtPrice) : undefined,
				currency: shopifyVariant.price.currencyCode,

				// Discount percentage (if compareAtPrice exists)
				discountPercentage: shopifyVariant.compareAtPrice
					? calculateDiscountPercentage(
							parseMoney(shopifyVariant.compareAtPrice),
							parseMoney(shopifyVariant.price)
					  )
					: undefined,

				// Selected options
				selectedOptions: shopifyVariant.selectedOptions.map((opt) => ({
					name: opt.name,
					value: opt.value,
				})),

				// Inventory
				inventoryQuantity: shopifyVariant.inventoryQuantity,
				inventoryPolicy: shopifyVariant.inventoryPolicy?.toLowerCase() as "deny" | "continue" | undefined,
				inventoryManagement: shopifyVariant.inventoryManagement || undefined,
				availableForSale: shopifyVariant.availableForSale ?? true,

				// Physical properties
				weight: shopifyVariant.weight ?? undefined,
				weightUnit: shopifyVariant.weightUnit?.toLowerCase() as "kg" | "lb" | "oz" | "g" | undefined,
				requiresShipping: shopifyVariant.requiresShipping ?? true,

				// Media
				image: shopifyVariant.image ? {
					url: shopifyVariant.image.url,
					altText: shopifyVariant.image.altText || undefined,
				} : undefined,

				// Position
				position: shopifyVariant.position ?? 1,

				// Metadata
				metafields: transformMetafields(shopifyVariant.metafields),

				// Timestamps
				shopifyCreatedAt: shopifyVariant.createdAt,
				shopifyUpdatedAt: shopifyVariant.updatedAt,
			},
		};

		return thing;
	});
}

// ----------------------------------------------------------------------------
// 2. ORDER TRANSFORMATIONS (→ Connections + Events)
// ----------------------------------------------------------------------------

/**
 * Transforms Shopify Order line items to ONE Connections (type: "purchased")
 *
 * Each line item becomes a separate "purchased" connection from customer to variant.
 *
 * @see /one/connections/shopify-order-flow.md#connection-mapping
 *
 * @example
 * const connections = transformOrderToConnections(shopifyOrder, customerId, groupId);
 */
export function transformOrderToConnections(
	shopifyOrder: ShopifyOrder,
	customerId: string | null,
	groupId: string
): Effect.Effect<ONEConnectionInput[], TransformationError> {
	return Effect.gen(function* () {
		const connections: ONEConnectionInput[] = [];

		// Skip if no customer (guest checkout) or no line items
		if (!customerId || !shopifyOrder.lineItems?.edges) {
			return connections;
		}

		for (const lineItemEdge of shopifyOrder.lineItems.edges) {
			const item = lineItemEdge.node;

			// Skip if variant was deleted
			if (!item.variant) {
				continue;
			}

			// Create "purchased" connection for each line item
			connections.push({
				groupId,
				fromThingId: customerId,
				toThingId: `variant-${extractNumericId(item.variant.id)}`, // TODO: Replace with actual variant Thing ID

				relationshipType: "purchased",

				metadata: {
					// Order identification
					shopifyOrderId: extractNumericId(shopifyOrder.id),
					orderNumber: shopifyOrder.name,
					orderName: shopifyOrder.name.replace("#", ""),

					// Line item details
					shopifyLineItemId: extractNumericId(item.id),
					quantity: item.quantity,
					currentQuantity: item.currentQuantity ?? item.quantity,

					// Pricing
					unitPrice: item.discountedUnitPriceSet
						? parseMoney(item.discountedUnitPriceSet.shopMoney)
						: undefined,
					totalPrice: parseMoney(item.discountedTotalSet.shopMoney),
					currency: item.discountedTotalSet.shopMoney.currencyCode,

					// Product snapshot
					productTitle: item.title,
					variantTitle: item.variantTitle || item.variant.title,
					sku: item.sku || item.variant.sku || undefined,

					// Fulfillment status
					fulfillmentStatus: item.fulfillmentStatus || "unfulfilled",
					fulfillableQuantity: item.fulfillableQuantity ?? item.quantity,

					// Flags
					requiresShipping: item.requiresShipping ?? true,
					taxable: item.taxable ?? true,

					// Timestamp
					purchasedAt: shopifyOrder.processedAt || shopifyOrder.createdAt,
				},
			});
		}

		return connections;
	});
}

/**
 * Transforms Shopify Order to ONE Event (type: "order_placed")
 *
 * @see /one/connections/shopify-order-flow.md#event-mapping
 */
export function transformOrderToPlacedEvent(
	shopifyOrder: ShopifyOrder,
	customerId: string | null,
	groupId: string
): Effect.Effect<ONEEventInput, TransformationError> {
	return Effect.gen(function* () {
		// Count total items
		const itemCount = shopifyOrder.lineItems.edges.reduce(
			(sum, edge) => sum + edge.node.quantity,
			0
		);

		// Extract line items summary
		const lineItems = shopifyOrder.lineItems.edges.map((edge) => ({
			productId: edge.node.variant?.product?.id
				? extractNumericId(edge.node.variant.product.id)
				: undefined,
			variantId: edge.node.variant?.id ? extractNumericId(edge.node.variant.id) : undefined,
			quantity: edge.node.quantity,
			price: parseMoney(edge.node.discountedTotalSet.shopMoney),
		}));

		const event: ONEEventInput = {
			groupId,
			type: "order_placed",
			actorId: customerId,

			metadata: {
				// Order identification
				shopifyOrderId: extractNumericId(shopifyOrder.id),
				orderNumber: shopifyOrder.name,
				orderName: shopifyOrder.name.replace("#", ""),

				// Customer info
				customerEmail: shopifyOrder.email || undefined,
				customerPhone: shopifyOrder.phone || undefined,

				// Financial summary
				subtotal: shopifyOrder.subtotalPriceSet ? parseMoney(shopifyOrder.subtotalPriceSet.shopMoney) : 0,
				tax: shopifyOrder.totalTaxSet ? parseMoney(shopifyOrder.totalTaxSet.shopMoney) : 0,
				shipping: shopifyOrder.totalShippingPriceSet
					? parseMoney(shopifyOrder.totalShippingPriceSet.shopMoney)
					: 0,
				discount: shopifyOrder.totalDiscountsSet ? parseMoney(shopifyOrder.totalDiscountsSet.shopMoney) : 0,
				total: parseMoney(shopifyOrder.totalPriceSet.shopMoney),
				currency: shopifyOrder.currencyCode || shopifyOrder.totalPriceSet.shopMoney.currencyCode,

				// Line items summary
				itemCount,
				lineItems,

				// Addresses
				shippingAddress: shopifyOrder.shippingAddress
					? transformAddress(shopifyOrder.shippingAddress)
					: undefined,
				billingAddress: shopifyOrder.billingAddress
					? transformAddress(shopifyOrder.billingAddress)
					: undefined,

				// Flags
				isTest: shopifyOrder.test ?? false,
				confirmed: shopifyOrder.confirmed ?? true,

				// Timestamps
				shopifyCreatedAt: shopifyOrder.createdAt,
				shopifyProcessedAt: shopifyOrder.processedAt || shopifyOrder.createdAt,
			},

			timestamp: parseTimestamp(shopifyOrder.processedAt || shopifyOrder.createdAt),
		};

		return event;
	});
}

/**
 * Transforms Shopify Order transactions to ONE Events (type: "payment_processed", etc.)
 */
export function transformTransactionsToEvents(
	shopifyOrder: ShopifyOrder,
	customerId: string | null,
	groupId: string
): Effect.Effect<ONEEventInput[], TransformationError> {
	return Effect.gen(function* () {
		const events: ONEEventInput[] = [];

		if (!shopifyOrder.transactions) {
			return events;
		}

		for (const tx of shopifyOrder.transactions) {
			// Only create events for successful transactions
			if (tx.status !== "SUCCESS") {
				continue;
			}

			// Map transaction kind to event type
			const eventType = tx.kind === "SALE" || tx.kind === "CAPTURE"
				? "payment_processed"
				: tx.kind === "AUTHORIZATION"
				? "payment_authorized"
				: tx.kind === "REFUND"
				? "payment_refunded"
				: "payment_voided";

			events.push({
				groupId,
				type: eventType,
				actorId: customerId,

				metadata: {
					// Order
					shopifyOrderId: extractNumericId(shopifyOrder.id),
					orderNumber: shopifyOrder.name,

					// Transaction
					shopifyTransactionId: extractNumericId(tx.id),
					transactionKind: tx.kind.toLowerCase(),
					transactionStatus: tx.status.toLowerCase(),

					// Payment details
					amount: parseMoney(tx.amountSet.shopMoney),
					currency: tx.amountSet.shopMoney.currencyCode,
					gateway: tx.gateway,

					// Timestamp
					processedAt: tx.processedAt,
				},

				timestamp: tx.processedAt ? parseTimestamp(tx.processedAt) : Date.now(),
			});
		}

		return events;
	});
}

/**
 * Transforms Shopify Fulfillments to ONE Events (type: "order_fulfilled")
 */
export function transformFulfillmentsToEvents(
	shopifyOrder: ShopifyOrder,
	groupId: string
): Effect.Effect<ONEEventInput[], TransformationError> {
	return Effect.gen(function* () {
		const events: ONEEventInput[] = [];

		if (!shopifyOrder.fulfillments) {
			return events;
		}

		for (const fulfillment of shopifyOrder.fulfillments) {
			// Extract line items fulfilled
			const lineItemsFulfilled = fulfillment.fulfillmentLineItems?.edges.map((edge) => ({
				lineItemId: extractNumericId(edge.node.lineItem.id),
				quantity: edge.node.quantity,
			})) || [];

			events.push({
				groupId,
				type: "order_fulfilled",
				actorId: null, // TODO: Get staff member who fulfilled

				metadata: {
					// Order
					shopifyOrderId: extractNumericId(shopifyOrder.id),
					orderNumber: shopifyOrder.name,

					// Fulfillment
					shopifyFulfillmentId: extractNumericId(fulfillment.id),
					fulfillmentStatus: fulfillment.status.toLowerCase(),

					// Tracking
					trackingCompany: fulfillment.trackingInfo?.[0]?.company || undefined,
					trackingNumber: fulfillment.trackingInfo?.[0]?.number || undefined,
					trackingUrl: fulfillment.trackingInfo?.[0]?.url || undefined,

					// Line items
					lineItemsFulfilled,

					// Timestamps
					fulfilledAt: fulfillment.createdAt,
					deliveredAt: fulfillment.deliveredAt || undefined,
				},

				timestamp: parseTimestamp(fulfillment.createdAt),
			});
		}

		return events;
	});
}

/**
 * Transforms Shopify Refunds to ONE Events (type: "order_refunded")
 */
export function transformRefundsToEvents(
	shopifyOrder: ShopifyOrder,
	groupId: string
): Effect.Effect<ONEEventInput[], TransformationError> {
	return Effect.gen(function* () {
		const events: ONEEventInput[] = [];

		if (!shopifyOrder.refunds) {
			return events;
		}

		for (const refund of shopifyOrder.refunds) {
			// Extract line items refunded
			const lineItemsRefunded = refund.refundLineItems?.edges.map((edge) => ({
				lineItemId: extractNumericId(edge.node.lineItem.id),
				quantity: edge.node.quantity,
			})) || [];

			// Extract refund transactions
			const refundTransactions = refund.transactions?.map((tx) => ({
				transactionId: extractNumericId(tx.id),
				amount: parseMoney(tx.amountSet.shopMoney),
				gateway: tx.gateway,
			})) || [];

			events.push({
				groupId,
				type: "order_refunded",
				actorId: null, // TODO: Get staff member who processed refund

				metadata: {
					// Order
					shopifyOrderId: extractNumericId(shopifyOrder.id),
					orderNumber: shopifyOrder.name,

					// Refund
					shopifyRefundId: extractNumericId(refund.id),
					refundAmount: refund.totalRefundedSet ? parseMoney(refund.totalRefundedSet.shopMoney) : 0,
					currency: refund.totalRefundedSet?.shopMoney.currencyCode || "USD",
					refundReason: undefined, // Not in API
					note: refund.note || undefined,

					// Line items
					lineItemsRefunded,

					// Transactions
					refundTransactions,

					// Timestamp
					refundedAt: refund.createdAt,
				},

				timestamp: parseTimestamp(refund.createdAt),
			});
		}

		return events;
	});
}

// ----------------------------------------------------------------------------
// 3. CUSTOMER TRANSFORMATIONS (→ Thing with role: "customer")
// ----------------------------------------------------------------------------

/**
 * Transforms Shopify Customer to ONE Thing (type: "creator", role: "customer")
 *
 * @see /one/people/shopify-customer-mapping.md
 *
 * @example
 * const customerThing = transformShopifyCustomer(shopifyCustomer, groupId);
 */
export function transformShopifyCustomer(
	shopifyCustomer: ShopifyCustomer,
	groupId: string
): Effect.Effect<ONEThingInput, TransformationError | MissingDataError> {
	return Effect.gen(function* () {
		// Validate required fields
		yield* validateRequired(shopifyCustomer.id, "id", "Customer");

		// Generate customer name and slug
		const name = shopifyCustomer.displayName
			|| `${shopifyCustomer.firstName || ""} ${shopifyCustomer.lastName || ""}`.trim()
			|| shopifyCustomer.email
			|| shopifyCustomer.phone
			|| "Guest";

		const slug = shopifyCustomer.email
			? generateSlug(shopifyCustomer.email)
			: shopifyCustomer.phone
			? `phone-${shopifyCustomer.phone.replace(/\D/g, "")}`
			: `customer-${extractNumericId(shopifyCustomer.id)}`;

		// Transform addresses
		const addresses: ONEAddress[] = [];
		if (shopifyCustomer.addresses?.edges) {
			for (const edge of shopifyCustomer.addresses.edges) {
				const isDefault = shopifyCustomer.defaultAddress
					? edge.node.id === shopifyCustomer.defaultAddress.id
					: false;
				addresses.push(transformAddress(edge.node, isDefault));
			}
		}

		// Build customer Thing
		const thing: ONEThingInput = {
			groupId,
			type: "creator",
			name,
			slug,

			properties: {
				// Role (People dimension)
				role: "customer",

				// Shopify identifiers
				shopifyId: extractNumericId(shopifyCustomer.id),

				// Contact info
				email: shopifyCustomer.email || undefined,
				phone: shopifyCustomer.phone || undefined,
				firstName: shopifyCustomer.firstName || undefined,
				lastName: shopifyCustomer.lastName || undefined,
				displayName: shopifyCustomer.displayName || name,

				// Account status
				accountState: shopifyCustomer.state?.toLowerCase() as "disabled" | "enabled" | "invited" | "declined" | undefined || "enabled",
				verifiedEmail: shopifyCustomer.verifiedEmail ?? false,

				// Marketing consent
				marketing: {
					email: shopifyCustomer.emailMarketingConsent ? {
						state: shopifyCustomer.emailMarketingConsent.marketingState.toLowerCase() as "subscribed" | "unsubscribed" | "not_subscribed",
						optInLevel: shopifyCustomer.emailMarketingConsent.marketingOptInLevel?.toLowerCase() as "single_opt_in" | "confirmed_opt_in" | null,
						consentUpdatedAt: shopifyCustomer.emailMarketingConsent.consentUpdatedAt || undefined,
					} : {
						state: "not_subscribed" as const,
						optInLevel: null,
					},
					sms: shopifyCustomer.smsMarketingConsent ? {
						state: shopifyCustomer.smsMarketingConsent.marketingState.toLowerCase() as "subscribed" | "unsubscribed" | "not_subscribed",
						optInLevel: shopifyCustomer.smsMarketingConsent.marketingOptInLevel?.toLowerCase() as "single_opt_in" | "confirmed_opt_in" | null,
						consentUpdatedAt: shopifyCustomer.smsMarketingConsent.consentUpdatedAt || undefined,
					} : {
						state: "not_subscribed" as const,
						optInLevel: null,
					},
				},

				// Addresses
				addresses,
				defaultAddress: shopifyCustomer.defaultAddress
					? transformAddress(shopifyCustomer.defaultAddress, true)
					: undefined,

				// Merchant notes
				note: shopifyCustomer.note || undefined,

				// Order statistics
				orderCount: shopifyCustomer.numberOfOrders ?? 0,
				totalSpent: shopifyCustomer.amountSpent ? parseMoney(shopifyCustomer.amountSpent) : 0,
				currency: shopifyCustomer.amountSpent?.currencyCode || "USD",
				lifetimeDuration: shopifyCustomer.lifetimeDuration || undefined,

				// Tax
				taxExempt: shopifyCustomer.taxExempt ?? false,
				taxExemptions: shopifyCustomer.taxExemptions || [],

				// Metadata
				metafields: transformMetafields(shopifyCustomer.metafields),

				// Timestamps
				shopifyCreatedAt: shopifyCustomer.createdAt,
				shopifyUpdatedAt: shopifyCustomer.updatedAt,
			},
		};

		return thing;
	});
}

/**
 * Transforms Shopify Customer tags to ONE Knowledge labels
 */
export function transformCustomerTagsToKnowledge(
	shopifyCustomer: ShopifyCustomer,
	customerThingId: string,
	groupId: string
): ONEKnowledgeInput[] {
	if (!shopifyCustomer.tags || shopifyCustomer.tags.length === 0) {
		return [];
	}

	return shopifyCustomer.tags.map((tag) => ({
		groupId,
		sourceThingId: customerThingId,
		knowledgeType: "label" as const,
		text: tag,
		labels: ["customer_tag", "shopify"],
	}));
}

// ----------------------------------------------------------------------------
// 4. COLLECTION TRANSFORMATIONS (→ Group)
// ----------------------------------------------------------------------------

/**
 * Transforms Shopify Collection to ONE Group (type: "collection")
 *
 * Collections are mapped to Groups in ONE to represent product categorization.
 */
export function transformShopifyCollection(
	shopifyCollection: ShopifyCollection,
	parentGroupId: string
): Effect.Effect<Omit<ONEThingInput, "type"> & { type: string; parentGroupId?: string }, TransformationError | MissingDataError> {
	return Effect.gen(function* () {
		// Validate required fields
		yield* validateRequired(shopifyCollection.id, "id", "Collection");
		yield* validateRequired(shopifyCollection.title, "title", "Collection");

		// Build collection as Group
		const group = {
			groupId: parentGroupId,
			type: "collection", // Group type
			parentGroupId, // Nested under store group
			name: shopifyCollection.title,
			slug: shopifyCollection.handle,
			description: stripHtml(shopifyCollection.descriptionHtml || shopifyCollection.description),

			properties: {
				// Shopify identifiers
				shopifyId: extractNumericId(shopifyCollection.id),
				shopifyHandle: shopifyCollection.handle,

				// Image
				image: shopifyCollection.image ? {
					url: shopifyCollection.image.url,
					altText: shopifyCollection.image.altText || undefined,
				} : undefined,

				// Product count
				productCount: shopifyCollection.products?.edges.length || 0,

				// Smart collection rules (if applicable)
				ruleSet: shopifyCollection.ruleSet ? {
					rules: shopifyCollection.ruleSet.rules.map((rule) => ({
						column: rule.column,
						relation: rule.relation,
						condition: rule.condition,
					})),
				} : undefined,

				// SEO
				seo: shopifyCollection.seo ? {
					title: shopifyCollection.seo.title || undefined,
					description: shopifyCollection.seo.description || undefined,
				} : undefined,

				// Metadata
				metafields: transformMetafields(shopifyCollection.metafields),

				// Timestamps
				shopifyCreatedAt: shopifyCollection.createdAt,
				shopifyUpdatedAt: shopifyCollection.updatedAt,
			},
		};

		return group;
	});
}

/**
 * Creates connections from products to collection (type: "belongs_to")
 */
export function transformCollectionProductConnections(
	shopifyCollection: ShopifyCollection,
	collectionGroupId: string,
	groupId: string
): ONEConnectionInput[] {
	if (!shopifyCollection.products?.edges) {
		return [];
	}

	return shopifyCollection.products.edges.map((edge) => ({
		groupId,
		fromThingId: `product-${extractNumericId(edge.node.id)}`, // TODO: Replace with actual product Thing ID
		toThingId: collectionGroupId,
		relationshipType: "belongs_to",
		metadata: {
			shopifyCollectionId: extractNumericId(shopifyCollection.id),
			collectionHandle: shopifyCollection.handle,
		},
	}));
}

// ----------------------------------------------------------------------------
// 5. INVENTORY TRANSFORMATIONS
// ----------------------------------------------------------------------------

/**
 * Updates variant inventory properties from Shopify inventory levels
 */
export function transformInventoryLevels(
	inventoryLevel: {
		location: { id: string; name: string };
		available: number;
	},
	variantProperties: Record<string, any>
): Record<string, any> {
	return {
		...variantProperties,
		inventoryQuantity: inventoryLevel.available,
		inventoryLocation: {
			shopifyId: extractNumericId(inventoryLevel.location.id),
			name: inventoryLevel.location.name,
		},
		availableForSale: inventoryLevel.available > 0,
	};
}

// ----------------------------------------------------------------------------
// 6. CHECKOUT/CART TRANSFORMATIONS
// ----------------------------------------------------------------------------

/**
 * Transforms Shopify Cart line items to ONE Connections (type: "in_cart")
 */
export function transformCartToConnections(
	cartLineItems: Array<{
		id: string;
		quantity: number;
		merchandise: {
			id: string; // variant ID
		};
	}>,
	customerId: string,
	groupId: string
): ONEConnectionInput[] {
	return cartLineItems.map((item) => ({
		groupId,
		fromThingId: customerId,
		toThingId: `variant-${extractNumericId(item.merchandise.id)}`, // TODO: Replace with actual variant Thing ID
		relationshipType: "in_cart",
		metadata: {
			shopifyCartLineItemId: extractNumericId(item.id),
			quantity: item.quantity,
			addedAt: new Date().toISOString(),
		},
	}));
}

/**
 * Transforms Shopify Checkout to a sequence of Events
 */
export function transformCheckoutToEvents(
	checkout: {
		id: string;
		email?: string | null;
		lineItems: Array<{
			id: string;
			quantity: number;
			variant: { id: string };
		}>;
		totalPrice: ShopifyMoney;
		createdAt: string;
		completedAt?: string | null;
	},
	customerId: string | null,
	groupId: string
): ONEEventInput[] {
	const events: ONEEventInput[] = [];

	// Checkout created event
	events.push({
		groupId,
		type: "checkout_created",
		actorId: customerId,
		metadata: {
			shopifyCheckoutId: extractNumericId(checkout.id),
			email: checkout.email || undefined,
			itemCount: checkout.lineItems.reduce((sum, item) => sum + item.quantity, 0),
			total: parseMoney(checkout.totalPrice),
			currency: checkout.totalPrice.currencyCode,
			shopifyCreatedAt: checkout.createdAt,
		},
		timestamp: parseTimestamp(checkout.createdAt),
	});

	// Checkout completed event (if completed)
	if (checkout.completedAt) {
		events.push({
			groupId,
			type: "checkout_completed",
			actorId: customerId,
			metadata: {
				shopifyCheckoutId: extractNumericId(checkout.id),
				shopifyCompletedAt: checkout.completedAt,
			},
			timestamp: parseTimestamp(checkout.completedAt),
		});
	}

	return events;
}

// ============================================================================
// EXPORT ALL TRANSFORMATIONS
// ============================================================================

export const ShopifyToONETransformers = {
	// Products
	transformShopifyProduct,
	transformShopifyVariant,

	// Orders
	transformOrderToConnections,
	transformOrderToPlacedEvent,
	transformTransactionsToEvents,
	transformFulfillmentsToEvents,
	transformRefundsToEvents,

	// Customers
	transformShopifyCustomer,
	transformCustomerTagsToKnowledge,

	// Collections
	transformShopifyCollection,
	transformCollectionProductConnections,

	// Inventory
	transformInventoryLevels,

	// Checkout/Cart
	transformCartToConnections,
	transformCheckoutToEvents,
} as const;
