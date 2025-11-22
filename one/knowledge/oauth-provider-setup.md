---
title: OAuth Provider Setup Guide
dimension: knowledge
category: authentication
tags: oauth, better-auth, apple, discord, notion, facebook, figma
related_dimensions: people, things
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document is part of the knowledge dimension in the authentication category.
  Location: one/knowledge/oauth-provider-setup.md
  Purpose: Complete setup guide for 5 additional OAuth providers
  Related dimensions: people, things
  For AI agents: Read this to understand how to configure OAuth providers in Better Auth.
---

# OAuth Provider Setup Guide

**Cycle 65 Implementation:** Adding 5 additional OAuth providers to Better Auth

This guide provides step-by-step instructions for setting up each OAuth provider with Better Auth.

---

## Overview

Better Auth supports multiple OAuth providers out of the box. This guide covers setup for:

1. **Apple Sign In** - iOS/macOS users
2. **Discord** - Gaming/community users
3. **Notion** - Productivity users
4. **Facebook** - Social media users
5. **Figma** - Designers

---

## 1. Apple Sign In

### Why Apple Sign In?
- Required for iOS apps
- Privacy-focused users
- Seamless integration with Apple ecosystem
- High trust factor

### Setup Steps

#### Step 1: Create App ID (Apple Developer Portal)

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** and click **Continue**
5. Select **App** and click **Continue**
6. Fill in:
   - **Description**: Your app name
   - **Bundle ID**: `com.yourcompany.yourapp` (reverse domain notation)
7. Enable **Sign in with Apple** capability
8. Click **Continue** → **Register**

#### Step 2: Create Service ID

1. In Identifiers, click **+** button
2. Select **Services IDs** and click **Continue**
3. Fill in:
   - **Description**: Your service name
   - **Identifier**: `com.yourcompany.yourapp.service`
4. Enable **Sign in with Apple**
5. Click **Configure** next to Sign in with Apple
6. Add domains and redirect URLs:
   - **Domains**: `yourdomain.com`
   - **Return URLs**: `https://yourdomain.com/api/auth/apple/callback`
7. Click **Save** → **Continue** → **Register**

#### Step 3: Create Private Key

1. In **Keys** section, click **+** button
2. Enter **Key Name**
3. Enable **Sign in with Apple**
4. Click **Configure** → Select your App ID
5. Click **Save** → **Continue** → **Register**
6. **Download the .p8 key file** (can only download once!)
7. Note the **Key ID** (10-character string)

#### Step 4: Configure Better Auth

```typescript
// backend/auth.ts or auth config
import { betterAuth } from "better-auth";
import { apple } from "better-auth/social-providers";

export const auth = betterAuth({
  socialProviders: {
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!, // Service ID
      clientSecret: process.env.APPLE_CLIENT_SECRET!, // Generated from key
      teamId: process.env.APPLE_TEAM_ID!,
      keyId: process.env.APPLE_KEY_ID!,
      privateKey: process.env.APPLE_PRIVATE_KEY!, // Contents of .p8 file
    },
  },
});
```

#### Step 5: Environment Variables

```bash
# .env
APPLE_CLIENT_ID=com.yourcompany.yourapp.service
APPLE_TEAM_ID=ABC123DEF4  # Found in Apple Developer account (top right)
APPLE_KEY_ID=XYZ9876543  # From key creation step
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[Contents of .p8 file]
-----END PRIVATE KEY-----"
```

### Required Permissions/Scopes
- `name` (optional)
- `email` (optional)

**Note:** Apple provides name and email only on first sign-in. Store this data immediately!

### Callback URL Format
```
https://yourdomain.com/api/auth/apple/callback
```

---

## 2. Discord OAuth

### Why Discord?
- 150M+ monthly active users
- Gaming and community-focused
- Rich user profiles
- Active developer community

### Setup Steps

#### Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Enter application name
4. Click **Create**

#### Step 2: Configure OAuth2

1. In your application, go to **OAuth2** → **General**
2. Copy **Client ID** and **Client Secret**
3. Click **Add Redirect** under **Redirects**
4. Add: `https://yourdomain.com/api/auth/discord/callback`
5. Click **Save Changes**

#### Step 3: Configure Better Auth

```typescript
// backend/auth.ts
import { betterAuth } from "better-auth";
import { discord } from "better-auth/social-providers";

export const auth = betterAuth({
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
});
```

#### Step 4: Environment Variables

```bash
# .env
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_CLIENT_SECRET=abcdef123456-DISCORD-SECRET-xyz789
```

### Required Permissions/Scopes
- `identify` - Basic user information
- `email` - User email address

### Callback URL Format
```
https://yourdomain.com/api/auth/discord/callback
```

### Optional: Bot Integration
If you want to add Discord bot features, you can enable **Bot** in your application and add bot permissions. This allows features like:
- Server membership verification
- Role-based access
- Discord notifications

---

## 3. Notion OAuth

### Why Notion?
- Popular productivity tool
- Professional users
- Workspace integration
- Rich data access

### Setup Steps

#### Step 1: Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Fill in:
   - **Name**: Your app name
   - **Associated workspace**: Select workspace
   - **Logo**: Upload logo (optional)
4. Click **Submit**

#### Step 2: Configure OAuth

1. In integration settings, go to **Capabilities**
2. Enable **Public integration**
3. Under **OAuth Domain & URIs**:
   - **Redirect URIs**: Add `https://yourdomain.com/api/auth/notion/callback`
4. Copy **OAuth client ID** and **OAuth client secret**
5. Click **Save changes**

#### Step 3: Configure Better Auth

```typescript
// backend/auth.ts
import { betterAuth } from "better-auth";
import { notion } from "better-auth/social-providers";

export const auth = betterAuth({
  socialProviders: {
    notion: {
      clientId: process.env.NOTION_CLIENT_ID!,
      clientSecret: process.env.NOTION_CLIENT_SECRET!,
    },
  },
});
```

#### Step 4: Environment Variables

```bash
# .env
NOTION_CLIENT_ID=abc123-notion-client-id-xyz789
NOTION_CLIENT_SECRET=secret_notionOAuthSecretKey123
```

### Required Permissions/Scopes
- User information (name, email, avatar)

### Callback URL Format
```
https://yourdomain.com/api/auth/notion/callback
```

### Optional: Workspace Access
For workspace integration features, you can request additional scopes to:
- Access workspace pages
- Read/write database content
- Create pages

---

## 4. Facebook Login

### Why Facebook?
- 2.9 billion monthly active users
- Global reach
- Rich social graph
- Verified profiles

### Setup Steps

#### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** or **Business** use case
4. Click **Continue**
5. Fill in:
   - **App Name**: Your app name
   - **App Contact Email**: Your email
   - **Business Account**: Select if applicable
6. Click **Create App**

#### Step 2: Add Facebook Login Product

1. In app dashboard, find **Facebook Login**
2. Click **Set Up**
3. Select **Web** platform
4. Enter **Site URL**: `https://yourdomain.com`
5. Click **Save** → **Continue**

#### Step 3: Configure OAuth Settings

1. Go to **Facebook Login** → **Settings**
2. Under **Valid OAuth Redirect URIs**, add:
   - `https://yourdomain.com/api/auth/facebook/callback`
3. Enable **Client OAuth Login**: Yes
4. Enable **Web OAuth Login**: Yes
5. Click **Save Changes**

#### Step 4: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy **App ID** and **App Secret**
3. Add **Privacy Policy URL** and **Terms of Service URL**
4. Click **Save Changes**

#### Step 5: Configure Better Auth

```typescript
// backend/auth.ts
import { betterAuth } from "better-auth";
import { facebook } from "better-auth/social-providers";

export const auth = betterAuth({
  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
    },
  },
});
```

#### Step 6: Environment Variables

```bash
# .env
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123facebook-app-secret-xyz789
```

#### Step 7: Submit for Review (Production)

For production use, you must submit your app for review:
1. Go to **App Review** → **Permissions and Features**
2. Request **public_profile** and **email** permissions
3. Provide use case explanation
4. Submit for review

### Required Permissions/Scopes
- `public_profile` - Name, profile picture
- `email` - Email address

### Callback URL Format
```
https://yourdomain.com/api/auth/facebook/callback
```

### Development Mode
- During development, your app is in **Development Mode**
- Only users with Developer, Admin, or Tester roles can sign in
- Switch to **Live Mode** after Facebook review approval

---

## 5. Figma OAuth

### Why Figma?
- 4 million+ designers
- Professional design tool
- Team collaboration
- File access integration

### Setup Steps

#### Step 1: Create Figma App

1. Go to [Figma Apps](https://www.figma.com/developers/apps)
2. Click **Create new app**
3. Fill in:
   - **App name**: Your app name
   - **Description**: Brief description
   - **Website**: Your website URL
4. Click **Create app**

#### Step 2: Configure OAuth

1. In your app settings, find **OAuth 2.0**
2. Under **Redirect URI**, add:
   - `https://yourdomain.com/api/auth/figma/callback`
3. Copy **Client ID** and **Client Secret**
4. Click **Save**

#### Step 3: Configure Better Auth

```typescript
// backend/auth.ts
import { betterAuth } from "better-auth";
import { figma } from "better-auth/social-providers";

export const auth = betterAuth({
  socialProviders: {
    figma: {
      clientId: process.env.FIGMA_CLIENT_ID!,
      clientSecret: process.env.FIGMA_CLIENT_SECRET!,
    },
  },
});
```

#### Step 4: Environment Variables

```bash
# .env
FIGMA_CLIENT_ID=abcdef-figma-client-id-123456
FIGMA_CLIENT_SECRET=secret-figma-oauth-key-xyz789
```

### Required Permissions/Scopes
- User information (name, email, avatar)
- `file_read` (optional) - Read Figma files
- `file_write` (optional) - Write Figma files

### Callback URL Format
```
https://yourdomain.com/api/auth/figma/callback
```

### Optional: File Access
For file integration features, you can request additional scopes to:
- Read user's Figma files
- Access team files (with permission)
- Export file assets
- Create/modify files

---

## Testing OAuth Providers

### Local Development

For local testing, you need to:

1. **Use HTTPS locally** (required by most OAuth providers):
   ```bash
   # Use ngrok or similar
   ngrok http 4321

   # Or use Cloudflare Tunnel
   cloudflared tunnel --url http://localhost:4321
   ```

2. **Update redirect URLs** in each provider's settings to use your tunnel URL:
   ```
   https://your-tunnel-url.ngrok.io/api/auth/[provider]/callback
   ```

3. **Update environment variables** to use tunnel URL as base:
   ```bash
   PUBLIC_BASE_URL=https://your-tunnel-url.ngrok.io
   ```

### Production Deployment

1. **Update redirect URLs** to production domain
2. **Enable HTTPS** (required for OAuth)
3. **Verify environment variables** are set in production
4. **Test each provider** individually

---

## Security Best Practices

### 1. Environment Variables
- **NEVER** commit secrets to version control
- Use `.env` files (git-ignored)
- Use environment variable management (Vercel, Railway, etc.)
- Rotate secrets regularly

### 2. HTTPS Required
- All OAuth providers require HTTPS in production
- Use valid SSL certificates (Let's Encrypt, Cloudflare)
- Enforce HTTPS redirects

### 3. Validate Redirect URLs
- Add only necessary redirect URLs
- Use exact URLs (no wildcards in production)
- Keep redirect URLs up to date

### 4. State Parameter
Better Auth automatically handles state parameter for CSRF protection. No manual implementation needed.

### 5. Token Storage
- Better Auth stores tokens securely in the database
- Uses httpOnly cookies for session management
- Automatic token refresh (where supported)

---

## Troubleshooting

### Common Issues

#### 1. "Redirect URI Mismatch" Error
**Solution:**
- Verify redirect URL exactly matches provider settings
- Include protocol (https://)
- Check for trailing slashes
- Ensure domain is verified (Apple, Facebook)

#### 2. "Invalid Client" Error
**Solution:**
- Verify Client ID is correct
- Verify Client Secret is correct
- Check environment variables are loaded
- Ensure credentials are for correct environment (dev vs prod)

#### 3. "Scope Not Approved" Error (Facebook)
**Solution:**
- Submit app for review
- Request specific permissions
- Provide use case documentation

#### 4. "Private Key Invalid" Error (Apple)
**Solution:**
- Verify .p8 file contents are correct
- Include full key including BEGIN/END markers
- Check for extra whitespace or newlines
- Ensure key is not revoked

#### 5. Email/Name Not Returned
**Solution:**
- Request correct scopes in provider settings
- Apple: Only returns data on first sign-in
- Check if user denied permission
- Verify scope configuration in Better Auth

---

## Provider Comparison

| Provider | Monthly Users | Primary Audience | Setup Complexity | Approval Required |
|----------|---------------|------------------|------------------|-------------------|
| **Apple** | iOS/macOS users | Privacy-focused | High | No |
| **Discord** | 150M+ | Gamers, Communities | Low | No |
| **Notion** | 30M+ | Professionals | Medium | No |
| **Facebook** | 2.9B+ | General public | Medium | Yes (production) |
| **Figma** | 4M+ | Designers | Low | No |

---

## Next Steps

After setting up OAuth providers:

1. **Test each provider** in development
2. **Update privacy policy** to mention OAuth providers
3. **Update terms of service** if required
4. **Add provider icons** to sign-in page (✅ Already done)
5. **Submit for review** (Facebook in production)
6. **Monitor sign-in metrics** via Better Auth dashboard
7. **Set up error logging** for OAuth failures

---

## Additional Resources

### Official Documentation
- [Better Auth Social Providers](https://www.better-auth.com/docs/social-providers)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)
- [Discord OAuth2](https://discord.com/developers/docs/topics/oauth2)
- [Notion OAuth](https://developers.notion.com/docs/authorization)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [Figma OAuth](https://www.figma.com/developers/api#oauth2)

### Better Auth Features
- [Account Linking](https://www.better-auth.com/docs/concepts/users-accounts)
- [Session Management](https://www.better-auth.com/docs/concepts/sessions)
- [Event Logging](https://www.better-auth.com/docs/concepts/hooks)

---

**Built with security, simplicity, and user choice in mind.**
