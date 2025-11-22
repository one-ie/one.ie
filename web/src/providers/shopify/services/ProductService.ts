/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * Shopify ProductService (Cycle 28)
 *
 * Handles product CRUD operations with Shopify Admin API, transforming between
 * Shopify and ONE Platform data structures.
 *
 * Key Features:
 * - Get single product (with variants, images, metafields)
 * - List products with pagination, filtering, sorting
 * - Search products
 * - Create new product
 * - Update product
 * - Delete product
 * - Publish to sales channels
 *
 * Edge Cases:
 * - Products without variants (Shopify creates default variant)
 * - Products with 2,048 variants (batch processing)
 * - Draft/archived products (filter in queries)
 *
 * @see /one/things/shopify-product-mapping.md - Product mapping specification
 */

import { Effect } from "effect";
import type { ShopifyClient } from "../client/ShopifyClient";
import { transformShopifyProduct } from "../transformers/to-one";
import type {
	ShopifyProduct,
	ShopifyProductVariant,
} from "../transformers/to-one";
import {
	GET_PRODUCT,
	LIST_PRODUCTS,
	SEARCH_PRODUCTS,
	GET_PRODUCT_VARIANTS,
	type GetProductResponse,
	type ListProductsResponse,
	type ListProductsVariables,
} from "../graphql/queries";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Product-specific errors with discriminated union
 */
export type ProductError =
	| ProductNotFoundError
	| ProductValidationError
	| ProductCreateError
	| ProductUpdateError
	| ProductDeleteError
	| ProductPublishError
	| ProductTransformationError;

export class ProductNotFoundError {
	readonly _tag = "ProductNotFoundError";
	constructor(
		readonly productId: string,
		readonly message: string = `Product ${productId} not found`,
	) {}
}

export class ProductValidationError {
	readonly _tag = "ProductValidationError";
	constructor(
		readonly field: string,
		readonly message: string,
	) {}
}

export class ProductCreateError {
	readonly _tag = "ProductCreateError";
	constructor(readonly message: string) {}
}

export class ProductUpdateError {
	readonly _tag = "ProductUpdateError";
	constructor(
		readonly productId: string,
		readonly message: string,
	) {}
}

export class ProductDeleteError {
	readonly _tag = "ProductDeleteError";
	constructor(
		readonly productId: string,
		readonly message: string,
	) {}
}

export class ProductPublishError {
	readonly _tag = "ProductPublishError";
	constructor(
		readonly productId: string,
		readonly channels: string[],
		readonly message: string,
	) {}
}

export class ProductTransformationError {
	readonly _tag = "ProductTransformationError";
	constructor(
		readonly productId: string,
		readonly message: string,
	) {}
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Product creation input
 */
export interface ProductInput {
	title: string;
	description?: string;
	descriptionHtml?: string;
	handle?: string; // Auto-generated if not provided
	vendor?: string;
	productType?: string;
	tags?: string[];

	// Options (up to 3)
	options?: Array<{
		name: string;
		position: number;
		values: string[];
	}>;

	// SEO
	seo?: {
		title?: string;
		description?: string;
	};

	// Media
	images?: Array<{
		src: string;
		altText?: string;
		position?: number;
	}>;

	// Status
	status?: "ACTIVE" | "ARCHIVED" | "DRAFT";

	// Metafields
	metafields?: Array<{
		namespace: string;
		key: string;
		value: string;
		type: string;
	}>;
}

/**
 * Product list filters
 */
export interface ProductListFilters {
	status?: "active" | "archived" | "draft";
	vendor?: string;
	productType?: string;
	tag?: string;
	createdAfter?: string; // ISO 8601
	createdBefore?: string;
	updatedAfter?: string;
	updatedBefore?: string;
}

/**
 * Product list options
 */
export interface ProductListOptions {
	limit?: number; // Max 250
	cursor?: string; // Pagination cursor
	sortBy?: "TITLE" | "CREATED_AT" | "UPDATED_AT" | "PRODUCT_TYPE" | "VENDOR";
	sortOrder?: "ASC" | "DESC";
	filters?: ProductListFilters;
}

/**
 * Product search options
 */
export interface ProductSearchOptions {
	limit?: number;
	fields?: Array<"title" | "description" | "tag" | "vendor" | "sku">;
}

// ============================================================================
// PRODUCT SERVICE
// ============================================================================

export class ProductService {
	// Utility class with only static methods
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private constructor() {}

	// ========================================================================
	// READ OPERATIONS
	// ========================================================================

	/**
	 * Get single product by ID
	 *
	 * Retrieves complete product data including:
	 * - Basic product info (title, description, status, etc.)
	 * - All variants (up to 2,048)
	 * - All images
	 * - Product options (size, color, etc.)
	 * - Metafields
	 * - SEO data
	 *
	 * Returns ONE Platform Thing structure.
	 *
	 * @param id - Shopify product ID (numeric or GID)
	 * @param groupId - ONE Platform group ID (Shopify store)
	 *
	 * @example
	 * const product = yield* ProductService.get("7891234567890", groupId);
	 */
	static get = (id: string, groupId: string, client: ShopifyClient) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/Product/${id}`;

			// Fetch product from Shopify
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<GetProductResponse>({
						query: GET_PRODUCT,
						variables: { id: gid },
					}),
				catch: (error) =>
					new ProductNotFoundError(
						id,
						`Failed to fetch product: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check if product exists
			if (!response.data.product) {
				return yield* Effect.fail(
					new ProductNotFoundError(
						id,
						`Product ${id} not found in Shopify`,
					),
				);
			}

			// Transform to ONE Platform Thing
			const thing = yield* transformShopifyProduct(
				response.data.product as unknown as ShopifyProduct,
				groupId,
			).pipe(
				Effect.mapError(
					(error) =>
						new ProductTransformationError(
							id,
							`Transformation failed: ${error._tag}`,
						),
				),
			);

			return thing;
		});

	/**
	 * List products with pagination and filtering
	 *
	 * Supports:
	 * - Pagination (cursor-based)
	 * - Filtering (status, vendor, type, tags, date ranges)
	 * - Sorting (title, created_at, updated_at, etc.)
	 *
	 * Returns array of ONE Platform Things.
	 *
	 * @example
	 * const products = yield* ProductService.list(groupId, {
	 *   limit: 50,
	 *   sortBy: "CREATED_AT",
	 *   sortOrder: "DESC",
	 *   filters: { status: "active" }
	 * });
	 */
	static list = (
		groupId: string,
		options: ProductListOptions = {},
		client: ShopifyClient,
	) =>
		Effect.gen(function* () {
			const {
				limit = 50,
				cursor,
				sortBy = "CREATED_AT",
				sortOrder = "DESC",
				filters = {},
			} = options;

			// Build Shopify query string from filters
			const queryParts: string[] = [];

			if (filters.status) {
				queryParts.push(`status:${filters.status}`);
			}
			if (filters.vendor) {
				queryParts.push(`vendor:${filters.vendor}`);
			}
			if (filters.productType) {
				queryParts.push(`product_type:${filters.productType}`);
			}
			if (filters.tag) {
				queryParts.push(`tag:${filters.tag}`);
			}
			if (filters.createdAfter) {
				queryParts.push(`created_at:>${filters.createdAfter}`);
			}
			if (filters.createdBefore) {
				queryParts.push(`created_at:<${filters.createdBefore}`);
			}
			if (filters.updatedAfter) {
				queryParts.push(`updated_at:>${filters.updatedAfter}`);
			}
			if (filters.updatedBefore) {
				queryParts.push(`updated_at:<${filters.updatedBefore}`);
			}

			const queryString = queryParts.join(" AND ");

			// Prepare GraphQL variables
			const variables: ListProductsVariables = {
				first: Math.min(limit, 250), // Shopify max is 250
				after: cursor,
				query: queryString || undefined,
				sortKey: sortBy,
				reverse: sortOrder === "DESC",
			};

			// Fetch products from Shopify
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<ListProductsResponse>({
						query: LIST_PRODUCTS,
						variables,
					}),
				catch: (error) =>
					new ProductNotFoundError(
						"list",
						`Failed to list products: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Transform all products to ONE Platform Things
			const products = yield* Effect.all(
				response.data.products.edges.map((edge) =>
					transformShopifyProduct(
						edge.node as unknown as ShopifyProduct,
						groupId,
					).pipe(
						Effect.mapError(
							(error) =>
								new ProductTransformationError(
									edge.node.id,
									`Transformation failed: ${error._tag}`,
								),
						),
					),
				),
			);

			return {
				products,
				pageInfo: response.data.products.pageInfo,
			};
		});

	/**
	 * Search products by query string
	 *
	 * Searches across:
	 * - Product title
	 * - Product description
	 * - Tags
	 * - Vendor
	 * - SKU (if specified)
	 *
	 * @example
	 * const results = yield* ProductService.search("t-shirt", groupId, {
	 *   limit: 20,
	 *   fields: ["title", "description", "tag"]
	 * });
	 */
	static search = (
		query: string,
		groupId: string,
		options: ProductSearchOptions = {},
		client: ShopifyClient,
	) =>
		Effect.gen(function* () {
			const { limit = 20, fields = ["title", "description", "tag"] } = options;

			// Build Shopify search query
			const searchParts: string[] = [];

			if (fields.includes("title")) {
				searchParts.push(`title:*${query}*`);
			}
			if (fields.includes("description")) {
				searchParts.push(`body:*${query}*`);
			}
			if (fields.includes("tag")) {
				searchParts.push(`tag:${query}`);
			}
			if (fields.includes("vendor")) {
				searchParts.push(`vendor:${query}`);
			}
			if (fields.includes("sku")) {
				searchParts.push(`sku:${query}`);
			}

			const searchQuery = searchParts.join(" OR ");

			// Fetch search results
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<ListProductsResponse>({
						query: SEARCH_PRODUCTS,
						variables: { first: limit, query: searchQuery },
					}),
				catch: (error) =>
					new ProductNotFoundError(
						"search",
						`Search failed: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Transform results to ONE Platform Things
			const products = yield* Effect.all(
				response.data.products.edges.map((edge) =>
					transformShopifyProduct(
						edge.node as unknown as ShopifyProduct,
						groupId,
					).pipe(
						Effect.mapError(
							(error) =>
								new ProductTransformationError(
									edge.node.id,
									`Transformation failed: ${error._tag}`,
								),
						),
					),
				),
			);

			return products;
		});

	// ========================================================================
	// WRITE OPERATIONS
	// ========================================================================

	/**
	 * Create new product
	 *
	 * Creates a product in Shopify with:
	 * - Basic info (title, description, vendor, type)
	 * - Options (size, color, etc.)
	 * - Images
	 * - SEO data
	 * - Metafields
	 *
	 * Shopify automatically creates a default variant if no variants specified.
	 *
	 * Returns the new product's Shopify ID.
	 *
	 * @example
	 * const productId = yield* ProductService.create({
	 *   title: "Classic T-Shirt",
	 *   description: "100% cotton t-shirt",
	 *   productType: "Apparel",
	 *   vendor: "My Brand",
	 *   options: [
	 *     { name: "Size", position: 1, values: ["S", "M", "L", "XL"] },
	 *     { name: "Color", position: 2, values: ["Red", "Blue", "Green"] }
	 *   ]
	 * }, groupId);
	 */
	static create = (input: ProductInput, groupId: string, client: ShopifyClient) =>
		Effect.gen(function* () {
			// Validate input
			if (!input.title || input.title.trim() === "") {
				return yield* Effect.fail(
					new ProductValidationError("title", "Product title is required"),
				);
			}

			// Build GraphQL mutation
			const mutation = `
        mutation CreateProduct($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              handle
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
						productCreate: {
							product: { id: string; title: string; handle: string };
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: { input },
					}),
				catch: (error) =>
					new ProductCreateError(
						`Failed to create product: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.productCreate.userErrors.length > 0) {
				const firstError = response.data.productCreate.userErrors[0];
				return yield* Effect.fail(
					new ProductCreateError(
						`Shopify validation error: ${firstError.message}`,
					),
				);
			}

			// Extract numeric ID from GID
			const productId = response.data.productCreate.product.id
				.split("/")
				.pop();

			return productId || response.data.productCreate.product.id;
		});

	/**
	 * Update product
	 *
	 * Updates product fields. Only fields provided in the input are updated.
	 *
	 * @example
	 * yield* ProductService.update("7891234567890", {
	 *   title: "Updated Title",
	 *   description: "New description",
	 *   tags: ["summer", "sale"]
	 * });
	 */
	static update = (
		id: string,
		updates: Partial<ProductInput>,
		client: ShopifyClient,
	) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/Product/${id}`;

			// Build GraphQL mutation
			const mutation = `
        mutation UpdateProduct($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
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

			// Execute mutation
			const response = yield* Effect.tryPromise({
				try: () =>
					client.query<{
						productUpdate: {
							product: { id: string; title: string };
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: { input: { id: gid, ...updates } },
					}),
				catch: (error) =>
					new ProductUpdateError(
						id,
						`Failed to update product: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.productUpdate.userErrors.length > 0) {
				const firstError = response.data.productUpdate.userErrors[0];
				return yield* Effect.fail(
					new ProductUpdateError(id, `Shopify error: ${firstError.message}`),
				);
			}
		});

	/**
	 * Delete product
	 *
	 * Permanently deletes a product from Shopify.
	 * This action cannot be undone.
	 *
	 * For soft delete, use update() to change status to "ARCHIVED".
	 *
	 * @example
	 * yield* ProductService.delete("7891234567890");
	 */
	static delete = (id: string, client: ShopifyClient) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/Product/${id}`;

			// Build GraphQL mutation
			const mutation = `
        mutation DeleteProduct($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
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
						productDelete: {
							deletedProductId: string | null;
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: { input: { id: gid } },
					}),
				catch: (error) =>
					new ProductDeleteError(
						id,
						`Failed to delete product: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.productDelete.userErrors.length > 0) {
				const firstError = response.data.productDelete.userErrors[0];
				return yield* Effect.fail(
					new ProductDeleteError(id, `Shopify error: ${firstError.message}`),
				);
			}
		});

	/**
	 * Publish product to sales channels
	 *
	 * Makes product available on specified sales channels (e.g., Online Store, POS).
	 *
	 * @param id - Product ID
	 * @param channels - Array of publication IDs (sales channel IDs)
	 *
	 * @example
	 * yield* ProductService.publish("7891234567890", [
	 *   "gid://shopify/Publication/123", // Online Store
	 *   "gid://shopify/Publication/456"  // POS
	 * ]);
	 */
	static publish = (id: string, channels: string[], client: ShopifyClient) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/Product/${id}`;

			// Build GraphQL mutation
			const mutation = `
        mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            publishable {
              availablePublicationsCount {
                count
              }
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
						publishablePublish: {
							publishable: { availablePublicationsCount: { count: number } };
							userErrors: Array<{ field: string[]; message: string }>;
						};
					}>({
						query: mutation,
						variables: {
							id: gid,
							input: channels.map((publicationId) => ({ publicationId })),
						},
					}),
				catch: (error) =>
					new ProductPublishError(
						id,
						channels,
						`Failed to publish product: ${error instanceof Error ? error.message : String(error)}`,
					),
			});

			// Check for errors
			if (response.data.publishablePublish.userErrors.length > 0) {
				const firstError = response.data.publishablePublish.userErrors[0];
				return yield* Effect.fail(
					new ProductPublishError(
						id,
						channels,
						`Shopify error: ${firstError.message}`,
					),
				);
			}
		});

	// ========================================================================
	// UTILITY OPERATIONS
	// ========================================================================

	/**
	 * Get all variants for a product (paginated)
	 *
	 * Handles products with up to 2,048 variants.
	 * Uses cursor-based pagination for efficient fetching.
	 *
	 * @example
	 * const variants = yield* ProductService.getVariants("7891234567890");
	 */
	static getVariants = (id: string, client: ShopifyClient) =>
		Effect.gen(function* () {
			// Convert numeric ID to GID if needed
			const gid = id.startsWith("gid://")
				? id
				: `gid://shopify/Product/${id}`;

			const allVariants: ShopifyProductVariant[] = [];
			let hasNextPage = true;
			let cursor: string | undefined = undefined;

			// Paginate through all variants
			while (hasNextPage) {
				const response = yield* Effect.tryPromise({
					try: () =>
						client.query<{
							product: {
								id: string;
								title: string;
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
							query: GET_PRODUCT_VARIANTS,
							variables: { productId: gid, first: 250, after: cursor },
						}),
					catch: (error) =>
						new ProductNotFoundError(
							id,
							`Failed to fetch variants: ${error instanceof Error ? error.message : String(error)}`,
						),
				});

				// Add variants to array
				for (const edge of response.data.product.variants.edges) {
					allVariants.push(edge.node);
				}

				// Check pagination
				hasNextPage = response.data.product.variants.pageInfo.hasNextPage;
				cursor = response.data.product.variants.pageInfo.endCursor || undefined;
			}

			return allVariants;
		});
}
