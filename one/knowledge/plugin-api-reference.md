---
title: Plugin API Reference
dimension: knowledge
category: api-reference
tags: elizaos, plugins, api, typescript, reference
related_dimensions: things, connections, events, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: complete
ai_context: |
  Complete API reference for ONE Platform plugin development.
  Generated from TypeDoc with additional context and examples.
---

# Plugin API Reference

Complete TypeScript API reference for developing ONE Platform plugins.

---

## Table of Contents

1. [Core Interfaces](#core-interfaces)
2. [Plugin Interface](#plugin-interface)
3. [Action Interface](#action-interface)
4. [Provider Interface](#provider-interface)
5. [Evaluator Interface](#evaluator-interface)
6. [Runtime Interface](#runtime-interface)
7. [Message Types](#message-types)
8. [State Types](#state-types)
9. [Utility Functions](#utility-functions)
10. [Error Types](#error-types)

---

## Core Interfaces

### Plugin

The main plugin interface that defines your plugin's structure.

```typescript
interface Plugin {
  /**
   * Unique plugin identifier (lowercase, alphanumeric with hyphens)
   * @example "weather-plugin", "solana-blockchain", "discord-client"
   */
  name: string;

  /**
   * Human-readable description of what the plugin does
   * @example "Provides real-time weather data for AI agents"
   */
  description: string;

  /**
   * Array of actions the plugin provides
   * @optional
   */
  actions?: Action[];

  /**
   * Array of data providers the plugin offers
   * @optional
   */
  providers?: Provider[];

  /**
   * Array of evaluators for scoring and decision-making
   * @optional
   */
  evaluators?: Evaluator[];

  /**
   * Array of services (utility functions)
   * @optional
   */
  services?: Service[];
}
```

**Example:**

```typescript
export const myPlugin: Plugin = {
  name: "my-plugin",
  description: "Example plugin for ONE Platform",
  actions: [greetAction, farewellAction],
  providers: [weatherProvider],
  evaluators: [sentimentEvaluator]
};
```

---

## Action Interface

Actions are commands that agents can execute.

### Action

```typescript
interface Action {
  /**
   * Unique action name (SCREAMING_SNAKE_CASE recommended)
   * @example "SEND_TOKEN", "GET_WEATHER", "SEARCH_WEB"
   */
  name: string;

  /**
   * Alternative names for this action
   * @example ["TRANSFER_TOKEN", "SEND_PAYMENT"] for SEND_TOKEN
   */
  similes: string[];

  /**
   * Human-readable description of what the action does
   * @example "Sends tokens to a specified wallet address"
   */
  description: string;

  /**
   * Validates whether this action should run for a given message
   *
   * @param runtime - The agent runtime context
   * @param message - The incoming message
   * @returns Promise<boolean> - true if action should execute
   *
   * @example
   * validate: async (runtime, message) => {
   *   return message.content.text.toLowerCase().includes("weather");
   * }
   */
  validate: (
    runtime: IAgentRuntime,
    message: Memory
  ) => Promise<boolean>;

  /**
   * Executes the action
   *
   * @param runtime - The agent runtime context
   * @param message - The incoming message
   * @param state - Optional conversation state
   * @returns Promise<boolean> - true if action succeeded
   *
   * @example
   * handler: async (runtime, message, state) => {
   *   const result = await performAction();
   *   await runtime.messageManager.createMemory({
   *     userId: message.agentId,
   *     content: { text: result },
   *     roomId: message.roomId
   *   });
   *   return true;
   * }
   */
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ) => Promise<boolean>;

  /**
   * Example conversations demonstrating this action
   * Used for AI training and documentation
   *
   * @example
   * examples: [
   *   [
   *     { user: "{{user1}}", content: { text: "What's the weather?" } },
   *     { user: "{{agent}}", content: { text: "It's 72°F and sunny" } }
   *   ]
   * ]
   */
  examples: ActionExample[][];
}
```

### ActionExample

```typescript
interface ActionExample {
  /**
   * User identifier (use {{user1}}, {{user2}}, {{agent}} placeholders)
   */
  user: string;

  /**
   * Message content
   */
  content: {
    /**
     * Message text
     */
    text: string;

    /**
     * Optional action name (for agent responses)
     */
    action?: string;

    /**
     * Optional structured data
     */
    data?: any;
  };
}
```

**Complete Action Example:**

```typescript
import { Action, IAgentRuntime, Memory, State } from "@ai16z/eliza";

export const weatherAction: Action = {
  name: "GET_WEATHER",
  similes: ["CHECK_WEATHER", "WEATHER_LOOKUP"],
  description: "Gets current weather for a location",

  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    return text.includes("weather") || text.includes("temperature");
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    try {
      // Get API key from runtime settings
      const apiKey = runtime.getSetting("WEATHER_API_KEY");
      if (!apiKey) {
        throw new Error("WEATHER_API_KEY not configured");
      }

      // Extract location from message
      const location = extractLocation(message.content.text);

      // Fetch weather data
      const weather = await fetchWeather(location, apiKey);

      // Send response
      await runtime.messageManager.createMemory({
        userId: message.agentId,
        content: {
          text: `The weather in ${location} is ${weather.condition} with a temperature of ${weather.temp}°F.`
        },
        roomId: message.roomId
      });

      return true;
    } catch (error) {
      console.error("[Weather Plugin] Error:", error);
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
          text: "The weather in San Francisco is Partly cloudy with a temperature of 65°F.",
          action: "GET_WEATHER"
        }
      }
    ]
  ]
};
```

---

## Provider Interface

Providers fetch and return data for agents to use in decision-making.

### Provider

```typescript
interface Provider {
  /**
   * Fetches and returns data
   *
   * @param runtime - The agent runtime context
   * @param message - The incoming message
   * @param state - Optional conversation state
   * @returns Promise<string | null> - Formatted data or null if unavailable
   *
   * @example
   * get: async (runtime, message, state) => {
   *   const data = await fetchData();
   *   return formatData(data);
   * }
   */
  get: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ) => Promise<string | null>;
}
```

**Complete Provider Example:**

```typescript
import { Provider, IAgentRuntime, Memory, State } from "@ai16z/eliza";

export const priceProvider: Provider = {
  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<string | null> => {
    try {
      // Get API key
      const apiKey = runtime.getSetting("PRICE_API_KEY");
      if (!apiKey) {
        return null;
      }

      // Extract token symbol from message
      const symbol = extractSymbol(message.content.text);

      // Fetch price data
      const response = await fetch(
        `https://api.example.com/price/${symbol}`,
        {
          headers: { "Authorization": `Bearer ${apiKey}` }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Return formatted price data
      return `${symbol} is currently trading at $${data.price.toFixed(2)} (${data.change24h > 0 ? "+" : ""}${data.change24h.toFixed(2)}% 24h)`;
    } catch (error) {
      console.error("[Price Provider] Error:", error);
      return null;
    }
  }
};
```

---

## Evaluator Interface

Evaluators score messages or situations to help agents make decisions.

### Evaluator

```typescript
interface Evaluator {
  /**
   * Unique evaluator name
   * @example "SENTIMENT", "RELEVANCE", "TRUST"
   */
  name: string;

  /**
   * Human-readable description
   * @example "Evaluates the sentiment of a message"
   */
  description: string;

  /**
   * Evaluates and returns a score
   *
   * @param runtime - The agent runtime context
   * @param message - The message to evaluate
   * @returns Promise<number> - Score between 0 and 1
   *
   * @example
   * handler: async (runtime, message) => {
   *   const score = await analyzeMessage(message.content.text);
   *   return score; // 0.0 to 1.0
   * }
   */
  handler: (
    runtime: IAgentRuntime,
    message: Memory
  ) => Promise<number>;

  /**
   * Example evaluations for documentation
   */
  examples: EvaluatorExample[];
}
```

### EvaluatorExample

```typescript
interface EvaluatorExample {
  /**
   * Input message
   */
  message: {
    text: string;
  };

  /**
   * Expected score
   */
  score: number;

  /**
   * Optional explanation
   */
  explanation?: string;
}
```

**Complete Evaluator Example:**

```typescript
import { Evaluator, IAgentRuntime, Memory } from "@ai16z/eliza";

export const sentimentEvaluator: Evaluator = {
  name: "SENTIMENT",
  description: "Evaluates the sentiment of a message (0 = negative, 1 = positive)",

  handler: async (runtime: IAgentRuntime, message: Memory): Promise<number> => {
    const text = message.content.text.toLowerCase();

    // Simple sentiment analysis (use ML model in production)
    const positiveWords = ["good", "great", "awesome", "excellent", "happy"];
    const negativeWords = ["bad", "terrible", "awful", "sad", "angry"];

    let score = 0.5; // Neutral

    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.1;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.1;
    });

    // Clamp to 0-1
    return Math.max(0, Math.min(1, score));
  },

  examples: [
    {
      message: { text: "This is great! I love it!" },
      score: 0.8,
      explanation: "Positive sentiment with enthusiastic language"
    },
    {
      message: { text: "This is terrible and awful" },
      score: 0.2,
      explanation: "Negative sentiment with strong negative words"
    },
    {
      message: { text: "The weather is okay" },
      score: 0.5,
      explanation: "Neutral sentiment"
    }
  ]
};
```

---

## Runtime Interface

The runtime provides context and utilities for plugins.

### IAgentRuntime

```typescript
interface IAgentRuntime {
  /**
   * Get organization-scoped setting
   *
   * @param key - Setting key (e.g., "API_KEY")
   * @returns string | null - Setting value or null if not found
   *
   * @example
   * const apiKey = runtime.getSetting("WEATHER_API_KEY");
   */
  getSetting(key: string): string | null;

  /**
   * Agent character definition
   */
  character: Character;

  /**
   * Message manager for sending/receiving messages
   */
  messageManager: MessageManager;

  /**
   * Available evaluators
   */
  evaluators: Evaluator[];

  /**
   * Available providers
   */
  providers: Provider[];

  /**
   * Database adapter (organization-scoped)
   */
  databaseAdapter: IDatabaseAdapter;

  /**
   * Agent ID
   */
  agentId: string;

  /**
   * Current server URL
   */
  serverUrl: string;
}
```

### Character

```typescript
interface Character {
  /**
   * Agent name
   */
  name: string;

  /**
   * Agent bio/description
   */
  bio: string;

  /**
   * Agent topics of expertise
   */
  topics: string[];

  /**
   * Agent personality traits
   */
  adjectives: string[];

  /**
   * Additional character properties
   */
  [key: string]: any;
}
```

### MessageManager

```typescript
interface MessageManager {
  /**
   * Create a new message (memory)
   *
   * @param memory - Message to create
   * @returns Promise<Memory> - Created memory
   */
  createMemory(memory: Partial<Memory>): Promise<Memory>;

  /**
   * Get message history for a room
   *
   * @param roomId - Room ID
   * @param count - Number of messages to retrieve
   * @returns Promise<Memory[]> - Message history
   */
  getMemories(roomId: string, count?: number): Promise<Memory[]>;

  /**
   * Search messages
   *
   * @param query - Search query
   * @returns Promise<Memory[]> - Matching messages
   */
  searchMemories(query: string): Promise<Memory[]>;
}
```

---

## Message Types

### Memory

Represents a message in the system.

```typescript
interface Memory {
  /**
   * Unique memory ID
   */
  id: string;

  /**
   * User who sent the message
   */
  userId: string;

  /**
   * Agent ID (if message is from agent)
   */
  agentId: string;

  /**
   * Room/channel ID
   */
  roomId: string;

  /**
   * Message content
   */
  content: {
    /**
     * Message text
     */
    text: string;

    /**
     * Optional action name
     */
    action?: string;

    /**
     * Optional structured data
     */
    data?: any;

    /**
     * Optional attachments
     */
    attachments?: Attachment[];
  };

  /**
   * Timestamp
   */
  createdAt: number;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}
```

### Attachment

```typescript
interface Attachment {
  /**
   * Attachment ID
   */
  id: string;

  /**
   * URL to attachment
   */
  url: string;

  /**
   * MIME type
   */
  contentType: string;

  /**
   * File name
   */
  name: string;

  /**
   * File size in bytes
   */
  size: number;
}
```

---

## State Types

### State

Represents conversation state.

```typescript
interface State {
  /**
   * Recent conversation history
   */
  conversationHistory: Memory[];

  /**
   * Current user
   */
  user: {
    id: string;
    name: string;
    [key: string]: any;
  };

  /**
   * Current agent
   */
  agent: {
    id: string;
    name: string;
    [key: string]: any;
  };

  /**
   * Additional state data
   */
  [key: string]: any;
}
```

---

## Utility Functions

### ONE Platform SDK Utilities

```typescript
/**
 * Generate embedding for text
 *
 * @param text - Text to embed
 * @param model - Embedding model (default: "text-embedding-3-large")
 * @returns Promise<number[]> - Embedding vector
 */
export async function generateEmbedding(
  text: string,
  model?: string
): Promise<number[]>;

/**
 * Search knowledge base with semantic search
 *
 * @param query - Search query
 * @param filters - Optional filters
 * @returns Promise<KnowledgeChunk[]> - Matching knowledge chunks
 */
export async function searchKnowledge(
  query: string,
  filters?: {
    labels?: string[];
    groupId?: string;
    limit?: number;
  }
): Promise<KnowledgeChunk[]>;

/**
 * Log event to audit trail
 *
 * @param event - Event to log
 * @returns Promise<void>
 */
export async function logEvent(event: {
  type: string;
  actorId: string;
  targetId?: string;
  groupId: string;
  metadata?: Record<string, any>;
}): Promise<void>;

/**
 * Create thing (entity) in database
 *
 * @param thing - Thing to create
 * @returns Promise<Thing> - Created thing
 */
export async function createThing(thing: {
  type: string;
  name: string;
  groupId: string;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}): Promise<Thing>;

/**
 * Create connection (relationship) between things
 *
 * @param connection - Connection to create
 * @returns Promise<Connection> - Created connection
 */
export async function createConnection(connection: {
  connectionType: string;
  fromId: string;
  toId: string;
  groupId: string;
  properties?: Record<string, any>;
}): Promise<Connection>;
```

### Testing Utilities

```typescript
/**
 * Create mock runtime for testing
 *
 * @param config - Runtime configuration
 * @returns MockRuntime - Mock runtime instance
 */
export function mockRuntime(config?: {
  settings?: Record<string, string>;
  character?: Partial<Character>;
  agentId?: string;
}): IAgentRuntime;

/**
 * Create mock message for testing
 *
 * @param config - Message configuration
 * @returns Memory - Mock message
 */
export function mockMessage(config?: {
  content?: { text: string };
  userId?: string;
  roomId?: string;
}): Memory;

/**
 * Create mock state for testing
 *
 * @param config - State configuration
 * @returns State - Mock state
 */
export function mockState(config?: {
  conversationHistory?: Memory[];
}): State;
```

---

## Error Types

### PluginError

Base error class for plugin errors.

```typescript
class PluginError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "PluginError";
  }
}
```

### Common Error Codes

```typescript
const PluginErrorCodes = {
  // Configuration errors
  MISSING_CONFIG: "MISSING_CONFIG",
  INVALID_CONFIG: "INVALID_CONFIG",
  MISSING_SECRET: "MISSING_SECRET",

  // Runtime errors
  EXECUTION_FAILED: "EXECUTION_FAILED",
  TIMEOUT: "TIMEOUT",
  RATE_LIMITED: "RATE_LIMITED",

  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  API_ERROR: "API_ERROR",

  // Permission errors
  PERMISSION_DENIED: "PERMISSION_DENIED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED"
};
```

**Error Handling Example:**

```typescript
import { PluginError, PluginErrorCodes } from "@one-platform/plugin-sdk";

export const myAction: Action = {
  handler: async (runtime, message) => {
    try {
      const apiKey = runtime.getSetting("API_KEY");

      if (!apiKey) {
        throw new PluginError(
          "API_KEY not configured",
          PluginErrorCodes.MISSING_SECRET,
          { key: "API_KEY" }
        );
      }

      const result = await apiCall(apiKey);
      return true;
    } catch (error) {
      if (error instanceof PluginError) {
        console.error(`[Plugin Error] ${error.code}: ${error.message}`);
      } else {
        console.error(`[Unexpected Error]`, error);
      }
      return false;
    }
  }
};
```

---

## TypeScript Configuration

Recommended `tsconfig.json` for plugin development:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## Next Steps

- **Read the Development Guide**: `one/knowledge/plugin-development-guide.md`
- **Explore Examples**: `one-platform/plugin-examples` repository
- **Use the CLI**: `npm install -g @one-platform/plugin-cli`
- **Join the Community**: Discord, forums, office hours

---

**Built with TypeScript. Type-safe plugins for the 6-dimension ontology.**
