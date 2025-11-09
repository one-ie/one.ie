# Media Components

Media components for video and audio playback in the ONE Platform.

## VideoEmbed

YouTube video embedding component with SSR support.

**Source:** Ported from Bull.fm (`/apps/bullfm/src/components/lessons/VideoEmbed.tsx`)

**Migration Stats:**
- Code Reuse: 100% (no logic changes)
- Changes: Updated import paths only
- React Version: React 19 compatible
- SSR: Fully supported via @astro-community/astro-embed-youtube

### Features

- YouTube video embedding with lite-youtube-embed
- Customizable poster quality (max, high, default, low)
- Optional title and description metadata display
- Optional timestamp information
- Custom URL parameters support (autoplay, start time, etc.)
- Responsive card layout using shadcn/ui
- SSR-compatible for Astro pages
- Tailwind v4 styling with design tokens

### Props

```typescript
interface VideoEmbedProps {
  id: string;                                        // YouTube video ID (required)
  title?: string;                                    // Video title (optional)
  description?: string;                              // Video description (optional)
  timestamp?: string;                                // Timestamp info (optional)
  className?: string;                                // Additional CSS classes (optional)
  posterQuality?: 'max' | 'high' | 'default' | 'low'; // Thumbnail quality (default: 'high')
  params?: string;                                   // YouTube URL parameters (optional)
}
```

### Usage Examples

#### Basic Embed

```astro
---
import { VideoEmbed } from '@/components/media/VideoEmbed';
---

<VideoEmbed id="dQw4w9WgXcQ" client:load />
```

#### With Metadata

```astro
<VideoEmbed
  id="dQw4w9WgXcQ"
  title="Introduction to ONE Platform"
  description="Learn about the 6-dimension ontology"
  posterQuality="high"
  client:load
/>
```

#### With Custom Parameters

```astro
<VideoEmbed
  id="dQw4w9WgXcQ"
  params="start=30&autoplay=1"
  client:load
/>
```

### Hydration

The component requires hydration for interactivity:

```astro
<!-- Above fold: immediate load -->
<VideoEmbed id="hero-video" client:load />

<!-- Below fold: lazy load -->
<VideoEmbed id="tutorial-video" client:visible />
```

---

## VideoCard

Displays a single video card with thumbnail, metadata, and hover effects.

**Props:**
- `title` (string): Video title
- `description` (string): Video description
- `thumbnail` (string): Thumbnail image URL
- `duration` (number): Video duration in seconds
- `slug` (string): URL slug for video page
- `author` (string, optional): Video author name
- `publishedAt` (Date): Publication date

**Features:**
- 16:9 aspect ratio thumbnail
- Play icon overlay on hover
- Duration badge (MM:SS or HH:MM:SS)
- Title truncation (2 lines)
- Author and relative publish date
- Hover effects (scale, shadow)
- Dark mode support
- Links to `/videos/[slug]`

**Example:**
```tsx
<VideoCard
  title="Sui Blockchain Gaming"
  description="Explore how Sui transforms gaming"
  thumbnail="/images/sui-gaming.jpg"
  duration={420}
  slug="sui-blockchain-gaming"
  author="Bull.fm Team"
  publishedAt={new Date('2025-01-15')}
/>
```

### VideoGallery

Displays a responsive grid of video cards with sorting and states.

**Props:**
- `videos` (Array): Array of video objects (see VideoCard props)
- `loading` (boolean, optional): Show loading skeleton cards
- `limit` (number, optional): Limit number of videos displayed

**Features:**
- Responsive grid layout:
  - Desktop (lg): 3 columns
  - Tablet (md): 2 columns
  - Mobile: 1 column
- Auto-sorts videos by newest first (publishedAt)
- Loading state with skeleton cards
- Empty state message when no videos
- Dark mode support
- Consistent 1.5rem (24px) gap spacing

**Example:**
```tsx
<VideoGallery
  videos={[
    {
      title: "Intro to Sui",
      description: "Learn Sui basics",
      thumbnail: "/thumb.jpg",
      duration: 420,
      slug: "intro-sui",
      author: "Bull.fm",
      publishedAt: new Date()
    }
  ]}
  loading={false}
  limit={12}
/>
```

## Usage in Astro Pages

### Static Rendering (No JavaScript)

```astro
---
// src/pages/videos.astro
import { getCollection } from 'astro:content';
import { VideoGallery } from '@/components/media/VideoGallery';
import Layout from '@/layouts/Layout.astro';

const videos = await getCollection('videos');
const videoData = videos.map(v => ({
  title: v.data.title,
  description: v.data.description,
  thumbnail: v.data.thumbnail,
  duration: v.data.duration,
  slug: v.slug,
  author: v.data.author,
  publishedAt: v.data.publishedAt,
}));
---

<Layout title="Videos">
  <h1>Video Gallery</h1>
  <VideoGallery videos={videoData} />
</Layout>
```

### Interactive Rendering (With JavaScript)

```astro
---
import { VideoGallery } from '@/components/media/VideoGallery';
import Layout from '@/layouts/Layout.astro';
---

<Layout title="Videos">
  <h1>Video Gallery</h1>
  <!-- Load when visible (below fold) -->
  <VideoGallery client:visible videos={[]} loading={true} />
</Layout>
```

## Content Collection Schema

```typescript
// web/src/content/config.ts
import { defineCollection, z } from 'astro:content';

const videosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    youtubeId: z.string().optional(),
    thumbnail: z.string(),
    duration: z.number(),
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

## Tailwind Classes Used

- **Grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Card:** `hover:shadow-lg`, `hover:scale-[1.02]`, `transition-all`
- **Aspect Ratio:** `aspect-video` (16:9)
- **Image Effects:** `group-hover:scale-105`, `object-cover`
- **Text Truncation:** `line-clamp-2`
- **Dark Mode:** All colors use semantic tokens (automatically switch)

## File Structure

```
web/src/components/media/
├── VideoCard.tsx       # Single video card component
├── VideoGallery.tsx    # Video grid gallery component
└── README.md           # This file
```

## Performance

- **Static HTML:** No JavaScript unless `client:*` directive used
- **Lazy Loading:** Images use `loading="lazy"` attribute
- **Optimized Hover:** CSS transforms (GPU-accelerated)
- **Minimal Bundle:** Only loads when needed with Astro islands

## Dark Mode

All components support dark mode automatically via Tailwind's semantic color tokens:
- `bg-card`, `text-card-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-primary`, `text-primary-foreground`

No additional dark mode configuration needed.
