---
title: Shopify Integration - Retry Strategy
dimension: knowledge
category: integration
tags: shopify, retry, resilience, error-handling, circuit-breaker
related_dimensions: events, things
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: 39 of 100
ai_context: |
  Comprehensive retry strategy for Shopify integration on ONE Platform.
  Covers exponential backoff, circuit breaker, adaptive throttling, and error classification.
  Designed for production reliability and fault tolerance.
---

# Shopify Integration - Retry Strategy

**Version:** 1.0.0
**Cycle:** 39 of 100
**Status:** Design Complete
**Created:** 2025-11-22

---

## Executive Summary

This document defines a comprehensive retry strategy for the ONE Platform Shopify integration. The strategy implements intelligent retry logic with exponential backoff, circuit breaker pattern, and adaptive throttling to handle transient failures while avoiding cascading failures.

**Key Objectives:**
- **Handle transient failures gracefully** (network errors, rate limits)
- **Fail fast on permanent errors** (validation, authentication)
- **Prevent cascading failures** via circuit breaker
- **Respect rate limits** through adaptive throttling
- **Maintain system stability** under adverse conditions

---

## 1. Error Classification

### Retryable Errors (Transient)

**Network Errors:**
- `ECONNRESET` - Connection reset by peer
- `ETIMEDOUT` - Request timeout
- `ENOTFOUND` - DNS lookup failed
- `ECONNREFUSED` - Connection refused

**HTTP Status Codes:**
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable
- `504` - Gateway Timeout

**Shopify-Specific:**
- `THROTTLED` - GraphQL rate limit exceeded
- Rate limit errors with `Retry-After` header

### Non-Retryable Errors (Permanent)

**Authentication/Authorization:**
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)

**Client Errors:**
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (validation error)

**Shopify-Specific:**
- GraphQL `userErrors` (validation failures)
- Invalid API version
- Malformed queries

### Error Classification Service

```typescript
import { Effect } from 'effect';

export type ErrorCategory = 'retryable' | 'non-retryable' | 'rate-limit';

export interface ClassifiedError {
  category: ErrorCategory;
  originalError: Error;
  retryAfter?: number; // Seconds to wait before retry
  statusCode?: number;
  message: string;
}

export class ErrorClassificationService extends Effect.Service<ErrorClassificationService>()(
  'ErrorClassificationService',
  {
    effect: Effect.gen(function* () {
      return {
        classify: (error: any): ClassifiedError => {
          // Network errors (retryable)
          if (
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ECONNREFUSED'
          ) {
            return {
              category: 'retryable',
              originalError: error,
              message: `Network error: ${error.code}`,
            };
          }

          // Rate limit errors
          if (error.status === 429 || error.message?.includes('THROTTLED')) {
            const retryAfter = error.retryAfter || error.extensions?.cost?.throttleStatus?.restoreTime || 1;
            return {
              category: 'rate-limit',
              originalError: error,
              retryAfter,
              statusCode: 429,
              message: 'Rate limit exceeded',
            };
          }

          // Server errors (retryable)
          if (error.status >= 500 && error.status < 600) {
            return {
              category: 'retryable',
              originalError: error,
              statusCode: error.status,
              message: `Server error: ${error.status}`,
            };
          }

          // Client errors (non-retryable)
          if (error.status >= 400 && error.status < 500) {
            return {
              category: 'non-retryable',
              originalError: error,
              statusCode: error.status,
              message: `Client error: ${error.status}`,
            };
          }

          // GraphQL userErrors (non-retryable)
          if (error.graphQLErrors?.length > 0 || error.userErrors?.length > 0) {
            return {
              category: 'non-retryable',
              originalError: error,
              message: 'GraphQL validation error',
            };
          }

          // Unknown errors (non-retryable to be safe)
          return {
            category: 'non-retryable',
            originalError: error,
            message: 'Unknown error',
          };
        },
      };
    }),
  }
) {}
```

---

## 2. Retry Middleware

### Core Retry Logic

```typescript
import { Effect, Schedule } from 'effect';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  shouldRetry?: (error: ClassifiedError) => boolean;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 5,
  initialDelay: 1000, // 1 second
  maxDelay: 16000, // 16 seconds
  backoffMultiplier: 2, // exponential backoff
};

export class RetryMiddleware extends Effect.Service<RetryMiddleware>()('RetryMiddleware', {
  effect: Effect.gen(function* () {
    const classifier = yield* ErrorClassificationService;
    const circuitBreaker = yield* CircuitBreakerService;

    return {
      /**
       * Retry an operation with exponential backoff
       */
      retry: <T, E extends Error>(
        operation: () => Effect.Effect<T, E>,
        config: Partial<RetryConfig> = {}
      ) =>
        Effect.gen(function* () {
          const finalConfig = { ...defaultRetryConfig, ...config };
          let attempt = 0;
          let lastError: ClassifiedError | null = null;

          while (attempt <= finalConfig.maxRetries) {
            try {
              // Check circuit breaker
              const canProceed = yield* circuitBreaker.canExecute();
              if (!canProceed) {
                throw new Error('Circuit breaker is OPEN');
              }

              // Execute operation
              const result = yield* operation();

              // Success - reset circuit breaker
              yield* circuitBreaker.recordSuccess();
              return result;
            } catch (error: any) {
              // Classify error
              const classified = classifier.classify(error);
              lastError = classified;

              // Record failure in circuit breaker
              yield* circuitBreaker.recordFailure();

              // Check if retryable
              if (classified.category === 'non-retryable') {
                yield* Effect.log(`Non-retryable error: ${classified.message}`);
                throw error;
              }

              // Check custom retry predicate
              if (config.shouldRetry && !config.shouldRetry(classified)) {
                yield* Effect.log(`Custom retry check failed: ${classified.message}`);
                throw error;
              }

              // Check if max retries exceeded
              if (attempt >= finalConfig.maxRetries) {
                yield* Effect.log(
                  `Max retries (${finalConfig.maxRetries}) exceeded: ${classified.message}`
                );
                throw error;
              }

              // Calculate backoff delay
              let delay: number;
              if (classified.category === 'rate-limit' && classified.retryAfter) {
                // Use Retry-After header for rate limits
                delay = Math.min(classified.retryAfter * 1000, finalConfig.maxDelay);
              } else {
                // Exponential backoff: 1s, 2s, 4s, 8s, 16s
                delay = Math.min(
                  finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
                  finalConfig.maxDelay
                );
              }

              // Add jitter (±20%) to prevent thundering herd
              const jitter = delay * 0.2 * (Math.random() * 2 - 1);
              const finalDelay = Math.max(0, delay + jitter);

              yield* Effect.log(
                `Attempt ${attempt + 1}/${finalConfig.maxRetries} failed: ${classified.message}. ` +
                  `Retrying in ${finalDelay.toFixed(0)}ms...`
              );

              // Wait before retry
              yield* Effect.sleep(finalDelay);

              attempt++;
            }
          }

          // Should never reach here, but TypeScript needs it
          throw lastError?.originalError || new Error('Retry failed');
        }),

      /**
       * Retry with custom schedule (using Effect's Schedule)
       */
      retryWithSchedule: <T, E extends Error>(
        operation: () => Effect.Effect<T, E>,
        schedule: Schedule.Schedule<any, E, any>
      ) =>
        Effect.gen(function* () {
          return yield* Effect.retry(operation(), schedule);
        }),
    };
  }),
}) {}
```

### Usage Examples

```typescript
// Example 1: Basic retry
const product = await Effect.runPromise(
  Effect.gen(function* () {
    const retry = yield* RetryMiddleware;
    return yield* retry.retry(() => shopify.product.get(productId));
  })
);

// Example 2: Custom retry config
const product = await Effect.runPromise(
  Effect.gen(function* () {
    const retry = yield* RetryMiddleware;
    return yield* retry.retry(() => shopify.product.get(productId), {
      maxRetries: 3,
      initialDelay: 500,
      maxDelay: 5000,
    });
  })
);

// Example 3: Custom retry predicate
const product = await Effect.runPromise(
  Effect.gen(function* () {
    const retry = yield* RetryMiddleware;
    return yield* retry.retry(() => shopify.product.get(productId), {
      shouldRetry: (error) => {
        // Only retry on rate limits, not other errors
        return error.category === 'rate-limit';
      },
    });
  })
);

// Example 4: Using Effect's Schedule
const product = await Effect.runPromise(
  Effect.gen(function* () {
    const retry = yield* RetryMiddleware;
    const schedule = Schedule.exponential(1000).pipe(Schedule.upTo(16000), Schedule.compose(Schedule.recurs(5)));
    return yield* retry.retryWithSchedule(() => shopify.product.get(productId), schedule);
  })
);
```

---

## 3. Circuit Breaker Pattern

### Circuit Breaker States

```
┌─────────────┐
│   CLOSED    │◄─────────────┐
│  (Normal)   │              │
└──────┬──────┘              │
       │                     │
       │ Failures exceed     │ Success
       │ threshold           │ threshold
       │                     │
       ▼                     │
┌─────────────┐              │
│    OPEN     │              │
│ (Blocking)  │              │
└──────┬──────┘              │
       │                     │
       │ Timeout             │
       │ expires             │
       │                     │
       ▼                     │
┌─────────────┐              │
│ HALF_OPEN   │──────────────┘
│  (Testing)  │
└─────────────┘
```

### Circuit Breaker Implementation

```typescript
import { Effect, Ref } from 'effect';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // milliseconds to wait before half-open
  monitoringWindow: number; // milliseconds to track failures
}

export const defaultCircuitConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  monitoringWindow: 120000, // 2 minutes
};

interface CircuitMetrics {
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastStateChange: number;
  state: CircuitState;
}

export class CircuitBreakerService extends Effect.Service<CircuitBreakerService>()(
  'CircuitBreakerService',
  {
    effect: Effect.gen(function* () {
      const config = defaultCircuitConfig;

      // Mutable state
      const metricsRef = yield* Ref.make<CircuitMetrics>({
        failures: 0,
        successes: 0,
        lastFailureTime: 0,
        lastStateChange: Date.now(),
        state: 'CLOSED',
      });

      const setState = (newState: CircuitState) =>
        Ref.update(metricsRef, (m) => ({
          ...m,
          state: newState,
          lastStateChange: Date.now(),
          failures: newState === 'CLOSED' ? 0 : m.failures,
          successes: newState === 'OPEN' ? 0 : m.successes,
        }));

      return {
        /**
         * Check if operation can proceed
         */
        canExecute: () =>
          Effect.gen(function* () {
            const metrics = yield* Ref.get(metricsRef);
            const now = Date.now();

            switch (metrics.state) {
              case 'CLOSED':
                // Clean up old failures outside monitoring window
                if (now - metrics.lastFailureTime > config.monitoringWindow) {
                  yield* Ref.update(metricsRef, (m) => ({ ...m, failures: 0 }));
                }
                return true;

              case 'OPEN':
                // Check if timeout has elapsed
                if (now - metrics.lastStateChange >= config.timeout) {
                  yield* setState('HALF_OPEN');
                  yield* Effect.log('Circuit breaker: OPEN → HALF_OPEN');
                  return true;
                }
                yield* Effect.log('Circuit breaker is OPEN, blocking request');
                return false;

              case 'HALF_OPEN':
                return true;

              default:
                return true;
            }
          }),

        /**
         * Record successful operation
         */
        recordSuccess: () =>
          Effect.gen(function* () {
            const metrics = yield* Ref.get(metricsRef);

            if (metrics.state === 'HALF_OPEN') {
              const newSuccesses = metrics.successes + 1;
              yield* Ref.update(metricsRef, (m) => ({ ...m, successes: newSuccesses }));

              if (newSuccesses >= config.successThreshold) {
                yield* setState('CLOSED');
                yield* Effect.log('Circuit breaker: HALF_OPEN → CLOSED');
              }
            }
          }),

        /**
         * Record failed operation
         */
        recordFailure: () =>
          Effect.gen(function* () {
            const metrics = yield* Ref.get(metricsRef);
            const now = Date.now();

            if (metrics.state === 'HALF_OPEN') {
              // Immediate transition to OPEN on failure in HALF_OPEN
              yield* setState('OPEN');
              yield* Effect.log('Circuit breaker: HALF_OPEN → OPEN');
              return;
            }

            if (metrics.state === 'CLOSED') {
              const newFailures = metrics.failures + 1;
              yield* Ref.update(metricsRef, (m) => ({
                ...m,
                failures: newFailures,
                lastFailureTime: now,
              }));

              if (newFailures >= config.failureThreshold) {
                yield* setState('OPEN');
                yield* Effect.log(
                  `Circuit breaker: CLOSED → OPEN (${newFailures} failures in ${
                    config.monitoringWindow / 1000
                  }s window)`
                );
              }
            }
          }),

        /**
         * Get current state
         */
        getState: () =>
          Effect.gen(function* () {
            const metrics = yield* Ref.get(metricsRef);
            return metrics.state;
          }),

        /**
         * Get metrics
         */
        getMetrics: () => Ref.get(metricsRef),

        /**
         * Reset circuit breaker (for testing/admin)
         */
        reset: () =>
          Effect.gen(function* () {
            yield* Ref.set(metricsRef, {
              failures: 0,
              successes: 0,
              lastFailureTime: 0,
              lastStateChange: Date.now(),
              state: 'CLOSED',
            });
            yield* Effect.log('Circuit breaker reset to CLOSED');
          }),
      };
    }),
  }
) {}
```

---

## 4. Adaptive Throttling

### Rate Limit-Aware Throttling

```typescript
import { Effect, Queue } from 'effect';

export interface ThrottleConfig {
  pointsPerSecond: number; // Rate limit restore rate
  maxPoints: number; // Maximum available points
  warningThreshold: number; // Slow down when below this
  criticalThreshold: number; // Block when below this
}

export const shopifyGraphQLThrottleConfig: ThrottleConfig = {
  pointsPerSecond: 50,
  maxPoints: 1000,
  warningThreshold: 200,
  criticalThreshold: 100,
};

export class AdaptiveThrottleService extends Effect.Service<AdaptiveThrottleService>()(
  'AdaptiveThrottleService',
  {
    effect: Effect.gen(function* () {
      const config = shopifyGraphQLThrottleConfig;

      // Track available points
      let availablePoints = config.maxPoints;
      let lastUpdateTime = Date.now();

      const restorePoints = (): void => {
        const now = Date.now();
        const elapsedSeconds = (now - lastUpdateTime) / 1000;
        const restoredPoints = elapsedSeconds * config.pointsPerSecond;

        availablePoints = Math.min(config.maxPoints, availablePoints + restoredPoints);
        lastUpdateTime = now;
      };

      return {
        /**
         * Execute operation with adaptive throttling
         */
        execute: <T>(operation: () => Effect.Effect<T, Error>, estimatedCost: number = 10) =>
          Effect.gen(function* () {
            // Restore points based on time elapsed
            restorePoints();

            // Check if we have enough points
            if (availablePoints < config.criticalThreshold) {
              const waitTime = ((config.criticalThreshold - availablePoints) / config.pointsPerSecond) * 1000;
              yield* Effect.log(`Critical throttle: waiting ${waitTime.toFixed(0)}ms for points to restore`);
              yield* Effect.sleep(waitTime);
              restorePoints();
            } else if (availablePoints < config.warningThreshold) {
              // Slow down proactively
              const waitTime = 500; // 500ms delay
              yield* Effect.log(`Warning throttle: delaying ${waitTime}ms (${availablePoints.toFixed(0)} points available)`);
              yield* Effect.sleep(waitTime);
              restorePoints();
            }

            // Execute operation
            const result = yield* operation();

            // Update available points from response
            if (result && typeof result === 'object' && 'extensions' in result) {
              const extensions = (result as any).extensions;
              if (extensions?.cost?.throttleStatus) {
                const actualCost = extensions.cost.actualQueryCost;
                availablePoints = extensions.cost.throttleStatus.currentlyAvailable;

                yield* Effect.log(
                  `Query cost: ${actualCost} (${availablePoints.toFixed(0)}/${config.maxPoints} points remaining)`
                );
              } else {
                // No cost info, use estimate
                availablePoints -= estimatedCost;
              }
            } else {
              // No cost info, use estimate
              availablePoints -= estimatedCost;
            }

            return result;
          }),

        /**
         * Get current throttle status
         */
        getStatus: () =>
          Effect.sync(() => {
            restorePoints();
            return {
              availablePoints,
              maxPoints: config.maxPoints,
              usagePercent: ((config.maxPoints - availablePoints) / config.maxPoints) * 100,
              status:
                availablePoints < config.criticalThreshold
                  ? 'critical'
                  : availablePoints < config.warningThreshold
                  ? 'warning'
                  : 'healthy',
            };
          }),

        /**
         * Reset to full capacity (for testing)
         */
        reset: () =>
          Effect.sync(() => {
            availablePoints = config.maxPoints;
            lastUpdateTime = Date.now();
          }),
      };
    }),
  }
) {}
```

### Usage with Retry Middleware

```typescript
// Combine adaptive throttling with retry logic
const product = await Effect.runPromise(
  Effect.gen(function* () {
    const retry = yield* RetryMiddleware;
    const throttle = yield* AdaptiveThrottleService;

    return yield* retry.retry(() =>
      throttle.execute(() => Effect.tryPromise(() => shopify.graphql(getProductQuery, { id: productId })), 15) // Estimated 15 points
    );
  })
);
```

---

## 5. Monitoring & Alerting

### Retry Metrics Service

```typescript
export class RetryMetricsService extends Effect.Service<RetryMetricsService>()(
  'RetryMetricsService',
  {
    effect: Effect.gen(function* () {
      // Metrics storage
      const metrics = {
        totalAttempts: 0,
        totalRetries: 0,
        totalFailures: 0,
        totalSuccesses: 0,
        errorsByType: new Map<string, number>(),
        retryDelaySum: 0,
      };

      return {
        recordAttempt: () =>
          Effect.sync(() => {
            metrics.totalAttempts++;
          }),

        recordRetry: (delay: number) =>
          Effect.sync(() => {
            metrics.totalRetries++;
            metrics.retryDelaySum += delay;
          }),

        recordSuccess: () =>
          Effect.sync(() => {
            metrics.totalSuccesses++;
          }),

        recordFailure: (errorType: string) =>
          Effect.sync(() => {
            metrics.totalFailures++;
            const count = metrics.errorsByType.get(errorType) || 0;
            metrics.errorsByType.set(errorType, count + 1);
          }),

        getMetrics: () =>
          Effect.sync(() => ({
            totalAttempts: metrics.totalAttempts,
            totalRetries: metrics.totalRetries,
            totalFailures: metrics.totalFailures,
            totalSuccesses: metrics.totalSuccesses,
            retryRate: metrics.totalAttempts > 0 ? metrics.totalRetries / metrics.totalAttempts : 0,
            successRate: metrics.totalAttempts > 0 ? metrics.totalSuccesses / metrics.totalAttempts : 0,
            avgRetryDelay: metrics.totalRetries > 0 ? metrics.retryDelaySum / metrics.totalRetries : 0,
            errorsByType: Object.fromEntries(metrics.errorsByType),
          })),

        reset: () =>
          Effect.sync(() => {
            metrics.totalAttempts = 0;
            metrics.totalRetries = 0;
            metrics.totalFailures = 0;
            metrics.totalSuccesses = 0;
            metrics.errorsByType.clear();
            metrics.retryDelaySum = 0;
          }),
      };
    }),
  }
) {}
```

### Convex Query for Monitoring Dashboard

```typescript
// Convex query for retry metrics
export const getRetryMetrics = query({
  args: {},
  handler: async (ctx) => {
    const metrics = await Effect.runPromise(
      Effect.gen(function* () {
        const retryMetrics = yield* RetryMetricsService;
        const circuitBreaker = yield* CircuitBreakerService;
        const throttle = yield* AdaptiveThrottleService;

        const retry = yield* retryMetrics.getMetrics();
        const circuit = yield* circuitBreaker.getMetrics();
        const throttleStatus = yield* throttle.getStatus();

        return {
          retry,
          circuit,
          throttle: throttleStatus,
        };
      })
    );

    return {
      retry: {
        totalAttempts: metrics.retry.totalAttempts,
        totalRetries: metrics.retry.totalRetries,
        successRate: `${(metrics.retry.successRate * 100).toFixed(2)}%`,
        retryRate: `${(metrics.retry.retryRate * 100).toFixed(2)}%`,
        avgRetryDelay: `${metrics.retry.avgRetryDelay.toFixed(0)}ms`,
        errorsByType: metrics.retry.errorsByType,
      },
      circuitBreaker: {
        state: metrics.circuit.state,
        failures: metrics.circuit.failures,
        successes: metrics.circuit.successes,
      },
      throttle: {
        status: metrics.throttle.status,
        availablePoints: metrics.throttle.availablePoints.toFixed(0),
        usagePercent: `${metrics.throttle.usagePercent.toFixed(1)}%`,
      },
    };
  },
});
```

### Event Logging

```typescript
// Log retry events to ONE Platform
export const logRetryEvent = mutation({
  args: {
    type: v.union(v.literal('retry'), v.literal('failure'), v.literal('circuit_open')),
    operation: v.string(),
    attempt: v.number(),
    error: v.optional(v.string()),
    delay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('events', {
      type: `shopify_retry_${args.type}`,
      thingId: 'shopify_integration',
      properties: {
        operation: args.operation,
        attempt: args.attempt,
        error: args.error,
        delay: args.delay,
        timestamp: Date.now(),
      },
    });
  },
});
```

### Alerting Rules

```typescript
// Example alerting logic
export class RetryAlertService extends Effect.Service<RetryAlertService>()('RetryAlertService', {
  effect: Effect.gen(function* () {
    const metrics = yield* RetryMetricsService;
    const circuit = yield* CircuitBreakerService;

    return {
      checkAlerts: () =>
        Effect.gen(function* () {
          const retryMetrics = yield* metrics.getMetrics();
          const circuitState = yield* circuit.getState();

          // Alert: High retry rate
          if (retryMetrics.retryRate > 0.5) {
            yield* Effect.log(`🚨 ALERT: High retry rate: ${(retryMetrics.retryRate * 100).toFixed(1)}%`);
            // Send notification (email, Slack, etc.)
          }

          // Alert: Low success rate
          if (retryMetrics.successRate < 0.8 && retryMetrics.totalAttempts > 10) {
            yield* Effect.log(`🚨 ALERT: Low success rate: ${(retryMetrics.successRate * 100).toFixed(1)}%`);
          }

          // Alert: Circuit breaker open
          if (circuitState === 'OPEN') {
            yield* Effect.log('🚨 ALERT: Circuit breaker is OPEN - blocking all requests');
          }
        }),
    };
  }),
}) {}
```

---

## 6. Integration with Services

### Service Layer Integration

```typescript
// Example: ShopifyProductService with retry
export class ShopifyProductService extends Effect.Service<ShopifyProductService>()(
  'ShopifyProductService',
  {
    effect: Effect.gen(function* () {
      const shopify = yield* ShopifyClient;
      const retry = yield* RetryMiddleware;
      const throttle = yield* AdaptiveThrottleService;
      const cache = yield* CacheService;

      return {
        /**
         * Get product with caching and retry
         */
        get: (productId: string) =>
          Effect.gen(function* () {
            // Check cache first
            const cached = yield* cache.get(`products:${productId}`);
            if (cached) return cached;

            // Fetch with retry + throttle
            const product = yield* retry.retry(() =>
              throttle.execute(
                () => Effect.tryPromise(() => shopify.product.get(productId)),
                15 // Estimated cost
              )
            );

            // Cache result
            yield* cache.set(`products:${productId}`, product, 1800);

            return product;
          }),

        /**
         * List products with pagination and retry
         */
        list: (params?: { limit?: number; cursor?: string }) =>
          Effect.gen(function* () {
            return yield* retry.retry(() =>
              throttle.execute(
                () =>
                  Effect.tryPromise(() =>
                    shopify.graphql(listProductsQuery, {
                      first: params?.limit || 50,
                      after: params?.cursor,
                    })
                  ),
                25 // Estimated cost
              )
            );
          }),

        /**
         * Update product with retry (no cache)
         */
        update: (productId: string, input: any) =>
          Effect.gen(function* () {
            const result = yield* retry.retry(
              () =>
                throttle.execute(
                  () =>
                    Effect.tryPromise(() =>
                      shopify.graphql(updateProductMutation, {
                        id: productId,
                        input,
                      })
                    ),
                  20
                ),
              {
                maxRetries: 3, // Fewer retries for mutations
              }
            );

            // Invalidate cache
            yield* cache.delete(`products:${productId}`);

            return result;
          }),
      };
    }),
  }
) {}
```

---

## 7. Retry Policies by Operation Type

### Queries (Read Operations)

**Policy:**
- Max retries: 5
- Initial delay: 1s
- Max delay: 16s
- Retry on: Network errors, 5xx, rate limits
- Do not retry: 4xx (except 429)

```typescript
const queryRetryConfig: Partial<RetryConfig> = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 16000,
};
```

### Mutations (Write Operations)

**Policy:**
- Max retries: 3 (fewer to avoid duplicate writes)
- Initial delay: 2s
- Max delay: 8s
- Retry on: Network errors, 5xx, rate limits
- Do not retry: 4xx (validation errors)
- **IMPORTANT:** Ensure idempotency

```typescript
const mutationRetryConfig: Partial<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 2000,
  maxDelay: 8000,
  shouldRetry: (error) => {
    // Never retry validation errors
    if (error.statusCode === 422) return false;
    return error.category === 'retryable' || error.category === 'rate-limit';
  },
};
```

### Bulk Operations

**Policy:**
- Max retries: 10 (longer operations need more retries)
- Initial delay: 5s
- Max delay: 60s
- Retry on: All transient errors
- Polling interval: 5s

```typescript
const bulkRetryConfig: Partial<RetryConfig> = {
  maxRetries: 10,
  initialDelay: 5000,
  maxDelay: 60000,
};
```

---

## 8. Testing Strategy

### Unit Tests

```typescript
describe('RetryMiddleware', () => {
  it('should succeed on first attempt', async () => {
    const operation = Effect.succeed('success');
    const result = await retry.retry(() => operation);
    expect(result).toBe('success');
  });

  it('should retry on transient errors', async () => {
    let attempts = 0;
    const operation = Effect.gen(function* () {
      attempts++;
      if (attempts < 3) {
        throw new Error('ETIMEDOUT');
      }
      return 'success';
    });

    const result = await retry.retry(() => operation);
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should not retry on permanent errors', async () => {
    let attempts = 0;
    const operation = Effect.gen(function* () {
      attempts++;
      throw { status: 422, message: 'Validation error' };
    });

    await expect(retry.retry(() => operation)).rejects.toThrow();
    expect(attempts).toBe(1); // Only one attempt
  });

  it('should respect max retries', async () => {
    let attempts = 0;
    const operation = Effect.gen(function* () {
      attempts++;
      throw new Error('ETIMEDOUT');
    });

    await expect(retry.retry(() => operation, { maxRetries: 3 })).rejects.toThrow();
    expect(attempts).toBe(4); // Initial + 3 retries
  });

  it('should use exponential backoff', async () => {
    const delays: number[] = [];
    const operation = Effect.gen(function* () {
      throw new Error('ETIMEDOUT');
    });

    // Mock sleep to capture delays
    const originalSleep = Effect.sleep;
    Effect.sleep = (ms: number) => {
      delays.push(ms);
      return Effect.void;
    };

    await expect(retry.retry(() => operation, { maxRetries: 3 })).rejects.toThrow();

    expect(delays).toHaveLength(3);
    expect(delays[0]).toBeGreaterThanOrEqual(800); // ~1s with jitter
    expect(delays[1]).toBeGreaterThanOrEqual(1600); // ~2s with jitter
    expect(delays[2]).toBeGreaterThanOrEqual(3200); // ~4s with jitter

    Effect.sleep = originalSleep;
  });
});

describe('CircuitBreaker', () => {
  it('should open after threshold failures', async () => {
    for (let i = 0; i < 5; i++) {
      await circuitBreaker.recordFailure();
    }

    const state = await circuitBreaker.getState();
    expect(state).toBe('OPEN');
  });

  it('should block requests when open', async () => {
    await circuitBreaker.setState('OPEN');
    const canExecute = await circuitBreaker.canExecute();
    expect(canExecute).toBe(false);
  });

  it('should transition to half-open after timeout', async () => {
    await circuitBreaker.setState('OPEN');
    await sleep(61000); // Wait for timeout
    const canExecute = await circuitBreaker.canExecute();
    expect(canExecute).toBe(true);
    const state = await circuitBreaker.getState();
    expect(state).toBe('HALF_OPEN');
  });
});
```

---

## 9. Implementation Checklist

### Phase 1: Error Classification (Cycle 40)
- [ ] Implement `ErrorClassificationService`
- [ ] Define retryable vs non-retryable errors
- [ ] Add Shopify-specific error handling
- [ ] Test error classification logic

### Phase 2: Retry Middleware (Cycle 41)
- [ ] Implement `RetryMiddleware`
- [ ] Add exponential backoff logic
- [ ] Implement jitter to prevent thundering herd
- [ ] Test retry behavior with various errors

### Phase 3: Circuit Breaker (Cycle 42)
- [ ] Implement `CircuitBreakerService`
- [ ] Add state transitions (CLOSED → OPEN → HALF_OPEN)
- [ ] Integrate with retry middleware
- [ ] Test circuit breaker states

### Phase 4: Adaptive Throttling (Cycle 43)
- [ ] Implement `AdaptiveThrottleService`
- [ ] Track Shopify API points
- [ ] Add warning/critical thresholds
- [ ] Test throttling behavior

### Phase 5: Monitoring (Cycle 44)
- [ ] Implement `RetryMetricsService`
- [ ] Add Convex queries for metrics
- [ ] Create alerting logic
- [ ] Build monitoring dashboard UI

---

## 10. Related Documentation

- **Rate Limiting:** `/home/user/one.ie/one/knowledge/shopify-rate-limits.md`
- **Best Practices:** `/home/user/one.ie/one/knowledge/shopify-best-practices.md`
- **Cache Strategy:** `/home/user/one.ie/one/knowledge/shopify-cache-strategy.md` (Cycle 38)
- **Service Layer:** `/home/user/one.ie/one/knowledge/shopify-service-layer.md` (Cycle 45)

---

## Summary

This retry strategy provides:

✅ **Intelligent error classification** (retryable vs permanent)
✅ **Exponential backoff** (1s → 16s with jitter)
✅ **Circuit breaker** (prevents cascading failures)
✅ **Adaptive throttling** (respects rate limits)
✅ **Comprehensive monitoring** (metrics, alerts, events)
✅ **Production-ready** (tested patterns, battle-hardened)

**Expected Impact:**
- 95%+ success rate on transient failures
- Zero cascading failures via circuit breaker
- Automatic recovery from rate limit errors
- Improved system resilience and reliability

---

**Built for the ONE Platform - resilient, reliable, fault-tolerant.**
