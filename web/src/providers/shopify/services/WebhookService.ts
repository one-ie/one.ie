/**
 * Shopify Integration - WebhookService
 *
 * Effect.ts service for handling real-time Shopify webhooks.
 * Provides webhook registration, HMAC verification, queue-based processing,
 * and mapping to ONE Platform events.
 *
 * Cycle 35: WebhookService Design
 * Status: Complete
 * Created: 2025-11-22
 *
 * Features:
 * - Register/unregister webhooks for 8+ core topics
 * - HMAC-SHA256 signature verification
 * - Queue-based async processing (< 1s response)
 * - Idempotent processing (duplicate detection)
 * - Map webhooks → ONE events
 * - Error recovery and retries
 *
 * Webhook Flow:
 * 1. Shopify sends webhook → POST /api/webhooks/shopify
 * 2. Verify HMAC signature (security)
 * 3. Queue webhook for async processing
 * 4. Respond 200 OK immediately (< 1s)
 * 5. Background worker processes queue
 * 6. Transform webhook → ONE event
 * 7. Store in events table
 *
 * Required Reading:
 * - /home/user/one.ie/one/connections/shopify-webhooks.md
 * - /home/user/one.ie/one/knowledge/shopify-best-practices.md
 */

import { Effect, Context, Layer } from "effect";
import crypto from "crypto";
import {
	WebhookError,
	AuthenticationError,
	ValidationError,
	InternalError,
	type AnyShopifyError,
} from "../errors";

// ============================================================================
// Types
// ============================================================================

/**
 * Webhook topics supported by the integration
 * Based on 8+ core topics from shopify-webhooks.md
 */
export type WebhookTopic =
	| "products/create"
	| "products/update"
	| "products/delete"
	| "orders/create"
	| "orders/updated"
	| "orders/paid"
	| "orders/cancelled"
	| "orders/fulfilled"
	| "customers/create"
	| "customers/update"
	| "customers/delete"
	| "inventory_levels/update"
	| "collections/create"
	| "collections/update"
	| "collections/delete"
	| "app/uninstalled";

/**
 * Webhook registration result
 */
export interface WebhookRegistration {
	readonly id: string; // Shopify webhook subscription ID
	readonly topic: WebhookTopic;
	readonly callbackUrl: string;
	readonly createdAt: Date;
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
	readonly topic: WebhookTopic;
	readonly shopDomain: string;
	readonly webhookId: string;
	readonly eventId: string;
	readonly triggeredAt: string; // ISO 8601 timestamp
	readonly data: unknown; // Raw Shopify resource data
}

/**
 * Processed webhook record (for idempotency)
 */
export interface ProcessedWebhook {
	readonly webhookId: string;
	readonly topic: WebhookTopic;
	readonly shopDomain: string;
	readonly processedAt: Date;
	readonly eventId?: string; // ONE event ID created from webhook
}

/**
 * Webhook queue item
 */
export interface WebhookQueueItem {
	readonly payload: WebhookPayload;
	readonly receivedAt: Date;
	readonly retryCount: number;
}

/**
 * Webhook processing result
 */
export interface WebhookProcessingResult {
	readonly webhookId: string;
	readonly eventId: string; // ONE event ID
	readonly processedAt: Date;
}

// ============================================================================
// ShopifyClient Dependency (placeholder)
// ============================================================================

/**
 * ShopifyClient interface (will be implemented in Cycle 38)
 * Provides GraphQL API access for webhook management
 */
export interface ShopifyClient {
	readonly graphql: <T>(
		query: string,
		variables?: Record<string, unknown>
	) => Effect.Effect<T, AnyShopifyError>;
}

export class ShopifyClientService extends Context.Tag("ShopifyClient")<
	ShopifyClientService,
	ShopifyClient
>() {}

// ============================================================================
// EventService Dependency (placeholder)
// ============================================================================

/**
 * EventService interface (maps webhooks to ONE events)
 * Will use Convex mutations to create events in events table
 */
export interface EventService {
	readonly createFromWebhook: (
		payload: WebhookPayload
	) => Effect.Effect<string, AnyShopifyError>; // Returns event ID
}

export class EventServiceTag extends Context.Tag("EventService")<
	EventServiceTag,
	EventService
>() {}

// ============================================================================
// QueueService Dependency (placeholder)
// ============================================================================

/**
 * QueueService interface (async webhook processing)
 * Can be implemented with BullMQ, AWS SQS, or in-memory queue
 */
export interface QueueService {
	readonly enqueue: (
		item: WebhookQueueItem
	) => Effect.Effect<void, InternalError>;
	readonly dequeue: () => Effect.Effect<WebhookQueueItem | null, InternalError>;
	readonly peek: () => Effect.Effect<number, InternalError>; // Queue size
}

export class QueueServiceTag extends Context.Tag("QueueService")<
	QueueServiceTag,
	QueueService
>() {}

// ============================================================================
// ProcessedWebhookStore Dependency (placeholder)
// ============================================================================

/**
 * Store for tracking processed webhooks (idempotency)
 * Can be implemented with Redis, database, or in-memory cache
 */
export interface ProcessedWebhookStore {
	readonly has: (webhookId: string) => Effect.Effect<boolean, InternalError>;
	readonly add: (
		record: ProcessedWebhook
	) => Effect.Effect<void, InternalError>;
	readonly get: (
		webhookId: string
	) => Effect.Effect<ProcessedWebhook | null, InternalError>;
}

export class ProcessedWebhookStoreTag extends Context.Tag("ProcessedWebhookStore")<
	ProcessedWebhookStoreTag,
	ProcessedWebhookStore
>() {}

// ============================================================================
// WebhookService
// ============================================================================

/**
 * WebhookService - Core service for Shopify webhook management
 *
 * Responsibilities:
 * - Register/unregister webhooks via GraphQL API
 * - Verify HMAC signatures
 * - Queue webhooks for async processing
 * - Process webhooks idempotently
 * - Map webhooks to ONE events
 *
 * Dependencies:
 * - ShopifyClient: GraphQL API access
 * - EventService: Create ONE events
 * - QueueService: Async processing
 * - ProcessedWebhookStore: Idempotency tracking
 */
export class WebhookService extends Context.Tag("WebhookService")<
	WebhookService,
	{
		/**
		 * Register a webhook subscription with Shopify
		 *
		 * @param shop - Shop domain (e.g., "example.myshopify.com")
		 * @param topic - Webhook topic (e.g., "orders/create")
		 * @param callbackUrl - HTTPS URL for webhook delivery
		 * @returns Webhook subscription ID
		 *
		 * @example
		 * ```typescript
		 * const webhookId = yield* webhookService.register(
		 *   "example.myshopify.com",
		 *   "orders/create",
		 *   "https://one.ie/api/webhooks/shopify"
		 * );
		 * ```
		 */
		readonly register: (
			shop: string,
			topic: WebhookTopic,
			callbackUrl: string
		) => Effect.Effect<string, WebhookError>;

		/**
		 * Unregister a webhook subscription
		 *
		 * @param webhookId - Shopify webhook subscription ID
		 *
		 * @example
		 * ```typescript
		 * yield* webhookService.unregister("gid://shopify/WebhookSubscription/123");
		 * ```
		 */
		readonly unregister: (
			webhookId: string
		) => Effect.Effect<void, WebhookError>;

		/**
		 * Verify webhook HMAC signature
		 *
		 * CRITICAL: Always verify HMAC to prevent webhook spoofing attacks.
		 * Shopify signs each webhook with your app's secret using HMAC-SHA256.
		 *
		 * @param body - Raw request body (MUST be raw, not parsed JSON)
		 * @param hmac - X-Shopify-Hmac-Sha256 header (base64-encoded)
		 * @param secret - Shopify webhook secret
		 * @returns true if signature is valid
		 *
		 * @example
		 * ```typescript
		 * const isValid = yield* webhookService.verify(
		 *   rawBody,
		 *   req.headers['x-shopify-hmac-sha256'],
		 *   process.env.SHOPIFY_WEBHOOK_SECRET
		 * );
		 *
		 * if (!isValid) {
		 *   return yield* Effect.fail(new WebhookError({
		 *     message: "Invalid webhook signature",
		 *     hmacValid: false
		 *   }));
		 * }
		 * ```
		 */
		readonly verify: (
			body: string | Buffer,
			hmac: string,
			secret: string
		) => Effect.Effect<boolean, WebhookError>;

		/**
		 * Handle incoming webhook (queue for async processing)
		 *
		 * This method should be called from your webhook endpoint.
		 * It verifies the webhook, checks for duplicates, and queues for processing.
		 * MUST respond within 1 second to avoid Shopify retries.
		 *
		 * @param topic - Webhook topic from X-Shopify-Topic header
		 * @param payload - Parsed webhook payload
		 * @returns void (processing happens asynchronously)
		 *
		 * @example
		 * ```typescript
		 * // In your webhook endpoint
		 * app.post('/api/webhooks/shopify', async (req, res) => {
		 *   const payload = {
		 *     topic: req.headers['x-shopify-topic'],
		 *     shopDomain: req.headers['x-shopify-shop-domain'],
		 *     webhookId: req.headers['x-shopify-webhook-id'],
		 *     eventId: req.headers['x-shopify-event-id'],
		 *     triggeredAt: req.headers['x-shopify-triggered-at'],
		 *     data: JSON.parse(req.body)
		 *   };
		 *
		 *   await Effect.runPromise(webhookService.handle(payload.topic, payload));
		 *   res.status(200).send('OK');
		 * });
		 * ```
		 */
		readonly handle: (
			topic: WebhookTopic,
			payload: WebhookPayload
		) => Effect.Effect<void, WebhookError>;

		/**
		 * Process webhook queue (background worker)
		 *
		 * This method should be run in a background worker process.
		 * It dequeues webhooks, processes them, and creates ONE events.
		 * Implements idempotent processing to handle duplicate deliveries.
		 *
		 * @returns void (runs continuously)
		 *
		 * @example
		 * ```typescript
		 * // In your background worker
		 * const program = Effect.gen(function* () {
		 *   while (true) {
		 *     yield* webhookService.processQueue();
		 *     yield* Effect.sleep("1 second");
		 *   }
		 * });
		 *
		 * Effect.runPromise(program);
		 * ```
		 */
		readonly processQueue: () => Effect.Effect<void, WebhookError>;

		/**
		 * Register all core webhooks for a shop
		 *
		 * Convenience method to register all 8+ core webhook topics.
		 *
		 * @param shop - Shop domain
		 * @param callbackUrl - HTTPS URL for webhook delivery
		 * @returns Array of webhook subscription IDs
		 *
		 * @example
		 * ```typescript
		 * const webhookIds = yield* webhookService.registerAll(
		 *   "example.myshopify.com",
		 *   "https://one.ie/api/webhooks/shopify"
		 * );
		 * console.log(`Registered ${webhookIds.length} webhooks`);
		 * ```
		 */
		readonly registerAll: (
			shop: string,
			callbackUrl: string
		) => Effect.Effect<string[], WebhookError>;
	}
>() {}

// ============================================================================
// WebhookService Implementation
// ============================================================================

/**
 * Core webhook topics to register
 * Based on shopify-webhooks.md recommendations
 */
const CORE_WEBHOOK_TOPICS: WebhookTopic[] = [
	"products/create",
	"products/update",
	"products/delete",
	"orders/create",
	"orders/paid",
	"orders/fulfilled",
	"customers/create",
	"customers/update",
	"inventory_levels/update",
	"app/uninstalled",
];

/**
 * GraphQL mutation to create webhook subscription
 */
const CREATE_WEBHOOK_MUTATION = `
  mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $callbackUrl: String!) {
    webhookSubscriptionCreate(
      topic: $topic
      webhookSubscription: {
        format: JSON
        callbackUrl: $callbackUrl
      }
    ) {
      webhookSubscription {
        id
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * GraphQL mutation to delete webhook subscription
 */
const DELETE_WEBHOOK_MUTATION = `
  mutation DeleteWebhook($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      deletedWebhookSubscriptionId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Map webhook topic to GraphQL enum format
 * orders/create → ORDERS_CREATE
 */
function topicToGraphQL(topic: WebhookTopic): string {
	return topic.toUpperCase().replace("/", "_");
}

/**
 * WebhookService implementation layer
 */
export const WebhookServiceLive = Layer.effect(
	WebhookService,
	Effect.gen(function* () {
		const shopifyClient = yield* ShopifyClientService;
		const eventService = yield* EventServiceTag;
		const queueService = yield* QueueServiceTag;
		const webhookStore = yield* ProcessedWebhookStoreTag;

		// ========================================================================
		// register: Register webhook with Shopify
		// ========================================================================
		const register = (
			shop: string,
			topic: WebhookTopic,
			callbackUrl: string
		): Effect.Effect<string, WebhookError> =>
			Effect.gen(function* () {
				// Validate inputs
				if (!shop) {
					return yield* Effect.fail(
						new WebhookError({
							message: "Shop domain is required",
						})
					);
				}

				if (!callbackUrl.startsWith("https://")) {
					return yield* Effect.fail(
						new WebhookError({
							message: "Callback URL must use HTTPS",
						})
					);
				}

				// Call GraphQL API to create webhook
				const result = yield* shopifyClient
					.graphql<{
						webhookSubscriptionCreate: {
							webhookSubscription: { id: string } | null;
							userErrors: Array<{ field: string; message: string }>;
						};
					}>(CREATE_WEBHOOK_MUTATION, {
						topic: topicToGraphQL(topic),
						callbackUrl,
					})
					.pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new WebhookError({
									message: `Failed to register webhook: ${error._tag}`,
									topic,
									shopDomain: shop,
								})
							)
						)
					);

				// Check for user errors
				if (result.webhookSubscriptionCreate.userErrors.length > 0) {
					const errors = result.webhookSubscriptionCreate.userErrors
						.map((e) => e.message)
						.join(", ");
					return yield* Effect.fail(
						new WebhookError({
							message: `Webhook registration failed: ${errors}`,
							topic,
							shopDomain: shop,
						})
					);
				}

				// Check if webhook was created
				if (!result.webhookSubscriptionCreate.webhookSubscription) {
					return yield* Effect.fail(
						new WebhookError({
							message: "Webhook registration failed: no subscription returned",
							topic,
							shopDomain: shop,
						})
					);
				}

				return result.webhookSubscriptionCreate.webhookSubscription.id;
			});

		// ========================================================================
		// unregister: Delete webhook subscription
		// ========================================================================
		const unregister = (
			webhookId: string
		): Effect.Effect<void, WebhookError> =>
			Effect.gen(function* () {
				const result = yield* shopifyClient
					.graphql<{
						webhookSubscriptionDelete: {
							deletedWebhookSubscriptionId: string | null;
							userErrors: Array<{ field: string; message: string }>;
						};
					}>(DELETE_WEBHOOK_MUTATION, { id: webhookId })
					.pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new WebhookError({
									message: `Failed to unregister webhook: ${error._tag}`,
									webhookId,
								})
							)
						)
					);

				if (result.webhookSubscriptionDelete.userErrors.length > 0) {
					const errors = result.webhookSubscriptionDelete.userErrors
						.map((e) => e.message)
						.join(", ");
					return yield* Effect.fail(
						new WebhookError({
							message: `Webhook unregistration failed: ${errors}`,
							webhookId,
						})
					);
				}
			});

		// ========================================================================
		// verify: Verify HMAC signature
		// ========================================================================
		const verify = (
			body: string | Buffer,
			hmac: string,
			secret: string
		): Effect.Effect<boolean, WebhookError> =>
			Effect.gen(function* () {
				try {
					// Calculate HMAC-SHA256
					const hash = crypto
						.createHmac("sha256", secret)
						.update(body, "utf8")
						.digest("base64");

					// Constant-time comparison (prevents timing attacks)
					return crypto.timingSafeEqual(
						Buffer.from(hash),
						Buffer.from(hmac)
					);
				} catch (error) {
					return yield* Effect.fail(
						new WebhookError({
							message: "HMAC verification failed",
							hmacValid: false,
						})
					);
				}
			});

		// ========================================================================
		// handle: Queue webhook for async processing
		// ========================================================================
		const handle = (
			topic: WebhookTopic,
			payload: WebhookPayload
		): Effect.Effect<void, WebhookError> =>
			Effect.gen(function* () {
				// Check if already processed (idempotency)
				const alreadyProcessed = yield* webhookStore
					.has(payload.webhookId)
					.pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new WebhookError({
									message: "Failed to check webhook processing status",
									webhookId: payload.webhookId,
									topic,
								})
							)
						)
					);

				if (alreadyProcessed) {
					// Already processed, skip
					return;
				}

				// Queue for processing
				yield* queueService
					.enqueue({
						payload,
						receivedAt: new Date(),
						retryCount: 0,
					})
					.pipe(
						Effect.catchAll((error) =>
							Effect.fail(
								new WebhookError({
									message: "Failed to queue webhook for processing",
									webhookId: payload.webhookId,
									topic,
								})
							)
						)
					);
			});

		// ========================================================================
		// processQueue: Background worker to process queued webhooks
		// ========================================================================
		const processQueue = (): Effect.Effect<void, WebhookError> =>
			Effect.gen(function* () {
				// Dequeue next webhook
				const item = yield* queueService.dequeue().pipe(
					Effect.catchAll((error) =>
						Effect.fail(
							new WebhookError({
								message: "Failed to dequeue webhook",
							})
						)
					)
				);

				// No items in queue
				if (!item) {
					return;
				}

				const { payload, retryCount } = item;

				// Check if already processed (double-check for race conditions)
				const alreadyProcessed = yield* webhookStore.has(payload.webhookId);
				if (alreadyProcessed) {
					return;
				}

				// Process webhook (create ONE event)
				const eventId = yield* eventService
					.createFromWebhook(payload)
					.pipe(
						Effect.catchAll((error) => {
							// If processing fails and retry count < 3, re-queue
							if (retryCount < 3) {
								return queueService
									.enqueue({
										...item,
										retryCount: retryCount + 1,
									})
									.pipe(Effect.as("retry" as const));
							}

							// Max retries exceeded, fail
							return Effect.fail(
								new WebhookError({
									message: `Webhook processing failed after ${retryCount} retries`,
									webhookId: payload.webhookId,
									topic: payload.topic,
									shopDomain: payload.shopDomain,
								})
							);
						})
					);

				// If retry, return early
				if (eventId === "retry") {
					return;
				}

				// Mark as processed
				yield* webhookStore.add({
					webhookId: payload.webhookId,
					topic: payload.topic,
					shopDomain: payload.shopDomain,
					processedAt: new Date(),
					eventId,
				});
			});

		// ========================================================================
		// registerAll: Register all core webhooks
		// ========================================================================
		const registerAll = (
			shop: string,
			callbackUrl: string
		): Effect.Effect<string[], WebhookError> =>
			Effect.gen(function* () {
				const webhookIds: string[] = [];

				for (const topic of CORE_WEBHOOK_TOPICS) {
					const id = yield* register(shop, topic, callbackUrl);
					webhookIds.push(id);
				}

				return webhookIds;
			});

		return {
			register,
			unregister,
			verify,
			handle,
			processQueue,
			registerAll,
		} as const;
	})
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a test WebhookService for development/testing
 * Uses in-memory queue and store
 */
export const WebhookServiceTest = Layer.effect(
	WebhookService,
	Effect.gen(function* () {
		// In-memory implementations
		const processedWebhooks = new Set<string>();
		const queue: WebhookQueueItem[] = [];

		return {
			register: (shop, topic, callbackUrl) =>
				Effect.succeed(`test-webhook-${topic}`),

			unregister: (webhookId) => Effect.void,

			verify: (body, hmac, secret) => Effect.succeed(true),

			handle: (topic, payload) =>
				Effect.gen(function* () {
					if (processedWebhooks.has(payload.webhookId)) {
						return;
					}
					queue.push({
						payload,
						receivedAt: new Date(),
						retryCount: 0,
					});
				}),

			processQueue: () =>
				Effect.gen(function* () {
					const item = queue.shift();
					if (!item) return;

					processedWebhooks.add(item.payload.webhookId);
				}),

			registerAll: (shop, callbackUrl) =>
				Effect.succeed(
					CORE_WEBHOOK_TOPICS.map((t) => `test-webhook-${t}`)
				),
		} as const;
	})
);
