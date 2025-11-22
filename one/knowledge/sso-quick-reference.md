# SSO Quick Reference Guide

**For:** Developers implementing SSO integrations
**Last Updated:** 2025-11-22
**Phase:** 6 - Enterprise SSO & Integrations

---

## Quick Start

### 1. Add SAML Provider (Okta, Azure AD)

```typescript
import { api } from "convex/_generated/api";

// Create SAML provider
const { providerId } = await convex.mutation(api.mutations.sso.createSAMLProvider, {
  name: "Okta SSO",
  groupId: "group_123",
  entryPoint: "https://company.okta.com/app/exk.../sso/saml",
  issuer: "http://www.okta.com/exk...",
  cert: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  callbackUrl: "https://one.ie/sso/saml/acs",
  audience: "https://one.ie",
  jitEnabled: true,
  defaultRole: "org_user",
});

// Get SAML metadata for IdP configuration
const { metadata } = await convex.query(api.queries.sso.getSAMLMetadata, {
  providerId,
});

// Download metadata and upload to Okta/Azure AD
console.log(metadata);
```

### 2. Add OIDC Provider (Google, Auth0)

```typescript
const { providerId } = await convex.mutation(api.mutations.sso.createOIDCProvider, {
  name: "Google SSO",
  groupId: "group_123",
  issuer: "https://accounts.google.com",
  clientId: "123456.apps.googleusercontent.com",
  clientSecret: "GOCSPX-...",
  redirectUri: "https://one.ie/sso/oidc/callback",
  scopes: ["openid", "profile", "email"],
  jitEnabled: true,
  defaultRole: "org_user",
});
```

### 3. Verify Domain

```typescript
// Request verification
const { domainId, verificationToken, instructions } =
  await convex.mutation(api.mutations.sso.requestDomainVerification, {
    domain: "company.com",
    groupId: "group_123",
  });

// Show instructions to admin
console.log(instructions); // DNS setup steps

// After admin adds DNS TXT record, verify
const { verified, error } = await convex.mutation(
  api.mutations.sso.verifyDomainOwnership,
  { domainId }
);
```

### 4. Authenticate AI Agent (MCP)

```typescript
const { accessToken, scopes } = await convex.mutation(
  api.mutations.sso.authenticateMCP,
  {
    agentType: "claude",
    agentId: "claude-sonnet-4",
    scopes: ["read:tasks", "write:tasks", "read:knowledge"],
  }
);

// Use access token in API calls
fetch("https://one.ie/api/tasks", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### 5. List SSO Providers (Admin Dashboard)

```typescript
// Get all SSO providers for group
const providers = await convex.query(api.queries.sso.listSSOProviders, {
  groupId: "group_123",
});

// providers = [
//   { id, name, protocol: "saml", status: "active", jitEnabled: true },
//   { id, name, protocol: "oidc", status: "active", scimEnabled: true },
// ]

// Get usage stats
const stats = await convex.query(api.queries.sso.getSSOUsageStats, {
  groupId: "group_123",
  days: 30,
});

// stats = {
//   totalLogins: 1234,
//   byProvider: {
//     "provider_id_1": { count: 800, protocol: "saml", lastLogin: 1234567890 },
//     "provider_id_2": { count: 434, protocol: "oidc", lastLogin: 1234567890 },
//   },
//   periodDays: 30,
// }
```

---

## Configuration Templates

### Okta SAML

```typescript
{
  name: "Okta SSO",
  entryPoint: "https://company.okta.com/app/exk.../sso/saml",
  issuer: "http://www.okta.com/exk...",
  cert: "-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----",
  callbackUrl: "https://one.ie/sso/saml/acs",
  audience: "https://one.ie",
  jitEnabled: true,
  defaultRole: "org_user",
}
```

**Role Mapping:**
```typescript
roleMapping: {
  "Okta Admins": "org_owner",
  "Engineering": "org_user",
  "Contractors": "customer",
}
```

### Azure AD SAML

```typescript
{
  name: "Azure AD SSO",
  entryPoint: "https://login.microsoftonline.com/tenant-id/saml2",
  issuer: "https://sts.windows.net/tenant-id/",
  cert: "-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----",
  callbackUrl: "https://one.ie/sso/saml/acs",
  audience: "https://one.ie",
  jitEnabled: true,
  defaultRole: "org_user",
}
```

### Google OIDC

```typescript
{
  name: "Google Workspace",
  issuer: "https://accounts.google.com",
  clientId: "123456.apps.googleusercontent.com",
  clientSecret: "GOCSPX-...",
  redirectUri: "https://one.ie/sso/oidc/callback",
  scopes: ["openid", "profile", "email", "https://www.googleapis.com/auth/admin.directory.user.readonly"],
  jitEnabled: true,
  defaultRole: "org_user",
}
```

### Auth0 OIDC

```typescript
{
  name: "Auth0 SSO",
  issuer: "https://company.auth0.com",
  clientId: "abc123...",
  clientSecret: "secret...",
  redirectUri: "https://one.ie/sso/oidc/callback",
  scopes: ["openid", "profile", "email"],
  jitEnabled: true,
  defaultRole: "org_user",
}
```

---

## SCIM Endpoints

### Setup in Okta/Azure AD

**SCIM Base URL:** `https://one.ie/scim/v2`
**Bearer Token:** Get from SSO provider configuration

### Supported Operations

```http
GET  /scim/v2/Users                    # List users
POST /scim/v2/Users                    # Create user
GET  /scim/v2/Users/:id                # Get user
PATCH /scim/v2/Users/:id               # Update user
DELETE /scim/v2/Users/:id              # Delete user (soft)
GET  /scim/v2/ServiceProviderConfig    # SCIM config
```

### Example: Create User via SCIM

```bash
curl -X POST https://one.ie/scim/v2/Users \
  -H "Authorization: Bearer scim_token_xyz" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
    "userName": "john@company.com",
    "name": {
      "givenName": "John",
      "familyName": "Doe"
    },
    "emails": [{
      "value": "john@company.com",
      "primary": true
    }],
    "active": true
  }'
```

---

## MCP Scopes Reference

```typescript
const MCP_SCOPES = {
  // Task management
  "read:tasks": "Read tasks",
  "write:tasks": "Create and update tasks",
  "delete:tasks": "Delete tasks",

  // Knowledge access
  "read:knowledge": "Read knowledge base",
  "write:knowledge": "Add to knowledge base",

  // User data
  "read:profile": "Read user profile",
  "write:profile": "Update user profile",

  // Events
  "read:events": "Read event history",

  // Things (entities)
  "read:things": "Read entities",
  "write:things": "Create and update entities",

  // Admin
  "admin:all": "Full admin access",
};
```

### Scope Validation

```typescript
import { hasScope } from "../lib/sso/mcp";

// Check if agent has required scope
if (!hasScope(grantedScopes, "write:tasks")) {
  throw new Error("Insufficient permissions to create tasks");
}
```

---

## Event Types

### SSO Events
```typescript
"sso_login"              // User logged in via SSO
"sso_logout"             // User logged out via SSO
"sso_error"              // SSO authentication error
"sso_provider_created"   // SSO provider configured
```

### SCIM Events
```typescript
"scim_provisioning"      // User provisioned via SCIM
// metadata.action: "CREATE" | "UPDATE" | "DELETE"
```

### MCP Events
```typescript
"mcp_authentication"     // AI agent authenticated
"mcp_activity"           // AI agent performed action
"mcp_token_revoked"      // AI agent access revoked
```

### Domain Events
```typescript
"domain_verification_requested"   // Domain verification started
"domain_verified"                 // Domain successfully verified
"domain_verification_failed"      // Domain verification failed
"domain_verification_deleted"     // Domain removed
```

### JIT Provisioning Events
```typescript
"user_provisioned"       // User auto-created via JIT
"user_updated"           // User updated via JIT
```

---

## Troubleshooting

### SAML Issues

**Problem:** "SAML validation failed: Invalid issuer"
**Solution:** Check that `issuer` in provider config matches IdP entity ID exactly

**Problem:** "Assertion expired"
**Solution:** Check server time synchronization (NTP), increase clock skew tolerance

**Problem:** "Invalid audience"
**Solution:** Ensure `audience` matches SP entity ID in IdP configuration

### OIDC Issues

**Problem:** "Invalid token"
**Solution:** Verify `clientId` and `clientSecret` are correct

**Problem:** "Discovery failed"
**Solution:** Check `issuer` URL is correct and includes `/.well-known/openid-configuration`

**Problem:** "Invalid redirect URI"
**Solution:** Ensure `redirectUri` is registered in OAuth client configuration

### SCIM Issues

**Problem:** "401 Unauthorized"
**Solution:** Verify bearer token is correct and provider SCIM is enabled

**Problem:** "User not found"
**Solution:** Check that user belongs to correct group (multi-tenant isolation)

**Problem:** "Filter not supported"
**Solution:** Use simple filters like `userName eq "email@domain.com"`

### Domain Verification

**Problem:** "DNS TXT record not found"
**Solution:**
1. Wait 5-10 minutes for DNS propagation
2. Verify TXT record is added correctly: `dig _one-verification.domain.com TXT`
3. Try again (can take up to 24 hours)

**Problem:** "Domain already exists"
**Solution:** Domain is already verified for this group. Delete and re-add if needed.

---

## Security Checklist

### Before Production

- [ ] Replace mock SAML parser with `saml2-js` library
- [ ] Implement real DNS verification (Google DNS API or Cloudflare)
- [ ] Encrypt client secrets at rest (AES-256)
- [ ] Enable rate limiting for SCIM endpoints
- [ ] Set up monitoring for SSO login failures
- [ ] Configure alerts for unusual login patterns
- [ ] Audit event logging (verify all events are logged)
- [ ] Test multi-tenant isolation (cross-group access denied)
- [ ] Validate JWT signatures using JWKS
- [ ] Implement certificate rotation for SAML

### Ongoing

- [ ] Rotate SCIM bearer tokens quarterly
- [ ] Review SSO usage statistics monthly
- [ ] Re-verify domains annually
- [ ] Update certificates before expiry
- [ ] Monitor for security advisories (SAML, OIDC, SCIM)

---

## Performance Tips

### Query Optimization

```typescript
// ❌ Bad: Fetch all providers then filter
const allProviders = await convex.query(api.queries.sso.listSSOProviders);
const samlProviders = allProviders.filter(p => p.protocol === "saml");

// ✅ Good: Filter at database level
const samlProviders = await ctx.db
  .query("things")
  .withIndex("by_group_type", q => q.eq("groupId", groupId).eq("type", "external_connection"))
  .filter(q => q.eq(q.field("properties.protocol"), "saml"))
  .collect();
```

### Event Batching

```typescript
// For high-volume SSO, consider batching events
const events = [];
for (const login of logins) {
  events.push({
    type: "sso_login",
    actorId: login.userId,
    targetId: login.providerId,
    timestamp: Date.now(),
    metadata: { protocol: "saml" },
  });
}

// Batch insert
await Promise.all(events.map(e => ctx.db.insert("events", e)));
```

---

## Testing

### Test SAML Locally

Use **SAMLtest.id** (public SAML IdP):
1. Visit https://samltest.id/
2. Download IdP metadata
3. Configure provider with SAMLtest credentials
4. Test login flow

### Test OIDC Locally

Use **Google OAuth Playground**:
1. Visit https://developers.google.com/oauthplayground/
2. Select OpenID Connect scopes
3. Authorize and get tokens
4. Test token validation

### Test SCIM

Use **Okta SCIM Tester**:
1. Configure SCIM endpoint in Okta
2. Use Okta's built-in SCIM testing tool
3. Verify all CRUD operations

### Test MCP

```typescript
// Mock AI agent authentication
const { accessToken } = await authenticateMCP({
  agentType: "custom",
  agentId: "test-agent-123",
  scopes: ["read:tasks", "write:tasks"],
});

// Validate token
const validation = await validateMCPToken(accessToken);
console.assert(validation.valid === true);
console.assert(validation.scopes.includes("read:tasks"));
```

---

## Common Patterns

### Pattern 1: Role Mapping

```typescript
// Map external groups to internal roles
const roleMapping = {
  // External group → Internal role
  "Domain Admins": "platform_owner",
  "Company Admins": "org_owner",
  "Engineering Team": "org_user",
  "External Contractors": "customer",
};

// Use in JIT config
jitProvisioning: {
  enabled: true,
  roleMapping,
  defaultRole: "org_user", // Fallback if no mapping found
}
```

### Pattern 2: Conditional JIT

```typescript
// Only auto-create users from verified domains
const jitConfig = {
  enabled: true,
  autoCreateUsers: async (email) => {
    const domain = email.split("@")[1];
    return await isDomainVerifiedForSSO(ctx, email, groupId);
  },
  defaultRole: "org_user",
};
```

### Pattern 3: Multi-Provider SSO

```typescript
// Allow users to choose SSO provider
const providers = await listSSOProviders({ groupId });

// Show buttons for each provider
providers.forEach(p => {
  if (p.protocol === "saml") {
    showButton(`Sign in with ${p.name}`, `/sso/saml/login/${p.id}`);
  } else if (p.protocol === "oidc") {
    showButton(`Sign in with ${p.name}`, `/sso/oidc/login/${p.id}`);
  }
});
```

---

## API Reference

### Mutations

- `createSAMLProvider(args)` - Create SAML SSO provider
- `createOIDCProvider(args)` - Create OIDC SSO provider
- `handleSAMLLogin(args)` - Process SAML assertion
- `authenticateMCP(args)` - Authenticate AI agent
- `requestDomainVerification(args)` - Start domain verification
- `verifyDomainOwnership(args)` - Verify domain via DNS
- `deleteDomain(args)` - Remove domain verification

### Queries

- `listSSOProviders(args)` - List all SSO providers for group
- `getSSOProvider(args)` - Get provider details
- `getSSOUsageStats(args)` - Get login statistics
- `listVerifiedDomains(args)` - List verified domains
- `getSAMLMetadata(args)` - Get SAML SP metadata XML
- `getMCPScopes()` - List available MCP scopes

### HTTP Endpoints (SCIM)

- `GET /scim/v2/Users` - List users
- `POST /scim/v2/Users` - Create user
- `GET /scim/v2/Users/:id` - Get user
- `PATCH /scim/v2/Users/:id` - Update user
- `DELETE /scim/v2/Users/:id` - Delete user

---

## Support

### Documentation
- Full implementation: `/one/events/phase-6-enterprise-sso-summary.md`
- Research: `/one/events/cycle-84-sso-research.md`
- Ontology: `/one/knowledge/ontology.md`

### Code Files
- SAML: `/backend/convex/lib/sso/saml.ts`
- OIDC: `/backend/convex/lib/sso/oidc.ts`
- JIT: `/backend/convex/lib/sso/jit.ts`
- SCIM: `/backend/convex/lib/sso/scim.ts`
- MCP: `/backend/convex/lib/sso/mcp.ts`
- Domain Verification: `/backend/convex/lib/sso/domainVerification.ts`

### External Resources
- SAML 2.0: https://docs.oasis-open.org/security/saml/v2.0/
- OIDC: https://openid.net/specs/openid-connect-core-1_0.html
- SCIM 2.0: https://datatracker.ietf.org/doc/html/rfc7644
- MCP: https://modelcontextprotocol.io/

---

**Last Updated:** 2025-11-22 | **Integration Specialist**
