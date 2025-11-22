/**
 * Mock Plugin Data
 * Sample data for plugin registry demonstration
 */

import type { Plugin, PluginDependency, PluginInstance } from "@/types/plugin";

export const mockPlugins: Plugin[] = [
  {
    _id: "plugin-solana",
    name: "plugin-solana",
    description: "Solana blockchain integration with token operations, swaps, and NFT support",
    version: "1.2.0",
    author: "elizaOS",
    category: "blockchain",
    status: "available",
    npmPackage: "@elizaos/plugin-solana",
    githubRepo: "elizaos/eliza",
    capabilities: ["token-balance", "send-sol", "token-swap", "nft-operations"],
    dependencies: [],
    tags: ["blockchain", "solana", "crypto", "web3"],
    rating: 4.8,
    reviewCount: 124,
    installCount: 3421,
    settings: [
      {
        id: "rpc_url",
        name: "RPC URL",
        description: "Solana RPC endpoint (mainnet-beta, devnet, or custom)",
        type: "string",
        required: true,
        defaultValue: "https://api.mainnet-beta.solana.com",
      },
      {
        id: "private_key",
        name: "Private Key",
        description: "Wallet private key for transactions",
        type: "secret",
        required: false,
      },
    ],
    actions: [
      {
        id: "get-balance",
        name: "Get Balance",
        description: "Get SOL balance for an address",
        parameters: [
          {
            name: "address",
            type: "string",
            required: true,
            description: "Solana wallet address",
          },
        ],
      },
      {
        id: "send-sol",
        name: "Send SOL",
        description: "Send SOL to another address",
        parameters: [
          {
            name: "to",
            type: "string",
            required: true,
            description: "Recipient address",
          },
          {
            name: "amount",
            type: "number",
            required: true,
            description: "Amount in SOL",
          },
        ],
      },
    ],
  },
  {
    _id: "plugin-knowledge",
    name: "plugin-knowledge",
    description: "RAG knowledge base with document ingestion, semantic search, and context retrieval",
    version: "2.0.1",
    author: "elizaOS",
    category: "knowledge",
    status: "available",
    npmPackage: "@elizaos/plugin-knowledge",
    githubRepo: "elizaos/eliza",
    capabilities: ["document-ingestion", "semantic-search", "context-retrieval", "embeddings"],
    dependencies: [],
    tags: ["rag", "knowledge", "embeddings", "search"],
    rating: 4.9,
    reviewCount: 234,
    installCount: 5632,
    settings: [
      {
        id: "embedding_model",
        name: "Embedding Model",
        description: "Model for generating embeddings",
        type: "string",
        required: true,
        defaultValue: "text-embedding-3-small",
      },
      {
        id: "chunk_size",
        name: "Chunk Size",
        description: "Size of text chunks for indexing",
        type: "number",
        required: false,
        defaultValue: 512,
      },
    ],
    actions: [
      {
        id: "ingest-document",
        name: "Ingest Document",
        description: "Add a document to the knowledge base",
        parameters: [
          {
            name: "content",
            type: "string",
            required: true,
            description: "Document content",
          },
          {
            name: "metadata",
            type: "object",
            required: false,
            description: "Document metadata",
          },
        ],
      },
    ],
  },
  {
    _id: "plugin-browser",
    name: "plugin-browser",
    description: "Playwright-based web scraping with page navigation, element extraction, and screenshots",
    version: "1.5.2",
    author: "elizaOS",
    category: "browser",
    status: "available",
    npmPackage: "@elizaos/plugin-browser",
    githubRepo: "elizaos/eliza",
    capabilities: ["web-scraping", "page-navigation", "screenshots", "form-filling"],
    dependencies: ["plugin-knowledge"],
    tags: ["browser", "scraping", "playwright", "automation"],
    rating: 4.6,
    reviewCount: 89,
    installCount: 1823,
    settings: [
      {
        id: "headless",
        name: "Headless Mode",
        description: "Run browser in headless mode",
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      {
        id: "timeout",
        name: "Timeout",
        description: "Page load timeout in milliseconds",
        type: "number",
        required: false,
        defaultValue: 30000,
      },
    ],
    actions: [
      {
        id: "navigate",
        name: "Navigate",
        description: "Navigate to a URL",
        parameters: [
          {
            name: "url",
            type: "string",
            required: true,
            description: "URL to navigate to",
          },
        ],
      },
    ],
  },
  {
    _id: "plugin-discord",
    name: "plugin-discord",
    description: "Discord bot integration with message handling, channel management, and event listeners",
    version: "1.3.0",
    author: "elizaOS",
    category: "client",
    status: "available",
    npmPackage: "@elizaos/plugin-discord",
    githubRepo: "elizaos/eliza",
    capabilities: ["message-handling", "channel-management", "role-management", "events"],
    dependencies: [],
    tags: ["discord", "chat", "messaging", "bot"],
    rating: 4.7,
    reviewCount: 156,
    installCount: 2934,
    settings: [
      {
        id: "bot_token",
        name: "Bot Token",
        description: "Discord bot token",
        type: "secret",
        required: true,
      },
      {
        id: "guild_id",
        name: "Guild ID",
        description: "Discord server (guild) ID",
        type: "string",
        required: false,
      },
    ],
    actions: [],
  },
  {
    _id: "plugin-openrouter",
    name: "plugin-openrouter",
    description: "Multi-model LLM access via OpenRouter with streaming, cost tracking, and model selection",
    version: "1.8.0",
    author: "elizaOS",
    category: "llm",
    status: "available",
    npmPackage: "@elizaos/plugin-openrouter",
    githubRepo: "elizaos/eliza",
    capabilities: ["multi-model", "streaming", "cost-tracking", "model-switching"],
    dependencies: [],
    tags: ["llm", "openrouter", "ai", "gpt"],
    rating: 4.9,
    reviewCount: 312,
    installCount: 7821,
    settings: [
      {
        id: "api_key",
        name: "API Key",
        description: "OpenRouter API key",
        type: "secret",
        required: true,
      },
      {
        id: "default_model",
        name: "Default Model",
        description: "Default model to use",
        type: "string",
        required: false,
        defaultValue: "anthropic/claude-3.5-sonnet",
      },
    ],
    actions: [],
  },
  {
    _id: "plugin-0x",
    name: "plugin-0x",
    description: "Token swap integration with multi-chain support, price quotes, and slippage protection",
    version: "1.1.3",
    author: "elizaOS",
    category: "blockchain",
    status: "available",
    npmPackage: "@elizaos/plugin-0x",
    githubRepo: "elizaos/eliza",
    capabilities: ["token-swaps", "price-quotes", "multi-chain", "slippage-protection"],
    dependencies: ["plugin-solana"],
    tags: ["defi", "swap", "0x", "dex"],
    rating: 4.5,
    reviewCount: 67,
    installCount: 982,
    settings: [
      {
        id: "api_key",
        name: "0x API Key",
        description: "0x protocol API key",
        type: "secret",
        required: true,
      },
    ],
    actions: [],
  },
];

export const mockDependencies: PluginDependency[] = [
  {
    pluginId: "plugin-browser",
    dependsOn: ["plugin-knowledge"],
  },
  {
    pluginId: "plugin-0x",
    dependsOn: ["plugin-solana"],
  },
];

export const mockInstalledPlugins: PluginInstance[] = [
  {
    _id: "instance-1",
    pluginId: "plugin-solana",
    groupId: "org-123",
    installedAt: Date.now() - 86400000 * 7, // 7 days ago
    status: "active",
    config: {
      rpc_url: "https://api.mainnet-beta.solana.com",
    },
    lastUsed: Date.now() - 3600000, // 1 hour ago
    executionCount: 245,
    errorCount: 3,
  },
  {
    _id: "instance-2",
    pluginId: "plugin-knowledge",
    groupId: "org-123",
    installedAt: Date.now() - 86400000 * 14, // 14 days ago
    status: "active",
    config: {
      embedding_model: "text-embedding-3-small",
      chunk_size: 512,
    },
    lastUsed: Date.now() - 7200000, // 2 hours ago
    executionCount: 1823,
    errorCount: 12,
  },
  {
    _id: "instance-3",
    pluginId: "plugin-discord",
    groupId: "org-123",
    installedAt: Date.now() - 86400000 * 3, // 3 days ago
    status: "installed",
    config: {},
    lastUsed: Date.now() - 86400000, // 1 day ago
    executionCount: 89,
    errorCount: 0,
  },
];
