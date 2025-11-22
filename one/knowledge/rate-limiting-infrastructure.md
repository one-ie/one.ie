---
title: Rate Limiting Infrastructure
dimension: knowledge
category: security
tags: rate-limiting, security, auth, cycle-7
related_dimensions: events, things
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: 7
ai_context: |
  This document is part of the knowledge dimension in the security category.
  Location: one/knowledge/rate-limiting-infrastructure.md
  Purpose: Documentation for Cycle 7 rate limiting infrastructure
  Related dimensions: events, things
  For AI agents: Read this to understand rate limiting implementation.
---

# Rate Limiting Infrastructure

**Status:** Implemented (Cycle 7)
**Roadmap:** Better Auth Implementation - Phase 1: Security Foundation
**Session ID:** 01QMzqbMmdUc4fQx4zL1AEDT
**Branch:** `claude/better-auth-roadmap-01QMzqbMmdUc4fQx4zL1AEDT`

## Overview

This document describes the rate limiting infrastructure implemented in Cycle 7 of the Better Auth roadmap. The infrastructure provides basic rate limiting capabilities with exponential backoff to protect authentication endpoints from brute force attacks, credential stuffing, and other abuse.

**Implementation:** Basic in-memory rate limiting (Cycle 7)
**Future:** Migrate to Convex database (Cycle 8)

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────┐
│              Rate Limiting Infrastructure           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Rate Limit Configuration                       │
│     - Endpoint-specific thresholds                 │
│     - Exponential backoff settings                 │
│     - Per-IP and per-user limits                   │
│                                                     │
│  2. Rate Limit Tracking                            │
│     - In-memory store (Map)                        │
│     - Attempt counting                             │
│     - Window management                            │
│     - Consecutive failure tracking                 │
│                                                     │
│  3. Exponential Backoff                            │
│     - Delay calculation                            │
│     - Backoff multiplier                           │
│     - Maximum delay cap                            │
│                                                     │
│  4. Response Headers                               │
│     - X-RateLimit-Limit                           │
│     - X-RateLimit-Remaining                       │
│     - X-RateLimit-Reset                           │
│     - Retry-After                                  │
│                                                     │
│  5. Helper Functions                               │
│     - Client identifier extraction                 │
│     - Middleware creation                          │
│     - Cleanup utilities                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Configuration

### Endpoint-Specific Limits

Rate limits are configured per endpoint based on OWASP recommendations:

| Endpoint | Max Attempts | Window | Backoff Multiplier | Max Backoff |
|----------|--------------|--------|-------------------|-------------|
| **Sign In** | 5 | 15 min | 2x | 1 hour |
| **Sign Up** | 3 | 1 hour | 2x | 24 hours |
| **Password Reset Request** | 3 | 1 hour | 2x | 24 hours |
| **Password Reset Confirm** | 5 | 15 min | 2x | 1 hour |
| **Email Verification** | 10 | 1 hour | 1.5x | 2 hours |
| **Magic Link Request** | 3 | 1 hour | 2x | 24 hours |
| **2FA Verification** | 5 | 15 min | 2x | 1 hour |
| **OAuth Callback** | 10 | 15 min | 1.5x | 1 hour |
| **API (General)** | 100 | 15 min | 1.2x | 1 hour |

### Configuration Example

```typescript
import { getRateLimitConfig } from '@/lib/rate-limit-config';

const signInConfig = getRateLimitConfig('signIn');
// {
//   maxAttempts: 5,
//   windowMs: 900000, // 15 minutes
//   backoffMultiplier: 2,
//   maxBackoffMs: 3600000, // 1 hour
//   perIP: true,
//   perUser: true
// }
```

---

## Core Functions

### 1. Check Rate Limit

```typescript
import { checkRateLimit } from '@/lib/rate-limit';

const result = checkRateLimit('signIn', '192.168.1.1');

if (!result.allowed) {
  console.log(`Rate limited. Retry after ${result.retryAfter} seconds`);
}

// Result:
// {
//   allowed: false,
//   limit: 5,
//   remaining: 0,
//   reset: 1732291234567,
//   retryAfter: 847,
//   backoffMs: 847000
// }
```

### 2. Update Rate Limit

```typescript
import { updateRateLimit } from '@/lib/rate-limit';

// After failed sign-in attempt
updateRateLimit('signIn', '192.168.1.1', false);

// After successful sign-in
updateRateLimit('signIn', '192.168.1.1', true);
```

### 3. Generate Response Headers

```typescript
import { getRateLimitHeaders } from '@/lib/rate-limit';

const headers = getRateLimitHeaders(result);

// {
//   'X-RateLimit-Limit': '5',
//   'X-RateLimit-Remaining': '0',
//   'X-RateLimit-Reset': '1732291234567',
//   'Retry-After': '847'
// }
```

### 4. Extract Client Identifier

```typescript
import { getClientIdentifier } from '@/lib/rate-limit';

const identifier = getClientIdentifier(request);
// Tries: X-Forwarded-For > X-Real-IP > CF-Connecting-IP > 'unknown'
```

---

## Usage in API Routes

### Basic Pattern

```typescript
import {
  checkRateLimit,
  updateRateLimit,
  getRateLimitHeaders,
  getClientIdentifier
} from '@/lib/rate-limit';

export async function POST(request: Request) {
  // 1. Extract client identifier
  const identifier = getClientIdentifier(request);

  // 2. Check rate limit
  const rateLimitCheck = checkRateLimit('signIn', identifier);

  if (!rateLimitCheck.allowed) {
    // 3. Return 429 with headers
    return new Response('Too many requests', {
      status: 429,
      headers: getRateLimitHeaders(rateLimitCheck)
    });
  }

  // 4. Process request
  const data = await request.json();
  const success = await handleSignIn(data);

  // 5. Update rate limit
  updateRateLimit('signIn', identifier, success);

  // 6. Return response with headers
  return new Response(JSON.stringify({ success }), {
    status: success ? 200 : 401,
    headers: {
      'Content-Type': 'application/json',
      ...getRateLimitHeaders(rateLimitCheck)
    }
  });
}
```

### Using Middleware Helper

```typescript
import { createRateLimitMiddleware, getClientIdentifier } from '@/lib/rate-limit';

const rateLimiter = createRateLimitMiddleware('signIn');

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);

  // Check rate limit
  const result = rateLimiter.check(identifier);

  if (!result.allowed) {
    return new Response('Too many requests', {
      status: 429,
      headers: rateLimiter.getHeaders(result)
    });
  }

  // Process request
  const success = await handleSignIn(await request.json());

  // Update rate limit
  rateLimiter.update(identifier, success);

  return new Response(JSON.stringify({ success }), {
    status: success ? 200 : 401,
    headers: rateLimiter.getHeaders(result)
  });
}
```

---

## Exponential Backoff

### How It Works

Exponential backoff increases the wait time after each consecutive failure:

```
Attempt 1 (failure): Wait 3 minutes
Attempt 2 (failure): Wait 6 minutes (2x)
Attempt 3 (failure): Wait 12 minutes (4x)
Attempt 4 (failure): Wait 24 minutes (8x)
Attempt 5 (failure): Wait 48 minutes (16x)
Attempt 6+ (failure): Wait 60 minutes (capped at maxBackoffMs)
```

### Calculation

```typescript
import { calculateBackoff } from '@/lib/rate-limit';
import { getRateLimitConfig } from '@/lib/rate-limit-config';

const config = getRateLimitConfig('signIn');

// 0 failures: base delay
const delay0 = calculateBackoff(0, config); // ~180000ms (3 min)

// 3 failures: 8x base delay
const delay3 = calculateBackoff(3, config); // ~1440000ms (24 min)

// 10 failures: capped at maxBackoffMs
const delay10 = calculateBackoff(10, config); // 3600000ms (1 hour - cap)
```

### Reset on Success

Consecutive failures reset to 0 on successful authentication:

```typescript
// 3 failed attempts
updateRateLimit('signIn', identifier, false); // consecutiveFailures = 1
updateRateLimit('signIn', identifier, false); // consecutiveFailures = 2
updateRateLimit('signIn', identifier, false); // consecutiveFailures = 3

// Successful attempt resets counter
updateRateLimit('signIn', identifier, true); // consecutiveFailures = 0
```

---

## Response Headers

### X-RateLimit-* Headers

Rate limit information is communicated via standard headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1732291234567
```

### Retry-After Header

When rate limited (429 status), includes retry delay:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1732291234567
Retry-After: 847
```

**Client Implementation:**

```typescript
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry in ${retryAfter} seconds`);

  // Disable sign-in button for retryAfter seconds
  setTimeout(() => {
    enableSignInButton();
  }, parseInt(retryAfter) * 1000);
}
```

---

## Testing

### Run Tests

```bash
cd web/
bun test src/lib/rate-limit.test.ts
```

### Test Coverage

- ✅ Check rate limit within limit
- ✅ Block requests after limit exceeded
- ✅ Reset after window expires
- ✅ Increment attempts on failure
- ✅ Reset consecutive failures on success
- ✅ Calculate exponential backoff
- ✅ Generate correct headers
- ✅ Extract client identifier from headers
- ✅ Integration: full auth flow

---

## Utilities

### Reset Rate Limit (Admin/Testing)

```typescript
import { resetRateLimit } from '@/lib/rate-limit';

// Reset specific identifier
resetRateLimit('signIn', '192.168.1.1');
```

### Clear All Rate Limits (Testing)

```typescript
import { clearAllRateLimits } from '@/lib/rate-limit';

// Clear all (use in test setup)
clearAllRateLimits();
```

### Get Rate Limit Status (Monitoring)

```typescript
import { getRateLimitStatus } from '@/lib/rate-limit';

const status = getRateLimitStatus('signIn', '192.168.1.1');
// {
//   identifier: '192.168.1.1',
//   endpoint: 'signIn',
//   attempts: 3,
//   windowStart: 1732291234567,
//   consecutiveFailures: 3,
//   resetAt: 1732292134567
// }
```

### Cleanup Expired Records

```typescript
import { cleanupExpiredRateLimits } from '@/lib/rate-limit';

// Run periodically (automatic every 5 minutes)
cleanupExpiredRateLimits();
```

---

## Migration to Convex (Cycle 8)

**Current:** In-memory Map (loses data on restart)
**Future:** Convex database (persistent, distributed)

### Migration Plan (Cycle 8)

1. Create `rateLimits` table in Convex schema
2. Implement Convex mutations for check/update
3. Replace in-memory store with Convex queries
4. Add rate limit events to events dimension
5. Deploy and test

### Convex Schema (Planned)

```typescript
// backend/convex/schema.ts
rateLimits: defineTable({
  identifier: v.string(), // IP or user ID
  endpoint: v.string(),
  attempts: v.number(),
  windowStart: v.number(),
  consecutiveFailures: v.number(),
  resetAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number()
})
  .index('by_identifier_endpoint', ['identifier', 'endpoint'])
  .index('by_resetAt', ['resetAt']) // For cleanup
```

---

## Security Considerations

### Defense in Depth

Rate limiting is **Layer 1** of security (from Better Auth Architecture):

```
Layer 1: Rate Limiting ✅ (Cycle 7 - COMPLETE)
Layer 2: CSRF Protection (Cycle 10-14)
Layer 3: Input Validation (Cycle 14)
Layer 4: Argon2 Hashing (Cycle 1-5)
Layer 5: httpOnly Cookies (Better Auth default)
Layer 6: Session Rotation (Better Auth default)
```

### IP Spoofing Protection

Always validate `X-Forwarded-For` headers:

```typescript
// GOOD: Use trusted proxy headers (Cloudflare, AWS)
const identifier = request.headers.get('cf-connecting-ip') ||
                  request.headers.get('x-real-ip');

// BAD: Blindly trust X-Forwarded-For (can be spoofed)
const identifier = request.headers.get('x-forwarded-for');
```

### Per-User Rate Limiting

For authenticated endpoints, also rate limit by user ID:

```typescript
// Rate limit by IP
const ipResult = checkRateLimit('api', clientIP);

// Also rate limit by user
const userResult = checkRateLimit('api', userId);

if (!ipResult.allowed || !userResult.allowed) {
  return new Response('Too many requests', { status: 429 });
}
```

---

## Monitoring

### Metrics to Track

1. **Rate limit hits** - How often are users being rate limited?
2. **Endpoint distribution** - Which endpoints are most rate limited?
3. **Top offenders** - Which IPs/users are hitting limits?
4. **False positives** - Are legitimate users being blocked?

### Event Logging (Future - Cycle 20)

```typescript
// Log rate limit events to events dimension
await logEvent({
  type: 'rate_limit_exceeded',
  actorId: userId || 'anonymous',
  metadata: {
    endpoint: 'signIn',
    identifier: clientIP,
    attempts: result.limit,
    retryAfter: result.retryAfter
  }
});
```

---

## Next Steps (Cycle 8)

**Cycle 8:** Apply rate limiting to auth endpoints
- Add rate limiting to signIn mutation
- Add rate limiting to signUp mutation
- Add rate limiting to password reset
- Update API routes to use rate limiting
- Test rate limiting on all auth flows

---

## References

- Better Auth Roadmap: `/one/things/plans/better-auth-roadmap.md`
- Better Auth Architecture: `/one/knowledge/better-auth-architecture.md`
- OWASP Rate Limiting: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
- Convex Rate Limiter: https://github.com/get-convex/rate-limiter

---

**Built with security, simplicity, and infinite scale in mind.**
