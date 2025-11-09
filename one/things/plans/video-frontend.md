# Video Frontend Plan (Frontend-First, No Backend)

**Version:** 1.0.0
**Status:** Planning
**Created:** 2025-11-08
**Source:** Bull.fm migration (optimized)
**Total Cycles:** 18 (frontend-first approach)

---

## Executive Summary

Build working video player functionality on the frontend WITHOUT requiring backend infrastructure. This enables immediate deployment and testing while deferring multi-tenant database work. Uses YouTube embeds for zero hosting costs and proven Bull.fm components.

**Architecture:** Pure Frontend (Astro 5 + React 19)
**Quick Win:** Cycle 10 - Working video gallery deployed to production
**No Backend Required:** All data in static content collections

---

## 6-Dimension Ontology Mapping

**Frontend-First Approach:**
- GROUPS: Deferred (single-tenant for now)
- PEOPLE: Deferred (no auth required)
- THINGS: Static content collections (videos as MDX files)
- CONNECTIONS: Deferred (no playlists yet)
- EVENTS: Deferred (no analytics yet)
- KNOWLEDGE: Deferred (no AI search yet)

**Future Backend Migration:** See `/one/things/plans/video-backend.md`

---

## Dependencies (From Bull.fm package.json)

### Required Dependencies
```json
{
  "@astro-community/astro-embed-youtube": "^0.5.6",
  "@vidstack/react": "^0.6.15",
  "vidstack": "^0.6.15",
  "react-h5-audio-player": "3.10.0-rc.1",
  "lucide-react": "^0.479.0",
  "zod": "^3.25.67",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

### Already Installed in web/package.json
- `astro`: ✅ (5.10.1 in Bull.fm, check web version)
- `react`: ✅ (18.3.1)
- `react-dom`: ✅ (18.3.1)
- `lucide-react`: ✅
- `zod`: ✅
- `@radix-ui/react-slider`: ✅ (needed for video controls)

### Need to Install
- `@astro-community/astro-embed-youtube`: ❌ (YouTube embeds)
- `@vidstack/react`: ❌ (advanced video player)
- `vidstack`: ❌ (player core)
- `react-h5-audio-player`: ❌ (audio player for podcasts)

---

## ⚡ Quick Wins (Cycles 1-10)

**Goal:** Working video gallery live in production by Cycle 10

### Cycle 1-2: Setup (2 cycles)
**Agent:** agent-frontend

✓ **Cycle 1:** Install dependencies
  - Run `cd web && bun add @astro-community/astro-embed-youtube @vidstack/react vidstack react-h5-audio-player`
  - Verify installations in package.json
  - Test imports in a simple component

✓ **Cycle 2:** Create content collection schema
  - Create `web/src/content/videos/` directory
  - Define Zod schema for video metadata (title, description, youtubeId, thumbnail, duration)
  - Create sample video entries (3-4 videos from Bull.fm)

### Cycle 3-6: Core Components (4 cycles)
**Agent:** agent-frontend

✓ **Cycle 3:** Port VideoPlayer component
  - Copy `apps/bullfm/src/components/VideoPlayer.tsx` → `web/src/components/media/VideoPlayer.tsx`
  - Adapt for web/ project structure
  - Test with sample YouTube embed

✓ **Cycle 4:** Port VideoEmbed component
  - Copy `apps/bullfm/src/components/lessons/VideoEmbed.tsx` → `web/src/components/media/VideoEmbed.tsx`
  - Use @astro-community/astro-embed-youtube for SSR
  - Test with different YouTube IDs

✓ **Cycle 5:** Create VideoCard component
  - Build thumbnail card with metadata
  - Use lucide-react icons (Play icon)
  - Add hover effects with Tailwind v4
  - Link to video detail page

✓ **Cycle 6:** Create VideoGallery component
  - Grid layout (3 columns desktop, 1 column mobile)
  - Load videos from content collection
  - Sort by date (newest first)

### Cycle 7-9: Pages (3 cycles)
**Agent:** agent-frontend

✓ **Cycle 7:** Create `/videos` page
  - Use VideoGallery component
  - SSR with Astro (fast initial load)
  - Add page header and description

✓ **Cycle 8:** Create `/videos/[slug]` page
  - Dynamic route for single video
  - Use VideoPlayer component
  - Display metadata (title, description, duration)
  - Add "Back to Gallery" link

✓ **Cycle 9:** Responsive design polish
  - Mobile optimization (touch-friendly controls)
  - Tablet breakpoints
  - Dark mode support (if enabled)

### Cycle 10: Deploy MVP
**Agent:** agent-ops

✓ **Cycle 10:** Deploy to production
  - Build: `cd web && bun run build`
  - Deploy: `wrangler pages deploy dist`
  - ✅ **MILESTONE: Working video gallery live at web.one.ie/videos**

---

## 📋 Full Plan (18 Cycles)

### Phase 1: Setup (Cycles 1-2)
**Agent:** agent-frontend
**Deliverable:** Dependencies installed, content collection configured

- Cycle 1: Install video dependencies (YouTube embed, Vidstack, audio player)
- Cycle 2: Create content collection schema + sample data

### Phase 2: Core Components (Cycles 3-6)
**Agent:** agent-frontend
**Deliverable:** Reusable video components

- Cycle 3: Port VideoPlayer (YouTube + native video support)
- Cycle 4: Port VideoEmbed (SSR YouTube embeds)
- Cycle 5: Create VideoCard (thumbnail + metadata)
- Cycle 6: Create VideoGallery (grid layout)

### Phase 3: Pages (Cycles 7-9)
**Agent:** agent-frontend
**Deliverable:** Video browsing UI

- Cycle 7: `/videos` page (gallery view)
- Cycle 8: `/videos/[slug]` page (single video player)
- Cycle 9: Responsive design polish

### Phase 4: Deploy MVP (Cycle 10)
**Agent:** agent-ops
**Deliverable:** Live video gallery

- Cycle 10: Production deployment
  - ✅ **MILESTONE: Video gallery live**

### Phase 5: Podcast Support (Cycles 11-14)
**Agent:** agent-frontend
**Deliverable:** Audio player for podcasts

- Cycle 11: Port AudioPlayer component (react-h5-audio-player)
- Cycle 12: Create podcast content collection schema
- Cycle 13: Create `/podcasts` page (gallery view)
- Cycle 14: Create `/podcasts/[slug]` page (audio player)

### Phase 6: Enhanced Features (Cycles 15-17)
**Agent:** agent-frontend
**Deliverable:** Improved UX

- Cycle 15: Add categories/tags to videos
- Cycle 16: Add search filter (client-side)
- Cycle 17: Add related videos sidebar

### Phase 7: Final Deploy (Cycle 18)
**Agent:** agent-ops
**Deliverable:** Complete frontend deployed

- Cycle 18: Production deployment
  - ✅ **LAUNCH: Full video + podcast frontend live**

---

## Component Migration from Bull.fm

### Files to Port (90%+ Reusable)

**Video Components:**
```
apps/bullfm/src/components/VideoPlayer.tsx
→ web/src/components/media/VideoPlayer.tsx
Changes: Update imports, remove Bull.fm specific config

apps/bullfm/src/components/lessons/VideoEmbed.tsx
→ web/src/components/media/VideoEmbed.tsx
Changes: Use @astro-community/astro-embed-youtube

apps/bullfm/src/components/BullVideoLayout.tsx
→ web/src/components/media/VideoLayout.tsx (optional, Vidstack advanced)
Changes: Simplify for MVP (defer to Phase 6)
```

**Audio Components:**
```
apps/bullfm/src/components/AudioPlayer.tsx
→ web/src/components/media/AudioPlayer.tsx
Changes: Update imports, test with sample MP3
```

**Content Collections:**
```
apps/bullfm/src/content/config.ts (video/podcast schemas)
→ web/src/content/config.ts (add video/podcast schemas)
Changes: Merge with existing schemas
```

---

## Content Collection Schemas

### Video Schema
```typescript
// web/src/content/config.ts
import { defineCollection, z } from 'astro:content';

const videosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    youtubeId: z.string().optional(), // For YouTube embeds
    videoUrl: z.string().optional(),  // For native hosting (future)
    thumbnail: z.string(),            // Image URL or path
    duration: z.number(),             // Seconds
    publishedAt: z.date(),
    author: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  videos: videosCollection,
};
```

### Sample Video Entry
```markdown
---
# web/src/content/videos/sui-blockchain-gaming.md
title: "Sui Blockchain Gaming Revolution"
description: "Explore how Sui is transforming the gaming industry with fast, low-cost transactions"
youtubeId: "dQw4w9WgXcQ"
thumbnail: "/images/videos/sui-gaming-thumb.jpg"
duration: 420
publishedAt: 2025-01-15
author: "Bull.fm Team"
categories: ["blockchain", "gaming"]
tags: ["sui", "web3", "gaming"]
---

Deep dive into Sui's gaming capabilities...
```

---

## Technology Stack

### Frontend
- **Framework:** Astro 5 + React 19
- **Styling:** Tailwind v4
- **Video Player:** @vidstack/react + @astro-community/astro-embed-youtube
- **Audio Player:** react-h5-audio-player
- **Icons:** lucide-react
- **Validation:** Zod

### Deployment
- **Frontend:** Cloudflare Pages (web.one.ie)
- **Assets:** Static files in `/public/`
- **YouTube:** Embeds (zero hosting cost)

### No Backend Required
- ❌ No Convex (deferred to video-backend.md)
- ❌ No database (content collections only)
- ❌ No auth (public access)
- ❌ No analytics (deferred)

---

## Success Metrics

### Cycle 10 Milestone
✅ Working video gallery deployed
- [ ] 3+ YouTube videos playable
- [ ] Grid layout responsive (mobile + desktop)
- [ ] Individual video pages working
- [ ] Fast load times (<2s)

### Cycle 18 Launch
✅ Full frontend in production
- [ ] Video gallery live
- [ ] Podcast player functional
- [ ] Search/filter working (client-side)
- [ ] Related content sidebar
- [ ] Mobile-optimized

---

## Migration to Backend (Future)

When ready to add multi-tenancy, analytics, and user features:

**See:** `/one/things/plans/video-backend.md`

**Migration Path:**
1. Content collections → Convex things table
2. Static data → Dynamic queries
3. Add groupId for multi-tenancy
4. Add auth for creator uploads
5. Add events for analytics
6. Add knowledge for AI search

**Estimated:** 24 cycles (separate plan)

---

## Risk Assessment

### Technical Risks

**Low Risk: Component Porting**
- Bull.fm components are clean React/TypeScript
- 90%+ reusable with minor import changes

**Low Risk: YouTube Embeds**
- Well-documented @astro-community package
- Zero hosting costs, proven reliability

**Low Risk: Content Collections**
- Astro native feature, type-safe
- Easy migration to database later

### Business Risks

**Zero Cost: No Hosting**
- YouTube embeds are free
- Static content collections
- Cloudflare Pages free tier

**Low Risk: No Backend Lock-In**
- Easy migration to Convex when ready
- Content collections → database is straightforward

---

## Next Steps

### To Start Execution

```bash
# 1. Review this plan
cat /Users/toc/Server/ONE/one/things/plans/video-frontend.md

# 2. Start Cycle 1
cd web && bun add @astro-community/astro-embed-youtube @vidstack/react vidstack react-h5-audio-player

# 3. Execute cycles sequentially
/next  # Advance to next cycle
/done  # Mark current cycle complete

# 4. Or fast-track entire frontend
/fast video-frontend  # Build all 18 cycles
```

### To Modify Plan

```bash
/plan optimize          # Reduce cycle count further
/plan add-feature [X]   # Add new feature to plan
/plan skip [N]          # Skip cycle N (not applicable)
```

---

## Dependencies on Other Plans

**Blocked By:** None (completely standalone)
**Blocks:** None
**Related:** `/one/things/plans/video-backend.md` (future backend work)

---

## Appendix: Bull.fm Actual Dependencies

**From:** `/Users/toc/Server/ONE/apps/bullfm/package.json`

**Video Dependencies:**
- `@astro-community/astro-embed-youtube`: "^0.5.6"
- `@vidstack/react`: "^0.6.15"
- `vidstack`: "^0.6.15"

**Audio Dependencies:**
- `react-h5-audio-player`: "3.10.0-rc.1"

**Supporting Libraries:**
- `lucide-react`: "^0.479.0" (icons)
- `zod`: "^3.25.67" (validation)
- `@radix-ui/react-slider`: "^1.3.5" (video controls)

**Framework:**
- `astro`: "^5.10.1"
- `react`: "^18.3.1"
- `react-dom`: "^18.3.1"

---

**Built for speed, zero backend complexity.**

**Plan Status:** Ready for execution
**Next Command:** Start Cycle 1 with dependency installation
