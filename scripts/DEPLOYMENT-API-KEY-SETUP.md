# Cloudflare Global API Key Setup Guide

## Overview

This guide covers the standardized use of **Cloudflare Global API Key** across all ONE Platform deployment scripts and commands. The Global API Key provides:

- ✅ Full programmatic access to Cloudflare API
- ✅ Zero-confirmation automated deployments
- ✅ Works in CI/CD pipelines and automation workflows
- ✅ Support for all Cloudflare services (Pages, Workers, KV, D1, R2)

## Quick Setup

### Step 1: Get Your Cloudflare Credentials

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Scroll to "API Tokens" section
3. Click "Create Token" → Select "Global API Key" option
   - Note: Global API Key provides FULL ACCESS to your Cloudflare account
   - Keep it secure, treat it like a password
4. Copy your Global API Key
5. Go to https://dash.cloudflare.com/profile/overview
6. Copy your Account ID

### Step 2: Set Environment Variables

**Option A: Using Root .env (Recommended for Automation)**

Create or update `/Users/toc/Server/ONE/.env`:

```bash
# Cloudflare Global API Key (FULL ACCESS - keep secure!)
CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key-here
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
CLOUDFLARE_EMAIL=your-email@cloudflare.com
```

This file is automatically loaded by all deployment scripts.

**Option B: Using Environment Variables (for CI/CD)**

```bash
export CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_EMAIL=your-email@cloudflare.com
```

**Option C: Scoped Access (Alternative)**

If you prefer limited access, use API Token instead:

```bash
export CLOUDFLARE_API_TOKEN=your-scoped-api-token
export CLOUDFLARE_ACCOUNT_ID=your-account-id
```

Scripts will automatically detect and use whichever is available (Global Key preferred).

## Deployment Commands

### Deploy Web Application

```bash
# Automatic (uses credentials from .env)
./scripts/cloudflare-deploy.sh deploy web apps/one/web/dist production

# Check deployment status
./scripts/cloudflare-deploy.sh status web

# List recent deployments
./scripts/cloudflare-deploy.sh list web 5

# Rollback to previous deployment
./scripts/cloudflare-deploy.sh rollback web
```

### Release New Version

```bash
# Patch release (bug fixes)
./scripts/release.sh patch

# Minor release (new features)
./scripts/release.sh minor

# Major release (breaking changes)
./scripts/release.sh major

# Sync files without version bump
./scripts/release.sh sync
```

The release script automatically:
1. Bumps version
2. Syncs files to deployment repositories
3. Publishes to npm
4. Builds web application
5. Deploys to Cloudflare Pages using Global API Key
6. Generates deployment report

## How It Works

### Authentication Flow

```
┌─────────────────────────────────────────┐
│  Check Environment for Credentials      │
└──────────────┬──────────────────────────┘
               │
               ├─→ CLOUDFLARE_GLOBAL_API_KEY set?
               │   └─→ Use X-Auth-Key + X-Auth-Email headers
               │
               ├─→ CLOUDFLARE_API_TOKEN set?
               │   └─→ Use Authorization: Bearer token
               │
               └─→ Neither set?
                   └─→ Fall back to wrangler CLI (interactive)
```

### Script Support Matrix

| Script | Global Key Support | API Token Support | Wrangler Fallback |
|--------|-------------------|------------------|------------------|
| `cloudflare-deploy.sh` | ✅ Full | ✅ Full | ✅ Yes |
| `scripts/release.sh` | ✅ Full | ✅ Full | ✅ Yes |
| `wrangler pages deploy` | ❌ Manual | ⚠️ Requires wrangler login | ✅ Yes |

## Updated Files

### 1. `scripts/cloudflare-deploy.sh`

**Changes:**
- Updated `validate_env()` to accept both Global Key and API Token
- Modified authentication header logic in all API calls
- Graceful fallback to wrangler CLI if no credentials available

**New functions:**
- Improved error messages showing credential requirements
- Support for both authentication methods in all API endpoints

**Usage:**
```bash
./scripts/cloudflare-deploy.sh deploy web dist production
./scripts/cloudflare-deploy.sh status web
./scripts/cloudflare-deploy.sh list web 5
```

### 2. `.claude/commands/deploy.md`

**Changes:**
- Updated requirements section to show Global API Key setup
- Added authentication failure troubleshooting
- Clarified fallback mechanisms

**New content:**
- How to set Cloudflare environment variables
- Common issues and solutions
- Support for both Global Key and API Token

### 3. `.claude/agents/agent-ops.md`

**Changes:**
- Added comprehensive "Cloudflare Global API Key Setup" section
- Documents critical security considerations
- Shows deployment patterns with both methods

**New section covers:**
- Why use Global API Key vs API Token
- Required environment variables
- Deployment commands with examples
- Release workflow integration

### 4. `scripts/release.sh` (Already Supported)

**Existing support:**
- Already detects CLOUDFLARE_GLOBAL_API_KEY
- Falls back to CLOUDFLARE_API_TOKEN if available
- Shows appropriate messages for each method

No changes needed - already fully integrated.

### 5. `CLAUDE.md` (Already Documented)

**Existing documentation:**
- Environment Variables section explains Global API Key requirement
- Security considerations for storing credentials
- Instructions for both root and web/.env.local files

No changes needed - already comprehensive.

## Security Best Practices

### Do's ✅

- ✅ Store Global API Key in root `.env` file (git-ignored)
- ✅ Use `CLOUDFLARE_EMAIL` for identifying the account
- ✅ Rotate API keys periodically
- ✅ Use API Tokens with limited scope for CI/CD when possible
- ✅ Keep `.env` file secure and never commit it
- ✅ Review Cloudflare audit logs for suspicious activity

### Don'ts ❌

- ❌ Never commit `.env` to version control
- ❌ Never share Global API Keys publicly
- ❌ Never use Global API Key in client-side code
- ❌ Never paste credentials in chat/logs
- ❌ Never hardcode credentials in scripts
- ❌ Never use production credentials in development

## Troubleshooting

### Error: "Authentication error [code: 10000]"

**Cause:** Invalid or expired credentials

**Fix:**
```bash
# Verify credentials are set
echo $CLOUDFLARE_GLOBAL_API_KEY
echo $CLOUDFLARE_ACCOUNT_ID

# Re-check credentials at https://dash.cloudflare.com/profile/api-tokens
# Generate new Global API Key if needed
```

### Error: "Project '...' not found"

**Cause:** Wrong project name or account ID

**Fix:**
```bash
# Verify correct project names
wrangler pages project list

# Verify account ID
curl -H "X-Auth-Key: $CLOUDFLARE_GLOBAL_API_KEY" \
     -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
     https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects
```

### Error: "Missing required environment variables"

**Cause:** One or more credentials not set

**Fix:**
```bash
# Check all required variables
echo "Global API Key: ${CLOUDFLARE_GLOBAL_API_KEY:-not set}"
echo "Account ID: ${CLOUDFLARE_ACCOUNT_ID:-not set}"
echo "Email: ${CLOUDFLARE_EMAIL:-not set}"

# Update .env file or environment
export CLOUDFLARE_GLOBAL_API_KEY=your-key
export CLOUDFLARE_ACCOUNT_ID=your-id
export CLOUDFLARE_EMAIL=your-email
```

## Advanced Usage

### CI/CD Integration

For GitHub Actions or other CI/CD systems:

```yaml
# .github/workflows/deploy.yml
- name: Deploy to Cloudflare Pages
  env:
    CLOUDFLARE_GLOBAL_API_KEY: ${{ secrets.CLOUDFLARE_GLOBAL_API_KEY }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    CLOUDFLARE_EMAIL: ${{ secrets.CLOUDFLARE_EMAIL }}
  run: ./scripts/cloudflare-deploy.sh deploy web dist production
```

### Deployment with Custom Branch

```bash
# Deploy to staging branch
./scripts/cloudflare-deploy.sh deploy web dist staging

# Deploy to development branch
./scripts/cloudflare-deploy.sh deploy web dist development
```

### Checking Deployment History

```bash
# List last 10 deployments
./scripts/cloudflare-deploy.sh list web 10

# Get status of latest deployment
./scripts/cloudflare-deploy.sh status web
```

## Related Documentation

- **CLAUDE.md**: Root configuration and setup
- **.claude/agents/agent-ops.md**: DevOps agent responsibilities
- **.claude/commands/deploy.md**: Deploy command reference
- **scripts/release.sh**: Full release process documentation
- **scripts/cloudflare-deploy.sh**: Deployment script with inline documentation

## Support

For issues with:

- **Cloudflare API**: https://api.cloudflare.com/client/v4/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/install-and-update/
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/

## Version Information

- **Updated:** October 27, 2025
- **Changes:** Standardized Global API Key usage across all deployment scripts
- **Backward Compatible:** ✅ Yes - maintains API Token and wrangler fallback support
- **Tested:** ✅ Verified with Cloudflare API and wrangler CLI
