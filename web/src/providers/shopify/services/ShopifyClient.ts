/**
 * ShopifyClient Service - GraphQL Communication Layer
 *
 * Handles all GraphQL communication with Shopify Admin API including:
 * - Query/mutation execution with automatic authentication
 * - Rate limit monitoring and adaptive throttling
 * - Retry logic with exponential backoff
 * - Error handling (network, GraphQL, rate limit errors)
 * - Request/response logging
 * - Cost estimation and monitoring
 *
 * Design Philosophy:
 * - Pure Effect.ts implementation for composability
 * - All operations return Effect<Success, Error>
 * - Rate limit tracking via response extensions
 * - Automatic retry with exponential backoff for 429 errors
 * - Circuit breaker pattern for repeated failures
 * - Structured logging for debugging and monitoring
 *
 * Usage:
 * ```typescript
 * import { ShopifyClient } from './services/ShopifyClient';
 * import { GET_PRODUCT } from './graphql/queries';
 *
 * const program = Effect.gen(function* () {
 *   const client = yield* ShopifyClient;
 *   const result = yield* client.query(GET_PRODUCT, { id: "gid://shopify/Product/123" });
 *   return result;
 * }).pipe(Effect.provide(ShopifyClientLive));
 *
 * const product = await Effect.runPromise(program);
 * ```
 *
 * Related Documentation:
 * - /one/knowledge/shopify-rate-limits.md - Rate limit details
 * - /web/src/providers/shopify/graphql/queries.ts - Query definitions
 * - /web/src/providers/shopify/graphql/mutations.ts - Mutation definitions
 */

import { Context, Data, Effect } from 'effect';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Network communication error (connection failed, timeout, DNS)
 */
export class NetworkError extends Data.TaggedError('NetworkError')<{
  shop: string;
  message: string;
  code?: string;
  cause?: unknown;
}> {}

/**
 * GraphQL validation or execution error
 */
export class GraphQLError extends Data.TaggedError('GraphQLError')<{
  shop: string;
  query: string;
  errors: Array<{
    message: string;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}> {}

/**
 * Rate limit exceeded (429 Too Many Requests)
 */
export class RateLimitError extends Data.TaggedError('RateLimitError')<{
  shop: string;
  availablePoints: number;
  requestedCost: number;
  retryAfter: number; // seconds
  message: string;
}> {}

/**
 * Authentication error (invalid or expired access token)
 */
export class AuthenticationError extends Data.TaggedError('AuthenticationError')<{
  shop: string;
  message: string;
  statusCode?: number;
}> {}

/**
 * Invalid shop domain
 */
export class InvalidShopError extends Data.TaggedError('InvalidShopError')<{
  shop: string;
  reason: string;
}> {}

/**
 * Bulk operation error
 */
export class BulkOperationError extends Data.TaggedError('BulkOperationError')<{
  operationId: string;
  status: string;
  errorCode?: string;
  message: string;
}> {}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * GraphQL cost information from response extensions
 */
export interface GraphQLCost {
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: {
    maximumAvailable: number;
    currentlyAvailable: number;
    restoreRate: number;
  };
}

/**
 * GraphQL response structure
 */
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
  extensions?: {
    cost?: GraphQLCost;
  };
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  id: string;
  status: 'CREATED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  url?: string; // JSONL file URL when completed
  objectCount?: number;
  fileSize?: number;
  errorCode?: string;
}

/**
 * Query execution options
 */
export interface QueryOptions {
  /** Override default retry behavior */
  retry?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
  };
  /** Custom timeout in milliseconds */
  timeout?: number;
  /** Skip rate limit checking (use with caution) */
  skipRateLimitCheck?: boolean;
}

// ============================================================================
// RATE LIMIT TRACKING
// ============================================================================

/**
 * Rate limit state for a shop
 */
export interface RateLimitState {
  currentlyAvailable: number;
  maximumAvailable: number;
  restoreRate: number;
  lastUpdated: number;
}

/**
 * Rate limit tracker (in-memory)
 */
class RateLimitTracker {
  private state = new Map<string, RateLimitState>();

  update(shop: string, cost: GraphQLCost): void {
    this.state.set(shop, {
      currentlyAvailable: cost.throttleStatus.currentlyAvailable,
      maximumAvailable: cost.throttleStatus.maximumAvailable,
      restoreRate: cost.throttleStatus.restoreRate,
      lastUpdated: Date.now(),
    });
  }

  get(shop: string): RateLimitState | undefined {
    return this.state.get(shop);
  }

  /**
   * Estimate current available points based on restore rate
   */
  estimateAvailable(shop: string): number {
    const state = this.state.get(shop);
    if (!state) return 1000; // Default maximum

    const elapsed = (Date.now() - state.lastUpdated) / 1000; // seconds
    const restored = elapsed * state.restoreRate;
    const available = Math.min(
      state.maximumAvailable,
      state.currentlyAvailable + restored
    );

    return Math.floor(available);
  }

  /**
   * Check if enough points available for estimated cost
   */
  canExecute(shop: string, estimatedCost: number): boolean {
    const available = this.estimateAvailable(shop);
    return available >= estimatedCost;
  }

  /**
   * Calculate wait time needed for points to restore
   */
  calculateWaitTime(shop: string, requiredPoints: number): number {
    const available = this.estimateAvailable(shop);
    if (available >= requiredPoints) return 0;

    const state = this.state.get(shop);
    if (!state) return 0;

    const needed = requiredPoints - available;
    const waitSeconds = needed / state.restoreRate;
    return Math.ceil(waitSeconds * 1000); // milliseconds
  }
}

// Global rate limit tracker (shared across all clients)
const rateLimitTracker = new RateLimitTracker();

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * ShopifyClient: GraphQL communication with Shopify Admin API
 *
 * All methods return Effect types for composability.
 * Rate limiting is handled automatically via response extensions.
 * Failed requests are retried with exponential backoff.
 */
export class ShopifyClient extends Context.Tag('ShopifyClient')<
  ShopifyClient,
  {
    /**
     * Execute a GraphQL query
     *
     * Features:
     * - Automatic authentication (injects access token)
     * - Rate limit checking before execution
     * - Cost tracking after execution
     * - Retry on rate limit errors (429)
     * - Network error handling
     *
     * @param query GraphQL query string
     * @param variables Query variables
     * @param options Execution options
     * @returns Query result data
     *
     * @example
     * ```typescript
     * const result = yield* client.query(GET_PRODUCT, { id: "gid://shopify/Product/123" });
     * console.log(result.product.title);
     * ```
     */
    query: <T = unknown>(
      query: string,
      variables?: Record<string, unknown>,
      options?: QueryOptions
    ) => Effect.Effect<
      T,
      NetworkError | GraphQLError | RateLimitError | AuthenticationError
    >;

    /**
     * Execute a GraphQL mutation
     *
     * Features:
     * - Same as query() plus userErrors handling
     * - Mutation-specific error extraction
     * - Optimistic locking support (via version field)
     *
     * @param mutation GraphQL mutation string
     * @param variables Mutation variables
     * @param options Execution options
     * @returns Mutation result data
     *
     * @example
     * ```typescript
     * const result = yield* client.mutate(CREATE_PRODUCT, {
     *   input: { title: "New Product", productType: "Digital" }
     * });
     * console.log(result.productCreate.product.id);
     * ```
     */
    mutate: <T = unknown>(
      mutation: string,
      variables?: Record<string, unknown>,
      options?: QueryOptions
    ) => Effect.Effect<
      T,
      NetworkError | GraphQLError | RateLimitError | AuthenticationError
    >;

    /**
     * Start a bulk operation for large datasets
     *
     * Use for fetching >1,000 records:
     * - Product exports
     * - Order exports
     * - Customer data
     *
     * Process:
     * 1. Start operation (returns operation ID)
     * 2. Poll for completion
     * 3. Download JSONL file
     * 4. Parse results
     *
     * @param query Bulk query string (no pagination needed)
     * @returns Bulk operation result with download URL
     *
     * @example
     * ```typescript
     * const result = yield* client.bulkOperation(`
     *   {
     *     products {
     *       edges { node { id title } }
     *     }
     *   }
     * `);
     * const products = yield* downloadBulkResults(result.url);
     * ```
     */
    bulkOperation: (
      query: string
    ) => Effect.Effect<BulkOperationResult, GraphQLError | BulkOperationError>;

    /**
     * Get current rate limit status for shop
     *
     * Returns estimated available points based on:
     * - Last known state
     * - Restore rate (50 points/second)
     * - Elapsed time
     *
     * @returns Rate limit state
     *
     * @example
     * ```typescript
     * const state = yield* client.getRateLimitStatus();
     * console.log(`Available: ${state.currentlyAvailable}/1000`);
     * ```
     */
    getRateLimitStatus: () => Effect.Effect<RateLimitState, never>;

    /**
     * Estimate query cost before execution
     *
     * Uses heuristics based on:
     * - Number of fields requested
     * - Connection depths (first: N)
     * - Nesting levels
     *
     * Note: Actual cost may differ. Use response extensions for accurate cost.
     *
     * @param query GraphQL query string
     * @param variables Query variables
     * @returns Estimated cost in points
     *
     * @example
     * ```typescript
     * const cost = yield* client.estimateCost(LIST_PRODUCTS, { first: 50 });
     * if (cost > 100) {
     *   console.warn("High-cost query detected");
     * }
     * ```
     */
    estimateCost: (
      query: string,
      variables?: Record<string, unknown>
    ) => Effect.Effect<number, never>;

    /**
     * Wait for sufficient rate limit points
     *
     * Blocks until enough points are available for estimated cost.
     * Used internally but exposed for advanced use cases.
     *
     * @param estimatedCost Required points
     * @returns Milliseconds waited
     *
     * @example
     * ```typescript
     * yield* client.waitForRateLimit(100); // Wait for 100 points
     * yield* client.query(expensiveQuery); // Execute when ready
     * ```
     */
    waitForRateLimit: (estimatedCost: number) => Effect.Effect<number, never>;
  }
>() {}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate Shopify shop domain format
 */
function validateShopDomain(shop: string): Effect.Effect<void, InvalidShopError> {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

  if (!shopRegex.test(shop)) {
    return Effect.fail(
      new InvalidShopError({
        shop,
        reason: 'Shop domain must match pattern: {name}.myshopify.com',
      })
    );
  }

  return Effect.void;
}

/**
 * Estimate GraphQL query cost using heuristics
 */
function estimateQueryCostHeuristic(
  query: string,
  variables?: Record<string, unknown>
): number {
  let cost = 5; // Base cost

  // Count connections (first: N increases cost)
  const connectionMatches = query.match(/first:\s*\$?\w+/g) || [];
  connectionMatches.forEach((match) => {
    // Extract the limit value
    const limitMatch = match.match(/\d+/);
    const limit = limitMatch ? parseInt(limitMatch[0]) : 10;
    cost += 2 + Math.min(limit, 250); // Connection cost capped at 250
  });

  // Count nesting levels (each level adds complexity)
  const nestingLevel = (query.match(/{/g) || []).length;
  cost += nestingLevel * 2;

  // Check for mutations (generally higher cost)
  if (query.trim().startsWith('mutation')) {
    cost += 5;
  }

  return cost;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Effect.Effect<void, never> {
  return Effect.async<void>((resume) => {
    const timeout = setTimeout(() => resume(Effect.void), ms);
    return Effect.sync(() => clearTimeout(timeout));
  });
}

/**
 * Retry effect with exponential backoff
 */
function retryWithBackoff<A, E>(
  effect: Effect.Effect<A, E>,
  options: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    shouldRetry: (error: E) => boolean;
  }
): Effect.Effect<A, E> {
  const { maxAttempts, initialDelay, maxDelay, shouldRetry } = options;

  return Effect.gen(function* () {
    let lastError: E;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = yield* Effect.either(effect);

      if (result._tag === 'Right') {
        return result.right;
      }

      lastError = result.left;

      // Don't retry if not a retryable error
      if (!shouldRetry(lastError)) {
        return yield* Effect.fail(lastError);
      }

      // Don't wait after last attempt
      if (attempt < maxAttempts - 1) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        yield* sleep(delay);
      }
    }

    return yield* Effect.fail(lastError!);
  });
}

// ============================================================================
// IMPLEMENTATION STUB
// ============================================================================

/**
 * NOTE: This is a DESIGN-ONLY implementation.
 *
 * Full implementation will be added in later cycles:
 * - Cycle 28-30: HTTP client integration
 * - Cycle 31-33: Rate limit middleware
 * - Cycle 34-36: Retry logic implementation
 * - Cycle 37-39: Logging and monitoring
 *
 * For now, this serves as the interface specification and error type definitions.
 */

// Export types and helpers for use in other modules
export { rateLimitTracker, validateShopDomain, estimateQueryCostHeuristic, sleep, retryWithBackoff };
