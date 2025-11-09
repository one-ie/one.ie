---
title: "Videos: Premium Content Playback"
description: "Complete guide to the ONE Platform video system - YouTube integration, native players, and premium features"
section: "develop"
order: 5
---

# Videos: Premium Content Playback for ONE Platform

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2025-11-08

---

## What Is This?

The ONE Platform video system is a **premium content playback engine** that makes videos feel native to the platform—whether they're hosted on YouTube or your own servers.

**What you get:**

- 🎬 **YouTube integration** with auto-generated thumbnails (no more 404s)
- 📹 **Native video player** for self-hosted content
- 🎵 **Audio player** with cover art
- 📱 **Responsive design** that works on every screen
- 🎨 **Semantic styling** that matches the ONE Platform design system
- ⚡ **Premium features ready** (chapters, subtitles, live streaming)
- ♿ **Accessibility first** (ARIA labels, keyboard controls, captions)

**Why it matters:**

Content is king. But content without a great playback experience is just... files on a server. This system treats videos as first-class citizens in the 6-dimension ontology, with full support for metadata, relationships, and event tracking.

---

## Architecture

### Component Hierarchy

```
VideoGallery
  └── VideoCard (clickable thumbnail + metadata)
        └── Link to /videos/[slug]
              └── VideoPlayer (YouTube or native HTML5)
                    ├── VideoEmbed (YouTube)
                    └── Native <video> with controls
```

### File Structure

```
web/src/
├── components/media/
│   ├── VideoPlayer.tsx      # Main playback component
│   ├── VideoCard.tsx         # Gallery item with thumbnail
│   ├── VideoGallery.tsx      # Grid layout for multiple videos
│   └── VideoEmbed.astro      # Astro wrapper for YouTube
├── content/
│   ├── config.ts             # Video schema definition
│   └── videos/               # Video content collection
│       └── *.md              # Individual video files
└── pages/
    └── videos/
        ├── index.astro       # Gallery page (/videos)
        └── [slug].astro      # Detail page (/videos/example)
```

### Data Flow

```
Content file (markdown)
  → Astro content collection (typed)
    → VideoGallery (sorted by date)
      → VideoCard (thumbnail + metadata)
        → VideoPlayer (YouTube or native)
```

**Key insight:** Videos are **content**, not code. You edit markdown files, not React components. This means:

- ✅ Non-developers can add videos
- ✅ Content is version controlled
- ✅ No database required (for now)
- ✅ Static site generation = fast

---

## 6-Dimension Ontology Mapping

**Current implementation** (content collections, v1.0.0):

| Dimension | Implementation | Example |
|-----------|----------------|---------|
| **THINGS** | Video content files | `type: 'video'`, `slug: 'intro-to-one'` |
| **KNOWLEDGE** | Categories & tags | `categories: ['tutorial']`, `tags: ['beginner']` |
| **EVENTS** | Publish date | `publishedAt: 2025-11-08` |
| **CONNECTIONS** | Related videos | Same category = related |
| **PEOPLE** | Author field | `author: 'ONE Team'` |
| **GROUPS** | (Future) Multi-tenant scoping | `groupId` for org-specific videos |

**Future implementation** (Convex backend, v2.0.0):

```typescript
// things table
{
  type: 'video',
  metadata: {
    youtubeId: 'dQw4w9WgXcQ',
    duration: 212,
    aspectRatio: '16:9',
    thumbnails: 'https://...',
  }
}

// events table
{
  type: 'video_viewed',
  thingId: '<video_id>',
  userId: '<user_id>',
  metadata: { watchTime: 45, completed: false }
}

// connections table
{
  type: 'related_to',
  fromId: '<video_1>',
  toId: '<video_2>',
  metadata: { reason: 'same_category' }
}
```

**Why this matters:** You're not just adding videos. You're modeling **content as data**, which means you can:

- Track who watched what (events)
- Recommend related content (connections)
- Scope to organizations (groups)
- Build analytics dashboards (knowledge)

---

## Component Guide

### VideoPlayer

**Purpose:** Render video/audio with native controls and premium features.

**Basic usage (YouTube):**

```tsx
import { VideoPlayer } from '@/components/media/VideoPlayer';

<VideoPlayer
  youtubeId="dQw4w9WgXcQ"
  title="Introduction to ONE Platform"
/>
```

**Advanced usage (all premium features):**

```tsx
<VideoPlayer
  src="/videos/tutorial.mp4"
  poster="/images/thumbnail.jpg"
  title="Advanced Tutorial"
  videoId="advanced-tutorial"  // Enable progress tracking
  aspectRatio="16:9"
  enableProgressTracking={true}  // Auto-save/resume position
  enableTimestampSharing={true}  // Support ?t= in URL
  subtitles={[
    {
      src: '/subtitles/en.vtt',
      label: 'English',
      language: 'en',
      kind: 'subtitles',
      default: true
    }
  ]}
  chapters={[
    { startTime: 0, endTime: 45, text: 'Introduction' },
    { startTime: 45, endTime: 120, text: 'Setup' },
    { startTime: 120, endTime: 300, text: 'Advanced Topics' },
    { startTime: 300, text: 'Conclusion' }
  ]}
  client:visible
/>
```

**What users get with this configuration:**
- ✅ Clickable chapter buttons (4 chapters visible above video)
- ✅ Playback speed controls (0.5x - 2x)
- ✅ Share button (copy link with timestamp)
- ✅ Keyboard shortcuts (Space, arrows, F, ?)
- ✅ Progress tracking (resume where they left off)
- ✅ Timestamp sharing (start at specific time via ?t=120)
- ✅ Subtitles (English captions)
- ✅ All browser-native features (PiP, fullscreen, etc.)

**Audio player:**

```tsx
<VideoPlayer
  src="/audio/podcast.mp3"
  poster="/images/cover-art.jpg"
  title="ONE Platform Podcast #42"
  type="audio"
/>
```

**Props reference:**

| Prop | Type | Description |
|------|------|-------------|
| `youtubeId` | `string?` | YouTube video ID (auto-generates thumbnail) |
| `src` | `string?` | Direct URL to video/audio file |
| `poster` | `string?` | Thumbnail/cover art URL |
| `title` | `string` | Video title (used for ARIA label) |
| `aspectRatio` | `string?` | CSS aspect-ratio value (default: `16/9`) |
| `type` | `'video' \| 'audio'?` | Media type (default: `video`) |
| `subtitles` | `Subtitle[]?` | Caption/subtitle tracks |
| `chapters` | `Chapter[]?` | Video chapters with clickable UI |
| `videoId` | `string?` | Unique ID for progress tracking |
| `enableProgressTracking` | `boolean?` | Enable auto-save/resume (default: `true`) |
| `enableTimestampSharing` | `boolean?` | Enable ?t= URL parameter (default: `true`) |
| `className` | `string?` | Additional CSS classes |

**Styling:** Uses semantic color tokens from the ONE Platform design system:

- `border` - Adapts to light/dark mode automatically
- `bg-card` - Card background color
- `shadow` - Subtle shadow matching cards

---

### VideoCard

**Purpose:** Display video thumbnail with metadata in gallery views.

**Usage:**

```tsx
import { VideoCard } from '@/components/media/VideoCard';

<VideoCard
  slug="intro-to-one"
  title="Introduction to ONE Platform"
  thumbnail="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  duration={212}
  author="ONE Team"
  publishedAt={new Date('2025-11-08')}
/>
```

**Auto-generates YouTube thumbnails:**

```tsx
// If you have a youtubeId, pass it instead of thumbnail
<VideoCard
  slug="intro-to-one"
  title="Introduction to ONE Platform"
  youtubeId="dQw4w9WgXcQ" // Auto-generates thumbnail!
  duration={212}
  author="ONE Team"
  publishedAt={new Date('2025-11-08')}
/>

// Component internally does:
const thumbnail = youtubeId
  ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
  : providedThumbnail;
```

**Visual features:**

- Hover effect (scales to 105%, lifts with shadow)
- Duration badge (bottom-right corner)
- Author + publish date (below thumbnail)
- Smooth transitions (200ms ease-in-out)

---

### VideoGallery

**Purpose:** Responsive grid of video cards.

**Usage:**

```tsx
import { VideoGallery } from '@/components/media/VideoGallery';
import { getCollection } from 'astro:content';

const videos = await getCollection('videos');

<VideoGallery videos={videos} limit={6} />
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `videos` | `Video[]` | Array of video objects |
| `limit` | `number?` | Max videos to show (optional) |

**Responsive breakpoints:**

- Desktop (1024px+): 3 columns
- Tablet (640px-1023px): 2 columns
- Mobile (<640px): 1 column

**Auto-sorting:** Always shows newest videos first (`publishedAt DESC`).

**Empty state:** Shows friendly message with film icon if no videos.

---

## Content Collection Guide

### Adding a New Video

**Step 1:** Create markdown file in `web/src/content/videos/`

```bash
cd /Users/toc/Server/ONE/web
touch src/content/videos/my-video.md
```

**Step 2:** Add frontmatter (YouTube video example)

```markdown
---
title: "How to Build with ONE Platform"
description: "Learn the 6-dimension ontology in 10 minutes"
youtubeId: "dQw4w9WgXcQ"
thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
duration: 612
publishedAt: 2025-11-08
author: "ONE Team"
categories: ["tutorial", "beginner"]
tags: ["ontology", "architecture", "quickstart"]
featured: true
draft: false
---

## Overview

This video walks through the 6-dimension ontology that powers the ONE Platform.

## What You'll Learn

- The 6 dimensions (Groups, People, Things, Connections, Events, Knowledge)
- How to map features to the ontology
- Real-world examples from production apps

## Prerequisites

- Basic understanding of databases
- Familiarity with TypeScript (helpful but not required)
```

**Step 3:** Verify it shows up

```bash
cd web
bun run dev
# Visit http://localhost:4321/videos
```

### YouTube Thumbnail Auto-Generation

**The pattern:**

```
https://img.youtube.com/vi/{youtubeId}/{quality}.jpg
```

**Quality options:**

| Code | Resolution | Use Case |
|------|------------|----------|
| `hqdefault.jpg` | 480×360 | Gallery thumbnails (recommended) |
| `maxresdefault.jpg` | 1920×1080 | Hero images (if available) |
| `sddefault.jpg` | 640×480 | Medium quality |
| `mqdefault.jpg` | 320×180 | Low bandwidth |

**Why this works:**

YouTube generates thumbnails at predictable URLs. No API key needed. No rate limits. Just works.

---

## Premium Features

### 1. Chapters with Clickable UI ✅ WORKING

**What they are:** Visual navigation buttons above the video that let users jump to different sections instantly.

**What you get:**
- Clickable chapter buttons with timestamps
- Visible above the video player (not hidden in browser controls)
- Hover effects and active states
- Automatic video seeking when clicked

**How it works:**
- Component automatically generates chapter navigation UI from chapter array
- Each button shows timestamp and chapter title
- Clicking a button seeks to that time and starts playback
- Also generates WebVTT file for browser-native chapter markers

**Current status:** ✅ Fully working! Visible chapter buttons appear above video.

---

### 2. Playback Speed Controls ✅ WORKING

**What they are:** Easy-to-use speed selector with 6 preset speeds for faster or slower playback.

**What you get:**
- 6 speed buttons: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Highlighted active speed
- One-click speed changes
- Perfect for education (slow down complex topics) and news (speed through content)

**Usage:**
```tsx
<VideoPlayer
  src="/videos/tutorial.mp4"
  poster="/thumbnail.jpg"
  title="Complete Tutorial"
  client:visible
/>
```

**How it works:**
- Speed controls appear automatically above the video
- Click any speed button to change playback rate
- Active speed is highlighted
- Speed persists during playback

**Current status:** ✅ Fully working! Speed controls visible above video.

---

### 3. Share with Timestamp ✅ WORKING

**What it is:** One-click sharing that copies a link to the exact moment in the video you're watching.

**What you get:**
- "Share" button in controls bar
- Copies URL with timestamp parameter (`?t=120`)
- "Link copied!" confirmation tooltip
- Perfect for sharing news clips or specific tutorial moments

**Usage:**
- Play video to desired timestamp
- Click "Share" button
- Link with timestamp is copied to clipboard
- Share link with others - video will start at that exact moment

**Example:**
```
Original URL: /videos/tutorial
Shared URL:   /videos/tutorial?t=120  (starts at 2:00)
```

**Current status:** ✅ Fully working! Share button appears in controls bar.

---

### 4. Keyboard Shortcuts ✅ WORKING

**What they are:** Full keyboard control for power users, with a help overlay showing all shortcuts.

**Available shortcuts:**
- **Space**: Play / Pause
- **← Arrow**: Seek backward 10 seconds
- **→ Arrow**: Seek forward 10 seconds
- **F**: Toggle fullscreen
- **?**: Show keyboard shortcuts help

**What you get:**
- All shortcuts work automatically
- Help button (?) in controls bar
- Beautiful help overlay modal
- Works with any video or audio

**Usage:**
- Shortcuts work automatically when video is in focus
- Click **?** button or press **?** key to see help overlay
- Press Esc or click X to close help

**Current status:** ✅ Fully working! Press ? to see help overlay.

---

### 5. Progress Tracking ✅ WORKING

**What it is:** Automatic save and resume - videos remember where you left off.

**What you get:**
- Playback position auto-saved to localStorage
- Resume from last position when returning
- Auto-clears when video completes
- No backend required - works offline

**How it works:**
```typescript
// Enabled by default with videoId prop
<VideoPlayer
  src="/videos/tutorial.mp4"
  videoId="tutorial-basics"  // Unique ID for progress tracking
  enableProgressTracking={true}  // Default: true
  client:visible
/>
```

**User experience:**
1. User watches 2 minutes of a 10-minute video
2. User closes tab or navigates away
3. User returns to video page
4. Video automatically resumes at 2:00
5. When video completes, progress is cleared

**Current status:** ✅ Fully working! Progress saved automatically.

---

### 6. Timestamp Sharing ✅ WORKING

**What it is:** URLs with `?t=` parameter start video at specific time.

**What you get:**
- URL parameter support: `?t=120` starts at 2:00
- Works with chapters
- Perfect for sharing specific moments
- No configuration needed

**Usage:**
```
/videos/tutorial?t=60    → Starts at 1:00
/videos/tutorial?t=120   → Starts at 2:00
/videos/tutorial?t=300   → Starts at 5:00
```

**How it works:**
```tsx
// Enabled by default
<VideoPlayer
  src="/videos/tutorial.mp4"
  enableTimestampSharing={true}  // Default: true
  client:visible
/>
```

**Component automatically:**
- Reads `?t=` parameter from URL
- Seeks to that time when video metadata loads
- Works with all video and audio players

**Current status:** ✅ Fully working! Add ?t= to any video URL.

---

### Subtitles/Captions

**What they are:** Text tracks synchronized with video (accessibility, translations).

**Schema:**

```typescript
subtitles: [
  {
    src: '/subtitles/en.vtt',
    label: 'English',
    language: 'en',
    kind: 'subtitles',
    default: true
  }
]
```

**Current status:** Fully supported via native HTML5 `<track>` elements. Works today.

**Format:** WebVTT (`.vtt` files). Example:

```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
Welcome to the ONE Platform.

00:00:03.000 --> 00:00:07.000
Today we'll learn about the 6-dimension ontology.
```

---

## Common Use Cases

### Tutorial Library

**Goal:** Show all tutorial videos, sorted by newest.

```astro
---
import { getCollection } from 'astro:content';
import { VideoGallery } from '@/components/media/VideoGallery';

const tutorials = (await getCollection('videos'))
  .filter(v => v.data.categories.includes('tutorial'))
  .filter(v => !v.data.draft);
---

<VideoGallery videos={tutorials} />
```

---

### Featured Video Hero

**Goal:** Highlight one video at top of page.

```astro
---
import { getCollection } from 'astro:content';
import { VideoPlayer } from '@/components/media/VideoPlayer';

const featured = (await getCollection('videos'))
  .find(v => v.data.featured);
---

{featured && (
  <section class="mb-12">
    <h1 class="text-4xl font-bold mb-4">{featured.data.title}</h1>
    <VideoPlayer
      youtubeId={featured.data.youtubeId}
      title={featured.data.title}
      client:visible
    />
    <p class="mt-4 text-lg text-muted-foreground">
      {featured.data.description}
    </p>
  </section>
)}
```

---

## Troubleshooting

### YouTube thumbnail shows 404

**Cause:** Invalid `youtubeId` or video is private/deleted.

**Fix:**

1. Verify youtubeId is correct (11 characters, e.g., `dQw4w9WgXcQ`)
2. Check video exists: `https://youtube.com/watch?v={youtubeId}`
3. Ensure video is public (unlisted works, private doesn't)

---

### Video won't play

**Cause:** Incorrect video URL or CORS issues.

**Fix:**

1. Verify URL works in browser directly
2. Check CORS headers (video must allow your domain)
3. Use Cloudflare Stream for hassle-free hosting

---

### Subtitles don't show

**Cause:** Invalid VTT file or missing CORS headers.

**Fix:**

1. Validate VTT syntax: https://quuz.org/webvtt/
2. Ensure `.vtt` file is accessible
3. Add CORS headers if serving from different domain
4. Set `default: true` on one subtitle track

---

## Summary

**What you have:**
- ✅ Premium video player (YouTube + native)
- ✅ Gallery system (cards, grid, sorting)
- ✅ Content collections (markdown-based)
- ✅ Auto-generated YouTube thumbnails
- ✅ Responsive design (mobile → desktop)
- ✅ Dark mode support (automatic)
- ✅ Accessibility (ARIA labels, captions)

**Premium features (all working today):**
- ✅ **Chapters with UI** - Visible clickable chapter navigation above video
- ✅ **Playback Speed Controls** - 6 preset speeds (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- ✅ **Share with Timestamp** - Copy link to current time with one click
- ✅ **Keyboard Shortcuts** - Full keyboard control with help overlay (press ?)
- ✅ **Progress Tracking** - Auto-save and resume playback position
- ✅ **Timestamp Sharing** - Start video at specific time via URL (?t=120)
- ✅ **Subtitles/Captions** - Multi-language support via HTML5 tracks
- ✅ **Audio player** - Cover art, chapters, playback controls
- ✅ **YouTube integration** - Auto-thumbnails, seamless embedding
- ✅ **Picture-in-Picture** - Browser-native support

**The bottom line:**

Videos are no longer an afterthought. They're **first-class citizens** in the ONE Platform ontology, with full support for metadata, relationships, and event tracking.

Build content experiences that feel native to the platform. Because great content deserves great playback.
