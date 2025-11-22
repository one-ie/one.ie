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
**Target State:** Full Better Auth Convex component integration with all features
**Total Cycles:** 100

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

**Cycle 15:** Security audit checkpoint
- Verify Argon2 password hashing active
- Verify rate limiting working
- Verify CSRF protection enabled
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

**Cycle 45:** Passkey implementation checkpoint
- Verify passkey registration works
- Verify passkey authentication works
- Document passkey usage

---

## Phase 4: Organizations & Teams (Cycles 46-60)

### MULTI-TENANT FEATURES

**Cycle 46:** Read Better Auth organizations documentation
- Study organizations plugin API
- Understand team/member model
- Review role-based access control

**Cycle 47:** Enable organizations plugin
- Add organizations plugin to Better Auth config
- Configure organization settings
- Generate organization tables

**Cycle 48:** Map organizations to 6-dimension ontology
- Align Better Auth organizations with groups dimension
- Design integration with existing groups table
- Document mapping strategy

**Cycle 49:** Create organization creation UI
- Design `CreateOrganization.tsx` component
- Implement organization creation form
- Add validation

**Cycle 50:** Implement organization creation backend
- Create organization mutation
- Link organization to user
- Set user as organization owner

**Cycle 51:** Create organization settings page
- Design `/account/organizations/[id]/settings.astro`
- Display organization details
- Add edit functionality

**Cycle 52:** Implement team invitation system
- Create team invitation component
- Send invitation emails
- Generate invitation tokens

**Cycle 53:** Create team invitation acceptance flow
- Design invitation acceptance page
- Verify invitation tokens
- Add member to organization

**Cycle 54:** Implement role-based access control
- Define roles (owner, admin, member)
- Create role checking utilities
- Protect organization routes by role

**Cycle 55:** Create organization member management UI
- List organization members
- Change member roles
- Remove members

**Cycle 56:** Implement organization member backend
- Create add member mutation
- Create update role mutation
- Create remove member mutation

**Cycle 57:** Add organization switcher UI
- Create organization dropdown
- Switch active organization
- Store organization context

**Cycle 58:** Integrate organizations with existing features
- Scope products to organizations
- Scope content to organizations
- Update existing queries for multi-tenancy

**Cycle 59:** Test organization flows end-to-end
- Test organization creation
- Test team invitations
- Test role management

**Cycle 60:** Organizations implementation checkpoint
- Verify organization CRUD works
- Verify team invitations work
- Document organization features

---

## Phase 5: Advanced Features (Cycles 61-80)

### SUBSCRIPTIONS, WEB3, SMS 2FA

**Cycle 61:** Read Better Auth subscription documentation
- Study subscription plugin API
- Understand Stripe integration
- Review subscription lifecycle

**Cycle 62:** Configure subscription plugin
- Add subscription plugin to Better Auth
- Set up Stripe webhook endpoints
- Configure subscription tiers

**Cycle 63:** Create subscription management UI
- Design subscription plans page
- Display current subscription
- Add upgrade/downgrade buttons

**Cycle 64:** Implement subscription purchase flow
- Create Stripe checkout integration
- Handle subscription webhooks
- Update user subscription status

**Cycle 65:** Create subscription settings page
- Display subscription details
- Add cancel subscription
- Add payment method management

**Cycle 66:** Test subscription flows
- Test subscription purchase
- Test subscription upgrade
- Test subscription cancellation

**Cycle 67:** Read Web3 authentication documentation
- Study wallet authentication approaches
- Review `walletAddress` table schema
- Understand sign-in with Ethereum

**Cycle 68:** Install Web3 authentication dependencies
- Add `ethers` or `viem` library
- Configure wallet authentication plugin
- Verify compatibility

**Cycle 69:** Create wallet connection UI
- Design `WalletConnect.tsx` component
- Implement MetaMask connection
- Implement WalletConnect protocol

**Cycle 70:** Implement wallet authentication backend
- Create wallet signature verification
- Link wallet address to user account
- Create session on successful verification

**Cycle 71:** Add wallet management UI
- List connected wallets
- Remove wallet
- Set primary wallet

**Cycle 72:** Test Web3 authentication
- Test MetaMask connection
- Test wallet signature
- Test account linking

**Cycle 73:** Read SMS 2FA documentation
- Study SMS plugin API
- Research SMS providers (Twilio, Vonage)
- Configure SMS plugin

**Cycle 74:** Install SMS 2FA dependencies
- Add SMS provider SDK
- Configure SMS plugin in Better Auth
- Set up SMS provider credentials

**Cycle 75:** Create SMS 2FA enrollment UI
- Design phone number input
- Create verification code input
- Add to account settings

**Cycle 76:** Implement SMS 2FA backend
- Create send SMS code mutation
- Create verify SMS code mutation
- Store phone number on user

**Cycle 77:** Add SMS 2FA to sign-in flow
- Prompt for SMS code after password
- Verify SMS code
- Create session on success

**Cycle 78:** Test SMS 2FA flows
- Test SMS enrollment
- Test SMS verification
- Test fallback to TOTP

**Cycle 79:** Implement session management UI
- Create active sessions list page
- Display device, location, last active
- Add revoke session functionality

**Cycle 80:** Advanced features checkpoint
- Verify subscription management works
- Verify Web3 authentication works
- Verify SMS 2FA works
- Document advanced features

---

## Phase 6: Enterprise & SSO (Cycles 81-90)

### ENTERPRISE AUTHENTICATION

**Cycle 81:** Read Better Auth SSO documentation
- Study SSO provider configuration
- Understand SAML vs OIDC
- Review enterprise requirements

**Cycle 82:** Configure generic OAuth plugin
- Add generic OAuth plugin
- Configure for enterprise providers
- Test with sample provider

**Cycle 83:** Create SSO provider configuration UI
- Design SSO settings page (admin only)
- Add SSO provider form
- List configured providers

**Cycle 84:** Implement SAML authentication
- Configure SAML plugin
- Create SAML metadata endpoint
- Test SAML flow

**Cycle 85:** Implement OIDC authentication
- Configure OIDC plugin
- Create OIDC discovery endpoint
- Test OIDC flow

**Cycle 86:** Add Just-in-Time (JIT) provisioning
- Auto-create users from SSO
- Map SSO attributes to user fields
- Assign default roles

**Cycle 87:** Implement domain verification
- Create domain verification process
- Restrict SSO to verified domains
- Add domain management UI

**Cycle 88:** Create admin dashboard for SSO
- List SSO providers
- View SSO usage statistics
- Manage SSO configurations

**Cycle 89:** Test enterprise SSO flows
- Test SAML authentication
- Test OIDC authentication
- Test JIT provisioning

**Cycle 90:** Enterprise features checkpoint
- Verify SSO providers work
- Verify JIT provisioning works
- Document enterprise features

---

## Phase 7: Polish & Production (Cycles 91-100)

### FINAL TESTING, DOCUMENTATION, DEPLOYMENT

**Cycle 91:** Comprehensive security audit
- Review all authentication flows
- Test for common vulnerabilities (OWASP)
- Verify rate limiting on all endpoints

**Cycle 92:** Performance optimization
- Add database indexes for auth queries
- Optimize session lookup performance
- Cache frequently accessed data

**Cycle 93:** Error handling improvements
- Add user-friendly error messages
- Implement retry logic for transient failures
- Log errors for monitoring

**Cycle 94:** Accessibility audit
- Test all auth pages with screen readers
- Ensure keyboard navigation works
- Add ARIA labels

**Cycle 95:** Mobile responsiveness testing
- Test all auth flows on mobile
- Verify touch interactions
- Optimize mobile UI

**Cycle 96:** Browser compatibility testing
- Test on Chrome, Firefox, Safari, Edge
- Test passkeys on all browsers
- Document browser support

**Cycle 97:** Create comprehensive documentation
- Document all auth features
- Create developer guide
- Write user documentation

**Cycle 98:** Set up monitoring and alerts
- Add auth metrics (login success rate, signup rate)
- Set up error alerts
- Create auth dashboard

**Cycle 99:** Production deployment
- Deploy Better Auth to production
- Verify all environment variables
- Run smoke tests

**Cycle 100:** Final checkpoint and handoff
- Complete 100-cycle review
- Document lessons learned
- Archive roadmap as completed

---

## Feature Matrix

| Feature | Current | Cycle | Status |
|---------|---------|-------|--------|
| **Email/Password** | Custom | 16-35 | Migration |
| **Argon2 Hashing** | ❌ SHA-256 | 1-5 | Critical |
| **Rate Limiting** | ❌ | 6-9 | Critical |
| **CSRF Protection** | ❌ | 10-14 | Critical |
| **GitHub OAuth** | ✅ Custom | 22 | Migration |
| **Google OAuth** | ✅ Custom | 23 | Migration |
| **Magic Links** | ✅ Custom | 28 | Migration |
| **TOTP 2FA** | ✅ Custom | 29 | Migration |
| **SMS 2FA** | ❌ | 73-78 | New |
| **Passkeys** | ❌ | 36-45 | New |
| **Organizations** | ❌ | 46-60 | New |
| **Teams** | ❌ | 46-60 | New |
| **Subscriptions** | ❌ | 61-66 | New |
| **Web3 Wallets** | ❌ | 67-72 | New |
| **SSO/SAML** | ❌ | 81-89 | New |
| **Session Management** | Basic | 79 | Enhancement |

---

## Dependencies

### NPM Packages (Already Installed)
- ✅ `better-auth` - v1.3.23
- ✅ `@daveyplate/better-auth-ui` - v3.2.5
- ✅ `@convex-dev/better-auth` - v0.9.7
- ✅ `convex` - v1.17.4

### Additional Packages Needed
- `@node-rs/argon2` - Password hashing (Cycle 3)
- `@simplewebauthn/server` - Passkeys (Cycle 37)
- `ethers` or `viem` - Web3 authentication (Cycle 68)
- SMS provider SDK - Twilio/Vonage (Cycle 74)
- SAML/OIDC libraries - Enterprise SSO (Cycle 84)

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
