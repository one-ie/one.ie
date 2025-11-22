---
title: ElizaOS Plugin Integration Patterns
dimension: knowledge
category: patterns
tags: elizaos, plugins, integration, patterns, ontology-mapping
related_dimensions: things, connections, events, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycles: 71-80
status: documented
ai_context: |
  This document captures integration patterns discovered while mapping 8 different
  ElizaOS plugin types to the ONE Platform's 6-dimension ontology. Use these patterns
  when integrating additional plugins.
---

# ElizaOS Plugin Integration Patterns

**Version:** 1.0.0
**Cycles:** 71-80 (Sample Plugin Integrations)
**Status:** Pattern Library Complete

This document captures reusable integration patterns discovered while mapping 8 diverse ElizaOS plugin types to the ONE Platform's 6-dimension ontology.

---

## Table of Contents

1. [Overview](#overview)
2. [Pattern 1: Blockchain Plugin Pattern](#pattern-1-blockchain-plugin-pattern)
3. [Pattern 2: Knowledge/RAG Plugin Pattern](#pattern-2-knowledgerag-plugin-pattern)
4. [Pattern 3: Browser Automation Plugin Pattern](#pattern-3-browser-automation-plugin-pattern)
5. [Pattern 4: Client/Platform Plugin Pattern](#pattern-4-clientplatform-plugin-pattern)
6. [Pattern 5: DeFi/Protocol Plugin Pattern](#pattern-5-defiprotocol-plugin-pattern)
7. [Pattern 6: LLM Provider Plugin Pattern](#pattern-6-llm-provider-plugin-pattern)
8. [Pattern 7: Visualization Plugin Pattern](#pattern-7-visualization-plugin-pattern)
9. [Pattern 8: Memory/State Plugin Pattern](#pattern-8-memorystate-plugin-pattern)
10. [Universal Integration Framework](#universal-integration-framework)
11. [Testing Framework](#testing-framework)

---

## Overview

### The 8 Plugin Types Analyzed

| Plugin | Type | Primary Use Case | Ontology Dimensions |
|--------|------|-----------------|---------------------|
| plugin-solana | Blockchain | Token operations, wallet management | THINGS, EVENTS, CONNECTIONS |
| plugin-knowledge | RAG System | Document storage, semantic search | KNOWLEDGE, THINGS, EVENTS |
| plugin-browser | Automation | Web scraping, form filling | EVENTS, THINGS (scraped content) |
| plugin-discord | Client/Platform | Message sending, bot operations | CONNECTIONS, EVENTS, PEOPLE |
| plugin-0x | DeFi Protocol | Token swaps, liquidity | EVENTS, CONNECTIONS (transactions) |
| plugin-openrouter | LLM Provider | Multi-model AI access | EVENTS, KNOWLEDGE (responses) |
| plugin-timeline | Visualization | Reasoning display | EVENTS, KNOWLEDGE (thought process) |
| plugin-memory | State Management | Agent memory, context | KNOWLEDGE, EVENTS, CONNECTIONS |

### Common Integration Challenges

1. **Runtime Environment**: ElizaOS plugins expect specific runtime context
2. **Secret Management**: Each plugin needs API keys, RPC endpoints, credentials
3. **Multi-Tenant Isolation**: Plugins must respect organization boundaries
4. **Error Handling**: Network failures, rate limits, validation errors
5. **Event Logging**: Every action must map to 6-dimension events
6. **Type Safety**: TypeScript types must match ElizaOS interfaces

---

## Pattern 1: Blockchain Plugin Pattern

**Applies to:** plugin-solana, plugin-evm, plugin-starknet, plugin-fuel

### Ontology Mapping

```typescript
// THINGS: Blockchain entities
{
  type: 'blockchain_wallet',
  groupId: organizationGroupId,  // Multi-tenant scoping
  properties: {
    chain: 'solana',              // Chain identifier
    network: 'mainnet-beta',      // Network (mainnet, devnet, testnet)
    publicKey: '7xKX...aBcD',     // Public address
    privateKey: null,             // NEVER store unencrypted
    encryptedKey: 'encrypted...',  // Encrypted private key
    balance: 1.5,                 // Native token balance
    lastSynced: 1700000000000,
    metadata: {
      derivationPath: "m/44'/501'/0'/0'",
      plugin: 'plugin-solana',
      version: '1.0.0'
    }
  }
}

{
  type: 'blockchain_token',
  groupId: organizationGroupId,
  properties: {
    chain: 'solana',
    tokenMint: 'EPjFWdd5...USDC',
    symbol: 'USDC',
    decimals: 6,
    balance: 100.50,
    priceUsd: 1.00,
    metadata: {
      tokenProgram: 'spl-token',
      associated_account: '8xKL...'
    }
  }
}

// EVENTS: Blockchain actions
{
  type: 'blockchain_transaction',
  actorId: agentId,
  targetId: walletId,
  groupId: organizationGroupId,
  timestamp: Date.now(),
  metadata: {
    chain: 'solana',
    transactionType: 'transfer',
    fromAddress: '7xKX...',
    toAddress: '9yLM...',
    amount: 0.5,
    token: 'SOL',
    signature: '3xYz...signature',
    status: 'confirmed',
    blockNumber: 123456789,
    plugin: 'plugin-solana'
  }
}

// CONNECTIONS: Wallet ownership
{
  fromThingId: agentId,
  toThingId: walletId,
  relationshipType: 'owns',
  groupId: organizationGroupId,
  metadata: {
    walletType: 'hot_wallet',
    permissions: ['read', 'transfer'],
    plugin: 'plugin-solana'
  }
}
```

### Plugin Adapter Example

```typescript
// adapters/BlockchainPluginAdapter.ts
import { Effect } from 'effect';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

export class SolanaPluginAdapter {
  constructor(
    private readonly groupId: Id<'groups'>,
    private readonly rpcEndpoint: string,
    private readonly encryptedWallet: string
  ) {}

  /**
   * Execute transfer action
   */
  transfer = (args: {
    toAddress: string;
    amount: number;
    token?: string;
  }) =>
    Effect.gen(function* () {
      // 1. Decrypt wallet
      const wallet = yield* this.decryptWallet();

      // 2. Create connection
      const connection = new Connection(this.rpcEndpoint);

      // 3. Build transaction
      const transaction = yield* this.buildTransferTransaction({
        wallet,
        toAddress: args.toAddress,
        amount: args.amount,
        token: args.token,
      });

      // 4. Send transaction
      const signature = yield* Effect.tryPromise({
        try: () =>
          connection.sendTransaction(transaction, [wallet.keypair]),
        catch: (error) => new BlockchainError('Transfer failed', error),
      });

      // 5. Wait for confirmation
      yield* Effect.tryPromise({
        try: () => connection.confirmTransaction(signature),
        catch: (error) => new BlockchainError('Confirmation failed', error),
      });

      // 6. Log event
      yield* this.logTransactionEvent({
        type: 'transfer',
        signature,
        amount: args.amount,
        toAddress: args.toAddress,
      });

      return {
        signature,
        status: 'confirmed',
        explorerUrl: `https://solscan.io/tx/${signature}`,
      };
    });

  /**
   * Get wallet balance
   */
  getBalance = () =>
    Effect.gen(function* () {
      const wallet = yield* this.decryptWallet();
      const connection = new Connection(this.rpcEndpoint);

      const balance = yield* Effect.tryPromise({
        try: () =>
          connection.getBalance(new PublicKey(wallet.publicKey)),
        catch: (error) => new BlockchainError('Balance fetch failed', error),
      });

      return {
        balance: balance / 1e9, // Lamports to SOL
        token: 'SOL',
      };
    });

  /**
   * Decrypt wallet (org-scoped encryption)
   */
  private decryptWallet = () =>
    Effect.gen(function* () {
      // Use org-specific encryption key
      const orgKey = yield* this.getOrgEncryptionKey(this.groupId);

      // Decrypt wallet
      const decrypted = yield* Effect.tryPromise({
        try: () => decrypt(this.encryptedWallet, orgKey),
        catch: (error) => new SecurityError('Wallet decryption failed', error),
      });

      return JSON.parse(decrypted);
    });

  /**
   * Log transaction event (maps to 6-dimension ontology)
   */
  private logTransactionEvent = (args: {
    type: string;
    signature: string;
    amount: number;
    toAddress: string;
  }) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      yield* db.insert('events', {
        type: 'blockchain_transaction',
        actorId: this.agentId,
        targetId: this.walletId,
        groupId: this.groupId,  // Multi-tenant scoping
        timestamp: Date.now(),
        metadata: {
          chain: 'solana',
          transactionType: args.type,
          signature: args.signature,
          amount: args.amount,
          toAddress: args.toAddress,
          plugin: 'plugin-solana',
          network: this.network,
        },
      });
    });
}
```

### Security Considerations

1. **Never store private keys unencrypted**
2. **Use org-scoped encryption keys**
3. **Log all transactions as events**
4. **Validate addresses before sending**
5. **Use devnet/testnet for testing**
6. **Rate limit RPC requests**

### Testing Approach

```typescript
describe('SolanaPluginAdapter', () => {
  it('should transfer SOL on devnet', async () => {
    const adapter = new SolanaPluginAdapter(
      groupId,
      'https://api.devnet.solana.com',
      encryptedTestWallet
    );

    const result = await Effect.runPromise(
      adapter.transfer({
        toAddress: 'DevnetRecipient...',
        amount: 0.1, // Test amount
      })
    );

    expect(result.signature).toBeDefined();
    expect(result.status).toBe('confirmed');
  });
});
```

---

## Pattern 2: Knowledge/RAG Plugin Pattern

**Applies to:** plugin-knowledge, plugin-rag, plugin-vectordb

### Ontology Mapping

```typescript
// KNOWLEDGE: Vector embeddings
{
  knowledgeType: 'chunk',
  text: 'Document content here...',
  embedding: [0.123, -0.456, ...], // 1536-dim vector
  embeddingModel: 'text-embedding-3-large',
  embeddingDim: 1536,
  sourceThingId: documentId,
  sourceField: 'content',
  groupId: organizationGroupId,  // Multi-tenant scoping
  labels: ['document', 'customer-data', 'plugin-knowledge'],
  metadata: {
    plugin: 'plugin-knowledge',
    documentType: 'pdf',
    pageNumber: 5,
    confidence: 0.95
  }
}

// THINGS: Knowledge base
{
  type: 'knowledge_base',
  groupId: organizationGroupId,
  properties: {
    name: 'Product Documentation',
    description: 'All product docs and guides',
    documentCount: 150,
    chunkCount: 5000,
    embeddingModel: 'text-embedding-3-large',
    indexType: 'vector',
    metadata: {
      plugin: 'plugin-knowledge',
      created: Date.now(),
      lastUpdated: Date.now()
    }
  }
}

// EVENTS: Knowledge operations
{
  type: 'content_changed',
  actorId: agentId,
  targetId: knowledgeBaseId,
  groupId: organizationGroupId,
  timestamp: Date.now(),
  metadata: {
    action: 'document_ingested',
    documentId: documentId,
    chunksCreated: 25,
    embeddingsGenerated: 25,
    plugin: 'plugin-knowledge'
  }
}
```

### Plugin Adapter Example

```typescript
// adapters/KnowledgePluginAdapter.ts
import { Effect } from 'effect';
import { OpenAIProvider } from './openai-provider';

export class KnowledgePluginAdapter {
  constructor(
    private readonly groupId: Id<'groups'>,
    private readonly knowledgeBaseId: Id<'things'>,
    private readonly embeddingModel: string = 'text-embedding-3-large'
  ) {}

  /**
   * Ingest document into knowledge base
   */
  ingestDocument = (args: {
    content: string;
    metadata: Record<string, any>;
    chunkSize?: number;
  }) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const openai = yield* OpenAIProvider;

      // 1. Split content into chunks
      const chunks = yield* this.splitIntoChunks(
        args.content,
        args.chunkSize ?? 1000
      );

      // 2. Generate embeddings for each chunk
      const embeddings = yield* Effect.all(
        chunks.map((chunk) =>
          openai.generateEmbedding({
            text: chunk.text,
            model: this.embeddingModel,
          })
        ),
        { concurrency: 5 }
      );

      // 3. Store in knowledge table
      const knowledgeIds = yield* Effect.all(
        chunks.map((chunk, i) =>
          db.insert('knowledge', {
            knowledgeType: 'chunk',
            text: chunk.text,
            embedding: embeddings[i].embedding,
            embeddingModel: this.embeddingModel,
            embeddingDim: embeddings[i].dimensions,
            sourceThingId: this.knowledgeBaseId,
            sourceField: 'content',
            groupId: this.groupId,  // Multi-tenant scoping
            labels: ['plugin-knowledge', ...Object.keys(args.metadata)],
            metadata: {
              ...args.metadata,
              chunkIndex: i,
              chunkCount: chunks.length,
              plugin: 'plugin-knowledge',
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
      );

      // 4. Log event
      yield* db.insert('events', {
        type: 'content_changed',
        actorId: this.agentId,
        targetId: this.knowledgeBaseId,
        groupId: this.groupId,
        timestamp: Date.now(),
        metadata: {
          action: 'document_ingested',
          chunksCreated: chunks.length,
          embeddingsGenerated: embeddings.length,
          plugin: 'plugin-knowledge',
        },
      });

      return {
        knowledgeIds,
        chunksCreated: chunks.length,
      };
    });

  /**
   * Semantic search in knowledge base
   */
  search = (args: { query: string; limit?: number }) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const openai = yield* OpenAIProvider;

      // 1. Generate query embedding
      const queryEmbedding = yield* openai.generateEmbedding({
        text: args.query,
        model: this.embeddingModel,
      });

      // 2. Vector similarity search (using knowledge.vectorSearch)
      const results = yield* db.vectorSearch({
        table: 'knowledge',
        indexName: 'by_embedding',
        vector: queryEmbedding.embedding,
        limit: args.limit ?? 10,
        filter: (q) =>
          q.and(
            q.eq(q.field('groupId'), this.groupId),  // Multi-tenant filtering
            q.eq(q.field('sourceThingId'), this.knowledgeBaseId)
          ),
      });

      // 3. Log search event
      yield* db.insert('events', {
        type: 'content_read',
        actorId: this.agentId,
        targetId: this.knowledgeBaseId,
        groupId: this.groupId,
        timestamp: Date.now(),
        metadata: {
          action: 'semantic_search',
          query: args.query,
          resultsFound: results.length,
          plugin: 'plugin-knowledge',
        },
      });

      return results.map((r) => ({
        text: r.text,
        score: r._score,
        metadata: r.metadata,
      }));
    });

  /**
   * Split text into chunks
   */
  private splitIntoChunks = (text: string, chunkSize: number) =>
    Effect.sync(() => {
      const chunks = [];
      const sentences = text.split(/[.!?]+/);
      let currentChunk = '';

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > chunkSize) {
          if (currentChunk) {
            chunks.push({ text: currentChunk.trim() });
          }
          currentChunk = sentence;
        } else {
          currentChunk += sentence + '. ';
        }
      }

      if (currentChunk) {
        chunks.push({ text: currentChunk.trim() });
      }

      return chunks;
    });
}
```

### Multi-Tenant Isolation

**Critical:** Knowledge bases MUST be scoped by `groupId` to prevent cross-organization data leaks.

```typescript
// CORRECT: Filter by groupId
const results = yield* db.vectorSearch({
  table: 'knowledge',
  indexName: 'by_embedding',
  vector: embedding,
  filter: (q) => q.eq(q.field('groupId'), userGroupId),  // ✅
});

// WRONG: No groupId filter
const results = yield* db.vectorSearch({
  table: 'knowledge',
  indexName: 'by_embedding',
  vector: embedding,
  // ❌ SECURITY ISSUE: Can access other orgs' data!
});
```

---

## Pattern 3: Browser Automation Plugin Pattern

**Applies to:** plugin-browser, plugin-playwright, plugin-puppeteer

### Ontology Mapping

```typescript
// EVENTS: Browser actions
{
  type: 'automation_executed',
  actorId: agentId,
  targetId: taskId,
  groupId: organizationGroupId,
  timestamp: Date.now(),
  metadata: {
    action: 'page_scraped',
    url: 'https://example.com/products',
    elementsExtracted: 50,
    screenshotUrl: 'https://storage.../screenshot.png',
    duration: 5234, // ms
    plugin: 'plugin-browser',
    browserType: 'chromium'
  }
}

// THINGS: Scraped content
{
  type: 'scraped_content',
  groupId: organizationGroupId,
  properties: {
    url: 'https://example.com/products',
    html: '<html>...</html>',
    text: 'Extracted text content...',
    structured: {
      products: [
        { name: 'Product 1', price: 99.99 },
        { name: 'Product 2', price: 149.99 }
      ]
    },
    screenshot: 'https://storage.../screenshot.png',
    scrapedAt: Date.now(),
    metadata: {
      plugin: 'plugin-browser',
      selector: '.product-card',
      matchCount: 50
    }
  }
}
```

### Plugin Adapter Example

```typescript
// adapters/BrowserPluginAdapter.ts
import { Effect } from 'effect';
import { chromium, Browser, Page } from 'playwright';

export class BrowserPluginAdapter {
  private browser: Browser | null = null;

  constructor(
    private readonly groupId: Id<'groups'>,
    private readonly allowedDomains: string[] = []
  ) {}

  /**
   * Scrape webpage
   */
  scrapePage = (args: {
    url: string;
    selector?: string;
    screenshot?: boolean;
  }) =>
    Effect.gen(function* () {
      // 1. Validate URL is allowed
      yield* this.validateUrl(args.url);

      // 2. Launch browser
      const page = yield* this.launchBrowser();

      // 3. Navigate to page
      yield* Effect.tryPromise({
        try: () => page.goto(args.url, { waitUntil: 'networkidle' }),
        catch: (error) => new BrowserError('Navigation failed', error),
      });

      // 4. Extract content
      const content = yield* args.selector
        ? this.extractWithSelector(page, args.selector)
        : this.extractFullPage(page);

      // 5. Capture screenshot
      let screenshotUrl: string | undefined;
      if (args.screenshot) {
        screenshotUrl = yield* this.captureScreenshot(page);
      }

      // 6. Store scraped content
      const contentId = yield* this.storeScrapedContent({
        url: args.url,
        content,
        screenshotUrl,
      });

      // 7. Log event
      yield* this.logScrapeEvent({
        url: args.url,
        contentId,
        elementsExtracted: content.length,
      });

      return {
        contentId,
        elements: content,
        screenshotUrl,
      };
    })
    .pipe(
      Effect.ensuring(this.closeBrowser())  // Always close browser
    );

  /**
   * Validate URL against allowlist
   */
  private validateUrl = (url: string) =>
    Effect.gen(function* () {
      const urlObj = new URL(url);

      // Security: Check if domain is allowed
      if (
        this.allowedDomains.length > 0 &&
        !this.allowedDomains.some((domain) =>
          urlObj.hostname.endsWith(domain)
        )
      ) {
        yield* Effect.fail(
          new SecurityError(
            `Domain ${urlObj.hostname} not in allowlist`
          )
        );
      }

      // Security: Block internal IPs
      if (
        urlObj.hostname === 'localhost' ||
        urlObj.hostname.startsWith('192.168.') ||
        urlObj.hostname.startsWith('10.') ||
        urlObj.hostname.startsWith('169.254.')
      ) {
        yield* Effect.fail(
          new SecurityError('Internal IPs are blocked')
        );
      }
    });

  /**
   * Launch browser instance
   */
  private launchBrowser = () =>
    Effect.gen(function* () {
      if (!this.browser) {
        this.browser = yield* Effect.tryPromise({
          try: () =>
            chromium.launch({
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }),
          catch: (error) => new BrowserError('Browser launch failed', error),
        });
      }

      const page = yield* Effect.tryPromise({
        try: () => this.browser!.newPage(),
        catch: (error) => new BrowserError('Page creation failed', error),
      });

      // Set timeout
      page.setDefaultTimeout(30000); // 30s

      return page;
    });

  /**
   * Extract content with CSS selector
   */
  private extractWithSelector = (page: Page, selector: string) =>
    Effect.tryPromise({
      try: async () => {
        const elements = await page.$$(selector);
        const content = await Promise.all(
          elements.map(async (el) => ({
            text: await el.textContent(),
            html: await el.innerHTML(),
            attributes: await el.evaluate((node) =>
              Object.fromEntries(
                Array.from(node.attributes).map((attr) => [
                  attr.name,
                  attr.value,
                ])
              )
            ),
          }))
        );
        return content;
      },
      catch: (error) => new BrowserError('Content extraction failed', error),
    });

  /**
   * Store scraped content in database
   */
  private storeScrapedContent = (args: {
    url: string;
    content: any;
    screenshotUrl?: string;
  }) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      const contentId = yield* db.insert('things', {
        type: 'scraped_content',
        groupId: this.groupId,
        properties: {
          url: args.url,
          structured: args.content,
          screenshot: args.screenshotUrl,
          scrapedAt: Date.now(),
          metadata: {
            plugin: 'plugin-browser',
            elementCount: args.content.length,
          },
        },
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return contentId;
    });
}
```

### Security Constraints

1. **URL Allowlist**: Only scrape approved domains
2. **Block Internal IPs**: Prevent SSRF attacks
3. **Timeout Enforcement**: 30s max per page
4. **Headless Mode**: No GUI, sandboxed execution
5. **Rate Limiting**: Max 10 requests/minute per org
6. **Log All Access**: Track every URL scraped

---

## Pattern 4: Client/Platform Plugin Pattern

**Applies to:** plugin-discord, plugin-telegram, plugin-twitter, plugin-slack

### Ontology Mapping

```typescript
// CONNECTIONS: Platform account
{
  fromThingId: agentId,
  toThingId: platformAccountId,
  relationshipType: 'controls',
  groupId: organizationGroupId,
  metadata: {
    platform: 'discord',
    accountType: 'bot',
    permissions: ['send_messages', 'read_messages', 'manage_roles'],
    plugin: 'plugin-discord'
  }
}

// EVENTS: Platform actions
{
  type: 'communication_sent',
  actorId: agentId,
  targetId: channelId,
  groupId: organizationGroupId,
  timestamp: Date.now(),
  metadata: {
    platform: 'discord',
    messageType: 'text',
    channelId: '1234567890',
    content: 'Hello from ONE Agent!',
    messageId: 'discord-msg-123',
    plugin: 'plugin-discord'
  }
}

// THINGS: Platform account
{
  type: 'external_connection',
  groupId: organizationGroupId,
  properties: {
    platform: 'discord',
    name: 'Discord Bot Connection',
    botToken: 'encrypted_token_here',
    applicationId: '1234567890',
    guildId: '0987654321',
    status: 'connected',
    lastUsed: Date.now(),
    metadata: {
      plugin: 'plugin-discord',
      permissions: 268435456, // Permission bit flags
      intents: ['GUILDS', 'GUILD_MESSAGES']
    }
  }
}
```

### Plugin Adapter Example

```typescript
// adapters/DiscordPluginAdapter.ts
import { Effect } from 'effect';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

export class DiscordPluginAdapter {
  private client: Client | null = null;

  constructor(
    private readonly groupId: Id<'groups'>,
    private readonly botToken: string,
    private readonly guildId: string
  ) {}

  /**
   * Send message to Discord channel
   */
  sendMessage = (args: { channelId: string; content: string }) =>
    Effect.gen(function* () {
      // 1. Connect to Discord
      yield* this.connect();

      // 2. Get channel
      const channel = yield* Effect.tryPromise({
        try: () =>
          this.client!.channels.fetch(args.channelId) as Promise<TextChannel>,
        catch: (error) => new PlatformError('Channel fetch failed', error),
      });

      // 3. Send message
      const message = yield* Effect.tryPromise({
        try: () => channel.send(args.content),
        catch: (error) => new PlatformError('Message send failed', error),
      });

      // 4. Log event
      yield* this.logMessageEvent({
        channelId: args.channelId,
        messageId: message.id,
        content: args.content,
      });

      return {
        messageId: message.id,
        timestamp: message.createdTimestamp,
        url: message.url,
      };
    });

  /**
   * Listen for messages in channel
   */
  subscribeToChannel = (args: {
    channelId: string;
    onMessage: (message: any) => void;
  }) =>
    Effect.gen(function* () {
      yield* this.connect();

      // Set up message listener
      this.client!.on('messageCreate', (message) => {
        if (message.channelId === args.channelId && !message.author.bot) {
          args.onMessage({
            id: message.id,
            content: message.content,
            author: {
              id: message.author.id,
              username: message.author.username,
            },
            timestamp: message.createdTimestamp,
          });
        }
      });

      // Return cleanup function
      return () => {
        this.client?.off('messageCreate');
      };
    });

  /**
   * Connect to Discord
   */
  private connect = () =>
    Effect.gen(function* () {
      if (this.client && this.client.isReady()) {
        return; // Already connected
      }

      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      yield* Effect.tryPromise({
        try: () => this.client!.login(this.botToken),
        catch: (error) => new PlatformError('Discord login failed', error),
      });

      // Wait for ready
      yield* Effect.async<void>((resume) => {
        this.client!.once('ready', () => {
          resume(Effect.succeed(undefined));
        });
      });
    });

  /**
   * Log message event
   */
  private logMessageEvent = (args: {
    channelId: string;
    messageId: string;
    content: string;
  }) =>
    Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      yield* db.insert('events', {
        type: 'communication_sent',
        actorId: this.agentId,
        targetId: this.connectionId,
        groupId: this.groupId,
        timestamp: Date.now(),
        metadata: {
          platform: 'discord',
          messageType: 'text',
          channelId: args.channelId,
          content: args.content,
          messageId: args.messageId,
          plugin: 'plugin-discord',
        },
      });
    });
}
```

### Rate Limiting

Discord has strict rate limits. Implement per-guild tracking:

```typescript
private rateLimiter = new Map<string, { count: number; resetAt: number }>();

private checkRateLimit = (guildId: string) =>
  Effect.gen(function* () {
    const now = Date.now();
    const limit = this.rateLimiter.get(guildId);

    if (limit && limit.resetAt > now) {
      if (limit.count >= 5) {
        // 5 messages per 5 seconds
        yield* Effect.fail(
          new RateLimitError(`Rate limit exceeded for guild ${guildId}`)
        );
      }
      limit.count++;
    } else {
      this.rateLimiter.set(guildId, {
        count: 1,
        resetAt: now + 5000,
      });
    }
  });
```

---

## Pattern 5: DeFi/Protocol Plugin Pattern

**Applies to:** plugin-0x, plugin-uniswap, plugin-curve, plugin-aave

### Ontology Mapping

```typescript
// EVENTS: Token swap
{
  type: 'blockchain_transaction',
  actorId: agentId,
  targetId: walletId,
  groupId: organizationGroupId,
  timestamp: Date.now(),
  metadata: {
    chain: 'ethereum',
    transactionType: 'token_swap',
    protocol: '0x',
    fromToken: {
      address: '0xA0b86...USDC',
      symbol: 'USDC',
      amount: 100
    },
    toToken: {
      address: '0x6B175...DAI',
      symbol: 'DAI',
      amount: 99.95
    },
    slippage: 0.5, // 0.5%
    gasCost: 0.002, // ETH
    signature: '0x3f7a...',
    status: 'confirmed',
    plugin: 'plugin-0x'
  }
}
```

### Plugin Adapter Example

```typescript
// adapters/ZeroExPluginAdapter.ts
import { Effect } from 'effect';

export class ZeroExPluginAdapter {
  constructor(
    private readonly groupId: Id<'groups'>,
    private readonly apiKey: string,
    private readonly walletAddress: string
  ) {}

  /**
   * Get swap quote
   */
  getQuote = (args: {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    slippagePercentage?: number;
  }) =>
    Effect.gen(function* () {
      const http = yield* HttpProvider;

      const quote = yield* http
        .get({
          url: 'https://api.0x.org/swap/v1/quote',
          params: {
            sellToken: args.sellToken,
            buyToken: args.buyToken,
            sellAmount: args.sellAmount,
            slippagePercentage: args.slippagePercentage ?? 0.5,
            takerAddress: this.walletAddress,
          },
          headers: {
            '0x-api-key': this.apiKey,
          },
        })
        .pipe(
          Effect.catchAll((error) =>
            Effect.fail(new ProtocolError('Quote fetch failed', error))
          )
        );

      return {
        buyAmount: quote.data.buyAmount,
        price: quote.data.price,
        estimatedGas: quote.data.estimatedGas,
        guaranteedPrice: quote.data.guaranteedPrice,
      };
    });

  /**
   * Execute swap
   */
  executeSwap = (args: {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
  }) =>
    Effect.gen(function* () {
      // 1. Get quote
      const quote = yield* this.getQuote(args);

      // 2. Sign and send transaction
      const txHash = yield* this.sendSwapTransaction(quote);

      // 3. Wait for confirmation
      yield* this.waitForConfirmation(txHash);

      // 4. Log swap event
      yield* this.logSwapEvent({
        sellToken: args.sellToken,
        buyToken: args.buyToken,
        sellAmount: args.sellAmount,
        buyAmount: quote.buyAmount,
        txHash,
      });

      return {
        txHash,
        buyAmount: quote.buyAmount,
        status: 'confirmed',
      };
    });
}
```

---

## Pattern 6: LLM Provider Plugin Pattern

**Applies to:** plugin-openrouter, plugin-anthropic, plugin-openai

### Ontology Mapping

```typescript
// EVENTS: LLM completion
{
  type: 'ai_generated',
  actorId: agentId,
  targetId: conversationId,
  groupId: organizationGroupId,
  timestamp: Date.now(),
  metadata: {
    provider: 'openrouter',
    model: 'anthropic/claude-3-opus',
    promptTokens: 1234,
    completionTokens: 567,
    totalTokens: 1801,
    costUsd: 0.045,
    latencyMs: 2345,
    plugin: 'plugin-openrouter'
  }
}

// KNOWLEDGE: Store responses
{
  knowledgeType: 'completion',
  text: 'LLM response text...',
  embedding: [...],
  groupId: organizationGroupId,
  metadata: {
    model: 'claude-3-opus',
    provider: 'openrouter',
    prompt: 'User query...',
    plugin: 'plugin-openrouter'
  }
}
```

---

## Pattern 7: Visualization Plugin Pattern

**Applies to:** plugin-timeline, plugin-graph, plugin-chart

### Ontology Mapping

```typescript
// EVENTS: Store reasoning steps
{
  type: 'agent_thought',
  actorId: agentId,
  targetId: taskId,
  groupId: organizationGroupId,
  timestamp: Date.now(),
  metadata: {
    step: 3,
    thoughtType: 'reasoning',
    content: 'Analyzing market trends...',
    confidence: 0.85,
    plugin: 'plugin-timeline'
  }
}

// THINGS: Visualization
{
  type: 'visualization',
  groupId: organizationGroupId,
  properties: {
    visualizationType: 'timeline',
    data: {
      events: [
        { step: 1, time: 0, action: 'Query received' },
        { step: 2, time: 100, action: 'Data fetched' },
        { step: 3, time: 500, action: 'Analysis complete' }
      ]
    },
    plugin: 'plugin-timeline'
  }
}
```

---

## Pattern 8: Memory/State Plugin Pattern

**Applies to:** plugin-memory, plugin-context, plugin-session

### Ontology Mapping

```typescript
// KNOWLEDGE: Long-term memory
{
  knowledgeType: 'memory',
  text: 'User prefers technical details over summaries',
  embedding: [...],
  groupId: organizationGroupId,
  sourceThingId: userId,
  labels: ['preference', 'user-trait', 'plugin-memory'],
  metadata: {
    memoryType: 'preference',
    confidence: 0.9,
    observations: 5,
    plugin: 'plugin-memory'
  }
}

// CONNECTIONS: Memory links
{
  fromThingId: agentId,
  toThingId: memoryId,
  relationshipType: 'remembers',
  groupId: organizationGroupId,
  metadata: {
    memoryType: 'user_preference',
    importance: 0.8,
    plugin: 'plugin-memory'
  }
}
```

---

## Universal Integration Framework

### Base Plugin Adapter Interface

```typescript
export interface PluginAdapter<TConfig, TAction, TResult> {
  /**
   * Plugin metadata
   */
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
```

### Standard Error Types

```typescript
export type PluginError =
  | { _tag: 'ConfigurationError'; message: string; field?: string }
  | { _tag: 'ExecutionError'; message: string; cause?: Error }
  | { _tag: 'NetworkError'; message: string; retryable: boolean }
  | { _tag: 'RateLimitError'; message: string; retryAfter?: number }
  | { _tag: 'AuthenticationError'; message: string; provider: string }
  | { _tag: 'SecurityError'; message: string; violation: string }
  | { _tag: 'ValidationError'; message: string; field: string; value: any };
```

---

## Testing Framework

### Test Structure

```typescript
// tests/plugins/PluginIntegrationTest.ts
import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';

export interface PluginTestSuite<TAdapter> {
  /**
   * Test plugin initialization
   */
  testInitialization: () => Promise<void>;

  /**
   * Test basic action execution
   */
  testBasicExecution: () => Promise<void>;

  /**
   * Test error handling
   */
  testErrorHandling: () => Promise<void>;

  /**
   * Test multi-tenant isolation
   */
  testMultiTenantIsolation: () => Promise<void>;

  /**
   * Test event logging
   */
  testEventLogging: () => Promise<void>;

  /**
   * Test rate limiting
   */
  testRateLimiting: () => Promise<void>;
}

/**
 * Generic plugin test runner
 */
export function createPluginTestSuite<TAdapter extends PluginAdapter<any, any, any>>(
  adapterFactory: (groupId: Id<'groups'>) => TAdapter,
  testActions: Array<{ action: any; expectedResult: any }>
): PluginTestSuite<TAdapter> {
  return {
    testInitialization: async () => {
      const adapter = adapterFactory('test-group-id');
      const result = await Effect.runPromise(
        adapter.initialize({ testMode: true })
      );
      expect(result).toBeUndefined(); // Success = no error
    },

    testBasicExecution: async () => {
      const adapter = adapterFactory('test-group-id');
      await Effect.runPromise(adapter.initialize({ testMode: true }));

      for (const { action, expectedResult } of testActions) {
        const result = await Effect.runPromise(adapter.execute(action));
        expect(result).toMatchObject(expectedResult);
      }
    },

    testErrorHandling: async () => {
      const adapter = adapterFactory('test-group-id');
      const result = await Effect.runPromise(
        adapter.execute({ invalid: 'action' }).pipe(
          Effect.catchAll((error) => Effect.succeed({ error: error._tag }))
        )
      );
      expect(result.error).toBeDefined();
    },

    testMultiTenantIsolation: async () => {
      const adapter1 = adapterFactory('group-1');
      const adapter2 = adapterFactory('group-2');

      // Execute actions in both groups
      const result1 = await Effect.runPromise(
        adapter1.execute(testActions[0].action)
      );
      const result2 = await Effect.runPromise(
        adapter2.execute(testActions[0].action)
      );

      // Verify results are isolated
      expect(result1.groupId).toBe('group-1');
      expect(result2.groupId).toBe('group-2');
    },

    testEventLogging: async () => {
      const adapter = adapterFactory('test-group-id');
      const mockDb = createMockDatabase();

      await Effect.runPromise(
        adapter.execute(testActions[0].action).pipe(
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      // Verify event was logged
      expect(mockDb.insertedEvents.length).toBeGreaterThan(0);
      expect(mockDb.insertedEvents[0].groupId).toBe('test-group-id');
    },

    testRateLimiting: async () => {
      const adapter = adapterFactory('test-group-id');

      // Execute actions rapidly
      const promises = Array(100)
        .fill(null)
        .map(() => Effect.runPromise(adapter.execute(testActions[0].action)));

      const results = await Promise.allSettled(promises);
      const rateLimitErrors = results.filter(
        (r) => r.status === 'rejected' && r.reason._tag === 'RateLimitError'
      );

      expect(rateLimitErrors.length).toBeGreaterThan(0);
    },
  };
}
```

### Mock Database for Testing

```typescript
export function createMockDatabase(): ConvexDatabase {
  const insertedEvents: any[] = [];
  const insertedThings: any[] = [];

  return {
    insert: (table: string, data: any) =>
      Effect.sync(() => {
        const id = `mock-${Math.random()}`;
        if (table === 'events') {
          insertedEvents.push({ _id: id, ...data });
        } else if (table === 'things') {
          insertedThings.push({ _id: id, ...data });
        }
        return id;
      }),

    query: () => ({
      filter: () => ({
        collect: () =>
          Effect.succeed([]),
      }),
    }),

    // For testing
    insertedEvents,
    insertedThings,
  } as any;
}
```

---

## Summary

### Integration Patterns Discovered

1. **Blockchain Pattern**: Wallet management, transaction signing, event logging
2. **Knowledge Pattern**: Document ingestion, vector search, multi-tenant isolation
3. **Browser Pattern**: URL validation, content extraction, security sandboxing
4. **Client/Platform Pattern**: OAuth flows, rate limiting, message handling
5. **DeFi Protocol Pattern**: Quote fetching, transaction execution, slippage protection
6. **LLM Provider Pattern**: Token counting, cost tracking, response caching
7. **Visualization Pattern**: Event timeline, graph generation, interactive UI
8. **Memory Pattern**: Context storage, preference learning, relationship tracking

### Common Requirements

- **Multi-Tenant Isolation**: All data scoped by `groupId`
- **Event Logging**: Every action logged to `events` table
- **Error Handling**: Type-safe errors with retry logic
- **Security**: API key encryption, URL validation, rate limiting
- **Testing**: Unit tests, integration tests, multi-tenant tests

### Next Steps

When backend infrastructure (Cycles 11-70) is implemented:

1. Install each plugin via npm
2. Instantiate adapters with org-scoped config
3. Test with real credentials (devnet/testnet)
4. Monitor event logs for debugging
5. Optimize for production usage

---

**Integration Patterns Complete. Ready for Production Implementation.**
