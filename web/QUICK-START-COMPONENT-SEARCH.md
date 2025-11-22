# Component Search - Quick Start Guide

**Find components using natural language in < 5 minutes**

## Setup (One Time)

### 1. Environment Variables

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-...
PUBLIC_CONVEX_URL=https://....convex.cloud
```

Get keys:
- OpenAI: https://platform.openai.com/api-keys
- Convex: https://dashboard.convex.dev

### 2. Generate & Upload Embeddings

```bash
cd web/

# Generate embeddings (2-3 minutes for 456 components)
bun run components:embed

# Upload to Convex
bun run components:upload
```

## Usage

### Option 1: NPM Scripts

```bash
# Test with sample queries
bun run components:search

# Test with custom query
bun run components:search "pricing table"
```

### Option 2: UI Component

Visit: `/components/search`

Or integrate:

```tsx
import { ComponentSearch } from '@/components/ComponentSearch';

<ComponentSearch client:load />
```

### Option 3: API Endpoint

```bash
curl -X POST http://localhost:4321/api/components/search \
  -H "Content-Type: application/json" \
  -d '{"query": "pricing table", "limit": 5}'
```

### Option 4: Direct Service

```typescript
import { searchComponentsWithProvider } from '@/lib/services/component-search';
import { makeConvexProvider } from '@/lib/providers/convex/ConvexProvider';
import { Effect } from 'effect';

const provider = makeConvexProvider({ url: CONVEX_URL });
const searchEffect = searchComponentsWithProvider(provider, "pricing table");
const results = await Effect.runPromise(searchEffect);
```

## Sample Queries

Try these searches to test:

1. **"pricing table"** - Pricing components
2. **"dark mode toggle"** - Theme switchers
3. **"user avatar"** - Avatar components
4. **"navigation menu"** - Navigation
5. **"search input"** - Search components
6. **"analytics chart"** - Data visualization
7. **"product card"** - E-commerce cards
8. **"login form"** - Auth forms
9. **"file upload"** - Upload components
10. **"notification badge"** - Notification UI

## Result Format

```json
{
  "id": "k1...",
  "name": "PricingTable",
  "path": "src/components/ui/pricing-table.tsx",
  "relativePath": "ui/pricing-table.tsx",
  "description": "A reusable pricing table UI component",
  "category": "ui",
  "props": ["variant", "features", "price"],
  "score": 0.92
}
```

## Troubleshooting

### No results found

```bash
# Regenerate embeddings
bun run components:embed

# Re-upload
bun run components:upload

# Test again
bun run components:search "your query"
```

### API key error

Check `.env.local` has:
```bash
OPENAI_API_KEY=sk-...
PUBLIC_CONVEX_URL=https://....convex.cloud
```

### Slow search

- Reduce `limit` parameter
- Add `category` filter
- Increase `minScore` threshold

## Files

```
web/
├── scripts/
│   ├── generate-component-embeddings.ts  # bun run components:embed
│   ├── upload-embeddings-to-convex.ts    # bun run components:upload
│   └── test-component-search.ts          # bun run components:search
├── src/
│   ├── components/
│   │   └── ComponentSearch.tsx           # UI component
│   ├── lib/services/
│   │   └── component-search.ts           # Search service
│   └── pages/
│       ├── components/search.astro       # Demo: /components/search
│       └── api/components/search.ts      # API: POST /api/components/search
└── COMPONENT-SEARCH.md                   # Full documentation
```

## Quick Commands Reference

```bash
# Setup
bun run components:embed    # Generate embeddings (one time)
bun run components:upload   # Upload to Convex (one time)

# Usage
bun run components:search                    # Test all samples
bun run components:search "pricing table"    # Test specific query

# Development
bun run dev                 # Start dev server
# Visit: http://localhost:4321/components/search
```

## Integration Example

```astro
---
// your-page.astro
import Layout from '@/layouts/Layout.astro';
import { ComponentSearch } from '@/components/ComponentSearch';
---

<Layout title="Find Components">
  <div class="container mx-auto py-12">
    <h1>Component Discovery</h1>
    <ComponentSearch
      initialQuery=""
      limit={5}
      showSamples={true}
      client:load
    />
  </div>
</Layout>
```

## Next Steps

1. Generate embeddings: `bun run components:embed`
2. Upload to Convex: `bun run components:upload`
3. Test search: `bun run components:search`
4. Visit demo: http://localhost:4321/components/search
5. Integrate into your app

## Full Documentation

See `/web/COMPONENT-SEARCH.md` for:
- Architecture details
- API reference
- Performance metrics
- Ontology integration
- Future enhancements

---

**Ready in 5 minutes. Search in < 200ms.**
