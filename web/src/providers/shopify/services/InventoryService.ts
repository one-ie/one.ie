/**
 * InventoryService - Shopify inventory management using Effect.ts
 *
 * Maps Shopify Inventory system to ONE Platform's Things dimension.
 * Inventory levels are stored as properties on product variant things.
 *
 * Ontology Mapping:
 * - InventoryItem → Properties on product variant thing
 * - InventoryLevel → Properties on product variant thing (per location)
 * - Location → Optional Group (type: "warehouse") or inline in properties
 *
 * Flow:
 * 1. Get levels → Query variant thing's inventoryByLocation property
 * 2. Adjust inventory → Update variant properties + create event
 * 3. Set inventory → Replace quantity + create event
 * 4. Activate location → Add location to variant's inventoryByLocation array
 *
 * Related Documentation:
 * - /home/user/one.ie/one/things/shopify-inventory-mapping.md
 * - Shopify Inventory API: https://shopify.dev/docs/api/admin-graphql/latest/objects/InventoryLevel
 */

import { Effect } from "effect";
import type { Thing, Event } from "@/types/data-provider";
import type { Id } from "convex/_generated/dataModel";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Variant not found error
 */
export class VariantNotFoundError {
	readonly _tag = "VariantNotFoundError";
	constructor(readonly variantId: string) {}
}

/**
 * Location not found error
 */
export class LocationNotFoundError {
	readonly _tag = "LocationNotFoundError";
	constructor(readonly locationId: string) {}
}

/**
 * Invalid inventory quantity error
 */
export class InvalidInventoryQuantityError {
	readonly _tag = "InvalidInventoryQuantityError";
	constructor(
		readonly quantity: number,
		readonly message: string,
	) {}
}

/**
 * Insufficient inventory error
 */
export class InsufficientInventoryError {
	readonly _tag = "InsufficientInventoryError";
	constructor(
		readonly variantId: string,
		readonly requested: number,
		readonly available: number,
	) {}
}

/**
 * Inventory not tracked error
 */
export class InventoryNotTrackedError {
	readonly _tag = "InventoryNotTrackedError";
	constructor(readonly variantId: string) {}
}

/**
 * Inventory operation failed error
 */
export class InventoryOperationError {
	readonly _tag = "InventoryOperationError";
	constructor(
		readonly operation: string,
		readonly reason: string,
	) {}
}

/**
 * Union type of all inventory errors
 */
export type InventoryError =
	| VariantNotFoundError
	| LocationNotFoundError
	| InvalidInventoryQuantityError
	| InsufficientInventoryError
	| InventoryNotTrackedError
	| InventoryOperationError;

// ============================================================================
// INVENTORY DATA TYPES
// ============================================================================

/**
 * Inventory level at a specific location
 *
 * Maps to ONE Platform:
 * - Element in variant.properties.inventoryByLocation array
 */
export interface InventoryLevel {
	/** Shopify location ID (GID format) */
	locationId: string;

	/** Location name */
	locationName: string;

	/** Units available for sale */
	available: number;

	/** Units reserved in pending orders */
	reserved?: number;

	/** Total units physically present (available + reserved) */
	onHand?: number;

	/** Last update timestamp */
	updatedAt: number;
}

/**
 * Inventory adjustment reason
 */
export type InventoryAdjustmentReason =
	| "correction"
	| "cycle_count"
	| "damage"
	| "promotion"
	| "received"
	| "restock"
	| "return"
	| "sale"
	| "shrinkage"
	| "theft";

/**
 * Inventory level response with metadata
 */
export interface InventoryLevelResponse {
	/** Inventory levels per location */
	levels: InventoryLevel[];

	/** Total available across all locations */
	totalAvailable: number;

	/** Total reserved across all locations */
	totalReserved: number;

	/** Total on-hand across all locations */
	totalOnHand: number;

	/** Inventory tracking enabled */
	tracked: boolean;

	/** Variant allows selling when out of stock */
	allowBackorder: boolean;

	/** Stock status */
	status: "in_stock" | "low_stock" | "out_of_stock" | "backorder";
}

// ============================================================================
// INVENTORY SERVICE INTERFACE
// ============================================================================

/**
 * InventoryService - Inventory management operations
 *
 * Business logic layer using Effect.ts for composable error handling.
 * All inventory operations map to the 6-dimension ontology:
 *
 * - THINGS: Product variant with inventory properties
 * - EVENTS: inventory_level_updated, inventory_restocked, inventory_low_stock_alert
 * - GROUPS: Optional warehouse/location groups
 *
 * Usage Example:
 * ```typescript
 * import { InventoryService } from '@/providers/shopify/services/InventoryService';
 *
 * // Get inventory levels
 * const levels = await Effect.runPromise(
 *   InventoryService.getLevels("gid://shopify/ProductVariant/123")
 * );
 *
 * // Adjust inventory
 * await Effect.runPromise(
 *   InventoryService.adjust(
 *     "gid://shopify/ProductVariant/123",
 *     -2,
 *     "gid://shopify/Location/456"
 *   )
 * );
 * ```
 */
export const InventoryService = {
	/**
	 * Get inventory levels
	 *
	 * Retrieves inventory levels for a variant across all locations.
	 * Maps to ONE Platform:
	 * 1. Query variant thing by shopifyVariantId
	 * 2. Return properties.inventoryByLocation array
	 *
	 * @param variantId - Product variant ID (GID format)
	 * @returns Inventory levels with totals
	 */
	getLevels: (
		variantId: string,
	): Effect.Effect<InventoryLevelResponse, InventoryError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query variant thing by properties.shopifyVariantId
			// 2. If not found, fail with VariantNotFoundError
			// 3. Extract inventoryByLocation from properties
			// 4. Calculate totals:
			//    - totalAvailable = sum of all levels.available
			//    - totalReserved = sum of all levels.reserved
			//    - totalOnHand = sum of all levels.onHand
			// 5. Determine status using calculateStockStatus()
			// 6. Return InventoryLevelResponse

			// Mock implementation
			return yield* Effect.fail(new VariantNotFoundError(variantId));
		}),

	/**
	 * Adjust inventory (relative change)
	 *
	 * Adjusts inventory by a delta (positive = add, negative = subtract).
	 * Maps to ONE Platform operations:
	 * 1. Update variant properties.inventoryByLocation[location].available += delta
	 * 2. Create inventory_level_updated event
	 * 3. Check for low stock and create alert if needed
	 *
	 * @param variantId - Product variant ID
	 * @param delta - Change amount (positive or negative)
	 * @param locationId - Location ID (optional, uses first location if not specified)
	 * @param reason - Adjustment reason
	 * @returns void on success
	 */
	adjust: (
		variantId: string,
		delta: number,
		locationId?: string,
		reason?: InventoryAdjustmentReason,
	): Effect.Effect<void, InventoryError> =>
		Effect.gen(function* () {
			// Validate delta
			if (!Number.isInteger(delta) || delta === 0) {
				return yield* Effect.fail(
					new InvalidInventoryQuantityError(
						delta,
						"Delta must be a non-zero integer",
					),
				);
			}

			// TODO: Implement
			// 1. Query variant thing
			// 2. Check if inventory is tracked
			// 3. Find location in inventoryByLocation array
			// 4. Calculate new available: current + delta
			// 5. If negative and inventoryPolicy !== "continue", fail
			// 6. Call Shopify Admin API inventoryAdjustQuantities
			// 7. Update variant properties.inventoryByLocation[location].available
			// 8. Update properties.inventory.totalAvailable
			// 9. Create inventory_level_updated event with:
			//    - previousAvailable
			//    - newAvailable
			//    - delta
			//    - reason
			// 10. If new level < lowStockThreshold, create low_stock_alert event

			// Mock implementation
			return;
		}),

	/**
	 * Set inventory (absolute value)
	 *
	 * Sets inventory to an exact quantity.
	 * Maps to ONE Platform operations:
	 * 1. Update variant properties.inventoryByLocation[location].available = quantity
	 * 2. Create inventory_level_updated event
	 * 3. Check for low stock and create alert if needed
	 *
	 * @param variantId - Product variant ID
	 * @param quantity - New absolute quantity
	 * @param locationId - Location ID (optional, uses first location if not specified)
	 * @param reason - Adjustment reason
	 * @returns void on success
	 */
	set: (
		variantId: string,
		quantity: number,
		locationId?: string,
		reason?: InventoryAdjustmentReason,
	): Effect.Effect<void, InventoryError> =>
		Effect.gen(function* () {
			// Validate quantity
			if (quantity < 0 || !Number.isInteger(quantity)) {
				return yield* Effect.fail(
					new InvalidInventoryQuantityError(
						quantity,
						"Quantity must be a non-negative integer",
					),
				);
			}

			// TODO: Implement
			// 1. Query variant thing
			// 2. Check if inventory is tracked
			// 3. Find location in inventoryByLocation array
			// 4. Get previous quantity
			// 5. Call Shopify Admin API inventorySetOnHandQuantities
			// 6. Update variant properties.inventoryByLocation[location]:
			//    - available = quantity
			//    - onHand = quantity
			//    - updatedAt = Date.now()
			// 7. Recalculate properties.inventory.totalAvailable
			// 8. Create inventory_level_updated event
			// 9. If quantity < lowStockThreshold, create low_stock_alert event
			// 10. If quantity === 0, create inventory_out_of_stock event

			// Mock implementation
			return;
		}),

	/**
	 * Activate inventory tracking at location
	 *
	 * Activates inventory tracking for a variant at a specific location.
	 * Adds the location to the variant's inventoryByLocation array.
	 *
	 * Maps to ONE Platform operations:
	 * 1. Add location to variant properties.inventoryByLocation array
	 * 2. Initialize quantity to 0
	 * 3. Create inventory_activated event
	 *
	 * @param variantId - Product variant ID
	 * @param locationId - Location ID to activate
	 * @param initialQuantity - Initial stock quantity (default: 0)
	 * @returns void on success
	 */
	activate: (
		variantId: string,
		locationId: string,
		initialQuantity?: number,
	): Effect.Effect<void, InventoryError> =>
		Effect.gen(function* () {
			const quantity = initialQuantity ?? 0;

			// Validate quantity
			if (quantity < 0 || !Number.isInteger(quantity)) {
				return yield* Effect.fail(
					new InvalidInventoryQuantityError(
						quantity,
						"Initial quantity must be a non-negative integer",
					),
				);
			}

			// TODO: Implement
			// 1. Query variant thing
			// 2. Query location (optional, can be inline)
			// 3. Check if location already in inventoryByLocation
			// 4. Call Shopify Admin API inventoryActivate
			// 5. Add location to inventoryByLocation array:
			//    {
			//      locationId,
			//      locationName: "Location Name",
			//      available: quantity,
			//      reserved: 0,
			//      onHand: quantity,
			//      updatedAt: Date.now()
			//    }
			// 6. Update properties.inventory.totalAvailable
			// 7. Create inventory_activated event

			// Mock implementation
			return;
		}),

	/**
	 * Deactivate inventory tracking at location
	 *
	 * Deactivates inventory tracking for a variant at a specific location.
	 * Removes the location from the variant's inventoryByLocation array.
	 *
	 * @param variantId - Product variant ID
	 * @param locationId - Location ID to deactivate
	 * @returns void on success
	 */
	deactivate: (
		variantId: string,
		locationId: string,
	): Effect.Effect<void, InventoryError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query variant thing
			// 2. Find location in inventoryByLocation
			// 3. Call Shopify Admin API inventoryDeactivate
			// 4. Remove location from array
			// 5. Recalculate totalAvailable
			// 6. Create inventory_deactivated event

			// Mock implementation
			return;
		}),

	/**
	 * Get inventory value
	 *
	 * Calculates total inventory value (quantity * cost).
	 * Useful for inventory reports and analytics.
	 *
	 * @param variantId - Product variant ID
	 * @param locationId - Optional location filter
	 * @returns Total inventory value
	 */
	getValue: (
		variantId: string,
		locationId?: string,
	): Effect.Effect<number, InventoryError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query variant thing
			// 2. Get cost from properties.inventoryItem.cost
			// 3. Get quantity from inventoryByLocation (filtered by location if specified)
			// 4. Return quantity * cost

			// Mock implementation
			return 0;
		}),

	/**
	 * Check stock status
	 *
	 * Determines stock status based on current inventory and thresholds.
	 *
	 * @param variantId - Product variant ID
	 * @returns Stock status
	 */
	getStatus: (
		variantId: string,
	): Effect.Effect<
		"in_stock" | "low_stock" | "out_of_stock" | "backorder",
		InventoryError
	> =>
		Effect.gen(function* () {
			const levels = yield* InventoryService.getLevels(variantId);
			return levels.status;
		}),

	/**
	 * Reserve inventory
	 *
	 * Reserves inventory for a pending order.
	 * Decreases available, increases reserved.
	 *
	 * @param variantId - Product variant ID
	 * @param quantity - Quantity to reserve
	 * @param locationId - Location to reserve from
	 * @param orderId - Associated order ID
	 * @returns void on success
	 */
	reserve: (
		variantId: string,
		quantity: number,
		locationId: string,
		orderId: string,
	): Effect.Effect<void, InventoryError> =>
		Effect.gen(function* () {
			// Validate quantity
			if (quantity <= 0 || !Number.isInteger(quantity)) {
				return yield* Effect.fail(
					new InvalidInventoryQuantoryError(
						quantity,
						"Quantity must be a positive integer",
					),
				);
			}

			// TODO: Implement
			// 1. Query variant thing
			// 2. Get current available at location
			// 3. If available < quantity && inventoryPolicy === "deny":
			//    - Fail with InsufficientInventoryError
			// 4. Update inventoryByLocation[location]:
			//    - available -= quantity
			//    - reserved += quantity (if tracked)
			// 5. Create inventory_reserved event with orderId
			// 6. Update totalAvailable

			// Mock implementation
			return;
		}),

	/**
	 * Release reserved inventory
	 *
	 * Releases reserved inventory (e.g., when order is cancelled).
	 * Increases available, decreases reserved.
	 *
	 * @param variantId - Product variant ID
	 * @param quantity - Quantity to release
	 * @param locationId - Location to release to
	 * @param orderId - Associated order ID
	 * @returns void on success
	 */
	release: (
		variantId: string,
		quantity: number,
		locationId: string,
		orderId: string,
	): Effect.Effect<void, InventoryError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query variant thing
			// 2. Update inventoryByLocation[location]:
			//    - available += quantity
			//    - reserved -= quantity
			// 3. Create inventory_released event with orderId
			// 4. Update totalAvailable

			// Mock implementation
			return;
		}),
};

// ============================================================================
// HELPER FUNCTIONS (PRIVATE)
// ============================================================================

/**
 * Calculate stock status based on quantity and thresholds
 */
function calculateStockStatus(
	totalAvailable: number,
	inventoryPolicy: string,
	lowStockThreshold: number,
): "in_stock" | "low_stock" | "out_of_stock" | "backorder" {
	if (totalAvailable <= 0) {
		return inventoryPolicy === "continue" ? "backorder" : "out_of_stock";
	}

	if (totalAvailable <= lowStockThreshold) {
		return "low_stock";
	}

	return "in_stock";
}

/**
 * Calculate total available inventory across all locations
 */
function calculateTotalAvailable(levels: InventoryLevel[]): number {
	return levels.reduce((sum, level) => sum + level.available, 0);
}

/**
 * Calculate total reserved inventory across all locations
 */
function calculateTotalReserved(levels: InventoryLevel[]): number {
	return levels.reduce((sum, level) => sum + (level.reserved ?? 0), 0);
}

/**
 * Calculate total on-hand inventory across all locations
 */
function calculateTotalOnHand(levels: InventoryLevel[]): number {
	return levels.reduce((sum, level) => sum + (level.onHand ?? 0), 0);
}

/**
 * Find location in inventory levels array
 */
function findLocation(
	levels: InventoryLevel[],
	locationId: string,
): InventoryLevel | undefined {
	return levels.find((level) => level.locationId === locationId);
}

/**
 * Get first location (default location)
 */
function getFirstLocation(levels: InventoryLevel[]): InventoryLevel | undefined {
	return levels[0];
}

/**
 * Validate inventory quantity
 */
function validateInventoryQuantity(
	quantity: number,
	allowNegative = false,
): Effect.Effect<void, InventoryError> {
	if (!Number.isInteger(quantity)) {
		return Effect.fail(
			new InvalidInventoryQuantityError(
				quantity,
				"Quantity must be an integer",
			),
		);
	}

	if (!allowNegative && quantity < 0) {
		return Effect.fail(
			new InvalidInventoryQuantityError(
				quantity,
				"Quantity must be non-negative",
			),
		);
	}

	return Effect.succeed(undefined);
}

/**
 * Format inventory error for logging
 */
function formatInventoryError(error: InventoryError): string {
	switch (error._tag) {
		case "VariantNotFoundError":
			return `Variant not found: ${error.variantId}`;
		case "LocationNotFoundError":
			return `Location not found: ${error.locationId}`;
		case "InvalidInventoryQuantityError":
			return `Invalid quantity ${error.quantity}: ${error.message}`;
		case "InsufficientInventoryError":
			return `Insufficient inventory for variant ${error.variantId}: requested ${error.requested}, available ${error.available}`;
		case "InventoryNotTrackedError":
			return `Inventory not tracked for variant: ${error.variantId}`;
		case "InventoryOperationError":
			return `Inventory operation failed (${error.operation}): ${error.reason}`;
	}
}

// ============================================================================
// ONTOLOGY MAPPING NOTES
// ============================================================================

/**
 * ONTOLOGY MAPPING SUMMARY
 *
 * DIMENSION 1: GROUPS
 * - Location → Optional Group (type: "warehouse")
 * - parentGroupId: Store group
 * - For simple setups, locations can be inline in variant properties
 * - For complex fulfillment, locations can be separate groups
 *
 * DIMENSION 2: PEOPLE
 * - Not directly used in inventory operations
 * - Role-based access:
 *   - org_owner: Full inventory management
 *   - org_user: View inventory only
 *   - customer: No access to inventory data
 *
 * DIMENSION 3: THINGS
 * - Product Variant → Thing (type: "product_variant")
 * - Properties include:
 *   - inventoryItem: InventoryItem metadata
 *     - id: Shopify InventoryItem GID
 *     - tracked: Boolean
 *     - cost: Unit cost
 *     - sku: Stock-keeping unit
 *     - requiresShipping: Boolean
 *   - inventoryPolicy: "continue" | "deny"
 *   - inventory: Aggregated totals
 *     - totalAvailable: Sum across all locations
 *     - totalReserved: Sum of reserved
 *     - totalOnHand: Sum of on-hand
 *     - lastUpdated: Timestamp
 *   - inventoryByLocation: Array of InventoryLevel
 *     - locationId: Shopify Location GID
 *     - locationName: Display name
 *     - available: Units available for sale
 *     - reserved: Units in pending orders
 *     - onHand: Physical units present
 *     - updatedAt: Timestamp
 *   - stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "backorder"
 *   - lowStockThreshold: Alert threshold
 *
 * DIMENSION 4: CONNECTIONS
 * - Not directly used in inventory operations
 * - Could be used for:
 *   - Warehouse transfer tracking
 *   - Supplier relationships
 *   - Product bundles (inventory reserves for bundle components)
 *
 * DIMENSION 5: EVENTS
 * - inventory_level_updated: Quantity changed
 * - inventory_restocked: Inventory added
 * - inventory_low_stock_alert: Below threshold
 * - inventory_out_of_stock: Reached zero
 * - inventory_activated: Location tracking enabled
 * - inventory_deactivated: Location tracking disabled
 * - inventory_reserved: Reserved for order
 * - inventory_released: Reservation cancelled
 *
 * DIMENSION 6: KNOWLEDGE
 * - Not directly used in inventory operations
 * - Could be used for:
 *   - Demand forecasting (AI-powered)
 *   - Reorder point recommendations
 *   - Inventory optimization suggestions
 *   - Seasonal trend analysis
 *
 * EDGE CASES HANDLED:
 * 1. Multi-location: inventoryByLocation array supports 1-1000 locations
 * 2. Negative inventory: Allowed if inventoryPolicy = "continue"
 * 3. Backorders: Tracked separately from regular stock
 * 4. Reserved inventory: available vs onHand distinction
 * 5. Concurrent updates: Shopify API handles conflicts
 * 6. Location not found: Use first location as default
 * 7. Inventory not tracked: Some variants don't track inventory
 * 8. Zero cost items: Valid (e.g., free samples)
 * 9. Partial fulfillment: Reserved quantity can be less than ordered
 * 10. Returns: Releases reserved inventory, increases available
 * 11. Damaged goods: Adjustments with reason tracking
 * 12. Cycle counts: Periodic full inventory audits
 *
 * INTEGRATION POINTS:
 * - Shopify Admin GraphQL API (inventoryAdjustQuantities, inventorySetOnHandQuantities)
 * - Convex database (things table for variant properties)
 * - EventService (for inventory events)
 * - OrderService (for reserve/release operations)
 * - VariantService (for querying variant things)
 */
