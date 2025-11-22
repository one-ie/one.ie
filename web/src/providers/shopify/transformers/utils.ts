/**
 * Shopify Transformer Utilities
 *
 * Common utilities for transforming between Shopify API data and ONE Platform entities.
 * Includes error types, ID extraction, validation, and formatting helpers.
 */

import { Effect } from "effect";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error thrown when transformation validation fails
 */
export class TransformationError {
	readonly _tag = "TransformationError";
	constructor(
		readonly message: string,
		readonly source: "shopify" | "one",
		readonly entityType: string,
		readonly cause?: unknown,
	) {}
}

/**
 * Error thrown when Zod validation fails during transformation
 */
export class ValidationError {
	readonly _tag = "ValidationError";
	constructor(
		readonly message: string,
		readonly field?: string,
		readonly value?: unknown,
		readonly cause?: unknown,
	) {}
}

/**
 * Error thrown when required data is missing
 */
export class MissingDataError {
	readonly _tag = "MissingDataError";
	constructor(
		readonly field: string,
		readonly entityType: string,
	) {}
}

/**
 * Error thrown when a referenced entity doesn't exist
 */
export class ReferenceNotFoundError {
	readonly _tag = "ReferenceNotFoundError";
	constructor(
		readonly entityType: string,
		readonly referenceId: string,
	) {}
}

// ============================================================================
// ID EXTRACTION AND FORMATTING
// ============================================================================

/**
 * Extracts numeric ID from Shopify Global ID (GID) format
 *
 * @example
 * extractNumericId("gid://shopify/Product/7891234567890") // "7891234567890"
 * extractNumericId("123456") // "123456"
 */
export function extractNumericId(gid: string | number): string {
	if (typeof gid === "number") {
		return gid.toString();
	}

	// Handle GID format: gid://shopify/Product/123
	if (gid.startsWith("gid://shopify/")) {
		const parts = gid.split("/");
		return parts[parts.length - 1];
	}

	// Already numeric format
	return gid;
}

/**
 * Formats a numeric ID into Shopify Global ID (GID) format
 *
 * @example
 * formatToGid("123456", "Product") // "gid://shopify/Product/123456"
 */
export function formatToGid(id: string | number, entityType: string): string {
	const numericId = typeof id === "number" ? id.toString() : id;
	return `gid://shopify/${entityType}/${numericId}`;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Strips HTML tags from a string (for descriptions)
 *
 * @example
 * stripHtml("<p>Hello <strong>world</strong></p>") // "Hello world"
 */
export function stripHtml(html: string | null | undefined): string | undefined {
	if (!html) return undefined;

	// Remove HTML tags
	const stripped = html.replace(/<[^>]*>/g, "");

	// Decode HTML entities
	const decoded = stripped
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&nbsp;/g, " ");

	return decoded.trim() || undefined;
}

/**
 * Generates a URL-friendly slug from a string
 *
 * @example
 * generateSlug("Hello World!") // "hello-world"
 * generateSlug("Product #123") // "product-123"
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Generates a variant slug from product handle and options
 *
 * @example
 * generateVariantSlug("t-shirt", [{name: "Size", value: "Small"}])
 * // "t-shirt-small"
 */
export function generateVariantSlug(
	productHandle: string,
	selectedOptions: Array<{ name: string; value: string }>
): string {
	const optionValues = selectedOptions.map((opt) => opt.value).join("-");
	return generateSlug(`${productHandle}-${optionValues}`);
}

// ============================================================================
// MONEY FORMATTING
// ============================================================================

/**
 * Shopify Money type
 */
export interface ShopifyMoney {
	amount: string;
	currencyCode: string;
}

/**
 * Parses Shopify Money to number
 *
 * @example
 * parseMoney({ amount: "19.99", currencyCode: "USD" }) // 19.99
 */
export function parseMoney(money: ShopifyMoney): number {
	return parseFloat(money.amount);
}

/**
 * Formats number to Shopify Money format
 *
 * @example
 * formatMoney(19.99, "USD") // { amount: "19.99", currencyCode: "USD" }
 */
export function formatMoney(amount: number, currencyCode: string): ShopifyMoney {
	return {
		amount: amount.toFixed(2),
		currencyCode,
	};
}

// ============================================================================
// ADDRESS UTILITIES
// ============================================================================

/**
 * Shopify MailingAddress type
 */
export interface ShopifyMailingAddress {
	id?: string;
	address1?: string | null;
	address2?: string | null;
	city?: string | null;
	province?: string | null;
	provinceCode?: string | null;
	country?: string | null;
	countryCode?: string | null;
	countryCodeV2?: string | null;
	zip?: string | null;
	phone?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	company?: string | null;
	name?: string | null;
}

/**
 * ONE Platform Address format
 */
export interface ONEAddress {
	shopifyId?: string;
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
	isDefault?: boolean;
}

/**
 * Transforms Shopify MailingAddress to ONE Address format
 */
export function transformAddress(
	address: ShopifyMailingAddress,
	isDefault = false
): ONEAddress {
	return {
		shopifyId: address.id ? extractNumericId(address.id) : undefined,
		address1: address.address1 || undefined,
		address2: address.address2 || undefined,
		city: address.city || undefined,
		province: address.province || undefined,
		provinceCode: address.provinceCode || undefined,
		country: address.country || undefined,
		countryCode: address.countryCodeV2 || address.countryCode || "US",
		zip: address.zip || undefined,
		phone: address.phone || undefined,
		firstName: address.firstName || undefined,
		lastName: address.lastName || undefined,
		company: address.company || undefined,
		isDefault,
	};
}

/**
 * Transforms ONE Address to Shopify MailingAddress input format
 */
export function transformToShopifyAddress(address: ONEAddress): Partial<ShopifyMailingAddress> {
	return {
		address1: address.address1,
		address2: address.address2,
		city: address.city,
		province: address.province,
		provinceCode: address.provinceCode,
		country: address.country,
		countryCodeV2: address.countryCode,
		zip: address.zip,
		phone: address.phone,
		firstName: address.firstName,
		lastName: address.lastName,
		company: address.company,
	};
}

// ============================================================================
// METAFIELDS UTILITIES
// ============================================================================

/**
 * Shopify Metafield type
 */
export interface ShopifyMetafield {
	id?: string;
	namespace: string;
	key: string;
	value: string;
	type: string;
	description?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * ONE Platform Metafields format (flattened namespace.key)
 */
export type ONEMetafields = Record<string, {
	value: any;
	type: string;
	namespace: string;
	key: string;
	description?: string;
}>;

/**
 * Transforms Shopify Metafields array to ONE format
 *
 * @example
 * transformMetafields([
 *   { namespace: "custom", key: "color", value: "red", type: "single_line_text_field" }
 * ])
 * // { "custom.color": { value: "red", type: "single_line_text_field", namespace: "custom", key: "color" } }
 */
export function transformMetafields(metafields: ShopifyMetafield[] | null | undefined): ONEMetafields | undefined {
	if (!metafields || metafields.length === 0) {
		return undefined;
	}

	const result: ONEMetafields = {};

	for (const metafield of metafields) {
		const key = `${metafield.namespace}.${metafield.key}`;

		// Parse value based on type
		let parsedValue: any = metafield.value;

		try {
			// Try to parse JSON values
			if (
				metafield.type === "json" ||
				metafield.type === "list.single_line_text_field" ||
				metafield.type === "number_integer" ||
				metafield.type === "number_decimal"
			) {
				parsedValue = JSON.parse(metafield.value);
			}
		} catch {
			// Keep as string if parsing fails
			parsedValue = metafield.value;
		}

		result[key] = {
			value: parsedValue,
			type: metafield.type,
			namespace: metafield.namespace,
			key: metafield.key,
			description: metafield.description || undefined,
		};
	}

	return result;
}

/**
 * Transforms ONE Metafields to Shopify Metafield input array
 */
export function transformToShopifyMetafields(metafields: ONEMetafields | undefined): ShopifyMetafield[] {
	if (!metafields) {
		return [];
	}

	return Object.entries(metafields).map(([_, meta]) => ({
		namespace: meta.namespace,
		key: meta.key,
		value: typeof meta.value === "string" ? meta.value : JSON.stringify(meta.value),
		type: meta.type,
		description: meta.description,
	}));
}

// ============================================================================
// TIMESTAMP UTILITIES
// ============================================================================

/**
 * Converts ISO 8601 timestamp to Unix milliseconds
 *
 * @example
 * parseTimestamp("2024-11-22T10:00:00Z") // 1732269600000
 */
export function parseTimestamp(isoString: string): number {
	return new Date(isoString).getTime();
}

/**
 * Converts Unix milliseconds to ISO 8601 timestamp
 *
 * @example
 * formatTimestamp(1732269600000) // "2024-11-22T10:00:00.000Z"
 */
export function formatTimestamp(timestamp: number): string {
	return new Date(timestamp).toISOString();
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Safe wrapper for validation with Effect
 */
export function validateRequired<T>(
	value: T | null | undefined,
	field: string,
	entityType: string
): Effect.Effect<T, MissingDataError> {
	if (value === null || value === undefined) {
		return Effect.fail(new MissingDataError(field, entityType));
	}
	return Effect.succeed(value);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validates phone number format (basic check)
 */
export function isValidPhone(phone: string): boolean {
	// Remove all non-digit characters
	const digits = phone.replace(/\D/g, "");
	// Must have at least 10 digits
	return digits.length >= 10;
}

// ============================================================================
// EDGE CASE UTILITIES
// ============================================================================

/**
 * Checks if a Shopify product has variants
 */
export function hasVariants(product: any): boolean {
	return product.variants && product.variants.edges && product.variants.edges.length > 0;
}

/**
 * Checks if a Shopify order is a test order
 */
export function isTestOrder(order: any): boolean {
	return order.test === true;
}

/**
 * Checks if a Shopify customer is a guest
 */
export function isGuestCustomer(customer: any): boolean {
	return customer === null || customer === undefined;
}

/**
 * Gets the first variant from a product (default variant)
 */
export function getDefaultVariant(product: any): any | null {
	if (!hasVariants(product)) {
		return null;
	}
	return product.variants.edges[0]?.node || null;
}

/**
 * Calculates discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
	if (originalPrice <= 0) return 0;
	return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for Shopify Money objects
 */
export function isShopifyMoney(value: any): value is ShopifyMoney {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof value.amount === "string" &&
		typeof value.currencyCode === "string"
	);
}

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const ShopifyTransformerUtils = {
	// ID utilities
	extractNumericId,
	formatToGid,

	// String utilities
	stripHtml,
	generateSlug,
	generateVariantSlug,

	// Money utilities
	parseMoney,
	formatMoney,

	// Address utilities
	transformAddress,
	transformToShopifyAddress,

	// Metafields utilities
	transformMetafields,
	transformToShopifyMetafields,

	// Timestamp utilities
	parseTimestamp,
	formatTimestamp,

	// Validation utilities
	validateRequired,
	isValidEmail,
	isValidPhone,

	// Edge case utilities
	hasVariants,
	isTestOrder,
	isGuestCustomer,
	getDefaultVariant,
	calculateDiscountPercentage,

	// Type guards
	isShopifyMoney,
	isDefined,
} as const;
