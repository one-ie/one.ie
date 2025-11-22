/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * Shopify VariantService (Cycle 29)
 *
 * Handles product variant CRUD operations with Shopify Admin API.
 *
 * Key Features:
 * - Get single variant
 * - List variants for a product
 * - Create variant
 * - Update variant (price, SKU, inventory, etc.)
 * - Delete variant
 * - Update inventory levels
 *
 * Edge Cases:
 * - Products without variants (always have 1 default variant)
 * - 2,048 variant limit per product
 * - Inventory tracking (enabled/disabled)
 * - Variant images (inherit from product if not set)
 *
 * @see /one/things/shopify-product-mapping.md - Variant mapping specification
 */

import { Effect } from "effect";
import type { ShopifyClient } from "../client/ShopifyClient";
import { transformShopifyVariant } from "../transformers/to-one";
import type { ShopifyProductVariant } from "../transformers/to-one";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Variant-specific errors with discriminated union
 */
export type VariantError =
	| VariantNotFoundError
	| VariantValidationError
	| VariantCreateError
	| VariantUpdateError
	| VariantDeleteError
	| VariantInventoryError
	| VariantTransformationError
	| VariantLimitError;

export class VariantNotFoundError {
	readonly _tag = "VariantNotFoundError";
	constructor(
		readonly variantId: string,
		readonly message: string = `Variant ${variantId} not found`,
	) {}
}

export class VariantValidationError {
	readonly _tag = "VariantValidationError";
	constructor(
		readonly field: string,
		readonly message: string,
	) {}
}

export class VariantCreateError {
	readonly _tag = "VariantCreateError";
	constructor(
		readonly productId: string,
		readonly message: string,
	) {}
}

export class VariantUpdateError {
	readonly _tag = "VariantUpdateError";
	constructor(
		readonly variantId: string,
		readonly message: string,
	) {}
}

export class VariantDeleteError {
	readonly _tag = "VariantDeleteError";
	constructor(
		readonly variantId: string,
		readonly message: string,
	) {}
}

export class VariantInventoryError {
	readonly _tag = "VariantInventoryError";
	constructor(
		readonly variantId: string,
		readonly locationId: string | undefined,
		readonly message: string,
	) {}
}

export class VariantTransformationError {
	readonly _tag = "VariantTransformationError";
	constructor(
		readonly variantId: string,
		readonly message: string,
	) {}
}

export class VariantLimitError {
	readonly _tag = "VariantLimitError";
	constructor(
		readonly productId: string,
		readonly currentCount: number,
		readonly message: string = `Product ${productId} has reached variant limit (${currentCount}/2048)`,
	) {}
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Variant creation input
 */
export interface VariantInput {
	// Product association
	productId: string;

	// Basic info
	title?: string; // Auto-generated from option values if not provided

	// SKU & Barcode
	sku?: string;
	barcode?: string;

	// Pricing
	price: number | string;
	compareAtPrice?: number | string; // Original price (for showing discounts)

	// Selected options (what makes this variant unique)
	options?: Array<string>; // e.g., ["Small", "Blue"] maps to product options

	// Inventory
	inventoryQuantity?: number;
	inventoryPolicy?: "DENY" | "CONTINUE"; // Deny = can't sell when out of stock
	inventoryManagement?: "SHOPIFY" | "NOT_MANAGED" | null;
	trackInventory?: boolean;

	// Physical properties
	weight?: number;
	weightUnit?: "KILOGRAMS" | "GRAMS" | "POUNDS" | "OUNCES";
	requiresShipping?: boolean;

	// Tax
	taxable?: boolean;
	taxCode?: string;

	// Image
	imageId?: string; // Shopify image ID to associate with variant

	// Position
	position?: number; // Display order
}

/**
 * Variant inventory update input
 */
export interface InventoryUpdateInput {
	quantity: number;
	locationId?: string; // Shopify location ID (uses default if not provided)
	reason?: string; // Reason for inventory change
}

// ============================================================================
// VARIANT SERVICE
// ============================================================================

export class VariantService {
	// Utility class with only static methods
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private constructor() {}

	// ========================================================================
	// READ OPERATIONS
	// ========================================================================

	/**
	 * Get single variant by ID
	 *
	 * Retrieves complete variant data including:
	 * - Basic variant info (title, SKU, price, etc.)
	 * - Selected options (size, color, etc.)
	 * - Inventory data
	 * - Physical properties (weight, shipping)
	 * - Variant-specific image
	 * - Metafields
	 *
	 * Returns ONE Platform Thing structure.
	 *
	 * @param id - Shopify variant ID (numeric or GID)
	 * @param groupId - ONE Platform group ID (Shopify store)
	 *
	 * @example
	 * const variant = yield* VariantService.get("4567890", groupId);
	 */
	static get = (id: string, groupId: string, client: ShopifyClient) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/ProductVariant/${id}`;

			// Build GraphQL query
			const query = `
        query GetVariant($id: ID!) {
          productVariant(id: $id) {
            id
            title
            sku
            barcode
            price
            compareAtPrice
            inventoryQuantity
            inventoryPolicy
            inventoryManagement
            availableForSale
            selectedOptions {
              name
              value
            }
            weight
            weightUnit
            requiresShipping
            taxable
            image {
              url
              altText
            }
            position
            metafields(first: 20) {
              edges {
                node {
                  namespace
                  key
                  value
                  type
                }
              }
            }
            product {
              id
              handle
            }
            createdAt
            updatedAt
          }
        }
      `;

			// Fetch variant from Shopify
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						productVariant: ShopifyProductVariant | null;
					}>({
						query,
						variables: { id: gid },
					}),
				catch: (error) =>
					new VariantNotFoundError(
						id,
						`Failed to fetch variant: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check if variant exists
			if (!response.data.productVariant) {
				return yield* Effect.fail(
					new VariantNotFoundError(
						id,
						`Variant ${id} not found in Shopify`,
					),
				);
			}

			// Transform to ONE Platform Thing
			const productHandle =
				response.data.productVariant.product?.handle || "unknown";
			const thing = yield* transformShopifyVariant(
				response.data.productVariant,
				productHandle,
				groupId,
			).pipe(
				Effect.mapError(
					(error) =>
						new VariantTransformationError(
							id,
							`Transformation failed: ${error._tag}`,
						),
				),
			);

			return thing;
		});

	/**
	 * List variants for a product
	 *
	 * Retrieves all variants for a product (up to 2,048).
	 * Uses pagination for efficient fetching.
	 *
	 * Returns array of ONE Platform Things.
	 *
	 * @param productId - Shopify product ID
	 * @param groupId - ONE Platform group ID
	 *
	 * @example
	 * const variants = yield* VariantService.listForProduct("7891234567890", groupId);
	 */
	static listForProduct = (
		productId: string,
		groupId: string,
		client: ShopifyClient,
	) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = productId.startsWith("gid://")
				? productId
				: `gid://shopify/Product/${productId}`;

			// Build GraphQL query
			const query = `
        query GetProductVariants($productId: ID!, $first: Int!, $after: String) {
          product(id: $productId) {
            id
            handle
            variants(first: $first, after: $after) {
              edges {
                cursor
                node {
                  id
                  title
                  sku
                  barcode
                  price
                  compareAtPrice
                  inventoryQuantity
                  inventoryPolicy
                  inventoryManagement
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  weight
                  weightUnit
                  requiresShipping
                  taxable
                  image {
                    url
                    altText
                  }
                  position
                  createdAt
                  updatedAt
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;

			const allVariants: ShopifyProductVariant[] = [];
			let hasNextPage = true;
			let cursor: string | undefined = undefined;
			let productHandle = "unknown";

			// Paginate through all variants
			while (hasNextPage) {
				const response = yield* Effect.tryPromise({
					try: () =>
						client.query<{
							product: {
								id: string;
								handle: string;
								variants: {
									edges: Array<{
										cursor: string;
										node: ShopifyProductVariant;
									}>;
									pageInfo: {
										hasNextPage: boolean;
										endCursor: string | null;
									};
								};
							};
						}>({
							query,
							variables: { productId: gid, first: 250, after: cursor },
						}),
					catch: (error) =>
						new VariantNotFoundError(
							productId,
							`Failed to fetch variants: ${error instanceof Error ? error.message : String(error)}`,
						),
				});

				// Store product handle for transformation
				productHandle = response.data.product.handle;

				// Add variants to array
				for (const edge of response.data.product.variants.edges) {
					allVariants.push(edge.node);
				}

				// Check pagination
				hasNextPage = response.data.product.variants.pageInfo.hasNextPage;
				cursor = response.data.product.variants.pageInfo.endCursor || undefined;
			}

			// Transform all variants to ONE Platform Things
			const things = yield* Effect.all(
				allVariants.map((variant) =>
					transformShopifyVariant(variant, productHandle, groupId).pipe(
						Effect.mapError(
							(error) =>
								new VariantTransformationError(
									variant.id,
									`Transformation failed: ${error._tag}`,
								),
						),
					),
				),
			);

			return things;
		});

	// ========================================================================
	// WRITE OPERATIONS
	// ========================================================================

	/**
	 * Create variant for a product
	 *
	 * Creates a new variant with specified options.
	 * Shopify enforces a limit of 2,048 variants per product.
	 *
	 * Returns the new variant's Shopify ID.
	 *
	 * @example
	 * const variantId = yield* VariantService.create("7891234567890", {
	 *   options: ["Medium", "Red"],
	 *   price: "24.99",
	 *   sku: "TSHIRT-MD-RED",
	 *   inventoryQuantity: 100
	 * });
	 */
	static create = (
		productId: string,
		input: VariantInput,
		client: ShopifyClient,
	) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = productId.startsWith("gid://")
				? productId
				: `gid://shopify/Product/${productId}`;

			// Validate input
			if (!input.price) {
				return yield* Effect.fail(
					new VariantValidationError("price", "Variant price is required"),
				);
			}

			// Build GraphQL mutation
			const mutation = `
        mutation CreateVariant($productId: ID!, $input: ProductVariantInput!) {
          productVariantCreate(productId: $productId, input: $input) {
            productVariant {
              id
              title
              sku
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

			// Execute mutation
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						productVariantCreate: {
							productVariant: { id: string; title: string; sku: string | null };
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: {
							productId: gid,
							input: {
								options: input.options,
								price: String(input.price),
								compareAtPrice: input.compareAtPrice
									? String(input.compareAtPrice)
									: undefined,
								sku: input.sku,
								barcode: input.barcode,
								inventoryQuantities:
									input.inventoryQuantity !== undefined
										? [
												{
													availableQuantity: input.inventoryQuantity,
													locationId: input.inventoryManagement, // TODO: Use actual location ID
												},
											]
										: undefined,
								inventoryPolicy: input.inventoryPolicy || "DENY",
								weight: input.weight,
								weightUnit: input.weightUnit,
								requiresShipping: input.requiresShipping ?? true,
								taxable: input.taxable ?? true,
								imageId: input.imageId,
							},
						},
					}),
				catch: (error) =>
					new VariantCreateError(
						productId,
						`Failed to create variant: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.productVariantCreate.userErrors.length > 0) {
				const firstError = response.data.productVariantCreate.userErrors[0];

				// Check for variant limit error
				if (
					firstError.message.toLowerCase().includes("limit") ||
					firstError.message.includes("2048")
				) {
					return yield* Effect.fail(
						new VariantLimitError(
							productId,
							2048,
							`Product has reached variant limit: ${firstError.message}`,
						),
					);
				}

				return yield* Effect.fail(
					new VariantCreateError(
						productId,
						`Shopify validation error: ${firstError.message}`,
					),
				);
			}

			// Extract numeric ID from GID
			const variantId = response.data.productVariantCreate.productVariant.id
				.split("/")
				.pop();

			return variantId || response.data.productVariantCreate.productVariant.id;
		});

	/**
	 * Update variant
	 *
	 * Updates variant fields. Only fields provided in the input are updated.
	 * Common updates:
	 * - Price changes
	 * - SKU updates
	 * - Inventory policy changes
	 * - Physical properties (weight, shipping)
	 *
	 * Note: For inventory quantity updates, use updateInventory() instead.
	 *
	 * @example
	 * yield* VariantService.update("4567890", {
	 *   price: "19.99",
	 *   compareAtPrice: "24.99",
	 *   sku: "TSHIRT-SM-BLU-V2"
	 * });
	 */
	static update = (
		id: string,
		updates: Partial<Omit<VariantInput, "productId">>,
		client: ShopifyClient,
	) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/ProductVariant/${id}`;

			// Build GraphQL mutation
			const mutation = `
        mutation UpdateVariant($input: ProductVariantInput!) {
          productVariantUpdate(input: $input) {
            productVariant {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

			// Build input object (only include provided fields)
			const input: Record<string, any> = { id: gid };

			if (updates.price !== undefined) {
				input.price = String(updates.price);
			}
			if (updates.compareAtPrice !== undefined) {
				input.compareAtPrice = String(updates.compareAtPrice);
			}
			if (updates.sku !== undefined) {
				input.sku = updates.sku;
			}
			if (updates.barcode !== undefined) {
				input.barcode = updates.barcode;
			}
			if (updates.inventoryPolicy !== undefined) {
				input.inventoryPolicy = updates.inventoryPolicy;
			}
			if (updates.weight !== undefined) {
				input.weight = updates.weight;
			}
			if (updates.weightUnit !== undefined) {
				input.weightUnit = updates.weightUnit;
			}
			if (updates.requiresShipping !== undefined) {
				input.requiresShipping = updates.requiresShipping;
			}
			if (updates.taxable !== undefined) {
				input.taxable = updates.taxable;
			}
			if (updates.imageId !== undefined) {
				input.imageId = updates.imageId;
			}
			if (updates.position !== undefined) {
				input.position = updates.position;
			}

			// Execute mutation
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						productVariantUpdate: {
							productVariant: { id: string; title: string };
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: { input },
					}),
				catch: (error) =>
					new VariantUpdateError(
						id,
						`Failed to update variant: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.productVariantUpdate.userErrors.length > 0) {
				const firstError = response.data.productVariantUpdate.userErrors[0];
				return yield* Effect.fail(
					new VariantUpdateError(id, `Shopify error: ${firstError.message}`),
				);
			}
		});

	/**
	 * Delete variant
	 *
	 * Permanently deletes a variant from Shopify.
	 * This action cannot be undone.
	 *
	 * Note: Products must have at least 1 variant. Deleting the last variant
	 * will fail. To remove a product entirely, use ProductService.delete().
	 *
	 * @example
	 * yield* VariantService.delete("4567890");
	 */
	static delete = (id: string, client: ShopifyClient) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/ProductVariant/${id}`;

			// Build GraphQL mutation
			const mutation = `
        mutation DeleteVariant($id: ID!) {
          productVariantDelete(id: $id) {
            deletedProductVariantId
            userErrors {
              field
              message
            }
          }
        }
      `;

			// Execute mutation
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						productVariantDelete: {
							deletedProductVariantId: string | null;
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: { id: gid },
					}),
				catch: (error) =>
					new VariantDeleteError(
						id,
						`Failed to delete variant: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.productVariantDelete.userErrors.length > 0) {
				const firstError = response.data.productVariantDelete.userErrors[0];
				return yield* Effect.fail(
					new VariantDeleteError(id, `Shopify error: ${firstError.message}`),
				);
			}
		});

	// ========================================================================
	// INVENTORY OPERATIONS
	// ========================================================================

	/**
	 * Update inventory levels for a variant
	 *
	 * Adjusts inventory quantity at a specific location.
	 * Supports:
	 * - Set absolute quantity
	 * - Increment/decrement (use positive/negative numbers)
	 * - Specify location (uses default if not provided)
	 *
	 * @param id - Variant ID
	 * @param quantity - New quantity (or delta if reason is provided)
	 * @param location - Shopify location ID (optional)
	 *
	 * @example
	 * // Set inventory to 50
	 * yield* VariantService.updateInventory("4567890", 50);
	 *
	 * // Increment by 10
	 * yield* VariantService.updateInventory("4567890", 10, undefined, "restock");
	 *
	 * // Decrement by 3
	 * yield* VariantService.updateInventory("4567890", -3, undefined, "sold");
	 */
	static updateInventory = (
		id: string,
		quantity: number,
		location: string | undefined,
		client: ShopifyClient,
	) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/ProductVariant/${id}`;

			// First, get the variant's inventory item ID
			const variantQuery = `
        query GetVariantInventoryItem($id: ID!) {
          productVariant(id: $id) {
            id
            inventoryItem {
              id
            }
          }
        }
      `;

			const variantResponse = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						productVariant: {
							id: string;
							inventoryItem: {
								id: string;
							};
						};
					}>({
						query: variantQuery,
						variables: { id: gid },
					}),
				catch: (error) =>
					new VariantInventoryError(
						id,
						location,
						`Failed to get inventory item: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			const inventoryItemId =
				variantResponse.data.productVariant.inventoryItem.id;

			// Get location ID (use default if not provided)
			let locationId = location;
			if (!locationId) {
				const locationsQuery = `
          query GetLocations {
            locations(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `;

				const locationsResponse = yield* Effect.tryPromise({
					try: () =>
						client.query<{
							locations: {
								edges: Array<{ node: { id: string } }>;
							};
						}>({
							query: locationsQuery,
							variables: {},
						}),
					catch: (error) =>
						new VariantInventoryError(
							id,
							location,
							`Failed to get locations: ${error instanceof Error ? error.message : String(error)}`,
						),
				});

				if (locationsResponse.data.locations.edges.length === 0) {
					return yield* Effect.fail(
						new VariantInventoryError(
							id,
							location,
							"No locations found in Shopify store",
						),
					);
				}

				locationId = locationsResponse.data.locations.edges[0].node.id;
			}

			// Update inventory level
			const mutation = `
        mutation AdjustInventory($inventoryItemId: ID!, $locationId: ID!, $availableDelta: Int!) {
          inventoryAdjustQuantity(
            input: {
              inventoryItemId: $inventoryItemId
              locationId: $locationId
              availableDelta: $availableDelta
            }
          ) {
            inventoryLevel {
              available
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						inventoryAdjustQuantity: {
							inventoryLevel: {
								available: number;
							};
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: {
							inventoryItemId,
							locationId,
							availableDelta: quantity,
						},
					}),
				catch: (error) =>
					new VariantInventoryError(
						id,
						location,
						`Failed to update inventory: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.inventoryAdjustQuantity.userErrors.length > 0) {
				const firstError = response.data.inventoryAdjustQuantity.userErrors[0];
				return yield* Effect.fail(
					new VariantInventoryError(
						id,
						location,
						`Shopify error: ${firstError.message}`,
					),
				);
			}

			return response.data.inventoryAdjustQuantity.inventoryLevel.available;
		});

	/**
	 * Get inventory levels for a variant across all locations
	 *
	 * Returns inventory data for each location where the variant is stocked.
	 *
	 * @example
	 * const levels = yield* VariantService.getInventoryLevels("4567890");
	 * // [
	 * //   { location: "Main Warehouse", available: 100, incoming: 50 },
	 * //   { location: "Retail Store", available: 25, incoming: 0 }
	 * // ]
	 */
	static getInventoryLevels = (id: string, client: ShopifyClient) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/ProductVariant/${id}`;

			// Build GraphQL query
			const query = `
        query GetVariantInventoryLevels($id: ID!) {
          productVariant(id: $id) {
            id
            inventoryItem {
              id
              inventoryLevels(first: 20) {
                edges {
                  node {
                    id
                    available
                    incoming
                    location {
                      id
                      name
                      address {
                        city
                        province
                        country
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

			// Fetch inventory levels
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						productVariant: {
							id: string;
							inventoryItem: {
								id: string;
								inventoryLevels: {
									edges: Array<{
										node: {
											id: string;
											available: number;
											incoming: number;
											location: {
												id: string;
												name: string;
												address: {
													city: string;
													province: string;
													country: string;
												};
											};
										};
									}>;
								};
							};
						};
					}>({
						query,
						variables: { id: gid },
					}),
				catch: (error) =>
					new VariantInventoryError(
						id,
						undefined,
						`Failed to get inventory levels: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Transform to simple array
			return response.data.productVariant.inventoryItem.inventoryLevels.edges.map(
				(edge) => ({
					locationId: edge.node.location.id,
					locationName: edge.node.location.name,
					city: edge.node.location.address.city,
					province: edge.node.location.address.province,
					country: edge.node.location.address.country,
					available: edge.node.available,
					incoming: edge.node.incoming,
				}),
			);
		});
}
