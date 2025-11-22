/**
 * Rate Limiting Tests
 *
 * Cycle 7: Better Auth Roadmap - Rate Limiting Infrastructure Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  updateRateLimit,
  calculateBackoff,
  getRateLimitHeaders,
  resetRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
  getClientIdentifier,
  type RateLimitCheckResult,
} from "./rate-limit";
import { getRateLimitConfig } from "./rate-limit-config";

describe("Rate Limiting Infrastructure", () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
  });

  describe("checkRateLimit", () => {
    it("should allow requests within limit", () => {
      const result = checkRateLimit("signIn", "192.168.1.1");

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5); // signIn allows 5 attempts
    });

    it("should block requests after limit exceeded", () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";

      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        updateRateLimit(endpoint, identifier, false);
      }

      // 6th request should be blocked
      const result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("should reset after window expires", async () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";

      // Exhaust attempts
      for (let i = 0; i < 5; i++) {
        updateRateLimit(endpoint, identifier, false);
      }

      // Should be blocked
      let result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(false);

      // Manually reset (simulating window expiry)
      resetRateLimit(endpoint, identifier);

      // Should be allowed again
      result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
    });
  });

  describe("updateRateLimit", () => {
    it("should increment attempts on failure", () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";

      updateRateLimit(endpoint, identifier, false);

      const result = checkRateLimit(endpoint, identifier);
      expect(result.remaining).toBe(4); // 5 - 1 = 4
    });

    it("should reset consecutive failures on success", () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";

      // 3 failures
      updateRateLimit(endpoint, identifier, false);
      updateRateLimit(endpoint, identifier, false);
      updateRateLimit(endpoint, identifier, false);

      let status = getRateLimitStatus(endpoint, identifier);
      expect(status?.consecutiveFailures).toBe(3);

      // Success should reset consecutive failures
      updateRateLimit(endpoint, identifier, true);

      status = getRateLimitStatus(endpoint, identifier);
      expect(status?.consecutiveFailures).toBe(0);
    });

    it("should increment consecutive failures on repeated failures", () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";

      updateRateLimit(endpoint, identifier, false);
      updateRateLimit(endpoint, identifier, false);
      updateRateLimit(endpoint, identifier, false);

      const status = getRateLimitStatus(endpoint, identifier);
      expect(status?.consecutiveFailures).toBe(3);
    });
  });

  describe("calculateBackoff", () => {
    it("should calculate exponential backoff correctly", () => {
      const config = getRateLimitConfig("signIn");

      // First failure: base delay
      const delay1 = calculateBackoff(0, config);
      expect(delay1).toBeGreaterThan(0);

      // Second failure: 2x base delay
      const delay2 = calculateBackoff(1, config);
      expect(delay2).toBeGreaterThan(delay1);

      // Third failure: 4x base delay
      const delay3 = calculateBackoff(2, config);
      expect(delay3).toBeGreaterThan(delay2);
    });

    it("should cap backoff at maxBackoffMs", () => {
      const config = getRateLimitConfig("signIn");

      // Many failures should cap at maxBackoffMs
      const delay = calculateBackoff(100, config);
      expect(delay).toBe(config.maxBackoffMs);
    });
  });

  describe("getRateLimitHeaders", () => {
    it("should generate correct headers", () => {
      const result: RateLimitCheckResult = {
        allowed: true,
        limit: 5,
        remaining: 3,
        reset: Date.now() + 60000,
        retryAfter: 0,
        backoffMs: 0,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers["X-RateLimit-Limit"]).toBe("5");
      expect(headers["X-RateLimit-Remaining"]).toBe("3");
      expect(headers["X-RateLimit-Reset"]).toBeDefined();
      expect(headers["Retry-After"]).toBeUndefined(); // Not rate limited
    });

    it("should include Retry-After when rate limited", () => {
      const result: RateLimitCheckResult = {
        allowed: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 60,
        backoffMs: 60000,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers["Retry-After"]).toBe("60");
    });
  });

  describe("getClientIdentifier", () => {
    it("should extract IP from X-Forwarded-For", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("192.168.1.1");
    });

    it("should extract IP from X-Real-IP", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-real-ip": "192.168.1.1",
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("192.168.1.1");
    });

    it("should extract IP from CF-Connecting-IP (Cloudflare)", () => {
      const request = new Request("https://example.com", {
        headers: {
          "cf-connecting-ip": "192.168.1.1",
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("192.168.1.1");
    });

    it("should fallback to 'unknown' if no IP headers", () => {
      const request = new Request("https://example.com");

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("unknown");
    });

    it("should prioritize X-Forwarded-For over others", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
          "x-real-ip": "10.0.0.1",
          "cf-connecting-ip": "172.16.0.1",
        },
      });

      const identifier = getClientIdentifier(request);
      expect(identifier).toBe("192.168.1.1");
    });
  });

  describe("resetRateLimit", () => {
    it("should clear rate limit for specific identifier", () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";

      // Exhaust attempts
      for (let i = 0; i < 5; i++) {
        updateRateLimit(endpoint, identifier, false);
      }

      // Should be blocked
      let result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(false);

      // Reset
      resetRateLimit(endpoint, identifier);

      // Should be allowed
      result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(true);
    });
  });

  describe("Integration: Full flow", () => {
    it("should handle typical auth flow with failures and success", () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";

      // First attempt: failure
      let result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
      updateRateLimit(endpoint, identifier, false);

      // Second attempt: failure
      result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      updateRateLimit(endpoint, identifier, false);

      // Third attempt: success
      result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
      updateRateLimit(endpoint, identifier, true);

      // Consecutive failures should be reset
      const status = getRateLimitStatus(endpoint, identifier);
      expect(status?.consecutiveFailures).toBe(0);
    });

    it("should enforce exponential backoff on repeated failures", () => {
      const identifier = "192.168.1.1";
      const endpoint = "signIn";
      const config = getRateLimitConfig(endpoint);

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        updateRateLimit(endpoint, identifier, false);
      }

      // Should be rate limited
      const result = checkRateLimit(endpoint, identifier);
      expect(result.allowed).toBe(false);

      // Should have exponential backoff calculated
      const status = getRateLimitStatus(endpoint, identifier);
      const backoff = calculateBackoff(status!.consecutiveFailures, config);
      expect(backoff).toBeGreaterThan(config.windowMs);
    });
  });
});
