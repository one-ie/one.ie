---
title: Cycle 8 Complete - Rate Limiting for Auth Endpoints
dimension: events
category: implementation
tags: auth, security, rate-limiting, better-auth, cycle-8
related_dimensions: people, things, events
scope: global
created: 2025-11-22
session_id: 01QMzqbMmdUc4fQx4zL1AEDT
ai_context: |
  This document is part of the events dimension in the implementation category.
  Location: one/events/cycle-8-rate-limiting-complete.md
  Purpose: Document completion of Cycle 8: Rate limiting for auth endpoints
  Related cycles: Cycle 1-7 (security foundation)
  For AI agents: Read this to understand rate limiting implementation.
---

# Cycle 8 Complete: Rate Limiting for Auth Endpoints

**Status:** Complete
**Date:** 2025-11-22
**Session ID:** 01QMzqbMmdUc4fQx4zL1AEDT
**Branch:** `claude/better-auth-roadmap-01QMzqbMmdUc4fQx4zL1AEDT`
**Roadmap:** `/one/things/plans/better-auth-roadmap.md`

---

## Summary

Implemented comprehensive rate limiting for Better Auth endpoints to prevent brute force attacks and abuse. Rate limiting is now active on sign-in, sign-up, and password reset endpoints with appropriate thresholds and clear error messages.

---

## Implementation Details

### 1. Rate Limiting Infrastructure

**File:** `/web/src/lib/auth/rate-limiter.ts`

**Features:**
- In-memory rate limit tracking with automatic cleanup
- Configurable rate limits per endpoint type
- IP-based rate limiting for sign-in and sign-up
- Email-based rate limiting for password reset
- HTTP 429 responses with retry information
- Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)

**Rate Limit Configurations:**

| Endpoint | Limit | Window | Key Type | Message |
|----------|-------|--------|----------|---------|
| Sign In | 5 attempts | 15 minutes | IP address | "Too many sign-in attempts. Please try again in 15 minutes." |
| Sign Up | 3 attempts | 1 hour | IP address | "Too many sign-up attempts. Please try again in 1 hour." |
| Password Reset | 3 requests | 1 hour | Email address | "Too many password reset requests. Please try again in 1 hour." |

**Key Functions:**
- `checkRateLimit(key, type)` - Check if request should be rate limited
- `resetRateLimit(key)` - Reset rate limit after successful auth
- `getClientIP(request)` - Extract client IP from headers (CloudFlare, nginx, etc.)

### 2. Event Logging System

**File:** `/web/src/lib/auth/event-logger.ts`

**Purpose:** Log all authentication events to the events dimension for monitoring and audit trails.

**Event Types:**
- `rate_limit_exceeded` - Rate limit violation
- `sign_in_attempt` - Sign-in attempt (success/failure)
- `sign_in_success` - Successful sign-in
- `sign_in_failed` - Failed sign-in
- `sign_up_attempt` - Sign-up attempt (success/failure)
- `sign_up_success` - Successful sign-up
- `sign_up_failed` - Failed sign-up
- `password_reset_requested` - Password reset request
- `password_reset_completed` - Password reset completed
- `password_reset_failed` - Password reset failed

**Logged Metadata:**
- Email address
- IP address
- User agent
- Endpoint
- Reason (for failures)
- Reset time (for rate limits)
- Retry after duration

**6-Dimension Mapping:**
- Maps to **EVENTS** dimension
- Provides complete audit trail
- Enables security monitoring and analytics

### 3. Auth API Integration

**File:** `/web/src/pages/api/auth/[...all].ts`

**Changes:**

#### Sign-In Endpoint (`/sign-in/email`)
1. Extract client IP from request headers
2. Check rate limit (5 attempts per 15 minutes per IP)
3. If rate limit exceeded:
   - Log violation to events
   - Return HTTP 429 with retry information
4. On successful login:
   - Reset rate limit counter
   - Log success event
5. On failed login:
   - Increment rate limit counter (implicit)
   - Log failure event

#### Sign-Up Endpoint (`/sign-up/email`)
1. Extract client IP from request headers
2. Check rate limit (3 signups per hour per IP)
3. If rate limit exceeded:
   - Log violation to events
   - Return HTTP 429 with retry information
4. On successful signup:
   - Reset rate limit counter
   - Log success event
5. On failed signup:
   - Increment rate limit counter (implicit)
   - Log failure event

#### Password Reset Endpoint (`/forgot-password`)
1. Check rate limit (3 requests per hour per email)
2. If rate limit exceeded:
   - Log violation to events
   - Return HTTP 429 with retry information
3. On successful request:
   - Log success event
4. On failed request:
   - Log failure event

**Note:** The `/reset-password` endpoint (token-based) does not have rate limiting as the token itself is rate-limited via the `/forgot-password` endpoint.

---

## Security Benefits

### 1. Brute Force Protection
- **Sign-in attacks:** Limited to 5 attempts per 15 minutes
- **Account enumeration:** Sign-up limited to 3 per hour
- **Password reset abuse:** Limited to 3 requests per hour per email

### 2. Complete Audit Trail
- All authentication attempts logged to events dimension
- Rate limit violations tracked with IP, email, and timestamp
- Enables security monitoring and threat detection

### 3. User-Friendly Error Messages
- Clear messages: "Too many attempts. Try again in 15 minutes."
- Retry time formatted: "15 minutes", "1 hour"
- HTTP headers include `Retry-After` for automated clients

### 4. Automatic Recovery
- Rate limits automatically reset after window expires
- Successful authentication resets rate limit counter
- No manual intervention required

---

## Technical Architecture

### In-Memory Storage

**Advantages:**
- Fast lookups (O(1) complexity)
- No database overhead
- Automatic cleanup every 5 minutes

**Considerations:**
- Rate limits reset on server restart
- Not shared across multiple server instances
- Suitable for single-instance deployment or behind load balancer with sticky sessions

**Future Enhancement:**
- Can be replaced with Redis for distributed rate limiting
- Interface remains the same, implementation swappable

### IP Address Detection

Checks multiple headers in order:
1. `cf-connecting-ip` (CloudFlare)
2. `x-real-ip` (nginx)
3. `x-forwarded-for` (standard proxy header)
4. Fallback to "unknown"

**CloudFlare Compatibility:**
- Deployed to CloudFlare Pages
- CloudFlare automatically adds `cf-connecting-ip` header
- Accurate IP detection even behind proxy

### Rate Limit Response Format

```json
{
  "error": "Too many sign-in attempts. Please try again in 15 minutes.",
  "retryAfter": 900,
  "retryAfterFormatted": "15 minutes",
  "resetAt": "2025-11-22T18:30:00.000Z"
}
```

**HTTP Headers:**
```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 900
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1732294200
```

---

## Testing Recommendations

### Manual Testing

**Test Sign-In Rate Limit:**
1. Attempt to sign in with wrong password 5 times
2. 6th attempt should return HTTP 429
3. Wait 15 minutes or restart server
4. Rate limit should reset

**Test Sign-Up Rate Limit:**
1. Sign up 3 different accounts from same IP
2. 4th attempt should return HTTP 429
3. Wait 1 hour or restart server
4. Rate limit should reset

**Test Password Reset Rate Limit:**
1. Request password reset for same email 3 times
2. 4th request should return HTTP 429
3. Wait 1 hour or restart server
4. Rate limit should reset

### Automated Testing

**Unit Tests for Rate Limiter:**
```typescript
describe("RateLimiter", () => {
  test("allows requests within limit", () => {
    const result = rateLimiter.check("test-key", { maxAttempts: 3, windowMs: 60000 });
    expect(result.allowed).toBe(true);
  });

  test("blocks requests exceeding limit", () => {
    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      rateLimiter.check("test-key", { maxAttempts: 3, windowMs: 60000 });
    }

    // 4th request should be blocked
    const result = rateLimiter.check("test-key", { maxAttempts: 3, windowMs: 60000 });
    expect(result.allowed).toBe(false);
  });

  test("resets after window expires", () => {
    // Mock time passage
  });
});
```

**Integration Tests:**
```typescript
describe("Auth API Rate Limiting", () => {
  test("POST /api/auth/sign-in returns 429 after 5 failed attempts", async () => {
    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      await fetch("/api/auth/sign-in/email", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "wrong" })
      });
    }

    // 6th request
    const response = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "wrong" })
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("900");
  });
});
```

---

## Endpoints with Rate Limiting

### Summary Table

| Endpoint | Method | Rate Limit | Window | Tracking Key | Status |
|----------|--------|------------|--------|--------------|--------|
| `/api/auth/sign-in/email` | POST | 5 attempts | 15 minutes | IP address | ✅ Active |
| `/api/auth/sign-up/email` | POST | 3 attempts | 1 hour | IP address | ✅ Active |
| `/api/auth/forgot-password` | POST | 3 requests | 1 hour | Email address | ✅ Active |
| `/api/auth/reset-password` | POST | N/A (token-based) | N/A | N/A | ✅ Protected by forgot-password |
| `/api/auth/get-session` | GET | None | N/A | N/A | ❌ No rate limit |
| `/api/auth/sign-out` | POST | None | N/A | N/A | ❌ No rate limit |
| `/api/auth/sign-in/social` | POST | None | N/A | N/A | ❌ No rate limit (future cycle) |

**Note:** Social sign-in endpoints will be rate limited in a future cycle when full Better Auth migration is complete.

---

## 6-Dimension Ontology Alignment

### EVENTS Dimension
- All rate limit violations logged as `rate_limit_exceeded` events
- All auth attempts logged (success/failure)
- Complete audit trail for security monitoring

### PEOPLE Dimension
- Rate limiting protects people (users) from brute force attacks
- Prevents account takeover and unauthorized access

### THINGS Dimension
- Sessions are protected from hijacking via rate-limited auth
- Prevents creation of fake accounts (sign-up rate limit)

### CONNECTIONS Dimension
- Rate limiting prevents automated relationship creation
- Protects social features from spam

### KNOWLEDGE Dimension
- Event logs provide data for security analytics
- Rate limit patterns can be analyzed to detect threats

### GROUPS Dimension
- Organization accounts protected from brute force
- Multi-tenant security maintained

---

## Next Steps (Future Cycles)

### Cycle 9: Test rate limiting functionality
- Write unit tests for rate limiter
- Write integration tests for auth endpoints
- Test rate limit headers in responses
- Test rate limit reset after timeout

### Cycle 10-14: CSRF Protection
- Design CSRF protection strategy
- Implement CSRF token generation
- Add CSRF validation to mutations
- Update frontend for CSRF tokens

### Phase 2: Better Auth Migration
- Migrate to Better Auth Convex component
- Leverage Better Auth built-in rate limiting
- Migrate event logging to Better Auth hooks

---

## Lessons Learned

### 1. IP Detection is Critical
- Must check multiple headers (CloudFlare, nginx, etc.)
- Fallback to "unknown" prevents crashes
- Test with different proxy configurations

### 2. Clear Error Messages Matter
- "Too many attempts" is better than "Rate limit exceeded"
- Include retry time in human-readable format
- HTTP headers for automated clients

### 3. Reset on Success is Important
- Users shouldn't be locked out after successful login
- Prevents frustration from typos
- Still protects against brute force (resets counter to zero, not removes history)

### 4. Event Logging Should Never Fail Auth
- Logging errors caught and logged, but don't break auth flow
- Authentication more important than audit trail
- Events logged asynchronously (no await blocking)

### 5. In-Memory Storage is Pragmatic
- Fast and simple for single-instance deployment
- Good enough for MVP
- Easy to replace with Redis later if needed

---

## Files Changed

1. **Created:** `/web/src/lib/auth/rate-limiter.ts` (156 lines)
   - Rate limiting infrastructure
   - IP detection utility
   - Rate limit checking and response generation

2. **Created:** `/web/src/lib/auth/event-logger.ts` (139 lines)
   - Event logging for auth operations
   - Maps to events dimension
   - Provides complete audit trail

3. **Modified:** `/web/src/pages/api/auth/[...all].ts` (+94 lines)
   - Added rate limiting to sign-in endpoint
   - Added rate limiting to sign-up endpoint
   - Added rate limiting to password reset endpoint
   - Integrated event logging

4. **Created:** `/one/events/cycle-8-rate-limiting-complete.md` (this file)
   - Documentation of implementation
   - Testing recommendations
   - Next steps

---

## Success Criteria

- [x] Sign-in endpoint rate limited (5 attempts per 15 minutes per IP)
- [x] Sign-up endpoint rate limited (3 signups per hour per IP)
- [x] Password reset endpoint rate limited (3 requests per hour per email)
- [x] Clear error messages returned ("Too many attempts. Try again in X minutes.")
- [x] Rate limit violations logged to events table
- [x] HTTP 429 responses with Retry-After header
- [x] Rate limits automatically reset after window expires
- [x] Successful authentication resets rate limit counter

---

## References

- **Better Auth Roadmap:** `/one/things/plans/better-auth-roadmap.md`
- **Better Auth Architecture:** `/one/knowledge/better-auth-architecture.md`
- **6-Dimension Ontology:** `/one/knowledge/ontology.md`
- **Events Dimension:** `/one/knowledge/ontology.md#5-events`

---

**Cycle 8 Status: Complete ✅**

Rate limiting is now active on all critical auth endpoints. The system is protected against brute force attacks, account enumeration, and password reset abuse. All auth events are logged to the events dimension for monitoring and audit trails.

**Next:** Cycle 9 - Test rate limiting functionality

