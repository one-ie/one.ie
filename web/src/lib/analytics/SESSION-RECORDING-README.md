# Session Recording System

**Cycle 78: Session Recording**

Complete session recording and playback system for analyzing user behavior in funnels.

## Overview

This system records user sessions (DOM mutations, mouse movements, clicks, scrolls) using the **rrweb** library and stores them in Convex for later playback and analysis.

## Features

### Recording
- **DOM Mutations** - Captures all changes to the page structure
- **Mouse Movements** - Tracks cursor position and movement
- **Clicks & Interactions** - Records all user clicks and interactions
- **Scroll Events** - Tracks page scrolling behavior
- **Form Inputs** - Records form interactions (with privacy masking)
- **Page Navigation** - Tracks navigation between pages

### Privacy & Security
- **Password Masking** - Automatically masks password fields
- **Credit Card Masking** - Hides credit card numbers (•••• •••• •••• ••••)
- **SSN Masking** - Protects social security numbers
- **Custom Field Masking** - Mask any field with `data-recording="mask"`
- **Element Blocking** - Block elements from recording with `data-recording="block"`
- **Sensitive Field Detection** - Auto-detects and masks common sensitive fields

### Playback
- **Video-like Controls** - Play, pause, seek, speed control
- **Timeline Navigation** - Jump to any point in the recording
- **Speed Control** - 0.5x, 1x, 1.5x, 2x, 4x playback speeds
- **Full-Screen Mode** - Expand player to full screen
- **Session Metadata** - View session details, device info, conversion status

### Analytics
- **Session List** - Filterable table of all recordings
- **Filtering** - Filter by conversion status, device type, date range
- **Sorting** - Sort by date, duration, page views, conversion
- **Export** - Export session data to CSV
- **Metrics** - Total sessions, conversion rate, avg duration, revenue

## Installation

The rrweb libraries are already installed:

```bash
bun add rrweb rrweb-player
```

## Usage

### 1. Start Recording

```typescript
import { startRecording } from '@/lib/analytics/session-recorder';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyFunnelPage() {
  const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);

  useEffect(() => {
    // Start recording when page loads
    const stopRecording = startRecording({
      funnelId: 'your-funnel-id',
      visitorId: 'visitor-123', // Optional, auto-generated if not provided
      onUpload: async (sessionData) => {
        // Upload session data to Convex
        await saveRecording({
          sessionId: sessionData.sessionId,
          visitorId: sessionData.visitorId,
          funnelId: sessionData.funnelId,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime || Date.now(),
          duration: sessionData.duration || 0,
          pageViews: sessionData.pageViews,
          device: sessionData.device,
          conversion: sessionData.conversion,
          events: sessionData.events,
        });
      },
    });

    // Stop recording when component unmounts
    return () => {
      stopRecording();
    };
  }, []);

  return <div>Your funnel content</div>;
}
```

### 2. View Session List

Navigate to `/funnels/[id]/sessions` to see all recorded sessions for a funnel.

Features:
- Search by session ID or visitor ID
- Filter by conversion status (converted / not converted)
- Filter by device type (mobile / tablet / desktop)
- Sort by date, duration, page views, conversion
- Export to CSV

### 3. Watch Session Recording

Click "Watch" on any session to play it back with the SessionPlayer component.

Features:
- Play/pause controls
- Timeline scrubbing
- Speed control (0.5x - 4x)
- Full-screen mode
- Skip forward/backward 10 seconds
- View session metadata (date, duration, device, conversion)

## Privacy Configuration

The system automatically masks sensitive data:

```typescript
// Automatic masking (no configuration needed)
<input type="password" />           → Masked as ••••••••
<input data-type="credit-card" />   → Masked as •••• •••• •••• ••••
<input data-type="ssn" />           → Masked as •••-••-••••
<input type="tel" />                → Masked as (•••) •••-••••

// Custom masking
<div data-recording="mask">Sensitive content</div>

// Block from recording entirely
<div data-recording="block">Never recorded</div>
```

### Custom Privacy Rules

You can customize masking in `/web/src/lib/analytics/session-recorder.ts`:

```typescript
export const privacyConfig = {
  maskAllInputs: true,
  maskInputOptions: {
    password: true,
    email: false,
    text: false,
  },
  blockClass: "rr-block",
  maskTextClass: "rr-mask",
  maskInputFn: (text, element) => {
    // Custom masking logic
    if (element.getAttribute("data-sensitive") === "true") {
      return "•••••";
    }
    return text;
  },
};
```

## Data Storage

Sessions are stored in Convex as **events** with type `"session_recorded"`:

```typescript
{
  type: "session_recorded",
  actorId: visitorThingId,
  targetId: funnelId,
  timestamp: startTime,
  metadata: {
    sessionId: "session_123...",
    visitorId: "visitor_456...",
    funnelId: "funnel_789...",
    startTime: 1234567890,
    endTime: 1234567920,
    duration: 30000,
    pageViews: ["/funnel/step1", "/funnel/step2"],
    device: {
      userAgent: "...",
      viewport: { width: 1920, height: 1080 },
      platform: "MacIntel"
    },
    conversion: {
      converted: true,
      conversionType: "purchase",
      revenue: 99.99
    },
    events: [/* rrweb events */]
  }
}
```

## Components

### `session-recorder.ts`

Core recording library with privacy features:

**Functions:**
- `startRecording()` - Start recording user session
- `stopRecording()` - Stop recording and upload
- `getOrCreateSessionId()` - Get/create unique session ID
- `formatDuration()` - Format milliseconds to human-readable
- `formatDeviceInfo()` - Format device/browser info
- `formatViewport()` - Format viewport size with device type

### `SessionPlayer.tsx`

Playback player component with controls:

**Props:**
- `session: SessionMetadata` - Session data to play back
- `autoPlay?: boolean` - Auto-play on load (default: false)
- `showMetadata?: boolean` - Show session details (default: true)

**Features:**
- Video-like controls (play, pause, seek)
- Speed control (0.5x - 4x)
- Timeline with progress bar
- Page views timeline
- Session metadata display
- Full-screen mode

### `SessionList.tsx`

Session list with filtering and sorting:

**Props:**
- `funnelId: string` - Funnel ID to filter sessions
- `groupId: string` - Group ID for multi-tenancy

**Features:**
- Search by session/visitor ID
- Filter by conversion status
- Filter by device type
- Sort by date, duration, page views, conversion
- Pagination (20 per page)
- Export to CSV
- Stats cards (total sessions, conversions, avg duration, revenue)

## Pages

### `/funnels/[id]/sessions.astro`

Main session list page showing all recordings for a funnel.

### `/funnels/[id]/sessions/[sessionId].astro`

Individual session playback page with player and metadata.

## Backend Mutations

### `saveSessionRecording`

Save a recorded session to Convex:

```typescript
const eventId = await saveSessionRecording({
  sessionId: "session_123",
  visitorId: "visitor_456",
  funnelId: funnelId,
  startTime: Date.now(),
  endTime: Date.now() + 30000,
  duration: 30000,
  pageViews: ["/step1", "/step2"],
  device: { ... },
  conversion: { converted: true, revenue: 99.99 },
  events: [...], // rrweb events
});
```

## Backend Queries

### `events.byType`

Get all sessions for a funnel:

```typescript
const sessions = await ctx.db.query(api.queries.events.byType, {
  type: "session_recorded",
});

// Filter by funnel
const funnelSessions = sessions.filter(
  (e) => e.metadata?.funnelId === funnelId
);
```

## Performance Considerations

### Recording
- Events are buffered and uploaded every 5 seconds
- Max 100 events before forced upload
- Session auto-ends after 30 minutes of inactivity

### Storage
- Average session size: ~500KB - 2MB compressed
- rrweb events are stored as JSON in event metadata
- Consider implementing event pruning after 90 days

### Playback
- Player loads events on-demand
- Supports scrubbing without re-downloading
- Full-screen mode for better performance

## Privacy Best Practices

1. **Always mask sensitive fields** - Use `data-recording="mask"`
2. **Block authentication pages** - Don't record login/signup pages
3. **Inform users** - Add privacy notice about session recording
4. **Comply with regulations** - Follow GDPR, CCPA requirements
5. **Limit retention** - Delete old recordings after 90 days
6. **Encrypt at rest** - Convex encrypts all data by default

## Troubleshooting

### Recording not starting

```typescript
// Check if rrweb loaded
import('rrweb').then((rrweb) => {
  console.log('rrweb loaded:', rrweb);
});

// Check browser console for errors
```

### Sessions not saving

```typescript
// Verify mutation is called
const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);

// Add error handling
try {
  await saveRecording(sessionData);
} catch (error) {
  console.error('Failed to save session:', error);
}
```

### Player not displaying

```typescript
// Ensure events array is not empty
if (session.events.length === 0) {
  console.error('No events in session');
}

// Check rrweb-player import
import('rrweb-player').then((player) => {
  console.log('rrweb-player loaded:', player);
});
```

## Future Enhancements

- [ ] Heatmap generation from session data
- [ ] Rage click detection
- [ ] Dead click detection
- [ ] Form abandonment tracking
- [ ] Conversion funnel visualization with session replay
- [ ] Session replay sharing (send link to specific session)
- [ ] Session replay in support tickets
- [ ] AI-powered session insights

## Resources

- [rrweb Documentation](https://www.rrweb.io/)
- [rrweb Player](https://github.com/rrweb-io/rrweb-player)
- [Convex Events Schema](/backend/convex/schema.ts)
- [Session Recorder Library](/web/src/lib/analytics/session-recorder.ts)
- [Session Player Component](/web/src/components/analytics/SessionPlayer.tsx)

## License

MIT - Part of ONE Platform (one.ie)
