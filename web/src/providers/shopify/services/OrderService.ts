/**
 * OrderService - Handles Shopify Order Operations
 *
 * Maps Shopify orders to ONE Platform's ontology:
 * - Orders → Connections (type: "purchased") + Events
 * - Each line item becomes a separate "purchased" connection
 * - Order lifecycle tracked via events: order_placed, payment_processed, order_fulfilled, etc.
 *
 * @see /one/connections/shopify-order-flow.md - Complete order mapping
 * @see /web/src/providers/shopify/transformers/to-one.ts - Transformation functions
 *
 * Dependencies:
 * - ShopifyClient: GraphQL/REST API communication
 * - TransformationService: Shopify → ONE data transformation
 * - EventService: Event logging and audit trail
 *
 * Cycle: 30 of 100 (Shopify Integration)
 * Created: 2025-11-22
 */

import { Effect } from "effect";
import type { Id } from "@/convex/_generated/dataModel";
import type {
	ShopifyOrder,
	ShopifyLineItem,
	ShopifyFulfillment,
	ShopifyRefund,
} from "../transformers/to-one";
import type { ONEConnectionInput, ONEEventInput } from "../transformers/to-one";

// ============================================================================
// ERROR TYPES: Explicit, typed errors for order operations
// ============================================================================

/**
 * Order not found in Shopify
 */
export class OrderNotFoundError {
	readonly _tag = "OrderNotFoundError";
	constructor(readonly orderId: string) {}
}

/**
 * Failed to transform Shopify order to ONE entities
 */
export class OrderTransformError {
	readonly _tag = "OrderTransformError";
	constructor(readonly orderId: string, readonly reason: string) {}
}

/**
 * Order fulfillment operation failed
 */
export class FulfillmentError {
	readonly _tag = "FulfillmentError";
	constructor(readonly orderId: string, readonly reason: string) {}
}

/**
 * Order refund operation failed
 */
export class RefundError {
	readonly _tag = "RefundError";
	constructor(readonly orderId: string, readonly reason: string) {}
}

/**
 * Order cancellation failed
 */
export class CancellationError {
	readonly _tag = "CancellationError";
	constructor(readonly orderId: string, readonly reason: string) {}
}

/**
 * Invalid order data (validation error)
 */
export class OrderValidationError {
	readonly _tag = "OrderValidationError";
	constructor(readonly message: string, readonly field?: string) {}
}

/**
 * Guest customer error (no customer account)
 */
export class GuestCustomerError {
	readonly _tag = "GuestCustomerError";
	constructor(readonly email: string | null, readonly phone: string | null) {}
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Complete order data (Thing + Connections + Events)
 */
export interface OrderData {
	/** Order metadata (NOT a Thing - orders are relationships!) */
	orderMetadata: {
		shopifyOrderId: string;
		orderNumber: string;
		orderName: string;
		customerId: string | null;
		customerEmail: string | null;
		totalPrice: number;
		currency: string;
		financialStatus: string;
		fulfillmentStatus: string;
		createdAt: string;
		processedAt: string;
	};

	/** Connections: customer → product variant (one per line item) */
	connections: ONEConnectionInput[];

	/** Events: order_placed, payment_processed, order_fulfilled, etc. */
	events: ONEEventInput[];
}

/**
 * Draft order input (for creating orders programmatically)
 */
export interface DraftOrderInput {
	customerId?: string | null;
	email?: string;
	lineItems: Array<{
		variantId: string;
		quantity: number;
	}>;
	shippingAddress?: {
		address1: string;
		city: string;
		province: string;
		country: string;
		zip: string;
	};
	note?: string;
}

/**
 * Refund input
 */
export interface RefundInput {
	lineItems: Array<{
		lineItemId: string;
		quantity: number;
	}>;
	amount?: number;
	reason?: string;
	note?: string;
	notify?: boolean;
}

/**
 * Order filters for querying
 */
export interface OrderFilters {
	financialStatus?: "authorized" | "pending" | "paid" | "partially_paid" | "refunded" | "partially_refunded" | "voided";
	fulfillmentStatus?: "fulfilled" | "in_progress" | "on_hold" | "open" | "partially_fulfilled" | "unfulfilled";
	createdAtMin?: string; // ISO 8601
	createdAtMax?: string; // ISO 8601
	updatedAtMin?: string;
	updatedAtMax?: string;
	status?: "open" | "closed" | "cancelled" | "any";
}

// ============================================================================
// ORDER SERVICE INTERFACE
// ============================================================================

/**
 * OrderService manages Shopify order operations and maps them to ONE Platform ontology
 *
 * Key Design Decision: Orders are NOT Things in ONE Platform.
 * Instead, orders are represented as:
 * 1. CONNECTIONS: customer "purchased" product variant (one per line item)
 * 2. EVENTS: order_placed, payment_processed, order_fulfilled, order_refunded
 *
 * This design aligns with ONE's philosophy: "things exist, connections relate, events happen"
 */
export interface IOrderService {
	/**
	 * Get single order by ID
	 *
	 * Returns complete order data:
	 * - Order metadata (shopifyOrderId, totals, status)
	 * - Connections (customer purchased variants)
	 * - Events (order lifecycle events)
	 *
	 * @param id - Shopify order ID (numeric or GID)
	 * @returns OrderData with connections and events
	 * @throws OrderNotFoundError if order doesn't exist
	 * @throws OrderTransformError if transformation fails
	 *
	 * @example
	 * const orderData = yield* orderService.get("gid://shopify/Order/123");
	 * console.log(orderData.orderMetadata.orderNumber); // "#1001"
	 * console.log(orderData.connections.length); // 3 (3 line items)
	 * console.log(orderData.events.length); // 2 (order_placed, payment_processed)
	 */
	get: (id: string) => Effect.Effect<OrderData, OrderNotFoundError | OrderTransformError>;

	/**
	 * List all orders for a group (store)
	 *
	 * Fetches orders from Shopify and transforms to ONE entities.
	 * Supports filtering by status, dates, fulfillment status.
	 *
	 * @param groupId - Store group ID
	 * @param filters - Optional filters (status, dates, fulfillment)
	 * @returns Array of OrderData
	 *
	 * @example
	 * const orders = yield* orderService.list(storeGroupId, {
	 *   financialStatus: "paid",
	 *   fulfillmentStatus: "unfulfilled",
	 *   createdAtMin: "2025-01-01T00:00:00Z"
	 * });
	 */
	list: (
		groupId: string,
		filters?: OrderFilters
	) => Effect.Effect<OrderData[], OrderTransformError>;

	/**
	 * Create draft order (programmatic order creation)
	 *
	 * Creates a draft order in Shopify that can be:
	 * - Sent to customer for payment
	 * - Completed directly (mark as paid)
	 * - Modified before completion
	 *
	 * @param input - Draft order details (customer, line items, addresses)
	 * @param groupId - Store group ID
	 * @returns Shopify draft order ID
	 * @throws OrderValidationError if input is invalid
	 *
	 * @example
	 * const draftOrderId = yield* orderService.createDraft({
	 *   email: "customer@example.com",
	 *   lineItems: [
	 *     { variantId: "gid://shopify/ProductVariant/123", quantity: 2 }
	 *   ],
	 *   shippingAddress: { ... }
	 * }, storeGroupId);
	 */
	createDraft: (
		input: DraftOrderInput,
		groupId: string
	) => Effect.Effect<string, OrderValidationError>;

	/**
	 * Update order (limited fields - Shopify restricts order updates)
	 *
	 * Can update:
	 * - Note/tags
	 * - Email/phone
	 * - Metafields
	 *
	 * Cannot update:
	 * - Line items (use fulfillments/refunds instead)
	 * - Pricing
	 * - Customer (after order placed)
	 *
	 * @param id - Order ID
	 * @param updates - Fields to update
	 * @returns void on success
	 *
	 * @example
	 * yield* orderService.update("gid://shopify/Order/123", {
	 *   note: "Expedite shipping",
	 *   tags: ["priority", "vip"]
	 * });
	 */
	update: (
		id: string,
		updates: {
			note?: string;
			tags?: string[];
			email?: string;
			phone?: string;
		}
	) => Effect.Effect<void, OrderNotFoundError>;

	/**
	 * Cancel order (before fulfillment)
	 *
	 * Cancels an unfulfilled or partially fulfilled order.
	 * Options:
	 * - Restock items (return to inventory)
	 * - Refund payment (if already paid)
	 * - Send notification to customer
	 *
	 * Creates events:
	 * - order_cancelled
	 * - payment_refunded (if refund issued)
	 *
	 * @param id - Order ID
	 * @param reason - Cancellation reason (customer, fraud, inventory, declined, other)
	 * @returns void on success
	 * @throws CancellationError if order cannot be cancelled (already fulfilled)
	 *
	 * @example
	 * yield* orderService.cancel("gid://shopify/Order/123", "inventory");
	 */
	cancel: (
		id: string,
		reason?: "customer" | "fraud" | "inventory" | "declined" | "other"
	) => Effect.Effect<void, CancellationError | OrderNotFoundError>;

	/**
	 * Fulfill order (mark as shipped)
	 *
	 * Creates fulfillment for specified line items.
	 * Supports:
	 * - Partial fulfillment (ship some items now, rest later)
	 * - Tracking information (carrier, tracking number, URL)
	 * - Notification to customer
	 *
	 * Creates events:
	 * - order_fulfilled
	 * - Updates connections with fulfillment status
	 *
	 * @param id - Order ID
	 * @param lineItems - Line item IDs to fulfill (if empty, fulfills all)
	 * @param tracking - Optional tracking info
	 * @returns Fulfillment ID
	 * @throws FulfillmentError if fulfillment fails
	 *
	 * @example
	 * const fulfillmentId = yield* orderService.fulfill(
	 *   "gid://shopify/Order/123",
	 *   ["gid://shopify/LineItem/456", "gid://shopify/LineItem/789"],
	 *   {
	 *     trackingCompany: "USPS",
	 *     trackingNumber: "1Z999AA10123456784",
	 *     notifyCustomer: true
	 *   }
	 * );
	 */
	fulfill: (
		id: string,
		lineItems: string[],
		tracking?: {
			trackingCompany?: string;
			trackingNumber?: string;
			trackingUrl?: string;
			notifyCustomer?: boolean;
		}
	) => Effect.Effect<string, FulfillmentError | OrderNotFoundError>;

	/**
	 * Refund order (full or partial)
	 *
	 * Creates refund for specified line items and amount.
	 * Supports:
	 * - Full refund (all items, full amount)
	 * - Partial refund (some items, partial amount)
	 * - Restocking (return items to inventory)
	 * - Notification to customer
	 *
	 * Creates events:
	 * - order_refunded
	 * - payment_refunded
	 * - Updates connections with refund status
	 *
	 * @param id - Order ID
	 * @param refundInput - Refund details (line items, amount, reason)
	 * @returns Refund ID
	 * @throws RefundError if refund fails (already refunded, invalid amount)
	 *
	 * @example
	 * const refundId = yield* orderService.refund(
	 *   "gid://shopify/Order/123",
	 *   {
	 *     lineItems: [
	 *       { lineItemId: "gid://shopify/LineItem/456", quantity: 1 }
	 *     ],
	 *     amount: 29.99,
	 *     reason: "Customer returned item",
	 *     notify: true
	 *   }
	 * );
	 */
	refund: (
		id: string,
		refundInput: RefundInput
	) => Effect.Effect<string, RefundError | OrderNotFoundError>;
}

// ============================================================================
// ORDER SERVICE IMPLEMENTATION
// ============================================================================

/**
 * OrderService implementation using Effect.ts patterns
 *
 * This service orchestrates Shopify order operations and maps them to ONE Platform.
 *
 * Design Principles:
 * 1. Orders are RELATIONSHIPS (connections) + EVENTS, not Things
 * 2. Each line item = separate "purchased" connection
 * 3. Order lifecycle tracked via events
 * 4. Handle edge cases: guest customers, partial fulfillments, refunds
 * 5. Atomic operations with Effect error handling
 *
 * Dependencies:
 * - ShopifyClient: API communication
 * - TransformationService: Data transformation
 * - EventService: Event logging
 */
export class OrderService extends Effect.Service<OrderService>()("OrderService", {
	effect: Effect.gen(function* () {
		// Dependencies will be injected by Effect runtime
		// For now, we define the interface - implementation in Cycles 32-35
		const shopifyClient = yield* Effect.succeed({} as any); // Placeholder
		const transformationService = yield* Effect.succeed({} as any); // Placeholder
		const eventService = yield* Effect.succeed({} as any); // Placeholder

		return {
			// ====================================================================
			// GET: Fetch single order and transform to ONE entities
			// ====================================================================
			get: (id: string) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Fetching order", { orderId: id });

					// 1. Fetch order from Shopify
					const shopifyOrder = yield* Effect.tryPromise({
						try: async () => {
							// TODO: Implement GraphQL query in Cycle 32
							// const query = GET_ORDER_BY_ID;
							// const response = await shopifyClient.query(query, { id });
							// return response.order;
							throw new Error("Not implemented - Cycle 32");
						},
						catch: (error) => new OrderNotFoundError(id),
					});

					if (!shopifyOrder) {
						return yield* Effect.fail(new OrderNotFoundError(id));
					}

					// 2. Find or create customer Thing
					const customerId = yield* Effect.gen(function* () {
						if (!shopifyOrder.customer) {
							// Guest checkout - create temporary customer or return null
							if (shopifyOrder.email) {
								yield* Effect.logInfo("Guest customer detected", {
									email: shopifyOrder.email,
								});
								// TODO: Create guest customer Thing in Cycle 33
								return null;
							}
							return null;
						}

						// TODO: Find customer by Shopify ID in Cycle 33
						return shopifyOrder.customer.id;
					});

					// 3. Transform order to connections
					const connections = yield* transformationService
						.transformOrderToConnections(shopifyOrder, customerId, "groupId")
						.pipe(
							Effect.catchAll((error) =>
								Effect.fail(
									new OrderTransformError(
										id,
										`Failed to transform connections: ${error}`
									)
								)
							)
						);

					// 4. Transform order to events
					const events = yield* Effect.all([
						// Order placed event
						transformationService.transformOrderToPlacedEvent(
							shopifyOrder,
							customerId,
							"groupId"
						),
						// Payment events
						transformationService.transformTransactionsToEvents(
							shopifyOrder,
							customerId,
							"groupId"
						),
						// Fulfillment events
						transformationService.transformFulfillmentsToEvents(shopifyOrder, "groupId"),
						// Refund events
						transformationService.transformRefundsToEvents(shopifyOrder, "groupId"),
					]).pipe(
						Effect.map(([placedEvent, paymentEvents, fulfillmentEvents, refundEvents]) => [
							placedEvent,
							...paymentEvents,
							...fulfillmentEvents,
							...refundEvents,
						]),
						Effect.catchAll((error) =>
							Effect.fail(
								new OrderTransformError(id, `Failed to transform events: ${error}`)
							)
						)
					);

					// 5. Build order data
					const orderData: OrderData = {
						orderMetadata: {
							shopifyOrderId: id,
							orderNumber: shopifyOrder.name,
							orderName: shopifyOrder.name.replace("#", ""),
							customerId,
							customerEmail: shopifyOrder.email || null,
							totalPrice: parseFloat(shopifyOrder.totalPriceSet.shopMoney.amount),
							currency: shopifyOrder.currencyCode || "USD",
							financialStatus: shopifyOrder.displayFinancialStatus?.toLowerCase() || "unknown",
							fulfillmentStatus: shopifyOrder.displayFulfillmentStatus?.toLowerCase() || "unfulfilled",
							createdAt: shopifyOrder.createdAt,
							processedAt: shopifyOrder.processedAt || shopifyOrder.createdAt,
						},
						connections,
						events,
					};

					yield* Effect.logInfo("Order fetched successfully", {
						orderId: id,
						connectionCount: connections.length,
						eventCount: events.length,
					});

					return orderData;
				}).pipe(Effect.withSpan("OrderService.get", { attributes: { orderId: id } })),

			// ====================================================================
			// LIST: Fetch all orders with filters
			// ====================================================================
			list: (groupId: string, filters?: OrderFilters) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Listing orders", { groupId, filters });

					// 1. Fetch orders from Shopify with pagination
					const shopifyOrders = yield* Effect.tryPromise({
						try: async () => {
							// TODO: Implement GraphQL query with filters in Cycle 32
							// const query = LIST_ORDERS;
							// const response = await shopifyClient.query(query, { filters });
							// return response.orders.edges.map(e => e.node);
							throw new Error("Not implemented - Cycle 32");
						},
						catch: (error) =>
							new OrderTransformError("list", `Failed to fetch orders: ${error}`),
					});

					// 2. Transform each order to OrderData
					const ordersData = yield* Effect.all(
						shopifyOrders.map((order: ShopifyOrder) =>
							Effect.gen(function* () {
								// Simplified transformation for list view
								const customerId = order.customer?.id || null;

								const connections = yield* transformationService.transformOrderToConnections(
									order,
									customerId,
									groupId
								);

								const events = yield* Effect.all([
									transformationService.transformOrderToPlacedEvent(
										order,
										customerId,
										groupId
									),
								]);

								return {
									orderMetadata: {
										shopifyOrderId: order.id,
										orderNumber: order.name,
										orderName: order.name.replace("#", ""),
										customerId,
										customerEmail: order.email || null,
										totalPrice: parseFloat(order.totalPriceSet.shopMoney.amount),
										currency: order.currencyCode || "USD",
										financialStatus: order.displayFinancialStatus?.toLowerCase() || "unknown",
										fulfillmentStatus: order.displayFulfillmentStatus?.toLowerCase() || "unfulfilled",
										createdAt: order.createdAt,
										processedAt: order.processedAt || order.createdAt,
									},
									connections,
									events,
								} as OrderData;
							})
						),
						{ concurrency: 5 } // Process 5 orders in parallel
					);

					yield* Effect.logInfo("Orders listed successfully", {
						count: ordersData.length,
					});

					return ordersData;
				}).pipe(
					Effect.withSpan("OrderService.list", { attributes: { groupId } })
				),

			// ====================================================================
			// CREATE DRAFT: Create draft order for manual completion
			// ====================================================================
			createDraft: (input: DraftOrderInput, groupId: string) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Creating draft order", { groupId });

					// 1. Validate input
					if (!input.lineItems || input.lineItems.length === 0) {
						return yield* Effect.fail(
							new OrderValidationError("Line items are required", "lineItems")
						);
					}

					// 2. Create draft order in Shopify
					const draftOrderId = yield* Effect.tryPromise({
						try: async () => {
							// TODO: Implement GraphQL mutation in Cycle 32
							// const mutation = CREATE_DRAFT_ORDER;
							// const response = await shopifyClient.mutate(mutation, { input });
							// return response.draftOrderCreate.draftOrder.id;
							throw new Error("Not implemented - Cycle 32");
						},
						catch: (error) =>
							new OrderValidationError(`Failed to create draft order: ${error}`),
					});

					yield* Effect.logInfo("Draft order created", { draftOrderId });

					return draftOrderId;
				}).pipe(
					Effect.withSpan("OrderService.createDraft", { attributes: { groupId } })
				),

			// ====================================================================
			// UPDATE: Update order metadata (limited fields)
			// ====================================================================
			update: (id: string, updates: { note?: string; tags?: string[]; email?: string; phone?: string }) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Updating order", { orderId: id, updates });

					// Update order in Shopify
					yield* Effect.tryPromise({
						try: async () => {
							// TODO: Implement GraphQL mutation in Cycle 32
							// const mutation = UPDATE_ORDER;
							// await shopifyClient.mutate(mutation, { id, input: updates });
							throw new Error("Not implemented - Cycle 32");
						},
						catch: (error) => new OrderNotFoundError(id),
					});

					// Create event
					yield* eventService.create({
						type: "order_updated",
						metadata: { orderId: id, updates },
					});

					yield* Effect.logInfo("Order updated successfully", { orderId: id });
				}).pipe(Effect.withSpan("OrderService.update", { attributes: { orderId: id } })),

			// ====================================================================
			// CANCEL: Cancel order and optionally refund
			// ====================================================================
			cancel: (id: string, reason?: string) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Cancelling order", { orderId: id, reason });

					// Cancel order in Shopify
					yield* Effect.tryPromise({
						try: async () => {
							// TODO: Implement GraphQL mutation in Cycle 32
							// const mutation = CANCEL_ORDER;
							// await shopifyClient.mutate(mutation, { id, reason });
							throw new Error("Not implemented - Cycle 32");
						},
						catch: (error) => new CancellationError(id, `Failed to cancel: ${error}`),
					});

					// Create event
					yield* eventService.create({
						type: "order_cancelled",
						metadata: { orderId: id, reason },
					});

					yield* Effect.logInfo("Order cancelled successfully", { orderId: id });
				}).pipe(Effect.withSpan("OrderService.cancel", { attributes: { orderId: id } })),

			// ====================================================================
			// FULFILL: Create fulfillment for order
			// ====================================================================
			fulfill: (id: string, lineItems: string[], tracking?: any) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Fulfilling order", { orderId: id, lineItems });

					// Create fulfillment in Shopify
					const fulfillmentId = yield* Effect.tryPromise({
						try: async () => {
							// TODO: Implement GraphQL mutation in Cycle 32
							// const mutation = CREATE_FULFILLMENT;
							// const response = await shopifyClient.mutate(mutation, {
							//   orderId: id,
							//   lineItems,
							//   tracking
							// });
							// return response.fulfillmentCreate.fulfillment.id;
							throw new Error("Not implemented - Cycle 32");
						},
						catch: (error) => new FulfillmentError(id, `Failed to fulfill: ${error}`),
					});

					// Create event
					yield* eventService.create({
						type: "order_fulfilled",
						metadata: { orderId: id, fulfillmentId, tracking },
					});

					yield* Effect.logInfo("Order fulfilled successfully", {
						orderId: id,
						fulfillmentId,
					});

					return fulfillmentId;
				}).pipe(Effect.withSpan("OrderService.fulfill", { attributes: { orderId: id } })),

			// ====================================================================
			// REFUND: Create refund for order
			// ====================================================================
			refund: (id: string, refundInput: RefundInput) =>
				Effect.gen(function* () {
					yield* Effect.logInfo("Refunding order", { orderId: id, refundInput });

					// Create refund in Shopify
					const refundId = yield* Effect.tryPromise({
						try: async () => {
							// TODO: Implement GraphQL mutation in Cycle 32
							// const mutation = CREATE_REFUND;
							// const response = await shopifyClient.mutate(mutation, {
							//   orderId: id,
							//   refund: refundInput
							// });
							// return response.refundCreate.refund.id;
							throw new Error("Not implemented - Cycle 32");
						},
						catch: (error) => new RefundError(id, `Failed to refund: ${error}`),
					});

					// Create event
					yield* eventService.create({
						type: "order_refunded",
						metadata: { orderId: id, refundId, refundInput },
					});

					yield* Effect.logInfo("Order refunded successfully", { orderId: id, refundId });

					return refundId;
				}).pipe(Effect.withSpan("OrderService.refund", { attributes: { orderId: id } })),
		};
	}),
	// Dependencies will be injected in Cycles 32-35
	dependencies: [],
}) {}

// ============================================================================
// EXPORTS
// ============================================================================

export type { IOrderService, OrderData, DraftOrderInput, RefundInput, OrderFilters };
