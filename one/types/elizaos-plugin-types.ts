/**
 * ElizaOS Plugin Integration Type Definitions
 *
 * This file contains TypeScript types for integrating ElizaOS plugins
 * with the ONE Platform's 6-dimension ontology.
 *
 * @version 1.0.0
 * @cycles 71-80
 * @dimension types
 */

import { Effect } from 'effect';
import { Id } from 'convex/_generated/dataModel';

// ============================================================================
// UNIVERSAL PLUGIN TYPES
// ============================================================================

/**
 * Base plugin adapter interface
 * All ElizaOS plugin adapters must implement this interface
 */
export interface PluginAdapter<TConfig, TAction, TResult> {
  readonly pluginName: string;
  readonly pluginVersion: string;
  readonly groupId: Id<'groups'>;

  /**
   * Initialize plugin with configuration
   */
  initialize: (config: TConfig) => Effect.Effect<void, PluginError, never>;

  /**
   * Execute plugin action
   */
  execute: (action: TAction) => Effect.Effect<TResult, PluginError, never>;

  /**
   * Health check
   */
  healthCheck: () => Effect.Effect<boolean, PluginError, never>;

  /**
   * Cleanup resources
   */
  cleanup: () => Effect.Effect<void, never, never>;

  /**
   * Log event to 6-dimension ontology
   */
  logEvent: (eventData: {
    type: string;
    actorId: Id<'things'>;
    targetId?: Id<'things'>;
    metadata: Record<string, any>;
  }) => Effect.Effect<void, DatabaseError, ConvexDatabase>;
}

/**
 * Standard plugin error types
 */
export type PluginError =
  | ConfigurationError
  | ExecutionError
  | NetworkError
  | RateLimitError
  | AuthenticationError
  | SecurityError
  | ValidationError;

export interface ConfigurationError {
  readonly _tag: 'ConfigurationError';
  readonly message: string;
  readonly field?: string;
}

export interface ExecutionError {
  readonly _tag: 'ExecutionError';
  readonly message: string;
  readonly cause?: Error;
}

export interface NetworkError {
  readonly _tag: 'NetworkError';
  readonly message: string;
  readonly retryable: boolean;
}

export interface RateLimitError {
  readonly _tag: 'RateLimitError';
  readonly message: string;
  readonly retryAfter?: number;
}

export interface AuthenticationError {
  readonly _tag: 'AuthenticationError';
  readonly message: string;
  readonly provider: string;
}

export interface SecurityError {
  readonly _tag: 'SecurityError';
  readonly message: string;
  readonly violation: string;
}

export interface ValidationError {
  readonly _tag: 'ValidationError';
  readonly message: string;
  readonly field: string;
  readonly value: any;
}

// ============================================================================
// PATTERN 1: BLOCKCHAIN PLUGIN TYPES (plugin-solana, plugin-evm)
// ============================================================================

export namespace BlockchainPlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    chain: 'solana' | 'ethereum' | 'polygon' | 'base';
    network: 'mainnet' | 'devnet' | 'testnet';
    rpcEndpoint: string;
    encryptedWallet?: string; // Encrypted private key
  }

  /**
   * Plugin actions
   */
  export type Action =
    | { type: 'transfer'; toAddress: string; amount: number; token?: string }
    | { type: 'getBalance'; address?: string }
    | { type: 'getTokens'; address?: string }
    | { type: 'signMessage'; message: string };

  /**
   * Plugin results
   */
  export type Result =
    | { type: 'transfer'; signature: string; status: 'confirmed' | 'failed' }
    | { type: 'balance'; balance: number; token: string }
    | { type: 'tokens'; tokens: TokenBalance[] }
    | { type: 'signature'; signature: string };

  export interface TokenBalance {
    mint: string;
    symbol: string;
    decimals: number;
    balance: number;
    priceUsd?: number;
  }

  /**
   * THINGS: Blockchain wallet entity
   */
  export interface WalletThing {
    _id: Id<'things'>;
    type: 'blockchain_wallet';
    groupId: Id<'groups'>;
    properties: {
      chain: string;
      network: string;
      publicKey: string;
      encryptedKey?: string; // NEVER unencrypted
      balance: number;
      lastSynced: number;
      metadata: {
        derivationPath?: string;
        plugin: 'plugin-solana' | 'plugin-evm';
        version: string;
      };
    };
    status: 'active' | 'inactive';
    createdAt: number;
    updatedAt: number;
  }

  /**
   * THINGS: Blockchain token entity
   */
  export interface TokenThing {
    _id: Id<'things'>;
    type: 'blockchain_token';
    groupId: Id<'groups'>;
    properties: {
      chain: string;
      tokenMint: string;
      symbol: string;
      decimals: number;
      balance: number;
      priceUsd?: number;
      metadata: {
        tokenProgram?: string;
        associatedAccount?: string;
        plugin: string;
      };
    };
    status: 'active';
    createdAt: number;
    updatedAt: number;
  }

  /**
   * EVENTS: Blockchain transaction
   */
  export interface TransactionEvent {
    _id: Id<'events'>;
    type: 'blockchain_transaction';
    actorId: Id<'things'>; // Agent ID
    targetId: Id<'things'>; // Wallet ID
    groupId: Id<'groups'>;
    timestamp: number;
    metadata: {
      chain: string;
      transactionType: 'transfer' | 'swap' | 'approval';
      fromAddress: string;
      toAddress: string;
      amount: number;
      token: string;
      signature: string;
      status: 'pending' | 'confirmed' | 'failed';
      blockNumber?: number;
      gasCost?: number;
      plugin: string;
    };
  }

  /**
   * CONNECTIONS: Wallet ownership
   */
  export interface WalletConnection {
    _id: Id<'connections'>;
    fromThingId: Id<'things'>; // Agent ID
    toThingId: Id<'things'>; // Wallet ID
    relationshipType: 'owns';
    groupId: Id<'groups'>;
    metadata: {
      walletType: 'hot_wallet' | 'cold_wallet';
      permissions: string[];
      plugin: string;
    };
    createdAt: number;
  }
}

// ============================================================================
// PATTERN 2: KNOWLEDGE/RAG PLUGIN TYPES (plugin-knowledge)
// ============================================================================

export namespace KnowledgePlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    knowledgeBaseId: Id<'things'>;
    embeddingModel: 'text-embedding-3-large' | 'text-embedding-3-small';
    chunkSize?: number;
  }

  /**
   * Plugin actions
   */
  export type Action =
    | {
        type: 'ingestDocument';
        content: string;
        metadata: Record<string, any>;
        chunkSize?: number;
      }
    | { type: 'search'; query: string; limit?: number }
    | { type: 'retrieve'; contextWindow: number };

  /**
   * Plugin results
   */
  export type Result =
    | { type: 'ingested'; knowledgeIds: Id<'knowledge'>[]; chunksCreated: number }
    | { type: 'search'; results: SearchResult[] }
    | { type: 'context'; chunks: string[] };

  export interface SearchResult {
    text: string;
    score: number;
    metadata: Record<string, any>;
  }

  /**
   * KNOWLEDGE: Vector embeddings
   */
  export interface KnowledgeChunk {
    _id: Id<'knowledge'>;
    knowledgeType: 'chunk';
    text: string;
    embedding: number[];
    embeddingModel: string;
    embeddingDim: number;
    sourceThingId: Id<'things'>;
    sourceField: string;
    groupId: Id<'groups'>; // CRITICAL: Multi-tenant scoping
    labels: string[];
    metadata: {
      plugin: 'plugin-knowledge';
      documentType?: string;
      pageNumber?: number;
      chunkIndex: number;
      chunkCount: number;
      confidence?: number;
    };
    createdAt: number;
    updatedAt: number;
  }

  /**
   * THINGS: Knowledge base entity
   */
  export interface KnowledgeBaseThing {
    _id: Id<'things'>;
    type: 'knowledge_base';
    groupId: Id<'groups'>;
    properties: {
      name: string;
      description?: string;
      documentCount: number;
      chunkCount: number;
      embeddingModel: string;
      indexType: 'vector';
      metadata: {
        plugin: 'plugin-knowledge';
        created: number;
        lastUpdated: number;
      };
    };
    status: 'active';
    createdAt: number;
    updatedAt: number;
  }

  /**
   * EVENTS: Knowledge operations
   */
  export interface KnowledgeEvent {
    _id: Id<'events'>;
    type: 'content_changed';
    actorId: Id<'things'>; // Agent ID
    targetId: Id<'things'>; // Knowledge base ID
    groupId: Id<'groups'>;
    timestamp: number;
    metadata: {
      action: 'document_ingested' | 'document_removed';
      documentId?: Id<'things'>;
      chunksCreated?: number;
      embeddingsGenerated?: number;
      plugin: 'plugin-knowledge';
    };
  }
}

// ============================================================================
// PATTERN 3: BROWSER AUTOMATION PLUGIN TYPES (plugin-browser)
// ============================================================================

export namespace BrowserPlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    allowedDomains: string[];
    timeout?: number;
    headless?: boolean;
  }

  /**
   * Plugin actions
   */
  export type Action =
    | { type: 'scrapePage'; url: string; selector?: string; screenshot?: boolean }
    | { type: 'fillForm'; url: string; formData: Record<string, string> }
    | { type: 'screenshot'; url: string };

  /**
   * Plugin results
   */
  export type Result =
    | { type: 'scraped'; contentId: Id<'things'>; elements: any[]; screenshotUrl?: string }
    | { type: 'formSubmitted'; success: boolean }
    | { type: 'screenshot'; url: string };

  /**
   * THINGS: Scraped content entity
   */
  export interface ScrapedContentThing {
    _id: Id<'things'>;
    type: 'scraped_content';
    groupId: Id<'groups'>;
    properties: {
      url: string;
      html?: string;
      text?: string;
      structured: any; // Extracted structured data
      screenshot?: string;
      scrapedAt: number;
      metadata: {
        plugin: 'plugin-browser';
        selector?: string;
        matchCount?: number;
      };
    };
    status: 'active';
    createdAt: number;
    updatedAt: number;
  }

  /**
   * EVENTS: Browser automation
   */
  export interface AutomationEvent {
    _id: Id<'events'>;
    type: 'automation_executed';
    actorId: Id<'things'>; // Agent ID
    targetId: Id<'things'>; // Task ID
    groupId: Id<'groups'>;
    timestamp: number;
    metadata: {
      action: 'page_scraped' | 'form_filled' | 'screenshot_captured';
      url: string;
      elementsExtracted?: number;
      screenshotUrl?: string;
      duration: number; // ms
      plugin: 'plugin-browser';
      browserType: 'chromium' | 'firefox' | 'webkit';
    };
  }
}

// ============================================================================
// PATTERN 4: CLIENT/PLATFORM PLUGIN TYPES (plugin-discord, plugin-telegram)
// ============================================================================

export namespace ClientPlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    platform: 'discord' | 'telegram' | 'twitter' | 'slack';
    botToken: string;
    guildId?: string; // Discord
    chatId?: string; // Telegram
  }

  /**
   * Plugin actions
   */
  export type Action =
    | { type: 'sendMessage'; channelId: string; content: string }
    | { type: 'subscribeToChannel'; channelId: string }
    | { type: 'manageRoles'; userId: string; roleId: string; action: 'add' | 'remove' };

  /**
   * Plugin results
   */
  export type Result =
    | { type: 'messageSent'; messageId: string; timestamp: number; url?: string }
    | { type: 'subscribed'; cleanup: () => void }
    | { type: 'roleUpdated'; success: boolean };

  /**
   * THINGS: External connection entity
   */
  export interface PlatformConnectionThing {
    _id: Id<'things'>;
    type: 'external_connection';
    groupId: Id<'groups'>;
    properties: {
      platform: string;
      name: string;
      botToken?: string; // Encrypted
      applicationId?: string;
      guildId?: string;
      status: 'connected' | 'disconnected' | 'error';
      lastUsed: number;
      metadata: {
        plugin: string;
        permissions?: number; // Bit flags
        intents?: string[];
      };
    };
    status: 'active' | 'inactive';
    createdAt: number;
    updatedAt: number;
  }

  /**
   * CONNECTIONS: Platform account control
   */
  export interface PlatformConnection {
    _id: Id<'connections'>;
    fromThingId: Id<'things'>; // Agent ID
    toThingId: Id<'things'>; // Platform account ID
    relationshipType: 'controls';
    groupId: Id<'groups'>;
    metadata: {
      platform: string;
      accountType: 'bot' | 'user';
      permissions: string[];
      plugin: string;
    };
    createdAt: number;
  }

  /**
   * EVENTS: Communication events
   */
  export interface CommunicationEvent {
    _id: Id<'events'>;
    type: 'communication_sent' | 'communication_received';
    actorId: Id<'things'>; // Agent ID
    targetId: Id<'things'>; // Channel/Chat ID
    groupId: Id<'groups'>;
    timestamp: number;
    metadata: {
      platform: string;
      messageType: 'text' | 'image' | 'embed';
      channelId: string;
      content: string;
      messageId: string;
      plugin: string;
    };
  }
}

// ============================================================================
// PATTERN 5: DEFI PROTOCOL PLUGIN TYPES (plugin-0x, plugin-uniswap)
// ============================================================================

export namespace DeFiPlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    protocol: '0x' | 'uniswap' | 'curve' | 'aave';
    apiKey?: string;
    walletAddress: string;
    chain: 'ethereum' | 'polygon' | 'base';
  }

  /**
   * Plugin actions
   */
  export type Action =
    | {
        type: 'getQuote';
        sellToken: string;
        buyToken: string;
        sellAmount: string;
        slippagePercentage?: number;
      }
    | {
        type: 'executeSwap';
        sellToken: string;
        buyToken: string;
        sellAmount: string;
      }
    | { type: 'checkAllowance'; tokenAddress: string };

  /**
   * Plugin results
   */
  export type Result =
    | {
        type: 'quote';
        buyAmount: string;
        price: string;
        estimatedGas: string;
        guaranteedPrice: string;
      }
    | { type: 'swap'; txHash: string; buyAmount: string; status: 'confirmed' | 'failed' }
    | { type: 'allowance'; amount: string; sufficient: boolean };

  /**
   * EVENTS: Token swap transaction
   */
  export interface SwapEvent {
    _id: Id<'events'>;
    type: 'blockchain_transaction';
    actorId: Id<'things'>; // Agent ID
    targetId: Id<'things'>; // Wallet ID
    groupId: Id<'groups'>;
    timestamp: number;
    metadata: {
      chain: string;
      transactionType: 'token_swap';
      protocol: string;
      fromToken: {
        address: string;
        symbol: string;
        amount: number;
      };
      toToken: {
        address: string;
        symbol: string;
        amount: number;
      };
      slippage: number;
      gasCost: number;
      signature: string;
      status: 'pending' | 'confirmed' | 'failed';
      plugin: string;
    };
  }
}

// ============================================================================
// PATTERN 6: LLM PROVIDER PLUGIN TYPES (plugin-openrouter)
// ============================================================================

export namespace LLMProviderPlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    provider: 'openrouter' | 'anthropic' | 'openai';
    apiKey: string;
    defaultModel?: string;
  }

  /**
   * Plugin actions
   */
  export type Action =
    | {
        type: 'complete';
        prompt: string;
        model?: string;
        maxTokens?: number;
        temperature?: number;
      }
    | { type: 'stream'; prompt: string; model?: string }
    | { type: 'listModels' };

  /**
   * Plugin results
   */
  export type Result =
    | {
        type: 'completion';
        text: string;
        model: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        costUsd: number;
      }
    | { type: 'stream'; stream: AsyncIterable<string> }
    | { type: 'models'; models: ModelInfo[] };

  export interface ModelInfo {
    id: string;
    name: string;
    contextWindow: number;
    pricing: { prompt: number; completion: number };
  }

  /**
   * EVENTS: AI generation
   */
  export interface AIGenerationEvent {
    _id: Id<'events'>;
    type: 'ai_generated';
    actorId: Id<'things'>; // Agent ID
    targetId: Id<'things'>; // Conversation ID
    groupId: Id<'groups'>;
    timestamp: number;
    metadata: {
      provider: string;
      model: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      costUsd: number;
      latencyMs: number;
      plugin: string;
    };
  }

  /**
   * KNOWLEDGE: Store LLM responses
   */
  export interface CompletionKnowledge {
    _id: Id<'knowledge'>;
    knowledgeType: 'completion';
    text: string;
    embedding?: number[];
    groupId: Id<'groups'>;
    metadata: {
      model: string;
      provider: string;
      prompt: string;
      tokens: number;
      costUsd: number;
      plugin: string;
    };
    createdAt: number;
    updatedAt: number;
  }
}

// ============================================================================
// PATTERN 7: VISUALIZATION PLUGIN TYPES (plugin-timeline)
// ============================================================================

export namespace VisualizationPlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    visualizationType: 'timeline' | 'graph' | 'chart';
  }

  /**
   * Plugin actions
   */
  export type Action =
    | { type: 'recordThought'; step: number; content: string; confidence: number }
    | { type: 'generateTimeline'; taskId: Id<'things'> }
    | { type: 'getReasoningSteps'; taskId: Id<'things'> };

  /**
   * Plugin results
   */
  export type Result =
    | { type: 'thought'; thoughtId: Id<'events'> }
    | { type: 'timeline'; data: TimelineData }
    | { type: 'steps'; steps: ThoughtStep[] };

  export interface TimelineData {
    events: Array<{
      step: number;
      time: number;
      action: string;
      confidence?: number;
    }>;
  }

  export interface ThoughtStep {
    step: number;
    thoughtType: string;
    content: string;
    confidence: number;
    timestamp: number;
  }

  /**
   * EVENTS: Agent thoughts
   */
  export interface ThoughtEvent {
    _id: Id<'events'>;
    type: 'agent_thought';
    actorId: Id<'things'>; // Agent ID
    targetId: Id<'things'>; // Task ID
    groupId: Id<'groups'>;
    timestamp: number;
    metadata: {
      step: number;
      thoughtType: 'reasoning' | 'planning' | 'executing' | 'reflecting';
      content: string;
      confidence: number;
      plugin: 'plugin-timeline';
    };
  }

  /**
   * THINGS: Visualization entity
   */
  export interface VisualizationThing {
    _id: Id<'things'>;
    type: 'visualization';
    groupId: Id<'groups'>;
    properties: {
      visualizationType: string;
      data: any;
      metadata: {
        plugin: string;
        taskId?: Id<'things'>;
        generatedAt: number;
      };
    };
    status: 'active';
    createdAt: number;
    updatedAt: number;
  }
}

// ============================================================================
// PATTERN 8: MEMORY/STATE PLUGIN TYPES (plugin-memory)
// ============================================================================

export namespace MemoryPlugin {
  /**
   * Plugin configuration
   */
  export interface Config {
    groupId: Id<'groups'>;
    embeddingModel: string;
    maxMemories?: number;
  }

  /**
   * Plugin actions
   */
  export type Action =
    | {
        type: 'storeMemory';
        text: string;
        memoryType: 'preference' | 'fact' | 'conversation';
        confidence: number;
      }
    | { type: 'recallMemory'; query: string; limit?: number }
    | { type: 'forgetMemory'; memoryId: Id<'knowledge'> };

  /**
   * Plugin results
   */
  export type Result =
    | { type: 'stored'; memoryId: Id<'knowledge'> }
    | { type: 'recalled'; memories: Memory[] }
    | { type: 'forgotten'; success: boolean };

  export interface Memory {
    text: string;
    memoryType: string;
    confidence: number;
    observations: number;
    lastAccessed: number;
  }

  /**
   * KNOWLEDGE: Long-term memory
   */
  export interface MemoryKnowledge {
    _id: Id<'knowledge'>;
    knowledgeType: 'memory';
    text: string;
    embedding: number[];
    groupId: Id<'groups'>;
    sourceThingId: Id<'things'>; // User or Agent ID
    labels: string[];
    metadata: {
      memoryType: 'preference' | 'fact' | 'conversation';
      confidence: number;
      observations: number;
      lastAccessed: number;
      plugin: 'plugin-memory';
    };
    createdAt: number;
    updatedAt: number;
  }

  /**
   * CONNECTIONS: Memory links
   */
  export interface MemoryConnection {
    _id: Id<'connections'>;
    fromThingId: Id<'things'>; // Agent ID
    toThingId: Id<'knowledge'>; // Memory ID
    relationshipType: 'remembers';
    groupId: Id<'groups'>;
    metadata: {
      memoryType: string;
      importance: number;
      plugin: 'plugin-memory';
    };
    createdAt: number;
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
  name: string;
  version: string;
  pattern:
    | 'blockchain'
    | 'knowledge'
    | 'browser'
    | 'client'
    | 'defi'
    | 'llm'
    | 'visualization'
    | 'memory';
  npmPackage: string;
  githubRepo: string;
  description: string;
  capabilities: string[];
  requiredSecrets: string[];
  testEnvironment?: {
    network?: string;
    testServer?: string;
  };
}

/**
 * Plugin installation record
 */
export interface PluginInstallation {
  pluginName: string;
  groupId: Id<'groups'>;
  configurationId: Id<'things'>;
  installedAt: number;
  installedBy: Id<'people'>;
  status: 'active' | 'suspended' | 'uninstalled';
  usageStats: {
    executions: number;
    lastUsed: number;
    errorCount: number;
  };
}

/**
 * Database provider (for dependency injection)
 */
export interface ConvexDatabase {
  insert: <T extends 'things' | 'events' | 'connections' | 'knowledge'>(
    table: T,
    data: any
  ) => Effect.Effect<Id<T>, DatabaseError, never>;

  query: (table: string) => any;
  vectorSearch: (args: any) => Effect.Effect<any[], DatabaseError, never>;
  get: (id: string) => Effect.Effect<any, DatabaseError, never>;
  patch: (id: string, data: any) => Effect.Effect<void, DatabaseError, never>;
}

export interface DatabaseError {
  readonly _tag: 'DatabaseError';
  readonly message: string;
  readonly cause?: Error;
}

// ============================================================================
// EXPORT ALL PATTERNS
// ============================================================================

export type AnyPluginAdapter =
  | PluginAdapter<
      BlockchainPlugin.Config,
      BlockchainPlugin.Action,
      BlockchainPlugin.Result
    >
  | PluginAdapter<KnowledgePlugin.Config, KnowledgePlugin.Action, KnowledgePlugin.Result>
  | PluginAdapter<BrowserPlugin.Config, BrowserPlugin.Action, BrowserPlugin.Result>
  | PluginAdapter<ClientPlugin.Config, ClientPlugin.Action, ClientPlugin.Result>
  | PluginAdapter<DeFiPlugin.Config, DeFiPlugin.Action, DeFiPlugin.Result>
  | PluginAdapter<
      LLMProviderPlugin.Config,
      LLMProviderPlugin.Action,
      LLMProviderPlugin.Result
    >
  | PluginAdapter<
      VisualizationPlugin.Config,
      VisualizationPlugin.Action,
      VisualizationPlugin.Result
    >
  | PluginAdapter<MemoryPlugin.Config, MemoryPlugin.Action, MemoryPlugin.Result>;
