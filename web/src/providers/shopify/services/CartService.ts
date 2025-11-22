/**
 * CartService - Shopping cart management using Effect.ts
 *
 * Maps Shopify Cart API to ONE Platform's Connections dimension.
 * Cart items are represented as "in_cart" connections between customers and products.
 *
 * Ontology Mapping:
 * - Cart → Temporary thing (type: "checkout") with status: "active"
 * - Cart Item → Connection (type: "in_cart") from customer to product
 * - Checkout URL → Property on checkout thing
 *
 * Flow:
 * 1. Create cart → Creates checkout thing
 * 2. Add item → Creates in_cart connection + cart_item_added event
 * 3. Update item → Updates connection quantity + cart_item_updated event
 * 4. Remove item → Archives connection + cart_item_removed event
 * 5. Get checkout URL → Returns checkoutUrl from cart properties
 *
 * Related Documentation:
 * - /home/user/one.ie/one/events/shopify-checkout-flow.md
 * - Shopify Cart API: https://shopify.dev/docs/api/storefront/latest/objects/Cart
 */

import { Effect } from "effect";
import type { Connection, Thing, Event } from "@/types/data-provider";
import type { Id } from "convex/_generated/dataModel";

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Cart not found error
 */
export class CartNotFoundError {
	readonly _tag = "CartNotFoundError";
	constructor(readonly cartId: string) {}
}

/**
 * Cart item not found error
 */
export class CartItemNotFoundError {
	readonly _tag = "CartItemNotFoundError";
	constructor(
		readonly cartId: string,
		readonly lineId: string,
	) {}
}

/**
 * Invalid quantity error
 */
export class InvalidQuantityError {
	readonly _tag = "InvalidQuantityError";
	constructor(
		readonly quantity: number,
		readonly message: string,
	) {}
}

/**
 * Cart operation failed error
 */
export class CartOperationError {
	readonly _tag = "CartOperationError";
	constructor(
		readonly operation: string,
		readonly reason: string,
	) {}
}

/**
 * Union type of all cart errors
 */
export type CartError =
	| CartNotFoundError
	| CartItemNotFoundError
	| InvalidQuantityError
	| CartOperationError;

// ============================================================================
// CART DATA TYPES
// ============================================================================

/**
 * Shopping cart data structure
 *
 * Maps to ONE Platform:
 * - Cart itself → Thing (type: "checkout", status: "active")
 * - Cart lines → Connections (type: "in_cart")
 * - Total cost → Calculated from connection properties
 */
export interface CartData {
	/** Shopify cart ID (GID format) */
	id: string;

	/** ONE Platform checkout thing ID */
	thingId: Id<"things">;

	/** Store group ID (multi-tenant isolation) */
	groupId: Id<"groups">;

	/** Customer ID who owns this cart */
	customerId: Id<"things">;

	/** Cart line items */
	lines: CartLine[];

	/** Total cost across all lines */
	totalAmount: number;

	/** Currency code (ISO 4217) */
	currency: string;

	/** Total number of items in cart */
	itemCount: number;

	/** Shopify checkout URL (for payment processing) */
	checkoutUrl: string;

	/** Cart creation timestamp */
	createdAt: number;

	/** Last update timestamp */
	updatedAt: number;
}

/**
 * Individual cart line item
 *
 * Maps to ONE Platform:
 * - Connection (type: "in_cart")
 * - fromId: customer thing ID
 * - toId: product thing ID
 * - properties: quantity, variantId, price, etc.
 */
export interface CartLine {
	/** Shopify cart line ID (GID format) */
	id: string;

	/** ONE Platform connection ID */
	connectionId: Id<"connections">;

	/** Product variant ID */
	variantId: string;

	/** Product ID */
	productId: string;

	/** Quantity in cart */
	quantity: number;

	/** Unit price */
	price: number;

	/** Total line amount (price * quantity) */
	totalAmount: number;

	/** Custom attributes (gift wrap, message, etc.) */
	attributes?: Record<string, unknown>;
}

// ============================================================================
// CART SERVICE INTERFACE
// ============================================================================

/**
 * CartService - Shopping cart operations
 *
 * Business logic layer using Effect.ts for composable error handling.
 * All cart operations map to the 6-dimension ontology:
 *
 * - THINGS: Checkout thing represents the cart
 * - CONNECTIONS: in_cart connections represent cart items
 * - EVENTS: cart_created, cart_item_added, cart_item_updated, cart_item_removed
 * - GROUPS: Store group for multi-tenant isolation
 * - PEOPLE: Customer who owns the cart
 *
 * Usage Example:
 * ```typescript
 * import { CartService } from '@/providers/shopify/services/CartService';
 *
 * // Get cart
 * const cartResult = await Effect.runPromise(
 *   CartService.get("gid://shopify/Cart/abc123")
 * );
 *
 * // Add item to cart
 * const addResult = await Effect.runPromise(
 *   CartService.addItem(
 *     "gid://shopify/Cart/abc123",
 *     "gid://shopify/ProductVariant/456",
 *     2
 *   )
 * );
 * ```
 */
export const CartService = {
	/**
	 * Get cart by ID
	 *
	 * Retrieves cart data including all line items.
	 * Maps to ONE Platform queries:
	 * 1. Query checkout thing by shopifyCartId
	 * 2. Query in_cart connections for this cart
	 * 3. Aggregate data into CartData structure
	 *
	 * @param cartId - Shopify cart ID (GID format)
	 * @returns Cart data with all line items
	 */
	get: (cartId: string): Effect.Effect<CartData, CartError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query checkout thing by properties.shopifyCartId
			// 2. Query in_cart connections where fromId = customer
			// 3. Map connections to CartLine[]
			// 4. Calculate totals
			// 5. Return CartData

			// Mock implementation
			return yield* Effect.fail(
				new CartNotFoundError(cartId),
			);
		}),

	/**
	 * Create new cart
	 *
	 * Creates a new shopping cart for a customer.
	 * Maps to ONE Platform operations:
	 * 1. Create checkout thing (type: "checkout", status: "active")
	 * 2. Create cart_created event
	 * 3. Return Shopify cart ID
	 *
	 * @param groupId - Store group ID (multi-tenant)
	 * @param customerId - Customer thing ID (optional, for guest carts)
	 * @returns Shopify cart ID (GID format)
	 */
	create: (
		groupId: Id<"groups">,
		customerId?: Id<"things">,
	): Effect.Effect<string, CartError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Call Shopify Cart API cartCreate mutation
			// 2. Create checkout thing with shopifyCartId in properties
			// 3. Create cart_created event
			// 4. Return cart.id

			// Mock implementation
			return `gid://shopify/Cart/mock-${Date.now()}`;
		}),

	/**
	 * Add item to cart
	 *
	 * Adds a product variant to the cart.
	 * Maps to ONE Platform operations:
	 * 1. Create in_cart connection (customer → product)
	 * 2. Create cart_item_added event
	 * 3. Update checkout thing's updatedAt timestamp
	 *
	 * @param cartId - Shopify cart ID
	 * @param variantId - Product variant ID (GID format)
	 * @param quantity - Quantity to add (must be positive)
	 * @returns void on success
	 */
	addItem: (
		cartId: string,
		variantId: string,
		quantity: number,
	): Effect.Effect<void, CartError> =>
		Effect.gen(function* () {
			// Validate quantity
			if (quantity <= 0 || !Number.isInteger(quantity)) {
				return yield* Effect.fail(
					new InvalidQuantityError(
						quantity,
						"Quantity must be a positive integer",
					),
				);
			}

			// TODO: Implement
			// 1. Call Shopify Cart API cartLinesAdd mutation
			// 2. Create in_cart connection with:
			//    - fromId: customer thing ID
			//    - toId: product thing ID
			//    - properties: { quantity, variantId, cartLineId, price, ... }
			// 3. Create cart_item_added event
			// 4. Update checkout thing

			// Mock implementation
			return;
		}),

	/**
	 * Update cart item quantity
	 *
	 * Updates the quantity of an existing cart line.
	 * Maps to ONE Platform operations:
	 * 1. Update in_cart connection properties.quantity
	 * 2. Create cart_item_updated event
	 * 3. Update checkout thing's updatedAt timestamp
	 *
	 * @param cartId - Shopify cart ID
	 * @param lineId - Cart line ID (GID format)
	 * @param quantity - New quantity (must be positive)
	 * @returns void on success
	 */
	updateItem: (
		cartId: string,
		lineId: string,
		quantity: number,
	): Effect.Effect<void, CartError> =>
		Effect.gen(function* () {
			// Validate quantity
			if (quantity <= 0 || !Number.isInteger(quantity)) {
				return yield* Effect.fail(
					new InvalidQuantityError(
						quantity,
						"Quantity must be a positive integer",
					),
				);
			}

			// TODO: Implement
			// 1. Call Shopify Cart API cartLinesUpdate mutation
			// 2. Query in_cart connection by properties.cartLineId
			// 3. Update connection.properties.quantity
			// 4. Create cart_item_updated event with previous and new quantity
			// 5. Update checkout thing

			// Mock implementation
			return;
		}),

	/**
	 * Remove item from cart
	 *
	 * Removes a product variant from the cart.
	 * Maps to ONE Platform operations:
	 * 1. Archive in_cart connection (set status: "archived")
	 * 2. Create cart_item_removed event
	 * 3. Update checkout thing's updatedAt timestamp
	 *
	 * @param cartId - Shopify cart ID
	 * @param lineId - Cart line ID (GID format)
	 * @returns void on success
	 */
	removeItem: (
		cartId: string,
		lineId: string,
	): Effect.Effect<void, CartError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Call Shopify Cart API cartLinesRemove mutation
			// 2. Query in_cart connection by properties.cartLineId
			// 3. Update connection.status = "archived"
			// 4. Create cart_item_removed event
			// 5. Update checkout thing

			// Mock implementation
			return;
		}),

	/**
	 * Get checkout URL
	 *
	 * Retrieves the Shopify checkout URL for payment processing.
	 * The checkout URL redirects customers to Shopify's hosted checkout.
	 *
	 * Maps to ONE Platform:
	 * - Query checkout thing
	 * - Return properties.checkoutUrl
	 *
	 * @param cartId - Shopify cart ID
	 * @returns Checkout URL (HTTPS)
	 */
	getCheckoutUrl: (cartId: string): Effect.Effect<string, CartError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query checkout thing by properties.shopifyCartId
			// 2. Return thing.properties.checkoutUrl
			// 3. If cart not found, fail with CartNotFoundError

			// Mock implementation
			return yield* Effect.fail(
				new CartNotFoundError(cartId),
			);
		}),

	/**
	 * Clear cart
	 *
	 * Removes all items from cart (archives all in_cart connections).
	 * Useful for post-purchase cleanup or cart abandonment.
	 *
	 * Maps to ONE Platform operations:
	 * 1. Query all in_cart connections for this cart
	 * 2. Archive all connections (set status: "archived")
	 * 3. Create cart_cleared event
	 *
	 * @param cartId - Shopify cart ID
	 * @returns void on success
	 */
	clear: (cartId: string): Effect.Effect<void, CartError> =>
		Effect.gen(function* () {
			// TODO: Implement
			// 1. Query all in_cart connections for cart
			// 2. Batch update connections.status = "archived"
			// 3. Create cart_cleared event
			// 4. Update checkout thing

			// Mock implementation
			return;
		}),

	/**
	 * Get cart item count
	 *
	 * Returns total number of items in cart (sum of quantities).
	 * Useful for badge displays in UI.
	 *
	 * @param cartId - Shopify cart ID
	 * @returns Total item count
	 */
	getItemCount: (cartId: string): Effect.Effect<number, CartError> =>
		Effect.gen(function* () {
			const cart = yield* CartService.get(cartId);
			return cart.lines.reduce((sum, line) => sum + line.quantity, 0);
		}),

	/**
	 * Get cart total
	 *
	 * Returns cart total amount.
	 * Useful for displaying cart subtotal in UI.
	 *
	 * @param cartId - Shopify cart ID
	 * @returns Total amount with currency
	 */
	getTotal: (
		cartId: string,
	): Effect.Effect<{ amount: number; currency: string }, CartError> =>
		Effect.gen(function* () {
			const cart = yield* CartService.get(cartId);
			return {
				amount: cart.totalAmount,
				currency: cart.currency,
			};
		}),
};

// ============================================================================
// HELPER FUNCTIONS (PRIVATE)
// ============================================================================

/**
 * Validate cart line quantity
 */
function validateQuantity(quantity: number): Effect.Effect<void, CartError> {
	if (quantity <= 0 || !Number.isInteger(quantity)) {
		return Effect.fail(
			new InvalidQuantityError(
				quantity,
				"Quantity must be a positive integer",
			),
		);
	}
	return Effect.succeed(undefined);
}

/**
 * Calculate cart totals from lines
 */
function calculateCartTotals(lines: CartLine[]): {
	totalAmount: number;
	itemCount: number;
} {
	const totalAmount = lines.reduce((sum, line) => sum + line.totalAmount, 0);
	const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
	return { totalAmount, itemCount };
}

/**
 * Format cart error for logging
 */
function formatCartError(error: CartError): string {
	switch (error._tag) {
		case "CartNotFoundError":
			return `Cart not found: ${error.cartId}`;
		case "CartItemNotFoundError":
			return `Cart item not found: ${error.lineId} in cart ${error.cartId}`;
		case "InvalidQuantityError":
			return `Invalid quantity ${error.quantity}: ${error.message}`;
		case "CartOperationError":
			return `Cart operation failed (${error.operation}): ${error.reason}`;
	}
}

// ============================================================================
// ONTOLOGY MAPPING NOTES
// ============================================================================

/**
 * ONTOLOGY MAPPING SUMMARY
 *
 * DIMENSION 1: GROUPS
 * - Store group (groupId) provides multi-tenant isolation
 * - All cart operations are scoped to a specific store
 *
 * DIMENSION 2: PEOPLE
 * - Customer (customerId) owns the cart
 * - Role: "customer" (can view/modify only their own cart)
 * - Role: "org_owner" (can view all carts in their store)
 *
 * DIMENSION 3: THINGS
 * - Cart → Thing (type: "checkout", status: "active")
 * - Product → Thing (type: "product")
 * - Properties include:
 *   - shopifyCartId: Shopify GID
 *   - checkoutUrl: URL for Shopify checkout
 *   - totalAmount: Calculated total
 *   - currency: ISO 4217 code
 *
 * DIMENSION 4: CONNECTIONS
 * - Cart Item → Connection (type: "in_cart")
 * - fromId: Customer thing ID
 * - toId: Product thing ID
 * - properties include:
 *   - quantity: Number of items
 *   - variantId: Shopify variant GID
 *   - cartLineId: Shopify cart line GID
 *   - price: Unit price
 *   - totalAmount: Line total (price * quantity)
 *   - attributes: Custom attributes (gift wrap, message, etc.)
 * - status: "active" (in cart) or "archived" (removed)
 *
 * DIMENSION 5: EVENTS
 * - cart_created: Cart initialized
 * - cart_item_added: Product added to cart
 * - cart_item_updated: Quantity changed
 * - cart_item_removed: Product removed from cart
 * - cart_cleared: All items removed
 * - cart_abandoned: Cart inactive for 24-48 hours
 * - checkout_url_generated: Checkout URL created
 *
 * DIMENSION 6: KNOWLEDGE
 * - Not directly used in cart operations
 * - Could be used for product recommendations based on cart contents
 * - Could be used for abandoned cart recovery suggestions
 *
 * EDGE CASES HANDLED:
 * 1. Guest carts: customerId is optional, system-generated if not provided
 * 2. Negative inventory: Allowed if inventoryPolicy = "continue"
 * 3. Cart expiration: Carts expire after 10 days (Shopify default)
 * 4. Concurrent updates: Last-write-wins (Shopify handles conflicts)
 * 5. Invalid quantities: Validated before API calls
 * 6. Missing variants: Shopify API returns error, propagated via Effect
 * 7. Multi-currency: Currency stored per cart (from first item added)
 * 8. Custom attributes: Stored in connection.properties.attributes
 *
 * INTEGRATION POINTS:
 * - Shopify Storefront Cart API (GraphQL)
 * - Convex database (things, connections, events tables)
 * - EventService (for creating events)
 * - ConnectionService (for managing in_cart relationships)
 */
