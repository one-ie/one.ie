/**
 * Shopify Integration - Services Index
 *
 * Exports all Shopify integration services.
 *
 * Cycles 26-27: Foundation Services (ShopifyClient, ShopifyAuth)
 * Cycles 35-37: Service Layer Design (Webhooks, Sync)
 * Status: In Progress
 * Created: 2025-11-22
 */

// Export ShopifyClient (Cycle 26)
export {
	ShopifyClient,
	type GraphQLCost,
	type GraphQLResponse,
	type BulkOperationResult,
	type QueryOptions,
	type RateLimitState,
	NetworkError as ShopifyClientNetworkError,
	GraphQLError as ShopifyClientGraphQLError,
	RateLimitError as ShopifyClientRateLimitError,
	AuthenticationError as ShopifyClientAuthenticationError,
	InvalidShopError,
	BulkOperationError,
	rateLimitTracker,
	validateShopDomain,
	estimateQueryCostHeuristic,
	sleep,
	retryWithBackoff,
} from "./ShopifyClient";

// Export ShopifyAuth (Cycle 27)
export {
	ShopifyAuth,
	type OAuthAuthorizationParams,
	type OAuthCallbackParams,
	type AccessTokenResponse,
	type ShopCredentials,
	type ShopGroupMapping,
	AuthorizationError,
	TokenNotFoundError,
	TokenStorageError,
	InvalidShopDomainError,
	HmacVerificationError,
	StateMismatchError,
	TokenExchangeError,
	ShopNotFoundError,
	buildOAuthUrl,
	calculateHmac,
	verifyHmacSignature,
	generateState,
	encryptTokenValue,
	decryptTokenValue,
} from "./ShopifyAuth";

// Export WebhookService (Cycle 35)
export {
	WebhookService,
	WebhookServiceLive,
	WebhookServiceTest,
	ShopifyClientService,
	EventServiceTag,
	QueueServiceTag,
	ProcessedWebhookStoreTag,
	type WebhookTopic,
	type WebhookRegistration,
	type WebhookPayload,
	type ProcessedWebhook,
	type WebhookQueueItem,
	type WebhookProcessingResult,
	type ShopifyClient,
	type EventService,
	type QueueService,
	type ProcessedWebhookStore,
} from "./WebhookService";

// Export SyncService (Cycle 37)
export {
	SyncService,
	SyncServiceLive,
	SyncServiceTest,
	ProductServiceTag,
	OrderServiceTag,
	CustomerServiceTag,
	CollectionServiceTag,
	type SyncType,
	type SyncResult,
	type SyncProgress,
	type SyncOptions,
	type ProductService,
	type OrderService,
	type CustomerService,
	type CollectionService,
	estimateTimeRemaining,
	formatSyncDuration,
	calculateSuccessRate,
} from "./SyncService";

// Export Error Types (Cycle 36)
export {
	ShopifyError,
	NetworkError,
	RateLimitError,
	AuthenticationError,
	ValidationError,
	GraphQLError,
	WebhookError,
	SyncError,
	ResourceNotFoundError,
	ResourceConflictError,
	InternalError,
	type AnyShopifyError,
	fromFetchError,
	fromHttpStatus,
	fromGraphQLResponse,
	isRetriable,
	getRetryDelay,
} from "../errors";
