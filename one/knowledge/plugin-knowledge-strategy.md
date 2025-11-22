---
title: ElizaOS Plugin Knowledge Strategy
dimension: knowledge
category: rag-strategy
tags: elizaos, plugins, embeddings, rag, semantic-search, knowledge
related_dimensions: things, connections, events, groups, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: CYCLE-005
ai_context: |
  This document is part of the knowledge dimension in the rag-strategy category.
  Location: one/knowledge/plugin-knowledge-strategy.md
  Purpose: Define RAG and embedding strategy for ElizaOS plugin ecosystem
  Related dimensions: things, connections, events, groups, people
  For AI agents: Read this to understand plugin knowledge architecture.
---

# ElizaOS Plugin Knowledge Strategy

**Purpose:** Define how plugin documentation, capabilities, and examples are embedded and searched for AI-powered discovery.

**Goal:** Enable semantic search like "Find plugins for token swaps on Solana" without manual tagging.

---

## Overview

The knowledge dimension powers AI-driven plugin discovery through:
1. **README embeddings** - Semantic search for plugin descriptions
2. **Capability vectors** - "What can this plugin do?"
3. **Compatibility embeddings** - "Does this work with ElizaOS v1.0?"
4. **Example embeddings** - "Show me how to use plugin-solana"
5. **Q&A knowledge base** - RAG: "How do I configure API keys?"

**Key Insight:** Embeddings enable natural language plugin discovery without rigid categorization.

---

## Knowledge Table Schema

```typescript
knowledge: defineTable({
  knowledgeType: v.union(
    v.literal("label"),     // Category tag (no embedding)
    v.literal("chunk")      // Text chunk with embedding
  ),
  text: v.string(),         // Original text
  embedding: v.optional(v.array(v.number())), // 3072-dim vector (for chunks)
  sourceThingId: v.optional(v.id("things")), // Link to plugin/thing
  labels: v.optional(v.array(v.string())),   // Associated tags
  metadata: v.any(),        // Additional context
  createdAt: v.number()
})
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 3072,        // OpenAI text-embedding-3-large
    filterFields: ["knowledgeType", "sourceThingId"]
  })
  .index("by_source", ["sourceThingId"])
  .index("by_type", ["knowledgeType"])
```

---

## 5 Knowledge Strategies for Plugins

### 1. README Embeddings (Semantic Discovery)

**Purpose:** Enable "Find plugins for X" queries.

**Process:**
1. Fetch plugin README from GitHub
2. Split into chunks (500-1000 tokens each)
3. Generate embeddings using OpenAI text-embedding-3-large
4. Store chunks in knowledge table

**Example:**

```typescript
// Plugin README chunk
{
  knowledgeType: "chunk",
  text: `@elizaos/plugin-solana enables blockchain operations on Solana network.
         Features: Token swaps, balance queries, wallet management, NFT operations.
         Use cases: DeFi trading, token analytics, automated market making.`,
  embedding: [0.123, -0.456, 0.789, ...], // 3072 dimensions
  sourceThingId: "plugin_solana_xyz",
  labels: ["blockchain", "solana", "defi", "token_swap"],
  metadata: {
    chunk_index: 0,
    total_chunks: 5,
    github_url: "https://github.com/elizaos/plugin-solana",
    npm_package: "@elizaos/plugin-solana"
  },
  createdAt: Date.now()
}
```

**Search Query:**
```typescript
// User asks: "Find plugins for token swaps on Solana"
const queryEmbedding = await openai.embeddings.create({
  model: "text-embedding-3-large",
  input: "Find plugins for token swaps on Solana"
});

const results = await ctx.db.query("knowledge")
  .withIndex("by_embedding", q =>
    q.search("embedding", queryEmbedding.data[0].embedding)
  )
  .filter(q => q.eq(q.field("knowledgeType"), "chunk"))
  .take(10);

// Returns: plugin-solana, plugin-0x, plugin-jupiter (ranked by similarity)
```

**Chunk Size Strategy:**
- **Short chunks (250-500 tokens):** Better for precise matching
- **Medium chunks (500-1000 tokens):** Balance of context and precision
- **Long chunks (1000-2000 tokens):** Better for broad understanding

**Recommendation:** Medium chunks (500-1000 tokens) with 50 token overlap.

---

### 2. Capability Vectors (What Can This Plugin Do?)

**Purpose:** Answer "What can plugin X do?" with semantic understanding.

**Process:**
1. Extract plugin capabilities from code/docs
2. Create structured capability descriptions
3. Generate embeddings for each capability
4. Link to plugin via sourceThingId

**Example:**

```typescript
// Capability: Token Swap
{
  knowledgeType: "chunk",
  text: `Capability: Token Swap
         Description: Swap one Solana token for another using Jupiter aggregator.
         Inputs: fromToken (mint address), toToken (mint address), amount (number), slippage (percent).
         Outputs: Transaction hash, amount received, fees paid.
         Use cases: Automated trading, portfolio rebalancing, liquidity provision.`,
  embedding: [0.234, -0.567, 0.890, ...],
  sourceThingId: "plugin_solana_xyz",
  labels: ["capability", "token_swap", "trading"],
  metadata: {
    capability_type: "action",
    action_name: "swapTokens",
    parameters: ["fromToken", "toToken", "amount", "slippage"],
    returns: ["tx_hash", "amount_received"]
  },
  createdAt: Date.now()
}
```

**Search Query:**
```typescript
// User asks: "Can any plugin rebalance my crypto portfolio?"
const results = await semanticSearch(
  "Can any plugin rebalance my crypto portfolio?",
  { filterLabels: ["capability"] }
);
// Returns: plugin-solana (swapTokens capability)
```

---

### 3. Compatibility Embeddings (Version Compatibility)

**Purpose:** Answer "Does this plugin work with ElizaOS v1.0?" or "What's the minimum Node.js version?"

**Process:**
1. Extract compatibility requirements from package.json
2. Create compatibility description
3. Generate embedding
4. Link to plugin

**Example:**

```typescript
// Compatibility info
{
  knowledgeType: "chunk",
  text: `@elizaos/plugin-solana compatibility requirements:
         ElizaOS version: >=1.0.0, <2.0.0
         Node.js version: >=18.0.0
         Dependencies: @solana/web3.js >=1.87.0, @elizaos/plugin-wallet >=2.0.0
         Operating systems: Linux, macOS, Windows
         Network requirements: Outbound HTTPS to Solana RPC endpoints`,
  embedding: [0.345, -0.678, 0.901, ...],
  sourceThingId: "plugin_solana_xyz",
  labels: ["compatibility", "requirements"],
  metadata: {
    elizaos_version: ">=1.0.0 <2.0.0",
    node_version: ">=18.0.0",
    dependencies: {
      "@solana/web3.js": ">=1.87.0",
      "@elizaos/plugin-wallet": ">=2.0.0"
    }
  },
  createdAt: Date.now()
}
```

**Search Query:**
```typescript
// User asks: "Does plugin-solana work with Node.js 16?"
const results = await semanticSearch(
  "Does plugin-solana work with Node.js 16?",
  { filterSourceThing: "plugin_solana_xyz", filterLabels: ["compatibility"] }
);
// Returns: Compatibility info showing Node.js >=18.0.0 required
```

---

### 4. Example Embeddings (How to Use)

**Purpose:** Enable example-based discovery: "Show me how to swap SOL for USDC"

**Process:**
1. Extract code examples from README
2. Add context and explanation
3. Generate embedding
4. Link to plugin

**Example:**

```typescript
// Code example
{
  knowledgeType: "chunk",
  text: `Example: Swap 1 SOL for USDC

         Code:
         const result = await runtime.executeAction({
           plugin: "@elizaos/plugin-solana",
           action: "swapTokens",
           params: {
             fromToken: "So11111111111111111111111111111111111111112",
             toToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
             amount: 1,
             slippage: 0.5
           }
         });

         Explanation: Swaps 1 SOL (native token) for USDC (stablecoin) with 0.5% slippage tolerance.
         Expected output: { tx_hash: "abc123...", amount_received: 143.21 }`,
  embedding: [0.456, -0.789, 0.012, ...],
  sourceThingId: "plugin_solana_xyz",
  labels: ["example", "token_swap", "solana", "usdc"],
  metadata: {
    example_type: "code",
    language: "typescript",
    action_name: "swapTokens",
    from_token: "SOL",
    to_token: "USDC"
  },
  createdAt: Date.now()
}
```

**Search Query:**
```typescript
// User asks: "Show me an example of swapping SOL for USDC"
const results = await semanticSearch(
  "Show me an example of swapping SOL for USDC",
  { filterLabels: ["example"] }
);
// Returns: Code example with explanation
```

---

### 5. Q&A Knowledge Base (Troubleshooting & Help)

**Purpose:** Answer common questions: "How do I configure Solana RPC URL?"

**Process:**
1. Create Q&A pairs from documentation
2. Generate embeddings for both questions and answers
3. Store as knowledge chunks
4. Link to plugin

**Example:**

```typescript
// Q&A pair
{
  knowledgeType: "chunk",
  text: `Question: How do I configure the Solana RPC URL for plugin-solana?

         Answer: Configure the RPC URL in the plugin settings:
         1. Go to Plugins → Installed Plugins
         2. Click on @elizaos/plugin-solana
         3. Edit "RPC URL" field
         4. Enter your RPC endpoint (e.g., https://api.mainnet-beta.solana.com)
         5. Select network: mainnet-beta, devnet, or testnet
         6. Save configuration

         Common RPC endpoints:
         - Mainnet: https://api.mainnet-beta.solana.com (free, rate-limited)
         - Devnet: https://api.devnet.solana.com (free, for testing)
         - Testnet: https://api.testnet.solana.com (free, for testing)
         - Custom: Use your own RPC provider (Helius, QuickNode, etc.)`,
  embedding: [0.567, -0.890, 0.123, ...],
  sourceThingId: "plugin_solana_xyz",
  labels: ["qa", "configuration", "rpc", "troubleshooting"],
  metadata: {
    question: "How do I configure the Solana RPC URL?",
    topic: "configuration",
    difficulty: "beginner"
  },
  createdAt: Date.now()
}
```

**Search Query:**
```typescript
// User asks: "How do I change RPC endpoint?"
const results = await semanticSearch(
  "How do I change RPC endpoint?",
  { filterSourceThing: "plugin_solana_xyz", filterLabels: ["qa"] }
);
// Returns: Step-by-step configuration guide
```

---

## Label Taxonomy (Categorical Filtering)

**Purpose:** Enable filtering before semantic search for faster results.

**Label Categories:**

### 1. Plugin Type Labels
- `blockchain` - Blockchain integrations
- `knowledge` - RAG and memory systems
- `client` - Platform integrations (Discord, Twitter)
- `browser` - Web automation
- `llm` - LLM providers
- `adapter` - Storage and database adapters
- `service` - Utility services

### 2. Blockchain Network Labels
- `solana` - Solana network
- `ethereum` - Ethereum network
- `polygon` - Polygon network
- `base` - Base network
- `sui` - Sui network

### 3. Capability Labels
- `token_swap` - Token exchange
- `nft_operations` - NFT minting/trading
- `wallet_management` - Wallet operations
- `price_oracle` - Price feeds
- `lending` - DeFi lending protocols

### 4. Content Type Labels
- `readme` - Plugin README
- `capability` - Capability description
- `compatibility` - Compatibility info
- `example` - Code example
- `qa` - Q&A pair

### 5. Difficulty Labels
- `beginner` - Easy to use
- `intermediate` - Requires configuration
- `advanced` - Complex setup

**Example Usage:**
```typescript
// Filter by labels before semantic search
const blockchainPlugins = await ctx.db.query("knowledge")
  .filter(q =>
    q.eq(q.field("knowledgeType"), "chunk") &&
    q.contains(q.field("labels"), "blockchain")
  )
  .collect();

// Then perform semantic search on filtered results
const results = await vectorSearch(queryEmbedding, blockchainPlugins);
```

---

## Embedding Generation Pipeline

### Step-by-Step Process

**1. Plugin Discovery**
```typescript
// When plugin is discovered in registry
const plugin = await fetchPluginFromRegistry("@elizaos/plugin-solana");
```

**2. Fetch Documentation**
```typescript
// Fetch README from GitHub
const readme = await fetch(
  `https://raw.githubusercontent.com/elizaos/plugins/main/solana/README.md`
).then(r => r.text());
```

**3. Chunk Text**
```typescript
// Split README into chunks (500-1000 tokens)
const chunks = splitIntoChunks(readme, {
  maxTokens: 750,
  overlap: 50
});
```

**4. Generate Embeddings**
```typescript
// Generate embeddings for all chunks
const embeddings = await Promise.all(
  chunks.map(chunk =>
    openai.embeddings.create({
      model: "text-embedding-3-large",
      input: chunk,
      dimensions: 3072
    })
  )
);
```

**5. Store in Knowledge Table**
```typescript
// Store chunks with embeddings
await Promise.all(
  chunks.map((chunk, i) =>
    ctx.db.insert("knowledge", {
      knowledgeType: "chunk",
      text: chunk,
      embedding: embeddings[i].data[0].embedding,
      sourceThingId: plugin._id,
      labels: extractLabels(chunk),
      metadata: {
        chunk_index: i,
        total_chunks: chunks.length
      },
      createdAt: Date.now()
    })
  )
);
```

---

## Search Implementation

### Semantic Search Function

```typescript
async function searchPlugins(query: string, filters?: {
  pluginType?: string;
  blockchain?: string;
  difficulty?: string;
}): Promise<PluginSearchResult[]> {
  // 1. Generate query embedding
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
    dimensions: 3072
  });

  // 2. Vector search with filters
  let results = ctx.db.query("knowledge")
    .withIndex("by_embedding", q =>
      q.search("embedding", queryEmbedding.data[0].embedding)
    )
    .filter(q => q.eq(q.field("knowledgeType"), "chunk"));

  // 3. Apply label filters
  if (filters.pluginType) {
    results = results.filter(q =>
      q.contains(q.field("labels"), filters.pluginType)
    );
  }

  // 4. Take top 10 results
  const knowledgeChunks = await results.take(10);

  // 5. Group by plugin and rank
  const pluginResults = groupByPlugin(knowledgeChunks);

  return pluginResults;
}
```

**Example Queries:**
```typescript
// "Find blockchain plugins"
await searchPlugins("Find blockchain plugins", {
  pluginType: "blockchain"
});

// "Show me Solana token swap examples"
await searchPlugins("Show me Solana token swap examples", {
  blockchain: "solana"
});

// "How do I configure Discord bot?"
await searchPlugins("How do I configure Discord bot?", {
  pluginType: "client"
});
```

---

## Update Strategy

**When to regenerate embeddings:**

1. **Plugin version update** - Regenerate if README changes significantly
2. **New examples added** - Add new example embeddings
3. **Documentation improvements** - Update Q&A embeddings
4. **Compatibility changes** - Update compatibility embeddings

**Update frequency:**
- **Daily:** Sync new plugins from registry
- **Weekly:** Update embeddings for modified plugins
- **Monthly:** Full re-embedding of all plugins (drift correction)

---

## Performance Optimization

### Caching Strategy
```typescript
// Cache frequently searched queries
const cache = new Map<string, PluginSearchResult[]>();

async function cachedSearch(query: string) {
  const cacheKey = query.toLowerCase();

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const results = await searchPlugins(query);
  cache.set(cacheKey, results);

  return results;
}
```

### Index Optimization
```typescript
// Use composite indexes for filtered searches
.vectorIndex("by_embedding_blockchain", {
  vectorField: "embedding",
  dimensions: 3072,
  filterFields: ["knowledgeType", "labels", "sourceThingId"]
})
```

---

## Quality Metrics

**Track search quality:**
- **Click-through rate** - % of users clicking top result
- **Relevance score** - User rating of search results (1-5 stars)
- **Query abandonment** - % of searches with no click
- **Time to install** - Time from search to plugin installation

**Goal:** 80%+ relevance score on top-3 results.

---

## Future Enhancements

1. **Multi-modal embeddings** - Include screenshots, diagrams
2. **User feedback loop** - Improve embeddings based on user clicks
3. **Personalized search** - Rank based on user's previous installations
4. **Auto-categorization** - Use embeddings to auto-tag plugins
5. **Similarity recommendations** - "Users who installed X also installed Y"

---

**Built with the 6-dimension ontology. AI-powered plugin discovery through embeddings.**
