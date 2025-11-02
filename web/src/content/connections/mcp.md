---
title: "Model Context Protocol"
description: "Universal connectivity for AI systems. Access the 6-dimension ontology, semantic search, and RAG pipelines. Native Claude Code integration."
protocol: "mcp"
category: "context"
organization: "Anthropic"
ontologyDimensions: ["Things", "Knowledge", "Events"]
createdAt: 2025-10-30T00:00:00Z
specification:
  version: "1.0"
  status: "stable"
  standards:
    - "Anthropic"
    - "JSON-RPC 2.0"
    - "Tool/Resource model"
features:
  - name: "RAG-Ready"
    description: "Built-in support for vector search and semantic retrieval"
  - name: "Vector Search"
    description: "Query the knowledge dimension using embeddings"
  - name: "Resource Access"
    description: "Expose resources (databases, APIs, files) to AI systems"
  - name: "Tool Calling"
    description: "Define tools that AI can invoke with type safety"
ontologyMapping:
  groups: "MCP resources are scoped to groups for multi-tenant isolation"
  people: "Role-based access control determines which users can access which resources"
  things: "Resources expose things from the database for AI access"
  connections: "Relationships between resources tracked as connections"
  events: "Resource access creates events for audit logging"
  knowledge: "Vector embeddings enable semantic search across knowledge"
useCases:
  - title: "AI-Native Document Search"
    description: "Semantic search across company documents, embeddings updated in real-time"
    protocols: ["mcp"]
  - title: "Context Window Optimization"
    description: "Retrieve only relevant data based on AI request context"
    protocols: ["mcp", "knowledge"]
  - title: "Claude Code Integration"
    description: "Give Claude direct access to your codebase, docs, and data"
    protocols: ["mcp"]
  - title: "RAG Pipeline Foundation"
    description: "Implement Retrieval-Augmented Generation with semantic search"
    protocols: ["mcp", "knowledge"]
examples:
  - title: "Create MCP Server with Resource Access"
    language: "typescript"
    code: |
      // Create an MCP server exposing things
      import { Server } from "@modelcontextprotocol/sdk/server/index.js";
      import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
      import { Tool, Resource } from "@modelcontextprotocol/sdk/types.js";

      const server = new Server({
        name: "one-ontology-server",
        version: "1.0.0"
      });

      // Define resource type for things
      server.setRequestHandler(ListResourcesRequest, async () => {
        const things = await ctx.db
          .query("things")
          .withIndex("by_group", q => q.eq("groupId", groupId))
          .collect();

        return {
          resources: things.map(thing => ({
            uri: `one://things/${thing._id}`,
            name: thing.name,
            description: `${thing.type}: ${thing.name}`,
            mimeType: "application/json"
          }))
        };
      });

      // Define tool for semantic search
      server.setRequestHandler(ListToolsRequest, async () => {
        return {
          tools: [
            {
              name: "semantic_search",
              description: "Search knowledge using semantic embeddings",
              inputSchema: {
                type: "object",
                properties: {
                  query: { type: "string" },
                  limit: { type: "number", default: 10 },
                  groupId: { type: "string" }
                },
                required: ["query"]
              }
            }
          ]
        };
      });

      // Implement semantic search tool
      server.setRequestHandler(CallToolRequest, async (request) => {
        if (request.params.name === "semantic_search") {
          const { query, limit, groupId } = request.params.arguments;

          // Call your embedding API
          const embedding = await getEmbedding(query);

          // Search knowledge vectors
          const results = await ctx.db
            .query("knowledge")
            .withIndex("by_embedding", q => q.eq("groupId", groupId))
            .collect()
            .then(docs => {
              // Sort by cosine similarity
              return docs
                .map(doc => ({
                  ...doc,
                  similarity: cosineSimilarity(embedding, doc.vector)
                }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
            });

          return { content: [{ type: "text", text: JSON.stringify(results) }] };
        }
      });

      const transport = new StdioServerTransport();
      await server.connect(transport);

  - title: "Semantic Search Query"
    language: "typescript"
    code: |
      // Query MCP server for semantic search
      import Anthropic from "@anthropic-ai/sdk";

      const client = new Anthropic();

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        tools: [
          {
            type: "use_mcp_tool",
            tool: "semantic_search"
          }
        ],
        messages: [
          {
            role: "user",
            content: "Find documentation about authentication patterns"
          }
        ]
      });

      // Claude will automatically use semantic_search tool
      console.log(response.content);

  - title: "Resource Access from Claude Code"
    language: "typescript"
    code: |
      // Access ONE Platform things via MCP
      const response = await mcp.resource.read({
        uri: "one://things/user_123"
      });

      const thing = JSON.parse(response.contents[0].text);
      console.log(`Loaded: ${thing.name} (${thing.type})`);

      // Create new thing
      await mcp.tool.call({
        name: "create_thing",
        arguments: {
          type: "document",
          name: "Architecture Plan",
          properties: { version: "1.0" }
        }
      });
prerequisites:
  - "Active ONE Platform instance"
  - "Knowledge vectors populated (or populated on-demand)"
  - "MCP client library installed"
  - "Authentication configured for tool access"
integrationLevel: "advanced"
standards:
  - "JSON-RPC 2.0"
  - "OpenAI Tool Format"
  - "Vector Embedding Standards"
organizations:
  - "Anthropic"
draft: false
---

## Overview

MCP (Model Context Protocol) is Anthropic's universal standard for connecting AI models to external resources. It enables AI systems to access data, tools, and knowledge securely and efficiently through a standardized protocol.

In the ONE Platform, MCP provides the bridge between your AI and the 6-dimension ontology, making all your things, connections, and knowledge accessible to Claude and other AI systems.

## Key Characteristics

### Universal Resource Access
- **Things**: Query any entity in the system
- **Knowledge**: Semantic search via embeddings
- **Connections**: Explore relationships
- **Events**: Audit trail and history

### Type-Safe Tool Calling
- Structured JSON schemas for all tools
- Automatic validation and error handling
- IDE autocompletion and documentation
- Clear input/output contracts

### Real-time Context
- Stream large results efficiently
- Handle authentication transparently
- Support caching and indexing
- Scale to millions of resources

## Protocol Architecture

```
Claude                          MCP Protocol                    ONE Platform
  │                                │                                │
  ├──→ List Resources ────────────→ [list_resources] ────────────→ Query things
  │                                │                                │
  ├──→ Read Resource ─────────────→ [read_resource] ────────────→ Fetch thing
  │                                │                                │
  ├──→ Call Tool ─────────────────→ [call_tool] ────────────────→ Execute action
  │                                │                                │
  └──← Results ←──────────────────── [results] ←────────────────── Return data
```

## Ontology Integration

MCP is the primary interface for AI access to the ontology:

### Knowledge Dimension
- **Vector Search**: Semantic search across knowledge
- **Embeddings**: Store and query by semantic meaning
- **Categories**: Organize knowledge by type or topic
- **Connections**: Link knowledge to things

### Things Dimension
- **Read-Only Access**: Browse all entities safely
- **Query Tools**: Filter, search, and explore
- **Pagination**: Handle large result sets
- **Relationships**: Traverse thing connections

### Events Dimension
- **Audit Trail**: View action history
- **Search History**: Find past events
- **System Status**: Monitor system health
- **Change Log**: Track modifications

## Security Model

MCP enforces security at multiple levels:

1. **Authentication**: Verify the client identity
2. **Authorization**: Check if client can access resource
3. **Data Filtering**: Only return scoped data
4. **Audit Logging**: Record all access
5. **Rate Limiting**: Prevent abuse

## Vector Search Deep Dive

MCP provides semantic search through vector embeddings:

```typescript
// Vector stored with knowledge
{
  _id: "knowledge_123",
  type: "documentation",
  content: "How to authenticate users",
  embedding: [0.1, -0.2, 0.5, ...], // Vector (768 or 1536 dims)
  groupId: "org_abc",
  metadata: { topic: "auth" }
}

// Search by semantic similarity
query: "user authentication methods"
query_embedding: [0.11, -0.19, 0.52, ...]

// Results ranked by cosine similarity
```

## Use in Claude Code

MCP provides direct access to your data when working in Claude Code:

```typescript
// Automatically available in Claude Code
const doc = await mcp.resource.read({
  uri: "one://knowledge/doc_123"
});

const results = await mcp.tool.call({
  name: "semantic_search",
  arguments: { query: "authentication" }
});
```

## Performance Optimization

MCP includes several performance features:

- **Indexing**: Vector indexes for fast similarity search
- **Caching**: Cache frequently accessed resources
- **Pagination**: Handle large result sets
- **Streaming**: Stream large responses efficiently
- **Batching**: Combine multiple requests

## Comparison with Other Protocols

| Aspect | MCP | ACP | A2A |
|--------|-----|-----|-----|
| **Primary Use** | Resource access | Agent messaging | Task coordination |
| **AI Integration** | Native | Via agents | Via agents |
| **Query/Search** | Full semantic | Message-based | Task-based |
| **Real-time** | Streaming | Async queue | Sync & async |

## Getting Started

1. Set up MCP server with ONE Platform resources
2. Connect Claude or AI client to MCP server
3. Test resource access and tools
4. Implement semantic search on knowledge
5. Scale to production with caching and indexing

## Related Resources

- **Anthropic MCP**: [Official Documentation](https://modelcontextprotocol.io)
- **ONE MCP Server**: [GitHub Repository](https://github.com/one-ie/one-mcp)
- **Claude Code Integration**: [Using MCP in Code](https://claude.com/claude-code)
- **Vector Embedding Guide**: [Best Practices](https://one.ie/knowledge/vectors.md)
