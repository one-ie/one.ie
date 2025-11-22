---
title: API Key Authentication System
dimension: knowledge
category: authentication
tags: api-keys, authentication, rate-limiting, permissions, security
related_dimensions: people, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 2.0.0
session_id: 01QMzqbMmdUc4fQx4zL1AEDT
ai_context: |
  This document is part of the knowledge dimension in the authentication category.
  Location: one/knowledge/api-keys.md
  Purpose: Complete documentation for the Enhanced API Key Authentication System
  For AI agents: Read this to understand API key features, implementation, and security
---

# Enhanced API Key Authentication System

**Version:** 2.0.0
**Status:** Production-Ready
**Based On:** [Better Auth API Key Plugin](https://www.better-auth.com/docs/plugins/api-key)
**Implementation:** Custom Convex Backend

---

## Overview

The Enhanced API Key Authentication System provides secure, scalable programmatic access to the ONE Platform. It implements Better Auth's API key design with custom enhancements for our Convex backend.

### Key Features

✅ **Resource-Based Permissions** - Granular permissions (users, projects, analytics, groups, data)
✅ **Per-Key Rate Limiting** - Token bucket algorithm with refill support
✅ **Usage Tracking** - Real-time statistics and analytics
✅ **Metadata Support** - Custom JSON metadata for any use case
✅ **Secure Storage** - SHA-256 hashed keys in database
✅ **Automatic Expiration** - Configurable expiration with auto-cleanup
✅ **Audit Logging** - All operations logged to events dimension

---

## Architecture

### Database Schema

```typescript
apiKeys: {
  userId: Id<"users">,
  groupId: Id<"groups">, // Organization scoping
  key: string, // Format: one_sk_<base64url-256-bits>
  hashedKey: string, // SHA-256 hash for lookups
  name: string,
  permissions: {
    users?: string[],      // read, write, delete, admin
    projects?: string[],   // read, write, delete, admin
    analytics?: string[],  // read, write, export
    groups?: string[],     // read, write, delete, admin
    data?: string[]        // read, write, delete, export, import
  },
  rateLimit: {
    enabled: boolean,
    maxRequests: number,
    timeWindowMs: number,
    refillRate?: number,
    refillIntervalMs?: number
  },
  usageStats: {
    totalRequests: number,
    requestsThisWindow: number,
    windowStartedAt: number,
    lastRefillAt?: number,
    remainingRequests?: number
  },
  metadata?: any,
  expiresAt?: number,
  status: "active" | "revoked" | "expired",
  createdAt: number,
  updatedAt: number
}
```

### Permission Model

**Resource-Based Permissions** (Better Auth style):

```typescript
{
  users: ["read", "write"],      // Can read and write users
  projects: ["read"],             // Read-only projects
  analytics: ["read", "export"],  // Read and export analytics
  groups: ["admin"],              // Full admin access to groups
  data: ["read", "write", "delete"] // Read, write, and delete data
}
```

**Permission Levels by Resource:**

| Resource | Actions |
|----------|---------|
| **users** | read, write, delete, admin |
| **projects** | read, write, delete, admin |
| **analytics** | read, write, export |
| **groups** | read, write, delete, admin |
| **data** | read, write, delete, export, import |

**Special Permission:** `admin` grants all permissions for that resource.

---

## API Reference

### Mutations

#### `createApiKey`

Create a new API key with permissions and rate limiting.

```typescript
const result = await createApiKey({
  name: "Production API Key",
  permissions: {
    users: ["read"],
    projects: ["read", "write"],
    analytics: ["read", "export"]
  },
  rateLimit: {
    enabled: true,
    maxRequests: 10000,
    timeWindowMs: 86400000, // 1 day
    refillRate: 10,
    refillIntervalMs: 3600000 // 1 hour
  },
  expiresInDays: 90,
  metadata: {
    environment: "production",
    team: "backend"
  }
});

// result.key = "one_sk_..." (save this - shown only once!)
```

**Important:** The plaintext API key is returned ONLY on creation. Save it immediately!

#### `revokeApiKey`

Revoke an API key (immediate, irreversible).

```typescript
await revokeApiKey({
  apiKeyId: "api_key_id"
});
```

#### `rotateApiKey`

Generate new key value while preserving permissions.

```typescript
const result = await rotateApiKey({
  apiKeyId: "api_key_id"
});

// result.key = "one_sk_..." (new key - save it!)
```

#### `updateApiKey`

Update name, permissions, rate limit, or metadata.

```typescript
await updateApiKey({
  apiKeyId: "api_key_id",
  name: "Updated Name",
  permissions: {
    users: ["read", "write"],
    projects: ["admin"]
  },
  rateLimit: {
    enabled: true,
    maxRequests: 5000,
    timeWindowMs: 86400000
  },
  metadata: { environment: "staging" }
});
```

### Queries

#### `listApiKeys`

List all API keys for authenticated user.

```typescript
const keys = await listApiKeys();
// Returns: Array of API keys (without plaintext key)
```

#### `getApiKey`

Get single API key details.

```typescript
const key = await getApiKey({
  apiKeyId: "api_key_id"
});
```

#### `validateApiKey`

Validate API key and check rate limiting (read-only check).

```typescript
const result = await validateApiKey({
  key: "one_sk_...",
  endpoint: "/api/data",
  ipAddress: "192.168.1.1"
});

if (!result.valid) {
  // Handle error: result.error, result.errorCode
}

// result.userId, result.permissions, result.remainingRequests
```

#### `getApiKeyUsageStats`

Get detailed usage statistics.

```typescript
const stats = await getApiKeyUsageStats({
  apiKeyId: "api_key_id"
});

// stats.totalRequests, stats.remainingRequests, stats.nextRefillAt
```

---

## Rate Limiting

### Token Bucket Algorithm

Our rate limiting uses the **token bucket algorithm** with refill support:

1. **Bucket Initialization** - Start with `maxRequests` tokens
2. **Token Consumption** - Each request consumes 1 token
3. **Token Refill** - Add `refillRate` tokens every `refillIntervalMs`
4. **Bucket Cap** - Never exceed `maxRequests` tokens
5. **Window Reset** - Reset to full bucket after `timeWindowMs`

### Configuration

```typescript
{
  enabled: true,
  maxRequests: 1000,        // Bucket capacity
  timeWindowMs: 86400000,   // 1 day (full reset)
  refillRate: 10,           // Add 10 tokens
  refillIntervalMs: 3600000 // Every 1 hour
}
```

### Default Limits

- **Max Requests:** 1000
- **Time Window:** 24 hours
- **Refill Rate:** 10 tokens per hour

### HTTP Headers

Rate limit info returned in standard headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1732320000
```

---

## Using API Keys

### HTTP API Endpoints

```typescript
// Convex HTTP endpoint example
import { httpRouter } from "convex/server";
import { validateAndTrackApiKey } from "./lib/apiKeyMiddleware";

const http = httpRouter();

http.route({
  path: "/api/data",
  method: "GET",
  handler: async (request, ctx) => {
    // Extract API key from header
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return new Response("Missing API key", { status: 401 });
    }

    // Validate and track usage
    const result = await ctx.runMutation(
      api.lib.apiKeyMiddleware.validateAndTrackApiKey,
      {
        key: apiKey,
        endpoint: "/api/data",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown"
      }
    );

    if (!result.valid) {
      const status = result.errorCode === "RATE_LIMIT_EXCEEDED" ? 429 : 401;
      return new Response(
        JSON.stringify({ error: result.error }),
        {
          status,
          headers: {
            "Content-Type": "application/json",
            ...getRateLimitHeaders(result.rateLimit)
          }
        }
      );
    }

    // Check permissions
    if (!hasPermission(result.permissions, "data", "read")) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403 }
      );
    }

    // Process request with result.userId, result.groupId, result.permissions
    // ...
  }
});
```

### Client Examples

**cURL:**
```bash
curl -H "x-api-key: one_sk_abcd1234..." \
     https://api.one.ie/api/data
```

**JavaScript/TypeScript:**
```typescript
const response = await fetch("https://api.one.ie/api/data", {
  headers: {
    "x-api-key": "one_sk_abcd1234..."
  }
});

if (response.status === 429) {
  const resetTime = response.headers.get("X-RateLimit-Reset");
  console.log(`Rate limited. Resets at: ${new Date(resetTime * 1000)}`);
}
```

**Python:**
```python
import requests

headers = {"x-api-key": "one_sk_abcd1234..."}
response = requests.get("https://api.one.ie/api/data", headers=headers)

if response.status_code == 429:
    reset_time = response.headers.get("X-RateLimit-Reset")
    print(f"Rate limited. Resets at: {reset_time}")
```

---

## Permission System

### Checking Permissions

```typescript
import { hasPermission, requirePermission } from "../lib/apiKeyPermissions";

// Check if permission exists
if (hasPermission(permissions, "users", "write")) {
  // Allow user modification
}

// Require permission (throws if missing)
requirePermission(permissions, "data", "export");
```

### Permission Utilities

```typescript
import {
  hasAnyPermission,
  hasAllPermissions,
  requireAnyPermission,
  requireAllPermissions,
  getResourcePermissions,
  isAdmin,
  validatePermissions,
  mergePermissions,
  PERMISSION_PRESETS
} from "../lib/apiKeyPermissions";

// Check multiple permissions
hasAnyPermission(permissions, "users", ["read", "write"]); // true if has ANY
hasAllPermissions(permissions, "users", ["read", "write"]); // true only if has ALL

// Get all permissions for resource
const userPerms = getResourcePermissions(permissions, "users"); // ["read", "write"]

// Check admin
if (isAdmin(permissions, "groups")) {
  // Has admin permission for groups
}

// Validate permissions structure
const errors = validatePermissions(permissions);
if (errors.length > 0) {
  throw new Error(`Invalid permissions: ${errors.join(", ")}`);
}

// Merge permissions (union)
const merged = mergePermissions(
  { users: ["read"] },
  { users: ["write"], projects: ["read"] }
);
// Result: { users: ["read", "write"], projects: ["read"] }

// Use presets
const readOnly = PERMISSION_PRESETS.READ_ONLY;
const superAdmin = PERMISSION_PRESETS.SUPER_ADMIN;
```

### Permission Presets

```typescript
PERMISSION_PRESETS = {
  READ_ONLY: { /* read access to all */ },
  DATA_ADMIN: { data: ["admin"] },
  ANALYTICS_VIEWER: { analytics: ["read", "export"] },
  SUPER_ADMIN: { /* admin for all */ },
  USER_MANAGER: { users: ["read", "write", "delete"] },
  PROJECT_COLLABORATOR: { projects: ["read", "write"], data: ["read", "write"] }
}
```

---

## Security

### Key Generation

- **Algorithm:** Cryptographically secure random (Node.js `crypto`)
- **Format:** `one_sk_<base64url-256-bits>`
- **Entropy:** 256 bits
- **Uniqueness:** Collision probability < 10⁻⁷⁷

### Key Storage

- **Plaintext Storage:** Only during creation (returned to user)
- **Database Storage:** SHA-256 hash only
- **Lookup Method:** Hash comparison (constant-time)

### Best Practices

1. **Never log API keys** - Sensitive data in plaintext
2. **Rotate keys regularly** - Every 90 days recommended
3. **Use minimal permissions** - Grant only what's needed
4. **Set expiration** - Avoid indefinite keys
5. **Monitor usage** - Check for anomalies
6. **Revoke compromised keys** - Immediately on breach

### Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `INVALID_KEY` | API key not found | 401 |
| `KEY_REVOKED` | API key has been revoked | 401 |
| `KEY_EXPIRED` | API key has expired | 401 |
| `USER_NOT_FOUND` | Associated user doesn't exist | 401 |
| `USER_INACTIVE` | User account suspended | 401 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |

---

## 6-Dimension Ontology Mapping

### DIMENSION 3: THINGS
- **API keys** → Things with type: `api_key`
- Stored in `apiKeys` table

### DIMENSION 2: PEOPLE
- **User ownership** → API keys belong to users
- **Group scoping** → API keys inherit user's groupId

### DIMENSION 5: EVENTS
- `api_key_created` - When key is created
- `api_key_used` - When key is used (with metadata)
- `api_key_revoked` - When key is revoked
- `api_key_rotated` - When key is rotated
- `api_key_updated` - When settings are changed
- `api_key_expired` - When key expires

---

## Frontend UI

### API Key Management Page

Location: `/account/api-keys`

**Features:**
- ✅ List all API keys
- ✅ Create new keys with permissions
- ✅ Revoke/rotate keys
- ✅ View usage statistics
- ✅ Copy keys to clipboard
- ✅ One-time key display with warning

**Component:** `/web/src/components/auth/ApiKeyManagement.tsx`

---

## Monitoring & Analytics

### Usage Tracking

All API key usage is logged to the `events` dimension:

```typescript
{
  type: "api_key_used",
  actorId: userId,
  targetId: apiKeyId,
  groupId: groupId,
  timestamp: Date.now(),
  metadata: {
    apiKeyId: apiKeyId,
    apiKeyName: "Production API Key",
    endpoint: "/api/data",
    ipAddress: "192.168.1.1",
    remainingRequests: 847
  }
}
```

### Query Examples

```typescript
// Get API key usage by user
const usage = await ctx.db
  .query("events")
  .withIndex("by_type", (q) => q.eq("type", "api_key_used"))
  .filter((q) => q.eq(q.field("actorId"), userId))
  .collect();

// Find rate limit violations
const violations = await ctx.db
  .query("events")
  .withIndex("by_type", (q) => q.eq("type", "api_key_used"))
  .filter((q) => q.lt(q.field("metadata").remainingRequests, 10))
  .collect();
```

---

## Comparison with Better Auth

### Similarities

✅ Resource-based permissions
✅ Per-key rate limiting
✅ Metadata support
✅ Secure key generation
✅ Usage tracking

### Differences

| Feature | Better Auth | Our Implementation |
|---------|-------------|-------------------|
| **Backend** | Better Auth component | Custom Convex |
| **Key Storage** | Hashed | SHA-256 hashed |
| **Refill System** | Basic | Token bucket with refill |
| **Permissions** | Statements or function | Resource-based object |
| **UI** | Better Auth UI | Custom React components |
| **Events** | Plugin hooks | Full 6-dimension logging |

---

## Future Enhancements

### Planned Features

- [ ] **Scoped API Keys** - Per-endpoint permissions
- [ ] **IP Whitelisting** - Restrict keys to specific IPs
- [ ] **Webhook Signing** - HMAC signatures for webhooks
- [ ] **API Key Versioning** - Support multiple key versions
- [ ] **Request Logging** - Detailed request/response logs
- [ ] **Anomaly Detection** - ML-based usage anomaly detection

---

## References

- [Better Auth API Key Plugin](https://www.better-auth.com/docs/plugins/api-key)
- [Better Auth Rate Limiting](https://www.better-auth.com/docs/concepts/rate-limit)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

**Built with security, scalability, and simplicity in mind.**
