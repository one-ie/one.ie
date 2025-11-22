---
title: Better Auth Complete Implementation - 100 Cycle Roadmap
dimension: things
category: plans
tags: auth, better-auth, security, roadmap, convex
related_dimensions: people, knowledge, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
session_id: 01QMzqbMmdUc4fQx4zL1AEDT
ai_context: |
  This document is part of the things dimension in the plans category.
  Location: one/things/plans/better-auth-roadmap.md
  Purpose: 100-cycle roadmap to implement complete Better Auth system
  Related dimensions: people, knowledge, events
  For AI agents: Read this to understand the Better Auth implementation roadmap.
---

# Better Auth Complete Implementation - 100 Cycle Roadmap

**Status:** Planning
**Session ID:** 01QMzqbMmdUc4fQx4zL1AEDT
**Branch:** `claude/better-auth-roadmap-01QMzqbMmdUc4fQx4zL1AEDT`

## Overview

This roadmap implements a complete, production-ready Better Auth system following the 6-dimension ontology and cycle-based planning methodology.

**Current State:** Hybrid auth system (custom backend + Better Auth UI)
**Target State:** Full Better Auth Convex component integration with ALL Better Auth plugins
**Total Cycles:** 100

## Better Auth Architecture: Users vs Accounts

**Critical Concept:** Better Auth separates **Users** (profiles) from **Accounts** (authentication methods).

### User Table
- Stores user **profile information**: name, email, image, phone, etc.
- Represents the **person** using the system
- One user = one identity in your application

### Account Table
- Stores **authentication credentials**: passwords, OAuth tokens, provider info
- Represents **how** a user authenticates
- One user can have **multiple accounts** (email/password + GitHub + Google)

### Why This Matters
This architecture enables:
1. **Account Linking**: Users can sign in with email OR GitHub OR Google (all linked to one user)
2. **Credential Security**: Passwords stored separately from profile data
3. **Multi-Provider Support**: Users can add/remove authentication methods
4. **Flexibility**: Can change authentication logic without touching user profiles

### Implementation in 6-Dimension Ontology
- **User** → Maps to `things` table (type: 'creator')
- **Accounts** → Maps to `connections` table (type: 'linked_account')
- Multiple accounts per user = Multiple connections to one thing

**Example:**
```
User ID: user_123
├── Account 1: Email/Password (account_email_456)
├── Account 2: GitHub OAuth (account_github_789)
└── Account 3: Google OAuth (account_google_012)
```

All three accounts authenticate the same user (`user_123`), but through different methods.

---

## Session Management

**Better Auth uses cookie-based session management** with the following characteristics:

### Cookie Storage
- Session tokens stored in **httpOnly, secure cookies** (signed with `BETTER_AUTH_SECRET`)
- Cookies also store OAuth state, PKCE verifiers, and other auth data
- Automatically secure in production mode

### Session Lifecycle
- **Default expiration**: 7 days
- **Auto-refresh**: Sessions extend when `updateAge` is reached
- **Session endpoints**:
  - `/get-session` - Validate current session
  - `/list-sessions` - List all user sessions
  - `/revoke-session` - Revoke specific session
  - `/revoke-sessions` - Revoke all sessions
  - `/revoke-other-sessions` - Revoke all except current

### Cookie Caching (Performance Optimization)
- Stores session data in short-lived signed cookie (like JWT access tokens)
- Reduces database lookups on every request
- Three strategies available:
  - **compact** (default) - Minimal data in cookie
  - **jwt** - JWT-encoded session data
  - **jwe** - Encrypted JWT session data
- Enable with `session.cookieCache.enabled = true`

### Implementation in Roadmap
- **Cycle 82**: Multi-session management UI (list/revoke sessions)
- **Phase 2**: Cookie-based sessions (automatic with Better Auth migration)

---

## TypeScript Type Safety

**Better Auth is fully type-safe** with automatic type inference:

### Type Inference with $Infer
```typescript
import { authClient } from "./auth-client";

// Automatically infer extended types from plugins
type User = typeof authClient.$Infer.User;
type Session = typeof authClient.$Infer.Session;
```

### Plugin Type Extensions
- Plugins automatically extend base types (User, Session, Account)
- Type inference works across client and server
- Full TypeScript strict mode support

### Separate Client/Server Projects
**Two approaches:**

1. **Same project**: Use `inferAdditionalFields` plugin (automatic type sync)
2. **Separate projects**: Manually specify additional fields in client config

```typescript
// Client in separate project - manual type specification
export const authClient = createAuthClient<{
  user: {
    id: string;
    email: string;
    customField: string; // Manually keep in sync with server
  }
}>({
  baseURL: "https://api.example.com"
});
```

### Implementation in Roadmap
- **Phase 2**: TypeScript type safety configured during Better Auth migration
- All cycles maintain strict TypeScript compliance

---

## Hooks (Lifecycle Events)

**Hooks allow custom logic without writing full plugins**:

### Endpoint Hooks
- **Before hooks**: Run before endpoint execution
  - Validate/modify requests
  - Pre-validate data
  - Return early (abort operation)

- **After hooks**: Run after endpoint execution
  - Modify responses
  - Log events
  - Trigger side effects

### Database Hooks
Available for `user`, `session`, and `account` models:

```typescript
betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Validate user data
          // Return false to abort creation
        },
        after: async (user) => {
          // Send welcome email
          // Log user creation event
        }
      }
    }
  }
});
```

### Organization Hooks
- Before/after organization creation
- Before/after team member addition
- Before/after role changes

### Implementation in Roadmap
- **Cycle 20**: Configure hooks during Better Auth setup
- **Cycle 64**: Organization hooks for team management
- **Phase 7**: Hooks for logging and monitoring

### Example Use Cases
1. **Email validation** - Before user creation
2. **Login tracking** - After session creation (Last Login Method)
3. **Event logging** - After all operations (maps to events dimension)
4. **Multi-tenant scoping** - Before data access (add groupId)
5. **Welcome emails** - After user signup
6. **Audit trails** - After admin actions

---

## Better Auth Plugins to Implement

### Core Authentication
- ✅ Two Factor (TOTP) - Phase 2
- ⏳ Username - Phase 3
- ⏳ Anonymous - Phase 5
- ⏳ Phone Number - Phase 5
- ✅ Magic Link - Phase 2
- ⏳ Email OTP - Phase 3
- ✅ Passkey - Phase 3
- ⏳ Generic OAuth - Phase 3
- ⏳ One Tap (Google) - Phase 3
- ✅ Sign In With Ethereum - Phase 5

### Authorization & Admin
- ⏳ Admin Role System - Phase 4
- ⏳ API Key Authentication - Phase 5
- ⏳ MCP (Model Context Protocol) - Phase 6
- ⏳ Bearer Token Auth - Phase 5

### Organization & Enterprise
- ✅ Organization - Phase 4
- ✅ Enterprise SSO - Phase 6
- ⏳ OIDC Provider (as auth server) - Phase 6
- ⏳ SCIM (user provisioning) - Phase 6

### Security & Utility
- ⏳ Device Authorization (OAuth) - Phase 5
- ⏳ Captcha - Phase 7
- ⏳ SQL Injection Protection - Phase 1
- ⏳ Have I Been Pwned - Phase 7
- ⏳ Last Login Method Tracking - Phase 7
- ⏳ Multi Session Management - Phase 7
- ⏳ OAuth Proxy - Phase 6
- ⏳ One-Time Token - Phase 5
- ⏳ Open API Documentation - Phase 7
- ⏳ JWT Support - Phase 5

### 3rd Party Integrations
- ✅ Stripe Subscriptions - Phase 5

---

## Phase 1: Security Foundation (Cycles 1-15)

### CRITICAL SECURITY FIXES

**Cycle 1:** Audit current password hashing implementation
- Read `convex/auth.ts` password hashing code
- Document SHA-256 usage and security implications
- Identify all password-related mutations

**Cycle 2:** Design Argon2 migration strategy
- Plan password re-hashing on next user login
- Design backward compatibility for existing users
- Document migration approach

**Cycle 3:** Install Argon2 dependencies
- Add `@node-rs/argon2` to backend dependencies
- Verify compatibility with Convex runtime
- Test Argon2 hashing performance

**Cycle 4:** Implement Argon2 password hashing
- Replace SHA-256 with Argon2id in signUp mutation
- Update signIn to support both SHA-256 and Argon2 (migration)
- Add rehashing on successful login

**Cycle 5:** Test password hashing migration
- Test new user registration with Argon2
- Test existing user login with SHA-256
- Test password rehashing on login
- Verify session creation

**Cycle 6:** Design rate limiting strategy
- Identify endpoints requiring rate limiting (login, signup, password reset)
- Define rate limit thresholds (attempts per IP, per user)
- Document rate limiting approach

**Cycle 7:** Implement basic rate limiting
- Create rate limit tracking table
- Add rate limit check middleware
- Implement exponential backoff

**Cycle 8:** Add rate limiting to auth endpoints
- Apply rate limiting to signIn mutation
- Apply rate limiting to signUp mutation
- Apply rate limiting to password reset

**Cycle 9:** Test rate limiting functionality
- Test brute force protection on login
- Test rate limit headers in responses
- Test rate limit reset after timeout

**Cycle 10:** Design CSRF protection strategy
- Research CSRF token generation
- Plan token storage and validation
- Document CSRF protection approach

**Cycle 11:** Implement CSRF token generation
- Create CSRF token generation utility
- Add token to session creation
- Store tokens in httpOnly cookies

**Cycle 12:** Add CSRF validation to mutations
- Validate CSRF tokens in state-changing operations
- Return 403 on invalid tokens
- Add CSRF token to response headers

**Cycle 13:** Update frontend for CSRF tokens
- Extract CSRF token from cookies
- Include token in mutation requests
- Handle CSRF validation errors

**Cycle 14:** Test CSRF protection
- Test token validation on mutations
- Test cross-origin request blocking
- Test token rotation on session changes

**Cycle 14:** Implement SQL injection protection
- Add input validation for all auth endpoints
- Use parameterized queries (Convex does this by default)
- Add ';-- (SQL comment) detection and blocking
- Test for SQL injection vulnerabilities

**Cycle 15:** Security audit checkpoint
- Verify Argon2 password hashing active
- Verify rate limiting working
- Verify CSRF protection enabled
- Verify SQL injection protection
- Document security improvements

---

## Phase 2: Better Auth Migration (Cycles 16-35)

### MIGRATE TO BETTER AUTH CONVEX COMPONENT

**Cycle 16:** Read Better Auth Convex adapter documentation
- Study `@convex-dev/better-auth` adapter API
- Understand database model generation
- Review migration requirements

**Cycle 17:** Create Better Auth server configuration
- Create `convex/auth.ts` with Better Auth instance
- Configure `baseURL` and `secret`
- Set up email/password provider

**Cycle 18:** Configure OAuth providers in Better Auth
- Migrate GitHub OAuth to Better Auth config
- Migrate Google OAuth to Better Auth config
- Verify callback URLs

**Cycle 19:** Set up Better Auth HTTP routes
- Create `convex/http.ts` router
- Register Better Auth routes
- Test route registration

**Cycle 20:** Create Better Auth adapter integration
- Configure Convex adapter in Better Auth
- Connect to Better Auth component
- Generate database schema

**Cycle 21:** Test basic Better Auth functionality
- Test email/password signup via Better Auth
- Test email/password signin via Better Auth
- Verify session creation

**Cycle 22:** Migrate GitHub OAuth to Better Auth
- Update OAuth configuration
- Test GitHub login flow
- Verify account creation

**Cycle 23:** Migrate Google OAuth to Better Auth
- Update OAuth configuration
- Test Google login flow
- Verify account linking

**Cycle 24:** Update auth client to Better Auth
- Update `web/src/lib/auth-client.ts`
- Configure Better Auth React client
- Add Convex plugin

**Cycle 25:** Update sign-in page for Better Auth
- Modify `SignInPage.tsx` to use Better Auth client
- Update API calls to Better Auth endpoints
- Test sign-in functionality

**Cycle 26:** Update sign-up page for Better Auth
- Modify `SignUpPage.tsx` to use Better Auth client
- Update API calls to Better Auth endpoints
- Test sign-up functionality

**Cycle 27:** Migrate password reset to Better Auth
- Update forgot password flow
- Update reset password flow
- Test password reset end-to-end

**Cycle 28:** Migrate magic link to Better Auth
- Configure magic link plugin
- Update magic link request form
- Update magic link verification

**Cycle 29:** Migrate 2FA to Better Auth
- Configure two-factor plugin
- Update 2FA settings component
- Test TOTP setup and verification

**Cycle 30:** Update middleware for Better Auth
- Modify `web/src/middleware.ts`
- Use Better Auth session checking
- Update `Astro.locals` types

**Cycle 31:** Update all auth pages to Better Auth
- Update `/account/signin.astro`
- Update `/account/signup.astro`
- Update all other account pages

**Cycle 32:** Test complete Better Auth migration
- Test email/password flows
- Test OAuth flows
- Test magic link flows
- Test 2FA flows

**Cycle 33:** Remove custom auth mutations
- Archive old `convex/auth.ts` custom mutations
- Remove unused auth utilities
- Clean up old session management

**Cycle 34:** Update API routes for Better Auth
- Verify `/api/auth/[...all].ts` works with Better Auth
- Remove custom OAuth callback routes
- Test API route proxying

**Cycle 35:** Better Auth migration checkpoint
- Verify all auth flows work with Better Auth
- Document migration completed
- Run end-to-end auth tests

---

## Phase 3: Passkeys/WebAuthn (Cycles 36-45)

### PASSWORDLESS AUTHENTICATION

**Cycle 36:** Read Better Auth passkey documentation
- Study passkey plugin API
- Understand WebAuthn requirements
- Review browser compatibility

**Cycle 37:** Install passkey plugin dependencies
- Add `@simplewebauthn/server` if needed
- Configure passkey plugin in Better Auth
- Verify Convex compatibility

**Cycle 38:** Enable passkey plugin in Better Auth
- Add passkey plugin to Better Auth config
- Configure relying party settings
- Test plugin initialization

**Cycle 39:** Create passkey registration component
- Design `PasskeyRegistration.tsx` UI
- Implement registration flow
- Add to account settings

**Cycle 40:** Create passkey authentication component
- Design `PasskeySignIn.tsx` UI
- Implement authentication flow
- Add to sign-in page

**Cycle 41:** Implement passkey registration backend
- Create passkey registration mutation
- Store passkey credentials
- Handle registration errors

**Cycle 42:** Implement passkey authentication backend
- Create passkey authentication query
- Verify passkey credentials
- Create session on success

**Cycle 43:** Add passkey management UI
- List registered passkeys
- Delete passkey functionality
- Rename passkey functionality

**Cycle 44:** Test passkey flows end-to-end
- Test passkey registration
- Test passkey authentication
- Test multiple passkeys per user

**Cycle 45:** Add username authentication plugin
- Enable username plugin in Better Auth
- Update sign-up form to include username field
- Add username validation (uniqueness, format)
- Test username-based login

**Cycle 46:** Implement Email OTP plugin
- Enable Email OTP plugin in Better Auth
- Configure email sending for OTP codes
- Create OTP verification UI
- Test Email OTP flow

**Cycle 47:** Add Generic OAuth plugin
- Enable Generic OAuth plugin
- Configure additional OAuth providers (Twitter, LinkedIn, Microsoft)
- Create provider configuration UI
- Test generic OAuth flows

**Cycle 48:** Implement Google One Tap
- Enable One Tap plugin in Better Auth
- Add One Tap button to sign-in page
- Configure Google One Tap credentials
- Test One Tap authentication

**Cycle 49:** Phase 3 checkpoint
- Verify passkey registration works
- Verify passkey authentication works
- Verify username login works
- Verify Email OTP works
- Verify generic OAuth works
- Verify One Tap works
- Document passwordless features

---

## Phase 4: Organizations, Teams & Admin (Cycles 50-64)

### MULTI-TENANT FEATURES & ADMIN SYSTEM

**Cycle 50:** Read Better Auth organizations documentation
- Study organizations plugin API
- Understand team/member model
- Review role-based access control

**Cycle 51:** Enable organizations plugin
- Add organizations plugin to Better Auth config
- Configure organization settings
- Generate organization tables

**Cycle 52:** Map organizations to 6-dimension ontology
- Align Better Auth organizations with groups dimension
- Design integration with existing groups table
- Document mapping strategy

**Cycle 53:** Create organization creation UI
- Design `CreateOrganization.tsx` component
- Implement organization creation form
- Add validation

**Cycle 54:** Implement organization creation backend
- Create organization mutation
- Link organization to user
- Set user as organization owner

**Cycle 55:** Create organization settings page
- Design `/account/organizations/[id]/settings.astro`
- Display organization details
- Add edit functionality

**Cycle 56:** Implement team invitation system
- Create team invitation component
- Send invitation emails
- Generate invitation tokens

**Cycle 57:** Create team invitation acceptance flow
- Design invitation acceptance page
- Verify invitation tokens
- Add member to organization

**Cycle 58:** Implement admin role system
- Enable Admin plugin in Better Auth
- Define admin roles (platform_owner, org_owner, org_admin)
- Create admin middleware and guards
- Add admin dashboard route

**Cycle 59:** Create admin panel UI
- Design admin dashboard
- Add user management (list, edit, delete)
- Add organization management
- Add system settings

**Cycle 60:** Implement role-based access control
- Create role checking utilities
- Protect admin routes by role
- Add permission system (CRUD permissions)
- Test role enforcement

**Cycle 61:** Create organization member management UI
- List organization members
- Change member roles
- Remove members
- Invite new members

**Cycle 62:** Add organization switcher UI
- Create organization dropdown
- Switch active organization
- Store organization context
- Update UI based on active org

**Cycle 63:** Integrate organizations with existing features
- Scope products to organizations
- Scope content to organizations
- Update existing queries for multi-tenancy
- Add groupId to all relevant tables

**Cycle 64:** Test organization and admin flows
- Test organization creation
- Test team invitations
- Test role management
- Test admin panel
- Organizations & admin checkpoint

---

## Phase 5: Advanced Features (Cycles 65-83)

### SUBSCRIPTIONS, WEB3, PHONE AUTH, API KEYS, OAUTH PROVIDERS

**Cycle 65:** Add additional OAuth providers
- Configure Apple Sign In (OAuth)
- Configure Notion OAuth
- Configure Facebook Login
- Configure Discord OAuth
- Configure Figma OAuth
- Test all new OAuth providers

**Cycle 66:** Implement Phone Number authentication
- Enable Phone Number plugin
- Add phone number to sign-up form
- Implement SMS verification for phone
- Test phone-based login

**Cycle 67:** Implement Anonymous authentication
- Enable Anonymous plugin in Better Auth
- Create guest account creation flow
- Add convert guest to user functionality
- Test anonymous session management

**Cycle 68:** Read Better Auth subscription documentation
- Study subscription plugin API
- Understand Stripe integration
- Review subscription lifecycle

**Cycle 69:** Configure subscription plugin
- Add subscription plugin to Better Auth
- Set up Stripe webhook endpoints
- Configure subscription tiers (free, pro, enterprise)

**Cycle 70:** Create subscription management UI
- Design subscription plans page
- Display current subscription
- Add upgrade/downgrade buttons
- Add billing portal link

**Cycle 71:** Implement subscription purchase flow
- Create Stripe checkout integration
- Handle subscription webhooks
- Update user subscription status
- Test subscription creation

**Cycle 72:** Read Web3 authentication documentation
- Study Sign In With Ethereum (SIWE)
- Review `walletAddress` table schema
- Understand wallet signature verification

**Cycle 73:** Install Web3 authentication dependencies
- Add `ethers` or `viem` library
- Configure SIWE plugin in Better Auth
- Verify compatibility with Convex

**Cycle 74:** Create wallet connection UI
- Design `WalletConnect.tsx` component
- Implement MetaMask connection
- Implement WalletConnect protocol
- Add Coinbase Wallet support

**Cycle 75:** Implement wallet authentication backend
- Create wallet signature verification mutation
- Link wallet address to user account
- Create session on successful verification
- Support multiple wallets per user

**Cycle 76:** Implement API Key authentication
- Enable API Key plugin in Better Auth
- Create API key generation UI
- Add API key to settings page
- Implement API key validation middleware

**Cycle 77:** Create API key management UI
- List user's API keys
- Generate new API key
- Revoke API key
- Set API key expiration
- Test API key authentication

**Cycle 78:** Implement Bearer token authentication
- Enable Bearer plugin in Better Auth
- Configure token generation
- Add token refresh endpoint
- Test Bearer token auth

**Cycle 79:** Implement JWT support
- Enable JWT plugin in Better Auth
- Configure JWT signing and verification
- Create JWT token endpoint
- Add JWT to API responses
- Test JWT authentication

**Cycle 80:** Implement One-Time Token plugin
- Enable One-Time Token plugin
- Create OTT generation for email links
- Add OTT verification endpoint
- Test one-time token flows

**Cycle 81:** Implement Device Authorization flow
- Enable Device Authorization plugin (OAuth 2.0)
- Create device code generation endpoint
- Add device verification UI
- Test device authorization (TV, IoT devices)

**Cycle 82:** Implement session management UI
- Create active sessions list page
- Display device, location, last active, IP address
- Add revoke session functionality
- Add revoke all sessions button
- Test multi-session management

**Cycle 83:** Phase 5 checkpoint
- Verify all OAuth providers work
- Verify subscription management works
- Verify Web3 authentication works
- Verify API key auth works
- Verify JWT auth works
- Document advanced features

---

## Phase 6: Enterprise, SSO & MCP (Cycles 84-94)

### ENTERPRISE AUTHENTICATION & INTEGRATIONS

**Cycle 84:** Read Better Auth SSO documentation
- Study SSO provider configuration
- Understand SAML vs OIDC
- Review enterprise requirements (Okta, Auth0, Azure AD)

**Cycle 85:** Implement SAML authentication
- Configure SAML plugin
- Create SAML metadata endpoint
- Test SAML flow with test IdP
- Add SAML provider to sign-in page

**Cycle 86:** Implement OIDC authentication (as client)
- Configure OIDC plugin for enterprise providers
- Create OIDC discovery endpoint
- Test OIDC flow
- Support multiple OIDC providers

**Cycle 87:** Implement OIDC Provider (as auth server)
- Enable OIDC Provider plugin
- Configure authorization server endpoints
- Create consent screen
- Issue ID tokens and access tokens
- Test with OIDC client

**Cycle 88:** Add Just-in-Time (JIT) provisioning
- Auto-create users from SSO
- Map SSO attributes to user fields
- Assign default roles based on SSO claims
- Test JIT user creation

**Cycle 89:** Implement SCIM user provisioning
- Enable SCIM plugin in Better Auth
- Create SCIM endpoints (Users, Groups)
- Implement SCIM user lifecycle (Create, Update, Delete)
- Test with Azure AD SCIM integration

**Cycle 90:** Implement OAuth Proxy plugin
- Enable OAuth Proxy plugin
- Create proxy configuration for external OAuth providers
- Add token exchange functionality
- Test OAuth proxy flows

**Cycle 91:** Implement MCP (Model Context Protocol) integration
- Enable MCP plugin in Better Auth
- Configure MCP server endpoints
- Create MCP authentication flows
- Add MCP to AI agent authentication
- Test MCP integration

**Cycle 92:** Create SSO admin dashboard
- Design SSO management UI (admin only)
- Add SSO provider configuration form
- List configured SSO providers
- View SSO usage statistics and logs
- Add domain verification UI

**Cycle 93:** Implement domain verification
- Create domain verification process (DNS/email)
- Restrict SSO to verified domains
- Add verified domain management
- Test domain verification flow

**Cycle 94:** Test all enterprise features
- Test SAML authentication end-to-end
- Test OIDC client authentication
- Test OIDC provider (as auth server)
- Test SCIM provisioning
- Test MCP integration
- Enterprise features checkpoint

---

## Phase 7: Polish, Security & Production (Cycles 95-100)

### FINAL SECURITY, UTILITIES & DEPLOYMENT

**Cycle 95:** Implement Captcha protection
- Enable Captcha plugin in Better Auth
- Add reCAPTCHA v3 to sign-up form
- Add hCaptcha as alternative
- Configure captcha verification
- Test bot protection

**Cycle 96:** Implement Have I Been Pwned integration
- Enable HIBP plugin in Better Auth
- Check passwords against pwned database on signup
- Warn users about compromised passwords
- Force password change for pwned passwords
- Test HIBP integration

**Cycle 97:** Implement Last Login Method tracking
- Add last login method to user schema
- Track login method (email, OAuth provider, passkey)
- Display last login info in settings
- Add last login timestamp
- Show login history

**Cycle 98:** Create Open API documentation
- Enable Open API plugin
- Generate OpenAPI 3.0 spec for all auth endpoints
- Create Swagger UI for API docs
- Document all request/response schemas
- Add authentication examples

**Cycle 99:** Comprehensive security audit & testing
- Review all authentication flows for OWASP Top 10
- Verify rate limiting on all endpoints
- Test for session fixation vulnerabilities
- Test CSRF protection
- Test SQL injection protection
- Penetration testing

**Cycle 100:** Production deployment & final checkpoint
- Deploy Better Auth to production
- Verify all environment variables
- Run smoke tests on production
- Set up monitoring and alerts (login success rate, errors)
- Create auth metrics dashboard
- Document all features and configurations
- Archive roadmap as completed
- Celebrate! 🎉

---

## Feature Matrix

### Core Authentication Features
| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **Email/Password** | ✅ Custom | 16-35 | Migration |
| **Argon2 Hashing** | ❌ SHA-256 | 1-5 | Critical |
| **Username Login** | ❌ | 45 | New |
| **Rate Limiting** | ❌ | 6-9 | Critical |
| **CSRF Protection** | ❌ | 10-14 | Critical |
| **SQL Injection Protection** | ⚠️ Basic | 14 | Enhancement |
| **Magic Links** | ✅ Custom | 28 | Migration |
| **Email OTP** | ❌ | 46 | New |
| **Anonymous Auth** | ❌ | 67 | New |
| **Phone Number Auth** | ❌ | 66 | New |

### OAuth & Social Providers
| Provider | Current | Cycle | Status |
|----------|---------|-------|--------|
| **GitHub** | ✅ Custom | 22 | Migration |
| **Google** | ✅ Custom | 23 | Migration |
| **Google One Tap** | ❌ | 48 | New |
| **Apple** | ❌ | 65 | New |
| **Facebook** | ❌ | 65 | New |
| **Discord** | ❌ | 65 | New |
| **Notion** | ❌ | 65 | New |
| **Figma** | ❌ | 65 | New |
| **Generic OAuth** | ❌ | 47 | New |

### Security & 2FA
| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **TOTP 2FA** | ✅ Custom | 29 | Migration |
| **SMS 2FA** | ❌ | 66 | New |
| **Passkeys (WebAuthn)** | ❌ | 36-44 | New |
| **Captcha Protection** | ❌ | 95 | New |
| **Have I Been Pwned** | ❌ | 96 | New |

### Organizations & Teams
| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **Organizations** | ❌ | 50-64 | New |
| **Teams** | ❌ | 50-64 | New |
| **Admin Role System** | ❌ | 58-60 | New |
| **Invitations** | ❌ | 56-57 | New |
| **Multi-tenancy** | ❌ | 63 | New |

### API & Token Authentication
| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **API Key Auth** | ❌ | 76-77 | New |
| **Bearer Token** | ❌ | 78 | New |
| **JWT Support** | ❌ | 79 | New |
| **One-Time Token** | ❌ | 80 | New |
| **Device Authorization** | ❌ | 81 | New |

### Advanced Features
| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **Stripe Subscriptions** | ❌ | 68-71 | New |
| **Web3 Wallets (SIWE)** | ❌ | 72-75 | New |
| **Session Management UI** | ⚠️ Basic | 82 | Enhancement |
| **Last Login Tracking** | ❌ | 97 | New |

### Enterprise Features
| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **SAML SSO** | ❌ | 85 | New |
| **OIDC (Client)** | ❌ | 86 | New |
| **OIDC Provider (Server)** | ❌ | 87 | New |
| **JIT Provisioning** | ❌ | 88 | New |
| **SCIM Provisioning** | ❌ | 89 | New |
| **OAuth Proxy** | ❌ | 90 | New |
| **MCP Integration** | ❌ | 91 | New |

### Documentation & Tooling
| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **Open API Docs** | ❌ | 98 | New |
| **Monitoring Dashboard** | ❌ | 100 | New |

---

## Dependencies

### NPM Packages (Already Installed)
- ✅ `better-auth` - v1.3.23 (Core authentication library)
- ✅ `@daveyplate/better-auth-ui` - v3.2.5 (Pre-built UI components)
- ✅ `@convex-dev/better-auth` - v0.9.7 (Convex adapter)
- ✅ `convex` - v1.17.4 (Backend database)

### Security Packages (Phase 1)
- `@node-rs/argon2` - Argon2id password hashing (Cycle 3)

### Authentication Plugins (Phase 3)
- `@simplewebauthn/server` - WebAuthn/Passkeys (Cycle 37)
- Better Auth plugins (built-in):
  - `better-auth/plugins/username` (Cycle 45)
  - `better-auth/plugins/email-otp` (Cycle 46)
  - `better-auth/plugins/generic-oauth` (Cycle 47)
  - `better-auth/plugins/one-tap` (Cycle 48)

### Organization & Admin (Phase 4)
- Better Auth plugins (built-in):
  - `better-auth/plugins/organization` (Cycle 51)
  - `better-auth/plugins/admin` (Cycle 58)

### Advanced Features (Phase 5)
- `ethers` or `viem` - Web3/Ethereum authentication (Cycle 73)
- `twilio` or `vonage` - SMS provider for Phone auth (Cycle 66)
- Better Auth plugins (built-in):
  - `better-auth/plugins/phone-number` (Cycle 66)
  - `better-auth/plugins/anonymous` (Cycle 67)
  - `better-auth/plugins/subscription` (Cycle 69)
  - `better-auth/plugins/api-key` (Cycle 76)
  - `better-auth/plugins/bearer` (Cycle 78)
  - `better-auth/plugins/jwt` (Cycle 79)
  - `better-auth/plugins/one-time-token` (Cycle 80)
  - `better-auth/plugins/device-authorization` (Cycle 81)

### Enterprise Features (Phase 6)
- `saml2-js` or `passport-saml` - SAML authentication (Cycle 85)
- Better Auth plugins (built-in):
  - `better-auth/plugins/oidc` (Cycle 86)
  - `better-auth/plugins/oidc-provider` (Cycle 87)
  - `better-auth/plugins/scim` (Cycle 89)
  - `better-auth/plugins/oauth-proxy` (Cycle 90)
  - `better-auth/plugins/mcp` (Cycle 91)

### Security & Utilities (Phase 7)
- `@google-cloud/recaptcha-enterprise` or `hcaptcha` - Bot protection (Cycle 95)
- Better Auth plugins (built-in):
  - `better-auth/plugins/captcha` (Cycle 95)
  - `better-auth/plugins/hibp` (Have I Been Pwned) (Cycle 96)
  - `better-auth/plugins/openapi` (Cycle 98)

---

## 6-Dimension Ontology Mapping

### GROUPS
- Organizations (Better Auth) → Groups (Ontology)
- Teams → Sub-groups
- Multi-tenancy via `groupId` scoping

### PEOPLE
- Users → Creators (type: 'creator')
- Roles: `platform_owner`, `org_owner`, `org_user`, `customer`
- OAuth accounts → Social identity connections

### THINGS
- Sessions → Session entities
- Passkeys → Credential entities
- Subscriptions → Subscription entities

### CONNECTIONS
- Organization membership → `belongs_to` connection
- OAuth linking → `linked_account` connection
- Wallet linking → `owns_wallet` connection

### EVENTS
- Login events → `user_logged_in` event
- Signup events → `user_created` event
- 2FA enabled → `security_enhanced` event
- All auth actions logged to events table

### KNOWLEDGE
- Auth documentation
- Security best practices
- User guides

---

## Success Criteria

**Phase 1 (Security):**
- ✅ All passwords hashed with Argon2id
- ✅ Rate limiting active on all auth endpoints
- ✅ CSRF protection enabled
- ✅ Security audit passed

**Phase 2 (Migration):**
- ✅ Better Auth Convex component fully integrated
- ✅ All auth flows migrated from custom backend
- ✅ Zero downtime migration completed
- ✅ All existing users can still log in

**Phase 3 (Passkeys):**
- ✅ Users can register passkeys
- ✅ Users can sign in with passkeys
- ✅ Multi-passkey support working

**Phase 4 (Organizations):**
- ✅ Users can create organizations
- ✅ Team invitations working
- ✅ Role-based access control functional
- ✅ Multi-tenancy implemented

**Phase 5 (Advanced):**
- ✅ Subscription management integrated
- ✅ Web3 wallet authentication working
- ✅ SMS 2FA available
- ✅ Session management UI complete

**Phase 6 (Enterprise):**
- ✅ SSO providers configurable
- ✅ SAML/OIDC flows working
- ✅ JIT provisioning functional

**Phase 7 (Production):**
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Deployed to production
- ✅ Monitoring active

---

## Risk Mitigation

### High Risk Items
1. **Password Migration** (Cycles 1-5)
   - Risk: Existing users locked out
   - Mitigation: Support both SHA-256 and Argon2 during migration

2. **Better Auth Migration** (Cycles 16-35)
   - Risk: Breaking existing auth flows
   - Mitigation: Gradual migration, feature flags, rollback plan

3. **Multi-tenancy** (Cycles 46-60)
   - Risk: Data leakage between organizations
   - Mitigation: Thorough testing, security review

### Medium Risk Items
4. **Passkeys** (Cycles 36-45)
   - Risk: Browser compatibility issues
   - Mitigation: Progressive enhancement, fallback to password

5. **Web3 Authentication** (Cycles 67-72)
   - Risk: Wallet connectivity issues
   - Mitigation: Support multiple wallet providers

---

## Timeline Estimates

- **Phase 1 (Security):** 1-2 days
- **Phase 2 (Migration):** 3-4 days
- **Phase 3 (Passkeys):** 1-2 days
- **Phase 4 (Organizations):** 2-3 days
- **Phase 5 (Advanced):** 3-4 days
- **Phase 6 (Enterprise):** 2-3 days
- **Phase 7 (Polish):** 2-3 days

**Total Estimated Time:** 14-21 days

**Note:** These are development estimates. Actual time depends on:
- External service setup (SMS provider, SSO configuration)
- Testing thoroughness
- Production deployment complexity
- Team size and experience

---

## Next Steps

1. **Review this roadmap** with stakeholders
2. **Prioritize cycles** based on business needs
3. **Set up development environment** for Better Auth testing
4. **Begin Cycle 1** (Password hashing audit)

---

## References

- Better Auth Documentation: https://www.better-auth.com/docs/introduction
- Convex Better Auth: https://github.com/get-convex/better-auth
- 6-Dimension Ontology: `/one/knowledge/ontology.md`
- Current Implementation: `/one/things/plans/better-auth-available-features.md`
- Security Best Practices: OWASP Authentication Cheat Sheet

---

**Built with clarity, security, and infinite scale in mind.**
