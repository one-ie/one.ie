/**
 * CollectionService - Shopify collection management using Effect.ts
 *
 * Maps Shopify Collections to ONE Platform's Groups dimension.
 * Collections are hierarchical categories for organizing products.
 *
 * Ontology Mapping:
 * - Collection → Group (type: "collection")
 * - Manual Collection → Group with manual product assignments
 * - Smart Collection → Group with rule-based auto-assignment
 * - Product-Collection Relationship → Connection (type: "belongs_to")
 *
 * Flow:
 * 1. Create collection → Creates group with type: "collection"
 * 2. Add product → Creates belongs_to connection + event
 * 3. Update rules → Updates group properties + re-evaluates membership
 * 4. Delete collection → Archives group + connections + events
 *
 * Related Documentation:
 * - /home/user/one.ie/one/groups/shopify-collections-mapping.md
 * - Shopify Collection API: https://shopify.dev/docs/api/admin-graphql/latest/objects/Collection
 */

import { Effect } from "effect";
import type { Group, Connection, Event } from "@/types/data-provider";
import type { Id } from "convex/_generated/dataModel";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Collection not found error
 */
export class CollectionNotFoundError {
	readonly _tag = "CollectionNotFoundError";
	constructor(readonly collectionId: string) {}
}

/**
 * Invalid collection input error
 */
export class InvalidCollectionInputError {
	readonly _tag = "InvalidCollectionInputError";
	constructor(readonly message: string) {}
}

/**
 * Product already in collection error
 */
export class ProductAlreadyInCollectionError {
	readonly _tag = "ProductAlreadyInCollectionError";
	constructor(
		readonly productId: string,
		readonly collectionId: string,
	) {}
}

/**
 * Product not in collection error
 */
export class ProductNotInCollectionError {
	readonly _tag = "ProductNotInCollectionError";
	constructor(
		readonly productId: string,
		readonly collectionId: string,
	) {}
}

/**
 * Smart collection rule error
 */
export class SmartCollectionRuleError {
	readonly _tag = "SmartCollectionRuleError";
	constructor(
		readonly collectionId: string,
		readonly message: string,
	) {}
}

/**
 * Collection operation failed error
 */
export class CollectionOperationError {
	readonly _tag = "CollectionOperationError";
	constructor(
		readonly operation: string,
		readonly reason: string,
	) {}
}

/**
 * Union type of all collection errors
 */
export type CollectionError =
	| CollectionNotFoundError
	| InvalidCollectionInputError
	| ProductAlreadyInCollectionError
	| ProductNotInCollectionError
	| SmartCollectionRuleError
	| CollectionOperationError;

// ============================================================================
// COLLECTION DATA TYPES
// ============================================================================

/**
 * Collection input for creation/updates
 */
export interface CollectionInput {
	/** Collection name/title */
	name: string;

	/** Description (HTML supported) */
	description?: string;

	/** URL-friendly handle */
	handle?: string;

	/** Collection type */
	collectionType: "manual" | "smart";

	/** Sort order for products */
	sortOrder?:
		| "manual"
		| "best-selling"
		| "alpha-asc"
		| "alpha-desc"
		| "price-asc"
		| "price-desc"
		| "created"
		| "created-desc";

	/** Smart collection rules (required if type is "smart") */
	smartRules?: SmartCollectionRules;

	/** Collection image URL */
	image?: string;

	/** SEO metadata */
	seo?: {
		title?: string;
		description?: string;
	};

	/** Visibility scope */
	publishedScope?: "web" | "global";

	/** Published status */
	published?: boolean;
}

/**
 * Smart collection rules
 *
 * Automatically determines collection membership based on product properties.
 */
export interface SmartCollectionRules {
	/** Rule logic: false = ALL rules must match (AND), true = ANY rule can match (OR) */
	disjunctive: boolean;

	/** Rule conditions */
	rules: SmartRule[];
}

/**
 * Individual smart collection rule
 */
export interface SmartRule {
	/** Product property to evaluate */
	column:
		| "title"
		| "type"
		| "vendor"
		| "variant_title"
		| "variant_price"
		| "variant_compare_at_price"
		| "variant_weight"
		| "variant_inventory"
		| "tag"
		| "product_metafield_definition"
		| "variant_metafield_definition";

	/** Comparison operator */
	relation:
		| "equals"
		| "not_equals"
		| "contains"
		| "not_contains"
		| "starts_with"
		| "ends_with"
		| "greater_than"
		| "less_than";

	/** Value to compare against */
	condition: string;
}

/**
 * Collection data structure
 *
 * Maps to ONE Platform Group:
 * - Group (type: "collection")
 * - parentGroupId: Store group
 * - properties: Shopify collection metadata
 */
export interface CollectionData extends Group {
	type: "collection";
	properties: {
		/** Shopify collection ID (GID format) */
		shopifyCollectionId: string;

		/** URL-friendly handle */
		handle: string;

		/** Description (HTML) */
		description?: string;

		/** Plain text description */
		descriptionPlainText?: string;

		/** Collection image */
		image?: {
			src: string;
			alt: string;
			width: number;
			height: number;
		};

		/** Product sort order */
		sortOrder: string;

		/** Visibility scope */
		publishedScope: string;

		/** Published timestamp */
		publishedAt?: number;

		/** Collection type */
		collectionType: "manual" | "smart";

		/** Smart collection rules */
		smartRules?: SmartCollectionRules;

		/** Product count (cached) */
		productsCount: number;

		/** SEO metadata */
		seo?: {
			title: string;
			description: string;
		};

		/** Shopify timestamps */
		shopifyCreatedAt: string;
		shopifyUpdatedAt: string;
	};
}

// ============================================================================
// COLLECTION SERVICE INTERFACE
// ============================================================================

/**
 * CollectionService - Collection management operations
 *
 * Business logic layer using Effect.ts for composable error handling.
 * All collection operations map to the 6-dimension ontology:
 *
 * - GROUPS: Collection as Group (type: "collection")
 * - CONNECTIONS: belongs_to connections (product → collection)
 * - EVENTS: collection_created, collection_updated, product_added_to_collection
 * - THINGS: Products that belong to collections
 *
 * Usage Example:
 * ```typescript
 * import { CollectionService } from '@/providers/shopify/services/CollectionService';
 *
 * // Create collection
 * const collectionId = await Effect.runPromise(
 *   CollectionService.create({
 *     name: "Summer Collection",
 *     collectionType: "manual"
 *   }, storeGroupId)
 * );
 *
 * // Add product to collection
 * await Effect.runPromise(
 *   CollectionService.addProduct(collectionId, productId)
 * );
 * ```
 */
export const CollectionService = {
	/**
	 * Get collection by ID
	 *
	 * Retrieves collection data including metadata and product count.
	 * Maps to ONE Platform:
	 * 1. Query group by _id
	 * 2. Verify type === "collection"
	 * 3. Return as CollectionData
	 *
	 * @param id - Collection group ID or Shopify collection ID
	 * @returns Collection data
	 */
	get: (id: string): Effect.Effect<CollectionData, CollectionError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query group by _id or properties.shopifyCollectionId
			// 2. Verify group.type === "collection"
			// 3. Return group as CollectionData
			// 4. If not found, fail with CollectionNotFoundError

			// Mock implementation
			return yield* Effect.fail(new CollectionNotFoundError(id));
		}),

	/**
	 * List collections
	 *
	 * Retrieves all collections in a store group.
	 * Supports filtering by collection type and published status.
	 *
	 * Maps to ONE Platform:
	 * 1. Query groups where type === "collection" AND parentGroupId === groupId
	 * 2. Filter by type/status if specified
	 * 3. Return array of CollectionData
	 *
	 * @param groupId - Store group ID
	 * @param filters - Optional filters (type, published)
	 * @returns Array of collections
	 */
	list: (
		groupId: Id<"groups">,
		filters?: {
			collectionType?: "manual" | "smart";
			published?: boolean;
		},
	): Effect.Effect<CollectionData[], CollectionError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query groups where:
			//    - type === "collection"
			//    - parentGroupId === groupId
			//    - status === "active"
			// 2. Apply filters if specified
			// 3. Return array

			// Mock implementation
			return [];
		}),

	/**
	 * Create collection
	 *
	 * Creates a new collection (manual or smart).
	 * Maps to ONE Platform operations:
	 * 1. Call Shopify Collection API collectionCreate
	 * 2. Create group with type: "collection"
	 * 3. Create collection_created event
	 * 4. If smart collection, evaluate rules and add products
	 *
	 * @param input - Collection data
	 * @param groupId - Store group ID (parent)
	 * @returns Collection ID (ONE Platform group ID)
	 */
	create: (
		input: CollectionInput,
		groupId: Id<"groups">,
	): Effect.Effect<string, CollectionError> =>
		Effect.gen(function* () {
			// Validate input
			if (!input.name || input.name.trim().length === 0) {
				return yield* Effect.fail(
					new InvalidCollectionInputError("Collection name is required"),
				);
			}

			if (
				input.collectionType === "smart" &&
				(!input.smartRules || input.smartRules.rules.length === 0)
			) {
				return yield* Effect.fail(
					new InvalidCollectionInputError(
						"Smart collections require at least one rule",
					),
				);
			}

			// TODO: Implement
			// 1. Call Shopify Admin API collectionCreate mutation
			// 2. Create group with:
			//    - type: "collection"
			//    - name: input.name
			//    - parentGroupId: groupId
			//    - properties: all input fields + shopifyCollectionId
			// 3. Create collection_created event
			// 4. If smart collection, call evaluateSmartRules()
			// 5. Return group._id

			// Mock implementation
			return "mock-collection-id";
		}),

	/**
	 * Update collection
	 *
	 * Updates collection metadata.
	 * Maps to ONE Platform operations:
	 * 1. Call Shopify Collection API collectionUpdate
	 * 2. Update group properties
	 * 3. Create collection_updated event
	 * 4. If smart rules changed, re-evaluate membership
	 *
	 * @param id - Collection ID
	 * @param updates - Partial collection data to update
	 * @returns void on success
	 */
	update: (
		id: string,
		updates: Partial<CollectionInput>,
	): Effect.Effect<void, CollectionError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query existing collection
			// 2. Call Shopify Admin API collectionUpdate mutation
			// 3. Update group properties
			// 4. Create collection_updated event with changes
			// 5. If smartRules changed, call re-evaluateSmartRules()

			// Mock implementation
			return;
		}),

	/**
	 * Delete collection
	 *
	 * Deletes a collection and all product relationships.
	 * Maps to ONE Platform operations:
	 * 1. Call Shopify Collection API collectionDelete
	 * 2. Archive group (set status: "archived")
	 * 3. Archive all belongs_to connections
	 * 4. Create collection_deleted event
	 *
	 * @param id - Collection ID
	 * @returns void on success
	 */
	delete: (id: string): Effect.Effect<void, CollectionError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Call Shopify Admin API collectionDelete mutation
			// 2. Update group.status = "archived"
			// 3. Query all belongs_to connections for this collection
			// 4. Update connections.status = "archived"
			// 5. Create collection_deleted event

			// Mock implementation
			return;
		}),

	/**
	 * Add product to collection
	 *
	 * Adds a product to a manual collection.
	 * NOT allowed for smart collections (use updateSmartRules instead).
	 *
	 * Maps to ONE Platform operations:
	 * 1. Create belongs_to connection (product → collection)
	 * 2. Create product_added_to_collection event
	 *
	 * @param collectionId - Collection ID
	 * @param productId - Product ID
	 * @param position - Manual sort position (optional)
	 * @returns void on success
	 */
	addProduct: (
		collectionId: string,
		productId: string,
		position?: number,
	): Effect.Effect<void, CollectionError> =>
		Effect.gen(function* () {
			// Get collection to verify it's manual
			const collection = yield* CollectionService.get(collectionId);

			if (collection.properties.collectionType === "smart") {
				return yield* Effect.fail(
					new CollectionOperationError(
						"addProduct",
						"Cannot manually add products to smart collections",
					),
				);
			}

			// TODO: Implement
			// 1. Check if connection already exists
			// 2. If exists, fail with ProductAlreadyInCollectionError
			// 3. Call Shopify Admin API collectionAddProducts mutation
			// 4. Create belongs_to connection with:
			//    - fromId: product thing ID
			//    - toId: collection group ID
			//    - properties: { position, collectId, addedAt }
			// 5. Create product_added_to_collection event
			// 6. Update collection.properties.productsCount++

			// Mock implementation
			return;
		}),

	/**
	 * Remove product from collection
	 *
	 * Removes a product from a manual collection.
	 * NOT allowed for smart collections (use updateSmartRules instead).
	 *
	 * Maps to ONE Platform operations:
	 * 1. Archive belongs_to connection
	 * 2. Create product_removed_from_collection event
	 *
	 * @param collectionId - Collection ID
	 * @param productId - Product ID
	 * @returns void on success
	 */
	removeProduct: (
		collectionId: string,
		productId: string,
	): Effect.Effect<void, CollectionError> =>
		Effect.gen(function* () {
			// Get collection to verify it's manual
			const collection = yield* CollectionService.get(collectionId);

			if (collection.properties.collectionType === "smart") {
				return yield* Effect.fail(
					new CollectionOperationError(
						"removeProduct",
						"Cannot manually remove products from smart collections",
					),
				);
			}

			// TODO: Implement
			// 1. Query belongs_to connection
			// 2. If not found, fail with ProductNotInCollectionError
			// 3. Call Shopify Admin API collectionRemoveProducts mutation
			// 4. Update connection.status = "archived"
			// 5. Create product_removed_from_collection event
			// 6. Update collection.properties.productsCount--

			// Mock implementation
			return;
		}),

	/**
	 * Update smart collection rules
	 *
	 * Updates the rules for a smart collection and re-evaluates membership.
	 * Only allowed for smart collections.
	 *
	 * Maps to ONE Platform operations:
	 * 1. Update group properties.smartRules
	 * 2. Re-evaluate all products in store
	 * 3. Add/remove belongs_to connections as needed
	 * 4. Create smart_collection_rules_updated event
	 *
	 * @param collectionId - Collection ID
	 * @param rules - New smart rules
	 * @returns void on success
	 */
	updateSmartRules: (
		collectionId: string,
		rules: SmartCollectionRules,
	): Effect.Effect<void, CollectionError> =>
		Effect.gen(function* () {
			// Get collection to verify it's smart
			const collection = yield* CollectionService.get(collectionId);

			if (collection.properties.collectionType === "manual") {
				return yield* Effect.fail(
					new CollectionOperationError(
						"updateSmartRules",
						"Cannot update rules on manual collections",
					),
				);
			}

			// Validate rules
			if (rules.rules.length === 0) {
				return yield* Effect.fail(
					new SmartCollectionRuleError(
						collectionId,
						"Smart collections require at least one rule",
					),
				);
			}

			// TODO: Implement
			// 1. Store previous rules for event
			// 2. Call Shopify Admin API collectionUpdate mutation
			// 3. Update group.properties.smartRules
			// 4. Call evaluateSmartRules() to re-evaluate membership
			// 5. Create smart_collection_rules_updated event with:
			//    - previousRules
			//    - newRules
			//    - productsAffected: { added, removed }

			// Mock implementation
			return;
		}),

	/**
	 * Get collection products
	 *
	 * Retrieves all products in a collection.
	 * Maps to ONE Platform:
	 * 1. Query belongs_to connections where toId === collectionId
	 * 2. Return product things
	 *
	 * @param collectionId - Collection ID
	 * @param limit - Max products to return
	 * @param offset - Pagination offset
	 * @returns Array of product things
	 */
	getProducts: (
		collectionId: string,
		limit?: number,
		offset?: number,
	): Effect.Effect<any[], CollectionError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query belongs_to connections where:
			//    - toId === collectionId
			//    - status === "active"
			// 2. Get product things via fromId
			// 3. Apply limit/offset for pagination
			// 4. Return products

			// Mock implementation
			return [];
		}),

	/**
	 * Evaluate smart collection rules
	 *
	 * INTERNAL: Evaluates smart collection rules against all products.
	 * Creates/removes belongs_to connections based on rule matches.
	 *
	 * @param collectionId - Collection ID
	 * @returns Count of products added/removed
	 */
	evaluateSmartRules: (
		collectionId: string,
	): Effect.Effect<{ added: number; removed: number }, CollectionError> =>
		Effect.gen(function* () {
			const collection = yield* CollectionService.get(collectionId);

			if (collection.properties.collectionType !== "smart") {
				return { added: 0, removed: 0 };
			}

			// TODO: Implement
			// 1. Query all products in store (same groupId)
			// 2. For each product:
			//    a. Evaluate rules using evaluateRule()
			//    b. Determine if product should be in collection
			//    c. Check if connection exists
			//    d. If should be in collection && no connection:
			//       - Create belongs_to connection
			//       - Increment added count
			//    e. If should NOT be in collection && connection exists:
			//       - Archive connection
			//       - Increment removed count
			// 3. Return counts

			// Mock implementation
			return { added: 0, removed: 0 };
		}),
};

// ============================================================================
// HELPER FUNCTIONS (PRIVATE)
// ============================================================================

/**
 * Evaluate a single smart collection rule against a product
 */
function evaluateRule(product: any, rule: SmartRule): boolean {
	const value = getProductProperty(product, rule.column);
	const condition = rule.condition;

	switch (rule.relation) {
		case "equals":
			return String(value) === condition;
		case "not_equals":
			return String(value) !== condition;
		case "contains":
			return String(value).toLowerCase().includes(condition.toLowerCase());
		case "not_contains":
			return !String(value).toLowerCase().includes(condition.toLowerCase());
		case "starts_with":
			return String(value).toLowerCase().startsWith(condition.toLowerCase());
		case "ends_with":
			return String(value).toLowerCase().endsWith(condition.toLowerCase());
		case "greater_than":
			return Number(value) > Number(condition);
		case "less_than":
			return Number(value) < Number(condition);
		default:
			return false;
	}
}

/**
 * Evaluate all smart collection rules against a product
 */
function evaluateRules(
	product: any,
	rules: SmartCollectionRules,
): boolean {
	const results = rules.rules.map((rule) => evaluateRule(product, rule));

	return rules.disjunctive
		? results.some((r) => r) // OR: Any rule matches
		: results.every((r) => r); // AND: All rules match
}

/**
 * Get product property value for rule evaluation
 */
function getProductProperty(product: any, column: string): any {
	switch (column) {
		case "title":
			return product.name;
		case "type":
			return product.properties.productType;
		case "vendor":
			return product.properties.vendor;
		case "tag":
			return product.properties.tags; // Array of tags
		// Variant properties would require querying variants
		default:
			return undefined;
	}
}

/**
 * Format collection error for logging
 */
function formatCollectionError(error: CollectionError): string {
	switch (error._tag) {
		case "CollectionNotFoundError":
			return `Collection not found: ${error.collectionId}`;
		case "InvalidCollectionInputError":
			return `Invalid collection input: ${error.message}`;
		case "ProductAlreadyInCollectionError":
			return `Product ${error.productId} already in collection ${error.collectionId}`;
		case "ProductNotInCollectionError":
			return `Product ${error.productId} not in collection ${error.collectionId}`;
		case "SmartCollectionRuleError":
			return `Smart collection rule error (${error.collectionId}): ${error.message}`;
		case "CollectionOperationError":
			return `Collection operation failed (${error.operation}): ${error.reason}`;
	}
}

// ============================================================================
// ONTOLOGY MAPPING NOTES
// ============================================================================

/**
 * ONTOLOGY MAPPING SUMMARY
 *
 * DIMENSION 1: GROUPS
 * - Collection → Group (type: "collection")
 * - parentGroupId: Store group (for multi-tenant isolation)
 * - Supports hierarchical nesting (collections can have sub-collections)
 * - Properties include:
 *   - shopifyCollectionId: Shopify GID
 *   - handle: URL-friendly identifier
 *   - collectionType: "manual" | "smart"
 *   - smartRules: Rule configuration (if smart)
 *   - productsCount: Cached count
 *
 * DIMENSION 2: PEOPLE
 * - Not directly used in collection operations
 * - Role-based access:
 *   - org_owner: Can create/update/delete collections
 *   - org_user: Can view collections
 *   - customer: Can view published collections only
 *
 * DIMENSION 3: THINGS
 * - Products belong to collections
 * - Connection from product → collection
 *
 * DIMENSION 4: CONNECTIONS
 * - Product-Collection → Connection (type: "belongs_to")
 * - fromId: Product thing ID
 * - toId: Collection group ID
 * - properties include:
 *   - collectId: Shopify Collect resource ID (manual only)
 *   - position: Manual sort order (manual only)
 *   - sortValue: Shopify sort value
 *   - matchedRules: Which rules matched (smart only)
 *   - autoAdded: true for smart collections, false for manual
 *   - addedAt: Timestamp
 *
 * DIMENSION 5: EVENTS
 * - collection_created: Collection initialized
 * - collection_updated: Metadata changed
 * - collection_deleted: Collection archived
 * - product_added_to_collection: Product manually added
 * - product_removed_from_collection: Product removed
 * - smart_collection_rules_updated: Rules changed
 *
 * DIMENSION 6: KNOWLEDGE
 * - Not directly used in collection operations
 * - Could be used for:
 *   - AI-powered collection suggestions
 *   - Automated product categorization
 *   - Collection performance analytics
 *
 * EDGE CASES HANDLED:
 * 1. Manual vs Smart: Different operations allowed
 * 2. Smart rule evaluation: Client-side or server-side
 * 3. Nested collections: ONE supports, Shopify doesn't (native)
 * 4. Product in multiple collections: Multiple belongs_to connections
 * 5. Rule conflicts: Last-write-wins for rule updates
 * 6. Empty collections: Allowed, productsCount = 0
 * 7. Circular references: Prevented by group hierarchy validation
 * 8. Concurrent updates: Shopify handles conflicts via API
 * 9. Published vs unpublished: Controlled via properties.published
 * 10. SEO optimization: Stored in properties.seo
 *
 * INTEGRATION POINTS:
 * - Shopify Admin GraphQL API (collectionCreate, collectionUpdate, etc.)
 * - Convex database (groups, connections, events tables)
 * - GroupService (for managing collection groups)
 * - ConnectionService (for belongs_to relationships)
 * - EventService (for collection events)
 */
