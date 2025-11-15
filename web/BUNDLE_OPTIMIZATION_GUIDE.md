# Bundle Optimization Guide for Cloudflare Pages

## Goal: Deploy under Cloudflare's 1MB Worker Limit

This guide provides step-by-step instructions to optimize your Astro + React application for Cloudflare Pages deployment, targeting a worker bundle under 1MB.

---

## Current Status (After Initial Optimizations)

**Worker Bundle Size:** ~17MB → Need to reduce to <1MB
**Target:** 1MB (Cloudflare Free Tier limit per module)

### Largest Bundle Components (Ranked by Size)

1. **vendor-shiki.js** - 9.4MB (1.66MB gzipped) ⚠️ **CRITICAL**
2. **vendor-diagrams.js** (mermaid) - 1.5MB (423KB gzipped)
3. **VideoPlayer.js** - 1MB (295KB gzipped)
4. **vendor-graph.js** (cytoscape) - 645KB (196KB gzipped)
5. **conversation.js** - 552KB (166KB gzipped)
6. **vendor-charts.js** (recharts) - 411KB (109KB gzipped)
7. **vendor-react.js** - 326KB (102KB gzipped)
8. **vendor-ai.js** - 202KB (58KB gzipped)
9. **Effect.js** - 125KB (41KB gzipped)

---

## Optimization Strategy

### Phase 1: Remove Shiki Syntax Highlighting (CRITICAL - Saves 9.4MB!)

**Problem:** Shiki is bundling 7 languages but still taking 9.4MB.

**Solution Options:**

#### Option A: Remove Shiki Completely (Recommended)
```js
// astro.config.mjs
export default defineConfig({
  markdown: {
    syntaxHighlight: false, // Disable syntax highlighting entirely
  },
  integrations: [
    mdx({
      syntaxHighlight: false, // Also disable for MDX
    }),
  ],
});
```

Then use a client-side syntax highlighter like Prism.js or highlight.js loaded only on pages that need it.

#### Option B: Use Starry Night (Lighter Alternative)
```bash
npm install @wooorm/starry-night
```

Starry Night is a lighter alternative to Shiki (~100KB vs 9MB).

#### Option C: External CDN for Syntax Highlighting
Load highlight.js from CDN only on documentation pages:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
```

**Impact:** Saves 9.4MB (reduces worker to ~7.6MB)

---

### Phase 2: Externalize Heavy Libraries

#### 2A: Mermaid Diagrams (Saves 1.5MB)

**Option 1: CDN Loading**
```astro
---
// Only load mermaid on pages that use diagrams
const hasDiagrams = content.includes('```mermaid');
---

{hasDiagrams && (
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true });
  </script>
)}
```

**Option 2: Remove Mermaid**
If diagrams aren't critical, remove mermaid entirely.

**Impact:** Saves 1.5MB (reduces worker to ~6.1MB)

#### 2B: VideoPlayer (Saves 1MB)

**Option 1: Use Native HTML5 Video**
Replace VideoPlayer component with native `<video>` tag where possible.

**Option 2: Load VideoPlayer from CDN**
Use video.js or plyr from CDN instead of bundling.

**Option 3: Make Video Pages Static**
Ensure all pages using VideoPlayer have `export const prerender = true`.

**Impact:** Saves 1MB (reduces worker to ~5.1MB)

#### 2C: Cytoscape Graphs (Saves 645KB)

**Option 1: CDN Loading**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js"></script>
```

**Option 2: Remove if Not Essential**

**Impact:** Saves 645KB (reduces worker to ~4.5MB)

#### 2D: Recharts (Saves 411KB)

**Option 1: Use Lightweight Alternative**
- Chart.js (lighter than recharts)
- uPlot (ultra-lightweight)
- Native Canvas/SVG for simple charts

**Option 2: CDN Loading**
Only load recharts on analytics pages via CDN.

**Option 3: Static Chart Images**
Generate chart images at build time for prerendered pages.

**Impact:** Saves 411KB (reduces worker to ~4.1MB)

---

### Phase 3: Maximize Static Prerendering

**Current:** ~30 SSR pages are pulling content into the worker.

**Action: Convert ALL pages to static except:**
- `/api/*` routes (must be SSR)
- Payment pages that need Stripe sessions at runtime
- Auth callback pages

#### Mark Everything Static by Default

1. **Find pages without `prerender`:**
```bash
find src/pages -name "*.astro" -not -path "*/api/*" -type f -exec grep -L "export const prerender" {} \;
```

2. **Add to EVERY non-API page:**
```astro
---
export const prerender = true;
// ... rest of frontmatter
---
```

3. **Pages that MUST stay SSR:**
```astro
// Only these should have prerender = false
- /api/** (all API routes)
- /pay-course.astro
- /pay-playbook.astro
- /thankyou-*.astro
- /account/auth.astro
- /test/integration.astro
- Dynamic routes without getStaticPaths:
  - /chat/[threadId].astro
  - /agents/[agentId].astro
  - /shop/[productId].astro
  - /dashboard/things/[id].astro
  - /commerce-chat/checkout/[productId].astro
```

**Impact:** Reduces worker bundle by ~5MB (removes content collections)

---

### Phase 4: Code Splitting & Lazy Loading

Already implemented but verify:

#### Verify Manual Chunks
```js
// astro.config.mjs - already configured
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('shiki')) return 'vendor-shiki';
        if (id.includes('recharts')) return 'vendor-charts';
        if (id.includes('mermaid')) return 'vendor-diagrams';
        if (id.includes('cytoscape')) return 'vendor-graph';
        if (id.includes('VideoPlayer')) return 'vendor-video';
        if (id.includes('react')) return 'vendor-react';
      }
    }
  }
}
```

#### Verify Client Directives
```astro
<!-- GOOD: Lazy loading -->
<VideoPlayer client:visible />        <!-- Load when scrolled into view -->
<PerformanceChart client:visible />   <!-- Load when scrolled into view -->
<SearchBox client:idle />             <!-- Load when browser idle -->

<!-- BAD: Eager loading -->
<VideoPlayer client:load />           <!-- Loads immediately ❌ -->
<Chart client:only="react" />         <!-- No SSR, still bundles ❌ -->
```

**Impact:** Defers loading, doesn't reduce worker size but improves performance.

---

### Phase 5: Remove Unused Dependencies

#### Check What's Actually Being Used

```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall <package-name>
```

#### Common Candidates for Removal:
- Unused UI libraries
- Multiple date libraries (date-fns, moment, dayjs - keep only one)
- Duplicate markdown processors
- Unused icon libraries

**Impact:** Varies, typically 100-500KB

---

### Phase 6: Content Optimization

#### Move Large Static Assets to R2/CDN

Instead of bundling:
- Product images → Cloudflare R2 or CDN
- Video files → Mux, YouTube, or video CDN
- Large PDFs → R2 storage
- Font files → Google Fonts CDN or bunny.net

#### Compress Content Collections

```bash
# Find large markdown files
find src/content -name "*.md" -size +100k

# Consider:
# - Moving to external CMS (Contentful, Sanity)
# - Fetching from API at build time
# - Pagination for large collections
```

---

## Implementation Checklist

### Immediate Actions (Get to <3MB)

- [ ] **Disable Shiki syntax highlighting** (saves 9.4MB)
- [ ] **Load Mermaid from CDN** (saves 1.5MB)
- [ ] **Make VideoPlayer pages static** (saves 1MB)
- [ ] **Add `prerender=true` to all non-API pages** (saves ~5MB)

**Expected Result:** Worker bundle ~500KB-1MB ✅

### Additional Optimizations (Get to <500KB)

- [ ] Load Cytoscape from CDN (saves 645KB)
- [ ] Replace recharts with lightweight alternative (saves 411KB)
- [ ] Remove conversation.js if not needed (saves 552KB)
- [ ] Audit and remove unused npm packages

---

## Verification Commands

### Check Worker Bundle Size
```bash
cd web
rm -rf dist
bun run build

# Check worker size
du -sh dist/_worker.js

# List largest worker chunks
ls -lh dist/_worker.js/chunks/*.mjs | sort -k5 -h | tail -20
```

### Check Which Pages Are SSR
```bash
# Find SSR pages
grep -r "prerender.*false" src/pages --include="*.astro" | grep -v api

# Find pages without prerender export
find src/pages -name "*.astro" -not -path "*/api/*" -exec grep -L "prerender" {} \;
```

### Check Client Bundle Size
```bash
# List largest client chunks
ls -lh dist/_astro/*.js | sort -k5 -h | tail -20
```

---

## Deployment Targets

### Cloudflare Pages Free Tier
- **Worker size limit:** 1MB per module
- **Total size limit:** 25MB (all files)
- **Max modules:** 100

### Cloudflare Pages Pro ($20/month)
- **Worker size limit:** 10MB per module
- **Total size limit:** 100MB
- **Max modules:** 1000

### Alternative: Vercel Free Tier
- **Lambda size limit:** 50MB
- **No per-module limit**
- Easier to deploy large bundles

---

## Quick Fix Script

Run this to apply all critical optimizations:

```bash
#!/bin/bash

echo "Applying bundle optimizations..."

# 1. Disable Shiki
echo "Disabling Shiki syntax highlighting..."
sed -i '' 's/syntaxHighlight:.*/syntaxHighlight: false,/' astro.config.mjs

# 2. Add prerender=true to all non-API pages
echo "Adding prerender=true to all pages..."
find src/pages -name "*.astro" -not -path "*/api/*" -type f | while read file; do
  if ! grep -q "export const prerender" "$file"; then
    sed -i '' '1,/^---$/s/^---$/---\nexport const prerender = true;/' "$file"
  fi
done

# 3. Verify SSR pages that need it
echo "Reverting SSR for required pages..."
for file in src/pages/{pay,thankyou}-*.astro src/pages/test/integration.astro; do
  if [ -f "$file" ]; then
    sed -i '' 's/export const prerender = true;/export const prerender = false;/' "$file"
  fi
done

# 4. Build and check size
echo "Building..."
rm -rf dist
bun run build

echo "Worker size:"
du -sh dist/_worker.js

echo "Largest chunks:"
ls -lh dist/_worker.js/chunks/*.mjs | sort -k5 -h | tail -10
```

---

## Expected Results

### Before Optimization
- Worker: 17MB
- Shiki: 9.4MB
- Can't deploy to Cloudflare Free

### After Phase 1 (Disable Shiki)
- Worker: ~7.6MB
- Still can't deploy to Cloudflare Free

### After Phase 2 (Externalize Heavy Libs)
- Worker: ~4.1MB
- Still can't deploy to Cloudflare Free

### After Phase 3 (Full Static Prerendering)
- Worker: **~500KB-1MB** ✅
- Can deploy to Cloudflare Free!

### After Phase 4-6 (Polish)
- Worker: **~300-500KB** ✅✅
- Optimal for Cloudflare Free

---

## Troubleshooting

### Build Fails with "getStaticPaths required"
**Fix:** Add `export const prerender = false;` to dynamic routes without getStaticPaths.

### Content Still Bundled into Worker
**Fix:** Ensure all pages using `getCollection()` have `prerender=true`.

### Client Bundle Still Large
**Fix:** Check `client:load` usage - change to `client:visible` or `client:idle`.

### Shiki Still in Bundle
**Fix:** Check MDX integration - must also disable syntax highlighting there.

---

## Further Reading

- [Cloudflare Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Astro Server Output](https://docs.astro.build/en/guides/server-side-rendering/)
- [Code Splitting in Vite](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

---

## Summary

**Critical Path to <1MB:**
1. Disable Shiki (saves 9.4MB)
2. Add `prerender=true` to all pages (saves ~5MB)
3. Load mermaid/video from CDN (saves 2.5MB)

**Result:** Worker bundle ~500KB, deployable to Cloudflare Free ✅
