---
title: Phase 7 Polish & Production - Quality Specification
dimension: events
category: test_specifications
tags: auth, better-auth, testing, quality, security, production
related_dimensions: things, knowledge, people
scope: global
created: 2025-11-22
version: 1.0.0
session_id: 01QMzqbMmdUc4fQx4zL1AEDT
ai_context: |
  This document defines quality gates, user flows, acceptance criteria, and technical tests
  for Phase 7 (Cycles 95-100) of the Better Auth implementation roadmap.
  Location: one/events/phase-7-polish-production-spec.md
  Purpose: Ensure production-readiness with comprehensive testing and validation
---

# Phase 7 Polish & Production - Quality Specification

**Quality Agent:** Validating production-readiness for Better Auth
**Phase:** 7 (Polish & Production)
**Cycles:** 95-100
**Status:** Specification Complete

---

## Overview

This specification defines **what success looks like** for Phase 7 before any implementation begins. All features must pass these criteria to be considered complete.

**Quality Philosophy:**
- User-first validation (flows before technical tests)
- Ontology-aligned (maps to 6 dimensions)
- Time-budgeted (performance requirements)
- Security-focused (OWASP compliant)
- Production-ready (monitoring + documentation)

---

## Cycle 95: Captcha Protection

### 6-Dimension Ontology Mapping

**Things Created:**
- Type: `security_config` (captcha configuration)
- Properties: `{ provider: 'recaptcha' | 'hcaptcha', siteKey, threshold, invisibleMode }`

**Connections Created:**
- Type: `secured_by` (from: signup_form → to: captcha_config)
- Type: `secured_by` (from: signin_form → to: captcha_config)

**Events Logged:**
- Type: `captcha_verified` (actor: system, metadata: { score, provider, timestamp })
- Type: `captcha_failed` (actor: system, metadata: { reason, ip, timestamp })
- Type: `bot_blocked` (actor: system, metadata: { ip, endpoint, timestamp })

**Knowledge Updated:**
- Labels: `skill:security`, `topic:bot_protection`, `format:captcha`
- Chunks: Captcha configuration documentation

### User Flow 1: Human User Signs Up (Happy Path)

**User goal:** Create account without noticing captcha
**Time budget:** < 3 seconds total (signup form load + captcha)

**Steps:**
1. User navigates to signup page
2. Invisible reCAPTCHA v3 loads automatically in background
3. User fills out signup form (email, password, name)
4. User clicks "Sign Up" button
5. Captcha token validated server-side (score >= 0.5)
6. Account created successfully

**Acceptance Criteria:**
- [ ] Captcha loads invisibly (no user interaction required)
- [ ] Captcha verification completes in < 500ms
- [ ] Score >= 0.5 allows signup to proceed
- [ ] No disruption to user experience
- [ ] `captcha_verified` event logged with score
- [ ] Works on mobile and desktop browsers

**Technical Tests:**
- Unit: Test captcha token verification function
- Integration: Test signup mutation with captcha validation
- E2E: Test complete signup flow with captcha enabled

### User Flow 2: Bot Attempts Signup (Failure Path)

**User goal:** Bot is blocked from creating fake accounts
**Time budget:** < 500ms (immediate rejection)

**Steps:**
1. Bot sends automated signup request
2. Captcha token missing or invalid
3. Server rejects request with 403 Forbidden
4. `bot_blocked` event logged

**Acceptance Criteria:**
- [ ] Missing captcha token → 403 error
- [ ] Invalid captcha token → 403 error
- [ ] Low score (< 0.5) → Challenge or rejection
- [ ] `bot_blocked` event logged with IP and reason
- [ ] Rate limiting applied to repeated bot attempts
- [ ] Clear error message returned to client

**Technical Tests:**
- Unit: Test captcha validation with missing/invalid tokens
- Integration: Test rejection logic in signup mutation
- E2E: Test bot signup attempts are blocked

### User Flow 3: Human with Low Score (Challenge Path)

**User goal:** Human user with low captcha score completes challenge
**Time budget:** < 10 seconds (including challenge)

**Steps:**
1. User attempts signup
2. reCAPTCHA v3 score < 0.5 (suspicious behavior)
3. Server returns challenge required
4. User sees reCAPTCHA v2 checkbox challenge
5. User completes challenge successfully
6. Account created with flag for monitoring

**Acceptance Criteria:**
- [ ] Low score triggers v2 checkbox challenge
- [ ] Challenge appears seamlessly in UI
- [ ] Challenge completion allows signup
- [ ] User flagged for monitoring (not blocked)
- [ ] `captcha_verified` event logs score + challenge
- [ ] Fallback to email verification if challenge fails

**Technical Tests:**
- Unit: Test low score detection logic
- Integration: Test challenge trigger and verification
- E2E: Test complete challenge flow

### Invisible vs Visible Captcha Strategy

**Strategy Decision Matrix:**

| Endpoint | Initial | After Failed Attempts |
|----------|---------|----------------------|
| Sign Up | Invisible v3 | Visible v2 challenge |
| Sign In (0-2 fails) | None | None |
| Sign In (3+ fails) | Visible v2 | Visible v2 (required) |
| Password Reset | Invisible v3 | Invisible v3 |

**Acceptance Criteria:**
- [ ] Strategy documented in code
- [ ] Failed login counter tracked per IP
- [ ] Captcha requirement escalates appropriately
- [ ] Strategy configurable via environment variables

### Security Requirements

**OWASP Compliance:**
- [ ] Bot detection active on all auth endpoints
- [ ] Captcha verification happens server-side (never client-only)
- [ ] Secret keys stored in environment variables (never committed)
- [ ] Fallback strategy if captcha provider is down
- [ ] Privacy-preserving (GDPR compliant)

**Performance Requirements:**
- [ ] Captcha load < 500ms (async, non-blocking)
- [ ] Captcha verification < 300ms server-side
- [ ] No impact on legitimate users (invisible mode)
- [ ] Graceful degradation if captcha unavailable

---

## Cycle 96: Have I Been Pwned Integration

### 6-Dimension Ontology Mapping

**Things Created:**
- Type: `security_check` (HIBP password check result)
- Properties: `{ passwordHash, isPwned, breachCount, checkDate }`

**Connections Created:**
- Type: `validated_by` (from: user → to: security_check)

**Events Logged:**
- Type: `password_checked` (actor: system, metadata: { isPwned, breachCount })
- Type: `pwned_password_blocked` (actor: user, metadata: { breachCount, action })
- Type: `pwned_password_warning` (actor: user, metadata: { breachCount, userAccepted })

**Knowledge Updated:**
- Labels: `skill:security`, `topic:password_security`, `format:hibp`
- Chunks: HIBP integration documentation and best practices

### User Flow 1: User Signs Up with Safe Password (Happy Path)

**User goal:** Create account with secure, non-pwned password
**Time budget:** < 4 seconds (signup + HIBP check)

**Steps:**
1. User enters email and password on signup form
2. Client validates password strength (minimum 8 chars, etc.)
3. User clicks "Sign Up"
4. Server hashes password (Argon2id)
5. Server checks HIBP API using k-anonymity (hash prefix)
6. HIBP returns 0 breaches for this password
7. Account created successfully
8. `password_checked` event logged (isPwned: false)

**Acceptance Criteria:**
- [ ] HIBP check completes in < 1 second
- [ ] k-anonymity model used (only first 5 chars of SHA-1 sent)
- [ ] Zero breaches → signup proceeds normally
- [ ] Privacy preserved (full password hash never sent to HIBP)
- [ ] `password_checked` event logged
- [ ] Works even if HIBP API is temporarily down (non-blocking)

**Technical Tests:**
- Unit: Test HIBP k-anonymity hash generation (SHA-1 prefix)
- Integration: Test HIBP API call with mock responses
- E2E: Test complete signup flow with HIBP check

### User Flow 2: User Signs Up with Pwned Password (Warning Path)

**User goal:** User warned about compromised password but can proceed
**Time budget:** < 5 seconds (including warning display)

**Steps:**
1. User enters email and common password ("password123")
2. User clicks "Sign Up"
3. Server checks HIBP API
4. HIBP returns 100,000+ breaches for this password
5. Server shows warning: "This password has been compromised in 100,000+ data breaches. We strongly recommend choosing a different password."
6. User sees two options:
   - "Change Password" (recommended)
   - "Continue Anyway" (not recommended, requires confirmation)
7. User chooses action

**Acceptance Criteria:**
- [ ] Warning appears immediately after HIBP check
- [ ] Breach count displayed prominently
- [ ] User can change password without losing form data
- [ ] User can proceed anyway (with confirmation)
- [ ] `pwned_password_warning` event logged with user choice
- [ ] Warning is clear and non-technical
- [ ] Suggestion to use password manager provided

**Technical Tests:**
- Unit: Test pwned password detection logic
- Integration: Test warning UI rendering
- E2E: Test both warning paths (change vs continue)

### User Flow 3: User Changes Existing Pwned Password (Proactive Security)

**User goal:** User updates compromised password to secure one
**Time budget:** < 6 seconds

**Steps:**
1. User navigates to account settings
2. System shows notification: "Your password appears in data breach databases. Please update it for security."
3. User clicks "Change Password"
4. User enters current password + new password
5. HIBP checks new password
6. New password is clean (0 breaches)
7. Password updated successfully
8. `password_changed` event logged
9. `password_checked` event logged (isPwned: false)

**Acceptance Criteria:**
- [ ] Proactive notification shown to users with pwned passwords
- [ ] Password change flow validates new password via HIBP
- [ ] User cannot set another pwned password
- [ ] Success message confirms security improvement
- [ ] All active sessions remain valid (no forced logout)
- [ ] Events logged for audit trail

**Technical Tests:**
- Unit: Test pwned password detection in change flow
- Integration: Test password change with HIBP validation
- E2E: Test complete password change flow

### Privacy-Preserving Implementation (k-Anonymity)

**HIBP k-Anonymity Model:**
1. Hash password with SHA-1: `5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8` (for "password")
2. Take first 5 characters: `5BAA6`
3. Send prefix to HIBP API: `https://api.pwnedpasswords.com/range/5BAA6`
4. HIBP returns ALL hashes starting with `5BAA6` (800+ hashes)
5. Client searches response for full hash match locally
6. Result: Password checked without revealing full password to HIBP

**Acceptance Criteria:**
- [ ] Full password hash NEVER sent to HIBP
- [ ] Only first 5 characters of SHA-1 hash sent
- [ ] Response parsing happens server-side
- [ ] HTTPS enforced for all HIBP requests
- [ ] Privacy policy updated to mention HIBP usage
- [ ] User consent implied by using service

**Technical Tests:**
- Unit: Test k-anonymity hash generation
- Unit: Test response parsing for hash matching
- Integration: Test HIBP API call with real endpoint
- Security: Verify full hash never logged or transmitted

### Fallback Strategy (HIBP Unavailable)

**Acceptance Criteria:**
- [ ] HIBP check times out after 2 seconds
- [ ] Timeout does not block signup (log warning instead)
- [ ] Retry logic with exponential backoff
- [ ] Fallback to password strength validation only
- [ ] `hibp_unavailable` event logged
- [ ] Admin dashboard shows HIBP health status

**Technical Tests:**
- Unit: Test timeout handling
- Integration: Test fallback to strength validation
- E2E: Test signup works when HIBP is down

---

## Cycle 98: OpenAPI Documentation

### 6-Dimension Ontology Mapping

**Things Created:**
- Type: `documentation` (OpenAPI spec document)
- Properties: `{ version: '3.0', endpoints: [], schemas: [], examples: [] }`

**Connections Created:**
- Type: `documents` (from: api_endpoint → to: openapi_spec)

**Events Logged:**
- Type: `documentation_generated` (actor: system, metadata: { version, timestamp })
- Type: `api_docs_viewed` (actor: user, metadata: { endpoint, timestamp })

**Knowledge Updated:**
- Labels: `skill:documentation`, `topic:api`, `format:openapi`
- Chunks: Complete API reference documentation

### User Flow 1: Developer Reads API Documentation (Happy Path)

**User goal:** Understand how to authenticate users via API
**Time budget:** < 30 seconds to find relevant endpoint

**Steps:**
1. Developer navigates to `/api/docs` (Swagger UI)
2. Swagger UI loads OpenAPI 3.0 spec
3. Developer browses endpoints grouped by category:
   - Authentication (signup, signin, signout)
   - Session Management (get, list, revoke)
   - Security (2FA, passkeys, CSRF)
   - Organizations (create, invite, roles)
4. Developer clicks "POST /auth/signup"
5. Sees request schema, response schema, examples, auth requirements
6. Developer copies curl example
7. Developer tests API call successfully

**Acceptance Criteria:**
- [ ] Swagger UI hosted at `/api/docs`
- [ ] All auth endpoints documented (40+ endpoints)
- [ ] Request/response schemas complete and accurate
- [ ] Authentication examples provided (Bearer token, session cookie)
- [ ] Error responses documented (400, 401, 403, 429, 500)
- [ ] Try-it-out feature works (can test from browser)
- [ ] Documentation loads in < 2 seconds
- [ ] Mobile-responsive design

**Technical Tests:**
- Unit: Validate OpenAPI spec against schema validator
- Integration: Test Swagger UI renders all endpoints
- E2E: Test "Try it out" functionality works

### User Flow 2: Developer Integrates Auth API (Integration Path)

**User goal:** Implement user signup in their application
**Time budget:** < 5 minutes to write working code

**Steps:**
1. Developer reads `/api/docs` for POST /auth/signup
2. Sees request schema:
   ```json
   {
     "email": "user@example.com",
     "password": "SecurePass123!",
     "name": "John Doe"
   }
   ```
3. Sees response schema:
   ```json
   {
     "userId": "usr_123",
     "sessionToken": "tok_abc",
     "csrfToken": "csrf_xyz",
     "expiresAt": 1234567890
   }
   ```
4. Sees curl example
5. Developer copies example to their code
6. Modifies for their use case
7. Tests API call successfully
8. Receives session token
9. Uses session token for authenticated requests

**Acceptance Criteria:**
- [ ] Copy-paste examples work immediately
- [ ] TypeScript types provided for all schemas
- [ ] Authentication flow documented end-to-end
- [ ] Common error scenarios explained
- [ ] Rate limiting documented
- [ ] CSRF token usage explained
- [ ] Session management documented

**Technical Tests:**
- Manual: Developer testing with real API calls
- E2E: Test example code snippets work

### OpenAPI 3.0 Spec Requirements

**Complete Endpoint Coverage:**

**Authentication Endpoints:**
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Login
- `POST /auth/signout` - Logout
- `POST /auth/forgot-password` - Request reset
- `POST /auth/reset-password` - Complete reset
- `POST /auth/change-password` - Update password
- `POST /auth/verify-email` - Confirm email

**Session Endpoints:**
- `GET /session` - Get current session
- `GET /sessions` - List all sessions
- `DELETE /session/:id` - Revoke session
- `DELETE /sessions` - Revoke all sessions

**Security Endpoints:**
- `POST /2fa/setup` - Enable 2FA
- `POST /2fa/verify` - Verify 2FA code
- `POST /2fa/disable` - Disable 2FA
- `POST /passkey/register` - Register passkey
- `POST /passkey/authenticate` - Authenticate with passkey

**Organization Endpoints:**
- `POST /organizations` - Create organization
- `GET /organizations` - List organizations
- `POST /organizations/:id/invite` - Invite member
- `DELETE /organizations/:id/members/:userId` - Remove member

**Acceptance Criteria for Each Endpoint:**
- [ ] HTTP method documented
- [ ] Path parameters documented
- [ ] Query parameters documented
- [ ] Request body schema (with examples)
- [ ] Response schemas for all status codes
- [ ] Authentication requirements specified
- [ ] Rate limiting documented
- [ ] Example requests (curl, JavaScript, Python)

**Technical Tests:**
- Unit: Validate spec against OpenAPI 3.0 schema
- Integration: Test all examples are valid
- Documentation: Spell check and grammar check

### Swagger UI Configuration

**Acceptance Criteria:**
- [ ] Hosted at `/api/docs` and `/docs`
- [ ] Custom branding (ONE Platform logo)
- [ ] Dark mode support
- [ ] Search functionality works
- [ ] Deep linking to specific endpoints
- [ ] OAuth 2.0 authentication configured for Try-it-out
- [ ] Collapsible sections for organization
- [ ] Download spec button (JSON/YAML)

**Technical Tests:**
- E2E: Test all UI features work
- Accessibility: Test WCAG 2.1 AA compliance

---

## Cycle 99: Comprehensive Security Audit

### 6-Dimension Ontology Mapping

**Things Created:**
- Type: `audit_report` (security audit findings)
- Properties: `{ findings: [], severity: 'critical' | 'high' | 'medium' | 'low', status: 'open' | 'resolved' }`

**Events Logged:**
- Type: `security_audit_started` (actor: quality_agent, metadata: { scope, timestamp })
- Type: `security_audit_complete` (actor: quality_agent, metadata: { findings, timestamp })
- Type: `vulnerability_found` (actor: system, metadata: { type, severity, endpoint })
- Type: `vulnerability_fixed` (actor: developer, metadata: { type, fix_details })

**Knowledge Updated:**
- Labels: `skill:security`, `topic:audit`, `format:report`
- Chunks: Security audit findings and remediation steps

### Security Audit Checklist (OWASP Top 10)

#### 1. Broken Access Control

**Tests:**
- [ ] Cannot access other users' data
- [ ] Cannot access admin endpoints without admin role
- [ ] Cannot bypass organization scoping (groupId)
- [ ] Cannot manipulate userId in requests
- [ ] Cannot access deleted/suspended accounts
- [ ] Horizontal privilege escalation blocked
- [ ] Vertical privilege escalation blocked

**Test Cases:**
```javascript
// Test 1: User cannot access another user's profile
test("Horizontal privilege escalation blocked", async () => {
  const user1Session = await signIn("user1@example.com", "pass");
  const user2Id = await getUserId("user2@example.com");

  const response = await fetch("/api/users/" + user2Id, {
    headers: { Authorization: `Bearer ${user1Session.token}` }
  });

  expect(response.status).toBe(403); // Forbidden
});

// Test 2: Org user cannot access platform admin endpoints
test("Vertical privilege escalation blocked", async () => {
  const orgUserSession = await signIn("orguser@example.com", "pass");

  const response = await fetch("/api/admin/users", {
    headers: { Authorization: `Bearer ${orgUserSession.token}` }
  });

  expect(response.status).toBe(403); // Forbidden
});
```

#### 2. Cryptographic Failures

**Tests:**
- [ ] All passwords hashed with Argon2id (not SHA-256)
- [ ] Session tokens are cryptographically secure (256-bit)
- [ ] CSRF tokens are cryptographically secure (256-bit)
- [ ] Reset tokens are one-time use and expire
- [ ] No sensitive data in logs (passwords, tokens redacted)
- [ ] HTTPS enforced in production
- [ ] Cookies have Secure and HttpOnly flags

**Test Cases:**
```javascript
test("Passwords hashed with Argon2id", async () => {
  const user = await signUp("test@example.com", "password123");
  const dbUser = await db.get(user.userId);

  expect(dbUser.passwordHashType).toBe("argon2id");
  expect(dbUser.passwordHash).toMatch(/^\$argon2id\$/);
});

test("Session tokens are cryptographically secure", async () => {
  const session = await signIn("test@example.com", "password123");

  expect(session.sessionToken.length).toBeGreaterThanOrEqual(32); // 256 bits = 32 bytes
  expect(isValidBase64URL(session.sessionToken)).toBe(true);
});
```

#### 3. Injection (SQL, NoSQL, Command)

**Tests:**
- [ ] All inputs sanitized before database queries
- [ ] Convex queries use parameterized syntax (not string concatenation)
- [ ] Email validation prevents injection
- [ ] Password validation prevents injection
- [ ] No SQL comments (`--;`, `/* */`) accepted
- [ ] No NoSQL operators (`$where`, `$ne`) accepted
- [ ] Command injection blocked (shell metacharacters)

**Test Cases:**
```javascript
test("SQL injection blocked in email field", async () => {
  const maliciousEmail = "admin'--@example.com";

  const response = await signUp(maliciousEmail, "password123");

  expect(response.error).toMatch(/invalid email/i);
});

test("NoSQL injection blocked", async () => {
  const maliciousInput = { $ne: null }; // MongoDB operator

  const response = await signIn(maliciousInput, "password123");

  expect(response.status).toBe(400); // Bad request
});
```

#### 4. Insecure Design

**Tests:**
- [ ] Rate limiting on all auth endpoints (login, signup, password reset)
- [ ] Account lockout after 5 failed login attempts
- [ ] Exponential backoff on failed attempts
- [ ] CAPTCHA after 3 failed login attempts
- [ ] Password reset tokens expire in 1 hour
- [ ] Email verification required for sensitive actions
- [ ] 2FA required for admin accounts

**Test Cases:**
```javascript
test("Rate limiting prevents brute force", async () => {
  const attempts = [];

  for (let i = 0; i < 10; i++) {
    attempts.push(signIn("test@example.com", "wrongpassword"));
  }

  const results = await Promise.all(attempts);
  const blocked = results.filter(r => r.status === 429); // Too Many Requests

  expect(blocked.length).toBeGreaterThan(0); // Some attempts blocked
});
```

#### 5. Security Misconfiguration

**Tests:**
- [ ] No default credentials in production
- [ ] Error messages don't reveal system details
- [ ] Debug mode disabled in production
- [ ] CORS configured correctly (not `*` in production)
- [ ] Security headers set (CSP, X-Frame-Options, HSTS)
- [ ] Unused endpoints disabled
- [ ] API versioning in place

**Test Cases:**
```javascript
test("Error messages don't reveal stack traces", async () => {
  const response = await fetch("/api/invalid-endpoint");
  const body = await response.text();

  expect(body).not.toMatch(/Error:/);
  expect(body).not.toMatch(/at \w+/); // Stack trace pattern
});
```

#### 6. Vulnerable and Outdated Components

**Tests:**
- [ ] All npm packages up to date
- [ ] No critical vulnerabilities in dependencies
- [ ] `npm audit` passes with 0 high/critical issues
- [ ] Dependencies scanned weekly
- [ ] Automated Dependabot PRs enabled

**Test Cases:**
```bash
# Run in CI/CD pipeline
npm audit --production --audit-level=high
# Exit code must be 0 (no high/critical vulnerabilities)
```

#### 7. Identification and Authentication Failures

**Tests:**
- [ ] Session fixation prevented (new session on login)
- [ ] Session tokens rotated after privilege change
- [ ] Sessions expire after 7 days of inactivity
- [ ] Concurrent sessions limited per user (optional)
- [ ] Logout invalidates session immediately
- [ ] Password reset invalidates all sessions
- [ ] Weak passwords rejected (zxcvbn score >= 3)

**Test Cases:**
```javascript
test("Session fixation prevented", async () => {
  const oldSession = await getUnauthenticatedSession();

  const newSession = await signIn("test@example.com", "password123");

  expect(newSession.sessionToken).not.toBe(oldSession.token);
});

test("Logout invalidates session", async () => {
  const session = await signIn("test@example.com", "password123");
  await signOut(session.sessionToken);

  const response = await fetch("/api/profile", {
    headers: { Authorization: `Bearer ${session.sessionToken}` }
  });

  expect(response.status).toBe(401); // Unauthorized
});
```

#### 8. Software and Data Integrity Failures

**Tests:**
- [ ] Code signing for deployments (git commit signatures)
- [ ] Integrity checks for dependencies (package-lock.json)
- [ ] No unsigned code in production
- [ ] Audit trail for all data changes (events table)
- [ ] Backups encrypted and verified
- [ ] Rollback mechanism tested

**Test Cases:**
```javascript
test("All data changes logged to events table", async () => {
  const user = await signUp("test@example.com", "password123");

  const event = await db.query("events")
    .withIndex("by_target", q => q.eq("targetId", user.userId))
    .first();

  expect(event.type).toBe("user_created");
  expect(event.actorId).toBe(user.userId);
});
```

#### 9. Security Logging and Monitoring Failures

**Tests:**
- [ ] All authentication events logged
- [ ] Failed login attempts logged with IP
- [ ] Admin actions logged
- [ ] Suspicious activity flagged (multiple failed logins, new device)
- [ ] Logs stored for 90 days minimum
- [ ] Log tampering prevented (write-only logs)
- [ ] Alerting configured for anomalies

**Test Cases:**
```javascript
test("Failed login attempts logged", async () => {
  await signIn("test@example.com", "wrongpassword");

  const event = await db.query("events")
    .withIndex("by_type", q => q.eq("type", "login_failed"))
    .first();

  expect(event).toBeDefined();
  expect(event.metadata.email).toBe("test@example.com");
  expect(event.metadata.ip).toBeDefined();
});
```

#### 10. Server-Side Request Forgery (SSRF)

**Tests:**
- [ ] No user-controlled URLs fetched
- [ ] Webhook URLs validated (no internal IPs)
- [ ] OAuth callback URLs whitelisted
- [ ] Redirect URLs validated
- [ ] No file:// or localhost URLs allowed

**Test Cases:**
```javascript
test("SSRF blocked on webhook URLs", async () => {
  const maliciousWebhook = "http://localhost:8000/admin";

  const response = await setWebhookUrl(maliciousWebhook);

  expect(response.error).toMatch(/invalid webhook url/i);
});
```

### Penetration Testing

**Automated Tools:**
- [ ] OWASP ZAP scan completed (0 high/critical)
- [ ] Burp Suite scan completed
- [ ] Nikto web server scan completed
- [ ] npm audit completed (0 high/critical)

**Manual Testing:**
- [ ] Session manipulation tested
- [ ] CSRF attack tested
- [ ] XSS attack tested (stored, reflected, DOM-based)
- [ ] Clickjacking tested
- [ ] Password reset flow tested (token prediction, reuse)

**Acceptance Criteria:**
- [ ] All automated scans pass
- [ ] All manual tests pass
- [ ] Findings documented in audit report
- [ ] Critical/high findings fixed before production
- [ ] Medium/low findings scheduled for future cycles

---

## Cycle 100: Production Deployment & Monitoring

### 6-Dimension Ontology Mapping

**Things Created:**
- Type: `deployment` (production deployment record)
- Type: `metric` (auth metrics: login success rate, error rate, latency)
- Type: `alert` (monitoring alerts configuration)

**Events Logged:**
- Type: `deployment_started` (actor: ops_agent, metadata: { version, timestamp })
- Type: `deployment_complete` (actor: ops_agent, metadata: { version, status, timestamp })
- Type: `smoke_test_passed` (actor: quality_agent, metadata: { tests, timestamp })
- Type: `alert_triggered` (actor: monitoring_system, metadata: { metric, threshold, value })

**Knowledge Updated:**
- Labels: `skill:deployment`, `topic:monitoring`, `format:runbook`
- Chunks: Production deployment checklist, monitoring runbook, incident response

### Pre-Deployment Checklist

**Environment Variables (ALL REQUIRED):**
```bash
# Core Better Auth
BETTER_AUTH_SECRET=<256-bit random secret>
BETTER_AUTH_URL=https://api.one.ie

# Database
CONVEX_DEPLOYMENT=shocking-falcon-870 # Production

# Email (Resend)
RESEND_API_KEY=<api_key>

# OAuth Providers
GITHUB_CLIENT_ID=<client_id>
GITHUB_CLIENT_SECRET=<client_secret>
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>

# Captcha
RECAPTCHA_SITE_KEY=<site_key>
RECAPTCHA_SECRET_KEY=<secret_key>

# Monitoring
SENTRY_DSN=<sentry_dsn> # Error tracking
AXIOM_API_TOKEN=<axiom_token> # Log aggregation
```

**Acceptance Criteria:**
- [ ] All environment variables set in production
- [ ] Secrets rotated from development values
- [ ] No secrets committed to git
- [ ] Secrets stored in secure vault (1Password, AWS Secrets Manager)
- [ ] Secrets accessible only to authorized personnel
- [ ] Backup of secrets stored securely

### Smoke Tests (Production)

**Critical Path Tests:**

**Test 1: User Signup**
```javascript
test("Production smoke test: Signup", async () => {
  const email = `smoketest+${Date.now()}@one.ie`;
  const password = "SmokeTest123!";

  const response = await fetch("https://api.one.ie/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: "Smoke Test" })
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.sessionToken).toBeDefined();
});
```

**Test 2: User Signin**
```javascript
test("Production smoke test: Signin", async () => {
  const response = await fetch("https://api.one.ie/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "smoketest@one.ie",
      password: "SmokeTest123!"
    })
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.sessionToken).toBeDefined();
});
```

**Test 3: Session Validation**
```javascript
test("Production smoke test: Session", async () => {
  const session = await signIn("smoketest@one.ie", "SmokeTest123!");

  const response = await fetch("https://api.one.ie/session", {
    headers: {
      Authorization: `Bearer ${session.sessionToken}`
    }
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.user.email).toBe("smoketest@one.ie");
});
```

**Test 4: OAuth Flow (GitHub)**
```javascript
test("Production smoke test: GitHub OAuth", async () => {
  // This test requires manual verification in CI/CD
  // Use headless browser to complete OAuth flow
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://web.one.ie/account/signin");
  await page.click('[data-testid="github-signin"]');

  // Automated GitHub login (test account)
  await page.waitForNavigation();
  await page.type("#login_field", process.env.TEST_GITHUB_USER);
  await page.type("#password", process.env.TEST_GITHUB_PASS);
  await page.click('[type="submit"]');

  // Verify redirect back to app
  await page.waitForNavigation();
  expect(page.url()).toContain("web.one.ie");

  await browser.close();
});
```

**Test 5: Rate Limiting**
```javascript
test("Production smoke test: Rate Limiting", async () => {
  const attempts = [];

  for (let i = 0; i < 10; i++) {
    attempts.push(
      fetch("https://api.one.ie/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpass"
        })
      })
    );
  }

  const responses = await Promise.all(attempts);
  const blocked = responses.filter(r => r.status === 429);

  expect(blocked.length).toBeGreaterThan(0); // Rate limiting active
});
```

**Acceptance Criteria:**
- [ ] All 5 smoke tests pass in production
- [ ] Tests run automatically after deployment
- [ ] Failed smoke test triggers rollback
- [ ] Smoke tests run every 15 minutes (health checks)
- [ ] Smoke test results visible in dashboard

### Monitoring & Metrics Dashboard

**Key Metrics to Track:**

**Authentication Metrics:**
```typescript
{
  // Login Success Rate
  login_success_rate: number; // Target: > 95%
  login_total: number;
  login_success: number;
  login_failed: number;

  // Signup Metrics
  signup_total: number;
  signup_success: number;
  signup_failed: number;

  // Session Metrics
  active_sessions: number;
  sessions_created_per_hour: number;
  average_session_duration: number; // Target: > 30 minutes

  // Security Metrics
  captcha_challenges_issued: number;
  captcha_success_rate: number; // Target: > 90%
  bot_attempts_blocked: number;
  pwned_passwords_rejected: number;

  // Performance Metrics
  auth_api_latency_p50: number; // Target: < 200ms
  auth_api_latency_p95: number; // Target: < 500ms
  auth_api_latency_p99: number; // Target: < 1000ms

  // Error Metrics
  error_rate_4xx: number; // Target: < 5%
  error_rate_5xx: number; // Target: < 0.1%

  // OAuth Metrics
  oauth_github_success_rate: number;
  oauth_google_success_rate: number;

  // 2FA Metrics
  totp_enabled_users: number;
  totp_success_rate: number;
}
```

**Dashboard Layout:**

```
┌─────────────────────────────────────────────────────┐
│  ONE Platform - Auth Metrics Dashboard             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Login Success Rate:  96.2% ✓ (Target: > 95%)     │
│  ████████████████████░░  96.2%                     │
│                                                     │
│  Active Sessions:  1,247                           │
│  Sessions Created (Last Hour):  83                 │
│                                                     │
│  API Latency (P95):  320ms ✓ (Target: < 500ms)    │
│  Error Rate (5xx):  0.03% ✓ (Target: < 0.1%)      │
│                                                     │
│  Bot Attempts Blocked (Today):  45                 │
│  Pwned Passwords Rejected:  12                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Recent Events (Last 10 minutes)                   │
├─────────────────────────────────────────────────────┤
│  ✓ user_login (user@example.com) - 2m ago         │
│  ✓ user_created (newuser@example.com) - 5m ago    │
│  ⚠ login_failed (test@test.com) - 7m ago          │
│  ✓ oauth_login (GitHub) - 8m ago                  │
│  ✓ captcha_verified (score: 0.9) - 9m ago         │
└─────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Dashboard accessible at `/admin/metrics`
- [ ] Real-time updates (refresh every 30 seconds)
- [ ] Metrics stored in Convex database
- [ ] Historical data queryable (30 days)
- [ ] Export to CSV/JSON
- [ ] Dark mode support
- [ ] Mobile responsive

### Alert Configuration

**Critical Alerts (Immediate Action):**

**Alert 1: High Error Rate**
```yaml
name: High 5xx Error Rate
condition: error_rate_5xx > 1%
duration: 5 minutes
severity: critical
channels:
  - slack: #auth-alerts
  - pagerduty: on-call-engineer
  - email: team@one.ie
message: |
  🚨 CRITICAL: Auth API error rate is {{ error_rate_5xx }}%

  Target: < 0.1%
  Current: {{ error_rate_5xx }}%

  Action: Check logs at https://logs.one.ie
  Runbook: https://docs.one.ie/runbooks/high-error-rate
```

**Alert 2: Low Login Success Rate**
```yaml
name: Low Login Success Rate
condition: login_success_rate < 90%
duration: 10 minutes
severity: high
channels:
  - slack: #auth-alerts
  - email: team@one.ie
message: |
  ⚠️ HIGH: Login success rate dropped to {{ login_success_rate }}%

  Target: > 95%
  Current: {{ login_success_rate }}%

  Possible causes:
  - Database connectivity issues
  - Captcha provider down
  - OAuth provider issues

  Action: Check status page and logs
```

**Alert 3: Unusual Bot Activity**
```yaml
name: High Bot Activity
condition: bot_attempts_blocked > 100 per hour
duration: 15 minutes
severity: medium
channels:
  - slack: #security-alerts
message: |
  🤖 MEDIUM: High bot activity detected

  Blocked: {{ bot_attempts_blocked }} attempts in last hour

  Action: Review captcha settings and rate limits
```

**Acceptance Criteria:**
- [ ] All 3+ critical alerts configured
- [ ] Alert routing tested (Slack, email, PagerDuty)
- [ ] Alert fatigue minimized (no duplicate alerts)
- [ ] Alert acknowledgment workflow
- [ ] Alert resolution tracking
- [ ] Alert runbooks linked

### Performance Benchmarks

**Baseline Performance Targets:**

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Signup (P95) | < 1s | < 2s | > 2s |
| Signin (P95) | < 500ms | < 1s | > 1s |
| Session Validation (P95) | < 100ms | < 200ms | > 200ms |
| OAuth Flow (P95) | < 3s | < 5s | > 5s |
| Password Reset Email (P95) | < 2s | < 5s | > 5s |
| 2FA Verification (P95) | < 300ms | < 500ms | > 500ms |

**Load Testing:**
```javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 50 },   // Ramp up to 50 users
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

export default function () {
  // Test login endpoint
  const payload = JSON.stringify({
    email: `test${__VU}@example.com`,
    password: 'TestPassword123!',
  });

  const res = http.post('https://api.one.ie/auth/signin', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Acceptance Criteria:**
- [ ] Load test passes with 100 concurrent users
- [ ] No degradation under normal load
- [ ] Graceful degradation under high load
- [ ] Auto-scaling tested (if applicable)
- [ ] Database query performance optimized

### Complete Feature Documentation

**Documentation Deliverables:**

1. **README.md** (Updated)
   - [ ] Better Auth integration documented
   - [ ] All available features listed
   - [ ] Quick start guide
   - [ ] Environment variables documented

2. **API Documentation** (`/api/docs`)
   - [ ] OpenAPI 3.0 spec complete (Cycle 98)
   - [ ] All endpoints documented
   - [ ] Examples provided

3. **Admin Guide** (`/docs/admin-guide.md`)
   - [ ] User management
   - [ ] Organization management
   - [ ] Security settings
   - [ ] Monitoring dashboard

4. **Developer Guide** (`/docs/developer-guide.md`)
   - [ ] Authentication flows
   - [ ] API integration examples
   - [ ] TypeScript types
   - [ ] Testing guide

5. **Runbooks** (`/docs/runbooks/`)
   - [ ] High error rate
   - [ ] Database connectivity issues
   - [ ] OAuth provider failures
   - [ ] Security incident response

6. **Security Policy** (`SECURITY.md`)
   - [ ] Vulnerability reporting
   - [ ] Responsible disclosure
   - [ ] Security best practices
   - [ ] Compliance (GDPR, SOC 2)

**Acceptance Criteria:**
- [ ] All 6 documentation types complete
- [ ] Documentation is up-to-date
- [ ] Code examples tested and working
- [ ] Screenshots/diagrams included
- [ ] Version controlled in git
- [ ] Published to docs.one.ie

### Roadmap Archival

**Final Checklist:**
- [ ] All 100 cycles completed
- [ ] All features tested and working
- [ ] All documentation complete
- [ ] Production deployment successful
- [ ] Monitoring active and validated
- [ ] Team trained on new features

**Archive Process:**
```bash
# 1. Tag release
git tag -a v1.0.0-better-auth -m "Complete Better Auth Implementation (100 cycles)"

# 2. Create archive branch
git checkout -b archive/better-auth-roadmap-complete
git push origin archive/better-auth-roadmap-complete

# 3. Update roadmap status
# Mark roadmap as "Complete" in frontmatter

# 4. Create completion summary
# Document final metrics, lessons learned, next steps

# 5. Celebrate! 🎉
echo "Better Auth implementation complete!"
```

**Completion Summary Template:**
```markdown
# Better Auth Implementation - Completion Summary

**Completion Date:** 2025-11-XX
**Total Cycles:** 100
**Total Time:** XX days
**Team Size:** X engineers

## Final Metrics

- **Total Users:** X,XXX
- **Active Sessions:** X,XXX
- **Login Success Rate:** XX%
- **API Latency (P95):** XXms
- **Error Rate:** X.XX%

## Features Delivered

✅ 15 OAuth providers
✅ Passkeys/WebAuthn
✅ Organizations & Teams
✅ Admin role system
✅ API key authentication
✅ Stripe subscriptions
✅ Web3 wallet auth (SIWE)
✅ Enterprise SSO (SAML, OIDC)
✅ Captcha protection
✅ HIBP password checking
✅ Complete API documentation
✅ Production monitoring

## Lessons Learned

1. **What went well:**
   - Cycle-based planning kept us focused
   - 6-dimension ontology provided structure
   - Parallel execution saved time

2. **What could improve:**
   - Earlier testing would catch issues faster
   - Better estimation for OAuth provider setup
   - More automation in deployment

3. **Surprises:**
   - HIBP k-anonymity was easier than expected
   - Captcha integration seamless
   - Load testing revealed optimization opportunities

## Next Steps

- [ ] Monitor production metrics for 30 days
- [ ] Address any post-launch issues
- [ ] Plan Phase 8: Advanced Enterprise Features
- [ ] User feedback collection and iteration

**Status:** 🎉 COMPLETE AND CELEBRATED!
```

---

## Summary: Success Criteria for Phase 7

### Cycle 95: Captcha Protection ✓
- [ ] Invisible reCAPTCHA v3 on signup (< 3s total time)
- [ ] Bot attempts blocked (403 response)
- [ ] Low score triggers challenge (< 10s completion)
- [ ] Strategy documented (invisible → visible escalation)
- [ ] Events logged (`captcha_verified`, `bot_blocked`)
- [ ] Privacy-preserving (GDPR compliant)

### Cycle 96: Have I Been Pwned ✓
- [ ] HIBP check on signup (< 4s total time)
- [ ] k-anonymity model (only hash prefix sent)
- [ ] Pwned password warning (clear, actionable)
- [ ] Proactive password change suggestion
- [ ] Fallback strategy (HIBP unavailable)
- [ ] Events logged (`password_checked`, `pwned_password_blocked`)

### Cycle 98: OpenAPI Documentation ✓
- [ ] Swagger UI at `/api/docs` (< 2s load)
- [ ] All 40+ endpoints documented
- [ ] Request/response schemas complete
- [ ] Authentication examples (curl, JS, Python)
- [ ] Try-it-out feature works
- [ ] Mobile-responsive design

### Cycle 99: Security Audit ✓
- [ ] OWASP Top 10 tested (all pass)
- [ ] Penetration testing complete (0 critical/high)
- [ ] Automated scans pass (ZAP, Burp Suite, npm audit)
- [ ] Manual testing complete (session, CSRF, XSS)
- [ ] Audit report generated
- [ ] All critical findings fixed

### Cycle 100: Production Deployment ✓
- [ ] Environment variables configured
- [ ] Smoke tests pass (5/5)
- [ ] Monitoring dashboard live
- [ ] Alerts configured (Slack, email, PagerDuty)
- [ ] Performance benchmarks met
- [ ] Complete documentation
- [ ] Roadmap archived
- [ ] CELEBRATED! 🎉

---

## Phase 7 Quality Gate

**This phase CANNOT proceed to implementation until:**
1. ✅ This specification reviewed and approved
2. ✅ Security requirements understood
3. ✅ Test cases reviewed by security team
4. ✅ Monitoring infrastructure ready
5. ✅ Documentation templates prepared

**This phase CANNOT be marked complete until:**
1. ✅ All user flows pass within time budgets
2. ✅ All acceptance criteria met
3. ✅ All technical tests pass (unit, integration, E2E)
4. ✅ Security audit passes (0 critical/high findings)
5. ✅ Production smoke tests pass
6. ✅ Monitoring active and validated
7. ✅ Documentation complete and published

---

**Quality Agent Validation:** This specification maps all Phase 7 features to the 6-dimension ontology, defines measurable success criteria, and ensures production-readiness through comprehensive testing and monitoring.

**Next Step:** Review this specification → Approve → Begin implementation of Cycle 95 (Captcha Protection)

**Estimated Time to Complete Phase 7:** 2-3 days with proper parallel execution

---

**Built with security, monitoring, and production excellence in mind.**
