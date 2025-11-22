# Cycle 84: SSO Research & Implementation Strategy

**Status:** Complete
**Date:** 2025-11-22
**Phase:** 6 - Enterprise SSO & Integrations

## Executive Summary

Research completed for enterprise SSO implementation using SAML 2.0 and OIDC protocols. This document outlines the technical approach, protocol choices, and 6-dimension ontology mapping for custom backend implementation.

## SAML vs OIDC Protocol Comparison

### SAML 2.0 (Security Assertion Markup Language)
**Best For:** Enterprise B2B applications, legacy systems
**Format:** XML-based
**Token Type:** XML assertions
**Common Use:** Corporate SSO (Okta, Azure AD, OneLogin)

**Advantages:**
- Industry standard for enterprise SSO
- Rich metadata exchange
- Strong enterprise support
- Works with corporate identity providers

**Disadvantages:**
- XML complexity (verbose, harder to debug)
- Larger payload size
- Steeper learning curve

### OIDC (OpenID Connect)
**Best For:** Modern applications, mobile, API-driven architectures
**Format:** JSON-based (built on OAuth 2.0)
**Token Type:** JWT (JSON Web Tokens)
**Common Use:** Consumer SSO (Google, GitHub), modern enterprise

**Advantages:**
- Lightweight JSON format
- Easy to implement and debug
- Built-in JWT support
- Better mobile/SPA support
- Can act as both client and provider

**Disadvantages:**
- Less metadata standardization
- Requires OAuth 2.0 understanding

## Enterprise Requirements Analysis

### Okta Support
- **Protocol:** SAML 2.0 + OIDC
- **Features:** SSO, MFA, User provisioning (SCIM 2.0)
- **Implementation:** Need both SAML and OIDC support

### Auth0 Support
- **Protocol:** OIDC (primary), SAML 2.0
- **Features:** Universal login, MFA, Rule-based provisioning
- **Implementation:** OIDC preferred, SAML fallback

### Azure AD (Microsoft Entra ID)
- **Protocol:** SAML 2.0 + OIDC
- **Features:** SSO, Conditional Access, SCIM provisioning
- **Implementation:** Both protocols required

### Google Workspace
- **Protocol:** OIDC (OAuth 2.0)
- **Features:** SSO, Groups management
- **Implementation:** OIDC only

## 6-Dimension Ontology Mapping

### DIMENSION 1: GROUPS (Multi-Tenant Isolation)
```typescript
// SSO configurations scoped to groupId
{
  type: "sso_configuration",
  groupId: "group_123", // Tenant-specific SSO
  properties: {
    protocol: "saml" | "oidc",
    provider: "okta" | "azure" | "auth0",
    enabled: true,
    domains: ["company.com", "corp.company.com"], // Verified domains
  }
}
```

**Hierarchical SSO:**
- Parent group SSO config can cascade to child groups
- Child groups can override with specific provider
- Domain verification at group level

### DIMENSION 2: PEOPLE (Authorization & Governance)
```typescript
// Users created via SSO
{
  email: "user@company.com",
  groupId: "group_123",
  role: "org_user", // Mapped from SAML assertion or OIDC claim
  status: "active",
  ssoProvider: "okta", // Track SSO source
  ssoUserId: "00u1234567890abcdef", // External user ID
  lastLoginMethod: "saml_sso",
}
```

**Role Mapping:**
- SAML Attribute: `groups`, `roles`, `department`
- OIDC Claim: `groups`, `roles`, `custom:role`
- Mapping rules: Map external role → internal role

### DIMENSION 3: THINGS (Entity Integration)
```typescript
// SSO Provider as external_connection
{
  type: "external_connection",
  name: "Okta SSO - Acme Corp",
  groupId: "group_123",
  properties: {
    connectionType: "sso",
    protocol: "saml",

    // SAML Configuration
    saml: {
      entryPoint: "https://acme.okta.com/app/exk.../sso/saml",
      issuer: "http://www.okta.com/exk...",
      cert: "-----BEGIN CERTIFICATE-----...",
      wantAssertionsSigned: true,
      signatureAlgorithm: "sha256",
    },

    // OIDC Configuration
    oidc: {
      issuer: "https://acme.okta.com",
      clientId: "0oa...",
      clientSecret: "encrypted_secret",
      discoveryUrl: "https://acme.okta.com/.well-known/openid-configuration",
      scopes: ["openid", "profile", "email", "groups"],
    },

    // JIT Provisioning
    jitProvisioning: {
      enabled: true,
      attributeMapping: {
        email: "nameID", // SAML
        name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
        role: "groups", // Map first group to role
      },
      defaultRole: "org_user",
      autoCreateUsers: true,
    },

    // SCIM Configuration
    scim: {
      enabled: true,
      endpoint: "https://one.ie/scim/v2",
      bearerToken: "encrypted_token",
      syncGroups: true,
    },
  },
  status: "active",
}
```

### DIMENSION 4: CONNECTIONS (Relationships)
```typescript
// User ↔ SSO Provider relationship
{
  fromThingId: "user_thing_id",
  toThingId: "sso_provider_thing_id",
  relationshipType: "authenticated_via",
  metadata: {
    protocol: "saml",
    firstLoginAt: 1234567890,
    lastLoginAt: 1234567890,
    externalUserId: "00u1234567890abcdef",
    attributeMappings: {
      email: "user@company.com",
      name: "John Doe",
      groups: ["Engineering", "Admins"],
    },
  },
}
```

### DIMENSION 5: EVENTS (Action Tracking)
```typescript
// SSO Login Event
{
  type: "sso_login",
  actorId: "user_id",
  targetId: "sso_provider_thing_id",
  timestamp: Date.now(),
  metadata: {
    protocol: "saml",
    provider: "okta",
    method: "saml_sso",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    assertionId: "id123", // SAML assertion ID
    sessionIndex: "session123", // For logout
  },
}

// SCIM Provisioning Event
{
  type: "scim_user_provisioned",
  actorId: "system", // SCIM is system-initiated
  targetId: "user_id",
  timestamp: Date.now(),
  metadata: {
    protocol: "scim",
    action: "CREATE",
    provider: "okta",
    externalUserId: "00u1234567890abcdef",
    attributes: {...},
  },
}

// MCP Authentication Event
{
  type: "mcp_authentication",
  actorId: "ai_agent_id",
  timestamp: Date.now(),
  metadata: {
    protocol: "mcp",
    agentType: "claude",
    requestedScopes: ["read:tasks", "write:tasks"],
  },
}
```

### DIMENSION 6: KNOWLEDGE (Semantic Understanding)
```typescript
// Integration pattern knowledge
{
  knowledgeType: "chunk",
  text: `
    ### SSO Integration Pattern: SAML with JIT Provisioning

    **Problem:** Users need seamless access without manual account creation.

    **Solution:** Configure SAML IdP with JIT provisioning:
    1. User attempts login → Redirected to IdP
    2. IdP authenticates → Returns SAML assertion
    3. SP validates assertion → Extracts attributes
    4. Auto-create user if not exists → Map roles from groups
    5. Create session → Log user in

    **Attribute Mapping:**
    - nameID → email
    - givenName + surname → name
    - groups[0] → role (map "Admins" → "org_owner")

    **Tags:** protocol:saml, capability:jit, pattern:auto-provisioning
  `,
  labels: [
    "protocol:saml",
    "protocol:oidc",
    "capability:sso",
    "capability:jit",
    "network:enterprise",
  ],
}
```

## Implementation Approach

### Phase 1: SAML Authentication (Cycle 85)
**Library:** `saml2-js` (lightweight, no Passport dependency)
**Endpoints:**
- `GET /sso/saml/metadata` - SP metadata for IdP configuration
- `POST /sso/saml/acs` - Assertion Consumer Service (receives SAML response)
- `GET /sso/saml/login/:providerId` - Initiate SAML login
- `POST /sso/saml/logout` - SAML Single Logout

**Implementation:**
1. Create SAML service provider configuration
2. Generate metadata XML
3. Validate SAML assertions (signature, timestamp, audience)
4. Extract user attributes
5. Create/update user (JIT provisioning)
6. Create session with CSRF token

### Phase 2: OIDC Support (Cycles 86-87)
**Library:** `openid-client` (certified OIDC library)

**As OIDC Client (connect to enterprise IdPs):**
- Discovery endpoint support (`/.well-known/openid-configuration`)
- Authorization Code Flow
- Token validation (JWT signature, issuer, audience)
- UserInfo endpoint calls
- Refresh token support

**As OIDC Provider (BE an auth server):**
- Authorization endpoint (`/oidc/authorize`)
- Token endpoint (`/oidc/token`)
- UserInfo endpoint (`/oidc/userinfo`)
- Discovery endpoint (`/.well-known/openid-configuration`)
- JWKS endpoint (`/.well-known/jwks.json`)
- Consent screen

### Phase 3: JIT Provisioning (Cycle 88)
**Auto-create users from SSO:**
1. Extract attributes from SAML assertion or OIDC claims
2. Map to user fields (email, name, role)
3. Check if user exists by email
4. If not exists → Create user with SSO metadata
5. If exists → Update attributes (optional)
6. Map external groups to internal roles
7. Create authenticated_via connection

### Phase 4: SCIM Provisioning (Cycle 89)
**Standard:** SCIM 2.0 (RFC 7644)
**Endpoints:**
- `GET /scim/v2/Users` - List users
- `POST /scim/v2/Users` - Create user
- `GET /scim/v2/Users/:id` - Get user
- `PATCH /scim/v2/Users/:id` - Update user
- `DELETE /scim/v2/Users/:id` - Deactivate user
- `GET /scim/v2/Groups` - List groups
- `POST /scim/v2/Groups` - Create group

**Implementation:**
1. Bearer token authentication
2. SCIM schema compliance (User, Group resources)
3. Filter support (`filter=userName eq "john@example.com"`)
4. Pagination
5. Lifecycle hooks (onCreate, onUpdate, onDelete)

### Phase 5: OAuth Proxy (Cycle 90)
**Purpose:** Proxy non-standard OAuth providers
- Token exchange flows
- Custom OAuth implementations
- Provider-specific quirks handling

### Phase 6: MCP Integration (Cycle 91)
**Model Context Protocol:** Authentication for AI agents
- MCP server endpoints
- Agent authentication flows
- Scoped access tokens for AI agents

### Phase 7: SSO Admin Dashboard (Cycles 92-93)
**Features:**
- List SSO providers (per group)
- Add/edit/delete provider configuration
- Test SSO connection
- View usage statistics
- Domain verification UI
- SAML metadata download

### Phase 8: Domain Verification (Cycle 93)
**Purpose:** Restrict SSO to verified domains
1. Admin adds domain to group
2. System generates DNS TXT record
3. Admin adds TXT record to DNS
4. System verifies DNS record
5. Domain marked as verified
6. SSO restricted to verified domains only

## Security Considerations

### SAML Security
- Validate XML signatures (prevent assertion injection)
- Check assertion timestamps (prevent replay attacks)
- Validate audience (prevent assertion reuse)
- Use HTTPS for all endpoints
- Store certificates securely

### OIDC Security
- Validate JWT signatures using JWKS
- Verify issuer, audience, expiry
- Use PKCE for public clients
- Implement state parameter (CSRF protection)
- Rotate client secrets regularly

### SCIM Security
- Bearer token authentication
- Per-group token scoping
- Rate limiting (prevent abuse)
- Audit all provisioning actions
- Validate SCIM schema compliance

## Testing Strategy

### SAML Testing
- Use SAMLtest.id (public SAML IdP)
- Test with Okta developer account
- Validate metadata generation
- Test assertion validation
- Test Single Logout

### OIDC Testing
- Use Google OAuth playground
- Test with Auth0 developer account
- Validate token signatures
- Test refresh token flow
- Test as provider (issue tokens)

### SCIM Testing
- Use Azure AD SCIM testing tool
- Use Okta SCIM tester
- Validate all CRUD operations
- Test pagination
- Test filtering

## Next Steps

1. **Cycle 85:** Implement SAML authentication with `saml2-js`
2. **Cycles 86-87:** Implement OIDC client and provider
3. **Cycle 88:** Add JIT provisioning logic
4. **Cycle 89:** Implement SCIM 2.0 endpoints
5. **Cycle 90:** Create OAuth proxy service
6. **Cycle 91:** Add MCP integration
7. **Cycles 92-93:** Build SSO admin dashboard
8. **Cycle 94:** End-to-end testing

## References

- SAML 2.0: https://docs.oasis-open.org/security/saml/v2.0/
- OIDC Core: https://openid.net/specs/openid-connect-core-1_0.html
- SCIM 2.0: https://datatracker.ietf.org/doc/html/rfc7644
- OAuth 2.0: https://datatracker.ietf.org/doc/html/rfc6749
- MCP: https://modelcontextprotocol.io/

---

**Ontology Mapping:** Complete ✅
**Protocol Selection:** SAML + OIDC + SCIM + MCP ✅
**Implementation Strategy:** Defined ✅
**Security Analysis:** Complete ✅
