# RAG Service - Complete Implementation Guide

**Status:** ✅ Cycle 6 Complete - Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-11-22

---

## Overview

The RAG (Retrieval-Augmented Generation) Service implements a complete pipeline for AI clone interactions with:

1. **RETRIEVAL** - Semantic search for relevant knowledge chunks from creator's content
2. **AUGMENTATION** - Inject retrieved context into LLM prompts
3. **GENERATION** - Generate responses using OpenAI, Anthropic, or OpenRouter

---

## Architecture

```
User Query
    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: RETRIEVAL (queries/rag-retrieve.ts)               │
│  - Vector similarity search (semantic)                      │
│  - Hybrid search (semantic + keyword)                       │
│  - Reranking for improved relevance                         │
│  - Returns top-K chunks with scores                         │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: AUGMENTATION (clone-system-prompts.ts)            │
│  - Format context chunks                                    │
│  - Inject into system prompt                                │
│  - Add conversation history                                 │
│  - Apply personality settings                               │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: GENERATION (RAGService.ts)                         │
│  - Call LLM API (OpenAI/Anthropic/OpenRouter)              │
│  - Stream or batch response                                 │
│  - Track token usage                                        │
│  - Extract citations                                        │
└─────────────────────────────────────────────────────────────┘
    ↓
Response + Citations
```

---

## File Structure

```
web/src/lib/
├── services/
│   ├── RAGService.ts              # Main RAG pipeline orchestration
│   └── RAG-README.md              # This file
├── ai/
│   └── prompts/
│       └── clone-system-prompts.ts # System prompt templates

backend/convex/queries/
└── rag-retrieve.ts                # Retrieval queries (semantic + hybrid)
```

---

## Usage Examples

### Basic Usage

```typescript
import { createOpenAIRAG } from '@/lib/services/RAGService';
import { useConvex } from 'convex/react';

function MyComponent() {
  const convex = useConvex();

  const handleQuery = async () => {
    // Create RAG service
    const rag = createOpenAIRAG(convex, {
      topK: 5,              // Retrieve top 5 chunks
      minScore: 0.3,        // Minimum relevance score
      temperature: 0.7,     // LLM temperature
      hybridSearch: true,   // Use semantic + keyword search
    });

    // Execute RAG pipeline
    const result = await rag.query({
      cloneId: 'clone-id',
      groupId: 'group-id',
      query: 'What are your thoughts on AI in education?',
      systemPromptConfig: {
        cloneName: 'Sarah AI',
        creatorName: 'Sarah Johnson',
        personality: 'professional',
        expertise: ['Education', 'Technology', 'Learning Design'],
      },
    });

    console.log('Response:', result.response);
    console.log('Citations:', result.citations);
    console.log('Metadata:', result.metadata);
  };
}
```

### Streaming Responses

```typescript
import { createClaudeRAG } from '@/lib/services/RAGService';

async function streamingExample() {
  const rag = createClaudeRAG(convex, {
    stream: true,
    model: 'claude-3-opus-20240229',
  });

  const result = await rag.queryStream({
    cloneId: 'clone-id',
    groupId: 'group-id',
    query: 'Explain quantum computing',
  });

  // Process stream
  const reader = result.stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log('Chunk:', value);
  }

  console.log('Citations:', result.citations);
}
```

### Multi-Provider Support

```typescript
import {
  createOpenAIRAG,
  createClaudeRAG,
  createOpenRouterRAG
} from '@/lib/services/RAGService';

// OpenAI GPT-4
const gpt4 = createOpenAIRAG(convex, {
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
});

// Anthropic Claude
const claude = createClaudeRAG(convex, {
  model: 'claude-3-opus-20240229',
  temperature: 0.7,
});

// OpenRouter (access to many models)
const openrouter = createOpenRouterRAG(convex, {
  model: 'anthropic/claude-3-opus',
  temperature: 0.7,
});
```

### Personality Variants

```typescript
import { getPresetConfig } from '@/lib/ai/prompts/clone-system-prompts';

// Business coach personality
const businessCoach = getPresetConfig('business_coach', 'Coach AI', 'John Smith');

// Tech educator personality
const techEducator = getPresetConfig('tech_educator', 'Tech AI', 'Jane Doe');

// Use in RAG query
const result = await rag.query({
  cloneId: 'clone-id',
  groupId: 'group-id',
  query: 'How do I scale my startup?',
  systemPromptConfig: businessCoach, // Apply personality
});
```

### Conversation History

```typescript
const result = await rag.query({
  cloneId: 'clone-id',
  groupId: 'group-id',
  query: 'Tell me more about that',
  conversationHistory: [
    { role: 'user', content: 'What is machine learning?' },
    { role: 'assistant', content: 'Machine learning is...' },
    { role: 'user', content: 'How does it work in practice?' },
    { role: 'assistant', content: 'In practice, ML systems...' },
  ],
});
```

---

## Configuration Options

### RAGConfig

```typescript
interface RAGConfig {
  provider: 'openai' | 'anthropic' | 'openrouter';
  model: string;                  // Model ID (e.g., 'gpt-4-turbo-preview')
  temperature?: number;            // 0-1, default: 0.7
  maxTokens?: number;              // Max response tokens, default: 1500
  topK?: number;                   // Number of chunks to retrieve, default: 5
  minScore?: number;               // Min relevance score (0-1), default: 0.3
  stream?: boolean;                // Enable streaming, default: false
  hybridSearch?: boolean;          // Semantic + keyword, default: false
}
```

### SystemPromptConfig

```typescript
interface SystemPromptConfig {
  cloneName: string;               // AI clone name
  creatorName: string;             // Creator's name
  personality: PersonalityType;    // 'professional' | 'casual' | 'technical' | 'friendly'
  expertise?: string[];            // Areas of expertise
  tone?: ToneType;                 // 'formal' | 'conversational' | 'enthusiastic' | 'empathetic' | 'direct'
  customInstructions?: string;     // Additional instructions
}
```

---

## Retrieval Strategies

### Semantic Search (Default)

Uses vector embeddings for semantic similarity:

```typescript
const result = await convex.query(api.queries['rag-retrieve'].retrieveContext, {
  query: "What is AI?",
  cloneId: "clone-id",
  groupId: "group-id",
  topK: 5,
  filters: {
    minScore: 0.3,
  },
});
```

**Pros:** Understands meaning, handles synonyms
**Cons:** May miss exact keyword matches

### Hybrid Search

Combines semantic + keyword search with reranking:

```typescript
const result = await convex.query(api.queries['rag-retrieve'].hybridSearch, {
  query: "machine learning algorithms",
  cloneId: "clone-id",
  groupId: "group-id",
  topK: 5,
  weights: {
    semantic: 0.7,  // 70% weight on semantic similarity
    keyword: 0.3,   // 30% weight on keyword matching
  },
});
```

**Pros:** Best of both worlds, higher accuracy
**Cons:** Slightly slower

---

## Citation Tracking

The RAG service automatically tracks which knowledge chunks were used to generate responses:

```typescript
const result = await rag.query({ ... });

// Access citations
result.citations.forEach(citation => {
  console.log(`Title: ${citation.title}`);
  console.log(`URL: ${citation.url}`);
  console.log(`Excerpt: ${citation.excerpt}`);
});

// Chunk IDs used
console.log('Chunks used:', result.chunksUsed);
```

Citations are formatted in responses:

```markdown
## Sources Referenced
1. [Introduction to AI](https://example.com/ai-intro)
   > Artificial intelligence is the simulation of human intelligence...
2. [Machine Learning Basics](https://example.com/ml-basics)
   > ML is a subset of AI that focuses on...
```

---

## Performance Metrics

Every RAG operation returns metadata:

```typescript
{
  metadata: {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    tokensUsed: 1234,              // Total tokens consumed
    retrievalScore: 0.78,          // Average relevance score
    latencyMs: 1250,               // Total pipeline latency
    chunksRetrieved: 5,            // Number of chunks found
  }
}
```

---

## Error Handling

```typescript
try {
  const result = await rag.query({ ... });
} catch (error) {
  if (error.message.includes('API_KEY')) {
    console.error('API key not configured');
  } else if (error.message.includes('quota')) {
    console.error('Usage quota exceeded');
  } else if (error.message.includes('API error')) {
    console.error('LLM provider error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Environment Variables

Required environment variables (set in `.env.local`):

```bash
# OpenAI (for GPT-4)
OPENAI_API_KEY=sk-...

# Anthropic (for Claude)
ANTHROPIC_API_KEY=sk-ant-...

# OpenRouter (multi-model access)
OPENROUTER_API_KEY=sk-or-...
```

---

## Retrieval Accuracy

The RAG service tracks retrieval quality:

- **retrievalScore**: Average relevance score (0-1) of retrieved chunks
- **High score (>0.7)**: Excellent retrieval, highly relevant context
- **Medium score (0.4-0.7)**: Good retrieval, moderately relevant
- **Low score (<0.4)**: Poor retrieval, may need knowledge base expansion

### Improving Accuracy

1. **Increase topK**: Retrieve more chunks (5 → 10)
2. **Enable hybrid search**: Combine semantic + keyword
3. **Adjust minScore**: Lower threshold for more recall
4. **Expand knowledge base**: Add more creator content
5. **Use reranking**: Improve relevance of top results

---

## Example Query Flow

**User asks:** "How do I start a podcast?"

### Step 1: Retrieval
```
Query: "How do I start a podcast?"
Retrieved 5 chunks:
1. [0.82] "Podcasting requires equipment: microphone, audio interface..."
2. [0.76] "Start by defining your podcast niche and target audience..."
3. [0.68] "Recording software options: Audacity (free), Adobe Audition..."
4. [0.54] "Distribution platforms: Apple Podcasts, Spotify, Google..."
5. [0.48] "Monetization strategies for new podcasters..."
```

### Step 2: Augmentation
```
System: You are Sarah AI, an expert in content creation...

## Relevant Knowledge

### Context 1 [Relevance: 82.0%]
Podcasting requires equipment: microphone, audio interface...
Source: Podcasting 101 Guide

### Context 2 [Relevance: 76.0%]
Start by defining your podcast niche and target audience...
Source: Creator Playbook

[...3 more contexts...]

User: How do I start a podcast?
```

### Step 3: Generation
```
LLM generates response using context:
"Starting a podcast involves several key steps. First, define your niche
and target audience [Source: Creator Playbook]. You'll need basic equipment
like a quality microphone and audio interface [Source: Podcasting 101 Guide]..."
```

### Result
```json
{
  "response": "Starting a podcast involves...",
  "citations": [
    { "title": "Podcasting 101 Guide", "url": "..." },
    { "title": "Creator Playbook", "url": "..." }
  ],
  "chunksUsed": ["chunk-1", "chunk-2", "chunk-3"],
  "metadata": {
    "provider": "openai",
    "model": "gpt-4-turbo-preview",
    "tokensUsed": 847,
    "retrievalScore": 0.66,
    "latencyMs": 1180,
    "chunksRetrieved": 5
  }
}
```

---

## Next Steps

### Cycle 7: AI Clone Chat Interface
- Implement chat UI with streaming responses
- Display citations inline
- Show retrieval quality indicators
- Real-time typing indicators

### Cycle 8: Clone Creation Wizard
- Select training sources (blog posts, courses, videos)
- Configure personality and expertise
- Test clone before publishing

### Future Enhancements
- **Query rewriting**: Improve retrieval with query expansion
- **Multi-turn context**: Better conversation memory
- **Source filtering**: Allow users to filter by content type
- **Feedback loop**: Learn from user ratings
- **Cost tracking**: Monitor LLM API costs per query

---

## Troubleshooting

### No chunks retrieved
**Problem:** `chunksRetrieved: 0`
**Solutions:**
- Check if clone has training data (connections with relationshipType: 'trained_on')
- Verify knowledge chunks exist in database
- Lower minScore threshold

### Low relevance scores
**Problem:** `retrievalScore < 0.4`
**Solutions:**
- Enable hybrid search for better accuracy
- Increase topK to retrieve more candidates
- Add more diverse content to knowledge base
- Check if query embeddings are being generated correctly

### API errors
**Problem:** "API key not configured"
**Solutions:**
- Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY
- Verify API keys are valid and have credits
- Check network connectivity to LLM providers

### Slow responses
**Problem:** `latencyMs > 3000`
**Solutions:**
- Use streaming for better perceived performance
- Reduce topK to retrieve fewer chunks
- Use faster models (gpt-3.5-turbo instead of gpt-4)
- Cache frequent queries (future enhancement)

---

## Success Metrics

**✅ Cycle 6 Objectives Met:**

- [x] Complete RAG pipeline implementation
- [x] Multi-LLM provider support (OpenAI, Anthropic, OpenRouter)
- [x] Semantic + hybrid search
- [x] Citation tracking
- [x] Streaming support
- [x] Personality variants (4 presets)
- [x] System prompt templates
- [x] Context injection formatting
- [x] Performance metrics logging
- [x] Error handling

**Retrieval Accuracy Target:** >90% (with hybrid search + reranking)

**Response Time Target:** <2 seconds (achieved with streaming)

---

**Built with Effect.ts patterns, Convex real-time infrastructure, and the 6-dimension ontology.**
