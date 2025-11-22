# Component Semantic Search - CYCLE 6

**AI-powered component discovery using natural language queries**

## Overview

This system enables developers to find components using natural language queries like "pricing table" or "dark mode toggle", powered by OpenAI embeddings and Convex vector search.

## Features

- **Natural Language Search** - Find components using plain English
- **AI-Powered Matching** - OpenAI text-embedding-3-large (3072D)
- **Real-Time Search** - Instant results via Convex vector database
- **Category Filtering** - Filter by component category (ui, dashboard, ai, etc.)
- **Score Ranking** - Results sorted by semantic similarity
- **Copy Import Path** - One-click copy of component import

## Architecture

```
┌─────────────────┐
│  User Query     │  "pricing table"
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│  Generate Embedding     │  OpenAI text-embedding-3-large
│  (3072 dimensions)      │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  Vector Search          │  Convex knowledge table
│  (cosine similarity)    │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  Rank & Filter          │  Score threshold (0.5+)
│  Top 5 Results          │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  Display Results        │  ComponentSearch UI
└─────────────────────────┘
```

## Quick Start

### 1. Set Environment Variables

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-...
PUBLIC_CONVEX_URL=https://....convex.cloud
```

### 2. Generate Embeddings

```bash
# Extract component metadata and generate embeddings
bun run scripts/generate-component-embeddings.ts
```

This creates `component-embeddings.json` with:
- 456 component files scanned
- Metadata extracted (name, path, description, props)
- 3072D embeddings generated for each

### 3. Upload to Convex

```bash
# Store embeddings in Convex knowledge table
bun run scripts/upload-embeddings-to-convex.ts
```

This uploads embeddings to the `knowledge` table with:
- `knowledgeType: "chunk"`
- `metadata.type: "component"`
- Vector index enabled for search

### 4. Test Search

```bash
# Test with sample queries
bun run scripts/test-component-search.ts

# Test with custom query
bun run scripts/test-component-search.ts "pricing table"
```

### 5. Use in UI

Visit `/components/search` or integrate into your app:

```tsx
import { ComponentSearch } from '@/components/ComponentSearch';

<ComponentSearch
  initialQuery=""
  limit={5}
  showSamples={true}
  client:load
/>
```

## File Structure

```
web/
├── scripts/
│   ├── generate-component-embeddings.ts  # Generate embeddings
│   ├── upload-embeddings-to-convex.ts    # Upload to Convex
│   └── test-component-search.ts          # Test search
├── src/
│   ├── components/
│   │   └── ComponentSearch.tsx           # Search UI component
│   ├── lib/
│   │   └── services/
│   │       └── component-search.ts       # Search service
│   └── pages/
│       ├── components/
│       │   └── search.astro              # Demo page
│       └── api/
│           └── components/
│               └── search.ts             # API endpoint
└── component-embeddings.json             # Generated embeddings
```

## How It Works

### 1. Component Scanning

The script scans `/web/src/components/` recursively and extracts:

- **File path** - Full and relative paths
- **Component name** - Extracted from filename
- **Category** - Inferred from directory structure (ui, dashboard, ai, shop)
- **Description** - From JSDoc comments or inferred from name
- **Props** - Extracted from TypeScript interfaces
- **Imports** - Component dependencies
- **Exports** - Exported functions/components

### 2. Searchable Text Generation

For each component, create searchable text:

```
Component: PricingTable
Category: ui
Description: A reusable pricing table UI component
Path: ui/pricing-table.tsx
Props: variant, features, price, currency
Uses: @/components/ui/card, @/components/ui/button
```

### 3. Embedding Generation

Using OpenAI `text-embedding-3-large`:

```typescript
const embedding = await embed({
  model: openai.embedding('text-embedding-3-large'),
  value: searchableText
});
// Returns: number[] (3072 dimensions)
```

### 4. Storage in Convex

Store in `knowledge` table:

```typescript
await provider.knowledge.create({
  knowledgeType: "chunk",
  text: searchableText,
  embedding: embedding,
  embeddingModel: "text-embedding-3-large",
  embeddingDim: 3072,
  metadata: {
    type: "component",
    name: "PricingTable",
    category: "ui",
    filePath: "...",
    ...
  },
  labels: ["ui", "component", "PricingTable"]
});
```

### 5. Vector Search

When user searches:

1. Generate embedding for query: `"pricing table"` → `[0.234, -0.123, ...]`
2. Search Convex with vector similarity
3. Filter by `metadata.type === "component"`
4. Apply category filter if specified
5. Filter by score threshold (>= 0.5)
6. Sort by score descending
7. Return top N results

## API Reference

### Component Search Service

```typescript
import { searchComponentsWithProvider } from '@/lib/services/component-search';

// With Effect.ts
const searchEffect = searchComponentsWithProvider(provider, "pricing table", {
  limit: 5,
  category: "ui",
  minScore: 0.5
});

const results = await Effect.runPromise(searchEffect);
```

### API Endpoint

```bash
POST /api/components/search
Content-Type: application/json

{
  "query": "pricing table",
  "limit": 5,
  "category": "ui"  // optional
}
```

Response:

```json
{
  "results": [
    {
      "id": "k1...",
      "name": "PricingTable",
      "path": "src/components/ui/pricing-table.tsx",
      "relativePath": "ui/pricing-table.tsx",
      "description": "A reusable pricing table UI component",
      "category": "ui",
      "props": ["variant", "features", "price"],
      "score": 0.92,
      "metadata": { ... }
    }
  ],
  "query": "pricing table",
  "count": 1
}
```

### React Component

```tsx
<ComponentSearch
  initialQuery=""        // Pre-filled query
  limit={5}             // Max results
  showSamples={true}    // Show sample queries
  client:load           // Astro hydration directive
/>
```

## Sample Queries

The system includes 10 predefined sample queries for testing:

1. **pricing table** - Pricing components
2. **dark mode toggle** - Theme switchers
3. **user avatar** - Avatar components
4. **navigation menu** - Navigation components
5. **search input** - Search inputs
6. **analytics chart** - Data visualization
7. **product card** - E-commerce cards
8. **login form** - Authentication forms
9. **file upload** - Upload components
10. **notification badge** - Notification UI

## Configuration

### Environment Variables

```bash
# Required for embedding generation
OPENAI_API_KEY=sk-...

# Required for Convex connection
PUBLIC_CONVEX_URL=https://....convex.cloud
CONVEX_URL=https://....convex.cloud  # Alternative
```

### Embedding Settings

```typescript
const EMBEDDING_MODEL = "text-embedding-3-large";
const EMBEDDING_DIM = 3072;
const BATCH_SIZE = 10;  // Process 10 components at once
```

### Search Settings

```typescript
const DEFAULT_LIMIT = 5;      // Top 5 results
const MIN_SCORE = 0.5;        // 50% similarity threshold
const SEARCH_MULTIPLIER = 2;  // Fetch 2x results for filtering
```

## Ontology Integration

This system follows the **6-dimension ontology** (CYCLE 6):

### Knowledge Dimension

- **Type:** `knowledge` table with vector index
- **knowledgeType:** `"chunk"` for component embeddings
- **metadata.type:** `"component"` to identify component knowledge
- **labels:** Category tags for filtering

### Thing Dimension (Future)

Components can be represented as **things**:

```typescript
{
  type: "component",
  name: "PricingTable",
  properties: {
    filePath: "...",
    category: "ui",
    props: [...]
  },
  status: "active"
}
```

Then link via `thingKnowledge` junction table.

## Performance

- **Generation Time:** ~2-3 seconds per component
- **Batch Processing:** 10 components per batch
- **Total Generation:** 456 components ≈ 2-3 minutes
- **Search Latency:** <200ms for top 5 results
- **Vector Dimensions:** 3072D (high accuracy)

## Troubleshooting

### "OPENAI_API_KEY not configured"

Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

### "CONVEX_URL not configured"

Add to `.env.local`:
```bash
PUBLIC_CONVEX_URL=https://....convex.cloud
```

### No results found

1. Check embeddings are uploaded: `bun run scripts/test-component-search.ts`
2. Lower minScore threshold in search options
3. Try different queries (use sample queries)
4. Regenerate embeddings if components changed

### Search too slow

1. Reduce `limit` (default: 5)
2. Add category filter to narrow search
3. Increase `minScore` to filter low-quality results

## Future Enhancements

- [ ] **Component Preview** - Show component screenshot/demo
- [ ] **Usage Examples** - Display code examples for each component
- [ ] **Dependency Graph** - Show component dependencies
- [ ] **Version History** - Track component changes over time
- [ ] **Auto-Regeneration** - Regenerate embeddings on component changes
- [ ] **Multi-Language** - Support search in multiple languages
- [ ] **Category Suggestions** - Auto-suggest categories based on query
- [ ] **Related Components** - Show similar components

## Integration with Ontology

### Mapping to 6 Dimensions

1. **Groups** - Components scoped to organization (future)
2. **People** - Component authors/maintainers (future)
3. **Things** - Components as entities with metadata
4. **Connections** - Component dependencies and usage
5. **Events** - Component creation, updates, usage events
6. **Knowledge** - **CURRENT IMPLEMENTATION** - Embeddings and search

### Event Logging (Future)

```typescript
// Log component search event
await provider.events.create({
  type: "knowledge_searched",
  actorId: userId,
  metadata: {
    query: "pricing table",
    resultsCount: 5,
    topResult: "PricingTable"
  }
});
```

## Credits

- **Cycle:** 6 (Component Embeddings)
- **Model:** OpenAI text-embedding-3-large
- **Database:** Convex vector search
- **Ontology:** 6-dimension knowledge system
- **Framework:** Astro 5 + React 19 + Effect.ts

---

**Built with clarity, simplicity, and infinite scale in mind.**
