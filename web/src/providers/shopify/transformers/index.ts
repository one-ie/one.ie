/**
 * Shopify Transformers - Barrel Export
 *
 * Central export point for all Shopify transformation functions.
 * Provides bidirectional transformations between Shopify API and ONE Platform entities.
 *
 * @module shopify/transformers
 *
 * @see /one/things/shopify-product-mapping.md - Product/Variant mapping
 * @see /one/connections/shopify-order-flow.md - Order/Connection mapping
 * @see /one/people/shopify-customer-mapping.md - Customer/People mapping
 */

// ============================================================================
// UTILITIES AND ERROR TYPES
// ============================================================================

export * from "./utils";

export {
	// Error Types
	TransformationError,
	ValidationError,
	MissingDataError,
	ReferenceNotFoundError,

	// ID Utilities
	extractNumericId,
	formatToGid,

	// String Utilities
	stripHtml,
	generateSlug,
	generateVariantSlug,

	// Money Utilities
	parseMoney,
	formatMoney,

	// Address Utilities
	transformAddress,
	transformToShopifyAddress,

	// Metafields Utilities
	transformMetafields,
	transformToShopifyMetafields,

	// Timestamp Utilities
	parseTimestamp,
	formatTimestamp,

	// Validation Utilities
	validateRequired,
	isValidEmail,
	isValidPhone,

	// Edge Case Utilities
	hasVariants,
	isTestOrder,
	isGuestCustomer,
	getDefaultVariant,
	calculateDiscountPercentage,

	// Type Guards
	isShopifyMoney,
	isDefined,

	// Utility Object
	ShopifyTransformerUtils,

	// Types
	type ShopifyMoney,
	type ShopifyMailingAddress,
	type ShopifyMetafield,
	type ONEAddress,
	type ONEMetafields,
} from "./utils";

// ============================================================================
// SHOPIFY → ONE TRANSFORMATIONS
// ============================================================================

export * from "./to-one";

export {
	// Product Transformations
	transformShopifyProduct,
	transformShopifyVariant,

	// Order Transformations
	transformOrderToConnections,
	transformOrderToPlacedEvent,
	transformTransactionsToEvents,
	transformFulfillmentsToEvents,
	transformRefundsToEvents,

	// Customer Transformations
	transformShopifyCustomer,
	transformCustomerTagsToKnowledge,

	// Collection Transformations
	transformShopifyCollection,
	transformCollectionProductConnections,

	// Inventory Transformations
	transformInventoryLevels,

	// Checkout/Cart Transformations
	transformCartToConnections,
	transformCheckoutToEvents,

	// Transformer Object
	ShopifyToONETransformers,

	// Shopify API Types
	type ShopifyProduct,
	type ShopifyProductVariant,
	type ShopifyOrder,
	type ShopifyLineItem,
	type ShopifyFulfillment,
	type ShopifyRefund,
	type ShopifyTransaction,
	type ShopifyCustomer,
	type ShopifyCollection,

	// ONE Platform Types
	type ONEThingInput,
	type ONEConnectionInput,
	type ONEEventInput,
	type ONEKnowledgeInput,
} from "./to-one";

// ============================================================================
// ONE → SHOPIFY REVERSE TRANSFORMATIONS
// ============================================================================

export * from "./to-shopify";

export {
	// Product Reverse Transformations
	transformToShopifyProduct,
	transformToShopifyVariant,
	validateProductInput,
	validateVariantInput,
	validateProductBusinessRules,

	// Customer Reverse Transformations
	transformToShopifyCustomer,
	validateCustomerInput,
	validateCustomerBusinessRules,

	// Order Reverse Transformations
	transformToDraftOrder,
	validateDraftOrderInput,

	// Collection Reverse Transformations
	transformToShopifyCollection,
	validateCollectionInput,

	// Helper Functions
	extractTagsFromKnowledge,
	mergeTagsIntoInput,

	// Transformer Object
	ONEToShopifyTransformers,

	// Shopify Input Types
	type ShopifyProductInput,
	type ShopifyProductVariantInput,
	type ShopifyCustomerInput,
	type ShopifyDraftOrderInput,
	type ShopifyCollectionInput,
} from "./to-shopify";

// ============================================================================
// QUICK REFERENCE
// ============================================================================

/**
 * Quick reference for common transformation patterns
 *
 * @example
 * // SHOPIFY → ONE
 * import { transformShopifyProduct } from "@/providers/shopify/transformers";
 *
 * const productThing = await transformShopifyProduct(shopifyProduct, groupId);
 *
 * @example
 * // ONE → SHOPIFY
 * import { transformToShopifyProduct } from "@/providers/shopify/transformers";
 *
 * const productInput = await transformToShopifyProduct(productThing);
 *
 * @example
 * // UTILITIES
 * import { extractNumericId, parseMoney, stripHtml } from "@/providers/shopify/transformers";
 *
 * const productId = extractNumericId("gid://shopify/Product/123"); // "123"
 * const price = parseMoney({ amount: "19.99", currencyCode: "USD" }); // 19.99
 * const text = stripHtml("<p>Hello <strong>world</strong></p>"); // "Hello world"
 */

/**
 * Transformation counts for reference:
 *
 * SHOPIFY → ONE (Forward):
 * - 2 Product transformations (Product, Variant)
 * - 5 Order transformations (Connections, 4 Event types)
 * - 2 Customer transformations (Thing, Knowledge labels)
 * - 2 Collection transformations (Group, Connections)
 * - 1 Inventory transformation
 * - 2 Checkout/Cart transformations
 * TOTAL: 14 forward transformations
 *
 * ONE → SHOPIFY (Reverse):
 * - 2 Product transformations (Product, Variant)
 * - 1 Customer transformation
 * - 1 Order transformation (Draft Order)
 * - 1 Collection transformation
 * TOTAL: 5 reverse transformations
 *
 * UTILITIES:
 * - 20+ utility functions
 * - 4 error types
 * - 6 validation functions
 * - 5 type guards
 */

// ============================================================================
// USAGE PATTERNS
// ============================================================================

/**
 * PATTERN 1: Single Product Sync (Shopify → ONE)
 *
 * @example
 * import { Effect } from "effect";
 * import {
 *   transformShopifyProduct,
 *   transformShopifyVariant,
 *   type ShopifyProduct
 * } from "@/providers/shopify/transformers";
 *
 * async function syncProduct(shopifyProduct: ShopifyProduct, groupId: string) {
 *   // Transform product
 *   const productThing = await Effect.runPromise(
 *     transformShopifyProduct(shopifyProduct, groupId)
 *   );
 *
 *   // Create in database
 *   const createdProduct = await db.things.create(productThing);
 *
 *   // Transform and create variants
 *   if (shopifyProduct.variants?.edges) {
 *     for (const edge of shopifyProduct.variants.edges) {
 *       const variantThing = await Effect.runPromise(
 *         transformShopifyVariant(edge.node, shopifyProduct.handle, groupId)
 *       );
 *       const createdVariant = await db.things.create(variantThing);
 *
 *       // Create variant_of connection
 *       await db.connections.create({
 *         groupId,
 *         fromThingId: createdVariant._id,
 *         toThingId: createdProduct._id,
 *         relationshipType: "variant_of"
 *       });
 *     }
 *   }
 * }
 */

/**
 * PATTERN 2: Order Sync (Shopify → ONE)
 *
 * @example
 * import { Effect } from "effect";
 * import {
 *   transformOrderToConnections,
 *   transformOrderToPlacedEvent,
 *   transformTransactionsToEvents,
 *   transformFulfillmentsToEvents,
 *   type ShopifyOrder
 * } from "@/providers/shopify/transformers";
 *
 * async function syncOrder(shopifyOrder: ShopifyOrder, groupId: string) {
 *   // Find or create customer
 *   let customerId = null;
 *   if (shopifyOrder.customer) {
 *     const customerThing = await Effect.runPromise(
 *       transformShopifyCustomer(shopifyOrder.customer, groupId)
 *     );
 *     const customer = await db.things.create(customerThing);
 *     customerId = customer._id;
 *   }
 *
 *   // Create purchase connections
 *   const connections = await Effect.runPromise(
 *     transformOrderToConnections(shopifyOrder, customerId, groupId)
 *   );
 *   for (const conn of connections) {
 *     await db.connections.create(conn);
 *   }
 *
 *   // Create order_placed event
 *   const orderEvent = await Effect.runPromise(
 *     transformOrderToPlacedEvent(shopifyOrder, customerId, groupId)
 *   );
 *   await db.events.create(orderEvent);
 *
 *   // Create payment events
 *   const paymentEvents = await Effect.runPromise(
 *     transformTransactionsToEvents(shopifyOrder, customerId, groupId)
 *   );
 *   for (const event of paymentEvents) {
 *     await db.events.create(event);
 *   }
 *
 *   // Create fulfillment events
 *   const fulfillmentEvents = await Effect.runPromise(
 *     transformFulfillmentsToEvents(shopifyOrder, groupId)
 *   );
 *   for (const event of fulfillmentEvents) {
 *     await db.events.create(event);
 *   }
 * }
 */

/**
 * PATTERN 3: Create Product in Shopify (ONE → Shopify)
 *
 * @example
 * import { Effect } from "effect";
 * import {
 *   transformToShopifyProduct,
 *   validateProductInput,
 *   validateProductBusinessRules,
 *   type ONEThingInput
 * } from "@/providers/shopify/transformers";
 *
 * async function createShopifyProduct(productThing: ONEThingInput) {
 *   // Transform to Shopify format
 *   const productInput = await Effect.runPromise(
 *     Effect.gen(function* () {
 *       const input = yield* transformToShopifyProduct(productThing);
 *       const validated = yield* validateProductInput(input);
 *       const businessValidated = yield* validateProductBusinessRules(validated);
 *       return businessValidated;
 *     })
 *   );
 *
 *   // Send to Shopify API
 *   const response = await shopifyClient.product.create({
 *     product: productInput
 *   });
 *
 *   return response.product;
 * }
 */

/**
 * PATTERN 4: Error Handling with Effect
 *
 * @example
 * import { Effect, Match } from "effect";
 * import {
 *   transformShopifyProduct,
 *   TransformationError,
 *   ValidationError,
 *   MissingDataError
 * } from "@/providers/shopify/transformers";
 *
 * const result = await Effect.runPromise(
 *   Effect.gen(function* () {
 *     const productThing = yield* transformShopifyProduct(shopifyProduct, groupId);
 *     return productThing;
 *   }).pipe(
 *     Effect.catchAll((error) =>
 *       Match.value(error).pipe(
 *         Match.tag("TransformationError", (e) =>
 *           Effect.succeed({ error: `Transformation failed: ${e.message}` })
 *         ),
 *         Match.tag("ValidationError", (e) =>
 *           Effect.succeed({ error: `Validation failed for ${e.field}: ${e.message}` })
 *         ),
 *         Match.tag("MissingDataError", (e) =>
 *           Effect.succeed({ error: `Missing required field: ${e.field}` })
 *         ),
 *         Match.orElse((e) =>
 *           Effect.succeed({ error: `Unknown error: ${e}` })
 *         )
 *       )
 *     )
 *   )
 * );
 */
