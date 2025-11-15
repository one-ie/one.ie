---
title: "Connect YouTube Channel"
description: "Integrate your YouTube channel with the ONE Platform to automatically display your videos"
category: "Develop"
order: 7
---

# YouTube API Integration Setup Guide

This guide shows you how to integrate your YouTube channel with the ONE Platform videos page.

## Quick Start

1. Get your YouTube API credentials (see below)
2. Add credentials to `.env.local`
3. Restart dev server
4. Visit http://localhost:4321/videos

## Step 1: Get YouTube API Key

### Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" > "New Project"
3. Enter project name (e.g., "ONE Platform YouTube")
4. Click "Create"

### Enable YouTube Data API v3

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and click "Enable"

### Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key (it will look like: `AIzaSyD...`)
4. (Optional but recommended) Click "Restrict Key":
   - Under "API restrictions", select "Restrict key"
   - Check only "YouTube Data API v3"
   - Click "Save"

## Step 2: Get Your YouTube Channel ID

### Method 1: YouTube Studio (Easiest)

1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click "Settings" (bottom left)
3. Click "Channel" > "Advanced settings"
4. Your Channel ID is shown (format: `UCxxxxxxxxxxxxxxxxxxxxxx`)

### Method 2: From Your Channel URL

If your URL is `youtube.com/channel/UCxxxxxx...`, the part after `/channel/` is your ID.

If your URL is `youtube.com/@username`, use Method 1 or 3.

### Method 3: Using Your API Key (After Step 1)

Once you have your API key, run this command (replace `YOUR_API_KEY`):

```bash
curl "https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=YOUR_USERNAME&key=YOUR_API_KEY"
```

Or visit your channel page and inspect the page source for `channelId`.

## Step 3: Configure Environment Variables

Open `web/.env.local` and replace the placeholder values:

```env
# ================================
# YouTube Data API v3
# ================================
YOUTUBE_API_KEY=AIzaSyD_your_actual_api_key_here
YOUTUBE_CHANNEL_ID=UCyour_actual_channel_id_here
```

**Example:**
```env
YOUTUBE_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuv
YOUTUBE_CHANNEL_ID=UC1234567890abcdefghijklmnop
```

## Step 4: Restart Development Server

```bash
cd web
bun run dev
```

## Step 5: Test Integration

Visit http://localhost:4321/videos in your browser.

### Expected Results

✅ **Success:** You'll see videos from your YouTube channel with:
- Thumbnails
- Titles and descriptions
- Duration
- View counts
- Like counts

❌ **Error:** If you see a configuration error:
1. Check your `.env.local` file has correct values
2. Verify your API key is enabled for YouTube Data API v3
3. Verify your channel ID is correct
4. Check console for detailed error messages

## Troubleshooting

### "YouTube API credentials not configured"

**Cause:** `.env.local` file is missing or has placeholder values.

**Fix:**
1. Open `web/.env.local`
2. Replace `your_youtube_api_key_here` and `your_channel_id_here` with actual values
3. Restart dev server

### "YouTube API error: 403 - The request is missing a valid API key"

**Cause:** API key is invalid or not properly set.

**Fix:**
1. Verify your API key in Google Cloud Console
2. Make sure you copied the entire key (starts with `AIza`)
3. Check for extra spaces in `.env.local`

### "YouTube API error: 403 - YouTube Data API v3 has not been used"

**Cause:** API is not enabled in Google Cloud.

**Fix:**
1. Go to Google Cloud Console > APIs & Services > Library
2. Search "YouTube Data API v3"
3. Click "Enable"
4. Wait a few minutes and try again

### "No videos found"

**Cause:** Channel ID is incorrect or channel has no videos.

**Fix:**
1. Verify channel ID in YouTube Studio
2. Make sure your channel has published videos
3. Check that videos are public (not private or unlisted)

### API Quota Exceeded

**Cause:** YouTube API has daily quota limits (10,000 units per day by default).

**Fix:**
1. Each page build uses ~3-5 quota units
2. For production, implement caching (see Advanced section below)
3. Request quota increase in Google Cloud Console if needed

## Advanced Configuration

### Caching (Recommended for Production)

To avoid hitting API quotas, implement caching:

```typescript
// web/src/services/youtube-cache.ts
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getCachedVideos() {
  // Implementation left as exercise
  // Store fetched videos in file/DB with timestamp
  // Only refetch if cache is older than CACHE_DURATION
}
```

### Fetching More Videos

Default fetches 50 videos. To change:

```typescript
// web/src/pages/videos.astro
const youtubeVideos = await fetchYouTubeVideos(
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
  100 // Fetch 100 videos instead of 50
);
```

Note: YouTube API max is 50 per request. For more, implement pagination (see service code).

### Multiple Channels

To display videos from multiple channels:

```typescript
// web/.env.local
YOUTUBE_CHANNEL_IDS=UC123...,UC456...,UC789...

// web/src/pages/videos.astro
const channelIds = import.meta.env.YOUTUBE_CHANNEL_IDS.split(',');
const allVideos = await Promise.all(
  channelIds.map(id => fetchYouTubeVideos(YOUTUBE_API_KEY, id))
);
const videoData = allVideos.flat();
```

## API Reference

### `fetchYouTubeVideos(apiKey, channelId, maxResults?)`

Fetches videos from a YouTube channel.

**Parameters:**
- `apiKey` (string): YouTube Data API v3 key
- `channelId` (string): YouTube channel ID
- `maxResults` (number, optional): Max videos to fetch (default: 50, max: 50)

**Returns:**
```typescript
Promise<YouTubeVideo[]>
```

**Example:**
```typescript
import { fetchYouTubeVideos } from '@/services/youtube';

const videos = await fetchYouTubeVideos(
  'AIzaSy...',
  'UC123...',
  20
);
```

### `fetchYouTubeVideo(apiKey, videoId)`

Fetches a single video by ID.

**Parameters:**
- `apiKey` (string): YouTube Data API v3 key
- `videoId` (string): YouTube video ID (from URL: `youtube.com/watch?v=VIDEO_ID`)

**Returns:**
```typescript
Promise<YouTubeVideo | null>
```

**Example:**
```typescript
import { fetchYouTubeVideo } from '@/services/youtube';

const video = await fetchYouTubeVideo(
  'AIzaSy...',
  'dQw4w9WgXcQ'
);
```

### `fetchChannelInfo(apiKey, channelId)`

Fetches channel information and statistics.

**Parameters:**
- `apiKey` (string): YouTube Data API v3 key
- `channelId` (string): YouTube channel ID

**Returns:**
```typescript
Promise<{
  id: string;
  title: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}>
```

## Security Notes

- ✅ API keys used at build time are safe to expose (server-side only)
- ✅ `.env.local` is already in `.gitignore` (never commit it!)
- ✅ Restrict your API key to YouTube Data API v3 only
- ❌ Never expose secret keys (Stripe secret, database passwords, etc.)

## Next Steps

- [ ] Add your API credentials to `.env.local`
- [ ] Restart dev server
- [ ] Test http://localhost:4321/videos
- [ ] Deploy to production
- [ ] Monitor API quota usage in Google Cloud Console

## Support

**YouTube API Documentation:**
https://developers.google.com/youtube/v3/docs

**Google Cloud Console:**
https://console.cloud.google.com/

**ONE Platform Issues:**
https://github.com/one-ie/one/issues
