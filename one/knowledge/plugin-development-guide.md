---
title: Plugin Development Guide
dimension: knowledge
category: developer-guide
tags: elizaos, plugins, development, sdk, tutorial
related_dimensions: things, connections, events, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: complete
ai_context: |
  Comprehensive guide for developers building plugins for the ONE Platform.
  Covers the 6-dimension ontology, plugin architecture, development workflow,
  testing, and submission process.
---

# Plugin Development Guide

**Welcome to ONE Platform Plugin Development!**

This guide teaches you how to create plugins that integrate the elizaOS ecosystem with ONE's 6-dimension ontology. By the end, you'll be able to build, test, and publish plugins that work seamlessly across the platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Understanding the 6-Dimension Ontology](#understanding-the-6-dimension-ontology)
3. [Plugin Architecture](#plugin-architecture)
4. [Development Setup](#development-setup)
5. [Creating Your First Plugin](#creating-your-first-plugin)
6. [Plugin Interface Reference](#plugin-interface-reference)
7. [Testing Your Plugin](#testing-your-plugin)
8. [Best Practices](#best-practices)
9. [Submission Process](#submission-process)
10. [Common Issues](#common-issues)

---

## Overview

### What is a ONE Platform Plugin?

A ONE Platform plugin is an elizaOS-compatible module that extends agent capabilities while mapping to the 6-dimension ontology:

- **THINGS**: Plugin entities (plugin, plugin_instance, plugin_action)
- **CONNECTIONS**: Plugin relationships (plugin_powers, plugin_depends_on)
- **EVENTS**: Plugin lifecycle (plugin_installed, plugin_action_executed)
- **PEOPLE**: Plugin authors and users
- **GROUPS**: Organization-scoped installations
- **KNOWLEDGE**: Plugin documentation and embeddings

### Why Build Plugins for ONE?

- **Universal Compatibility**: Works across any organization using ONE Platform
- **Type Safety**: Full TypeScript support with Effect.ts
- **Multi-Tenant**: Automatic organization scoping
- **Real-Time**: Live updates via Convex subscriptions
- **Searchable**: Semantic search via knowledge embeddings
- **Secure**: Sandboxed execution with permission system

---

## Understanding the 6-Dimension Ontology

Before building plugins, understand how ONE models reality:

### The 6 Dimensions

```
1. GROUPS     → Containers (organizations, teams)
2. PEOPLE     → Actors (who can do what)
3. THINGS     → Entities (users, products, plugins)
4. CONNECTIONS → Relationships (owns, powers, depends_on)
5. EVENTS     → Actions (installed, executed, updated)
6. KNOWLEDGE  → Understanding (embeddings, search, RAG)
```

### How Your Plugin Maps

Every plugin you create maps to these dimensions:

```typescript
// Your plugin becomes a THING
type: "elizaos_plugin"

// When installed in an org, it creates a THING
type: "plugin_instance"

// Installation creates a CONNECTION
connectionType: "plugin_installed_in"

// Installation logs an EVENT
eventType: "plugin_installed"

// Plugin docs create KNOWLEDGE
type: "chunk" (with embeddings)

// Plugin is scoped to GROUPS
groupId: organizationId

// Plugin author is a PERSON
role: "plugin_author"
```

**Key Insight**: Your plugin isn't "added to the database." It's **mapped to reality's structure**. This is why plugins never break.

---

## Plugin Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              ElizaOS Plugin                         │
│  (Your Code - Standard elizaOS Interface)          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ Adapter Layer
┌─────────────────────────────────────────────────────┐
│           ONE Plugin Runtime                        │
│  - Translates elizaOS calls → ONE services          │
│  - Manages org-scoped configuration                 │
│  - Injects secrets securely                         │
│  - Logs events to audit trail                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ 6-Dimension Ontology
┌─────────────────────────────────────────────────────┐
│           ONE Platform Backend                      │
│  - Convex Database (5 tables)                       │
│  - Effect.ts Services (business logic)              │
│  - Event Logging (complete audit trail)             │
└─────────────────────────────────────────────────────┘
```

### Plugin Components

A plugin consists of:

1. **Actions** - Commands agents can execute
2. **Providers** - Data sources agents can query
3. **Evaluators** - Scoring functions for decision-making
4. **Services** - Utility functions shared across plugin

Example:

```typescript
import { Plugin, Action, Provider, Evaluator } from "@ai16z/eliza";

export const myPlugin: Plugin = {
  name: "my-plugin",
  description: "Example plugin for ONE Platform",
  actions: [
    // Actions agents can execute
    greetAction,
    fareewellAction
  ],
  providers: [
    // Data providers agents can query
    weatherProvider,
    newsProvider
  ],
  evaluators: [
    // Scoring functions for decision-making
    sentimentEvaluator,
    relevanceEvaluator
  ]
};
```

---

## Development Setup

### Prerequisites

- Node.js 20+ (with bun recommended)
- TypeScript 5.3+
- Git
- ONE Platform CLI (install via `npm install -g @one-platform/plugin-cli`)

### Installation

```bash
# Install ONE Platform plugin CLI
npm install -g @one-platform/plugin-cli

# Create new plugin from template
one-plugin init my-awesome-plugin

# Navigate to plugin directory
cd my-awesome-plugin

# Install dependencies
bun install

# Start development server
bun run dev
```

### Project Structure

```
my-awesome-plugin/
├── src/
│   ├── index.ts           # Plugin entry point
│   ├── actions/           # Action implementations
│   │   ├── greet.ts
│   │   └── farewell.ts
│   ├── providers/         # Provider implementations
│   │   └── weather.ts
│   ├── evaluators/        # Evaluator implementations
│   │   └── sentiment.ts
│   └── types.ts           # TypeScript type definitions
├── tests/
│   ├── actions.test.ts
│   ├── providers.test.ts
│   └── evaluators.test.ts
├── README.md              # Plugin documentation
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── plugin.config.json     # ONE Platform plugin config
```

---

## Creating Your First Plugin

Let's build a simple "Weather Plugin" step-by-step.

### Step 1: Initialize Plugin

```bash
one-plugin init weather-plugin
cd weather-plugin
bun install
```

### Step 2: Define Plugin Metadata

Edit `plugin.config.json`:

```json
{
  "name": "weather-plugin",
  "version": "1.0.0",
  "description": "Provides weather data for AI agents",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "category": "provider",
  "tags": ["weather", "data", "provider"],
  "permissions": [
    "network.external"
  ],
  "secrets": [
    {
      "key": "WEATHER_API_KEY",
      "description": "API key for weather service",
      "required": true
    }
  ],
  "dependencies": []
}
```

### Step 3: Create a Provider

Create `src/providers/weather.ts`:

```typescript
import { Provider, IAgentRuntime, Memory, State } from "@ai16z/eliza";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  location: string;
}

export const weatherProvider: Provider = {
  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<string> => {
    // Extract location from message
    const location = extractLocation(message.content.text);

    // Get API key from runtime settings
    const apiKey = runtime.getSetting("WEATHER_API_KEY");

    if (!apiKey) {
      throw new Error("WEATHER_API_KEY not configured");
    }

    // Fetch weather data
    const weather = await fetchWeather(location, apiKey);

    // Return formatted weather data
    return formatWeather(weather);
  }
};

async function fetchWeather(
  location: string,
  apiKey: string
): Promise<WeatherData> {
  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    temperature: data.current.temp_f,
    condition: data.current.condition.text,
    humidity: data.current.humidity,
    location: data.location.name
  };
}

function extractLocation(text: string): string {
  // Simple location extraction (use NLP in production)
  const match = text.match(/weather (?:in |for )?(.+)/i);
  return match ? match[1] : "New York";
}

function formatWeather(weather: WeatherData): string {
  return `The weather in ${weather.location} is ${weather.condition} with a temperature of ${weather.temperature}°F and ${weather.humidity}% humidity.`;
}
```

### Step 4: Create an Action

Create `src/actions/getWeather.ts`:

```typescript
import { Action, IAgentRuntime, Memory, State } from "@ai16z/eliza";
import { weatherProvider } from "../providers/weather";

export const getWeatherAction: Action = {
  name: "GET_WEATHER",
  similes: ["CHECK_WEATHER", "WEATHER_LOOKUP", "GET_FORECAST"],
  description: "Gets current weather for a location",

  validate: async (
    runtime: IAgentRuntime,
    message: Memory
  ): Promise<boolean> => {
    // Check if message is asking about weather
    const text = message.content.text.toLowerCase();
    return text.includes("weather") || text.includes("temperature");
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    try {
      // Use the weather provider to get data
      const weatherData = await weatherProvider.get(runtime, message, state);

      // Log success event (ONE Platform will capture this)
      console.log(`[Weather Plugin] Retrieved weather: ${weatherData}`);

      // Send response to user
      await runtime.messageManager.createMemory({
        userId: message.agentId,
        content: { text: weatherData },
        roomId: message.roomId
      });

      return true;
    } catch (error) {
      // Log error (ONE Platform will capture this)
      console.error(`[Weather Plugin] Error:`, error);

      await runtime.messageManager.createMemory({
        userId: message.agentId,
        content: {
          text: `Sorry, I couldn't retrieve the weather data: ${error.message}`
        },
        roomId: message.roomId
      });

      return false;
    }
  },

  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "What's the weather in San Francisco?" }
      },
      {
        user: "{{agent}}",
        content: {
          text: "The weather in San Francisco is Partly cloudy with a temperature of 65°F and 70% humidity.",
          action: "GET_WEATHER"
        }
      }
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "How's the weather today?" }
      },
      {
        user: "{{agent}}",
        content: {
          text: "The weather in New York is Sunny with a temperature of 72°F and 45% humidity.",
          action: "GET_WEATHER"
        }
      }
    ]
  ]
};
```

### Step 5: Export Plugin

Create `src/index.ts`:

```typescript
import { Plugin } from "@ai16z/eliza";
import { getWeatherAction } from "./actions/getWeather";
import { weatherProvider } from "./providers/weather";

export const weatherPlugin: Plugin = {
  name: "weather",
  description: "Provides weather data for AI agents",
  actions: [getWeatherAction],
  providers: [weatherProvider],
  evaluators: []
};

export default weatherPlugin;
```

### Step 6: Test Your Plugin

Create `tests/weather.test.ts`:

```typescript
import { describe, it, expect } from "bun:test";
import { weatherPlugin } from "../src/index";
import { mockRuntime, mockMessage } from "@one-platform/plugin-sdk/testing";

describe("Weather Plugin", () => {
  it("should export plugin with correct structure", () => {
    expect(weatherPlugin.name).toBe("weather");
    expect(weatherPlugin.actions).toHaveLength(1);
    expect(weatherPlugin.providers).toHaveLength(1);
  });

  it("should validate weather-related messages", async () => {
    const runtime = mockRuntime({
      settings: { WEATHER_API_KEY: "test-key" }
    });

    const message = mockMessage({
      content: { text: "What's the weather in Seattle?" }
    });

    const action = weatherPlugin.actions[0];
    const isValid = await action.validate(runtime, message);

    expect(isValid).toBe(true);
  });

  it("should fetch weather data", async () => {
    const runtime = mockRuntime({
      settings: { WEATHER_API_KEY: process.env.WEATHER_API_KEY }
    });

    const message = mockMessage({
      content: { text: "Weather in New York" }
    });

    const provider = weatherPlugin.providers[0];
    const result = await provider.get(runtime, message);

    expect(result).toContain("New York");
    expect(result).toContain("°F");
  });
});
```

Run tests:

```bash
bun test
```

---

## Plugin Interface Reference

### Plugin Interface

```typescript
interface Plugin {
  name: string;                    // Unique plugin identifier
  description: string;             // Human-readable description
  actions?: Action[];              // Available actions
  providers?: Provider[];          // Data providers
  evaluators?: Evaluator[];        // Scoring functions
  services?: Service[];            // Utility services
}
```

### Action Interface

```typescript
interface Action {
  name: string;                    // Action name (e.g., "SEND_TOKEN")
  similes: string[];               // Alternative names
  description: string;             // What this action does

  validate: (
    runtime: IAgentRuntime,
    message: Memory
  ) => Promise<boolean>;           // Should this action run?

  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ) => Promise<boolean>;           // Execute the action

  examples: ActionExample[][];     // Example conversations
}
```

### Provider Interface

```typescript
interface Provider {
  get: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ) => Promise<string | null>;     // Fetch and return data
}
```

### Evaluator Interface

```typescript
interface Evaluator {
  name: string;                    // Evaluator name
  description: string;             // What it evaluates

  handler: (
    runtime: IAgentRuntime,
    message: Memory
  ) => Promise<number>;            // Return score 0-1

  examples: EvaluatorExample[];    // Example evaluations
}
```

### Runtime Interface (Provided by ONE)

```typescript
interface IAgentRuntime {
  // Get organization-scoped settings
  getSetting(key: string): string | null;

  // Agent character
  character: Character;

  // Message management
  messageManager: MessageManager;

  // Evaluators
  evaluators: Evaluator[];

  // Providers
  providers: Provider[];

  // Database access (scoped to organization)
  databaseAdapter: IDatabaseAdapter;
}
```

---

## Testing Your Plugin

### Unit Testing

Use the ONE Plugin SDK testing utilities:

```typescript
import { mockRuntime, mockMessage, mockState } from "@one-platform/plugin-sdk/testing";

// Create mock runtime
const runtime = mockRuntime({
  settings: {
    API_KEY: "test-key"
  },
  character: {
    name: "Test Agent",
    bio: "A test agent"
  }
});

// Create mock message
const message = mockMessage({
  content: { text: "Test message" },
  userId: "user-123",
  roomId: "room-456"
});

// Create mock state
const state = mockState({
  conversationHistory: []
});

// Test your action
const result = await myAction.handler(runtime, message, state);
expect(result).toBe(true);
```

### Integration Testing

Test in the ONE Platform playground:

```bash
# Upload plugin to playground
one-plugin playground deploy

# Test interactively
one-plugin playground test
```

### Local Testing with ONE CLI

```bash
# Run plugin locally with mock data
one-plugin test

# Run with specific scenarios
one-plugin test --scenario weather-request

# Run with debugging
one-plugin test --debug
```

---

## Best Practices

### Security

1. **Never hardcode secrets**
   ```typescript
   // ❌ Bad
   const API_KEY = "sk-1234567890";

   // ✅ Good
   const API_KEY = runtime.getSetting("API_KEY");
   ```

2. **Validate all inputs**
   ```typescript
   if (!location || typeof location !== "string") {
     throw new Error("Invalid location parameter");
   }
   ```

3. **Use permission system**
   ```json
   {
     "permissions": [
       "network.external",
       "storage.read"
     ]
   }
   ```

### Performance

1. **Cache expensive operations**
   ```typescript
   const cache = new Map();

   async function getWeather(location: string) {
     if (cache.has(location)) {
       return cache.get(location);
     }
     const data = await fetchWeather(location);
     cache.set(location, data);
     return data;
   }
   ```

2. **Use timeouts**
   ```typescript
   const response = await Promise.race([
     fetch(url),
     new Promise((_, reject) =>
       setTimeout(() => reject(new Error("Timeout")), 5000)
     )
   ]);
   ```

3. **Handle rate limits**
   ```typescript
   import pLimit from "p-limit";

   const limit = pLimit(5); // Max 5 concurrent requests

   const results = await Promise.all(
     items.map(item => limit(() => processItem(item)))
   );
   ```

### Error Handling

1. **Always use try-catch**
   ```typescript
   try {
     const result = await riskyOperation();
     return result;
   } catch (error) {
     console.error("[Plugin] Error:", error);
     return null;
   }
   ```

2. **Provide helpful error messages**
   ```typescript
   if (!apiKey) {
     throw new Error(
       "API_KEY not configured. Please add it in plugin settings."
     );
   }
   ```

3. **Log errors for debugging**
   ```typescript
   console.error("[Weather Plugin] Failed to fetch data:", {
     location,
     error: error.message,
     timestamp: new Date().toISOString()
   });
   ```

### Documentation

1. **Document all actions**
   ```typescript
   /**
    * Sends a token transaction on the blockchain
    *
    * @param recipient - Wallet address to send tokens to
    * @param amount - Amount of tokens to send
    * @param token - Token symbol (default: SOL)
    * @returns Transaction hash if successful
    */
   ```

2. **Provide clear examples**
   ```typescript
   examples: [
     [
       { user: "user", content: { text: "Send 5 SOL to abc123" } },
       { user: "agent", content: { text: "Sent 5 SOL to abc123. Transaction: xyz789" } }
     ]
   ]
   ```

3. **Write a comprehensive README**
   - Installation instructions
   - Configuration guide
   - Usage examples
   - API reference
   - Troubleshooting

---

## Submission Process

### Pre-Submission Checklist

- [ ] All tests pass (`bun test`)
- [ ] Plugin validated (`one-plugin validate`)
- [ ] README complete with examples
- [ ] Secrets properly configured in `plugin.config.json`
- [ ] No hardcoded credentials
- [ ] License file included
- [ ] Version follows semver (1.0.0)

### Publishing to Registry

1. **Validate your plugin**
   ```bash
   one-plugin validate
   ```

2. **Test in playground**
   ```bash
   one-plugin playground deploy
   one-plugin playground test
   ```

3. **Publish to registry**
   ```bash
   one-plugin publish
   ```

4. **Submit for review**
   - Automated security scan runs
   - Community review (48-72 hours)
   - Approval and merge

### Registry Submission

Your plugin will be added to the ONE Platform registry:

```json
{
  "name": "weather-plugin",
  "version": "1.0.0",
  "author": "your-name",
  "category": "provider",
  "verified": false,
  "downloads": 0,
  "rating": 0,
  "repository": "https://github.com/you/weather-plugin"
}
```

### Post-Publication

- Monitor usage analytics
- Respond to issues and pull requests
- Update documentation
- Release new versions

---

## Common Issues

### Q: My plugin can't access API keys

**A:** Ensure you've defined secrets in `plugin.config.json`:

```json
{
  "secrets": [
    {
      "key": "API_KEY",
      "description": "Your API key",
      "required": true
    }
  ]
}
```

Users must configure these in their organization settings.

### Q: Plugin works locally but not in production

**A:** Check these common issues:

1. **Missing dependencies**: Ensure all dependencies are in `package.json`
2. **Environment differences**: Use `runtime.getSetting()` instead of `process.env`
3. **Network restrictions**: Verify you have `network.external` permission
4. **Timeout**: Production has 30s timeout (local may be unlimited)

### Q: How do I debug production issues?

**A:** Use the ONE Platform plugin logs:

```bash
one-plugin logs <plugin-name>
```

Or view in the dashboard: `/plugins/installed` → Click plugin → View Logs

### Q: Can I use npm packages in my plugin?

**A:** Yes, but:

1. Add to `package.json` dependencies
2. Avoid packages with native bindings (C++ modules)
3. Keep bundle size small (< 1MB recommended)
4. Use tree-shaking for smaller bundles

### Q: How do I handle organization-specific configuration?

**A:** Use the runtime settings system:

```typescript
// Each organization can configure their own value
const endpoint = runtime.getSetting("CUSTOM_ENDPOINT") || "https://default-api.com";
```

Organizations configure this in: `/plugins/installed` → Configure

---

## Next Steps

Now that you've learned the basics:

1. **Read the API Reference** - Detailed API documentation
2. **Explore Examples** - 5 real-world plugin examples
3. **Join the Community** - Discord, forums, office hours
4. **Build and Ship** - Create your plugin and publish it!

**Resources:**

- API Reference: `one/knowledge/plugin-api-reference.md`
- Examples: `one-platform/plugin-examples` repository
- Migration Guide: `one/knowledge/plugin-migration-guide.md`
- Contribution Guide: `one/knowledge/plugin-contribution-guide.md`
- Documentation Site: https://plugins-docs.one.ie

---

**Happy plugin building! 🚀**

Built with the 6-dimension ontology. ElizaOS plugins, universally compatible.
