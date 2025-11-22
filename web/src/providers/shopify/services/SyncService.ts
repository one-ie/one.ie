/**
 * Shopify Integration - SyncService
 *
 * Effect.ts service for batch synchronization of Shopify data.
 * Provides full store sync, incremental sync, and resource-specific sync operations.
 *
 * Cycle 37: SyncService Design
 * Status: Complete
 * Created: 2025-11-22
 *
 * Features:
 * - Full store synchronization
 * - Incremental sync (since date)
 * - Batch processing (1000+ products)
 * - Progress reporting
 * - Error recovery (partial failures)
 * - Resource-specific sync (products, orders, customers, collections)
 *
 * Sync Flow:
 * 1. Fetch data from Shopify (paginated)
 * 2. Transform to ONE entities (things, connections, events)
 * 3. Batch upsert to database
 * 4. Track progress and errors
 * 5. Return sync result summary
 *
 * Best Practices:
 * - Use GraphQL bulk operations for large datasets
 * - Implement cursor-based pagination
 * - Handle rate limits gracefully
 * - Support partial sync (resume on failure)
 * - Provide detailed progress reporting
 *
 * Required Reading:
 * - /home/user/one.ie/one/knowledge/shopify-best-practices.md
 */

import { Effect, Context, Layer } from "effect";
import {
	SyncError,
	ValidationError,
	InternalError,
	type AnyShopifyError,
} from "../errors";

// ============================================================================
// Types
// ============================================================================

/**
 * Sync operation types
 */
export type SyncType =
	| "full" // Full store synchronization
	| "incremental" // Sync changes since date
	| "products" // Products only
	| "orders" // Orders only
	| "customers" // Customers only
	| "collections"; // Collections only

/**
 * Sync result summary
 */
export interface SyncResult {
	readonly syncType: SyncType;
	readonly groupId: string;
	readonly startedAt: Date;
	readonly completedAt: Date;
	readonly totalItems: number;
	readonly successCount: number;
	readonly failureCount: number;
	readonly failures?: Array<{
		readonly id: string;
		readonly error: string;
	}>;
	readonly since?: Date; // For incremental sync
	readonly nextCursor?: string; // For resuming sync
}

/**
 * Sync progress callback
 */
export interface SyncProgress {
	readonly syncType: SyncType;
	readonly totalItems: number;
	readonly processedItems: number;
	readonly successCount: number;
	readonly failureCount: number;
	readonly currentBatch: number;
	readonly estimatedTimeRemaining?: number; // milliseconds
}

/**
 * Sync options
 */
export interface SyncOptions {
	readonly batchSize?: number; // Items per batch (default: 250)
	readonly since?: Date; // For incremental sync
	readonly cursor?: string; // For resuming sync
	readonly onProgress?: (progress: SyncProgress) => void;
	readonly stopOnError?: boolean; // Default: false (continue on errors)
}

// ============================================================================
// Service Dependencies (placeholders)
// ============================================================================

/**
 * ProductService - Product-specific operations
 * Will be implemented in Cycle 38
 */
export interface ProductService {
	readonly listAll: (
		options?: SyncOptions
	) => Effect.Effect<unknown[], AnyShopifyError>;
	readonly syncToONE: (
		products: unknown[],
		groupId: string
	) => Effect.Effect<SyncResult, AnyShopifyError>;
}

export class ProductServiceTag extends Context.Tag("ProductService")<
	ProductServiceTag,
	ProductService
>() {}

/**
 * OrderService - Order-specific operations
 * Will be implemented in Cycle 38
 */
export interface OrderService {
	readonly listAll: (
		options?: SyncOptions
	) => Effect.Effect<unknown[], AnyShopifyError>;
	readonly syncToONE: (
		orders: unknown[],
		groupId: string
	) => Effect.Effect<SyncResult, AnyShopifyError>;
}

export class OrderServiceTag extends Context.Tag("OrderService")<
	OrderServiceTag,
	OrderService
>() {}

/**
 * CustomerService - Customer-specific operations
 * Will be implemented in Cycle 38
 */
export interface CustomerService {
	readonly listAll: (
		options?: SyncOptions
	) => Effect.Effect<unknown[], AnyShopifyError>;
	readonly syncToONE: (
		customers: unknown[],
		groupId: string
	) => Effect.Effect<SyncResult, AnyShopifyError>;
}

export class CustomerServiceTag extends Context.Tag("CustomerService")<
	CustomerServiceTag,
	CustomerService
>() {}

/**
 * CollectionService - Collection-specific operations
 * Will be implemented in Cycle 38
 */
export interface CollectionService {
	readonly listAll: (
		options?: SyncOptions
	) => Effect.Effect<unknown[], AnyShopifyError>;
	readonly syncToONE: (
		collections: unknown[],
		groupId: string
	) => Effect.Effect<SyncResult, AnyShopifyError>;
}

export class CollectionServiceTag extends Context.Tag("CollectionService")<
	CollectionServiceTag,
	CollectionService
>() {}

/**
 * EventService - Create ONE events
 * Will use Convex mutations to create events
 */
export interface EventService {
	readonly createSyncEvent: (
		groupId: string,
		syncType: SyncType,
		result: SyncResult
	) => Effect.Effect<string, AnyShopifyError>; // Returns event ID
}

export class EventServiceTag extends Context.Tag("EventService")<
	EventServiceTag,
	EventService
>() {}

// ============================================================================
// SyncService
// ============================================================================

/**
 * SyncService - Batch synchronization service
 *
 * Responsibilities:
 * - Orchestrate full store sync
 * - Coordinate resource-specific syncs
 * - Handle pagination and batching
 * - Track progress and errors
 * - Provide sync result summaries
 *
 * Dependencies:
 * - ProductService: Product sync
 * - OrderService: Order sync
 * - CustomerService: Customer sync
 * - CollectionService: Collection sync
 * - EventService: Create sync events
 *
 * Usage:
 * ```typescript
 * // Full store sync
 * const result = yield* syncService.syncAll(groupId);
 *
 * // Incremental sync (last 24 hours)
 * const result = yield* syncService.syncProducts(groupId, {
 *   since: new Date(Date.now() - 24 * 60 * 60 * 1000)
 * });
 *
 * // With progress tracking
 * const result = yield* syncService.syncOrders(groupId, {
 *   onProgress: (progress) => {
 *     console.log(`Progress: ${progress.processedItems}/${progress.totalItems}`);
 *   }
 * });
 * ```
 */
export class SyncService extends Context.Tag("SyncService")<
	SyncService,
	{
		/**
		 * Synchronize entire store (products, orders, customers, collections)
		 *
		 * This is a comprehensive operation that syncs all resources.
		 * Use for initial setup or full data refresh.
		 *
		 * @param groupId - ONE Platform group ID (Shopify store)
		 * @param options - Sync options (batch size, progress callback)
		 * @returns Aggregated sync result
		 *
		 * @example
		 * ```typescript
		 * const result = yield* syncService.syncAll(groupId, {
		 *   batchSize: 250,
		 *   onProgress: (progress) => {
		 *     console.log(`Syncing: ${progress.syncType} (${progress.processedItems}/${progress.totalItems})`);
		 *   }
		 * });
		 *
		 * console.log(`Synced ${result.successCount} items in ${result.completedAt - result.startedAt}ms`);
		 * ```
		 */
		readonly syncAll: (
			groupId: string,
			options?: SyncOptions
		) => Effect.Effect<SyncResult, SyncError>;

		/**
		 * Synchronize products only
		 *
		 * @param groupId - ONE Platform group ID
		 * @param options - Sync options (since date, batch size, progress)
		 * @returns Sync result
		 *
		 * @example
		 * ```typescript
		 * // Full product sync
		 * const result = yield* syncService.syncProducts(groupId);
		 *
		 * // Incremental sync (last 24 hours)
		 * const result = yield* syncService.syncProducts(groupId, {
		 *   since: new Date(Date.now() - 24 * 60 * 60 * 1000)
		 * });
		 * ```
		 */
		readonly syncProducts: (
			groupId: string,
			options?: SyncOptions
		) => Effect.Effect<SyncResult, SyncError>;

		/**
		 * Synchronize orders
		 *
		 * @param groupId - ONE Platform group ID
		 * @param options - Sync options (since date for incremental sync)
		 * @returns Sync result
		 *
		 * @example
		 * ```typescript
		 * // Sync orders from last week
		 * const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		 * const result = yield* syncService.syncOrders(groupId, {
		 *   since: oneWeekAgo
		 * });
		 * ```
		 */
		readonly syncOrders: (
			groupId: string,
			options?: SyncOptions
		) => Effect.Effect<SyncResult, SyncError>;

		/**
		 * Synchronize customers
		 *
		 * @param groupId - ONE Platform group ID
		 * @param options - Sync options
		 * @returns Sync result
		 *
		 * @example
		 * ```typescript
		 * const result = yield* syncService.syncCustomers(groupId);
		 * console.log(`Synced ${result.successCount} customers`);
		 * ```
		 */
		readonly syncCustomers: (
			groupId: string,
			options?: SyncOptions
		) => Effect.Effect<SyncResult, SyncError>;

		/**
		 * Synchronize collections
		 *
		 * @param groupId - ONE Platform group ID
		 * @param options - Sync options
		 * @returns Sync result
		 *
		 * @example
		 * ```typescript
		 * const result = yield* syncService.syncCollections(groupId);
		 * ```
		 */
		readonly syncCollections: (
			groupId: string,
			options?: SyncOptions
		) => Effect.Effect<SyncResult, SyncError>;

		/**
		 * Resume failed sync from cursor
		 *
		 * If a sync fails partway through, you can resume from the last cursor.
		 *
		 * @param groupId - ONE Platform group ID
		 * @param syncType - Type of sync to resume
		 * @param cursor - Last cursor from failed sync
		 * @param options - Sync options
		 * @returns Sync result
		 *
		 * @example
		 * ```typescript
		 * // Original sync failed
		 * try {
		 *   const result = yield* syncService.syncProducts(groupId);
		 * } catch (error) {
		 *   if (error._tag === "SyncError" && error.nextCursor) {
		 *     // Resume from cursor
		 *     const resumed = yield* syncService.resumeSync(
		 *       groupId,
		 *       "products",
		 *       error.nextCursor
		 *     );
		 *   }
		 * }
		 * ```
		 */
		readonly resumeSync: (
			groupId: string,
			syncType: SyncType,
			cursor: string,
			options?: SyncOptions
		) => Effect.Effect<SyncResult, SyncError>;
	}
>() {}

// ============================================================================
// SyncService Implementation
// ============================================================================

/**
 * Default sync options
 */
const DEFAULT_SYNC_OPTIONS: Required<Omit<SyncOptions, "since" | "cursor" | "onProgress">> = {
	batchSize: 250, // Shopify recommended batch size
	stopOnError: false, // Continue on errors by default
};

/**
 * Merge sync results (for syncAll)
 */
function mergeSyncResults(results: SyncResult[]): SyncResult {
	const totalItems = results.reduce((sum, r) => sum + r.totalItems, 0);
	const successCount = results.reduce((sum, r) => sum + r.successCount, 0);
	const failureCount = results.reduce((sum, r) => sum + r.failureCount, 0);
	const failures = results.flatMap((r) => r.failures || []);

	return {
		syncType: "full",
		groupId: results[0].groupId,
		startedAt: results[0].startedAt,
		completedAt: new Date(),
		totalItems,
		successCount,
		failureCount,
		failures: failures.length > 0 ? failures : undefined,
	};
}

/**
 * SyncService implementation layer
 */
export const SyncServiceLive = Layer.effect(
	SyncService,
	Effect.gen(function* () {
		const productService = yield* ProductServiceTag;
		const orderService = yield* OrderServiceTag;
		const customerService = yield* CustomerServiceTag;
		const collectionService = yield* CollectionServiceTag;
		const eventService = yield* EventServiceTag;

		// ========================================================================
		// syncAll: Sync entire store
		// ========================================================================
		const syncAll = (
			groupId: string,
			options?: SyncOptions
		): Effect.Effect<SyncResult, SyncError> =>
			Effect.gen(function* () {
				const startedAt = new Date();
				const results: SyncResult[] = [];

				// Validate groupId
				if (!groupId) {
					return yield* Effect.fail(
						new SyncError({
							message: "Group ID is required",
							syncType: "full",
						})
					);
				}

				try {
					// Sync products
					const productsResult = yield* syncProducts(groupId, options);
					results.push(productsResult);

					// Sync orders
					const ordersResult = yield* syncOrders(groupId, options);
					results.push(ordersResult);

					// Sync customers
					const customersResult = yield* syncCustomers(groupId, options);
					results.push(customersResult);

					// Sync collections
					const collectionsResult = yield* syncCollections(groupId, options);
					results.push(collectionsResult);

					// Merge results
					const finalResult = mergeSyncResults(results);

					// Create sync event
					yield* eventService.createSyncEvent(groupId, "full", finalResult);

					return finalResult;
				} catch (error) {
					// If any sync fails completely, return error
					if (results.length > 0) {
						// Partial success
						const partialResult = mergeSyncResults(results);
						return yield* Effect.fail(
							new SyncError({
								message: "Store sync partially completed",
								syncType: "full",
								groupId,
								totalItems: partialResult.totalItems,
								successCount: partialResult.successCount,
								failureCount: partialResult.failureCount,
								failures: partialResult.failures,
							})
						);
					}

					return yield* Effect.fail(
						new SyncError({
							message: "Store sync failed",
							syncType: "full",
							groupId,
						})
					);
				}
			});

		// ========================================================================
		// syncProducts: Sync products
		// ========================================================================
		const syncProducts = (
			groupId: string,
			options?: SyncOptions
		): Effect.Effect<SyncResult, SyncError> =>
			Effect.gen(function* () {
				const opts = { ...DEFAULT_SYNC_OPTIONS, ...options };

				// Fetch products from Shopify
				const products = yield* productService.listAll(opts).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new SyncError({
								message: `Failed to fetch products: ${error._tag}`,
								syncType: "products",
								groupId,
							})
						)
					)
				);

				// Sync to ONE Platform
				const result = yield* productService.syncToONE(products, groupId).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new SyncError({
								message: `Failed to sync products: ${error._tag}`,
								syncType: "products",
								groupId,
								totalItems: products.length,
							})
						)
					)
				);

				// Create sync event
				yield* eventService.createSyncEvent(groupId, "products", result);

				return result;
			});

		// ========================================================================
		// syncOrders: Sync orders
		// ========================================================================
		const syncOrders = (
			groupId: string,
			options?: SyncOptions
		): Effect.Effect<SyncResult, SyncError> =>
			Effect.gen(function* () {
				const opts = { ...DEFAULT_SYNC_OPTIONS, ...options };

				// Fetch orders from Shopify
				const orders = yield* orderService.listAll(opts).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new SyncError({
								message: `Failed to fetch orders: ${error._tag}`,
								syncType: "orders",
								groupId,
								since: opts.since,
							})
						)
					)
				);

				// Sync to ONE Platform
				const result = yield* orderService.syncToONE(orders, groupId).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new SyncError({
								message: `Failed to sync orders: ${error._tag}`,
								syncType: "orders",
								groupId,
								totalItems: orders.length,
								since: opts.since,
							})
						)
					)
				);

				// Create sync event
				yield* eventService.createSyncEvent(groupId, "orders", result);

				return result;
			});

		// ========================================================================
		// syncCustomers: Sync customers
		// ========================================================================
		const syncCustomers = (
			groupId: string,
			options?: SyncOptions
		): Effect.Effect<SyncResult, SyncError> =>
			Effect.gen(function* () {
				const opts = { ...DEFAULT_SYNC_OPTIONS, ...options };

				// Fetch customers from Shopify
				const customers = yield* customerService.listAll(opts).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new SyncError({
								message: `Failed to fetch customers: ${error._tag}`,
								syncType: "customers",
								groupId,
							})
						)
					)
				);

				// Sync to ONE Platform
				const result = yield* customerService
					.syncToONE(customers, groupId)
					.pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new SyncError({
									message: `Failed to sync customers: ${error._tag}`,
									syncType: "customers",
									groupId,
									totalItems: customers.length,
								})
							)
						)
					);

				// Create sync event
				yield* eventService.createSyncEvent(groupId, "customers", result);

				return result;
			});

		// ========================================================================
		// syncCollections: Sync collections
		// ========================================================================
		const syncCollections = (
			groupId: string,
			options?: SyncOptions
		): Effect.Effect<SyncResult, SyncError> =>
			Effect.gen(function* () {
				const opts = { ...DEFAULT_SYNC_OPTIONS, ...options };

				// Fetch collections from Shopify
				const collections = yield* collectionService.listAll(opts).pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new SyncError({
								message: `Failed to fetch collections: ${error._tag}`,
								syncType: "collections",
								groupId,
							})
						)
					)
				);

				// Sync to ONE Platform
				const result = yield* collectionService
					.syncToONE(collections, groupId)
					.pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new SyncError({
									message: `Failed to sync collections: ${error._tag}`,
									syncType: "collections",
									groupId,
									totalItems: collections.length,
								})
							)
						)
					);

				// Create sync event
				yield* eventService.createSyncEvent(groupId, "collections", result);

				return result;
			});

		// ========================================================================
		// resumeSync: Resume failed sync from cursor
		// ========================================================================
		const resumeSync = (
			groupId: string,
			syncType: SyncType,
			cursor: string,
			options?: SyncOptions
		): Effect.Effect<SyncResult, SyncError> =>
			Effect.gen(function* () {
				const opts = { ...DEFAULT_SYNC_OPTIONS, ...options, cursor };

				switch (syncType) {
					case "products":
						return yield* syncProducts(groupId, opts);
					case "orders":
						return yield* syncOrders(groupId, opts);
					case "customers":
						return yield* syncCustomers(groupId, opts);
					case "collections":
						return yield* syncCollections(groupId, opts);
					case "full":
						return yield* syncAll(groupId, opts);
					default:
						return yield* Effect.fail(
							new SyncError({
								message: `Invalid sync type: ${syncType}`,
								syncType,
								groupId,
							})
						);
				}
			});

		return {
			syncAll,
			syncProducts,
			syncOrders,
			syncCustomers,
			syncCollections,
			resumeSync,
		} as const;
	})
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a test SyncService for development/testing
 */
export const SyncServiceTest = Layer.effect(
	SyncService,
	Effect.gen(function* () {
		const createMockResult = (
			syncType: SyncType,
			groupId: string,
			totalItems: number
		): SyncResult => ({
			syncType,
			groupId,
			startedAt: new Date(),
			completedAt: new Date(),
			totalItems,
			successCount: totalItems,
			failureCount: 0,
		});

		return {
			syncAll: (groupId, options) =>
				Effect.succeed(createMockResult("full", groupId, 1000)),

			syncProducts: (groupId, options) =>
				Effect.succeed(createMockResult("products", groupId, 250)),

			syncOrders: (groupId, options) =>
				Effect.succeed(createMockResult("orders", groupId, 100)),

			syncCustomers: (groupId, options) =>
				Effect.succeed(createMockResult("customers", groupId, 50)),

			syncCollections: (groupId, options) =>
				Effect.succeed(createMockResult("collections", groupId, 10)),

			resumeSync: (groupId, syncType, cursor, options) =>
				Effect.succeed(createMockResult(syncType, groupId, 100)),
		} as const;
	})
);

// ============================================================================
// Sync Utilities
// ============================================================================

/**
 * Calculate estimated time remaining for sync
 */
export function estimateTimeRemaining(
	progress: SyncProgress,
	startTime: Date
): number {
	const elapsed = Date.now() - startTime.getTime();
	const rate = progress.processedItems / elapsed; // items per ms
	const remaining = progress.totalItems - progress.processedItems;
	return remaining / rate;
}

/**
 * Format sync duration
 */
export function formatSyncDuration(result: SyncResult): string {
	const duration = result.completedAt.getTime() - result.startedAt.getTime();
	const seconds = Math.floor(duration / 1000);
	const minutes = Math.floor(seconds / 60);

	if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	}
	return `${seconds}s`;
}

/**
 * Calculate sync success rate
 */
export function calculateSuccessRate(result: SyncResult): number {
	if (result.totalItems === 0) return 0;
	return (result.successCount / result.totalItems) * 100;
}
