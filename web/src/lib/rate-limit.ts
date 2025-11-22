/**
 * Rate Limiting Infrastructure
 *
 * Cycle 7: Better Auth Roadmap - Basic Rate Limiting Implementation
 *
 * Features:
 * - In-memory rate limit tracking (Cycle 7 - basic implementation)
 * - Exponential backoff calculations
 * - Rate limit response headers (X-RateLimit-*)
 * - Helper functions for checking and updating limits
 *
 * Future: Will be migrated to Convex database for production (Phase 1, Cycle 8)
 */

import { getRateLimitConfig, type RateLimitConfig } from "./rate-limit-config";

/**
 * Rate limit attempt record
 */
export interface RateLimitAttempt {
  /**
   * Unique identifier (IP address or user ID)
   */
  identifier: string;

  /**
   * Endpoint being rate limited
   */
  endpoint: string;

  /**
   * Number of attempts in current window
   */
  attempts: number;

  /**
   * Window start timestamp
   */
  windowStart: number;

  /**
   * Number of consecutive failures (for exponential backoff)
   */
  consecutiveFailures: number;

  /**
   * Timestamp when rate limit will reset
   */
  resetAt: number;
}

/**
 * In-memory rate limit store (Cycle 7 - basic implementation)
 * TODO: Migrate to Convex database in Cycle 8
 */
const rateLimitStore = new Map<string, RateLimitAttempt>();

/**
 * Generate a unique key for rate limit tracking
 */
function getRateLimitKey(endpoint: string, identifier: string): string {
  return `${endpoint}:${identifier}`;
}

/**
 * Calculate exponential backoff delay
 *
 * @param failures - Number of consecutive failures
 * @param config - Rate limit configuration
 * @returns Delay in milliseconds
 */
export function calculateBackoff(
  failures: number,
  config: RateLimitConfig
): number {
  const baseDelay = config.windowMs / config.maxAttempts;
  const delay = baseDelay * Math.pow(config.backoffMultiplier, failures);
  return Math.min(delay, config.maxBackoffMs);
}

/**
 * Check if request is rate limited
 *
 * @param endpoint - Endpoint name (e.g., 'signIn', 'signUp')
 * @param identifier - IP address or user identifier
 * @returns Rate limit check result
 */
export function checkRateLimit(
  endpoint: string,
  identifier: string
): RateLimitCheckResult {
  const config = getRateLimitConfig(endpoint);
  const key = getRateLimitKey(endpoint, identifier);
  const now = Date.now();

  // Get existing attempt record
  let attempt = rateLimitStore.get(key);

  // Initialize if doesn't exist or window expired
  if (!attempt || now >= attempt.resetAt) {
    attempt = {
      identifier,
      endpoint,
      attempts: 0,
      windowStart: now,
      consecutiveFailures: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, attempt);
  }

  // Check if rate limit exceeded
  const isRateLimited = attempt.attempts >= config.maxAttempts;
  const remainingAttempts = Math.max(
    0,
    config.maxAttempts - attempt.attempts
  );
  const retryAfter = isRateLimited
    ? Math.ceil((attempt.resetAt - now) / 1000)
    : 0;

  return {
    allowed: !isRateLimited,
    limit: config.maxAttempts,
    remaining: remainingAttempts,
    reset: attempt.resetAt,
    retryAfter,
    backoffMs: isRateLimited
      ? calculateBackoff(attempt.consecutiveFailures, config)
      : 0,
  };
}

/**
 * Update rate limit after request
 *
 * @param endpoint - Endpoint name
 * @param identifier - IP address or user identifier
 * @param success - Whether the request succeeded
 */
export function updateRateLimit(
  endpoint: string,
  identifier: string,
  success: boolean
): void {
  const config = getRateLimitConfig(endpoint);
  const key = getRateLimitKey(endpoint, identifier);
  const now = Date.now();

  let attempt = rateLimitStore.get(key);

  if (!attempt || now >= attempt.resetAt) {
    // Initialize new window
    attempt = {
      identifier,
      endpoint,
      attempts: 1,
      windowStart: now,
      consecutiveFailures: success ? 0 : 1,
      resetAt: now + config.windowMs,
    };
  } else {
    // Update existing window
    attempt.attempts += 1;

    if (success) {
      // Reset consecutive failures on success
      attempt.consecutiveFailures = 0;
    } else {
      // Increment consecutive failures for exponential backoff
      attempt.consecutiveFailures += 1;

      // Extend reset time if using exponential backoff
      const backoffDelay = calculateBackoff(
        attempt.consecutiveFailures,
        config
      );
      attempt.resetAt = Math.max(attempt.resetAt, now + backoffDelay);
    }
  }

  rateLimitStore.set(key, attempt);
}

/**
 * Generate rate limit response headers
 *
 * @param result - Rate limit check result
 * @returns Headers object
 */
export function getRateLimitHeaders(
  result: RateLimitCheckResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    ...(result.retryAfter > 0 && {
      "Retry-After": result.retryAfter.toString(),
    }),
  };
}

/**
 * Reset rate limit for an identifier (admin/testing use)
 *
 * @param endpoint - Endpoint name
 * @param identifier - IP address or user identifier
 */
export function resetRateLimit(endpoint: string, identifier: string): void {
  const key = getRateLimitKey(endpoint, identifier);
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (testing use only)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get rate limit status for monitoring/debugging
 *
 * @param endpoint - Endpoint name
 * @param identifier - IP address or user identifier
 * @returns Current rate limit attempt or null
 */
export function getRateLimitStatus(
  endpoint: string,
  identifier: string
): RateLimitAttempt | null {
  const key = getRateLimitKey(endpoint, identifier);
  return rateLimitStore.get(key) || null;
}

/**
 * Rate limit check result
 */
export interface RateLimitCheckResult {
  /**
   * Whether the request is allowed (not rate limited)
   */
  allowed: boolean;

  /**
   * Maximum number of requests allowed in window
   */
  limit: number;

  /**
   * Remaining requests in current window
   */
  remaining: number;

  /**
   * Timestamp when rate limit will reset (Unix timestamp)
   */
  reset: number;

  /**
   * Seconds until rate limit resets (0 if not rate limited)
   */
  retryAfter: number;

  /**
   * Exponential backoff delay in milliseconds (0 if not rate limited)
   */
  backoffMs: number;
}

/**
 * Middleware helper for applying rate limiting
 *
 * Usage in API routes:
 * ```typescript
 * const identifier = request.headers.get('x-forwarded-for') || 'unknown';
 * const rateLimitCheck = checkRateLimit('signIn', identifier);
 *
 * if (!rateLimitCheck.allowed) {
 *   return new Response('Too many requests', {
 *     status: 429,
 *     headers: getRateLimitHeaders(rateLimitCheck)
 *   });
 * }
 *
 * // Process request...
 * const success = await handleSignIn(data);
 *
 * // Update rate limit
 * updateRateLimit('signIn', identifier, success);
 * ```
 */
export function createRateLimitMiddleware(endpoint: string) {
  return {
    check: (identifier: string) => checkRateLimit(endpoint, identifier),
    update: (identifier: string, success: boolean) =>
      updateRateLimit(endpoint, identifier, success),
    getHeaders: (result: RateLimitCheckResult) =>
      getRateLimitHeaders(result),
  };
}

/**
 * Extract client identifier from request
 * Priority: X-Forwarded-For > X-Real-IP > CF-Connecting-IP > fallback
 *
 * @param request - Request object
 * @returns Client IP address or identifier
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfIP = request.headers.get("cf-connecting-ip");

  // X-Forwarded-For can be comma-separated list, take first
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfIP) {
    return cfIP;
  }

  // Fallback (not ideal for production)
  return "unknown";
}

/**
 * Cleanup expired rate limit records (run periodically)
 * Prevents memory leaks in long-running processes
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, attempt] of rateLimitStore.entries()) {
    if (now >= attempt.resetAt) {
      expiredKeys.push(key);
    }
  }

  for (const key of expiredKeys) {
    rateLimitStore.delete(key);
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
}
