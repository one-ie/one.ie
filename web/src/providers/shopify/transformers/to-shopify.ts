/**
 * ONE → Shopify Reverse Transformations
 *
 * Transforms ONE Platform entities back into Shopify API input formats for
 * creating and updating Shopify resources.
 *
 * @see /one/things/shopify-product-mapping.md - Product/Variant mapping
 * @see /one/connections/shopify-order-flow.md - Order/Connection mapping
 * @see /one/people/shopify-customer-mapping.md - Customer/People mapping
 */

import { Effect } from "effect";
import {
	formatToGid,
	formatMoney,
	transformToShopifyAddress,
	transformToShopifyMetafields,
	formatTimestamp,
	validateRequired,
	type ShopifyMoney,
	type ShopifyMailingAddress,
	type ShopifyMetafield,
	type ONEAddress,
	type ONEMetafields,
	TransformationError,
	ValidationError,
	MissingDataError,
} from "./utils";
import type { ONEThingInput, ONEConnectionInput, ONEEventInput } from "./to-one";

// ============================================================================
// TYPE DEFINITIONS - Shopify Input Types
// ============================================================================

/**
 * Shopify Product Input (for creation/update via GraphQL/REST)
 */
export interface ShopifyProductInput {
	title: string;
	descriptionHtml?: string;
	handle?: string;
	status?: "ACTIVE" | "ARCHIVED" | "DRAFT";
	vendor?: string;
	productType?: string;
	tags?: string[];

	// Options
	options?: Array<{
		name: string;
		values: string[];
	}>;

	// SEO
	seo?: {
		title?: string;
		description?: string;
	};

	// Images
	images?: Array<{
		src: string;
		alt?: string;
	}>;

	// Metafields
	metafields?: ShopifyMetafield[];
}

/**
 * Shopify ProductVariant Input (for creation/update)
 */
export interface ShopifyProductVariantInput {
	title?: string;
	sku?: string;
	barcode?: string;

	// Pricing
	price: string;
	compareAtPrice?: string | null;

	// Inventory
	inventoryQuantity?: number;
	inventoryPolicy?: "DENY" | "CONTINUE";
	inventoryManagement?: "SHOPIFY" | "NOT_MANAGED";

	// Options
	options?: string[];

	// Physical properties
	weight?: number;
	weightUnit?: "KILOGRAMS" | "GRAMS" | "POUNDS" | "OUNCES";
	requiresShipping?: boolean;

	// Image
	imageSrc?: string;

	// Position
	position?: number;

	// Metafields
	metafields?: ShopifyMetafield[];
}

/**
 * Shopify Customer Input (for creation/update)
 */
export interface ShopifyCustomerInput {
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;

	// Addresses
	addresses?: Partial<ShopifyMailingAddress>[];

	// Tags
	tags?: string[];

	// Marketing consent
	emailMarketingConsent?: {
		marketingState: "SUBSCRIBED" | "UNSUBSCRIBED";
		marketingOptInLevel?: "SINGLE_OPT_IN" | "CONFIRMED_OPT_IN";
	};
	smsMarketingConsent?: {
		marketingState: "SUBSCRIBED" | "UNSUBSCRIBED";
		marketingOptInLevel?: "SINGLE_OPT_IN" | "CONFIRMED_OPT_IN";
	};

	// Note
	note?: string;

	// Tax
	taxExempt?: boolean;
	taxExemptions?: string[];

	// Metafields
	metafields?: ShopifyMetafield[];
}

/**
 * Shopify DraftOrder Input (for creating draft orders)
 */
export interface ShopifyDraftOrderInput {
	email?: string;
	phone?: string;

	// Customer
	customerId?: string;

	// Line items
	lineItems: Array<{
		variantId?: string;
		quantity: number;
		originalUnitPrice?: string;
		appliedDiscount?: {
			value: number;
			valueType: "PERCENTAGE" | "FIXED_AMOUNT";
			description?: string;
		};
	}>;

	// Shipping address
	shippingAddress?: Partial<ShopifyMailingAddress>;

	// Billing address
	billingAddress?: Partial<ShopifyMailingAddress>;

	// Note
	note?: string;

	// Tax exempt
	taxExempt?: boolean;

	// Currency
	presentmentCurrencyCode?: string;

	// Tags
	tags?: string[];
}

/**
 * Shopify Collection Input (for creation/update)
 */
export interface ShopifyCollectionInput {
	title: string;
	descriptionHtml?: string;
	handle?: string;

	// Image
	image?: {
		src: string;
		alt?: string;
	};

	// Rules (for smart collections)
	ruleSet?: {
		rules: Array<{
			column: string;
			relation: string;
			condition: string;
		}>;
	};

	// SEO
	seo?: {
		title?: string;
		description?: string;
	};

	// Metafields
	metafields?: ShopifyMetafield[];
}

// ============================================================================
// CYCLE 24: ONE → SHOPIFY REVERSE TRANSFORMATIONS
// ============================================================================

// ----------------------------------------------------------------------------
// 1. PRODUCT REVERSE TRANSFORMATIONS
// ----------------------------------------------------------------------------

/**
 * Transforms ONE Product Thing to Shopify Product Input
 *
 * @example
 * const productInput = transformToShopifyProduct(productThing);
 */
export function transformToShopifyProduct(
	thing: ONEThingInput | (Omit<ONEThingInput, "groupId"> & { _id?: string })
): Effect.Effect<ShopifyProductInput, TransformationError | MissingDataError | ValidationError> {
	return Effect.gen(function* () {
		// Validate this is a product Thing
		if (thing.type !== "product") {
			return yield* Effect.fail(
				new ValidationError(`Expected type "product", got "${thing.type}"`)
			);
		}

		// Validate required fields
		yield* validateRequired(thing.name, "name", "Product");

		const props = thing.properties;

		// Build Shopify product input
		const input: ShopifyProductInput = {
			title: thing.name,
			descriptionHtml: thing.description ? `<p>${thing.description}</p>` : undefined,
			handle: thing.slug,
			status: props.status ? (props.status.toUpperCase() as "ACTIVE" | "ARCHIVED" | "DRAFT") : "ACTIVE",
			vendor: props.vendor,
			productType: props.productType,
			tags: [], // Tags from Knowledge labels

			// Options
			options: props.options?.map((opt: any) => ({
				name: opt.name,
				values: opt.values,
			})),

			// SEO
			seo: props.seo ? {
				title: props.seo.title,
				description: props.seo.description,
			} : undefined,

			// Images
			images: props.images?.map((img: any) => ({
				src: img.url,
				alt: img.altText,
			})),

			// Metafields
			metafields: transformToShopifyMetafields(props.metafields as ONEMetafields),
		};

		return input;
	});
}

/**
 * Transforms ONE ProductVariant Thing to Shopify ProductVariant Input
 *
 * @example
 * const variantInput = transformToShopifyVariant(variantThing);
 */
export function transformToShopifyVariant(
	thing: ONEThingInput | (Omit<ONEThingInput, "groupId"> & { _id?: string })
): Effect.Effect<ShopifyProductVariantInput, TransformationError | MissingDataError | ValidationError> {
	return Effect.gen(function* () {
		// Validate this is a product_variant Thing
		if (thing.type !== "product_variant") {
			return yield* Effect.fail(
				new ValidationError(`Expected type "product_variant", got "${thing.type}"`)
			);
		}

		// Validate required fields
		yield* validateRequired(thing.name, "name", "ProductVariant");

		const props = thing.properties;

		// Validate price
		if (typeof props.price !== "number") {
			return yield* Effect.fail(
				new ValidationError("Variant price must be a number", "price", props.price)
			);
		}

		// Build Shopify variant input
		const input: ShopifyProductVariantInput = {
			title: thing.name,
			sku: props.sku,
			barcode: props.barcode,

			// Pricing
			price: props.price.toFixed(2),
			compareAtPrice: props.compareAtPrice ? props.compareAtPrice.toFixed(2) : null,

			// Inventory
			inventoryQuantity: props.inventoryQuantity ?? 0,
			inventoryPolicy: props.inventoryPolicy === "deny" ? "DENY" : "CONTINUE",
			inventoryManagement: props.inventoryManagement ? "SHOPIFY" : "NOT_MANAGED",

			// Options (array of option values)
			options: props.selectedOptions?.map((opt: any) => opt.value),

			// Physical properties
			weight: props.weight,
			weightUnit: props.weightUnit ? props.weightUnit.toUpperCase() as "KILOGRAMS" | "GRAMS" | "POUNDS" | "OUNCES" : undefined,
			requiresShipping: props.requiresShipping ?? true,

			// Image
			imageSrc: props.image?.url,

			// Position
			position: props.position ?? 1,

			// Metafields
			metafields: transformToShopifyMetafields(props.metafields as ONEMetafields),
		};

		return input;
	});
}

/**
 * Validates product input before sending to Shopify
 */
export function validateProductInput(
	input: ShopifyProductInput
): Effect.Effect<ShopifyProductInput, ValidationError> {
	return Effect.gen(function* () {
		// Title is required
		if (!input.title || input.title.trim().length === 0) {
			return yield* Effect.fail(
				new ValidationError("Product title is required", "title", input.title)
			);
		}

		// Title max length (Shopify limit: 255 characters)
		if (input.title.length > 255) {
			return yield* Effect.fail(
				new ValidationError("Product title must be 255 characters or less", "title", input.title)
			);
		}

		// Validate options (max 3)
		if (input.options && input.options.length > 3) {
			return yield* Effect.fail(
				new ValidationError("Products can have at most 3 options", "options", input.options)
			);
		}

		return input;
	});
}

/**
 * Validates variant input before sending to Shopify
 */
export function validateVariantInput(
	input: ShopifyProductVariantInput
): Effect.Effect<ShopifyProductVariantInput, ValidationError> {
	return Effect.gen(function* () {
		// Price is required
		if (!input.price) {
			return yield* Effect.fail(
				new ValidationError("Variant price is required", "price", input.price)
			);
		}

		// Price must be positive
		const priceNum = parseFloat(input.price);
		if (isNaN(priceNum) || priceNum < 0) {
			return yield* Effect.fail(
				new ValidationError("Variant price must be a positive number", "price", input.price)
			);
		}

		// SKU max length (Shopify limit: 255 characters)
		if (input.sku && input.sku.length > 255) {
			return yield* Effect.fail(
				new ValidationError("SKU must be 255 characters or less", "sku", input.sku)
			);
		}

		// Barcode max length (Shopify limit: 255 characters)
		if (input.barcode && input.barcode.length > 255) {
			return yield* Effect.fail(
				new ValidationError("Barcode must be 255 characters or less", "barcode", input.barcode)
			);
		}

		return input;
	});
}

// ----------------------------------------------------------------------------
// 2. CUSTOMER REVERSE TRANSFORMATIONS
// ----------------------------------------------------------------------------

/**
 * Transforms ONE Customer Thing to Shopify Customer Input
 *
 * @example
 * const customerInput = transformToShopifyCustomer(customerThing);
 */
export function transformToShopifyCustomer(
	thing: ONEThingInput | (Omit<ONEThingInput, "groupId"> & { _id?: string })
): Effect.Effect<ShopifyCustomerInput, TransformationError | MissingDataError | ValidationError> {
	return Effect.gen(function* () {
		// Validate this is a customer Thing
		if (thing.type !== "creator" || thing.properties.role !== "customer") {
			return yield* Effect.fail(
				new ValidationError(`Expected type "creator" with role "customer"`)
			);
		}

		const props = thing.properties;

		// Build Shopify customer input
		const input: ShopifyCustomerInput = {
			email: props.email,
			phone: props.phone,
			firstName: props.firstName,
			lastName: props.lastName,

			// Addresses
			addresses: props.addresses?.map((addr: ONEAddress) =>
				transformToShopifyAddress(addr)
			),

			// Tags (will be populated from Knowledge labels)
			tags: [],

			// Marketing consent
			emailMarketingConsent: props.marketing?.email?.state === "subscribed" ? {
				marketingState: "SUBSCRIBED",
				marketingOptInLevel: props.marketing.email.optInLevel === "confirmed_opt_in"
					? "CONFIRMED_OPT_IN"
					: "SINGLE_OPT_IN",
			} : {
				marketingState: "UNSUBSCRIBED",
			},

			smsMarketingConsent: props.marketing?.sms?.state === "subscribed" ? {
				marketingState: "SUBSCRIBED",
				marketingOptInLevel: props.marketing.sms.optInLevel === "confirmed_opt_in"
					? "CONFIRMED_OPT_IN"
					: "SINGLE_OPT_IN",
			} : {
				marketingState: "UNSUBSCRIBED",
			},

			// Note
			note: props.note,

			// Tax
			taxExempt: props.taxExempt,
			taxExemptions: props.taxExemptions,

			// Metafields
			metafields: transformToShopifyMetafields(props.metafields as ONEMetafields),
		};

		return input;
	});
}

/**
 * Validates customer input before sending to Shopify
 */
export function validateCustomerInput(
	input: ShopifyCustomerInput
): Effect.Effect<ShopifyCustomerInput, ValidationError> {
	return Effect.gen(function* () {
		// Must have at least email or phone
		if (!input.email && !input.phone) {
			return yield* Effect.fail(
				new ValidationError("Customer must have either email or phone", "email/phone")
			);
		}

		// Validate email format if provided
		if (input.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(input.email)) {
				return yield* Effect.fail(
					new ValidationError("Invalid email format", "email", input.email)
				);
			}
		}

		// Validate phone format if provided
		if (input.phone) {
			const phoneDigits = input.phone.replace(/\D/g, "");
			if (phoneDigits.length < 10) {
				return yield* Effect.fail(
					new ValidationError("Phone number must have at least 10 digits", "phone", input.phone)
				);
			}
		}

		return input;
	});
}

// ----------------------------------------------------------------------------
// 3. ORDER REVERSE TRANSFORMATIONS (Draft Orders)
// ----------------------------------------------------------------------------

/**
 * Transforms ONE Connections + Events to Shopify DraftOrder Input
 *
 * Creates a draft order from purchase connections and order events.
 *
 * @example
 * const draftOrder = transformToDraftOrder(connections, orderEvent, groupId);
 */
export function transformToDraftOrder(
	connections: ONEConnectionInput[],
	orderEvent: ONEEventInput,
	customerId?: string
): Effect.Effect<ShopifyDraftOrderInput, TransformationError | ValidationError> {
	return Effect.gen(function* () {
		// Validate connections are purchases
		for (const conn of connections) {
			if (conn.relationshipType !== "purchased") {
				return yield* Effect.fail(
					new ValidationError("All connections must be of type 'purchased'")
				);
			}
		}

		// Build line items from connections
		const lineItems = connections.map((conn) => ({
			variantId: formatToGid(conn.toThingId, "ProductVariant"),
			quantity: conn.metadata?.quantity ?? 1,
			originalUnitPrice: conn.metadata?.unitPrice?.toFixed(2),
		}));

		// Extract order metadata
		const metadata = orderEvent.metadata || {};

		// Build draft order input
		const input: ShopifyDraftOrderInput = {
			email: metadata.customerEmail,
			phone: metadata.customerPhone,

			// Customer
			customerId: customerId ? formatToGid(customerId, "Customer") : undefined,

			// Line items
			lineItems,

			// Addresses
			shippingAddress: metadata.shippingAddress
				? transformToShopifyAddress(metadata.shippingAddress)
				: undefined,
			billingAddress: metadata.billingAddress
				? transformToShopifyAddress(metadata.billingAddress)
				: undefined,

			// Note
			note: metadata.note,

			// Currency
			presentmentCurrencyCode: metadata.currency,

			// Tags
			tags: metadata.isTest ? ["test"] : [],
		};

		return input;
	});
}

/**
 * Validates draft order input before sending to Shopify
 */
export function validateDraftOrderInput(
	input: ShopifyDraftOrderInput
): Effect.Effect<ShopifyDraftOrderInput, ValidationError> {
	return Effect.gen(function* () {
		// Must have at least one line item
		if (!input.lineItems || input.lineItems.length === 0) {
			return yield* Effect.fail(
				new ValidationError("Draft order must have at least one line item", "lineItems")
			);
		}

		// Each line item must have quantity
		for (const item of input.lineItems) {
			if (!item.quantity || item.quantity < 1) {
				return yield* Effect.fail(
					new ValidationError("Line item quantity must be at least 1", "lineItems.quantity", item)
				);
			}
		}

		// Must have customer ID or email
		if (!input.customerId && !input.email) {
			return yield* Effect.fail(
				new ValidationError("Draft order must have customerId or email")
			);
		}

		return input;
	});
}

// ----------------------------------------------------------------------------
// 4. COLLECTION REVERSE TRANSFORMATIONS
// ----------------------------------------------------------------------------

/**
 * Transforms ONE Group to Shopify Collection Input
 *
 * @example
 * const collectionInput = transformToShopifyCollection(collectionGroup);
 */
export function transformToShopifyCollection(
	group: Omit<ONEThingInput, "type"> & { type: string }
): Effect.Effect<ShopifyCollectionInput, TransformationError | ValidationError> {
	return Effect.gen(function* () {
		// Validate this is a collection Group
		if (group.type !== "collection") {
			return yield* Effect.fail(
				new ValidationError(`Expected type "collection", got "${group.type}"`)
			);
		}

		// Validate required fields
		yield* validateRequired(group.name, "name", "Collection");

		const props = group.properties || {};

		// Build collection input
		const input: ShopifyCollectionInput = {
			title: group.name,
			descriptionHtml: group.description ? `<p>${group.description}</p>` : undefined,
			handle: group.slug,

			// Image
			image: props.image ? {
				src: props.image.url,
				alt: props.image.altText,
			} : undefined,

			// Smart collection rules
			ruleSet: props.ruleSet,

			// SEO
			seo: props.seo ? {
				title: props.seo.title,
				description: props.seo.description,
			} : undefined,

			// Metafields
			metafields: transformToShopifyMetafields(props.metafields as ONEMetafields),
		};

		return input;
	});
}

/**
 * Validates collection input before sending to Shopify
 */
export function validateCollectionInput(
	input: ShopifyCollectionInput
): Effect.Effect<ShopifyCollectionInput, ValidationError> {
	return Effect.gen(function* () {
		// Title is required
		if (!input.title || input.title.trim().length === 0) {
			return yield* Effect.fail(
				new ValidationError("Collection title is required", "title", input.title)
			);
		}

		// Title max length (Shopify limit: 255 characters)
		if (input.title.length > 255) {
			return yield* Effect.fail(
				new ValidationError("Collection title must be 255 characters or less", "title", input.title)
			);
		}

		return input;
	});
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts tags from Knowledge labels to add to Shopify entities
 */
export function extractTagsFromKnowledge(
	knowledgeLabels: Array<{ text: string; labels?: string[] }>
): string[] {
	return knowledgeLabels
		.filter((k) => k.labels?.includes("customer_tag") || k.labels?.includes("product_tag"))
		.map((k) => k.text);
}

/**
 * Merges tags from Knowledge into entity input
 */
export function mergeTagsIntoInput<T extends { tags?: string[] }>(
	input: T,
	knowledgeLabels: Array<{ text: string; labels?: string[] }>
): T {
	const tags = extractTagsFromKnowledge(knowledgeLabels);
	return {
		...input,
		tags: [...(input.tags || []), ...tags],
	};
}

// ============================================================================
// BUSINESS RULE VALIDATION
// ============================================================================

/**
 * Validates business rules for product creation
 */
export function validateProductBusinessRules(
	input: ShopifyProductInput
): Effect.Effect<ShopifyProductInput, ValidationError> {
	return Effect.gen(function* () {
		// Products with variants must have at least 1 option
		if (input.options && input.options.length === 0) {
			return yield* Effect.fail(
				new ValidationError("Products must have at least 1 option if options are specified")
			);
		}

		// Each option must have at least 1 value
		if (input.options) {
			for (const option of input.options) {
				if (!option.values || option.values.length === 0) {
					return yield* Effect.fail(
						new ValidationError(`Option "${option.name}" must have at least 1 value`, "options")
					);
				}
			}
		}

		return input;
	});
}

/**
 * Validates business rules for customer creation
 */
export function validateCustomerBusinessRules(
	input: ShopifyCustomerInput
): Effect.Effect<ShopifyCustomerInput, ValidationError> {
	return Effect.gen(function* () {
		// If marketing consent is given, must have corresponding contact method
		if (input.emailMarketingConsent?.marketingState === "SUBSCRIBED" && !input.email) {
			return yield* Effect.fail(
				new ValidationError("Cannot subscribe to email marketing without email address")
			);
		}

		if (input.smsMarketingConsent?.marketingState === "SUBSCRIBED" && !input.phone) {
			return yield* Effect.fail(
				new ValidationError("Cannot subscribe to SMS marketing without phone number")
			);
		}

		return input;
	});
}

// ============================================================================
// EXPORT ALL REVERSE TRANSFORMATIONS
// ============================================================================

export const ONEToShopifyTransformers = {
	// Products
	transformToShopifyProduct,
	transformToShopifyVariant,
	validateProductInput,
	validateVariantInput,
	validateProductBusinessRules,

	// Customers
	transformToShopifyCustomer,
	validateCustomerInput,
	validateCustomerBusinessRules,

	// Orders
	transformToDraftOrder,
	validateDraftOrderInput,

	// Collections
	transformToShopifyCollection,
	validateCollectionInput,

	// Helpers
	extractTagsFromKnowledge,
	mergeTagsIntoInput,
} as const;
