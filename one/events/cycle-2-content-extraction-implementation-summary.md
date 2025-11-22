---
title: "Cycle 2: Content Extraction & Chunking Service - Implementation Summary"
dimension: events
category: implementation_summary
tags: ai-clone, content-extraction, chunking, rag, cycle-2
scope: feature
created: 2025-11-22
version: 1.0.0
ai_context: |
  Implementation summary for AI Clone Cycle 2: Content Extraction and Chunking Service
---

# Cycle 2: Content Extraction & Chunking Service - Implementation Summary

**Date:** 2025-11-22
**Cycle:** 2 of 15 (AI Clone System)
**Status:** Complete ✅
**Agent:** agent-backend

---

## Overview

Successfully implemented intelligent content extraction and chunking service for AI clone training. The system extracts text from creator content (blog posts, courses, videos, products) and chunks it intelligently for RAG retrieval with proper sentence boundaries, token counting, and rich metadata.

---

## Deliverables

### 1. ContentExtractionService (Effect.ts)

**File:** `/home/user/one.ie/web/src/lib/services/ContentExtractionService.ts`

**Features:**
- Pure functional service using Effect.ts
- Extracts text from multiple content types
- Intelligent chunking with tiktoken (GPT-4 encoding)
- Respects sentence boundaries (no mid-sentence splits)
- Configurable chunk size and overlap
- Deduplication of identical chunks
- Rich metadata generation (keywords, code blocks, headings)
- Comprehensive error handling

**Supported Content Types:**
- `blog_post` - Blog articles and posts
- `course` - Courses and curricula
- `lesson` - Individual lessons
- `video` - Video transcripts
- `product` - Product descriptions
- `document` - Generic documents

**Chunking Algorithm:**
```
1. Split text into sentences (respecting code blocks and headings)
2. Accumulate sentences until reaching token limit (500 tokens default)
3. Save chunk when limit reached
4. Keep overlap (50 tokens default) for context continuity
5. Generate metadata (keywords, code detection, heading detection)
6. Deduplicate identical chunks
```

**Example Usage:**
```typescript
import { makeContentExtractionService } from './ContentExtractionService';
import { Effect } from 'effect';

const service = makeContentExtractionService();

const program = service.extract({
  creatorId: 'creator_123',
  groupId: 'group_456',
  contentTypes: ['blog_post', 'course', 'video'],
  chunkSize: 500,
  overlapSize: 50,
});

const result = await Effect.runPromise(program);
// { chunks: [...], totalChunks: 47, totalTokens: 23500, sourcesProcessed: 5 }
```

### 2. Knowledge Mutations (Convex)

**File:** `/home/user/one.ie/backend/convex/mutations/knowledge.ts`

**New Mutation: `extractAndChunk`**

Complete end-to-end extraction pipeline:

1. **Authenticate** - Verify user identity
2. **Validate Creator** - Ensure creator exists and belongs to group
3. **Validate Group** - Check group status and user access
4. **Fetch Content** - Query `authored` connections to find all creator content
5. **Extract Text** - Type-specific text extraction (blog, course, video, product)
6. **Chunk Content** - Sentence-based chunking with token estimation
7. **Batch Insert** - Efficiently insert chunks to `knowledge` table
8. **Link to Creator** - Create `thingKnowledge` junction records
9. **Update Status** - Track extraction status in creator properties
10. **Log Event** - Audit trail of extraction completion

**API Signature:**
```typescript
await ctx.runMutation('mutations/knowledge:extractAndChunk', {
  creatorId: creatorThingId,
  groupId: groupId,
  contentTypes: ['blog_post', 'course', 'video'], // optional
  chunkSize: 500,                                  // optional
  overlapSize: 50,                                 // optional
  maxChunks: 10000                                 // optional
});

// Returns:
{
  success: true,
  chunksCreated: 47,
  sourcesProcessed: 5,
  totalTokens: 23500,
  chunkIds: ['knowledge_1', 'knowledge_2', ...]
}
```

**Existing Mutations Enhanced:**
- `createChunks` - Batch create knowledge chunks
- `linkKnowledge` - Link chunks to AI clone
- `updateEmbedding` - Update vector embeddings
- `batchUpdateEmbeddings` - Efficient batch embedding updates
- `deleteChunk` - Remove knowledge chunk and connections

### 3. Dependencies Added

**tiktoken:**
```bash
bun add tiktoken
```

Used for accurate token counting with GPT-4 encoding model.

### 4. Test Suite

**File:** `/home/user/one.ie/web/src/lib/services/ContentExtractionService.test.ts`

**Test Coverage:**
1. ✅ Basic extraction and chunking
2. ✅ Sentence boundary preservation
3. ✅ Code block detection
4. ✅ Keyword extraction
5. ✅ Deduplication
6. ✅ Functional composition with Effect.ts

**Test Results:**
```
✅ 6 pass, 0 fail, 27 expect() calls
⚡ Performance: 2,044 tokens/second, 14 chunks/second
```

---

## Technical Implementation Details

### Chunking Strategy

**Token-Aware Chunking:**
- Uses tiktoken for precise GPT-4 token counting
- Default: 500 tokens per chunk (configurable)
- Overlap: 50 tokens for context continuity
- Respects sentence boundaries (no splits mid-sentence)

**Sentence Splitting:**
```typescript
// Respects:
- Code blocks (```...```)
- Headings (# Title)
- Sentence boundaries (. ! ?)
- Paragraph breaks (\n\n)
```

**Metadata Generation:**
```typescript
{
  sourceType: 'blog_post',
  title: 'AI Clone Basics',
  url: '/blog/ai-clone-basics',
  position: 0,              // Chunk position in document
  estimatedTokens: 487,     // Accurate token count
  hasCodeBlock: false,      // Code block presence
  hasHeading: true,         // Heading presence
  keywords: ['clones', 'training', 'content', 'voice', 'scale']
}
```

### Content Type Extraction

**Blog Posts:**
```typescript
text = `# ${title}\n\n${content || description}`;
```

**Courses/Lessons:**
```typescript
text = `# ${title}\n\n${description}\n\n${content}`;
```

**Videos:**
```typescript
text = `# ${title}\n\n${transcript || description}`;
```

**Products:**
```typescript
text = `# ${title}\n\n${description}\n\nFeatures:\n${features.join('\n')}`;
```

### Database Schema

**Knowledge Table:**
```typescript
{
  _id: Id<"knowledge">,
  knowledgeType: "chunk" | "label" | "document" | "vector_only",
  text: string,
  embedding?: number[],            // 3072-dim vector (optional)
  embeddingModel?: string,         // "text-embedding-3-large"
  sourceThingId: Id<"things">,
  groupId: Id<"groups">,          // Multi-tenant isolation
  labels?: string[],
  metadata: {
    sourceType: string,
    title: string,
    url?: string,
    position: number,
    estimatedTokens: number,
    hasCodeBlock: boolean,
    hasHeading: boolean,
    keywords: string[]
  },
  createdAt: number,
  updatedAt: number
}
```

**ThingKnowledge Junction:**
```typescript
{
  _id: Id<"thingKnowledge">,
  thingId: Id<"things">,          // Creator ID
  knowledgeId: Id<"knowledge">,   // Chunk ID
  role: "trained_on",              // Relationship type
  createdAt: number
}
```

---

## Performance Metrics

### Service Performance

**Extraction Speed:**
- 2,044 tokens/second
- 14 chunks/second
- 330ms average for 2 sources

**Token Efficiency:**
- Average chunk size: 139 tokens (well within 500 limit)
- Overlap efficiency: 50 tokens preserved for context
- No duplicate chunks (100% deduplication accuracy)

### Database Performance

**Batch Operations:**
- Efficient batch insert for chunks
- Single-transaction junction table links
- Atomic property updates for status tracking

**Query Optimization:**
- Uses indexed connections (`from_type`)
- Group-scoped queries (`by_group`)
- Type filtering for content selection

---

## Integration with AI Clone System

### Cycle Dependencies

**Upstream (Required):**
- ✅ Cycle 1: AI Clone Schema (provides tables)

**Downstream (Enables):**
- Cycle 3: Embeddings & Vector Search (chunks ready for embedding)
- Cycle 6: RAG Pipeline (chunks ready for retrieval)
- Cycle 14: Clone Analytics (knowledge gaps detection)

### Usage Flow

```
1. Creator adds content (blog, course, video)
   ↓
2. System creates 'authored' connections
   ↓
3. extractAndChunk mutation triggered
   ↓
4. ContentExtractionService processes content
   ↓
5. Chunks stored in knowledge table
   ↓
6. ThingKnowledge links created
   ↓
7. Status tracked in creator.properties
   ↓
8. Event logged for audit trail
   ↓
9. [Cycle 3] Embeddings generated
   ↓
10. [Cycle 6] RAG retrieval enabled
```

---

## Error Handling

### Service Errors

**ContentNotFoundError:**
```typescript
throw new ContentNotFoundError(creatorId);
// No content found for creator
```

**ChunkingFailedError:**
```typescript
throw new ChunkingFailedError(message, sourceId, cause);
// Chunking failed for specific source
```

**ExtractionError:**
```typescript
throw new ExtractionError(message, cause);
// General extraction failure
```

### Mutation Errors

**Authentication:**
```
"Not authenticated" - User not logged in
"User not found" - Person record missing
```

**Authorization:**
```
"Not authorized for this group" - Cross-group access attempt
"Creator not in this group" - Invalid group association
```

**Validation:**
```
"Creator not found" - Invalid creator ID
"Group not found" - Invalid group ID
"Group is not active" - Suspended/archived group
"No content found for creator" - No authored connections
"No substantial content found" - All content < 50 chars
```

---

## File Locations

```
/home/user/one.ie/
├── web/src/lib/services/
│   ├── ContentExtractionService.ts        # Service implementation
│   └── ContentExtractionService.test.ts   # Test suite
├── backend/convex/mutations/
│   └── knowledge.ts                        # extractAndChunk mutation
└── one/events/
    └── cycle-2-content-extraction-implementation-summary.md (this file)
```

---

## Next Steps (Cycle 3)

**Embeddings & Vector Search:**
1. Create `EmbeddingService` using OpenAI API
2. Generate embeddings for knowledge chunks (batch processing)
3. Store embeddings in knowledge table
4. Implement semantic search using Convex vector search
5. Track embedding costs and usage

**Dependencies:**
- OpenAI API key (@ai-sdk/openai already installed)
- Batch processing for efficiency (100 chunks at once)
- Cost tracking in events

---

## Lessons Learned

### Technical Challenges

**Challenge 1: Effect.ts Context Binding**
- Issue: `this` undefined in Effect.gen generator functions
- Solution: Capture `this` as `const self = this` before generator
- Pattern: Always use `self` inside generators for class methods

**Challenge 2: Automatic Semicolon Insertion**
- Issue: `return\nEffect.gen(...)` treated as `return;`
- Solution: Keep return statement on same line: `return Effect.gen(...)`
- Lesson: JavaScript ASI gotchas with multi-line returns

**Challenge 3: Tiktoken Integration**
- Issue: Native module compilation in Bun
- Solution: Works perfectly with `bun add tiktoken`
- Note: Encoder.free() required to prevent memory leaks

### Design Decisions

**Decision 1: Token Estimation vs Exact Counting**
- Backend mutation: Uses estimation (~4 chars/token) for speed
- Frontend service: Uses tiktoken for accuracy
- Rationale: Balance speed (backend) with precision (service)

**Decision 2: Chunk Size Configuration**
- Default: 500 tokens (GPT-4 context window friendly)
- Overlap: 50 tokens (10% for context continuity)
- Rationale: Balance retrieval precision and context preservation

**Decision 3: Metadata Richness**
- Included: keywords, code blocks, headings, position, title, URL
- Rationale: Enable advanced RAG features (citation, filtering, ranking)

### Best Practices Reinforced

1. **Pure Business Logic in Services**
   - Effect.ts for validation, transformation, composition
   - Mutations as thin wrappers calling database

2. **Multi-Tenant Isolation**
   - Always filter by groupId
   - Validate group access before operations
   - Track usage at group level

3. **Event Logging**
   - Log extraction completion
   - Include rich metadata (chunks, sources, tokens)
   - Enable audit trail and analytics

4. **Test-Driven Development**
   - 6 comprehensive tests
   - Real service execution (no mocks)
   - Performance benchmarking included

---

## Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Service Implementation | Complete | ✅ Complete | PASS |
| Mutation Implementation | Complete | ✅ Complete | PASS |
| Test Coverage | 6 tests | ✅ 6 tests | PASS |
| Test Pass Rate | 100% | ✅ 100% (6/6) | PASS |
| Performance | > 1000 tokens/s | ✅ 2,044 tokens/s | PASS |
| Dependencies Installed | tiktoken | ✅ tiktoken@1.0.22 | PASS |

---

## Summary

Cycle 2 successfully delivered intelligent content extraction and chunking for AI clone training. The system:

- ✅ Extracts text from 6 content types
- ✅ Chunks intelligently with sentence boundaries
- ✅ Uses tiktoken for accurate token counting
- ✅ Generates rich metadata for RAG
- ✅ Deduplicates identical chunks
- ✅ Tracks extraction status
- ✅ Logs events for audit trail
- ✅ Supports batch operations
- ✅ Multi-tenant isolation enforced
- ✅ All tests passing (6/6)

**Performance:** 2,044 tokens/second, 14 chunks/second
**Quality:** 100% test pass rate, zero duplicates
**Readiness:** Ready for Cycle 3 (Embeddings & Vector Search)

---

**Built with Effect.ts, Convex, and tiktoken for production-ready content chunking.**
