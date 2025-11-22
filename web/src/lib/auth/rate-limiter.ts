/**
 * Rate Limiter for Auth Endpoints
 *
 * Implements rate limiting to prevent brute force attacks and abuse.
 * Uses in-memory storage with automatic cleanup.
 *
 * Rate limits:
 * - Sign in: 5 attempts per 15 minutes per IP
 * - Sign up: 3 attempts per hour per IP
 * - Password reset: 3 requests per hour per email
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number;
}

class RateLimiter {
	private storage = new Map<string, RateLimitEntry>();
	private cleanupInterval: NodeJS.Timeout | null = null;

	constructor() {
		// Clean up expired entries every 5 minutes
		this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
	}

	/**
	 * Check if a request should be rate limited
	 * @param key - Unique identifier (IP address, email, etc.)
	 * @param config - Rate limit configuration
	 * @returns Object with allowed status and retry info
	 */
	check(
		key: string,
		config: RateLimitConfig
	): {
		allowed: boolean;
		remaining: number;
		resetAt: number;
		retryAfter?: number;
	} {
		const now = Date.now();
		const entry = this.storage.get(key);

		// No previous attempts or window expired
		if (!entry || now >= entry.resetAt) {
			this.storage.set(key, {
				count: 1,
				resetAt: now + config.windowMs,
			});

			return {
				allowed: true,
				remaining: config.maxAttempts - 1,
				resetAt: now + config.windowMs,
			};
		}

		// Within rate limit window
		if (entry.count < config.maxAttempts) {
			entry.count++;
			this.storage.set(key, entry);

			return {
				allowed: true,
				remaining: config.maxAttempts - entry.count,
				resetAt: entry.resetAt,
			};
		}

		// Rate limit exceeded
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt,
			retryAfter: Math.ceil((entry.resetAt - now) / 1000), // seconds
		};
	}

	/**
	 * Reset rate limit for a specific key
	 */
	reset(key: string): void {
		this.storage.delete(key);
	}

	/**
	 * Clean up expired entries
	 */
	private cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.storage.entries()) {
			if (now >= entry.resetAt) {
				this.storage.delete(key);
			}
		}
	}

	/**
	 * Destroy the rate limiter and clear cleanup interval
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
		this.storage.clear();
	}
}

// Rate limit configurations
export const RATE_LIMITS = {
	SIGN_IN: {
		maxAttempts: 5,
		windowMs: 15 * 60 * 1000, // 15 minutes
		message: "Too many sign-in attempts. Please try again in 15 minutes.",
	},
	SIGN_UP: {
		maxAttempts: 3,
		windowMs: 60 * 60 * 1000, // 1 hour
		message: "Too many sign-up attempts. Please try again in 1 hour.",
	},
	PASSWORD_RESET: {
		maxAttempts: 3,
		windowMs: 60 * 60 * 1000, // 1 hour
		message: "Too many password reset requests. Please try again in 1 hour.",
	},
} as const;

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
	// Check common headers for IP (CloudFlare, nginx, etc.)
	const headers = request.headers;

	return (
		headers.get("cf-connecting-ip") ||
		headers.get("x-real-ip") ||
		headers.get("x-forwarded-for")?.split(",")[0] ||
		"unknown"
	);
}

/**
 * Format retry time message
 */
function formatRetryTime(seconds: number): string {
	if (seconds < 60) {
		return `${seconds} seconds`;
	}
	const minutes = Math.ceil(seconds / 60);
	if (minutes < 60) {
		return `${minutes} minute${minutes > 1 ? "s" : ""}`;
	}
	const hours = Math.ceil(minutes / 60);
	return `${hours} hour${hours > 1 ? "s" : ""}`;
}

/**
 * Check rate limit and return appropriate response if exceeded
 */
export function checkRateLimit(
	key: string,
	type: keyof typeof RATE_LIMITS
): { allowed: boolean; response?: Response; resetAt: number } {
	const config = RATE_LIMITS[type];
	const result = rateLimiter.check(key, config);

	if (!result.allowed) {
		const retryTimeFormatted = formatRetryTime(result.retryAfter || 0);

		return {
			allowed: false,
			resetAt: result.resetAt,
			response: new Response(
				JSON.stringify({
					error: config.message,
					retryAfter: result.retryAfter,
					retryAfterFormatted: retryTimeFormatted,
					resetAt: new Date(result.resetAt).toISOString(),
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": String(result.retryAfter),
						"X-RateLimit-Limit": String(config.maxAttempts),
						"X-RateLimit-Remaining": "0",
						"X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
					},
				}
			),
		};
	}

	return {
		allowed: true,
		resetAt: result.resetAt,
	};
}

/**
 * Reset rate limit for a key (useful after successful auth)
 */
export function resetRateLimit(key: string): void {
	rateLimiter.reset(key);
}

export default rateLimiter;
