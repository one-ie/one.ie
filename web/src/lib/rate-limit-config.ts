/**
 * Rate Limiting Configuration
 *
 * Cycle 7: Better Auth Roadmap - Basic Rate Limiting Infrastructure
 *
 * This file defines rate limit thresholds and configuration for authentication endpoints.
 * Based on Cycle 6 strategy: Identify endpoints, define thresholds, document approach.
 */

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxAttempts: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Exponential backoff multiplier (e.g., 2 = doubles wait time each failure)
   */
  backoffMultiplier: number;

  /**
   * Maximum backoff time in milliseconds (cap for exponential backoff)
   */
  maxBackoffMs: number;

  /**
   * Whether to apply rate limiting per IP address
   */
  perIP: boolean;

  /**
   * Whether to apply rate limiting per user (requires authentication)
   */
  perUser: boolean;
}

/**
 * Rate Limit Configurations by Endpoint
 *
 * Based on OWASP recommendations and Better Auth best practices
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Sign In - Prevent credential stuffing and brute force attacks
  signIn: {
    maxAttempts: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    backoffMultiplier: 2, // 2x delay each failure
    maxBackoffMs: 60 * 60 * 1000, // cap at 1 hour
    perIP: true,
    perUser: true, // Also limit per email attempt
  },

  // Sign Up - Prevent account enumeration and spam
  signUp: {
    maxAttempts: 3, // 3 attempts
    windowMs: 60 * 60 * 1000, // per hour
    backoffMultiplier: 2,
    maxBackoffMs: 24 * 60 * 60 * 1000, // cap at 24 hours
    perIP: true,
    perUser: false, // No user context yet
  },

  // Password Reset Request - Prevent enumeration and email spam
  passwordResetRequest: {
    maxAttempts: 3, // 3 requests
    windowMs: 60 * 60 * 1000, // per hour
    backoffMultiplier: 2,
    maxBackoffMs: 24 * 60 * 60 * 1000, // cap at 24 hours
    perIP: true,
    perUser: true, // Per email address
  },

  // Password Reset Confirm - Prevent token guessing
  passwordResetConfirm: {
    maxAttempts: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    backoffMultiplier: 2,
    maxBackoffMs: 60 * 60 * 1000, // cap at 1 hour
    perIP: true,
    perUser: false, // Token-based, no user context
  },

  // Email Verification - Prevent spam
  emailVerification: {
    maxAttempts: 10, // 10 attempts (more lenient)
    windowMs: 60 * 60 * 1000, // per hour
    backoffMultiplier: 1.5,
    maxBackoffMs: 2 * 60 * 60 * 1000, // cap at 2 hours
    perIP: true,
    perUser: true,
  },

  // Magic Link Request - Prevent email spam
  magicLinkRequest: {
    maxAttempts: 3, // 3 requests
    windowMs: 60 * 60 * 1000, // per hour
    backoffMultiplier: 2,
    maxBackoffMs: 24 * 60 * 60 * 1000, // cap at 24 hours
    perIP: true,
    perUser: true,
  },

  // 2FA Verification - Prevent TOTP brute force
  twoFactorVerification: {
    maxAttempts: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    backoffMultiplier: 2,
    maxBackoffMs: 60 * 60 * 1000, // cap at 1 hour
    perIP: true,
    perUser: true,
  },

  // OAuth Callback - Prevent abuse
  oauthCallback: {
    maxAttempts: 10, // 10 attempts (more lenient for redirects)
    windowMs: 15 * 60 * 1000, // per 15 minutes
    backoffMultiplier: 1.5,
    maxBackoffMs: 60 * 60 * 1000, // cap at 1 hour
    perIP: true,
    perUser: false,
  },

  // API endpoints - General rate limiting
  api: {
    maxAttempts: 100, // 100 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    backoffMultiplier: 1.2,
    maxBackoffMs: 60 * 60 * 1000, // cap at 1 hour
    perIP: true,
    perUser: true,
  },
};

/**
 * Default rate limit configuration (fallback)
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  backoffMultiplier: 2,
  maxBackoffMs: 60 * 60 * 1000, // 1 hour
  perIP: true,
  perUser: false,
};

/**
 * Get rate limit configuration for an endpoint
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  return RATE_LIMIT_CONFIGS[endpoint] || DEFAULT_RATE_LIMIT;
}
