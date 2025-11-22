---
title: Shopify Authentication
dimension: connections
category: shopify-auth.md
tags: api, authentication, oauth, security, shopify, integration
related_dimensions: events, knowledge, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document is part of the connections dimension in the shopify-auth.md category.
  Location: one/connections/shopify-auth.md
  Purpose: Documents Shopify OAuth 2.0 authentication for ShopifyProvider integration
  Related dimensions: events, knowledge, people
  For AI agents: Read this to understand Shopify authentication flows and access token management.
---

# Shopify Authentication Guide

**Complete guide to Shopify OAuth 2.0 authentication for ONE Platform integration**

**Last Updated:** 2025-11-22
**Status:** Research Complete
**OAuth Version:** 2.0

---

## Executive Summary

Shopify uses **OAuth 2.0** for app authentication, ensuring secure access to store data without exposing sensitive credentials. This guide covers authentication methods for building a **ShopifyProvider** that integrates with the ONE Platform.

**Key Authentication Methods:**
1. ✅ **Token Exchange** (Recommended for embedded apps)
2. ✅ **Authorization Code Grant** (For non-embedded apps)
3. ✅ **Custom Apps** (For single-store integrations)

**ONE Platform Decision:** We will support **Custom Apps** (simplest) and **Authorization Code Grant** (multi-store support) for the ShopifyProvider.

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [Custom Apps vs Public Apps](#custom-apps-vs-public-apps)
3. [Custom App Authentication](#custom-app-authentication)
4. [OAuth 2.0 Authorization Code Grant](#oauth-20-authorization-code-grant)
5. [Token Exchange (Embedded Apps)](#token-exchange-embedded-apps)
6. [Access Token Management](#access-token-management)
7. [API Access Scopes](#api-access-scopes)
8. [Security Best Practices](#security-best-practices)
9. [Implementation Examples](#implementation-examples)
10. [Troubleshooting](#troubleshooting)

---

## Authentication Overview

### Authentication Flow Comparison

| Method | Use Case | Complexity | Multi-Store | Embedded |
|--------|----------|------------|-------------|----------|
| **Custom App** | Single store | Low | ❌ No | ❌ No |
| **Authorization Code Grant** | Public app, multi-store | Medium | ✅ Yes | ❌ No |
| **Token Exchange** | Embedded app | Low | ✅ Yes | ✅ Yes |

### Shopify's Recommendation

From the official documentation:
> "Shopify recommends creating embedded apps that use Shopify managed installation and token exchange whenever possible."

However, for a **DataProvider integration** like ShopifyProvider, we will use:
- **Custom Apps** for single-store connections (simplest)
- **Authorization Code Grant** for multi-tenant ONE installations (supports multiple stores)

---

## Custom Apps vs Public Apps

### Custom Apps (Private Apps)

**What They Are:**
- Apps created directly in the Shopify admin
- Designed for single-store use
- Access tokens generated immediately
- No OAuth flow required
- Perfect for internal integrations

**When to Use:**
- Building a private integration for one store
- Testing and development
- Backend-only integrations (no UI)
- ONE Platform installations connecting to a single Shopify store

**Limitations:**
- ❌ Cannot be listed in Shopify App Store
- ❌ One store per app
- ❌ Cannot be embedded in Shopify admin
- ❌ Tokens don't expire (manage securely)

### Public Apps (OAuth Apps)

**What They Are:**
- Apps that can be installed on multiple stores
- Use OAuth 2.0 for authorization
- Can be listed in Shopify App Store
- Support embedded UI in Shopify admin

**When to Use:**
- Building an app for multiple merchants
- Distributing via Shopify App Store
- Multi-tenant ONE installations
- Apps with embedded UI

**Benefits:**
- ✅ Multi-store support
- ✅ Standardized OAuth flow
- ✅ Can be embedded in Shopify admin
- ✅ App Store distribution

---

## Custom App Authentication

### Step 1: Create Custom App in Shopify Admin

1. Go to **Settings** → **Apps and sales channels**
2. Click **Develop apps**
3. Click **Create an app**
4. Enter app name (e.g., "ONE Platform Integration")
5. Click **Create app**

### Step 2: Configure API Access

1. Click **Configure Admin API scopes**
2. Select required scopes (see [API Access Scopes](#api-access-scopes))
3. Click **Save**

**Recommended Scopes for ShopifyProvider:**
```
read_products
write_products
read_orders
write_orders
read_customers
write_customers
read_inventory
write_inventory
read_fulfillments
write_fulfillments
```

### Step 3: Install App and Get Access Token

1. Click **Install app**
2. Click **Reveal token once** to view access token
3. **CRITICAL:** Copy and save the token immediately (it won't be shown again)
4. Store token securely (environment variables, secrets manager)

### Step 4: Use Access Token

```http
GET /admin/api/2025-10/products.json HTTP/1.1
Host: {store_name}.myshopify.com
X-Shopify-Access-Token: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Access Token Format:**
- Starts with `shpat_` for custom apps
- 32+ characters
- Never expires (until revoked)

### Security Considerations

- ✅ Store token in environment variables or secrets manager
- ✅ Never commit tokens to version control
- ✅ Use HTTPS for all API requests
- ✅ Rotate tokens periodically
- ✅ Revoke tokens when no longer needed

---

## OAuth 2.0 Authorization Code Grant

**Use this for:** Public apps that can be installed on multiple Shopify stores.

### Overview

The authorization code grant flow involves:
1. Merchant initiates installation
2. Redirect to Shopify authorization page
3. Merchant approves requested scopes
4. Shopify redirects back with authorization code
5. Exchange code for access token
6. Use access token for API requests

### Prerequisites

1. **Create App in Shopify Partners Dashboard**
   - Go to https://partners.shopify.com
   - Create a new app
   - Configure app URLs (callback URL, etc.)
   - Get API credentials (Client ID, Client Secret)

2. **Configure App URLs**
   - **App URL:** Where your app is hosted
   - **Allowed redirection URL(s):** OAuth callback endpoint

### Step-by-Step Flow

#### Step 1: Initiate Installation

When a merchant wants to install your app, redirect them to:

```
https://{shop}.myshopify.com/admin/oauth/authorize?
  client_id={api_key}&
  scope={scopes}&
  redirect_uri={redirect_uri}&
  state={nonce}&
  grant_options[]={access_mode}
```

**Parameters:**
- `client_id` - Your app's API key (from Partners dashboard)
- `scope` - Comma-separated list of access scopes (e.g., `read_products,write_orders`)
- `redirect_uri` - Your OAuth callback URL (must match Partners config)
- `state` - Random nonce for CSRF protection (required)
- `grant_options[]` - Optional: `per-user` for online access mode

**Example:**
```
https://example-store.myshopify.com/admin/oauth/authorize?
  client_id=abc123def456&
  scope=read_products,write_orders,read_customers&
  redirect_uri=https://one.ie/api/shopify/callback&
  state=randomnonce123&
  grant_options[]=per-user
```

#### Step 2: Merchant Approves

Merchant sees a screen like:
```
"ONE Platform" wants to access your store data:
- Read products
- Write orders
- Read customers

[Install app] [Cancel]
```

#### Step 3: Handle Callback

After approval, Shopify redirects to your callback URL:

```
https://one.ie/api/shopify/callback?
  code=0907a61c0c8d55e99db179b68161bc00&
  hmac=700e2dadb827fcc8609e9d5ce208b2e9cdaab9df07390d2cbca10d7c328fc4bf&
  host=cXVpY2tzdGFydC0...&
  shop=example-store.myshopify.com&
  state=randomnonce123&
  timestamp=1337178173
```

**Verify Callback:**
1. ✅ Verify `state` matches your nonce (CSRF protection)
2. ✅ Verify `hmac` to ensure request is from Shopify
3. ✅ Verify `shop` domain is valid (`.myshopify.com`)

**HMAC Verification (Node.js):**
```typescript
import crypto from 'crypto';

function verifyHmac(query: Record<string, string>, secret: string): boolean {
  const { hmac, ...params } = query;

  // Sort parameters and build query string
  const message = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Calculate HMAC
  const calculatedHmac = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  // Compare with provided HMAC (constant-time comparison)
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(calculatedHmac)
  );
}
```

#### Step 4: Exchange Code for Access Token

Make a POST request to exchange the authorization code for an access token:

```http
POST /admin/oauth/access_token HTTP/1.1
Host: {shop}.myshopify.com
Content-Type: application/json

{
  "client_id": "{api_key}",
  "client_secret": "{api_secret}",
  "code": "{authorization_code}"
}
```

**Response:**
```json
{
  "access_token": "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "scope": "read_products,write_orders,read_customers",
  "expires_in": null,
  "associated_user_scope": "read_products",
  "associated_user": {
    "id": 1234567890,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "email_verified": true,
    "account_owner": true,
    "locale": "en",
    "collaborator": false
  }
}
```

**Access Token Types:**
- **Offline access:** `expires_in: null` (token never expires)
- **Online access:** `expires_in: 86400` (token expires in 24 hours)

#### Step 5: Store Access Token

```typescript
// Store in database
await db.shopifyStores.insert({
  shopDomain: shop,
  accessToken: encrypted(access_token), // ENCRYPT!
  scopes: scope,
  installedAt: new Date(),
  metadata: {
    associatedUser: associated_user
  }
});
```

**CRITICAL:** Encrypt access tokens before storing!

#### Step 6: Use Access Token

```http
GET /admin/api/2025-10/products.json HTTP/1.1
Host: {shop}.myshopify.com
X-Shopify-Access-Token: {access_token}
```

---

## Token Exchange (Embedded Apps)

**Note:** This is Shopify's recommended approach for embedded apps (apps that run inside the Shopify admin UI).

### Overview

Token exchange eliminates the need for the traditional OAuth flow:
1. App loads inside Shopify admin iframe
2. Session token provided by Shopify App Bridge
3. Exchange session token for access token
4. Use access token for API requests

### When to Use

- Building an embedded app (runs in Shopify admin)
- Want to avoid redirect-based OAuth flow
- Using Shopify App Bridge

### Flow

1. **Initialize Shopify App Bridge:**
```typescript
import createApp from '@shopify/app-bridge';

const app = createApp({
  apiKey: 'api_key',
  host: new URLSearchParams(location.search).get('host'),
});
```

2. **Get Session Token:**
```typescript
import { getSessionToken } from '@shopify/app-bridge/utilities';

const sessionToken = await getSessionToken(app);
```

3. **Exchange for Access Token:**
```http
POST /admin/oauth/access_token HTTP/1.1
Host: {shop}.myshopify.com
Content-Type: application/json

{
  "client_id": "{api_key}",
  "client_secret": "{api_secret}",
  "session_token": "{session_token}"
}
```

4. **Use Access Token:**
```http
GET /admin/api/2025-10/products.json HTTP/1.1
Host: {shop}.myshopify.com
X-Shopify-Access-Token: {access_token}
```

**For ShopifyProvider:** We won't use token exchange since we're building a DataProvider (backend integration), not an embedded UI app.

---

## Access Token Management

### Token Lifecycle

**Custom Apps:**
- ✅ Never expire (until manually revoked)
- ✅ Tied to the app (not a user)
- ❌ Cannot be refreshed (create new token instead)

**OAuth Apps (Offline Access):**
- ✅ Never expire (until app uninstalled or revoked)
- ✅ Tied to the store (not a user)
- ✅ Persist across sessions

**OAuth Apps (Online Access):**
- ❌ Expire after 24 hours
- ✅ Tied to a specific user
- ✅ Can be refreshed (if implemented)

### Token Storage

**Best Practices:**
1. **Encrypt tokens** before storing in database
2. **Use environment variables** for development tokens
3. **Never log tokens** in application logs
4. **Use secrets manager** for production (AWS Secrets Manager, etc.)
5. **Scope tokens minimally** (only request needed permissions)

**Example (Node.js with encryption):**
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### Token Revocation

**When to Revoke:**
- App uninstalled by merchant
- Security breach detected
- User requests data deletion (GDPR)
- Token no longer needed

**How to Revoke:**
1. Delete token from your database
2. (Optional) Call Shopify API to revoke (if using OAuth)

---

## API Access Scopes

### Scope Format

Scopes follow the pattern: `{read|write}_{resource}`

**Examples:**
- `read_products` - Read product data
- `write_products` - Create/update/delete products
- `read_orders` - Read order data
- `write_orders` - Create/update orders

### Recommended Scopes for ShopifyProvider

**Minimum Scopes (Read-Only):**
```
read_products
read_orders
read_customers
read_inventory
```

**Full Access (Read + Write):**
```
read_products,write_products
read_orders,write_orders
read_customers,write_customers
read_inventory,write_inventory
read_fulfillments,write_fulfillments
read_locations
```

### Complete Scope List

| Scope | Description |
|-------|-------------|
| `read_products` | Read products, variants, collections |
| `write_products` | Create/update/delete products |
| `read_orders` | Read order data |
| `write_orders` | Create/update orders |
| `read_customers` | Read customer data |
| `write_customers` | Create/update/delete customers |
| `read_inventory` | Read inventory levels |
| `write_inventory` | Adjust inventory quantities |
| `read_fulfillments` | Read fulfillment data |
| `write_fulfillments` | Create/update fulfillments |
| `read_locations` | Read location data |
| `read_price_rules` | Read discounts and promotions |
| `write_price_rules` | Create/update discounts |
| `read_checkouts` | Read checkout data |
| `write_checkouts` | Create checkouts |
| `read_analytics` | Access analytics data |

**Full list:** https://shopify.dev/docs/api/usage/access-scopes

### Scope Best Practices

1. **Request minimum scopes** - Only request what you need
2. **Use read-only scopes** - If you don't need write access
3. **Document scope usage** - Explain why each scope is needed
4. **Review periodically** - Remove unused scopes

---

## Security Best Practices

### 1. Verify All Callbacks

**Always verify HMAC signatures:**
```typescript
if (!verifyHmac(query, clientSecret)) {
  throw new Error('Invalid HMAC signature');
}
```

### 2. Use State Parameter (CSRF Protection)

**Generate random nonce:**
```typescript
const state = crypto.randomBytes(32).toString('hex');
// Store in session/database
session.oauthState = state;
```

**Verify on callback:**
```typescript
if (query.state !== session.oauthState) {
  throw new Error('CSRF state mismatch');
}
```

### 3. Validate Shop Domain

**Only allow `.myshopify.com` domains:**
```typescript
function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}
```

### 4. Use HTTPS Everywhere

- ✅ All API requests must use HTTPS
- ✅ OAuth redirect URLs must use HTTPS
- ✅ Never send tokens over HTTP

### 5. Encrypt Stored Tokens

```typescript
const encryptedToken = encrypt(accessToken);
await db.insert({ shop, token: encryptedToken });
```

### 6. Implement Rate Limiting

Protect your OAuth endpoint from abuse:
```typescript
const rateLimit = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const attempts = rateLimit.get(ip) || 0;
  if (attempts > 10) return false;
  rateLimit.set(ip, attempts + 1);
  return true;
}
```

### 7. Log Security Events

```typescript
logger.info('OAuth flow initiated', { shop, ip });
logger.warn('Invalid HMAC signature', { shop, ip });
logger.error('CSRF state mismatch', { shop, ip });
```

---

## Implementation Examples

### Example 1: Custom App Authentication

```typescript
// convex/shopify/customAppClient.ts
import { GraphQLClient } from 'graphql-request';

export function createShopifyClient(shop: string, accessToken: string) {
  return new GraphQLClient(
    `https://${shop}/admin/api/2025-10/graphql.json`,
    {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Usage
const client = createShopifyClient(
  'example-store.myshopify.com',
  process.env.SHOPIFY_ACCESS_TOKEN
);

const products = await client.request(`
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`);
```

### Example 2: OAuth Flow (Express.js)

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const REDIRECT_URI = 'https://one.ie/api/shopify/callback';
const SCOPES = 'read_products,write_orders,read_customers';

// Step 1: Initiate installation
app.get('/api/shopify/install', (req, res) => {
  const { shop } = req.query;

  if (!isValidShopDomain(shop)) {
    return res.status(400).send('Invalid shop domain');
  }

  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('state', state);

  res.redirect(authUrl.toString());
});

// Step 2: Handle callback
app.get('/api/shopify/callback', async (req, res) => {
  const { code, hmac, shop, state } = req.query;

  // Verify HMAC
  if (!verifyHmac(req.query, CLIENT_SECRET)) {
    return res.status(403).send('HMAC verification failed');
  }

  // Verify state (CSRF)
  if (state !== req.session.oauthState) {
    return res.status(403).send('State mismatch');
  }

  // Exchange code for access token
  const tokenResponse = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    }
  );

  const { access_token, scope } = await tokenResponse.json();

  // Store token (encrypted)
  await db.shopifyStores.insert({
    shop,
    accessToken: encrypt(access_token),
    scopes: scope,
    installedAt: new Date(),
  });

  res.send('Installation successful!');
});
```

### Example 3: ShopifyProvider Authentication

```typescript
// convex/providers/ShopifyProvider.ts
import { Effect } from 'effect';
import { GraphQLClient } from 'graphql-request';

export class ShopifyProvider {
  private client: GraphQLClient;

  constructor(shop: string, accessToken: string) {
    this.client = new GraphQLClient(
      `https://${shop}/admin/api/2025-10/graphql.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );
  }

  static fromCustomApp(shop: string, accessToken: string): ShopifyProvider {
    return new ShopifyProvider(shop, accessToken);
  }

  static async fromOAuth(shop: string): Promise<ShopifyProvider> {
    // Retrieve stored access token from database
    const store = await db.shopifyStores.findOne({ shop });
    if (!store) throw new Error('Store not found');

    const accessToken = decrypt(store.accessToken);
    return new ShopifyProvider(shop, accessToken);
  }

  async query<T>(query: string, variables?: any): Promise<T> {
    return this.client.request<T>(query, variables);
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid HMAC signature"

**Cause:** Callback verification failed

**Solution:**
- Ensure you're using the correct client secret
- Don't decode/encode query parameters
- Include all parameters except `hmac` in verification

#### 2. "State mismatch"

**Cause:** CSRF state doesn't match

**Solution:**
- Ensure state is stored in session before redirect
- Verify state parameter on callback
- Check session configuration (cookies enabled, etc.)

#### 3. "Invalid redirect URI"

**Cause:** Callback URL doesn't match Partners config

**Solution:**
- Verify redirect URI in Partners dashboard
- Ensure exact match (including protocol, domain, path)
- Check for trailing slashes

#### 4. "Access token expired"

**Cause:** Online access token expired (24 hours)

**Solution:**
- Use offline access mode (`grant_options[]=` omitted)
- Implement token refresh flow
- Re-authenticate user

#### 5. "Insufficient permissions"

**Cause:** Missing required scope

**Solution:**
- Request additional scopes in OAuth flow
- Re-install app with new scopes
- Check scope requirements in API docs

### Debug Checklist

- [ ] Verify shop domain format (`.myshopify.com`)
- [ ] Check HMAC verification logic
- [ ] Verify state parameter matches
- [ ] Ensure redirect URI matches Partners config
- [ ] Check access token format (`shpat_...`)
- [ ] Verify scopes are sufficient
- [ ] Test with HTTPS (never HTTP)
- [ ] Check API version in endpoint URL

---

## Resources & References

**Official Documentation:**
- [Authentication & Authorization](https://shopify.dev/docs/apps/build/authentication-authorization)
- [Authorization Code Grant](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant)
- [Token Exchange](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant)
- [Access Scopes](https://shopify.dev/docs/api/usage/access-scopes)

**Tools:**
- [Shopify Partners Dashboard](https://partners.shopify.com)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge)

---

## Next Steps

1. **Choose Authentication Method:**
   - Custom App (single store) → Simplest
   - OAuth (multi-store) → Most flexible

2. **Implement Authentication:**
   - Create app in Shopify admin or Partners dashboard
   - Get API credentials (access token or client ID/secret)
   - Implement OAuth flow (if using public app)

3. **Store Credentials Securely:**
   - Encrypt access tokens
   - Use environment variables or secrets manager
   - Never commit credentials to version control

4. **Test Authentication:**
   - Make test API request
   - Verify scopes are sufficient
   - Handle errors gracefully

5. **Read Next:**
   - [Shopify Webhooks](./shopify-webhooks.md) - Real-time event notifications
   - [Shopify API Reference](./shopify-api-reference.md) - API resources and queries

---

**This documentation is part of the Shopify Integration for ONE Platform. See the 100-cycle plan in `/one/events/shopify-integration-plan.md` for implementation roadmap.**
