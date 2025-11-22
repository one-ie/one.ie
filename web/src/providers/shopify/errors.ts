/**
 * Shopify Integration - Error Types
 *
 * Comprehensive error type system for Shopify integration using Effect.ts Data.TaggedError.
 * Provides typed, composable errors with detailed context for debugging and error handling.
 *
 * Cycle 36: Error Types Design
 * Status: Complete
 * Created: 2025-11-22
 *
 * Error Hierarchy:
 * - ShopifyError (base class)
 *   - NetworkError (connection, timeout, DNS)
 *   - RateLimitError (429 responses, throttling)
 *   - AuthenticationError (401, 403, invalid tokens)
 *   - ValidationError (400, invalid input)
 *   - GraphQLError (GraphQL-specific errors)
 *   - WebhookError (webhook verification, processing)
 *   - SyncError (batch sync failures)
 *   - ResourceNotFoundError (404)
 *   - ResourceConflictError (409)
 *   - InternalError (500+, unknown errors)
 */

import { Data } from "effect";

// ============================================================================
// Base Error Class
// ============================================================================

/**
 * Base error class for all Shopify integration errors
 *
 * All Shopify errors extend this class and include:
 * - message: Human-readable error description
 * - shopifyDetails: Optional Shopify-specific error data
 */
export class ShopifyError extends Data.TaggedError("ShopifyError")<{
	readonly message: string;
	readonly shopifyDetails?: unknown;
}> {
	/**
	 * Creates a user-friendly error message
	 */
	toUserMessage(): string {
		return this.message;
	}

	/**
	 * Creates a detailed error message for logging
	 */
	toDebugMessage(): string {
		if (this.shopifyDetails) {
			return `${this.message}\nDetails: ${JSON.stringify(this.shopifyDetails, null, 2)}`;
		}
		return this.message;
	}
}

// ============================================================================
// Network Errors
// ============================================================================

/**
 * Network-related errors (connection failures, timeouts, DNS errors)
 *
 * Examples:
 * - Connection timeout
 * - DNS resolution failure
 * - Network unreachable
 * - SSL/TLS errors
 */
export class NetworkError extends Data.TaggedError("NetworkError")<{
	readonly message: string;
	readonly statusCode?: number;
	readonly cause?: unknown;
}> {
	toUserMessage(): string {
		return "Unable to connect to Shopify. Please check your internet connection and try again.";
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.statusCode) {
			parts.push(`Status Code: ${this.statusCode}`);
		}
		if (this.cause) {
			parts.push(`Cause: ${JSON.stringify(this.cause)}`);
		}
		return parts.join("\n");
	}
}

// ============================================================================
// Rate Limit Errors
// ============================================================================

/**
 * Rate limit errors (429 Too Many Requests)
 *
 * Shopify has two rate limiting systems:
 * - REST API: 40 requests/minute per store
 * - GraphQL API: 50 points/second (bucket-based)
 *
 * This error includes retry information.
 */
export class RateLimitError extends Data.TaggedError("RateLimitError")<{
	readonly message: string;
	readonly retryAfter?: number; // Seconds until retry
	readonly currentUsage?: number; // Current API usage
	readonly maxAllowed?: number; // Maximum allowed
	readonly apiType?: "rest" | "graphql"; // Which API hit the limit
}> {
	toUserMessage(): string {
		if (this.retryAfter) {
			return `Too many requests. Please wait ${this.retryAfter} seconds and try again.`;
		}
		return "Too many requests. Please try again in a few moments.";
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.apiType) {
			parts.push(`API Type: ${this.apiType}`);
		}
		if (this.currentUsage !== undefined && this.maxAllowed !== undefined) {
			parts.push(`Usage: ${this.currentUsage}/${this.maxAllowed}`);
		}
		if (this.retryAfter) {
			parts.push(`Retry After: ${this.retryAfter}s`);
		}
		return parts.join("\n");
	}

	/**
	 * Calculate exponential backoff delay
	 */
	getBackoffDelay(attempt: number): number {
		const baseDelay = this.retryAfter || 1;
		return Math.min(baseDelay * Math.pow(2, attempt) * 1000, 60000); // Max 60s
	}
}

// ============================================================================
// Authentication Errors
// ============================================================================

/**
 * Authentication and authorization errors (401, 403)
 *
 * Examples:
 * - Invalid access token
 * - Expired token
 * - Missing scopes
 * - Insufficient permissions
 */
export class AuthenticationError extends Data.TaggedError("AuthenticationError")<{
	readonly message: string;
	readonly statusCode?: number;
	readonly requiredScopes?: string[];
	readonly currentScopes?: string[];
}> {
	toUserMessage(): string {
		if (this.requiredScopes?.length) {
			return `This operation requires additional permissions: ${this.requiredScopes.join(", ")}`;
		}
		return "Authentication failed. Please check your Shopify credentials.";
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.statusCode) {
			parts.push(`Status Code: ${this.statusCode}`);
		}
		if (this.currentScopes) {
			parts.push(`Current Scopes: ${this.currentScopes.join(", ")}`);
		}
		if (this.requiredScopes) {
			parts.push(`Required Scopes: ${this.requiredScopes.join(", ")}`);
		}
		return parts.join("\n");
	}
}

// ============================================================================
// Validation Errors
// ============================================================================

/**
 * Input validation errors (400 Bad Request)
 *
 * Examples:
 * - Invalid product data
 * - Missing required fields
 * - Invalid field format
 * - Schema validation failures
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
	readonly message: string;
	readonly field?: string;
	readonly invalidValue?: unknown;
	readonly validationErrors?: Array<{ field: string; message: string }>;
}> {
	toUserMessage(): string {
		if (this.field) {
			return `Invalid ${this.field}: ${this.message}`;
		}
		if (this.validationErrors?.length) {
			const errors = this.validationErrors
				.map((e) => `${e.field}: ${e.message}`)
				.join(", ");
			return `Validation failed: ${errors}`;
		}
		return `Validation failed: ${this.message}`;
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.field) {
			parts.push(`Field: ${this.field}`);
		}
		if (this.invalidValue !== undefined) {
			parts.push(`Invalid Value: ${JSON.stringify(this.invalidValue)}`);
		}
		if (this.validationErrors?.length) {
			parts.push(
				`Validation Errors:\n${this.validationErrors.map((e) => `  - ${e.field}: ${e.message}`).join("\n")}`
			);
		}
		return parts.join("\n");
	}
}

// ============================================================================
// GraphQL Errors
// ============================================================================

/**
 * GraphQL-specific errors
 *
 * Shopify GraphQL API returns errors in a specific format.
 * This error type handles GraphQL error responses.
 */
export class GraphQLError extends Data.TaggedError("GraphQLError")<{
	readonly message: string;
	readonly errors?: Array<{
		message: string;
		path?: string[];
		extensions?: Record<string, unknown>;
	}>;
	readonly query?: string;
	readonly variables?: Record<string, unknown>;
}> {
	toUserMessage(): string {
		if (this.errors?.length) {
			return this.errors[0].message;
		}
		return this.message;
	}

	toDebugMessage(): string {
		const parts = [this.message];

		if (this.errors?.length) {
			parts.push("GraphQL Errors:");
			this.errors.forEach((error, index) => {
				parts.push(`  ${index + 1}. ${error.message}`);
				if (error.path) {
					parts.push(`     Path: ${error.path.join(".")}`);
				}
				if (error.extensions) {
					parts.push(`     Extensions: ${JSON.stringify(error.extensions)}`);
				}
			});
		}

		if (this.query) {
			parts.push(`Query: ${this.query}`);
		}

		if (this.variables) {
			parts.push(`Variables: ${JSON.stringify(this.variables, null, 2)}`);
		}

		return parts.join("\n");
	}

	/**
	 * Check if error is due to throttling
	 */
	isThrottled(): boolean {
		return this.errors?.some(
			(e) => e.extensions?.code === "THROTTLED"
		) ?? false;
	}

	/**
	 * Get query cost from error extensions
	 */
	getQueryCost(): number | undefined {
		const costExtension = this.errors?.find(
			(e) => e.extensions?.cost !== undefined
		);
		return costExtension?.extensions?.cost as number | undefined;
	}
}

// ============================================================================
// Webhook Errors
// ============================================================================

/**
 * Webhook-specific errors
 *
 * Examples:
 * - HMAC verification failure
 * - Invalid webhook payload
 * - Missing webhook headers
 * - Webhook processing failure
 */
export class WebhookError extends Data.TaggedError("WebhookError")<{
	readonly message: string;
	readonly topic?: string;
	readonly webhookId?: string;
	readonly shopDomain?: string;
	readonly hmacValid?: boolean;
	readonly payload?: unknown;
}> {
	toUserMessage(): string {
		if (!this.hmacValid) {
			return "Webhook verification failed. This webhook may not be authentic.";
		}
		return `Webhook processing failed: ${this.message}`;
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.topic) {
			parts.push(`Topic: ${this.topic}`);
		}
		if (this.webhookId) {
			parts.push(`Webhook ID: ${this.webhookId}`);
		}
		if (this.shopDomain) {
			parts.push(`Shop: ${this.shopDomain}`);
		}
		if (this.hmacValid !== undefined) {
			parts.push(`HMAC Valid: ${this.hmacValid}`);
		}
		if (this.payload) {
			parts.push(`Payload: ${JSON.stringify(this.payload, null, 2)}`);
		}
		return parts.join("\n");
	}

	/**
	 * Check if this is an HMAC verification error
	 */
	isHMACError(): boolean {
		return this.hmacValid === false;
	}
}

// ============================================================================
// Sync Errors
// ============================================================================

/**
 * Batch synchronization errors
 *
 * Examples:
 * - Partial sync failure (some items succeeded, some failed)
 * - Bulk operation timeout
 * - Sync conflict (concurrent modifications)
 * - Sync state corruption
 */
export class SyncError extends Data.TaggedError("SyncError")<{
	readonly message: string;
	readonly syncType?: "full" | "incremental" | "products" | "orders" | "customers" | "collections";
	readonly groupId?: string;
	readonly totalItems?: number;
	readonly successCount?: number;
	readonly failureCount?: number;
	readonly failures?: Array<{ id: string; error: string }>;
	readonly since?: Date;
}> {
	toUserMessage(): string {
		if (this.isPartialFailure()) {
			return `Sync partially completed: ${this.successCount}/${this.totalItems} items synced successfully.`;
		}
		return `Sync failed: ${this.message}`;
	}

	toDebugMessage(): string {
		const parts = [this.message];

		if (this.syncType) {
			parts.push(`Sync Type: ${this.syncType}`);
		}

		if (this.groupId) {
			parts.push(`Group ID: ${this.groupId}`);
		}

		if (this.totalItems !== undefined) {
			parts.push(`Total Items: ${this.totalItems}`);
		}

		if (this.successCount !== undefined && this.failureCount !== undefined) {
			parts.push(`Success: ${this.successCount}, Failed: ${this.failureCount}`);
		}

		if (this.since) {
			parts.push(`Since: ${this.since.toISOString()}`);
		}

		if (this.failures?.length) {
			parts.push("Failed Items:");
			this.failures.forEach((failure) => {
				parts.push(`  - ${failure.id}: ${failure.error}`);
			});
		}

		return parts.join("\n");
	}

	/**
	 * Check if this is a partial failure (some items succeeded)
	 */
	isPartialFailure(): boolean {
		return (
			this.successCount !== undefined &&
			this.failureCount !== undefined &&
			this.successCount > 0 &&
			this.failureCount > 0
		);
	}

	/**
	 * Get sync progress percentage
	 */
	getProgress(): number | undefined {
		if (this.totalItems === undefined || this.totalItems === 0) {
			return undefined;
		}
		return ((this.successCount || 0) / this.totalItems) * 100;
	}
}

// ============================================================================
// Resource Errors
// ============================================================================

/**
 * Resource not found error (404)
 *
 * Examples:
 * - Product not found
 * - Order not found
 * - Customer not found
 */
export class ResourceNotFoundError extends Data.TaggedError("ResourceNotFoundError")<{
	readonly message: string;
	readonly resourceType?: string;
	readonly resourceId?: string;
}> {
	toUserMessage(): string {
		if (this.resourceType && this.resourceId) {
			return `${this.resourceType} not found: ${this.resourceId}`;
		}
		return this.message;
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.resourceType) {
			parts.push(`Resource Type: ${this.resourceType}`);
		}
		if (this.resourceId) {
			parts.push(`Resource ID: ${this.resourceId}`);
		}
		return parts.join("\n");
	}
}

/**
 * Resource conflict error (409)
 *
 * Examples:
 * - Duplicate product SKU
 * - Concurrent modification conflict
 * - Version mismatch
 */
export class ResourceConflictError extends Data.TaggedError("ResourceConflictError")<{
	readonly message: string;
	readonly resourceType?: string;
	readonly conflictingField?: string;
	readonly existingValue?: unknown;
	readonly attemptedValue?: unknown;
}> {
	toUserMessage(): string {
		if (this.conflictingField) {
			return `Conflict: ${this.conflictingField} already exists`;
		}
		return this.message;
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.resourceType) {
			parts.push(`Resource Type: ${this.resourceType}`);
		}
		if (this.conflictingField) {
			parts.push(`Conflicting Field: ${this.conflictingField}`);
		}
		if (this.existingValue !== undefined) {
			parts.push(`Existing Value: ${JSON.stringify(this.existingValue)}`);
		}
		if (this.attemptedValue !== undefined) {
			parts.push(`Attempted Value: ${JSON.stringify(this.attemptedValue)}`);
		}
		return parts.join("\n");
	}
}

// ============================================================================
// Internal Errors
// ============================================================================

/**
 * Internal server errors (500+) and unknown errors
 *
 * Examples:
 * - Shopify server error (500, 502, 503)
 * - Unexpected error format
 * - Unknown error type
 */
export class InternalError extends Data.TaggedError("InternalError")<{
	readonly message: string;
	readonly statusCode?: number;
	readonly cause?: unknown;
	readonly context?: Record<string, unknown>;
}> {
	toUserMessage(): string {
		return "An unexpected error occurred. Our team has been notified.";
	}

	toDebugMessage(): string {
		const parts = [this.message];
		if (this.statusCode) {
			parts.push(`Status Code: ${this.statusCode}`);
		}
		if (this.cause) {
			parts.push(`Cause: ${JSON.stringify(this.cause)}`);
		}
		if (this.context) {
			parts.push(`Context: ${JSON.stringify(this.context, null, 2)}`);
		}
		return parts.join("\n");
	}

	/**
	 * Check if error is retriable (5xx errors)
	 */
	isRetriable(): boolean {
		return this.statusCode !== undefined && this.statusCode >= 500 && this.statusCode < 600;
	}
}

// ============================================================================
// Error Type Union
// ============================================================================

/**
 * Union type of all Shopify errors
 * Use this for Effect error channels
 */
export type AnyShopifyError =
	| NetworkError
	| RateLimitError
	| AuthenticationError
	| ValidationError
	| GraphQLError
	| WebhookError
	| SyncError
	| ResourceNotFoundError
	| ResourceConflictError
	| InternalError;

// ============================================================================
// Error Helper Functions
// ============================================================================

/**
 * Create a NetworkError from a fetch error
 */
export function fromFetchError(error: unknown): NetworkError {
	if (error instanceof Error) {
		return new NetworkError({
			message: `Network request failed: ${error.message}`,
			cause: error,
		});
	}
	return new NetworkError({
		message: "Network request failed",
		cause: error,
	});
}

/**
 * Create appropriate error from HTTP status code
 */
export function fromHttpStatus(
	statusCode: number,
	message: string,
	details?: unknown
): AnyShopifyError {
	switch (statusCode) {
		case 401:
		case 403:
			return new AuthenticationError({
				message,
				statusCode,
			});
		case 404:
			return new ResourceNotFoundError({
				message,
			});
		case 409:
			return new ResourceConflictError({
				message,
			});
		case 429:
			return new RateLimitError({
				message,
			});
		case 400:
			return new ValidationError({
				message,
			});
		default:
			if (statusCode >= 500) {
				return new InternalError({
					message,
					statusCode,
				});
			}
			return new InternalError({
				message: `HTTP ${statusCode}: ${message}`,
				statusCode,
			});
	}
}

/**
 * Create GraphQLError from GraphQL response
 */
export function fromGraphQLResponse(
	errors: Array<{ message: string; path?: string[]; extensions?: Record<string, unknown> }>,
	query?: string,
	variables?: Record<string, unknown>
): GraphQLError {
	return new GraphQLError({
		message: errors[0]?.message || "GraphQL query failed",
		errors,
		query,
		variables,
	});
}

/**
 * Check if error is retriable
 */
export function isRetriable(error: AnyShopifyError): boolean {
	if (error._tag === "RateLimitError") {
		return true;
	}
	if (error._tag === "NetworkError") {
		return true;
	}
	if (error._tag === "InternalError") {
		return error.isRetriable();
	}
	return false;
}

/**
 * Get retry delay for error (in milliseconds)
 */
export function getRetryDelay(error: AnyShopifyError, attempt: number): number {
	if (error._tag === "RateLimitError") {
		return error.getBackoffDelay(attempt);
	}
	// Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 30s)
	return Math.min(1000 * Math.pow(2, attempt), 30000);
}
