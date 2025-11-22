---
title: Plugin Migration Guide
dimension: knowledge
category: migration-guide
tags: elizaos, plugins, migration, upgrade, compatibility
related_dimensions: things, connections, events, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: complete
ai_context: |
  Guide for migrating existing elizaOS plugins to the ONE Platform.
  Covers differences, adapter configuration, and common pitfalls.
---

# Plugin Migration Guide

**Migrating elizaOS Plugins to ONE Platform**

This guide helps you migrate existing elizaOS plugins to work seamlessly with ONE Platform's 6-dimension ontology.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Differences](#key-differences)
3. [Migration Checklist](#migration-checklist)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Runtime Differences](#runtime-differences)
6. [Secret Management](#secret-management)
7. [Testing Migration](#testing-migration)
8. [Common Pitfalls](#common-pitfalls)
9. [Migration Examples](#migration-examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Migrate?

ONE Platform provides:

- **Universal compatibility**: Works across any organization using ONE
- **Multi-tenant isolation**: Automatic organization scoping
- **Enhanced security**: Sandboxed execution with permissions
- **Semantic search**: Plugin docs in knowledge dimension
- **Real-time updates**: Live subscriptions via Convex
- **Audit trail**: Complete event logging

### Compatibility Level

- **100% compatible**: ElizaOS plugin interface (Plugin, Action, Provider, Evaluator)
- **Adapter layer**: Translates elizaOS runtime → ONE runtime
- **Zero code changes**: Most plugins work as-is
- **Optional enhancements**: Use ONE features for better integration

---

## Key Differences

### Architecture Comparison

```
┌─────────────────────────────────────────────────────┐
│          ElizaOS (Standalone)                       │
├─────────────────────────────────────────────────────┤
│  Plugin → Runtime → Database                        │
│  Single tenant, file-based configuration            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          ONE Platform (Multi-Tenant)                │
├─────────────────────────────────────────────────────┤
│  Plugin → Adapter → ONE Runtime → 6 Dimensions      │
│  Multi-tenant, org-scoped configuration             │
└─────────────────────────────────────────────────────┘
```

### Configuration Differences

| Aspect | ElizaOS | ONE Platform |
|--------|---------|--------------|
| **Settings** | `.env` file | Org-scoped runtime settings |
| **Secrets** | Environment variables | Encrypted org settings |
| **Database** | Single SQLite file | Multi-tenant Convex |
| **Events** | Optional logging | Required audit trail |
| **Knowledge** | File-based RAG | Vector embeddings |
| **Execution** | In-process | Sandboxed workers |

### Runtime Differences

| Method | ElizaOS | ONE Platform |
|--------|---------|--------------|
| `getSetting(key)` | Reads `.env` | Reads org-scoped config |
| `character` | File-based | Database-backed |
| `messageManager` | File storage | Convex real-time |
| `databaseAdapter` | SQLite | Convex (org-scoped) |

---

## Migration Checklist

### Pre-Migration

- [ ] Read your plugin's `README.md` and understand its features
- [ ] Identify all `.env` variables used
- [ ] List all external API dependencies
- [ ] Review database queries (if any)
- [ ] Check for file system operations

### During Migration

- [ ] Create `plugin.config.json` with secrets list
- [ ] Update `README.md` with ONE Platform instructions
- [ ] Test with mock runtime
- [ ] Validate plugin structure
- [ ] Test in playground

### Post-Migration

- [ ] Update package.json keywords (add "one-platform")
- [ ] Publish to npm
- [ ] Submit to ONE Platform registry
- [ ] Monitor usage analytics
- [ ] Respond to issues

---

## Step-by-Step Migration

### Step 1: Clone Your Plugin

```bash
# Clone your existing elizaOS plugin
git clone https://github.com/your-org/your-plugin
cd your-plugin

# Create migration branch
git checkout -b migrate-to-one-platform
```

### Step 2: Add Plugin Configuration

Create `plugin.config.json`:

```json
{
  "name": "your-plugin",
  "version": "1.0.0",
  "description": "Your plugin description",
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "category": "action",
  "tags": ["your", "tags"],
  "permissions": [
    "network.external"
  ],
  "secrets": [
    {
      "key": "API_KEY",
      "description": "API key for external service",
      "required": true
    },
    {
      "key": "API_SECRET",
      "description": "API secret for authentication",
      "required": false
    }
  ],
  "dependencies": []
}
```

**How to identify secrets:**

1. Search your code for `process.env.`
2. Check your `.env.example` file
3. List all external API keys

### Step 3: Update Runtime Calls

**Before (ElizaOS):**

```typescript
const apiKey = process.env.API_KEY;
```

**After (ONE Platform):**

```typescript
const apiKey = runtime.getSetting("API_KEY");

if (!apiKey) {
  throw new Error("API_KEY not configured. Please add it in plugin settings.");
}
```

### Step 4: Update File Operations

**Before (ElizaOS):**

```typescript
import fs from "fs";

const data = fs.readFileSync("./data.json", "utf-8");
```

**After (ONE Platform):**

```typescript
// Use runtime database or external API instead of file system
const data = await runtime.databaseAdapter.query("getData", {});
```

ONE Platform plugins run in sandboxed workers without file system access.

### Step 5: Add Event Logging

**Before (ElizaOS):**

```typescript
// No required event logging
console.log("Action executed");
```

**After (ONE Platform):**

```typescript
// Event logging is automatic, but you can add custom logs
console.log("[Your Plugin] Action executed successfully");
// This will be captured in the events table
```

### Step 6: Test Migration

```bash
# Install ONE Platform CLI
npm install -g @one-platform/plugin-cli

# Validate plugin structure
one-plugin validate

# Run tests
bun test

# Test in playground
one-plugin playground deploy
```

### Step 7: Update Documentation

Update `README.md`:

```markdown
# Your Plugin

## Installation

### For ONE Platform

\`\`\`bash
# Install via ONE Platform UI
# Navigate to /plugins → Search for "your-plugin" → Install
\`\`\`

### For ElizaOS (Legacy)

\`\`\`bash
npm install your-plugin
\`\`\`

## Configuration

### ONE Platform

Configure in your organization settings:

1. Navigate to `/plugins/installed`
2. Click on "your-plugin"
3. Add your API_KEY in settings

### ElizaOS (Legacy)

Add to `.env`:

\`\`\`
API_KEY=your-key-here
\`\`\`
```

### Step 8: Publish

```bash
# Build plugin
bun run build

# Validate one more time
one-plugin validate --strict

# Publish to npm
npm publish

# Submit to ONE Platform registry
one-plugin publish
```

---

## Runtime Differences

### Settings Management

**ElizaOS:**

```typescript
// .env file
API_KEY=abc123
API_SECRET=xyz789

// Code
const apiKey = process.env.API_KEY;
```

**ONE Platform:**

```typescript
// Organization settings (configured in UI)
// Code
const apiKey = runtime.getSetting("API_KEY");
```

**Migration:**

1. List all `process.env.VARIABLE` in your code
2. Replace with `runtime.getSetting("VARIABLE")`
3. Add to `plugin.config.json` secrets array

### Database Access

**ElizaOS:**

```typescript
// Direct SQLite access
const users = await runtime.databaseAdapter.getMemories({
  tableName: "users"
});
```

**ONE Platform:**

```typescript
// Org-scoped Convex queries
const users = await runtime.databaseAdapter.query("users.list", {
  groupId: organizationId
});
```

**Migration:**

- ONE Platform automatically scopes queries to organization
- No need to manually filter by organization
- Use Convex query names instead of table names

### Message Management

**ElizaOS:**

```typescript
// Create message
await runtime.messageManager.createMemory({
  userId: "user-123",
  content: { text: "Hello" }
});
```

**ONE Platform:**

```typescript
// Same interface, but with real-time subscriptions
await runtime.messageManager.createMemory({
  userId: message.agentId,
  content: { text: "Hello" },
  roomId: message.roomId
});
```

**Migration:**

- Interface is identical
- No code changes needed
- Messages are automatically scoped to organization

---

## Secret Management

### ElizaOS Approach

```bash
# .env file (committed to .env.example)
API_KEY=
API_SECRET=
DATABASE_URL=
```

### ONE Platform Approach

```json
// plugin.config.json
{
  "secrets": [
    {
      "key": "API_KEY",
      "description": "API key for weather service",
      "required": true
    },
    {
      "key": "API_SECRET",
      "description": "API secret for authentication",
      "required": false
    }
  ]
}
```

### Migration Steps

1. **Identify all secrets:**

   ```bash
   grep -r "process.env" src/
   ```

2. **Create secrets list:**

   ```json
   {
     "secrets": [
       { "key": "FOUND_SECRET_1", "description": "...", "required": true },
       { "key": "FOUND_SECRET_2", "description": "...", "required": false }
     ]
   }
   ```

3. **Update code:**

   ```typescript
   // Before
   const key = process.env.API_KEY;

   // After
   const key = runtime.getSetting("API_KEY");
   if (!key) {
     throw new Error("API_KEY not configured");
   }
   ```

4. **Update README:**

   ```markdown
   ## Configuration

   This plugin requires the following secrets:

   - `API_KEY` (required): Your API key from service.com
   - `API_SECRET` (optional): Additional secret for advanced features
   ```

---

## Testing Migration

### Unit Tests

**Before (ElizaOS):**

```typescript
import { describe, it } from "bun:test";

describe("Plugin", () => {
  it("should work", async () => {
    process.env.API_KEY = "test-key";
    const result = await myAction.handler(runtime, message);
    expect(result).toBe(true);
  });
});
```

**After (ONE Platform):**

```typescript
import { describe, it } from "bun:test";
import { mockRuntime, mockMessage } from "@one-platform/plugin-sdk/testing";

describe("Plugin", () => {
  it("should work", async () => {
    const runtime = mockRuntime({
      settings: { API_KEY: "test-key" }
    });

    const message = mockMessage({
      content: { text: "Test message" }
    });

    const result = await myAction.handler(runtime, message);
    expect(result).toBe(true);
  });
});
```

### Integration Tests

```bash
# Test in ONE Platform playground
one-plugin playground deploy

# Run interactive tests
one-plugin playground test

# View logs
one-plugin logs your-plugin
```

---

## Common Pitfalls

### Pitfall 1: Hardcoded Secrets

**Problem:**

```typescript
const API_KEY = "sk-abc123"; // ❌ Hardcoded
```

**Solution:**

```typescript
const API_KEY = runtime.getSetting("API_KEY"); // ✅ Runtime setting
if (!API_KEY) {
  throw new Error("API_KEY not configured");
}
```

### Pitfall 2: File System Access

**Problem:**

```typescript
import fs from "fs";
const data = fs.readFileSync("./data.json"); // ❌ File system access
```

**Solution:**

```typescript
// Use database or external API
const data = await runtime.databaseAdapter.query("getData", {}); // ✅
```

### Pitfall 3: Global State

**Problem:**

```typescript
let counter = 0; // ❌ Global state (not org-scoped)

export const myAction: Action = {
  handler: async () => {
    counter++; // Will increment across all orgs!
  }
};
```

**Solution:**

```typescript
// Use database for state
export const myAction: Action = {
  handler: async (runtime, message) => {
    const count = await runtime.databaseAdapter.query("getCounter", {
      groupId: runtime.groupId // Org-scoped
    });

    await runtime.databaseAdapter.mutate("incrementCounter", {
      groupId: runtime.groupId
    });
  }
};
```

### Pitfall 4: Missing Organization Scope

**Problem:**

```typescript
// Query all users (across all orgs) ❌
const users = await db.query("users", {});
```

**Solution:**

```typescript
// Query org-scoped users ✅
const users = await runtime.databaseAdapter.query("users.list", {
  groupId: runtime.groupId
});
```

### Pitfall 5: Synchronous File I/O

**Problem:**

```typescript
const config = JSON.parse(fs.readFileSync("config.json")); // ❌ Sync I/O
```

**Solution:**

```typescript
// Use async database or config from runtime
const config = runtime.getSetting("CONFIG"); // ✅
```

---

## Migration Examples

### Example 1: Simple Weather Plugin

**Before (ElizaOS):**

```typescript
// src/index.ts
import { Plugin } from "@ai16z/eliza";

export const weatherPlugin: Plugin = {
  name: "weather",
  actions: [weatherAction],
  providers: [weatherProvider]
};

// src/actions/weather.ts
const apiKey = process.env.WEATHER_API_KEY;

export const weatherAction: Action = {
  handler: async (runtime, message) => {
    const data = await fetch(`https://api.weather.com?key=${apiKey}`);
    return true;
  }
};
```

**After (ONE Platform):**

```typescript
// src/index.ts (unchanged)
import { Plugin } from "@ai16z/eliza";

export const weatherPlugin: Plugin = {
  name: "weather",
  actions: [weatherAction],
  providers: [weatherProvider]
};

// src/actions/weather.ts (updated)
export const weatherAction: Action = {
  handler: async (runtime, message) => {
    const apiKey = runtime.getSetting("WEATHER_API_KEY");

    if (!apiKey) {
      throw new Error("WEATHER_API_KEY not configured");
    }

    const data = await fetch(`https://api.weather.com?key=${apiKey}`);
    return true;
  }
};

// plugin.config.json (new file)
{
  "name": "weather",
  "secrets": [
    {
      "key": "WEATHER_API_KEY",
      "description": "API key from weatherapi.com",
      "required": true
    }
  ]
}
```

### Example 2: Blockchain Plugin with State

**Before (ElizaOS):**

```typescript
let walletCache = {}; // Global cache

export const checkBalanceAction: Action = {
  handler: async (runtime, message) => {
    const wallet = walletCache[message.userId] || createWallet();
    walletCache[message.userId] = wallet;

    const balance = await getBalance(wallet);
    return true;
  }
};
```

**After (ONE Platform):**

```typescript
// No global state - use database
export const checkBalanceAction: Action = {
  handler: async (runtime, message) => {
    // Get org-scoped wallet
    const wallet = await runtime.databaseAdapter.query("wallets.get", {
      groupId: runtime.groupId,
      userId: message.userId
    });

    if (!wallet) {
      // Create org-scoped wallet
      await runtime.databaseAdapter.mutate("wallets.create", {
        groupId: runtime.groupId,
        userId: message.userId
      });
    }

    const balance = await getBalance(wallet);
    return true;
  }
};
```

---

## Troubleshooting

### Issue: "Setting not found"

**Error:**

```
Error: API_KEY not configured
```

**Solution:**

1. Check `plugin.config.json` includes secret:
   ```json
   {
     "secrets": [{ "key": "API_KEY", ... }]
   }
   ```

2. Configure in organization settings:
   - Navigate to `/plugins/installed`
   - Click your plugin
   - Add API_KEY value

### Issue: "Permission denied"

**Error:**

```
Error: Plugin does not have network.external permission
```

**Solution:**

Add permission to `plugin.config.json`:

```json
{
  "permissions": [
    "network.external"
  ]
}
```

### Issue: "Organization scope error"

**Error:**

```
Error: Query returned data from wrong organization
```

**Solution:**

Ensure queries include `groupId`:

```typescript
// Wrong
const data = await db.query("getData", {});

// Right
const data = await runtime.databaseAdapter.query("getData", {
  groupId: runtime.groupId
});
```

### Issue: "Tests fail in ONE Platform"

**Problem:**

Tests pass locally but fail in ONE Platform playground.

**Solution:**

Use mock runtime for tests:

```typescript
import { mockRuntime } from "@one-platform/plugin-sdk/testing";

const runtime = mockRuntime({
  settings: {
    API_KEY: "test-key"
  },
  groupId: "test-group-123"
});
```

---

## Next Steps

After successful migration:

1. **Test thoroughly**: Run all tests, try in playground
2. **Update documentation**: README, examples, API reference
3. **Publish**: npm + ONE Platform registry
4. **Monitor**: Watch for issues, respond quickly
5. **Iterate**: Gather feedback, improve

**Resources:**

- Development Guide: `one/knowledge/plugin-development-guide.md`
- API Reference: `one/knowledge/plugin-api-reference.md`
- Contribution Guide: `one/knowledge/plugin-contribution-guide.md`
- Examples: `one-platform/plugin-examples` repository

---

**Successfully migrated? Welcome to the ONE Platform plugin ecosystem! 🎉**

Built with the 6-dimension ontology. ElizaOS plugins, universally compatible.
