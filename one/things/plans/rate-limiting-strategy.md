---
title: Rate Limiting Strategy - Better Auth
dimension: things
category: plans
tags: auth, better-auth, security, rate-limiting, convex
related_dimensions: events, knowledge, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
session_id: 01QMzqbMmdUc4fQx4zL1AEDT
ai_context: |
  This document is part of the things dimension in the plans category.
  Location: one/things/plans/rate-limiting-strategy.md
  Purpose: Comprehensive rate limiting strategy for Better Auth
  Related dimensions: events, knowledge, people
  For AI agents: Read this to understand the rate limiting implementation strategy.
---

# Rate Limiting Strategy - Better Auth

**Status:** Design Complete
**Session ID:** 01QMzqbMmdUc4fQx4zL1AEDT
**Branch:** `claude/better-auth-roadmap-01QMzqbMmdUc4fQx4zL1AEDT`
**Cycle:** 6/100

## Overview

This document defines the complete rate limiting strategy for the Better Auth implementation, protecting authentication endpoints from abuse while maintaining excellent user experience.

**Design Principles:**
1. **Defense in Depth** - Multiple layers (IP, user, endpoint, sliding windows)
2. **Ontology-Aligned** - Uses events dimension for logging, things for tracking
3. **Progressive Penalties** - Exponential backoff for repeated violations
4. **User-Friendly** - Clear error messages, rate limit headers
5. **Performance-First** - In-memory with database persistence

---

## 1. Auth Endpoints Requiring Rate Limiting

### Critical Endpoints (High Priority)

#### 1.1 Sign In (`/api/auth/sign-in`)
**Risk:** Brute force password attacks, credential stuffing
**Impact:** Account compromise, unauthorized access
**Priority:** CRITICAL

```typescript
Endpoint: POST /api/auth/sign-in
Method: signIn({ email, password })
Threats:
  - Brute force password guessing
  - Credential stuffing attacks
  - Account enumeration
  - Distributed attacks via botnets
```

#### 1.2 Sign Up (`/api/auth/sign-up`)
**Risk:** Spam registrations, resource exhaustion
**Impact:** Database bloat, email quota abuse
**Priority:** CRITICAL

```typescript
Endpoint: POST /api/auth/sign-up
Method: signUp({ email, password, name })
Threats:
  - Spam bot registrations
  - Email verification abuse
  - Database resource exhaustion
  - Welcome email quota abuse
```

#### 1.3 Password Reset Request (`/api/auth/forget-password`)
**Risk:** Email flooding, DoS attacks
**Impact:** Email quota exhaustion, user harassment
**Priority:** HIGH

```typescript
Endpoint: POST /api/auth/forget-password
Method: forgetPassword({ email })
Threats:
  - Email flooding attacks
  - Password reset token enumeration
  - User harassment via reset emails
  - Email service quota abuse
```

#### 1.4 Password Reset Verification (`/api/auth/reset-password`)
**Risk:** Token brute forcing
**Impact:** Unauthorized password changes
**Priority:** HIGH

```typescript
Endpoint: POST /api/auth/reset-password
Method: resetPassword({ token, password })
Threats:
  - Reset token brute forcing
  - Timing attacks on token validation
  - Race conditions on token usage
```

#### 1.5 Email Verification (`/api/auth/verify-email`)
**Risk:** Verification token enumeration
**Impact:** Account activation abuse
**Priority:** MEDIUM

```typescript
Endpoint: POST /api/auth/verify-email
Method: verifyEmail({ token })
Threats:
  - Verification token brute forcing
  - Email verification bypass attempts
  - Account activation abuse
```

#### 1.6 Magic Link Request (`/api/auth/send-magic-link`)
**Risk:** Email flooding
**Impact:** Email quota abuse
**Priority:** HIGH

```typescript
Endpoint: POST /api/auth/send-magic-link
Method: sendMagicLink({ email })
Threats:
  - Magic link email flooding
  - User harassment
  - Email service abuse
```

### Secondary Endpoints (Medium Priority)

#### 1.7 2FA Setup (`/api/auth/two-factor/setup`)
**Risk:** Multiple 2FA setup attempts
**Impact:** QR code generation resource usage
**Priority:** MEDIUM

#### 1.8 2FA Verification (`/api/auth/two-factor/verify`)
**Risk:** TOTP code brute forcing
**Impact:** 2FA bypass
**Priority:** HIGH

#### 1.9 OAuth Callback (`/api/auth/callback/[provider]`)
**Risk:** OAuth state manipulation
**Impact:** Account takeover
**Priority:** MEDIUM

#### 1.10 Session Refresh (`/api/auth/session/refresh`)
**Risk:** Session enumeration
**Impact:** Unauthorized access
**Priority:** LOW

---

## 2. Rate Limit Thresholds

### 2.1 Per-IP Address Limits (Global)

**Purpose:** Prevent distributed attacks, protect infrastructure

```typescript
IP_RATE_LIMITS = {
  // Authentication attempts
  signIn: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour
    message: "Too many login attempts from this IP. Try again in 1 hour."
  },

  signUp: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    message: "Too many sign-up attempts from this IP. Try again tomorrow."
  },

  passwordResetRequest: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
    message: "Too many password reset requests. Try again in 2 hours."
  },

  passwordResetVerify: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 60 * 60 * 1000, // 1 hour
    message: "Too many password reset attempts. Try again in 1 hour."
  },

  magicLinkRequest: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
    message: "Too many magic link requests. Try again in 2 hours."
  },

  emailVerification: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
    message: "Too many verification attempts. Try again in 1 hour."
  },

  twoFactorVerify: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
    message: "Too many 2FA verification attempts. Try again in 30 minutes."
  }
}
```

### 2.2 Per-User Limits (Account-Specific)

**Purpose:** Protect individual accounts from targeted attacks

```typescript
USER_RATE_LIMITS = {
  // Failed login attempts before account lockout
  failedSignIn: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    requireEmailVerification: true, // Must verify email to unlock
    message: "Account temporarily locked due to multiple failed login attempts. Check your email for unlock instructions."
  },

  // Password reset requests per user
  passwordResetRequest: {
    maxAttempts: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    cooldownMs: 10 * 60 * 1000, // 10 minutes between requests
    message: "Maximum password reset requests reached. Try again tomorrow."
  },

  // Magic link requests per user
  magicLinkRequest: {
    maxAttempts: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    cooldownMs: 5 * 60 * 1000, // 5 minutes between requests
    message: "Maximum magic link requests reached. Try again tomorrow."
  },

  // Email verification resends
  emailVerificationResend: {
    maxAttempts: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    cooldownMs: 15 * 60 * 1000, // 15 minutes between resends
    message: "Maximum verification email resends reached."
  }
}
```

### 2.3 Global Endpoint Limits (System-Wide)

**Purpose:** Protect infrastructure from coordinated attacks

```typescript
GLOBAL_ENDPOINT_LIMITS = {
  // System-wide auth endpoint limits (across all IPs/users)
  allAuthEndpoints: {
    maxRequestsPerSecond: 100, // 100 req/s
    maxRequestsPerMinute: 1000, // 1000 req/min
    burstLimit: 200, // Allow bursts up to 200 requests
    circuitBreakerThreshold: 5000, // Circuit breaker at 5000 req/min
    message: "Authentication service temporarily unavailable. Please try again in a few minutes."
  }
}
```

### 2.4 Exponential Backoff Strategy

**Purpose:** Progressive penalties for repeat offenders

```typescript
EXPONENTIAL_BACKOFF = {
  // Multiplier applied to block duration after each violation
  multiplier: 2,

  // Maximum block duration (7 days)
  maxBlockDurationMs: 7 * 24 * 60 * 60 * 1000,

  // Reset violation count after this period of good behavior
  violationResetMs: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Example progression for signIn violations:
  // 1st violation: 1 hour block
  // 2nd violation: 2 hours block
  // 3rd violation: 4 hours block
  // 4th violation: 8 hours block
  // 5th violation: 16 hours block
  // 6th+ violation: 7 days block (max)
}
```

### 2.5 Sliding Window Algorithm

**Purpose:** More accurate rate limiting than fixed windows

```typescript
SLIDING_WINDOW_CONFIG = {
  // Use sliding window for all rate limits (not fixed window)
  algorithm: "sliding_window",

  // Sub-window size for sliding window approximation
  subWindowMs: 1000, // 1 second sub-windows

  // Example: For 15-minute window with 5 max attempts:
  // - Window divided into 900 sub-windows (1 second each)
  // - Track exact timestamps of attempts
  // - Count attempts in last 900 seconds
  // - More accurate than fixed 15-minute buckets
}
```

---

## 3. Implementation Architecture

### 3.1 Storage Mechanism

**Three-Tier Approach:**

#### Tier 1: In-Memory Cache (Primary)
```typescript
// Fast lookups, no database round-trips
// Use Map<string, RateLimitRecord> for each endpoint

interface RateLimitRecord {
  attempts: number;
  windowStart: number;
  violations: number;
  lastViolation?: number;
  blockedUntil?: number;
  attemptTimestamps: number[]; // For sliding window
}

// Example: In-memory store
const inMemoryStore = new Map<string, RateLimitRecord>();

// Key format: `${endpoint}:${identifier}`
// Examples:
//   "signIn:ip:192.168.1.1"
//   "signIn:user:user_123"
//   "passwordReset:ip:10.0.0.5"
```

**Pros:**
- Ultra-fast lookups (O(1))
- No database load
- Sub-millisecond response times

**Cons:**
- Lost on server restart
- Not shared across multiple instances

#### Tier 2: Convex Database (Persistent)
```typescript
// Persistent storage for rate limit violations
// Synced periodically from in-memory cache

// Add to schema.ts
rateLimits: defineTable({
  endpoint: v.string(),
  identifier: v.string(), // IP address or user ID
  identifierType: v.union(v.literal("ip"), v.literal("user")),
  attempts: v.number(),
  windowStart: v.number(),
  violations: v.number(),
  lastViolation: v.optional(v.number()),
  blockedUntil: v.optional(v.number()),
  attemptTimestamps: v.array(v.number()),
  metadata: v.optional(v.any()),
  createdAt: v.number(),
  updatedAt: v.number()
})
  .index("by_endpoint_identifier", ["endpoint", "identifier"])
  .index("by_identifier", ["identifier"])
  .index("by_blocked_until", ["blockedUntil"])
```

**Sync Strategy:**
- Write to database on BLOCK (violations)
- Write to database every 5 minutes (checkpoint)
- Read from database on server start (hydrate in-memory)
- Read from database on cache miss (fallback)

**Pros:**
- Survives server restarts
- Can query violation history
- Audit trail for security analysis

**Cons:**
- Slower than in-memory (10-50ms latency)
- Database write overhead

#### Tier 3: Redis (Optional - For Multi-Instance)
```typescript
// Only needed for horizontal scaling with multiple Convex instances
// Better Auth on Convex typically runs single-instance

// Redis key format: `ratelimit:${endpoint}:${identifier}`
// TTL: Set to window duration + block duration
```

**Decision:** Skip Redis unless horizontal scaling is required (Cycle 50+)

### 3.2 Rate Limiting Flow

```typescript
// Middleware pattern for all auth endpoints
export async function checkRateLimit(
  ctx: Context,
  endpoint: string,
  identifier: string,
  identifierType: "ip" | "user"
): Promise<RateLimitResult> {

  // 1. Get rate limit config for endpoint
  const config = IP_RATE_LIMITS[endpoint];
  if (!config) return { allowed: true };

  // 2. Check in-memory cache first
  const key = `${endpoint}:${identifierType}:${identifier}`;
  let record = inMemoryStore.get(key);

  // 3. If not in memory, check database (fallback)
  if (!record) {
    const dbRecord = await ctx.db
      .query("rateLimits")
      .withIndex("by_endpoint_identifier", q =>
        q.eq("endpoint", endpoint).eq("identifier", identifier)
      )
      .first();

    if (dbRecord) {
      record = {
        attempts: dbRecord.attempts,
        windowStart: dbRecord.windowStart,
        violations: dbRecord.violations,
        lastViolation: dbRecord.lastViolation,
        blockedUntil: dbRecord.blockedUntil,
        attemptTimestamps: dbRecord.attemptTimestamps
      };
      inMemoryStore.set(key, record);
    } else {
      record = {
        attempts: 0,
        windowStart: Date.now(),
        violations: 0,
        attemptTimestamps: []
      };
      inMemoryStore.set(key, record);
    }
  }

  const now = Date.now();

  // 4. Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const remainingMs = record.blockedUntil - now;
    return {
      allowed: false,
      blocked: true,
      remainingMs,
      retryAfter: Math.ceil(remainingMs / 1000),
      message: config.message
    };
  }

  // 5. Check sliding window
  const windowStart = now - config.windowMs;
  const recentAttempts = record.attemptTimestamps.filter(
    timestamp => timestamp > windowStart
  );

  // 6. Check if limit exceeded
  if (recentAttempts.length >= config.maxAttempts) {
    // VIOLATION: Apply block
    const blockDuration = calculateBlockDuration(
      config.blockDurationMs,
      record.violations
    );

    record.violations += 1;
    record.lastViolation = now;
    record.blockedUntil = now + blockDuration;

    // Persist violation to database
    await persistRateLimit(ctx, endpoint, identifier, identifierType, record);

    // Log event (audit trail)
    await ctx.db.insert("events", {
      type: "rate_limit_exceeded",
      actorId: identifierType === "user" ? identifier : undefined,
      timestamp: now,
      metadata: {
        endpoint,
        identifier,
        identifierType,
        violations: record.violations,
        blockDurationMs: blockDuration,
        blockedUntil: record.blockedUntil
      }
    });

    return {
      allowed: false,
      blocked: true,
      remainingMs: blockDuration,
      retryAfter: Math.ceil(blockDuration / 1000),
      message: config.message
    };
  }

  // 7. ALLOWED: Record attempt
  record.attemptTimestamps.push(now);

  // Keep only recent attempts (sliding window)
  record.attemptTimestamps = record.attemptTimestamps.filter(
    timestamp => timestamp > windowStart
  );

  inMemoryStore.set(key, record);

  return {
    allowed: true,
    remaining: config.maxAttempts - record.attemptTimestamps.length,
    resetAt: windowStart + config.windowMs
  };
}

// Calculate block duration with exponential backoff
function calculateBlockDuration(
  baseDuration: number,
  violations: number
): number {
  const duration = baseDuration * Math.pow(EXPONENTIAL_BACKOFF.multiplier, violations);
  return Math.min(duration, EXPONENTIAL_BACKOFF.maxBlockDurationMs);
}

// Persist to database
async function persistRateLimit(
  ctx: Context,
  endpoint: string,
  identifier: string,
  identifierType: "ip" | "user",
  record: RateLimitRecord
) {
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_endpoint_identifier", q =>
      q.eq("endpoint", endpoint).eq("identifier", identifier)
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      attempts: record.attempts,
      windowStart: record.windowStart,
      violations: record.violations,
      lastViolation: record.lastViolation,
      blockedUntil: record.blockedUntil,
      attemptTimestamps: record.attemptTimestamps,
      updatedAt: Date.now()
    });
  } else {
    await ctx.db.insert("rateLimits", {
      endpoint,
      identifier,
      identifierType,
      attempts: record.attempts,
      windowStart: record.windowStart,
      violations: record.violations,
      lastViolation: record.lastViolation,
      blockedUntil: record.blockedUntil,
      attemptTimestamps: record.attemptTimestamps,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
}
```

### 3.3 Integration with Better Auth

```typescript
// Add rate limiting to Better Auth hooks
import { betterAuth } from "better-auth";
import { checkRateLimit } from "./rate-limit";

export const auth = betterAuth({
  database: convexAdapter,

  hooks: {
    before: {
      // Sign in rate limiting
      signIn: async (ctx) => {
        const ip = ctx.request.headers.get("x-forwarded-for") || "unknown";
        const email = ctx.body.email;

        // Check IP-based rate limit
        const ipResult = await checkRateLimit(ctx, "signIn", ip, "ip");
        if (!ipResult.allowed) {
          throw new Error(ipResult.message);
        }

        // Check user-based rate limit (if user exists)
        if (email) {
          const user = await ctx.db.query("user")
            .withIndex("by_email", q => q.eq("email", email))
            .first();

          if (user) {
            const userResult = await checkRateLimit(
              ctx,
              "signIn",
              user._id,
              "user"
            );
            if (!userResult.allowed) {
              throw new Error(userResult.message);
            }
          }
        }

        return ctx;
      },

      // Similar hooks for other endpoints...
      signUp: async (ctx) => { /* ... */ },
      forgetPassword: async (ctx) => { /* ... */ },
      resetPassword: async (ctx) => { /* ... */ },
      sendMagicLink: async (ctx) => { /* ... */ }
    },

    after: {
      // Reset rate limit on successful sign in
      signIn: async (ctx, result) => {
        if (result.user) {
          // Clear failed login attempts for this user
          await clearRateLimit(ctx, "signIn", result.user._id, "user");
        }
        return result;
      }
    }
  }
});
```

### 3.4 Rate Limit Headers

**Return standard rate limit headers in all responses:**

```typescript
HTTP/1.1 200 OK
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1700000000
Retry-After: 900

// Or when blocked:
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700003600
Retry-After: 3600
Content-Type: application/json

{
  "error": "Too many login attempts from this IP. Try again in 1 hour.",
  "retryAfter": 3600,
  "resetAt": 1700003600
}
```

**Implementation:**

```typescript
export function setRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));

  if (result.resetAt) {
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.floor(result.resetAt / 1000))
    );
  }

  if (result.blocked && result.retryAfter) {
    response.headers.set("Retry-After", String(result.retryAfter));
  }

  return response;
}
```

---

## 4. Ontology Mapping

### 4.1 Events Dimension (Audit Trail)

**Log all rate limit violations:**

```typescript
// Event type: rate_limit_exceeded
{
  type: "rate_limit_exceeded",
  actorId: "user_123" | undefined, // If user-based
  targetId: undefined,
  timestamp: Date.now(),
  metadata: {
    endpoint: "signIn",
    identifier: "192.168.1.1",
    identifierType: "ip",
    violations: 3,
    blockDurationMs: 14400000, // 4 hours
    blockedUntil: 1700003600000,
    attemptCount: 5,
    windowMs: 900000, // 15 minutes
    protocol: "rate_limiting"
  }
}

// Event type: rate_limit_reset
{
  type: "rate_limit_reset",
  actorId: "user_123",
  targetId: undefined,
  timestamp: Date.now(),
  metadata: {
    endpoint: "signIn",
    identifier: "user_123",
    identifierType: "user",
    reason: "successful_authentication",
    previousViolations: 2,
    protocol: "rate_limiting"
  }
}
```

### 4.2 Things Dimension (Rate Limit Records)

**Track rate limit state as things:**

```typescript
// While technically stored in rateLimits table,
// conceptually these are "rate_limit_record" things

{
  _id: "ratelimit_abc123",
  type: "rate_limit_record",
  name: "Sign In Rate Limit - IP 192.168.1.1",
  organizationId: undefined, // Global platform thing
  properties: {
    endpoint: "signIn",
    identifier: "192.168.1.1",
    identifierType: "ip",
    attempts: 5,
    violations: 2,
    blockedUntil: 1700003600000,
    config: {
      maxAttempts: 5,
      windowMs: 900000,
      blockDurationMs: 3600000
    }
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now()
}
```

### 4.3 Knowledge Dimension (Security Patterns)

**Label rate limit violations for analysis:**

```typescript
// Add labels to rate limit events for ML analysis
{
  knowledgeType: "label",
  text: "rate_limit_violation",
  sourceThingId: "ratelimit_abc123",
  labels: [
    "security",
    "authentication",
    "brute_force_attempt",
    "ip_192.168.1.1",
    "endpoint_signIn"
  ],
  createdAt: Date.now()
}

// Use for:
// - Detecting coordinated attacks (multiple IPs, same pattern)
// - Identifying false positives (legitimate users blocked)
// - Security analytics dashboard
// - ML-based threat detection
```

---

## 5. Advanced Features

### 5.1 Allowlist / Blocklist

```typescript
// Permanent allowlist (bypass rate limits)
ALLOWLIST = {
  ips: [
    "127.0.0.1", // Localhost
    "10.0.0.0/8", // Internal network
    // Add trusted IPs (monitoring services, etc.)
  ],
  users: [
    "platform_owner_user_123" // Platform owners
  ]
}

// Permanent blocklist (always blocked)
BLOCKLIST = {
  ips: [
    // Known malicious IPs
    // Updated from threat intelligence feeds
  ],
  users: [
    // Permanently banned users
  ]
}

// Check before rate limiting
async function checkAllowBlockList(
  identifier: string,
  identifierType: "ip" | "user"
): Promise<"allow" | "block" | "check"> {
  const list = identifierType === "ip" ? ALLOWLIST.ips : ALLOWLIST.users;
  if (list.includes(identifier)) return "allow";

  const blockList = identifierType === "ip" ? BLOCKLIST.ips : BLOCKLIST.users;
  if (blockList.includes(identifier)) return "block";

  return "check"; // Proceed with rate limiting
}
```

### 5.2 Adaptive Rate Limiting

```typescript
// Adjust rate limits based on system load
interface AdaptiveConfig {
  normalLoad: RateLimitConfig;
  highLoad: RateLimitConfig;
  ddosProtection: RateLimitConfig;
}

// Example: Reduce limits during high load
const adaptiveSignIn: AdaptiveConfig = {
  normalLoad: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000
  },
  highLoad: {
    maxAttempts: 3, // Stricter
    windowMs: 15 * 60 * 1000
  },
  ddosProtection: {
    maxAttempts: 1, // Very strict
    windowMs: 15 * 60 * 1000
  }
}

// Monitor system metrics and adjust
async function getActiveConfig(): Promise<RateLimitConfig> {
  const cpuLoad = await getSystemCPU();
  const requestsPerSecond = await getRequestRate();

  if (requestsPerSecond > 500 || cpuLoad > 80) {
    return adaptiveSignIn.ddosProtection;
  } else if (requestsPerSecond > 200 || cpuLoad > 60) {
    return adaptiveSignIn.highLoad;
  } else {
    return adaptiveSignIn.normalLoad;
  }
}
```

### 5.3 Captcha Integration (Cycle 95)

```typescript
// Require CAPTCHA after X failed attempts (before full block)
USER_RATE_LIMITS = {
  failedSignIn: {
    maxAttempts: 10,
    captchaThreshold: 3, // Require CAPTCHA after 3 failures
    windowMs: 60 * 60 * 1000,
    message: "Please complete the CAPTCHA to continue."
  }
}

// In sign-in flow:
if (failedAttempts >= 3 && !captchaToken) {
  return {
    error: "captcha_required",
    message: "Please complete the CAPTCHA to continue."
  };
}
```

### 5.4 Geographic Rate Limiting

```typescript
// Different limits by geographic region
GEO_RATE_LIMITS = {
  // Stricter limits for high-risk regions
  "CN": { // China
    signIn: { maxAttempts: 3, windowMs: 15 * 60 * 1000 }
  },
  "RU": { // Russia
    signIn: { maxAttempts: 3, windowMs: 15 * 60 * 1000 }
  },
  // Default for all other regions
  "DEFAULT": {
    signIn: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }
  }
}

// Get geo from IP
async function getGeoRateLimit(ip: string, endpoint: string) {
  const geo = await geolocateIP(ip);
  return GEO_RATE_LIMITS[geo.country] || GEO_RATE_LIMITS.DEFAULT;
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

```typescript
// Test rate limit logic in isolation
describe("Rate Limiting", () => {
  test("allows requests under limit", async () => {
    const result = await checkRateLimit(ctx, "signIn", "192.168.1.1", "ip");
    expect(result.allowed).toBe(true);
  });

  test("blocks requests over limit", async () => {
    // Make 5 requests (limit)
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(ctx, "signIn", "192.168.1.1", "ip");
    }

    // 6th request should be blocked
    const result = await checkRateLimit(ctx, "signIn", "192.168.1.1", "ip");
    expect(result.allowed).toBe(false);
    expect(result.blocked).toBe(true);
  });

  test("applies exponential backoff", async () => {
    // First violation: 1 hour block
    const duration1 = calculateBlockDuration(3600000, 0);
    expect(duration1).toBe(3600000); // 1 hour

    // Second violation: 2 hour block
    const duration2 = calculateBlockDuration(3600000, 1);
    expect(duration2).toBe(7200000); // 2 hours

    // Third violation: 4 hour block
    const duration3 = calculateBlockDuration(3600000, 2);
    expect(duration3).toBe(14400000); // 4 hours
  });

  test("sliding window counts only recent attempts", async () => {
    const now = Date.now();
    const record: RateLimitRecord = {
      attempts: 0,
      windowStart: now - 20 * 60 * 1000, // 20 minutes ago
      violations: 0,
      attemptTimestamps: [
        now - 20 * 60 * 1000, // Outside 15-minute window
        now - 10 * 60 * 1000, // Inside window
        now - 5 * 60 * 1000,  // Inside window
      ]
    };

    const recentAttempts = countRecentAttempts(record, 15 * 60 * 1000);
    expect(recentAttempts).toBe(2); // Only last 2 counted
  });
});
```

### 6.2 Integration Tests

```typescript
// Test rate limiting with actual auth flows
describe("Auth Rate Limiting Integration", () => {
  test("blocks sign-in after 5 failed attempts", async () => {
    const email = "test@example.com";
    const wrongPassword = "wrongpassword";

    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      const result = await authClient.signIn.email({
        email,
        password: wrongPassword
      });
      expect(result.error).toBeTruthy();
    }

    // 6th attempt should be rate limited
    const result = await authClient.signIn.email({
      email,
      password: wrongPassword
    });

    expect(result.error.message).toContain("Too many login attempts");
  });

  test("successful login resets rate limit", async () => {
    const email = "test@example.com";
    const correctPassword = "correctpassword";

    // Make 3 failed attempts
    for (let i = 0; i < 3; i++) {
      await authClient.signIn.email({
        email,
        password: "wrongpassword"
      });
    }

    // Successful login
    const success = await authClient.signIn.email({
      email,
      password: correctPassword
    });
    expect(success.data).toBeTruthy();

    // Rate limit should be reset - can make more attempts
    const result = await checkRateLimit(ctx, "signIn", email, "user");
    expect(result.remaining).toBe(5); // Full limit restored
  });
});
```

### 6.3 Load Tests

```typescript
// Test rate limiting under load
describe("Rate Limiting Performance", () => {
  test("handles 1000 concurrent requests", async () => {
    const promises = [];

    for (let i = 0; i < 1000; i++) {
      promises.push(
        checkRateLimit(ctx, "signIn", `192.168.1.${i % 255}`, "ip")
      );
    }

    const results = await Promise.all(promises);

    // All should complete in <1s
    // Most should be allowed (different IPs)
    const allowed = results.filter(r => r.allowed).length;
    expect(allowed).toBeGreaterThan(995); // 99.5% allowed
  });

  test("in-memory cache faster than database", async () => {
    // Warm cache
    await checkRateLimit(ctx, "signIn", "192.168.1.1", "ip");

    // Time in-memory lookup
    const start1 = Date.now();
    await checkRateLimit(ctx, "signIn", "192.168.1.1", "ip");
    const memoryTime = Date.now() - start1;

    // Time database lookup (cache miss)
    const start2 = Date.now();
    await checkRateLimit(ctx, "signIn", "10.0.0.1", "ip");
    const dbTime = Date.now() - start2;

    expect(memoryTime).toBeLessThan(5); // <5ms
    expect(dbTime).toBeGreaterThan(memoryTime); // DB slower
  });
});
```

---

## 7. Monitoring & Analytics

### 7.1 Metrics to Track

```typescript
// Track these metrics for security dashboard
METRICS = {
  // Real-time
  activeBlocks: "Number of currently blocked IPs/users",
  requestsPerSecond: "Auth requests per second",
  blockRate: "% of requests blocked",

  // Hourly
  totalViolations: "Total rate limit violations",
  topBlockedIPs: "Most blocked IP addresses",
  topBlockedUsers: "Most blocked user accounts",

  // Daily
  violationTrends: "Rate limit violations over time",
  endpointDistribution: "Violations by endpoint",
  geographicDistribution: "Violations by country",

  // Weekly
  falsePositives: "Legitimate users blocked (estimated)",
  attackPatterns: "Detected attack patterns",
  blockEffectiveness: "% of attacks prevented"
}
```

### 7.2 Security Dashboard

```typescript
// Admin dashboard showing rate limit status
interface RateLimitDashboard {
  // Current status
  currentlyBlocked: {
    ips: number;
    users: number;
    total: number;
  };

  // Recent activity
  last24Hours: {
    violations: number;
    uniqueIPs: number;
    uniqueUsers: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  };

  // Threats
  activeThreat: {
    detected: boolean;
    type: "brute_force" | "ddos" | "credential_stuffing" | null;
    affectedEndpoints: string[];
    requestsPerSecond: number;
  };

  // Configuration
  activeConfig: "normal" | "high_load" | "ddos_protection";
}
```

### 7.3 Alerts

```typescript
// Alert conditions
ALERTS = {
  // Critical: Potential DDoS
  ddosDetected: {
    condition: "requestsPerSecond > 500 for 5 minutes",
    action: "Enable DDoS protection mode, notify platform owners",
    severity: "critical"
  },

  // High: Coordinated attack
  coordinatedAttack: {
    condition: "10+ IPs blocked for same endpoint in 15 minutes",
    action: "Notify security team, review logs",
    severity: "high"
  },

  // Medium: High block rate
  highBlockRate: {
    condition: "Block rate > 10% for 1 hour",
    action: "Review rate limit config, check for false positives",
    severity: "medium"
  },

  // Low: Single user multiple violations
  userMultipleViolations: {
    condition: "User blocked 3+ times in 24 hours",
    action: "Review user account, check for compromise",
    severity: "low"
  }
}
```

---

## 8. User Experience

### 8.1 Error Messages

**Clear, helpful error messages:**

```typescript
// Good error messages
✅ "Too many login attempts. Please try again in 15 minutes."
✅ "Account temporarily locked for security. Check your email to unlock."
✅ "Maximum password reset requests reached. Try again in 2 hours."

// Bad error messages (too technical)
❌ "Rate limit exceeded: signIn:ip:192.168.1.1 blocked until 1700003600"
❌ "Error 429: Too Many Requests"
❌ "RateLimitError: Maximum attempts exceeded"
```

### 8.2 Frontend Handling

```typescript
// Display countdown timer for rate-limited users
export function RateLimitError({ retryAfter }: { retryAfter: number }) {
  const [remaining, setRemaining] = useState(retryAfter);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Too Many Attempts</AlertTitle>
      <AlertDescription>
        Your account has been temporarily locked for security.
        Please try again in {minutes}:{seconds.toString().padStart(2, '0')}.
      </AlertDescription>
    </Alert>
  );
}

// Use in sign-in form
if (error.code === "RATE_LIMIT_EXCEEDED") {
  return <RateLimitError retryAfter={error.retryAfter} />;
}
```

### 8.3 Unlock Mechanisms

```typescript
// Allow users to unlock via email verification
export async function sendUnlockEmail(userId: string) {
  const token = await generateUnlockToken(userId);

  await sendEmail({
    to: user.email,
    subject: "Unlock Your Account",
    template: "account-unlock",
    data: {
      unlockUrl: `https://one.ie/account/unlock?token=${token}`,
      blockReason: "Multiple failed login attempts",
      blockedAt: new Date().toLocaleString(),
      ipAddress: "192.168.1.1" // Show IP for transparency
    }
  });
}

// Unlock endpoint
export const unlockAccount = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    // Verify token
    const userId = await verifyUnlockToken(token);
    if (!userId) throw new Error("Invalid unlock token");

    // Clear rate limit
    await clearRateLimit(ctx, "signIn", userId, "user");

    // Log event
    await ctx.db.insert("events", {
      type: "rate_limit_reset",
      actorId: userId,
      timestamp: Date.now(),
      metadata: {
        reason: "email_verification",
        unlockMethod: "token"
      }
    });

    return { success: true };
  }
});
```

---

## 9. Implementation Phases

### Phase 1: Core Rate Limiting (Cycles 6-7)
- ✅ Design strategy (this document)
- Create rate limit table in schema
- Implement in-memory cache
- Create checkRateLimit() function
- Add database persistence

### Phase 2: Auth Integration (Cycle 8)
- Integrate with Better Auth hooks
- Add rate limiting to all auth endpoints
- Add rate limit headers to responses
- Test with existing auth flows

### Phase 3: Testing (Cycle 9)
- Write unit tests for rate limit logic
- Write integration tests for auth flows
- Load test concurrent requests
- Test exponential backoff
- Test sliding window algorithm

### Phase 4: Monitoring (Phase 7 - Cycles 95-100)
- Create security dashboard
- Add metrics tracking
- Configure alerts
- Build analytics queries

### Phase 5: Advanced Features (Future)
- Allowlist/Blocklist management UI
- Adaptive rate limiting
- Geographic rate limiting
- CAPTCHA integration
- ML-based threat detection

---

## 10. Success Criteria

**Phase 1 (Cycles 6-9):**
- ✅ Rate limiting active on all auth endpoints
- ✅ In-memory cache + database persistence working
- ✅ Exponential backoff applied correctly
- ✅ Sliding window algorithm implemented
- ✅ All tests passing

**Security:**
- ✅ Brute force attacks blocked (5 attempts in 15 min)
- ✅ Account lockout after 10 failed logins
- ✅ Email flooding prevented (3 resets per hour)
- ✅ No false positives for legitimate users

**Performance:**
- ✅ Rate limit check < 5ms (in-memory)
- ✅ Rate limit check < 50ms (database fallback)
- ✅ No impact on auth endpoint latency
- ✅ Handles 1000 req/s without degradation

**User Experience:**
- ✅ Clear error messages
- ✅ Countdown timers shown
- ✅ Email unlock mechanism working
- ✅ Rate limit headers in responses

---

## 11. Lessons Learned & Best Practices

### Anti-Patterns to Avoid

❌ **Fixed time windows** → Use sliding windows for accuracy
❌ **Database-only storage** → Use in-memory cache for performance
❌ **Generic error messages** → Provide specific, helpful messages
❌ **No unlock mechanism** → Always provide email unlock
❌ **Ignoring legitimate traffic** → Implement allowlist for trusted IPs
❌ **Same limits for all endpoints** → Tailor limits to endpoint risk
❌ **No monitoring** → Track violations for security analysis

### Best Practices

✅ **Multi-layered defense** → IP + user + endpoint limits
✅ **Progressive penalties** → Exponential backoff for repeat offenders
✅ **Clear communication** → Tell users why and for how long
✅ **Event logging** → Complete audit trail in events dimension
✅ **Graceful degradation** → Fallback to database if cache fails
✅ **Testing** → Comprehensive unit, integration, and load tests
✅ **Monitoring** → Real-time dashboard and alerting

---

## 12. References

- Better Auth Documentation: https://www.better-auth.com/docs/introduction
- OWASP Rate Limiting: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
- Roadmap: `/one/things/plans/better-auth-roadmap.md`
- Ontology: `/one/knowledge/ontology.md`
- Events: `/one/knowledge/events.md`

---

**Rate limiting is security infrastructure. Do it right from the start.**
